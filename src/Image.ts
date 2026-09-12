import { CanvasForm, type CanvasSpace } from "./Canvas";
import { type Bound, Pt } from "./Pt";
import { Mat } from "./LinearAlgebra";
import { type PtLike, type CanvasPatternRepetition } from "./Types";
import { Util } from "./Util";
import { type RenderingContext2D } from "./Types";

/**
 * Options for creating an [`Img`](#link).
 */
export type ImgOptions = {
  /** Specify if you want to manipulate pixels of this image. Default is `false`. */
  editable?: boolean;
  /** Set the `CanvasSpace` reference so the image's pixelScale matches the canvas. */
  space?: CanvasSpace;
  /** Enable loading cross-domain images. The image server must also allow it. */
  crossOrigin?: boolean;
  /** Set a specific pixel scale, overriding the space's. */
  pixelScale?: number;
};

/**
 * Img provides convenient functions to support image operations on HTML Canvas and [`CanvasSpace`](#link). Combine this with other Pts functions to experiment with visual forms that integrate bitmaps and vector graphics.
 */
export class Img {
  protected _img!: HTMLImageElement;
  protected _data!: ImageData;
  protected _cv!: HTMLCanvasElement;
  protected _ctx!: RenderingContext2D;
  protected _scale: number = 1;

  protected _loaded: boolean = false;
  protected _editable: boolean;

  protected _space: CanvasSpace | undefined;
  protected _patternCtx!: RenderingContext2D; // lazy fallback when no space is set
  protected _objectUrl!: string | null; // tracked for revocation on dispose
  private _pendingLoadReject: ((err: Error) => void) | null = null; // newer loads supersede pending ones
  private _disposed = false;
  protected _dataDirty: boolean = false; // ImageData refreshes lazily on first read

  /**
   * Create an Img
   * @param editable either an [`ImgOptions`](#link) object, or a boolean specifying if you want to manipulate pixels of this image. Default is `false`.
   * @param space Set the `CanvasSpace` reference. This is optional but will make sure the image's pixelScale match the canvas and set the context for creating pattern.
   * @param crossOrigin an optional parameter to enable loading cross-domain images if set to true. The image server's configuration must also be set correctly. For more, see [this documentation](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image).
   * @example `new Img(true, space)`, `new Img({ editable: true, pixelScale: 2 })`
   */
  constructor(
    editable: boolean | ImgOptions = false,
    space?: CanvasSpace,
    crossOrigin?: boolean,
  ) {
    const opts: ImgOptions =
      typeof editable === "object"
        ? editable
        : { editable, space, crossOrigin };
    this._editable = !!opts.editable;
    this._space = opts.space;
    this._scale = opts.pixelScale ?? (this._space ? this._space.pixelScale : 1);
    this._img = new Image();
    if (opts.crossOrigin) this._img.crossOrigin = "Anonymous";
  }

  /**
   * A static function to load an image, returning a Promise that resolves to the loaded Img.
   * A load failure rejects the Promise.
   * @param src an url of the image in same domain. Alternatively you can use a base64 string. To load from Blob, use `Img.fromBlob`.
   * @param editable either an [`ImgOptions`](#link) object, or a boolean specifying if you want to manipulate pixels of this image. Default is `false`.
   * @param space Set the `CanvasSpace` reference. This is optional but will make sure the image's pixelScale match the canvas and set the context for creating pattern.
   * @param ready An optional callback, invoked with the Img when loading succeeds
   * @example `const img = await Img.load("photo.jpg", true)`
   */
  static load(
    src: string,
    editable: boolean | ImgOptions = false,
    space?: CanvasSpace,
    ready?: (img: Img) => void,
  ): Promise<Img> {
    return new Img(editable, space).load(src).then((res) => {
      if (ready) ready(res);
      return res;
    });
  }

