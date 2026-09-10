/*! Pts.js is licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */

import { MultiTouchSpace } from "./Space";
import { VisualForm, Font } from "./Form";
import { Pt, Group, Bound } from "./Pt";
import { Const, Util } from "./Util";
import { Typography as Typo } from "./Typography";
import { Rectangle } from "./Op";
import { Img } from "./Image";
import {
  type PtLike,
  type GroupLike,
  type RenderingContext2D,
  type DefaultFormStyle,
  type PtLikeIterable,
  type PtIterable,
  type CanvasSpaceOptions,
  type TextMeasure,
  type TextVerticalAlign,
} from "./Types";

/**
 * CanvasSpace is an implementation of the abstract class [`Space`](#link). It represents a space for HTML Canvas.
 * Learn more about the concept of Space in [this guide](../guide/Space-0500.html).
 */
export class CanvasSpace extends MultiTouchSpace {
  protected _canvas: HTMLCanvasElement;
  protected _container!: Element;

  protected _pixelScale = 1;
  protected _bgcolor = "#e1e9f0";
  protected _ctx: CanvasRenderingContext2D;

  protected _offscreen = false;
  protected _offCanvas!: HTMLCanvasElement;
  protected _offCtx!: RenderingContext2D;

  protected _resizeObserver: ResizeObserver | undefined;
  protected _autoResize = true;
  protected _initialResize = false;

  private _readyObserver: MutationObserver | undefined;
  private _readyTimer: number | undefined;
  private _disposed = false;
  private _ownsCanvas = false;
  private _ownsContainer = false;

