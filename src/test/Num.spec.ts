import { afterEach, describe, expect, it, vi } from "vitest";
import { Geom, Num, Range, Shaping } from "../Num";
import { Group, Pt } from "../Pt";

function values(value: ArrayLike<number>) {
  return Array.from(value);
}

function groupValues(value: ArrayLike<ArrayLike<number>>) {
  return Array.from(value, values);
}

afterEach(() => {
  Num.generator = undefined;
});

describe("Num", () => {
  it("compares, interpolates, clamps, wraps, and checks ranges", () => {
    expect(Num.equals(1, 1.000001)).toBe(true);
    expect(Num.equals(1, 1.1)).toBe(false);
    expect(Num.lerp(10, 20, 0.25)).toBe(12.5);
    expect(Num.clamp(-1, 0, 10)).toBe(0);
    expect(Num.clamp(20, 0, 10)).toBe(10);
    expect(Num.boundValue(361, 0, 360)).toBe(1);
    expect(Num.boundValue(-1, 0, 360)).toBe(359);
    expect(Num.boundValue(-370, 0, 360)).toBe(350);
    expect(Num.boundValue(16, 10, 20)).toBe(16);
    expect(Num.boundValue(-5, 10, 20)).toBe(15);
    expect(Num.boundValue(25, 10, 20)).toBe(15);
    expect(Num.within(3, 5, 1)).toBe(true);
    expect(Num.within(6, 5, 1)).toBe(false);
  });

  it("creates deterministic random ranges and points", () => {
    vi.spyOn(Num, "random").mockReturnValue(0.25);
    expect(Num.randomRange(10)).toBe(2.5);
    expect(Num.randomRange(10, 20)).toBe(12.5);
    expect(Num.randomRange(10, 5)).toBe(6.25);
    expect(values(Num.randomPt([8, 4]))).toEqual([2, 1]);
    expect(values(Num.randomPt([10, 20], [30, 40]))).toEqual([15, 25]);
  });

  it("normalizes, maps, sums, averages, and cycles", () => {
    expect(Num.normalizeValue(15, 10, 20)).toBe(0.5);
    expect(Num.normalizeValue(15, 20, 10)).toBe(0.5);
    const points = new Set([new Pt(1, 2), new Pt(3, 4), new Pt(5, 6)]);
    expect(values(Num.sum(points))).toEqual([9, 12]);
    expect(values(Num.average(points))).toEqual([3, 4]);
    expect(Num.cycle(0.25, (value) => value)).toBe(0.5);
    expect(Num.cycle(0.75, (value) => value)).toBe(0.5);
    expect(Num.cycle(0.5)).toBeCloseTo(1);
    expect(Num.mapToRange(5, 0, 10, 100, 0)).toBe(50);
    // inverted target and inverted source ranges map directionally
    expect(Num.mapToRange(2, 0, 10, 100, 0)).toBe(80);
    expect(Num.mapToRange(2, 10, 0, 0, 100)).toBe(80);
    expect(Num.mapToRange(2, 0, 10, 0, 100)).toBe(20);
    expect(() => Num.mapToRange(1, 2, 2, 0, 1)).toThrow("not zero");
  });

  it("uses Math.random until a reproducible generator is seeded", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.123);
    expect(Num.random()).toBe(0.123);
    Num.seed("repeatable");
    const first = [Num.random(), Num.random(), Num.random()];
    expect(first.every((value) => value >= 0 && value < 1)).toBe(true);
    Num.seed("repeatable");
    expect([Num.random(), Num.random(), Num.random()]).toEqual(first);
    Num.seed("");
    expect(Number.isFinite(Num.random())).toBe(true);
  });
});

