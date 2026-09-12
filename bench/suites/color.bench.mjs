/**
 * `Color`.
 *
 * The conversion cases are enumerated from the class itself, so a new
 * conversion pair is benchmarked the day it is added rather than the day
 * someone remembers to add a case.
 */

import { SIZES } from "../lib/fixtures.mjs";
import { sink } from "../lib/sink.mjs";
import { defineSuite } from "../lib/suite.mjs";

const N = SIZES.M;

export default defineSuite("color", (b, { Pts, fx }) => {
  const { Color } = Pts;

  // ---------------------------------------------------------- construction

  b.case("Color.from", {
    batch: N,
    setupOnce: () => fx.ptLikes("color:from", N, 3, 0, 255),
    run: (source) => {
      let acc = 0;
      for (let i = 0; i < N; i++) acc += Color.from(source[i])[0];
      sink(acc);
    },
  });

  b.case("Color.rgb", {
    batch: N,
    setupOnce: () => fx.ptLikes("color:rgb", N, 3, 0, 255),
    run: (source) => {
      let acc = 0;
      for (let i = 0; i < N; i++) acc += Color.rgb(source[i])[0];
      sink(acc);
    },
  });

  b.case("Color.fromHex", {
    batch: N,
    setupOnce: () => fx.hexes("color:fromHex", N),
    run: (source) => {
      let acc = 0;
      for (let i = 0; i < N; i++) acc += Color.fromHex(source[i])[0];
      sink(acc);
    },
  });

  b.case("Color.clone", {
    batch: N,
    setupOnce: () => fx.colors("color:clone", N),
    run: (source) => {
      let acc = 0;
      for (let i = 0; i < N; i++) acc += source[i].clone()[0];
      sink(acc);
    },
  });

  b.case("Color.maxValues", {
    batch: SIZES.S,
    run: () => {
      let acc = 0;
      for (let i = 0; i < SIZES.S; i++) acc += Color.maxValues("lch")[0];
      sink(acc);
    },
  });

  // ------------------------------------------------------------ conversion

  // e.g. "RGBtoHSL" -> source mode "rgb"
  const conversions = Object.getOwnPropertyNames(Color)
    .filter(
      (key) => typeof Color[key] === "function" && /^[A-Z]+to[A-Z]+$/.test(key),
    )
    .sort();

  for (const name of conversions) {
    const sourceMode = name.split("to")[0].toLowerCase();
    b.case(`Color.${name}`, {
      batch: N,
      setupOnce: () => fx.colors(`color:${name}`, N, sourceMode),
      run: (source) => {
        let acc = 0;
        for (let i = 0; i < N; i++) acc += Color[name](source[i])[0];
        sink(acc);
      },
    });

    // The normalized flags take a different path (denormalize on the way
    // in, map through Color.ranges on the way out), so measure it too.
    b.case(`Color.${name} (normalized)`, {
      batch: N,
      setupOnce: () =>
        fx
          .colors(`color:${name}:normalized`, N, sourceMode)
          .map((c) => c.$normalize()),
      run: (source) => {
        let acc = 0;
        for (let i = 0; i < N; i++)
          acc += Color[name](source[i], true, true)[0];
        sink(acc);
      },
    });
  }

  b.case("Color.toMode (no conversion)", {
    batch: N,
    setupOnce: () => fx.colors("color:toMode", N),
    run: (source) => {
      let acc = 0;
      for (let i = 0; i < N; i++) acc += source[i].toMode("hsl")[0];
      sink(acc);
    },
  });

  b.case("Color.toMode (converting)", {
    batch: N,
    // toMode mutates the color's values and mode, so rebuild each iteration
    setupOnce: () => fx.ptLikes("color:toMode:convert", N, 3, 0, 255),
    setup: (source) => source.map((c) => Color.rgb(c)),
    run: (colors) => {
      let acc = 0;
      for (let i = 0; i < N; i++) acc += colors[i].toMode("lch", true)[0];
      sink(acc);
    },
  });

  b.case("Color.normalize", {
    batch: N,
    setupOnce: () => fx.ptLikes("color:normalize", N, 3, 0, 255),
    setup: (source) => source.map((c) => Color.rgb(c)),
    run: (colors) => {
      let acc = 0;
      for (let i = 0; i < N; i++) acc += colors[i].normalize()[0];
      sink(acc);
    },
  });

  // --------------------------------------------------------------- output

  for (const format of ["hex", "rgb", "rgba", "mode"]) {
    b.case(`Color.toString("${format}")`, {
      batch: SIZES.S,
      setupOnce: () => fx.colors(`color:toString:${format}`, SIZES.S),
      run: (colors) => {
        let acc = 0;
        for (let i = 0; i < SIZES.S; i++) {
          acc += colors[i].toString(format).length;
        }
        sink(acc);
      },
    });
  }
});
