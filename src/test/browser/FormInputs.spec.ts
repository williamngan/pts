import { afterEach, describe, expect, it, vi } from "vitest";
import { CanvasForm, CanvasSpace } from "../../Canvas";
import { SVGForm, SVGSpace } from "../../Svg";
import { Group, Pt } from "../../Pt";
import type { PtLikeIterable } from "../../Types";

afterEach(() => {
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

describe("bezier input contract", () => {
  it("does not repaint the previous canvas path for an incomplete iterable", () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const form = new CanvasForm(ctx);
    const chain = [
      [0, 10],
      [30, 10],
      [60, 10],
      [90, 10],
    ];
    form.strokeOnly("#f00", 3).bezier(chain);
    const pixel = () => [...ctx.getImageData(20, 10, 1, 1).data];
    expect(pixel()).toEqual([255, 0, 0, 255]);
    for (const count of [0, 1, 2, 3]) {
      function* shortChain() {
        yield* chain.slice(0, count);
      }
      form.strokeOnly("#00f", 3).bezier(shortChain());
      expect(pixel()).toEqual([255, 0, 0, 255]);
    }
  });
});

describe("paragraphBox input contract", () => {
  it.each([
    { name: "Canvas", SpaceType: CanvasSpace },
    { name: "SVG", SpaceType: SVGSpace },
  ])(
    "renders arrays, typed arrays, Groups, and single-use iterables identically ($name)",
    async ({ SpaceType }) => {
      const host = document.createElement("div");
      host.style.cssText = "width:200px;height:100px";
      document.body.appendChild(host);
      const space = new SpaceType(host);
      await new Promise<void>((resolve) =>
        space.element.addEventListener("ready", () => resolve(), {
          once: true,
        }),
      );
      const form = space.getForm().font(10);
      const text = vi.spyOn(form, "text");
      const points = [
        [10, 10],
        [110, 100],
      ];
      const inputs: (() => PtLikeIterable)[] = [
        () => points,
        () => points.map((p) => new Float32Array(p)),
        () => points.map((p) => new Pt(p)),
        () => Group.fromArray(points),
        function* () {
          yield* points;
        },
      ];
      const content = "one two three four five six seven eight nine ten";
      try {
        for (const horizontal of ["left", "center", "right"] as const) {
          form.alignText(horizontal);
          for (const vertical of [
            "top",
            "middle",
            "center",
            "bottom",
          ] as const) {
            const render = (box: PtLikeIterable) => {
              text.mockClear();
              expect(form.paragraphBox(box, content, 1.2, vertical)).toBe(form);
              return text.mock.calls.map(([pt, txt]) => [Array.from(pt), txt]);
            };
            const expected = render(Group.fromArray(points));
            expect(expected.length).toBeGreaterThan(1);
            for (const input of inputs)
              expect(render(input())).toEqual(expected);
          }
        }
        expect(points).toEqual([
          [10, 10],
          [110, 100],
        ]);
        // Also exercise actual frame painting and SVG serialization.
        space.add(() => form.paragraphBox(inputs[4](), content)).play(10);
        if (space instanceof SVGSpace) {
          expect(space.element.querySelectorAll("text").length).toBeGreaterThan(
            1,
          );
          expect(space.toSVG(true)).toContain("one two");
        }
      } finally {
        space.dispose();
      }
    },
  );
});

describe("SVGForm legacy DOM-context statics", () => {
  it("bezier and compound build path elements like line and polygon build theirs", () => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    svg.appendChild(group);
    document.body.appendChild(svg);
    const ctx = {
      group,
      groupID: "g",
      groupCount: 0,
      currentID: "p",
      currentClass: "",
      style: { fill: "#f00" },
    };
    const chain = [
      [0, 0],
      [10, 20],
      [30, 20],
      [40, 0],
      [50, -20],
      [70, -20],
      [80, 0],
    ];
    const curve = SVGForm.bezier(ctx, chain)!;
    expect(curve.tagName.toLowerCase()).toBe("path");
    expect(curve.getAttribute("d")).toBe(
      "M0 0C10 20 30 20 40 0C50 -20 70 -20 80 0",
    );
    expect(SVGForm.bezier(ctx, chain.slice(0, 3))).toBeUndefined();
    const compound = SVGForm.compound(ctx, [
      [
        [0, 0],
        [10, 0],
        [10, 10],
        [0, 10],
      ],
      [
        [2, 2],
        [2, 8],
        [8, 8],
        [8, 2],
      ],
    ])!;
    expect(compound.tagName.toLowerCase()).toBe("path");
    expect(compound.getAttribute("d")).toBe(
      "M0 0L10 0L10 10L0 10ZM2 2L2 8L8 8L8 2Z",
    );
    expect(SVGForm.compound(ctx, [])).toBeUndefined();
    svg.remove();
  });
});
