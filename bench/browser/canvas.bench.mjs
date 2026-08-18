/**
 * `CanvasForm` against a real 2D context.
 *
 * These are the calls a sketch makes every frame. Each case draws a whole
 * workload of shapes, which is both how the API is really used and what keeps
 * the timed region well clear of the clock's resolution.
 *
 * Rasterization cost is real but shared: every case draws into the same
 * offscreen-sized canvas with the same geometry spread, so what moves between
 * runs is Pts' own per-call overhead.
 */

import { SIZES } from "../lib/fixtures.mjs";
import { sink } from "../lib/sink.mjs";
import { defineSuite } from "../lib/suite.mjs";

const N = SIZES.M;
const WIDTH = 800;
const HEIGHT = 600;

export default defineSuite("canvas", (b, { Pts, fx }) => {
  const { CanvasForm, Group } = Pts;

  /** A detached canvas is enough: nothing here depends on being in the tree. */
  const makeForm = () => {
    const canvas = document.createElement("canvas");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    return new CanvasForm(canvas.getContext("2d"));
  };

  const positive = (label, count, dim = 2) =>
    fx.ptLikes(label, count, dim, 10, Math.min(WIDTH, HEIGHT) - 10);

  /**
   * Every case clears the canvas between iterations, untimed. Without it the
   * context accumulates hundreds of thousands of shapes over a measurement run
   * and the numbers become unusable — the first version of this suite reported
   * margins of error above 180%.
   */
  const draw = (name, batch, makeState, run) =>
    b.case(name, {
      batch,
      setupOnce: () => ({ form: makeForm(), ...makeState() }),
      setup: (shared) => {
        shared.form.ctx.clearRect(0, 0, WIDTH, HEIGHT);
        return shared;
      },
      run,
    });

  draw(
    "point (square)",
    N,
    () => ({ pts: positive("canvas:point", N) }),
    ({ form, pts }) => {
      for (let i = 0; i < N; i++) form.point(pts[i], 3, "square");
      sink(N);
    },
  );

  draw(
    "point (circle)",
    N,
    () => ({ pts: positive("canvas:point:circle", N) }),
    ({ form, pts }) => {
      for (let i = 0; i < N; i++) form.point(pts[i], 3, "circle");
      sink(N);
    },
  );

  draw(
    "circle",
    N,
    () => ({
      circles: positive("canvas:circle", N).map((p) =>
        Group.fromArray([p, [8, 8]]),
      ),
    }),
    ({ form, circles }) => {
      for (let i = 0; i < N; i++) form.circle(circles[i]);
      sink(N);
    },
  );

  draw(
    "line",
    N,
    () => ({
      lines: positive("canvas:line", N * 2).reduce((acc, p, i, all) => {
        if (i % 2 === 0) acc.push(Group.fromArray([p, all[i + 1]]));
        return acc;
      }, []),
    }),
    ({ form, lines }) => {
      for (let i = 0; i < lines.length; i++) form.line(lines[i]);
      sink(lines.length);
    },
  );

  draw(
    "rect",
    N,
    () => ({
      rects: positive("canvas:rect", N).map((p) =>
        Group.fromArray([p, [p[0] + 20, p[1] + 14]]),
      ),
    }),
    ({ form, rects }) => {
      for (let i = 0; i < N; i++) form.rect(rects[i]);
      sink(N);
    },
  );

  draw(
    "polygon (6 sides)",
    SIZES.S,
    () => ({ polys: fx.polygons("canvas:polygon", SIZES.S, 6, 40) }),
    ({ form, polys }) => {
      for (let i = 0; i < SIZES.S; i++) form.polygon(polys[i]);
      sink(SIZES.S);
    },
  );

  draw(
    "arc",
    SIZES.S,
    () => ({ pts: positive("canvas:arc", SIZES.S) }),
    ({ form, pts }) => {
      for (let i = 0; i < SIZES.S; i++) form.arc(pts[i], 20, 0, Math.PI);
      sink(SIZES.S);
    },
  );

  draw(
    "text",
    SIZES.S,
    () => ({
      pts: positive("canvas:text", SIZES.S),
      words: fx.words("canvas:text:words", SIZES.S, 4, 16),
    }),
    ({ form, pts, words }) => {
      for (let i = 0; i < SIZES.S; i++) form.text(pts[i], words[i]);
      sink(SIZES.S);
    },
  );

  draw(
    "textBox",
    SIZES.S,
    () => ({
      boxes: positive("canvas:textBox", SIZES.S).map((p) =>
        Group.fromArray([p, [p[0] + 120, p[1] + 40]]),
      ),
      words: fx.words("canvas:textBox:words", SIZES.S, 20, 60),
    }),
    ({ form, boxes, words }) => {
      for (let i = 0; i < SIZES.S; i++) form.textBox(boxes[i], words[i]);
      sink(SIZES.S);
    },
  );

  // Same workload with the heuristic width estimator instead of measureText,
  // so both sides of the `fontWidthEstimate` toggle have a baseline.
  draw(
    "textBox (estimated width)",
    SIZES.S,
    () => ({
      form: makeForm().fontWidthEstimate(true),
      boxes: positive("canvas:textBox:est", SIZES.S).map((p) =>
        Group.fromArray([p, [p[0] + 120, p[1] + 40]]),
      ),
      words: fx.words("canvas:textBox:est:words", SIZES.S, 20, 60),
    }),
    ({ form, boxes, words }) => {
      for (let i = 0; i < SIZES.S; i++) form.textBox(boxes[i], words[i]);
      sink(SIZES.S);
    },
  );

  // Word wrap re-measures the remaining text for every line, so paragraphBox
  // is the most expensive text call in the API. Small batch: each call wraps
  // a few hundred characters into many lines.
  draw(
    "paragraphBox",
    SIZES.XS,
    () => ({
      boxes: positive("canvas:paragraphBox", SIZES.XS).map((p) =>
        Group.fromArray([p, [p[0] + 220, p[1] + 160]]),
      ),
      texts: fx.words("canvas:paragraphBox:texts", SIZES.XS, 240, 400),
    }),
    ({ form, boxes, texts }) => {
      for (let i = 0; i < SIZES.XS; i++) form.paragraphBox(boxes[i], texts[i]);
      sink(SIZES.XS);
    },
  );

  draw(
    "paragraphBox (char-cached width)",
    SIZES.XS,
    () => ({
      form: makeForm().fontWidthEstimate("char"),
      boxes: positive("canvas:paragraphBox:char", SIZES.XS).map((p) =>
        Group.fromArray([p, [p[0] + 220, p[1] + 160]]),
      ),
      texts: fx.words("canvas:paragraphBox:char:texts", SIZES.XS, 240, 400),
    }),
    ({ form, boxes, texts }) => {
      for (let i = 0; i < SIZES.XS; i++) form.paragraphBox(boxes[i], texts[i]);
      sink(SIZES.XS);
    },
  );

  draw(
    "paragraphBox (estimated width)",
    SIZES.XS,
    () => ({
      form: makeForm().fontWidthEstimate(true),
      boxes: positive("canvas:paragraphBox:est", SIZES.XS).map((p) =>
        Group.fromArray([p, [p[0] + 220, p[1] + 160]]),
      ),
      texts: fx.words("canvas:paragraphBox:est:texts", SIZES.XS, 240, 400),
    }),
    ({ form, boxes, texts }) => {
      for (let i = 0; i < SIZES.XS; i++) form.paragraphBox(boxes[i], texts[i]);
      sink(SIZES.XS);
    },
  );

  // Style changes force a context state write on every call, which is the
  // usual reason a colourful sketch is slower than a monochrome one.
  draw(
    "fill + stroke style churn",
    SIZES.S,
    () => ({ pts: positive("canvas:style", SIZES.S) }),
    ({ form, pts }) => {
      for (let i = 0; i < SIZES.S; i++) {
        form.fill(i % 2 ? "#f03" : "#09c").stroke("#123", 2);
        form.point(pts[i], 4);
      }
      sink(SIZES.S);
    },
  );

  draw(
    "fillOnly (no style change)",
    SIZES.S,
    () => ({ pts: positive("canvas:fillOnly", SIZES.S) }),
    ({ form, pts }) => {
      form.fillOnly("#09c");
      for (let i = 0; i < SIZES.S; i++) form.point(pts[i], 4);
      sink(SIZES.S);
    },
  );

  draw(
    "static CanvasForm.line (no form state)",
    N,
    () => ({
      ctx: makeForm().ctx,
      lines: positive("canvas:static", N * 2).reduce((acc, p, i, all) => {
        if (i % 2 === 0) acc.push(Group.fromArray([p, all[i + 1]]));
        return acc;
      }, []),
    }),
    ({ ctx, lines }) => {
      for (let i = 0; i < lines.length; i++) CanvasForm.line(ctx, lines[i]);
      sink(lines.length);
    },
  );
});
