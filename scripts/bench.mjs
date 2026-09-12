#!/usr/bin/env node
/**
 * Pts benchmark CLI.
 *
 *   node scripts/bench.mjs                     run every suite and print a table
 *   node scripts/bench.mjs --suite pt --quick  iterate on one suite quickly
 *   node scripts/bench.mjs --memory            profile allocation instead of time
 *   node scripts/bench.mjs --record            store a baseline for this machine
 *   node scripts/bench.mjs --compare           report against the stored baseline
 *   node scripts/bench.mjs --against master    A/B this tree against a git ref
 *
 * See plans/PERFORMANCE-BENCHMARK-PLAN.md for the reasoning behind the design.
 */

import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

import {
  calibrationDrift,
  compareReports,
  DEFAULT_THRESHOLDS,
} from "../bench/lib/compare.mjs";
import {
  describeEnvironment,
  environmentKey,
  loadSnapshot,
} from "../bench/lib/env.mjs";
import { build, instantiate, loadPts, repoRoot } from "../bench/lib/load.mjs";
import {
  createAllocationProfiler,
  measureAllocation,
} from "../bench/lib/memory.mjs";
import {
  reportAllocations,
  reportComparison,
  reportResults,
  reportSummary,
} from "../bench/lib/report.mjs";
import {
  aggregateRounds,
  DEFAULT_TIMING,
  QUICK_TIMING,
  runCases,
} from "../bench/lib/runner.mjs";
import { resolveRef, withWorktree } from "../bench/lib/worktree.mjs";

const DIST = new URL("dist/index.mjs", repoRoot).pathname;
const BASELINE_DIR = new URL("bench/baselines/", repoRoot);

const { values: flags } = parseArgs({
  options: {
    suite: { type: "string", multiple: true },
    filter: { type: "string" },
    quick: { type: "boolean", default: false },
    time: { type: "string" },
    build: { type: "boolean", default: true },
    json: { type: "string" },
    record: { type: "boolean", default: false },
    memory: { type: "boolean", default: false },
    compare: { type: "boolean", default: false },
    baseline: { type: "string" },
    against: { type: "string" },
    rounds: { type: "string" },
    threshold: { type: "string" },
    gate: { type: "boolean", default: false },
    // internal: used when this script re-runs itself to measure one build in
    // isolation, see runAgainstRef
    dist: { type: "string" },
    silent: { type: "boolean", default: false },
    force: { type: "boolean", default: false },
    help: { type: "boolean", default: false },
  },
  allowNegative: true,
});

if (flags.help) {
  process.stdout.write(
    [
      "Usage: node scripts/bench.mjs [options]",
      "",
      "  --suite <name>     run only this suite (repeatable)",
      "  --filter <text>    run only cases whose id contains <text>",
      "  --quick            short timings, for iterating during development",
      "  --time <ms>        measurement time per case",
      "  --no-build         skip the tsdown build and use the current dist/",
      "  --memory           profile allocation instead of time",
      "  --json <path>      write the raw report to <path>",
      "  --record           store timing and allocation as this machine's baseline",
      "  --compare          report against the stored baseline for this machine",
      "  --baseline <path>  compare against a specific report file",
      "  --against <ref>    build <ref> in a temp worktree and A/B against it",
      "  --rounds <n>       independent measurement rounds (default 1, 5 with --against)",
      "  --threshold <pct>  regression threshold for micro cases (default 8)",
      "  --gate             make --compare fail on a regression (--against always does)",
      "  --force            compare even when the environments do not match",
      "",
      "--against exits non-zero on a regression; --compare needs --gate.",
      "",
    ].join("\n"),
  );
  process.exit(0);
}

/** Fixed significant digits keep re-recorded baselines diff-friendly. */
function round(value, digits = 6) {
  if (!Number.isFinite(value) || value === 0) return value;
  return Number(value.toPrecision(digits));
}

function serialize(results) {
  return results.map((r) => ({
    id: r.id,
    suite: r.suite,
    name: r.name,
    batch: r.batch,
    nsPerItem: round(r.nsPerItem),
    hz: round(r.hz),
    median: round(r.median),
    p99: round(r.p99),
    rme: round(r.rme, 4),
    samples: r.samples,
    ...(r.roundValues
      ? { roundValues: r.roundValues.map((v) => round(v)) }
      : {}),
  }));
}

