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

  // A measure whose cost grows with string length, like a host `measureText`.
  // The flat-cost `measure` above times Typography's own overhead; this one
  // shows how the truncate/wrap algorithms scale when every probe re-measures
  // the whole remaining string.
  const measurePerChar = (text) => {
    let w = 0;
    for (let i = 0; i < text.length; i++) w += 4 + (text.charCodeAt(i) % 8);
    return w;
  };

  const paragraph = (label, chars) => {
    const words = fx.words(label, 64, 3, 12);
    let text = words[0];
    for (let i = 1; text.length < chars; i++) {
      text += " " + words[i % words.length];
    }
    return text;
  };

  b.case("Typography.truncate (long text, per-char measure)", {
    batch: 32,
    setupOnce: () => paragraph("typography:truncate:long", 2048),
    run: (text) => {
      let acc = 0;
      for (let i = 0; i < 32; i++) {
        acc += Typography.truncate(measurePerChar, text, 200 + i * 8, "...")[1];
      }
      sink(acc);
    },
  });

  // The line-consumption loop inside `CanvasForm.paragraphBox`: truncate the
  // remaining text to one line's width, cut at the last space, repeat.
  // Re-measuring the whole remainder for every line makes this the quadratic
  // hot path in text-heavy sketches, so it gets its own baseline.
  b.case("paragraph wrap loop (per-char measure)", {
    batch: 4,
    setupOnce: () => paragraph("typography:wrap", 2048),
    run: (text) => {
      let lines = 0;
      for (let k = 0; k < 4; k++) {
        let sub = text;
        for (let guard = 0; sub && guard < 10000; guard++) {
          const t = Typography.truncate(measurePerChar, sub, 320, "");
          let dt = t[0].lastIndexOf(" ") + 1;
          if (dt <= 0 || t[1] === sub.length) dt = undefined;
          lines++;
          if (t[1] <= 0 || t[1] === sub.length) break;
          sub = sub.substring(dt ?? t[1]);
        }
      }
      sink(lines);
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
