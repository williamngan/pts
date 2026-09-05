import { describe, expect, it } from "vitest";
import { CanvasForm } from "../Canvas";
import { SVGContext2D } from "../Svg";

function makeForm() {
  const ctx = new SVGContext2D(null!);
  const form = new CanvasForm();
  (form as any)._ctx = ctx;
  (form as any)._ready = true;
  return { ctx: ctx as any, form };
}

describe("SVGContext2D surface", () => {
  it("implements every context member that CanvasForm uses", async () => {
    // the drift alarm: if a future CanvasForm feature touches a new ctx
    // member, SVG output must implement it (or consciously stub it).
    // node:fs is imported indirectly so the docs build (DOM-only tsconfig)
    // does not try to resolve it
    const fs = await import(/* @vite-ignore */ ["node", "fs"].join(":"));
    const source = fs.readFileSync(
      new URL("../Canvas.ts", import.meta.url),
      "utf8",
    );
    const used = new Set([...source.matchAll(/ctx\.(\w+)/g)].map((m) => m[1]));
    const instance = new SVGContext2D(null!);
    for (const member of used) {
      expect(
        member in instance,
        `SVGContext2D is missing "${member}" used by Canvas.ts`,
      ).toBe(true);
    }
  });

  it("merges consecutive same-styled shapes into one path run", () => {
    const { ctx, form } = makeForm();
    form.fill("#123").stroke("#456");
    form
      .point([10, 10], 2)
      .point([30, 10], 2)
      .circle([
        [50, 10],
        [5, 5],
      ]);
    ctx._flushShape();
    const paths = ctx._runs.filter((r: any) => r.tag === "path");
    expect(paths).toHaveLength(1);
    expect(paths[0].shapeEnds).toHaveLength(2); // three shapes, two boundaries
  });

  it("splits runs on any paint state change", () => {
    const { ctx, form } = makeForm();
    form.fill("#123").point([10, 10], 2);
    form.fill("#789").point([30, 10], 2);
    form.alpha(0.5).point([50, 10], 2);
    ctx._flushShape();
    expect(ctx._runs.filter((r: any) => r.tag === "path")).toHaveLength(3);
  });

  it("captures paint state at paint time, not flush time", () => {
    const { ctx, form } = makeForm();
    ctx.className = "a";
    form.fillOnly("#123").point([10, 10], 2);
    ctx.className = "b"; // changed before the previous shape is flushed
    form.point([30, 10], 2);
    ctx._flushShape();
    const paths = ctx._runs.filter((r: any) => r.tag === "path");
    expect(paths[0].attrs.class).toBe("pts-svgform a");
    expect(paths[1].attrs.class).toBe("pts-svgform b");
  });

  it("converts canvas arcs to svg arc segments", () => {
    const { ctx } = makeForm();
    // quarter arc, clockwise
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI / 2);
    expect(ctx._d).toBe("M10 0A10 10 0 0 1 0 10");
    // full circle emits two half arcs and closes
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    expect(ctx._d).toMatch(/^M10 0A10 10 0 0 1 -10 0A10 10 0 0 1 10 0Z$/);
    // counterclockwise quarter sweeps the other way
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, -Math.PI / 2, true);
    expect(ctx._d).toBe("M10 0A10 10 0 0 0 0 -10");
    // three-quarter sweep splits into two segments
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 1.5);
    const segments = ctx._d.match(/A/g);
    expect(segments).toHaveLength(2);
  });

  it("captures stroke width, caps, joins, and dashes before later style changes", () => {
    const { ctx, form } = makeForm();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.setLineDash([4, 2]);
    ctx.lineDashOffset = 3;
    form.strokeOnly("#f00", 2).line([
      [0, 10],
      [100, 10],
    ]);
    ctx.lineCap = "square";
    ctx.lineJoin = "miter";
    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;
    form.strokeOnly("#00f", 10).line([
      [0, 20],
      [100, 20],
    ]);
    ctx._flushShape();
    expect(ctx.runs).toHaveLength(2);
    expect(ctx.runs[0].attrs).toMatchObject({
      stroke: "#f00",
      "stroke-width": 2,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "stroke-dasharray": "4 2",
      "stroke-dashoffset": 3,
    });
    expect(ctx.runs[1].attrs).toMatchObject({
      stroke: "#00f",
      "stroke-width": 10,
      "stroke-linecap": "square",
      "stroke-linejoin": "miter",
    });
    expect(ctx.runs[1].attrs).not.toHaveProperty("stroke-dasharray");
    expect(ctx.runs[1].attrs).not.toHaveProperty("stroke-dashoffset");
  });

  it("supports save and restore of paint state", () => {
    const { ctx } = makeForm();
    ctx.fillStyle = "#111";
    ctx.globalAlpha = 0.25;
    ctx.setLineDash([4, 2]);
    ctx.save();
    ctx.fillStyle = "#222";
    ctx.globalAlpha = 1;
    ctx.setLineDash([]);
    ctx.restore();
    expect(ctx.fillStyle).toBe("#111");
    expect(ctx.globalAlpha).toBe(0.25);
    expect(ctx.getLineDash()).toEqual([4, 2]);
  });

  it("applies dash and blend attributes to stroked runs", () => {
    const { ctx, form } = makeForm();
    ctx.setLineDash([5, 3]);
    ctx.globalCompositeOperation = "multiply";
    form.strokeOnly("#456", 2).line([
      [0, 0],
      [10, 10],
    ]);
    ctx._flushShape();
    const run = ctx._runs[0];
    expect(run.attrs["stroke-dasharray"]).toBe("5 3");
    expect(run.attrs.style).toBe("mix-blend-mode: multiply");
    expect(run.attrs.fill).toBe("none");
  });
});
