import { afterEach, describe, expect, it, vi } from "vitest";

import { CanvasForm, CanvasSpace } from "../../Canvas";
import { Font } from "../../Form";
import { Img } from "../../Image";
import { Util } from "../../Util";
import { Bound, Group, Pt } from "../../Pt";

const bounds = (width = 200, height = 100) =>
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

function host() {
  const element = document.createElement("div");
  element.id = `canvas-host-${Math.random().toString(36).slice(2)}`;
  element.style.cssText =
    "position:absolute;left:10px;top:20px;width:200px;height:100px";
  document.body.appendChild(element);
  return element;
}

async function ready(space: CanvasSpace) {
  if (space.ready) return;
  await new Promise<void>((resolve) => {
    space.element.addEventListener("ready", () => resolve(), { once: true });
  });
}

afterEach(() => {
  document.body.innerHTML = "";
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("CanvasSpace and Space interaction", () => {
  it.each([undefined, null, ""])(
    "creates the documented default canvas for %s",
    async (input) => {
      const callback = vi.fn();
      const space = new CanvasSpace(input, callback).setup({ retina: false });
      await ready(space);
      expect(space.id).toBe("pt");
      expect(space.element).toBe(
        document.querySelector("#pt_container > canvas#pt"),
      );
      expect(callback).toHaveBeenCalledOnce();
      expect(callback).toHaveBeenCalledWith(expect.any(Bound), space.element);
      space.dispose();
      expect(document.getElementById("pt_container")).toBeNull();
    },
  );

  it("allows omitting the argument and reuses an existing default canvas", async () => {
    const canvas = document.createElement("canvas");
    canvas.id = "pt";
    document.body.appendChild(canvas);
    const space = new CanvasSpace();
    await ready(space);
    expect(space.element).toBe(canvas);
    expect(document.querySelectorAll("#pt")).toHaveLength(1);
    space.dispose();
    expect(canvas.isConnected).toBe(true);
  });

  it("removes owned canvases on disposal without removing caller-owned hosts", async () => {
    const container = host();
    const sibling = document.createElement("span");
    container.appendChild(sibling);
    const first = new CanvasSpace(container);
    first.dispose().dispose();
    const second = new CanvasSpace(container);
    await ready(second);
    expect(container.querySelectorAll("canvas")).toHaveLength(1);
    second.dispose();
    expect(container.isConnected).toBe(true);
    expect(sibling.isConnected).toBe(true);
    expect(container.querySelectorAll("canvas")).toHaveLength(0);

    const canvas = document.createElement("canvas");
    container.appendChild(canvas);
    new CanvasSpace(canvas).dispose();
    expect(canvas.isConnected).toBe(true);

    const generated = new CanvasSpace("launch-generated-canvas");
    generated.dispose();
    expect(
      document.querySelector("#launch-generated-canvas_container"),
    ).toBeNull();
  });

  it("initializes, sizes, clears, renders, and disposes visible/offscreen canvases", async () => {
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        disconnect() {}
      },
    );
    const container = host();
    const callback = vi.fn();
    const customRender = vi.fn();
    const space = new CanvasSpace(container, callback).setup({
      bgcolor: "#123456",
      resize: true,
      retina: false,
      offscreen: true,
      pixelDensity: 2,
    });
    space.customRendering = customRender;
    const start = vi.fn();
    const resize = vi.fn();
    const animate = vi.fn();
    const action = vi.fn();
    const player = { start, resize, animate, action };
    space.add(player);
    await ready(space);

    expect(space.ready).toBe(true);
    expect(callback).toHaveBeenCalledOnce();
    expect(start).toHaveBeenCalledOnce();
    expect(resize).toHaveBeenCalled();
    expect(customRender).toHaveBeenCalled();
    expect(space.pixelScale).toBe(2);
    expect(space.hasOffscreen).toBe(true);
    expect(space.offscreenCanvas.width).toBe(400);
    expect(space.element).toBeInstanceOf(HTMLCanvasElement);
    expect(space.parent).toBe(container);
    expect(space.background).toBe("#123456");
    expect(space.size).toEqual(new Pt(200, 100));
    expect(space.innerBound.size).toEqual(new Pt(200, 100));
    expect(space.center).toEqual(new Pt(100, 50));
    expect([space.width, space.height]).toEqual([200, 100]);
    expect(space.customRendering).toBe(customRender);

    space.clear("transparent").clear("rgba(1,2,3,.5)").clear("#11223344");
    space.background = "#abcdef";
    space.clear().clearOffscreen().clearOffscreen("red");
    expect(space.background).toBe("#abcdef");

    space.autoResize = false;
    expect(space.autoResize).toBe(false);
    space.autoResize = true;
    expect(space.autoResize).toBe(true);
    space.resize(Bound.fromBoundingRect(bounds(80, 40)));
    expect(space.element.style.width).toBe("80px");

    (space as any).playItems(20);
    expect(space.isPlaying).toBe(true);
    expect(animate).toHaveBeenCalled();
    expect(Array.from(space.pointer)).toEqual([100, 50]);
    space.remove(player);
    space.removeAll().dispose();
  });

  it("dispatches pointer, touch, and keyboard actions and manages bindings", async () => {
    const space = new CanvasSpace(host()).setup({ retina: false });
    const action = vi.fn();
    space.add({ animate: vi.fn(), action });
    await ready(space);
    (space as any).playItems(1);

    const mouse = new MouseEvent("mousemove", {
      clientX: 35,
      clientY: 45,
      shiftKey: true,
      altKey: true,
    });
    (space as any)._mouseDown(mouse);
    (space as any)._mouseMove(mouse);
    (space as any)._mouseUp(mouse);
    (space as any)._mouseOver(mouse);
    (space as any)._mouseOut(mouse);
    (space as any)._mouseClick(mouse);
    (space as any)._contextMenu(mouse);
    expect(action.mock.calls.map((call) => call[0])).toEqual(
      expect.arrayContaining([
        "down",
        "pointerdown",
        "drag",
        "pointerup",
        "drop",
        "over",
        "out",
        "click",
        "contextmenu",
      ]),
    );
    expect(space.pointer.id).toBe("contextmenu");

    (space as any)._keyDown(
      new KeyboardEvent("keydown", { shiftKey: true, altKey: true }),
    );
    (space as any)._keyUp(new KeyboardEvent("keyup"));
    expect(action).toHaveBeenCalledWith(
      "keydown",
      1,
      1,
      expect.any(KeyboardEvent),
    );

    const touchList = {
      length: 2,
      item: (index: number) =>
        [
          { clientX: 20, clientY: 40 },
          { clientX: 30, clientY: 50 },
        ][index],
    };
    expect(
      space.touchesToPoints({ touches: touchList } as unknown as TouchEvent),
    ).toEqual([new Pt(10, 20), new Pt(20, 30)]);
    expect(space.touchesToPoints(null!)).toEqual([]);
    const touch = new TouchEvent("touchmove");
    (space as any)._touchStart(touch);
    (space as any)._touchMove(touch);

    const target = document.createElement("div");
    document.body.appendChild(target);
    const listener = vi.fn();
    space.bindCanvas("custom", listener, {}, target);
    target.dispatchEvent(new Event("custom"));
    expect(listener).toHaveBeenCalledOnce();
    space.unbindCanvas("custom", listener, {}, target);
    space.bindDoc("custom-doc", listener);
    document.dispatchEvent(new Event("custom-doc"));
    space.unbindDoc("custom-doc", listener);
    space.bindMouse(true, target).bindMouse(false, target);
    space.bindTouch(true, false, target).bindTouch(false, false, target);
    space.bindKeyboard(true).bindKeyboard(false);
    space.dispose();
  });

  it("owns each input listener once and removes the original callbacks", async () => {
    const space = new CanvasSpace(host()).setup({ retina: false });
    await ready(space);

    const canvas = space.element;
    const addCanvas = vi.spyOn(canvas, "addEventListener");
    const removeCanvas = vi.spyOn(canvas, "removeEventListener");
    const addDocument = vi.spyOn(document, "addEventListener");
    const removeDocument = vi.spyOn(document, "removeEventListener");
    const cancelAnimationFrame = vi.spyOn(window, "cancelAnimationFrame");

    space
      .bindMouse()
      .bindMouse()
      .bindTouch()
      .bindTouch()
      .bindKeyboard()
      .bindKeyboard();
    space.play();

    expect(addCanvas).toHaveBeenCalledTimes(12);
    expect(addDocument).toHaveBeenCalledTimes(2);
    expect(space.isPlaying).toBe(true);

    space.dispose();

    for (const type of [
      "pointerdown",
      "pointerup",
      "pointerover",
      "pointerout",
      "pointercancel",
      "pointermove",
      "click",
      "contextmenu",
      "touchstart",
      "touchend",
      "touchmove",
      "touchcancel",
    ]) {
      const added = addCanvas.mock.calls.find(([event]) => event === type);
      const removed = removeCanvas.mock.calls.find(([event]) => event === type);
      expect(removed?.[1], `listener for ${type}`).toBe(added?.[1]);
    }

    for (const type of ["keydown", "keyup"]) {
      const added = addDocument.mock.calls.find(([event]) => event === type);
      const removed = removeDocument.mock.calls.find(
        ([event]) => event === type,
      );
      expect(removed?.[1], `listener for ${type}`).toBe(added?.[1]);
    }

    expect(cancelAnimationFrame).toHaveBeenCalledOnce();
    expect(space.isPlaying).toBe(false);
    expect(space.ready).toBe(false);

    space.dispose();
    expect(removeCanvas).toHaveBeenCalledTimes(12);
    expect(removeDocument).toHaveBeenCalledTimes(2);
  });

  it("cancels delayed readiness when an existing canvas is disposed", async () => {
    vi.useFakeTimers();
    try {
      const container = host();
      const canvas = document.createElement("canvas");
      container.appendChild(canvas);
      const callback = vi.fn();
      const start = vi.fn();
      const readyEvent = vi.fn();
      canvas.addEventListener("ready", readyEvent);

      const space = new CanvasSpace(canvas, callback).setup({ retina: false });
      space.add({ animate: vi.fn(), start });
      space.dispose();
      await vi.advanceTimersByTimeAsync(100);

      expect(space.ready).toBe(false);
      expect(callback).not.toHaveBeenCalled();
      expect(start).not.toHaveBeenCalled();
      expect(readyEvent).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it("controls playback timing, refresh, pause, stop, replay, and failures", async () => {
    const space = new CanvasSpace(host()).setup({ retina: false });
    await ready(space);
    space.refresh(false);
    space.minFrameTime(100);
    space.play(10);
    space.play(20);
    space.pause().play(30);
    space.pause(true).resume().stop(0);
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(space.isPlaying).toBe(false);

    space.playOnce(0);
    await new Promise((resolve) => requestAnimationFrame(resolve));
    space.replay();
    space.stop(0);
    await new Promise((resolve) => requestAnimationFrame(resolve));
    space.dispose();
  });

  it("creates recordings and handles callback and download results", async () => {
    class FakeRecorder {
      ondataavailable!: (event: { data: Blob }) => void;
      constructor(
        public stream: MediaStream,
        public options: MediaRecorderOptions,
      ) {}
    }
    vi.stubGlobal("MediaRecorder", FakeRecorder);
    const space = new CanvasSpace(host()).setup({ retina: false });
    await ready(space);
    space.element.captureStream = () => ({}) as MediaStream;
    const objectURL = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:recording");

    const callback = vi.fn();
    const callbackRecorder = space.recorder(callback, "webm", 1234) as any;
    callbackRecorder.ondataavailable({ data: new Blob(["video"]) });
    expect(callback).toHaveBeenCalledWith("blob:recording");
    expect(callbackRecorder.options).toEqual({
      mimeType: "video/webm",
      bitsPerSecond: 1234,
    });

    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
    const downloadRecorder = space.recorder(true, "mp4") as any;
    downloadRecorder.ondataavailable({ data: new Blob(["video"]) });
    expect(click).toHaveBeenCalledOnce();
    expect(objectURL).toHaveBeenCalledTimes(2);
    space.dispose();
  });
});

describe("CanvasForm", () => {
  it("applies styles, gradients, compositing, fonts, and all drawing primitives", () => {
    const canvas = document.createElement("canvas");
    canvas.width = 240;
    canvas.height = 160;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d")!;
    const form = new CanvasForm(ctx);

    expect(form.ctx).toBe(ctx);
    expect(form.space).toBeUndefined();
    form
      .alpha(0.5)
      .fill("#f00")
      .stroke("#0f0", 2, "round", "square")
      .fill(false)
      .stroke(false)
      .fillOnly("#00f")
      .strokeOnly("#fff", 3)
      .applyFillStroke("red", "blue", 4)
      .composite("multiply")
      .dash()
      .dash([2, 3], 1)
      .dash(false)
      .font(14, "bold", "italic", 1.2, "serif")
      .font(new Font(12, "monospace"))
      .fontWidthEstimate(true);

    expect(form.getTextWidth("hello")).toBeGreaterThan(0);
    form.fontWidthEstimate(false);
    expect(form.getTextWidth("hello")).toBeGreaterThan(0);
    const linear = form.gradient(["red", "blue"])(
      new Group(new Pt(0, 0), new Pt(10, 10)),
    );
    const radial = form.gradient([[0.5, "red"]])(
      new Group(new Pt(0, 0), new Pt(2, 2)),
      new Group(new Pt(4, 4), new Pt(5, 5)),
    );
    expect(linear).toBeInstanceOf(CanvasGradient);
    expect(radial).toBeInstanceOf(CanvasGradient);

    form
      .point([10, 10], 2, "circle")
      .point([20, 10], 2)
      .circle([
        [30, 10],
        [3, 3],
      ])
      .ellipse([40, 10], [4, 2], 0.2, 0, Math.PI, true)
      .arc([50, 10], 4, 0, Math.PI)
      .square([60, 10], 3)
      .line([
        [0, 30],
        [10, 30],
        [20, 35],
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
      .text([5, 60], "text", 100)
      .alignText("center", "center" as CanvasTextBaseline)
      .textBox(
        [new Pt(0, 65), new Pt(100, 85)],
        "long text for box",
        "middle",
        "...",
      )
      .paragraphBox(
        new Group(new Pt(0, 90), new Pt(100, 150)),
        "one two three four\nfive six",
        1.1,
        "middle",
        true,
      )
      .paragraphBox(
        new Group(new Pt(110, 90), new Pt(220, 150)),
        "one two three",
        1.1,
        "bottom",
        false,
      )
      .log("message")
      .clip()
      .reset();

    expect(() => form.point([0, 0], 1, "missing")).toThrow(/static/);
    expect(CanvasForm.point(ctx, null!)).toBeUndefined();
    expect(CanvasForm.circle(ctx, null!)).toBeUndefined();
    expect(CanvasForm.ellipse(ctx, null!, [1, 1])).toBeUndefined();
    expect(CanvasForm.arc(ctx, null!, 1, 0, 1)).toBeUndefined();
    expect(CanvasForm.square(ctx, null!, 1)).toBeUndefined();
    expect(CanvasForm.line(ctx, [])).toBeUndefined();
    expect(CanvasForm.polygon(ctx, [])).toBeUndefined();
    expect(CanvasForm.rect(ctx, [])).toBeUndefined();
    expect(CanvasForm.text(ctx, null!, "none")).toBeUndefined();
  });

  it("draws canvases and image data in every placement mode", () => {
    const target = document.createElement("canvas");
    target.width = 100;
    target.height = 100;
    const source = document.createElement("canvas");
    source.width = 10;
    source.height = 10;
    const form = new CanvasForm(target.getContext("2d")!);
    const data = new ImageData(2, 2);

    form
      .image([1, 2], source)
      .image(
        [
          [0, 0],
          [20, 20],
        ],
        source,
      )
      .image(
        [
          [20, 20],
          [40, 40],
        ],
        source,
        [
          [1, 1],
          [5, 5],
        ],
      )
      .imageData([0, 0], data)
      .imageData(
        [
          [1, 1],
          [2, 2],
        ],
        data,
      );

    const img = Img.blank([10, 10]);
    (img as any)._img = img.canvas;
    form.image([0, 0], img);
    expect(target.getContext("2d")!.getImageData(0, 0, 1, 1)).toBeInstanceOf(
      ImageData,
    );
  });

  it("switches to an offscreen canvas and renders it back", async () => {
    const space = new CanvasSpace(host()).setup({
      retina: false,
      offscreen: true,
    });
    const form = space.getForm();
    await ready(space);
    expect(form.space).toBe(space);
    form.useOffscreen(true, true).point([5, 5]).renderOffscreen([2, 3]);
    expect(form.ctx).toBe(space.offscreenCtx);
    form.useOffscreen(false, "white");
    expect(form.ctx).toBe(space.ctx);
    space.dispose();
  });
});

describe("Img", () => {
  it("creates editable images and manipulates pixels, crops, filters, and exports", async () => {
    const img = Img.blank([8, 6], undefined, 2);
    expect(img.loaded).toBe(true);
    expect(img.current).toBe(img.canvas);
    expect(img.canvasSize).toEqual(new Pt(16, 12));
    expect(img.imageSize).toEqual(new Pt(8, 6)); // logical size: canvas / pixelScale
    expect(img.pixelScale).toBe(2);
    expect(img.getForm()).toBeInstanceOf(CanvasForm);
    expect(img.ctx).toBeTruthy();
    expect(img.image).toBeInstanceOf(HTMLImageElement);
    expect(img.scaledMatrix.value).toBeTruthy();

    img.ctx.fillStyle = "rgb(255, 0, 0)";
    img.ctx.fillRect(0, 0, 16, 12);
    (img as any)._data = img.ctx.getImageData(0, 0, 16, 12);
    expect(img.pixel([0, 0], false)).toEqual(new Pt(255, 0, 0, 255));
    expect(Img.getPixel(img.data, [99, 99])).toEqual(new Pt(0, 0, 0, 0));
    expect(img.crop(new Bound(new Pt(0, 0), new Pt(2, 2)))).toBeInstanceOf(
      ImageData,
    );
    expect(img.filter("grayscale(1)")).toBe(img);

    const bitmap = await img.bitmap([4, 4]);
    expect(bitmap).toBeInstanceOf(ImageBitmap);
    bitmap.close();
    expect(img.toBase64()).toMatch(/^data:image\/png/);
    expect(await img.toBlob()).toBeInstanceOf(Blob);
    expect(await Img.imageDataToBlob(img.data)).toBeInstanceOf(Blob);
  });

  it("loads data/blob images, resizes, synchronizes, and creates patterns", async () => {
    const source = document.createElement("canvas");
    source.width = 4;
    source.height = 3;
    source.getContext("2d")!.fillRect(0, 0, 4, 3);
    const url = source.toDataURL();
    const loaded = await Img.loadAsync(url, true);
    expect(loaded.loaded).toBe(true);
    expect(loaded.imageSize).toEqual(new Pt(4, 3));
    await loaded.resize([8, 6]).resize([0.5, 0.5], true).sync();

    // merged static load: returns a Promise and still supports the callback
    const callback = vi.fn();
    const viaPromise = await Img.load(url, false, undefined, callback);
    expect(viaPromise).toBeInstanceOf(Img);
    expect(callback).toHaveBeenCalledWith(viaPromise);
    // failures reject instead of vanishing
    await expect(
      Img.load("data:image/png;base64,not-an-image"),
    ).rejects.toThrow(/cannot load/);

    const blob = await loaded.toBlob();
    const fromBlob = await Img.fromBlob(blob, true);
    expect(fromBlob.loaded).toBe(true);

    const space = new CanvasSpace(host()).setup({ retina: false });
    await ready(space);
    const withSpace = await Img.loadAsync(url, false, space);
    expect(withSpace.pattern("repeat")).toBeInstanceOf(CanvasPattern);
    expect(await Img.loadPattern(url, space, "no-repeat")).toBeInstanceOf(
      CanvasPattern,
    );
    const dynamic = Img.blank([2, 2], space);
    expect(dynamic.pattern("repeat-x", true)).toBeInstanceOf(CanvasPattern);
    // pattern no longer requires a CanvasSpace: it falls back internally
    expect(loaded.pattern()).toBeInstanceOf(CanvasPattern);
    space.dispose();

    loaded.cleanup();
    expect(loaded.data).toBeNull();
  });

  it("reports invalid edit operations and image load failures", async () => {
    const plain = new Img(false, undefined, true);
    expect(plain.image.crossOrigin).toBe("anonymous");
    Util.warnLevel("warn");
    const warned = vi.spyOn(console, "warn").mockImplementation(() => {});
    plain.initCanvas(2, 2);
    expect(plain.getForm()).toBeUndefined();
    expect(warned).toHaveBeenCalledTimes(2);
    Util.warnLevel("mute");
    await expect(
      plain.load("data:image/png;base64,invalid"),
    ).rejects.toBeTruthy();
  });
});

describe("Img correctness fixes", () => {
  function sourceUrl(w = 4, h = 4, color = "#ff0000") {
    const cv = document.createElement("canvas");
    cv.width = w;
    cv.height = h;
    const ctx = cv.getContext("2d")!;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, w, h);
    return cv.toDataURL();
  }

  it("reads the last pixel and rejects negative coordinates", async () => {
    const img = await Img.load(sourceUrl(4, 4), true);
    expect(img.pixel([3, 3], false)).toEqual(new Pt(255, 0, 0, 255));
    expect(img.pixel([-1, 0], false)).toEqual(new Pt(0, 0, 0, 0));
    img.dispose();
  });

  it.each([false, true])(
    "rejects an editable=%s pending load on disposal",
    async (editable) => {
      const img = new Img(editable);
      const image = img.image;
      const pending = img.load(sourceUrl());
      const rejection = expect(pending).rejects.toThrow(/disposed/);
      img.dispose().dispose();
      await rejection;
      expect(image.onload).toBeNull();
      expect(image.onerror).toBeNull();
      expect(img.loaded).toBe(false);
      expect(img.current).toBeNull();
      await expect(img.load(sourceUrl())).rejects.toThrow(/disposed/);
      await expect(img.sync()).rejects.toThrow(/disposed/);
    },
  );

  it("does not revive an image disposed between load completion and its continuation", async () => {
    const img = new Img();
    const pending = img.load(sourceUrl());
    const rejection = expect(pending).rejects.toThrow(/disposed/);
    img.image.dispatchEvent(new Event("load"));
    img.dispose();
    await rejection;
    expect(img.loaded).toBe(false);
    expect(img.current).toBeNull();
  });

  it("rejects a pending sync when disposed during asynchronous encoding", async () => {
    const img = Img.blank([4, 4]);
    const pending = img.sync();
    const rejection = expect(pending).rejects.toThrow(/disposed/);
    img.dispose();
    await rejection;
    expect(img.loaded).toBe(false);
    expect(img.current).toBeNull();
  });

  it("supersedes a pending load with a rejection", async () => {
    const img = new Img(true);
    const first = img.load(sourceUrl(4, 4, "#00ff00"));
    const second = img.load(sourceUrl(4, 4, "#0000ff"));
    await expect(first).rejects.toThrow(/superseded/);
    await (await second).sync();
    expect(img.pixel([1, 1], false)[2]).toBe(255); // blue won
    img.dispose();
  });

  it("sync() is awaitable and refreshes data at scale 1 and 2", async () => {
    for (const scale of [1, 2]) {
      const img = Img.blank([4, 4], undefined, scale);
      const form = img.getForm()!;
      form.fillOnly("#00ff00").rect([
        [0, 0],
        [8, 8],
      ]);
      img.loadPixels();
      await img.sync();
      expect(img.pixel([1, 1], false)[1]).toBe(255);
      img.dispose();
    }
  });

  it("filter replaces instead of compositing", async () => {
    const img = await Img.load(sourceUrl(4, 4), true);
    img.filter("opacity(50%)");
    const alpha = img.pixel([1, 1], false)[3];
    // "copy" semantics: 50% of 255 ≈ 127-128; the old bug composited to ~191
    expect(alpha).toBeGreaterThan(120);
    expect(alpha).toBeLessThan(140);
    img.dispose();
  });

  it("resizes canvas-only images", () => {
    const img = Img.blank([4, 4]);
    const form = img.getForm()!;
    form.fillOnly("#0000ff").rect([
      [0, 0],
      [4, 4],
    ]);
    img.resize([8, 8]);
    expect(img.canvasSize).toEqual(new Pt(8, 8));
    expect(img.pixel([6, 6], false)[2]).toBe(255); // content scaled up
    img.dispose();
  });

  it("blank images support pixel reads immediately", () => {
    const img = Img.blank([4, 4]);
    expect(img.pixel([1, 1], false)).toEqual(new Pt(0, 0, 0, 0)); // no crash
    img.dispose();
  });

  it("setPixel and updatePixels round-trip", () => {
    const img = Img.blank([4, 4]);
    img.setPixel([2, 2], [10, 20, 30, 255], false).updatePixels();
    img.loadPixels();
    expect(img.pixel([2, 2], false)).toEqual(new Pt(10, 20, 30, 255));
    img.dispose();
  });

  it("supports the options-object constructor", () => {
    const img = new Img({ editable: true, pixelScale: 2 });
    expect(img.pixelScale).toBe(2);
    img.initCanvas(4, 4, 2);
    expect(img.canvasSize).toEqual(new Pt(8, 8));
    img.dispose();
  });

  it("revokes object URLs from fromBlob", async () => {
    const revoke = vi.spyOn(URL, "revokeObjectURL");
    const src = await Img.load(sourceUrl(2, 2), true);
    const blob = await src.toBlob();
    const img = await Img.fromBlob(blob, true);
    expect(img.loaded).toBe(true);
    expect(revoke).toHaveBeenCalled();
    revoke.mockRestore();
    img.dispose();
    src.dispose();
  });

  it("warns instead of crashing on non-editable pixel reads", async () => {
    const img = await Img.load(sourceUrl(2, 2), false);
    expect(img.pixel([0, 0])).toEqual(new Pt(0, 0, 0, 0));
    expect(new Img().imageSize).toEqual(new Pt(0, 0));
    img.dispose();
  });
});

describe("style cache survives context resets", () => {
  it("re-applies styles after a space resize resets the canvas context", async () => {
    const space = new CanvasSpace(host()).setup({ retina: false });
    await ready(space);
    const form = space.getForm();
    const ctx = space.ctx;

    form.stroke("#fff", 2);
    expect(ctx.strokeStyle).toBe("#ffffff");

    // resizing assigns canvas.width, which resets the context to defaults
    space.resize(Bound.fromBoundingRect(bounds(120, 80)));
    expect(ctx.strokeStyle).toBe("#000000"); // the reset really happened

    // the same style value must still apply — this was the black-stroke bug
    form.stroke("#fff", 2);
    expect(ctx.strokeStyle).toBe("#ffffff");
    expect(ctx.lineWidth).toBe(2);

    form.fill("#f03");
    expect(ctx.fillStyle).toBe("#ff0033");
    space.dispose();
  });

  it("keeps styles applied across animation frames despite the per-frame ctx restore", async () => {
    // playItems wraps each frame in ctx.save()/restore(); the restore reverts
    // style state silently, so a cached same-value write on the next frame
    // must not be skipped — this made every sketch paint defaults from frame 2
    const space = new CanvasSpace(host()).setup({
      bgcolor: "#0f172a",
      retina: false,
    });
    await ready(space);
    const form = space.getForm();
    space.add({
      animate: () => {
        form.fillOnly("#f97316").point([30, 30], 10, "circle");
      },
    });

    const play = (t: number) =>
      (space as unknown as { playItems: (time: number) => void }).playItems(t);
    play(1);
    play(2);
    const px = space.ctx.getImageData(30, 30, 1, 1).data;
    expect([px[0], px[1], px[2]]).toEqual([249, 115, 22]);
    space.dispose();
  });

  it("re-applies styles after an Img canvas re-init", () => {
    const img = Img.blank([8, 8]);
    const form = img.getForm()!;
    form.fillOnly("#0c9");
    expect((img.ctx as CanvasRenderingContext2D).fillStyle).toBe("#00cc99");

    img.initCanvas(16, 16); // resets the context
    form.fillOnly("#0c9"); // same value must re-apply
    expect((img.ctx as CanvasRenderingContext2D).fillStyle).toBe("#00cc99");
    img.dispose();
  });
});
