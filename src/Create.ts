/*! Pts.js is licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */

import { Pt, Group, type Bound } from "./Pt";
import { Line, Triangle } from "./Op";
import { Const, Util } from "./Util";
import { Num, Geom } from "./Num";
import { triangulate, type Triangulation } from "./_triangulate";
import {
  type PtLike,
  type PtLikeIterable,
  type GroupLike,
  type PtIterable,
  type DelaunayMesh,
  type DelaunayShape,
  type FlockBoundary,
  type FlockOptions,
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

  /**
   * Create a [`Flock`](#link) of [`Boid`](#link) agents that simulate flocking (also known as "boids"),
   * where each agent steers by three local rules: separation, alignment, and cohesion.
   * Advance the simulation by calling [`Flock.step`](#link) with the elapsed time.
   * See a [flocking demo here](https://ptsjs.org/demo/?name=create.flock).
   *
   * Each agent starts with a random heading, drawn from [`Num.random`](#link), so seeding with
   * [`Num.seed`](#link) makes a flock reproducible.
   *
   * @param pts a Group or an Iterable<Pt> of starting positions
   * @param options optional [`FlockOptions`](#link) to tune the behavior
   * @returns an instance of the Flock class, which is a Group of Boids
   * @example `Create.flock( Create.distributeRandom( space.innerBound, 200 ), { bound: space.innerBound } )`
   */
  static flock(pts: PtLikeIterable, options: FlockOptions = {}): Flock {
    const flock = new Flock();
    flock.setup(options);
    for (const p of pts) flock.addBoid(p);
    return flock;
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
   * Create a Noise Pt that can generate noise continuously. See a [Noise demo here](https://ptsjs.org/demo/?name=create.noisePts).
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

/** Keep the part of a convex cell nearer to site a than site b. */
function _clipCellToBisector(cell: Group, a: Pt, b: Pt): Group {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const mx = a[0] + dx / 2;
  const my = a[1] + dy / 2;
  const out = new Group();
  for (let i = 0; i < cell.length; i++) {
    const p = cell[i === 0 ? cell.length - 1 : i - 1];
    const q = cell[i];
    const dp = (p[0] - mx) * dx + (p[1] - my) * dy;
    const dq = (q[0] - mx) * dx + (q[1] - my) * dy;
    if (dp <= 0 !== dq <= 0) {
      const t = dp / (dp - dq);
      out.push(new Pt(p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t));
    }
    if (dq <= 0) out.push(q);
  }
  return out;
}

/** Circumcenter and radius of a triangle, as `[x, y, r]`. */
function _circumcircle(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number,
): [number, number, number] {
  const bx2 = bx - ax;
  const by2 = by - ay;
  const cx2 = cx - ax;
  const cy2 = cy - ay;
  const d = 2 * (bx2 * cy2 - by2 * cx2);
  const bl = bx2 * bx2 + by2 * by2;
  const cl = cx2 * cx2 + cy2 * cy2;
  const ux = (cy2 * bl - by2 * cl) / d;
  const uy = (bx2 * cl - cx2 * bl) / d;
  return [ax + ux, ay + uy, Math.sqrt(ux * ux + uy * uy)];
}

/**
 * Delaunay is a [`Group`](#link) of Pts that generates Delaunay and Voronoi tessellations.
 * Points are triangulated by incremental insertion in Hilbert-curve order with exact
 * orientation and in-circle tests, so grids, collinear runs, points on edges, and duplicate
 * points are handled without degenerate triangles.
 */
export class Delaunay extends Group {
  private _mesh: DelaunayMesh = [];
  private _meshBuilt = true;
  private _count = 0;
  private _tri: Triangulation | null = null;
  private _shapes: DelaunayShape[] | null = null;

  /**
   * Generate Delaunay triangles. This function also caches the mesh that is used to generate Voronoi tessellation in `voronoi()`. See a [Delaunay demo here](https://ptsjs.org/demo/?name=create.delaunay).
   * @param triangleOnly if true, returns an array of triangles in Groups, otherwise return the whole DelaunayShape
   * @returns an array of Groups or an array of DelaunayShapes `{i, j, k, triangle, circle}` which records the indices of the vertices, and the calculated triangles and circumcircles
   */
  delaunay(triangleOnly: boolean = true): GroupLike[] | DelaunayShape[] {
    const n = this.length;
    this._count = n;
    this._mesh = [];
    this._meshBuilt = false;
    this._tri = null;
    this._shapes = null;
    if (n < 3) return [];

    const coords = new Float64Array(n * 2);
    for (let i = 0; i < n; i++) {
      coords[2 * i] = this[i][0];
      coords[2 * i + 1] = this[i][1];
    }

    const tri = triangulate(coords, n);
    if (tri.triangles.length === 0) return [];
    this._tri = tri;
    const indices = tri.triangles;

    const shapes: DelaunayShape[] = [];
    const tris: GroupLike[] = [];
    for (let t = 0, len = indices.length; t < len; t += 3) {
      const i = indices[t];
      const j = indices[t + 1];
      const k = indices[t + 2];
      const triangle = this._triangle(i, j, k);
      // scalar circumcircle, matching the shape of `Triangle.circumcircle`
      const [ccx, ccy, r] = _circumcircle(
        coords[2 * i],
        coords[2 * i + 1],
        coords[2 * j],
        coords[2 * j + 1],
        coords[2 * k],
        coords[2 * k + 1],
      );
      const circle = new Group(new Pt(ccx, ccy), new Pt(r, r));

      shapes.push({ i, j, k, triangle, circle });
      tris.push(triangle);
    }
    this._shapes = shapes;

    return triangleOnly ? tris : shapes;
  }

  /**
   * The per-point mesh cache is keyed by neighbor-pair strings, which costs
   * more than the triangulation itself; build it the first time it is read.
   */
  private _ensureMesh(): DelaunayMesh {
    if (!this._meshBuilt) {
      this._meshBuilt = true;
      this._mesh = [];
      for (let i = 0; i < this._count; i++) this._mesh[i] = {};
      if (this._shapes) {
        for (let s = 0, len = this._shapes.length; s < len; s++) {
          this._cache(this._shapes[s]);
        }
      }
    }
    return this._mesh;
  }

  /**
   * Generate Voronoi cells. `delaunay()` must be called before calling this function. See a [Voronoi demo here](https://ptsjs.org/demo/?name=create.delaunay).
   * @param bound Optionally provide a rectangular bound (eg, `space.innerBound`) to clip the cells against, including the unbounded cells on the convex hull.
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
    const hull = new Set<number>();
    if (this._tri) for (const i of this._tri.hull) hull.add(i);
    const seen = new Set<string>();
    for (let i = 0, len = cells.length; i < len; i++) {
      const key = `${this[i][0]},${this[i][1]}`;
      if (seen.has(key)) {
        cells[i] = new Group();
        continue;
      }
      seen.add(key);
      if (!hull.has(i) && cells[i].length >= 3) {
        cells[i] = _clipCellToRect(cells[i], x0, y0, x1, y1);
        continue;
      }

      // Hull fans do not enclose their unbounded Voronoi regions. Start
      // with the bound and intersect the half-planes of neighboring sites.
      const neighbors = new Set<number>();
      for (const shape of this.neighbors(i)) {
        for (const index of [shape.i, shape.j, shape.k]) {
          if (index !== i) neighbors.add(index);
        }
      }
      // Collinear and small point sets have no triangles; every site is a
      // candidate neighbor. Duplicate sites leave the first cell unchanged.
      if (neighbors.size === 0) {
        for (let j = 0; j < this.length; j++) if (j !== i) neighbors.add(j);
      }
      let cell = Group.fromArray([
        [x0, y0],
        [x1, y0],
        [x1, y1],
        [x0, y1],
      ]);
      for (const j of neighbors)
        cell = _clipCellToBisector(cell, this[i], this[j]);
      cells[i] = cell;
    }
    return cells;
  }

  /** Assemble unclipped Voronoi cells. */
  private _voronoiCells(): Group[] {
    const tri = this._tri;
    const shapes = this._shapes;
    if (!tri || !shapes) {
      // fallback (eg, subclasses bypassing delaunay()): sort per cell
      const vs: Group[] = [];
      const n = this._ensureMesh();
      for (let i = 0, len = n.length; i < len; i++) {
        vs.push(this.neighborPts(i, true) as Group);
      }
      return vs;
    }

    // Walk the triangles around each point counterclockwise, so its
    // circumcenters come out already in polygon order. A hull point's fan is
    // open: start it at the triangle whose outgoing edge is on the hull.
    const n = this._count;
    const triangles = tri.triangles;
    const neighbors = tri.neighbors;
    const start = new Int32Array(n).fill(-1);
    for (let h = 0, len = triangles.length; h < len; h++) {
      const p = triangles[h];
      if (neighbors[h] === -1 || start[p] === -1) start[p] = h;
    }

    const vs: Group[] = [];
    for (let i = 0; i < n; i++) {
      const cell = new Group();
      let h = start[i];
      if (h !== -1) {
        const first = (h / 3) | 0;
        for (;;) {
          const t = (h / 3) | 0;
          cell.push(shapes[t].circle[0]);
          // the edge entering this point leads to the next triangle around it
          const twin = neighbors[3 * t + ((h + 2) % 3)];
          if (twin === -1 || ((twin / 3) | 0) === first) break;
          h = twin;
        }
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
    return this._ensureMesh();
  }

  /**
   * Given an index of a Pt in this Delaunay Group, returns its neighboring Pts in the network.
   * @param i index of a Pt
   * @param sort if true, sort the neighbors so that their edges will form a polygon
   * @returns an array of Pts
   */
  neighborPts(i: number, sort = false): GroupLike {
    let cs = new Group();
    let n = this._ensureMesh();
    for (let k in n[i]) {
      if (n[i].hasOwnProperty(k)) cs.push(n[i][k].circle[0]);
    }
    return sort && cs.length > 1 ? Geom.sortEdges(cs) : cs;
  }

  /**
   * Given an index of a Pt in this Delaunay Group, returns its neighboring DelaunayShapes.
   * @param i index of a Pt
   * @returns an array of DelaunayShapes `{i, j, k, triangle, circle}`
   */
  neighbors(i: number): DelaunayShape[] {
    let cs = [];
    let n = this._ensureMesh();
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

/**
 * Accumulate one behavior's contribution as a weighted unit vector.
 *
 * The three behaviors are blended as *directions* and only then turned into a single steering
 * force, rather than each producing its own `desired - velocity` steer that are then summed.
 * Summing them would apply the `- velocity` damping term once per behavior, so with weights
 * totalling ~3.8 an agent is dragged toward a standstill whenever the behaviors disagree —
 * which is exactly what happens inside a tight cluster, where cohesion and separation nearly
 * oppose. Blending first also bounds separation structurally: its inverse-square sum is
 * normalized here, so no amount of piled-up neighbors can dominate the result.
 *
 * Does nothing when the direction is degenerate (zero length), which happens whenever neighbor
 * velocities cancel out or an agent sits exactly on its neighbors' center.
 */
function __flock_accumulateUnit(
  out: Float32Array,
  dx: number,
  dy: number,
  weight: number,
): void {
  const mag2 = dx * dx + dy * dy;
  if (mag2 <= 0) return;
  const scale = weight / Math.sqrt(mag2);
  out[0] += dx * scale;
  out[1] += dy * scale;
}

/**
 * Two agents at the exact same position have no direction to separate along. Rather than
 * leaving them fused forever, separation falls back to this offset, which the antisymmetric
 * accumulation splits into +x for one agent and -x for the other.
 */
const __flock_tieBreak = 1;

/**
 * Separation weights each neighbor by inverse-square distance, so a pair that is nearly
 * coincident would produce an unbounded force. Distances are clamped to this fraction of the
 * separation radius. (The per-behavior `maxForce` clamp is what ultimately bounds the sum.)
 */
const __flock_minSepFraction = 0.01;

/**
 * Cell indices are hashed through `Math.imul`, which truncates to int32, so anything past this
 * carries no information. It is also the guard that keeps the 3x3 cell walk terminating: a
 * non-finite position yields a non-finite cell index, and `gy <= cy + 1` is either always true
 * (Infinity) or leaves `gy++` unable to advance (magnitudes where adding 1 is a no-op in
 * float64). The comparison is written so NaN fails it too.
 */
const __flock_maxCell = 0x7fffffff;
/** Cell coordinate of an agent with no finite neighborhood; below every valid cell. */
const __flock_noCell = -0x80000000;

/**
 * Boid is a subclass of [`Pt`](#link) that represents a single agent in a [`Flock`](#link).
 * Its own values are the agent's position, and it carries a `velocity` that [`Flock.step`](#link)
 * integrates. Create them through [`Create.flock`](#link) or [`Flock.addBoid`](#link).
 * See [a demo here](https://ptsjs.org/demo/?name=create.flock).
 */
export class Boid extends Pt {
  protected _vel: Pt = new Pt(0, 0);

  /**
   * This agent's velocity, in units per second.
   */
  get velocity(): Pt {
    return this._vel;
  }
  set velocity(v: Pt) {
    this._vel = v;
  }

  /**
   * This agent's speed, in units per second.
   */
  get speed(): number {
    return Math.sqrt(this._vel[0] * this._vel[0] + this._vel[1] * this._vel[1]);
  }

  /**
   * The angle this agent is heading toward, in radians. Note that a stationary agent has no
   * heading and reports 0 (pointing along +x) rather than NaN. Set a [`Flock`](#link)'s
   * `minSpeed` if you are drawing headings and want to avoid that.
   */
  get heading(): number {
    return Math.atan2(this._vel[1], this._vel[0]);
  }
}

/**
 * Flock is a subclass of [`Group`](#link) that holds [`Boid`](#link) agents and simulates
 * flocking behavior (also known as "boids", after Craig Reynolds). Each agent steers by three
 * local rules — separation, alignment, and cohesion — evaluated over the neighbors within its
 * `perception` radius. Create one with [`Create.flock`](#link) and advance it with
 * [`Flock.step`](#link). Since a Flock is a Group of Pts, it draws directly:
 * `form.points( flock, 2, "circle" )`.
 *
 * Neighbors are found through a uniform spatial hash rather than by testing every pair, so the
 * cost scales with the number of agents rather than with its square.
 * See [a demo here](https://ptsjs.org/demo/?name=create.flock).
 */
export class Flock extends Group {
  protected _perception: number = 40;
  protected _separation: number = 20;
  protected _cohesionWeight: number = 1;
  protected _alignWeight: number = 1;
  protected _separateWeight: number = 1.5;
  protected _maxSpeed: number = 100;
  protected _minSpeed: number = 0;
  protected _maxForce: number = 200;
  protected _boundary: FlockBoundary = "steer";
  protected _margin: number = 50;
  protected _maxTimeStep: number = 50;
  protected _bound: GroupLike | null = null;
  protected _initialSpeed: number | undefined = undefined;

  // Flat per-agent state, gathered from the Boids at the start of each step and scattered back
  // at the end. The neighbor pass runs entirely on these, so it reads sequential memory instead
  // of chasing `this[i].velocity[0]` through two objects for every pair.
  private _pos: Float32Array = new Float32Array(0);
  private _vel: Float32Array = new Float32Array(0);
  // Per-agent accumulators, interleaved 6-wide: cohesion x/y, alignment x/y, separation x/y.
  private _sums: Float32Array = new Float32Array(0);
  private _counts: Uint32Array = new Uint32Array(0);

  // Spatial-hash scratch, grown geometrically and reused across steps.
  private _hashKeys: Uint32Array = new Uint32Array(0);
  private _cellX: Int32Array = new Int32Array(0);
  private _cellY: Int32Array = new Int32Array(0);
  private _cellStart: Uint32Array = new Uint32Array(0);
  private _cellEntries: Uint32Array = new Uint32Array(0);
  private _steerOut: Float32Array = new Float32Array(2);

  /**
   * Set any number of options at once. Unspecified options keep their current value.
   * @param options a [`FlockOptions`](#link) object
   */
  setup(options: FlockOptions): this {
    if (options.perception !== undefined) this.perception = options.perception;
    if (options.separation !== undefined) this.separation = options.separation;
    if (options.cohesionWeight !== undefined)
      this._cohesionWeight = options.cohesionWeight;
    if (options.alignWeight !== undefined)
      this._alignWeight = options.alignWeight;
    if (options.separateWeight !== undefined)
      this._separateWeight = options.separateWeight;
    if (options.maxSpeed !== undefined) this.maxSpeed = options.maxSpeed;
    if (options.minSpeed !== undefined) this.minSpeed = options.minSpeed;
    if (options.maxForce !== undefined) this._maxForce = options.maxForce;
    if (options.bound !== undefined) this._bound = options.bound as GroupLike;
    if (options.boundary !== undefined) this._boundary = options.boundary;
    if (options.margin !== undefined) this.margin = options.margin;
    if (options.maxTimeStep !== undefined)
      this.maxTimeStep = options.maxTimeStep;
    if (options.initialSpeed !== undefined)
      this._initialSpeed = options.initialSpeed;
    return this;
  }

  /**
   * Radius within which an agent sees its neighbors. This is also the spatial hash's cell size.
   */
  get perception(): number {
    return this._perception;
  }
  set perception(r: number) {
    this._perception = Math.max(0, r);
  }

  /**
   * Radius within which an agent steers away from its neighbors. Values above `perception`
   * have no additional effect, since an agent only considers neighbors it can see.
   */
  get separation(): number {
    return this._separation;
  }
  set separation(r: number) {
    this._separation = Math.max(0, r);
  }

  /**
   * Weight of the cohesion behavior, which steers an agent toward its neighbors' center.
   */
  get cohesionWeight(): number {
    return this._cohesionWeight;
  }
  set cohesionWeight(w: number) {
    this._cohesionWeight = w;
  }

  /**
   * Weight of the alignment behavior, which matches an agent's heading to its neighbors'.
   */
  get alignWeight(): number {
    return this._alignWeight;
  }
  set alignWeight(w: number) {
    this._alignWeight = w;
  }

  /**
   * Weight of the separation behavior, which steers an agent away from close neighbors.
   */
  get separateWeight(): number {
    return this._separateWeight;
  }
  set separateWeight(w: number) {
    this._separateWeight = w;
  }

  /**
   * Maximum speed, in units per second.
   */
  get maxSpeed(): number {
    return this._maxSpeed;
  }
  set maxSpeed(s: number) {
    this._maxSpeed = Math.max(0, s);
  }

  /**
   * Minimum speed, in units per second, so agents never stall. Default is 0.
   */
  get minSpeed(): number {
    return this._minSpeed;
  }
  set minSpeed(s: number) {
    this._minSpeed = Math.max(0, s);
  }

  /**
   * Maximum steering force, in units per second squared. This caps how sharply an agent can
   * turn toward the direction its three behaviors blend to. A boundary turn is added on top,
   * so an agent near an edge can accelerate up to twice this.
   */
  get maxForce(): number {
    return this._maxForce;
  }
  set maxForce(f: number) {
    this._maxForce = f;
  }

  /**
   * Boundary that keeps the flock in view, as a [`Bound`](#link) or a Group of 2 Pts.
   * When this is null, no boundary behavior is applied regardless of `boundary`.
   */
  get bound(): GroupLike | null {
    return this._bound;
  }
  set bound(b: GroupLike | null) {
    this._bound = b;
  }

  /**
   * How the boundary is treated: `"steer"`, `"wrap"`, `"bounce"`, or `"none"`.
   *
   * Note that `"wrap"` teleports agents across the bound while the neighborhood search is not
   * toroidal, so a flock loses sight of itself at the seam. Prefer `"steer"` when that matters.
   */
  get boundary(): FlockBoundary {
    return this._boundary;
  }
  set boundary(b: FlockBoundary) {
    this._boundary = b;
  }

  /**
   * Distance from an edge at which `"steer"` starts turning agents back.
   */
  get margin(): number {
    return this._margin;
  }
  set margin(m: number) {
    this._margin = Math.max(0, m);
  }

  /**
   * Maximum simulated time in milliseconds per [`Flock.step`](#link) call. Longer elapsed times
   * are clamped to this, which keeps a stalled frame from teleporting the flock. Default is 50.
   */
  get maxTimeStep(): number {
    return this._maxTimeStep;
  }
  set maxTimeStep(ms: number) {
    this._maxTimeStep = Math.max(0, ms);
  }

  /**
   * Speed given to an agent added without an explicit velocity. Defaults to half of `maxSpeed`.
   */
  get initialSpeed(): number {
    return this._initialSpeed === undefined
      ? this._maxSpeed * 0.5
      : this._initialSpeed;
  }
  set initialSpeed(s: number) {
    this._initialSpeed = s;
  }

  /**
   * Add an agent to this flock. Named `addBoid` rather than `add` because [`Group.add`](#link)
   * already means "translate every Pt in this group", and [`Group.moveBy`](#link) delegates to it.
   * @param pt a Pt, a Boid, or an array of numbers for the starting position
   * @param velocity optional starting velocity. When omitted, a new agent gets a random heading
   * at [`Flock.initialSpeed`](#link), drawn from [`Num.random`](#link).
   */
  addBoid(pt: PtLike | Boid, velocity?: PtLike): this {
    const isBoid = pt instanceof Boid;
    const boid = isBoid ? (pt as Boid) : new Boid(pt);
    if (velocity !== undefined) {
      boid.velocity[0] = velocity[0];
      boid.velocity[1] = velocity[1];
    } else if (!isBoid) {
      const a = Num.random() * Const.two_pi;
      const s = this.initialSpeed;
      boid.velocity[0] = Math.cos(a) * s;
      boid.velocity[1] = Math.sin(a) * s;
    }
    this.push(boid);
    return this;
  }

  /**
   * Advance the simulation. Call this once per frame with the frame time, eg
   * `space.add( (time, ftime) => flock.step( ftime ) )`.
   *
   * Elapsed times longer than [`Flock.maxTimeStep`](#link) are clamped, so a slow frame slows
   * the flock down instead of teleporting it. A non-positive or NaN time is a no-op.
   *
   * @param ms elapsed time in milliseconds
   */
  step(ms: number): this {
    const n = this.length;
    if (n === 0 || !(ms > 0)) return this;

    const dt = Math.min(ms, this._maxTimeStep) / 1000;
    if (dt <= 0) return this;

    this._ensureBuffers(n);
    this._gather(n);
    if (n > 1 && this._perception > 0) {
      this._accumulate(n);
    } else {
      this._sums.fill(0, 0, n * 6);
      this._counts.fill(0, 0, n);
    }
    this._integrate(n, dt);
    this._scatter(n);
    return this;
  }

  /**
   * Grow the flat state and hash scratch to fit `n` agents. Every buffer is fully written
   * before it is read within a step, so reallocating here never loses state.
   */
  private _ensureBuffers(n: number) {
    if (this._pos.length < n * 2) {
      const size = n * 2 * 2; // geometric growth
      this._pos = new Float32Array(size);
      this._vel = new Float32Array(size);
      this._sums = new Float32Array(size * 3);
      this._counts = new Uint32Array(size);
      this._hashKeys = new Uint32Array(size);
      this._cellX = new Int32Array(size);
      this._cellY = new Int32Array(size);
      this._cellEntries = new Uint32Array(size);
    }
  }

  /**
   * Copy positions and velocities out of the Boids into the flat buffers. An element that
   * reached this Group without a velocity — pushed as a plain Pt, or produced by a Group method
   * that copies through the species constructor — is upgraded to a Boid in place here rather
   * than throwing mid-simulation.
   */
  private _gather(n: number) {
    const pos = this._pos;
    const vel = this._vel;
    for (let i = 0; i < n; i++) {
      let b = this[i] as Boid;
      let v = b.velocity;
      if (v === undefined) {
        b = new Boid(b);
        v = b.velocity;
        this[i] = b;
      }
      const k = i * 2;
      pos[k] = b[0];
      pos[k + 1] = b[1];
      vel[k] = v[0];
      vel[k + 1] = v[1];
    }
  }

  /**
   * Write the integrated positions and velocities back into the Boids.
   */
  private _scatter(n: number) {
    const pos = this._pos;
    const vel = this._vel;
    for (let i = 0; i < n; i++) {
      const b = this[i] as Boid;
      const v = b.velocity;
      const k = i * 2;
      b[0] = pos[k];
      b[1] = pos[k + 1];
      v[0] = vel[k];
      v[1] = vel[k + 1];
    }
  }

  /**
   * Accumulate the three behaviors' sums for every agent in a single pass over neighboring
   * pairs, using a uniform spatial hash (a counting-sort grid) built the same way as
   * [`World`](#link)'s collision broad phase — see `World._collideParticles`. The two are kept
   * separate on purpose: this one queries a fixed radius and accumulates into flat sums, and
   * sharing an abstraction between them would put an indirect call on the per-pair path.
   *
   * Cells are exactly `perception` wide, which is the smallest size for which every neighbor
   * within that radius is guaranteed to lie in the 3x3 block around an agent's cell. Each
   * agent's cell coordinates are kept, so an entry found through a hash bucket is checked
   * against the cell actually being visited: two cells that collide into one bucket cannot
   * count a neighbor twice or hide one. That exact check is also what allows visiting only
   * half of the neighborhood — the agent's own cell (pairing with higher indices) plus the four
   * cells east, south-west, south, and south-east — since every pair of adjacent cells is then
   * seen from exactly one side.
   *
   * Each pair is accumulated into both agents: "j is within r of i" is symmetric, so this
   * halves the distance computations. No `sqrt` is taken here — radius tests compare squared
   * distances, and separation falls off as the inverse square, which is what makes the
   * fallback in `__flock_tieBreak` necessary.
   */
  private _accumulate(n: number) {
    const pos = this._pos;
    const vel = this._vel;
    const sums = this._sums;
    const counts = this._counts;

    sums.fill(0, 0, n * 6);
    counts.fill(0, 0, n);

    const r2 = this._perception * this._perception;
    const sep = Math.min(this._separation, this._perception);
    const sep2 = sep * sep;
    const minSep = sep * __flock_minSepFraction;
    const minSep2 = minSep * minSep;
    const inv = 1 / this._perception;

    // Hash table size: the next power of two above 2n, so buckets stay sparse.
    let m = 16;
    while (m < n * 2) m <<= 1;
    const mask = m - 1;
    if (this._cellStart.length < m + 1)
      this._cellStart = new Uint32Array(m + 1);

    const keys = this._hashKeys;
    const cellX = this._cellX;
    const cellY = this._cellY;
    const start = this._cellStart;
    const entries = this._cellEntries;

    // Cell coordinates once per agent. A non-finite or absurd position gets a sentinel cell
    // that no neighborhood visit can match, so it neither sees nor is seen (see
    // `__flock_maxCell`). Then count per cell, exclusive prefix sum, and scatter; after the
    // scatter, bucket k spans [start[k-1], start[k]).
    start.fill(0, 0, m + 1);
    for (let i = 0; i < n; i++) {
      const cx = Math.floor(pos[i * 2] * inv);
      const cy = Math.floor(pos[i * 2 + 1] * inv);
      if (
        cx >= -__flock_maxCell &&
        cx <= __flock_maxCell &&
        cy >= -__flock_maxCell &&
        cy <= __flock_maxCell
      ) {
        cellX[i] = cx;
        cellY[i] = cy;
      } else {
        cellX[i] = __flock_noCell;
        cellY[i] = __flock_noCell;
      }
      const key =
        ((Math.imul(cellX[i], 0x9e3779b1) ^ Math.imul(cellY[i], 0x85ebca77)) >>>
          0) &
        mask;
      keys[i] = key;
      start[key]++;
    }
    let sum = 0;
    for (let k = 0; k < m; k++) {
      const c = start[k];
      start[k] = sum;
      sum += c;
    }
    start[m] = sum;
    for (let i = 0; i < n; i++) {
      entries[start[keys[i]]++] = i;
    }

    for (let i = 0; i < n; i++) {
      const cx = cellX[i];
      if (cx === __flock_noCell) continue;
      const cy = cellY[i];
      const ki = i * 2;
      const ix = pos[ki];
      const iy = pos[ki + 1];
      const ivx = vel[ki];
      const ivy = vel[ki + 1];
      const si = i * 6;

      // the five cells of the half neighborhood, own cell first
      for (let c = 0; c < 5; c++) {
        const gx = c === 2 ? cx - 1 : c === 0 || c === 3 ? cx : cx + 1;
        const gy = c < 2 ? cy : cy + 1;
        const key =
          ((Math.imul(gx, 0x9e3779b1) ^ Math.imul(gy, 0x85ebca77)) >>> 0) &
          mask;
        const end = start[key];
        const begin = key > 0 ? start[key - 1] : 0;
        for (let e = begin; e < end; e++) {
          const j = entries[e];
          if (cellX[j] !== gx || cellY[j] !== gy) continue; // another cell in this bucket
          if (c === 0 && j <= i) continue; // own cell: each pair once

          const kj = j * 2;
          const jx = pos[kj];
          const jy = pos[kj + 1];
          const dx = jx - ix;
          const dy = jy - iy;
          const d2 = dx * dx + dy * dy;
          if (!(d2 < r2)) continue;

          const sj = j * 6;
          sums[si] += jx;
          sums[si + 1] += jy;
          sums[sj] += ix;
          sums[sj + 1] += iy;
          sums[si + 2] += vel[kj];
          sums[si + 3] += vel[kj + 1];
          sums[sj + 2] += ivx;
          sums[sj + 3] += ivy;
          counts[i]++;
          counts[j]++;

          if (d2 < sep2) {
            let ox = dx;
            let oy = dy;
            let dd = d2;
            if (dd === 0) {
              // Coincident agents have no direction to separate along; split them along x.
              ox = __flock_tieBreak;
              oy = 0;
              dd = minSep2;
            } else if (dd < minSep2) {
              dd = minSep2;
            }
            const w = 1 / dd;
            const wx = ox * w;
            const wy = oy * w;
            sums[si + 4] -= wx;
            sums[si + 5] -= wy;
            sums[sj + 4] += wx;
            sums[sj + 5] += wy;
          }
        }
      }
    }
  }

  /**
   * Turn the accumulated sums into a steering force per agent, then integrate velocity and
   * position. This is O(n), so it uses the classic "steer toward the desired velocity"
   * formulation and its handful of square roots, which behaves better than weighting raw
   * offsets and keeps `maxSpeed` and `maxForce` as the only scale-dependent knobs.
   * See `__flock_accumulateUnit` for why the behaviors are blended before that steer is taken.
   */
  private _integrate(n: number, dt: number) {
    const pos = this._pos;
    const vel = this._vel;
    const sums = this._sums;
    const counts = this._counts;
    const out = this._steerOut;

    const maxSpeed = this._maxSpeed;
    const maxForce = this._maxForce;
    const minSpeed = Math.min(this._minSpeed, maxSpeed);
    const cw = this._cohesionWeight;
    const aw = this._alignWeight;
    const sw = this._separateWeight;

    const bound = this._bound;
    const boundary = bound ? this._boundary : "none";
    const steer = boundary === "steer" && this._margin > 0;
    const wrap = boundary === "wrap";
    const bounce = boundary === "bounce";
    let minX = 0;
    let minY = 0;
    let maxX = 0;
    let maxY = 0;
    if (bound && boundary !== "none") {
      const b0 = bound[0];
      const b1 = bound[1];
      minX = Math.min(b0[0], b1[0]);
      minY = Math.min(b0[1], b1[1]);
      maxX = Math.max(b0[0], b1[0]);
      maxY = Math.max(b0[1], b1[1]);
    }
    const margin = this._margin;

    for (let i = 0; i < n; i++) {
      const k = i * 2;
      const s = i * 6;
      let px = pos[k];
      let py = pos[k + 1];
      let vx = vel[k];
      let vy = vel[k + 1];

      // Blend the three behaviors into one desired direction...
      out[0] = 0;
      out[1] = 0;
      const c = counts[i];
      if (c > 0) {
        // steer toward the neighbors' center
        if (cw !== 0) {
          __flock_accumulateUnit(
            out,
            sums[s] / c - px,
            sums[s + 1] / c - py,
            cw,
          );
        }
        // match the neighbors' heading. The mean and the sum point the same way, and the
        // direction is normalized anyway, so the neighbor count is not needed here.
        if (aw !== 0) __flock_accumulateUnit(out, sums[s + 2], sums[s + 3], aw);
        if (sw !== 0) __flock_accumulateUnit(out, sums[s + 4], sums[s + 5], sw);
      }

      // ...then take a single steer toward it, so the damping is applied once.
      let ax = 0;
      let ay = 0;
      const dm2 = out[0] * out[0] + out[1] * out[1];
      if (dm2 > 0) {
        const sc = maxSpeed / Math.sqrt(dm2);
        ax = out[0] * sc - vx;
        ay = out[1] * sc - vy;
        const f2 = ax * ax + ay * ay;
        if (f2 > maxForce * maxForce) {
          const fs = maxForce / Math.sqrt(f2);
          ax *= fs;
          ay *= fs;
        }
      }

      if (steer) {
        // Ramp the turn from zero at the margin's inner edge to full force at the wall, and
        // hold it at full force for anything that already escaped. This is added on top of the
        // blended steer rather than mixed into it, so the flock's own rules cannot outvote it
        // and pin a cluster against an edge.
        const dl = px - minX;
        const dr = maxX - px;
        const dtp = py - minY;
        const db = maxY - py;
        if (dl < margin) ax += maxForce * (1 - Math.max(dl, 0) / margin);
        else if (dr < margin) ax -= maxForce * (1 - Math.max(dr, 0) / margin);
        if (dtp < margin) ay += maxForce * (1 - Math.max(dtp, 0) / margin);
        else if (db < margin) ay -= maxForce * (1 - Math.max(db, 0) / margin);
      }

      vx += ax * dt;
      vy += ay * dt;

      const sp2 = vx * vx + vy * vy;
      if (sp2 > maxSpeed * maxSpeed) {
        const sc = maxSpeed / Math.sqrt(sp2);
        vx *= sc;
        vy *= sc;
      } else if (minSpeed > 0 && sp2 < minSpeed * minSpeed) {
        if (sp2 > 0) {
          const sc = minSpeed / Math.sqrt(sp2);
          vx *= sc;
          vy *= sc;
        } else {
          // A dead stop has no heading to preserve; pick one deterministically.
          vx = minSpeed;
          vy = 0;
        }
      }

      px += vx * dt;
      py += vy * dt;

      if (wrap) {
        const w = maxX - minX;
        const h = maxY - minY;
        if (w > 0) {
          if (px < minX) px = maxX - ((minX - px) % w);
          else if (px > maxX) px = minX + ((px - maxX) % w);
        }
        if (h > 0) {
          if (py < minY) py = maxY - ((minY - py) % h);
          else if (py > maxY) py = minY + ((py - maxY) % h);
        }
      } else if (bounce) {
        // `<=` rather than `<`: an agent that lands exactly on the wall is still heading out,
        // and would otherwise leave on the next step without ever reflecting.
        if (px <= minX) {
          px = minX;
          if (vx < 0) vx = -vx;
        } else if (px >= maxX) {
          px = maxX;
          if (vx > 0) vx = -vx;
        }
        if (py <= minY) {
          py = minY;
          if (vy < 0) vy = -vy;
        } else if (py >= maxY) {
          py = maxY;
          if (vy > 0) vy = -vy;
        }
      }

      pos[k] = px;
      pos[k + 1] = py;
      vel[k] = vx;
      vel[k + 1] = vy;
    }
  }
}
