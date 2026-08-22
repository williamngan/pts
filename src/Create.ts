/*! Pts.js is licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */

import { Pt, Group, type Bound } from "./Pt";
import { Line, Triangle } from "./Op";
import { Const, Util } from "./Util";
import { Num, Geom } from "./Num";
import {
  type PtLike,
  type GroupLike,
  type PtIterable,
  type DelaunayMesh,
  type DelaunayShape,
} from "./Types";

/**
 * The `Create` class helps you create structures from sets of points.
 */
export class Create {
  /**
   * Create a set of random points inside a bounday.
   * @param bound the rectangular boundary
   * @param count number of random points to create
   * @param dimensions number of dimensions in each point
   */
  static distributeRandom(
    bound: Bound,
    count: number,
    dimensions: number = 2,
  ): Group {
    let pts = new Group();
    for (let i = 0; i < count; i++) {
      let p = [bound.x! + Num.random() * bound.width];
      if (dimensions > 1) p.push(bound.y! + Num.random() * bound.height);
      if (dimensions > 2) p.push(bound.z! + Num.random() * bound.depth);
      pts.push(new Pt(p));
    }
    return pts;
  }

  /**
   * Create a set of points that distribute evenly on a line. Similar to [`Line.subpoints`](#link) but includes the end points.
   * @param line a Group or an Iterable<Pt> representing a line
   * @param count number of points to create
   */
  static distributeLinear(line: PtIterable, count: number): Group {
    if (count <= 0) return new Group();
    let _line = Util.iterToArray(line);
    if (count === 1) return new Group(_line[0]);
    let ln = Line.subpoints(_line, count - 2);
    ln.unshift(_line[0]);
    ln.push(_line[_line.length - 1]);
    return ln;
  }

  /**
   * Create an evenly distributed set of points (like a grid of points) inside a boundary.
   * @param bound the rectangular boundary
   * @param columns number of columns
   * @param rows number of rows
   * @param orientation a Pt or number array to specify where the point should be inside a cell. Default is [0.5, 0.5] which places the point in the middle.
   * @returns a Group of Pts
   */
  static gridPts(
    bound: Bound,
    columns: number,
    rows: number,
    orientation: PtLike = [0.5, 0.5],
  ): Group {
    if (columns === 0 || rows === 0)
      throw new Error("grid columns and rows cannot be 0");
    let unit = bound.size.$subtract(1).$divide(columns, rows);
    let offset = unit.$multiply(orientation);
    let g = new Group();
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        g.push(bound.topLeft.$add(unit.$multiply(c, r)).add(offset));
      }
    }
    return g;
  }

  /**
   * Create a grid of cells inside a boundary, where each cell is defined by a group of 2 Pt.
   * @param bound the rectangular boundary
   * @param columns number of columns
   * @param rows number of rows
   * @returns an array of Groups, where each group represents a rectangular cell
   */
  static gridCells(bound: Bound, columns: number, rows: number): Group[] {
    if (columns === 0 || rows === 0)
      throw new Error("grid columns and rows cannot be 0");
    let unit = bound.size.$subtract(1).divide(columns, rows); // subtract 1 to fill whole border of rectangles
    let g = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        g.push(
          new Group(
            bound.topLeft.$add(unit.$multiply(c, r)),
            bound.topLeft.$add(unit.$multiply(c, r).add(unit)),
          ),
        );
      }
    }
    return g;
  }

  /**
   * Create a set of Pts around a circular path.
   * @param center circle center
   * @param radius circle radius
   * @param count number of Pts to create
   * @param angleOffset offset starting angle
   */
  static radialPts(
    center: PtLike,
    radius: number,
    count: number,
    angleOffset: number = -Const.half_pi,
  ): Group {
    let g = new Group();
    let a = Const.two_pi / count;
    for (let i = 0; i < count; i++) {
      g.push(new Pt(center).toAngle(a * i + angleOffset, radius, true));
    }
    return g;
  }

  /**
   * Given a group of Pts, return a new group of `Noise` Pts.
   * @param pts a Group or an Iterable<Pt>, in row-major order when treated as a grid
   * @param dx small increment value in x dimension
   * @param dy small increment value in y dimension
   * @param rows Optional row count to generate 2D noise
   * @param columns Optional column count (points per row) to generate 2D noise. When provided, each point's noise offset is (dx·column, dy·row) with row = floor(i/columns); when only `rows` is provided it is used as the points-per-row divisor instead.
   */
  static noisePts(
    pts: PtIterable,
    dx = 0.01,
    dy = 0.01,
    rows = 0,
    columns = 0,
  ): Group {
    let seed = Num.random();
    let g = new Group();
    let i = 0;
    // row-major grid: one consistent per-row divisor for both row and column
    const perRow = columns > 0 ? columns : rows > 0 ? rows : 0;
    for (let p of pts) {
      let np = new Noise(p);
      let r = perRow > 0 ? Math.floor(i / perRow) : i;
      let c = perRow > 0 ? i % perRow : i;
      np.initNoise(dx * c, dy * r);
      np.seed(seed);
      g.push(np);
      i++;
    }
    return g;
  }

  /**
   * Create a Delaunay Group. Use the [`Delaunay.delaunay()`](#link) and [`Delaunay.voronoi()`](#link) functions in the returned group to generate tessellations.
   * @param pts a Group or an array of Pts
   * @returns an instance of the Delaunay class
   */
  static delaunay(pts: GroupLike): Delaunay {
    return Delaunay.from(pts) as Delaunay;
  }
}

