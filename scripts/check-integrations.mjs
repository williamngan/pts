import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createServer } from "node:http";
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  realpath,
  rm,
  stat,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const fixtureSource = path.join(projectRoot, "test", "integrations");
const temporaryRoot = await mkdtemp(path.join(tmpdir(), "pts-integrations-"));
const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".map", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
]);

function run(command, args, cwd, capture = false) {
  return execFileSync(command, args, {
    cwd,
    encoding: capture ? "utf8" : undefined,
    stdio: capture ? ["ignore", "pipe", "inherit"] : "inherit",
  });
}

async function startServer(root, routes = new Map()) {
  const normalizedRoot = path.resolve(root);
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(
        new URL(request.url ?? "/", "http://127.0.0.1").pathname,
      );
      let file = routes.get(pathname);
      if (!file) {
        const relativePath =
          pathname === "/" ? "index.html" : pathname.slice(1);
        file = path.resolve(normalizedRoot, relativePath);
        assert.ok(
          file === normalizedRoot ||
            file.startsWith(`${normalizedRoot}${path.sep}`),
          "request escaped the fixture root",
        );
        if ((await stat(file)).isDirectory())
          file = path.join(file, "index.html");
      }

      const body = await readFile(file);
      response.writeHead(200, {
        "cache-control": "no-store",
        "content-type":
          contentTypes.get(path.extname(file)) ?? "application/octet-stream",
      });
      response.end(body);
    } catch {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      response.end("Not found");
    }
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  assert.ok(address && typeof address === "object");

  return {
    close: () => new Promise((resolve) => server.close(resolve)),
    url: `http://127.0.0.1:${address.port}/`,
  };
}

async function testBrowserFixture(
  browser,
  { environment, root, routes, removesCanvas },
) {
  const server = await startServer(root, routes);
  const page = await browser.newPage();
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`page: ${error.message}`));
  page.on("requestfailed", (request) => {
    if (request.url().startsWith(server.url)) {
      errors.push(
        `request: ${request.url()} (${request.failure()?.errorText ?? "failed"})`,
      );
    }
  });
  page.on("response", (response) => {
    if (response.url().startsWith(server.url) && !response.ok()) {
      errors.push(`response: ${response.url()} (${response.status()})`);
    }
  });

  try {
    await page.goto(server.url, { waitUntil: "networkidle" });
    await page.waitForFunction(
      (expectedEnvironment) => {
        const status = document.querySelector("#status");
        const canvas = document.querySelector("[data-pts-canvas]");
        return (
          status?.dataset.environment === expectedEnvironment &&
          status.dataset.point === "Pt(4, 5)" &&
          Number(canvas?.dataset.frames ?? 0) > 0
        );
      },
      environment,
      { timeout: 10_000 },
    );

    const rendered = await page.evaluate(() => {
      const canvas = document.querySelector("[data-pts-canvas]");
      if (!(canvas instanceof HTMLCanvasElement)) return null;
      const pixel = canvas.getContext("2d")?.getImageData(160, 90, 1, 1).data;
      return {
        frames: Number(canvas.dataset.frames),
        height: canvas.height,
        pixel: pixel ? [...pixel] : null,
        width: canvas.width,
      };
    });
    assert.ok(rendered, `${environment} did not expose its canvas`);
    assert.ok(rendered.frames > 0, `${environment} did not animate`);
    assert.ok(rendered.width > 0 && rendered.height > 0);
    assert.ok(rendered.pixel, `${environment} did not expose rendered pixels`);
    assert.ok(
      rendered.pixel[0] > 150 &&
        rendered.pixel[1] > 50 &&
        rendered.pixel[2] < 100 &&
        rendered.pixel[3] === 255,
      `${environment} center pixel was not the Pts drawing: ${rendered.pixel.join(",")}`,
    );

    if (environment === "vanilla") {
      assert.equal(
        await page.evaluate(() => typeof globalThis.Pts),
        "object",
        "vanilla did not load the Pts browser global",
      );
    }

    await page.click("#toggle");
    try {
      await page.waitForFunction(
        () => document.querySelector("#status")?.dataset.disposed === "true",
        undefined,
        { timeout: 5_000 },
      );
    } catch (error) {
      const state = await page.evaluate(() => ({
        canvasCount: document.querySelectorAll("[data-pts-canvas]").length,
        disposed: document.querySelector("#status")?.dataset.disposed,
      }));
      throw new Error(
        `${environment} did not report disposal: ${JSON.stringify(state)}; ${errors.join("; ")}`,
        { cause: error },
      );
    }
    if (removesCanvas) {
      assert.equal(await page.locator("[data-pts-canvas]").count(), 0);
      await page.click("#toggle");
      await page.waitForFunction(
        () => {
          const status = document.querySelector("#status");
          const canvas = document.querySelector("[data-pts-canvas]");
          return (
            status?.dataset.disposed === "false" &&
            Number(canvas?.dataset.frames ?? 0) > 0
          );
        },
        undefined,
        { timeout: 5_000 },
      );
      const remountedPixel = await page.evaluate(() => {
        const canvas = document.querySelector("[data-pts-canvas]");
        if (!(canvas instanceof HTMLCanvasElement)) return null;
        const pixel = canvas.getContext("2d")?.getImageData(160, 90, 1, 1).data;
        return pixel ? [...pixel] : null;
      });
      assert.ok(
        remountedPixel &&
          remountedPixel[0] > 150 &&
          remountedPixel[1] > 50 &&
          remountedPixel[2] < 100 &&
          remountedPixel[3] === 255,
        `${environment} did not draw after remount: ${remountedPixel?.join(",")}`,
      );
      await page.click("#toggle");
      await page.waitForFunction(
        () => document.querySelector("#status")?.dataset.disposed === "true",
        undefined,
        { timeout: 5_000 },
      );
      assert.equal(await page.locator("[data-pts-canvas]").count(), 0);
    }
    assert.deepEqual(errors, [], `${environment} reported browser errors`);
    console.log(
      `${environment} rendered ${rendered.frames} frame(s), passed its pixel check, and completed its lifecycle.`,
    );
  } finally {
    await page.close();
    await server.close();
  }
}

