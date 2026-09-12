/**
 * Seeded pseudo-random numbers for benchmark fixtures.
 *
 * This is deliberately independent of Pts' own `Num.random` / `uheprng`: those
 * are themselves benchmark targets, and fixture data must never change because
 * the code under test changed.
 */

/** Deterministic 32-bit hash, used to derive a seed from a fixture label. */
export function seedFrom(label) {
  let h = 0x811c9dc5;
  for (let i = 0; i < label.length; i++) {
    h ^= label.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32 — small, fast, and stable across Node versions. */
export function createRandom(seed = 0x9e3779b9) {
  let a = seed >>> 0;
  return function random() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A generator seeded by label, so fixtures do not depend on call order. */
export function randomFor(label) {
  return createRandom(seedFrom(label));
}

/** `count` numbers in [min, max), seeded by label. */
export function numbersFor(label, count, min = -1, max = 1) {
  const random = randomFor(label);
  const span = max - min;
  const out = new Array(count);
  for (let i = 0; i < count; i++) out[i] = min + random() * span;
  return out;
}
