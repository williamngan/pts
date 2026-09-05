import { afterEach, describe, expect, it, vi } from "vitest";

import { DOMSpace, HTMLForm, HTMLSpace } from "../../Dom";
import type { DOMFormContext } from "../../Types";
import { Font } from "../../Form";
import { Bound, Group, Pt } from "../../Pt";
import { SVGContext2D, SVGForm, SVGSpace } from "../../Svg";
import { Util } from "../../Util";

const SVG_NS = "http://www.w3.org/2000/svg";

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
  it("cancels readiness when disposed before mounting completes", async () => {
    const host = document.createElementNS(SVG_NS, "svg");
    document.body.appendChild(host);
    const callback = vi.fn();
    const event = vi.fn();
    host.addEventListener("ready", event);
    const space = new SVGSpace(host, callback);
    space.dispose().dispose();
    await new Promise((resolve) => setTimeout(resolve, 80));
    expect(space.ready).toBe(false);
    expect(host.childElementCount).toBe(0);
    expect(callback).not.toHaveBeenCalled();
    expect(event).not.toHaveBeenCalled();
    const replacement = new SVGSpace(host);
    await ready(replacement);
    expect(replacement.ready).toBe(true);
    expect(event).toHaveBeenCalledOnce();
    replacement.dispose();
  });

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
    const player = {
      animate: vi.fn(),
      animateID: undefined as unknown as string,
    };
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
    expect(HTMLForm.getID({ currentID: "chosen" } as DOMFormContext)).toBe(
      "chosen",
    );
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
    // removeAll clears the space's element but never its container
    expect(space.element.childElementCount).toBe(0);
    expect(parent.contains(space.element)).toBe(true);
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

