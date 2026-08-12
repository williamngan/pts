/**
 * Environment fingerprinting.
 *
 * Timing results are only comparable within one machine and one build. The
 * fingerprint makes an incomparable pair detectable instead of silently
 * believed.
 */

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import os from "node:os";

function slug(text) {
  return text
    .toLowerCase()
    .replace(/\(r\)|\(tm\)|cpu|processor/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function hashFile(path) {
  try {
    return createHash("sha256")
      .update(await readFile(path))
      .digest("hex")
      .slice(0, 16);
  } catch {
    return null;
  }
}

export async function describeEnvironment(distPath) {
  const cpus = os.cpus();
  const model = cpus[0] ? cpus[0].model.trim() : "unknown";

  return {
    node: process.version,
    v8: process.versions.v8,
    platform: process.platform,
    arch: process.arch,
    release: os.release(),
    cpu: model,
    cores: cpus.length,
    memoryGb: Math.round(os.totalmem() / 1024 ** 3),
    gcExposed: typeof globalThis.gc === "function",
    distHash: distPath ? await hashFile(distPath) : null,
  };
}

/**
 * Identity of the *machine*, not the build. Baselines are stored per key; the
 * build hash is recorded separately because it is expected to change.
 */
export function environmentKey(env) {
  const major = env.node.replace(/^v/, "").split(".")[0];
  return `node${major}-${env.platform}-${env.arch}-${slug(env.cpu)}`;
}

/** A high load average means the numbers are not worth much. */
export function loadSnapshot() {
  const [one] = os.loadavg();
  return { loadavg1: Number(one.toFixed(2)), cores: os.cpus().length };
}
