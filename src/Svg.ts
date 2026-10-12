/*! Pts.js is licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */

import { VisualForm, Font } from "./Form";
import { CanvasForm } from "./Canvas";
import { Geom } from "./Num";
import { Const, Util } from "./Util";
import { Pt, Group, type Bound } from "./Pt";
import { Rectangle } from "./Op";
import { DOMSpace } from "./Dom";
import {
  type PtLike,
  type PtLikeIterable,
  type IPlayer,
  type DOMFormContext,
  type RenderingContext2D,
} from "./Types";

const SVG_NS = "http://www.w3.org/2000/svg";

// Canvas composite operations that map directly onto CSS mix-blend-mode.
// The Porter-Duff subset ("source-in" etc.) has no SVG equivalent per-element.
const BLEND_MODES = new Set([
  "multiply",
  "screen",
  "overlay",
  "darken",
  "lighten",
  "color-dodge",
  "color-burn",
  "hard-light",
  "soft-light",
  "difference",
  "exclusion",
  "hue",
  "saturation",
  "color",
  "luminosity",
]);

// module-level so the class stays tree-shakable (a static field would
// downlevel to a post-class assignment, which bundlers keep)
let _gradientCount = 0;

/**
 * A gradient handle returned by [`SVGContext2D`](#link)'s `createLinearGradient` and
 * `createRadialGradient`. It is structurally compatible with `CanvasGradient` (it has
 * `addColorStop`), and materializes into an SVG `<defs>` gradient when first painted.
 */
class SVGGradient {
  readonly id: string;
  readonly kind: "linear" | "radial";
  readonly coords: number[];
  stops: [number, string][] = [];
  protected _elem: SVGElement | null = null;

  constructor(kind: "linear" | "radial", coords: number[]) {
    this.kind = kind;
    this.coords = coords;
    this.id = `pts_grad_${_gradientCount++}`;
  }

  addColorStop(offset: number, color: string): void {
    this.stops.push([offset, color]);
    if (this._elem) this._render(this._elem); // already materialized; keep it in sync
  }

  /** Create or update the `<defs>` element for this gradient and return its paint url. */
  materialize(defs: SVGElement): string {
    if (!this._elem) {
      this._elem = document.createElementNS(
        SVG_NS,
        this.kind === "linear" ? "linearGradient" : "radialGradient",
      ) as SVGElement;
      this._elem.setAttribute("id", this.id);
      this._elem.setAttribute("gradientUnits", "userSpaceOnUse");
      if (this.kind === "linear") {
        const [x1, y1, x2, y2] = this.coords;
        DOMSpace.setAttr(this._elem, { x1, y1, x2, y2 });
      } else {
        const [x0, y0, r0, x1, y1, r1] = this.coords;
        DOMSpace.setAttr(this._elem, { cx: x1, cy: y1, r: r1, fx: x0, fy: y0 });
        if (r0) this._elem.setAttribute("fr", `${r0}`);
      }
      this._render(this._elem);
    }
    if (this._elem.parentNode !== defs) defs.appendChild(this._elem);
    return `url(#${this.id})`;
  }

  protected _render(elem: SVGElement) {
    elem.textContent = "";
    for (const [offset, color] of this.stops) {
      const stop = document.createElementNS(SVG_NS, "stop");
      stop.setAttribute("offset", `${offset}`);
      stop.setAttribute("stop-color", color);
      elem.appendChild(stop);
    }
  }
}

/** A pending draw record produced by SVGContext2D, consumed by the frame commit. */
type SVGRun = {
  tag: "path" | "text" | "image";
  attrs: Record<string, string | number>;
  text?: string;
  shapeEnds?: number[]; // per-shape boundaries in the d string, for expanded export
  // whether the run's paint gives the same pixels in any drawing order
  free?: boolean;
  // fill orientation shared by every shape in a path run (see `_wind`)
  wind?: number;
  // bounds of the run's first shapes (x0, y0, x1, y1 each), for overlap tests
  boxes?: number[];
};

// Shapes that may only join a run they do not overlap are checked against at
// most this many shapes' bounds.
const RUN_BOXES = 32;

// Whether a resolved paint is known to be opaque, cached per paint string.
const _opaquePaint = new Map<string, boolean>();

let _lastPaint = "";
let _lastOpaque = false;

function isOpaquePaint(paint: string): boolean {
  if (paint === _lastPaint) return _lastOpaque;
  let known = _opaquePaint.get(paint);
  if (known === undefined) {
    known = _parseOpaque(paint);
    if (_opaquePaint.size < 512) _opaquePaint.set(paint, known);
  }
  _lastPaint = paint;
  _lastOpaque = known;
  return known;
}

