/*! Pts.js is licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */

/**
 * Internal 2D Delaunay triangulation used by [`Delaunay`](#link).
 *
 * Points are inserted one at a time in Hilbert-curve order, so each point is
 * found by a short walk from the previous insertion. An insertion removes every
 * triangle whose circumcircle contains the point and fans the resulting cavity
 * from it (Bowyer–Watson). The convex hull is represented by ghost triangles
 * that share one vertex "at infinity", which lets hull growth use the same
 * cavity step as interior insertion and keeps every half-edge paired.
 *
 * Orientation and in-circle decisions are exact. A floating-point error
 * bound settles the easy cases; integer coordinates below 2^25 are resolved
 * with limb arithmetic in doubles; anything else is evaluated in BigInt from
 * the exact binary value of each coordinate. Exact decisions are what make
 * cocircular grids, collinear runs, points on edges, and duplicate points
 * safe: they can never produce a degenerate triangle or an endless walk.
 */

/** A triangulation of the finite, distinct input points. */
export type Triangulation = {
  /** Point indices, three per triangle, counterclockwise. */
  triangles: Uint32Array;
  /**
   * For half-edge `h = 3t + e` (from `triangles[h]` to the triangle's next vertex),
   * the index of the opposite half-edge in the adjacent triangle, or -1 on the hull.
   */
  neighbors: Int32Array;
  /** Point indices of the convex hull, counterclockwise. Empty when there are no triangles. */
  hull: Uint32Array;
};

const EMPTY: Triangulation = {
  triangles: new Uint32Array(0),
  neighbors: new Int32Array(0),
  hull: new Uint32Array(0),
};

// ---------------------------------------------------------------- predicates

// 2^-53: half an ulp at 1, the rounding error of one double operation
const EPS = 1.1102230246251565e-16;
// Bounds on the rounding error of the determinants below, relative to the sum
// of the absolute values of their terms (the classic forward error analysis
// of the orientation and in-circle determinants).
const ORIENT_BOUND = (3 + 16 * EPS) * EPS;
const INCIRCLE_BOUND = (10 + 96 * EPS) * EPS;
// Coordinates that become integers below 2^31 when scaled by one power of two
// (pixel grids, halves, quarters, every Float32 value in a sane range) keep
// their differences exact in a double; the products those differences form are
// then evaluated exactly in limb arithmetic without BigInt.
const INT_LIMIT = 2147483648;
const _input = new Float64Array(8);
// the scale shared by every coordinate of the set being triangulated, when
// one exists (set by `triangulate`); 0 means decide per call
let _presetScale = 0;

/**
 * The smallest power of two that turns every value in `_input[0..count)` into
 * an integer below 2^31 in magnitude, or 0 when no scale up to 2^30 does.
 */
function _integerScale(count: number): number {
  if (_presetScale > 0) return _presetScale;
  let scale = 1;
  for (let k = 0; k <= 30; k++) {
    let exact = true;
    for (let i = 0; i < count; i++) {
      const v = _input[i] * scale;
      if (v >= INT_LIMIT || v <= -INT_LIMIT) return 0; // scaling only grows
      if ((v | 0) !== v) exact = false;
    }
    if (exact) return scale;
    scale *= 2;
  }
  return 0;
}

/**
 * Orientation of `c` relative to the directed line `a → b`:
 * 1 when `c` is to the left (counterclockwise turn), -1 to the right, 0 when collinear.
 * The result is exact for any finite doubles.
 */
export function orient2d(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number,
): number {
  const left = (ax - cx) * (by - cy);
  const right = (ay - cy) * (bx - cx);
  const det = left - right;
  const bound = ORIENT_BOUND * (Math.abs(left) + Math.abs(right));
  if (det > bound) return 1;
  if (-det > bound) return -1;
  _input[0] = ax;
  _input[1] = ay;
  _input[2] = bx;
  _input[3] = by;
  _input[4] = cx;
  _input[5] = cy;
  const scale = _integerScale(6);
  if (scale !== 0) {
    return _orientInt(
      (ax - cx) * scale,
      (by - cy) * scale,
      (ay - cy) * scale,
      (bx - cx) * scale,
    );
  }
  return orient2dExact(ax, ay, bx, by, cx, cy);
}

/**
 * In-circle test: 1 when `d` is strictly inside the circle through the
 * counterclockwise triangle `a, b, c`, -1 when outside, 0 when on the circle.
 * The result is exact for any finite doubles.
 */