describe("SVGContext2D", () => {
  function makeCtx() {
    const host = document.createElementNS(SVG_NS, "svg") as SVGElement;
    document.body.appendChild(host);
    return { host, ctx: new SVGContext2D(host) };
  }

  it("maps canvas maxWidth to textLength when text overflows", () => {
    const { host, ctx } = makeCtx();
    ctx.beginFrame();
    ctx.font = "16px sans-serif";
    ctx.fillText("a very long piece of text that overflows", 0, 20, 30);
    ctx.fillText("ok", 0, 40, 500);
    ctx.commitFrame();

    const texts = host.querySelectorAll("text");
    expect(texts.length).toBe(2);
    expect(texts[0].getAttribute("textLength")).toBe("30");
    expect(texts[0].getAttribute("lengthAdjust")).toBe("spacingAndGlyphs");
    // short text is not compressed, matching canvas semantics
    expect(texts[1].hasAttribute("textLength")).toBe(false);
  });

  it("retires unused gradient definitions and rematerializes retained handles", () => {
    const { ctx, host: svg } = makeCtx();
    const retained = ctx.createLinearGradient(0, 0, 100, 100);
    retained.addColorStop(0, "red");
    const draw = (gradient: typeof retained) => {
      ctx.beginFrame();
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 100, 100);
      ctx.commitFrame();
    };
    draw(retained);
    for (let i = 0; i < 100; i++) {
      draw(ctx.createLinearGradient(0, 0, i + 1, 100));
      expect(svg.querySelectorAll("linearGradient")).toHaveLength(1);
    }
    retained.addColorStop(1, "blue");
    draw(retained);
    expect(svg.querySelector("linearGradient")!.id).toBe(retained.id);
    expect(svg.querySelectorAll("stop")).toHaveLength(2);
    svg.innerHTML = "";
    ctx.resetDom();
    draw(retained);
    expect(svg.querySelector("linearGradient")!.id).toBe(retained.id);
    expect(svg.querySelector("path")!.getAttribute("fill")).toBe(
      `url(#${retained.id})`,
    );
    ctx.beginFrame();
    ctx.commitFrame();
    expect(svg.querySelectorAll("linearGradient")).toHaveLength(0);
  });

  it("materializes gradients into <defs> and keeps stops in sync", () => {
    const { host, ctx } = makeCtx();
    ctx.beginFrame();
    const grad = ctx.createLinearGradient(0, 0, 10, 0);
    grad.addColorStop(0, "#000");
    grad.addColorStop(1, "#fff");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.rect(0, 0, 10, 10);
    ctx.fill();
    ctx.commitFrame();

    const defs = host.querySelector("defs");
    const lin = defs!.querySelector("linearGradient");
    expect(lin!.getAttribute("x2")).toBe("10");
    expect(lin!.getAttribute("gradientUnits")).toBe("userSpaceOnUse");
    expect(lin!.querySelectorAll("stop")).toHaveLength(2);
    expect(host.querySelector("path")!.getAttribute("fill")).toBe(
      `url(#${grad.id})`,
    );

    // adding a stop after materialization re-renders the defs element
    grad.addColorStop(0.5, "#888");
    expect(lin!.querySelectorAll("stop")).toHaveLength(3);

    const rad = ctx.createRadialGradient(1, 2, 3, 4, 5, 6);
    rad.addColorStop(0, "red");
    ctx.beginFrame();
    ctx.strokeStyle = rad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(5, 5);
    ctx.stroke();
    ctx.commitFrame();
    const radial = defs!.querySelector("radialGradient");
    expect(radial!.getAttribute("cx")).toBe("4");
    expect(radial!.getAttribute("fr")).toBe("3");
  });

  it("reconciles pooled elements across frames: patch, replace, truncate", () => {
    const { ctx } = makeCtx();
    ctx.beginFrame();
    expect(ctx.drawCount).toBe(0);
    ctx.beginPath();
    ctx.rect(0, 0, 5, 5);
    ctx.fill();
    ctx.fillText("hi", 1, 1);
    expect(ctx.drawCount).toBe(2);
    ctx.commitFrame();
    const group = ctx.group;
    expect(group!.children).toHaveLength(2);
    const pooledPath = group!.children[0];
    expect(pooledPath.nodeName).toBe("path");

    // a same-shaped frame reuses pooled elements, patching only what changed
    ctx.beginFrame();
    ctx.beginPath();
    ctx.rect(2, 0, 5, 5);
    ctx.fill();
    ctx.fillText("bye", 1, 1);
    ctx.commitFrame();
    expect(group!.children[0]).toBe(pooledPath);
    expect(group!.children[1].textContent).toBe("bye");

    // a tag mismatch replaces the pooled element in place; shorter frames truncate
    ctx.beginFrame();
    ctx.fillText("only", 3, 3);
    ctx.commitFrame();
    expect(group!.children).toHaveLength(1);
    expect(group!.children[0].nodeName).toBe("text");

    ctx.beginFrame();
    ctx.commitFrame();
    expect(group!.children).toHaveLength(0);

    ctx.disposeDom();
    expect(ctx.group).toBeNull();
  });

  it("removes conditional attributes when a later frame stops using them", () => {
    const { ctx } = makeCtx();
    ctx.beginFrame();
    ctx.setLineDash([5, 3]);
    ctx.lineDashOffset = 2;
    ctx.globalCompositeOperation = "multiply";
    ctx.beginPath();
    ctx.rect(0, 0, 10, 10);
    ctx.stroke();
    ctx.commitFrame();
    const pooled = ctx.group!.children[0];
    expect(pooled.getAttribute("stroke-dasharray")).toBe("5 3");
    expect(pooled.getAttribute("stroke-dashoffset")).toBe("2");
    expect(pooled.getAttribute("mix-blend-mode")).toBe("multiply");

    // same shape without dashes or blend: the reused element must not keep
    // the attributes the previous frame set
    ctx.beginFrame();
    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;
    ctx.globalCompositeOperation = "source-over";
    ctx.beginPath();
    ctx.rect(0, 0, 10, 10);
    ctx.stroke();
    ctx.commitFrame();
    expect(ctx.group!.children[0]).toBe(pooled);
    expect(pooled.getAttribute("stroke-dasharray")).toBeNull();
    expect(pooled.getAttribute("stroke-dashoffset")).toBeNull();
    expect(pooled.getAttribute("mix-blend-mode")).toBeNull();

    // fill-only: the stroke-only attributes go away with the stroke
    ctx.beginFrame();
    ctx.beginPath();
    ctx.rect(0, 0, 10, 10);
    ctx.fill();
    ctx.commitFrame();
    expect(ctx.group!.children[0]).toBe(pooled);
    expect(pooled.getAttribute("stroke")).toBe("none");
    expect(pooled.getAttribute("stroke-width")).toBeNull();
    expect(pooled.getAttribute("stroke-linejoin")).toBeNull();
    expect(pooled.getAttribute("stroke-linecap")).toBeNull();
  });

  it("maps text alignment and baseline to SVG anchors", () => {
    const { ctx } = makeCtx();
    ctx.beginFrame();
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("a", 0, 0);
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText("b", 0, 0);
    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";
    ctx.fillText("c", 0, 0);
    const [a, b, c] = ctx.runs;
    expect(a.attrs["text-anchor"]).toBe("middle");
    expect(a.attrs["dominant-baseline"]).toBe("text-before-edge");
    expect(b.attrs["text-anchor"]).toBe("end");
    expect(b.attrs["dominant-baseline"]).toBe("central");
    expect(c.attrs["text-anchor"]).toBe("start");
    expect(c.attrs["dominant-baseline"]).toBe("text-after-edge");
    expect(ctx.measureText("abc").width).toBeGreaterThan(0);
  });

  it("renders images from elements and canvases, warning on unsupported forms", () => {
    const { host, ctx } = makeCtx();
    ctx.beginFrame();
    const img = document.createElement("img");
    img.src = "data:image/gif;base64,R0lGODlhAQABAAAAACw=";
    ctx.drawImage(img, 1, 2, 3, 4);
    const cv = document.createElement("canvas");
    cv.width = 2;
    cv.height = 2;
    ctx.drawImage(cv, 0, 0);
    // 9-argument (source-cropped) form and src-less sources warn and draw nothing
    ctx.drawImage(img, 0, 0, 1, 1, 0, 0, 1, 1);
    ctx.drawImage({} as CanvasImageSource, 0, 0);
    ctx.putImageData();
    ctx.clip();
    expect(ctx.runs.filter((r) => r.tag === "image")).toHaveLength(2);
    ctx.commitFrame();
    const images = host.querySelectorAll("image");
    expect(images).toHaveLength(2);
    expect(images[0].getAttribute("x")).toBe("1");
    expect(images[0].getAttribute("width")).toBe("3");
    expect(images[1].getAttribute("href")).toContain("data:image/png");
  });

  it("saves and restores state, tracks dashes, and maps blend composites", () => {
    const { ctx } = makeCtx();
    ctx.beginFrame();
    ctx.fillStyle = "#123";
    ctx.setLineDash([2, 3]);
    ctx.lineDashOffset = 1;
    ctx.save();
    ctx.fillStyle = "#456";
    ctx.setLineDash([]);
    ctx.restore();
    expect(ctx.fillStyle).toBe("#123");
    expect(ctx.getLineDash()).toEqual([2, 3]);
    ctx.restore(); // empty stack is a no-op
    ctx.scale(); // resolution-independent no-op

    ctx.globalCompositeOperation = "multiply";
    ctx.beginPath();
    ctx.rect(0, 0, 2, 2);
    ctx.fill();
    ctx.stroke();
    ctx.globalCompositeOperation = "destination-out"; // no SVG equivalent
    ctx.beginPath();
    ctx.rect(4, 0, 2, 2);
    ctx.fill();
    ctx.commitFrame();
    const paths = ctx.group!.querySelectorAll("path");
    expect(paths[0].getAttribute("mix-blend-mode")).toBe("multiply");
    expect(paths[0].getAttribute("stroke-dasharray")).toBe("2 3");
    expect(paths[0].getAttribute("stroke-dashoffset")).toBe("1");
    expect(paths[1].getAttribute("mix-blend-mode")).toBeNull();
  });

  it("builds path data through every verb", () => {
    const { ctx } = makeCtx();
    ctx.beginFrame();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(10, 0);
    ctx.quadraticCurveTo(12, 2, 10, 4);
    ctx.bezierCurveTo(8, 6, 4, 6, 2, 4);
    ctx.closePath();
    ctx.arc(20, 20, 5, 0, Math.PI * 2);
    ctx.ellipse(40, 20, 6, 3, Math.PI / 4, 0, Math.PI, true);
    ctx.fill();
    ctx.fillRect(50, 0, 4, 4);
    ctx.clearRect();
    ctx.commitFrame();
    const d = ctx.runs.map((r) => r.attrs.d).join(" ");
    expect(d).toContain("M0 0L10 0Q12 2 10 4C8 6 4 6 2 4Z");
    expect(d).toContain("A5 5");
    expect(d).toContain("A6 3 45");
  });
});

