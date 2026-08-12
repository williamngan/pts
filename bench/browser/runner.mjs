/**
 * In-page benchmark runner.
 *
 * Mirrors `bench/lib/runner.mjs`, but imports tinybench from a served path
 * because a browser cannot resolve a bare specifier, and reads Pts from
 * `globalThis.Pts` because the page loads the IIFE bundle rather than the ESM
 * one — that is the artifact a `<script>` tag user actually gets.
 */

import { Bench, Task } from "/vendor/tinybench.js";

import { createFixtures, SIZES } from "../lib/fixtures.mjs";
import { checkSink, sinkState } from "../lib/sink.mjs";
import canvas from "./canvas.bench.mjs";
import form from "./form.bench.mjs";
import image from "./image.bench.mjs";
import space from "./space.bench.mjs";

const suites = [canvas, form, image, space];

export async function runBrowserBenchmarks(options = {}) {
  const Pts = globalThis.Pts;
  if (!Pts)
    throw new Error("globalThis.Pts is missing; dist/pts.js did not load");

  const context = { Pts, fx: createFixtures(Pts), sizes: SIZES };
  let cases = suites.flatMap((suite) => suite.instantiate(context));

  if (options.suite?.length) {
    cases = cases.filter((c) => options.suite.includes(c.suite));
  }
  if (options.filter) {
    const needle = options.filter.toLowerCase();
    cases = cases.filter((c) => c.id.toLowerCase().includes(needle));
  }

  const bench = new Bench({
    time: options.time ?? 200,
    iterations: options.iterations ?? 12,
    warmupTime: options.warmupTime ?? 80,
    warmupIterations: 6,
    throws: true,
  });

  const results = [];
  for (const testCase of cases) {
    // Built here, not in tinybench's `beforeAll`, which runs once per phase —
    // and browser fixtures create DOM, which must not happen twice.
    let shared = testCase.setupOnce ? await testCase.setupOnce() : undefined;
    let state;
    const task = new Task(
      bench,
      testCase.id,
      () => testCase.run(state, shared),
      {
        beforeEach() {
          state = testCase.setup ? testCase.setup(shared) : shared;
        },
      },
    );

    const before = sinkState();
    await task.warmup();
    await task.run();

    const problem = checkSink(before, sinkState());
    if (problem) throw new Error(`benchmark "${testCase.id}" ${problem}`);

    const result = task.result;
    if (!result || !Number.isFinite(result.hz)) {
      throw new Error(`benchmark "${testCase.id}" produced no measurement`);
    }

    results.push({
      id: testCase.id,
      suite: testCase.suite,
      name: testCase.name,
      batch: testCase.batch,
      hz: result.hz,
      mean: result.mean,
      median: result.samples[result.samples.length >> 1] ?? 0,
      p99: result.p99,
      rme: result.rme,
      samples: result.samples.length,
      nsPerItem: (result.period * 1e6) / testCase.batch,
    });

    // release this case's fixtures, including any DOM it created
    testCase.teardown?.(shared);
    shared = undefined;
    state = undefined;
  }

  return results;
}
