#!/usr/bin/env node
/**
 * Browser checks for the guide demos and the live editor.
 *
 * Each case replays a bug that shipped, so they cannot come back quietly:
 *
 *   G1  guide demos rendered blank whenever the placeholder image was slow
 *   G2  every demo on a page booted at load instead of when scrolled to
 *   E1  each Run leaked another animation loop
 *   E2  a top-level `let`/`const` broke Run permanently
 *   E4  the editor could hang at "Loading Editor..."
 *   E11 cached editor assets could straddle two deployments and blank the page
 *   E12 space-taking scrollbars + a fractional pane width put the sketch canvas
 *       in an endless resize oscillation: blank preview, eventual tab crash
 *
 * Serves the repo statically and drives it with Chromium, in the same style as
 * `browser-smoke.mjs`.
 */

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

import { chromium } from "playwright";

const ROOT = new URL("../", import.meta.url).pathname;
const PORT = 8123;
const ORIGIN = `http://localhost:${PORT}`;

// Keep in sync with scripts/build-editor.mjs. The sketch shell is embedded in
// edit.js (FRAME_SRCDOC) rather than fetched, so it is not a versionable asset.
const EDITOR_VERSIONED_ASSETS = [
  "demo/edit/vs/monaco.js",
  "demo/edit/vs/pts.css",
  "demo/edit/css/style.css",
  "demo/edit/js/pts-api.js",
  "demo/edit/js/edit.js",
];

const EDITOR_VERSIONED_REFERENCES = [
  "./vs/pts.css",
  "./css/style.css",
  "./vs/monaco.js",
  "./js/pts-api.js",
  "./js/edit.js",
];

const TYPES = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".ts": "text/plain",
};

const server = createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, ORIGIN).pathname);
  let file = join(ROOT, normalize(path).replace(/^(\.\.[/\\])+/, ""));
  try {
    if ((await stat(file)).isDirectory()) file = join(file, "index.html");
    const body = await readFile(file);
    res.writeHead(200, {
      "content-type": TYPES[extname(file)] ?? "application/octet-stream",
    });
    res.end(body);
  } catch {
    res.writeHead(404, { "content-type": "text/plain" });
    res.end("not found");
  }
});

await new Promise((resolve) => server.listen(PORT, resolve));
const browser = await chromium.launch({ headless: true });

/** True when every pixel of the canvas is the same colour. */
const CANVAS_PROBE = () =>
  [...document.querySelectorAll(".demoOverlay")].map((div) => {
    const canvas = div.querySelector("canvas");
    let uniform = null;
    if (canvas?.width && canvas?.height) {
      const d = canvas
        .getContext("2d", { willReadFrequently: true })
        .getImageData(0, 0, canvas.width, canvas.height).data;
      const first = `${d[0]},${d[1]},${d[2]},${d[3]}`;
      uniform = true;
      for (let i = 0; i < d.length; i += 4) {
        if (`${d[i]},${d[i + 1]},${d[i + 2]},${d[i + 3]}` !== first) {
          uniform = false;
          break;
        }
      }
    }
    return { id: div.id, hasCanvas: !!canvas, uniform };
  });

async function checkGuideUnderSlowImages() {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 },
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));

  // The demo container takes its height from this image. Delaying it is what
  // used to leave every canvas on the page permanently blank.
  for (const pattern of ["**/guide/assets/*.png", "**/guide/assets/*.jpg"]) {
    await page.route(pattern, async (route) => {
      await new Promise((r) => setTimeout(r, 900));
      await route.continue();
    });
  }

  await page.goto(`${ORIGIN}/guide/Get-started-0100.html`, {
    waitUntil: "domcontentloaded",
  });

  // Nothing may boot before the preview image has settled.
  await page.waitForTimeout(400);
  const early = await page.evaluate(CANVAS_PROBE);
  assert.equal(
    early.some((d) => d.hasCanvas),
    false,
    "a demo was constructed before its container had a real size",
  );

  await page.waitForTimeout(3500);
  await page.hover("#getting_started_1");
  await page.waitForTimeout(1200);

  const shown = (await page.evaluate(CANVAS_PROBE)).filter((d) => d.hasCanvas);
  assert.ok(shown.length > 0, "no guide demo started at all");
  for (const demo of shown) {
    assert.equal(demo.uniform, false, `guide demo "${demo.id}" rendered blank`);
  }
  assert.deepEqual(errors, [], "guide page raised errors");

  await page.close();
  return `${shown.length} demo(s) rendered with slow images`;
}

