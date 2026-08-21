import { describe, expect, it, vi } from "vitest";
import { Num } from "../Num";
import { Bound, Group, Pt } from "../Pt";
import { Util } from "../Util";

function values(value: ArrayLike<number>) {
  return Array.from(value);
}

function groupValues(value: ArrayLike<ArrayLike<number>>) {
  return Array.from(value, values);
}

describe("Pt construction and accessors", () => {
  it("constructs defaults, lengths, arrays, typed arrays, objects, and positional values", () => {
    expect(values(new Pt())).toEqual([0, 0]);
    expect(values(new Pt(3))).toEqual([0, 0, 0]);
    expect(values(new Pt([3]))).toEqual([3]);
    expect(values(new Pt(new Float32Array([1, 2])))).toEqual([1, 2]);
    expect(values(new Pt({ x: 1, y: 2, z: 3, w: 4 }))).toEqual([1, 2, 3, 4]);
    expect(values(new Pt(1, 2, 3))).toEqual([1, 2, 3]);
  });

  it("makes fixed and seeded-random dimensions", () => {
    expect(values(Pt.make(3, 4))).toEqual([4, 4, 4]);
    vi.spyOn(Num, "random").mockReturnValueOnce(0.25).mockReturnValueOnce(0.5);
    expect(values(Pt.make(2, 8, true))).toEqual([2, 4]);
    expect(values(Pt.make(2))).toEqual([0, 0]);
  });

  it("gets and sets id and named dimensions", () => {
    const point = new Pt(1, 2, 3, 4);
    point.id = "point";
    point.x = 10;
    point.y = 20;
    point.z = 30;
    point.w = 40;
    expect(point.id).toBe("point");
    expect([point.x, point.y, point.z, point.w]).toEqual([10, 20, 30, 40]);
  });

  it("clones, compares thresholds, and updates bounded dimensions", () => {
    const point = new Pt(1, 2, 3);
    const clone = point.clone();
    expect(clone).not.toBe(point);
    expect(clone.equals(point)).toBe(true);
    expect(point.equals([1, 2.01, 3], 0.02)).toBe(true);
    expect(point.equals([1, 2.01, 3], 0.001)).toBe(false);
    expect(point.to(4, 5)).toBe(point);
    expect(values(point)).toEqual([4, 5, 3]);
    expect(values(point.$to([7, 8, 9]))).toEqual([7, 8, 9]);
    expect(values(point)).toEqual([4, 5, 3]);
  });
});

