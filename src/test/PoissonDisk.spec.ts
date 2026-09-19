import { afterEach, describe, expect, it, vi } from "vitest";
import { Create, PoissonDisk } from "../Create";
import { Num } from "../Num";
import { Bound, type Group, Pt } from "../Pt";

function bound(x0: number, y0: number, x1: number, y1: number): Bound {
  return new Bound(new Pt(x0, y0), new Pt(x1, y1));
}

/** The same half-open test the sampler uses. */
function inside(p: Pt, b: Bound): boolean {
  const x0 = b.x!;
  const y0 = b.y!;
  return (
    p[0] >= x0 && p[0] < x0 + b.width && p[1] >= y0 && p[1] < y0 + b.height
  );
}

/** Smallest squared distance between any two Pts, computed as the sampler does. */
function minPairDistanceSq(pts: Group): number {
  let min = Infinity;
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const dx = pts[i][0] - pts[j][0];
      const dy = pts[i][1] - pts[j][1];
      min = Math.min(min, dx * dx + dy * dy);
    }
  }
  return min;
}

/** Largest distance from any probe point to its nearest sample, for `probes` random probes. */
function largestHole(pts: Group, b: Bound, probes: number, rng: () => number) {
  let worst = 0;
  for (let t = 0; t < probes; t++) {
    const x = b.x! + rng() * b.width;
    const y = b.y! + rng() * b.height;
    let best = Infinity;
    for (const p of pts) {
      const dx = p[0] - x;
      const dy = p[1] - y;
      best = Math.min(best, dx * dx + dy * dy);
    }
    worst = Math.max(worst, best);
  }
  return Math.sqrt(worst);
}

