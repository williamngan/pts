/*! Pts.js is licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */

import { Pt, Bound } from "./Pt";
import { Util } from "./Util";
import { type PtLikeIterable, type TextMeasure } from "./Types";

/**
 * Typography provides helper functions to support typographic layouts. For a concrete example, see [a demo here](https://ptsjs.org/demo/?name=canvasform.textBox) that uses the [`CanvasForm.textBox`](#link) function.
 */
export class Typography {
  /**
   * Create a heuristic text width estimate function. It will be less accurate but faster.
   * @param fn a reference function that can measure text width accurately
   * @param samples a list of string samples. Default is ["M", "n", "."]
   * @param distribution a list of the samples' probability distribution, which should have the same length as `samples` and sum to 1. Default is [0.06, 0.8, 0.14]. (A distribution that sums to more or less than 1 will proportionally inflate or deflate every estimate.)
   * @return a function that can estimate text width
   */
  static textWidthEstimator(
    fn: TextMeasure,
    samples: string[] = ["M", "n", "."],
    distribution: number[] = [0.06, 0.8, 0.14],
  ): TextMeasure {
    if (samples.length !== distribution.length) {
      throw new Error(
        `textWidthEstimator: samples (${samples.length}) and distribution (${distribution.length}) must have the same length`,
      );
    }
    const m = samples.map(fn);
    const avg = new Pt(distribution).dot(m);
    return (text: string): number => text.length * avg;
  }

  /**
   * Create a memoizing text width function that measures each distinct character once and sums the cached widths. Nearly as accurate as the reference function for most texts (kerning and ligatures excepted) at close to estimator speed after warmup. The cache is keyed by character, so create a new instance whenever the font changes.
   * @param fn a reference function that can measure text width accurately
   * @return a function that measures text width using per-character caching
   */
  static charWidthCache(fn: TextMeasure): TextMeasure {
    // Latin-1 goes through a typed array — a Map lookup per character would
    // cost as much as the measurement it replaces. NaN marks "not yet measured".
    const latin = new Float64Array(256).fill(NaN);
    const cache = new Map<string, number>();
    return (text: string): number => {
      let sum = 0;
      for (let i = 0, len = text.length; i < len; i++) {
        const code = text.charCodeAt(i);
        if (code < 256) {
          let w = latin[code];
          if (w !== w) {
            w = fn(text[i]);
            latin[code] = w;
          }
          sum += w;
        } else {
          let ch = text[i];
          if (code >= 0xd800 && code <= 0xdbff && i + 1 < len) {
            ch += text[i + 1]; // measure a surrogate pair as one character
            i++;
          }
          let w = cache.get(ch);
          if (w === undefined) {
            w = fn(ch);
            cache.set(ch, w);
          }
          sum += w;
        }
      }
      return sum;
    };
  }