/**
 * Perlin noise gradient indices
 */
const __noise_grad3 = [
  [1, 1, 0],
  [-1, 1, 0],
  [1, -1, 0],
  [-1, -1, 0],
  [1, 0, 1],
  [-1, 0, 1],
  [1, 0, -1],
  [-1, 0, -1],
  [0, 1, 1],
  [0, -1, 1],
  [0, 1, -1],
  [0, -1, -1],
];

/**
 * Perlin noise permutation table
 */
const __noise_permTable = [
  151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140,
  36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234,
  75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237,
  149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48,
  27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105,
  92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73,
  209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86,
  164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38,
  147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189,
  28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101,
  155, 167, 43, 172, 9, 129, 22, 39, 253, 9, 98, 108, 110, 79, 113, 224, 232,
  178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12,
  191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31,
  181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254,
  138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215,
  61, 156, 180,
];

// The doubled base permutation table, built once and shared by every unseeded
// Noise instance (a per-instance copy would allocate 512 entries per point in
// `Create.noisePts`). `seed()` swaps in a seeded table instead of mutating.
const __noise_permDoubled = __noise_permTable.concat(__noise_permTable);

// Memoize the last seeded table: `Create.noisePts` seeds every point with the
// same value, so all its Noise Pts share one table.
let __noise_lastSeed: number | undefined = undefined;
let __noise_lastPerm: number[] | null = null;

function __noise_seededPerm(seed: number): number[] {
  if (seed === __noise_lastSeed && __noise_lastPerm) return __noise_lastPerm;

  let s = seed;
  if (s > 0 && s < 1) s *= 65536;
  s = Math.floor(s);
  if (s < 256) s |= s << 8;

  const perm = new Array<number>(512);
  for (let i = 0; i < 256; i++) {
    const v =
      i & 1
        ? __noise_permTable[i] ^ (s & 255)
        : __noise_permTable[i] ^ ((s >> 8) & 255);
    perm[i] = perm[i + 256] = v;
  }

  __noise_lastSeed = seed;
  __noise_lastPerm = perm;
  return perm;
}

/**
 * Noise is a subclass of Pt that generates Perlin noise. Current implementation supports basic 2D noise.
 * This implementation is based on this [gist](https://gist.github.com/banksean/304522).
 */
export class Noise extends Pt {
  protected perm: number[] = [];
  private _n: Pt = new Pt(0.01, 0.01);

  /**
   * Create a Noise Pt that can generate noise continuously. See a [Noise demo here](../demo/index.html?name=create.noisePts).
   * @param args a list of numeric parameters, an array of numbers, or an object with {x,y,z,w} properties
   */
  constructor(...args: any[]) {
    super(...args);

    // shared doubled table for easy index wrapping; replaced by seed()
    this.perm = __noise_permDoubled;
  }

  /**
   * Set the initial dimensional values of the noise.
   * @param args a list of numeric parameters, an array of numbers, or an object with {x,y,z,w} properties
   * @example `noise.initNoise( 0.01, 0.1 )`
   */
  initNoise(...args: any[]) {
    this._n = new Pt(...args);
    return this;
  }

  /**
   * Add a small increment to the noise values.
   * @param x step in x dimension
   * @param y step in y dimension
   */
  step(x = 0, y = 0) {
    this._n.add(x, y);
    return this;
  }

  /**
   * Specify a seed for this Noise.
   * @param s seed value
   */
  seed(s: number) {
    this.perm = __noise_seededPerm(s);
    return this;
  }