describe("PoissonDisk", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("invariants", () => {
    const area = bound(100, 50, 900, 650); // offset from the origin so origin bugs show
    const radius = 8;

    it("keeps every pair of points at least radius apart, exactly", () => {
      Num.seed("poisson-min-distance");
      const pd = Create.sampling(area, radius);
      expect(pd.length).toBeGreaterThan(1000);
      expect(minPairDistanceSq(pd)).toBeGreaterThanOrEqual(radius * radius);
    });

    it("keeps every point inside the bound", () => {
      Num.seed("poisson-inside");
      const pd = Create.sampling(area, radius);
      for (const p of pd) expect(inside(p, area)).toBe(true);
      const box = Bound.fromGroup(pd.boundingBox());
      expect(box.x).toBeGreaterThanOrEqual(area.x!);
      expect(box.y).toBeGreaterThanOrEqual(area.y!);
      expect(box.x! + box.width).toBeLessThan(area.x! + area.width);
      expect(box.y! + box.height).toBeLessThan(area.y! + area.height);
    });

    it("packs densely and leaves no large holes (seeded regression)", () => {
      Num.seed("poisson-density");
      const pd = Create.sampling(area, radius);
      const hexPacking =
        (area.width * area.height) / ((radius * radius * Math.sqrt(3)) / 2);
      expect(pd.length / hexPacking).toBeGreaterThan(0.6);
      expect(largestHole(pd, area, 2000, () => Num.random())).toBeLessThan(
        2 * radius,
      );
    });

    it("is reproducible under Num.seed", () => {
      Num.seed("poisson-repeat");
      const a = Create.sampling(area, 20);
      Num.seed("poisson-repeat");
      const b = Create.sampling(area, 20);
      expect(a.length).toBe(b.length);
      expect([...a].map((p) => [p[0], p[1]])).toEqual(
        [...b].map((p) => [p[0], p[1]]),
      );
      Num.seed("poisson-other");
      const c = Create.sampling(area, 20);
      expect([...c].map((p) => p[0])).not.toEqual([...a].map((p) => p[0]));
    });
  });

  describe("progressive sampling", () => {
    it("produces the same seeded points one at a time, in batches, and all at once", () => {
      for (const area of [bound(100, 50, 300, 250), bound(100, 50, 300, 51)]) {
        const results = [1, 7, Infinity].map((batch) => {
          Num.seed("poisson-batches");
          const pd = new PoissonDisk().setup(area, 8);
          while (!pd.done) pd.sample(batch);
          return [...pd].map((p) => [...p]);
        });
        expect(results[1]).toEqual(results[0]);
        expect(results[2]).toEqual(results[0]);
      }
    });

    it("rounds sample budgets down and ignores nonpositive or NaN budgets", () => {
      const pd = new PoissonDisk().setup(bound(0, 0, 200, 200), 10);
      for (const count of [0.1, 0, -1, -Infinity, NaN]) {
        pd.sample(count);
        expect(pd.length).toBe(1);
      }
      pd.sample(1.9);
      expect(pd.length).toBe(2);
    });

    it("adds one sample per step and reports done exactly once", () => {
      Num.seed("poisson-step");
      const pd = new PoissonDisk().setup(bound(0, 0, 200, 200), 15);
      expect(pd.length).toBe(1);
      expect(pd.done).toBe(false);

      let steps = 0;
      for (;;) {
        const before = pd.length;
        const p = pd.step();
        if (p === undefined) break;
        steps++;
        expect(pd.length).toBe(before + 1);
        expect(p).toBe(pd[pd.length - 1]);
        expect(p).toBeInstanceOf(Pt);
      }
      expect(steps).toBeGreaterThan(50);
      expect(pd.done).toBe(true);
      expect(pd.step()).toBeUndefined();
      expect(pd.length).toBe(steps + 1);
      expect(minPairDistanceSq(pd)).toBeGreaterThanOrEqual(15 * 15);
    });

    it("sample(n) adds at most n points and sample() completes the set", () => {
      Num.seed("poisson-sample");
      const pd = new PoissonDisk().setup(bound(0, 0, 300, 300), 10);
      expect(pd.sample(10)).toBe(pd);
      expect(pd.length).toBe(11);
      pd.sample(0);
      expect(pd.length).toBe(11);
      pd.sample();
      expect(pd.done).toBe(true);
      const complete = pd.length;
      pd.sample(5);
      expect(pd.length).toBe(complete);
      expect(complete).toBeGreaterThan(400);
    });

    it("setup again empties the group and restarts", () => {
      Num.seed("poisson-reset");
      const pd = new PoissonDisk().setup(bound(0, 0, 100, 100), 10).sample();
      const first = pd.length;
      expect(first).toBeGreaterThan(20);
      pd.setup(bound(50, 50, 250, 150), 5, { candidates: 4 });
      expect(pd.length).toBe(1);
      expect(pd.done).toBe(false);
      expect(pd.candidates).toBe(4);
      expect(pd.radius).toBe(5);
      pd.sample();
      expect(pd.length).toBeGreaterThan(first);
      for (const p of pd) expect(inside(p, bound(50, 50, 250, 150))).toBe(true);
      expect(minPairDistanceSq(pd)).toBeGreaterThanOrEqual(25);
    });
  });

  describe("options", () => {
    it("places start as the first sample, rounded to float32", () => {
      const pd = new PoissonDisk().setup(bound(0, 0, 100, 100), 10, {
        start: [10.123456789, 20],
      });
      expect(pd.length).toBe(1);
      expect(pd[0][0]).toBe(Math.fround(10.123456789));
      expect(pd[0][1]).toBe(20);
      pd.sample();
      expect(pd[0][0]).toBe(Math.fround(10.123456789));
    });

    it("rejects a start outside the bound", () => {
      expect(() =>
        new PoissonDisk().setup(bound(0, 0, 100, 100), 10, {
          start: [100, 50],
        }),
      ).toThrow(/start/);
      expect(() =>
        new PoissonDisk().setup(bound(0, 0, 100, 100), 10, { start: [-1, 50] }),
      ).toThrow(/start/);
      expect(() =>
        new PoissonDisk().setup(bound(0, 0, 100, 100), 10, { start: [50, 50] }),
      ).not.toThrow();
    });

    it("packs tighter with more candidates, and holds the spacing with one", () => {
      const area = bound(0, 0, 400, 400);
      Num.seed("poisson-k");
      const sparse = Create.sampling(area, 8, { candidates: 1 });
      Num.seed("poisson-k");
      const dense = Create.sampling(area, 8, { candidates: 30 });
      expect(sparse.candidates).toBe(1);
      expect(dense.candidates).toBe(30);
      expect(dense.length).toBeGreaterThan(sparse.length);
      expect(minPairDistanceSq(sparse)).toBeGreaterThanOrEqual(64);
      expect(minPairDistanceSq(dense)).toBeGreaterThanOrEqual(64);
    });

    it("floors fractional candidates and rejects fewer than one", () => {
      expect(
        new PoissonDisk().setup(bound(0, 0, 10, 10), 2, { candidates: 2.9 })
          .candidates,
      ).toBe(2);
      expect(() =>
        new PoissonDisk().setup(bound(0, 0, 10, 10), 2, { candidates: 0 }),
      ).toThrow(/candidates/);
      expect(() =>
        new PoissonDisk().setup(bound(0, 0, 10, 10), 2, { candidates: NaN }),
      ).toThrow(/candidates/);
    });
  });

  describe("edge cases", () => {
    it("rejects positive extents that collapse at a large position", () => {
      for (const center of [new Pt(1e20, 0), new Pt(0, 1e20)]) {
        const area = bound(0, 0, 1, 1);
        area.center = center;
        expect(() => new PoissonDisk().setup(area, 1)).toThrow(/representable/);
      }
    });

    it("fills thin rectangles in either orientation without violating spacing", () => {
      for (const thickness of [0.1, 1, 5]) {
        for (const vertical of [false, true]) {
          const area = vertical
            ? bound(100, 50, 100 + thickness, 1050)
            : bound(100, 50, 1100, 50 + thickness);
          for (let seed = 0; seed < 10; seed++) {
            Num.seed(`thin${seed}`);
            const pd = Create.sampling(area, 10);
            expect(pd.done).toBe(true);
            expect(pd.length).toBeGreaterThanOrEqual(95);
            expect(minPairDistanceSq(pd)).toBeGreaterThanOrEqual(100);
            for (const p of pd) expect(inside(p, area)).toBe(true);
          }
        }
      }
    });

    it("rejects a radius that is not a positive finite number", () => {
      for (const r of [0, -5, NaN, Infinity]) {
        expect(() => new PoissonDisk().setup(bound(0, 0, 10, 10), r)).toThrow(
          /radius/,
        );
      }
    });

    it("rejects a bound with non-finite values", () => {
      expect(() =>
        new PoissonDisk().setup(bound(0, 0, Infinity, 10), 2),
      ).toThrow(/bound/);
      expect(() => new PoissonDisk().setup(bound(NaN, 0, 10, 10), 2)).toThrow(
        /bound/,
      );
      expect(() => new PoissonDisk().setup(new Bound(), 2)).toThrow(/bound/);
    });

    it("is immediately done with no samples for a bound without area", () => {
      const pd = new PoissonDisk().setup(bound(10, 10, 10, 50), 2);
      expect(pd.length).toBe(0);
      expect(pd.done).toBe(true);
      expect(pd.step()).toBeUndefined();
      expect(pd.sample().length).toBe(0);
      expect(
        Create.sampling(bound(0, 0, 0, 100), Number.MIN_VALUE).length,
      ).toBe(0);
    });

    it("gives exactly one sample when the bound is smaller than the radius in both dimensions", () => {
      const pd = Create.sampling(bound(0, 0, 5, 7), 10);
      expect(pd.length).toBe(1);
      expect(pd.done).toBe(true);
    });

    it("throws a clear error instead of allocating a huge grid", () => {
      expect(() =>
        new PoissonDisk().setup(bound(0, 0, 100000, 100000), 0.01),
      ).toThrow(/too small/);
    });

    it("redraws a random start that rounds onto the far edge", () => {
      // 1 - 2^-24 keeps float32 rounding from reaching 100 for width 100... force it with a
      // value that does: 0.9999999999 * 100 rounds to 100 in float32.
      const draws = [0.9999999999, 0.5, 0.25, 0.75];
      const random = vi
        .spyOn(Num, "random")
        .mockImplementation(() => draws.shift() ?? 0.5);
      const pd = new PoissonDisk().setup(bound(0, 0, 100, 100), 10);
      expect(random).toHaveBeenCalledTimes(4);
      expect(pd.length).toBe(1);
      expect(pd[0][0]).toBe(25);
      expect(pd[0][1]).toBe(75);
    });
  });

  describe("as a Group", () => {
    it("reads its bound and radius back", () => {
      const pd = new PoissonDisk().setup(bound(10, 20, 110, 220), 7);
      expect(pd.radius).toBe(7);
      const b = pd.bound;
      expect(b).toBeInstanceOf(Bound);
      expect([b.x, b.y, b.width, b.height]).toEqual([10, 20, 100, 200]);
      expect(pd.bound).not.toBe(b);
    });

    it("supports Group methods without touching the sampler", () => {
      Num.seed("poisson-group");
      const pd = Create.sampling(bound(0, 0, 100, 100), 10);
      const moved = pd.map((p) => p.$add(1000, 0));
      expect(moved).toBeInstanceOf(PoissonDisk);
      expect(moved.length).toBe(pd.length);
      expect(moved[0][0]).toBe(Math.fround(pd[0][0] + 1000));
      expect(pd.done).toBe(true);
      expect(new PoissonDisk().done).toBe(true);
      expect(new PoissonDisk().step()).toBeUndefined();
    });
  });
});

