/**
 * `Util` and the seeded random generator.
 *
 * `Util.getArgs` is the single most-called function in the library — every
 * variadic `Pt` constructor and every variadic op runs through it, and it
 * branches on argument shape. The per-shape cases below are what make that cost
 * visible.
 */

import { SIZES } from "../lib/fixtures.mjs";
import { numbersFor } from "../lib/random.mjs";
import { sink } from "../lib/sink.mjs";
import { defineSuite } from "../lib/suite.mjs";

const N = SIZES.M;

export default defineSuite("util", (b, { Pts, fx }) => {
  const { Util, Pt, Group, Num } = Pts;

  // ---------------------------------------------------------------- getArgs

  const argShapes = [
    ["numbers", (source, i) => [source.numbers[i], source.numbers[i] + 1]],
    ["array", (source, i) => [source.arrays[i]]],
    ["Pt", (source, i) => [source.pts[i]]],
    ["object", (source, i) => [source.objects[i]]],
  ];

  for (const [shape, makeArgs] of argShapes) {
    b.case(`Util.getArgs (${shape})`, {
      batch: N,
      setupOnce: () => ({
        numbers: numbersFor("util:getArgs", N, -100, 100),
        arrays: fx.ptLikes("util:getArgs:array", N),
        pts: fx.pts("util:getArgs:pt", N),
        objects: fx.ptLikes("util:getArgs:obj", N).map(([x, y]) => ({ x, y })),
      }),
      run: (source) => {
        let acc = 0;
        for (let i = 0; i < N; i++) acc += Util.getArgs(makeArgs(source, i))[0];
        sink(acc);
      },
    });
  }

  // ---------------------------------------------------------- collections

  b.case("Util.split", {
    batch: N,
    setupOnce: () => fx.group("util:split", N),
    run: (g) => {
      sink(Util.split(g, 4, 2).length);
    },
  });

  b.case("Util.flatten", {
    batch: N,
    setupOnce: () => fx.groups("util:flatten", SIZES.S, 8),
    run: (gs) => {
      sink(Util.flatten(gs).length);
    },
  });

  b.case("Util.combine", {
    batch: SIZES.S * SIZES.S,
    setupOnce: () => ({
      a: numbersFor("util:combine:a", SIZES.S),
      b: numbersFor("util:combine:b", SIZES.S),
    }),
    run: ({ a, b: other }) => {
      sink(Util.combine(a, other, (x, y) => x + y).length);
    },
  });

  b.case("Util.zip", {
    batch: N,
    setupOnce: () => [
      numbersFor("util:zip:a", N),
      numbersFor("util:zip:b", N),
      numbersFor("util:zip:c", N),
    ],
    run: (arrays) => {
      sink(Util.zip(arrays).length);
    },
  });

  // An array argument is returned untouched, which is O(1) and not worth
  // measuring per item. The path that costs is a non-array iterable, which is
  // what every generator-fed Pts call hits.
  b.case("Util.iterToArray (array)", {
    batch: 1,
    setupOnce: () => fx.group("util:iterToArray", N),
    run: (g) => {
      sink(Util.iterToArray(g).length);
    },
  });

  b.case("Util.iterToArray (iterable)", {
    batch: N,
    setupOnce: () => new Set(fx.pts("util:iterToArray:set", N)),
    run: (set) => {
      sink(Util.iterToArray(set).length);
    },
  });

  b.case("Util.arrayCheck", {
    batch: N,
    setupOnce: () => fx.groups("util:arrayCheck", N, 4),
    run: (gs) => {
      let acc = 0;
      for (let i = 0; i < N; i++) acc += Util.arrayCheck(gs[i]) ? 1 : 0;
      sink(acc);
    },
  });

  b.case("Util.forRange", {
    batch: N,
    run: () => {
      sink(Util.forRange((i) => new Pt(i, i), N).length);
    },
  });

  b.case("Util.stepper", {
    batch: N,
    run: () => {
      const step = Util.stepper(N);
      let acc = 0;
      for (let i = 0; i < N; i++) acc += step();
      sink(acc);
    },
  });

  // -------------------------------------------------------------- identity

  b.case("Util.uniqueId", {
    batch: SIZES.S,
    run: () => {
      let acc = 0;
      for (let i = 0; i < SIZES.S; i++) acc += Util.uniqueId().length;
      sink(acc);
    },
  });

  b.case("Util.randomInt", {
    batch: N,
    setupOnce: () => Num.seed("pts-bench-util"),
    run: () => {
      let acc = 0;
      for (let i = 0; i < N; i++) acc += Util.randomInt(100);
      sink(acc);
    },
  });

  // ---------------------------------------------------------------- uheprng

  b.case("Num.seed then draw", {
    batch: SIZES.S,
    run: () => {
      let acc = 0;
      for (let i = 0; i < SIZES.S; i++) {
        Num.seed(`bench-${i}`);
        acc += Num.random();
      }
      sink(acc);
    },
  });

  b.case("Group.fromArray via Util paths", {
    batch: N,
    setupOnce: () => fx.ptLikes("util:groupFromArray", N),
    run: (source) => {
      sink(Group.fromArray(source).length);
    },
  });
});
