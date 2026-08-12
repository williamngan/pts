/** Console rendering for benchmark results and comparisons. */

const RESET = "\u001b[0m";
const DIM = "\u001b[2m";
const BOLD = "\u001b[1m";
const RED = "\u001b[31m";
const GREEN = "\u001b[32m";
const YELLOW = "\u001b[33m";

const color = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code, text) => (color ? `${code}${text}${RESET}` : text);

export function formatDuration(ns) {
  if (!Number.isFinite(ns)) return "-";
  if (ns < 1000) return `${ns.toFixed(1)} ns`;
  if (ns < 1e6) return `${(ns / 1000).toFixed(2)} µs`;
  return `${(ns / 1e6).toFixed(2)} ms`;
}

export function formatRate(hz) {
  if (!Number.isFinite(hz)) return "-";
  if (hz >= 1e6) return `${(hz / 1e6).toFixed(2)}M/s`;
  if (hz >= 1e3) return `${(hz / 1e3).toFixed(1)}k/s`;
  return `${hz.toFixed(1)}/s`;
}

function renderTable(rows, columns) {
  const widths = columns.map((c, i) =>
    Math.max(c.header.length, ...rows.map((r) => stripAnsi(r[i]).length)),
  );
  const line = (cells) =>
    cells
      .map((cell, i) => {
        const pad = widths[i] - stripAnsi(cell).length;
        return columns[i].align === "right"
          ? " ".repeat(pad) + cell
          : cell + " ".repeat(pad);
      })
      .join("  ");

  const out = [paint(DIM, line(columns.map((c) => c.header)))];
  for (const row of rows) out.push(line(row));
  return out.join("\n");
}

function stripAnsi(text) {
  // eslint-disable-next-line no-control-regex
  return String(text).replace(/\u001b\[[0-9;]*m/g, "");
}

/** A benchmark whose margin of error is large is not worth reading closely. */
function paintRme(rme) {
  const text = `±${rme.toFixed(1)}%`;
  if (rme > 5) return paint(RED, text);
  if (rme > 2.5) return paint(YELLOW, text);
  return paint(DIM, text);
}

export function reportResults(results) {
  const bySuite = new Map();
  for (const result of results) {
    if (!bySuite.has(result.suite)) bySuite.set(result.suite, []);
    bySuite.get(result.suite).push(result);
  }

  const chunks = [];
  for (const [suite, entries] of bySuite) {
    const rows = entries.map((entry) => [
      entry.name,
      String(entry.batch),
      formatDuration(entry.nsPerItem),
      formatRate(entry.hz * entry.batch),
      paintRme(entry.rme),
    ]);
    chunks.push(
      `${paint(BOLD, suite)}\n` +
        renderTable(rows, [
          { header: "case" },
          { header: "batch", align: "right" },
          { header: "per item", align: "right" },
          { header: "items/s", align: "right" },
          { header: "error", align: "right" },
        ]),
    );
  }
  return chunks.join("\n\n");
}

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return "-";
  if (bytes < 1024) return `${bytes.toFixed(1)} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
}

export function reportAllocations(allocations) {
  const bySuite = new Map();
  for (const entry of allocations) {
    if (!bySuite.has(entry.suite)) bySuite.set(entry.suite, []);
    bySuite.get(entry.suite).push(entry);
  }

  const chunks = [];
  for (const [suite, entries] of bySuite) {
    const rows = entries.map((entry) => [
      entry.name,
      String(entry.batch),
      formatBytes(entry.bytesPerItem),
      formatBytes(entry.bytesPerCall),
    ]);
    chunks.push(
      `${paint(BOLD, suite)}\n` +
        renderTable(rows, [
          { header: "case" },
          { header: "batch", align: "right" },
          { header: "per item", align: "right" },
          { header: "per call", align: "right" },
        ]),
    );
  }
  return chunks.join("\n\n");
}

export function reportComparison(comparison) {
  const rows = [];
  for (const entry of comparison.entries) {
    const delta = `${entry.deltaPct > 0 ? "+" : ""}${entry.deltaPct.toFixed(1)}%`;
    const verdictText = {
      faster: paint(GREEN, "faster"),
      slower: paint(RED, "slower"),
      unchanged: paint(DIM, "unchanged"),
      "too-noisy": paint(YELLOW, "too noisy"),
      added: paint(DIM, "added"),
      removed: paint(DIM, "removed"),
    }[entry.verdict];

    rows.push([
      entry.id,
      formatDuration(entry.baseNsPerItem),
      formatDuration(entry.headNsPerItem),
      entry.verdict === "added" || entry.verdict === "removed" ? "-" : delta,
      verdictText,
    ]);
  }

  return renderTable(rows, [
    { header: "case" },
    { header: "baseline", align: "right" },
    { header: "current", align: "right" },
    { header: "delta", align: "right" },
    { header: "verdict" },
  ]);
}

export function reportSummary(comparison) {
  const { counts } = comparison;
  const parts = [
    `${counts.faster} faster`,
    `${counts.slower} slower`,
    `${counts.unchanged} unchanged`,
  ];
  if (counts["too-noisy"]) parts.push(`${counts["too-noisy"]} too noisy`);
  if (counts.added) parts.push(`${counts.added} added`);
  if (counts.removed) parts.push(`${counts.removed} removed`);
  return parts.join(", ");
}

export { paint, BOLD, DIM, RED, GREEN, YELLOW };