  /**
   * Generate a 2D Perlin noise value.
   */
  noise2D() {
    const perm = this.perm;
    const nx = this._n[0];
    const ny = this._n[1];

    // integer cell (wrapped to the table via two's-complement &, which also
    // handles negative coordinates seamlessly) and the position within it
    const cx = Math.floor(nx);
    const cy = Math.floor(ny);
    const i = cx & 255;
    const j = cy & 255;
    const x = nx - cx;
    const y = ny - cy;

    // standard Perlin gradient hashing through the permutation table; the
    // doubled table makes i + perm[j + 1] safe without extra wrapping
    const g00 = __noise_grad3[perm[i + perm[j]] % 12];
    const g01 = __noise_grad3[perm[i + perm[j + 1]] % 12];
    const g10 = __noise_grad3[perm[i + 1 + perm[j]] % 12];
    const g11 = __noise_grad3[perm[i + 1 + perm[j + 1]] % 12];

    const n00 = g00[0] * x + g00[1] * y;
    const n01 = g01[0] * x + g01[1] * (y - 1);
    const n10 = g10[0] * (x - 1) + g10[1] * y;
    const n11 = g11[0] * (x - 1) + g11[1] * (y - 1);

    const _fade = (f: number) => f * f * f * (f * (f * 6 - 15) + 10);
    const tx = _fade(x);
    const u = n00 + tx * (n10 - n00);
    const v = n01 + tx * (n11 - n01);
    return u + _fade(y) * (v - u);
  }
}

// ------------------------------------------------------------------------
// Incremental half-edge Delaunay triangulation, adapted from Delaunator
// (https://github.com/mapbox/delaunator), ISC License, Copyright © Mapbox.
// Points are inserted in order of distance from a seed circumcenter onto an
// advancing convex hull (with an angular hash for O(1) edge lookup), and new
// edges are legalized with in-circle flips.

const _DELAUNAY_EPSILON = Math.pow(2, -52);
const _delaunayEdgeStack = new Uint32Array(512);

function _pseudoAngle(dx: number, dy: number): number {
  const p = dx / (Math.abs(dx) + Math.abs(dy));
  return (dy > 0 ? 3 - p : 1 + p) / 4; // [0..1]
}

function _sqDist(ax: number, ay: number, bx: number, by: number): number {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}

/** Error-bounded orientation test with symbolic fallback: > 0 if clockwise. */
function _orientIfSure(
  px: number,
  py: number,
  rx: number,
  ry: number,
  qx: number,
  qy: number,
): number {
  const l = (ry - py) * (qx - px);
  const r = (rx - px) * (qy - py);
  return Math.abs(l - r) >= 3.3306690738754716e-16 * Math.abs(l + r)
    ? l - r
    : 0;
}

function _orient(
  rx: number,
  ry: number,
  qx: number,
  qy: number,
  px: number,
  py: number,
): boolean {
  return (
    (_orientIfSure(px, py, rx, ry, qx, qy) ||
      _orientIfSure(rx, ry, qx, qy, px, py) ||
      _orientIfSure(qx, qy, px, py, rx, ry)) < 0
  );
}

function _inCircle(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number,
  px: number,
  py: number,
): boolean {
  const dx = ax - px;
  const dy = ay - py;
  const ex = bx - px;
  const ey = by - py;
  const fx = cx - px;
  const fy = cy - py;
  const ap = dx * dx + dy * dy;
  const bp = ex * ex + ey * ey;
  const cp = fx * fx + fy * fy;
  return (
    dx * (ey * cp - bp * fy) -
      dy * (ex * cp - bp * fx) +
      ap * (ex * fy - ey * fx) <
    0
  );
}

function _circumradiusSq(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number,
): number {
  const dx = bx - ax;
  const dy = by - ay;
  const ex = cx - ax;
  const ey = cy - ay;
  const bl = dx * dx + dy * dy;
  const cl = ex * ex + ey * ey;
  const d = 0.5 / (dx * ey - dy * ex);
  const x = (ey * bl - dy * cl) * d;
  const y = (dx * cl - ex * bl) * d;
  return x * x + y * y;
}

function _circumcenterX(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number,
): number {
  const dx = bx - ax;
  const dy = by - ay;
  const ex = cx - ax;
  const ey = cy - ay;
  const bl = dx * dx + dy * dy;
  const cl = ex * ex + ey * ey;
  const d = 0.5 / (dx * ey - dy * ex);
  return ax + (ey * bl - dy * cl) * d;
}

function _circumcenterY(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number,
): number {
  const dx = bx - ax;
  const dy = by - ay;
  const ex = cx - ax;
  const ey = cy - ay;
  const bl = dx * dx + dy * dy;
  const cl = ex * ex + ey * ey;
  const d = 0.5 / (dx * ey - dy * ex);
  return ay + (dx * cl - ex * bl) * d;
}