export function incircle(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number,
  dx: number,
  dy: number,
): number {
  const adx = ax - dx;
  const ady = ay - dy;
  const bdx = bx - dx;
  const bdy = by - dy;
  const cdx = cx - dx;
  const cdy = cy - dy;

  const bdxcdy = bdx * cdy;
  const cdxbdy = cdx * bdy;
  const alift = adx * adx + ady * ady;
  const cdxady = cdx * ady;
  const adxcdy = adx * cdy;
  const blift = bdx * bdx + bdy * bdy;
  const adxbdy = adx * bdy;
  const bdxady = bdx * ady;
  const clift = cdx * cdx + cdy * cdy;

  const det =
    alift * (bdxcdy - cdxbdy) +
    blift * (cdxady - adxcdy) +
    clift * (adxbdy - bdxady);
  const permanent =
    (Math.abs(bdxcdy) + Math.abs(cdxbdy)) * alift +
    (Math.abs(cdxady) + Math.abs(adxcdy)) * blift +
    (Math.abs(adxbdy) + Math.abs(bdxady)) * clift;
  const bound = INCIRCLE_BOUND * permanent;
  if (det > bound) return 1;
  if (-det > bound) return -1;
  _input[0] = ax;
  _input[1] = ay;
  _input[2] = bx;
  _input[3] = by;
  _input[4] = cx;
  _input[5] = cy;
  _input[6] = dx;
  _input[7] = dy;
  const scale = _integerScale(8);
  if (scale !== 0) {
    return _incircleInt(
      adx * scale,
      ady * scale,
      bdx * scale,
      bdy * scale,
      cdx * scale,
      cdy * scale,
    );
  }
  return incircleExact(ax, ay, bx, by, cx, cy, dx, dy);
}

// ---- exact integer arithmetic on differences below 2^32, in base-2^18 limbs
// held in doubles: a limb product is below 2^36 and no accumulated coefficient
// reaches 2^41, so every operation is exact.
const LIMB = 262144;
const INV_LIMB = 1 / LIMB;
const _acc = new Float64Array(8);
const _liftA = new Float64Array(4);
const _liftB = new Float64Array(4);
const _liftC = new Float64Array(4);
const _crossA = new Float64Array(4);
const _crossB = new Float64Array(4);
const _crossC = new Float64Array(4);

/** Add `sign * x * y` for non-negative integers x, y below 2^32 into `_acc[at..at+2]`. */
function _mulAdd22(x: number, y: number, sign: number, at: number): void {
  const x0 = x & 0x3ffff;
  const x1 = x >>> 18;
  const y0 = y & 0x3ffff;
  const y1 = y >>> 18;
  _acc[at] += sign * x0 * y0;
  _acc[at + 1] += sign * (x0 * y1 + x1 * y0);
  _acc[at + 2] += sign * x1 * y1;
}

/** Add `sign * a * m` for four-limb non-negative numbers into `_acc[0..6]`. */
function _mulAdd44(a: Float64Array, m: Float64Array, sign: number): void {
  for (let i = 0; i < 4; i++) {
    const ai = sign * a[i];
    if (ai === 0) continue;
    for (let j = 0; j < 4; j++) _acc[i + j] += ai * m[j];
  }
}

/** Carry-normalize `_acc[0..n)` to limbs in [0, LIMB); returns the signed final carry. */
function _carry(n: number): number {
  let carry = 0;
  for (let k = 0; k < n; k++) {
    const v = _acc[k] + carry;
    carry = Math.floor(v * INV_LIMB); // exact: a power-of-two scale
    _acc[k] = v - carry * LIMB;
  }
  return carry;
}

/** Sign of the normalized accumulator: the carry decides, else any nonzero limb. */
function _accSign(n: number, carry: number): number {
  if (carry !== 0) return carry > 0 ? 1 : -1;
  for (let k = 0; k < n; k++) if (_acc[k] !== 0) return 1;
  return 0;
}

/**
 * Write the magnitude of the normalized accumulator (n limbs plus carry) into
 * `out[0..n]` and return its sign. A negative value is complemented limb by limb.
 */
