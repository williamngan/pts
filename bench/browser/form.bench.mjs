/**
 * `SVGForm` and `HTMLForm`.
 *
 * Unlike `CanvasForm`, these create and mutate a DOM element per shape per
 * frame. That is the dominant cost in any SVG-backed sketch, and it is the
 * reason a Pts sketch that is comfortable on canvas can be unusable on SVG.
 * Measuring it is the point.
 *
 * Both forms reuse elements by id across frames, so each case draws the same
 * ids repeatedly — the steady-state behaviour, not the first frame.
 */

import { SIZES } from "../lib/fixtures.mjs";
import { sink } from "../lib/sink.mjs";
import { defineSuite } from "../lib/suite.mjs";

const N = SIZES.S;
const WIDTH = 800;
const HEIGHT = 600;

export default defineSuite("form", (b, { Pts, fx }) => {
  const { SVGSpace, SVGForm, HTMLSpace, HTMLForm, Group } = Pts;

  const positive = (label, count) =>
    fx.ptLikes(label, count, 2, 10, Math.min(WIDTH, HEIGHT) - 10);

  const host = (tag) => {
    const element = document.createElement(tag);
    element.style.width = `${WIDTH}px`;
    element.style.height = `${HEIGHT}px`;
    document.body.appendChild(element);
    return element;
  };

  /**
   * A DOMSpace finishes wiring itself up on a timeout, and drawing before that
   * throws. The form must also exist *before* then: it registers a player whose
   * `start` hook is what gives it the element to draw into, and `start` only
   * fires for players present when the space becomes ready. This is the same
   * order a real sketch uses — get the form, then play.
   */
  const readySpace = async (makeSpace) => {
    const element = host("div");
    const space = makeSpace(element);
    const form = space.getForm();
    await new Promise((resolve) => {
      space.element.addEventListener("ready", resolve, { once: true });
      setTimeout(resolve, 500);
    });
    return { element, space, form };
  };

  const svgCase = (name, batch, makeState, run) =>
    b.case(`SVGForm.${name}`, {
      batch,
      setupOnce: async () => ({
        ...(await readySpace((element) => new SVGSpace(element))),
        ...makeState(),
      }),
      teardown: (state) => state?.element?.remove(),
      run,
    });

  svgCase(
    "point",
    N,
    () => ({ pts: positive("svg:point", N) }),
    ({ form, pts }) => {
      for (let i = 0; i < N; i++) form.point(pts[i], 3);
      sink(N);
    },
  );

  svgCase(
    "circle",
    N,
    () => ({
      circles: positive("svg:circle", N).map((p) =>
        Group.fromArray([p, [8, 8]]),
      ),
    }),
    ({ form, circles }) => {
      for (let i = 0; i < N; i++) form.circle(circles[i]);
      sink(N);
    },
  );

  svgCase(
    "line",
    N,
    () => ({
      lines: positive("svg:line", N * 2).reduce((acc, p, i, all) => {
        if (i % 2 === 0) acc.push(Group.fromArray([p, all[i + 1]]));
        return acc;
      }, []),
    }),
    ({ form, lines }) => {
      for (let i = 0; i < lines.length; i++) form.line(lines[i]);
      sink(lines.length);
    },
  );

  svgCase(
    "rect",
    N,
    () => ({
      rects: positive("svg:rect", N).map((p) =>
        Group.fromArray([p, [p[0] + 20, p[1] + 14]]),
      ),
    }),
    ({ form, rects }) => {
      for (let i = 0; i < N; i++) form.rect(rects[i]);
      sink(N);
    },
  );

  svgCase(
    "polygon (6 sides)",
    N,
    () => ({ polys: fx.polygons("svg:polygon", N, 6, 40) }),
    ({ form, polys }) => {
      for (let i = 0; i < N; i++) form.polygon(polys[i]);
      sink(N);
    },
  );

  svgCase(
    "text",
    N,
    () => ({
      pts: positive("svg:text", N),
      words: fx.words("svg:text:words", N, 4, 16),
    }),
    ({ form, pts, words }) => {
      for (let i = 0; i < N; i++) form.text(pts[i], words[i]);
      sink(N);
    },
  );

  // New ids every call, so every shape is a fresh element creation rather than
  // an attribute update on a reused one. This is the worst case, and it is what
  // a sketch hits whenever its shape count changes between frames.
  svgCase(
    "point (new id each call)",
    N,
    () => ({ pts: positive("svg:point:fresh", N) }),
    ({ form, pts }) => {
      for (let i = 0; i < N; i++) {
        form.id = `fresh-${i}-${Math.floor(performance.now())}`;
        form.point(pts[i], 3);
      }
      sink(N);
    },
  );

  b.case("HTMLForm.point", {
    batch: N,
    setupOnce: async () => ({
      ...(await readySpace((element) => new HTMLSpace(element))),
      pts: positive("html:point", N),
    }),
    teardown: (state) => state?.element?.remove(),
    run: ({ form, pts }) => {
      for (let i = 0; i < N; i++) form.point(pts[i], 3);
      sink(N);
    },
  });

  b.case("HTMLForm.rect", {
    batch: N,
    setupOnce: async () => ({
      ...(await readySpace((element) => new HTMLSpace(element))),
      rects: positive("html:rect", N).map((p) =>
        Group.fromArray([p, [p[0] + 20, p[1] + 14]]),
      ),
    }),
    teardown: (state) => state?.element?.remove(),
    run: ({ form, rects }) => {
      for (let i = 0; i < N; i++) form.rect(rects[i]);
      sink(N);
    },
  });

  if (!SVGForm || !HTMLForm) throw new Error("form exports are missing");
});
