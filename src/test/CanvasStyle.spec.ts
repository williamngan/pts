import { describe, expect, it } from "vitest";
import { CanvasForm } from "../Canvas";

// A minimal spy context that counts style property writes.
function spyCtx() {
  const writes: Record<string, number> = {};
  const state: Record<string, unknown> = {};
  const target = {
    setLineDash(v: number[]) {
      writes.setLineDash = (writes.setLineDash ?? 0) + 1;
      state.dashSegments = v;
    },
  };
  const counted = [
    "fillStyle",
    "strokeStyle",
    "lineWidth",
    "lineJoin",
    "lineCap",
    "globalAlpha",
    "font",
    "globalCompositeOperation",
    "lineDashOffset",
  ];
  for (const key of counted) {
    Object.defineProperty(target, key, {
      get: () => state[key],
      set: (v) => {
        writes[key] = (writes[key] ?? 0) + 1;
        state[key] = v;
      },
    });
  }
  return { ctx: target as any, writes, state };
}

function makeForm(ctx: any) {
  const form = new CanvasForm();
  (form as any)._ctx = ctx;
  (form as any)._ready = true;
  return form;
}

describe("CanvasForm style write dedup", () => {
  it("writes a style once for repeated identical values", () => {
    const { ctx, writes } = spyCtx();
    const form = makeForm(ctx);
    for (let i = 0; i < 10; i++) form.fill("#f03");
    expect(writes.fillStyle).toBe(1);
    form.fill("#0c9");
    expect(writes.fillStyle).toBe(2);
    for (let i = 0; i < 5; i++) form.alpha(0.5);
    expect(writes.globalAlpha).toBe(1);
    for (let i = 0; i < 5; i++) form.composite("multiply");
    expect(writes.globalCompositeOperation).toBe(1);
    for (let i = 0; i < 5; i++) form.stroke("#fff", 2, "round", "round");
    expect(writes.strokeStyle).toBe(1);
    expect(writes.lineWidth).toBe(1);
  });

  it("dedupes dash state via its compact key", () => {
    const { ctx, writes } = spyCtx();
    const form = makeForm(ctx);
    for (let i = 0; i < 5; i++) form.dash([4, 2], 1);
    expect(writes.setLineDash).toBe(1);
    form.dash([4, 2], 2); // offset change must write
    expect(writes.setLineDash).toBe(2);
    form.dash(false);
    form.dash(false);
    expect(writes.setLineDash).toBe(3);
  });

  it("two forms sharing one context write on every alternation", () => {
    // the multi-form case: a per-form cache would break this
    const { ctx, writes, state } = spyCtx();
    const a = makeForm(ctx);
    const b = makeForm(ctx);
    for (let i = 0; i < 3; i++) {
      a.fill("#red-ish");
      expect(state.fillStyle).toBe("#red-ish");
      b.fill("#blue-ish");
      expect(state.fillStyle).toBe("#blue-ish");
    }
    expect(writes.fillStyle).toBe(6); // every alternation is a real change
  });

  it("reset force-writes and repairs a desynced context", () => {
    const { ctx, writes, state } = spyCtx();
    const form = makeForm(ctx);
    form.fill("#f03");
    // user mutates the context directly, desyncing the cache
    ctx.fillStyle = "#000";
    form.fill("#f03"); // cache believes #f03 is set — skip is expected
    expect(state.fillStyle).toBe("#000");
    form.reset(); // the documented recovery point
    expect(state.fillStyle).toBe("#f03");
    form.fill("#f03");
    expect(state.fillStyle).toBe("#f03");
    expect(writes.fillStyle).toBeGreaterThanOrEqual(3);
  });
});