function _magnitude(n: number, carry: number, out: Float64Array): number {
  if (carry >= 0) {
    let zero = carry === 0;
    for (let k = 0; k < n; k++) {
      out[k] = _acc[k];
      if (_acc[k] !== 0) zero = false;
    }
    out[n] = carry;
    return zero ? 0 : 1;
  }
  let up = 1;
  for (let k = 0; k < n; k++) {
    let m = LIMB - 1 - _acc[k] + up;
    up = 0;
    if (m === LIMB) {
      m = 0;
      up = 1;
    }
    out[k] = m;
  }
  out[n] = -carry - 1 + up;
  return -1;
}

/** Sign of `a * b - c * d` for integers below 2^32 in magnitude. */
function _orientInt(a: number, b: number, c: number, d: number): number {
  _acc[0] = 0;
  _acc[1] = 0;
  _acc[2] = 0;
  _mulAdd22(Math.abs(a), Math.abs(b), a < 0 !== b < 0 ? -1 : 1, 0);
  _mulAdd22(Math.abs(c), Math.abs(d), c < 0 !== d < 0 ? 1 : -1, 0);
  return _accSign(3, _carry(3));
}

/** `dx² + dy²` as four limbs. */
function _lift(dx: number, dy: number, out: Float64Array): void {
  _acc[0] = 0;
  _acc[1] = 0;
  _acc[2] = 0;
  _mulAdd22(Math.abs(dx), Math.abs(dx), 1, 0);
  _mulAdd22(Math.abs(dy), Math.abs(dy), 1, 0);
  const carry = _carry(3);
  out[0] = _acc[0];
  out[1] = _acc[1];
  out[2] = _acc[2];
  out[3] = carry;
}

/** Sign of `p * q - r * t`, with its magnitude written as four limbs. */
function _cross(
  p: number,
  q: number,
  r: number,
  t: number,
  out: Float64Array,
): number {
  _acc[0] = 0;
  _acc[1] = 0;
  _acc[2] = 0;
  _mulAdd22(Math.abs(p), Math.abs(q), p < 0 !== q < 0 ? -1 : 1, 0);
  _mulAdd22(Math.abs(r), Math.abs(t), r < 0 !== t < 0 ? 1 : -1, 0);
  return _magnitude(3, _carry(3), out);
}

/** Exact in-circle sign from integer differences below 2^32 in magnitude. */
function _incircleInt(
  adx: number,
  ady: number,
  bdx: number,
  bdy: number,
  cdx: number,
  cdy: number,
): number {
  _lift(adx, ady, _liftA);
  _lift(bdx, bdy, _liftB);
  _lift(cdx, cdy, _liftC);
  const sa = _cross(bdx, cdy, cdx, bdy, _crossA);
  const sb = _cross(cdx, ady, adx, cdy, _crossB);
  const sc = _cross(adx, bdy, bdx, ady, _crossC);
  for (let k = 0; k < 7; k++) _acc[k] = 0;
  if (sa !== 0) _mulAdd44(_liftA, _crossA, sa);
  if (sb !== 0) _mulAdd44(_liftB, _crossB, sb);
  if (sc !== 0) _mulAdd44(_liftC, _crossC, sc);
  return _accSign(7, _carry(7));
}

// Exact evaluation: each double is sign * mantissa * 2^exponent with an
// integer mantissa, so scaling every input to the smallest exponent gives
// exact integers whose determinant has the same sign as the real one.
const _bits = new Float64Array(1);
const _words = new Uint32Array(_bits.buffer);
_bits[0] = 1;
const HI = _words[1] === 0x3ff00000 ? 1 : 0;
const LO = HI ^ 1;
const _mant = new Float64Array(8);
const _expo = new Int32Array(8);
const ZERO = BigInt(0);

function _scaled(values: Float64Array, count: number): bigint[] {
  let minExpo = 0x7fffffff;
  for (let i = 0; i < count; i++) {
    _bits[0] = values[i];
    const hi = _words[HI];
    const biased = (hi >>> 20) & 0x7ff;
    let m = (hi & 0xfffff) * 4294967296 + _words[LO];
    let e = -1074; // subnormal: the fraction is the mantissa
    if (biased !== 0) {
      m += 4503599627370496; // implicit leading bit
      e = biased - 1075;
    }
    _mant[i] = hi >>> 31 ? -m : m;
    _expo[i] = e;
    if (m !== 0 && e < minExpo) minExpo = e;
  }
  const out: bigint[] = [];
  for (let i = 0; i < count; i++) {
    out.push(
      _mant[i] === 0 ? ZERO : BigInt(_mant[i]) << BigInt(_expo[i] - minExpo),
    );
  }
  return out;
}

