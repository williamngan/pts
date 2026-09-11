import { describe, expect, it } from "vitest";
import {
  hilbertIndex,
  hilbertOrder,
  incircle,
  incircleExact,
  orient2d,
  orient2dExact,
  sharedScale,
  triangulate,
  type Triangulation,
} from "../_triangulate";

function rng(seed: number) {
  let a = seed;
  return () => {
    a = (a * 16807) % 2147483647;
    return a / 2147483647;
  };
}

function coordsOf(points: number[][]): Float64Array {
  const out = new Float64Array(points.length * 2);
  for (let i = 0; i < points.length; i++) {
    out[2 * i] = points[i][0];
    out[2 * i + 1] = points[i][1];
  }
  return out;
}

function random(count: number, seed: number, scale = 500): number[][] {
  const r = rng(seed);
  const out: number[][] = [];
  for (let i = 0; i < count; i++) out.push([r() * scale, r() * scale]);
  return out;
}

/** Indices of the points that a triangulation must cover: finite and first of their duplicates. */
function distinct(points: number[][]): number[] {
  const seen = new Set<string>();
  const out: number[] = [];
  for (let i = 0; i < points.length; i++) {
    const [x, y] = points[i];
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    const key = `${x},${y}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(i);
  }
  return out;
}

/**
 * Check every structural and geometric property of a triangulation:
 * counterclockwise triangles over distinct points, consistent adjacency,
 * a convex counterclockwise hull that is exactly the set of unpaired edges,
 * Euler's relation, and the empty-circumcircle property against every point
 * (exact predicate). `full` compares every triangle with every point;
 * otherwise only the local condition across each shared edge is tested.
 */
function verify(points: number[][], tri: Triangulation, full = true): void {
  const c = coordsOf(points);
  const { triangles, neighbors, hull } = tri;
  const count = triangles.length / 3;
  expect(triangles.length % 3).toBe(0);
  expect(neighbors.length).toBe(triangles.length);
  const covered = new Set<number>();
  const edges = new Map<string, number>();

  for (let t = 0; t < count; t++) {
    const a = triangles[3 * t];
    const b = triangles[3 * t + 1];
    const d = triangles[3 * t + 2];
    expect(new Set([a, b, d]).size).toBe(3);
    expect(
      orient2d(
        c[2 * a],
        c[2 * a + 1],
        c[2 * b],
        c[2 * b + 1],
        c[2 * d],
        c[2 * d + 1],
      ),
    ).toBe(1);
    covered.add(a).add(b).add(d);
    for (let e = 0; e < 3; e++) {
      const h = 3 * t + e;
      const u = triangles[h];
      const v = triangles[3 * t + ((e + 1) % 3)];
      expect(edges.has(`${u}-${v}`)).toBe(false); // each directed edge once
      edges.set(`${u}-${v}`, h);
    }
  }
  for (let h = 0; h < neighbors.length; h++) {
    const t = (h / 3) | 0;
    const u = triangles[h];
    const v = triangles[3 * t + ((h + 1) % 3)];
    const twin = neighbors[h];
    const reverse = edges.get(`${v}-${u}`);
    if (twin === -1) {
      expect(reverse).toBeUndefined();
    } else {
      expect(reverse).toBe(twin);
      expect(neighbors[twin]).toBe(h);
      if (!full) {
        // local Delaunay condition across the edge
        const w = triangles[3 * t + ((h + 2) % 3)];
        const tt = (twin / 3) | 0;
        const x = triangles[3 * tt + ((twin + 2) % 3)];
        if (
          incircle(
            c[2 * u],
            c[2 * u + 1],
            c[2 * v],
            c[2 * v + 1],
            c[2 * w],
            c[2 * w + 1],
            c[2 * x],
            c[2 * x + 1],
          ) > 0
        ) {
          throw new Error(`edge ${u}-${v} is not locally Delaunay`);
        }
      }
    }
  }

  const expected = distinct(points);
  if (count === 0) {
    expect(hull.length).toBe(0);
    return;
  }
  expect([...covered].sort((p, q) => p - q)).toEqual(expected);
  // the hull is the cycle of unpaired edges, counterclockwise and convex
  const unpaired = new Set<string>();
  for (let h = 0; h < neighbors.length; h++) {
    if (neighbors[h] === -1) {
      const t = (h / 3) | 0;
      unpaired.add(`${triangles[h]}-${triangles[3 * t + ((h + 1) % 3)]}`);
    }
  }
  expect(hull.length).toBe(unpaired.size);
  for (let i = 0; i < hull.length; i++) {
    const u = hull[i];
    const v = hull[(i + 1) % hull.length];
    const w = hull[(i + 2) % hull.length];
    expect(unpaired.has(`${u}-${v}`)).toBe(true);
    expect(
      orient2d(
        c[2 * u],
        c[2 * u + 1],
        c[2 * v],
        c[2 * v + 1],
        c[2 * w],
        c[2 * w + 1],
      ),
    ).toBeGreaterThanOrEqual(0);
    let outside = 0;
    for (const p of expected) {
      if (
        orient2d(
          c[2 * u],
          c[2 * u + 1],
          c[2 * v],
          c[2 * v + 1],
          c[2 * p],
          c[2 * p + 1],
        ) < 0
      ) {
        outside++;
      }
    }
    expect(outside).toBe(0);
  }
  // Euler: triangles = 2 * points - 2 - hull vertices
  expect(count).toBe(2 * expected.length - 2 - hull.length);

  if (full) {
    let violations = 0;
    for (let t = 0; t < count; t++) {
      const a = triangles[3 * t];
      const b = triangles[3 * t + 1];
      const d = triangles[3 * t + 2];
      for (const p of expected) {
        if (p === a || p === b || p === d) continue;
        if (
          incircle(
            c[2 * a],
            c[2 * a + 1],
            c[2 * b],
            c[2 * b + 1],
            c[2 * d],
            c[2 * d + 1],
            c[2 * p],
            c[2 * p + 1],
          ) > 0
        ) {
          violations++;
        }
      }
    }
    expect(violations).toBe(0);
  }
}

function triangleSet(tri: Triangulation): Set<string> {
  const out = new Set<string>();
  for (let t = 0; t < tri.triangles.length; t += 3) {
    const key = [tri.triangles[t], tri.triangles[t + 1], tri.triangles[t + 2]]
      .sort((a, b) => a - b)
      .join("-");
    out.add(key);
  }
  return out;
}

describe("exact predicates", () => {
  it("orients integer and non-integer inputs with exact ties", () => {
    expect(orient2d(0, 0, 10, 0, 5, 1)).toBe(1);
    expect(orient2d(0, 0, 10, 0, 5, -1)).toBe(-1);
    expect(orient2d(0, 0, 10, 0, 20, 0)).toBe(0);
    expect(orient2d(0.5, 0.25, 1.5, 0.75, 2.5, 1.25)).toBe(0); // dyadic, exact
    expect(orient2d(0.1, 0.1, 0.2, 0.2, 0.3, 0.3)).toBe(
      orient2dExact(0.1, 0.1, 0.2, 0.2, 0.3, 0.3),
    );
  });

  it("decides near-collinear points at large magnitude exactly", () => {
    // products near 4e30 leave the floating determinant meaningless; the
    // real answers are 5e14, 0, and -5e14
    expect(orient2d(1e15, 1e15, 2e15, 2e15, 3e15, 3e15 + 0.5)).toBe(1);
    expect(orient2d(1e15, 1e15, 2e15, 2e15, 3e15, 3e15)).toBe(0);
    expect(orient2d(1e15, 1e15, 2e15, 2e15, 3e15, 3e15 - 0.5)).toBe(-1);
    // the same at the smallest representable scales
    const tiny = 2 ** -1060;
    expect(orient2d(0, 0, tiny, tiny, 2 * tiny, 2 * tiny)).toBe(0);
    expect(orient2d(0, 0, tiny, tiny, 2 * tiny, 3 * tiny)).toBe(1);
    expect(orient2d(0, 0, tiny, 0, 2 * tiny, -tiny)).toBe(-1);
  });

  it("tests circles exactly on cocircular and nearly cocircular input", () => {
    // unit square: the fourth corner is exactly on the circle
    expect(incircle(0, 0, 2, 0, 2, 2, 0, 2)).toBe(0);
    expect(incircle(0, 0, 2, 0, 2, 2, 1, 1)).toBe(1);
    expect(incircle(0, 0, 2, 0, 2, 2, 3, 3)).toBe(-1);
    // large integer square, resolved by limb arithmetic
    const k = 2 ** 24;
    expect(incircle(-k, -k, k, -k, k, k, -k, k)).toBe(0);
    expect(incircle(-k, -k, k, -k, k, k, -k, k - 1)).toBe(1);
    expect(incircle(-k, -k, k, -k, k, k, -k, k + 1)).toBe(-1);
    // non-integer square at a large offset, resolved in BigInt
    const o = 1e12;
    expect(incircle(o, o, o + 0.5, o, o + 0.5, o + 0.5, o, o + 0.5)).toBe(0);
    // one ulp at this magnitude is 2^-13
    expect(
      incircle(o, o, o + 0.5, o, o + 0.5, o + 0.5, o, o + 0.5 - 2 ** -13),
    ).toBe(1);
    expect(
      incircle(o, o, o + 0.5, o, o + 0.5, o + 0.5, o, o + 0.5 + 2 ** -13),
    ).toBe(-1);
  });

  it("agrees with BigInt evaluation on random and near-degenerate inputs", () => {
    const r = rng(2024);
    const scales = [1, 1e-9, 1e3, 1e9, 1e15];
    for (let i = 0; i < 4000; i++) {
      const s = scales[i % scales.length];
      const v = (): number => (r() - 0.5) * s;
      const ax = v();
      const ay = v();
      const bx = v();
      const by = v();
      // c near the line through a and b, d near the circle through a, b, c
      const t = r() * 2 - 0.5;
      const cx = ax + (bx - ax) * t + (r() - 0.5) * 1e-8 * s;
      const cy = ay + (by - ay) * t + (r() - 0.5) * 1e-8 * s;
      expect(orient2d(ax, ay, bx, by, cx, cy)).toBe(
        orient2dExact(ax, ay, bx, by, cx, cy),
      );
      const dx = v();
      const dy = v();
      const o = orient2d(ax, ay, bx, by, dx, dy);
      if (o === 0) continue;
      const [px, py, qx, qy] = o > 0 ? [bx, by, dx, dy] : [dx, dy, bx, by];
      const ex = v();
      const ey = v();
      expect(incircle(ax, ay, px, py, qx, qy, ex, ey)).toBe(
        incircleExact(ax, ay, px, py, qx, qy, ex, ey),
      );
    }
  });

  it("agrees with BigInt evaluation on integer coordinates up to 2^31", () => {
    const r = rng(77);
    const limit = 2 ** 31;
    for (let i = 0; i < 3000; i++) {
      const v = (): number =>
        i % 3 === 0
          ? Math.floor(r() * 41) - 20
          : Math.floor((r() * 2 - 1) * (limit - 1));
      const ax = v();
      const ay = v();
      const bx = v();
      const by = v();
      const cx = v();
      const cy = v();
      expect(orient2d(ax, ay, bx, by, cx, cy)).toBe(
        orient2dExact(ax, ay, bx, by, cx, cy),
      );
      const o = orient2d(ax, ay, bx, by, cx, cy);
      if (o === 0) continue;
      const [px, py, qx, qy] = o > 0 ? [bx, by, cx, cy] : [cx, cy, bx, by];
      // d: random, or a point of the circle's bounding square to force ties
      const dx = i % 2 === 0 ? v() : ax;
      const dy = i % 2 === 0 ? v() : qy;
      expect(incircle(ax, ay, px, py, qx, qy, dx, dy)).toBe(
        incircleExact(ax, ay, px, py, qx, qy, dx, dy),
      );
    }
    // exact ties at the top of the range
    const k = limit - 1;
    expect(orient2d(-k, -k, 0, 0, k, k)).toBe(0);
    expect(orient2d(-k, -k, 0, 0, k, k - 1)).toBe(-1);
    expect(incircle(-k, -k, k, -k, k, k, -k, k)).toBe(0);
    expect(incircle(-k, -k, k, -k, k, k, -k, k - 1)).toBe(1);
    expect(incircle(-k, -k, k, -k, k, k, -k + 1, k + 1)).toBe(-1);
  });

  it("agrees with BigInt evaluation on Float32 coordinates, as every Pt holds", () => {
    const r = rng(505);
    for (const scale of [1e-3, 1, 500, 4096, 1e6]) {
      for (let i = 0; i < 600; i++) {
        const v = (): number => Math.fround((r() - 0.5) * scale);
        const ax = v();
        const ay = v();
        const bx = v();
        const by = v();
        // c on or near the line, d on or near the circle, in Float32
        const t = Math.fround(r() * 2 - 0.5);
        const cx = Math.fround(ax + (bx - ax) * t);
        const cy = Math.fround(ay + (by - ay) * t);
        expect(orient2d(ax, ay, bx, by, cx, cy)).toBe(
          orient2dExact(ax, ay, bx, by, cx, cy),
        );
        const dx = v();
        const dy = v();
        const o = orient2d(ax, ay, bx, by, dx, dy);
        if (o === 0) continue;
        const [px, py, qx, qy] = o > 0 ? [bx, by, dx, dy] : [dx, dy, bx, by];
        const ex = i % 2 === 0 ? v() : Math.fround(ax + (qx - ax) + (px - ax));
        const ey = i % 2 === 0 ? v() : Math.fround(ay + (qy - ay) + (py - ay));
        expect(incircle(ax, ay, px, py, qx, qy, ex, ey)).toBe(
          incircleExact(ax, ay, px, py, qx, qy, ex, ey),
        );
      }
    }
  });

  it("finds the scale shared by a coordinate set", () => {
    const scaled = (points: number[][]) =>
      sharedScale(coordsOf(points), points.length);
    expect(
      scaled([
        [1, 2],
        [-3, 40000],
      ]),
    ).toBe(1);
    expect(
      scaled([
        [0.5, 2],
        [3, 0.25],
      ]),
    ).toBe(4);
    expect(
      scaled([
        [0, 0],
        [0, 0],
      ]),
    ).toBe(1);
    expect(
      scaled([
        [NaN, 0.125],
        [Infinity, 8],
      ]),
    ).toBe(8);
    expect(
      scaled([
        [Math.fround(9.9875), 799.5],
        [Math.fround(20.1), 3],
      ]),
    ).toBe(2 ** 20);
    // a small Float32 value carries 27 fractional bits: no scale fits 799.5
    expect(
      scaled([
        [Math.fround(9.9875), 799.5],
        [Math.fround(0.1), 3],
      ]),
    ).toBe(0);
    expect(scaled([[0.1, 0.2]])).toBe(0); // not dyadic within 2^30
    expect(scaled([[2 ** 31, 1]])).toBe(0); // too large
    expect(scaled([[2 ** 20 + 0.5, 1]])).toBe(2);
    expect(scaled([[2 ** 30 + 0.5, 1]])).toBe(0); // scaled value too large
    expect(scaled([[2 ** -1060, 1]])).toBe(0); // subnormal-range fraction
  });
});

describe("Hilbert ordering", () => {
  it("visits neighboring cells consecutively", () => {
    expect([
      hilbertIndex(1, 0, 0),
      hilbertIndex(1, 0, 1),
      hilbertIndex(1, 1, 1),
      hilbertIndex(1, 1, 0),
    ]).toEqual([0, 1, 2, 3]);
    const order = 4;
    const size = 1 << order;
    const cells: number[][] = [];
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) cells[hilbertIndex(order, x, y)] = [x, y];
    }
    expect(cells).toHaveLength(size * size);
    for (let d = 1; d < cells.length; d++) {
      const [x0, y0] = cells[d - 1];
      const [x1, y1] = cells[d];
      expect(Math.abs(x1 - x0) + Math.abs(y1 - y0)).toBe(1);
    }
  });

  it("sorts points along the curve with duplicates in index order", () => {
    const points = random(300, 5);
    points.push([...points[10]], [...points[10]], [NaN, 1], [1, Infinity]);
    const order = hilbertOrder(coordsOf(points), points.length);
    expect([...order].sort((a, b) => a - b)).toEqual(points.map((_, i) => i));
    const pos = new Map<number, number>();
    order.forEach((index, at) => pos.set(index, at));
    expect(pos.get(10)! < pos.get(300)! && pos.get(300)! < pos.get(301)!).toBe(
      true,
    );
    // consecutive points are close on average: far closer than random order
    let sorted = 0;
    let unsorted = 0;
    const finite = [...order].filter((index) => index < 300);
    for (let i = 1; i < 300; i++) {
      const a = points[finite[i - 1]];
      const b = points[finite[i]];
      sorted += Math.hypot(a[0] - b[0], a[1] - b[1]);
      unsorted += Math.hypot(
        points[i - 1][0] - points[i][0],
        points[i - 1][1] - points[i][1],
      );
    }
    expect(sorted).toBeLessThan(unsorted / 3);
  });
});

describe("triangulate", () => {
  it("matches a brute-force Delaunay triangulation on small sets", () => {
    // in general position every triple whose circumcircle is empty is a
    // Delaunay triangle, so the two triangle sets must agree exactly
    for (let seed = 1; seed <= 12; seed++) {
      const points = random(24, seed * 31, 100);
      const c = coordsOf(points);
      const brute = new Set<string>();
      for (let a = 0; a < points.length; a++) {
        for (let b = a + 1; b < points.length; b++) {
          for (let d = b + 1; d < points.length; d++) {
            const o = orient2d(
              c[2 * a],
              c[2 * a + 1],
              c[2 * b],
              c[2 * b + 1],
              c[2 * d],
              c[2 * d + 1],
            );
            if (o === 0) continue;
            const [p, q] = o > 0 ? [b, d] : [d, b];
            let empty = true;
            for (let e = 0; e < points.length && empty; e++) {
              if (e === a || e === b || e === d) continue;
              if (
                incircle(
                  c[2 * a],
                  c[2 * a + 1],
                  c[2 * p],
                  c[2 * p + 1],
                  c[2 * q],
                  c[2 * q + 1],
                  c[2 * e],
                  c[2 * e + 1],
                ) > 0
              ) {
                empty = false;
              }
            }
            if (empty) brute.add(`${a}-${b}-${d}`);
          }
        }
      }
      const tri = triangulate(c);
      verify(points, tri);
      expect(triangleSet(tri)).toEqual(brute);
    }
  });

  it("is independent of input order in general position", () => {
    const points = random(200, 99);
    const reference = triangleSet(triangulate(coordsOf(points)));
    const r = rng(7);
    for (let round = 0; round < 3; round++) {
      const perm = points.map((_, i) => i);
      for (let i = perm.length - 1; i > 0; i--) {
        const j = Math.floor(r() * (i + 1));
        [perm[i], perm[j]] = [perm[j], perm[i]];
      }
      const shuffled = perm.map((i) => points[i]);
      const back = new Array<number>(perm.length);
      perm.forEach((original, at) => (back[at] = original));
      const tri = triangulate(coordsOf(shuffled));
      verify(shuffled, tri);
      const mapped = new Set<string>();
      for (let t = 0; t < tri.triangles.length; t += 3) {
        mapped.add(
          [
            back[tri.triangles[t]],
            back[tri.triangles[t + 1]],
            back[tri.triangles[t + 2]],
          ]
            .sort((a, b) => a - b)
            .join("-"),
        );
      }
      expect(mapped).toEqual(reference);
    }
  });

  it("is deterministic", () => {
    const c = coordsOf(random(500, 4242));
    const a = triangulate(c);
    const b = triangulate(c);
    expect(Array.from(a.triangles)).toEqual(Array.from(b.triangles));
    expect(Array.from(a.neighbors)).toEqual(Array.from(b.neighbors));
    expect(Array.from(a.hull)).toEqual(Array.from(b.hull));
  });

  it("triangulates random sets at several scales", () => {
    for (const [seed, scale] of [
      [1, 1],
      [2, 1e-9],
      [3, 1e6],
      [4, 1e12],
    ]) {
      const points = random(400, seed, scale).map(([x, y]) => [
        x - scale / 2,
        y + scale,
      ]);
      verify(points, triangulate(coordsOf(points)));
    }
    verify(random(3000, 11), triangulate(coordsOf(random(3000, 11))), false);
  });

  it("handles cocircular grids, jittered grids, and integer coordinates", () => {
    const grid: number[][] = [];
    for (let x = 0; x < 20; x++) {
      for (let y = 0; y < 20; y++) grid.push([x * 7, y * 7]);
    }
    verify(grid, triangulate(coordsOf(grid)));

    // the same grid at the edge of the integer fast path
    const offset: number[][] = grid.map(([x, y]) => [
      x + 2 ** 24,
      y - 2 ** 24 + 12345,
    ]);
    verify(offset, triangulate(coordsOf(offset)));

    // nearly cocircular: every in-circle test needs the exact fallback
    const r = rng(31);
    const jittered: number[][] = [];
    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 10; y++) {
        jittered.push([x * 7 + (r() - 0.5) * 1e-9, y * 7 + (r() - 0.5) * 1e-9]);
      }
    }
    verify(jittered, triangulate(coordsOf(jittered)));

    // many exact duplicates and ties
    const ints: number[][] = [];
    for (let i = 0; i < 400; i++) {
      ints.push([Math.floor(r() * 50), Math.floor(r() * 50)]);
    }
    verify(ints, triangulate(coordsOf(ints)));

    const fine: number[][] = [];
    for (let x = 0; x < 50; x++) {
      for (let y = 0; y < 50; y++) fine.push([x * 0.125, y * 0.125]);
    }
    verify(fine, triangulate(coordsOf(fine)), false);

    // a grid of Float32 values, as `Create.gridPts` produces, with ties in
    // every cell resolved by the shared scale
    const float32: number[][] = [];
    for (let x = 0; x < 30; x++) {
      for (let y = 0; y < 30; y++) {
        float32.push([
          Math.fround(9.9875 + x * 19.975),
          Math.fround(7.4875 + y * 14.975),
        ]);
      }
    }
    expect(sharedScale(coordsOf(float32), float32.length)).toBeGreaterThan(1);
    verify(float32, triangulate(coordsOf(float32)));
  });

  it("handles points on a circle, on edges, and collinear runs", () => {
    const circle: number[][] = [];
    for (let i = 0; i < 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      circle.push([Math.cos(a) * 100, Math.sin(a) * 100]);
    }
    verify(circle, triangulate(coordsOf(circle)));
    circle.push([0, 0], [1, 1]);
    verify(circle, triangulate(coordsOf(circle)));

    // points on hull edges, interior edges, and beyond hull edges (collinear)
    const edgy = [
      [0, 0],
      [8, 0],
      [8, 8],
      [0, 8],
      [4, 4], // interior
      [4, 0], // on a hull edge
      [2, 2], // on an interior edge (the diagonal)
      [12, 0], // collinear beyond a hull edge
      [-4, 0], // collinear beyond the other end
      [6, 0], // on the extended hull run
      [8, 4], // on a hull edge
      [4, 8],
      [0, 4],
    ];
    verify(edgy, triangulate(coordsOf(edgy)));

    // a long collinear run with one point off the line, in several orders
    const run: number[][] = [];
    for (let i = 0; i < 50; i++) run.push([i * 3, i * 3]);
    run.push([10, 40]);
    verify(run, triangulate(coordsOf(run)));
    run.reverse();
    verify(run, triangulate(coordsOf(run)));
    run.push([80, 20], [-5, -5], [200, 200]);
    verify(run, triangulate(coordsOf(run)));
  });

  it("returns no triangles for degenerate input and skips bad points", () => {
    const empty = (points: number[][]) => {
      const tri = triangulate(coordsOf(points));
      expect(tri.triangles.length).toBe(0);
      expect(tri.hull.length).toBe(0);
    };
    empty([]);
    empty([[1, 1]]);
    empty([
      [1, 1],
      [2, 2],
    ]);
    empty([
      [1, 1],
      [1, 1],
      [1, 1],
    ]);
    empty([
      [0, 0],
      [1, 1],
      [2, 2],
      [3, 3],
      [1, 1],
    ]);
    empty([
      [0, 0],
      [NaN, 1],
      [Infinity, 2],
      [1, 0],
    ]);
    const some = [
      [0, 0],
      [NaN, 1],
      [10, 0],
      [Infinity, -Infinity],
      [10, 10],
      [0, 10],
      [10, 0],
      [5, 5],
    ];
    const tri = triangulate(coordsOf(some));
    verify(some, tri);
    expect(tri.triangles.length / 3).toBe(4);
    expect(Array.from(tri.triangles)).not.toContain(6); // the duplicate
    expect(Array.from(tri.hull).sort()).toEqual([0, 2, 4, 5]);
  });

  it("uses the requested point count", () => {
    const c = coordsOf([
      [0, 0],
      [10, 0],
      [0, 10],
      [10, 10],
    ]);
    expect(triangulate(c, 3).triangles.length).toBe(3);
    expect(triangulate(c).triangles.length).toBe(6);
  });
});