function _quicksortIds(
  ids: Uint32Array,
  dists: Float64Array,
  left: number,
  right: number,
): void {
  if (right - left <= 20) {
    for (let i = left + 1; i <= right; i++) {
      const temp = ids[i];
      const tempDist = dists[temp];
      let j = i - 1;
      while (j >= left && dists[ids[j]] > tempDist) ids[j + 1] = ids[j--];
      ids[j + 1] = temp;
    }
    return;
  }
  const median = (left + right) >> 1;
  let i = left + 1;
  let j = right;
  _swapIds(ids, median, i);
  if (dists[ids[left]] > dists[ids[right]]) _swapIds(ids, left, right);
  if (dists[ids[i]] > dists[ids[right]]) _swapIds(ids, i, right);
  if (dists[ids[left]] > dists[ids[i]]) _swapIds(ids, left, i);

  const temp = ids[i];
  const tempDist = dists[temp];
  while (true) {
    do i++;
    while (dists[ids[i]] < tempDist);
    do j--;
    while (dists[ids[j]] > tempDist);
    if (j < i) break;
    _swapIds(ids, i, j);
  }
  ids[left + 1] = ids[j];
  ids[j] = temp;

  if (right - i + 1 >= j - left) {
    _quicksortIds(ids, dists, i, right);
    _quicksortIds(ids, dists, left, j - 1);
  } else {
    _quicksortIds(ids, dists, left, j - 1);
    _quicksortIds(ids, dists, i, right);
  }
}

function _swapIds(arr: Uint32Array, i: number, j: number): void {
  const tmp = arr[i];
  arr[i] = arr[j];
  arr[j] = tmp;
}

/**
 * Triangulate a flat [x0, y0, x1, y1, ...] coordinate array. Returns the
 * triangle vertex indices (3 per triangle) with the half-edge adjacency
 * array, or null if the input is degenerate (fewer than 3 distinct
 * non-collinear points).
 */
