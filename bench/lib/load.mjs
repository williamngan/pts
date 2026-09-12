/** Building and loading a Pts artifact, and instantiating suites against it. */

import { spawnSync } from "node:child_process";
import { access } from "node:fs/promises";
import { pathToFileURL } from "node:url";

import { createFixtures, SIZES } from "./fixtures.mjs";
import { selectSuites } from "../suites/index.mjs";

export const repoRoot = new URL("../../", import.meta.url);

/**
 * Benchmarks measure the built artifact, not `src/`. That is what consumers
 * install, it removes the dev transform from the measurement, and it makes A/B
 * comparison a matter of two file paths.
 */
export function build(cwd = repoRoot) {
  const bin = new URL("node_modules/.bin/tsdown", repoRoot).pathname;
  const result = spawnSync(bin, [], {
    cwd: cwd instanceof URL ? cwd.pathname : cwd,
    stdio: ["ignore", "ignore", "inherit"],
  });
  if (result.status !== 0) {
    throw new Error(`build failed with status ${result.status}`);
  }
}

export async function loadPts(distPath) {
  try {
    await access(distPath);
  } catch {
    throw new Error(
      `${distPath} does not exist. Run a build first, or drop --no-build.`,
    );
  }
  return import(pathToFileURL(distPath).href);
}

/** Instantiate the selected suites' cases against one loaded build. */
export function instantiate(Pts, { suiteNames, filter } = {}) {
  const fx = createFixtures(Pts);
  const context = { Pts, fx, sizes: SIZES };

  const cases = selectSuites(suiteNames).flatMap((suite) =>
    suite.instantiate(context),
  );

  if (!filter) return cases;
  const needle = filter.toLowerCase();
  return cases.filter((c) => c.id.toLowerCase().includes(needle));
}
