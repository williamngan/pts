#!/usr/bin/env node

import assert from "node:assert/strict";
import { access, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import MarkdownIt from "markdown-it";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const guideDirectory = path.join(projectRoot, "guide");
const markdownDirectory = path.join(guideDirectory, "md");
const exampleDirectory = path.join(guideDirectory, "js", "examples");
const assetsDirectory = path.join(guideDirectory, "assets");

const markdown = new MarkdownIt({
  html: false,
  xhtmlOut: false,
  breaks: false,
  linkify: false,
  typographer: false,
});

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function replaceToken(template, token, value) {
  const matches = template.split(token).length - 1;
  assert.equal(matches, 1, `Guide template must contain one ${token} token`);
  return template.replace(token, () => value);
}

function imageTokens(tokens) {
  const images = [];
  for (const token of tokens) {
    if (token.type === "image") images.push(token);
    if (token.children) images.push(...imageTokens(token.children));
  }
  return images;
}

async function readGuideSources() {
  const files = (await readdir(markdownDirectory))
    .filter((file) => file.endsWith(".md"))
    .sort();
  const guides = [];
  const orders = new Set();
  const outputs = new Set();

  for (const file of files) {
    const match = /^_(\d{4})_([A-Za-z0-9_]+)\.md$/u.exec(file);
    assert.ok(match, `Guide source ${file} must be named _NNNN_Page_name.md`);

    const [, order, sourceName] = match;
    const output = `${sourceName.replaceAll("_", "-")}-${order}.html`;
    assert.equal(orders.has(order), false, `Duplicate guide order ${order}`);
    assert.equal(
      outputs.has(output),
      false,
      `Duplicate guide output ${output}`,
    );
    orders.add(order);
    outputs.add(output);

    const source = (
      await readFile(path.join(markdownDirectory, file), "utf8")
    ).replaceAll("\r\n", "\n");
    const tokens = markdown.parse(source, {});
    const headings = tokens
      .map((token, index) => ({ token, index }))
      .filter(
        ({ token }) => token.type === "heading_open" && token.tag === "h1",
      );
    assert.equal(
      headings.length,
      1,
      `Guide ${file} must contain exactly one H1`,
    );
    assert.equal(
      headings[0].index,
      0,
      `Guide ${file} must start with its H1 title`,
    );
    const titleToken = tokens[headings[0].index + 1];
    assert.equal(titleToken?.type, "inline", `Guide ${file} has an invalid H1`);
    const title = titleToken.content.trim();
    assert.ok(title, `Guide ${file} has an empty H1`);

    const demos = [];
    for (const image of imageTokens(tokens)) {
      if (!image.content.startsWith("js:")) continue;
      const id = image.content.slice(3);
      assert.match(
        id,
        /^[A-Za-z0-9_-]+$/u,
        `Guide ${file} has invalid demo id ${id}`,
      );
      assert.equal(
        demos.includes(id),
        false,
        `Guide ${file} repeats demo id ${id}`,
      );
      demos.push(id);
      await access(path.join(exampleDirectory, `${id}.js`));

      const preview = image.attrGet("src");
      assert.ok(preview, `Guide ${file} demo ${id} has no preview image`);
      const previewPath = path.resolve(guideDirectory, preview);
      const relativePreview = path.relative(guideDirectory, previewPath);
      assert.equal(
        relativePreview.startsWith(".."),
        false,
        `Guide ${file} demo ${id} preview is outside guide/`,
      );
      await access(previewPath);
    }

    guides.push({ file, order, output, source, title, demos });
  }

  assert.ok(guides.length > 0, "No guide Markdown sources found");
  return guides;
}

function renderMenu(guides) {
  const links = guides
    .map(
      (guide) =>
        `<li><a href="${escapeHtml(guide.output)}">${escapeHtml(guide.title)}</a></li>`,
    )
    .join("");
  return `<ol id="menu"><a id="close" href="#">&times;</a>${links}</ol>`;
}

function renderIndex(firstGuide) {
  return `<!DOCTYPE html>
<html>
<head>
\t<title>Pts</title>
  <meta charset="UTF-8">
  <link rel="alternate" type="text/markdown" href="/guide.md" title="Complete Pts guides and demos">
  <meta http-equiv="refresh" content="0; url=./${firstGuide.output}">
</head>

<body>
  <small>Redirecting...</small>
</body>
</html>
`;
}

async function expectedOutputs() {
  const [guides, template, header, footer] = await Promise.all([
    readGuideSources(),
    readFile(path.join(assetsDirectory, "template.html"), "utf8"),
    readFile(path.join(assetsDirectory, "header.html"), "utf8"),
    readFile(path.join(assetsDirectory, "footer.html"), "utf8"),
  ]);
  const menu = renderMenu(guides);
  const shared = replaceToken(
    replaceToken(
      replaceToken(template, "{{HEADER}}", header.trimEnd()),
      "{{MENU}}",
      menu,
    ),
    "{{FOOTER}}",
    footer.trimEnd(),
  );
  const outputs = new Map();

  for (const guide of guides) {
    const page = replaceToken(
      replaceToken(shared, "{{TITLE}}", escapeHtml(guide.title)),
      "{{CONTENT}}",
      markdown.render(guide.source),
    );
    outputs.set(guide.output, page);
  }
  outputs.set("index.html", renderIndex(guides[0]));
  return { guides, outputs };
}

async function generateGuides({ check = false } = {}) {
  const { guides, outputs } = await expectedOutputs();
  const changed = [];
  for (const [file, expected] of outputs) {
    const absolute = path.join(guideDirectory, file);
    if (check) {
      let actual = "";
      try {
        actual = await readFile(absolute, "utf8");
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
      if (actual !== expected) changed.push(file);
    } else {
      await writeFile(absolute, expected);
    }
  }
  assert.equal(
    changed.length,
    0,
    `Guide HTML is stale; run 'pnpm run docs'. Changed files:\n${changed.map((file) => `- guide/${file}`).join("\n")}`,
  );
  return { guides, outputs };
}

async function main() {
  const unknown = process.argv.slice(2).filter((arg) => arg !== "--check");
  assert.deepEqual(unknown, [], `Unknown arguments: ${unknown.join(" ")}`);
  const check = process.argv.includes("--check");
  const { guides } = await generateGuides({ check });
  const demos = guides.reduce((sum, guide) => sum + guide.demos.length, 0);
  console.log(
    `${check ? "Validated" : "Generated"} ${guides.length} guide pages with ${demos} live demos.`,
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  await main();
}

export { generateGuides, readGuideSources };