async function checkGuideIsLazy() {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 },
  });
  await page.goto(`${ORIGIN}/guide/Image-0900.html`, { waitUntil: "load" });
  await page.waitForTimeout(1500);

  const total = await page.evaluate(
    () => document.querySelectorAll(".demoOverlay").length,
  );
  const booted = (await page.evaluate(CANVAS_PROBE)).filter(
    (d) => d.hasCanvas,
  ).length;
  assert.ok(
    booted < total,
    `every demo booted at page load (${booted}/${total}); lazy loading is not working`,
  );

  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 200));
    }
  });
  await page.waitForTimeout(3000);

  const after = (await page.evaluate(CANVAS_PROBE)).filter((d) => d.hasCanvas);
  assert.equal(after.length, total, "not every demo started after scrolling");
  for (const demo of after) {
    assert.equal(demo.uniform, false, `guide demo "${demo.id}" rendered blank`);
  }

  await page.close();
  return `${booted}/${total} booted at load, ${after.length}/${total} after scrolling`;
}

async function checkGuideDoesNotFailOffscreenDemos() {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 900 },
  });
  await page.goto(`${ORIGIN}/guide/Image-0900.html`, { waitUntil: "load" });

  // Sit past the size watchdog without scrolling. Demos further down the page
  // are correctly waiting to be reached; timing the watchdog from page load
  // instead made every one of them report "could not be sized" on first visit.
  await page.waitForTimeout(9000);

  const failed = await page.evaluate(() =>
    [...document.querySelectorAll(".demoOverlay")]
      .filter((d) => d.classList.contains("is-failed"))
      .map((d) => `${d.id}: ${d.querySelector(".demoStatus")?.textContent}`),
  );
  assert.deepEqual(failed, [], "off-screen demos were reported as failed");

  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 400) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 200));
    }
  });
  await page.waitForTimeout(3000);
  const ready = await page.evaluate(
    () => document.querySelectorAll(".demoOverlay.is-ready").length,
  );
  const total = await page.evaluate(
    () => document.querySelectorAll(".demoOverlay").length,
  );
  assert.equal(ready, total, "not every demo recovered after scrolling");

  await page.close();
  return `no false failures after 9s idle, ${ready}/${total} ready after scrolling`;
}

async function checkEditorOnNarrowScreens() {
  // Below 768px the stylesheet hides the preview. Running a sketch into a
  // hidden 0x0 frame produced an error banner over the code.
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));

  await page.goto(`${ORIGIN}/demo/edit/?name=create.delaunay`, {
    waitUntil: "load",
  });
  await page.waitForFunction(
    () => document.getElementById("loader").style.display === "none",
    { timeout: 30000 },
  );
  await page.waitForTimeout(3000);

  const state = await page.evaluate(() => ({
    errorShown: document.getElementById("error").classList.contains("show"),
    lines: document.querySelectorAll("#editor .view-line").length,
    frameHidden:
      getComputedStyle(document.querySelector("iframe")).display === "none",
  }));

  assert.equal(state.errorShown, false, "narrow screen showed a sketch error");
  assert.ok(state.lines > 0, "no code rendered on a narrow screen");
  assert.equal(state.frameHidden, true, "preview frame should be hidden here");
  assert.deepEqual(errors, [], "narrow screen raised page errors");

  await page.close();
  return `code visible, preview hidden, no errors at 390px`;
}

async function checkEditorBundleIsSelfContained() {
  // The editor entry has a stable name but split chunks are content-hashed, so
  // a rebuild renames them. A browser holding a cached entry would then import
  // a chunk that no longer exists and the editor would never appear — the page
  // loads, then stays blank. A single self-contained file cannot desync.
  const page = await browser.newPage({
    viewport: { width: 1400, height: 900 },
  });
  await page.goto(`${ORIGIN}/demo/edit/?name=guide.getting_started`, {
    waitUntil: "load",
  });
  await page.waitForFunction(
    () => document.getElementById("loader").style.display === "none",
    { timeout: 30000 },
  );
  await page.waitForTimeout(1500);

  const scripts = await page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .map((r) => new URL(r.name))
      .filter(
        (url) => url.pathname.includes("/vs/") && url.pathname.endsWith(".js"),
      )
      .map((url) => url.pathname.split("/vs/")[1]),
  );
  assert.deepEqual(
    scripts,
    ["monaco.js"],
    `the editor bundle must be one file, got: ${scripts.join(", ")}`,
  );

  await page.close();
  return "single self-contained monaco.js, no hashed chunk imports";
}

