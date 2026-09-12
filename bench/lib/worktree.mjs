/**
 * Temporary git worktrees, for benchmarking a ref against the working tree.
 *
 * Comparing against a stored baseline answers "is this faster than it was in
 * July, on that machine". Comparing against a ref answers "did my change help",
 * which is the question an optimization campaign actually asks — same machine,
 * same process, same thermal state, back to back.
 */

import { spawnSync } from "node:child_process";
import { mkdtemp, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

function git(args, cwd) {
  const result = spawnSync("git", args, { cwd, encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(
      `git ${args.join(" ")} failed: ${(result.stderr || "").trim()}`,
    );
  }
  return result.stdout.trim();
}

export function resolveRef(ref, repoPath) {
  return git(["rev-parse", "--short", ref], repoPath);
}

/**
 * Check `ref` out into a throwaway worktree and hand back its path.
 *
 * The repo's `node_modules` is symlinked in rather than reinstalled: the build
 * only needs the toolchain, and installing a second copy would cost more than
 * the benchmark run. The caveat is that the ref is built with the working
 * tree's toolchain versions, which is the right trade for nearby commits and
 * the wrong one for a ref from a different dependency era.
 */
export async function withWorktree(ref, repoPath, fn) {
  const root = await mkdtemp(join(tmpdir(), "pts-bench-"));
  const path = join(root, "tree");

  git(["worktree", "add", "--detach", path, ref], repoPath);
  try {
    await symlink(join(repoPath, "node_modules"), join(path, "node_modules"));
    return await fn(path);
  } finally {
    try {
      git(["worktree", "remove", "--force", path], repoPath);
    } catch {
      // the worktree may already be gone; the temp dir removal below is enough
    }
    await rm(root, { recursive: true, force: true });
  }
}
