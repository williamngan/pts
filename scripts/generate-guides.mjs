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

for (const rule of ["fence", "code_block"]) {
  const render = markdown.renderer.rules[rule];
  markdown.renderer.rules[rule] = (...args) =>
    render(...args).replace("<pre>", '<pre tabindex="0">');
}

// Resolve API links before publishing HTML. Class casing and static-member
// qualifiers come from TypeDoc rather than a browser-side naming heuristic.
markdown.renderer.rules.link_open = (tokens, index, options, env, self) => {
  const token = tokens[index];
  const href = token.attrGet("href");
  if (href === "#play-quickstart") {
    token.attrSet("href", "../demo/?name=pts.quickStart");
  } else if (href?.startsWith("#")) {
    const api = env.apiLinks?.get(href.slice(1));
    assert.ok(api, `Unknown guide API link ${href}`);
    const label = tokens[index + 1]?.content ?? "";
    const name = label.split(".").at(-1);
    let hash = "";
    if (name !== api.document.name) {
      for (const [key, prefix] of [
        ["methods", "function"],
        ["accessors", "accessor"],
        ["properties", "property"],
        ["variables", "property"],
      ]) {
        const member = api.document[key]?.find(
          (member) => member.name === name,
        );
        if (member) {
          hash = `#${prefix}_${prefix === "function" && member.flags?.isStatic ? "static_" : ""}${member.name}`;
          break;
        }
      }
    }
    token.attrSet("href", `../docs/?p=${api.page}${hash}`);
  }
  return self.renderToken(tokens, index, options);
};

async function apiLinkIndex() {
  const directory = path.join(projectRoot, "docs", "json", "class");
  const links = new Map();
  for (const file of await readdir(directory)) {
    if (!file.endsWith(".json")) continue;
    const document = JSON.parse(
      await readFile(path.join(directory, file), "utf8"),
    );
    const page = file.slice(0, -5);
    links.set(page.replace("_", "-").toLowerCase(), { page, document });
  }
  return links;
}

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
    for (const [, specifier] of source.matchAll(
      /from\s+["'](pts\/[^"']+)["']/gu,
    )) {
      await access(
        path.join(projectRoot, specifier.slice("pts/".length)),
      ).catch(() => {
        throw new Error(
          `Guide ${file} imports missing package artifact ${specifier}`,
        );
      });
    }
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
  return `<nav id="menu" aria-label="Guide chapters"><a id="close" href="#" aria-label="Close guide menu">&times;</a><ol>${links}</ol></nav>`;
}

// Guide pages that were published under these names before 1.0. Inbound links
// from outside the site still resolve, to the page that replaced them.
const movedPages = {
  "Extensions-8000.html": "Ecosystem-8000.html",
  "Technical-notes-9000.html": "Changelog-9100.html",
};

function renderRedirect(guide) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
\t<title>Pts</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <link rel="canonical" href="./${guide.output}">
  <meta http-equiv="refresh" content="0; url=./${guide.output}">
</head>

<body>
  <p>This page has moved. Continue to <a href="./${guide.output}">${escapeHtml(guide.title)}</a>.</p>
</body>
</html>
`;
}

function renderIndex(firstGuide) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
\t<title>Pts</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="alternate" type="text/markdown" href="/guide.md" title="Complete Pts guides and demos">
  <meta http-equiv="refresh" content="0; url=./${firstGuide.output}">
</head>

<body>
  <p>Continue to <a href="./${firstGuide.output}">${escapeHtml(firstGuide.title)}</a>.</p>
</body>
</html>
`;
}

async function expectedOutputs() {
  const apiLinks = await apiLinkIndex();
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
      markdown.render(guide.source, { apiLinks }),
    );
    outputs.set(guide.output, page);
  }
  outputs.set("index.html", renderIndex(guides[0]));
  for (const [legacy, current] of Object.entries(movedPages)) {
    const target = guides.find((guide) => guide.output === current);
    assert.ok(
      target,
      `Moved page ${legacy} points at missing guide ${current}`,
    );
    assert.equal(outputs.has(legacy), false, `${legacy} is a current guide`);
    outputs.set(legacy, renderRedirect(target));
  }
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