  /**
   * Truncate text to fit width. The result is guaranteed to fit: the largest prefix (possibly empty) is kept such that the prefix plus the tail measures within `width`. The cut never splits a surrogate pair. If even the tail alone cannot fit, `["", 0]` is returned.
   * @param fn a function that can measure text width
   * @param str text to truncate
   * @param width width to fit
   * @param tail text to indicate overflow such as "...". Default is empty "".
   * @param hint optional expected number of characters to keep — a pure performance hint (any value yields the same result) that seeds the search, such as the previous line's length when wrapping. With an empty `tail`, a hint also avoids measuring the entire string.
   * @return a tuple of the truncated text (tail included) and the number of characters kept from `str`
   */
  static truncate(
    fn: TextMeasure,
    str: string,
    width: number,
    tail: string = "",
    hint?: number,
  ): [string, number] {
    const len = str.length;
    let budget: number;
    let max: number;
    let seed: number;

    if (hint !== undefined && !tail) {
      // Hinted search with no tail: skip the full-string measure. The domain
      // includes `len` itself, so "everything fits" is discovered by the
      // search rather than by a separate upfront measurement.
      budget = width;
      max = len;
      seed = Math.min(max, Math.max(0, Math.floor(hint)));
    } else {
      const full = fn(str);
      if (full <= width) return [str, len];
      budget = width - (tail ? fn(tail) : 0);
      max = len - 1;
      seed =
        hint !== undefined
          ? Math.min(max, Math.max(0, Math.floor(hint)))
          : Math.min(max, Math.max(0, Math.floor((len * budget) / full)));
    }

    const fits = (k: number): boolean => fn(str.slice(0, k)) <= budget;

    // Find the largest k in [0, max] where the prefix fits, starting from the
    // seed — exact for linear measures, so the gallop below usually settles
    // the boundary in two probes.
    let best = -1;
    let lo = 0;
    let hi = max;

    if (budget >= 0) {
      const k = seed;
      if (fits(k)) {
        best = k;
        lo = k + 1;
        for (let inc = 1; lo <= hi; inc *= 2) {
          const p = Math.min(hi, k + inc);
          if (!fits(p)) {
            hi = p - 1;
            break;
          }
          best = p;
          lo = p + 1;
        }
      } else {
        hi = k - 1;
        for (let inc = 1; lo <= hi; inc *= 2) {
          const p = Math.max(lo, k - inc);
          if (fits(p)) {
            best = p;
            lo = p + 1;
            break;
          }
          hi = p - 1;
        }
      }
      while (lo <= hi) {
        const p = (lo + hi) >> 1;
        if (fits(p)) {
          best = p;
          lo = p + 1;
        } else {
          hi = p - 1;
        }
      }
    }

    if (best < 0) return ["", 0];
    if (best === len) return [str, len]; // hinted search found the whole string fits

    // Don't cut between a surrogate pair's halves; a shorter prefix still fits.
    let cut = best;
    if (cut > 0) {
      const code = str.charCodeAt(cut - 1);
      if (code >= 0xd800 && code <= 0xdbff) cut--;
    }

    return [str.slice(0, cut) + tail, cut];
  }

  /**
   * Get a function to scale font size proportionally to a box's size. (Deprecated form: passing an initial box as the first parameter is deprecated — it never affected the result — and will be removed in a future version.)
   * @param ratio font-size to box-size ratio. Default is 1.
   * @param byHeight `true` to scale by the box's height, `false` to scale by its width. Default is `true`.
   * @returns a function where input parameter is a box, and returns a font size value (`ratio` multiplied by the box's height or width)
   */
  static fontSizeToBox(
    ratio?: number,
    byHeight?: boolean,
  ): (box: PtLikeIterable) => number;
  /**
   * @deprecated The initial box never affected the result. Use `fontSizeToBox(ratio, byHeight)` instead.
   */
  static fontSizeToBox(
    box: PtLikeIterable,
    ratio?: number,
    byHeight?: boolean,
  ): (box: PtLikeIterable) => number;
  static fontSizeToBox(
    ratio: number | PtLikeIterable = 1,
    byHeight: boolean | number = true,
    legacyByHeight?: boolean,
  ): (box: PtLikeIterable) => number {
    if (typeof ratio !== "number") {
      Util.warn(
        "Typography.fontSizeToBox(box, ratio, byHeight) is deprecated: the initial box never affected the result. Use fontSizeToBox(ratio, byHeight) instead.",
      );
      ratio = typeof byHeight === "number" ? byHeight : 1;
      byHeight = legacyByHeight === undefined ? true : legacyByHeight;
    }
    const r = ratio as number;
    const by = byHeight as boolean;
    return (box: PtLikeIterable): number => {
      const bound = Bound.fromGroup(box);
      return r * (by ? bound.height : bound.width);
    };
  }

  /**
   * Get a function to scale font size based on a threshold value.
   * @param threshold threshold value. Cannot be 0.
   * @param direction if negative, get a font size <= defaultSize; if positive, get a font size >= defaultSize; Default is 0 which will scale font without min or max limits.
   * @returns a function whose input parameters are a default font size and a value to compare with threshold, and which returns a new font size value
   */
  static fontSizeToThreshold(
    threshold: number,
    direction: number = 0,
  ): (defaultSize: number, val: number) => number {
    if (threshold === 0) {
      throw new Error("fontSizeToThreshold: threshold cannot be 0");
    }
    return function (defaultSize: number, val: number): number {
      const d = (defaultSize * val) / threshold;
      if (direction < 0) return Math.min(d, defaultSize);
      if (direction > 0) return Math.max(d, defaultSize);
      return d;
    };
  }
}