/** Exact orientation, evaluated in BigInt. Used when the fast filter cannot decide. */
export function orient2dExact(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number,
): number {
  _input[0] = ax;
  _input[1] = ay;
  _input[2] = bx;
  _input[3] = by;
  _input[4] = cx;
  _input[5] = cy;
  const s = _scaled(_input, 6);
  const det = (s[0] - s[4]) * (s[3] - s[5]) - (s[1] - s[5]) * (s[2] - s[4]);
  return det > ZERO ? 1 : det < ZERO ? -1 : 0;
}

/** Exact in-circle test, evaluated in BigInt. Used when the fast filter cannot decide. */
export function incircleExact(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number,
  dx: number,
  dy: number,
): number {
  _input[0] = ax;
  _input[1] = ay;
  _input[2] = bx;
  _input[3] = by;
  _input[4] = cx;
  _input[5] = cy;
  _input[6] = dx;
  _input[7] = dy;
  const s = _scaled(_input, 8);
  const adx = s[0] - s[6];
  const ady = s[1] - s[7];
  const bdx = s[2] - s[6];
  const bdy = s[3] - s[7];
  const cdx = s[4] - s[6];
  const cdy = s[5] - s[7];
  const det =
    (adx * adx + ady * ady) * (bdx * cdy - cdx * bdy) +
    (bdx * bdx + bdy * bdy) * (cdx * ady - adx * cdy) +
    (cdx * cdx + cdy * cdy) * (adx * bdy - bdx * ady);
  return det > ZERO ? 1 : det < ZERO ? -1 : 0;
}

// ----------------------------------------------------------- insertion order

/** Distance along a Hilbert curve of order `order` for grid cell (x, y). */
export function hilbertIndex(order: number, x: number, y: number): number {
  const n = 1 << order;
  let d = 0;
  for (let s = n >> 1; s > 0; s >>= 1) {
    const rx = (x & s) !== 0 ? 1 : 0;
    const ry = (y & s) !== 0 ? 1 : 0;
    d += s * s * ((3 * rx) ^ ry);
    if (ry === 0) {
      if (rx === 1) {
        x = n - 1 - x;
        y = n - 1 - y;
      }
      const t = x;
      x = y;
      y = t;
    }
  }
  return d;
}

/**
 * Point indices sorted along a Hilbert curve over the bounding box, ties (and
 * duplicate points) in index order. Non-finite points sort with the origin cell.
 */
export function hilbertOrder(
  coords: ArrayLike<number>,
  n: number,
): Uint32Array {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < n; i++) {
    const x = coords[2 * i];
    const y = coords[2 * i + 1];
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  // about sixteen cells per point is fine enough for locality; the order is
  // capped so keys stay within 32 bits
  let order = 2;
  while (order < 16 && 1 << (2 * order) < 16 * n) order++;
  const cells = (1 << order) - 1;
  const span = Math.max(maxX - minX, maxY - minY);
  const scale = span > 0 && Number.isFinite(span) ? cells / span : 0;

  const keys = new Uint32Array(n);
  for (let i = 0; i < n; i++) {
    const x = coords[2 * i];
    const y = coords[2 * i + 1];
    let gx = 0;
    let gy = 0;
    if (Number.isFinite(x) && Number.isFinite(y)) {
      gx = Math.min(cells, Math.max(0, Math.floor((x - minX) * scale)));
      gy = Math.min(cells, Math.max(0, Math.floor((y - minY) * scale)));
    }
    keys[i] = hilbertIndex(order, gx, gy);
  }

  // stable least-significant-digit radix sort, one byte per pass, over the
  // bytes the keys actually use
  let from = new Uint32Array(n);
  let to = new Uint32Array(n);
  for (let i = 0; i < n; i++) from[i] = i;
  const counts = new Int32Array(257);
  for (let shift = 0; shift < 2 * order; shift += 8) {
    counts.fill(0);
    for (let i = 0; i < n; i++) counts[((keys[i] >>> shift) & 255) + 1]++;
    for (let b = 0; b < 256; b++) counts[b + 1] += counts[b];
    for (let i = 0; i < n; i++) {
      const p = from[i];
      to[counts[(keys[p] >>> shift) & 255]++] = p;
    }
    const swap = from;
    from = to;
    to = swap;
  }
  return from;
}

// ------------------------------------------------------------- triangulation