  /**
   * A static method to load an image using async/await.
   * @deprecated Use [`Img.load`](#link), which now returns a Promise.
   * @param src an url of the image in same domain. Alternatively you can use a base64 string. To load from Blob, use `Img.fromBlob`.
   * @param editable Specify if you want to manipulate pixels of this image. Default is `false`.
   * @param space Set the `CanvasSpace` reference. This is optional but will make sure the image's pixelScale match the canvas and set the context for creating pattern.
   */
  static async loadAsync(
    src: string,
    editable: boolean | ImgOptions = false,
    space?: CanvasSpace,
  ): Promise<Img> {
    return Img.load(src, editable, space);
  }

  /**
   * A static method to load an image pattern using async/await.
   * @param src an url of the image in same domain. Alternatively you can use a base64 string. To load from Blob, use `Img.fromBlob`.
   * @param space Set the `CanvasSpace` reference. This is optional but will make sure the image's pixelScale match the canvas and set the context for creating pattern.
   * @param repeat set how the pattern will repeat fills
   * @param editable Specify if you want to manipulate pixels of this image. Default is `false`.
   * @returns a `CanvasPattern` instance for use in `fill()`
   */
  static async loadPattern(
    src: string,
    space: CanvasSpace,
    repeat: CanvasPatternRepetition = "repeat",
    editable: boolean = false,
  ) {
    const img = await Img.loadAsync(src, editable, space);
    return img.pattern(repeat);
  }

  /**
   * Create an editable blank image
   * @param size of image
   * @param space Optionally set the `CanvasSpace` reference. This is optional but will make sure the image's pixelScale match the canvas and set the context for creating pattern.
   * @param scale Optionally set a specific pixel scale (density) of the image canvas.
   */
  static blank(size: PtLike, space?: CanvasSpace, scale?: number): Img {
    let img = new Img(true, space);
    const s = scale ? scale : space ? space.pixelScale : 1;
    img.initCanvas(size[0], size[1], s);
    return img;
  }

  /**
   * Load an image.
   * @param src an url of the image in same domain. Alternatively you can use a base64 string. To load from Blob, use `Img.fromBlob`.
   * @returns a Promise that resolves to an Img
   */
  load(src: string): Promise<Img> {
    if (this._editable && typeof document === "undefined") {
      return Promise.reject(
        new Error("Cannot create html canvas element. document not found."),
      );
    }

    return this._loadImageSrc(src).then(() => {
      if (this._disposed) throw new Error("Img has been disposed");
      if (this._editable) {
        if (!this._cv)
          this._cv = document.createElement("canvas") as HTMLCanvasElement;
        this._drawToScale(this._scale, this._img);
        this._dataDirty = true;
      }
      this._loaded = true;
      return this;
    });
  }

  /**
   * Swap the underlying image's source and await its load — without the editable
   * pipeline. Shared by `load()` and `sync()` so both respect the supersede rule.
   */
  protected _loadImageSrc(src: string): Promise<void> {
    if (this._disposed)
      return Promise.reject(new Error("Img has been disposed"));
    return new Promise<void>((resolve, reject) => {
      // a newer load replaces this one's handlers on the shared <img>, so a
      // pending previous promise must be rejected proactively
      if (this._pendingLoadReject) {
        this._pendingLoadReject(
          new Error("Img loading superseded by a newer load"),
        );
      }
      this._pendingLoadReject = reject;

      this._img.onload = () => {
        this._pendingLoadReject = null;
        resolve();
      };

      this._img.onerror = () => {
        this._pendingLoadReject = null;
        reject(new Error(`Img cannot load ${src}`));
      };

      this._img.src = src;
    });
  }

  /** Refresh the cached `ImageData` from the current canvas. */
  protected _refreshData(): void {
    this._data = this._ctx.getImageData(0, 0, this._cv.width, this._cv.height);
    this._dataDirty = false;
  }

  /** Materialize the cached `ImageData` lazily, on first read after a change. */
  protected _ensureData(): void {
    if ((this._dataDirty || !this._data) && this._ctx && this._cv) {
      this._refreshData();
    }
  }

