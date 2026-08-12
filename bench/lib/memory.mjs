/**
 * Allocation profiling.
 *
 * Pts returns a fresh `Pt` or `Group` from nearly every operation, so wall
 * clock alone describes only half of its cost — the rest is paid later, in GC,
 * in whatever frame happens to be unlucky.
 *
 * Measured with V8's sampling heap profiler rather than a `heapUsed` delta. A
 * heap delta silently under-reports whenever a GC lands inside the measured
 * window, which is exactly what happens in allocation-heavy code. The sampler
 * counts allocations as they happen, including ones that are collected again
 * immediately, so the result does not depend on GC timing.
 *
 * Bytes-per-item is deterministic in a way that `hz` is not: it does not move
 * with CPU load, which makes it the stricter of the two regression gates.
 */

import { Session } from "node:inspector";

const SAMPLING_INTERVAL = 512;
const MAX_ITERATIONS = 32;
const MIN_ITERATIONS = 3;
/** Rough time budget per case, so a heavy scenario does not stall the pass. */
const BUDGET_MS = 40;

export function createAllocationProfiler() {
  const session = new Session();
  session.connect();

  const post = (method, params) =>
    new Promise((resolve, reject) => {
      session.post(method, params, (error, result) =>
        error ? reject(error) : resolve(result),
      );
    });

  return {
    async start() {
      await post("HeapProfiler.enable");
    },

    /**
     * Total bytes allocated while `fn` ran.
     *
     * The `includeObjectsCollectedBy*GC` flags are what make short-lived
     * allocations visible; without them the profiler reports only whatever
     * happened to survive, which for this library is almost nothing.
     */
    async sample(fn) {
      await post("HeapProfiler.startSampling", {
        samplingInterval: SAMPLING_INTERVAL,
        includeObjectsCollectedByMajorGC: true,
        includeObjectsCollectedByMinorGC: true,
      });
      fn();
      const { profile } = await post("HeapProfiler.stopSampling");

      let total = 0;
      const walk = (node) => {
        total += node.selfSize || 0;
        for (const child of node.children || []) walk(child);
      };
      walk(profile.head);
      return total;
    },

    async close() {
      await post("HeapProfiler.disable");
      session.disconnect();
    },
  };
}

/**
 * Bytes allocated per item for one case.
 *
 * Per-iteration `setup` state is built before the measured window, because
 * fixture allocation belongs to the fixture and not to the code under test.
 */
export async function measureAllocation(profiler, testCase, maxIterations) {
  const shared = testCase.setupOnce ? testCase.setupOnce() : undefined;

  // Warm up so lazily-created shapes and one-off internal buffers are already
  // allocated before measuring, and time a run while doing it.
  let elapsed = 0;
  for (let i = 0; i < 3; i++) {
    const state = testCase.setup ? testCase.setup(shared) : shared;
    const from = performance.now();
    testCase.run(state, shared);
    elapsed = performance.now() - from;
  }

  // Allocation per iteration is deterministic, so a heavy case needs far fewer
  // repeats than a cheap one to be measured accurately.
  const ceiling = maxIterations ?? MAX_ITERATIONS;
  const iterations = Math.max(
    MIN_ITERATIONS,
    Math.min(ceiling, Math.round(BUDGET_MS / Math.max(elapsed, 0.001))),
  );

  const states = new Array(iterations);
  for (let i = 0; i < iterations; i++) {
    states[i] = testCase.setup ? testCase.setup(shared) : shared;
  }

  const total = await profiler.sample(() => {
    for (let i = 0; i < iterations; i++) testCase.run(states[i], shared);
  });

  return {
    id: testCase.id,
    suite: testCase.suite,
    name: testCase.name,
    batch: testCase.batch,
    iterations,
    bytesPerItem: total / (iterations * testCase.batch),
    bytesPerCall: total / iterations,
  };
}

export { MAX_ITERATIONS, MIN_ITERATIONS };