/**
 * Delaunay-triangulate points given as a flat `[x0, y0, x1, y1, ...]` array.
 * Duplicate points and points with non-finite coordinates are left out; the
 * lowest index of a duplicate is the one used. Returns no triangles when
 * fewer than three distinct, non-collinear points exist.
 * @param coords flat coordinates
 * @param n number of points; defaults to half the array length
 */
export function triangulate(
  coords: Float64Array,
  n: number = coords.length >> 1,
): Triangulation {
  if (n < 3) return EMPTY;
  _presetScale = sharedScale(coords, n);
  try {
    return _triangulate(coords, n);
  } finally {
    _presetScale = 0;
  }
}

/**
 * The smallest power of two that makes every finite coordinate an integer
 * below 2^31 in magnitude, or 0 when there is none. Float32 values (every Pt)
 * always have one in a sane coordinate range.
 */
export function sharedScale(coords: ArrayLike<number>, n: number): number {
  let bits = 0;
  let max = 0;
  for (let i = 0; i < 2 * n; i++) {
    const v = coords[i];
    if (!Number.isFinite(v)) continue;
    if (v === 0) continue;
    if (Math.abs(v) > max) max = Math.abs(v);
    _bits[0] = v;
    const hi = _words[HI];
    const lo = _words[LO];
    const biased = (hi >>> 20) & 0x7ff;
    // v = m * 2^e with an integer m; trailing zero bits of m move into e
    const e = biased === 0 ? -1074 : biased - 1075;
    let trailing: number;
    if (lo !== 0) {
      trailing = 31 - Math.clz32(lo & -lo);
    } else {
      const m = (hi & 0xfffff) | (biased === 0 ? 0 : 0x100000);
      trailing = 32 + (31 - Math.clz32(m & -m));
    }
    const fractional = -(e + trailing);
    if (fractional > bits) bits = fractional;
    if (bits > 30) return 0;
  }
  const scale = Math.pow(2, bits);
  return max * scale < INT_LIMIT ? scale : 0;
}

