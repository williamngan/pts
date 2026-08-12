/**
 * Regression gating.
 *
 * Two rules keep this from crying wolf on a busy machine while still catching
 * real regressions:
 *
 *  1. Compare medians, not means. A scheduler hiccup moves the mean far more
 *     than it moves the median.
 *  2. Require a delta to clear *both* a relative threshold and the combined
 *     margin of error of the two measurements. One bar alone is either too
 *     twitchy or too deaf.
 *
 * A case whose own margin of error is above `noiseCeiling` is reported but
 * never gated: the measurement is not good enough to draw a conclusion from,
 * and pretending otherwise is how a perf gate loses its credibility.
 */

export const DEFAULT_THRESHOLDS = {
  micro: 8,
  scenario: 5,
  allocation: 2,
  noiseCeiling: 5,
  /** Fraction of paired rounds that must agree on the direction of a change. */
  agreement: 0.8,
};

function thresholdFor(suite, thresholds) {
  return suite === "scenarios" ? thresholds.scenario : thresholds.micro;
}

function index(results) {
  const map = new Map();
  for (const result of results || []) map.set(result.id, result);
  return map;
}

/**
 * @param baseline  a recorded report
 * @param head      the report to judge
 */
export function compareReports(baseline, head, options = {}) {
  const thresholds = { ...DEFAULT_THRESHOLDS, ...(options.thresholds ?? {}) };
  const baseResults = index(baseline.results);
  const headResults = index(head.results);
  const entries = [];

  for (const [id, headResult] of headResults) {
    const baseResult = baseResults.get(id);
    if (!baseResult) {
      entries.push({ id, verdict: "added", deltaPct: 0 });
      continue;
    }
    entries.push(
      classify(
        id,
        baseResult,
        headResult,
        thresholdFor(headResult.suite, thresholds),
        thresholds,
      ),
    );
  }

  for (const id of baseResults.keys()) {
    if (!headResults.has(id))
      entries.push({ id, verdict: "removed", deltaPct: 0 });
  }

  entries.sort((a, b) => b.deltaPct - a.deltaPct);

  const allocation = compareAllocations(
    baseline.allocations,
    head.allocations,
    thresholds.allocation,
  );

  return {
    entries,
    counts: tally(entries),
    allocation,
    thresholds,
    comparable: describeComparability(baseline, head),
  };
}

function classify(id, base, head, threshold, thresholds) {
  const baseNsPerItem = base.nsPerItem;
  const headNsPerItem = head.nsPerItem;
  const deltaPct = ((headNsPerItem - baseNsPerItem) / baseNsPerItem) * 100;

  const entry = {
    id,
    suite: head.suite,
    baseNsPerItem,
    headNsPerItem,
    deltaPct,
    baseRme: base.rme,
    headRme: head.rme,
  };

  if (
    base.rme > thresholds.noiseCeiling ||
    head.rme > thresholds.noiseCeiling
  ) {
    return { ...entry, verdict: "too-noisy" };
  }

  // The delta has to beat both the fixed threshold and the noise the two
  // measurements admit to between them.
  const noiseBar = base.rme + head.rme;
  const magnitude = Math.abs(deltaPct);
  if (magnitude < threshold || magnitude < noiseBar) {
    return { ...entry, verdict: "unchanged" };
  }

  // Paired sign test. When both sides were measured over the same rounds, a
  // real difference points the same way in nearly every round, while noise
  // changes its mind. This is what stops a case that happened to drift in one
  // direction from being read as a regression.
  const agreement = directionAgreement(base, head, deltaPct);
  if (agreement !== null && agreement < thresholds.agreement) {
    return { ...entry, verdict: "too-noisy", agreement };
  }

  return {
    ...entry,
    agreement,
    verdict: deltaPct > 0 ? "slower" : "faster",
  };
}

/**
 * Fraction of rounds in which the difference pointed the same way as the
 * overall result. `null` when the two sides were not measured in paired rounds.
 */
function directionAgreement(base, head, deltaPct) {
  const a = base.roundValues;
  const b = head.roundValues;
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
    return null;
  }
  if (a.length < 3) return null;

  const expected = Math.sign(deltaPct);
  let agree = 0;
  for (let i = 0; i < a.length; i++) {
    if (Math.sign(b[i] - a[i]) === expected) agree += 1;
  }
  return agree / a.length;
}

/**
 * Allocation is deterministic, so it gets a tight threshold and no noise
 * allowance. A change here is a change in what the code does, not in how busy
 * the machine was.
 */
function compareAllocations(baseAllocations, headAllocations, threshold) {
  const base = index(baseAllocations);
  const head = index(headAllocations);
  const entries = [];

  for (const [id, headEntry] of head) {
    const baseEntry = base.get(id);
    if (!baseEntry) continue;
    if (baseEntry.bytesPerItem === 0 && headEntry.bytesPerItem === 0) continue;

    const from = baseEntry.bytesPerItem || Number.EPSILON;
    const deltaPct = ((headEntry.bytesPerItem - from) / from) * 100;
    const magnitude = Math.abs(deltaPct);

    entries.push({
      id,
      baseBytesPerItem: baseEntry.bytesPerItem,
      headBytesPerItem: headEntry.bytesPerItem,
      deltaPct,
      verdict:
        magnitude < threshold
          ? "unchanged"
          : deltaPct > 0
            ? "slower"
            : "faster",
    });
  }

  entries.sort((a, b) => b.deltaPct - a.deltaPct);
  return { entries, counts: tally(entries) };
}

function tally(entries) {
  const counts = {
    faster: 0,
    slower: 0,
    unchanged: 0,
    "too-noisy": 0,
    added: 0,
    removed: 0,
  };
  for (const entry of entries) counts[entry.verdict] += 1;
  return counts;
}

/**
 * Timing numbers are only comparable within one machine. Rather than refuse,
 * this reports exactly what differs and lets the caller decide.
 */
function describeComparability(baseline, head) {
  const problems = [];
  const a = baseline.environment ?? {};
  const b = head.environment ?? {};

  if (baseline.environmentKey !== head.environmentKey) {
    problems.push(
      `different machine (${baseline.environmentKey} vs ${head.environmentKey})`,
    );
  }
  if (a.gcExposed !== b.gcExposed) {
    problems.push(`--expose-gc differs (${a.gcExposed} vs ${b.gcExposed})`);
  }
  if (baseline.timing?.time !== head.timing?.time) {
    problems.push(
      `different measurement time (${baseline.timing?.time}ms vs ${head.timing?.time}ms)`,
    );
  }

  return { ok: problems.length === 0, problems };
}

/** Machine speed factor from the calibration cases, if both runs have them. */
export function calibrationDrift(baseline, head) {
  const base = index(baseline.results);
  const current = index(head.results);
  const ratios = [];

  for (const [id, entry] of current) {
    if (!id.startsWith("calibration/")) continue;
    const other = base.get(id);
    if (other) ratios.push(entry.nsPerItem / other.nsPerItem);
  }

  if (ratios.length === 0) return null;
  const mean = ratios.reduce((sum, r) => sum + r, 0) / ratios.length;
  return { factor: mean, driftPct: (mean - 1) * 100 };
}
