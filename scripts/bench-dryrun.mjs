#!/usr/bin/env node
/**
 * Execute every benchmark case exactly once and report failures.
 *
 * A benchmark that throws is swallowed into a "no measurement" error by the
 * full runner only after it has spent its warmup budget; this is the fast way
 * to check that every case is wired up correctly.
 */

import { instantiate, loadPts, repoRoot } from "../bench/lib/load.mjs";
import { resetSink, sinkState } from "../bench/lib/sink.mjs";

const Pts = await loadPts(new URL("dist/index.mjs", repoRoot).pathname);
const cases = instantiate(Pts);

let failures = 0;
let suspicious = 0;

for (const testCase of cases) {
  resetSink();
  const before = sinkState();
  try {
    const shared = testCase.setupOnce ? testCase.setupOnce() : undefined;
    const state = testCase.setup ? testCase.setup(shared) : shared;
    testCase.run(state, shared);
    const after = sinkState();

    if (after.touches === before.touches) {
      process.stdout.write(`SINK  ${testCase.id}: never fed the sink\n`);
      failures += 1;
    } else if (!Number.isFinite(after.total)) {
      process.stdout.write(`SINK  ${testCase.id}: value is not finite\n`);
      failures += 1;
    } else if (after.total === 0) {
      // Not necessarily wrong — but an empty result usually means the case is
      // hitting a guard clause and measuring nothing, so it deserves a look.
      process.stdout.write(`ZERO  ${testCase.id}: sink value is 0\n`);
      suspicious += 1;
    }
  } catch (error) {
    process.stdout.write(`THROW ${testCase.id}: ${error.message}\n`);
    failures += 1;
  }
}

process.stdout.write(
  `${cases.length} cases, ${failures} failing, ${suspicious} suspicious\n`,
);
process.exitCode = failures > 0 ? 1 : 0;