describe("Geom basics", () => {
  it("converts and bounds degrees and radians", () => {
    expect(Geom.boundAngle(-12)).toBe(348);
    expect(Geom.boundRadian(-Math.PI)).toBeCloseTo(Math.PI);
    expect(Geom.toRadian(180)).toBeCloseTo(Math.PI);
    expect(Geom.toDegree(Math.PI / 2)).toBeCloseTo(90);
  });

  it("calculates bounds, centroids, interpolation, and containment", () => {
    const points = Group.fromArray([
      [-10, 100, 5],
      [1, 2, 3],
      [-1, 50, 9],
    ]);
    expect(groupValues(Geom.boundingBox(points))).toEqual([
      [-10, 2, 3],
      [1, 100, 9],
    ]);
    const center = Geom.centroid(points);
    expect(center.x).toBeCloseTo(-10 / 3);
    expect(center.y).toBeCloseTo(152 / 3);
    expect(center.z).toBeCloseTo(17 / 3);
    expect(values(Geom.interpolate([10, 10, 99], [20, 100], 0.3))).toEqual([
      13, 37,
    ]);
    expect(Geom.withinBound([10, 15], [10, 10], [11, 15])).toBe(true);
    expect(Geom.withinBound([10, 16], [10, 10], [11, 15])).toBe(false);
  });

  it("anchors groups to an indexed or external point", () => {
    const points = Group.fromArray([
      [10, 10],
      [20, 30],
      [30, 50],
    ]);
    Geom.anchor(points, 1, "to");
    expect(groupValues(points)).toEqual([
      [-10, -20],
      [20, 30],
      [10, 20],
    ]);
    Geom.anchor(points, [1, 2], "from");
    expect(groupValues(points)).toEqual([
      [-9, -18],
      [21, 32],
      [11, 22],
    ]);
  });

  it("creates perpendiculars and detects perpendicular vectors", () => {
    expect(groupValues(Geom.perpendicular([2, 3]))).toEqual([
      [-3, 2],
      [3, -2],
    ]);
    expect(groupValues(Geom.perpendicular([1, 2, 3], "yz"))).toEqual([
      [1, -3, 2],
      [1, 3, -2],
    ]);
    expect(Geom.isPerpendicular([-2, 4], [8, 4])).toBe(true);
    expect(Geom.isPerpendicular([1, 1], [1, 1])).toBe(false);
  });

  it("sorts polygon edges and rejects one-dimensional points", () => {
    const points = Group.fromArray([
      [1, 0],
      [0, 1],
      [-1, 0],
      [0, -1],
      [2, 0],
    ]);
    const sorted = Geom.sortEdges(points);
    expect(sorted).toHaveLength(5);
    expect(new Set(sorted)).toEqual(new Set(points));
    expect(() => Geom.sortEdges(Group.fromArray([[1], [2]]))).toThrow(
      "less than 2",
    );
  });
});

describe("Geom transforms", () => {
  it("scales points and groups with scalar/vector and origin/anchor inputs", () => {
    const point = new Pt(2, 3, 4);
    expect(Geom.scale(point, 2)).toBe(Geom);
    expect(values(point)).toEqual([4, 6, 8]);
    const group = Group.fromArray([
      [1, 2],
      [3, 4],
    ]);
    Geom.scale(group, [2, 3], [1, 1]);
    expect(groupValues(group)).toEqual([
      [1, 4],
      [5, 10],
    ]);
  });

  it("rotates points and selected axes around origins and anchors", () => {
    const point = new Pt(1, 0);
    expect(Geom.rotate2D(point, Math.PI / 2)).toBe(Geom);
    expect(point.x).toBeCloseTo(0);
    expect(point.y).toBeCloseTo(1);
    const xyz = new Pt(9, 2, 1);
    Geom.rotate2D(xyz, Math.PI / 2, [0, 0], "yz");
    expect(xyz.x).toBe(9);
    expect(xyz.y).toBeCloseTo(-1);
    expect(xyz.z).toBeCloseTo(2);
  });

  it("shears points and selected axes with scalar and vector factors", () => {
    const point = new Pt(2, 3);
    expect(Geom.shear2D(point, 0.1)).toBe(Geom);
    expect(Number.isFinite(point.x + point.y)).toBe(true);
    const xyz = new Pt(9, 2, 1);
    Geom.shear2D(xyz, [0.1, 0.2], [0, 0], "yz");
    expect(xyz.x).toBe(9);
  });

  it("reflects individual/group points and selected axes", () => {
    const vertical = Group.fromArray([
      [0, 0],
      [0, 10],
    ]);
    const point = new Pt(3, 4);
    expect(Geom.reflect2D(point, vertical)).toBe(Geom);
    expect(values(point)).toEqual([-3, 4]);
    const group = Group.fromArray([
      [1, 2, 3],
      [4, 5, 6],
    ]);
    Geom.reflect2D(
      group,
      Group.fromArray([
        [0, 0],
        [10, 0],
      ]),
      "yz",
    );
    expect(group[0].x).toBe(1);
  });

  it("creates 360-entry trigonometry lookup tables", () => {
    const cosine = Geom.cosTable();
    const sine = Geom.sinTable();
    expect(cosine.table).toHaveLength(360);
    expect(sine.table).toHaveLength(360);
    expect(cosine.cos(Math.PI)).toBeCloseTo(-1);
    expect(sine.sin(Math.PI / 2)).toBeCloseTo(1);
    expect(cosine.cos(-Math.PI / 2)).toBeCloseTo(0);
  });
});