function serializeAllocations(allocations) {
  return allocations.map((a) => ({
    id: a.id,
    suite: a.suite,
    name: a.name,
    batch: a.batch,
    iterations: a.iterations,
    bytesPerItem: round(a.bytesPerItem, 5),
    bytesPerCall: round(a.bytesPerCall, 5),
  }));
}

const progress = (testCase, index, total) => {
  if (process.stderr.isTTY) {
    const label = testCase.label ? `${testCase.label} ` : "";
    process.stderr.write(
      `\r[${String(index + 1).padStart(3)}/${total}] ${label}${testCase.id}`.padEnd(
        90,
      ),
    );
  }
};

const clearProgress = () => {
  if (process.stderr.isTTY) process.stderr.write("\r".padEnd(91) + "\r");
};

async function profileAllocations(cases, onCase) {
  const profiler = createAllocationProfiler();
  await profiler.start();
  try {
    const out = [];
    for (let index = 0; index < cases.length; index++) {
      onCase?.(cases[index], index, cases.length);
      out.push(await measureAllocation(profiler, cases[index]));
    }
    return out;
  } finally {
    await profiler.close();
  }
}

function selectedCases(Pts) {
  const cases = instantiate(Pts, {
    suiteNames: flags.suite,
    filter: flags.filter,
  });
  if (cases.length === 0) {
    throw new Error("no benchmark cases matched the given --suite / --filter");
  }
  return cases;
}

function timingOptions() {
  const timing = { ...(flags.quick ? QUICK_TIMING : DEFAULT_TIMING) };
  if (flags.time) timing.time = Number(flags.time);
  return timing;
}

function roundCount(fallback) {
  return flags.rounds ? Math.max(1, Number(flags.rounds)) : fallback;
}

/**
 * Run the same cases several times over and aggregate.
 *
 * `makeCases` is called per round so an A/B comparison can flip which side goes
 * first, which cancels any systematic advantage from running second.
 */
async function runRounds(makeCases, timing, rounds) {
  const collected = [];
  for (let round = 0; round < rounds; round++) {
    const cases = makeCases(round);
    collected.push(
      await runCases(cases, {
        timing,
        onCase: (testCase, index, total) => {
          if (process.stderr.isTTY) {
            const label = testCase.label ? `${testCase.label} ` : "";
            process.stderr.write(
              `\r[round ${round + 1}/${rounds}] [${String(index + 1).padStart(3)}/${total}] ${label}${testCase.id}`.padEnd(
                100,
              ),
            );
          }
        },
      }),
    );
  }
  return aggregateRounds(collected);
}

function thresholds() {
  if (!flags.threshold) return DEFAULT_THRESHOLDS;
  const micro = Number(flags.threshold);
  return { ...DEFAULT_THRESHOLDS, micro, scenario: Math.max(1, micro - 3) };
}

async function buildReport({
  results,
  allocations,
  environment,
  timing,
  load,
}) {
  return {
    version: 1,
    createdAt: new Date().toISOString(),
    environment,
    environmentKey: environmentKey(environment),
    timing,
    load,
    results: serialize(results),
    allocations: serializeAllocations(allocations),
  };
}

/**
 * Print a comparison, and set the exit code when `gate` is on and it found a
 * regression.
 *
 * Only `--against` gates by default. Comparing against a stored baseline is a
 * cross-session comparison, and the heap and GC state a run starts from is not
 * the state the baseline was recorded in. Re-recording a baseline and
 * immediately comparing an unchanged tree against it produced 14 "slower"
 * verdicts out of 334 cases, between 5% and 16%, every one of them
 * allocation-heavy and every one in the same direction — while both calibration
 * cases stayed flat. `--against` measures both sides in one session, alternating,
 * which is why it can gate and this cannot.
 */