  /**
   * Create a CanvasSpace which represents a HTML Canvas Space
   * @param elem Specify an element by its "id" attribute as string, or by the element object itself. An element can be an existing `<canvas>`, or a `<div>` container in which a new `<canvas>` will be created. If left empty, a `<div id="pt_container"><canvas id="pt" /></div>` will be added to DOM. Use css to customize its appearance if needed.
   * @param callback an optional callback `function(boundingBox, spaceElement)` to be called when canvas is appended and ready. Alternatively, a "ready" event will also be fired from the `<canvas>` element when it's appended, which can be traced with `spaceInstance.canvas.addEventListener("ready")`
   * @example `new CanvasSpace( "#myElementID" )`
   */
  constructor(
    elem: string | Element | null = "pt",
    callback?: (bound: Bound, elem: EventTarget) => void,
  ) {
    super();

    let _selector: Element | null = null;
    let _existed = false;
    this.id = Util.uniqueId();

    // get selector element depending on whether `elem` is an element id string or an element object
    if (elem instanceof Element) {
      _selector = elem;
      this.id = _selector.id || this.id;
    } else {
      const target = elem || "pt";
      const id = target[0] === "#" || target[0] === "." ? target : "#" + target;
      _selector = document.querySelector(id);
      this.id = id.substr(1);
    }

    // if selector is not defined, create a default canvas
    if (!_selector) {
      this._ownsContainer = true;
      this._container = this._createElement("div", this.id + "_container");
      this._canvas = this._createElement(
        "canvas",
        this.id,
      ) as HTMLCanvasElement;
      document.body.appendChild(this._container);

      // if selector is element but not canvas, create a canvas inside it
    } else if (_selector.nodeName.toLowerCase() != "canvas") {
      this._container = _selector;
      this._canvas = this._createElement(
        "canvas",
        this.id + "_canvas",
      ) as HTMLCanvasElement;
      this._initialResize = true;

      // if selector is an existing canvas
    } else {
      this._canvas = _selector as HTMLCanvasElement;
      this._container = _selector.parentElement!;
      this._autoResize = false;
      _existed = true;
    }

    // store canvas 2d rendering context
    this._ctx = this._canvas.getContext("2d")!;

    // if we created the canvas, add it to the container and observe mutation for readiness
    if (!_existed) {
      this._ownsCanvas = true;
      this._readyObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === "childList" && mutation.addedNodes.length) {
            for (let node of mutation.addedNodes) {
              if (node === this._canvas) {
                this._ready(callback);
                this._readyObserver?.disconnect();
                this._readyObserver = undefined;
                return;
              }
            }
          }
        });
      });

      this._readyObserver.observe(this._container, { childList: true });
      this._container.appendChild(this._canvas);
    } else {
      // Wait one turn for .setup() to be called before firing ready event
      this._readyTimer = window.setTimeout(() => this._ready(callback), 100);
    }
  }

  /**
   * Helper function to create a DOM element
   * @param elem element tag name
   * @param id element id attribute
   */
  protected _createElement(elem = "div", id: string) {
    const d = document.createElement(elem);
    d.setAttribute("id", id);
    return d;
  }

  /**
   * Handle callbacks after element is mounted in DOM
   * @param callback
   */
  private _ready(callback?: (bound: Bound, elem: EventTarget) => void) {
    if (this._disposed) return;

    this._readyTimer = undefined;
    if (!this._container)
      throw new Error(`Cannot initiate #${this.id} element`);

    this._isReady = true;

    this._resizeHandler(null);

    this.clear(this._bgcolor);
    this._canvas.dispatchEvent(new Event("ready"));

    for (const k in this.players) {
      if (this.players.hasOwnProperty(k)) {
        if (this.players[k].start)
          this.players[k].start(this.bound.clone(), this);
      }
    }

    this._pointer = this.center;
    this._initialResize = false; // unset

    if (callback) callback(this.bound, this._canvas);
  }

  /**
   * Set up various options for CanvasSpace. The `opt` parameter is an object with the following fields. This is usually set during instantiation, eg `new CanvasSpace(...).setup( { opt } )`
   * @param opt a [`CanvasSpaceOptions`](#link) object with optional settings, ie `{ bgcolor:string, resize:boolean, retina:boolean, offscreen:boolean, pixelDensity:number }`. Note that omitting `bgcolor` sets a transparent background (a long-standing behavior that differs from `DOMSpace.setup`, which keeps the current background when the option is absent).
   * @example `space.setup({ bgcolor: "#f00", retina: true, resize: true })`
   */
  setup(opt: CanvasSpaceOptions): this {
    this._bgcolor = opt.bgcolor ? opt.bgcolor : "transparent";

    this.autoResize = opt.resize != undefined ? opt.resize : false;

    if (opt.retina !== false) {
      const r1 = window ? window.devicePixelRatio || 1 : 1;
      this._pixelScale = Math.max(1, r1);
    }

    if (opt.offscreen) {
      this._offscreen = true;
      this._offCanvas = this._createElement(
        "canvas",
        this.id + "_offscreen",
      ) as HTMLCanvasElement;
      this._offCtx = this._offCanvas.getContext("2d")!;
    } else {
      this._offscreen = false;
    }

    if (opt.pixelDensity) {
      this._pixelScale = opt.pixelDensity;
    }

    return this;
  }

  /**
   * Set whether the canvas element should resize when its container is resized.
   * @param auto a boolean value indicating if auto size is set
   */
  set autoResize(auto) {
    if (this._autoResize === auto && (!auto || this._resizeObserver)) return;

    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = undefined;
    }

    this._autoResize = auto;

    if (auto) {
      this._resizeObserver = new ResizeObserver((entries) => {
        this._resizeHandler(null);
      });
      this._resizeObserver.observe(this._container);
    }
  }
  get autoResize(): boolean {
    return this._autoResize;
  }

  /**
   * This overrides Space's `resize` function. It's used as a callback function for window's resize event and not usually called directly. You can keep track of resize events with `resize: (bound ,evt)` callback in your player objects.
   * @param b a Bound object to resize to
   * @param evt Optionally pass a resize event
   * @see Space.add
   */
  resize(b: Bound, evt?: Event | null): this {
    this.bound = b;

    // The buffer needs whole device pixels, so round up to cover the bound.
    this._canvas.width = Math.ceil(this.bound.size.x) * this._pixelScale;
    this._canvas.height = Math.ceil(this.bound.size.y) * this._pixelScale;
    // The CSS size must not round up: a canvas even a fraction of a pixel
    // larger than its container overflows it, and on systems whose scrollbars
    // take up layout space that summons scrollbars, shrinking the container —
    // which the resize observer answers by shrinking the canvas, letting the
    // scrollbars retract, growing the container again, and so on forever. The
    // oscillation clears the canvas on every pass (it looks blank) and the
    // endless relayout can eventually crash the tab.
    this._canvas.style.width = this.bound.size.x + "px";
    this._canvas.style.height = this.bound.size.y + "px";

    if (this._offscreen) {
      this._offCanvas.width = Math.ceil(this.bound.size.x) * this._pixelScale;
      this._offCanvas.height = Math.ceil(this.bound.size.y) * this._pixelScale;
      // this._offCanvas.style.width = Math.floor(this.bound.size.x) + "px";
      // this._offCanvas.style.height = Math.floor(this.bound.size.y) + "px";
    }

    if (this._pixelScale != 1) {
      this._ctx.scale(this._pixelScale, this._pixelScale);

      if (this._offscreen) {
        this._offCtx.scale(this._pixelScale, this._pixelScale);
      }
    }

    // Assigning canvas width/height resets the context's entire state to
    // defaults, so any cached style values no longer describe the context —
    // without this, a form's style write matching the stale cache would be
    // skipped and the context would stay at its black defaults.
    CanvasForm.resetStyleCache(this._ctx);
    if (this._offscreen) CanvasForm.resetStyleCache(this._offCtx);

    for (const k in this.players) {
      if (this.players.hasOwnProperty(k)) {
        const p = this.players[k];
        if (p.resize) p.resize(this.bound, evt);
      }
    }

    this.render(this._ctx);

    // if it's a valid resize event and space is not playing, repaint the canvas once
    if (evt && !this.isPlaying) this.playOnce(0);

    return this;
  }

  /**
   * Window resize handling
   * @param evt
   */
  protected _resizeHandler(evt: Event | null) {
    const b =
      this._autoResize || this._initialResize
        ? this._container.getBoundingClientRect()
        : this._canvas.getBoundingClientRect();

    if (b) {
      const box = Bound.fromBoundingRect(b);

      // Need to compute offset from window scroll. See outerBound calculation in Space's _mouseAction
      box.center = box.center.add(window?.scrollX || 0, window?.scrollY || 0);
      this.resize(box, evt);
    }
  }

  /**
  * Set a background color for this canvas. Alternatively, you may use `clear()` function.
  @param bg background color as hex or rgba string
  */
  set background(bg: string) {
    this._bgcolor = bg;
  }
  get background(): string {
    return this._bgcolor;
  }

  /**
   * `pixelScale` property returns a number that let you determine if the screen is "retina" (when value >= 2)
   */
  public get pixelScale(): number {
    return this._pixelScale;
  }

  /**
   * Check if an offscreen canvas is created
   */
  public get hasOffscreen(): boolean {
    return this._offscreen;
  }

  /**
   * Get the rendering context of offscreen canvas (if created via `setup()`)
   */
  public get offscreenCtx(): RenderingContext2D {
    return this._offCtx;
  }

  /**
   * Get the offscreen canvas element
   */
  public get offscreenCanvas(): HTMLCanvasElement {
    return this._offCanvas;
  }

  /**
   * Get a new `CanvasForm` for drawing
   * @see `CanvasForm`
   */
  public getForm(): CanvasForm {
    return new CanvasForm(this);
  }

  /**
   * Get the html canvas element
   */
  get element(): HTMLCanvasElement {
    return this._canvas;
  }

  /**
   * Get the parent element that contains the canvas element
   */
  get parent(): Element {
    return this._container;
  }

  /**
   * A property to indicate if the Space is ready
   */
  get ready(): boolean {
    return this._isReady;
  }

  /**
   * Get the rendering context of canvas
   * @example `form.ctx.clip()`
   */
  public get ctx(): CanvasRenderingContext2D {
    return this._ctx;
  }

  /**
   * Clear the canvas with its background color. Overrides Space's `clear` function.
   * @param bg Optionally specify a custom background color in hex or rgba string, or "transparent". If not defined, it will use its `bgcolor` property as background color to clear the canvas.
   */
  clear(bg?: string): this {
    if (bg) this._bgcolor = bg;
    const lastColor = this._ctx.fillStyle;
    const px = Math.ceil(this.pixelScale);

    if (!this._bgcolor || this._bgcolor === "transparent") {
      this._ctx.clearRect(
        -px,
        -px,
        this._canvas.width + px,
        this._canvas.height + px,
      );
    } else {
      // semi-transparent bg needs to be cleared first
      if (
        this._bgcolor.indexOf("rgba") === 0 ||
        (this._bgcolor.length === 9 && this._bgcolor.indexOf("#") === 0)
      ) {
        this._ctx.clearRect(
          -px,
          -px,
          this._canvas.width + px,
          this._canvas.height + px,
        );
      }
      this._ctx.fillStyle = this._bgcolor;
      this._ctx.fillRect(
        -px,
        -px,
        this._canvas.width + px,
        this._canvas.height + px,
      );
    }

    this._ctx.fillStyle = lastColor;
    return this;
  }

  /**
   * Similiar to `clear()` but clear the offscreen canvas instead
   * @param bg Optionally specify a custom background color in hex or rgba string, or "transparent". If not defined, it will use its `bgcolor` property as background color to clear the canvas.
   */
  clearOffscreen(bg?: string | null): this {
    if (this._offscreen) {
      const px = Math.ceil(this.pixelScale);
      if (bg) {
        this._offCtx.fillStyle = bg;
        this._offCtx.fillRect(
          -px,
          -px,
          this._canvas.width + px,
          this._canvas.height + px,
        );
      } else {
        this._offCtx.clearRect(
          -px,
          -px,
          this._offCanvas.width + px,
          this._offCanvas.height + px,
        );
      }
    }
    return this;
  }

  /**
   * Main animation function.
   * @param time current time
   */
  protected playItems(time: number) {
    if (this._isReady) {
      this._ctx.save();
      if (this._offscreen) this._offCtx.save();
      super.playItems(time);
      this._ctx.restore();
      if (this._offscreen) this._offCtx.restore();
      // restore() reverted the context's style state without going through the
      // forms' style cache, so the cached values no longer describe the context
      CanvasForm.resetStyleCache(this._ctx);
      if (this._offscreen) CanvasForm.resetStyleCache(this._offCtx);
      this.render(this._ctx);
    }
  }

  /**
   * Dispose of browser resources held by this space and remove all players. Call this before unmounting the canvas.
   */
  dispose(): this {
    if (this._disposed) return this;
    this._disposed = true;

    if (this._readyTimer !== undefined) {
      window.clearTimeout(this._readyTimer);
      this._readyTimer = undefined;
    }
    if (this._readyObserver) {
      this._readyObserver.disconnect();
      this._readyObserver = undefined;
    }
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = undefined;
    }

    this._unbindAll();
    this._cancelAnimation();
    this.removeAll();
    this._isReady = false;
    if (this._ownsCanvas) this._canvas.remove();
    if (this._ownsContainer && this._container.childNodes.length === 0)
      this._container.remove();

    return this;
  }

  /**
   * Get a [`MediaRecorder`](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder) to record the current CanvasSpace. You can then call its `start()` function to start recording, and `stop()` to either download the video file or handle the blob data in the callback function you provided.
   * @param downloadOrCallback Either `true` to download the video, or provide a callback function to handle the Blob data, when recording is completed.
   * @param filetype video format. Default is "webm".
   * @param bitrate bitrate per second
   * @example `let rec = space.recorder(true); rec.start(); setTimeout( () => rec.stop(), 5000); // record 5s of video and download the file`
   */
  recorder(
    downloadOrCallback: boolean | ((blobURL: string) => {}),
    filetype: string = "webm",
    bitrate: number = 15000000,
  ): MediaRecorder {
    const stream = this._canvas.captureStream();
    const recorder = new MediaRecorder(stream, {
      mimeType: `video/${filetype}`,
      bitsPerSecond: bitrate,
    });

    recorder.ondataavailable = function (d) {
      const url = URL.createObjectURL(
        new Blob([d.data], { type: `video/${filetype}` }),
      );

      if (typeof downloadOrCallback === "function") {
        downloadOrCallback(url);
      } else if (downloadOrCallback) {
        const a = document.createElement("a");
        a.href = url;
        a.download = `canvas_video.${filetype}`;
        a.click();
        a.remove();
        // the download has started from the blob by now; release the URL
        // (callback consumers own the URL and release it themselves)
        setTimeout(() => URL.revokeObjectURL(url), 100);
      }
    };

    return recorder;
  }
}

