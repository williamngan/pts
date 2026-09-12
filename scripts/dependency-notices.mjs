import { createRequire } from "node:module";
import { readFile, readdir } from "node:fs/promises";
import { dirname, join, parse } from "node:path";

/** Collect license texts without executing dependency code. Includes transitive
 * production dependencies conservatively, even when a browser build omits them. */
export async function dependencyNotices(names, fromFile) {
  const visited = new Set();
  const sections = [];
  async function visit(name, from) {
    const require = createRequire(from);
    let entry;
    try {
      entry = require.resolve(`${name}/package.json`);
    } catch {
      entry = require.resolve(name);
    }
    let directory = dirname(entry);
    let manifest;
    while (directory !== parse(directory).root) {
      try {
        const candidate = JSON.parse(
          await readFile(join(directory, "package.json"), "utf8"),
        );
        if (candidate.name === name) {
          manifest = candidate;
          break;
        }
      } catch {
        /* Keep walking from the resolved entry to its package root. */
      }
      directory = dirname(directory);
    }
    if (!manifest) throw new Error(`Cannot find the manifest for ${name}`);
    const key = `${name}@${manifest.version}`;
    if (visited.has(key)) return;
    visited.add(key);
    const licenses = (await readdir(directory, { withFileTypes: true }))
      .filter(
        (file) =>
          file.isFile() &&
          /^(licen[sc]e|copying|notice|thirdpartynotices)/i.test(file.name),
      )
      .map((file) => file.name)
      .sort();
    if (licenses.length === 0)
      throw new Error(`No license notice found for ${key}`);
    const texts = await Promise.all(
      licenses.map((file) => readFile(join(directory, file), "utf8")),
    );
    sections.push({
      key,
      text: `${key}\n${"=".repeat(key.length)}\n\n${texts.join("\n\n").trim()}\n`,
    });
    for (const dependency of Object.keys(manifest.dependencies ?? {}).sort()) {
      await visit(dependency, join(directory, "package.json"));
    }
  }
  for (const name of names) await visit(name, fromFile);
  return sections
    .sort((a, b) => a.key.localeCompare(b.key))
    .map((section) => section.text)
    .join("\n");
}
