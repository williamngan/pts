/**
 * `Num`, `Geom`, `Shaping` and `Range`.
 *
 * The `Geom` transforms are the per-frame workhorses — `Group.rotate2D` and
 * friends all funnel into them — so they are measured over a full workload of
 * points rather than one at a time.
 *
 * Every `Shaping` curve gets its own case. They are individually cheap, but a
 * sketch may call one of them tens of thousands of times a frame, and knowing
 * which are expensive is the point of the exercise.
 */

import { SIZES } from "../lib/fixtures.mjs";
import { numbersFor } from "../lib/random.mjs";
import { sink } from "../lib/sink.mjs";
import { defineSuite } from "../lib/suite.mjs";

const N = SIZES.M;

export default defineSuite("num", (b, { Pts, fx }) => {
  const { Num, Geom, Shaping, Range, Pt, Const } = Pts;

  // ------------------------------------------------------------------- Num

  const scalars = [
    ["lerp", (v) => Num.lerp(0, 10, v)],
    ["clamp", (v) => Num.clamp(v, 0.2, 0.8)],
    ["boundValue", (v) => Num.boundValue(v * 720, 0, 360)],
    ["within", (v) => (Num.within(v, 0.2, 0.8) ? 1 : 0)],
    ["normalizeValue", (v) => Num.normalizeValue(v, 0, 2)],
    ["cycle", (v) => Num.cycle(v)],
    ["mapToRange", (v) => Num.mapToRange(v, 0, 1, 0, 255)],
  ];

  for (const [name, apply] of scalars) {
    b.case(`Num.${name}`, {
      batch: N,
      setupOnce: () => Float64Array.from(numbersFor(`num:${name}`, N, 0, 1)),
      run: (values) => {
        let acc = 0;
        for (let i = 0; i < N; i++) acc += apply(values[i]);
        sink(acc);
      },
    });
  }

  // Half the pairs are equal, so both branches are exercised.
  b.case("Num.equals", {
    batch: N,
    setupOnce: () => {
      const values = numbersFor("num:equals", N, 0, 1);
      return {
        values,
        others: values.map((v, i) => (i % 2 === 0 ? v : v + 1)),
      };
    },
    run: ({ values, others }) => {
      let acc = 0;
      for (let i = 0; i < N; i++)
        acc += Num.equals(values[i], others[i]) ? 1 : 0;
      sink(acc);
    },
  });

  b.case("Num.random (seeded)", {
    batch: N,
    setupOnce: () => Num.seed("pts-bench"),
    run: () => {
      let acc = 0;
      for (let i = 0; i < N; i++) acc += Num.random();
      sink(acc);
    },
  });

  b.case("Num.randomPt", {
    batch: N,
    setupOnce: () => ({ a: new Pt(0, 0), b: new Pt(100, 100) }),
    run: ({ a, b: upper }) => {
      let acc = 0;
      for (let i = 0; i < N; i++) acc += Num.randomPt(a, upper)[0];
      sink(acc);
    },
  });

  b.case("Num.sum", {
    batch: N,
    setupOnce: () => fx.group("num:sum", N),
    run: (g) => {
      sink(Num.sum(g)[0]);
    },
  });

  b.case("Num.average", {
    batch: N,
    setupOnce: () => fx.group("num:average", N),
    run: (g) => {
      sink(Num.average(g)[0]);
    },
  });

  // ------------------------------------------------------------------ Geom

  const angles = [
    ["boundAngle", (v) => Geom.boundAngle(v * 720)],
    ["boundRadian", (v) => Geom.boundRadian(v * 12)],
    ["toRadian", (v) => Geom.toRadian(v * 360)],
    ["toDegree", (v) => Geom.toDegree(v * 6)],
  ];

  for (const [name, apply] of angles) {
    b.case(`Geom.${name}`, {
      batch: N,
      setupOnce: () => Float64Array.from(numbersFor(`geom:${name}`, N, 0, 1)),
      run: (values) => {
        let acc = 0;
        for (let i = 0; i < N; i++) acc += apply(values[i]);
        sink(acc);
      },
    });
  }

  b.case("Geom.boundingBox", {
    batch: N,
    setupOnce: () => fx.group("geom:boundingBox", N),
    run: (g) => {
      sink(Geom.boundingBox(g)[0][0]);
    },
  });

  b.case("Geom.centroid", {
    batch: N,
    setupOnce: () => fx.group("geom:centroid", N),
    run: (g) => {
      sink(Geom.centroid(g)[0]);
    },
  });

  b.case("Geom.interpolate", {
    batch: N,
    setupOnce: () => ({
      a: fx.pts("geom:interpolate:a", N),
      b: fx.pts("geom:interpolate:b", N),
    }),
    run: ({ a, b: other }) => {
      let acc = 0;
      for (let i = 0; i < N; i++)
        acc += Geom.interpolate(a[i], other[i], 0.4)[0];
      sink(acc);
    },
  });

  b.case("Geom.perpendicular", {
    batch: N,
    setupOnce: () => fx.pts("geom:perpendicular", N),
    run: (pts) => {
      let acc = 0;
      for (let i = 0; i < N; i++) acc += Geom.perpendicular(pts[i])[0][0];
      sink(acc);
    },
  });

  b.case("Geom.withinBound", {
    batch: N,
    setupOnce: () => fx.pts("geom:withinBound", N),
    run: (pts) => {
      let acc = 0;
      for (let i = 0; i < N; i++) {
        acc += Geom.withinBound(pts[i], [-50, -50], [50, 50]) ? 1 : 0;
      }
      sink(acc);
    },
  });

  // Half the pairs really are perpendicular, so the case is not just measuring
  // the rejection path.
  b.case("Geom.isPerpendicular", {
    batch: N,
    setupOnce: () => {
      const a = fx.pts("geom:isPerpendicular:a", N);
      const random = fx.pts("geom:isPerpendicular:b", N);
      const b = a.map((p, i) =>
        i % 2 === 0 ? new Pt(-p[1], p[0]) : random[i],
      );
      return { a, b };
    },
    run: ({ a, b: other }) => {
      let acc = 0;
      for (let i = 0; i < N; i++) {
        acc += Geom.isPerpendicular(a[i], other[i]) ? 1 : 0;
      }
      sink(acc);
    },
  });

  b.case("Geom.sortEdges", {
    batch: SIZES.S,
    setupOnce: () => fx.restorable(fx.group("geom:sortEdges", SIZES.S)),
    setup: (shared) => shared.reset(),
    run: (g) => {
      sink(Geom.sortEdges(g)[0][0]);
    },
  });

  const transforms = [
    ["scale", (pts) => Geom.scale(pts, 1.001, [0, 0])],
    ["rotate2D", (pts) => Geom.rotate2D(pts, 0.01, [0, 0])],
    ["shear2D", (pts) => Geom.shear2D(pts, 0.001, [0, 0])],
  ];

  for (const [name, apply] of transforms) {
    b.case(`Geom.${name}`, {
      batch: N,
      setupOnce: () => fx.restorable(fx.group(`geom:${name}`, N)),
      setup: (shared) => shared.reset(),
      run: (g) => {
        apply(g);
        sink(g[0][0]);
      },
    });
  }

  b.case("Geom.reflect2D", {
    batch: N,
    setupOnce: () => ({
      restorable: fx.restorable(fx.group("geom:reflect2D", N)),
      line: fx.group("geom:reflect2D:line", 2),
    }),
    setup: (shared) => ({ g: shared.restorable.reset(), line: shared.line }),
    run: ({ g, line }) => {
      Geom.reflect2D(g, line);
      sink(g[0][0]);
    },
  });

  b.case("Geom.anchor", {
    batch: N,
    setupOnce: () => fx.restorable(fx.group("geom:anchor", N)),
    setup: (shared) => shared.reset(),
    run: (g) => {
      Geom.anchor(g, 0, "to");
      sink(g[1][0] + 1);
    },
  });

  b.case("Geom.cosTable", {
    batch: 360,
    run: () => {
      sink(Geom.cosTable().table[0] + 1);
    },
  });

  // --------------------------------------------------------------- Shaping

  const shapingNames = Object.getOwnPropertyNames(Shaping)
    .filter(
      (key) =>
        typeof Shaping[key] === "function" &&
        !["length", "name", "prototype", "step"].includes(key),
    )
    .sort();

  for (const name of shapingNames) {
    b.case(`Shaping.${name}`, {
      batch: N,
      setupOnce: () => Float64Array.from(numbersFor("shaping", N, 0, 1)),
      run: (values) => {
        let acc = 0;
        for (let i = 0; i < N; i++) acc += Shaping[name](values[i], 1);
        sink(acc);
      },
    });
  }

  b.case("Shaping.step", {
    batch: N,
    setupOnce: () => Float64Array.from(numbersFor("shaping", N, 0, 1)),
    run: (values) => {
      let acc = 0;
      for (let i = 0; i < N; i++) {
        acc += Shaping.step(Shaping.quadraticInOut, 10, values[i], 1);
      }
      sink(acc);
    },
  });

  // ----------------------------------------------------------------- Range

  b.case("new Range", {
    batch: N,
    setupOnce: () => fx.group("range:new", N),
    run: (g) => {
      sink(new Range(g).max[0]);
    },
  });

  b.case("Range.mapTo", {
    batch: N,
    setupOnce: () => new Range(fx.group("range:mapTo", N)),
    run: (range) => {
      sink(range.mapTo(0, 100)[0][0]);
    },
  });

  b.case("Range.ticks", {
    batch: SIZES.S,
    setupOnce: () => new Range(fx.group("range:ticks", N)),
    run: (range) => {
      sink(range.ticks(SIZES.S)[0][0]);
    },
  });

  b.case("Range.append", {
    batch: SIZES.S,
    setupOnce: () => ({
      source: fx.group("range:append:source", N),
      extra: fx.group("range:append:extra", SIZES.S),
    }),
    setup: (shared) => ({
      range: new Range(shared.source),
      extra: shared.extra,
    }),
    run: ({ range, extra }) => {
      sink(range.append(extra).max[0]);
    },
  });

  // `Const` is used by callers as an axis argument; keep a reference so the
  // suite fails loudly if the export is ever dropped.
  if (!Const.xy) throw new Error("Const.xy is missing");
});