function presentComparison(comparison, { baselineLabel, headLabel, gate }) {
  if (!comparison.comparable.ok) {
    const detail = comparison.comparable.problems.join("; ");
    if (flags.force) {
      process.stderr.write(`warning: comparing anyway — ${detail}\n`);
    } else {
      throw new Error(
        `refusing to compare: ${detail}. Re-record the baseline here, or pass --force.`,
      );
    }
  }

  const interesting = comparison.entries.filter(
    (entry) => entry.verdict !== "unchanged",
  );
  process.stdout.write(
    `\n${baselineLabel} -> ${headLabel}\n\n` +
      (interesting.length > 0
        ? reportComparison({ ...comparison, entries: interesting }) + "\n\n"
        : "no case changed beyond the noise threshold\n\n") +
      `timing:     ${reportSummary(comparison)}\n`,
  );

  if (comparison.allocation.entries.length > 0) {
    const changed = comparison.allocation.entries.filter(
      (entry) => entry.verdict !== "unchanged",
    );
    process.stdout.write(
      `allocation: ${reportSummary(comparison.allocation)}` +
        (changed.length > 0
          ? `\n${changed
              .map(
                (entry) =>
                  `  ${entry.verdict === "slower" ? "+" : ""}${entry.deltaPct.toFixed(1)}%  ${entry.id}`,
              )
              .join("\n")}`
          : "") +
        "\n",
    );
  }

  const regressions =
    comparison.counts.slower + comparison.allocation.counts.slower;
  if (regressions === 0) return;

  if (gate) {
    process.stderr.write(`\n${regressions} regression(s) found\n`);
    process.exitCode = 1;
  } else {
    process.stderr.write(
      `\n${regressions} case(s) look slower. Cross-session drift alone can ` +
        "produce this — confirm with: node --expose-gc scripts/bench.mjs --against <ref>\n",
    );
  }
}

/**
 * Measure one build by re-running this script in a fresh process.
 *
 * Loading both builds into a single process looked attractive — perfect
 * interleaving, no process overhead — but it is measurably biased. Two copies
 * of the same class in one heap make shape-sensitive call sites polymorphic,
 * and the build that is loaded second consistently loses: on byte-identical
 * builds it showed `Pt.equals` and `Bound.clone` about 8% "slower", every
 * round, with a low spread. That is indistinguishable from a real regression.
 *
 * A fresh process per side per round costs about 100ms and removes the bias
 * entirely.
 */
async function measureBuildInChildProcess(distPath) {
  const out = join(await mkdtemp(join(tmpdir(), "pts-bench-run-")), "out.json");
  const args = [
    "--expose-gc",
    fileURLToPath(import.meta.url),
    "--dist",
    distPath,
    "--json",
    out,
    "--no-build",
    "--silent",
  ];
  if (flags.quick) args.push("--quick");
  if (flags.time) args.push("--time", flags.time);
  if (flags.filter) args.push("--filter", flags.filter);
  for (const suite of flags.suite ?? []) args.push("--suite", suite);

  const result = spawnSync(process.execPath, args, {
    stdio: ["ignore", "ignore", "inherit"],
  });
  if (result.status !== 0) {
    throw new Error(`benchmark subprocess failed (status ${result.status})`);
  }

  const report = JSON.parse(await readFile(out, "utf8"));
  await rm(dirname(out), { recursive: true, force: true });
  return report.results;
}

/**
 * A/B against a git ref.
 *
 * Each round measures both builds, in separate processes, alternating which
 * side goes first so drift and thermal effects do not land systematically on
 * one of them.
 */
async function runAgainstRef() {
  const ref = flags.against;
  const sha = resolveRef(ref, repoRoot.pathname);
  process.stderr.write(`benchmarking working tree against ${ref} (${sha})\n`);

  if (flags.build) {
    process.stderr.write("building working tree ...\n");
    build();
  }

  await withWorktree(ref, repoRoot.pathname, async (worktreePath) => {
    process.stderr.write(`building ${ref} ...\n`);
    build(worktreePath);

    const basePath = `${worktreePath}/dist/index.mjs`;
    const timing = timingOptions();
    const rounds = roundCount(5);
    const environment = await describeEnvironment(DIST);

    const baseRounds = [];
    const headRounds = [];
    for (let round = 0; round < rounds; round++) {
      process.stderr.write(`round ${round + 1}/${rounds} ...\n`);
      // flip the order each round so neither side always runs on a warmer machine
      if (round % 2 === 0) {
        baseRounds.push(await measureBuildInChildProcess(basePath));
        headRounds.push(await measureBuildInChildProcess(DIST));
      } else {
        headRounds.push(await measureBuildInChildProcess(DIST));
        baseRounds.push(await measureBuildInChildProcess(basePath));
      }
    }

    const baseReport = await buildReport({
      results: aggregateRounds(baseRounds),
      allocations: [],
      environment,
      timing,
      load: {},
    });
    const headReport = await buildReport({
      results: aggregateRounds(headRounds),
      allocations: [],
      environment,
      timing,
      load: {},
    });

    process.stderr.write(
      `\n${rounds} round(s), each build in its own process; ` +
        "the error column is the observed spread across rounds\n",
    );
    presentComparison(
      compareReports(baseReport, headReport, { thresholds: thresholds() }),
      {
        baselineLabel: `${ref} (${sha})`,
        headLabel: "working tree",
        gate: true,
      },
    );
  });
}

