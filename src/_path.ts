/*! Pts.js is licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */

import { Pt, Group } from "./Pt";
import { Util } from "./Util";
import { crossingParameter, orient2d } from "./_triangulate";
import { type PolygonLike, type PtLike, type PtLikeIterable } from "./Types";

/**
 * Internal planar overlay used by [`Path`](#link).
 *
 * Every mode is the same computation: build the arrangement of all input
 * edges, label each face with the winding number of every shape, keep the
 * faces the mode asks for, and either merge them (unite, intersect, exclude,
 * minus front, minus back) or emit each one (divide, crop).
 *
 * Input vertices within `tol` are merged before constructing edges, and a
 * vertex within `tol` of an edge's interior then splits that edge. This is an
 * intentional geometric tolerance, not the precision of a Float32 point: it
 * makes T-junctions, shared edges, and edges that coincide up to rounding
 * share their vertices. Both happen before any crossing is computed, so no
 * crossing is decided on geometry that a later split would bend. The proper
 * crossings of the resulting sub-edges are then found with exact orientation
 * predicates and an exactly evaluated crossing parameter, and merged at
 * double rounding precision, independently of the input tolerance.
 * Coincident sub-edges carry sparse per-shape winding deltas. Faces are
 * half-edge cycles, labeled by flooding from one seed per component. Holes
 * find their outer ring with a ray to the west. Output coordinates are
 * Float32 Pts, so features below that precision may still collapse, and
 * rings thinner than `tol` (hairlines left by edges that coincide up to
 * rounding) are dropped.
 */

/** The seven Path modes. */
export type PathMode =
  | "unite"
  | "intersect"
  | "exclude"
  | "minusFront"
  | "minusBack"
  | "divide"
  | "crop";

// The snapping grid has cells of 64 tol, so a point only needs a neighboring
// cell checked when it lies within tol of that cell's border, and the cell
// indices stay within ±2^14 (tol is a fixed fraction of the largest
// coordinate), which keeps every key a small integer.
const CELL_TOLS = 64;
const CELL_OFFSET = 16384;
const CELL_SPAN = 32768;
// A westward ray query either scans every edge or walks the bounding-box
// tree; scanning costs about E per query and the tree about E log E to build,
// so the tree pays off after this many queries times log2(E). The number of
// queries is known before they start: components for the seeds, holes for
// the owners.
const RAY_TREE_PER_LOG = 1.5;
// Candidate pairs from the first sweep are kept, up to this many, so that the
// second sweep can replay them when the first registered no split (the common
// case). Beyond the cap they are streamed and enumerated again.
const PAIR_BUFFER = 1 << 18;

/** The rings of a shape as arrays of points: one ring (its first item is a point) or a list of rings. */
function ringsOf(shape: PolygonLike): PtLike[][] {
  const list = Util.iterToArray(shape as Iterable<unknown>);
  if (list.length === 0) return [];
  const first = list[0];
  if (first != null && typeof first[0] === "number") return [list];
  const rings: PtLike[][] = new Array(list.length);
  for (let i = 0; i < list.length; i++) rings[i] = Util.iterToArray(list[i]);
  return rings;
}

/**
 * A trig-free stand-in for `atan2`: increases counterclockwise over [0, 4),
 * starting at west like atan2's range does, so the sort order and the
 * "largest angle" at a leftmost vertex are the same as with atan2.
 */
function pseudoAngle(dx: number, dy: number): number {
  const s = (dx < 0 ? -dx : dx) + (dy < 0 ? -dy : dy);
  // counterclockwise from east: [0, 4)
  const d =
    dy >= 0
      ? dx >= 0
        ? dy / s
        : 1 - dx / s
      : dx < 0
        ? 2 - dy / s
        : 3 + dx / s;
  return d >= 2 ? d - 2 : d + 2;
}

/** Add a winding delta, keeping zero entries out of the sparse vector. */
function addWinding(
  vector: Map<number, number>,
  shape: number,
  delta: number,
): void {
  const value = (vector.get(shape) ?? 0) + delta;
  if (value === 0) vector.delete(shape);
  else vector.set(shape, value);
}

/** How many distinct points a ring has, up to three: enough to tell a real ring from a degenerate one. */
function distinctPoints(ring: PtLike[]): number {
  const seen: PtLike[] = [];
  for (let i = 0; i < ring.length && seen.length < 3; i++) {
    const p = ring[i];
    let dup = false;
    for (let j = 0; j < seen.length; j++) {
      if (seen[j][0] === p[0] && seen[j][1] === p[1]) {
        dup = true;
        break;
      }
    }
    if (!dup) seen.push(p);
  }
  return seen.length;
}

/**
 * Reorder `items[lo, hi)` so the item at `k` has the key it would have when
 * sorted, smaller keys before it and larger after (Hoare quickselect).
 */
function selectByKey(
  items: Uint32Array,
  key: Float64Array,
  lo: number,
  hi: number,
  k: number,
): void {
  let l = lo;
  let r = hi - 1;
  while (l < r) {
    const pivot = key[items[(l + r) >> 1]];
    let i = l;
    let j = r;
    while (i <= j) {
      while (key[items[i]] < pivot) i++;
      while (key[items[j]] > pivot) j--;
      if (i <= j) {
        const t = items[i];
        items[i] = items[j];
        items[j] = t;
        i++;
        j--;
      }
    }
    if (k <= j) r = j;
    else if (k >= i) l = i;
    else return;
  }
}

/** Output perimeter, for the hairline test. */
function outputPerimeter(ring: Group): number {
  let length = 0;
  for (let i = 0, n = ring.length; i < n; i++) {
    const a = ring[i];
    const b = ring[i === n - 1 ? 0 : i + 1];
    length += Math.hypot(b[0] - a[0], b[1] - a[1]);
  }
  return length;
}

/** Output area relative to the first point, avoiding large-offset cancellation. */
function outputArea(ring: Group): number {
  let area = 0;
  const a = ring[0];
  for (let i = 1; i + 1 < ring.length; i++) {
    const b = ring[i],
      c = ring[i + 1];
    area += (b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1]);
  }
  return area / 2;
}