describe("PoissonDisk setup edge cases", () => {
  it("fills the intended region when the bound's corners are given in the other order", () => {
    Num.seed("reversed");
    const pd = Create.sampling(new Bound(new Pt(20, 20), new Pt(0, 0)), 3);
    expect(pd.length).toBeGreaterThan(10);
    for (const p of pd) {
      expect(p[0]).toBeGreaterThanOrEqual(0);
      expect(p[0]).toBeLessThan(20);
      expect(p[1]).toBeGreaterThanOrEqual(0);
      expect(p[1]).toBeLessThan(20);
    }
  });

  it("rejects a start on the far edge (the bound is half-open) and accepts one on the near edge", () => {
    expect(() =>
      new PoissonDisk().setup(bound(0, 0, 100, 100), 10, { start: [100, 50] }),
    ).toThrow(/start/);
    const pd = new PoissonDisk().setup(bound(0, 0, 100, 100), 10, {
      start: [0, 50],
    });
    expect(pd[0].equals(new Pt(0, 50))).toBe(true);
  });

  it("a species-derived copy reports no setup until setup is called on it", () => {
    Num.seed("species");
    const pd = Create.sampling(bound(0, 0, 60, 60), 6);
    const copy = pd.filter((p) => p[0] < 30) as PoissonDisk;
    expect(copy).toBeInstanceOf(PoissonDisk);
    expect(copy.radius).toBe(0);
    expect(copy.done).toBe(true);
    expect(copy.step()).toBeUndefined();
    copy.setup(bound(0, 0, 60, 60), 6);
    expect(copy.done).toBe(false);
    copy.sample();
    expect(copy.done).toBe(true);
    expect(copy.length).toBeGreaterThan(10);
  });
});