async function readBaseline(environment) {
  const path = flags.baseline
    ? new URL(flags.baseline, `file://${process.cwd()}/`)
    : new URL(`${environmentKey(environment)}.json`, BASELINE_DIR);
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch {
    throw new Error(
      `no baseline at ${path.pathname}. Record one with: node --expose-gc scripts/bench.mjs --record`,
    );
  }
}

async function main() {
  if (flags.against) return runAgainstRef();

  if (flags.build) {
    process.stderr.write("building dist ...\n");
    build();
  }

  const distPath = flags.dist ?? DIST;
  const Pts = await loadPts(distPath);
  const cases = selectedCases(Pts);
  const timing = timingOptions();
  const environment = await describeEnvironment(distPath);
  const loadBefore = loadSnapshot();

  // Only timing runs care about GC noise; the allocation pass counts
  // allocations as they happen and is unaffected.
  if (!environment.gcExposed && !flags.memory) {
    process.stderr.write(
      "note: run with --expose-gc for less cross-case GC noise\n",
    );
  }
  if (loadBefore.loadavg1 > loadBefore.cores * 0.3) {
    process.stderr.write(
      `warning: load average is ${loadBefore.loadavg1}; results will be noisy\n`,
    );
  }

  const wantsTiming = !flags.memory;
  const wantsAllocation = flags.memory || flags.record;

  let results = [];
  if (wantsTiming) {
    results = await runRounds(() => cases, timing, roundCount(1));
    clearProgress();
    if (!flags.silent) process.stdout.write(reportResults(results) + "\n");
  }

  let allocations = [];
  if (wantsAllocation) {
    allocations = await profileAllocations(cases, progress);
    clearProgress();
    if (!flags.silent) {
      if (wantsTiming) process.stdout.write("\n");
      process.stdout.write(reportAllocations(allocations) + "\n");
    }
  }

  const report = await buildReport({
    results,
    allocations,
    environment,
    timing,
    load: { before: loadBefore, after: loadSnapshot() },
  });

  if (flags.json) {
    await writeFile(flags.json, JSON.stringify(report, null, 2) + "\n");
    process.stderr.write(`wrote ${flags.json}\n`);
  }

  if (flags.record) {
    if (flags.suite || flags.filter || flags.quick) {
      throw new Error(
        "--record needs a complete, full-length run: drop --suite/--filter/--quick",
      );
    }
    await mkdir(BASELINE_DIR, { recursive: true });
    const path = new URL(`${report.environmentKey}.json`, BASELINE_DIR);
    await writeFile(path, JSON.stringify(report, null, 2) + "\n");
    process.stderr.write(`recorded baseline ${path.pathname}\n`);
  }

  if (flags.compare) {
    const baseline = await readBaseline(environment);
    const drift = calibrationDrift(baseline, report);
    if (drift && Math.abs(drift.driftPct) > 10) {
      process.stderr.write(
        `warning: calibration is ${drift.driftPct.toFixed(1)}% off the baseline's; ` +
          "this machine is not performing as it did when the baseline was taken\n",
      );
    }
    presentComparison(
      compareReports(baseline, report, { thresholds: thresholds() }),
      {
        baselineLabel: `baseline ${baseline.createdAt}`,
        headLabel: "current",
        gate: flags.gate,
      },
    );
  }
}

main().catch((error) => {
  process.stderr.write(`\n${error.message}\n`);
  if (error.cause) process.stderr.write(`${error.cause.stack}\n`);
  process.exitCode = 1;
});
