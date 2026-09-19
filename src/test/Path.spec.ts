import { describe, expect, it, vi } from "vitest";
import { Path, Polygon, Rectangle } from "../Op";
import { Num } from "../Num";
import { Group, Pt } from "../Pt";
import { Util } from "../Util";
import { Overlay } from "../_path";

type Ring = number[][];

// ------------------------------------------------------------- helpers

const ring = (pts: Ring) => Group.fromArray(pts);
const box = (x0: number, y0: number, x1: number, y1: number): Ring => [
  [x0, y0],
  [x1, y0],
  [x1, y1],
  [x0, y1],
];
const disc = (cx: number, cy: number, r: number, n = 32): Ring => {
  const out: Ring = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return out;
};
/** A self-intersecting star: the center is inside by the nonzero rule. */
const pentagram = (cx: number, cy: number, r: number): Ring => {
  const p = disc(cx, cy, r, 5);
  return [p[0], p[2], p[4], p[1], p[3]];
};

function signedArea(pts: ArrayLike<ArrayLike<number>>): number {
  let a = 0;
  for (let i = 0, n = pts.length; i < n; i++) {
    const p = pts[i];
    const q = pts[i === n - 1 ? 0 : i + 1];
    a += p[0] * q[1] - q[0] * p[1];
  }
  return a / 2;
}

/** Nonzero winding number of a point with respect to one ring. */
function winding(pts: ArrayLike<ArrayLike<number>>, x: number, y: number) {
  let w = 0;
  for (let i = 0, n = pts.length; i < n; i++) {
    const p = pts[i];
    const q = pts[i === n - 1 ? 0 : i + 1];
    if (p[1] <= y) {
      if (
        q[1] > y &&
        (q[0] - p[0]) * (y - p[1]) - (x - p[0]) * (q[1] - p[1]) > 0
      )
        w++;
    } else if (
      q[1] <= y &&
      (q[0] - p[0]) * (y - p[1]) - (x - p[0]) * (q[1] - p[1]) < 0
    ) {
      w--;
    }
  }
  return w;
}

/** Inside a polygon given as rings combined by the nonzero rule. */
function inside(rings: ArrayLike<ArrayLike<number>>[], x: number, y: number) {
  let w = 0;
  for (const r of rings) w += winding(r, x, y);
  return w !== 0;
}

function distanceToEdges(
  rings: ArrayLike<ArrayLike<number>>[],
  x: number,
  y: number,
) {
  let best = Infinity;
  for (const r of rings) {
    for (let i = 0, n = r.length; i < n; i++) {
      const p = r[i];
      const q = r[i === n - 1 ? 0 : i + 1];
      const dx = q[0] - p[0];
      const dy = q[1] - p[1];
      const len2 = dx * dx + dy * dy;
      let t = len2 > 0 ? ((x - p[0]) * dx + (y - p[1]) * dy) / len2 : 0;
      t = Math.max(0, Math.min(1, t));
      const ex = p[0] + t * dx - x;
      const ey = p[1] + t * dy - y;
      best = Math.min(best, Math.sqrt(ex * ex + ey * ey));
    }
  }
  return best;
}

/** Total area of a polygon with holes: outer rings positive, holes negative. */
function polygonArea(rings: Group[]) {
  let a = 0;
  for (const r of rings) a += signedArea(r);
  return a;
}

function bounds(shapes: Ring[][]) {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const s of shapes) {
    for (const r of s) {
      for (const p of r) {
        x0 = Math.min(x0, p[0]);
        y0 = Math.min(y0, p[1]);
        x1 = Math.max(x1, p[0]);
        y1 = Math.max(y1, p[1]);
      }
    }
  }
  return { x0, y0, x1, y1 };
}

const modes = {
  unite: (ins: boolean[]) => ins.some(Boolean),
  intersect: (ins: boolean[]) => ins.every(Boolean),
  exclude: (ins: boolean[]) => ins.filter(Boolean).length % 2 === 1,
  minusFront: (ins: boolean[]) => ins[0] && !ins.slice(1).some(Boolean),
  minusBack: (ins: boolean[]) =>
    ins[ins.length - 1] && !ins.slice(0, -1).some(Boolean),
};

/**
 * Check every mode against the truth at sample points on a grid (plus a margin
 * away from every input and result edge, where a sample would not be decisive).
 * Divide and crop are checked by the union of their faces and by disjointness.
 */