describe("Shaping", () => {
  const names = [
    "linear",
    "quadraticIn",
    "quadraticOut",
    "quadraticInOut",
    "cubicIn",
    "cubicOut",
    "cubicInOut",
    "exponentialIn",
    "exponentialOut",
    "sineIn",
    "sineOut",
    "sineInOut",
    "cosineApprox",
    "circularIn",
    "circularOut",
    "circularInOut",
    "elasticIn",
    "elasticOut",
    "elasticInOut",
    "bounceIn",
    "bounceOut",
    "bounceInOut",
    "sigmoid",
    "logSigmoid",
    "seat",
    "quadraticBezier",
    "cubicBezier",
    "quadraticTarget",
    "cliff",
  ];

  it.each(names)("%s returns finite shaped values", (name) => {
    const fn = Shaping[name];
    expect(Number.isFinite(fn(0.25, 2))).toBe(true);
    expect(Number.isFinite(fn(0.75, 2))).toBe(true);
  });

  it("covers piecewise transition boundaries", () => {
    for (const t of [0.1, 0.5, 0.8, 0.95]) {
      expect(Number.isFinite(Shaping.bounceOut(t, 2))).toBe(true);
    }
    expect(Shaping.quadraticInOut(0.25)).toBeLessThan(0.5);
    expect(Shaping.quadraticInOut(0.75)).toBeGreaterThan(0.5);
    expect(Shaping.circularInOut(0.25)).toBeLessThan(0.5);
    expect(Shaping.circularInOut(0.75)).toBeGreaterThan(0.5);
    expect(Shaping.elasticInOut(0.25)).toBeLessThan(0.5);
    expect(Shaping.elasticInOut(0.75)).toBeGreaterThan(0.5);
    expect(Shaping.bounceInOut(0.25)).toBeLessThan(0.5);
    expect(Shaping.bounceInOut(0.75)).toBeGreaterThan(0.5);
    expect(Shaping.seat(0.25)).toBeLessThan(0.5);
    expect(Shaping.seat(0.75)).toBeGreaterThan(0.5);
  });

  it("clamps curve parameters and converts functions to steps", () => {
    expect(Number.isFinite(Shaping.logSigmoid(0.5, 1, 0))).toBe(true);
    expect(Number.isFinite(Shaping.logSigmoid(0.5, 1, 1))).toBe(true);
    expect(Number.isFinite(Shaping.quadraticBezier(0.5, 1, 0.5))).toBe(true);
    expect(Number.isFinite(Shaping.quadraticBezier(0.5, 1, [0.2, 0.8]))).toBe(
      true,
    );
    expect(Number.isFinite(Shaping.quadraticTarget(0.5, 1, [-1, 2]))).toBe(
      true,
    );
    expect(Shaping.cliff(0.5, 2, 0.5)).toBe(0);
    expect(Shaping.cliff(0.6, 2, 0.5)).toBe(2);
    expect(Shaping.step(Shaping.linear, 4, 0.37, 2)).toBe(0.5);
  });
});

