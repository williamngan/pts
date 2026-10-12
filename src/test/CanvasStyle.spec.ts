import { describe, expect, it } from "vitest";
import { CanvasForm } from "../Canvas";

// A minimal spy context that counts style property writes. Like a platform
// context, its members are inherited from a prototype; `sealed` freezes it.
function spyCtx(sealed = false) {
  const writes: Record<string, number> = {};
  const state: Record<string, unknown> = {};
  const saved: Record<string, unknown>[] = [];
  const proto: Record<string, unknown> = {
    setLineDash(v: number[]) {
      writes.setLineDash = (writes.setLineDash ?? 0) + 1;
      state.dashSegments = v;
    },
    getLineDash() {
      return (state.dashSegments as number[]) ?? [];
    },
    save() {
      saved.push({ ...state });
    },
    restore() {
      const s = saved.pop();
      if (s) Object.assign(state, s);
    },
    reset() {
      for (const k in state) delete state[k];
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
    Object.defineProperty(proto, key, {
      get: () => state[key],
      set: (v) => {
        writes[key] = (writes[key] ?? 0) + 1;
        state[key] = v;
      },
    });
  }
  const target = Object.create(proto);
  if (sealed) Object.freeze(target);
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

  it("observes direct writes made through any reference", () => {
    const { ctx, writes, state } = spyCtx();
    const form = makeForm(ctx);
    form.fill("#f03");
    ctx.fillStyle = "#000"; // direct write, bypassing the form
    form.fill("#f03");
    expect(state.fillStyle).toBe("#f03");
    ctx.fillStyle = "#f03"; // a direct write of the cached value
    form.fill("#f03");
    expect(writes.fillStyle).toBe(4);
    expect(ctx.fillStyle).toBe("#f03"); // reads reach the original getter
    ctx.setLineDash([1, 1]);
    form.dash([4, 2]);
    form.dash([4, 2]);
    expect(state.dashSegments).toEqual([4, 2]);
    ctx.lineDashOffset = 3;
    form.dash([4, 2]);
    expect(state.lineDashOffset).toBe(0);
    expect(writes.setLineDash).toBe(3);
  });

  it("restores the cache with save and restore", () => {
    const { ctx, writes, state } = spyCtx();
    const form = makeForm(ctx);
    form.fill("#f03").dash([4, 2]);
    ctx.save();
    form.fill("#0c9").dash([1, 1]);
    ctx.restore();
    expect(state.fillStyle).toBe("#f03");
    form.fill("#f03").dash([4, 2]); // matches the restored state: no writes
    expect(writes.fillStyle).toBe(2);
    expect(writes.setLineDash).toBe(2);
    form.fill("#0c9");
    expect(state.fillStyle).toBe("#0c9");
    // an unmatched restore reveals unknown state, so the cache is dropped
    ctx.restore();
    form.fill("#0c9");
    expect(writes.fillStyle).toBe(4);
    ctx.reset();
    form.fill("#0c9");
    expect(state.fillStyle).toBe("#0c9");
  });

  it("reset force-writes and repairs an unobservable context", () => {
    const { ctx, writes, state } = spyCtx(true);
    const form = makeForm(ctx);
    form.fill("#f03");
    // a frozen context cannot be observed, so a direct write desyncs the cache
    ctx.fillStyle = "#000";
    form.fill("#f03"); // cache believes #f03 is set — skip is expected
    expect(state.fillStyle).toBe("#000");
    form.reset(); // the documented recovery point
    expect(state.fillStyle).toBe("#f03");
    form.fill("#f03");
    expect(state.fillStyle).toBe("#f03");
    expect(writes.fillStyle).toBe(3);
  });
});