/**
 * CanvasForm is an implementation of abstract class [`VisualForm`](#link). It provide methods to express Pts on [`CanvasSpace`](#link).
 * You may extend CanvasForm to implement your own expressions for CanvasSpace.
 */
// Last-written style values per rendering context, so identical values are
// not re-applied (color parsing in particular is costly). Keyed by context —
// not by form — because multiple forms can share one context (see `reset()`),
// and a per-form cache would skip writes another form made stale.
const _ctxStyleCache = new WeakMap<object, Record<string, unknown>>();

export class CanvasForm<
  S extends MultiTouchSpace = CanvasSpace,
> extends VisualForm {
  protected _space!: CanvasSpace;
  protected _ctx!: RenderingContext2D;
  protected _estimateTextWidth: TextMeasure | undefined;
  protected _estimateMode: "sample" | "char" | undefined;

  // the shared cache object for this._ctx, revalidated only when the context
  // changes so the hot path avoids a WeakMap lookup per style write
  private _styleCache: Record<string, unknown> | null = null;
  private _styleCacheCtx: RenderingContext2D | null = null;

  /** Get the style cache shared by all forms drawing on this context. */
  protected _cacheForCtx(): Record<string, unknown> {
    if (this._styleCacheCtx !== this._ctx) {
      let cache = _ctxStyleCache.get(this._ctx);
      if (!cache) {
        cache = {};
        _ctxStyleCache.set(this._ctx, cache);
      }
      this._styleCache = cache;
      this._styleCacheCtx = this._ctx;
    }
    return this._styleCache!;
  }

  /**
   * Forget the cached style values for a rendering context, so every
   * subsequent style write applies. Call this after anything that resets or
   * desyncs a context's state outside a form — most commonly assigning a
   * canvas's `width` or `height`, which resets the context to its defaults.
   * (Within a form, [`CanvasForm.reset`](#link) is the equivalent recovery.)
   * @param ctx the rendering context to forget
   */
  static resetStyleCache(ctx: RenderingContext2D | object): void {
    // clear the shared object in place: forms cache a reference to it, so
    // deleting the WeakMap entry would leave them holding stale values
    const cache = _ctxStyleCache.get(ctx);
    if (cache) {
      for (const k in cache) delete cache[k];
    }
  }

  /**
   * Write a context style property only when it differs from the last value
   * written to this context. After setting style properties directly on
   * [`CanvasForm.ctx`](#link), call [`CanvasForm.reset`](#link) to resync.
   */
  protected _set(key: string, value: unknown): void {
    const cache = this._cacheForCtx();
    if (cache[key] !== value) {
      cache[key] = value;
      (this._ctx as any)[key] = value;
    }
  }

  /**
   * store common styles so that they can be restored to canvas context when using multiple forms. See `reset()`.
   */
  protected _style: DefaultFormStyle = {
    fillStyle: "#f03",
    strokeStyle: "#fff",
    lineWidth: 1,
    lineJoin: "bevel",
    lineCap: "butt",
    globalAlpha: 1,
  };

  /**
   * Create a new CanvasForm. You may also use [`CanvasSpace.getForm()`](#link) to get the default form.
   * @param space an instance of CanvasSpace, or a rendering context. Passing a context is the
   * renderer extension point: any object implementing the context surface documented in
   * [`SVGContext2D`](#link) (the reference implementation) receives this form's full drawing
   * API — this is how SVG output works, and how custom renderers can be built.
   */
  constructor(space?: CanvasSpace | RenderingContext2D) {
    super();

    // allow for undefined context to support custom contexts via subclassing.
    if (!space) return this;

    const _setup = (ctx: RenderingContext2D) => {
      this._ctx = ctx;
      this._set("fillStyle", this._style.fillStyle);
      this._set("strokeStyle", this._style.strokeStyle);
      this._set("lineJoin", "bevel");
      this._set("font", this._font.value);
      this._ready = true;
    };

    if (space instanceof CanvasSpace) {
      this._space = space;
      if (this._space.ready && this._space.ctx) {
        _setup(this._space.ctx);
      } else {
        this._space.add({
          start: () => {
            _setup(this._space.ctx);
          },
        });
      }
    } else {
      _setup(space);
    }
  }

  /**
   * get the CanvasSpace instance that this form is associated with
   */
  get space(): S {
    // subclasses for other backends (eg, SVGForm) narrow S to their own space type
    return this._space as unknown as S;
  }

  /**
   * Get the rendering context of canvas to perform other canvas functions.
   * @example `form.ctx.clip()`
   */
  get ctx(): RenderingContext2D {
    return this._ctx;
  }

  /**
   * Toggle whether to draw on offscreen canvas (if offscreen is set in CanvasSpace)
   * @param off if `true`, draw on offscreen canvas instead of the visible canvas. Default is `true`
   * @param clear optionally provide a valid color string to fill a bg color. see CanvasSpace's `clearOffscreen` function.
   */
  useOffscreen(off: boolean = true, clear: boolean | string = false) {
    if (clear)
      this._space.clearOffscreen(typeof clear == "string" ? clear : null);
    this._ctx =
      this._space.hasOffscreen && off
        ? this._space.offscreenCtx
        : this._space.ctx;
    return this;
  }

  /**
   * Render the offscreen canvas's content on the visible canvas
   * @param offset Optional offset on the top-left position when drawing on the visible canvas
   */
  renderOffscreen(offset: PtLike = [0, 0]) {
    if (this._space.hasOffscreen) {
      this._space.ctx.drawImage(
        this._space.offscreenCanvas,
        offset[0],
        offset[1],
        this._space.width,
        this._space.height,
      );
    }
  }

  /**
   * Set current alpha value.
   * @example `form.alpha(0.6)`
   * @param a alpha value between 0 and 1
   */
  alpha(a: number): this {
    this._set("globalAlpha", a);
    this._style.globalAlpha = a;
    return this;
  }

  /**
   * Set current fill style. Provide a valid color string such as `"#FFF"` or `"rgba(255,0,100,0.5)"` or `false` to specify no fill color.
   * @example `form.fill("#F90")`, `form.fill("rgba(0,0,0,.5")`, `form.fill(false)`
   * @param c fill color which can be as color, gradient, or pattern. (See [canvas documentation](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillStyle))
   */
  fill(c: string | boolean | CanvasGradient | CanvasPattern): this {
    if (typeof c == "boolean") {
      this.filled = c;
    } else {
      this.filled = true;
      this._style.fillStyle = c;
      this._set("fillStyle", c);
    }
    return this;
  }

  /**
   * Set current fill style and remove stroke style.
   * @param c fill color which can be as color, gradient, or pattern. (See [canvas documentation](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillStyle))
   */
  fillOnly(c: string | boolean | CanvasGradient | CanvasPattern): this {
    this.stroke(false);
    return this.fill(c);
  }

  /**
   * Set current stroke style. Provide a valid color string or `false` to specify no stroke color.
   * @example `form.stroke("#F90")`, `form.stroke("rgba(0,0,0,.5")`, `form.stroke(false)`, `form.stroke("#000", 0.5, 'round', 'square')`
   * @param c stroke color which can be as color, gradient, or pattern. (See [canvas documentation](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/strokeStyle))
   * @param width Optional value (can be floating point) to set line width
   * @param linejoin Optional string to set line joint style. Can be "miter", "bevel", or "round".
   * @param linecap Optional string to set line cap style. Can be "butt", "round", or "square".
   */
  stroke(
    c: string | boolean | CanvasGradient | CanvasPattern,
    width?: number,
    linejoin?: CanvasLineJoin,
    linecap?: CanvasLineCap,
  ): this {
    if (typeof c == "boolean") {
      this.stroked = c;
    } else {
      this.stroked = true;
      this._style.strokeStyle = c;
      this._set("strokeStyle", c);
      if (width) {
        this._set("lineWidth", width);
        this._style.lineWidth = width;
      }
      if (linejoin) {
        this._set("lineJoin", linejoin);
        this._style.lineJoin = linejoin;
      }
      if (linecap) {
        this._set("lineCap", linecap);
        this._style.lineCap = linecap;
      }
    }
    return this;
  }

  /**
   * Set stroke style and remove fill style.
   * @param c stroke color which can be as color, gradient, or pattern. (See [canvas documentation](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/strokeStyle))
   * @param width Optional value (can be floating point) to set line width
   * @param linejoin Optional string to set line joint style. Can be "miter", "bevel", or "round".
   * @param linecap Optional string to set line cap style. Can be "butt", "round", or "square".
   */
  strokeOnly(
    c: string | boolean | CanvasGradient | CanvasPattern,
    width?: number,
    linejoin?: CanvasLineJoin,
    linecap?: CanvasLineCap,
  ): this {
    this.fill(false);
    return this.stroke(c, width, linejoin, linecap);
  }

  /**
   * A convenient function to apply fill and/or stroke after custom drawings using canvas context (eg, `form.ctx.ellipse(...)`).
   * You don't need to call this function if you're using Pts' drawing functions like `form.point` or `form.rect`
   * @param filled apply fill when set to `true`
   * @param stroked apply stroke when set to `true`
   * @param strokeWidth optionally set a stroke width
   * @example `form.ctx.beginPath(); form.ctx.ellipse(...); form.applyFillStroke();`
   */
  applyFillStroke(
    filled: boolean | string = true,
    stroked: boolean | string = true,
    strokeWidth: number = 1,
  ) {
    if (filled) {
      if (typeof filled === "string") this.fill(filled);
      this._ctx.fill();
    }

    if (stroked) {
      if (typeof stroked === "string") this.stroke(stroked, strokeWidth);
      this._ctx.stroke();
    }

    return this;
  }

  /**
   * This function takes an array of gradient colors, and returns a function to define the areas of the gradient fill. See demo code in [CanvasForm.gradient](https://ptsjs.org/demo/?name=canvasform.textBox).
   * @param stops an array of gradient stops. This can be an array of colors `["#f00", "#0f0", ...]` for evenly distributed gradient, or an array of [stop, color] like `[[0.1, "#f00"], [0.7, "#0f0"]]`
   * @returns a function that takes 1 or 2 `Group` as parameters. Use a single `Group` to specify a rectangular area for linear gradient, or use 2 `Groups` to specify 2 `Circles` for radial gradient.
   * @example `c1 = Circle.fromCenter(...); grad = form.gradient(["#f00", "#00f"]); form.fill( grad( c1, c2 ) ).circle( c1 )`
   */
  gradient(
    stops: [number, string][] | string[],
  ): (area1: GroupLike, area2?: GroupLike) => CanvasGradient {
    const vals: [number, string][] = [];
    // copy before padding so the caller's array is never mutated
    if (stops.length < 2) {
      stops = [...stops, [0.99, "#000"], [1, "#000"]] as
        [number, string][] | string[];
    }

    for (let i = 0, len = stops.length; i < len; i++) {
      const t: number =
        typeof stops[i] === "string"
          ? i * (1 / (stops.length - 1))
          : (stops[i][0] as number);
      const v: string =
        typeof stops[i] === "string"
          ? (stops[i] as string)
          : (stops[i][1] as string);
      vals.push([t, v]);
    }

    return (area1: GroupLike, area2?: GroupLike) => {
      const grad = area2
        ? this._ctx.createRadialGradient(
            area1[0][0],
            area1[0][1],
            Math.abs(area1[1][0]),
            area2[0][0],
            area2[0][1],
            Math.abs(area2[1][0]),
          )
        : this._ctx.createLinearGradient(
            area1[0][0],
            area1[0][1],
            area1[1][0],
            area1[1][1],
          );

      for (let i = 0, len = vals.length; i < len; i++) {
        grad.addColorStop(vals[i][0], vals[i][1]);
      }

      return grad;
    };
  }

  /**
   * Set composite operation (also known as blend mode). You can also call this function without parameters to get back to default 'source-over' mode. See [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation) for the full list of operations you can use.
   * @param mode a composite operation such as 'lighten', 'multiply', 'overlay', and 'color-burn'.
   */
  composite(mode: GlobalCompositeOperation = "source-over"): this {
    this._set("globalCompositeOperation", mode);
    return this;
  }

  /**
   * Create a clipping mask from the current path. See [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/clip) for details.
   */
  clip(): this {
    this._ctx.clip();
    return this;
  }

  /**
   * Activate dashed stroke and set dash style. You can customize the segments and offset.
   * @example `form.dash()`, `form.dash([5, 10])`, `form.dash([5, 5], 5)`, `form.dash(false)`
   * @param segments Dash segments. Defaults to `true` which corresponds to `[5, 5]`. Pass `false` to deactivate dashes. (See [canvas documentation](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setLineDash))
   * @param offset Dash offset. Defaults to 0. (See [canvas documentation](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineDashOffset)
   */
  dash(segments: PtLike | boolean = true, offset: number = 0): this {
    // dedupe via a compact key since getLineDash() allocates
    const cache = this._cacheForCtx();
    if (segments === false || (segments !== true && segments.length === 0)) {
      // false or [], deactivate dashed strokes
      if (cache.dash !== "/0") {
        cache.dash = "/0";
        this._ctx.setLineDash([]);
        this._ctx.lineDashOffset = 0;
      }
    } else {
      const seg: PtLike = segments === true ? [5, 5] : segments;
      const key = `${Array.prototype.join.call(seg, ",")}/${offset}`;
      if (cache.dash !== key) {
        cache.dash = key;
        this._ctx.setLineDash(seg as number[]);
        this._ctx.lineDashOffset = offset;
      }
    }
    return this;
  }

  /**
   * Set the current font.
   * @param sizeOrFont either a number to specify font-size, or a `Font` object to specify all font properties
   * @param weight Optional font-weight string such as "bold"
   * @param style Optional font-style string such as "italic"
   * @param lineHeight Optional line-height number suchas 1.5
   * @param family Optional font-family such as "Helvetica, sans-serif"
   * @example `form.font( myFont )`, `form.font(14, "bold")`
   */
  font(
    sizeOrFont: number | Font,
    weight?: string,
    style?: string,
    lineHeight?: number,
    family?: string,
  ): this {
    if (typeof sizeOrFont == "number") {
      this._font.size = sizeOrFont;
      if (family) this._font.face = family;
      if (weight) this._font.weight = weight;
      if (style) this._font.style = style;
      if (lineHeight) this._font.lineHeight = lineHeight;
    } else {
      this._font = sizeOrFont;
    }

    this._set("font", this._font.value);

    // If using estimate, reapply the same mode with the new font's metrics.
    if (this._estimateMode) this.fontWidthEstimate(this._estimateMode);

    return this;
  }

  /**
   * Set whether to use html canvas' [`measureText`](#link) function, or a faster but less accurate estimate.
   * @param estimate `false` to use ctx.measureText; `true` or `"sample"` to use a sampled-average estimator (fastest); `"char"` to use a per-character width cache (nearly as accurate as measureText for most texts, and much faster after warmup)
   */
  fontWidthEstimate(estimate: boolean | "sample" | "char" = true): this {
    if (!estimate) {
      this._estimateMode = undefined;
      this._estimateTextWidth = undefined;
    } else {
      const measure: TextMeasure = (c: string) =>
        this._ctx.measureText(c).width;
      this._estimateMode = estimate === true ? "sample" : estimate;
      this._estimateTextWidth =
        this._estimateMode === "char"
          ? Typo.charWidthCache(measure)
          : Typo.textWidthEstimator(measure);
    }
    return this;
  }

  /**
   * Get the width of this text. It will return an actual measurement or an estimate based on [`fontWidthEstimate`](#link) setting. Default is an actual measurement using canvas context's measureText.
   * @param c a string of text contents
   */
  getTextWidth(c: string): number {
    return !this._estimateTextWidth
      ? this._ctx.measureText(c).width
      : this._estimateTextWidth(c);
  }

  /**
   * Truncate text to fit width.
   * @param str text to truncate
   * @param width width to fit
   * @param tail text to indicate overflow such as "...". Default is empty "".
   */
  protected _textTruncate(
    str: string,
    width: number,
    tail: string = "",
    hint?: number,
  ): [string, number] {
    return Typo.truncate(this.getTextWidth.bind(this), str, width, tail, hint);
  }

  /**
   * Align text within a rectangle box.
   * @param box a Group or an Iterable<PtLike> that defines a rectangular box
   * @param vertical a string that specifies the vertical alignment in the box: "top", "bottom", "middle", "start", "end"
   * @param offset Optional offset from the edge (like padding)
   * @param center Optional center position
   */
  protected _textAlign(
    box: PtLikeIterable,
    vertical: TextVerticalAlign,
    offset?: PtLike,
    center?: Pt,
  ): Pt | undefined {
    const _box = Util.iterToArray(box);
    if (!Util.arrayCheck(_box)) return;

    if (!center) center = Rectangle.center(_box);

    let px = _box[0][0];
    if (this._ctx.textAlign == "end" || this._ctx.textAlign == "right") {
      px = _box[1][0];
    } else if (
      this._ctx.textAlign == "center" ||
      // @ts-expect-error CanvasTextAlign omits the legacy "middle" value supported here.
      this._ctx.textAlign == "middle"
    ) {
      px = center[0];
    }

    let py = center[1];
    if (vertical == "top" || vertical == "start") {
      py = _box[0][1];
    } else if (vertical == "end" || vertical == "bottom") {
      py = _box[1][1];
    }

    return offset ? new Pt(px + offset[0], py + offset[1]) : new Pt(px, py);
  }

  /**
   * Reset the rendering context's common styles to this form's styles. This supports using multiple forms on the same canvas context.
   */
  reset(): this {
    // force-write and resync the cache — this is the documented recovery
    // point after styles were set directly on the context
    const cache = this._cacheForCtx();
    for (const k in this._style) {
      if (this._style.hasOwnProperty(k)) {
        (this._ctx as any)[k] = (this._style as any)[k];
        cache[k] = (this._style as any)[k];
      }
    }
    // same default as a fresh VisualForm (14px sans-serif)
    this._font = new Font(14, "sans-serif");
    this._ctx.font = this._font.value;
    cache.font = this._font.value;
    return this;
  }

  protected _paint() {
    if (this._filled) this._ctx.fill();
    if (this._stroked) this._ctx.stroke();
  }

  /**
   * A static function to draw a point.
   * @param ctx canvas rendering context
   * @param p a Pt object
   * @param radius radius of the point. Default is 5.
   * @param shape The shape of the point. Defaults to "square", but it can be "circle" or a custom shape function in your own implementation.
   * @example `form.point( p )`, `form.point( p, 10, "circle" )`
   */
  static point(
    ctx: RenderingContext2D,
    p: PtLike,
    radius: number = 5,
    shape: string = "square",
  ) {
    if (!p) return;
    if (!(CanvasForm as any)[shape])
      throw new Error(`${shape} is not a static function of CanvasForm`);
    (CanvasForm as any)[shape](ctx, p, radius);
  }

  /**
   * Draws a point.
   * @param p a Pt object
   * @param radius radius of the point. Default is 5.
   * @param shape The shape of the point. Defaults to "square", but it can be "circle" or a custom shape function in your own implementation.
   * @example `form.point( p )`, `form.point( p, 10, "circle" )`
   */
  point(p: PtLike, radius: number = 5, shape: string = "square"): this {
    CanvasForm.point(this._ctx, p, radius, shape);
    this._paint();
    return this;
  }

  /**
   * A static function to draw a circle.
   * @param ctx canvas rendering context
   * @param pt center position of the circle
   * @param radius radius of the circle
   */
  static circle(ctx: RenderingContext2D, pt: PtLike, radius: number = 10) {
    if (!pt) return;
    ctx.beginPath();
    ctx.arc(pt[0], pt[1], radius, 0, Const.two_pi, false);
    ctx.closePath();
  }

  /**
   * Draw a circle. See also [`Circle.fromCenter`](#link)
   * @param pts usually a Group or an Iterable<PtLike> with 2 Pt, but it can also take an array of two numeric arrays [ [position], [size] ]
   */
  circle(pts: PtLikeIterable): this {
    const p = Util.iterToArray(pts);
    CanvasForm.circle(this._ctx, p[0], p[1][0]);
    this._paint();
    return this;
  }

  /**
   * A static function to draw an ellipse.
   * @param ctx canvas rendering context
   * @param pt center position
   * @param radius radius [x, y] of the ellipse
   * @param rotation rotation of the ellipse in radian. Default is 0.
   * @param startAngle start angle of the ellipse. Default is 0.
   * @param endAngle end angle of the ellipse. Default is 2 PI.
   * @param cc an optional boolean value to specify if it should be drawn clockwise (`false`) or counter-clockwise (`true`). Default is clockwise.
   */
  static ellipse(
    ctx: RenderingContext2D,
    pt: PtLike,
    radius: PtLike,
    rotation: number = 0,
    startAngle: number = 0,
    endAngle: number = Const.two_pi,
    cc: boolean = false,
  ) {
    if (!pt || !radius) return;
    ctx.beginPath();
    ctx.ellipse(
      pt[0],
      pt[1],
      radius[0],
      radius[1],
      rotation,
      startAngle,
      endAngle,
      cc,
    );
  }

  /**
   * Draw an ellipse.
   * @param pt center position
   * @param radius radius [x, y] of the ellipse
   * @param rotation rotation of the ellipse in radian. Default is 0.
   * @param startAngle start angle of the ellipse. Default is 0.
   * @param endAngle end angle of the ellipse. Default is 2 PI.
   * @param cc an optional boolean value to specify if it should be drawn clockwise (`false`) or counter-clockwise (`true`). Default is clockwise.
   */
  ellipse(
    pt: PtLike,
    radius: PtLike,
    rotation: number = 0,
    startAngle: number = 0,
    endAngle: number = Const.two_pi,
    cc: boolean = false,
  ) {
    CanvasForm.ellipse(
      this._ctx,
      pt,
      radius,
      rotation,
      startAngle,
      endAngle,
      cc,
    );
    this._paint();
    return this;
  }

  /**
   * A static function to draw an arc.
   * @param ctx canvas rendering context
   * @param pt center position
   * @param radius radius of the arc circle
   * @param startAngle start angle of the arc
   * @param endAngle end angle of the arc
   * @param cc an optional boolean value to specify if it should be drawn clockwise (`false`) or counter-clockwise (`true`). Default is clockwise.
   */
  static arc(
    ctx: RenderingContext2D,
    pt: PtLike,
    radius: number,
    startAngle: number,
    endAngle: number,
    cc?: boolean,
  ) {
    if (!pt) return;
    ctx.beginPath();
    ctx.arc(pt[0], pt[1], radius, startAngle, endAngle, cc);
  }

  /**
   * Draw an arc.
   * @param pt center position
   * @param radius radius of the arc circle
   * @param startAngle start angle of the arc
   * @param endAngle end angle of the arc
   * @param cc an optional boolean value to specify if it should be drawn clockwise (`false`) or counter-clockwise (`true`). Default is clockwise.
   */
  arc(
    pt: PtLike,
    radius: number,
    startAngle: number,
    endAngle: number,
    cc?: boolean,
  ): this {
    CanvasForm.arc(this._ctx, pt, radius, startAngle, endAngle, cc);
    this._paint();
    return this;
  }

  /**
   * A static function to draw a square.
   * @param ctx canvas rendering context
   * @param pt center position of the square
   * @param halfsize half size of the square
   */
  static square(ctx: RenderingContext2D, pt: PtLike, halfsize: number) {
    if (!pt) return;
    const x1 = pt[0] - halfsize;
    const y1 = pt[1] - halfsize;
    const x2 = pt[0] + halfsize;
    const y2 = pt[1] + halfsize;

    // faster than using `rect`
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1, y2);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x2, y1);
    ctx.closePath();
  }

  /**
   * Draw a square, given a center and its half-size.
   * @param pt center Pt
   * @param halfsize half-size
   */
  square(pt: PtLike, halfsize: number) {
    CanvasForm.square(this._ctx, pt, halfsize);
    this._paint();
    return this;
  }

  /**
   * A static function to draw a line or polyline.
   * @param ctx canvas rendering context
   * @param pts a Group or an Iterable<PtLike> representing a line
   */
  static line(ctx: RenderingContext2D, pts: PtLikeIterable) {
    if (!Util.arrayCheck(pts)) return;
    ctx.beginPath();
    let i = 0;
    if (Array.isArray(pts)) {
      // indexed fast path — inputs are nearly always Groups (Array subclass)
      for (let k = 0, len = pts.length; k < len; k++) {
        const it = pts[k];
        if (it) {
          if (i++ > 0) {
            ctx.lineTo(it[0], it[1]);
          } else {
            ctx.moveTo(it[0], it[1]);
          }
        }
      }
    } else {
      for (const it of pts) {
        if (it) {
          if (i++ > 0) {
            ctx.lineTo(it[0], it[1]);
          } else {
            ctx.moveTo(it[0], it[1]);
          }
        }
      }
    }
  }

  /**
   * Draw a line or polyline.
   * @param pts a Group or an Iterable<PtLike> representing a line
   */
  line(pts: PtLikeIterable): this {
    CanvasForm.line(this._ctx, pts);
    this._paint();
    return this;
  }

  /**
   * A static function to draw a polygon.
   * @param ctx canvas rendering context
   * @param pts a Group or an Iterable<PtLike> representing a polygon
   */
  static polygon(ctx: RenderingContext2D, pts: PtLikeIterable) {
    if (!Util.arrayCheck(pts)) return;
    CanvasForm.line(ctx, pts);
    ctx.closePath();
  }

  /**
   * Draw a polygon.
   * @param pts a Group or an Iterable<PtLike> representingg a polygon
   */
  polygon(pts: PtLikeIterable): this {
    CanvasForm.polygon(this._ctx, pts);
    this._paint();
    return this;
  }

  /**
   * A static function to draw a rectangle.
   * @param ctx canvas rendering context
   * @param pts a Group or an Iterable<PtLike> with 2 Pt specifying the top-left and bottom-right positions.
   */
  static rect(ctx: RenderingContext2D, pts: PtLikeIterable) {
    const p = Util.iterToArray(pts);
    if (!Util.arrayCheck(p)) return;
    ctx.beginPath();
    ctx.moveTo(p[0][0], p[0][1]);
    ctx.lineTo(p[0][0], p[1][1]);
    ctx.lineTo(p[1][0], p[1][1]);
    ctx.lineTo(p[1][0], p[0][1]);
    ctx.closePath();
  }

  /**
   * Draw a rectangle.
   * @param pts a Group or an Iterable<PtLike> with 2 Pt specifying the top-left and bottom-right positions.
   */
  rect(pts: PtLikeIterable): this {
    CanvasForm.rect(this._ctx, pts);
    this._paint();
    return this;
  }

  /**
   * A static function to draw an image.
   * @param ctx canvas rendering context
   * @param img either an [Img](#link) instance or an [`CanvasImageSource`](https://developer.mozilla.org/en-US/docs/Web/API/CanvasImageSource) instance (eg the image from `<img>`, `<video>` or `<canvas>`)
   * @param ptOrRect a target area to place the image. Either a Pt or numeric array specifying a position, or a Group or an Iterable<PtLike> with 2 Pt (top-left, bottom-right) that specifies a bounding box for resizing. Default is (0,0) at top-left.
   * @param orig optionally a Group or an Iterable<PtLike> with 2 Pt (top-left, bottom-right) that specifies a cropping box in the original target.
   */
  static image(
    ctx: RenderingContext2D,
    ptOrRect: PtLike | PtLikeIterable,
    img: CanvasImageSource | Img,
    orig?: PtLikeIterable,
  ) {
    const t = Util.iterToArray(ptOrRect);
    let pos: number[];

    if (typeof t[0] === "number") {
      // no crop
      pos = t as number[];
    } else {
      if (orig) {
        // crop
        const o = Util.iterToArray(orig);
        pos = [
          o[0][0],
          o[0][1],
          o[1][0] - o[0][0],
          o[1][1] - o[0][1],
          t[0][0],
          t[0][1],
          t[1][0] - t[0][0],
          t[1][1] - t[0][1],
        ];
      } else {
        // bounding box resize
        pos = [t[0][0], t[0][1], t[1][0] - t[0][0], t[1][1] - t[0][1]];
      }
    }

    if (img instanceof Img) {
      if (img.loaded) {
        // @ts-expect-error legacy DOM lib types omit these vendor/optional members
        ctx.drawImage(img.image, ...pos);
      }
    } else {
      // @ts-expect-error legacy DOM lib types omit these vendor/optional members
      ctx.drawImage(img, ...pos);
    }
  }

  /**
   * Draw an image.
   * @param img either an [Img](#link) instance or an [`CanvasImageSource`](https://developer.mozilla.org/en-US/docs/Web/API/CanvasImageSource) instance (eg the image from `<img>`, `<video>` or `<canvas>`)
   * @param ptOrRect a target area to place the image. Either a PtLike specifying a position, or a Group or an Iterable<PtLike> with 2 Pt (top-left position, bottom-right position) that specifies a bounding box. Default is (0,0) at top-left.
   * @param orig optionally a Group or an Iterable<PtLike> with 2 Pt (top-left position, bottom-right position) that specifies a cropping box  in the original target.
   */
  image(
    ptOrRect: PtLike | PtLikeIterable,
    img: CanvasImageSource | Img,
    orig?: PtLikeIterable,
  ) {
    if (img instanceof Img) {
      if (img.loaded) {
        CanvasForm.image(this._ctx, ptOrRect, img.image, orig);
      }
    } else {
      CanvasForm.image(this._ctx, ptOrRect, img, orig);
    }
    return this;
  }

  /**
   * A static function to draw ImageData on canvas
   * @param ctx canvas rendering context
   * @param ptOrRect a target area to place the image. Either a Pt or numeric array specifying a position, or a Group or an Iterable<PtLike> with 2 Pt (top-left, bottom-right) that places a region of the image data of that size at that position. Note that `putImageData` cannot resize: the rect clips, not scales. Default is (0,0) at top-left.
   * @param img an ImageData object
   */
  static imageData(
    ctx: RenderingContext2D,
    ptOrRect: PtLike | PtLikeIterable,
    img: ImageData,
  ) {
    const t = Util.iterToArray(ptOrRect);
    if (typeof t[0] === "number") {
      // Pt
      ctx.putImageData(img, t[0], t[1]);
    } else {
      // rect: place the image data's top-left region of the rect's size at
      // the rect's position (dirty coordinates are relative to the data)
      ctx.putImageData(
        img,
        t[0][0],
        t[0][1],
        0,
        0,
        t[1][0] - t[0][0],
        t[1][1] - t[0][1],
      );
    }
  }

  /**
   * Draw ImageData on canvas using ImageData
   * @param ptOrRect a target area to place the image. Either a Pt or numeric array specifying a position, or a Group or an Iterable<PtLike> with 2 Pt (top-left, bottom-right) that specifies a bounding box for resizing. Default is (0,0) at top-left.
   * @param img an ImageData object
   */
  imageData(ptOrRect: PtLike | PtLikeIterable, img: ImageData) {
    CanvasForm.imageData(this._ctx, ptOrRect, img);
    return this;
  }

  /**
   * A static function to draw text.
   * @param ctx canvas rendering context
   * @param pt a Point object to specify the anchor point
   * @param txt a string of text to draw
   * @param maxWidth specify a maximum width per line
   */
  static text(
    ctx: RenderingContext2D,
    pt: PtLike,
    txt: string,
    maxWidth?: number,
  ) {
    if (!pt) return;
    ctx.fillText(txt, pt[0], pt[1], maxWidth);
  }

  /**
   * Draw text on canvas.
   * @param pt a Pt or numeric array to specify the anchor point
   * @param txt text
   * @param maxWidth specify a maximum width per line
   */
  text(pt: PtLike, txt: string, maxWidth?: number): this {
    CanvasForm.text(this._ctx, pt, txt, maxWidth);
    return this;
  }

  /**
   * Fit a single-line text in a rectangular box.
   * @param box a rectangle box defined by a Group or an Iterable<Pt>
   * @param txt string of text
   * @param tail text to indicate overflow such as "...". Default is empty "".
   * @param verticalAlign "top", "middle", or "bottom" to specify vertical alignment inside the box
   * @param overrideBaseline If `true`, use the corresponding baseline as verticalAlign. If `false`, use the current canvas context's textBaseline setting. Default is `true`.
   */
  textBox(
    box: PtIterable,
    txt: string,
    verticalAlign: TextVerticalAlign = "middle",
    tail: string = "",
    overrideBaseline: boolean = true,
  ): this {
    // "center", "start", and "end" are box alignments, not canvas baselines;
    // assigning them to textBaseline is silently ignored by the context
    if (overrideBaseline) {
      this._ctx.textBaseline =
        verticalAlign === "center"
          ? "middle"
          : verticalAlign === "start"
            ? "top"
            : verticalAlign === "end"
              ? "bottom"
              : verticalAlign;
    }
    const size = Rectangle.size(box);
    const t = this._textTruncate(txt, size[0], tail);
    this.text(this._textAlign(box, verticalAlign)!, t[0]);
    return this;
  }

  /**
   * Fit multi-line text in a rectangular box. Note that this will also set canvas context's textBaseline to "top".
   * @param box a Group or an Iterable<PtLike> with 2 Pt that represents a bounding box
   * @param txt string of text
   * @param lineHeight line height as a ratio of font size. Default is 1.2.
   * @param verticalAlign "top", "middle", or "bottom" to specify vertical alignment inside the box
   * @param crop a boolean to specify whether to crop text when overflowing
   */
  paragraphBox(
    box: PtLikeIterable,
    txt: string,
    lineHeight: number = 1.2,
    verticalAlign: TextVerticalAlign = "top",
    crop: boolean = true,
  ): this {
    const b = Group.fromArray(box);
    const size = Rectangle.size(b);
    this._ctx.textBaseline = "top"; // override textBaseline

    const lstep = this._font.size * lineHeight;

    // Seed each line's cut search with the previous line's fitted length, so
    // truncate probes near the boundary instead of measuring the whole
    // remainder (which made wrapping quadratic in text length). The first
    // line's seed is estimated from a single character sample.
    let hint = Math.ceil(size[0] / Math.max(1, this.getTextWidth("n")));

    const lines: string[] = [];
    let sub = txt;
    while (sub) {
      // crop when the next line would no longer fit inside the box
      if (crop && (lines.length + 1) * lstep > size[1]) break;

      const t = this._textTruncate(sub, size[0], "", hint);
      if (t[1] > 0) hint = t[1];

      // new line
      const newln = t[0].indexOf("\n");
      if (newln >= 0) {
        lines.push(t[0].slice(0, newln));
        sub = sub.slice(newln + 1);
        continue;
      }

      // word wrap
      const consumedAll = t[1] === sub.length;
      let dt: number | undefined = t[0].lastIndexOf(" ") + 1;
      if (dt <= 0 || consumedAll) dt = undefined;
      lines.push(dt === undefined ? t[0] : t[0].slice(0, dt));

      if (t[1] <= 0 || consumedAll) break;
      sub = sub.slice(dt ?? t[1]);
    }
    const lsize = lines.length * lstep; // total height
    let lbox = b;

    if (verticalAlign == "middle" || verticalAlign == "center") {
      let lpad = (size[1] - lsize) / 2;
      if (crop) lpad = Math.max(0, lpad);
      lbox = new Group(b[0].$add(0, lpad), b[1].$subtract(0, lpad));
    } else if (verticalAlign == "bottom") {
      lbox = new Group(b[0].$add(0, size[1] - lsize), b[1]);
    } else {
      lbox = new Group(b[0], b[0].$add(size[0], lsize));
    }

    const center = Rectangle.center(lbox);
    for (let i = 0, len = lines.length; i < len; i++) {
      this.text(
        this._textAlign(lbox, "top", [0, i * lstep], center)!,
        lines[i],
      );
    }

    return this;
  }

  /**
   * Set text alignment and baseline (eg, vertical-align).
   * @param alignment HTML canvas' textAlign option: "left", "right", "center", "start", or "end"
   * @param baseline HTML canvas' textBaseline option: "top", "hanging", "middle", "alphabetic", "ideographic", "bottom". For convenience, you can also use "center" (same as "middle"), and "baseline" (same as "alphabetic")
   */
  alignText(
    alignment: CanvasTextAlign = "left",
    baseline: CanvasTextBaseline = "alphabetic",
  ) {
    // @ts-expect-error legacy DOM lib types omit these vendor/optional members
    if (baseline == "center") baseline = "middle";
    // @ts-expect-error legacy DOM lib types omit these vendor/optional members
    if (baseline == "baseline") baseline = "alphabetic";
    this._ctx.textAlign = alignment;
    this._ctx.textBaseline = baseline;
    return this;
  }

  /**
   * A convenient way to draw some text on canvas for logging or debugging. It'll be draw on the top-left of the canvas as an overlay.
   * @param txt text
   */
  log(txt: any): this {
    const w = this._ctx.measureText(txt).width + 20;
    this.stroke(false)
      .fill("rgba(0,0,0,.4)")
      .rect([
        [0, 0],
        [w, 20],
      ]);
    this.fill("#fff").text([10, 14], txt);
    return this;
  }
}