let browser;
try {
  const packageDirectory = path.join(temporaryRoot, "package");
  const extractedRoot = path.join(temporaryRoot, "pts");
  await mkdir(packageDirectory);
  await mkdir(extractedRoot);
  run(
    "npm",
    ["pack", "--silent", "--pack-destination", packageDirectory],
    projectRoot,
  );
  const tarballs = (await readdir(packageDirectory)).filter((file) =>
    file.endsWith(".tgz"),
  );
  assert.equal(tarballs.length, 1, "expected exactly one Pts tarball");
  run(
    "tar",
    [
      "--extract",
      "--gzip",
      "--file",
      path.join(packageDirectory, tarballs[0]),
      "--directory",
      extractedRoot,
      "--strip-components=1",
    ],
    projectRoot,
  );

  const isolatedFixtures = path.join(extractedRoot, "test", "integrations");
  await mkdir(path.dirname(isolatedFixtures), { recursive: true });
  await cp(fixtureSource, isolatedFixtures, {
    filter: (source) =>
      !["dist", "node_modules"].includes(path.basename(source)),
    recursive: true,
  });
  run("npm", ["ci", "--no-audit", "--no-fund"], isolatedFixtures);

  const installedPts = path.join(isolatedFixtures, "node_modules", "pts");
  assert.equal(await realpath(installedPts), await realpath(extractedRoot));
  const installedManifest = JSON.parse(
    await readFile(path.join(installedPts, "package.json"), "utf8"),
  );
  assert.equal(installedManifest.name, "pts");
  const resolvedPts = run(
    process.execPath,
    [
      "--input-type=module",
      "--eval",
      'process.stdout.write(import.meta.resolve("pts"))',
    ],
    path.join(isolatedFixtures, "react-vite"),
    true,
  ).trim();
  assert.equal(
    resolvedPts,
    pathToFileURL(await realpath(path.join(extractedRoot, "dist", "index.mjs")))
      .href,
  );
  assert.ok(!resolvedPts.includes(pathToFileURL(projectRoot).href));
  console.log(
    `Installed ${installedManifest.name}@${installedManifest.version} from ${tarballs[0]} and resolved its ESM entry.`,
  );

  for (const workspace of [
    "@pts-integrations/react-vite",
    "@pts-integrations/vue-vite",
  ]) {
    run("npm", ["run", "build", "--workspace", workspace], isolatedFixtures);
  }
  run(
    "npm",
    ["test", "--workspace", "@pts-integrations/skia-canvas"],
    isolatedFixtures,
  );

  browser = await chromium.launch({ headless: true });
  await testBrowserFixture(browser, {
    environment: "react-vite",
    removesCanvas: true,
    root: path.join(isolatedFixtures, "react-vite", "dist"),
  });
  await testBrowserFixture(browser, {
    environment: "vue-vite",
    removesCanvas: true,
    root: path.join(isolatedFixtures, "vue-vite", "dist"),
  });
  await testBrowserFixture(browser, {
    environment: "vanilla",
    removesCanvas: false,
    root: path.join(isolatedFixtures, "vanilla"),
    routes: new Map([
      ["/pts/pts.min.js", path.join(extractedRoot, "dist", "pts.min.js")],
    ]),
  });

  console.log("All packed Pts consumer integration fixtures passed.");
} finally {
  if (browser) await browser.close();
  await rm(temporaryRoot, { force: true, recursive: true });
}