async function checkEditorAssetsAreVersioned() {
  const hash = createHash("sha256");
  for (const path of EDITOR_VERSIONED_ASSETS) {
    hash.update(path);
    hash.update(await readFile(join(ROOT, path)));
  }
  const expected = hash.digest("hex").slice(0, 12);
  const html = await readFile(join(ROOT, "demo/edit/index.html"), "utf8");

  for (const reference of EDITOR_VERSIONED_REFERENCES) {
    const escaped = reference.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const versions = [
      ...html.matchAll(new RegExp(`${escaped}\\?v=([a-f0-9]+)`, "g")),
    ].map((match) => match[1]);
    assert.deepEqual(
      versions,
      [expected],
      `${reference} must use the current editor asset version; run pnpm build:editor`,
    );
  }

  return `all editor assets use content version ${expected}`;
}

async function checkEditorRendersNamedDemo() {
  const page = await browser.newPage({
    viewport: { width: 1400, height: 900 },
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(`${ORIGIN}/demo/edit/?name=guide.getting_started`, {
    waitUntil: "load",
  });
  await page.waitForFunction(
    () => document.getElementById("loader").style.display === "none",
    { timeout: 30000 },
  );
  await page.waitForTimeout(2500);

  const lines = await page.evaluate(
    () => document.querySelectorAll("#editor .view-line").length,
  );
  assert.ok(lines > 0, "the editor showed no code");

  const frame = page.frames().find((f) => f.url() === "about:srcdoc");
  const painted = await frame.evaluate(() => {
    const c = document.querySelector("#pt canvas");
    if (!c || !c.width) return false;
    const d = c
      .getContext("2d", { willReadFrequently: true })
      .getImageData(0, 0, c.width, c.height).data;
    const first = `${d[0]},${d[1]},${d[2]},${d[3]}`;
    for (let i = 0; i < d.length; i += 4) {
      if (`${d[i]},${d[i + 1]},${d[i + 2]},${d[i + 3]}` !== first) return true;
    }
    return false;
  });
  assert.ok(painted, "the sketch preview rendered blank");
  assert.deepEqual(errors, [], "the editor raised page errors");

  await page.close();
  return `code and preview both rendered (${lines} lines)`;
}

async function openEditor(name) {
  const page = await browser.newPage({
    viewport: { width: 1400, height: 900 },
  });
  await page.goto(`${ORIGIN}/demo/edit/?name=${name}`, { waitUntil: "load" });
  await page.waitForFunction(
    () => document.getElementById("loader").style.display === "none",
    { timeout: 30000 },
  );
  return page;
}

async function checkEditorRunsAreIsolated() {
  const page = await openEditor("triangle.incircle");

  // A sketch that keeps its space in a local variable: the form the guide
  // documents, and the one the old editor could not stop.
  await page.evaluate(() =>
    window.editor.setValue(
      `(function(){
  var space = new CanvasSpace("#pt").setup({ bgcolor: "#eef", resize: true });
  var form = space.getForm();
  space.add(() => form.point(space.pointer, 10));
  space.play();
})();`,
    ),
  );

  const sketch = () => page.frames().find((f) => f.url() === "about:srcdoc");
  const rate = async () => {
    const frame = sketch();
    await frame.evaluate(() => {
      if (window.__wrapped) return;
      window.__wrapped = true;
      window.__ticks = 0;
      const raf = window.requestAnimationFrame;
      window.requestAnimationFrame = function (cb) {
        return raf.call(window, function (t) {
          window.__ticks += 1;
          return cb(t);
        });
      };
    });
    await frame.evaluate(() => (window.__ticks = 0));
    await page.waitForTimeout(1000);
    return frame.evaluate(() => window.__ticks);
  };

  const rates = [];
  for (let i = 0; i < 4; i++) {
    await page.click("#run");
    await page.waitForTimeout(500);
    rates.push(await rate());
  }

  // One 60fps loop is ~60/sec. Leaked loops made this grow by ~60 per Run.
  for (const r of rates) {
    assert.ok(
      r < 100,
      `animation loops accumulated across Runs: ${rates.join(", ")} callbacks/sec`,
    );
  }

  const frames = await page.evaluate(
    () => document.querySelectorAll("iframe").length,
  );
  assert.equal(frames, 1, "sketch frames accumulated");

  await page.close();
  return `${rates.join(", ")} rAF/sec over four Runs`;
}

async function checkEditorHandlesLexicalDeclarations() {
  const page = await openEditor("triangle.incircle");
  await page.evaluate(() =>
    window.editor.setValue(
      `const space = new CanvasSpace('#pt').setup({bgcolor:'#fff'});
const form = space.getForm();
space.add(() => form.point(space.pointer, 10));
space.play();`,
    ),
  );

  for (let i = 1; i <= 3; i++) {
    await page.click("#run");
    await page.waitForTimeout(700);
    const shown = await page.evaluate(() =>
      document.getElementById("error").classList.contains("show")
        ? document.getElementById("error").textContent
        : null,
    );
    assert.equal(
      shown,
      null,
      `run ${i} of a top-level const sketch reported: ${shown}`,
    );
    const canvases = await page
      .frames()
      .find((f) => f.url() === "about:srcdoc")
      .evaluate(() => document.querySelectorAll("#pt canvas").length);
    assert.equal(canvases, 1, `run ${i} left ${canvases} canvases`);
  }

  await page.close();
  return "three consecutive Runs, no redeclaration error";
}

async function checkEditorWithClassicScrollbars() {
  // Headless Chromium passes --hide-scrollbars, which is exactly what masked
  // E12: overlay scrollbars occupy no layout space, so the oscillation only
  // happened in real browsers. Launch a dedicated browser without that flag.
  // 1437px wide makes the 50vw preview pane 718.5px — the fractional width
  // that made the canvas's rounded-up CSS size overflow its container.
  const scrollbarBrowser = await chromium.launch({
    headless: true,
    ignoreDefaultArgs: ["--hide-scrollbars"],
  });
  try {
    const page = await scrollbarBrowser.newPage({
      viewport: { width: 1437, height: 901 },
    });
    await page.goto(`${ORIGIN}/demo/edit/?name=guide.getting_started`, {
      waitUntil: "load",
    });
    await page.waitForFunction(
      () => document.getElementById("loader").style.display === "none",
      { timeout: 30000 },
    );
    await page.waitForTimeout(1500);

    const sizes = [];
    for (let i = 0; i < 4; i++) {
      sizes.push(
        await page.evaluate(() => {
          const c = document
            .querySelector("iframe")
            .contentWindow.document.querySelector("#pt canvas");
          return c ? `${c.width}x${c.height}` : "none";
        }),
      );
      await page.waitForTimeout(700);
    }
    assert.equal(
      new Set(sizes).size,
      1,
      `the sketch canvas kept resizing: ${sizes.join(" -> ")}`,
    );
    assert.notEqual(sizes[0], "none", "the sketch canvas never appeared");

    const banner = await page.evaluate(
      () => document.getElementById("error").textContent,
    );
    assert.equal(banner, "", `the editor surfaced an error: ${banner}`);

    return `canvas stable at ${sizes[0]} with space-taking scrollbars`;
  } finally {
    await scrollbarBrowser.close();
  }
}

async function checkEditorReportsErrors() {
  const page = await openEditor("triangle.incircle");
  await page.evaluate(() =>
    window.editor.setValue("function boom(){ nope.bad = 1; }\nboom();"),
  );
  await page.click("#run");
  await page.waitForTimeout(900);

  const state = await page.evaluate(() => ({
    shown: document.getElementById("error").classList.contains("show"),
    markers: monaco.editor.getModelMarkers({ owner: "sketch" }).length,
  }));
  assert.ok(state.shown, "a failing sketch reported no error");
  assert.ok(state.markers > 0, "a failing sketch set no editor marker");

  await page.close();
  return "error surfaced in the banner and as an editor marker";
}

const checks = [
  ["guide renders with slow images", checkGuideUnderSlowImages],
  ["guide loads demos lazily", checkGuideIsLazy],
  ["guide waits for off-screen demos", checkGuideDoesNotFailOffscreenDemos],
  ["editor is usable on narrow screens", checkEditorOnNarrowScreens],
  ["editor bundle is one file", checkEditorBundleIsSelfContained],
  ["editor assets are cache-safe", checkEditorAssetsAreVersioned],
  ["editor renders a named demo", checkEditorRendersNamedDemo],
  ["editor isolates each Run", checkEditorRunsAreIsolated],
  ["editor survives top-level const", checkEditorHandlesLexicalDeclarations],
  ["editor reports sketch errors", checkEditorReportsErrors],
  ["editor survives classic scrollbars", checkEditorWithClassicScrollbars],
];

let failed = 0;
try {
  for (const [name, fn] of checks) {
    try {
      const detail = await fn();
      process.stdout.write(`ok    ${name} — ${detail}\n`);
    } catch (error) {
      failed += 1;
      process.stdout.write(`FAIL  ${name}\n      ${error.message}\n`);
    }
  }
} finally {
  await browser.close();
  server.close();
}

process.stdout.write(
  failed === 0
    ? "\nall site checks passed\n"
    : `\n${failed} site check(s) failed\n`,
);
process.exitCode = failed === 0 ? 0 : 1;