function _triangulate(
  coords: Float64Array,
): { triangles: Uint32Array; halfedges: Int32Array } | null {
  const n = coords.length >> 1;

  // seed selection: the point closest to the bounding-box center, its nearest
  // neighbor, and the third point minimizing the circumradius
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  const ids = new Uint32Array(n);
  for (let i = 0; i < n; i++) {
    const x = coords[2 * i];
    const y = coords[2 * i + 1];
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
    ids[i] = i;
  }
  const bcx = (minX + maxX) / 2;
  const bcy = (minY + maxY) / 2;

  let i0 = 0;
  let i1 = -1;
  let i2 = -1;
  let minDist = Infinity;
  for (let i = 0; i < n; i++) {
    const d = _sqDist(bcx, bcy, coords[2 * i], coords[2 * i + 1]);
    if (d < minDist) {
      i0 = i;
      minDist = d;
    }
  }
  let i0x = coords[2 * i0];
  let i0y = coords[2 * i0 + 1];

  minDist = Infinity;
  for (let i = 0; i < n; i++) {
    if (i === i0) continue;
    const d = _sqDist(i0x, i0y, coords[2 * i], coords[2 * i + 1]);
    if (d < minDist && d > 0) {
      i1 = i;
      minDist = d;
    }
  }
  if (i1 === -1) return null; // all points coincident
  let i1x = coords[2 * i1];
  let i1y = coords[2 * i1 + 1];

  let minRadius = Infinity;
  for (let i = 0; i < n; i++) {
    if (i === i0 || i === i1) continue;
    const r = _circumradiusSq(
      i0x,
      i0y,
      i1x,
      i1y,
      coords[2 * i],
      coords[2 * i + 1],
    );
    if (r < minRadius) {
      i2 = i;
      minRadius = r;
    }
  }
  if (i2 === -1 || minRadius === Infinity) return null; // all collinear
  let i2x = coords[2 * i2];
  let i2y = coords[2 * i2 + 1];

  if (_orient(i0x, i0y, i1x, i1y, i2x, i2y)) {
    const i = i1;
    const x = i1x;
    const y = i1y;
    i1 = i2;
    i1x = i2x;
    i1y = i2y;
    i2 = i;
    i2x = x;
    i2y = y;
  }

  const cx = _circumcenterX(i0x, i0y, i1x, i1y, i2x, i2y);
  const cy = _circumcenterY(i0x, i0y, i1x, i1y, i2x, i2y);
  const dists = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    dists[i] = _sqDist(coords[2 * i], coords[2 * i + 1], cx, cy);
  }
  _quicksortIds(ids, dists, 0, n - 1);

  // advancing convex hull with an angular hash
  const hashSize = Math.ceil(Math.sqrt(n));
  const hullPrev = new Uint32Array(n);
  const hullNext = new Uint32Array(n);
  const hullTri = new Uint32Array(n);
  const hullHash = new Int32Array(hashSize).fill(-1);
  const hashKey = (x: number, y: number) =>
    Math.floor(_pseudoAngle(x - cx, y - cy) * hashSize) % hashSize;

  let hullStart = i0;
  hullNext[i0] = hullPrev[i2] = i1;
  hullNext[i1] = hullPrev[i0] = i2;
  hullNext[i2] = hullPrev[i1] = i0;
  hullTri[i0] = 0;
  hullTri[i1] = 1;
  hullTri[i2] = 2;
  hullHash[hashKey(i0x, i0y)] = i0;
  hullHash[hashKey(i1x, i1y)] = i1;
  hullHash[hashKey(i2x, i2y)] = i2;

  const maxTriangles = Math.max(2 * n - 5, 0);
  const triangles = new Uint32Array(maxTriangles * 3);
  const halfedges = new Int32Array(maxTriangles * 3);
  let trianglesLen = 0;

  const link = (a: number, b: number) => {
    halfedges[a] = b;
    if (b !== -1) halfedges[b] = a;
  };

  const addTriangle = (
    t0: number,
    t1: number,
    t2: number,
    a: number,
    b: number,
    c: number,
  ) => {
    const t = trianglesLen;
    triangles[t] = t0;
    triangles[t + 1] = t1;
    triangles[t + 2] = t2;
    link(t, a);
    link(t + 1, b);
    link(t + 2, c);
    trianglesLen += 3;
    return t;
  };

  const legalize = (a: number) => {
    let i = 0;
    let ar = 0;
    while (true) {
      const b = halfedges[a];
      if (b === -1) {
        if (i === 0) break;
        a = _delaunayEdgeStack[--i];
        continue;
      }
      const a0 = a - (a % 3);
      ar = a0 + ((a + 2) % 3);
      const al = a0 + ((a + 1) % 3);
      const b0 = b - (b % 3);
      const bl = b0 + ((b + 2) % 3);
      const p0 = triangles[ar];
      const pr = triangles[a];
      const pl = triangles[al];
      const p1 = triangles[bl];

      const illegal = _inCircle(
        coords[2 * p0],
        coords[2 * p0 + 1],
        coords[2 * pr],
        coords[2 * pr + 1],
        coords[2 * pl],
        coords[2 * pl + 1],
        coords[2 * p1],
        coords[2 * p1 + 1],
      );

      if (illegal) {
        triangles[a] = p1;
        triangles[b] = p0;

        const hbl = halfedges[bl];
        if (hbl === -1) {
          // the flipped edge lies on the convex hull; fix the hull reference
          let e = hullStart;
          do {
            if (hullTri[e] === bl) {
              hullTri[e] = a;
              break;
            }
            e = hullPrev[e];
          } while (e !== hullStart);
        }
        link(a, hbl);
        link(b, halfedges[ar]);
        link(ar, bl);

        const br = b0 + ((b + 1) % 3);
        if (i < _delaunayEdgeStack.length) _delaunayEdgeStack[i++] = br;
      } else {
        if (i === 0) break;
        a = _delaunayEdgeStack[--i];
      }
    }
    return ar;
  };

  addTriangle(i0, i1, i2, -1, -1, -1);

  let xp = 0;
  let yp = 0;
  for (let k = 0; k < n; k++) {
    const i = ids[k];
    const x = coords[2 * i];
    const y = coords[2 * i + 1];

    // skip near-duplicates
    if (
      k > 0 &&
      Math.abs(x - xp) <= _DELAUNAY_EPSILON &&
      Math.abs(y - yp) <= _DELAUNAY_EPSILON
    ) {
      continue;
    }
    xp = x;
    yp = y;
    if (i === i0 || i === i1 || i === i2) continue;

    // find a visible edge on the convex hull via the angular hash
    let start = 0;
    for (let j = 0, key = hashKey(x, y); j < hashSize; j++) {
      start = hullHash[(key + j) % hashSize];
      if (start !== -1 && start !== hullNext[start]) break;
    }

    start = hullPrev[start];
    let e = start;
    let q = hullNext[e];
    while (
      !_orient(
        x,
        y,
        coords[2 * e],
        coords[2 * e + 1],
        coords[2 * q],
        coords[2 * q + 1],
      )
    ) {
      e = q;
      if (e === start) {
        e = -1;
        break;
      }
      q = hullNext[e];
    }
    if (e === -1) continue; // likely a near-duplicate; skip

    // add the first triangle from this point
    let t = addTriangle(e, i, hullNext[e], -1, -1, hullTri[e]);
    hullTri[i] = legalize(t + 2);
    hullTri[e] = t;

    // walk forward through the hull, adding triangles
    let next = hullNext[e];
    q = hullNext[next];
    while (
      _orient(
        x,
        y,
        coords[2 * next],
        coords[2 * next + 1],
        coords[2 * q],
        coords[2 * q + 1],
      )
    ) {
      t = addTriangle(next, i, q, hullTri[i], -1, hullTri[next]);
      hullTri[i] = legalize(t + 2);
      hullNext[next] = next; // mark as removed
      next = q;
      q = hullNext[next];
    }

    // walk backward from the other side
    if (e === start) {
      q = hullPrev[e];
      while (
        _orient(
          x,
          y,
          coords[2 * q],
          coords[2 * q + 1],
          coords[2 * e],
          coords[2 * e + 1],
        )
      ) {
        t = addTriangle(q, i, e, -1, hullTri[e], hullTri[q]);
        legalize(t + 2);
        hullTri[q] = t;
        hullNext[e] = e; // mark as removed
        e = q;
        q = hullPrev[e];
      }
    }

    // update hull indices and hash
    hullStart = hullPrev[i] = e;
    hullNext[e] = hullPrev[next] = i;
    hullNext[i] = next;
    hullHash[hashKey(x, y)] = i;
    hullHash[hashKey(coords[2 * e], coords[2 * e + 1])] = e;
  }

  return {
    triangles: triangles.subarray(0, trianglesLen) as Uint32Array,
    halfedges: halfedges.subarray(0, trianglesLen) as Int32Array,
  };
}

