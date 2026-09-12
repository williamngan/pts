import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { dependencyNotices } from "./dependency-notices.mjs";

const root = new URL("../", import.meta.url);
const checking = process.argv.includes("--check");
const assets = [
  ["vue", "dist/vue.global.prod.js", "vue.min.js"],
  ["markdown-it", "dist/markdown-it.min.js", "markdown-it.min.js"],
];

const notices =
  "Website documentation dependencies (not Pts runtime dependencies).\n" +
  "Includes transitive production dependencies conservatively; some are not in the browser build.\n\n" +
  (await dependencyNotices(
    assets.map(([name]) => name),
    new URL("package.json", root),
  ));
const noticeFile = new URL("docs/js/THIRD-PARTY-NOTICES.txt", root);
if (checking) {
  assert.equal(
    await readFile(noticeFile, "utf8"),
    notices,
    "Documentation dependency notices are stale",
  );
} else {
  await writeFile(noticeFile, notices);
}

// The site is served directly from Git. Vendor the pinned production builds
// reproducibly, including their license notices, and detect dependency drift.
for (const [name, source, output] of assets) {
  const dependency = new URL(`node_modules/${name}/`, root);
  const { version } = JSON.parse(
    await readFile(new URL("package.json", dependency), "utf8"),
  );
  const bytes = await readFile(new URL(source, dependency));
  const target = new URL(`docs/js/${output}`, root);
  if (checking) {
    assert.ok(
      bytes.equals(await readFile(target)),
      `${output} differs from ${name}@${version}; run pnpm build:docs-runtime`,
    );
  } else {
    await writeFile(target, bytes);
  }
  console.log(`${checking ? "Verified" : "Vendored"} ${name}@${version}`);
}
