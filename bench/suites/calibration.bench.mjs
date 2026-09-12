/**
 * Machine calibration.
 *
 * A fixed workload with no Pts dependency, recorded in every run. It gives a
 * machine speed factor, so a baseline taken on different hardware can be
 * recognized as incomparable rather than silently believed.
 *
 * Two cases, because Pts is both compute-bound and allocation-bound and the two
 * do not scale together across machines.
 */

import { numbersFor } from "../lib/random.mjs";
import { sink } from "../lib/sink.mjs";
import { defineSuite } from "../lib/suite.mjs";

const COMPUTE_N = 4096;
const ALLOC_N = 1024;

export default defineSuite("calibration", (b) => {
  b.case("float math", {
    batch: COMPUTE_N,
    setupOnce: () =>
      Float64Array.from(numbersFor("calibration", COMPUTE_N, 0.5, 1.5)),
    run: (values) => {
      let acc = 0;
      for (let i = 0; i < values.length; i++) {
        acc += Math.sqrt(values[i]) * 1.0000001;
      }
      sink(acc);
    },
  });

  b.case("typed array allocation", {
    batch: ALLOC_N,
    run: () => {
      let acc = 0;
      for (let i = 0; i < ALLOC_N; i++) {
        const a = new Float32Array(4);
        a[0] = i;
        a[3] = i * 0.5;
        acc += a[0] + a[3];
      }
      sink(acc);
    },
  });
});