  /**
   * Rescale the canvas and draw an image-source on it.
   * @param canvasScale rescale factor for the canvas
   * @param img an image source like Image, Canvas, or ImageBitmap.
   */
  protected _drawToScale(
    canvasScale: number | PtLike,
    img:
      | HTMLImageElement
      | HTMLCanvasElement
      | ImageBitmap
      | OffscreenCanvas
      | HTMLVideoElement,
  ) {
    const nw = img.width as number;
    const nh = img.height as number;
    this._initCanvas(nw, nh, canvasScale);
    if (img)
      this._ctx.drawImage(
        img,
        0,
        0,
        nw,
        nh,
        0,
        0,
        this._cv.width,
        this._cv.height,
      );
  }

  /**
   * Initiate an editable canvas
   * @param width width of canvas
   * @param height height of canvas
   * @param canvasScale pixel scale
   */
  initCanvas(width: number, height: number, canvasScale: number | PtLike = 1) {
    this._initCanvas(width, height, canvasScale);
  }

  /**
   * Internal canvas setup without the pixel-data refresh — callers that draw
   * immediately afterwards refresh once after their draw instead.
   */
  protected _initCanvas(
    width: number,
    height: number,
    canvasScale: number | PtLike = 1,
  ) {
    if (!this._editable) {
      Util.warn(
        "Cannot initiate canvas because this Img is not set to be editable",
      );
      return;
    }

    if (!this._cv)
      this._cv = document.createElement("canvas") as HTMLCanvasElement;

    const cms =
      typeof canvasScale === "number"
        ? [canvasScale, canvasScale]
        : canvasScale;
    this._cv.width = width * cms[0];
    this._cv.height = height * cms[1];
    // the whole point of an editable Img is repeated readback
    this._ctx = this._cv.getContext("2d", { willReadFrequently: true })!;
    // resizing resets the context state; forget any cached style values so a
    // CanvasForm from getForm() re-applies its styles
    CanvasForm.resetStyleCache(this._ctx);
    // keep the pixel-density field coherent with the actual canvas scaling,
    // which `pixel( p, true )` depends on
    if (typeof canvasScale === "number") this._scale = canvasScale;
    this._dataDirty = true; // pixel reads materialize lazily
    this._loaded = true;
  }

  /**
   * Get an efficient, readonly bitmap of the current canvas.
   * @param size Optional size to crop
   * @returns a Promise that resolves to an ImageBitmap
   */
  bitmap(size?: PtLike): Promise<ImageBitmap> {
    const w = size ? size[0] : this._cv.width;
    const h = size ? size[1] : this._cv.height;
    return createImageBitmap(this._cv, 0, 0, w, h);
  }

  /**
   * Create a canvas pattern for `fill()`
   * @param reptition set how the pattern should repeat-fill
   * @param dynamic If true, use this Img's internal canvas content as pattern fill. This enables the pattern to update dynamically.
   * @returns a `CanvasPattern` instance for use in `fill()`
   */
  pattern(
    reptition: CanvasPatternRepetition = "repeat",
    dynamic: boolean = false,
  ): CanvasPattern {
    // any 2D context can create a pattern; fall back to an internal one so a
    // CanvasSpace reference is optional
    let ctx: RenderingContext2D | undefined = this._space
      ? this._space.ctx
      : undefined;
    if (!ctx) {
      if (!this._patternCtx) {
        this._patternCtx = document.createElement("canvas").getContext("2d")!;
      }
      ctx = this._patternCtx;
    }
    return ctx.createPattern(dynamic ? this._cv : this._img, reptition)!;
  }

