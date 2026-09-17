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
    "bezierCurveTo",
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
    expect(form.points(null!, 5, "square")).toBe(form);
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

  it("keeps a line that ends exactly at a word boundary", () => {
    const { form, calls } = makeForm();
    form.font(10); // 10px per character in this harness
    form.paragraphBox(
      Group.fromArray([
        [0, 0],
        [110, 100],
      ]),
      "hello world foo bar",
      1,
      "top",
      true,
    );
    const texts = calls.filter((c) => c[0] === "fillText").map((c) => c[1]);
    // "hello world" is exactly 110px wide; it used to wrap before "world"
    expect(texts).toEqual(["hello world", "foo bar"]);
  });

  it("maps box alignments to canvas baselines in textBox", () => {
    const { form } = makeForm();
    const box = Group.fromArray([
      [0, 0],
      [100, 50],
    ]);
    form.textBox(box, "hi", "center");
    expect(form.ctx.textBaseline).toBe("middle");
    form.textBox(box, "hi", "start");
    expect(form.ctx.textBaseline).toBe("top");
    form.textBox(box, "hi", "end");
    expect(form.ctx.textBaseline).toBe("bottom");
    form.textBox(box, "hi", "bottom");
    expect(form.ctx.textBaseline).toBe("bottom");
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

describe("CanvasForm.bezier", () => {
  const chain = [
    [0, 0],
    [10, 20],
    [30, 20],
    [40, 0],
    [50, -20],
    [70, -20],
    [80, 0],
  ];

  it("draws one native bezierCurveTo per segment and paints once", () => {
    const { form, calls } = makeForm();
    form.strokeOnly("#000").bezier(chain);
    expect(calls.map((c) => c[0])).toEqual([
      "beginPath",
      "moveTo",
      "bezierCurveTo",
      "bezierCurveTo",
      "stroke",
    ]);
    expect(calls[1]).toEqual(["moveTo", 0, 0]);
    expect(calls[2]).toEqual(["bezierCurveTo", 10, 20, 30, 20, 40, 0]);
    expect(calls[3]).toEqual(["bezierCurveTo", 50, -20, 70, -20, 80, 0]);
  });

  it("fills when filled, ignores a trailing partial segment, and skips short input", () => {
    const { form, calls } = makeForm();
    form
      .fill("#000")
      .stroke(false)
      .bezier([...chain, [90, 10], [95, 10]]);
    expect(calls.filter((c) => c[0] === "bezierCurveTo")).toHaveLength(2);
    expect(calls[calls.length - 1][0]).toBe("fill");
    calls.length = 0;
    for (const count of [0, 1, 2, 3]) {
      function* shortChain() {
        yield* chain.slice(0, count);
      }
      expect(form.bezier(shortChain())).toBe(form);
    }
    expect(calls).toEqual([]); // an incomplete chain must not repaint the retained path
  });

  it("line and polygon also leave the retained path alone on short input", () => {
    const { form, calls } = makeForm();
    form
      .strokeOnly("#000")
      .line([[1, 2]])
      .polygon([[1, 2]])
      .line([]);
    function* one() {
      yield [1, 2];
    }
    form.polygon(one());
    expect(calls).toEqual([]); // no paint without a new path, like bezier
    form.line([
      [0, 0],
      [5, 5],
    ]);
    expect(calls.map((c) => c[0])).toEqual([
      "beginPath",
      "moveTo",
      "lineTo",
      "stroke",
    ]);
  });

  it("accepts an iterable of Pts, as Curve.cardinalToBezier returns", () => {
    const { form, calls } = makeForm();
    form.bezier(new Set(chain.map((c) => new Pt(c))));
    expect(calls.filter((c) => c[0] === "bezierCurveTo")).toHaveLength(2);
  });
});
