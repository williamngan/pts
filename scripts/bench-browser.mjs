#!/usr/bin/env node
/**
 * Browser benchmark driver.
 *
 *   node scripts/bench-browser.mjs [--suite canvas] [--filter text] [--json out]
 *
 * `CanvasForm`, `SVGForm`, `HTMLForm`, `Img`, `Sound`, `Space` and `UI` cannot
 * be measured in Node, and they are where a real sketch spends its frame. This
 * runs them in headless Chromium against `dist/pts.js` — the classic script
 * artifact, which is what a `<script>` tag user actually gets.
 *
 * Files are served straight from disk through Playwright's request
 * interception rather than by adding a bundler or a dev server: the in-page
 * harness is plain ESM and tinybench already ships an ESM build.
 *
 * Browser numbers carry compositor and rasterization noise that Node numbers do
 * not, so they are reported and recorded but are not part of the regression
 * gate by default.
 */

import { readFile, writeFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { parseArgs } from "node:util";

import { chromium } from "playwright";

import { describeEnvironment, environmentKey } from "../bench/lib/env.mjs";
import { build, repoRoot } from "../bench/lib/load.mjs";
import { reportResults } from "../bench/lib/report.mjs";

const ROOT = repoRoot.pathname;
const ORIGIN = "http://pts.bench";

const { values: flags } = parseArgs({
  options: {
    suite: { type: "string", multiple: true },
    filter: { type: "string" },
    quick: { type: "boolean", default: false },
    time: { type: "string" },
    build: { type: "boolean", default: true },
    json: { type: "string" },
    headed: { type: "boolean", default: false },
    help: { type: "boolean", default: false },
  },
  allowNegative: true,
});

if (flags.help) {
  process.stdout.write(
    [
      "Usage: node scripts/bench-browser.mjs [options]",
      "",
      "  --suite <name>   canvas | form | image | sound | space (repeatable)",
      "  --filter <text>  run only cases whose id contains <text>",
      "  --quick          short timings",
      "  --time <ms>      measurement time per case",
      "  --no-build       use the current dist/ instead of rebuilding",
      "  --json <path>    write the raw report to <path>",
      "  --headed         show the browser",
      "",
    ].join("\n"),
  );
  process.exit(0);
}

const CONTENT_TYPES = {
  ".mjs": "text/javascript",
  ".js": "text/javascript",
  ".html": "text/html",
};

/**
 * Map a request path to a file on disk. `/vendor/tinybench.js` is the only
 * rewrite: the in-page harness cannot resolve a bare specifier.
 */
function resolveRequest(pathname) {
  if (pathname === "/vendor/tinybench.js") {
    return join(ROOT, "node_modules/tinybench/dist/index.js");
  }
  const resolved = join(ROOT, normalize(pathname).replace(/^(\.\.[/\\])+/, ""));
  return resolved.startsWith(ROOT) ? resolved : null;
}

const PAGE = `<!doctype html>
<meta charset="utf-8">
<title>Pts benchmarks</title>
<body></body>`;

async function main() {
  if (flags.build) {
    process.stderr.write("building dist ...\n");
    build();
  }

  const browser = await chromium.launch({ headless: !flags.headed });
  let results;
  let browserVersion;

  try {
    const page = await browser.newPage();
    browserVersion = browser.version();

    page.on("console", (message) => {
      if (message.type() === "error") {
        process.stderr.write(`page error: ${message.text()}\n`);
      }
    });

    await page.route(`${ORIGIN}/**`, async (route) => {
      const { pathname } = new URL(route.request().url());
      if (pathname === "/") {
        return route.fulfill({ contentType: "text/html", body: PAGE });
      }
      const file = resolveRequest(pathname);
      if (!file) return route.fulfill({ status: 403, body: "forbidden" });
      try {
        return route.fulfill({
          contentType:
            CONTENT_TYPES[extname(file)] ?? "application/octet-stream",
          body: await readFile(file),
        });
      } catch {
        return route.fulfill({ status: 404, body: `not found: ${pathname}` });
      }
    });

    await page.goto(`${ORIGIN}/`);
    await page.addScriptTag({ url: `${ORIGIN}/dist/pts.js` });

    results = await page.evaluate(
      async (options) => {
        const { runBrowserBenchmarks } =
          await import("/bench/browser/runner.mjs");
        return runBrowserBenchmarks(options);
      },
      {
        suite: flags.suite ?? null,
        filter: flags.filter ?? null,
        time: flags.quick ? 60 : flags.time ? Number(flags.time) : 200,
        warmupTime: flags.quick ? 25 : 80,
      },
    );
  } finally {
    await browser.close();
  }

  process.stdout.write(reportResults(results) + "\n");

  if (flags.json) {
    const environment = await describeEnvironment(
      new URL("dist/pts.js", repoRoot).pathname,
    );
    const report = {
      version: 1,
      createdAt: new Date().toISOString(),
      environment: { ...environment, browser: browserVersion },
      environmentKey: `${environmentKey(environment)}-chromium`,
      results,
    };
    await writeFile(flags.json, JSON.stringify(report, null, 2) + "\n");
    process.stderr.write(`wrote ${flags.json}\n`);
  }
}

main().catch((error) => {
  process.stderr.write(`\n${error.message}\n`);
  process.exitCode = 1;
});