/** Edge bounding boxes and the edges ordered by their left side, for a sweep. */
type SweepBoxes = {
  minX: Float64Array;
  maxX: Float64Array;
  minY: Float64Array;
  maxY: Float64Array;
  order: Uint32Array;
};

/** Bounds of nonhorizontal edges used by westward rays. */
type RayNode = {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  // A ray in this interval crosses every edge in the node. If the node is
  // wholly west of the query, its aggregate winding can be added at once.
  allY0: number;
  allY1: number;
  sum: Map<number, number>;
  edges?: number[];
  left?: RayNode;
  right?: RayNode;
};

/** Internal arrangement, also exposed to the geometry invariant tests. */
export class Overlay {
  tol = 0;
  private rounding = 0;
  k = 0; // number of shapes

  // vertices in doubles, with a grid hash for snapping
  vx: number[] = [];
  vy: number[] = [];
  private cells = new Map<number, number[]>();

  // input edges, directed, one shape each
  ea: number[] = [];
  eb: number[] = [];
  es: number[] = [];

  // split events: (edge, parameter, vertex)
  private spE: number[] = [];
  private spT: number[] = [];
  private spV: number[] = [];

  // graph edges, low vertex to high vertex, with nonzero per-shape deltas
  gu: number[] = [];
  gv: number[] = [];
  deltas: Map<number, number>[] = [];

  // half-edges: 2e runs low to high, 2e + 1 the other way
  offset!: Int32Array; // outgoing half-edges of vertex v are out[offset[v] .. offset[v + 1])
  out!: Int32Array;
  slot!: Int32Array; // index of each half-edge in its origin's sorted list
  next!: Int32Array; // the next half-edge of the face on the left
  cycle!: Int32Array; // cycle id per half-edge
  cycleArea: number[] = [];
  cycleStart: number[] = [];
  // per cycle: how many shapes wind around its face, and whether the first
  // and last shapes do. That is all the modes need, so the full sparse
  // winding vectors are kept only when `label(true)` asks for them (tests).
  count!: Int32Array;
  hasFirst!: Uint8Array;
  hasLast!: Uint8Array;
  labels?: Map<number, number>[];
  // undefined: not built yet; null: built, but no edge can cross a ray
  private rayIndex: RayNode | null | undefined;

  origin(h: number): number {
    return h & 1 ? this.gv[h >> 1] : this.gu[h >> 1];
  }

  target(h: number): number {
    return h & 1 ? this.gu[h >> 1] : this.gv[h >> 1];
  }

  // ------------------------------------------------------------- input

  /** Read the shapes into snapped vertices and directed edges. False when there is nothing to combine. */
  read(shapes: Iterable<PolygonLike> | PtLikeIterable): boolean {
    let list: unknown[] = Util.iterToArray(shapes as Iterable<unknown>);
    // A single ring of points is the likeliest misuse (every Polygon function
    // takes one Group); treat it as a list of one shape.
    if (
      list.length > 0 &&
      list[0] != null &&
      typeof (list[0] as ArrayLike<unknown>)[0] === "number"
    ) {
      list = [list];
    }
    this.k = list.length;
    const rings: PtLike[][] = [];
    const ringShape: number[] = [];
    let maxAbs = 0;

    // first pass: the scale that sets the tolerance, and which rings are usable
    for (let s = 0; s < list.length; s++) {
      const shapeRings = ringsOf(list[s] as PolygonLike);
      for (let r = 0; r < shapeRings.length; r++) {
        const ring = shapeRings[r];
        if (ring.length < 3) continue;
        let finite = true;
        let max = maxAbs;
        for (let i = 0, n = ring.length; i < n; i++) {
          const x = +ring[i][0];
          const y = +ring[i][1];
          if (!(Number.isFinite(x) && Number.isFinite(y))) {
            finite = false;
            break;
          }
          const ax = x < 0 ? -x : x;
          const ay = y < 0 ? -y : y;
          if (ax > max) max = ax;
          if (ay > max) max = ay;
        }
        if (!finite) {
          Util.warn("Path skipped a ring with a non-finite coordinate");
          continue;
        }
        maxAbs = max;
        rings.push(ring);
        ringShape.push(s);
      }
    }
    if (rings.length === 0 || maxAbs === 0) return false;
    this.tol = maxAbs * 1e-6;
    this.rounding = maxAbs * Number.EPSILON * 8;

    // second pass: snap each ring's points to vertices, dropping consecutive
    // repeats and the closing repeat, then emit its edges
    const ids: number[] = [];
    for (let r = 0; r < rings.length; r++) {
      const ring = rings[r];
      ids.length = 0;
      let prev = -1;
      for (let i = 0, n = ring.length; i < n; i++) {
        const v = this.vertexAt(+ring[i][0], +ring[i][1]);
        if (v !== prev) {
          ids.push(v);
          prev = v;
        }
      }
      while (ids.length > 1 && ids[ids.length - 1] === ids[0]) ids.pop();
      if (ids.length >= 3) {
        for (let i = 0, n = ids.length; i < n; i++) {
          this.ea.push(ids[i]);
          this.eb.push(ids[i === n - 1 ? 0 : i + 1]);
          this.es.push(ringShape[r]);
        }
      } else if (distinctPoints(ring) >= 3) {
        Util.warn(
          "Path dropped a ring whose points merge within the tolerance; use local coordinates for small shapes at large offsets",
        );
      }
    }
    return this.ea.length > 0;
  }

  /** The vertex within `tol` of (x, y), or a new one. */
  vertexAt(x: number, y: number, tol = this.tol): number {
    const cellSize = this.tol * CELL_TOLS;
    const fx = x / cellSize;
    const fy = y / cellSize;
    const cx = Math.floor(fx);
    const cy = Math.floor(fy);
    // neighbors to check: only across a border closer than tol
    const border = tol / cellSize;
    const x0 = fx - cx <= border ? -1 : 0;
    const x1 = fx - cx >= 1 - border ? 1 : 0;
    const y0 = fy - cy <= border ? -1 : 0;
    const y1 = fy - cy >= 1 - border ? 1 : 0;
    const t2 = tol * tol;
    for (let i = x0; i <= x1; i++) {
      for (let j = y0; j <= y1; j++) {
        const cell = this.cells.get(
          (cx + i + CELL_OFFSET) * CELL_SPAN + (cy + j + CELL_OFFSET),
        );
        if (!cell) continue;
        for (let n = 0; n < cell.length; n++) {
          const v = cell[n];
          const dx = this.vx[v] - x;
          const dy = this.vy[v] - y;
          if (dx * dx + dy * dy <= t2) return v;
        }
      }
    }
    const id = this.vx.length;
    this.vx.push(x);
    this.vy.push(y);
    const key = (cx + CELL_OFFSET) * CELL_SPAN + (cy + CELL_OFFSET);
    const cell = this.cells.get(key);
    if (cell) cell.push(id);
    else this.cells.set(key, [id]);
    return id;
  }