function checkAgainstOracle(shapes: Ring[][], grid = 40) {
  const b = bounds(shapes);
  const size = Math.max(b.x1 - b.x0, b.y1 - b.y0);
  const margin =
    Math.max(Math.abs(b.x0), Math.abs(b.x1), Math.abs(b.y0), Math.abs(b.y1)) *
    8e-6;
  const results: Record<string, Group[]> = {};
  for (const m of Object.keys(modes) as (keyof typeof modes)[]) {
    results[m] = Path[m](shapes);
  }
  const divided = Path.divide(shapes);
  const cropped = Path.crop(shapes);
  // (no Object.values or Array.prototype.flat: the docs build compiles the
  // tests with an older lib target)
  const allResultRings: Group[] = [];
  for (const m of Object.keys(results)) allResultRings.push(...results[m]);
  for (const face of divided) allResultRings.push(...face);
  for (const face of cropped) allResultRings.push(...face);
  const inputRings: Ring[] = [];
  for (const s of shapes) inputRings.push(...s);

  let checked = 0;
  for (let i = 0; i <= grid; i++) {
    for (let j = 0; j <= grid; j++) {
      const x = b.x0 - size * 0.05 + ((size * 1.1) / grid) * i;
      const y = b.y0 - size * 0.05 + ((size * 1.1) / grid) * j;
      if (distanceToEdges(inputRings, x, y) < margin) continue;
      if (distanceToEdges(allResultRings, x, y) < margin) continue;
      checked++;
      const ins = shapes.map((s) => inside(s, x, y));
      for (const m of Object.keys(modes) as (keyof typeof modes)[]) {
        expect(inside(results[m], x, y), `${m} at ${x},${y}`).toBe(
          modes[m](ins),
        );
      }
      const inFaces = divided.filter((f) => inside(f, x, y)).length;
      expect(inFaces, `divide at ${x},${y}`).toBe(modes.unite(ins) ? 1 : 0);
      const inCrops = cropped.filter((f) => inside(f, x, y)).length;
      const last = ins[ins.length - 1];
      expect(inCrops, `crop at ${x},${y}`).toBe(
        last && ins.slice(0, -1).some(Boolean) ? 1 : 0,
      );
    }
  }
  expect(checked).toBeGreaterThan(grid * grid * 0.5);

  // structural checks on every returned ring
  for (const r of allResultRings) {
    expect(r).toBeInstanceOf(Group);
    expect(r.length).toBeGreaterThanOrEqual(3);
    for (let i = 0; i < r.length; i++) {
      expect(r[i]).toBeInstanceOf(Pt);
      expect(r[i]).toHaveLength(2);
      const q = r[i === r.length - 1 ? 0 : i + 1];
      expect(r[i][0] !== q[0] || r[i][1] !== q[1]).toBe(true);
    }
  }
  // holes follow their outer and have the opposite orientation
  for (const m of Object.keys(results)) {
    expect(
      signedArea(
        results[m][0] ?? [
          [0, 0],
          [1, 0],
          [0, 1],
        ],
      ),
    ).toBeGreaterThan(0);
  }
  for (const face of [...divided, ...cropped]) {
    expect(signedArea(face[0])).toBeGreaterThan(0);
    for (const hole of face.slice(1)) expect(signedArea(hole)).toBeLessThan(0);
  }
  return { results, divided, cropped };
}

// --------------------------------------------------------------- tests