describe("Pt vector operations", () => {
  it("sets an angle with explicit, inferred, and anchored magnitudes", () => {
    const vertical = new Pt(3, 4).toAngle(Math.PI / 2, 2);
    expect(vertical.x).toBeCloseTo(0);
    expect(vertical.y).toBeCloseTo(2);
    const inferred = new Pt(3, 4).toAngle(0);
    expect(inferred.x).toBeCloseTo(5);
    expect(inferred.y).toBeCloseTo(0);
    expect(values(new Pt(1, 1).toAngle(0, 2, true))).toEqual([3, 1]);
  });

  it("binds one or many operations to the point", () => {
    const point = new Pt(1, 2);
    const add = point.op((self, amount: number) => new Pt(self).add(amount));
    expect(values(add(3))).toEqual([4, 5]);
    const [sum, product] = point.ops([
      (self, amount) => new Pt(self).add(amount),
      (self, amount) => new Pt(self).multiply(amount),
    ]);
    expect(values(sum(2))).toEqual([3, 4]);
    expect(values(product(2))).toEqual([2, 4]);
  });

  it("takes axes and concatenates extra dimensions", () => {
    const point = new Pt(1, 2, 3, 4);
    expect(values(point.$take("yx"))).toEqual([2, 1]);
    expect(values(point.$take([3, 9]))).toEqual([4, 0]);
    expect(values(point.$concat(5, 6))).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("supports mutable and immutable arithmetic", () => {
    const point = new Pt(2, 4, 8);
    expect(point.add(1)).toBe(point);
    expect(values(point)).toEqual([3, 5, 9]);
    expect(values(point.$add([1, 2, 3]))).toEqual([4, 7, 12]);
    expect(point.subtract(1, 2, 3)).toBe(point);
    expect(values(point)).toEqual([2, 3, 6]);
    expect(values(point.$subtract(1))).toEqual([1, 2, 5]);
    expect(point.multiply(2)).toBe(point);
    expect(values(point)).toEqual([4, 6, 12]);
    expect(values(point.$multiply([2, 3, 4]))).toEqual([8, 18, 48]);
    expect(point.divide(2)).toBe(point);
    expect(values(point)).toEqual([2, 3, 6]);
    expect(values(point.$divide([2, 3, 6]))).toEqual([1, 1, 1]);
  });

  it("calculates magnitudes, products, projections, and units", () => {
    const point = new Pt(3, 4);
    expect(point.magnitudeSq()).toBe(25);
    expect(point.magnitude()).toBe(5);
    expect(point.dot(2, 3)).toBe(18);
    expect(point.$cross2D(2, 3)).toBe(1);
    expect(values(new Pt(1, 0, 0).$cross(0, 1, 0))).toEqual([0, 0, 1]);
    expect(point.$project([1, 0]).equals([0.36, 0.48], 0.00001)).toBe(true);
    expect(point.projectScalar([1, 0])).toBe(0.6);
    expect(point.$unit().magnitude()).toBeCloseTo(1);
    expect(point.unit(5)).toBe(point);
    expect(point.magnitude()).toBeCloseTo(1);
  });

  it("rounds, clamps dimensions, and reports extrema", () => {
    const point = new Pt(-1.2, 2.5, 3.8);
    expect(point.$abs().equals([1.2, 2.5, 3.8], 0.00001)).toBe(true);
    expect(point.abs()).toBe(point);
    expect(values(point.$floor())).toEqual([1, 2, 3]);
    expect(point.floor()).toBe(point);
    expect(values(point.$ceil())).toEqual([1, 2, 3]);
    point.to(1.2, 2.5, 3.8);
    expect(point.ceil()).toBe(point);
    expect(values(point)).toEqual([2, 3, 4]);
    point.to(1.2, 2.5, 3.8);
    expect(values(point.$round())).toEqual([1, 3, 4]);
    expect(point.round()).toBe(point);
    expect(point.minValue()).toEqual({ value: 1, index: 0 });
    expect(point.maxValue()).toEqual({ value: 4, index: 2 });
    expect(values(point.$min(2, 2, 9))).toEqual([1, 2, 4]);
    expect(values(point.$max(2, 2, 9))).toEqual([2, 3, 9]);
  });

  it("calculates angles and geometric transforms", () => {
    expect(new Pt(0, 1).angle()).toBeCloseTo(Math.PI / 2);
    expect(new Pt(9, 0, 1).angle("xz")).toBeCloseTo(Math.atan2(1, 9));
    expect(new Pt(1, 0).angleBetween(new Pt(0, 1))).toBeCloseTo(-Math.PI / 2);

    const point = new Pt(2, 3);
    expect(point.scale(2, [1, 1])).toBe(point);
    expect(values(point)).toEqual([3, 5]);
    expect(point.rotate2D(Math.PI / 2, [1, 1])).toBe(point);
    expect(point.x).toBeCloseTo(-3);
    expect(point.y).toBeCloseTo(3);
    expect(point.shear2D([0, 0], [0, 0])).toBe(point);
    expect(
      point.reflect2D(
        Group.fromArray([
          [0, 0],
          [0, 10],
        ]),
      ),
    ).toBe(point);
    expect(point.x).toBeCloseTo(3);
  });

  it("converts to strings, arrays, groups, and bounds", () => {
    const point = new Pt(2, 3);
    expect(point.toString()).toBe("Pt(2, 3)");
    expect(point.toArray()).toEqual([2, 3]);
    expect(groupValues(point.toGroup())).toEqual([
      [0, 0],
      [2, 3],
    ]);
    const bound = point.toBound();
    expect(bound).toBeInstanceOf(Bound);
    expect(values(bound.size)).toEqual([2, 3]);
  });
});

describe("Group", () => {
  const makeGroup = () =>
    Group.fromArray([
      [0, 0],
      [10, 10],
      [20, 0],
      [30, 10],
    ]);

  it("constructs from arrays and iterables and exposes relative accessors", () => {
    const points = [new Pt(1, 1), new Pt(2, 2), new Pt(3, 3), new Pt(4, 4)];
    const group = new Group(...points);
    group.id = "shape";
    expect(group.id).toBe("shape");
    expect([group.p1, group.p2, group.p3, group.p4]).toEqual(points);
    expect([group.q1, group.q2, group.q3, group.q4]).toEqual(
      points.slice().reverse(),
    );
    expect(groupValues(Group.fromArray(new Set(points)))).toEqual(
      groupValues(group),
    );
    expect(groupValues(Group.fromPtArray(new Set(points)))).toEqual(
      groupValues(group),
    );
  });

  it("deep-clones, splits, inserts, and removes", () => {
    const group = makeGroup();
    const clone = group.clone();
    expect(clone).toEqual(group);
    expect(clone[0]).not.toBe(group[0]);
    expect(group.split(2)).toHaveLength(2);
    expect(group.segments(2, 1)).toHaveLength(3);
    expect(group.lines()).toHaveLength(3);
    expect(group.insert(new Set([new Pt(-1, -1)]), 1)).toBe(group);
    expect(values(group[1])).toEqual([-1, -1]);
    expect(group.remove(-2)[0].equals([-1, -1])).toBe(true);
    expect(group.remove(0, 2)).toHaveLength(2);
  });

  it("calculates centroid, bounds, anchoring, and interpolation", () => {
    const group = makeGroup();
    expect(values(group.centroid())).toEqual([15, 5]);
    expect(groupValues(group.boundingBox())).toEqual([
      [0, 0],
      [30, 10],
    ]);
    expect(values(group.interpolate(-1))).toEqual([0, 0]);
    expect(values(group.interpolate(0.5))).toEqual([15, 5]);
    expect(values(group.interpolate(2))).toEqual([30, 10]);

    group.anchorTo(1);
    expect(values(group[1])).toEqual([10, 10]);
    expect(values(group[0])).toEqual([-10, -10]);
    group.anchorFrom(new Pt(10, 10));
    expect(values(group[0])).toEqual([0, 0]);
  });

  it("binds operations and moves points", () => {
    const group = makeGroup();
    expect(group.op((self, n) => Array.from(self).length + n)(2)).toBe(6);
    const operations = group.ops([
      (self) => Array.from(self).length,
      (self, n) => Array.from(self).length * n,
    ]);
    expect(operations[0]()).toBe(4);
    expect(operations[1](3)).toBe(12);
    expect(group.moveBy(1, 2)).toBe(group);
    expect(values(group[0])).toEqual([1, 2]);
    expect(group.moveTo(10, 20)).toBe(group);
    expect(values(group[0])).toEqual([10, 20]);
  });

  it("transforms, sorts, and applies point operations", () => {
    const group = Group.fromArray([
      [0, 0],
      [1, 2],
      [2, 1],
    ]);
    expect(group.scale(2)).toBe(group);
    expect(group.rotate2D(Math.PI / 2)).toBe(group);
    expect(group.shear2D([0, 0])).toBe(group);
    expect(
      group.reflect2D(
        Group.fromArray([
          [0, 0],
          [0, 1],
        ]),
      ),
    ).toBe(group);
    expect(group.sortByDimension(1)).toBe(group);
    expect(group[0].y).toBeLessThanOrEqual(group[1].y);
    expect(group.sortByDimension(0, true)).toBe(group);
    expect(group[0].x).toBeGreaterThanOrEqual(group[1].x);
    expect(group.add(1).subtract(1).multiply(2).divide(2)).toBe(group);

    const warning = vi.spyOn(Util, "warn").mockReturnValue(undefined);
    expect(group.forEachPt("missing")).toBe(group);
    expect(warning).toHaveBeenCalledOnce();
  });

  it("provides matrix, zip, bound, and string helpers", () => {
    const group = Group.fromArray([
      [1, 2],
      [3, 4],
    ]);
    expect(groupValues(group.$matrixAdd(1))).toEqual([
      [2, 3],
      [4, 5],
    ]);
    expect(groupValues(group.$matrixMultiply(2))).toEqual([
      [2, 4],
      [6, 8],
    ]);
    expect(values(group.zipSlice(1))).toEqual([2, 4]);
    expect(groupValues(group.$zip())).toEqual([
      [1, 3],
      [2, 4],
    ]);
    expect(group.toBound()).toBeInstanceOf(Bound);
    expect(group.toString()).toBe("Group[ Pt(1, 2) Pt(3, 4)  ]");
  });
});

describe("Bound", () => {
  it("constructs from rectangles, groups, and partial points", () => {
    const fromRect = Bound.fromBoundingRect({
      left: 10,
      top: 20,
      right: 40,
      bottom: 60,
      width: 30,
      height: 40,
    } as DOMRect);
    expect(values(fromRect.topLeft)).toEqual([10, 20]);
    expect(values(fromRect.bottomRight)).toEqual([40, 60]);
    expect(values(fromRect.size)).toEqual([30, 40]);
    expect(values(fromRect.center)).toEqual([25, 40]);
    expect(fromRect.inited).toBe(true);

    const one = new Bound(new Pt(1, 2, 3));
    expect(one.inited).toBe(true);
    expect([one.width, one.height, one.depth]).toEqual([1, 2, 3]);
    expect(() => Bound.fromGroup([new Pt()])).toThrow("less than 2 Pt");
  });

  it("keeps positions, size, center, and dimensions synchronized", () => {
    const bound = Bound.fromGroup(
      Group.fromArray([
        [0, 0, 0],
        [10, 20, 30],
      ]),
    );
    bound.size = new Pt(20, 30, 40);
    expect(values(bound.bottomRight)).toEqual([20, 30, 40]);
    bound.center = new Pt(20, 20, 20);
    expect(values(bound.topLeft)).toEqual([10, 5, 0]);
    expect(values(bound.bottomRight)).toEqual([30, 35, 40]);
    bound.topLeft = new Pt(0, 0, 0);
    expect(values(bound.size)).toEqual([30, 35, 40]);
    bound.bottomRight = new Pt(10, 20, 30);
    expect(values(bound.size)).toEqual([10, 20, 30]);
    bound.width = 5;
    bound.height = 6;
    bound.depth = 7;
    expect(values(bound.bottomRight)).toEqual([5, 6, 7]);
    expect([bound.x, bound.y, bound.z]).toEqual([0, 0, 0]);
  });

  it("preserves size when the center is moved", () => {
    // CanvasSpace offsets a measured bound by the window scroll on every
    // resize. Moving the center must translate the bound, never reshape it.
    const bound = Bound.fromGroup(
      Group.fromArray([
        [0, 0],
        [640, 433],
      ]),
    );
    bound.center = bound.center.add(0, 1600);
    expect(values(bound.size)).toEqual([640, 433]);
    expect(values(bound.center)).toEqual([320, 1816.5]);
    expect(values(bound.topLeft)).toEqual([0, 1600]);
    expect(values(bound.bottomRight)).toEqual([640, 2033]);
  });

  it("clones and updates after direct point mutation", () => {
    const bound = Bound.fromGroup(
      Group.fromArray([
        [0, 0],
        [10, 20],
      ]),
    );
    const clone = bound.clone();
    expect(clone).not.toBe(bound);
    expect(values(clone.size)).toEqual([10, 20]);
    bound[0].to(2, 3);
    bound[1].to(12, 23);
    expect(bound.update()).toBe(bound);
    expect(values(bound.size)).toEqual([10, 20]);
    expect(values(bound.center)).toEqual([7, 13]);
  });

  it("reports zero dimensions for an empty bound", () => {
    const bound = new Bound();
    expect(bound.inited).toBe(false);
    expect([bound.width, bound.height, bound.depth]).toEqual([0, 0, 0]);
  });
});

describe("argument fast paths preserve semantics", () => {
  it("constructs from a Pt, a Float32Array, and other typed arrays identically", () => {
    const source = new Pt(1.5, 2.5, 3.5);
    expect(values(new Pt(source))).toEqual([1.5, 2.5, 3.5]);
    expect(new Pt(source)).not.toBe(source);
    const bytes = new Uint8Array([1, 2]) as unknown as Float32Array;
    expect(values(new Pt(bytes))).toEqual([1, 2]);
    const clone = source.clone();
    clone[0] = 9;
    expect(source[0]).toBe(1.5); // clone must not share the buffer
  });

  it("does not mutate caller-owned arguments", () => {
    const arr = [1, 2];
    const other = new Pt(3, 4);
    const p = new Pt(10, 20);
    p.add(arr).subtract(arr).multiply(other).divide(other).dot(other);
    p.$min(arr);
    p.$max(arr);
    p.to(arr);
    expect(arr).toEqual([1, 2]);
    expect(values(other)).toEqual([3, 4]);
  });

  it("handles self-aliased arguments consistently", () => {
    expect(values(new Pt(2, 3).add(new Pt(2, 3)))).toEqual([4, 6]);
    const p = new Pt(2, 3);
    expect(values(p.add(p))).toEqual([4, 6]);
    const q = new Pt(2, 3);
    expect(values(q.subtract(q))).toEqual([0, 0]);
    const r = new Pt(2, 3);
    expect(values(r.multiply(r))).toEqual([4, 9]);
    const s = new Pt(3, 4);
    expect(s.dot(s)).toBe(25);
  });

  it("keeps group arithmetic order-dependent when a member is the argument", () => {
    const group = Group.fromArray([
      [1, 2],
      [10, 20],
    ]);
    group.add(group[0]);
    // member 0 doubles first; later members then see the mutated value
    expect(groupValues(group)).toEqual([
      [2, 4],
      [12, 24],
    ]);
  });

  it("accepts every argument shape in group arithmetic", () => {
    const base = () =>
      Group.fromArray([
        [1, 2],
        [3, 4],
      ]);
    expect(groupValues(base().add(10))).toEqual([
      [11, 12],
      [13, 14],
    ]);
    expect(groupValues(base().add(10, 20))).toEqual([
      [11, 22],
      [13, 24],
    ]);
    expect(groupValues(base().add([10, 20]))).toEqual([
      [11, 22],
      [13, 24],
    ]);
    expect(groupValues(base().add({ x: 10, y: 20 }))).toEqual([
      [11, 22],
      [13, 24],
    ]);
    expect(groupValues(base().add(new Pt(10, 20)))).toEqual([
      [11, 22],
      [13, 24],
    ]);
    expect(groupValues(new Group().add(5))).toEqual([]);
  });

  it("returns Pt instances from species-constructed results", () => {
    const p = new Pt(1, 2, 3);
    expect(p.map((v) => v * 2)).toBeInstanceOf(Pt);
    expect(p.slice(1)).toBeInstanceOf(Pt);
    expect(values(p.map((v) => v * 2))).toEqual([2, 4, 6]);
  });

  it("converts to a plain array", () => {
    const arr = new Pt(1, 2, 3).toArray();
    expect(Array.isArray(arr)).toBe(true);
    expect(arr).toEqual([1, 2, 3]);
  });

  it("resolves getPtLike without copying arrays and typed arrays", () => {
    const arr = [1, 2];
    const typed = new Float32Array([3, 4]);
    expect(Util.getPtLike([arr])).toBe(arr);
    expect(Util.getPtLike([typed])).toBe(typed);
    expect(Util.getPtLike([1, 2])).toEqual([1, 2]);
    expect(Util.getPtLike([{ x: 1, y: 2 }])).toEqual([1, 2]);
    expect(Util.getPtLike([])).toEqual([]);
  });

  it("computes bounding boxes without mutating inputs, across dimensions", () => {
    const pts = Group.fromArray([
      [5, 5],
      [-2, 8],
      [3, -4],
    ]);
    const box = pts.boundingBox();
    expect(groupValues(box)).toEqual([
      [-2, -4],
      [5, 8],
    ]);
    expect(groupValues(pts)).toEqual([
      [5, 5],
      [-2, 8],
      [3, -4],
    ]);
  });
});

describe("Pt, Group, and Bound correctness pins", () => {
  it("rejects equality against shorter or NaN Pts", () => {
    expect(new Pt(1, 2, 3).equals([1, 2])).toBe(false);
    expect(new Pt(1, 2).equals([1, 2, 99])).toBe(true); // own dims compared
    expect(new Pt(1, 2).equals([1, NaN])).toBe(false);
    expect(new Pt(1, 2).equals([1, 2.0000001], 0.001)).toBe(true);
  });

  it("returns real Groups from split, segments, and lines", () => {
    const g = Group.fromArray([
      [0, 0],
      [1, 1],
      [2, 2],
      [3, 3],
    ]);
    for (const part of g.split(2)) expect(part instanceof Group).toBe(true);
    for (const seg of g.segments(2, 1)) expect(seg instanceof Group).toBe(true);
    for (const ln of g.lines()) expect(ln instanceof Group).toBe(true);
    // loopBack path too, with identical chunk content
    const looped = g.segments(3, 2, true);
    expect(looped.every((s) => s instanceof Group)).toBe(true);
    expect(looped.map((s) => s.length)).toEqual([3, 3]);
    expect(Array.from(looped[1][2])).toEqual([0, 0]); // wraps to start
  });

  it("treats forEachPt on an empty group as a no-op", () => {
    const g = new Group();
    expect(g.forEachPt("unit")).toBe(g);
  });

  it("normalizes angleBetween across the wrap", () => {
    const at = (rad: number) => new Pt(Math.cos(rad), Math.sin(rad));
    const wrap = at(-0.1).angleBetween(at(0.1));
    expect(Math.abs(wrap)).toBeCloseTo(0.2, 5);
    expect(at(0.5).angleBetween(at(0.2))).toBeCloseTo(0.3, 5);
    expect(at(0.2).angleBetween(at(0.5))).toBeCloseTo(-0.3, 5);
  });

  it("projects the argument onto this Pt", () => {
    // anchor for the corrected docs: $project(b) projects b onto this
    expect(Array.from(new Pt(10, 0).$project([3, 4]))).toEqual([3, 0]);
    expect(new Pt(10, 0).projectScalar([3, 4])).toBeCloseTo(3);
  });

  it("reads Bound x/y/z without losing missing-dimension semantics", () => {
    const b = Bound.fromGroup(
      Group.fromArray([
        [5, 6],
        [105, 206],
      ]),
    );
    expect(b.x).toBe(5);
    expect(b.y).toBe(6);
    expect(b.z).toBeUndefined(); // 2D bound has no z
    b.topLeft = new Pt(7, 8);
    expect(b.x).toBe(7);
    expect(b.width).toBe(98);
  });

  it("inserts very large groups without an arguments overflow", () => {
    const big = Group.fromArray(
      Array.from({ length: 200000 }, (_, i) => [i, i]),
    );
    const g = Group.fromArray([[-1, -1]]);
    g.insert(big, 1);
    expect(g).toHaveLength(200001);
    expect(Array.from(g[1])).toEqual([0, 0]);
    expect(Array.from(g[200000])).toEqual([199999, 199999]);
  });
});
