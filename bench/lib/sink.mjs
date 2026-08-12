/**
 * Consumption sink that prevents the optimizer from deleting benchmark work.
 *
 * A benchmark whose result is never observed can legally be removed entirely by
 * V8, which shows up as an impossibly fast case. Every case must therefore feed
 * a numeric component of its real result into `sink`.
 *
 * Call `sink` once per iteration with a locally accumulated value, not once per
 * item: a call inside the inner loop would measure the sink instead of the code.
 *
 *     run: (s) => {
 *       let acc = 0;
 *       for (let i = 0; i < s.pts.length; i++) acc += s.pts[i].add(s.d)[0];
 *       sink(acc);
 *     }
 */

let total = 0;
let touches = 0;

export function sink(value) {
  total += value;
  touches += 1;
}

export function sinkState() {
  return { total, touches };
}

export function resetSink() {
  total = 0;
  touches = 0;
}

/**
 * A case that never moved the sink is measuring nothing. Returns a problem
 * description, or `undefined` when the sink looks healthy.
 */
export function checkSink(before, after) {
  if (after.touches === before.touches) return "never fed the sink";
  if (!Number.isFinite(after.total)) return "sink value is not finite";
  return undefined;
}
