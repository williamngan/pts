import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const input = process.argv[2];
assert.ok(
  input,
  "usage: node scripts/check-runtime.mjs <package.tgz|directory>",
);

let tarball = path.resolve(input);
if (!tarball.endsWith(".tgz")) {
  const candidates = (await readdir(tarball)).filter((file) =>
    file.endsWith(".tgz"),
  );
  assert.equal(candidates.length, 1, "expected exactly one package tarball");
  tarball = path.join(tarball, candidates[0]);
}

const fixture = await mkdtemp(path.join(tmpdir(), "pts-runtime-"));
try {
  await mkdir(path.join(fixture, "app"));
  await writeFile(
    path.join(fixture, "app", "package.json"),
    `${JSON.stringify({ name: "pts-runtime-smoke", private: true, type: "module" }, null, 2)}\n`,
  );
  execFileSync(
    "npm",
    [
      "install",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      "--no-package-lock",
      tarball,
    ],
    { cwd: path.join(fixture, "app"), stdio: "inherit" },
  );
  await writeFile(
    path.join(fixture, "app", "esm.mjs"),
    `
      import assert from "node:assert/strict";
      import { Pt } from "pts";
      assert.equal(new Pt(1, 2).add(2).toString(), "Pt(3, 4)");
      assert.match(import.meta.resolve("pts"), /index\\.mjs$/);
    `,
  );
  await writeFile(
    path.join(fixture, "app", "cjs.cjs"),
    `
      const assert = require("node:assert/strict");
      const { Pt } = require("pts");
      assert.equal(new Pt(1, 2).multiply(2).toString(), "Pt(2, 4)");
      assert.match(require.resolve("pts"), /index\\.js$/);
    `,
  );
  execFileSync(process.execPath, ["esm.mjs"], {
    cwd: path.join(fixture, "app"),
    stdio: "inherit",
  });
  execFileSync(process.execPath, ["cjs.cjs"], {
    cwd: path.join(fixture, "app"),
    stdio: "inherit",
  });
  console.log(`ESM and CommonJS runtime checks passed on ${process.version}.`);
} finally {
  await rm(fixture, { force: true, recursive: true });
}
