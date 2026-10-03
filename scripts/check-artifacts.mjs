import assert from "node:assert/strict";
import { createRequire } from "node:module";
import {
  access,
  mkdtemp,
  readdir,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
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
  "Boid",
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
  "Flock",
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
  "Path",
  "PoissonDisk",
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
  // The declarations keep their doc comments since 1.0; the triangulation and
  // the flock are full implementations. Keep approximately 2% headroom above the
  // measured build.
  "index.d.mts": 318300,
  "index.d.ts": 318300,
  "index.js": 315700,
  "index.mjs": 314800,
  "pts.js": 329400,
  "pts.min.js": 189700,
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

// Tree-shaking: a bundle of the two smallest exports must contain nothing
// else. A module-level side effect in any source file (a static field emitted
// as `Name.member = …` after its class, an impure initializer, a bare
// expression) is kept in every bundle, so this one bundle catches all of them.
// Keep mutable statics in module state behind accessors, and mark module-level
// calls `/* @__PURE__ */` (see Util.ts and Color.ts).
const { build, parseAst } = await import("vite");
const shakeDir = await mkdtemp(path.join(tmpdir(), "pts-tree-shaking-"));
const esmPath = fileURLToPath(new URL("index.mjs", dist));
const esmSource = await readFile(esmPath, "utf8");

// Bundle an entry with Vite (unminified) and return the output code.
async function bundle(name, source) {
  const entry = path.join(shakeDir, `${name}.mjs`);
  await writeFile(entry, source);
  const result = await build({
    configFile: false,
    logLevel: "silent",
    root: shakeDir,
    build: {
      write: false,
      minify: false,
      modulePreload: { polyfill: false },
      rollupOptions: { input: entry },
    },
  });
  return (Array.isArray(result) ? result[0] : result).output[0].code;
}

// Whether evaluating an expression is free of effects: no call, `new`,
// assignment, spread, tagged template, or property read that could run a
// getter (except constants of Math, Number and Symbol). Anything else counts.
const isBuiltinConstant = (node) =>
  node.type === "MemberExpression" &&
  !node.computed &&
  node.object.type === "Identifier" &&
  ["Math", "Number", "Symbol"].includes(node.object.name);
// a primitive computed without running user code: `-Infinity`, `Math.PI * 2`
function isPrimitive(node) {
  switch (node.type) {
    case "Literal":
      return !node.regex;
    case "Identifier":
      return ["Infinity", "NaN", "undefined"].includes(node.name);
    case "MemberExpression":
      return isBuiltinConstant(node);
    case "UnaryExpression":
      return node.operator !== "delete" && isPrimitive(node.argument);
    case "BinaryExpression":
      return (
        !["in", "instanceof"].includes(node.operator) &&
        isPrimitive(node.left) &&
        isPrimitive(node.right)
      );
    default:
      return false;
  }
}
function isInert(node) {
  if (!node) return true;
  switch (node.type) {
    case "Identifier":
    case "FunctionExpression":
    case "ArrowFunctionExpression":
      return true;
    case "TemplateLiteral":
      return node.expressions.length === 0;
    case "Literal":
    case "UnaryExpression":
    case "BinaryExpression":
    case "MemberExpression":
      return isPrimitive(node);
    case "ArrayExpression":
      return node.elements.every(
        (element) =>
          element === null ||
          (element.type !== "SpreadElement" && isInert(element)),
      );
    case "ObjectExpression":
      return node.properties.every(
        (property) =>
          property.type === "Property" &&
          (!property.computed || isPrimitive(property.key)) &&
          isInert(property.value),
      );
    case "ClassExpression":
    case "ClassDeclaration":
      return (
        (node.superClass === null || node.superClass.type === "Identifier") &&
        (node.decorators?.length ?? 0) === 0 &&
        node.body.body.every(
          (member) =>
            member.type !== "StaticBlock" &&
            (member.decorators?.length ?? 0) === 0 &&
            (!member.computed || isPrimitive(member.key)) &&
            (member.type === "MethodDefinition" ||
              !member.static ||
              isInert(member.value)),
        )
      );
    default:
      return false;
  }
}

// The top-level statements of a probe bundle that are not inert
// declarations, except the entry's own `globalThis.ptsProbe = …`.
function moduleLevelEffects(code) {
  const offenders = [];
  let probes = 0;
  for (const statement of parseAst(code).body) {
    const text = code.slice(statement.start, statement.end);
    if (text.startsWith("globalThis.ptsProbe = ") && probes++ === 0) continue;
    const inert =
      statement.type === "FunctionDeclaration" ||
      statement.type === "EmptyStatement" ||
      (statement.type === "ClassDeclaration" && isInert(statement)) ||
      (statement.type === "VariableDeclaration" &&
        statement.declarations.every(
          (declarator) =>
            declarator.id.type === "Identifier" && isInert(declarator.init),
        ));
    if (!inert) offenders.push(text);
  }
  assert.equal(probes, 1, "the probe bundle lost its entry statement");
  return offenders;
}

const probeEntry = (from) =>
  `import { Const, Form } from ${JSON.stringify(from)};\n` +
  "globalThis.ptsProbe = [Const, Form];\n";

// Negative controls: each injects one effect into a copy of the build, which
// the check must report. The first two passed the earlier line-based check.
const appendStatement = (statement) => (source) =>
  source.replace("\nexport {", `\n${statement}\nexport {`);
const controls = [
  [
    "a statement that starts with a regex",
    appendStatement("/x/.test(globalThis.ptsControl());"),
  ],
  [
    "a call inside the Const initializer",
    (source) =>
      source.replace(
        "const Const = {",
        "const Const = {\n\tcontrol: [globalThis.ptsControl()],",
      ),
  ],
  [
    "a static field assignment",
    appendStatement("Form.control = globalThis.ptsControl;"),
  ],
  ["a getter read at load", appendStatement("Color.ranges;")],
  [
    "an immediately invoked function",
    appendStatement("(() => globalThis.ptsControl())();"),
  ],
];
// Runtime probes: a bundle of a few exports must run and compute what the
// whole library computes, so tree-shaking dropped nothing they need (the
// module state behind Color and Util, the pure-annotated tables and
// constants of Create and the triangulation).
const square = (x) =>
  `Group.fromArray([[${x}, 0], [${x + 10}, 0], [${x + 10}, 10], [${x}, 10]])`;
const runtimeProbes = [
  ["Pt", "const p = new Pt(1, 2, 3); return [p.$add(1), p.$unit()];"],
  [
    "Color",
    "const c = Color.rgb(200, 120, 40); return [Color.RGBtoLAB(c), " +
      "Color.RGBtoLUV(c), Color.LABtoRGB(Color.RGBtoLAB(c)), " +
      'Color.maxValues("lch"), c.$normalize(), Color.RGBtoHSL(c, false, true), ' +
      'c.clone().toMode("lch", true), Color.ranges.lab];',
  ],
  [
    "Shaping, Mat",
    "return [Shaping.cubicBezier(0.3), Shaping.cubicBezier(0.7, 2, [0.2, 0.9], " +
      "[0.6, 0.1]), Mat.reflectAt2DMatrix([0, 1], [3, 5]), " +
      "Mat.reflectAt2DMatrix([2, 0], [2, 7])];",
  ],
  [
    "UI, Group, Util",
    'const id = () => new UI(Group.fromArray([[0, 0], [1, 1]]), "rect").id; ' +
      "const a = Number(id().slice(3)); " +
      "return [Util.warnLevel(), Number(id().slice(3)) - a];",
  ],
  [
    "Create, Group",
    "return Create.delaunay(Group.fromArray([[0, 0], [10, 0], [0, 10], " +
      "[10, 10], [5, 5], [3, 7], [8, 2]])).delaunay();",
  ],
  [
    "Path, Group",
    `return [Path.unite([${square(0)}, ${square(5)}]), ` +
      `Path.intersect([${square(0)}, ${square(5)}])];`,
  ],
  [
    "Noise",
    "const n = new Noise(1.5, 2.5); n.initNoise(0.01, 0.1); " +
      "n.step(0.1, 0.2); return n.noise2D();",
  ],
];
const serialize = (value) =>
  JSON.stringify(value, (key, v) =>
    ArrayBuffer.isView(v) ? Array.from(v) : v,
  );

const controlResults = [];
try {
  assert.deepEqual(
    moduleLevelEffects(await bundle("probe", probeEntry(esmPath))),
    [],
    "a bundle of only Const and Form keeps module-level statements that may " +
      "have effects, so every bundle keeps them: move static fields to module " +
      "state behind accessors, and mark module-level calls /* @__PURE__ */ " +
      "(if a listed statement is harmless, teach isInert in this script)",
  );

  // Positive control: harmless forms the check must accept.
  const harmless = esmSource
    .replace(
      "const Const = {",
      "const Const = {\n\tlowest: -Infinity,\n\ttwoPi: Math.PI * 2,",
    )
    .replace(
      "var Form = class {",
      "var Form = class {\n\t*[Symbol.iterator]() {}\n" +
        "\tstatic get [Symbol.species]() {\n\t\treturn this;\n\t}",
    );
  assert.ok(
    harmless.includes("lowest: -Infinity") &&
      harmless.includes("[Symbol.species]"),
    "the positive control did not apply",
  );
  const harmlessCopy = path.join(shakeDir, "harmless-index.mjs");
  await writeFile(harmlessCopy, harmless);
  assert.deepEqual(
    moduleLevelEffects(await bundle("harmless", probeEntry(harmlessCopy))),
    [],
    "the tree-shaking check rejects harmless code",
  );

  for (const [index, [label, inject]] of controls.entries()) {
    const injected = inject(esmSource);
    assert.notEqual(injected, esmSource, `control "${label}" did not apply`);
    const copy = path.join(shakeDir, `control-${index}-index.mjs`);
    await writeFile(copy, injected);
    const offenders = moduleLevelEffects(
      await bundle(`control-${index}`, probeEntry(copy)),
    );
    controlResults.push([label, offenders.length > 0]);
  }

  // Bundle `imports` from `from`, run `body` in the bundle, and serialize it.
  const runBundled = async (name, imports, body, from) => {
    const file = path.join(shakeDir, `${name}.bundle.mjs`);
    await writeFile(
      file,
      await bundle(
        name,
        `import { ${imports} } from ${JSON.stringify(from)};\n` +
          `globalThis.ptsProbe = () => { ${body} };\n`,
      ),
    );
    delete globalThis.ptsProbe;
    await import(pathToFileURL(file).href);
    return serialize(globalThis.ptsProbe());
  };
  const runWhole = (imports, body) => {
    const names = imports.split(", ");
    return serialize(
      new Function(...names, body)(...names.map((name) => esm[name])),
    );
  };
  for (const [index, [imports, body]] of runtimeProbes.entries()) {
    assert.equal(
      await runBundled(`runtime-${index}`, imports, body, esmPath),
      runWhole(imports, body),
      `a tree-shaken bundle of ${imports} computes differently from the whole library`,
    );
  }
  // Negative control: an initialization wrongly marked pure is dropped from
  // the bundle (Util's warning level is then undefined), which a probe must
  // notice.
  const [utilImports, utilBody] = runtimeProbes[3];
  const dropped = esmSource.replace(
    'let _utilWarnLevel = "mute";',
    'let _utilWarnLevel;\n/* @__PURE__ */ (() => { _utilWarnLevel = "mute"; })();',
  );
  assert.notEqual(dropped, esmSource, "the runtime control did not apply");
  const droppedCopy = path.join(shakeDir, "runtime-control-index.mjs");
  await writeFile(droppedCopy, dropped);
  assert.notEqual(
    await runBundled("runtime-control", utilImports, utilBody, droppedCopy),
    runWhole(utilImports, utilBody),
    "the runtime probes missed an initialization the bundler dropped",
  );
  delete globalThis.ptsProbe;
} finally {
  await rm(shakeDir, { recursive: true, force: true });
}
assert.deepEqual(
  controlResults.filter(([, caught]) => !caught).map(([label]) => label),
  [],
  "the tree-shaking check missed an injected side effect",
);

console.log(
  `Validated ${expectedFiles.length} artifacts, ${expectedExports.length} public module exports, ` +
    `a side-effect-free ESM bundle (${controls.length} negative and 1 positive controls), ` +
    `and ${runtimeProbes.length} tree-shaken runtime probes (control caught).`,
);