  /**
   * Replace the image with the current canvas data. For example, you can use CanvasForm's static functions to draw on `this.ctx` and then update the current image.
   * To display the internal canvas, use `form.image( [0, 0], img.current )`.
   */
  async sync(): Promise<Img> {
    if (this._disposed) throw new Error("Img has been disposed");
    // Blob-blit instead of a base64 round-trip: encode asynchronously, load
    // the result into the image, and leave the working canvas untouched (the
    // canvas is already the source of truth, so no redraw or readback is
    // needed — and the retina canvas is no longer squashed through a lossy
    // reload; a temporary canvas produces the logical-size image instead).
    let source: HTMLCanvasElement = this._cv;
    if (this._scale !== 1) {
      source = document.createElement("canvas");
      source.width = this._cv.width / this._scale;
      source.height = this._cv.height / this._scale;
      source
        .getContext("2d")!
        .drawImage(
          this._cv,
          0,
          0,
          this._cv.width,
          this._cv.height,
          0,
          0,
          source.width,
          source.height,
        );
    }

    const blob = await new Promise<Blob>((resolve, reject) => {
      source.toBlob((b) =>
        b ? resolve(b) : reject(new Error("Img cannot export canvas to blob")),
      );
    });

    const url = URL.createObjectURL(blob);
    this._objectUrl = url;
    try {
      await this._loadImageSrc(url);
      if (this._disposed) throw new Error("Img has been disposed");
      this._loaded = true;
    } finally {
      URL.revokeObjectURL(url);
      this._objectUrl = null;
    }
    return this;
  }

  /**
   * Get the RGBA values of a pixel in the image
   * @param p position of the pixel
   * @param rescale Specify if the pixel position should be scaled. Usually use rescale when tracking image and don't rescale when tracking canvas. You may also set a custom scale value.
   * @returns [R,G,B,A] values of the pixel at the specific position
   */
  pixel(p: PtLike, rescale: boolean | number = true): Pt {
    this._ensureData();
    if (!this._data) {
      Util.warn(
        "Img has no pixel data — create it as editable and wait for load",
      );
      return new Pt(0, 0, 0, 0);
    }
    const s = typeof rescale == "number" ? rescale : rescale ? this._scale : 1;
    return Img.getPixel(this._data, [p[0] * s, p[1] * s]);
  }

  /**
   * Set the RGBA values of a pixel in the cached `ImageData`. Call [`Img.updatePixels`](#link)
   * to write the changes onto the canvas.
   * @param p position of the pixel
   * @param rgba [R,G,B,A] values, 0-255
   * @param rescale Specify if the pixel position should be scaled, matching [`Img.pixel`](#link)
   */
  setPixel(p: PtLike, rgba: PtLike, rescale: boolean | number = true): this {
    this._ensureData();
    if (!this._data) {
      Util.warn("Img has no pixel data — create it as editable");
      return this;
    }
    const s = typeof rescale == "number" ? rescale : rescale ? this._scale : 1;
    const x = Math.floor(p[0] * s);
    const y = Math.floor(p[1] * s);
    if (x < 0 || y < 0 || x >= this._data.width || y >= this._data.height) {
      return this;
    }
    const i = y * this._data.width * 4 + x * 4;
    this._data.data[i] = rgba[0];
    this._data.data[i + 1] = rgba[1];
    this._data.data[i + 2] = rgba[2];
    this._data.data[i + 3] = rgba[3] !== undefined ? rgba[3] : 255;
    return this;
  }

  /**
   * Refresh the cached `ImageData` from the canvas — call this after drawing on the
   * canvas (eg, via [`Img.getForm`](#link)) before reading pixels.
   */
  loadPixels(): this {
    if (!this._ctx) {
      Util.warn("Img has no canvas — create it as editable");
      return this;
    }
    this._refreshData();
    return this;
  }

  /**
   * Write the cached `ImageData` (eg, after [`Img.setPixel`](#link) calls) back onto
   * the canvas.
   */
  updatePixels(): this {
    if (!this._ctx || !this._data) {
      Util.warn("Img has no canvas — create it as editable");
      return this;
    }
    this._ctx.putImageData(this._data, 0, 0);
    this._dataDirty = false; // canvas now equals the cached data
    return this;
  }