describe("SVGSpace frame lifecycle and export", () => {
  it.each([undefined, false, true])(
    "preserves refresh=%s through readiness",
    async (refresh) => {
      const { element } = mount();
      const space = new SVGSpace(element);
      if (refresh !== undefined) space.refresh(refresh);
      const form = space.getForm();
      let draw = true;
      space.add(() => {
        if (draw) form.fillOnly("red").point([10, 10], 3);
      });
      await ready(space);
      const play = (time: number) => (space as any).playItems(time);
      play(1);
      expect(space.element.querySelectorAll("path")).toHaveLength(1);
      draw = false;
      play(2);
      expect(space.element.querySelectorAll("path")).toHaveLength(
        refresh === false ? 1 : 0,
      );
      space.dispose();
    },
  );

  it("commits frames through playItems, honoring the refresh flag", async () => {
    const { element } = mount();
    const space = new SVGSpace(element);
    const form = space.getForm();
    let draw = true;
    space.add({
      animate: () => {
        if (draw) form.fillOnly("#f03").point([10, 10], 3).text([5, 20], "t");
      },
    });
    await ready(space);

    const play = (t: number) =>
      (space as unknown as { playItems: (time: number) => void }).playItems(t);
    play(1);
    const group = space.element.querySelector("g.pts-svgform");
    expect(group!.children.length).toBeGreaterThan(0);

    // refresh(false): an empty frame keeps the previous scene
    space.refresh(false);
    draw = false;
    play(2);
    expect(group!.children.length).toBeGreaterThan(0);

    // refresh(true): an empty frame clears it
    space.refresh(true);
    play(3);
    expect(group!.children).toHaveLength(0);
    space.dispose();
  });

  it("exports plain and expanded SVG including text and image runs", async () => {
    const { element } = mount();
    const space = new SVGSpace(element);
    space.background = "transparent";
    const form = space.getForm();
    space.add({
      animate: () => {
        form.fillOnly("#f03").point([10, 10], 3).point([20, 10], 3);
        form.text([5, 30], "label");
      },
    });
    await ready(space);
    (space as unknown as { playItems: (time: number) => void }).playItems(1);

    expect(space.toSVG()).toContain("<svg");
    const expanded = space.toSVG(true);
    const doc = new DOMParser().parseFromString(expanded, "image/svg+xml");
    const shapes = doc.querySelectorAll("g.pts-svgform > *");
    // two merged points expand to two paths, plus the text element
    expect(
      [...shapes].map((s) => s.nodeName).filter((n) => n === "path"),
    ).toHaveLength(2);
    expect([...shapes].some((s) => s.nodeName === "text")).toBe(true);
    expect(doc.querySelector("rect")!.getAttribute("fill")).toBe("none");
    space.dispose();
  });
});