function _parseOpaque(paint: string): boolean {
  const p = paint.trim().toLowerCase();
  if (p[0] === "#") {
    if (p.length === 4 || p.length === 7) return true;
    if (p.length === 5) return p[4] === "f";
    if (p.length === 9) return p.slice(7) === "ff";
    return false;
  }
  const fn = /^(rgba?|hsla?|hwb|lab|lch|oklab|oklch)\((.*)\)$/.exec(p);
  if (fn) {
    const args = fn[2];
    if (/var\(|calc\(|from /.test(args)) return false;
    const slash = args.indexOf("/");
    let alpha: string | undefined;
    if (slash >= 0) alpha = args.slice(slash + 1);
    else {
      const parts = args.split(",");
      if (parts.length === 4) alpha = parts[3];
      else if (parts.length !== 1 && parts.length !== 3) return false;
    }
    if (alpha === undefined) return true;
    const a = alpha.trim();
    return (
      a === "1" || a === "100%" || parseFloat(a) >= (a.endsWith("%") ? 100 : 1)
    );
  }
  // named colors are opaque, apart from these keywords
  return (
    /^[a-z]+$/.test(p) &&
    p !== "transparent" &&
    p !== "currentcolor" &&
    p !== "none" &&
    p !== "inherit"
  );
}

// Orientation of a closed polygon given as flat x/y pairs in p[start, end):
// 1 or -1 (the sign of its signed area) when it is convex and winds once,
// otherwise NaN. Such a polygon has winding number 0 or its orientation
// everywhere, so same-oriented fills can share one path without cancelling
// under the nonzero rule.
function convexOrientation(p: number[], start: number, end: number): number {
  // the closing edge, from the last vertex to the first
  let ex0 = p[start] - p[end - 2];
  let ey0 = p[start + 1] - p[end - 1];
  let sign = 0;
  let flips = 0;
  let lastDx = ex0 > 0 ? 1 : ex0 < 0 ? -1 : 0;
  let firstDx = lastDx;
  for (let i = start; i < end; i += 2) {
    const j = i + 2 < end ? i + 2 : start;
    const ex = p[j] - p[i];
    const ey = p[j + 1] - p[i + 1];
    // the turn at vertex i
    const cross = ex0 * ey - ey0 * ex;
    if (cross !== 0) {
      const s = cross > 0 ? 1 : -1;
      if (!sign) sign = s;
      else if (s !== sign) return NaN;
    }
    // a convex polygon that winds once reverses its x direction twice
    if (ex !== 0) {
      const d = ex > 0 ? 1 : -1;
      if (!firstDx) firstDx = d;
      else if (d !== lastDx) flips++;
      lastDx = d;
    }
    ex0 = ex;
    ey0 = ey;
  }
  // a vertical closing edge leaves the turn back to the first direction
  if (firstDx && lastDx !== firstDx) flips++;
  return sign && flips === 2 ? sign : NaN;
}

// module-level state for the same tree-shaking reason as _gradientCount above
let _svgMeasurer: CanvasRenderingContext2D | null = null;
const _svgWarned: { [k: string]: boolean } = {};

/**
 * **`SVGContext2D`** implements the subset of `CanvasRenderingContext2D` that
 * [`CanvasForm`](#link) draws through, and renders it as SVG. Consecutive shapes with the
 * same paint state share one `<path>` element (a "style run") when that renders the same as
 * separate elements: shapes with one opaque paint (fills only when their subpaths are
 * circles, rectangles or convex polygons winding the same way), or shapes that do not
 * overlap. Classed shapes, and overlapping translucent, blended, or differently filled and
 * stroked shapes, keep separate elements, so they composite like canvas.
 *
 * Capability notes: blend-mode composites map to `mix-blend-mode`; Porter-Duff composites,
 * `clip`, and `putImageData` warn once and no-op. Text metrics come from a hidden canvas, so
 * `textBox` layout matches canvas exactly.
 * Drawing must occur in an animate callback (or be committed explicitly on this context).
 * `SVGSpace.refresh(false)` preserves the last nonempty frame; it does not accumulate
 * trails. Draws in action handlers are discarded at the next frame's start.
 *
 * **Writing your own renderer**: this class is the reference implementation of the rendering
 * contract — any object implementing the same context surface can be handed to
 * [`CanvasForm`](#link)'s constructor to become a Pts renderer (a PDF writer, a command
 * recorder, a test snapshotter, and so on). The surface is the subset of
 * `CanvasRenderingContext2D` that `CanvasForm` draws through:
 * - path verbs: `beginPath`, `moveTo`, `lineTo`, `quadraticCurveTo`, `bezierCurveTo`,
 *   `rect`, `arc`, `ellipse`, `closePath`
 * - paint: `fill`, `stroke`, `fillRect`, `clearRect`
 * - state: `save`, `restore`, `clip`, `scale`
 * - style fields: `fillStyle`, `strokeStyle`, `lineWidth`, `lineJoin`, `lineCap`,
 *   `globalAlpha`, `globalCompositeOperation`, `setLineDash`, `lineDashOffset`
 * - text: `font`, `textAlign`, `textBaseline`, `fillText`, `measureText`
 * - images: `drawImage`, `putImageData`
 * - gradients: `createLinearGradient`, `createRadialGradient`
 *
 * A renderer driven by a Space should also expose a frame lifecycle like
 * [`SVGContext2D.beginFrame`](#link) / [`SVGContext2D.commitFrame`](#link), called around the
 * players' animate callbacks. The unit test "implements every context member that CanvasForm
 * uses" is the compatibility alarm: it fails when a new `CanvasForm` feature touches a
 * context member a renderer does not implement.
 */
export class SVGContext2D {
  // ---- canvas-compatible state ----
  // The styles a CanvasForm caches are accessors that report writes to the
  // bound style cache (see `_bindStyleCache`).
  protected _fillStyle: string | SVGGradient = "#f03";
  protected _strokeStyle: string | SVGGradient = "#fff";
  protected _lineWidth: number = 1;
  protected _lineJoin: string = "bevel";
  protected _lineCap: string = "butt";
  protected _globalAlpha: number = 1;
  protected _globalCompositeOperation: string = "source-over";
  protected _font: string = "10px sans-serif";
  protected _lineDashOffset: number = 0;
  textAlign: string = "start";
  textBaseline: string = "alphabetic";

  protected _dash: number[] = [];
  protected _stateStack: object[] = [];
  protected _styleCache: Record<string, unknown> | null = null;

  get fillStyle(): string | SVGGradient {
    return this._fillStyle;
  }
  set fillStyle(v: string | SVGGradient) {
    this._fillStyle = v;
    this._wrote("fillStyle", v);
  }

  get strokeStyle(): string | SVGGradient {
    return this._strokeStyle;
  }
  set strokeStyle(v: string | SVGGradient) {
    this._strokeStyle = v;
    this._wrote("strokeStyle", v);
  }

  get lineWidth(): number {
    return this._lineWidth;
  }
  set lineWidth(v: number) {
    this._lineWidth = v;
    this._wrote("lineWidth", v);
  }

  get lineJoin(): string {
    return this._lineJoin;
  }
  set lineJoin(v: string) {
    this._lineJoin = v;
    this._wrote("lineJoin", v);
  }

  get lineCap(): string {
    return this._lineCap;
  }
  set lineCap(v: string) {
    this._lineCap = v;
    this._wrote("lineCap", v);
  }

  get globalAlpha(): number {
    return this._globalAlpha;
  }
  set globalAlpha(v: number) {
    this._globalAlpha = v;
    this._wrote("globalAlpha", v);
  }

  get globalCompositeOperation(): string {
    return this._globalCompositeOperation;
  }
  set globalCompositeOperation(v: string) {
    this._globalCompositeOperation = v;
    this._wrote("globalCompositeOperation", v);
  }

  get font(): string {
    return this._font;
  }
  set font(v: string) {
    this._font = v;
    this._wrote("font", v);
  }

  get lineDashOffset(): number {
    return this._lineDashOffset;
  }
  set lineDashOffset(v: number) {
    this._lineDashOffset = v;
    this._wrote("dash", undefined);
  }

  /**
   * Bind the style cache of the CanvasForms drawing on this context, so that
   * style writes made directly on this context, `setLineDash` and `restore()`
   * keep it accurate. Called by `CanvasForm`; a custom renderer may implement
   * the same method instead of being observed.
   * @param cache the style values last written, keyed by property name
   */
  _bindStyleCache(cache: Record<string, unknown>): void {
    this._styleCache = cache;
  }

  protected _wrote(key: string, v: unknown): void {
    const cache = this._styleCache;
    if (cache) cache[key] = v;
  }

  /** Optional CSS class applied to emitted elements (see `SVGForm.cls`). */
  className: string = "";

  // ---- current path & shape ----
  protected _d: string = "";
  protected _shapeFill: string | null = null; // resolved paint or null
  protected _shapeStroke: string | null = null;
  protected _shapeStrokeStyle: Record<string, string | number> = {};
  protected _shapePainted: boolean = false;
  // class/alpha/blend are captured at paint time (fill/stroke), not at flush
  // time, so a style change between shapes cannot apply retroactively
  protected _shapeClass: string = "";
  protected _shapeAlpha: number = 1;
  protected _shapeBlend: string = "source-over";
  // Geometry of the current shape, for batching, evaluated only when a merge
  // needs it. `_pts` holds flat x/y pairs of every vertex, control point and
  // arc extent (for the bounds); `_rings` holds the [start, end) ranges of
  // `_pts` for closed moveTo/lineTo subpaths, whose orientation is checked
  // later; `_ringStart` marks the open one (or -1). `_wind` folds subpath
  // orientations: 1 or -1, 0 before any, NaN when a winding is unknown.
  protected _pts: number[] = [];
  protected _ptsLength: number = 0;
  protected _rings: number[] = [];
  protected _ringsLength: number = 0;
  protected _ringStart: number = -1;
  protected _wind: number = 0;
  protected _windDone: boolean = false;
  protected _x0: number = 0;
  protected _y0: number = 0;
  protected _x1: number = 0;
  protected _y1: number = 0;
  protected _boxDone: boolean = false;

  // ---- frame state ----
  protected _runs: SVGRun[] = [];
  protected _drawCount: number = 0;

  // ---- DOM ----
  protected _host: SVGElement; // the <svg> element
  protected _group: SVGElement | null = null; // managed <g> holding this context's output
  protected _defs: SVGElement | null = null;
  protected _pool: SVGElement[] = []; // pooled elements, index-aligned with runs
  protected _attrCache: Record<string, string>[] = [];

  constructor(host: SVGElement) {
    this._host = host;
  }

  protected static _warnOnce(key: string, msg: string) {
    if (!_svgWarned[key]) {
      _svgWarned[key] = true;
      Util.warn(msg);
    }
  }

  // -------------------------------------------------------------- lifecycle

  /** Start a new frame: subsequent draws build a fresh run list. */
  beginFrame(): void {
    this._runs = [];
    this._d = "";
    this._resetShape();
    this._shapeFill = null;
    this._shapeStroke = null;
    this._shapePainted = false;
    this._drawCount = 0;
  }

  /** Number of paint calls since `beginFrame` — used to skip empty commits. */
  get drawCount(): number {
    return this._drawCount;
  }

  /** The `<g>` element holding this context's rendered output. */
  get group(): SVGElement | null {
    return this._group;
  }

  /**
   * Commit the frame: reconcile the run list against the pooled elements, patching only
   * changed attributes, and truncate unused elements.
   */
  commitFrame(): void {
    this._flushShape();
    if (!this._group) {
      this._group = document.createElementNS(SVG_NS, "g") as SVGElement;
      this._group.setAttribute("class", "pts-svgform");
      this._host.appendChild(this._group);
    }

    const runs = this._runs;
    for (let i = 0; i < runs.length; i++) {
      const run = runs[i];
      let elem = this._pool[i];
      if (!elem || elem.nodeName !== run.tag) {
        const fresh = document.createElementNS(SVG_NS, run.tag) as SVGElement;
        if (elem) {
          this._group.replaceChild(fresh, elem);
        } else {
          this._group.appendChild(fresh);
        }
        elem = fresh;
        this._pool[i] = elem;
        this._attrCache[i] = {};
      }
      const cache = this._attrCache[i];
      // conditional attributes (eg, stroke-dasharray, mix-blend-mode) must not
      // survive from an earlier frame's run on this pooled element
      for (const k in cache) {
        if (!(k in run.attrs)) {
          elem.removeAttribute(k);
          delete cache[k];
        }
      }
      for (const k in run.attrs) {
        const v = `${run.attrs[k]}`;
        if (cache[k] !== v) {
          elem.setAttribute(k, v);
          cache[k] = v;
        }
      }
      if (run.tag === "text" && elem.textContent !== run.text) {
        elem.textContent = run.text!;
      }
    }

    // truncate the unused tail
    for (let i = this._pool.length - 1; i >= runs.length; i--) {
      this._group.removeChild(this._pool[i]);
      this._pool.pop();
      this._attrCache.pop();
    }

    // Definitions belong to the committed scene, not to every gradient ever
    // created. A retained gradient handle can materialize again when reused.
    if (this._defs) {
      const paints = new Set<string | number>();
      for (const run of runs) {
        paints.add(run.attrs.fill);
        paints.add(run.attrs.stroke);
      }
      for (const elem of Array.from(this._defs.children)) {
        if (!paints.has(`url(#${elem.id})`)) elem.remove();
      }
    }
  }

  /** The current frame's run list (used by expanded export). */
  get runs(): SVGRun[] {
    return this._runs;
  }

  /** Forget cached DOM references, eg after the host's contents were removed externally. */
  resetDom(): void {
    this._group = null;
    this._defs = null;
    this._pool = [];
    this._attrCache = [];
  }

  /**
   * Remove this context's managed elements from the DOM and forget them. Used when a space
   * is disposed so that a re-mounted space on the same element starts clean.
   */
  disposeDom(): void {
    if (this._group && this._group.parentNode) {
      this._group.parentNode.removeChild(this._group);
    }
    if (this._defs && this._defs.parentNode) {
      this._defs.parentNode.removeChild(this._defs);
    }
    this.resetDom();
  }

  // ------------------------------------------------------------ path verbs

  beginPath(): void {
    this._flushShape(); // also resets the shape geometry
    this._d = "";
  }

  closePath(): void {
    this._endRing();
    this._d += "Z";
  }

  moveTo(x: number, y: number): void {
    this._endRing();
    this._ringStart = this._ptsLength;
    this._point(x, y);
    this._d += `M${round2(x)} ${round2(y)}`;
  }

  lineTo(x: number, y: number): void {
    // a line after closePath (or without moveTo) starts an untracked subpath
    if (this._ringStart < 0) this._wind = NaN;
    this._point(x, y);
    this._d += `L${round2(x)} ${round2(y)}`;
  }

  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void {
    this._curve();
    this._point(cpx, cpy);
    this._point(x, y);
    this._d += `Q${round2(cpx)} ${round2(cpy)} ${round2(x)} ${round2(y)}`;
  }

  bezierCurveTo(
    cp1x: number,
    cp1y: number,
    cp2x: number,
    cp2y: number,
    x: number,
    y: number,
  ): void {
    this._curve();
    this._point(cp1x, cp1y);
    this._point(cp2x, cp2y);
    this._point(x, y);
    this._d += `C${round2(cp1x)} ${round2(cp1y)} ${round2(cp2x)} ${round2(cp2y)} ${round2(x)} ${round2(y)}`;
  }

  rect(x: number, y: number, w: number, h: number): void {
    this._endRing();
    this._orient(w * h > 0 ? 1 : w * h < 0 ? -1 : NaN);
    this._point(x, y);
    this._point(x + w, y + h);
    this._d += `M${round2(x)} ${round2(y)}h${round2(w)}v${round2(h)}h${round2(-w)}Z`;
  }

  arc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    ccw: boolean = false,
  ): void {
    this.ellipse(x, y, radius, radius, 0, startAngle, endAngle, ccw);
  }

  ellipse(
    x: number,
    y: number,
    rx: number,
    ry: number,
    rotation: number,
    startAngle: number,
    endAngle: number,
    ccw: boolean = false,
  ): void {
    // canvas sweep semantics: direction-signed delta, wrapped into [0, 2π),
    // where a delta of 2π or more is a full ellipse
    let delta = ccw ? startAngle - endAngle : endAngle - startAngle;
    const full = delta >= Const.two_pi;
    if (!full) delta = ((delta % Const.two_pi) + Const.two_pi) % Const.two_pi;

    const cosR = Math.cos(rotation);
    const sinR = Math.sin(rotation);
    const ptAt = (angle: number): [number, number] => {
      const px = rx * Math.cos(angle);
      const py = ry * Math.sin(angle);
      return [x + px * cosR - py * sinR, y + px * sinR + py * cosR];
    };

    const dir = ccw ? -1 : 1;
    const sweepFlag = ccw ? 0 : 1;
    const rotDeg = round2((rotation * 180) / Math.PI);
    const [sx, sy] = ptAt(startAngle);

    // a full ellipse that starts its own subpath is a simple closed curve;
    // an arc joined to other segments is untracked
    const r = Math.max(Math.abs(rx), Math.abs(ry));
    if (full && this._d.length === 0) {
      this._orient(rx && ry ? (ccw ? -1 : 1) : NaN);
    } else this._curve();
    this._point(x - r, y - r);
    this._point(x + r, y + r);

    // connect from the current point like canvas does
    this._d +=
      this._d.length > 0
        ? `L${round2(sx)} ${round2(sy)}`
        : `M${round2(sx)} ${round2(sy)}`;

    // emit in half-turn segments so large-arc flags stay unambiguous
    const sweep = full ? Const.two_pi : delta;
    const segments = Math.max(1, Math.ceil(sweep / Const.pi - 0.000001));
    let angle = startAngle;
    for (let s = 1; s <= segments; s++) {
      const target =
        s === segments ? startAngle + dir * sweep : angle + dir * Const.pi;
      const [ex, ey] = ptAt(target);
      this._d += `A${round2(rx)} ${round2(ry)} ${rotDeg} 0 ${sweepFlag} ${round2(ex)} ${round2(ey)}`;
      angle = target;
    }
    if (full) this._d += "Z";
  }

  // ----------------------------------------------------------------- paint

  fill(): void {
    this._shapeFill = this._resolvePaint(this.fillStyle);
    this._capturePaintState();
  }

  stroke(): void {
    this._shapeStroke = this._resolvePaint(this.strokeStyle);
    this._shapeStrokeStyle = {
      "stroke-width": this.lineWidth,
      "stroke-linejoin": this.lineJoin,
      "stroke-linecap": this.lineCap,
    };
    if (this._dash.length > 0) {
      this._shapeStrokeStyle["stroke-dasharray"] = this._dash.join(" ");
      if (this.lineDashOffset)
        this._shapeStrokeStyle["stroke-dashoffset"] = this.lineDashOffset;
    }
    this._capturePaintState();
  }

  protected _capturePaintState(): void {
    this._shapePainted = true;
    this._shapeClass = this.className;
    this._shapeAlpha = this.globalAlpha;
    this._shapeBlend = this.globalCompositeOperation;
    this._drawCount++;
  }

  fillRect(x: number, y: number, w: number, h: number): void {
    this.beginPath();
    this.rect(x, y, w, h);
    this.fill();
  }

  clearRect(): void {
    // background clearing is handled by SVGSpace.clear; nothing to erase mid-frame
  }

  fillText(txt: string, x: number, y: number, maxWidth?: number): void {
    this._flushShape();
    const anchor =
      this.textAlign === "center"
        ? "middle"
        : this.textAlign === "right" || this.textAlign === "end"
          ? "end"
          : "start";
    const baseline =
      this.textBaseline === "top"
        ? "text-before-edge"
        : this.textBaseline === "middle"
          ? "central"
          : this.textBaseline === "bottom"
            ? "text-after-edge"
            : this.textBaseline; // alphabetic, hanging, ideographic pass through
    const attrs: Record<string, string | number> = {
      x: round2(x),
      y: round2(y),
      fill: this._resolvePaint(this.fillStyle),
      "text-anchor": anchor,
      "dominant-baseline": baseline,
      style: `font: ${this.font}`,
      "pointer-events": "none",
    };
    // canvas maxWidth semantics: compress to fit only when text is wider
    if (maxWidth! > 0 && this.measureText(txt).width > maxWidth!) {
      attrs.textLength = round2(maxWidth!);
      attrs.lengthAdjust = "spacingAndGlyphs";
    }
    this._applyCommon(attrs);
    this._runs.push({ tag: "text", attrs, text: txt });
    this._drawCount++;
  }

  measureText(txt: string): TextMetrics {
    if (!_svgMeasurer) {
      _svgMeasurer = document.createElement("canvas").getContext("2d")!;
    }
    _svgMeasurer!.font = this.font;
    return _svgMeasurer!.measureText(txt);
  }

  drawImage(
    img: CanvasImageSource,
    x: number,
    y: number,
    w?: number,
    h?: number,
    ...rest: number[]
  ): void {
    if (rest.length > 0) {
      SVGContext2D._warnOnce(
        "drawImage9",
        "SVG output does not support the 9-argument (source-cropped) drawImage",
      );
      return;
    }
    this._flushShape();
    const src =
      (img as HTMLImageElement).src ??
      ((img as HTMLCanvasElement).toDataURL
        ? (img as HTMLCanvasElement).toDataURL()
        : null);
    if (!src) {
      SVGContext2D._warnOnce(
        "drawImageSrc",
        "SVG output supports images from <img> elements or canvases only",
      );
      return;
    }
    const attrs: Record<string, string | number> = {
      href: src,
      x: round2(x),
      y: round2(y),
    };
    const iw = w ?? (img as HTMLImageElement).width;
    const ih = h ?? (img as HTMLImageElement).height;
    if (iw != null) attrs.width = round2(iw as number);
    if (ih != null) attrs.height = round2(ih as number);
    this._applyCommon(attrs);
    this._runs.push({ tag: "image", attrs });
    this._drawCount++;
  }

  putImageData(): void {
    SVGContext2D._warnOnce(
      "putImageData",
      "putImageData is not supported in SVG output",
    );
  }

  // ----------------------------------------------------------- state & misc

  save(): void {
    this._stateStack.push({
      fillStyle: this.fillStyle,
      strokeStyle: this.strokeStyle,
      lineWidth: this.lineWidth,
      lineJoin: this.lineJoin,
      lineCap: this.lineCap,
      globalAlpha: this.globalAlpha,
      globalCompositeOperation: this.globalCompositeOperation,
      font: this.font,
      textAlign: this.textAlign,
      textBaseline: this.textBaseline,
      lineDashOffset: this.lineDashOffset,
      _dash: this._dash.slice(),
    });
  }

  restore(): void {
    const s = this._stateStack.pop();
    if (s) {
      // the style setters report the restored values to the style cache
      Object.assign(this, s);
      this._wrote("dash", undefined);
    }
  }

  scale(): void {
    // SVG output is resolution-independent; the canvas pixel-density scale is a no-op here
  }

  clip(): void {
    SVGContext2D._warnOnce("clip", "clip is not yet supported in SVG output");
  }

  setLineDash(segments: number[]): void {
    this._dash = segments;
    this._wrote("dash", undefined);
  }

  getLineDash(): number[] {
    return this._dash;
  }

  createLinearGradient(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  ): SVGGradient {
    return new SVGGradient("linear", [x1, y1, x2, y2]);
  }

  createRadialGradient(
    x0: number,
    y0: number,
    r0: number,
    x1: number,
    y1: number,
    r1: number,
  ): SVGGradient {
    return new SVGGradient("radial", [x0, y0, r0, x1, y1, r1]);
  }

  // -------------------------------------------------------------- internals

  protected _resolvePaint(style: string | SVGGradient): string {
    if (style instanceof SVGGradient) {
      if (!this._defs) {
        this._defs = document.createElementNS(SVG_NS, "defs") as SVGElement;
        this._host.insertBefore(this._defs, this._host.firstChild);
      }
      return style.materialize(this._defs);
    }
    if (typeof style !== "string") {
      // a CanvasPattern (or other canvas paint object) has no SVG equivalent;
      // "[object CanvasPattern]" would otherwise be emitted as an invalid paint
      SVGContext2D._warnOnce(
        "pattern",
        "canvas patterns are not supported in SVG output; use CanvasSpace",
      );
      return "none";
    }
    return style;
  }

  /** Add class, alpha, and blend attributes shared by all run kinds. */
  protected _applyCommon(attrs: Record<string, string | number>): void {
    attrs.class = this.className
      ? `pts-svgform ${this.className}`
      : "pts-svgform";
    if (this.globalAlpha !== 1) attrs.opacity = this.globalAlpha;
    else attrs.opacity = 1;
    const op = this.globalCompositeOperation;
    if (op !== "source-over") {
      if (BLEND_MODES.has(op)) {
        // text runs already carry their font in `style`; append, never replace
        const blend = `mix-blend-mode: ${op}`;
        attrs.style = attrs.style ? `${attrs.style}; ${blend}` : blend;
      } else {
        SVGContext2D._warnOnce(
          `composite-${op}`,
          `composite operation "${op}" has no SVG equivalent`,
        );
      }
    }
  }

  /**
   * Commit the current shape (its path and fill/stroke usage) into the run list, merging
   * with the previous run when the paint state matches.
   */
  protected _flushShape(): void {
    if (!this._shapePainted || this._d.length === 0) {
      this._shapePainted = false;
      this._resetShape();
      return;
    }
    this._endRing();

    const attrs: Record<string, string | number> = {
      d: this._d,
      fill: this._shapeFill ?? "none",
      stroke: this._shapeStroke ?? "none",
    };
    if (this._shapeStroke) {
      Object.assign(attrs, this._shapeStrokeStyle);
    }
    attrs.class = this._shapeClass
      ? `pts-svgform ${this._shapeClass}`
      : "pts-svgform";
    attrs.opacity = this._shapeAlpha;
    if (this._shapeBlend !== "source-over") {
      if (BLEND_MODES.has(this._shapeBlend)) {
        attrs.style = `mix-blend-mode: ${this._shapeBlend}`;
      } else {
        SVGContext2D._warnOnce(
          `composite-${this._shapeBlend}`,
          `composite operation "${this._shapeBlend}" has no SVG equivalent`,
        );
      }
    }

    const prev = this._runs[this._runs.length - 1];
    // CSS classes can style each element, so classed shapes stay separate
    const join =
      prev &&
      prev.tag === "path" &&
      !this._shapeClass &&
      sameRunStyle(prev.attrs, attrs)
        ? this._joinable(prev)
        : 0;
    if (join) {
      const ends = prev.shapeEnds!;
      ends.push((prev.attrs.d as string).length);
      prev.attrs.d = (prev.attrs.d as string) + this._d;
      if (
        join === 2 &&
        this._shapeFill !== null &&
        this._shapeWind() !== prev.wind
      )
        prev.wind = NaN;
      if (ends.length < RUN_BOXES) {
        this._shapeBox();
        prev.boxes!.push(this._x0, this._y0, this._x1, this._y1);
      }
    } else {
      this._shapeBox();
      const fill = this._shapeFill;
      const stroke = this._shapeStroke;
      this._runs.push({
        tag: "path",
        attrs,
        shapeEnds: [],
        // one opaque paint, composited normally; same-styled shapes share it
        free:
          this._shapeAlpha === 1 &&
          this._shapeBlend === "source-over" &&
          (fill === null || isOpaquePaint(fill)) &&
          (stroke === null || isOpaquePaint(stroke)) &&
          (fill === null || stroke === null || fill === stroke),
        // only fills depend on winding
        wind: this._shapeFill !== null ? this._shapeWind() : NaN,
        boxes: [this._x0, this._y0, this._x1, this._y1],
      });
    }

    this._d = "";
    this._shapeFill = null;
    this._shapeStroke = null;
    this._shapePainted = false;
    this._resetShape();
  }

  /**
   * Whether the current shape can join the previous path run, which has the
   * same attributes, without changing the rendered pixels: 1 when it is order
   * independent, 2 when it does not overlap the run's shapes, 0 otherwise.
   * One opaque paint gives the same pixels in any order, and same-oriented
   * simple fills do not cancel under the nonzero rule. Translucent paint,
   * group opacity, blends, distinct fill and stroke paints, and fills of
   * unknown winding composite per element, so they join only shapes they do
   * not overlap.
   */
  protected _joinable(run: SVGRun): number {
    // the shape has the run's paint, so the run's paint verdict applies
    if (
      run.free &&
      (this._shapeFill === null ||
        ((run.wind === 1 || run.wind === -1) && this._shapeWind() === run.wind))
    )
      return 1;
    const stroke = this._shapeStroke;
    const boxes = run.boxes!;
    // the run's shapes beyond the stored bounds cannot be checked
    if (run.shapeEnds!.length >= RUN_BOXES) return 0;
    // keep apart by the stroke's reach (miter joins reach furthest) plus a
    // pixel, so antialiased edges do not share pixels either
    this._shapeBox();
    const width = stroke ? Number(this._shapeStrokeStyle["stroke-width"]) : 0;
    const gap =
      2 *
      (1 +
        width *
          (this._shapeStrokeStyle["stroke-linejoin"] === "miter" ? 5 : 1));
    for (let i = 0; i < boxes.length; i += 4) {
      if (
        this._x0 <= boxes[i + 2] + gap &&
        boxes[i] <= this._x1 + gap &&
        this._y0 <= boxes[i + 3] + gap &&
        boxes[i + 1] <= this._y1 + gap
      )
        return 0;
    }
    return 2;
  }

  protected _resetShape(): void {
    this._ptsLength = 0;
    this._ringsLength = 0;
    this._ringStart = -1;
    this._wind = 0;
    this._windDone = false;
    this._boxDone = false;
  }

  protected _point(x: number, y: number): void {
    this._pts[this._ptsLength++] = x;
    this._pts[this._ptsLength++] = y;
  }

  /** Fold a subpath's orientation into the shape's. */
  protected _orient(o: number): void {
    if (this._wind === 0) this._wind = o;
    else if (this._wind !== o) this._wind = NaN;
  }

  /** Record the open moveTo/lineTo subpath, implicitly closed by a fill. */
  protected _endRing(): void {
    const start = this._ringStart;
    if (start < 0) return;
    this._ringStart = -1;
    // fewer than three vertices enclose nothing to fill
    if (this._ptsLength - start >= 6) {
      this._rings[this._ringsLength++] = start;
      this._rings[this._ringsLength++] = this._ptsLength;
    }
  }

  /** The current shape's fill orientation, evaluating its polygon subpaths. */
  protected _shapeWind(): number {
    if (!this._windDone) {
      this._windDone = true;
      for (let i = 0; i < this._ringsLength; i += 2)
        this._orient(
          convexOrientation(this._pts, this._rings[i], this._rings[i + 1]),
        );
    }
    return this._wind;
  }

  /** Compute the current shape's bounds into `_x0`, `_y0`, `_x1`, `_y1`. */
  protected _shapeBox(): void {
    if (this._boxDone) return;
    this._boxDone = true;
    const p = this._pts;
    let x0 = Infinity;
    let y0 = Infinity;
    let x1 = -Infinity;
    let y1 = -Infinity;
    for (let i = 0, n = this._ptsLength; i < n; i += 2) {
      const x = p[i];
      const y = p[i + 1];
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
    this._x0 = x0;
    this._y0 = y0;
    this._x1 = x1;
    this._y1 = y1;
  }

  /** The current subpath has curves: its winding is not tracked. */
  protected _curve(): void {
    this._ringStart = -1;
    this._wind = NaN;
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Compare two path-run attribute sets for style equality (everything but the path data). */
function sameRunStyle(
  a: Record<string, string | number>,
  b: Record<string, string | number>,
): boolean {
  // count keys instead of allocating key arrays: this runs for every shape
  let count = 0;
  for (const k in a) {
    if (k !== "d" && a[k] !== b[k]) return false;
    count++;
  }
  for (const k in b) count--;
  return count === 0;
}

/**
 * SVGSpace extends [`DOMSpace`](#link) to support SVG elements. Use it with [`SVGForm`](#link),
 * which shares its drawing API and semantics with [`CanvasForm`](#link) — a sketch written for
 * canvas can run on SVG with the supported subset. Check out the [Space guide](../guide/Space-0500.html) for details.
 */
export class SVGSpace extends DOMSpace {
  protected _bgcolor: string = "#999";
  protected _svgContexts: SVGContext2D[] = [];
  protected _bgElem: SVGElement | null = null;
  protected _svgRefresh: boolean = true; // mirrors Space's private refresh flag

  /**
   * Create a SVGSpace which represents a Space for SVG elements.
   * @param elem Specify an element by its "id" attribute as string, or by the element object itself. An element can be an existing `<svg>`, or a `<div>` container in which a new `<svg>` will be created. If left empty, a `<div id="pt_container"><svg id="pt" /></div>` will be added to DOM. Use css to customize its appearance if needed.
   * @param callback an optional callback `function(boundingBox, spaceElement)` to be called when canvas is appended and ready. Alternatively, a "ready" event will also be fired from the `<svg>` element when it's appended, which can be traced with `spaceInstance.canvas.addEventListener("ready")`
   * @example `new SVGSpace( "#myElementID" )`
   */
  constructor(
    elem: string | Element | null = "pt",
    callback?: (bound: Bound, elem: Element) => void,
  ) {
    super(elem, callback);

    if (this._canvas.nodeName.toLowerCase() != "svg") {
      let s = SVGSpace.svgElement(this._canvas, "svg", `${this.id}_svg`);
      this._container = this._canvas;
      this._canvas = s as SVGElement;
    }

    // immediate-mode cycle like canvas: redraw and reconcile every frame
    this.refresh(true);
  }

  /**
   * For a missing target, create the documented `<svg id="pt">` inside the created container.
   */
  protected _createDefaultElement(container: Element, id: string): SVGElement {
    return SVGSpace.svgElement(container, "svg", id);
  }

  /**
   * Get a new [`SVGForm`](#link) for drawing. The form shares its API with
   * [`CanvasForm`](#link), rendered through a [`SVGContext2D`](#link).
   * @see `SVGForm`
   */
  getForm(): SVGForm {
    return new SVGForm(this);
  }

  /**
   * Get the DOM element.
   */
  get element(): Element {
    return this._canvas;
  }

  /** Register a rendering context so its frame lifecycle follows this space's play cycle. */
  registerContext(ctx: SVGContext2D): void {
    this._svgContexts.push(ctx);
  }

  /**
   * This overrides Space's `resize` function. It's used as a callback function for window's resize event and not usually called directly.
   * You can keep track of resize events with `resize: (bound ,evt)` callback in your [`IPlayer`](#link) objects (See [`Space.add`](#link)).
   * @param b a Bound object to resize to
   * @param evt Optionally pass a resize event
   */
  resize(b: Bound, evt?: Event | null): this {
    super.resize(b, evt);
    SVGSpace.setAttr(this.element, {
      viewBox: `0 0 ${this.bound.width} ${this.bound.height}`,
      width: `${this.bound.width}`,
      height: `${this.bound.height}`,
      xmlns: SVG_NS,
      version: "1.1",
    });
    this._updateBackground();
    return this;
  }

  /**
   * Clear the drawing. In SVG this maintains a background rectangle rather than erasing
   * elements — the per-frame reconciliation removes stale shapes.
   * @param bg Optionally specify a custom background color in hex or rgba string, or "transparent"
   */
  clear(bg?: string): this {
    if (bg) this._bgcolor = bg;
    this._updateBackground();
    return this;
  }

  protected _updateBackground(): void {
    const svg = this._canvas as SVGElement;
    if (!this._bgElem) {
      this._bgElem = document.createElementNS(SVG_NS, "rect") as SVGElement;
      this._bgElem.setAttribute("class", "pts-svg-bg");
      svg.insertBefore(this._bgElem, svg.firstChild);
    }
    DOMSpace.setAttr(this._bgElem, {
      x: 0,
      y: 0,
      width: this.bound.width,
      height: this.bound.height,
      fill:
        !this._bgcolor || this._bgcolor === "transparent"
          ? "none"
          : this._bgcolor,
    });
  }

  /**
   * The per-frame cycle: begin all registered contexts' frames, run the players, then
   * commit — reconciling the SVG DOM against what was drawn this frame.
   */
  protected playItems(time: number) {
    const ctxs = this._svgContexts;
    for (let i = 0, len = ctxs.length; i < len; i++) ctxs[i].beginFrame();
    super.playItems(time);
    for (let i = 0, len = ctxs.length; i < len; i++) {
      // skip empty commits so scenes drawn once (with refresh off) persist
      if (this._svgRefresh || ctxs[i].drawCount > 0) ctxs[i].commitFrame();
    }
  }

  /**
   * Set whether the rendering should be repainted on each frame.
   * With `false`, empty frames preserve the last nonempty frame. New nonempty frames
   * replace it: canvas-style accumulation and drawing from action handlers are unsupported.
   * Store input in action handlers and redraw it in an animate callback, or use CanvasSpace.
   * @param b a boolean value to set whether to repaint each frame
   */
  refresh(b: boolean): this {
    this._svgRefresh = b;
    return super.refresh(b);
  }

  /**
   * Serialize the current SVG output to a string.
   * @param expand if `true`, split merged style runs into one element per shape — a
   * semantic export suited for editing in vector tools. Default is `false`.
   */
  toSVG(expand: boolean = false): string {
    const svg = this._canvas as SVGElement;
    if (!expand) return svg.outerHTML;

    const clone = svg.cloneNode(true) as SVGElement;
    // rebuild each form's group with one element per shape
    const groups = clone.querySelectorAll("g.pts-svgform");
    let gi = 0;
    for (const ctx of this._svgContexts) {
      const group = groups[gi++];
      if (!group) continue;
      group.textContent = "";
      for (const run of ctx.runs) {
        if (run.tag !== "path") {
          const elem = document.createElementNS(SVG_NS, run.tag);
          DOMSpace.setAttr(elem, run.attrs);
          if (run.text) elem.textContent = run.text;
          group.appendChild(elem);
          continue;
        }
        const d = run.attrs.d as string;
        const bounds = [...run.shapeEnds!, d.length];
        let begin = 0;
        for (const end of bounds) {
          const elem = document.createElementNS(SVG_NS, "path");
          DOMSpace.setAttr(elem, { ...run.attrs, d: d.slice(begin, end) });
          group.appendChild(elem);
          begin = end;
        }
      }
    }
    return clone.outerHTML;
  }

  /**
   * A static function to add a svg element inside a node. Usually you don't need to call this directly. See methods in [`SVGForm`](#link) instead.
   * @param parent the parent element, or `null` to use current `<svg>` as parent.
   * @param name a string of element name,  such as `rect` or `circle`
   * @param id id attribute of the new element
   */
  static svgElement(
    parent: Element | null | undefined,
    name: string,
    id?: string,
  ): SVGElement {
    if (!parent || !parent.appendChild)
      throw new Error("parent is not a valid DOM element");

    // O(1) id lookup, then verify it's inside the parent so a same-id
    // element elsewhere in the document is never silently adopted
    let elem: Element | null = document.getElementById(id!);
    if (elem && !parent.contains(elem)) elem = null;

    if (!elem) {
      elem = document.createElementNS(SVG_NS, name);
      elem.setAttribute("id", id!);

      parent.appendChild(elem);
    }
    return elem as SVGElement;
  }

  /**
   * Remove an item from this Space.
   * @param player a player item with an auto-assigned `animateID` property
   */
  remove(player: IPlayer): this {
    let temp = this._container.querySelectorAll("." + SVGForm.scopeID(player));

    temp.forEach((el: Element) => {
      el.parentNode!.removeChild(el);
    });

    return super.remove(player);
  }

  /**
   * Remove all items from this Space. This clears the contents of the space's
   * `<svg>` element but never touches its container, so the space keeps
   * rendering after items are re-added.
   * This includes user-supplied SVG children. Use `dispose()` to remove only
   * elements managed by this space while preserving other SVG content.
   */
  removeAll(): this {
    this._canvas.innerHTML = "";
    this._bgElem = null;
    for (const ctx of this._svgContexts) ctx.resetDom();
    return super.removeAll();
  }

  /**
   * Dispose of browser resources held by this space: listeners, the animation loop, and the
   * elements this space manages inside the `<svg>`. Call this before unmounting, eg in a
   * framework component's cleanup callback. A new space can be mounted on the same element
   * afterwards (as happens under React's StrictMode).
   */
  dispose(): this {
    super.dispose();
    for (const ctx of this._svgContexts) ctx.disposeDom();
    this._svgContexts = [];
    if (this._bgElem && this._bgElem.parentNode) {
      this._bgElem.parentNode.removeChild(this._bgElem);
    }
    this._bgElem = null;
    return this;
  }
}

let _svgFormGroupID = 0;
let _svgFormDomID = 0;
let _svgFormOffscreenWarned = false;

// rendering-context style keys and their legacy inline-style names
const _legacyStyleKeys: Record<string, string> = {
  fillStyle: "fill",
  strokeStyle: "stroke",
  lineWidth: "stroke-width",
  lineJoin: "stroke-linejoin",
  lineCap: "stroke-linecap",
  globalAlpha: "opacity",
  font: "font",
};

/**
 * SVGForm is a [`CanvasForm`](#link) rendered through a [`SVGContext2D`](#link): it inherits
 * the canvas drawing API — shapes, gradients, dashes, images, `textBox` — with SVG
 * output, subject to the capability notes in `SVGContext2D`. Sketches using this subset
 * can swap between `CanvasSpace` and `SVGSpace`. The legacy per-element static helpers and `scope()` workflow are retained
 * for compatibility but are no longer needed.
 */
export class SVGForm extends CanvasForm<SVGSpace> {
  protected _svgSpace: SVGSpace;
  protected _svgCtx: SVGContext2D;
  protected _formID: number = _svgFormGroupID++;

  protected _legacyCtx: DOMFormContext = {
    group: null,
    groupID: "pts",
    groupCount: 0,
    currentID: "pts0",
    currentClass: "",
    style: {},
  };

  // mutable statics are stored at module level and exposed through accessors so
  // no post-class assignment is emitted (which would defeat tree-shaking)
  static get groupID(): number {
    return _svgFormGroupID;
  }
  static set groupID(n: number) {
    _svgFormGroupID = n;
  }
  static get domID(): number {
    return _svgFormDomID;
  }
  static set domID(n: number) {
    _svgFormDomID = n;
  }

  /**
   * Create a new SVGForm. You may also use [`SVGSpace.getForm`](#link) to get a default form directly.
   * @param space an instance of SVGSpace
   */
  constructor(space: SVGSpace) {
    super();
    this._svgSpace = space;
    this._svgCtx = new SVGContext2D(space.element as SVGElement);
    space.registerContext(this._svgCtx);

    this._ctx = this._svgCtx as unknown as RenderingContext2D;
    // Same initial state as CanvasForm, so a sketch renders alike on both:
    // in particular, text without an explicit font() is 14px, not the
    // context's 10px default.
    this._set("fillStyle", this._style.fillStyle);
    this._set("strokeStyle", this._style.strokeStyle);
    this._set("lineJoin", "bevel");
    this._set("font", this._font.value);
    this._ready = true;

    this._legacyCtx.group = space.element;
  }

  /**
   * Mirror style writes into the legacy scope context, so the static per-element helpers
   * (`SVGForm.circle( form.scope(player), ... )`) draw with the form's current fill, stroke,
   * alpha, and font as they did before the rendering-context path existed.
   */
  protected _set(key: string, value: unknown): void {
    const legacy = _legacyStyleKeys[key];
    if (legacy) {
      // gradient and pattern objects have no inline-style form; keep the last color
      if (typeof value === "string" || typeof value === "number") {
        this._legacyCtx.style[legacy] = value;
      }
    }
    super._set(key, value);
  }

  get filled(): boolean {
    return this._filled;
  }
  set filled(b: boolean) {
    this._filled = b;
    this._legacyCtx.style.filled = b;
  }

  get stroked(): boolean {
    return this._stroked;
  }
  set stroked(b: boolean) {
    this._stroked = b;
    this._legacyCtx.style.stroked = b;
  }

  /**
   * Offscreen buffers require Canvas output. In SVG this warns once and draws directly.
   */
  useOffscreen(_off: boolean = true, _clear: boolean | string = false): this {
    SVGForm._warnOffscreen();
    return this;
  }

  /**
   * Offscreen buffers require Canvas output. In SVG this warns once and does nothing.
   */
  renderOffscreen(_offset: PtLike = [0, 0]): void {
    SVGForm._warnOffscreen();
  }

  private static _warnOffscreen() {
    if (_svgFormOffscreenWarned) return;
    _svgFormOffscreenWarned = true;
    Util.warn(
      "offscreen canvases are not supported in SVG output; use CanvasSpace",
    );
  }

  /**
   * Get the [`SVGSpace`](#link) instance that this form is associated with.
   */
  get space(): SVGSpace {
    return this._svgSpace;
  }

  /**
   * The underlying [`SVGContext2D`](#link), for advanced use.
   */
  get svgContext(): SVGContext2D {
    return this._svgCtx;
  }

  /**
   * Add custom class to the created element(s). In batched rendering the class applies to
   * the current style run.
   * @param c custom class name or `false` to reset it
   * @example `form.fill("#f00").cls("myClass").rects(r)` `form.cls(false).circles(c)`
   */
  cls(c: string | boolean) {
    const cls = typeof c == "boolean" ? "" : c;
    this._legacyCtx.currentClass = cls;
    this._svgCtx.className = cls;
    return this;
  }

  // ------------------------------------------------- legacy scope workflow

  /**
   * @deprecated No longer needed: elements are reconciled automatically each frame. Kept
   * for compatibility with code that pairs it with the legacy static helpers.
   */
  updateScope(group_id: string, group?: Element): DOMFormContext {
    this._legacyCtx.group = group;
    this._legacyCtx.groupID = group_id;
    this._legacyCtx.groupCount = 0;
    this.nextID();
    return this._legacyCtx;
  }

  /**
   * @deprecated No longer needed: elements are reconciled automatically each frame. Kept
   * for compatibility; returns the legacy context used by the static helpers.
   */
  scope(item: IPlayer) {
    if (!item || item.animateID == null)
      throw new Error("item not defined or not yet added to Space");
    // two forms scoped to the same player must not generate the same ids
    return this.updateScope(
      `${SVGForm.scopeID(item)}-f${this._formID}`,
      this._svgSpace.element,
    );
  }

  /**
   * @deprecated Part of the legacy scope workflow.
   */
  nextID(): string {
    this._legacyCtx.groupCount++;
    this._legacyCtx.currentID = `${this._legacyCtx.groupID}-${this._legacyCtx.groupCount}`;
    return this._legacyCtx.currentID;
  }

  /**
   * A static function to generate an ID string based on a context object.
   * @param ctx a context object for an SVGForm
   */
  static getID(ctx: DOMFormContext): string {
    return ctx.currentID || `p-${SVGForm.domID++}`;
  }

  /**
   * A static function to generate an ID string for a scope, based on an [`IPlayer`](#link) object in the Space.
   * @param item a [`IPlayer`](#link) object that's added to space (see [`Space.add`](#link)) and has an `animateID` property
   */
  static scopeID(item: IPlayer): string {
    return `item-${item.animateID}`;
  }

  // --------------------------------------- legacy per-element static helpers
  // These draw one SVG element per call using id-based lookup, exactly as
  // before. They are retained for compatibility and for expanded exports.

  /**
   * A static function to help adding style object to an element.
   * Note that this put all styles into `style` attribute instead of individual svg attributes, so that the styles can be parsed by Adobe Illustrator.
   * @param elem A DOM element to add to
   * @param styles an object of style properties
   * @example `SVGForm.style(elem, {fill: "#f90", stroke: false})`
   * @returns this DOM element
   */
  static style(elem: SVGElement, styles: Record<string, any>) {
    let st = [];

    if (!styles["filled"]) st.push("fill: none");
    if (!styles["stroked"]) st.push("stroke: none");

    for (let k in styles) {
      if (styles.hasOwnProperty(k) && k != "filled" && k != "stroked") {
        let v = styles[k];
        if (v) {
          if (!styles["filled"] && k.indexOf("fill") === 0) {
            continue;
          } else if (!styles["stroked"] && k.indexOf("stroke") === 0) {
            continue;
          } else {
            st.push(`${k}: ${v}`);
          }
        }
      }
    }

    return DOMSpace.setAttr(elem, { style: st.join(";") });
  }

  /** Draw through a rendering context, or use the legacy per-element DOM context. */
  static point(
    ctx: DOMFormContext,
    pt: PtLike,
    radius?: number,
    shape?: string,
  ): SVGElement;
  static point(
    ctx: RenderingContext2D,
    pt: PtLike,
    radius?: number,
    shape?: string,
  ): void;
  static point(
    ctx: DOMFormContext | RenderingContext2D,
    pt: PtLike,
    radius = 5,
    shape = "square",
  ) {
    return "style" in ctx
      ? SVGForm.pointElement(ctx, pt, radius, shape)
      : CanvasForm.point(ctx, pt, radius, shape);
  }

  /** Draw through a rendering context, or use the legacy per-element DOM context. */
  static circle(ctx: DOMFormContext, pt: PtLike, radius?: number): SVGElement;
  static circle(ctx: RenderingContext2D, pt: PtLike, radius?: number): void;
  static circle(
    ctx: DOMFormContext | RenderingContext2D,
    pt: PtLike,
    radius = 10,
  ) {
    return "style" in ctx
      ? SVGForm.circleElement(ctx, pt, radius)
      : CanvasForm.circle(ctx, pt, radius);
  }

  /** Draw through a rendering context, or use the legacy per-element DOM context. */
  static arc(
    ctx: DOMFormContext,
    pt: PtLike,
    radius: number,
    startAngle: number,
    endAngle: number,
    cc?: boolean,
  ): SVGElement;
  static arc(
    ctx: RenderingContext2D,
    pt: PtLike,
    radius: number,
    startAngle: number,
    endAngle: number,
    cc?: boolean,
  ): void;
  static arc(
    ctx: DOMFormContext | RenderingContext2D,
    pt: PtLike,
    radius: number,
    startAngle: number,
    endAngle: number,
    cc?: boolean,
  ) {
    return "style" in ctx
      ? SVGForm.arcElement(ctx, pt, radius, startAngle, endAngle, cc)
      : CanvasForm.arc(ctx, pt, radius, startAngle, endAngle, cc);
  }

  /** Draw through a rendering context, or use the legacy per-element DOM context. */
  static square(ctx: DOMFormContext, pt: PtLike, halfsize: number): SVGElement;
  static square(ctx: RenderingContext2D, pt: PtLike, halfsize: number): void;
  static square(
    ctx: DOMFormContext | RenderingContext2D,
    pt: PtLike,
    halfsize: number,
  ) {
    return "style" in ctx
      ? SVGForm.squareElement(ctx, pt, halfsize)
      : CanvasForm.square(ctx, pt, halfsize);
  }

  /** Draw through a rendering context, or use the legacy per-element DOM context. */
  static line(ctx: DOMFormContext, pts: PtLikeIterable): SVGElement | undefined;
  static line(ctx: RenderingContext2D, pts: PtLikeIterable): void;
  static line(ctx: DOMFormContext | RenderingContext2D, pts: PtLikeIterable) {
    return "style" in ctx
      ? SVGForm.lineElement(ctx, pts)
      : CanvasForm.line(ctx, pts);
  }

  /** Draw through a rendering context, or use the legacy per-element DOM context. */
  static polygon(ctx: DOMFormContext, pts: PtLikeIterable): SVGElement;
  static polygon(ctx: RenderingContext2D, pts: PtLikeIterable): void;
  static polygon(
    ctx: DOMFormContext | RenderingContext2D,
    pts: PtLikeIterable,
  ) {
    return "style" in ctx
      ? SVGForm.polygonElement(ctx, pts)
      : CanvasForm.polygon(ctx, pts);
  }

  /** Draw through a rendering context, or use the legacy per-element DOM context. */
  static rect(ctx: DOMFormContext, pts: PtLikeIterable): SVGElement | undefined;
  static rect(ctx: RenderingContext2D, pts: PtLikeIterable): void;
  static rect(ctx: DOMFormContext | RenderingContext2D, pts: PtLikeIterable) {
    return "style" in ctx
      ? SVGForm.rectElement(ctx, pts)
      : CanvasForm.rect(ctx, pts);
  }

  /** Draw through a rendering context, or use the legacy per-element DOM context. */
  static bezier(
    ctx: DOMFormContext,
    pts: PtLikeIterable,
  ): SVGElement | undefined;
  static bezier(ctx: RenderingContext2D, pts: PtLikeIterable): void;
  static bezier(ctx: DOMFormContext | RenderingContext2D, pts: PtLikeIterable) {
    return "style" in ctx
      ? SVGForm.bezierElement(ctx, pts)
      : CanvasForm.bezier(ctx, pts);
  }

  /** Draw through a rendering context, or use the legacy per-element DOM context. */
  static compound(
    ctx: DOMFormContext,
    rings: Iterable<PtLikeIterable>,
  ): SVGElement | undefined;
  static compound(
    ctx: RenderingContext2D,
    rings: Iterable<PtLikeIterable>,
  ): void;
  static compound(
    ctx: DOMFormContext | RenderingContext2D,
    rings: Iterable<PtLikeIterable>,
  ) {
    return "style" in ctx
      ? SVGForm.compoundElement(ctx, rings)
      : CanvasForm.compound(ctx, rings);
  }

  /** Draw through a rendering context, or use the legacy per-element DOM context. */
  static text(ctx: DOMFormContext, pt: PtLike, txt: string): SVGElement;
  static text(
    ctx: RenderingContext2D,
    pt: PtLike,
    txt: string,
    maxWidth?: number,
  ): void;
  static text(
    ctx: DOMFormContext | RenderingContext2D,
    pt: PtLike,
    txt: string,
    maxWidth?: number,
  ) {
    return "style" in ctx
      ? SVGForm.textElement(ctx, pt, txt)
      : CanvasForm.text(ctx, pt, txt, maxWidth);
  }

  /**
   * A static function to draw a point as a circle or square element.
   * @param ctx a context object of SVGForm
   * @param pt a Pt object or numeric array
   * @param radius radius of the point. Default is 5.
   * @param shape The shape of the point. Defaults to "square", but it can be "circle" or a custom shape function in your own implementation.
   * @example `SVGForm.point( ctx, p )`, `SVGForm.point( ctx, p, 10, "circle" )`
   */
  static pointElement(
    ctx: DOMFormContext,
    pt: PtLike,
    radius: number = 5,
    shape: string = "square",
  ): SVGElement {
    if (shape === "circle") {
      return SVGForm.circleElement(ctx, pt, radius);
    } else {
      return SVGForm.squareElement(ctx, pt, radius);
    }
  }

  /**
   * A static function to draw a circle element.
   * @param ctx a context object of SVGForm
   * @param pt center position of the circle
   * @param radius radius of the circle
   */
  static circleElement(
    ctx: DOMFormContext,
    pt: PtLike,
    radius: number = 10,
  ): SVGElement {
    let elem = SVGSpace.svgElement(ctx.group, "circle", SVGForm.getID(ctx));

    DOMSpace.setAttr(elem, {
      cx: pt[0],
      cy: pt[1],
      r: radius,
      class: `pts-svgform pts-circle ${ctx.currentClass}`,
    });

    SVGForm.style(elem, ctx.style);
    return elem;
  }

  /**
   * A static function to draw an arc element.
   * @param ctx a context object of SVGForm
   * @param pt center position
   * @param radius radius of the arc circle
   * @param startAngle start angle of the arc
   * @param endAngle end angle of the arc
   * @param cc an optional boolean value to specify if it should be drawn clockwise (`false`) or counter-clockwise (`true`). Default is clockwise.
   */
  static arcElement(
    ctx: DOMFormContext,
    pt: PtLike,
    radius: number,
    startAngle: number,
    endAngle: number,
    cc?: boolean,
  ): SVGElement {
    let elem = SVGSpace.svgElement(ctx.group, "path", SVGForm.getID(ctx));

    const start = new Pt(pt).toAngle(startAngle, radius, true);
    const end = new Pt(pt).toAngle(endAngle, radius, true);
    const diff = Geom.boundAngle(endAngle) - Geom.boundAngle(startAngle);
    let largeArc = diff > Const.pi ? true : false;
    if (cc) largeArc = !largeArc;
    const sweep = cc ? "0" : "1";

    const d = `M ${start[0]} ${start[1]} A ${radius} ${radius} 0 ${largeArc ? "1" : "0"} ${sweep} ${end[0]} ${end[1]}`;

    DOMSpace.setAttr(elem, {
      d: d,
      class: `pts-svgform pts-arc ${ctx.currentClass}`,
    });
    SVGForm.style(elem, ctx.style);
    return elem;
  }

  /**
   * A static function to draw a square element.
   * @param ctx a context object of SVGForm
   * @param pt center position of the square
   * @param halfsize half size of the square
   */
  static squareElement(ctx: DOMFormContext, pt: PtLike, halfsize: number) {
    let elem = SVGSpace.svgElement(ctx.group, "rect", SVGForm.getID(ctx));
    DOMSpace.setAttr(elem, {
      x: pt[0] - halfsize,
      y: pt[1] - halfsize,
      width: halfsize * 2,
      height: halfsize * 2,
      class: `pts-svgform pts-square ${ctx.currentClass}`,
    });
    SVGForm.style(elem, ctx.style);
    return elem;
  }

  /**
   * A static function to draw a line or polyline element.
   * @param ctx a context object of SVGForm
   * @param pts a Group or an Iterable<PtLike>
   */
  static lineElement(
    ctx: DOMFormContext,
    pts: PtLikeIterable,
  ): SVGElement | undefined {
    let points = SVGForm.pointsString(pts);
    if (points.count < 2) return;

    // if count > 2, treat it as poly-line
    if (points.count > 2) return SVGForm._poly(ctx, points.string, false);

    // if count == 2, treat it as line
    let elem = SVGSpace.svgElement(ctx.group, "line", SVGForm.getID(ctx));
    let p = Util.iterToArray(pts);

    DOMSpace.setAttr(elem, {
      x1: p[0][0],
      y1: p[0][1],
      x2: p[1][0],
      y2: p[1][1],
      class: `pts-svgform pts-line ${ctx.currentClass}`,
    });

    SVGForm.style(elem, ctx.style);
    return elem;
  }

  /**
   * A static helper function to draw polyline or polygon.
   * @param ctx a context object of SVGForm
   * @param points a string of points' positions. See `SVGForm.pointsString` for conversion.
   * @param closePath a boolean to specify if the polygon path should be closed
   */
  protected static _poly(
    ctx: DOMFormContext,
    points: string,
    closePath: boolean = true,
  ) {
    let elem = SVGSpace.svgElement(
      ctx.group,
      closePath ? "polygon" : "polyline",
      SVGForm.getID(ctx),
    );

    DOMSpace.setAttr(elem, {
      points: points,
      class: `pts-svgform pts-polygon ${ctx.currentClass}`,
    });
    SVGForm.style(elem, ctx.style);
    return elem;
  }

  /**
   * Given a list of points, return a space-separated string
   * @param pts a Group or an Iterable<PtLike>
   * @returns an object of {string, count}
   */
  protected static pointsString(pts: PtLikeIterable): {
    string: string;
    count: number;
  } {
    let points: string = "";
    let count = 0;
    for (let p of pts) {
      points += `${p[0]},${p[1]} `;
      count++;
    }
    return { string: points, count: count };
  }

  /**
   * A static function to draw a polygon element.
   * @param ctx a context object of SVGForm
   * @param pts a Group or an Iterable<PtLike> representing a polygon
   */
  static polygonElement(ctx: DOMFormContext, pts: PtLikeIterable): SVGElement {
    let points = SVGForm.pointsString(pts);
    return SVGForm._poly(ctx, points.string, true);
  }

  /**
   * A static function to draw a chain of cubic Bezier curves as one path element.
   * @param ctx a context object of SVGForm
   * @param pts a Group or an Iterable<PtLike> in the layout of [`Curve.bezier`](#link); an incomplete trailing segment is ignored
   */
  static bezierElement(
    ctx: DOMFormContext,
    pts: PtLikeIterable,
  ): SVGElement | undefined {
    const p = Util.iterToArray(pts);
    if (p.length < 4) return;
    let d = `M${p[0][0]} ${p[0][1]}`;
    for (let i = 3; i < p.length; i += 3) {
      d += `C${p[i - 2][0]} ${p[i - 2][1]} ${p[i - 1][0]} ${p[i - 1][1]} ${p[i][0]} ${p[i][1]}`;
    }
    return SVGForm._pathElement(ctx, d);
  }

  /**
   * A static function to draw a compound polygon as one path element, so that a ring inside another with the opposite orientation becomes a hole.
   * @param ctx a context object of SVGForm
   * @param rings an Array/Iterable of rings, each a Group or an Iterable<PtLike>; rings with fewer than 2 points are skipped
   */
  static compoundElement(
    ctx: DOMFormContext,
    rings: Iterable<PtLikeIterable>,
  ): SVGElement | undefined {
    let d = "";
    for (const ring of rings) {
      const p = Util.iterToArray(ring);
      if (p.length < 2 || typeof p[0][0] !== "number") continue;
      d += `M${p[0][0]} ${p[0][1]}`;
      for (let i = 1; i < p.length; i++) d += `L${p[i][0]} ${p[i][1]}`;
      d += "Z";
    }
    if (d === "") return;
    return SVGForm._pathElement(ctx, d);
  }

  protected static _pathElement(ctx: DOMFormContext, d: string): SVGElement {
    const elem = SVGSpace.svgElement(ctx.group, "path", SVGForm.getID(ctx));
    DOMSpace.setAttr(elem, {
      d,
      class: `pts-svgform pts-path ${ctx.currentClass}`,
    });
    SVGForm.style(elem, ctx.style);
    return elem;
  }

  /**
   * A static function to draw a rectangle element.
   * @param ctx a context object of SVGForm
   * @param pts a Group or an Iterable<PtLike> with 2 Pt specifying the top-left and bottom-right positions.
   */
  static rectElement(
    ctx: DOMFormContext,
    pts: PtLikeIterable,
  ): SVGElement | undefined {
    if (!Util.arrayCheck(pts)) return;

    let elem = SVGSpace.svgElement(ctx.group, "rect", SVGForm.getID(ctx));
    let bound = Group.fromArray(pts).boundingBox();
    let size = Rectangle.size(bound);

    DOMSpace.setAttr(elem, {
      x: bound[0][0],
      y: bound[0][1],
      width: size[0],
      height: size[1],
      class: `pts-svgform pts-rect ${ctx.currentClass}`,
    });

    SVGForm.style(elem, ctx.style);
    return elem;
  }

  /**
   * A static function to draw a text element.
   * @param ctx a context object of SVGForm
   * @param pt a Point object to specify the anchor point
   * @param txt a string of text to draw
   */
  static textElement(ctx: DOMFormContext, pt: PtLike, txt: string): SVGElement {
    let elem = SVGSpace.svgElement(ctx.group, "text", SVGForm.getID(ctx));

    DOMSpace.setAttr(elem, {
      "pointer-events": "none",
      x: pt[0],
      y: pt[1],
      dx: 0,
      dy: 0,
      class: `pts-svgform pts-text ${ctx.currentClass}`,
    });

    elem.textContent = txt;

    SVGForm.style(elem, ctx.style);

    return elem;
  }
}