function _triangulate(coords: Float64Array, n: number): Triangulation {
  const order = hilbertOrder(coords, n);

  // the first three non-collinear distinct points seed the triangulation
  let i0 = -1;
  let i1 = -1;
  let i2 = -1;
  let k = 0;
  for (; k < n; k++) {
    const i = order[k];
    if (Number.isFinite(coords[2 * i]) && Number.isFinite(coords[2 * i + 1])) {
      i0 = i;
      k++;
      break;
    }
  }
  if (i0 < 0) return EMPTY;
  for (; k < n; k++) {
    const i = order[k];
    const x = coords[2 * i];
    const y = coords[2 * i + 1];
    if (
      Number.isFinite(x) &&
      Number.isFinite(y) &&
      (x !== coords[2 * i0] || y !== coords[2 * i0 + 1])
    ) {
      i1 = i;
      k++;
      break;
    }
  }
  if (i1 < 0) return EMPTY;
  for (; k < n; k++) {
    const i = order[k];
    const x = coords[2 * i];
    const y = coords[2 * i + 1];
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    const o = orient2d(
      coords[2 * i0],
      coords[2 * i0 + 1],
      coords[2 * i1],
      coords[2 * i1 + 1],
      x,
      y,
    );
    if (o !== 0) {
      i2 = i;
      if (o < 0) {
        const swap = i1;
        i1 = i2;
        i2 = swap;
      }
      break;
    }
  }
  if (i2 < 0) return EMPTY; // every point is on one line

  // Triangles are stored as vertex triples with their twin half-edges. Ghost
  // triangles carry the infinite vertex INF in slot 2; their slot-0 → slot-1
  // edge is a hull edge traversed with the outside on the left.
  const INF = n;
  const capacity = 2 * n + 4;
  const tv = new Int32Array(capacity * 3);
  const adj = new Int32Array(capacity * 3);
  const live = new Uint8Array(capacity);
  const mark = new Int32Array(capacity);
  const freed = new Int32Array(capacity);
  let freedCount = 0;
  let triCount = 0;
  const stack = new Int32Array(capacity);
  const cavity = new Int32Array(capacity);
  const edgeFrom = new Int32Array(capacity * 3);
  const edgeTo = new Int32Array(capacity * 3);
  const edgeTwin = new Int32Array(capacity * 3);
  const toPoint = new Int32Array(n + 1);
  const fromPoint = new Int32Array(n + 1);
  let stamp = 0;

  const alloc = (a: number, b: number, c: number): number => {
    const t = freedCount > 0 ? freed[--freedCount] : triCount++;
    const h = 3 * t;
    tv[h] = a;
    tv[h + 1] = b;
    tv[h + 2] = c;
    live[t] = 1;
    return t;
  };
  const link = (h: number, g: number): void => {
    adj[h] = g;
    adj[g] = h;
  };

  // first triangle and its three ghosts
  const t0 = alloc(i0, i1, i2);
  const g0 = alloc(i1, i0, INF);
  const g1 = alloc(i2, i1, INF);
  const g2 = alloc(i0, i2, INF);
  link(3 * t0, 3 * g0);
  link(3 * t0 + 1, 3 * g1);
  link(3 * t0 + 2, 3 * g2);
  link(3 * g0 + 1, 3 * g2 + 2);
  link(3 * g1 + 1, 3 * g0 + 2);
  link(3 * g2 + 1, 3 * g1 + 2);

  // Whether p lies in the "circumdisk" of ghost g: strictly outside its hull
  // edge u → v, or on the open segment between u and v.
  const inGhostDisk = (g: number, px: number, py: number): boolean => {
    const u = tv[3 * g];
    const v = tv[3 * g + 1];
    const ux = coords[2 * u];
    const uy = coords[2 * u + 1];
    const vx = coords[2 * v];
    const vy = coords[2 * v + 1];
    const o = orient2d(ux, uy, vx, vy, px, py);
    if (o !== 0) return o > 0;
    // collinear: strictly between the endpoints along the wider axis
    return Math.abs(vx - ux) >= Math.abs(vy - uy)
      ? vx > ux
        ? px > ux && px < vx
        : px < ux && px > vx
      : vy > uy
        ? py > uy && py < vy
        : py < uy && py > vy;
  };

  // Whether p is inside the circumdisk of triangle t (for a ghost: its
  // outer half-plane plus the open hull edge). Vertices are never inside.
  const inDisk = (t: number, px: number, py: number): boolean => {
    const h = 3 * t;
    if (tv[h + 2] === INF) return inGhostDisk(t, px, py);
    const a = tv[h];
    const b = tv[h + 1];
    const c = tv[h + 2];
    return (
      incircle(
        coords[2 * a],
        coords[2 * a + 1],
        coords[2 * b],
        coords[2 * b + 1],
        coords[2 * c],
        coords[2 * c + 1],
        px,
        py,
      ) > 0
    );
  };

  // Walk from triangle t to a triangle whose circumdisk contains p. Returns
  // -1 when p coincides with an existing vertex. The walk always starts from a
  // finite triangle and enters a ghost only across a hull edge that p lies
  // strictly outside of; a ghost reached any other way (p collinear with its
  // edge, or inside the hull) hands the walk back to the finite side, which
  // then locates p or crosses the right hull edge.
  const locate = (t: number, px: number, py: number): number => {
    let steps = 0;
    const limit = 4 * triCount + 64;
    while (true) {
      const h = 3 * t;
      const a = tv[h];
      const b = tv[h + 1];
      const c = tv[h + 2];
      const ax = coords[2 * a];
      const ay = coords[2 * a + 1];
      const bx = coords[2 * b];
      const by = coords[2 * b + 1];
      if (c === INF) {
        if (orient2d(ax, ay, bx, by, px, py) > 0) return t;
        t = (adj[h] / 3) | 0;
      } else {
        const cx = coords[2 * c];
        const cy = coords[2 * c + 1];
        if (orient2d(ax, ay, bx, by, px, py) < 0) {
          t = (adj[h] / 3) | 0;
        } else if (orient2d(bx, by, cx, cy, px, py) < 0) {
          t = (adj[h + 1] / 3) | 0;
        } else if (orient2d(cx, cy, ax, ay, px, py) < 0) {
          t = (adj[h + 2] / 3) | 0;
        } else if (
          (px === ax && py === ay) ||
          (px === bx && py === by) ||
          (px === cx && py === cy)
        ) {
          return -1;
        } else {
          return t;
        }
      }
      // the visibility walk terminates on a Delaunay triangulation; never spin
      if (++steps > limit) throw new Error("Delaunay walk did not terminate");
    }
  };

  const insert = (p: number, start: number): number => {
    const px = coords[2 * p];
    const py = coords[2 * p + 1];
    const t = locate(start, px, py);
    if (t < 0) return start; // p is an existing vertex

    // the cavity: every triangle whose circumdisk contains p, by adjacency
    stamp++;
    let top = 0;
    let count = 0;
    stack[top++] = t;
    mark[t] = stamp;
    while (top > 0) {
      const s = stack[--top];
      cavity[count++] = s;
      const h = 3 * s;
      for (let e = 0; e < 3; e++) {
        const o = (adj[h + e] / 3) | 0;
        if (mark[o] !== stamp && inDisk(o, px, py)) {
          mark[o] = stamp;
          stack[top++] = o;
        }
      }
    }

    // its boundary: cavity half-edges whose twin lies outside the cavity,
    // recorded by vertex before the cavity's slots are recycled
    let edges = 0;
    for (let i = 0; i < count; i++) {
      const h = 3 * cavity[i];
      for (let e = 0; e < 3; e++) {
        const twin = adj[h + e];
        if (mark[(twin / 3) | 0] !== stamp) {
          edgeFrom[edges] = tv[h + e];
          edgeTo[edges] = tv[h + ((e + 1) % 3)];
          edgeTwin[edges] = twin;
          edges++;
        }
      }
    }
    for (let i = 0; i < count; i++) {
      live[cavity[i]] = 0;
      freed[freedCount++] = cavity[i];
    }

    // fan the cavity: one triangle (u, v, p) per boundary edge u → v, with
    // the infinite vertex kept in slot 2
    let first = -1;
    for (let i = 0; i < edges; i++) {
      const u = edgeFrom[i];
      const v = edgeTo[i];
      let t2: number;
      let hEdge: number;
      let hToP: number;
      let hFromP: number;
      if (u === INF) {
        t2 = alloc(v, p, INF);
        hEdge = 3 * t2 + 2;
        hToP = 3 * t2;
        hFromP = 3 * t2 + 1;
      } else if (v === INF) {
        t2 = alloc(p, u, INF);
        hEdge = 3 * t2 + 1;
        hToP = 3 * t2 + 2;
        hFromP = 3 * t2;
      } else {
        t2 = alloc(u, v, p);
        hEdge = 3 * t2;
        hToP = 3 * t2 + 1;
        hFromP = 3 * t2 + 2;
        if (first < 0) first = t2;
      }
      link(hEdge, edgeTwin[i]);
      toPoint[v] = hToP;
      fromPoint[u] = hFromP;
    }
    for (let i = 0; i < edges; i++) {
      const v = edgeTo[i];
      link(toPoint[v], fromPoint[v]);
    }
    return first < 0 ? start : first;
  };

  let last = t0;
  for (let j = 0; j < n; j++) {
    const i = order[j];
    if (i === i0 || i === i1 || i === i2) continue;
    if (!Number.isFinite(coords[2 * i]) || !Number.isFinite(coords[2 * i + 1]))
      continue;
    last = insert(i, last);
  }

  // compact the finite triangles and renumber their adjacency
  const index = new Int32Array(triCount);
  let m = 0;
  let ghost = -1;
  for (let t = 0; t < triCount; t++) {
    if (!live[t]) {
      index[t] = -1;
    } else if (tv[3 * t + 2] === INF) {
      index[t] = -1;
      ghost = t;
    } else {
      index[t] = m++;
    }
  }
  const triangles = new Uint32Array(m * 3);
  const neighbors = new Int32Array(m * 3);
  for (let t = 0; t < triCount; t++) {
    const k2 = index[t];
    if (k2 < 0) continue;
    for (let e = 0; e < 3; e++) {
      triangles[3 * k2 + e] = tv[3 * t + e];
      const o = adj[3 * t + e];
      const ot = index[(o / 3) | 0];
      neighbors[3 * k2 + e] = ot < 0 ? -1 : 3 * ot + (o % 3);
    }
  }
  // the hull, counterclockwise, by walking the ring of ghosts
  let hullCount = 0;
  let g = ghost;
  do {
    hullCount++;
    g = (adj[3 * g + 2] / 3) | 0;
  } while (g !== ghost);
  const hull = new Uint32Array(hullCount);
  g = ghost;
  for (let i = 0; i < hullCount; i++) {
    hull[i] = tv[3 * g + 1];
    g = (adj[3 * g + 2] / 3) | 0;
  }
  return { triangles, neighbors, hull };
}
