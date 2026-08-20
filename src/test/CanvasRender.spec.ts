import { describe, expect, it } from "vitest";
import { CanvasForm } from "../Canvas";
import { Group, Pt } from "../Pt";

// A recording stub context: CanvasForm treats any object with the documented
// context surface as a renderer, which makes the drawing logic testable here.
function recordingCtx() {
  const calls: [string, ...unknown[]][] = [];
  const target: Record<string, unknown> = {
    measureText: (t: string) => ({ width: t.length * 10 }),
    createLinearGradient: () => ({
      addColorStop: (...a: unknown[]) => calls.push(["addColorStop", ...a]),
    }),
    lineDashOffset: 0,
  };
  for (const fn of [
    "putImageData",
    "setLineDash",
    "fillText",
    "fill",
    "stroke",
    "beginPath",
    "moveTo",
    "lineTo",
    "closePath",
    "arc",
  ]) {
    target[fn] = (...a: unknown[]) => calls.push([fn, ...a]);
  }
  const ctx = new Proxy(target, {
    get(t, k: string) {
      if (!(k in t)) t[k] = () => {};
      return t[k];
    },
    set(t, k: string, v) {
      t[k] = v;
      return true;
    },
  });
  return { ctx: ctx as any, calls };
}

function makeForm() {
  const { ctx, calls } = recordingCtx();
  const form = new CanvasForm(ctx);
  return { form, calls };
}

describe("CanvasForm rendering pins", () => {
  it("places imageData rects without double-offsetting", () => {
    const { form, calls } = makeForm();
    const img = { width: 200, height: 200 } as ImageData;

    form.imageData([7, 8], img);
    expect(calls.pop()).toEqual(["putImageData", img, 7, 8]);

    form.imageData(
      Group.fromArray([
        [10, 10],
        [110, 120],
      ]),
      img,
    );
    // dirty rect starts at the data's origin with the rect's width/height,
    // so the image region lands exactly at the rect's top-left
    expect(calls.pop()).toEqual(["putImageData", img, 10, 10, 0, 0, 100, 110]);
  });

  it("does not mutate the caller's gradient stops array", () => {
    const { form, calls } = makeForm();
    const single = ["#f00"];
    form.gradient(single)(
      Group.fromArray([
        [0, 0],
        [10, 10],
      ]),
    );
    expect(single).toEqual(["#f00"]);
    // filler stops still applied to the gradient itself
    expect(calls.filter((c) => c[0] === "addColorStop")).toHaveLength(3);
  });

  it("passes full dash patterns through and deactivates on empty", () => {
    const { form, calls } = makeForm();
    form.dash([5, 10, 2, 4]);
    expect(calls.pop()).toEqual(["setLineDash", [5, 10, 2, 4]]);

    form.dash(true);
    expect(calls.pop()).toEqual(["setLineDash", [5, 5]]);

    // repeated identical pattern is deduped
    form.dash(true);
    expect(calls.filter((c) => c[0] === "setLineDash")).toHaveLength(0);

    form.dash([]);
    expect(calls.pop()).toEqual(["setLineDash", []]);

    form.dash(false);
    expect(calls.filter((c) => c[0] === "setLineDash")).toHaveLength(0);
  });

  it("keeps chaining through points() with empty input", () => {
    const { form } = makeForm();
    expect(form.points(null, 5, "square")).toBe(form);
    expect(form.points([], 5, "square")).toBe(form);
  });

  it("resets to the same font as a fresh form", () => {
    const { form } = makeForm();
    const fresh = form.currentFont.size;
    form.font(30);
    form.reset();
    expect(form.currentFont.size).toBe(fresh);
    expect(fresh).toBe(14);
  });

  it("fills a paragraph box to its exact line capacity", () => {
    const { form, calls } = makeForm();
    form.font(10);
    // box is exactly 5 lines tall (lineHeight 1 → lstep 10)
    form.paragraphBox(
      Group.fromArray([
        [0, 0],
        [500, 50],
      ]),
      "aa\nbb\ncc\ndd\nee",
      1,
      "top",
      true,
    );
    let texts = calls.filter((c) => c[0] === "fillText");
    expect(texts.map((c) => c[1])).toEqual(["aa", "bb", "cc", "dd", "ee"]);

    // a 6th line no longer fits and is cropped
    calls.length = 0;
    form.paragraphBox(
      Group.fromArray([
        [0, 0],
        [500, 50],
      ]),
      "aa\nbb\ncc\ndd\nee\nff",
      1,
      "top",
      true,
    );
    texts = calls.filter((c) => c[0] === "fillText");
    expect(texts).toHaveLength(5);

    // crop=false renders everything
    calls.length = 0;
    form.paragraphBox(
      Group.fromArray([
        [0, 0],
        [500, 50],
      ]),
      "aa\nbb\ncc\ndd\nee\nff",
      1,
      "top",
      false,
    );
    expect(calls.filter((c) => c[0] === "fillText")).toHaveLength(6);
  });

  it("draws lines and polygons from arrays and iterables identically", () => {
    const { form, calls } = makeForm();
    form.line(
      Group.fromArray([
        [0, 0],
        [10, 0],
        [10, 10],
      ]),
    );
    const fromArray = calls.splice(0);
    form.line(
      new Set([new Pt(0, 0), new Pt(10, 0), new Pt(10, 10)]) as Iterable<Pt>,
    );
    const fromIterable = calls.splice(0);
    expect(
      fromArray.filter((c) => c[0] !== "fill" && c[0] !== "stroke"),
    ).toEqual(fromIterable.filter((c) => c[0] !== "fill" && c[0] !== "stroke"));
  });
});