/**
 * Clip a convex cell polygon against an axis-aligned rectangle
 * (Sutherland–Hodgman). Returns the input Group unchanged (shared Pt
 * references) when every vertex is already inside.
 */
function _clipCellToRect(
  cell: Group,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
): Group {
  // fast path: fully inside
  let inside = true;
  for (let i = 0, len = cell.length; i < len; i++) {
    const px = cell[i][0];
    const py = cell[i][1];
    if (px < x0 || px > x1 || py < y0 || py > y1 || !Number.isFinite(px + py)) {
      inside = false;
      break;
    }
  }
  if (inside) return cell;

  // degenerate hull fragments (1-2 vertices) cannot form a polygon to clip;
  // keep only their in-bound vertices
  if (cell.length < 3) {
    const kept = new Group();
    for (let i = 0, len = cell.length; i < len; i++) {
      const px = cell[i][0];
      const py = cell[i][1];
      if (px >= x0 && px <= x1 && py >= y0 && py <= y1) kept.push(cell[i]);
    }
    return kept;
  }

  // clamp non-finite coordinates so intersection math stays finite
  const big = 1e7;
  let pts: number[][] = [];
  for (let i = 0, len = cell.length; i < len; i++) {
    let px = cell[i][0];
    let py = cell[i][1];
    if (!Number.isFinite(px)) px = px > 0 ? big : -big;
    if (!Number.isFinite(py)) py = py > 0 ? big : -big;
    if (Number.isNaN(px) || Number.isNaN(py)) continue;
    pts.push([px, py]);
  }

  // clip against each rect edge: keep(p) tests inside, cross(a,b) intersects
  const clip = (
    input: number[][],
    keep: (p: number[]) => boolean,
    cross: (a: number[], b: number[]) => number[],
  ): number[][] => {
    const output: number[][] = [];
    for (let i = 0, len = input.length; i < len; i++) {
      const a = input[i === 0 ? len - 1 : i - 1];
      const b = input[i];
      const keepB = keep(b);
      if (keep(a)) {
        if (keepB) output.push(b);
        else output.push(cross(a, b));
      } else if (keepB) {
        output.push(cross(a, b), b);
      }
    }
    return output;
  };

  const lerpAt = (a: number[], b: number[], t: number): number[] => [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
  ];

  pts = clip(
    pts,
    (p) => p[0] >= x0,
    (a, b) => lerpAt(a, b, (x0 - a[0]) / (b[0] - a[0])),
  );
  pts = clip(
    pts,
    (p) => p[0] <= x1,
    (a, b) => lerpAt(a, b, (x1 - a[0]) / (b[0] - a[0])),
  );
  pts = clip(
    pts,
    (p) => p[1] >= y0,
    (a, b) => lerpAt(a, b, (y0 - a[1]) / (b[1] - a[1])),
  );
  pts = clip(
    pts,
    (p) => p[1] <= y1,
    (a, b) => lerpAt(a, b, (y1 - a[1]) / (b[1] - a[1])),
  );

  const out = new Group();
  for (let i = 0, len = pts.length; i < len; i++) {
    out.push(new Pt(pts[i]));
  }
  return out;
}

/**
 * Delaunay is a [`Group`](#link) of Pts that generates Delaunay and Voronoi tessellations.
 * The triangulation core is adapted from [Delaunator](https://github.com/mapbox/delaunator)
 * (ISC License, © Mapbox); earlier versions were based on
 * [Paul Bourke's algorithm](http://paulbourke.net/papers/triangulate/).
 */
