/**
 * `Pt`, `Group` and `Bound`.
 *
 * These are the library's foundation: almost every other module allocates Pts
 * and iterates Groups, so a change here moves everything.
 *
 * Mutating cases restore their fixtures in `setup`, which tinybench runs
 * untimed. Non-mutating cases build once in `setupOnce`.
 */

import { SIZES } from "../lib/fixtures.mjs";
import { sink } from "../lib/sink.mjs";
import { defineSuite } from "../lib/suite.mjs";

const N = SIZES.M;

export default defineSuite("pt", (b, { Pts, fx }) => {
  const { Pt, Group, Bound, Const } = Pts;

  // ---------------------------------------------------------------- creation

  b.case("new Pt(x, y)", {
    batch: N,
    run: () => {
      let acc = 0;
      for (let i = 0; i < N; i++) acc += new Pt(i, i + 1)[0];
      sink(acc);
    },
  });

  b.case("new Pt(array)", {
    batch: N,
    setupOnce: () => fx.ptLikes("pt:new-array", N),
    run: (source) => {
      let acc = 0;
      for (let i = 0; i < N; i++) acc += new Pt(source[i])[0];
      sink(acc);
    },
  });

  b.case("new Pt(object)", {
    batch: N,
    setupOnce: () => fx.ptLikes("pt:new-object", N).map(([x, y]) => ({ x, y })),
    run: (source) => {
      let acc = 0;
      for (let i = 0; i < N; i++) acc += new Pt(source[i])[0];
      sink(acc);
    },
  });

  b.case("new Pt(pt)", {
    batch: N,
    setupOnce: () => fx.pts("pt:new-pt", N),
    run: (source) => {
      let acc = 0;
      for (let i = 0; i < N; i++) acc += new Pt(source[i])[0];
      sink(acc);
    },
  });

  b.case("Pt.make(dim)", {
    batch: N,
    run: () => {
      let acc = 0;
      for (let i = 0; i < N; i++) acc += Pt.make(3, 1)[0];
      sink(acc);
    },
  });

  b.case("Pt.clone", {
    batch: N,
    setupOnce: () => fx.pts("pt:clone", N),
    run: (source) => {
      let acc = 0;
      for (let i = 0; i < N; i++) acc += source[i].clone()[0];
      sink(acc);
    },
  });

  // -------------------------------------------------------------- arithmetic

  const mutatingArgForms = [
    ["add(scalar)", (p) => p.add(1.5)],
    ["add(x, y)", (p) => p.add(1.5, 2.5)],
    ["add(array)", (p) => p.add([1.5, 2.5])],
    ["subtract(pt)", (p, other) => p.subtract(other)],
    ["multiply(scalar)", (p) => p.multiply(1.001)],
    ["divide(scalar)", (p) => p.divide(1.001)],
  ];

  for (const [name, apply] of mutatingArgForms) {
    b.case(`Pt.${name}`, {
      batch: N,
      setupOnce: () => ({
        restorable: fx.restorable(fx.pts(`pt:${name}`, N)),
        other: new Pt(0.5, 0.25),
      }),
      setup: (shared) => ({
        pts: shared.restorable.reset(),
        other: shared.other,
      }),
      run: (state) => {
        let acc = 0;
        const { pts, other } = state;
        for (let i = 0; i < N; i++) acc += apply(pts[i], other)[0];
        sink(acc);
      },
    });
  }

  b.case("Pt.$add(pt) (allocating)", {
    batch: N,
    setupOnce: () => ({
      pts: fx.pts("pt:$add", N),
      other: new Pt(0.5, 0.25),
    }),
    run: ({ pts, other }) => {
      let acc = 0;
      for (let i = 0; i < N; i++) acc += pts[i].$add(other)[0];
      sink(acc);
    },
  });

  b.case("Pt.$multiply(scalar) (allocating)", {
    batch: N,
    setupOnce: () => fx.pts("pt:$multiply", N),
    run: (pts) => {
      let acc = 0;
      for (let i = 0; i < N; i++) acc += pts[i].$multiply(1.5)[0];
      sink(acc);
    },
  });

  // ------------------------------------------------------------------ vector

  const readOnly = [
    ["magnitude", (p) => p.magnitude()],
    ["magnitudeSq", (p) => p.magnitudeSq()],
    ["dot(pt)", (p, other) => p.dot(other)],
    ["$cross2D(pt)", (p, other) => p.$cross2D(other)],
    ["angle", (p) => p.angle()],
    ["angleBetween(pt)", (p, other) => p.angleBetween(other)],
    ["projectScalar(pt)", (p, other) => p.projectScalar(other)],
  ];

  for (const [name, apply] of readOnly) {
    b.case(`Pt.${name}`, {
      batch: N,
      setupOnce: () => ({
        pts: fx.pts(`pt:${name}`, N),
        other: new Pt(3, 4),
      }),
      run: ({ pts, other }) => {
        let acc = 0;
        for (let i = 0; i < N; i++) acc += apply(pts[i], other);
        sink(acc);
      },
    });
  }

  const allocating = [
    ["$unit", (p) => p.$unit()],
    ["$abs", (p) => p.$abs()],
    ["$floor", (p) => p.$floor()],
    ["$round", (p) => p.$round()],
    ["$project(pt)", (p, other) => p.$project(other)],
    ["$take('xy')", (p) => p.$take(Const.xy)],
    ["$concat(pt)", (p, other) => p.$concat(other)],
  ];

  for (const [name, apply] of allocating) {
    b.case(`Pt.${name}`, {
      batch: N,
      setupOnce: () => ({
        pts: fx.pts(`pt:${name}`, N),
        other: new Pt(3, 4),
      }),
      run: ({ pts, other }) => {
        let acc = 0;
        for (let i = 0; i < N; i++) acc += apply(pts[i], other)[0];
        sink(acc);
      },
    });
  }

  // Half the comparisons match, so both the early-exit and full-scan paths are
  // measured rather than only the first mismatch.
  b.case("Pt.equals(pt)", {
    batch: N,
    setupOnce: () => {
      const pts = fx.pts("pt:equals", N);
      const others = pts.map((p, i) =>
        i % 2 === 0 ? p.clone() : new Pt(3, 4),
      );
      return { pts, others };
    },
    run: ({ pts, others }) => {
      let acc = 0;
      for (let i = 0; i < N; i++) acc += pts[i].equals(others[i]) ? 1 : 0;
      sink(acc);
    },
  });

  b.case("Pt.unit (in place)", {
    batch: N,
    setupOnce: () => fx.restorable(fx.pts("pt:unit", N)),
    setup: (shared) => shared.reset(),
    run: (pts) => {
      let acc = 0;
      for (let i = 0; i < N; i++) acc += pts[i].unit()[0];
      sink(acc);
    },
  });

  b.case("Pt.scale(scalar)", {
    batch: N,
    setupOnce: () => fx.restorable(fx.pts("pt:scale", N)),
    setup: (shared) => shared.reset(),
    run: (pts) => {
      let acc = 0;
      for (let i = 0; i < N; i++) {
        pts[i].scale(1.01);
        acc += pts[i][0];
      }
      sink(acc);
    },
  });

  b.case("Pt.toAngle", {
    batch: N,
    setupOnce: () => fx.restorable(fx.pts("pt:toAngle", N)),
    setup: (shared) => shared.reset(),
    run: (pts) => {
      let acc = 0;
      for (let i = 0; i < N; i++) acc += pts[i].toAngle(0.5, 10)[0];
      sink(acc);
    },
  });

  // -------------------------------------------------------------- conversion

  b.case("Pt.toString", {
    batch: SIZES.S,
    setupOnce: () => fx.pts("pt:toString", SIZES.S),
    run: (pts) => {
      let acc = 0;
      for (let i = 0; i < SIZES.S; i++) acc += pts[i].toString().length;
      sink(acc);
    },
  });

  b.case("Pt.toArray", {
    batch: N,
    setupOnce: () => fx.pts("pt:toArray", N),
    run: (pts) => {
      let acc = 0;
      for (let i = 0; i < N; i++) acc += pts[i].toArray()[0];
      sink(acc);
    },
  });

  // --------------------------------------------------------- functional form

  b.case("Pt.op then call", {
    batch: SIZES.S,
    setupOnce: () => fx.pts("pt:op", SIZES.S),
    run: (pts) => {
      let acc = 0;
      for (let i = 0; i < SIZES.S; i++) {
        const add = pts[i].op((a, bb) => a[0] + bb);
        acc += add(2);
      }
      sink(acc);
    },
  });

  // ------------------------------------------------------------------- Group

  b.case("Group.fromArray", {
    batch: N,
    setupOnce: () => fx.ptLikes("group:fromArray", N),
    run: (source) => {
      sink(Group.fromArray(source).length);
    },
  });

  b.case("Group.fromPtArray", {
    batch: N,
    setupOnce: () => fx.pts("group:fromPtArray", N),
    run: (source) => {
      sink(Group.fromPtArray(source).length);
    },
  });

  b.case("Group.clone", {
    batch: N,
    setupOnce: () => fx.group("group:clone", N),
    run: (g) => {
      sink(g.clone()[0][0]);
    },
  });

  b.case("Group.centroid", {
    batch: N,
    setupOnce: () => fx.group("group:centroid", N),
    run: (g) => {
      sink(g.centroid()[0]);
    },
  });

  b.case("Group.boundingBox", {
    batch: N,
    setupOnce: () => fx.group("group:boundingBox", N),
    run: (g) => {
      sink(g.boundingBox()[0][0]);
    },
  });

  b.case("Group.interpolate", {
    batch: SIZES.S,
    setupOnce: () => fx.group("group:interpolate", SIZES.M),
    run: (g) => {
      let acc = 0;
      for (let i = 0; i < SIZES.S; i++) acc += g.interpolate(i / SIZES.S)[0];
      sink(acc);
    },
  });

  b.case("Group.segments", {
    batch: N,
    setupOnce: () => fx.group("group:segments", N),
    run: (g) => {
      sink(g.segments(2, 1).length);
    },
  });

  b.case("Group.lines", {
    batch: N,
    setupOnce: () => fx.group("group:lines", N),
    run: (g) => {
      sink(g.lines().length);
    },
  });

  b.case("Group.zipSlice", {
    batch: N,
    setupOnce: () => fx.group("group:zipSlice", N),
    run: (g) => {
      sink(g.zipSlice(1)[0]);
    },
  });

  b.case("Group.$zip", {
    batch: N,
    setupOnce: () => fx.group("group:zip", N),
    run: (g) => {
      sink(g.$zip()[0][0]);
    },
  });

  b.case("Group.sortByDimension", {
    batch: N,
    setupOnce: () => fx.restorable(fx.group("group:sort", N)),
    setup: (shared) => shared.reset(),
    run: (g) => {
      sink(g.sortByDimension(0)[0][0]);
    },
  });

  const groupTransforms = [
    ["add(pt)", (g, other) => g.add(other)],
    ["moveTo(pt)", (g, other) => g.moveTo(other)],
    ["scale(scalar)", (g) => g.scale(1.001)],
    ["rotate2D", (g) => g.rotate2D(0.01)],
    ["shear2D", (g) => g.shear2D(0.001)],
  ];

  for (const [name, apply] of groupTransforms) {
    b.case(`Group.${name}`, {
      batch: N,
      setupOnce: () => ({
        restorable: fx.restorable(fx.group(`group:${name}`, N)),
        other: new Pt(0.5, 0.25),
      }),
      setup: (shared) => ({
        g: shared.restorable.reset(),
        other: shared.other,
      }),
      run: ({ g, other }) => {
        sink(apply(g, other)[0][0]);
      },
    });
  }

  b.case("Group.reflect2D", {
    batch: N,
    setupOnce: () => ({
      restorable: fx.restorable(fx.group("group:reflect2D", N)),
      line: fx.group("group:reflect2D:line", 2),
    }),
    setup: (shared) => ({ g: shared.restorable.reset(), line: shared.line }),
    run: ({ g, line }) => {
      sink(g.reflect2D(line)[0][0]);
    },
  });

  b.case("Group.forEachPt('unit')", {
    batch: N,
    setupOnce: () => fx.restorable(fx.group("group:forEachPt", N)),
    setup: (shared) => shared.reset(),
    run: (g) => {
      sink(g.forEachPt("unit")[0][0]);
    },
  });

  // ------------------------------------------------------------------- Bound

  b.case("Bound.fromGroup", {
    batch: SIZES.S,
    setupOnce: () => fx.groups("bound:fromGroup", SIZES.S, 2),
    run: (gs) => {
      let acc = 0;
      for (let i = 0; i < SIZES.S; i++) acc += Bound.fromGroup(gs[i]).width;
      sink(acc);
    },
  });

  b.case("Bound accessors", {
    batch: SIZES.S,
    setupOnce: () => fx.bound(),
    run: (bound) => {
      let acc = 0;
      for (let i = 0; i < SIZES.S; i++) {
        acc += bound.center[0] + bound.size[1] + bound.topLeft[0];
      }
      sink(acc);
    },
  });

  b.case("Bound.clone", {
    batch: SIZES.S,
    setupOnce: () => fx.bound(),
    run: (bound) => {
      let acc = 0;
      for (let i = 0; i < SIZES.S; i++) acc += bound.clone().width;
      sink(acc);
    },
  });
});