describe("SVGForm legacy static helpers", () => {
  it("draws every legacy element type into a scoped group", () => {
    const svg = document.createElementNS(SVG_NS, "svg");
    document.body.appendChild(svg);
    const ctx: any = {
      group: svg,
      currentID: "el-0",
      currentClass: "legacy",
      style: {
        filled: true,
        stroked: true,
        fill: "#123",
        stroke: "#456",
        "stroke-width": "2",
      },
    };
    let n = 0;
    const next = () => {
      ctx.currentID = `el-${++n}`;
      return ctx;
    };

    expect(SVGForm.circleElement(next(), [5, 5], 4).getAttribute("r")).toBe(
      "4",
    );
    expect(
      SVGForm.arcElement(next(), [5, 5], 4, 0, Math.PI / 2).getAttribute("d"),
    ).toContain("A");
    expect(
      SVGForm.arcElement(next(), [5, 5], 4, 0, Math.PI * 1.5, true).nodeName,
    ).toBe("path");
    expect(SVGForm.squareElement(next(), [5, 5], 3).getAttribute("width")).toBe(
      "6",
    );
    expect(
      SVGForm.lineElement(next(), [
        [0, 0],
        [10, 10],
      ])!.nodeName,
    ).toBe("line");
    expect(
      SVGForm.lineElement(next(), [
        [0, 0],
        [10, 0],
        [10, 10],
      ])!.nodeName,
    ).toBe("polyline");
    expect(
      SVGForm.polygonElement(next(), [
        [0, 0],
        [10, 0],
        [5, 8],
      ])!.getAttribute("points"),
    ).toContain("0,0");
    expect(
      SVGForm.rectElement(next(), [
        [1, 2],
        [11, 22],
      ])!.getAttribute("width"),
    ).toBe("10");
    expect(SVGForm.textElement(next(), [3, 4], "hello").textContent).toBe(
      "hello",
    );
    expect(SVGForm.getID({} as any)).toMatch(/p-/);
    const styled = SVGForm.style(svg.firstElementChild as SVGElement, {
      filled: true,
      stroked: true,
      fill: "#123",
      stroke: "#456",
    });
    expect(styled.getAttribute("style")).toContain("fill: #123");
  });
});

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
    expect(runGroup!.querySelectorAll("path").length).toBe(2);
    expect(runGroup!.querySelectorAll("text").length).toBe(2);
    expect(space.element.querySelector(".custom-svg")).not.toBeNull();
    form.fill(false).stroke(false).cls(false).font(new Font()).reset();
    expect(() => form.scope({ animate: vi.fn() })).toThrow(/not defined/);
    expect(form.updateScope("manual", space.element)).toBeTypeOf("object");
    expect(form.nextID()).toBe("manual-2");
    expect(SVGForm.getID({ currentID: "picked" } as DOMFormContext)).toBe(
      "picked",
    );

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
    // removeAll clears the <svg>'s contents but keeps it mounted
    expect(space.element.childElementCount).toBe(0);
    expect(element.contains(space.element)).toBe(true);

    // the space still renders after items are re-added
    form.svgContext.beginFrame();
    form
      .fill("#0f9")
      .stroke(false)
      .circle([
        [40, 40],
        [10, 10],
      ]);
    form.svgContext.commitFrame();
    const regrown = space.element.querySelector("g.pts-svgform");
    expect(regrown).not.toBeNull();
    expect(regrown!.querySelectorAll("path").length).toBe(1);
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