export class Delaunay extends Group {
  private _mesh: DelaunayMesh = [];
  private _triangles: Uint32Array | null = null;
  private _halfedges: Int32Array | null = null;
  private _shapes: DelaunayShape[] | null = null;

  /**
   * Generate Delaunay triangles. This function also caches the mesh that is used to generate Voronoi tessellation in `voronoi()`. See a [Delaunay demo here](../demo/index.html?name=create.delaunay).
   * @param triangleOnly if true, returns an array of triangles in Groups, otherwise return the whole DelaunayShape
   * @returns an array of Groups or an array of DelaunayShapes `{i, j, k, triangle, circle}` which records the indices of the vertices, and the calculated triangles and circumcircles
   */
  delaunay(triangleOnly: boolean = true): GroupLike[] | DelaunayShape[] {
    if (this.length < 3) return [];

    const n = this.length;
    this._mesh = [];
    for (let i = 0; i < n; i++) this._mesh[i] = {};

    const coords = new Float64Array(n * 2);
    for (let i = 0; i < n; i++) {
      coords[2 * i] = this[i][0];
      coords[2 * i + 1] = this[i][1];
    }

    const result = _triangulate(coords);
    this._triangles = result ? result.triangles : null;
    this._halfedges = result ? result.halfedges : null;
    this._shapes = null;
    if (!result) return [];
    const triIndices = result.triangles;

    const shapes: DelaunayShape[] = [];
    const tris: GroupLike[] = [];
    for (let t = 0, len = triIndices.length; t < len; t += 3) {
      const i = triIndices[t];
      const j = triIndices[t + 1];
      const k = triIndices[t + 2];
      const triangle = this._triangle(i, j, k);

      // scalar circumcircle, matching the shape of `Triangle.circumcircle`
      const ax = coords[2 * i];
      const ay = coords[2 * i + 1];
      const ccx = _circumcenterX(
        ax,
        ay,
        coords[2 * j],
        coords[2 * j + 1],
        coords[2 * k],
        coords[2 * k + 1],
      );
      const ccy = _circumcenterY(
        ax,
        ay,
        coords[2 * j],
        coords[2 * j + 1],
        coords[2 * k],
        coords[2 * k + 1],
      );
      const r = Math.sqrt(_sqDist(ax, ay, ccx, ccy));
      const circle = new Group(new Pt(ccx, ccy), new Pt(r, r));

      const shape: DelaunayShape = { i, j, k, triangle, circle };
      this._cache(shape);
      shapes.push(shape);
      tris.push(triangle);
    }
    this._shapes = shapes;

    return triangleOnly ? tris : shapes;
  }

  /**
   * Generate Voronoi cells. `delaunay()` must be called before calling this function. See a [Voronoi demo here](../demo/index.html?name=create.delaunay).
   * @param bound Optionally provide a rectangular bound (eg, `space.innerBound`) to clip the cells against.
   * Without a bound, cells around sliver triangles can extend to enormous coordinates (circumcenters of
   * nearly-collinear points), which is technically correct but extremely slow to draw.
   * @returns an array of Groups, each of which represents a Voronoi cell. Unclipped cells share their vertex Pts with the cached mesh (see [`Delaunay.mesh`](#link)), so treat them as read-only or clone before mutating.
   */
  voronoi(bound?: PtIterable): Group[] {
    const cells = this._voronoiCells();
    if (!bound) return cells;

    const _bound = Geom.boundingBox(Util.iterToArray(bound) as Group);
    const x0 = _bound[0][0];
    const y0 = _bound[0][1];
    const x1 = _bound[1][0];
    const y1 = _bound[1][1];
    for (let i = 0, len = cells.length; i < len; i++) {
      cells[i] = _clipCellToRect(cells[i], x0, y0, x1, y1);
    }
    return cells;
  }

  /** Assemble unclipped Voronoi cells. */
  private _voronoiCells(): Group[] {
    // walk the half-edge structure so each cell's circumcenters come out
    // already in polygon order — no per-cell angle sort needed
    const triangles = this._triangles;
    const halfedges = this._halfedges;
    const shapes = this._shapes;
    if (!triangles || !halfedges || !shapes) {
      // fallback (eg, subclasses bypassing delaunay()): sort per cell
      let vs: Group[] = [];
      let n = this._mesh;
      for (let i = 0, len = n.length; i < len; i++) {
        vs.push(this.neighborPts(i, true) as Group);
      }
      return vs;
    }

    const n = this._mesh.length;
    // one incoming half-edge per point; prefer hull edges so a boundary
    // point's walk starts at the open end of its fan and covers all of it
    const inedges = new Int32Array(n).fill(-1);
    for (let e = 0, len = triangles.length; e < len; e++) {
      const p = triangles[e % 3 === 2 ? e - 2 : e + 1];
      if (halfedges[e] === -1 || inedges[p] === -1) inedges[p] = e;
    }

    const vs: Group[] = [];
    for (let i = 0; i < n; i++) {
      const cell = new Group();
      const e0 = inedges[i];
      if (e0 !== -1) {
        let e = e0;
        do {
          cell.push(shapes[Math.floor(e / 3)].circle[0]);
          const next = e % 3 === 2 ? e - 2 : e + 1;
          if (triangles[next] !== i) break; // degenerate-case guard
          e = halfedges[next];
        } while (e !== -1 && e !== e0);
      }
      vs.push(cell);
    }
    return vs;
  }