  // ------------------------------------------------------------ splits

  /**
   * Split edges where they meet, in two phases. First, a vertex within tol of
   * an edge's interior splits that edge there, so T-junctions, shared and
   * overlapping edges, and vertices that miss an edge by rounding all become
   * shared vertices. That bends edges by up to tol, which is why it happens
   * before any crossing is computed. The second phase finds the proper
   * crossings of the resulting sub-edges with exact predicates, so no
   * crossing is decided on geometry that a later split would change.
   */
  split(): void {
    let boxes = this.boxes();
    const pairs = this.sweep(boxes, this.tol, true);
    if (this.spE.length > 0) {
      // the sub-edges are new edges; enumerate their pairs again, exactly
      this.applySplits();
      boxes = this.boxes();
      this.sweep(boxes, 0, false);
    } else if (pairs) {
      for (let i = 0; i < pairs.length; i += 2) {
        this.crossPair(pairs[i], pairs[i + 1]);
      }
    } else {
      this.sweep(boxes, 0, false);
    }
  }

  /** Bounding boxes of the current edges, with the edges ordered by their left side. */
  private boxes(): SweepBoxes {
    const E = this.ea.length;
    const vx = this.vx;
    const vy = this.vy;
    const minX = new Float64Array(E);
    const maxX = new Float64Array(E);
    const minY = new Float64Array(E);
    const maxY = new Float64Array(E);
    for (let e = 0; e < E; e++) {
      const ax = vx[this.ea[e]];
      const ay = vy[this.ea[e]];
      const bx = vx[this.eb[e]];
      const by = vy[this.eb[e]];
      minX[e] = ax < bx ? ax : bx;
      maxX[e] = ax < bx ? bx : ax;
      minY[e] = ay < by ? ay : by;
      maxY[e] = ay < by ? by : ay;
    }
    const order = new Uint32Array(E);
    for (let e = 0; e < E; e++) order[e] = e;
    order.sort((p, q) => minX[p] - minX[q]);
    return { minX, maxX, minY, maxY, order };
  }

  /**
   * Run a phase over every two edges whose boxes, grown by `margin`, overlap:
   * the touch phase (which also returns the pairs, unless there are more than
   * the buffer holds) or the crossing phase. Pairs are visited as they are
   * found rather than listed first: shapes that all share a vertex have
   * quadratically many candidate pairs, more than an array can hold.
   */
  private sweep(
    boxes: SweepBoxes,
    margin: number,
    touching: boolean,
  ): number[] | undefined {
    const { minX, maxX, minY, maxY, order } = boxes;
    let pairs: number[] | undefined = touching ? [] : undefined;
    for (let i = 0, E = order.length; i < E; i++) {
      const e1 = order[i];
      const limit = maxX[e1] + margin;
      const lo = minY[e1] - margin;
      const hi = maxY[e1] + margin;
      for (let j = i + 1; j < E; j++) {
        const e2 = order[j];
        if (minX[e2] > limit) break;
        if (minY[e2] > hi || maxY[e2] < lo) continue;
        if (touching) {
          this.touchPair(e1, e2, boxes);
          if (pairs) {
            if (pairs.length < 2 * PAIR_BUFFER) pairs.push(e1, e2);
            else pairs = undefined;
          }
        } else {
          this.crossPair(e1, e2);
        }
      }
    }
    return pairs;
  }

  /** Phase one: each endpoint of one edge within tol of the other edge's interior splits it. */
  private touchPair(e1: number, e2: number, boxes: SweepBoxes): void {
    const a = this.ea[e1];
    const b = this.eb[e1];
    const c = this.ea[e2];
    const d = this.eb[e2];
    // an endpoint can only touch an edge whose box it is in (grown by tol)
    if (this.inBox(a, e2, boxes)) this.touch(e2, a, c, d);
    if (this.inBox(b, e2, boxes)) this.touch(e2, b, c, d);
    if (this.inBox(c, e1, boxes)) this.touch(e1, c, a, b);
    if (this.inBox(d, e1, boxes)) this.touch(e1, d, a, b);
  }

  private inBox(v: number, e: number, boxes: SweepBoxes): boolean {
    const x = this.vx[v];
    const y = this.vy[v];
    const tol = this.tol;
    return (
      x >= boxes.minX[e] - tol &&
      x <= boxes.maxX[e] + tol &&
      y >= boxes.minY[e] - tol &&
      y <= boxes.maxY[e] + tol
    );
  }

  /** Register vertex `v` on edge `e` (from `p` to `q`) when it lies within tol of the edge's interior. */
  private touch(e: number, v: number, p: number, q: number): void {
    if (v === p || v === q) return;
    const vx = this.vx;
    const vy = this.vy;
    const px = vx[p];
    const py = vy[p];
    const rx = vx[q] - px;
    const ry = vy[q] - py;
    const len2 = rx * rx + ry * ry;
    const dx = vx[v] - px;
    const dy = vy[v] - py;
    const t = (dx * rx + dy * ry) / len2;
    if (t <= 0 || t >= 1) return;
    const cross = rx * dy - ry * dx;
    if (cross * cross > this.tol * this.tol * len2) return;
    this.registerSplit(e, v);
  }

