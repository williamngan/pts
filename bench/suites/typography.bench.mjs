/**
 * `Typography`.
 *
 * These run per text item per frame in a text-heavy sketch. The measuring
 * function passed in is a fixed, cheap stand-in for a real canvas
 * `measureText`, so the cases measure Typography's own overhead rather than the
 * host's text engine.
 */

import { SIZES } from "../lib/fixtures.mjs";
import { sink } from "../lib/sink.mjs";
import { defineSuite } from "../lib/suite.mjs";

const N = SIZES.S;

export default defineSuite("typography", (b, { Pts, fx }) => {
  const { Typography, Group } = Pts;

  const measure = (text) => text.length * 7.25;

  b.case("Typography.textWidthEstimator (build)", {
    batch: N,
    run: () => {
      let acc = 0;
      for (let i = 0; i < N; i++) {
        acc += Typography.textWidthEstimator(measure)("sample");
      }
      sink(acc);
    },
  });

  b.case("Typography.textWidthEstimator (call)", {
    batch: SIZES.M,
    setupOnce: () => ({
      estimate: Typography.textWidthEstimator(measure),
      words: fx.words("typography:estimate", SIZES.M),
    }),
    run: ({ estimate, words }) => {
      let acc = 0;
      for (let i = 0; i < SIZES.M; i++) acc += estimate(words[i]);
      sink(acc);
    },
  });

  b.case("Typography.truncate", {
    batch: SIZES.M,
    setupOnce: () => fx.words("typography:truncate", SIZES.M, 10, 80),
    run: (words) => {
      let acc = 0;
      for (let i = 0; i < SIZES.M; i++) {
        acc += Typography.truncate(measure, words[i], 120, "...")[1];
      }
      sink(acc);
    },
  });

  b.case("Typography.fontSizeToBox (build)", {
    batch: N,
    setupOnce: () =>
      Group.fromArray([
        [0, 0],
        [200, 40],
      ]),
    run: (box) => {
      let acc = 0;
      for (let i = 0; i < N; i++) {
        acc += Typography.fontSizeToBox(box, 0.8)(box);
      }
      sink(acc);
    },
  });

  b.case("Typography.fontSizeToBox (call)", {
    batch: SIZES.M,
    setupOnce: () => {
      const box = Group.fromArray([
        [0, 0],
        [200, 40],
      ]);
      return {
        scale: Typography.fontSizeToBox(box, 0.8),
        boxes: fx.rects("typography:boxes", SIZES.M, 60),
      };
    },
    run: ({ scale, boxes }) => {
      let acc = 0;
      for (let i = 0; i < SIZES.M; i++) acc += scale(boxes[i]);
      sink(acc);
    },
  });

  b.case("Typography.fontSizeToThreshold (call)", {
    batch: SIZES.M,
    setupOnce: () => Typography.fontSizeToThreshold(24, -1),
    run: (scale) => {
      let acc = 0;
      for (let i = 0; i < SIZES.M; i++) acc += scale(14, i % 48);
      sink(acc);
    },
  });
});