  /**
   * Get the cached mesh. The mesh is an array of objects, each of which representing the enclosing triangles around a Pt in this Delaunay group.
   * @return an array of objects that store a series of DelaunayShapes
   */
  mesh(): DelaunayMesh {
    return this._mesh;
  }

  /**
   * Given an index of a Pt in this Delaunay Group, returns its neighboring Pts in the network.
   * @param i index of a Pt
   * @param sort if true, sort the neighbors so that their edges will form a polygon
   * @returns an array of Pts
   */
  neighborPts(i: number, sort = false): GroupLike {
    let cs = new Group();
    let n = this._mesh;
    for (let k in n[i]) {
      if (n[i].hasOwnProperty(k)) cs.push(n[i][k].circle[0]);
    }
    return sort ? Geom.sortEdges(cs) : cs;
  }

  /**
   * Given an index of a Pt in this Delaunay Group, returns its neighboring DelaunayShapes.
   * @param i index of a Pt
   * @returns an array of DelaunayShapes `{i, j, k, triangle, circle}`
   */
  neighbors(i: number): DelaunayShape[] {
    let cs = [];
    let n = this._mesh;
    for (let k in n[i]) {
      if (n[i].hasOwnProperty(k)) cs.push(n[i][k]);
    }
    return cs;
  }

  /**
   * Record a DelaunayShape in the mesh.
   * @param o DelaunayShape instance
   */
  protected _cache(o: DelaunayShape): void {
    this._mesh[o.i][`${Math.min(o.j, o.k)}-${Math.max(o.j, o.k)}`] = o;
    this._mesh[o.j][`${Math.min(o.i, o.k)}-${Math.max(o.i, o.k)}`] = o;
    this._mesh[o.k][`${Math.min(o.i, o.j)}-${Math.max(o.i, o.j)}`] = o;
  }

  /**
   * Get the initial "super triangle" that contains all the points in this set.
   * Not used by the current triangulation core; kept for subclass compatibility.
   * @returns a Group representing a triangle
   */
  protected _superTriangle(): Group {
    let minPt = this[0];
    let maxPt = this[0];
    for (let i = 1, len = this.length; i < len; i++) {
      minPt = minPt.$min(this[i]);
      maxPt = maxPt.$max(this[i]);
    }

    let d = maxPt.$subtract(minPt);
    let mid = minPt.$add(maxPt).divide(2);
    let dmax = Math.max(d[0], d[1]);

    return new Group(
      mid.$subtract(20 * dmax, dmax),
      mid.$add(0, 20 * dmax),
      mid.$add(20 * dmax, -dmax),
    );
  }

  /**
   * Get a triangle from 3 points in a list of points
   * @param i index 1
   * @param j index 2
   * @param k index 3
   * @param pts a Group of Pts
   */
  protected _triangle(
    i: number,
    j: number,
    k: number,
    pts: GroupLike = this,
  ): Group {
    return new Group(pts[i], pts[j], pts[k]);
  }

  /**
   * Get a circumcircle and triangle from 3 points in a list of points
   * @param i index 1
   * @param j index 2
   * @param k index 3
   * @param tri a Group representing a triangle, or `false` to create it from indices
   * @param pts a Group of Pts
   */
  protected _circum(
    i: number,
    j: number,
    k: number,
    tri: GroupLike | false,
    pts: GroupLike = this,
  ): DelaunayShape {
    let t = tri || this._triangle(i, j, k, pts);
    return {
      i: i,
      j: j,
      k: k,
      triangle: t,
      circle: Triangle.circumcircle(t)!,
    };
  }

  /**
   * Dedupe the edges array
   * @param edges
   */
  protected static _dedupe(edges: number[]): number[] {
    let j = edges.length;

    while (j > 1) {
      let b = edges[--j];
      let a = edges[--j];
      let i = j;

      while (i > 1) {
        let n = edges[--i];
        let m = edges[--i];

        if ((a == m && b == n) || (a == n && b == m)) {
          edges.splice(j, 2);
          edges.splice(i, 2);
          break;
        }
      }
    }

    return edges;
  }
}