  /** Phase two: split two sub-edges that share no vertex at their proper crossing. */
  private crossPair(e1: number, e2: number): void {
    const a = this.ea[e1];
    const b = this.eb[e1];
    const c = this.ea[e2];
    const d = this.eb[e2];
    if (a === c || a === d || b === c || b === d) return;

    // Exact signs keep shallow crossings distinct from collinear overlaps.
    const vx = this.vx;
    const vy = this.vy;
    const ax = vx[a];
    const ay = vy[a];
    const bx = vx[b];
    const by = vy[b];
    const cx = vx[c];
    const cy = vy[c];
    const dx = vx[d];
    const dy = vy[d];
    if (
      orient2d(ax, ay, bx, by, cx, cy) * orient2d(ax, ay, bx, by, dx, dy) >=
      0
    )
      return;
    if (
      orient2d(cx, cy, dx, dy, ax, ay) * orient2d(cx, cy, dx, dy, bx, by) >=
      0
    )
      return;
    const t = crossingParameter(ax, ay, bx, by, cx, cy, dx, dy);
    const v = this.vertexAt(
      ax + t * (bx - ax),
      ay + t * (by - ay),
      this.rounding,
    );
    this.registerSplit(e1, v);
    this.registerSplit(e2, v);
  }

  /** Replace every edge by its pieces between the registered split vertices, in order. */
  private applySplits(): void {
    const E = this.ea.length;
    const S = this.spE.length;
    const spE = this.spE;
    const spT = this.spT;
    const spV = this.spV;
    const order = new Uint32Array(S);
    for (let i = 0; i < S; i++) order[i] = i;
    order.sort((p, q) => spE[p] - spE[q] || spT[p] - spT[q]);
    const ea: number[] = [];
    const eb: number[] = [];
    const es: number[] = [];
    let si = 0;
    for (let e = 0; e < E; e++) {
      let u = this.ea[e];
      const end = this.eb[e];
      const s = this.es[e];
      while (si < S && spE[order[si]] === e) {
        const v = spV[order[si++]];
        if (v === u) continue;
        ea.push(u);
        eb.push(v);
        es.push(s);
        u = v;
      }
      if (u !== end) {
        ea.push(u);
        eb.push(end);
        es.push(s);
      }
    }
    this.ea = ea;
    this.eb = eb;
    this.es = es;
    spE.length = 0;
    spT.length = 0;
    spV.length = 0;
  }

  /** Record that edge `e` passes through vertex `v`. The parameter is always the projection, so repeats sort together. */
  private registerSplit(e: number, v: number): void {
    const a = this.ea[e];
    const b = this.eb[e];
    if (v === a || v === b) return;
    const ax = this.vx[a];
    const ay = this.vy[a];
    const rx = this.vx[b] - ax;
    const ry = this.vy[b] - ay;
    const t =
      ((this.vx[v] - ax) * rx + (this.vy[v] - ay) * ry) / (rx * rx + ry * ry);
    if (t <= 0 || t >= 1) return;
    this.spE.push(e);
    this.spT.push(t);
    this.spV.push(v);
  }

  // ------------------------------------------------------------- graph

  /** Turn the split edges into unique graph edges with per-shape deltas; drop edges that separate nothing. */
  merge(): void {
    if (this.spE.length > 0) this.applySplits();
    const V = this.vx.length;
    const index = new Map<number, number>();
    const gu = this.gu;
    const gv = this.gv;
    const deltas = this.deltas;
    for (let e = 0, E = this.ea.length; e < E; e++) {
      const u = this.ea[e];
      const v = this.eb[e];
      const lo = u < v ? u : v;
      const hi = u < v ? v : u;
      const key = lo * V + hi;
      let g = index.get(key);
      if (g === undefined) {
        g = gu.length;
        gu.push(lo);
        gv.push(hi);
        deltas.push(new Map());
        index.set(key, g);
      }
      addWinding(deltas[g], this.es[e], u === lo ? 1 : -1);
    }

    // compact away edges whose deltas are all zero
    let n = 0;
    for (let e = 0, len = gu.length; e < len; e++) {
      if (deltas[e].size === 0) continue;
      if (n !== e) {
        gu[n] = gu[e];
        gv[n] = gv[e];
        deltas[n] = deltas[e];
      }
      n++;
    }
    gu.length = n;
    gv.length = n;
    deltas.length = n;
  }

  /** The ray tree once enough queries justify building it; until then callers scan every edge. */
  private rayTree(): RayNode | null | undefined {
    return this.rayIndex;
  }

  /** Build the ray tree if the coming `queries` are more than scanning is worth. */
  private expectRayQueries(queries: number): void {
    const E = this.gu.length;
    if (
      this.rayIndex === undefined &&
      queries > RAY_TREE_PER_LOG * Math.log2(E + 1) + 1
    ) {
      this.rayIndex = this.indexRays() ?? null;
    }
  }

  /** Balanced bounding-box tree for seed winding and nearest boundary queries. */
  private indexRays(): RayNode | undefined {
    const E = this.gu.length;
    const vx = this.vx;
    const vy = this.vy;
    let n = 0;
    const edges = new Uint32Array(E);
    for (let e = 0; e < E; e++) {
      if (vy[this.gu[e]] !== vy[this.gv[e]]) edges[n++] = e;
    }
    if (n === 0) return undefined;
    // edge centers, so each level partitions by a plain number
    const cx = new Float64Array(E);
    const cy = new Float64Array(E);
    for (let e = 0; e < E; e++) {
      cx[e] = vx[this.gu[e]] + vx[this.gv[e]];
      cy[e] = vy[this.gu[e]] + vy[this.gv[e]];
    }
    const build = (lo: number, hi: number): RayNode => {
      const node: RayNode = {
        x0: Infinity,
        x1: -Infinity,
        y0: Infinity,
        y1: -Infinity,
        allY0: -Infinity,
        allY1: Infinity,
        sum: new Map(),
      };
      for (let i = lo; i < hi; i++) {
        const e = edges[i];
        const u = this.gu[e];
        const v = this.gv[e];
        const y0 = Math.min(vy[u], vy[v]);
        const y1 = Math.max(vy[u], vy[v]);
        node.x0 = Math.min(node.x0, vx[u], vx[v]);
        node.x1 = Math.max(node.x1, vx[u], vx[v]);
        node.y0 = Math.min(node.y0, y0);
        node.y1 = Math.max(node.y1, y1);
        node.allY0 = Math.max(node.allY0, y0);
        node.allY1 = Math.min(node.allY1, y1);
      }
      if (hi - lo <= 8) {
        node.edges = Array.from(edges.subarray(lo, hi));
        if (node.allY0 < node.allY1) {
          for (const e of node.edges) {
            const sign = vy[this.gv[e]] > vy[this.gu[e]] ? -1 : 1;
            for (const [s, d] of this.deltas[e])
              addWinding(node.sum, s, sign * d);
          }
        }
      } else {
        const key = node.x1 - node.x0 >= node.y1 - node.y0 ? cx : cy;
        const mid = (lo + hi) >> 1;
        selectByKey(edges, key, lo, hi, mid);
        node.left = build(lo, mid);
        node.right = build(mid, hi);
        if (node.allY0 < node.allY1) {
          for (const child of [node.left, node.right])
            for (const [s, d] of child.sum) addWinding(node.sum, s, d);
        }
      }
      return node;
    };
    return build(0, n);
  }

