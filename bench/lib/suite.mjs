/**
 * Suite definition DSL.
 *
 * A suite is a function of a loaded Pts build, so the same definitions can be
 * instantiated twice against two builds in one process.
 *
 * Every case is *batched*: `run` performs its operation across a whole workload
 * rather than once. tinybench times each individual iteration with
 * `performance.now()`, and a single call to something like `Pt.add` costs about
 * as much as reading the clock — timing it directly would measure the clock.
 * `batch` records how many items one iteration covers so the runner can derive
 * a per-item cost.
 */

class SuiteBuilder {
  constructor(name) {
    this.name = name;
    this.cases = [];
  }

  /**
   * @param name  case name, unique within the suite
   * @param options.batch      items processed by one `run` call
   * @param options.setupOnce  built once, before warmup; returns shared state
   * @param options.setup      run untimed before every iteration; receives the
   *                           shared state and returns the per-iteration state.
   *                           Use for anything `run` mutates.
   * @param options.run        the measured function; receives
   *                           (perIterationState, sharedState)
   * @param options.teardown   released after the case finishes; receives the
   *                           shared state. Needed by browser cases that put
   *                           elements in the document.
   */
  case(name, options) {
    const { batch, run, setup, setupOnce, teardown } = options;

    if (typeof run !== "function") {
      throw new Error(`${this.name}/${name}: "run" must be a function`);
    }
    if (!Number.isInteger(batch) || batch < 1) {
      throw new Error(
        `${this.name}/${name}: "batch" must be a positive integer`,
      );
    }
    if (this.cases.some((c) => c.name === name)) {
      throw new Error(`${this.name}/${name}: duplicate case name`);
    }

    this.cases.push({
      id: `${this.name}/${name}`,
      suite: this.name,
      name,
      batch,
      run,
      setup,
      setupOnce,
      teardown,
    });
    return this;
  }
}

export function defineSuite(name, build) {
  return {
    name,
    /** Instantiate this suite's cases against a specific fixtures context. */
    instantiate(context) {
      const builder = new SuiteBuilder(name);
      build(builder, context);
      return builder.cases;
    },
  };
}
