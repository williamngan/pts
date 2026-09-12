/**
 * Deterministic fixture builders.
 *
 * Built as a factory over a loaded Pts module so the same suites can run
 * against two different builds in one process (see `--against`).
 *
 * Every builder is seeded from its `label`, not from a shared stream, so adding
 * or removing a benchmark never changes the data another benchmark receives.
 */

import { numbersFor, randomFor } from "./random.mjs";

/** Named workload sizes. Cases state which one they use. */
export const SIZES = {
  XS: 8,
  S: 64,
  M: 512,
  L: 4096,
};

export function createFixtures(Pts) {
  const { Pt, Group, Bound, Color, Create, Num } = Pts;

  /** `count` plain numeric arrays of `dim` dimensions. */
  function ptLikes(label, count, dim = 2, min = -100, max = 100) {
    const flat = numbersFor(label, count * dim, min, max);
    const out = new Array(count);
    for (let i = 0; i < count; i++) {
      const p = new Array(dim);
      for (let d = 0; d < dim; d++) p[d] = flat[i * dim + d];
      out[i] = p;
    }
    return out;
  }

  /** `count` Pts of `dim` dimensions. */
  function pts(label, count, dim = 2, min = -100, max = 100) {
    return ptLikes(label, count, dim, min, max).map((p) => new Pt(p));
  }

  /** A Group of `count` Pts. */
  function group(label, count, dim = 2, min = -100, max = 100) {
    return Group.fromPtArray(pts(label, count, dim, min, max));
  }

  /** `count` independent Groups of `size` Pts each. */
  function groups(label, count, size, dim = 2) {
    const out = new Array(count);
    for (let i = 0; i < count; i++) out[i] = group(`${label}:${i}`, size, dim);
    return out;
  }

  /** `count` two-Pt Groups, the shape Pts uses for a line segment. */
  function lines(label, count) {
    return groups(label, count, 2);
  }

  /** A regular polygon, so area/perimeter/hull results stay meaningful. */
  function polygon(label, sides = 6, radius = 100, center = [0, 0]) {
    const jitter = randomFor(label);
    const g = new Group();
    for (let i = 0; i < sides; i++) {
      const a = (i / sides) * Math.PI * 2;
      const r = radius * (0.75 + jitter() * 0.5);
      g.push(new Pt(center[0] + Math.cos(a) * r, center[1] + Math.sin(a) * r));
    }
    return g;
  }

  /** `count` polygons scattered over a grid, for collision sweeps. */
  function polygons(label, count, sides = 6, radius = 40) {
    const positions = ptLikes(`${label}:pos`, count, 2, -400, 400);
    const out = new Array(count);
    for (let i = 0; i < count; i++) {
      out[i] = polygon(`${label}:${i}`, sides, radius, positions[i]);
    }
    return out;
  }

  /** A two-Pt Group in Pts' `[topLeft, bottomRight]` rectangle form. */
  function rect(label, size = 100) {
    const [origin] = ptLikes(label, 1, 2, -200, 200);
    return Group.fromArray([
      origin,
      [origin[0] + size, origin[1] + size * 0.6],
    ]);
  }

  function rects(label, count, size = 100) {
    const out = new Array(count);
    for (let i = 0; i < count; i++) out[i] = rect(`${label}:${i}`, size);
    return out;
  }

  /** A two-Pt Group in Pts' `[center, radiusPt]` circle form. */
  function circle(label, radius = 50) {
    const [center] = ptLikes(label, 1, 2, -200, 200);
    return Group.fromArray([center, [radius, radius]]);
  }

  function circles(label, count, radius = 50) {
    const out = new Array(count);
    for (let i = 0; i < count; i++) out[i] = circle(`${label}:${i}`, radius);
    return out;
  }

  function triangles(label, count) {
    return groups(label, count, 3);
  }

  /** A `rows` x `cols` matrix as a Group of Pts, the form `Mat` expects. */
  function matrix(label, rows, cols) {
    return group(label, rows, cols, -10, 10);
  }

  function bound(width = 800, height = 600) {
    return Bound.fromGroup(
      Group.fromArray([
        [0, 0],
        [width, height],
      ]),
    );
  }

  /**
   * `count` Colors in the given mode, within that mode's declared ranges.
   * `Color.ranges[mode]` holds one Pt per channel as `[min, max]`.
   */
  function colors(label, count, mode = "rgb") {
    const ranges = Color.ranges[mode];
    const random = randomFor(`${label}:${mode}`);
    const out = new Array(count);
    for (let i = 0; i < count; i++) {
      const channels = new Array(3);
      for (let k = 0; k < 3; k++) {
        const [min, max] = ranges[k];
        channels[k] = min + random() * (max - min);
      }
      const c = Color.from(channels);
      c.toMode(mode);
      out[i] = c;
    }
    return out;
  }

  function hexes(label, count) {
    const random = randomFor(label);
    const out = new Array(count);
    for (let i = 0; i < count; i++) {
      out[i] =
        "#" +
        Math.floor(random() * 0xffffff)
          .toString(16)
          .padStart(6, "0");
    }
    return out;
  }

  function words(label, count, minLen = 4, maxLen = 40) {
    const random = randomFor(label);
    const alphabet = "abcdefghijklmnopqrstuvwxyz ";
    const out = new Array(count);
    for (let i = 0; i < count; i++) {
      const len = minLen + Math.floor(random() * (maxLen - minLen));
      let s = "";
      for (let k = 0; k < len; k++) {
        s += alphabet[Math.floor(random() * alphabet.length)];
      }
      out[i] = s;
    }
    return out;
  }

  /**
   * Wrap a list of Pts so a mutating benchmark can restore them between
   * iterations. Restoring via `Float32Array.set` copies memory instead of
   * reallocating, which keeps the untimed reset far cheaper than the work.
   */
  function restorable(list) {
    const snapshot = list.map((p) => Float32Array.from(p));
    return {
      value: list,
      reset() {
        for (let i = 0, len = list.length; i < len; i++) {
          list[i].set(snapshot[i]);
        }
        return list;
      },
    };
  }

  /** Same, for plain numeric arrays, which `Vec` mutates in place. */
  function restorableArrays(list) {
    const snapshot = list.map((p) => p.slice());
    return {
      value: list,
      reset() {
        for (let i = 0, len = list.length; i < len; i++) {
          const src = snapshot[i];
          const dst = list[i];
          for (let d = 0, dlen = src.length; d < dlen; d++) dst[d] = src[d];
        }
        return list;
      },
    };
  }

  return {
    Pts,
    bound,
    circle,
    circles,
    colors,
    group,
    groups,
    hexes,
    lines,
    matrix,
    polygon,
    polygons,
    ptLikes,
    pts,
    rect,
    rects,
    restorable,
    restorableArrays,
    triangles,
    words,
    // re-exported for suites that need to seed Pts' own generator
    seedPtsRandom: (seed) => Num.seed(seed),
    createNoise: (label, count) =>
      Create.noisePts(group(label, count, 2, 0, 500), 0.01, 0.01),
  };
}
