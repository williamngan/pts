import assert from "node:assert/strict";
import { createReadStream } from "node:fs";
import { access, readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const docsDirectory = path.join(projectRoot, "docs");
const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
]);

function serveDocumentation() {
  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url, "http://localhost");
      const pathname = decodeURIComponent(url.pathname);
      const relative = pathname === "/" ? "index.html" : pathname.slice(1);
      const file = path.resolve(docsDirectory, relative);
      assert.ok(
        file === docsDirectory ||
          file.startsWith(`${docsDirectory}${path.sep}`),
        "Request escaped the documentation directory",
      );
      await access(file);
      assert.ok((await stat(file)).isFile(), "Requested path is not a file");
      response.writeHead(200, {
        "content-type":
          contentTypes.get(path.extname(file)) ?? "application/octet-stream",
      });
      createReadStream(file).pipe(response);
    } catch {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      response.end("Not found");
    }
  });

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      assert.ok(address && typeof address === "object");
      resolve({
        close: () => new Promise((done) => server.close(done)),
        origin: `http://127.0.0.1:${address.port}`,
      });
    });
  });
}

const localFailures = [];
const pageErrors = [];
const consoleErrors = [];
const documentation = await serveDocumentation();
const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("requestfailed", (request) => {
    if (request.url().startsWith(documentation.origin)) {
      localFailures.push(`${request.method()} ${request.url()}`);
    }
  });

  await page.goto(`${documentation.origin}/index.html`, {
    waitUntil: "networkidle",
  });
  await page.getByRole("heading", { name: "Pts Docs" }).waitFor();
  assert.equal(await page.locator("#modules > div").count(), 19);
  assert.deepEqual(await page.locator("#modules h4").allTextContents(), [
    "Canvas",
    "Color",
    "Create",
    "Dom",
    "Form",
    "Image",
    "LinearAlgebra",
    "Num",
    "Op",
    "Physics",
    "Play",
    "Pt",
    "Space",
    "Svg",
    "Typography",
    "UI",
    "Util",
    "uheprng",
    "Types",
  ]);

  const accessibilityBasics = await page.evaluate(() => ({
    htmlLanguage: document.documentElement.lang,
    membersTabIndex: document.querySelector("#members").tabIndex,
    modulesTabIndex: document.querySelector("#modules").tabIndex,
    secondaryColor: getComputedStyle(document.querySelector("#modules .ts"))
      .color,
    viewport: document.querySelector('meta[name="viewport"]').content,
  }));
  assert.deepEqual(accessibilityBasics, {
    htmlLanguage: "en",
    membersTabIndex: 0,
    modulesTabIndex: 0,
    secondaryColor: "rgb(102, 119, 136)",
    viewport: "width=device-width, initial-scale=1",
  });

  const landingLayout = await page.evaluate(() => {
    const header = document.querySelector("#header").getBoundingClientRect();
    const modules = document.querySelector("#modules").getBoundingClientRect();
    const contents = document
      .querySelector("#contents")
      .getBoundingClientRect();
    return {
      contentsLeft: contents.left,
      headerHeight: header.height,
      modulesLeft: modules.left,
      modulesWidth: modules.width,
    };
  });
  assert.deepEqual(landingLayout, {
    contentsLeft: 288,
    headerHeight: 71,
    modulesLeft: 0,
    modulesWidth: 288,
  });

  await page
    .getByRole("navigation", { name: "Modules", exact: true })
    .getByRole("link", { name: "CanvasSpace", exact: true })
    .press("Enter");
  await page
    .locator("#contents")
    .getByRole("heading", { name: "CanvasSpace", exact: true })
    .waitFor();
  await page.locator("#modules .item").filter({ hasText: /^Pt$/u }).click();
  await page
    .locator("#contents")
    .getByRole("heading", { name: "Pt", exact: true })
    .waitFor();
  await page.evaluate(() => history.back());
  await page.waitForURL(
    `${documentation.origin}/index.html?p=Canvas_CanvasSpace`,
  );
  await page
    .locator("#contents")
    .getByRole("heading", { name: "CanvasSpace", exact: true })
    .waitFor();

  await page.locator("#function_setup").first().waitFor({ state: "attached" });
  await page
    .locator("#members")
    .getByRole("link", { name: "setup", exact: true })
    .press("Enter");
  await page.waitForURL(
    `${documentation.origin}/index.html?p=Canvas_CanvasSpace#function_setup`,
  );

  await page.goto(`${documentation.origin}/index.html?p=Pt_Pt#function_add`, {
    waitUntil: "networkidle",
  });
  await page
    .locator("#contents")
    .getByRole("heading", { name: "Pt", exact: true })
    .waitFor();
  await page.locator("#function_add").first().waitFor({ state: "attached" });
  assert.equal(await page.locator("#members.collapsed").count(), 0);
  assert.equal(
    await page
      .locator("#contents")
      .evaluate((element) => element.classList.contains("expanded")),
    true,
  );
  assert.equal(await page.locator("#function_reduce .overload").count(), 3);

  const search = page.locator("#search_input");
  await search.fill("Circle.fromCenter");
  await page.locator("#members.searchResults .item").first().waitFor();
  const searchResults = await page
    .locator("#members.searchResults .item")
    .allTextContents();
  assert.ok(
    searchResults.some((result) => result.includes("Circle.fromCenter")),
  );
  await page.locator("#clearSearch").click();
  assert.equal(await search.inputValue(), "");

  await page.goto(`${documentation.origin}/index.html?p=Canvas_CanvasForm`, {
    waitUntil: "networkidle",
  });
  await page
    .locator("#contents")
    .getByRole("heading", { name: "CanvasForm", exact: true })
    .waitFor();
  assert.equal(await page.locator("#function_arc").count(), 1);
  assert.equal(await page.locator("#function_static_arc").count(), 1);
  await page.locator('#members [data-target="function_static_arc"]').click();
  await page.waitForURL(
    `${documentation.origin}/index.html?p=Canvas_CanvasForm#function_static_arc`,
  );
  const staticArcAlignment = await page.evaluate(() => {
    const contents = document
      .querySelector("#contents")
      .getBoundingClientRect();
    const target = document
      .querySelector("#function_static_arc")
      .getBoundingClientRect();
    // abs() so a subpixel offset can't round to -0, which fails strict equality
    return Math.round(Math.abs(target.top - contents.top));
  });
  assert.equal(staticArcAlignment, 0);

  // Every generated long anchor must survive a direct link, not just an
  // in-page click that bypasses loadContents' URL handling.
  const searchIndex = JSON.parse(
    await readFile(path.join(docsDirectory, "json/search.json"), "utf8"),
  );
  const longTargets = searchIndex
    .map(([target]) => target)
    .filter((target) => (target.split("#")[1]?.length ?? 0) > 30);
  assert.ok(longTargets.length > 0);
  for (const target of longTargets) {
    const hash = target.split("#")[1];
    await page.goto(`${documentation.origin}/index.html?p=${target}`);
    await page.locator(`[id="${hash}"]`).waitFor({ state: "attached" });
    await page.waitForFunction((hash) => {
      const target = document.getElementById(hash);
      const contents = document.getElementById("contents");
      return (
        location.hash === `#${hash}` &&
        contents.scrollTop > 0 &&
        target.getBoundingClientRect().top >=
          contents.getBoundingClientRect().top - 1 &&
        target.getBoundingClientRect().top <
          contents.getBoundingClientRect().bottom
      );
    }, hash);
  }

  await search.fill("Color.ranges");
  const rangesResult = page
    .locator("#members.searchResults .item")
    .filter({ hasText: "Color.ranges" })
    .first();
  await rangesResult.waitFor();
  await rangesResult
    .getByRole("link", { name: "Color.ranges", exact: true })
    .press("Enter");
  await page.waitForURL(
    `${documentation.origin}/index.html?p=Color_Color#property_ranges`,
  );
  await page.locator("#property_ranges").waitFor();

  await page.goto(
    `${documentation.origin}/index.html?p=Types_CanvasSpaceOptions`,
    { waitUntil: "networkidle" },
  );
  await page
    .locator("#contents")
    .getByRole("heading", { name: "CanvasSpaceOptions" })
    .waitFor();
  await page.getByText("equivalent to", { exact: true }).waitFor();

  const pageErrorCount = pageErrors.length;
  const consoleErrorCount = consoleErrors.length;
  await page.goto(`${documentation.origin}/index.html?p=Missing_Page`, {
    waitUntil: "networkidle",
  });
  await page
    .locator("#contents")
    .getByRole("heading", { name: "Page not found", exact: true })
    .waitFor();
  await page.getByRole("alert").getByText("Missing_Page").waitFor();
  assert.equal(pageErrors.length, pageErrorCount);
  assert.deepEqual(consoleErrors.slice(consoleErrorCount), [
    "Failed to load resource: the server responded with a status of 404 (Not Found)",
  ]);
  consoleErrors.splice(consoleErrorCount);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${documentation.origin}/index.html?p=Pt_Pt`, {
    waitUntil: "networkidle",
  });
  await page
    .locator("#contents")
    .getByRole("heading", { name: "Pt", exact: true })
    .waitFor();
  const mobileLayout = await page.evaluate(() => {
    const contents = document
      .querySelector("#contents")
      .getBoundingClientRect();
    const menu = document.querySelector("#menu").getBoundingClientRect();
    const toc = getComputedStyle(document.querySelector("#toc"));
    return {
      contentsLeft: contents.left,
      menuLeft: menu.left,
      tocDisplay: toc.display,
    };
  });
  assert.deepEqual(mobileLayout, {
    contentsLeft: 0,
    menuLeft: -390,
    tocDisplay: "block",
  });
  const mobileHeader = await page.evaluate(() => {
    const header = document.querySelector("#header").getBoundingClientRect();
    const pts = document.querySelector("#pts").getBoundingClientRect();
    const toc = document.querySelector("#toc").getBoundingClientRect();
    const topmenu = document.querySelector("#topmenu").getBoundingClientRect();
    return {
      headerRight: Math.round(header.right),
      ptsLeft: Math.round(pts.left),
      ptsRight: Math.round(pts.right),
      tocRight: Math.round(toc.right),
      topmenuLeft: Math.round(topmenu.left),
      topmenuRight: Math.round(topmenu.right),
    };
  });
  assert.ok(mobileHeader.tocRight <= mobileHeader.ptsLeft);
  assert.ok(mobileHeader.ptsRight <= mobileHeader.topmenuLeft);
  assert.ok(mobileHeader.topmenuRight <= mobileHeader.headerRight);
  await page.locator("#toc").click();
  await page.waitForFunction(
    () => document.querySelector("#menu").getBoundingClientRect().left === 0,
  );

  assert.deepEqual(
    localFailures,
    [],
    "Documentation made failed local requests",
  );
  assert.deepEqual(pageErrors, [], "Documentation raised page errors");
  assert.deepEqual(consoleErrors, [], "Documentation logged console errors");
} finally {
  await browser.close();
  await documentation.close();
}

console.log(
  "Documentation navigation, search, anchors, and desktop/mobile layouts passed in Chromium.",
);