  /**
   * Given an ImaegData object and a position, return the RGBA pixel value at that position.
   * @param imgData an ImageData object
   * @param p a position on the image
   * @returns [R,G,B,A] values of the pixel at the specific position
   */
  static getPixel(imgData: ImageData, p: PtLike): Pt {
    // `new Pt(4)` + element stores is ~8x faster than the 4-argument
    // constructor path, and out-of-bound reads return the zeroed Pt as before
    const out = new Pt(4);
    if (
      p[0] < 0 ||
      p[1] < 0 ||
      p[0] >= imgData.width ||
      p[1] >= imgData.height
    ) {
      return out;
    }

    const i = Math.floor(p[1]) * (imgData.width * 4) + Math.floor(p[0]) * 4;
    const d = imgData.data;
    if (i > d.length - 4) return out;

    out[0] = d[i];
    out[1] = d[i + 1];
    out[2] = d[i + 2];
    out[3] = d[i + 3];
    return out;
  }

  /**
   * Resize the canvas image. The original image is unchanged until `sync()`.
   * @param sizeOrScale A PtLike array specifying either [x, y] scales or [x, y] sizes.
   * @param asScale If true, treat the first parameter as scales. Otherwise, treat it as specific sizes.
   */
  resize(sizeOrScale: PtLike, asScale: boolean = false): this {
    const hasImage = this._img.naturalWidth > 0;
    // canvas-only images (eg, from `Img.blank`) scale relative to the canvas
    // size, and need a snapshot since `_drawToScale` clears the canvas first
    const refW = hasImage ? this._img.naturalWidth : this._cv.width;
    const refH = hasImage ? this._img.naturalHeight : this._cv.height;
    if (!refW || !refH) {
      Util.warn("Img cannot resize before an image or canvas exists");
      return this;
    }
    const s = asScale
      ? sizeOrScale
      : [sizeOrScale[0] / refW, sizeOrScale[1] / refH];

    let source: HTMLImageElement | HTMLCanvasElement = this._img;
    if (!hasImage) {
      const snap = document.createElement("canvas");
      snap.width = this._cv.width;
      snap.height = this._cv.height;
      snap.getContext("2d")!.drawImage(this._cv, 0, 0);
      source = snap;
    }
    this._drawToScale(s, source);
    this._dataDirty = true;
    return this;
  }

  /**
   * Crop an area of the image.
   * @param box bounding box
   */
  crop(box: Bound): ImageData {
    const s = this._scale;
    return this._ctx.getImageData(
      box[0][0] * s,
      box[0][1] * s,
      box.width * s,
      box.height * s,
    );
  }

  /**
   * Apply filters such as blur and grayscale to the canvas image. The original image is unchanged until `sync()`.
   * @param css a css filter string such as "blur(10px) contrast(200%)". See [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/filter#browser_compatibility) for a list of filter functions.
   */
  filter(css: string): this {
    // "copy" replaces the canvas with the filtered result (the source is
    // snapshotted before compositing) — plain source-over would blend the
    // filtered copy with the original wherever the filter introduces alpha
    const op = this._ctx.globalCompositeOperation;
    this._ctx.globalCompositeOperation = "copy";
    this._ctx.filter = css;
    this._ctx.drawImage(this._cv, 0, 0);
    this._ctx.filter = "none";
    this._ctx.globalCompositeOperation = op;
    this._dataDirty = true;
    return this;
  }

  /**
   * Dispose of the elements, data, and any object URL associated with this Img. Pending loads reject; the instance should not be reused.
   */
  dispose(): this {
    this._disposed = true;
    this._pendingLoadReject?.(new Error("Img has been disposed"));
    this._pendingLoadReject = null;
    if (this._img) {
      this._img.onload = null;
      this._img.onerror = null;
      this._img.removeAttribute("src");
    }
    if (this._objectUrl) {
      URL.revokeObjectURL(this._objectUrl);
      this._objectUrl = null;
    }
    if (this._cv) this._cv.remove();
    if (this._img) this._img.remove();
    this._cv = null!;
    this._ctx = null!;
    this._patternCtx = null!;
    this._img = null!;
    this._data = null!;
    this._loaded = false;
    return this;
  }

  /**
   * Remove the elements and data associated with this Img.
   * @deprecated Use [`Img.dispose`](#link).
   */
  cleanup() {
    this.dispose();
  }