describe("Range", () => {
  const source = () =>
    Group.fromArray([
      [1, 10, 100],
      [3, 20, 50],
      [5, 15, 0],
    ]);

  it("calculates defensive min, max, and magnitude copies", () => {
    const range = new Range(source());
    expect(values(range.min)).toEqual([1, 10, 0]);
    expect(values(range.max)).toEqual([5, 20, 100]);
    expect(values(range.magnitude)).toEqual([4, 10, 100]);
    const min = range.min;
    min.x = 999;
    expect(range.min.x).toBe(1);
    expect(range.calc()).toBe(range);
  });

  it("maps dimensions with optional exclusions", () => {
    const range = new Range(source());
    expect(groupValues(range.mapTo(0, 1))).toEqual([
      [0, 0, 1],
      [0.5, 1, 0.5],
      [1, 0.5, 0],
    ]);
    expect(groupValues(range.mapTo(0, 1, [false, true, false]))[0]).toEqual([
      0, 10, 1,
    ]);
  });

  it("appends with optional recalculation and validates dimensions", () => {
    const range = new Range(source());
    expect(range.append(new Set([new Pt(-1, 30, 200)]), false)).toBe(range);
    expect(range.max.z).toBe(100);
    range.calc();
    expect(values(range.max)).toEqual([5, 30, 200]);
    expect(() => range.append([new Pt(1, 2)])).toThrow(
      "Dimensions don't match",
    );
  });

  it("creates inclusive evenly-spaced ticks", () => {
    expect(groupValues(new Range(source()).ticks(2))).toEqual([
      [1, 10, 0],
      [3, 15, 50],
      [5, 20, 100],
    ]);
  });
});

describe("Num and Geom correctness pins", () => {
  it("keeps Range min/max correct for all-negative data", () => {
    const r = new Range(
      new Group(new Pt(-5, -10), new Pt(-2, -8), new Pt(-7, -3)),
    );
    expect(values(r.max)).toEqual([-2, -3]);
    expect(values(r.min)).toEqual([-7, -10]);
    expect(values(r.magnitude)).toEqual([5, 7]);
  });

  it("returns finite ticks for zero subdivisions", () => {
    const r = new Range(new Group(new Pt(0, 0), new Pt(10, 10)));
    const t = r.ticks(0);
    expect(t.length).toBe(1);
    expect(values(t[0]).every(Number.isFinite)).toBe(true);
  });

  it("checks perpendicularity with a relative epsilon", () => {
    // exact perpendicular still passes
    expect(Geom.isPerpendicular([-2, 4], [8, 4])).toBe(true);
    // tiny float error within relative epsilon passes
    expect(Geom.isPerpendicular([3, 1], [-1, 3.0000001])).toBe(true);
    // clearly non-perpendicular fails
    expect(Geom.isPerpendicular([3, 1], [-1, 3.1])).toBe(false);
    // zero vector keeps its legacy result
    expect(Geom.isPerpendicular([0, 0], [1, 2])).toBe(true);
  });

  it("rotates a group about an anchor that aliases a group point", () => {
    const g = new Group(new Pt(0, 0), new Pt(2, 0));
    Geom.rotate2D(g, Math.PI / 2, [1, 0]);
    expect(g[0][0]).toBeCloseTo(1);
    expect(g[0][1]).toBeCloseTo(-1);
    expect(g[1][0]).toBeCloseTo(1);
    expect(g[1][1]).toBeCloseTo(1);
  });

  it("shears a group with a hoisted matrix", () => {
    // s[1] shears x by y; s[0] shears y by x (current convention, pinned)
    const g = new Group(new Pt(0, 0), new Pt(0, 2));
    Geom.shear2D(g, [0, 0.5], [0, 0]);
    expect(g[1][0]).toBeCloseTo(2 * Math.tan(0.5));
    expect(g[1][1]).toBeCloseTo(2);
    const h = new Group(new Pt(0, 0), new Pt(2, 0));
    Geom.shear2D(h, [0.5, 0], [0, 0]);
    expect(h[1][0]).toBeCloseTo(2);
    expect(h[1][1]).toBeCloseTo(2 * Math.tan(0.5));
  });
});