  // ------------------------------------------------------------- faces

  /** Order the half-edges around each vertex and trace the cycles that bound the faces. */
  trace(): void {
    const E = this.gu.length;
    const H = 2 * E;
    const V = this.vx.length;
    const vx = this.vx;
    const vy = this.vy;
    const gu = this.gu;
    const gv = this.gv;

    const angle = new Float64Array(H);
    for (let e = 0; e < E; e++) {
      const dx = vx[gv[e]] - vx[gu[e]];
      const dy = vy[gv[e]] - vy[gu[e]];
      angle[2 * e] = pseudoAngle(dx, dy);
      angle[2 * e + 1] = pseudoAngle(-dx, -dy);
    }

    const offset = new Int32Array(V + 1);
    for (let e = 0; e < E; e++) {
      offset[gu[e] + 1]++;
      offset[gv[e] + 1]++;
    }
    for (let v = 0; v < V; v++) offset[v + 1] += offset[v];
    const out = new Int32Array(H);
    const cursor = offset.slice(0, V);
    for (let e = 0; e < E; e++) {
      out[cursor[gu[e]]++] = 2 * e;
      out[cursor[gv[e]]++] = 2 * e + 1;
    }

    // counterclockwise order around each vertex; the lists are tiny, so an
    // insertion sort in place beats extracting them
    const slot = new Int32Array(H);
    for (let v = 0; v < V; v++) {
      const lo = offset[v];
      const hi = offset[v + 1];
      for (let i = lo + 1; i < hi; i++) {
        const h = out[i];
        const a = angle[h];
        let j = i - 1;
        while (
          j >= lo &&
          (angle[out[j]] > a ||
            (angle[out[j]] === a && this.target(out[j]) > this.target(h)))
        ) {
          out[j + 1] = out[j];
          j--;
        }
        out[j + 1] = h;
      }
      for (let i = lo; i < hi; i++) slot[out[i]] = i - lo;
    }

    // the face on the left of h continues along the first outgoing half-edge
    // clockwise from h's twin
    const next = new Int32Array(H);
    for (let h = 0; h < H; h++) {
      const v = this.target(h);
      const base = offset[v];
      const n = offset[v + 1] - base;
      const s = slot[h ^ 1];
      next[h] = out[base + (s === 0 ? n - 1 : s - 1)];
    }

    const cycle = new Int32Array(H).fill(-1);
    const cycleArea = this.cycleArea;
    const cycleStart = this.cycleStart;
    for (let h = 0; h < H; h++) {
      if (cycle[h] >= 0) continue;
      const c = cycleArea.length;
      let area = 0;
      let cur = h;
      do {
        cycle[cur] = c;
        const o = this.origin(cur);
        const t = this.target(cur);
        area += vx[o] * vy[t] - vx[t] * vy[o];
        cur = next[cur];
      } while (cur !== h);
      cycleArea.push(area / 2);
      cycleStart.push(h);
    }

    this.offset = offset;
    this.out = out;
    this.slot = slot;
    this.next = next;
    this.cycle = cycle;
  }

  /**
   * Label every cycle with what the modes need to know about the winding
   * numbers on its face. With `full`, the sparse winding vectors are kept too.
   */
  label(full = false): void {
    const V = this.vx.length;
    const E = this.gu.length;
    const C = this.cycleArea.length;
    const vx = this.vx;
    const vy = this.vy;
    const offset = this.offset;

    // connected components by union-find over the graph edges
    const parent = new Int32Array(V);
    for (let v = 0; v < V; v++) parent[v] = v;
    const find = (v: number) => {
      while (parent[v] !== v) {
        parent[v] = parent[parent[v]];
        v = parent[v];
      }
      return v;
    };
    for (let e = 0; e < E; e++) {
      const a = find(this.gu[e]);
      const b = find(this.gv[e]);
      if (a !== b) parent[a] = b;
    }
    const leftmost = new Int32Array(V).fill(-1);
    let components = 0;
    for (let v = 0; v < V; v++) {
      if (offset[v + 1] === offset[v]) continue; // no edges left
      const r = find(v);
      const l = leftmost[r];
      if (l < 0) components++;
      if (l < 0 || vx[v] < vx[l] || (vx[v] === vx[l] && vy[v] < vy[l])) {
        leftmost[r] = v;
      }
    }

    const count = new Int32Array(C);
    const hasFirst = new Uint8Array(C);
    const hasLast = new Uint8Array(C);
    const labels = full ? new Array<Map<number, number>>(C) : undefined;
    const labeled = new Uint8Array(C);
    const last = this.k - 1;
    // One winding vector, edited on the way into a neighboring face and
    // restored on the way back, so the memory is one vector plus three
    // numbers per face rather than a vector per face.
    const w = new Map<number, number>();
    const record = (c: number) => {
      count[c] = w.size;
      hasFirst[c] = w.has(0) ? 1 : 0;
      hasLast[c] = w.has(last) ? 1 : 0;
      if (labels) labels[c] = new Map(w);
      labeled[c] = 1;
    };
    const step = (h: number, dir: number) => {
      const sign = (h & 1 ? 1 : -1) * dir;
      for (const [s, d] of this.deltas[h >> 1]) addWinding(w, s, sign * d);
    };
    // depth-first frames: the cycle, the next half-edge to look across, and
    // the half-edge that led into the cycle
    const fc = new Int32Array(C);
    const fh = new Int32Array(C);
    const fvia = new Int32Array(C);
    if (components > 1) this.expectRayQueries(components);
    for (let r = 0; r < V; r++) {
      const p = leftmost[r];
      if (p < 0) continue;
      // Every edge at the leftmost vertex points into the east half-plane, so
      // the outgoing half-edge with the largest angle has the component's
      // unbounded face on its left. Its winding numbers are exactly the
      // graph's crossings of the ray going west from here.
      const g = this.out[offset[p + 1] - 1];
      const c0 = this.cycle[g];
      if (labeled[c0]) continue;
      w.clear();
      // A connected graph has no other component around its unbounded face.
      if (components > 1) this.windingWest(p, w);
      record(c0);
      let depth = 0;
      fc[0] = c0;
      fh[0] = this.cycleStart[c0];
      fvia[0] = -1;
      while (depth >= 0) {
        const h = fh[depth];
        if (h < 0) {
          // every neighbor of this cycle is labeled: restore and back out
          if (fvia[depth] >= 0) step(fvia[depth], -1);
          depth--;
          continue;
        }
        const hn = this.next[h];
        fh[depth] = hn === this.cycleStart[fc[depth]] ? -1 : hn;
        const c2 = this.cycle[h ^ 1];
        if (labeled[c2]) continue;
        step(h, 1);
        record(c2);
        depth++;
        fc[depth] = c2;
        fh[depth] = this.cycleStart[c2];
        fvia[depth] = h;
      }
    }
    this.count = count;
    this.hasFirst = hasFirst;
    this.hasLast = hasLast;
    this.labels = labels;
  }

