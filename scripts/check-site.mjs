#!/usr/bin/env node
/**
 * Browser checks for the guide demos and the live editor.
 *
 * Each case replays a bug that shipped, so they cannot come back quietly:
 *
 *   G1  guide demos rendered blank whenever the placeholder image was slow
 *   G2  every demo on a page booted at load instead of when scrolled to
 *   H1  homepage particles lost their opacity, collision, or divider invariants
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
import { readdir, readFile, stat } from "node:fs/promises";
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
  ".md": "text/markdown; charset=utf-8",
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

async function filesUnder(directory, extensions) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await filesUnder(file, extensions)));
    } else if (extensions.has(extname(entry.name))) {
      files.push(file);
    }
  }
  return files;
}

async function checkNoAnalytics() {
  const extensions = new Set([".html", ".js"]);
  const files = [join(ROOT, "index.html")];
  for (const directory of ["assets", "demo", "docs", "guide", "study"]) {
    files.push(...(await filesUnder(join(ROOT, directory), extensions)));
  }

  const analytics =
    /google-analytics\.com|googletagmanager\.com|GoogleAnalyticsObject|\bUA-\d|\bgtag\s*\(/u;
  for (const file of files) {
    const source = await readFile(file, "utf8");
    assert.doesNotMatch(
      source,
      analytics,
      `${file.slice(ROOT.length)} still contains Analytics code`,
    );
  }

  return `${files.length} shipped HTML/JS files contain no Analytics code`;
}

async function checkGuideResponsiveLayout() {
  const page = await browser.newPage();
  try {
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of [
        "Get-started-0100",
        "Technical-notes-9000",
        "Space-0500",
      ]) {
        await page.goto(`${ORIGIN}/guide/${route}.html`, {
          waitUntil: "networkidle",
        });
        const layout = await page.evaluate(() => {
          const title = document.getElementById("pts").getBoundingClientRect();
          const menu = document
            .getElementById("topmenu")
            .getBoundingClientRect();
          const toc = document.getElementById("toc");
          return {
            width: document.documentElement.clientWidth,
            scrollWidth: document.documentElement.scrollWidth,
            titleRight: title.right,
            menuLeft: menu.left,
            tocRight:
              getComputedStyle(toc).display === "none"
                ? 0
                : toc.getBoundingClientRect().right,
            titleLeft: title.left,
          };
        });
        assert.ok(
          layout.scrollWidth <= layout.width,
          `${route} overflows at ${width}px: ${JSON.stringify(layout)}`,
        );
        assert.ok(
          layout.titleRight <= layout.menuLeft,
          `${route} header overlaps at ${width}px`,
        );
        assert.ok(
          layout.tocRight <= layout.titleLeft,
          `${route} menu toggle overlaps at ${width}px`,
        );
      }
    }
  } finally {
    await page.close();
  }
  return "three guides fit 320, 390, 768, 1024, and 1440px viewports";
}

async function checkPoseNetIsRetired() {
  const directory = join(ROOT, "demo/more/tfjs_posenet");
  const notice = await readFile(join(directory, "index.html"), "utf8");
  assert.match(notice, /PoseNet demo has been retired/u);
  assert.doesNotMatch(notice, /<script\b[^>]*\bsrc=|getUserMedia/u);

  for (const file of ["a.html", "b.html", "c.html", "d.html"]) {
    const source = await readFile(join(directory, file), "utf8");
    assert.match(
      source,
      /content="0; url=\.\/"/u,
      `${file} is not a tombstone`,
    );
    assert.doesNotMatch(
      source,
      /<script\b|getUserMedia|test_video/u,
      `${file} still runs the retired prototype`,
    );
  }

  for (const file of ["index.html", "demo/index.html", "guide.md"]) {
    const source = await readFile(join(ROOT, file), "utf8");
    assert.doesNotMatch(
      source,
      /tfjs_posenet|TensorFlow\.js PoseNet/u,
      `${file} still advertises PoseNet`,
    );
  }

  return "old URLs are tombstones and public catalogs no longer advertise PoseNet";
}

async function checkAgentMarkdown() {
  const expected = [
    ["docs.md", "# Pts API Reference", 300_000],
    ["guide.md", "# Pts Guides and Demos", 80_000],
    ["llms.txt", "# Pts", 100],
  ];
  for (const [file, heading, minimumSize] of expected) {
    const response = await fetch(`${ORIGIN}/${file}`);
    assert.equal(response.status, 200, `${file} was not served`);
    if (file.endsWith(".md")) {
      assert.match(
        response.headers.get("content-type") ?? "",
        /^text\/markdown\b/u,
        `${file} did not use a Markdown content type`,
      );
    }
    const body = await response.text();
    assert.ok(body.includes(heading), `${file} has no expected heading`);
    assert.ok(body.length >= minimumSize, `${file} is unexpectedly small`);
  }

  const home = await (await fetch(`${ORIGIN}/`)).text();
  assert.match(home, /href="\/docs\.md"/u);
  assert.match(home, /href="\/guide\.md"/u);
  return "docs.md, guide.md, and llms.txt served with discovery links";
}

async function checkTopNavigation() {
  const page = await browser.newPage();
  const routes = [
    "/",
    "/demo/index.html",
    "/guide/Get-started-0100.html",
    "/guide/Introduction-0000.html",
    "/docs/",
    "/study/",
  ];
  const expectedLinks = [
    ["demos", `${ORIGIN}/demo/index.html`],
    ["guides", `${ORIGIN}/guide/Get-started-0100.html`],
    ["docs", `${ORIGIN}/docs/`],
    ["github", "https://github.com/williamngan/pts"],
  ];

  try {
    for (const [width, expectedVisible] of [
      [1200, expectedLinks.map(([label]) => label)],
      [390, ["demos", "guides"]],
    ]) {
      await page.setViewportSize({ width, height: 844 });

      for (const route of routes) {
        await page.goto(`${ORIGIN}${route}`, { waitUntil: "domcontentloaded" });
        const navigation = await page.locator("#topmenu").evaluate((menu) => {
          const links = [...menu.querySelectorAll("a")];
          const ptsBounds = document
            .querySelector("#pts")
            .getBoundingClientRect();
          const menuBounds = menu.getBoundingClientRect();
          return {
            links: links.map((link) => [link.textContent.trim(), link.href]),
            menuLeft: Math.round(menuBounds.left),
            ptsRight: Math.round(ptsBounds.right),
            visible: links
              .filter((link) => getComputedStyle(link).display !== "none")
              .map((link) => link.textContent.trim()),
          };
        });

        assert.deepEqual(
          navigation.links,
          expectedLinks,
          `${route} has different top navigation links at ${width}px`,
        );
        assert.deepEqual(
          navigation.visible,
          expectedVisible,
          `${route} has different visible navigation links at ${width}px`,
        );
        assert.ok(
          navigation.ptsRight <= navigation.menuLeft,
          `${route} top navigation overlaps its title at ${width}px`,
        );
      }
    }
  } finally {
    await page.close();
  }

  return `${routes.length} routes use the same study-free links`;
}

async function checkDemoEditorLink() {
  const page = await browser.newPage();
  const name = "circle.intersectCircle2D";
  const demoURL = `${ORIGIN}/demo?name=${name}`;
  const editorURL = `${ORIGIN}/demo/edit/?name=${name}`;

  try {
    await page.goto(demoURL, { waitUntil: "load" });
    assert.equal(
      page.url(),
      demoURL,
      "the test server unexpectedly normalized the extensionless demo URL",
    );

    const link = page.locator("a.source-code");
    await link.waitFor();
    assert.equal(
      await link.evaluate((element) => element.href),
      editorURL,
      "view/edit code resolved outside the demo directory",
    );

    const [response] = await Promise.all([
      page.waitForNavigation({ waitUntil: "domcontentloaded" }),
      link.click(),
    ]);
    assert.equal(response?.status(), 200, "the demo editor link returned 404");
    assert.equal(page.url(), editorURL, "the demo editor opened the wrong URL");
  } finally {
    await page.close();
  }

  return "extensionless /demo routes open the shared editor";
}

async function checkGuideEditorLink() {
  const page = await browser.newPage();
  const name = "guide.getting_started";
  const editorURL = `${ORIGIN}/demo/edit/?name=${name}`;

  try {
    await page.goto(`${ORIGIN}/guide/Get-started-0100.html`, {
      waitUntil: "load",
    });

    const link = page.locator("a.sourceCodeLink").first();
    await link.waitFor({ state: "attached" });
    assert.equal(
      await link.evaluate((element) => element.href),
      editorURL,
      "the guide's Edit live code link resolved outside the demo directory",
    );

    // The real link opens a named editor tab and is only visible while its demo
    // is active. Keep this page in place and activate the anchor directly so
    // this path check does not also depend on the demo's hover state.
    const [response] = await Promise.all([
      page.waitForNavigation({ waitUntil: "domcontentloaded" }),
      link.evaluate((element) => {
        element.removeAttribute("target");
        element.click();
      }),
    ]);
    assert.equal(response?.status(), 200, "the guide editor link returned 404");
    assert.equal(
      page.url(),
      editorURL,
      "the guide opened the wrong editor URL",
    );
  } finally {
    await page.close();
  }

  return "guide examples open the shared editor";
}

async function checkDemoShell() {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 800 },
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));

  try {
    await page.goto(`${ORIGIN}/demo?x=1&name=pt.unit`, {
      waitUntil: "load",
    });
    assert.equal(
      await page.locator("#src").getAttribute("src"),
      "../demo/pt.unit.js",
      "a non-leading name parameter loaded the wrong demo",
    );
    assert.match(page.url(), /\?x=1&name=pt\.unit$/u);

    const semantics = await page.evaluate(() => ({
      demoLinks: document.querySelectorAll("a.demo").length,
      htmlLanguage: document.documentElement.lang,
      nonLinks: document.querySelectorAll(".demo:not(a)").length,
      viewport: document.querySelector('meta[name="viewport"]').content,
    }));
    assert.deepEqual(semantics, {
      demoLinks: 40,
      htmlLanguage: "en",
      nonLinks: 0,
      viewport: "width=device-width, initial-scale=1",
    });

    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(
      await page.locator("a.source-code").isVisible(),
      true,
      "the edit link disappeared on a narrow screen",
    );

    await page.goto(`${ORIGIN}/demo?name=%E0%A4%A`, { waitUntil: "load" });
    assert.equal(
      await page.locator("#hint.error").textContent(),
      "Invalid demo name.",
      "malformed encoding did not produce a useful error",
    );

    await page.goto(`${ORIGIN}/demo?name=missing.demo`, { waitUntil: "load" });
    await page.locator("#hint.error").waitFor();
    assert.equal(
      await page.locator("#hint.error").textContent(),
      "Could not load demo “missing.demo”.",
    );

    await page.goto(`${ORIGIN}/demo/`, { waitUntil: "load" });
    assert.match(
      page.url(),
      /\?name=circle\.intersectCircle2D$/u,
      "the default demo was not reflected in the URL",
    );
    assert.deepEqual(errors, [], "the demo shell raised a page error");
  } finally {
    await page.close();
  }

  return "query edge cases fail visibly and 40 choices use native links";
}

async function checkAllDemos() {
  const files = (await readdir(join(ROOT, "demo"), { withFileTypes: true }))
    .filter(
      (entry) =>
        entry.isFile() &&
        entry.name.endsWith(".js") &&
        entry.name !== "template.js",
    )
    .map((entry) => entry.name.slice(0, -3))
    .sort();
  const issues = [];
  let cursor = 0;

  async function worker() {
    const page = await browser.newPage({
      viewport: { width: 1000, height: 700 },
    });
    let current = null;

    await page.addInitScript(() => {
      window.__invalidCanvasColors = [];
      const proto = CanvasRenderingContext2D.prototype;
      for (const property of ["fillStyle", "strokeStyle"]) {
        const descriptor = Object.getOwnPropertyDescriptor(proto, property);
        Object.defineProperty(proto, property, {
          ...descriptor,
          set(value) {
            if (typeof value === "string" && !CSS.supports("color", value)) {
              window.__invalidCanvasColors.push(value);
            }
            descriptor.set.call(this, value);
          },
        });
      }
    });

    page.on("pageerror", (error) => {
      if (current) current.push(`page error: ${error.message}`);
    });
    page.on("console", (message) => {
      if (current && message.type() === "error") {
        current.push(`console error: ${message.text()}`);
      }
    });
    page.on("response", (response) => {
      if (
        current &&
        response.url().startsWith(ORIGIN) &&
        response.status() >= 400
      ) {
        current.push(`${response.status()} ${response.url()}`);
      }
    });
    page.on("requestfailed", (request) => {
      if (current && request.url().startsWith(ORIGIN)) {
        current.push(`request failed: ${request.url()}`);
      }
    });

    try {
      while (cursor < files.length) {
        const name = files[cursor++];
        const local = [];
        current = local;
        const response = await page.goto(
          `${ORIGIN}/demo/?name=${encodeURIComponent(name)}`,
          { waitUntil: "load" },
        );
        if (response?.status() !== 200) {
          local.push(`document returned ${response?.status()}`);
        }

        await page.locator("a.source-code").waitFor({ timeout: 3000 });
        await page.waitForTimeout(400);
        const state = await page.evaluate(() => {
          const surfaces = [
            ...document.querySelectorAll(
              "#pt canvas, #pt svg, #pt > div, #pt > img",
            ),
          ];
          return {
            invalidColors: [...new Set(window.__invalidCanvasColors)],
            visibleSurface: surfaces.some((surface) => {
              const box = surface.getBoundingClientRect();
              return box.width > 0 && box.height > 0;
            }),
          };
        });
        if (!state.visibleSurface) local.push("no visible rendering surface");
        if (state.invalidColors.length > 0) {
          local.push(
            `invalid canvas colors: ${state.invalidColors.join(", ")}`,
          );
        }
        if (local.length > 0) issues.push(`${name}: ${local.join("; ")}`);
        current = null;
      }
    } finally {
      await page.close();
    }
  }

  await Promise.all(Array.from({ length: 4 }, () => worker()));
  assert.deepEqual(issues, [], issues.join("\n"));
  return `${files.length} authored sketches loaded without runtime or rendering errors`;
}

async function checkHomepageHero() {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 720 },
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));

  // Capture only the latest canvas frame so geometry and compositing can be
  // asserted without exposing demo internals on window.
  await page.addInitScript(() => {
    const proto = CanvasRenderingContext2D.prototype;
    const original = Object.fromEntries(
      [
        "beginPath",
        "moveTo",
        "lineTo",
        "arc",
        "fill",
        "stroke",
        "fillRect",
      ].map((name) => [name, proto[name]]),
    );
    window.__heroFrame = { arcs: [], lines: [] };

    proto.fillRect = function (x, y) {
      if (x < 0 && y < 0) window.__heroFrame = { arcs: [], lines: [] };
      return original.fillRect.apply(this, arguments);
    };
    proto.beginPath = function () {
      this.__heroArc = null;
      this.__heroFrom = null;
      this.__heroTo = null;
      return original.beginPath.apply(this, arguments);
    };
    proto.moveTo = function (x, y) {
      this.__heroFrom = [x, y];
      return original.moveTo.apply(this, arguments);
    };
    proto.lineTo = function (x, y) {
      this.__heroTo = [x, y];
      return original.lineTo.apply(this, arguments);
    };
    proto.arc = function (x, y, radius) {
      this.__heroArc = [x, y, radius];
      return original.arc.apply(this, arguments);
    };
    proto.fill = function () {
      if (this.__heroArc) {
        window.__heroFrame.arcs.push({
          arc: this.__heroArc,
          alpha: this.globalAlpha,
          color: this.fillStyle,
        });
      }
      return original.fill.apply(this, arguments);
    };
    proto.stroke = function () {
      if (this.__heroFrom && this.__heroTo) {
        window.__heroFrame.lines.push({
          from: this.__heroFrom,
          to: this.__heroTo,
          alpha: this.globalAlpha,
          width: this.lineWidth,
        });
      }
      return original.stroke.apply(this, arguments);
    };
  });

  try {
    // Keep Chromium's initial virtual cursor outside the hero so its untouched
    // 30° startup state can be checked before explicit pointer interaction.
    await page.mouse.move(1439, 719);
    await page.goto(`${ORIGIN}/`, { waitUntil: "networkidle" });
    const canvas = await page.locator("canvas").boundingBox();
    assert.ok(canvas, "homepage hero canvas was not created");

    await page.waitForTimeout(100);
    const initialDividers = await page.evaluate(() => {
      const { lines } = window.__heroFrame;
      const canvasBounds = document
        .querySelector("canvas")
        .getBoundingClientRect();
      const center = [canvasBounds.width / 2, canvasBounds.height / 2];
      const targetAngle = Math.PI / 6;
      let connectorCount = 0;
      let maxAngleError = 0;

      for (const { to } of lines) {
        const dx = to[0] - center[0];
        const dy = to[1] - center[1];
        if (Math.hypot(dx, dy) < 1) continue;

        let angle = Math.atan2(dy, dx) % Math.PI;
        if (angle < 0) angle += Math.PI;
        const delta = Math.abs(angle - targetAngle);
        connectorCount += 1;
        maxAngleError = Math.max(
          maxAngleError,
          Math.min(delta, Math.PI - delta),
        );
      }

      return { connectorCount, maxAngleError };
    });
    assert.ok(
      initialDividers.connectorCount > 0,
      "the initial divider did not receive connectors",
    );
    assert.ok(
      initialDividers.maxAngleError < 0.001,
      `initial divider missed 30° by ${initialDividers.maxAngleError} radians`,
    );

    const headerPointer = [canvas.width / 2, 40];
    const headerTarget = [
      canvas.x + headerPointer[0],
      canvas.y + headerPointer[1],
    ];
    const headerCoversPointer = await page.evaluate(
      ([x, y]) => !!document.elementFromPoint(x, y)?.closest("#header"),
      headerTarget,
    );
    assert.ok(headerCoversPointer, "header pointer probe missed the overlay");
    // The first pointer event after navigation can have a zero movement delta.
    // Send a real two-step movement, matching the hero's intentional stationary-
    // cursor guard, then wait for its rendered frame instead of a fixed delay.
    await page.mouse.move(headerTarget[0], headerTarget[1], { steps: 2 });
    await page.waitForFunction(
      ([x, y]) =>
        window.__heroFrame.arcs.some(
          ({ arc, color }) =>
            color !== "#ffffff" &&
            Math.abs(arc[2] - 1.5) < 0.001 &&
            Math.hypot(arc[0] - x, arc[1] - y) < 0.001,
        ),
      headerPointer,
    );
    const headerPointerDistance = await page.evaluate(([x, y]) => {
      const dots = window.__heroFrame.arcs.filter(
        ({ arc, color }) =>
          color !== "#ffffff" && Math.abs(arc[2] - 1.5) < 0.001,
      );
      return Math.min(
        ...dots.map(({ arc }) => Math.hypot(arc[0] - x, arc[1] - y)),
      );
    }, headerPointer);
    assert.ok(
      headerPointerDistance < 0.001,
      `header blocked the pointer collider by ${headerPointerDistance}px`,
    );

    const pointer = [canvas.width * 0.8, canvas.height * 0.5];
    await page.mouse.move(pointer[0], pointer[1]);
    await page.waitForTimeout(100);

    const frame = await page.evaluate(([pointerX, pointerY]) => {
      const { arcs, lines } = window.__heroFrame;
      const canvasBounds = document
        .querySelector("canvas")
        .getBoundingClientRect();
      const center = [canvasBounds.width / 2, canvasBounds.height / 2];
      const dots = arcs.filter(
        ({ arc, color }) =>
          color !== "#ffffff" && Math.abs(arc[2] - 1.5) < 0.001,
      );
      let maxDividerError = 0;
      for (const { to } of lines) {
        const dx = to[0] - center[0];
        maxDividerError = Math.max(maxDividerError, Math.abs(dx));
      }
      return {
        dotAlphas: [...new Set(dots.map(({ alpha }) => alpha))],
        dotCount: dots.length,
        lineAlphas: lines.map(({ alpha }) => alpha),
        lineCount: lines.length,
        lineWidths: lines.map(({ width }) => width),
        maxDividerError,
        pointerDotDistance: Math.min(
          ...dots.map(({ arc }) =>
            Math.hypot(arc[0] - pointerX, arc[1] - pointerY),
          ),
        ),
      };
    }, pointer);

    assert.equal(frame.dotCount, 224, "homepage particle count changed");
    assert.deepEqual(frame.dotAlphas, [0.6], "particle opacity is not 60%");
    assert.equal(frame.lineCount, frame.dotCount, "a connector was not drawn");
    assert.ok(
      frame.maxDividerError < 0.001,
      `divider missed the cursor perpendicular by ${frame.maxDividerError}px`,
    );
    assert.ok(
      frame.lineAlphas.every((alpha) => alpha > 0 && alpha <= 1),
      "connector opacity left the valid range",
    );
    assert.ok(
      frame.lineWidths.every((width) => width > 0 && width <= 2),
      "connector width left the valid range",
    );
    assert.ok(
      frame.pointerDotDistance < 0.001,
      `pointer dot drifted by ${frame.pointerDotDistance}px`,
    );

    // Count real overlaps involving the 30px pointer collider, then move it
    // directly onto a rendered particle.
    await page.evaluate(() => {
      const ParticleClass = window.Particle;
      const collide = ParticleClass.prototype.collide;
      const quadraticIn = window.Shaping.quadraticIn;
      window.__pointerCollisions = 0;
      window.__flashProbeParticle = null;
      window.__flashEaseCalls = 0;
      window.Shaping.quadraticIn = function (...args) {
        window.__flashEaseCalls += 1;
        return quadraticIn.apply(this, args);
      };
      ParticleClass.prototype.collide = function (other, damping) {
        if (this.radius === 30 || other.radius === 30) {
          const dx = this[0] - other[0];
          const dy = this[1] - other[1];
          const distance = this.radius + other.radius;
          if (dx * dx + dy * dy < distance * distance) {
            window.__pointerCollisions += 1;
            window.__flashProbeParticle = this.radius === 30 ? other : this;
          }
        }
        return collide.call(this, other, damping);
      };
    });
    let target = null;
    let pointerPosition = pointer;
    for (let attempt = 0; attempt < 6; attempt += 1) {
      target = await page.evaluate(([pointerX, pointerY]) => {
        const dots = window.__heroFrame.arcs.filter(
          ({ arc, color }) =>
            color !== "#ffffff" && Math.abs(arc[2] - 1.5) < 0.001,
        );
        const bounds = document.querySelector("canvas").getBoundingClientRect();
        const target = dots.find(
          ({ arc }) =>
            arc[0] > 100 &&
            arc[0] < bounds.width - 100 &&
            arc[1] > 80 &&
            arc[1] < bounds.height - 80 &&
            Math.hypot(arc[0] - pointerX, arc[1] - pointerY) > 100,
        );
        return target?.arc.slice(0, 2);
      }, pointerPosition);
      if (!target) break;

      await page.mouse.move(target[0], target[1]);
      await page.waitForTimeout(50);
      pointerPosition = target;
      if (await page.evaluate(() => window.__pointerCollisions > 0)) break;
    }
    assert.ok(
      target,
      "could not find a particle for the pointer collision test",
    );

    const collision = await page.evaluate(() => {
      const { arcs } = window.__heroFrame;
      const dots = arcs.filter(
        ({ arc, color }) =>
          color !== "#ffffff" && Math.abs(arc[2] - 1.5) < 0.001,
      );
      const flashes = arcs.filter(
        ({ arc, color }) => color === "#ffffff" && arc[2] > 0 && arc[2] <= 6,
      );
      const firstFlashIndex = arcs.findIndex(
        ({ color }) => color === "#ffffff",
      );
      const lastDotIndex = arcs.findLastIndex(
        ({ arc, color }) =>
          color !== "#ffffff" && Math.abs(arc[2] - 1.5) < 0.001,
      );
      return {
        count: window.__pointerCollisions,
        easeCalls: window.__flashEaseCalls,
        alphas: flashes.map(({ alpha }) => alpha),
        flashOnTop: firstFlashIndex > lastDotIndex,
        initialRadii: flashes.map(({ arc, alpha }) => (arc[2] * 0.6) / alpha),
        maxCenterError: Math.max(
          ...flashes.map(({ arc }) =>
            Math.min(
              ...dots.map(({ arc: dot }) =>
                Math.hypot(arc[0] - dot[0], arc[1] - dot[1]),
              ),
            ),
          ),
        ),
        radii: flashes.map(({ arc }) => arc[2]),
      };
    });
    assert.ok(collision.count > 0, "pointer did not collide with a particle");
    assert.ok(collision.easeCalls > 0, "flashes did not use quadratic easing");
    assert.ok(collision.radii.length > 0, "collisions produced no flash");
    assert.ok(
      collision.radii.every((radius) => radius > 0 && radius <= 6),
      "a shrinking flash radius left the valid range",
    );
    assert.ok(
      collision.alphas.every((alpha) => alpha > 0 && alpha <= 0.6),
      "a flash exceeded 60% opacity",
    );
    assert.ok(collision.flashOnTop, "flashes were drawn below the color dots");
    assert.ok(
      collision.initialRadii.every(
        (radius) => radius >= 3.999 && radius <= 6.001,
      ),
      "flash radius did not shrink in proportion with its fade",
    );
    assert.ok(
      collision.maxCenterError < 0.001,
      `a flash moved ${collision.maxCenterError}px off its particle center`,
    );

    // Repeated contact must not restart an active fade or produce another
    // flash as soon as it expires. A quiet contact gap rearms it instead.
    const debounce = await page.evaluate(async () => {
      const particle = window.__flashProbeParticle;
      if (!particle) return null;

      const initialFlashUntil = particle.flashUntil;
      let refreshCount = 0;
      const end = performance.now() + 650;
      while (performance.now() < end) {
        const flashUntil = particle.flashUntil;
        particle.triggerFlash();
        if (particle.flashUntil !== flashUntil) refreshCount += 1;
        await new Promise(requestAnimationFrame);
      }

      return {
        finalFlashUntil: particle.flashUntil,
        initialFlashUntil,
        refreshCount,
      };
    });
    assert.ok(debounce, "could not capture a particle for the flash test");
    assert.ok(
      debounce.initialFlashUntil > 0,
      "collision did not start a flash",
    );
    assert.equal(
      debounce.finalFlashUntil,
      debounce.initialFlashUntil,
      "sustained contact restarted a completed flash",
    );
    assert.equal(
      debounce.refreshCount,
      0,
      "sustained contact refreshed a fading flash",
    );

    // End over the header overlay to exercise pointer-capture release while the
    // mouse is still geometrically inside the canvas.
    const dragTarget = [canvas.width * 0.7, 80];
    await page.mouse.down();
    await page.mouse.move(dragTarget[0], dragTarget[1]);
    await page.waitForTimeout(50);
    const dragDistance = await page.evaluate(([x, y]) => {
      const dots = window.__heroFrame.arcs.filter(
        ({ arc, color }) =>
          color !== "#ffffff" && Math.abs(arc[2] - 1.5) < 0.001,
      );
      return Math.min(
        ...dots.map(({ arc }) => Math.hypot(arc[0] - x, arc[1] - y)),
      );
    }, dragTarget);
    await page.mouse.up();
    assert.ok(dragDistance < 0.001, "pointer collider did not follow a drag");

    // Releasing a mouse drag inside the canvas must leave its collider active.
    // A `drop` is also emitted for mouse input, even though the pointer remains.
    await page.evaluate(([x, y]) => {
      window.__pointerCollisions = 0;
      const particle = window.__flashProbeParticle;
      particle.previous.to(x, y);
      particle.to(x, y);
    }, dragTarget);
    await page
      .waitForFunction(() => window.__pointerCollisions > 0, { timeout: 500 })
      .catch(() => {});
    const postDragCollisions = await page.evaluate(
      () => window.__pointerCollisions,
    );
    assert.ok(
      postDragCollisions > 0,
      "mouse collider became inactive after a drag",
    );

    // Divider collisions are impulses caused by angular motion, not persistent
    // barriers: rotating must hit particles, while a stationary divider must not.
    const dividerStart = [canvas.width * 0.75, canvas.height * 0.5];
    await page.mouse.move(dividerStart[0], dividerStart[1]);
    await page.waitForTimeout(50);
    await page.evaluate(
      ([x, y]) => {
        const particle = window.__flashProbeParticle;
        particle.to(x, y);
        particle.previous.to(particle);
      },
      [
        canvas.width / 2 + 200 * Math.cos((Math.PI * 7) / 12),
        canvas.height / 2 + 200 * Math.sin((Math.PI * 7) / 12),
      ],
    );
    await page.evaluate(() => {
      const ParticleClass = window.Particle;
      const hit = ParticleClass.prototype.hit;
      window.__dividerHits = { count: 0, maxImpulse: 0 };
      ParticleClass.prototype.hit = function (...args) {
        if (this.radius === 20) {
          const impulse = args[0];
          const x = typeof impulse === "number" ? impulse : impulse[0];
          const y = typeof impulse === "number" ? (args[1] ?? 0) : impulse[1];
          window.__dividerHits.count += 1;
          window.__dividerHits.maxImpulse = Math.max(
            window.__dividerHits.maxImpulse,
            Math.hypot(x, y),
          );
        }
        return hit.apply(this, args);
      };
    });
    const dividerEnd = [
      canvas.width / 2 + (canvas.width / 4) * Math.cos(Math.PI / 6),
      canvas.height / 2 + (canvas.width / 4) * Math.sin(Math.PI / 6),
    ];
    await page.mouse.move(dividerEnd[0], dividerEnd[1]);
    await page.waitForTimeout(50);
    const dividerHits = await page.evaluate(() => ({
      ...window.__dividerHits,
    }));
    assert.ok(dividerHits.count > 0, "rotating divider hit no particles");
    assert.ok(
      dividerHits.maxImpulse <= 6.001,
      `divider impulse exceeded its cap: ${dividerHits.maxImpulse}`,
    );

    await page.evaluate(() => {
      window.__dividerHits = { count: 0, maxImpulse: 0 };
    });
    await page.waitForTimeout(100);
    const stationaryDividerHits = await page.evaluate(
      () => window.__dividerHits.count,
    );
    assert.equal(
      stationaryDividerHits,
      0,
      "stationary divider blocked a particle",
    );

    // At the exact center there is no cursor angle. Preserve the last divider
    // direction instead of snapping back to its 30° startup angle and striking it.
    await page.mouse.move(canvas.width / 2, canvas.height / 2);
    await page.waitForTimeout(50);
    const centeredDividerHits = await page.evaluate(
      () => window.__dividerHits.count,
    );
    assert.equal(
      centeredDividerHits,
      0,
      "divider snapped to its startup angle at the canvas center",
    );

    await page.setViewportSize({ width: 800, height: 600 });
    await page.waitForTimeout(700);
    const resized = await page.evaluate(() => {
      const canvasBounds = document
        .querySelector("canvas")
        .getBoundingClientRect();
      const collisionDiameter = 40;
      const baseCount = Math.min(
        200,
        Math.max(
          32,
          Math.floor(
            (canvasBounds.width * canvasBounds.height) /
              (collisionDiameter * collisionDiameter * 3),
          ),
        ),
      );
      return {
        actual: window.__heroFrame.arcs.filter(
          ({ arc, color }) =>
            color !== "#ffffff" && Math.abs(arc[2] - 1.5) < 0.001,
        ).length,
        expected: Math.round(baseCount * 1.3),
      };
    });
    assert.equal(
      resized.actual,
      resized.expected,
      "particle count did not adapt after resize",
    );

    const headerScroll = await page.evaluate(async () => {
      const canvasHeight = document
        .querySelector("canvas")
        .getBoundingClientRect().height;
      window.scrollTo(0, canvasHeight);
      await new Promise(requestAnimationFrame);
      await new Promise(requestAnimationFrame);
      const scrollTop = window.scrollY;
      return {
        actual: document.getElementById("header").getBoundingClientRect().top,
        expected: Math.min(0, canvasHeight - 150 - scrollTop),
      };
    });
    assert.ok(
      Math.abs(headerScroll.actual - headerScroll.expected) < 0.01,
      `header missed its scroll position by ${Math.abs(headerScroll.actual - headerScroll.expected)}px`,
    );
    assert.deepEqual(errors, [], "homepage hero raised errors");

    return `${frame.dotCount} particles, one centered divider, rotating-only hits`;
  } finally {
    await page.close();
  }
}

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

async function checkEditorControls() {
  const page = await openEditor("triangle.incircle");

  try {
    const semantics = await page.evaluate(() => ({
      actions: Object.fromEntries(
        ["back", "load", "save", "docs", "run"].map((id) => [
          id,
          document.getElementById(id).tagName,
        ]),
      ),
      errorLive: document.getElementById("error").getAttribute("aria-live"),
      errorRole: document.getElementById("error").getAttribute("role"),
      frameTitle: document.getElementById("demo").title,
      language: document.documentElement.lang,
      menuExpanded: document
        .getElementById("load")
        .getAttribute("aria-expanded"),
      menuHidden: document
        .getElementById("loadmenu")
        .getAttribute("aria-hidden"),
      menuInert: document.getElementById("loadmenu").inert,
      viewport: document.querySelector('meta[name="viewport"]').content,
    }));
    assert.deepEqual(semantics, {
      actions: {
        back: "A",
        load: "BUTTON",
        save: "BUTTON",
        docs: "A",
        run: "BUTTON",
      },
      errorLive: "assertive",
      errorRole: "alert",
      frameTitle: "Pts demo preview",
      language: "en",
      menuExpanded: "false",
      menuHidden: "true",
      menuInert: true,
      viewport: "width=device-width, initial-scale=1",
    });

    await page.click("#load");
    const opened = await page.evaluate(() => ({
      expanded: document.getElementById("load").getAttribute("aria-expanded"),
      hidden: document.getElementById("loadmenu").getAttribute("aria-hidden"),
      inert: document.getElementById("loadmenu").inert,
      firstChoiceFocused: document.activeElement.matches("#loadmenu .demo"),
    }));
    assert.deepEqual(opened, {
      expanded: "true",
      hidden: "false",
      inert: false,
      firstChoiceFocused: true,
    });

    await page.keyboard.press("Escape");
    const closed = await page.evaluate(() => ({
      expanded: document.getElementById("load").getAttribute("aria-expanded"),
      focus: document.activeElement.id,
      hidden: document.getElementById("loadmenu").getAttribute("aria-hidden"),
      inert: document.getElementById("loadmenu").inert,
    }));
    assert.deepEqual(closed, {
      expanded: "false",
      focus: "load",
      hidden: "true",
      inert: true,
    });
  } finally {
    await page.close();
  }

  return "native controls expose state, focus, and keyboard dismissal";
}

async function checkEditorExport() {
  const page = await openEditor("triangle.incircle");
  const source = 'var marker = "</script>";\nconsole.log(marker);';

  try {
    await page.evaluate((value) => window.editor.setValue(value), source);
    const downloadPromise = page.waitForEvent("download");
    await page.click("#save");
    const download = await downloadPromise;
    const stream = await download.createReadStream();
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    const html = Buffer.concat(chunks).toString("utf8");

    assert.equal(download.suggestedFilename(), "pts_demo.html");
    assert.match(html, /^<!doctype html>\n<html lang="en">/u);
    assert.match(
      html,
      /https:\/\/unpkg\.com\/pts@0\.12\.9\/dist\/pts\.min\.js/u,
    );
    assert.ok(
      html.includes('var marker = "<\\/script>";'),
      "the exported sketch did not escape its closing script tag",
    );
    assert.ok(
      !html.includes(source),
      "the exported sketch retained an unsafe closing script tag",
    );
  } finally {
    await page.close();
  }

  return "standalone HTML is pinned, named, and safe for closing script text";
}

async function checkLatestEditorRunWins() {
  const page = await openEditor("triangle.incircle");

  try {
    await page.evaluate(() => {
      const create = document.createElement;
      let frames = 0;
      document.createElement = function () {
        const element = create.apply(this, arguments);
        if (String(arguments[0]).toLowerCase() !== "iframe") return element;

        frames += 1;
        if (frames === 1) {
          const listen = element.addEventListener.bind(element);
          element.addEventListener = function (type, listener, options) {
            if (type !== "load") return listen(type, listener, options);
            return listen(
              type,
              function (event) {
                setTimeout(() => listener.call(element, event), 300);
              },
              options,
            );
          };
        } else {
          document.createElement = create;
        }
        return element;
      };

      window.editor.setValue('window.__runMarker = "old";');
      document.getElementById("run").click();
      window.editor.setValue('window.__runMarker = "new";');
      document.getElementById("run").click();
    });

    await page.waitForFunction(
      () =>
        document.querySelectorAll("iframe").length === 1 &&
        document.getElementById("demo")?.contentWindow.__runMarker === "new",
      { timeout: 5000 },
    );
    await page.waitForTimeout(500);
    const state = await page.evaluate(() => ({
      frames: document.querySelectorAll("iframe").length,
      marker: document.getElementById("demo").contentWindow.__runMarker,
    }));
    assert.deepEqual(state, { frames: 1, marker: "new" });
  } finally {
    await page.close();
  }

  return "a delayed older frame cannot replace the newest Run";
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
      window.__frameTimes = new Set();
      const raf = window.requestAnimationFrame;
      window.requestAnimationFrame = function (cb) {
        return raf.call(window, function (t) {
          window.__ticks += 1;
          window.__frameTimes.add(t);
          return cb(t);
        });
      };
    });
    await frame.evaluate(() => {
      window.__ticks = 0;
      window.__frameTimes.clear();
    });
    await page.waitForTimeout(1000);
    return frame.evaluate(() => ({
      ticks: window.__ticks,
      frames: window.__frameTimes.size,
    }));
  };

  const rates = [];
  for (let i = 0; i < 4; i++) {
    await page.click("#run");
    await page.waitForTimeout(500);
    rates.push(await rate());
  }

  // One animation chain schedules one callback per frame at any refresh rate.
  // Multiple chains receive the same rAF timestamp; count those duplicates
  // instead of assuming that the host display runs at 60 Hz.
  for (const r of rates) {
    assert.ok(r.frames > 0, "the sketch did not animate");
    assert.ok(
      r.ticks === r.frames,
      `animation loops accumulated across Runs: ${JSON.stringify(rates)}`,
    );
  }

  const frames = await page.evaluate(
    () => document.querySelectorAll("iframe").length,
  );
  assert.equal(frames, 1, "sketch frames accumulated");

  await page.close();
  return `${rates.map((r) => `${r.ticks}/${r.frames}`).join(", ")} callbacks/frames over four Runs`;
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
  ["agent documentation is discoverable", checkAgentMarkdown],
  ["shipped pages contain no analytics", checkNoAnalytics],
  ["PoseNet is retired", checkPoseNetIsRetired],
  ["top navigation is consistent", checkTopNavigation],
  ["demo editor links resolve", checkDemoEditorLink],
  ["guide editor links resolve", checkGuideEditorLink],
  ["demo shell handles URLs accessibly", checkDemoShell],
  ["all authored demos load", checkAllDemos],
  ["homepage hero preserves particle behavior", checkHomepageHero],
  ["guide renders with slow images", checkGuideUnderSlowImages],
  ["guide layout fits narrow viewports", checkGuideResponsiveLayout],
  ["guide loads demos lazily", checkGuideIsLazy],
  ["guide waits for off-screen demos", checkGuideDoesNotFailOffscreenDemos],
  ["editor is usable on narrow screens", checkEditorOnNarrowScreens],
  ["editor bundle is one file", checkEditorBundleIsSelfContained],
  ["editor assets are cache-safe", checkEditorAssetsAreVersioned],
  ["editor renders a named demo", checkEditorRendersNamedDemo],
  ["editor controls are accessible", checkEditorControls],
  ["editor exports standalone HTML", checkEditorExport],
  ["latest editor Run wins", checkLatestEditorRunWins],
  ["editor isolates each Run", checkEditorRunsAreIsolated],
  ["editor survives top-level const", checkEditorHandlesLexicalDeclarations],
  ["editor reports sketch errors", checkEditorReportsErrors],
  ["editor survives classic scrollbars", checkEditorWithClassicScrollbars],
];

let failed = 0;
try {
  const selected = checks.filter(([name]) =>
    name.includes(process.argv[2] ?? ""),
  );
  assert.ok(selected.length > 0, "No site checks match the requested filter");
  for (const [name, fn] of selected) {
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
