import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const distDirectory = path.join(projectRoot, "dist");
const tempRoot = await mkdtemp(path.join(tmpdir(), "pts-package-"));
const packageJson = JSON.parse(
  await readFile(path.join(projectRoot, "package.json"), "utf8"),
);

function run(command, args, cwd, options = {}) {
  return execFileSync(command, args, {
    cwd,
    encoding: options.capture ? "utf8" : undefined,
    stdio: options.capture ? ["ignore", "pipe", "inherit"] : "inherit",
  });
}

async function writeJson(file, value) {
  await writeFile(file, `${JSON.stringify(value, null, 2)}\n`);
}

async function bundleSize(directory) {
  const assets = path.join(directory, "dist", "assets");
  const files = (await readdir(assets)).filter((file) => file.endsWith(".js"));
  assert.ok(files.length > 0, `Vite produced no JavaScript in ${directory}`);
  let bytes = 0;
  for (const file of files) bytes += (await stat(path.join(assets, file))).size;
  return bytes;
}

async function distributionHashes() {
  const result = {};
  for (const file of (await readdir(distDirectory)).sort()) {
    const content = await readFile(path.join(distDirectory, file));
    result[file] = createHash("sha256").update(content).digest("hex");
  }
  return result;
}

try {
  const packDirectory = path.join(tempRoot, "pack");
  await mkdir(packDirectory);
  const hashesBeforePack = await distributionHashes();
  run(
    "npm",
    ["pack", "--silent", "--pack-destination", packDirectory],
    projectRoot,
  );
  const tarballs = (await readdir(packDirectory)).filter((file) =>
    file.endsWith(".tgz"),
  );
  assert.deepEqual(
    await distributionHashes(),
    hashesBeforePack,
    "npm pack's clean prepack build changed the checked-in artifacts",
  );
  assert.equal(
    tarballs.length,
    1,
    "npm pack did not create exactly one tarball",
  );
  const tarball = path.join(packDirectory, tarballs[0]);

  const dryRun = JSON.parse(
    run(
      "npm",
      ["pack", "--dry-run", "--ignore-scripts", "--json", "--silent"],
      projectRoot,
      {
        capture: true,
      },
    ),
  )[0];
  const expectedPackedFiles = [
    "LICENSE",
    "README.md",
    "dist/index.d.mts",
    "dist/index.d.mts.map",
    "dist/index.d.ts",
    "dist/index.d.ts.map",
    "dist/index.js",
    "dist/index.js.map",
    "dist/index.mjs",
    "dist/index.mjs.map",
    "dist/pts.js",
    "dist/pts.js.map",
    "dist/pts.min.js",
    "dist/pts.min.js.map",
    "package.json",
    "src/Canvas.ts",
    "src/Color.ts",
    "src/Create.ts",
    "src/Dom.ts",
    "src/Form.ts",
    "src/Image.ts",
    "src/LinearAlgebra.ts",
    "src/Num.ts",
    "src/Op.ts",
    "src/Physics.ts",
    "src/Play.ts",
    "src/Pt.ts",
    "src/Space.ts",
    "src/Svg.ts",
    "src/Types.ts",
    "src/Typography.ts",
    "src/UI.ts",
    "src/Util.ts",
    "src/_module.ts",
    "src/_script.ts",
    "src/uheprng.ts",
  ];
  assert.deepEqual(
    dryRun.files.map(({ path: file }) => file).sort(),
    expectedPackedFiles,
    "published file allowlist changed",
  );
  assert.ok(
    // Keep a small (~2%) growth budget above the current release archive. The
    // previous ceiling predates the recent Color, Sound, and Typography work
    // and is already below the unchanged package allowlist's baseline size.
    dryRun.size < 1_115_000,
    `packed tarball is unexpectedly large: ${dryRun.size} bytes`,
  );
  assert.equal(
    packageJson.dependencies,
    undefined,
    "Pts must not have runtime dependencies",
  );
  assert.equal(
    packageJson.optionalDependencies,
    undefined,
    "Pts must not have optional dependencies",
  );

  const consumer = path.join(tempRoot, "consumer");
  await mkdir(consumer);
  await writeJson(path.join(consumer, "package.json"), {
    name: "pts-package-fixture",
    private: true,
    type: "module",
  });
  run(
    "npm",
    [
      "install",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      "--no-package-lock",
      tarball,
    ],
    consumer,
  );

  await writeFile(
    path.join(consumer, "esm-smoke.mjs"),
    `
      import assert from "node:assert/strict";
      import * as Pts from "pts";
      assert.match(import.meta.resolve("pts"), /dist\\/index\\.mjs$/);
      assert.equal(new Pts.Pt(1, 2).add(3).toString(), "Pt(4, 5)");
      assert.equal(Object.keys(Pts).length, 46);
    `,
  );
  await writeFile(
    path.join(consumer, "cjs-smoke.cjs"),
    `
      const assert = require("node:assert/strict");
      const Pts = require("pts");
      assert.match(require.resolve("pts"), /dist\\/index\\.js$/);
      assert.match(require.resolve("pts/dist/pts.min.js"), /dist\\/pts\\.min\\.js$/);
      assert.equal(new Pts.Pt(2, 4).multiply(2).toString(), "Pt(4, 8)");
      assert.equal(Object.keys(Pts).length, 46);
    `,
  );
  run(process.execPath, ["esm-smoke.mjs"], consumer);
  run(process.execPath, ["cjs-smoke.cjs"], consumer);

  await writeFile(
    path.join(consumer, "bundler.ts"),
    `
      import { CanvasSpace, Pt, type IPlayer } from "pts";
      const point: Pt = new Pt(1, 2);
      const player: IPlayer = { animate: () => point.add(1) };
      const SpaceClass: typeof CanvasSpace = CanvasSpace;
      void player;
      void SpaceClass;
    `,
  );
  await writeFile(
    path.join(consumer, "node-esm.mts"),
    `import { Pt } from "pts"; new Pt(1, 2);\n`,
  );
  await writeFile(
    path.join(consumer, "node-cjs.cts"),
    `import { Pt } from "pts"; new Pt(1, 2);\n`,
  );
  await writeJson(path.join(consumer, "tsconfig.bundler.json"), {
    compilerOptions: {
      lib: ["ES2020", "DOM", "DOM.Iterable"],
      module: "ESNext",
      moduleResolution: "Bundler",
      noEmit: true,
      strict: true,
      target: "ES2020",
    },
    files: ["bundler.ts"],
  });
  await writeJson(path.join(consumer, "tsconfig.node-esm.json"), {
    compilerOptions: {
      lib: ["ES2020", "DOM", "DOM.Iterable"],
      module: "NodeNext",
      moduleResolution: "NodeNext",
      noEmit: true,
      strict: true,
      target: "ES2020",
    },
    files: ["node-esm.mts"],
  });
  await writeJson(path.join(consumer, "tsconfig.node-cjs.json"), {
    compilerOptions: {
      lib: ["ES2020", "DOM", "DOM.Iterable"],
      module: "NodeNext",
      moduleResolution: "NodeNext",
      noEmit: true,
      strict: true,
      target: "ES2020",
    },
    files: ["node-cjs.cts"],
  });
  const tsc = path.join(
    projectRoot,
    "node_modules",
    "typescript",
    "bin",
    "tsc",
  );
  for (const config of [
    "tsconfig.bundler.json",
    "tsconfig.node-esm.json",
    "tsconfig.node-cjs.json",
  ]) {
    run(process.execPath, [tsc, "--project", config], consumer);
  }

  const vite = path.join(projectRoot, "node_modules", "vite", "bin", "vite.js");
  const apps = {
    canvas: `import { CanvasSpace } from "pts"; globalThis.PtsCanvasSpace = CanvasSpace;`,
    full: `import * as Pts from "pts"; globalThis.Pts = Pts;`,
    small: `import { Pt } from "pts"; globalThis.point = new Pt(1, 2);`,
  };
  const bundleSizes = {};
  for (const [name, source] of Object.entries(apps)) {
    const directory = path.join(consumer, `vite-${name}`);
    await mkdir(directory);
    await writeFile(
      path.join(directory, "index.html"),
      `<!doctype html><script type="module" src="/main.js"></script>`,
    );
    await writeFile(path.join(directory, "main.js"), source);
    run(
      process.execPath,
      [vite, "build", directory, "--logLevel", "error"],
      consumer,
    );
    bundleSizes[name] = await bundleSize(directory);
  }
  assert.ok(
    bundleSizes.small < bundleSizes.full * 0.75,
    `tree-shaking regression: small=${bundleSizes.small}, full=${bundleSizes.full}`,
  );

  const productionTree = JSON.parse(
    run("npm", ["ls", "--omit=dev", "--all", "--json"], consumer, {
      capture: true,
    }),
  );
  assert.deepEqual(
    Object.keys(productionTree.dependencies.pts.dependencies ?? {}),
    [],
  );

  console.log(
    `Validated ${path.basename(tarball)} (${dryRun.size} bytes packed); ` +
      `Vite bundles: Pt=${bundleSizes.small}, CanvasSpace=${bundleSizes.canvas}, full=${bundleSizes.full} bytes.`,
  );
} finally {
  await rm(tempRoot, { force: true, recursive: true });
}