describe("Path", () => {
  describe("areas of two overlapping squares", () => {
    const a = box(0, 0, 10, 10);
    const b = box(5, 5, 15, 15);

    it("unite, intersect, exclude, minusFront and minusBack have the expected areas", () => {
      expect(polygonArea(Path.unite([a, b]))).toBeCloseTo(175, 6);
      expect(polygonArea(Path.intersect([a, b]))).toBeCloseTo(25, 6);
      expect(polygonArea(Path.exclude([a, b]))).toBeCloseTo(150, 6);
      expect(polygonArea(Path.minusFront([a, b]))).toBeCloseTo(75, 6);
      expect(polygonArea(Path.minusBack([a, b]))).toBeCloseTo(75, 6);
    });

    it("returns one ring for a merge and the union's outline vertices", () => {
      const u = Path.unite([a, b]);
      expect(u).toHaveLength(1);
      expect(u[0]).toHaveLength(8);
      const i = Path.intersect([a, b]);
      expect(i).toHaveLength(1);
      expect(i[0]).toHaveLength(4);
      expect(polygonArea(i)).toBeCloseTo(25, 6);
    });

    it("divide gives three faces whose areas sum to the union", () => {
      const faces = Path.divide([a, b]);
      expect(faces).toHaveLength(3);
      const areas = faces.map(polygonArea).sort((p, q) => p - q);
      expect(areas[0]).toBeCloseTo(25, 6);
      expect(areas[1]).toBeCloseTo(75, 6);
      expect(areas[2]).toBeCloseTo(75, 6);
    });

    it("crop of two shapes is the intersection", () => {
      const faces = Path.crop([a, b]);
      expect(faces).toHaveLength(1);
      expect(polygonArea(faces[0])).toBeCloseTo(25, 6);
    });

    it("agrees with the oracle", () => {
      checkAgainstOracle([[a], [b]]);
    });
  });

  describe("holes", () => {
    const outer = box(0, 0, 20, 20);
    const inner = box(5, 5, 10, 10);

    it("minusFront with a contained shape returns an outer ring and a hole", () => {
      const r = Path.minusFront([outer, inner]);
      expect(r).toHaveLength(2);
      expect(signedArea(r[0])).toBeCloseTo(400, 6);
      expect(signedArea(r[1])).toBeCloseTo(-25, 6);
      expect(inside(r, 7, 7)).toBe(false);
      expect(inside(r, 2, 2)).toBe(true);
    });

    it("exclude of nested shapes is the same donut, and intersect is the inner", () => {
      expect(polygonArea(Path.exclude([outer, inner]))).toBeCloseTo(375, 6);
      expect(Path.exclude([outer, inner])).toHaveLength(2);
      const i = Path.intersect([outer, inner]);
      expect(i).toHaveLength(1);
      expect(polygonArea(i)).toBeCloseTo(25, 6);
      expect(Path.minusBack([outer, inner])).toHaveLength(0);
    });

    it("divide keeps the hole with the face it punctures", () => {
      const faces = Path.divide([outer, inner]);
      expect(faces).toHaveLength(2);
      const donut = faces.find((f) => f.length === 2)!;
      const dot = faces.find((f) => f.length === 1)!;
      expect(polygonArea(donut)).toBeCloseTo(375, 6);
      expect(polygonArea(dot)).toBeCloseTo(25, 6);
    });

    it("unite of two C shapes that close a ring has one hole", () => {
      // two brackets whose tips overlap, enclosing a square
      const left: Ring = [
        [0, 0],
        [12, 0],
        [12, 3],
        [3, 3],
        [3, 17],
        [12, 17],
        [12, 20],
        [0, 20],
      ];
      const right: Ring = [
        [20, 0],
        [8, 0],
        [8, 3],
        [17, 3],
        [17, 17],
        [8, 17],
        [8, 20],
        [20, 20],
      ];
      const u = Path.unite([left, right]);
      expect(u).toHaveLength(2);
      expect(signedArea(u[0])).toBeCloseTo(400, 6);
      expect(signedArea(u[1])).toBeCloseTo(-14 * 14, 6);
      checkAgainstOracle([[left], [right]]);
    });

    it("a result with a hole can be passed back as one shape", () => {
      const donut = Path.minusFront([outer, inner]);
      const cut = box(-5, 8, 25, 12);
      const r = Path.minusFront([donut, cut]);
      expect(polygonArea(r)).toBeCloseTo(400 - 80 - (25 - 5 * 2), 6);
      expect(r).toHaveLength(2);
      // and intersect of a donut with itself is the donut
      expect(polygonArea(Path.intersect([donut, donut]))).toBeCloseTo(375, 6);
    });

    it("nested holes and islands assign each hole to the smallest outer around it", () => {
      const island = box(6, 6, 9, 9);
      const r = Path.exclude([outer, inner, island]);
      // outer minus inner, plus the island back inside the hole
      expect(polygonArea(r)).toBeCloseTo(400 - 25 + 9, 6);
      expect(r).toHaveLength(3);
      expect(signedArea(r[0])).toBeCloseTo(400, 6);
      expect(signedArea(r[1])).toBeCloseTo(-25, 6);
      expect(signedArea(r[2])).toBeCloseTo(9, 6);
      checkAgainstOracle([[outer], [inner], [island]]);
    });
  });

  describe("degenerate configurations", () => {
    it("identical shapes", () => {
      const a = box(0, 0, 10, 10);
      expect(polygonArea(Path.unite([a, a]))).toBeCloseTo(100, 6);
      expect(Path.unite([a, a])[0]).toHaveLength(4);
      expect(Path.intersect([a, a])).toHaveLength(1);
      expect(Path.exclude([a, a])).toHaveLength(0);
      expect(Path.minusFront([a, a])).toHaveLength(0);
      expect(Path.minusBack([a, a])).toHaveLength(0);
      expect(Path.divide([a, a])).toHaveLength(1);
    });

    it("adjacent grid cells sharing an edge unite into one rectangle without seam vertices", () => {
      const a = box(0, 0, 10, 10);
      const b = box(10, 0, 20, 10);
      const u = Path.unite([a, b]);
      expect(u).toHaveLength(1);
      expect(u[0]).toHaveLength(4);
      expect(polygonArea(u)).toBeCloseTo(200, 6);
      expect(Path.intersect([a, b])).toHaveLength(0);
      expect(Path.divide([a, b])).toHaveLength(2);
      // a third cell below, closing an L: still one ring
      const c = box(0, 10, 10, 20);
      expect(Path.unite([a, b, c])).toHaveLength(1);
      expect(polygonArea(Path.unite([a, b, c]))).toBeCloseTo(300, 6);
    });

    it("a vertex touching an edge (T-junction) and partial edge overlaps", () => {
      const a = box(0, 0, 10, 10);
      // a triangle standing on the square's top edge: T-junctions at its base
      const tri: Ring = [
        [2, 10],
        [8, 10],
        [5, 15],
      ];
      const u = Path.unite([a, tri]);
      expect(polygonArea(u)).toBeCloseTo(115, 6);
      expect(u).toHaveLength(1);
      expect(u[0]).toHaveLength(7);
      expect(Path.intersect([a, tri])).toHaveLength(0);
      expect(Path.divide([a, tri])).toHaveLength(2);
      // a triangle touching the edge with its apex only: two rings meeting at a point
      const apex: Ring = [
        [5, 10],
        [15, 20],
        [-5, 20],
      ];
      expect(Path.unite([a, apex])).toHaveLength(2);
      expect(polygonArea(Path.unite([a, apex]))).toBeCloseTo(200, 6);

      // an edge partially overlapping another edge
      const b = box(4, 10, 14, 20);
      const u2 = Path.unite([a, b]);
      expect(polygonArea(u2)).toBeCloseTo(200, 6);
      expect(u2).toHaveLength(1);
      expect(u2[0]).toHaveLength(8);
      checkAgainstOracle([[a], [b]]);
      checkAgainstOracle([[a], [tri]]);
    });

    it("two squares touching at a corner unite into two rings", () => {
      const a = box(0, 0, 10, 10);
      const b = box(10, 10, 20, 20);
      const u = Path.unite([a, b]);
      expect(u).toHaveLength(2);
      expect(polygonArea(u)).toBeCloseTo(200, 6);
      expect(Path.intersect([a, b])).toHaveLength(0);
      expect(Path.divide([a, b])).toHaveLength(2);
    });

    it("a shape wholly inside another that touches its boundary", () => {
      const a = box(0, 0, 20, 20);
      const b = box(0, 5, 5, 10); // shares part of the left edge
      const r = Path.minusFront([a, b]);
      expect(r).toHaveLength(1);
      expect(polygonArea(r)).toBeCloseTo(375, 6);
      const c = box(0, 0, 5, 5); // shares a corner and two edges
      expect(polygonArea(Path.minusFront([a, c]))).toBeCloseTo(375, 6);
      expect(Path.minusFront([a, c])).toHaveLength(1);
    });

    it("repeated points, spikes, collinear runs and too few points contribute nothing", () => {
      const a = box(0, 0, 10, 10);
      const withRepeats: Ring = [
        [0, 0],
        [0, 0],
        [10, 0],
        [10, 10],
        [10, 10],
        [0, 10],
        [0, 0],
      ];
      expect(polygonArea(Path.unite([withRepeats]))).toBeCloseTo(100, 6);
      expect(Path.unite([withRepeats])[0]).toHaveLength(4);

      const spike: Ring = [
        [0, 0],
        [10, 0],
        [10, 10],
        [15, 15],
        [10, 10],
        [0, 10],
      ];
      const s = Path.unite([spike]);
      expect(polygonArea(s)).toBeCloseTo(100, 6);
      expect(s[0]).toHaveLength(4);

      const collinear: Ring = [
        [0, 0],
        [10, 0],
        [5, 0],
      ];
      expect(Path.unite([collinear])).toHaveLength(0);
      expect(Path.unite([a, collinear])).toHaveLength(1);
      expect(Path.intersect([a, collinear])).toHaveLength(0);

      expect(
        Path.unite([
          [
            [0, 0],
            [1, 1],
          ],
        ]),
      ).toHaveLength(0);
      expect(Path.unite([[]])).toHaveLength(0);
      expect(Path.unite([])).toHaveLength(0);
      expect(Path.divide([])).toHaveLength(0);
      expect(Path.unite([a, []])).toHaveLength(1);
      expect(Path.intersect([a, []])).toHaveLength(0);
    });

    it("clockwise rings are the same shape as counterclockwise ones", () => {
      const a = box(0, 0, 10, 10);
      const cw = [...box(5, 5, 15, 15)].reverse();
      expect(polygonArea(Path.unite([a, cw]))).toBeCloseTo(175, 6);
      expect(polygonArea(Path.intersect([a, cw]))).toBeCloseTo(25, 6);
      expect(polygonArea(Path.minusFront([a, cw]))).toBeCloseTo(75, 6);
      const u = Path.unite([cw]);
      expect(signedArea(u[0])).toBeGreaterThan(0);
    });

    it("self-intersecting rings follow the nonzero rule", () => {
      const bowtie: Ring = [
        [0, 0],
        [10, 10],
        [10, 0],
        [0, 10],
      ];
      const u = Path.unite([bowtie]);
      expect(u).toHaveLength(2);
      expect(polygonArea(u)).toBeCloseTo(50, 6);
      expect(Path.divide([bowtie])).toHaveLength(2);

      const star = pentagram(0, 0, 10);
      const outline = Path.unite([star]);
      expect(outline).toHaveLength(1);
      expect(outline[0]).toHaveLength(10);
      expect(inside(outline, 0, 0)).toBe(true);
      const faces = Path.divide([star]);
      expect(faces).toHaveLength(6);
      const total = faces.reduce((s, f) => s + polygonArea(f), 0);
      expect(total).toBeCloseTo(polygonArea(outline), 6);
      checkAgainstOracle([[star], [disc(4, 0, 6, 24)]]);
    });

    it("a ring with a non-finite coordinate warns and is skipped", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      Util.warnLevel("warn");
      const a = box(0, 0, 10, 10);
      const bad: Ring = [
        [0, 0],
        [NaN, 5],
        [5, 5],
      ];
      const u = Path.unite([a, bad]);
      expect(polygonArea(u)).toBeCloseTo(100, 6);
      expect(warn).toHaveBeenCalledTimes(1);
      Util.warnLevel("mute");
    });

    it("single shape in every mode", () => {
      const a = box(0, 0, 10, 10);
      expect(Path.unite([a])).toHaveLength(1);
      expect(Path.intersect([a])).toHaveLength(1);
      expect(Path.exclude([a])).toHaveLength(1);
      expect(Path.minusFront([a])).toHaveLength(1);
      expect(Path.minusBack([a])).toHaveLength(1);
      expect(Path.divide([a])).toHaveLength(1);
      expect(Path.crop([a])).toHaveLength(0);
    });

    it("disjoint shapes", () => {
      const a = box(0, 0, 10, 10);
      const b = box(20, 20, 30, 30);
      expect(Path.unite([a, b])).toHaveLength(2);
      expect(Path.intersect([a, b])).toHaveLength(0);
      expect(Path.exclude([a, b])).toHaveLength(2);
      expect(Path.minusFront([a, b])).toHaveLength(1);
      expect(Path.minusBack([a, b])).toHaveLength(1);
      expect(Path.divide([a, b])).toHaveLength(2);
      expect(Path.crop([a, b])).toHaveLength(0);
    });

    it("rotated and jittered shapes alone are their own union (ray casts through their leftmost vertex)", () => {
      // a rotated box whose leftmost vertex's upward edge crosses the west ray
      // formula a rounding error short of the vertex itself
      const rotated: Ring = [
        [9, 8],
        [35.117257012360895, 62.01748685518687],
        [8.108513584767461, 75.07611536136731],
        [-18.008743427593433, 21.058628506180447],
      ];
      const u = Path.unite([rotated]);
      expect(u).toHaveLength(1);
      expect(polygonArea(u)).toBeCloseTo(1800, 3); // float32 output Pts
      Num.seed("path-rotations");
      for (let i = 0; i < 40; i++) {
        const ang = Num.random() * Math.PI;
        const cx = Num.random() * 50 - 25;
        const cy = Num.random() * 50 - 25;
        const shape = box(0, 0, 60, 30).map(([x, y]) => [
          cx + x * Math.cos(ang) - y * Math.sin(ang),
          cy + x * Math.sin(ang) + y * Math.cos(ang),
        ]);
        const alone = Path.unite([shape]);
        expect(alone, `rotation ${i}`).toHaveLength(1);
        expect(polygonArea(alone)).toBeCloseTo(1800, 3);
        // radial jitter keeps the blob simple, so its shoelace area is its covered area
        const blob = disc(cx, cy, 20, 7 + i).map(([x, y]) => {
          const r = 0.6 + Num.random() * 0.6;
          return [cx + (x - cx) * r, cy + (y - cy) * r];
        });
        expect(polygonArea(Path.unite([blob]))).toBeCloseTo(
          Math.abs(signedArea(blob)),
          3,
        );
      }
    });

    it("crossing at a shared vertex of both shapes", () => {
      // two diamonds sharing their top vertex, overlapping below it
      const a: Ring = [
        [0, 10],
        [-5, 0],
        [0, -10],
        [5, 0],
      ];
      const b: Ring = [
        [0, 10],
        [-3, 0],
        [0, -12],
        [7, 0],
      ];
      checkAgainstOracle([[a], [b]]);
      expect(Path.unite([a, b])).toHaveLength(1);
    });
  });

  describe("three or more shapes", () => {
    const a = disc(0, 0, 10, 24);
    const b = disc(8, 0, 10, 24);
    const c = disc(4, 7, 10, 24);

    it("intersect is the common lens, exclude is odd-covered, minus subtracts all others", () => {
      const { results } = checkAgainstOracle([[a], [b], [c]]);
      expect(results.intersect).toHaveLength(1);
      expect(polygonArea(results.intersect)).toBeGreaterThan(0);
      expect(polygonArea(results.intersect)).toBeLessThan(
        polygonArea(Path.intersect([a, b])),
      );
      const ua = polygonArea(Path.unite([a]));
      expect(polygonArea(results.minusFront)).toBeLessThan(
        polygonArea(Path.minusFront([a, b])),
      );
      expect(polygonArea(results.minusFront)).toBeGreaterThan(0);
      expect(polygonArea(results.minusBack)).toBeLessThan(ua);
      expect(polygonArea(results.unite)).toBeGreaterThan(ua);
    });

    it("divide of three discs has seven faces and crop keeps the divided faces under the mask", () => {
      const faces = Path.divide([a, b, c]);
      expect(faces).toHaveLength(7);
      const total = faces.reduce((s, f) => s + polygonArea(f), 0);
      expect(total).toBeCloseTo(polygonArea(Path.unite([a, b, c])), 4);

      const crops = Path.crop([a, b, c]);
      // under c: a only, b only, and a with b
      expect(crops).toHaveLength(3);
      const covered = crops.reduce((s, f) => s + polygonArea(f), 0);
      expect(covered).toBeCloseTo(
        polygonArea(Path.intersect([Path.unite([a, b]), c])),
        4,
      );
    });

    it("four squares in a ring leave a hole in the union", () => {
      const cells = [
        box(0, 0, 10, 10),
        box(10, 0, 20, 10),
        box(10, 10, 20, 20),
        box(0, 10, 10, 20),
      ].map((r) => r.map(([x, y]) => [x - 10, y - 10]));
      // a hole in the middle: cut a smaller square out of each cell first
      const ringed = cells.map((cell) =>
        Path.minusFront([cell, box(-5, -5, 5, 5)]),
      );
      const u = Path.unite(ringed);
      expect(u).toHaveLength(2);
      expect(polygonArea(u)).toBeCloseTo(400 - 100, 6);
      expect(signedArea(u[1])).toBeCloseTo(-100, 6);
    });
  });

  describe("review regressions", () => {
    it("computes shallow crossings consistently across retraced edges", () => {
      const shapes: Ring[] = [
        [
          [30.00001, -0.00001],
          [20.00002, 9.99999],
          [30, 0],
          [30, 10],
        ],
        [
          [20.00001, 10.00002],
          [29.99998, 0],
          [0, 0],
        ],
      ];
      expect(inside(Path.unite(shapes), 25, 3)).toBe(true);
      checkAgainstOracle(
        shapes.map((r) => [r]),
        20,
      );
    });
    it("preserves the closing corner across ring starts and input order", () => {
      const a: Ring = [
        [10, 20],
        [20, 20.000014],
        [30, 10],
        [0, 20],
      ];
      const b: Ring = [
        [30, 0],
        [20.00002, 19.99999],
        [10, 20],
      ];
      for (let start = 0; start < a.length; start++) {
        const rotated = [...a.slice(start), ...a.slice(0, start)];
        for (const shapes of [
          [rotated, b],
          [b, rotated],
          [rotated.slice().reverse(), b.slice().reverse()],
        ]) {
          const result = Path.unite(shapes);
          expect(inside(result, 20, 17)).toBe(true);
          expect(polygonArea(result)).toBeCloseTo(145, 2);
          checkAgainstOracle(
            shapes.map((r) => [r]),
            16,
          );
        }
      }
    });

    it("does not bend edges through nearby endpoints when subtracting", () => {
      const shapes: Ring[] = [
        [
          [20, 0],
          [0, 10],
          [10, -0.00002],
        ],
        [
          [0, 0.00002],
          [20, 20],
          [20, 0],
        ],
        [
          [0, -0.00002],
          [10.00002, 0.00002],
          [0, 30],
        ],
      ];
      expect(inside(Path.minusFront(shapes), 8, 3)).toBe(false);
      expect(inside(Path.minusFront(shapes.map(ring)), 8, 3)).toBe(false);
      checkAgainstOracle(
        shapes.map((r) => [r]),
        24,
      );
    });

    it("resolves long chains of separate holes without recursion", () => {
      const count = 12000;
      const rings = [box(-1, -1, 3 * count + 1, 2)];
      for (let i = count - 1; i >= 0; i--)
        rings.push(box(3 * i, 0, 3 * i + 1, 1).reverse());
      const result = Path.unite([rings]);
      expect(result).toHaveLength(count + 1);
      expect(polygonArea(result)).toBe(3 * (3 * count + 2) - count);
    }, 15000);

    it("handles many independent shapes and preserves their stacking positions", () => {
      const shapes = Array.from({ length: 2000 }, (_, i) =>
        box(
          3 * (i % 50),
          3 * Math.floor(i / 50),
          3 * (i % 50) + 1,
          3 * Math.floor(i / 50) + 1,
        ),
      );
      expect(polygonArea(Path.unite(shapes))).toBe(2000);
      expect(Path.intersect(shapes)).toHaveLength(0);
      expect(polygonArea(Path.minusFront(shapes))).toBe(1);
      expect(polygonArea(Path.minusBack(shapes))).toBe(1);
      expect(Path.crop(shapes)).toHaveLength(0);
      const ov = new Overlay();
      ov.read(shapes);
      ov.split();
      ov.merge();
      ov.trace();
      ov.label();
      expect(ov.deltas.reduce((n, d) => n + d.size, 0)).toBe(8000);
      expect(ov.labels.reduce((n, d) => n + d.size, 0)).toBe(2000);
    });

    it("preserves winding consistency and planar edges in seeded near-coincident arrangements", () => {
      let seed = 18311;
      const random = () => {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        return seed / 4294967296;
      };
      for (let trial = 0; trial < 100; trial++) {
        const shapes: Ring[] = Array.from(
          { length: 2 + Math.floor(random() * 3) },
          () =>
            Array.from({ length: 3 + Math.floor(random() * 5) }, () => [
              Math.floor(random() * 4) * 10 + (random() - 0.5) * 0.00005,
              Math.floor(random() * 4) * 10 + (random() - 0.5) * 0.00005,
            ]),
        );
        const ov = new Overlay();
        ov.read(shapes);
        ov.split();
        ov.merge();
        ov.trace();
        ov.label();
        for (let e = 0; e < ov.gu.length; e++) {
          const left = ov.labels[ov.cycle[2 * e]];
          const right = ov.labels[ov.cycle[2 * e + 1]];
          for (let s = 0; s < shapes.length; s++)
            expect(
              (left.get(s) ?? 0) - (right.get(s) ?? 0),
              `trial ${trial}, edge ${e}`,
            ).toBe(ov.deltas[e].get(s) ?? 0);
          const side = (a: number, b: number, c: number) => {
            const cross =
              (ov.vx[b] - ov.vx[a]) * (ov.vy[c] - ov.vy[a]) -
              (ov.vy[b] - ov.vy[a]) * (ov.vx[c] - ov.vx[a]);
            return Math.abs(cross) < 1e-10 ? 0 : Math.sign(cross);
          };
          for (let f = e + 1; f < ov.gu.length; f++) {
            const a = ov.gu[e],
              b = ov.gv[e],
              c = ov.gu[f],
              d = ov.gv[f];
            expect(
              side(a, b, c) * side(a, b, d) < 0 &&
                side(c, d, a) * side(c, d, b) < 0,
              `unsplit crossing in trial ${trial}`,
            ).toBe(false);
          }
        }
        checkAgainstOracle(
          shapes.map((r) => [r]),
          10,
        );
      }
    });
  });

  describe("hairlines and near-touches", () => {
    it("treats a vertex touching an edge to float32 precision like an exact touch", () => {
      // a triangle whose base points are interpolated along a rotated square's
      // edge in float32: they miss the exact edge by rounding
      const sq = Polygon.rectangle([300, 300], 200, 200).rotate2D(
        0.4,
        [300, 300],
      );
      const e0 = sq[0];
      const e1 = sq[1];
      const lerp = (t: number) =>
        new Pt(e0[0] + (e1[0] - e0[0]) * t, e0[1] + (e1[1] - e0[1]) * t);
      const normal = new Pt(e1[1] - e0[1], -(e1[0] - e0[0])).$multiply(0.3);
      const tri = new Group(lerp(0.3), lerp(0.7), lerp(0.5).$add(normal));
      expect(Path.unite([sq, tri])).toHaveLength(1);
      expect(Path.divide([sq, tri])).toHaveLength(2);
      expect(Path.intersect([sq, tri])).toHaveLength(0);
      expect(Path.crop([sq, tri])).toHaveLength(0);
      // the triangle's own area is intact
      expect(polygonArea(Path.minusBack([sq, tri]))).toBeCloseTo(
        Math.abs(signedArea(tri)),
        1,
      );
    });

    it("keeps parallel edges a rounding error apart consistent (shifted copies of a pentagram)", () => {
      // cos(72°) and cos(288°) differ in the last bit, so the star's "vertical"
      // edge is tilted by 1e-14; the shifted copy's edge runs parallel to it,
      // closer than the crossing precision, with no vertex in common.
      const star = pentagram(40.08, 40, 44.44);
      const shifted = star.map(([x, y]) => [x, y + 5]);
      const a = polygonArea(Path.unite([star]));
      const both = Path.unite([star, shifted]);
      const common = Path.intersect([star, shifted]);
      expect(both).toHaveLength(1);
      expect(polygonArea(both) + polygonArea(common)).toBeCloseTo(2 * a, 2);
      expect(polygonArea(Path.exclude([star, shifted]))).toBeCloseTo(
        polygonArea(both) - polygonArea(common),
        2,
      );
      checkAgainstOracle([[star], [shifted]], 30);
      // and the same shape twice, and shifted along the tilted edge
      expect(polygonArea(Path.unite([star, star]))).toBeCloseTo(a, 2);
      checkAgainstOracle([[star], [star.map(([x, y]) => [x, y + 20])]], 30);
    });

    it("drops an overlap thinner than the tolerance but keeps a thin one", () => {
      const a = box(0, 0, 100, 100);
      const sliver = box(100 - 1e-5, 0, 200, 100);
      expect(Path.intersect([a, sliver])).toHaveLength(0);
      const u = Path.unite([a, sliver]);
      expect(u).toHaveLength(1);
      expect(u[0]).toHaveLength(4);
      expect(Path.divide([a, sliver])).toHaveLength(2);
      // one pixel wide over a thousand is thin, not a hairline
      const strip = box(999, 0, 1100, 1000);
      const thin = Path.intersect([box(0, 0, 1000, 1000), strip]);
      expect(thin).toHaveLength(1);
      expect(polygonArea(thin)).toBeCloseTo(1000, 6);
    });

    it("answers hole queries the same before and after the ray index is built", () => {
      // nine holes cross the threshold within one call; two stay below it
      for (const count of [2, 9, 40]) {
        const rings = [box(0, 0, 3 * count + 10, 10)];
        for (let i = 0; i < count; i++) {
          rings.push([...box(3 * i + 2, 4, 3 * i + 3, 6)].reverse());
        }
        const u = Path.unite([rings]);
        expect(u).toHaveLength(count + 1);
        expect(polygonArea(u)).toBeCloseTo(
          10 * (3 * count + 10) - 2 * count,
          6,
        );
        for (let i = 1; i <= count; i++) {
          expect(signedArea(u[i])).toBeCloseTo(-2, 6);
        }
        // and as separate shapes, where every seed ray is a query too
        const separate = Path.exclude(rings.map((r) => [r]));
        expect(separate).toHaveLength(count + 1);
        expect(polygonArea(separate)).toBeCloseTo(
          10 * (3 * count + 10) - 2 * count,
          6,
        );
      }
    });
  });

  describe("random shapes against the oracle", () => {
    const jittered = (cx: number, cy: number, r: number, n: number) => {
      const out: Ring = [];
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const rr = r * (0.6 + Num.random() * 0.6);
        out.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
      }
      return out;
    };
    const rotatedBox = (
      cx: number,
      cy: number,
      w: number,
      h: number,
      ang: number,
    ) =>
      box(-w / 2, -h / 2, w / 2, h / 2).map(([x, y]) => [
        cx + x * Math.cos(ang) - y * Math.sin(ang),
        cy + x * Math.sin(ang) + y * Math.cos(ang),
      ]);

    for (let trial = 0; trial < 6; trial++) {
      it(`trial ${trial}`, () => {
        Num.seed(`path-${trial}`);
        const count = 2 + (trial % 3);
        const shapes: Ring[][] = [];
        for (let s = 0; s < count; s++) {
          const cx = Num.random() * 60;
          const cy = Num.random() * 60;
          const kind = (trial + s) % 3;
          const shape =
            kind === 0
              ? jittered(cx, cy, 30, 7 + s * 3)
              : kind === 1
                ? rotatedBox(cx, cy, 40, 25, Num.random() * Math.PI)
                : pentagram(cx, cy, 30);
          shapes.push([shape]);
        }
        checkAgainstOracle(shapes, 30);
      });
    }
  });

  describe("input forms and immutability", () => {
    it("accepts Groups, arrays, generators, and compound inputs", () => {
      const a = Rectangle.corners(Rectangle.fromTopLeft([0, 0], [10, 10]));
      const b = box(5, 5, 15, 15);
      function* gen() {
        yield new Pt(5, 5);
        yield new Pt(15, 5);
        yield new Pt(15, 15);
        yield new Pt(5, 15);
      }
      const fromGroup = polygonArea(Path.unite([a, b]));
      const fromGen = polygonArea(Path.unite([a, gen()]));
      const fromSet = polygonArea(Path.unite([a, new Set(ring(b))]));
      expect(fromGroup).toBeCloseTo(175, 6);
      expect(fromGen).toBeCloseTo(175, 6);
      expect(fromSet).toBeCloseTo(175, 6);
      // a list of rings for one shape, as plain arrays
      const compound = [box(0, 0, 20, 20), [...box(5, 5, 10, 10)].reverse()];
      expect(polygonArea(Path.unite([compound]))).toBeCloseTo(375, 6);
      // shapes as a generator
      function* shapes() {
        yield a;
        yield b;
      }
      expect(polygonArea(Path.unite(shapes()))).toBeCloseTo(175, 6);
    });

    it("leaves a caller's list of iterable rings untouched", () => {
      const rings = [
        new Set(ring(box(0, 0, 20, 20))),
        [...box(5, 5, 10, 10)].reverse(),
      ];
      expect(polygonArea(Path.unite([rings]))).toBeCloseTo(375, 6);
      expect(rings[0]).toBeInstanceOf(Set);
    });

    it("does not modify the input and returns fresh Pts", () => {
      const a = ring(box(0, 0, 10, 10));
      const b = ring(box(5, 5, 15, 15));
      const before = [a.clone(), b.clone()];
      const u = Path.unite([a, b]);
      expect(Array.from(a, (p) => Array.from(p))).toEqual(
        Array.from(before[0], (p) => Array.from(p)),
      );
      expect(Array.from(b, (p) => Array.from(p))).toEqual(
        Array.from(before[1], (p) => Array.from(p)),
      );
      for (const p of u[0]) {
        expect(a.includes(p)).toBe(false);
        expect(b.includes(p)).toBe(false);
      }
      // the same input twice does not alias its output either
      const i = Path.intersect([a, a]);
      expect(i[0].some((p) => a.includes(p))).toBe(false);
    });

    it("ignores z", () => {
      const a = Group.fromArray([
        [0, 0, 5],
        [10, 0, 6],
        [10, 10, 7],
        [0, 10, 8],
      ]);
      const u = Path.unite([a, box(5, 5, 15, 15)]);
      expect(polygonArea(u)).toBeCloseTo(175, 6);
      expect(u[0][0]).toHaveLength(2);
    });
  });

  describe("scale independence", () => {
    const config = (scale: number, dx = 0, dy = 0) =>
      [[disc(0, 0, 10, 20)], [disc(7, 3, 10, 20)], [box(-4, -12, 4, 12)]].map(
        (s) =>
          s.map((r) => r.map(([x, y]) => [x * scale + dx, y * scale + dy])),
      );
    const reference = Path.divide(config(1));

    for (const scale of [1e-3, 1e3, 1e5]) {
      it(`scale ${scale}`, () => {
        const faces = Path.divide(config(scale));
        expect(faces).toHaveLength(reference.length);
        const areas = faces.map(polygonArea).sort((p, q) => p - q);
        const expected = reference
          .map((f) => polygonArea(f) * scale * scale)
          .sort((p, q) => p - q);
        for (let i = 0; i < areas.length; i++) {
          expect(areas[i] / expected[i]).toBeCloseTo(1, 4);
        }
        checkAgainstOracle(config(scale), 24);
      });
    }

    it("at a large offset", () => {
      const faces = Path.divide(config(1, 5e4, -3e4));
      expect(faces).toHaveLength(reference.length);
      const u = Path.unite(config(1, 5e4, -3e4));
      expect(polygonArea(u) / polygonArea(Path.unite(config(1)))).toBeCloseTo(
        1,
        3,
      );
    });
  });

  describe("results are drawable polygons", () => {
    it("every ring is a Group usable by Polygon functions", () => {
      const u = Path.unite([disc(0, 0, 10), disc(8, 0, 10)]);
      expect(Polygon.area(u[0])).toBeCloseTo(polygonArea(u), 4);
      expect(Polygon.centroid(u[0])).toBeInstanceOf(Pt);
    });
  });
});
