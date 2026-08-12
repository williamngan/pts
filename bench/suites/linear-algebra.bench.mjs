/**
 * `Vec` and `Mat`.
 *
 * `Vec` mutates its first argument, so those cases restore plain arrays in
 * `setup`. `Mat.transform2D` and the 2D matrix builders sit underneath every
 * `Geom` transform, which makes them some of the hottest code in the library.
 */

import { SIZES } from "../lib/fixtures.mjs";
import { sink } from "../lib/sink.mjs";
import { defineSuite } from "../lib/suite.mjs";

const N = SIZES.M;
const MATRIX = 32;

export default defineSuite("linear-algebra", (b, { Pts, fx }) => {
  const { Vec, Mat, Pt, Group } = Pts;

  // --------------------------------------------------------- Vec, in place

  const mutating = [
    ["add(scalar)", (a) => Vec.add(a, 1.5)],
    ["add(vector)", (a, other) => Vec.add(a, other)],
    ["subtract(vector)", (a, other) => Vec.subtract(a, other)],
    ["multiply(scalar)", (a) => Vec.multiply(a, 1.001)],
    ["divide(scalar)", (a) => Vec.divide(a, 1.001)],
    ["abs", (a) => Vec.abs(a)],
    ["floor", (a) => Vec.floor(a)],
    ["round", (a) => Vec.round(a)],
    ["unit", (a) => Vec.unit(a)],
  ];

  for (const [name, apply] of mutating) {
    // plain arrays and Pts take different paths through the same loops
    for (const [kind, makeSource] of [
      ["array", (label) => fx.restorableArrays(fx.ptLikes(label, N))],
      ["Pt", (label) => fx.restorable(fx.pts(label, N))],
    ]) {
      b.case(`Vec.${name} (${kind})`, {
        batch: N,
        setupOnce: () => ({
          restorable: makeSource(`vec:${name}:${kind}`),
          other: kind === "Pt" ? new Pt(0.5, 0.25) : [0.5, 0.25],
        }),
        setup: (shared) => ({
          values: shared.restorable.reset(),
          other: shared.other,
        }),
        run: ({ values, other }) => {
          let acc = 0;
          for (let i = 0; i < N; i++) acc += apply(values[i], other)[0];
          sink(acc);
        },
      });
    }
  }

  // ------------------------------------------------------- Vec, read only

  const readOnly = [
    ["dot", (a, other) => Vec.dot(a, other)],
    ["cross2D", (a, other) => Vec.cross2D(a, other)],
    ["magnitude", (a) => Vec.magnitude(a)],
    ["sum", (a) => Vec.sum(a)],
    ["max", (a) => Vec.max(a).value],
    ["min", (a) => Vec.min(a).value],
  ];

  for (const [name, apply] of readOnly) {
    b.case(`Vec.${name}`, {
      batch: N,
      setupOnce: () => ({
        values: fx.ptLikes(`vec:${name}`, N),
        other: [0.5, 0.25],
      }),
      run: ({ values, other }) => {
        let acc = 0;
        for (let i = 0; i < N; i++) acc += apply(values[i], other);
        sink(acc);
      },
    });
  }

  b.case("Vec.cross (3D)", {
    batch: N,
    setupOnce: () => ({
      values: fx.ptLikes("vec:cross", N, 3),
      other: [0.5, 0.25, 0.75],
    }),
    run: ({ values, other }) => {
      let acc = 0;
      for (let i = 0; i < N; i++) acc += Vec.cross(values[i], other)[0];
      sink(acc);
    },
  });

  b.case("Vec.map", {
    batch: N,
    setupOnce: () => fx.restorableArrays(fx.ptLikes("vec:map", N)),
    setup: (shared) => shared.reset(),
    run: (values) => {
      let acc = 0;
      for (let i = 0; i < N; i++) acc += Vec.map(values[i], (n) => n * 2)[0];
      sink(acc);
    },
  });

  // ---------------------------------------------------------------- Mat 2D

  b.case("Mat.transform2D", {
    batch: N,
    setupOnce: () => ({
      pts: fx.pts("mat:transform2D", N),
      matrix: Mat.rotateAt2DMatrix(Math.cos(0.4), Math.sin(0.4), [10, 10]),
    }),
    run: ({ pts, matrix }) => {
      let acc = 0;
      for (let i = 0; i < N; i++) acc += Mat.transform2D(pts[i], matrix)[0];
      sink(acc);
    },
  });

  const builders = [
    ["scale2DMatrix", () => Mat.scale2DMatrix(1.5, 2)],
    ["rotate2DMatrix", () => Mat.rotate2DMatrix(0.8, 0.6)],
    ["shear2DMatrix", () => Mat.shear2DMatrix(0.2, 0.3)],
    ["translate2DMatrix", () => Mat.translate2DMatrix(5, 7)],
    ["scaleAt2DMatrix", () => Mat.scaleAt2DMatrix(1.5, 2, [10, 10])],
    ["rotateAt2DMatrix", () => Mat.rotateAt2DMatrix(0.8, 0.6, [10, 10])],
    ["shearAt2DMatrix", () => Mat.shearAt2DMatrix(0.2, 0.3, [10, 10])],
  ];

  for (const [name, apply] of builders) {
    b.case(`Mat.${name}`, {
      batch: SIZES.S,
      run: () => {
        let acc = 0;
        for (let i = 0; i < SIZES.S; i++) acc += apply()[0][0];
        sink(acc);
      },
    });
  }

  b.case("Mat.reflectAt2DMatrix", {
    batch: SIZES.S,
    setupOnce: () => fx.group("mat:reflect", 2),
    run: (line) => {
      let acc = 0;
      for (let i = 0; i < SIZES.S; i++) {
        acc += Mat.reflectAt2DMatrix(line[0], line[1])[0][0];
      }
      sink(acc);
    },
  });

  // ------------------------------------------------------------ Mat, bulk

  b.case("Mat.multiply (3x3 chain)", {
    batch: SIZES.S,
    setupOnce: () => ({
      a: Mat.rotate2DMatrix(0.8, 0.6),
      b: Mat.scale2DMatrix(1.5, 2),
    }),
    run: ({ a, b: other }) => {
      let acc = 0;
      for (let i = 0; i < SIZES.S; i++) acc += Mat.multiply(a, other)[0][0];
      sink(acc);
    },
  });

  b.case(`Mat.multiply (${MATRIX}x${MATRIX})`, {
    batch: MATRIX * MATRIX,
    setupOnce: () => ({
      a: fx.matrix("mat:mul:a", MATRIX, MATRIX),
      b: fx.matrix("mat:mul:b", MATRIX, MATRIX),
    }),
    run: ({ a, b: other }) => {
      sink(Mat.multiply(a, other)[0][0]);
    },
  });

  b.case(`Mat.multiply (${MATRIX}x${MATRIX}, elementwise)`, {
    batch: MATRIX * MATRIX,
    setupOnce: () => ({
      a: fx.matrix("mat:mul:ew:a", MATRIX, MATRIX),
      b: fx.matrix("mat:mul:ew:b", MATRIX, MATRIX),
    }),
    run: ({ a, b: other }) => {
      sink(Mat.multiply(a, other, false, true)[0][0]);
    },
  });

  b.case(`Mat.add (${MATRIX}x${MATRIX})`, {
    batch: MATRIX * MATRIX,
    setupOnce: () => ({
      a: fx.matrix("mat:add:a", MATRIX, MATRIX),
      b: fx.matrix("mat:add:b", MATRIX, MATRIX),
    }),
    run: ({ a, b: other }) => {
      sink(Mat.add(a, other)[0][0]);
    },
  });

  b.case(`Mat.transpose (${MATRIX}x${MATRIX})`, {
    batch: MATRIX * MATRIX,
    setupOnce: () => fx.matrix("mat:transpose", MATRIX, MATRIX),
    run: (m) => {
      sink(Mat.transpose(m)[0][0]);
    },
  });

  b.case("Mat.zip", {
    batch: N,
    setupOnce: () => fx.group("mat:zip", N),
    run: (g) => {
      sink(Mat.zip(g)[0][0]);
    },
  });

  b.case("Mat.zipSlice", {
    batch: N,
    setupOnce: () => fx.group("mat:zipSlice", N),
    run: (g) => {
      sink(Mat.zipSlice(g, 1)[0]);
    },
  });

  // ------------------------------------------------- Mat instance chaining

  b.case("Mat instance transform chain", {
    batch: SIZES.S,
    run: () => {
      let acc = 0;
      for (let i = 0; i < SIZES.S; i++) {
        const m = new Mat();
        m.translate2D([5, 5]).rotate2D(0.3).scale2D([1.5, 1.5]);
        acc += m.value[0][0];
      }
      sink(acc);
    },
  });

  b.case("Group.$matrixMultiply", {
    batch: MATRIX * MATRIX,
    setupOnce: () => ({
      a: Group.fromPtArray(fx.matrix("mat:group:a", MATRIX, MATRIX)),
      b: fx.matrix("mat:group:b", MATRIX, MATRIX),
    }),
    run: ({ a, b: other }) => {
      sink(a.$matrixMultiply(other)[0][0]);
    },
  });
});
