import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { access, readdir, readFile, stat } from "node:fs/promises";
import vm from "node:vm";

const require = createRequire(import.meta.url);
const dist = new URL("../dist/", import.meta.url);
const expectedFiles = [
  "index.d.mts",
  "index.d.mts.map",
  "index.d.ts",
  "index.d.ts.map",
  "index.js",
  "index.js.map",
  "index.mjs",
  "index.mjs.map",
  "pts.js",
  "pts.js.map",
  "pts.min.js",
  "pts.min.js.map",
];
const expectedExports = [
  "Body",
  "Bound",
  "CanvasForm",
  "CanvasSpace",
  "Circle",
  "Color",
  "Const",
  "Create",
  "Curve",
  "DOMSpace",
  "Delaunay",
  "Font",
  "Form",
  "Geom",
  "Group",
  "HTMLForm",
  "HTMLSpace",
  "Img",
  "Line",
  "Mat",
  "MultiTouchSpace",
  "Noise",
  "Num",
  "Particle",
  "Polygon",
  "Pt",
  "Range",
  "Rectangle",
  "SVGContext2D",
  "SVGForm",
  "SVGSpace",
  "Shaping",
  "Sound",
  "Space",
  "Tempo",
  "Triangle",
  "Typography",
  "UI",
  "UIButton",
  "UIDragger",
  "UIPointerActions",
  "UIShape",
  "Util",
  "Vec",
  "VisualForm",
  "World",
];
const sizeLimits = {
  "index.d.mts": 64292,
  "index.d.ts": 64291,
  "index.js": 235550,
  "index.mjs": 234681,
  "pts.js": 246326,
  "pts.min.js": 144576,
};
const banner = "Copyright © 2017-present William Ngan and contributors.";

assert.deepEqual(
  (await readdir(dist)).sort(),
  expectedFiles,
  "unexpected dist file set",
);

const cjs = require("../dist/index.js");
const esm = await import(new URL("index.mjs", dist).href);
assert.deepEqual(
  Object.keys(cjs).sort(),
  expectedExports,
  "CommonJS exports changed",
);
assert.deepEqual(
  Object.keys(esm).sort(),
  expectedExports,
  "ESM exports changed",
);

for (const library of [cjs, esm]) {
  const point = new library.Pt(1, 2, 3).add(2);
  assert.equal(point.toString(), "Pt(3, 4, 5)");
  assert.equal(
    library.Line.magnitude([new library.Pt(0, 0), new library.Pt(3, 4)]),
    5,
  );
}

for (const file of ["pts.js", "pts.min.js"]) {
  const source = await readFile(new URL(file, dist), "utf8");
  const context = {};
  context.globalThis = context;
  context.window = context;
  vm.runInNewContext(source, context, { filename: file });
  assert.deepEqual(
    Object.keys(context.Pts).sort(),
    [...expectedExports, "namespace", "quickStart"].sort(),
    `${file} browser-global exports changed`,
  );
  assert.equal(typeof context.Pts.namespace, "function");
  assert.equal(typeof context.Pts.quickStart, "function");
}

for (const [file, limit] of Object.entries(sizeLimits)) {
  const bytes = (await stat(new URL(file, dist))).size;
  assert.ok(bytes <= limit, `${file} is ${bytes} bytes; budget is ${limit}`);
}

for (const file of ["index.js", "index.mjs", "pts.js", "pts.min.js"]) {
  const source = await readFile(new URL(file, dist), "utf8");
  assert.ok(
    source.includes(banner),
    `${file} is missing the stable license banner`,
  );
  assert.match(
    source,
    /sourceMappingURL=.*\.map/,
    `${file} is missing its source-map link`,
  );

  const map = JSON.parse(await readFile(new URL(`${file}.map`, dist), "utf8"));
  assert.equal(map.file, file);
  assert.ok(map.sources.length > 0, `${file}.map has no source paths`);
  assert.equal(map.sources.length, map.sourcesContent.length);
  assert.ok(
    map.sources.every((sourcePath) => sourcePath.startsWith("../src/")),
  );
  assert.ok(
    map.sourcesContent.every(
      (content) => typeof content === "string" && content.length > 0,
    ),
  );
}

for (const file of ["index.d.ts", "index.d.mts"]) {
  const source = await readFile(new URL(file, dist), "utf8");
  assert.match(source, /sourceMappingURL=.*\.map/);
  const map = JSON.parse(await readFile(new URL(`${file}.map`, dist), "utf8"));
  assert.equal(map.file, file);
  assert.ok(map.sources.length > 0, `${file}.map has no source paths`);
  assert.ok(
    map.sources.every((sourcePath) => sourcePath.startsWith("../src/")),
  );
  await Promise.all(
    map.sources.map((sourcePath) => access(new URL(sourcePath, dist))),
  );
}

console.log(
  `Validated ${expectedFiles.length} artifacts and ${expectedExports.length} public module exports.`,
);