  /** Add the winding numbers just west of vertex p into a sparse label. */
  private windingWest(p: number, labels: Map<number, number>): void {
    const px = this.vx[p];
    const py = this.vy[p];
    const gu = this.gu;
    const gv = this.gv;
    const vy = this.vy;
    const deltas = this.deltas;
    const cross = (e: number) => {
      const u = gu[e];
      const v = gv[e];
      if (u === p || v === p) return; // meets the ray at p itself
      const uy = vy[u];
      const wy = vy[v];
      if (uy > py === wy > py) return;
      if (this.crossingX(u, v, py) >= px) return;
      // a ring winding counterclockwise around p crosses the west ray downward
      const sign = wy > uy ? -1 : 1;
      for (const [s, d] of deltas[e]) addWinding(labels, s, sign * d);
    };
    const tree = this.rayTree();
    if (tree === undefined) {
      for (let e = 0, E = this.gu.length; e < E; e++) cross(e);
      return;
    }
    const stack = tree ? [tree] : [];
    while (stack.length > 0) {
      const node = stack.pop()!;
      if (node.x0 >= px || py < node.y0 || py >= node.y1) continue;
      if (node.x1 < px && py >= node.allY0 && py < node.allY1) {
        for (const [s, d] of node.sum) addWinding(labels, s, d);
        continue;
      }
      if (!node.edges) {
        stack.push(node.left!, node.right!);
        continue;
      }
      for (const e of node.edges) cross(e);
    }
  }

  /**
   * Where edge u→v crosses the horizontal line at y, given that it straddles it
   * by the half-open rule. An endpoint on the line is the crossing itself, taken
   * exactly so that ties at a vertex are exact ties.
   */
  private crossingX(u: number, v: number, y: number): number {
    const uy = this.vy[u];
    const wy = this.vy[v];
    if (uy === y) return this.vx[u];
    if (wy === y) return this.vx[v];
    const ux = this.vx[u];
    return ux + ((y - uy) * (this.vx[v] - ux)) / (wy - uy);
  }

  // ----------------------------------------------------------- selection

  /** Which cycles bound kept faces (on their left) for a mode. */
  select(mode: PathMode): Uint8Array {
    const C = this.cycleArea.length;
    const k = this.k;
    const keep = new Uint8Array(C);
    for (let c = 0; c < C; c++) {
      const count = this.count[c];
      const first = this.hasFirst[c] === 1;
      const last = this.hasLast[c] === 1;
      let on = false;
      switch (mode) {
        case "intersect":
          on = count === k;
          break;
        case "exclude":
          on = (count & 1) === 1;
          break;
        case "minusFront":
          on = first && count === 1;
          break;
        case "minusBack":
          on = last && count === 1;
          break;
        case "crop":
          on = last && count >= 2;
          break;
        default: // unite, divide
          on = count > 0;
      }
      keep[c] = on ? 1 : 0;
    }
    return keep;
  }

  /**
   * Rings of the merged kept region: the half-edges with a kept face on the
   * left and an unkept face on the right, traced with the same turning rule
   * restricted to those half-edges.
   */
  mergedRings(keep: Uint8Array, ringOf: Int32Array): number[][] {
    const H = ringOf.length;
    const cycle = this.cycle;
    const boundary = (h: number) =>
      keep[cycle[h]] === 1 && keep[cycle[h ^ 1]] === 0;
    const rings: number[][] = [];
    for (let h = 0; h < H; h++) {
      if (ringOf[h] >= 0 || !boundary(h)) continue;
      const r = rings.length;
      const seq: number[] = [];
      let cur = h;
      do {
        ringOf[cur] = r;
        seq.push(cur);
        // first boundary half-edge clockwise from the twin
        const v = this.target(cur);
        const base = this.offset[v];
        const n = this.offset[v + 1] - base;
        const s = this.slot[cur ^ 1];
        let found = -1;
        for (let i = 1; i <= n; i++) {
          const cand = this.out[base + ((s - i + n) % n)];
          if (boundary(cand)) {
            found = cand;
            break;
          }
        }
        if (found < 0) break; // cannot happen on a planar graph; end the ring
        cur = found;
      } while (cur !== h);
      rings.push(seq);
    }
    return rings;
  }

