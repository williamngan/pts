import { describe, expect, it } from "vitest";
import { CanvasForm } from "../Canvas";
import { SVGContext2D } from "../Svg";

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

  it("writes styles that resolve against CSS on every call", () => {
    // equal strings can resolve differently once the canvas's CSS changes
    const { ctx, writes } = spyCtx();
    const form = makeForm(ctx);
    const escaped = String.raw`current\43 olor`; // currentColor
    for (const color of ["currentColor", "ButtonText", escaped])
      for (let i = 0; i < 3; i++) form.fill(color);
    expect(writes.fillStyle).toBe(9);
    for (let i = 0; i < 3; i++) form.fill("teal");
    expect(writes.fillStyle).toBe(10);
    for (const weight of ["bolder", String.raw`bold\65 r`])
      for (let i = 0; i < 3; i++) form.font(12, weight);
    expect(writes.font).toBe(6);
    for (let i = 0; i < 3; i++) form.font(12, "bold");
    expect(writes.font).toBe(7);
  });

  it("skips repeated plain styles however many there are", () => {
    // its record of plain strings is bounded, and refills once cleared
    const { ctx, writes } = spyCtx();
    const form = makeForm(ctx);
    for (let i = 0; i < 300; i++) {
      form.fill(`rgb(${i}, 0, 0)`);
      form.fill(`rgb(${i}, 0, 0)`);
    }
    expect(writes.fillStyle).toBe(300);
    for (let i = 0; i < 3; i++) form.fill("currentColor").fill("currentColor");
    expect(writes.fillStyle).toBe(306);
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

  it("restores the cache through nested saves", () => {
    const { ctx, writes, state } = spyCtx();
    const form = makeForm(ctx);
    form.fill("#a00");
    ctx.save(); // outer: no change before the inner save
    ctx.save();
    form.fill("#b00");
    ctx.restore();
    form.fill("#a00"); // restored: no write
    expect(writes.fillStyle).toBe(2);
    form.fill("#c00");
    ctx.save();
    form.fill("#d00").dash([2, 2]);
    ctx.restore();
    expect(state.fillStyle).toBe("#c00");
    form.fill("#c00").dash(false); // restored: no fill write, dash is unknown
    expect(writes.fillStyle).toBe(4);
    expect(writes.setLineDash).toBe(2);
    ctx.restore();
    expect(state.fillStyle).toBe("#a00");
    form.fill("#a00");
    expect(writes.fillStyle).toBe(4);
    form.fill("#c00");
    expect(state.fillStyle).toBe("#c00");
  });

  it("writes every style call on a context it cannot observe", () => {
    const { ctx, writes, state } = spyCtx(true);
    const form = makeForm(ctx);
    form.fill("#f03");
    form.fill("#f03");
    expect(writes.fillStyle).toBe(2);
    ctx.fillStyle = "#000"; // a direct write the form cannot see
    form.fill("#f03");
    expect(state.fillStyle).toBe("#f03");
    form.dash([4, 2]);
    form.dash([4, 2]);
    expect(writes.setLineDash).toBe(2);
    form.reset();
    expect(state.fillStyle).toBe("#f03");
  });

  it("observes the SVG context like a canvas context", () => {
    const ctx = new SVGContext2D(null!);
    const form = makeForm(ctx);
    form.fill("#f03");
    ctx.fillStyle = "#000";
    form.fill("#f03");
    expect(ctx.fillStyle).toBe("#f03");
    ctx.save();
    form.fill("#0c9").dash([4, 2]);
    ctx.restore();
    form.fill("#0c9").dash([4, 2]);
    expect(ctx.fillStyle).toBe("#0c9");
    expect(ctx.getLineDash()).toEqual([4, 2]);
    expect(Object.getOwnPropertyNames(ctx)).toContain("save");
    // styles read back through the observers like a canvas context's
    form.stroke("#123", 2, "round", "square").composite("multiply");
    expect([
      ctx.strokeStyle,
      ctx.lineWidth,
      ctx.lineJoin,
      ctx.lineCap,
      ctx.globalCompositeOperation,
    ]).toEqual(["#123", 2, "round", "square", "multiply"]);
  });

  it("does not cache a renderer with plain style fields", () => {
    const dashes: number[][] = [];
    const ctx: any = {
      fillStyle: "#000",
      lineDashOffset: 0,
      setLineDash: (v: number[]) => dashes.push(v),
      save() {},
      restore() {},
    };
    const form = makeForm(ctx);
    form.fill("#f03");
    ctx.fillStyle = "#000"; // a write the form cannot see
    form.fill("#f03");
    expect(ctx.fillStyle).toBe("#f03");
    form.dash([4, 2]);
    form.dash([4, 2]);
    expect(dashes).toHaveLength(2);
    expect(Object.getOwnPropertySymbols(ctx)).toHaveLength(0);
  });

  it("shares one set of observers among contexts of a kind", () => {
    // observers made per context would give each its own hidden class
    const { ctx } = spyCtx();
    const other = Object.create(Object.getPrototypeOf(ctx));
    makeForm(ctx).fill("#f03");
    makeForm(other).fill("#0c9");
    for (const key of ["fillStyle", "lineDashOffset"]) {
      const set = Object.getOwnPropertyDescriptor(ctx, key)!.set;
      expect(set).toBeTypeOf("function");
      expect(Object.getOwnPropertyDescriptor(other, key)!.set).toBe(set);
    }
    for (const key of ["save", "restore", "reset", "setLineDash"])
      expect(other[key]).toBe(ctx[key]);
  });
});