  /**
   * Create a blob url that can be passed to `Img.load`
   * @param blob an image blob such as `new Blob([my_Uint8Array], {type: 'image/png'})`
   * @param editable Specify if you want to manipulate pixels of this image. Default is `false`.
   */
  static fromBlob(
    blob: Blob,
    editable: boolean | ImgOptions = false,
    space?: CanvasSpace,
  ): Promise<Img> {
    const url = URL.createObjectURL(blob);
    const img = new Img(editable, space);
    img._objectUrl = url;
    // the decoded image no longer needs the URL once the load settles;
    // dispose() also guards this
    const done = () => {
      URL.revokeObjectURL(url);
      img._objectUrl = null;
    };
    return img.load(url).then(
      (res) => {
        done();
        return res;
      },
      (err) => {
        done();
        throw err;
      },
    );
  }

  /**
   * Convert ImageData object to a Blob, which you can then create an Img instance via [`Img.fromBlob`](#link). Note that the resulting image's dimensions will not account for pixel density.
   * @param data
   */
  static imageDataToBlob(data: ImageData): Promise<Blob> {
    return new Promise(function (resolve, reject) {
      if (typeof document === "undefined") {
        reject(
          new Error("Cannot create html canvas element. document not found."),
        );
        return;
      }
      let cv = document.createElement("canvas") as HTMLCanvasElement;
      cv.width = data.width;
      cv.height = data.height;
      cv.getContext("2d")!.putImageData(data, 0, 0);
      cv.toBlob((blob) => {
        resolve(blob!);
        cv.remove();
      });
    });
  }

  /**
   * Export current canvas image as base64 string
   */
  toBase64(): string {
    return this._cv.toDataURL();
  }

  /**
   * Export current canvas image as a blob
   */
  toBlob(): Promise<Blob> {
    return new Promise((resolve) => {
      this._cv.toBlob((blob) => resolve(blob!));
    });
  }

  /**
   * Get a CanvasForm for drawing on the internal canvas if this Img is editable
   */
  getForm(): CanvasForm | undefined {
    if (!this._editable) {
      Util.warn("Cannot get a CanvasForm because this Img is not editable");
    }
    return this._ctx ? new CanvasForm(this._ctx) : undefined;
  }

  /**
   * Get current image source. If editable, this will return the canvas, otherwise it will return the original image.
   */
  get current(): CanvasImageSource {
    return this._editable ? this._cv : this._img;
  }

  /**
   * Get the original image
   */
  get image(): HTMLImageElement {
    return this._img;
  }

  /**
   * Get the internal canvas
   */
  get canvas(): HTMLCanvasElement {
    return this._cv;
  }

  /**
   * Get the internal canvas' ImageData
   */
  get data(): ImageData {
    this._ensureData();
    return this._data;
  }

  /**
   * Get the internal canvas' context. You can use this to draw directly on canvas, or create a new [CanvasForm](#link) instance with it.
   */
  get ctx(): RenderingContext2D {
    return this._ctx;
  }

  /**
   * Get whether the image is loaded
   */
  get loaded(): boolean {
    return this._loaded;
  }

  /**
   * Get pixel density scale
   */
  get pixelScale(): number {
    return this._scale;
  }

  /**
   * Get size of the original image
   */
  get imageSize(): Pt {
    if (!this._img || !this._img.width || !this._img.height) {
      return this._cv ? this.canvasSize.$divide(this._scale) : new Pt(0, 0);
    } else {
      return new Pt(this._img.width, this._img.height);
    }
  }

  /**
   * Get size of the canvas
   */
  get canvasSize(): Pt {
    return new Pt(this._cv.width, this._cv.height);
  }

  /**
   * Get a Mat instance with a scale transform based on current `pixelScale`.
   * This can be useful for generating a domMatrix for transforming patterns consistently across different pixel-density screens.
   * @example `img.scaledMatrix.translate2d(...).rotate2D(...).domMatrix`
   */
  get scaledMatrix(): Mat {
    const s = 1 / this._scale;
    return new Mat().scale2D([s, s]);
  }
}