  /**
   * Split each traced walk at repeated vertices into simple rings. A boundary
   * that touches itself at a vertex (a hole pinched to its outer ring, two
   * holes meeting, two regions meeting at a corner) is one closed walk; its
   * simple pieces are separate rings. Returns the walk each ring came from.
   */
  simpleRings(
    walks: number[][],
    ringOf: Int32Array,
  ): { rings: number[][]; walk: number[] } {
    const at = new Int32Array(this.vx.length).fill(-1); // stack position of a vertex
    const rings: number[][] = [];
    const walk: number[] = [];
    const emit = (seq: number[], w: number) => {
      for (let i = 0; i < seq.length; i++) ringOf[seq[i]] = rings.length;
      rings.push(seq);
      walk.push(w);
    };
    for (let w = 0; w < walks.length; w++) {
      const seq = walks[w];
      const open: number[] = [];
      for (let i = 0; i < seq.length; i++) {
        const h = seq[i];
        const o = this.origin(h);
        const pos = at[o];
        if (pos >= 0) {
          // back at a vertex already on the walk: the part since then is a loop
          const loop = open.splice(pos);
          for (let j = 0; j < loop.length; j++) at[this.origin(loop[j])] = -1;
          emit(loop, w);
        }
        at[o] = open.length;
        open.push(h);
      }
      for (let j = 0; j < open.length; j++) at[this.origin(open[j])] = -1;
      emit(open, w);
    }
    return { rings, walk };
  }

  /** Rings of every kept face, one per cycle. */
  faceRings(keep: Uint8Array, ringOf: Int32Array): number[][] {
    const rings: number[][] = [];
    for (let c = 0, C = this.cycleArea.length; c < C; c++) {
      if (!keep[c]) continue;
      const r = rings.length;
      const seq: number[] = [];
      const start = this.cycleStart[c];
      let h = start;
      do {
        ringOf[h] = r;
        seq.push(h);
        h = this.next[h];
      } while (h !== start);
      rings.push(seq);
    }
    return rings;
  }

  /**
   * Group the rings into polygons: each counterclockwise ring followed by the
   * clockwise rings (holes) that puncture its face. A hole's face is found by
   * a ray west from its leftmost vertex: the nearest ring edge crossed has
   * that face on its east side.
   */
  assemble(rings: number[][], ringOf: Int32Array, walk: number[]): Group[][] {
    const R = rings.length;
    const vx = this.vx;
    const vy = this.vy;
    const area = new Float64Array(R);
    const left = new Int32Array(R);
    for (let r = 0; r < R; r++) {
      const seq = rings[r];
      let a = 0;
      let l = this.origin(seq[0]);
      for (let i = 0; i < seq.length; i++) {
        const o = this.origin(seq[i]);
        const t = this.target(seq[i]);
        a += vx[o] * vy[t] - vx[t] * vy[o];
        if (vx[o] < vx[l] || (vx[o] === vx[l] && vy[o] < vy[l])) l = o;
      }
      area[r] = a / 2;
      left[r] = l;
    }

    const sliver = this.tol * this.tol;
    const parent = new Int32Array(R).fill(-2); // -2 unresolved, -1 none

    // A hole split off a pinched walk may have another piece of the walk at
    // its own leftmost vertex, where a westward ray starts inside that piece
    // or finds nothing. The pieces of one walk bound one region: a hole's
    // outer is the smallest counterclockwise piece of the walk that contains
    // it, and a hole inside none of them shares the walk's outermost piece's
    // surroundings, found by a ray from the walk's leftmost vertex.
    const rayFrom = left;
    const pieces = new Map<number, number[]>();
    if (walk.length > 0 && walk[walk.length - 1] !== R - 1) {
      // some walk split into several rings (walk ids repeat)
      for (let r = 0; r < R; r++) {
        const list = pieces.get(walk[r]);
        if (list) list.push(r);
        else pieces.set(walk[r], [r]);
      }
    }
    for (const list of pieces.values()) {
      if (list.length < 2) continue;
      let l = left[list[0]];
      for (const q of list) {
        const v = left[q];
        if (vx[v] < vx[l] || (vx[v] === vx[l] && vy[v] < vy[l])) l = v;
      }
      for (const r of list) {
        if (area[r] >= 0) continue;
        const o = this.origin(rings[r][0]);
        const t = this.target(rings[r][0]);
        const mx = (vx[o] + vx[t]) / 2;
        const my = (vy[o] + vy[t]) / 2;
        let best = -1;
        for (const q of list) {
          if (area[q] <= sliver || (best >= 0 && area[q] >= area[best]))
            continue;
          if (this.encloses(rings[q], mx, my)) best = q;
        }
        if (best >= 0) parent[r] = best;
        else rayFrom[r] = l;
      }
    }

    let holes = 0;
    for (let r = 0; r < R; r++) if (area[r] < 0 && parent[r] === -2) holes++;
    this.expectRayQueries(holes);
    const resolve = (r: number): number => {
      const chain: number[] = [];
      let p = r;
      while (p >= 0 && area[p] < 0 && parent[p] === -2) {
        chain.push(p);
        parent[p] = -1; // stop if inconsistent geometry creates a cycle
        p = this.westHit(rayFrom[p], ringOf);
      }
      if (p >= 0 && area[p] < 0) p = parent[p];
      if (p >= 0 && !(area[p] > sliver)) p = -1;
      for (const hole of chain) parent[hole] = p;
      return p;
    };

    // A ring whose mean width (twice the area over the perimeter) is below the
    // tolerance is a hairline: the trace of edges that coincide up to rounding,
    // such as a vertex that touches an edge to float32 precision. It is
    // invisible filled and a stray line stroked, so it is dropped.
    const hairline = (ring: Group, a: number) =>
      Math.abs(a) < (this.tol * outputPerimeter(ring)) / 2;
    const outers = new Int32Array(R).fill(-1);
    const polygons: Group[][] = [];
    for (let r = 0; r < R; r++) {
      if (area[r] > sliver) {
        const outer = this.ring(rings[r]);
        const a = outputArea(outer);
        if (a <= 0 || hairline(outer, a)) continue;
        outers[r] = polygons.length;
        polygons.push([outer]);
      }
    }
    for (let r = 0; r < R; r++) {
      if (area[r] >= -sliver) continue;
      const p = resolve(r);
      if (p >= 0 && outers[p] >= 0) {
        const hole = this.ring(rings[r]);
        const a = outputArea(hole);
        if (a < 0 && !hairline(hole, a)) polygons[outers[p]].push(hole);
      }
    }
    return polygons;
  }

