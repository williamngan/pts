/** Registry of Node benchmark suites, in run order. */

import calibration from "./calibration.bench.mjs";
import pt from "./pt.bench.mjs";
import linearAlgebra from "./linear-algebra.bench.mjs";
import num from "./num.bench.mjs";
import op from "./op.bench.mjs";
import create from "./create.bench.mjs";
import color from "./color.bench.mjs";
import physics from "./physics.bench.mjs";
import util from "./util.bench.mjs";
import typography from "./typography.bench.mjs";
import scenarios from "./scenarios.bench.mjs";

export const suites = [
  calibration,
  pt,
  linearAlgebra,
  num,
  op,
  create,
  color,
  physics,
  util,
  typography,
  scenarios,
];

export function selectSuites(names) {
  if (!names || names.length === 0) return suites;
  const unknown = names.filter((n) => !suites.some((s) => s.name === n));
  if (unknown.length > 0) {
    throw new Error(
      `unknown suite(s): ${unknown.join(", ")}. Available: ${suites
        .map((s) => s.name)
        .join(", ")}`,
    );
  }
  return suites.filter((s) => names.includes(s.name));
}
