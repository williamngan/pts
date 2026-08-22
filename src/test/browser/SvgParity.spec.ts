import { describe, expect, it, vi } from "vitest";
import { CanvasSpace } from "../../Canvas";
import { SVGSpace } from "../../Svg";
import { Bound, Pt } from "../../Pt";

// The swap-promise test: the identical drawing code runs on CanvasForm and
// SVGForm; the SVG output is rasterized and pixel-compared to the canvas.

const W = 160;
const H = 120;

function scene(form: any) {
  form.fillOnly("#204060").rect([
    [0, 0],
    [W, H],
  ]);
  form
    .fill("#f03")
    .stroke("#fff", 2)
    .circle([
      [40, 40],
      [20, 20],
    ]);
  form.fillOnly("#fe6").polygon([
    [90, 20],
    [130, 20],
    [110, 60],
  ]);
  form.strokeOnly("#0c9", 4, "round", "round").line([
    [20, 90],
    [70, 70],
    [120, 95],
  ]);
  form.alpha(0.5).fillOnly("#09f").square([120, 90], 15);
  form.alpha(1);
}

function rasterize(svgMarkup: string): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const blob = new Blob([svgMarkup], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      canvas.getContext("2d")!.drawImage(img, 0, 0, W, H);
      URL.revokeObjectURL(url);
      resolve(canvas);
    };
    img.onerror = reject;
    img.src = url;
  });
}

async function ready(space: {
  ready: boolean;
  element?: Element;
  canvas?: Element;
}) {
  if (space.ready) return;
  const elem = (space.element ?? space.canvas) as Element;
  await new Promise<void>((resolve) => {
    elem.addEventListener("ready", () => resolve(), { once: true });
  });
}

describe("canvas-svg rendering parity", () => {
  it("renders the same scene within an antialiasing tolerance", async () => {
    // canvas side
    const canvasElem = document.createElement("canvas");
    canvasElem.width = W;
    canvasElem.height = H;
    document.body.appendChild(canvasElem);
    const cSpace = new CanvasSpace(canvasElem);
    cSpace.setup({ bgcolor: "#204060", retina: false });
    await ready(cSpace as any);
    const cForm = cSpace.getForm();
    cSpace.resize(Bound.fromGroup([new Pt(0, 0), new Pt(W, H)]));
    scene(cForm);
    const canvasData = (
      canvasElem.getContext("2d") as CanvasRenderingContext2D
    ).getImageData(0, 0, W, H).data;

    // svg side: the identical scene code
    const host = document.createElement("div");
    document.body.appendChild(host);
    const sSpace = new SVGSpace(host);
    await ready(sSpace as any);
    sSpace.resize(Bound.fromGroup([new Pt(0, 0), new Pt(W, H)]));
    const sForm = sSpace.getForm();
    scene(sForm);
    sForm.svgContext.commitFrame();
    const raster = await rasterize(sSpace.toSVG());
    const svgData = raster.getContext("2d")!.getImageData(0, 0, W, H).data;

    // compare with a tolerance for antialiasing along edges
    let mismatched = 0;
    for (let i = 0; i < canvasData.length; i += 4) {
      const dr = Math.abs(canvasData[i] - svgData[i]);
      const dg = Math.abs(canvasData[i + 1] - svgData[i + 1]);
      const db = Math.abs(canvasData[i + 2] - svgData[i + 2]);
      if (dr + dg + db > 90) mismatched++;
    }
    const ratio = mismatched / (W * H);
    expect(ratio).toBeLessThan(0.02); // <2% of pixels may differ (shape edges)

    canvasElem.remove();
    host.remove();
  });

  it("exports expanded SVG with one element per shape", () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const space = new SVGSpace(host);
    space.resize(Bound.fromGroup([new Pt(0, 0), new Pt(W, H)]));
    const form = space.getForm();
    form.fillOnly("#f03");
    form.point([10, 10], 2).point([30, 10], 2).point([50, 10], 2);
    form.svgContext.commitFrame();

    // batched: one path for three same-styled shapes
    expect(space.element.querySelectorAll("g.pts-svgform path")).toHaveLength(
      1,
    );
    // expanded export splits them apart again
    const expanded = space.toSVG(true);
    const doc = new DOMParser().parseFromString(expanded, "image/svg+xml");
    expect(doc.querySelectorAll("g.pts-svgform path")).toHaveLength(3);
    host.remove();
  });
});

describe("Space lifecycle", () => {
  it("removes the window resize listener on dispose", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const space = new SVGSpace(host).setup({ resize: true });
    await ready(space as any);

    const resizes = vi.spyOn(space, "resize");
    window.dispatchEvent(new Event("resize"));
    const before = resizes.mock.calls.length;
    expect(before).toBeGreaterThan(0);

    space.dispose();
    window.dispatchEvent(new Event("resize"));
    expect(resizes.mock.calls.length).toBe(before); // no further calls
    host.remove();
  });

  it("is idempotent and re-mountable on the same element (StrictMode)", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);

    // mount 1
    const first = new SVGSpace(host).setup({ resize: false });
    await ready(first as any);
    const firstForm = first.getForm();
    firstForm.fillOnly("#f03").point([10, 10], 5);
    firstForm.svgContext.commitFrame();
    expect(() => first.dispose().dispose()).not.toThrow(); // double dispose

    // managed elements are gone after dispose
    const svg = host.querySelector("svg")!;
    expect(svg.querySelectorAll("g.pts-svgform")).toHaveLength(0);
    expect(svg.querySelectorAll(".pts-svg-bg")).toHaveLength(0);

    // mount 2 on the same element: exactly one bg and one group, no duplicates
    const second = new SVGSpace(host).setup({ resize: false });
    await ready(second as any);
    second.clear("#123");
    const secondForm = second.getForm();
    secondForm.fillOnly("#0c9").point([20, 20], 5);
    secondForm.svgContext.commitFrame();
    expect(svg.querySelectorAll(".pts-svg-bg")).toHaveLength(1);
    expect(svg.querySelectorAll("g.pts-svgform")).toHaveLength(1);
    expect(svg.querySelectorAll("g.pts-svgform path")).toHaveLength(1);

    second.dispose();
    host.remove();
  });
});
