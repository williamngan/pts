import { afterEach, describe, expect, it, vi } from "vitest";

import { DOMSpace, HTMLForm, HTMLSpace } from "../../Dom";
import { Font } from "../../Form";
import { Bound, Group, Pt } from "../../Pt";
import { SVGForm, SVGSpace } from "../../Svg";
import { Util } from "../../Util";

const bounds = (width = 240, height = 120) =>
  ({
    x: 10,
    y: 20,
    top: 20,
    left: 10,
    right: 10 + width,
    bottom: 20 + height,
    width,
    height,
    toJSON: () => ({}),
  }) as DOMRect;

function mount(tag = "div") {
  const parent = document.createElement("div");
  const element = document.createElement(tag);
  parent.appendChild(element);
  document.body.appendChild(parent);
  parent.getBoundingClientRect = () => bounds();
  return { parent, element };
}

async function ready(space: DOMSpace) {
  if (space.ready) return;
  await new Promise<void>((resolve) => {
    space.element.addEventListener("ready", () => resolve(), { once: true });
  });
}

afterEach(() => {
  Util.warnLevel("mute");
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

describe("DOMSpace", () => {
  it("creates elements and manages attributes, styles, sizing, and contents", async () => {
    const { parent, element } = mount();
    element.id = "dom-target";
    const callback = vi.fn();
    const space = new DOMSpace(element, callback);
    const resize = vi.fn();
    const start = vi.fn();
    space.add({ animate: vi.fn(), resize, start });
    space.setup({ bgcolor: "rgb(1, 2, 3)", resize: true });
    await ready(space);

    expect(callback).toHaveBeenCalledOnce();
    expect(start).toHaveBeenCalledOnce();
    expect(resize).toHaveBeenCalled();
    expect(space.ready).toBe(true);
    expect(space.element).toBe(element);
    expect(space.parent).toBe(parent);
    expect(space.background).toBe("rgb(1, 2, 3)");
    expect(space.size).toEqual(new Pt(240, 120));
    expect(space.getForm()).toBeNull();

    space
      .style("position", "relative", true)
      .styles({ color: "red", opacity: "0.5" }, true);
    expect(element.style.position).toBe("relative");
    expect(element.style.color).toBe("red");
    space.resize(Bound.fromBoundingRect(bounds(100, 50)), new Event("resize"));
    expect(element.style.width).toBe("100px");

    element.innerHTML = "<span>content</span>";
    space.clear("blue");
    expect(element.childElementCount).toBe(0);
    expect(space.background).toBe("blue");
    expect(parent.style.backgroundColor).toBe("blue");

    space.autoResize = false;
    expect(space.autoResize).toBe(false);
    space.dispose();
  });

  it("creates missing targets and provides static DOM helpers", async () => {
    const space = new DOMSpace("#missing-target");
    await ready(space);
    expect(space.element.id).toBe("pts_element");
    expect(document.querySelector("#pts_container")).not.toBeNull();

    const root = document.createElement("section");
    const child = DOMSpace.createElement("article", "created", root);
    expect(root.firstElementChild).toBe(child);
    expect(DOMSpace.setAttr(child, { title: "hello", "data-n": 2 })).toBe(
      child,
    );
    expect(child.getAttribute("data-n")).toBe("2");
    expect(
      DOMSpace.getInlineStyles({ color: "red", hidden: "", width: "2px" }),
    ).toBe("color: red; width: 2px; ");
    space.dispose();
  });
});

describe("HTMLSpace and HTMLForm", () => {
  it("creates, reuses, scopes, styles, draws, and removes HTML shapes", async () => {
    const { parent, element } = mount();
    const space = new HTMLSpace(element);
    const form = space.getForm() as HTMLForm;
    const player = { animate: vi.fn(), animateID: undefined as string };
    space.add(player);
    await ready(space);

    expect(form.space).toBe(space);
    expect(() => form.scope({ animate: vi.fn() })).toThrow(/not defined/);
    form.scope(player);
    form
      .alpha(0.7)
      .fill("#f00")
      .stroke("#0f0", 2)
      .fillText("#00f")
      .cls("custom")
      .font(14, "bold", "italic", 1.4, "serif")
      .point([20, 20], 3, "circle")
      .point([30, 20], 3)
      .circle([
        [40, 20],
        [5, 5],
      ])
      .square([55, 20], 4)
      .rect([
        [5, 40],
        [30, 20],
      ])
      .text([5, 70], "hello");

    expect(element.querySelectorAll(".pts-form")).toHaveLength(6);
    expect(element.querySelector(".custom")?.getAttribute("style")).toContain(
      "opacity: 0.7",
    );
    form.fill(false).stroke(false).cls(false).font(new Font(12, "monospace"));
    form.reset().log("log");
    expect(element.textContent).toContain("log");

    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    Util.warnLevel("warn");
    form.arc([0, 0], 2, 0, 1).line(rect()).polygon(rect());
    expect(warn).toHaveBeenCalledTimes(3);

    const scoped = HTMLForm.scopeID(player);
    expect(HTMLForm.getID({ currentID: "chosen" })).toBe("chosen");
    expect(scoped).toContain(player.animateID);
    expect(form.updateScope("manual", element)).toBeTypeOf("object");
    expect(form.nextID()).toBe("manual-2");

    const created = HTMLSpace.htmlElement(parent, "div", "same-id");
    expect(HTMLSpace.htmlElement(parent, "span", "same-id")).toBe(created);
    expect(() => HTMLSpace.htmlElement(null, "div", "bad")).toThrow(/parent/);

    form.scope(player);
    form.point([1, 1]);
    space.remove(player);
    expect(parent.querySelector(`.${scoped}`)).toBeNull();
    space.removeAll();
    expect(parent.childElementCount).toBe(0);
  });

  it("exercises the static style and drawing helpers", () => {
    const group = document.createElement("div");
    document.body.appendChild(group);
    const ctx: any = {
      group,
      currentID: "static-shape",
      currentClass: "test-class",
      style: {
        filled: false,
        stroked: false,
        background: "red",
        "border-width": "2px",
        color: "blue",
      },
    };
    expect(HTMLForm.point(ctx, [10, 10], 2, "circle").className).toContain(
      "pts-circle",
    );
    ctx.currentID = "static-square";
    expect(HTMLForm.square(ctx, [10, 10], 2).className).toContain("pts-square");
    ctx.currentID = "static-rect";
    expect(
      (
        HTMLForm.rect(ctx, [
          [0, 0],
          [4, 5],
        ]) as HTMLElement
      )?.style.width,
    ).toBe("4px");
    expect(HTMLForm.rect(ctx, [])).toBeUndefined();
    ctx.currentID = "static-text";
    expect(HTMLForm.text(ctx, [1, 2], "txt").textContent).toBe("txt");
    expect(HTMLForm.style(group, ctx.style).getAttribute("style")).toContain(
      "border: none",
    );
  });
});

const rect = () => [
  [0, 0],
  [10, 10],
];

describe("SVGSpace and SVGForm", () => {
  it("creates an SVG surface, resizes it, draws all primitives, and removes scopes", async () => {
    const { parent, element } = mount();
    const space = new SVGSpace(element);
    const form = space.getForm();
    const player = { animate: vi.fn() };
    space.add(player);
    await ready(space);

    expect(space.element.nodeName.toLowerCase()).toBe("svg");
    expect(form.space).toBe(space);
    space.resize(Bound.fromBoundingRect(bounds(160, 90)));
    expect(space.element.getAttribute("viewBox")).toBe("0 0 160 90");

    form.scope(player);
    form
      .alpha(0.4)
      .fill("#123")
      .stroke("#456", 3, "round", "square")
      .cls("custom-svg")
      .font(16, "bold", "italic", 1.2, "serif")
      .point([10, 10], 2, "circle")
      .point([20, 10], 2)
      .circle([
        [30, 10],
        [4, 4],
      ])
      .arc([40, 10], 5, 0, Math.PI * 1.5)
      .arc([50, 10], 5, Math.PI, 0, true)
      .square([60, 10], 3)
      .line([
        [0, 30],
        [10, 30],
      ])
      .line([
        [0, 40],
        [10, 40],
        [20, 40],
      ])
      .polygon([
        [30, 30],
        [40, 30],
        [35, 40],
      ])
      .rect([
        [50, 30],
        [70, 45],
      ])
      .text([5, 70], "svg")
      .log("log");

    // draws are committed as style runs: consecutive same-styled shapes merge
    // into one <path>, each text call becomes one <text>, and log()'s
    // fill-only background rectangle is its own run
    form.svgContext.commitFrame();
    const runGroup = space.element.querySelector("g.pts-svgform");
    expect(runGroup).not.toBeNull();
    expect(runGroup.querySelectorAll("path").length).toBe(2);
    expect(runGroup.querySelectorAll("text").length).toBe(2);
    expect(space.element.querySelector(".custom-svg")).not.toBeNull();
    form.fill(false).stroke(false).cls(false).font(new Font()).reset();
    expect(() => form.scope({ animate: vi.fn() })).toThrow(/not defined/);
    expect(form.updateScope("manual", space.element)).toBeTypeOf("object");
    expect(form.nextID()).toBe("manual-2");
    expect(SVGForm.getID({ currentID: "picked" })).toBe("picked");

    form.scope(player);
    form.point([1, 1]);
    const selector = `.${SVGForm.scopeID(player)}`;
    const marker = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle",
    );
    marker.setAttribute("class", SVGForm.scopeID(player));
    space.element.appendChild(marker);
    expect(parent.querySelector(selector)).not.toBeNull();
    space.remove(player);
    expect(parent.querySelector(selector)).toBeNull();
    space.removeAll();
    expect(element.childElementCount).toBe(0);
  });

  it("covers SVG static helpers, invalid inputs, reuse, and style suppression", () => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    document.body.appendChild(svg);
    const ctx: any = {
      group: svg,
      currentID: "one",
      currentClass: "custom",
      style: { filled: false, stroked: false, fill: "red", stroke: "blue" },
    };

    const first = SVGSpace.svgElement(svg, "circle", "reuse");
    expect(SVGSpace.svgElement(svg, "rect", "reuse")).toBe(first);
    expect(() => SVGSpace.svgElement(null, "rect", "bad")).toThrow(/parent/);
    expect(SVGForm.pointElement(ctx, [2, 2], 1, "circle").nodeName).toBe(
      "circle",
    );
    ctx.currentID = "two";
    expect(SVGForm.pointElement(ctx, [2, 2], 1).nodeName).toBe("rect");
    ctx.currentID = "three";
    expect(SVGForm.lineElement(ctx, [[0, 0]])).toBeUndefined();
    ctx.currentID = "four";
    expect(SVGForm.rectElement(ctx, [])).toBeUndefined();
    expect(SVGForm.style(first, ctx.style).getAttribute("style")).toContain(
      "stroke: none",
    );
  });
});