  /** Whether a simple ring encloses a point that is not on its boundary (crossing parity). */
  private encloses(seq: number[], x: number, y: number): boolean {
    const vx = this.vx;
    const vy = this.vy;
    let inside = false;
    for (let i = 0; i < seq.length; i++) {
      const o = this.origin(seq[i]);
      const t = this.target(seq[i]);
      const oy = vy[o];
      const ty = vy[t];
      if (oy > y === ty > y) continue;
      const xc = vx[o] + ((y - oy) * (vx[t] - vx[o])) / (ty - oy);
      if (xc < x) inside = !inside;
    }
    return inside;
  }

  /** The ring, among those in `ringOf`, whose edge is the nearest crossing of the ray west from vertex p and faces it. */
  private westHit(p: number, ringOf: Int32Array): number {
    const px = this.vx[p];
    const py = this.vy[p];
    let best = -Infinity;
    let bestSlope = -Infinity;
    let ring = -1;
    const gu = this.gu;
    const gv = this.gv;
    const vx = this.vx;
    const vy = this.vy;
    const visit = (e: number) => {
      if (ringOf[2 * e] < 0 && ringOf[2 * e + 1] < 0) return;
      const u = gu[e];
      const v = gv[e];
      if (u === p || v === p) return; // meets the ray at p itself
      const uy = vy[u];
      const wy = vy[v];
      if (uy > py === wy > py) return;
      const xc = this.crossingX(u, v, py);
      if (xc >= px) return;
      // Crossings exactly at a vertex tie on x; the ray sits just above the
      // vertex, so the most eastward upward edge is the nearest.
      const ux = vx[u];
      const wx = vx[v];
      const up = wy > uy;
      const slope = up ? (wx - ux) / (wy - uy) : (ux - wx) / (uy - wy);
      if (xc > best || (xc === best && slope > bestSlope)) {
        best = xc;
        bestSlope = slope;
        // The face east of the crossing is on the left of the downward
        // half-edge. If that half-edge has no ring the geometry is inconsistent
        // at the tol scale, and the hole is dropped rather than misplaced.
        ring = ringOf[up ? 2 * e + 1 : 2 * e];
      }
    };
    const tree = this.rayTree();
    if (tree === undefined) {
      for (let e = 0, E = this.gu.length; e < E; e++) visit(e);
      return ring;
    }
    const stack = tree ? [tree] : [];
    while (stack.length > 0) {
      const node = stack.pop()!;
      if (node.x0 >= px || node.x1 < best || py < node.y0 || py >= node.y1)
        continue;
      if (!node.edges) {
        // Search the more eastward child first so its hit can prune the west.
        const a = node.left!,
          b = node.right!;
        if (a.x1 < b.x1) stack.push(a, b);
        else stack.push(b, a);
        continue;
      }
      for (const e of node.edges) visit(e);
    }
    return ring;
  }

  /** Remove straight-through vertices without changing any bend in the boundary. */
  private ring(seq: number[]): Group {
    const vx = this.vx;
    const vy = this.vy;
    const n = seq.length;
    const ids: number[] = [];
    for (let i = 0; i < n; i++) ids.push(this.origin(seq[i]));
    const keep: number[] = [ids[0]];
    const straight = (prev: number, v: number, w: number) => {
      const rx = vx[w] - vx[prev];
      const ry = vy[w] - vy[prev];
      const t =
        ((vx[v] - vx[prev]) * rx + (vy[v] - vy[prev]) * ry) /
        (rx * rx + ry * ry);
      return (
        t > 0 &&
        t < 1 &&
        orient2d(vx[prev], vy[prev], vx[w], vy[w], vx[v], vy[v]) === 0
      );
    };
    // Keep an anchor through the linear pass. Only reconsider it after the
    // closing edge's actual neighbors are known.
    for (let i = 1; i < n; i++) {
      const v = ids[i];
      const w = ids[i === n - 1 ? 0 : i + 1];
      if (straight(keep[keep.length - 1], v, w)) continue;
      keep.push(v);
    }
    if (keep.length > 3 && straight(keep[keep.length - 1], keep[0], keep[1]))
      keep.shift();
    const g = new Group();
    for (let i = 0; i < keep.length; i++) {
      const pt = new Pt(2);
      pt[0] = vx[keep[i]];
      pt[1] = vy[keep[i]];
      const prev = g[g.length - 1];
      // Distinct double intersections can round to the same output Pt.
      if (!prev || prev[0] !== pt[0] || prev[1] !== pt[1]) g.push(pt);
    }
    if (
      g.length > 1 &&
      g[0][0] === g[g.length - 1][0] &&
      g[0][1] === g[g.length - 1][1]
    )
      g.pop();
    return g;
  }
}

/**
 * Combine shapes with a Path mode. Returns the rings of the merged region
 * for the merging modes, or one ring list per face for `divide` and `crop`.
 */
export function overlay(
  shapes: Iterable<PolygonLike> | PtLikeIterable,
  mode: "divide" | "crop",
): Group[][];
export function overlay(
  shapes: Iterable<PolygonLike> | PtLikeIterable,
  mode: Exclude<PathMode, "divide" | "crop">,
): Group[];
export function overlay(
  shapes: Iterable<PolygonLike> | PtLikeIterable,
  mode: PathMode,
): Group[] | Group[][];
export function overlay(
  shapes: Iterable<PolygonLike> | PtLikeIterable,
  mode: PathMode,
): Group[] | Group[][] {
  const faces = mode === "divide" || mode === "crop";
  const ov = new Overlay();
  if (!ov.read(shapes)) return [];
  ov.split();
  ov.merge();
  if (ov.gu.length === 0) return [];
  ov.trace();
  ov.label();
  const keep = ov.select(mode);
  const ringOf = new Int32Array(2 * ov.gu.length).fill(-1);
  const walks = faces
    ? ov.faceRings(keep, ringOf)
    : ov.mergedRings(keep, ringOf);
  const { rings, walk } = ov.simpleRings(walks, ringOf);
  const polygons = ov.assemble(rings, ringOf, walk);
  if (faces) return polygons;
  const flat: Group[] = [];
  for (let i = 0; i < polygons.length; i++) {
    for (let j = 0; j < polygons[i].length; j++) flat.push(polygons[i][j]);
  }
  return flat;
}
