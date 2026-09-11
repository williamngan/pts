import assert from "node:assert/strict";
import {
  readdir,
  readFile,
  rename,
  rm,
  mkdir,
  mkdtemp,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  Application,
  Comment,
  EntryPointStrategy,
  ReflectionKind,
} from "typedoc";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const sourceDirectory = path.join(projectRoot, "src");
const defaultJsonDirectory = path.join(projectRoot, "docs", "json");
const searchWeights = new Map([
  ["Constructor", 10],
  ["Function", 8],
  ["Accessor", 6],
  ["Property", 4],
]);
const legacyArrayUnscopablesType =
  "{ copyWithin:`boolean`, entries:`boolean`, fill:`boolean`, find:`boolean`, findIndex:`boolean`, keys:`boolean`, values:`boolean` }";
const wellKnownSymbols = new Set([
  "asyncDispose",
  "asyncIterator",
  "dispose",
  "hasInstance",
  "isConcatSpreadable",
  "iterator",
  "match",
  "matchAll",
  "replace",
  "search",
  "species",
  "split",
  "toPrimitive",
  "toStringTag",
  "unscopables",
]);

function normalizeLineEndings(value) {
  return value.replaceAll("\r\n", "\n").replace(/[\t ]+\n/gu, "\n");
}

function normalizeName(name) {
  const match = /^\[([^\]]+)]$/.exec(name);
  if (match && wellKnownSymbols.has(match[1])) {
    return `[Symbol.${match[1]}]`;
  }
  return name;
}

function memberAnchor(prefix, member) {
  const qualifier =
    prefix === "function" && member.flags?.isStatic ? "static_" : "";
  return `${prefix}_${qualifier}${member.name}`;
}

function normalizeReferenceName(reference) {
  if (!reference?.name) return false;
  return reference.name.replace(/\.\[([^\]]+)]$/, (match, name) =>
    wellKnownSymbols.has(name) ? `.[Symbol.${name}]` : match,
  );
}

function normalizeSourcePath(fileName) {
  const normalized = fileName.replaceAll("\\", "/");
  const pnpmPath =
    /(?:^|\/)node_modules\/\.pnpm\/[^/]+\/node_modules\/(.+)$/u.exec(
      normalized,
    );
  if (pnpmPath) return `node_modules/${pnpmPath[1]}`;

  const nodeModules = /(?:^|\/)node_modules\/(.+)$/u.exec(normalized);
  if (nodeModules) return `node_modules/${nodeModules[1]}`;

  const source = /(?:^|\/)src\/(.+)$/u.exec(normalized);
  if (source) return `src/${source[1]}`;

  return normalized.replace(/^\.\//u, "");
}

function sourcesOf(reflection) {
  return (reflection?.sources ?? []).map((source) => [
    normalizeSourcePath(source.fileName),
    source.line,
    source.character,
  ]);
}

function commentParts(parts) {
  return normalizeLineEndings(Comment.combineDisplayParts(parts));
}

function commentOf(reflection) {
  const direct = commentParts(reflection?.comment?.summary);
  if (direct) return direct;

  const getter = commentParts(reflection?.getSignature?.comment?.summary);
  if (getter) return getter;

  return commentParts(reflection?.setSignature?.comment?.summary);
}

function blockTag(signature, tagName) {
  const tag = signature?.comment?.blockTags?.find(
    (candidate) => candidate.tag === tagName,
  );
  return tag ? commentParts(tag.content) : false;
}

function normalizeTagText(tag, text) {
  if (tag !== "example") return text;

  const fenced = /^```(?:ts|typescript)?\n([\s\S]*?)\n```$/u.exec(text.trim());
  return fenced ? fenced[1] : text;
}

function tagsOf(signature) {
  return (signature?.comment?.blockTags ?? [])
    .filter((tag) => !["@param", "@returns", "@return"].includes(tag.tag))
    .map((tag) => {
      const name = tag.tag.replace(/^@/u, "");
      return {
        tag: name,
        text: normalizeTagText(name, commentParts(tag.content)),
      };
    });
}

function flagsOf(reflection) {
  const flags = { ...(reflection?.flags?.toObject() ?? {}) };
  delete flags.isExported;
  delete flags.isExternal;
  delete flags.isInherited;
  return flags;
}

function typeChildren(type, reflection) {
  if (type?.type === "reflection") {
    return type.declaration?.children ?? [];
  }
  return reflection?.children ?? [];
}

function legacyType(type, reflection, context = "unknown") {
  if (!type) {
    const children = typeChildren(type, reflection);
    if (children.length > 0) return objectType(children, context);
    return "";
  }

  switch (type.type) {
    case "intrinsic":
    case "inferred":
    case "reference":
    case "unknown":
      return type.name;

    case "literal":
      return String(type.value);

    case "array":
      return `${["intersection", "union"].includes(type.elementType.type) ? `(${legacyType(type.elementType, undefined, context)})` : legacyType(type.elementType, undefined, context)}[]`;

    case "union":
      return type.types
        .map((item) => legacyType(item, undefined, context))
        .join(" | ");

    case "intersection":
      return type.types
        .map((item) => legacyType(item, undefined, context))
        .join(" & ");

    case "tuple":
      return type.elements
        .map((item) => legacyType(item, undefined, context))
        .join(",");

    case "namedTupleMember":
      return legacyType(type.element, undefined, context);

    case "optional":
    case "rest":
      return legacyType(type.elementType, undefined, context);

    case "reflection": {
      const signatures = type.declaration?.signatures ?? [];
      if (signatures.length > 0) {
        const parameters = (signatures[0].parameters ?? [])
          .filter((parameter) => !["this", "Z"].includes(parameter.name))
          .map(
            (parameter) =>
              `${parameter.name}:${legacyType(parameter.type, undefined, context)}`,
          );
        return ` ${parameters.length > 0 ? "Fn" : ""}(${parameters.join(", ")})`;
      }

      const children = typeChildren(type, reflection);
      if (children.length > 0) return objectType(children, context);
      return "";
    }

    case "query":
      return legacyType(type.queryType, undefined, context);

    case "typeOperator":
      return `${type.operator} ${legacyType(type.target, undefined, context)}`;

    case "indexedAccess":
      return `${legacyType(type.objectType, undefined, context)}[${legacyType(
        type.indexType,
        undefined,
        context,
      )}]`;

    case "conditional":
    case "mapped":
    case "predicate":
    case "templateLiteral":
      return type.toString();

    default:
      throw new Error(`Unsupported TypeDoc type '${type.type}' in ${context}`);
  }
}

function objectType(children, context) {
  return `{ ${children
    .map(
      (child) =>
        `${child.name}:\`${legacyType(child.type, child, `${context}.${child.name}`)}\``,
    )
    .join(", ")} }`;
}

function relationName(type) {
  return type?.name ?? (type ? legacyType(type) : "");
}

function parameterOf(parameter, context) {
  return {
    name: parameter.name,
    comment: commentOf(parameter),
    type: legacyType(parameter.type, parameter, `${context}.${parameter.name}`),
    default: parameter.defaultValue ?? false,
  };
}

function signatureOf(signature, context) {
  return {
    comment: commentOf(signature),
    returns: legacyType(signature.type, signature, `${context}.return`),
    returns_comment:
      blockTag(signature, "@returns") || blockTag(signature, "@return"),
    parameters: (signature.parameters ?? []).map((parameter) =>
      parameterOf(parameter, context),
    ),
    tags: tagsOf(signature),
  };
}

function inheritedReferenceName(reference) {
  // TypeDoc now points at each intermediate subclass. The old site displayed
  // the reflection that originally declared the inherited member. The chain
  // can contain reference cycles (eg, re-declared members in a subclass), so
  // track visited reflections to guarantee termination.
  let current = reference;
  const seen = new Set();
  while (current?.reflection?.inheritedFrom && !seen.has(current.reflection)) {
    seen.add(current.reflection);
    current = current.reflection.inheritedFrom;
  }
  return normalizeReferenceName(current);
}

function overrideReferenceName(reflection) {
  const reference = reflection.overwrites;
  if (!reference) return false;
  if (reflection.kind !== ReflectionKind.Constructor) {
    return normalizeReferenceName(reference);
  }

  const target = reference.reflection;
  if (!target || sourcesOf(target).length === 0 || isExternalSource(target)) {
    return false;
  }
  return normalizeReferenceName(reference).replace(
    /\.constructor$/u,
    ".__constructor",
  );
}

function relationFields(reflection) {
  return {
    overrides: overrideReferenceName(reflection),
    inherits: inheritedReferenceName(reflection.inheritedFrom),
  };
}

function methodOf(reflection, context) {
  return {
    name: normalizeName(reflection.name),
    source: sourcesOf(reflection),
    flags: flagsOf(reflection),
    ...relationFields(reflection),
    signatures: (reflection.signatures ?? []).map((signature) =>
      signatureOf(signature, `${context}.${reflection.name}`),
    ),
  };
}

function accessorSignature(signature, context) {
  if (!signature) return false;
  const result = {
    type: legacyType(signature.type, signature, context),
  };
  if (signature.parameters?.length) {
    result.parameters = parameterOf(signature.parameters[0], context);
  }
  return result;
}

function accessorOf(reflection, context) {
  return {
    name: normalizeName(reflection.name),
    source: sourcesOf(reflection),
    flags: flagsOf(reflection),
    ...relationFields(reflection),
    comment: commentOf(reflection),
    getter: accessorSignature(
      reflection.getSignature,
      `${context}.${reflection.name}.get`,
    ),
    setter: accessorSignature(
      reflection.setSignature,
      `${context}.${reflection.name}.set`,
    ),
  };
}

function valueOf(reflection, context, objectLiteral = false) {
  return {
    name: normalizeName(reflection.name),
    source: sourcesOf(reflection),
    flags: flagsOf(reflection),
    type: objectLiteral
      ? reflection.name
      : legacyType(
          reflection.type,
          reflection,
          `${context}.${reflection.name}`,
        ),
    ...relationFields(reflection),
    comment: commentOf(reflection),
  };
}

function declarationKind(reflection) {
  if (
    reflection.kind === ReflectionKind.Variable &&
    reflection.type?.type === "reflection"
  ) {
    return "Objectliteral";
  }

  if (reflection.kind === ReflectionKind.TypeAlias) return "Typealias";
  return ReflectionKind.singularString(reflection.kind).replaceAll(" ", "");
}

function isExternalSource(reflection) {
  const sources = sourcesOf(reflection);
  return (
    sources.length > 0 &&
    sources.every(([file]) => file.startsWith("node_modules/"))
  );
}

function shouldSkipChild(parent, child) {
  if (
    child.kind === ReflectionKind.Constructor &&
    sourcesOf(child).length === 0
  ) {
    return true;
  }

  if (child.flags.isStatic && child.inheritedFrom && isExternalSource(child)) {
    return true;
  }

  if (!child.inheritedFrom || !isExternalSource(child)) return false;
  const owner = child.inheritedFrom.name.split(".")[0];
  const inheritedThroughPtsClass = (parent.extendedTypes ?? []).some(
    (type) =>
      type.name === owner &&
      type.reflection &&
      !isExternalSource(type.reflection),
  );
  if (!inheritedThroughPtsClass) return false;

  // Keep the legacy site's ES5 members without recursively promoting every
  // newer standard-library addition through Pt and Group subclasses.
  return !sourcesOf(child).some(([file]) =>
    file.endsWith("/typescript/lib/lib.es5.d.ts"),
  );
}

function searchKind(reflection) {
  const kind = declarationKind(reflection);
  if (kind === "Objectliteral") return "Object literal";
  if (kind === "Typealias") return "Type alias";
  return kind;
}

function baseDeclaration(reflection) {
  return {
    name: reflection.name,
    source: sourcesOf(reflection),
    kind: declarationKind(reflection),
    comment: commentOf(reflection),
    constructor: [],
    accessors: [],
    methods: [],
    variables: [],
    properties: [],
    flags: flagsOf(reflection),
    extends: (reflection.extendedTypes ?? []).map(relationName),
    implements: (reflection.implementedTypes ?? []).map(relationName),
  };
}

function classDocument(reflection, pageKey, addSearch) {
  const result = baseDeclaration(reflection);

  if (reflection.kind === ReflectionKind.TypeAlias) {
    result.type_alias = legacyType(reflection.type, reflection, pageKey).split(
      " | ",
    );
    return result;
  }

  const objectLiteral = declarationKind(reflection) === "Objectliteral";
  const children = objectLiteral
    ? typeChildren(reflection.type, reflection)
    : (reflection.children ?? []);

  for (const child of children) {
    if (child.name.startsWith("_")) continue;
    if (shouldSkipChild(reflection, child)) continue;

    const normalizedName = normalizeName(child.name);
    switch (child.kind) {
      case ReflectionKind.Method: {
        const method = methodOf(child, pageKey);
        result.methods.push(method);
        addSearch(
          `${pageKey}#${memberAnchor("function", method)}`,
          `${reflection.name}.${normalizedName}`,
          "Function",
        );
        break;
      }

      case ReflectionKind.Accessor: {
        const accessor = accessorOf(child, pageKey);
        result.accessors.push(accessor);
        addSearch(
          `${pageKey}#accessor_${normalizedName}`,
          `${reflection.name}.${normalizedName}`,
          "Accessor",
        );
        break;
      }

      case ReflectionKind.Variable:
      case ReflectionKind.EnumMember: {
        const variable = valueOf(child, pageKey, objectLiteral);
        result.variables.push(variable);
        addSearch(
          `${pageKey}#property_${normalizedName}`,
          `${reflection.name}.${normalizedName}`,
          child.kind === ReflectionKind.EnumMember ? "Enumeration" : "Variable",
        );
        break;
      }

      case ReflectionKind.Property: {
        if (
          normalizedName === "[Symbol.unscopables]" &&
          child.inheritedFrom &&
          isExternalSource(child)
        ) {
          // TypeScript 5 models this as a property; TypeScript 4/TypeDoc 0.17
          // modeled it as a method. Preserve the public URL and visible shape.
          const method = {
            ...methodOf(child, pageKey),
            signatures: [
              {
                comment: commentOf(child),
                returns: legacyArrayUnscopablesType,
                returns_comment: false,
                parameters: [],
                tags: [],
              },
            ],
          };
          result.methods.push(method);
          addSearch(
            `${pageKey}#${memberAnchor("function", method)}`,
            `${reflection.name}.${normalizedName}`,
            "Function",
          );
          break;
        }

        const property = valueOf(child, pageKey, objectLiteral);
        result[objectLiteral ? "variables" : "properties"].push(property);
        addSearch(
          `${pageKey}#property_${normalizedName}`,
          `${reflection.name}.${normalizedName}`,
          "Variable",
        );
        break;
      }

      case ReflectionKind.Constructor: {
        const constructor = methodOf(child, pageKey);
        result.constructor.push(constructor);
        addSearch(
          `${pageKey}#constructor_${normalizedName}`,
          `${reflection.name}.${normalizedName}`,
          "Constructor",
        );
        break;
      }

      default:
        throw new Error(
          `Unsupported ${ReflectionKind.singularString(child.kind)} '${child.name}' in ${pageKey}`,
        );
    }
  }

  return result;
}

function validateOutput(modules, documents, search) {
  assert.ok(
    Object.keys(modules).length > 0,
    "No documentation modules generated",
  );
  assert.ok(documents.size > 0, "No documentation pages generated");

  const navigationKeys = [];
  for (const [moduleName, declarations] of Object.entries(modules)) {
    assert.match(moduleName, /^[A-Za-z0-9$.-]+$/u, "Unsafe module name");
    for (const declaration of declarations) {
      const pageKey = `${moduleName}_${declaration}`;
      assert.match(pageKey, /^[A-Za-z0-9$_.-]+$/u, "Unsafe page key");
      navigationKeys.push(pageKey);
      assert.ok(documents.has(pageKey), `Missing page ${pageKey}`);
    }
  }
  assert.equal(
    new Set(navigationKeys).size,
    navigationKeys.length,
    "Duplicate navigation page key",
  );
  assert.equal(
    navigationKeys.length,
    documents.size,
    "Generated pages are missing from navigation",
  );

  for (const [pageKey, document] of documents) {
    const reflections = [
      document,
      ...document.constructor,
      ...document.accessors,
      ...document.methods,
      ...document.variables,
      ...document.properties,
    ];
    for (const reflection of reflections) {
      for (const source of reflection.source ?? []) {
        assert.ok(
          Array.isArray(source) && source.length === 3,
          `Invalid source tuple in ${pageKey}`,
        );
        const [file, line, character] = source;
        assert.match(
          file,
          /^(?:node_modules|src)\//u,
          `Unexpected source path in ${pageKey}`,
        );
        assert.equal(
          path.isAbsolute(file),
          false,
          `Absolute source in ${pageKey}`,
        );
        assert.equal(
          file.includes(".."),
          false,
          `Escaping source in ${pageKey}`,
        );
        assert.ok(
          Number.isInteger(line) && line > 0,
          `Invalid source line in ${pageKey}`,
        );
        assert.ok(
          Number.isInteger(character) && character >= 0,
          `Invalid source character in ${pageKey}`,
        );
      }
    }
  }

  const searchKeys = new Map();
  for (const [target, , kind, weight] of search) {
    searchKeys.set(target, (searchKeys.get(target) ?? 0) + 1);
    assert.equal(weight, searchWeights.get(kind) ?? 0);

    const [pageKey, anchor] = target.split("#");
    const document = documents.get(pageKey);
    assert.ok(document, `Search target references missing page ${pageKey}`);
    if (!anchor) continue;

    const sections = anchor.startsWith("accessor_")
      ? [["accessors", "accessor"]]
      : anchor.startsWith("constructor_")
        ? [["constructor", "constructor"]]
        : anchor.startsWith("function_")
          ? [["methods", "function"]]
          : anchor.startsWith("property_")
            ? [
                ["variables", "property"],
                ["properties", "property"],
              ]
            : [];
    assert.ok(sections.length > 0, `Unknown search anchor '${anchor}'`);
    assert.ok(
      sections.some(([key, prefix]) =>
        document[key].some((member) => memberAnchor(prefix, member) === anchor),
      ),
      `Search anchor ${target} does not resolve`,
    );
  }

  for (const [target, count] of searchKeys) {
    assert.equal(count, 1, `Duplicate search target ${target}`);
  }
}

function orderedModules(modules) {
  return Object.fromEntries(
    Object.entries(modules).sort(([left], [right]) => {
      if (left === "Types") return right === "Types" ? 0 : 1;
      if (right === "Types") return -1;
      return left === right ? 0 : left < right ? -1 : 1;
    }),
  );
}

async function sourceEntryPoints() {
  return (await readdir(sourceDirectory))
    .filter((file) => file.endsWith(".ts") && !file.startsWith("_"))
    .sort()
    .map((file) => path.join(sourceDirectory, file));
}

async function buildOutput() {
  const app = await Application.bootstrap({
    // The 2022 site used the ES2016-era collection surface. Pinning this input
    // avoids unrelated docs churn when the library build target changes. The
    // BigInt library only types the exact-arithmetic fallback of the
    // triangulation, which is internal and not documented.
    compilerOptions: {
      lib: ["es2016", "es2020.bigint", "dom", "dom.iterable"],
    },
    entryPoints: await sourceEntryPoints(),
    entryPointStrategy: EntryPointStrategy.Resolve,
    logLevel: "Warn",
    readme: "none",
  });
  const project = await app.convert();
  if (!project || app.logger.errorCount > 0) {
    throw new Error("TypeDoc failed to build the documentation model");
  }
  assert.equal(
    app.logger.warningCount,
    0,
    "TypeDoc warnings must be fixed before publishing documentation",
  );

  const modules = {};
  const documents = new Map();
  const search = [];
  const addSearch = (target, name, kind) => {
    search.push([target, name, kind, searchWeights.get(kind) ?? 0]);
  };

  for (const module of project.children ?? []) {
    if (module.name.startsWith("_")) continue;
    const declarations = [];

    for (const reflection of module.children ?? []) {
      if (
        reflection.name.startsWith("_") ||
        reflection.kind === ReflectionKind.Reference
      ) {
        continue;
      }

      const pageKey = `${module.name}_${reflection.name}`;
      assert.ok(!documents.has(pageKey), `Duplicate page ${pageKey}`);
      documents.set(pageKey, classDocument(reflection, pageKey, addSearch));
      declarations.push(reflection.name);
      addSearch(pageKey, reflection.name, searchKind(reflection));
    }

    if (declarations.length > 0) modules[module.name] = declarations;
  }

  const sortedModules = orderedModules(modules);
  validateOutput(sortedModules, documents, search);
  return {
    modules: sortedModules,
    documents,
    search,
    warningCount: app.logger.warningCount,
  };
}

function json(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function outputFiles(output) {
  return new Map([
    ["modules.json", json(output.modules)],
    ["search.json", json(output.search)],
    ...[...output.documents]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([pageKey, document]) => [`class/${pageKey}.json`, json(document)]),
  ]);
}

async function writeFiles(directory, files) {
  await mkdir(path.join(directory, "class"), { recursive: true });
  for (const [file, contents] of files) {
    await writeFile(path.join(directory, file), contents);
  }
}

async function replaceOutput(jsonDirectory, files) {
  const docsDirectory = path.dirname(jsonDirectory);
  await mkdir(docsDirectory, { recursive: true });
  const stage = await mkdtemp(path.join(docsDirectory, ".docs-json-stage-"));
  const backup = path.join(
    docsDirectory,
    `.docs-json-backup-${path.basename(stage)}`,
  );
  let backupExists = false;
  let stageExists = true;

  try {
    await writeFiles(stage, files);

    try {
      await rename(jsonDirectory, backup);
      backupExists = true;
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }

    try {
      await rename(stage, jsonDirectory);
      stageExists = false;
    } catch (error) {
      if (backupExists) {
        await rename(backup, jsonDirectory);
        backupExists = false;
      }
      throw error;
    }

    if (backupExists) {
      await rm(backup, { recursive: true });
      backupExists = false;
    }
  } finally {
    if (stageExists) await rm(stage, { recursive: true, force: true });
    if (backupExists) await rm(backup, { recursive: true, force: true });
  }
}

async function currentFiles(directory, prefix = "") {
  const result = new Map();
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries.sort((left, right) =>
      left.name.localeCompare(right.name),
    )) {
      const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        for (const [file, contents] of await currentFiles(absolute, relative)) {
          result.set(file, contents);
        }
      } else if (entry.isFile()) {
        result.set(relative, await readFile(absolute, "utf8"));
      }
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  return result;
}

function changedFiles(expected, actual) {
  const names = new Set([...expected.keys(), ...actual.keys()]);
  return [...names]
    .filter((name) => expected.get(name) !== actual.get(name))
    .sort();
}

export async function generateDocumentation({
  check = false,
  jsonDirectory = defaultJsonDirectory,
} = {}) {
  const output = await buildOutput();
  const expected = outputFiles(output);

  if (check) {
    const changed = changedFiles(expected, await currentFiles(jsonDirectory));
    assert.equal(
      changed.length,
      0,
      `Documentation is stale; run 'pnpm run docs'. Changed files:\n${changed
        .map((file) => `- docs/json/${file}`)
        .join("\n")}`,
    );
  } else {
    await replaceOutput(jsonDirectory, expected);
  }

  return {
    moduleCount: Object.keys(output.modules).length,
    pageCount: output.documents.size,
    searchCount: output.search.length,
    warningCount: output.warningCount,
  };
}

async function main() {
  const unknown = process.argv.slice(2).filter((arg) => arg !== "--check");
  assert.deepEqual(unknown, [], `Unknown arguments: ${unknown.join(" ")}`);
  const result = await generateDocumentation({
    check: process.argv.includes("--check"),
  });
  console.log(
    `${process.argv.includes("--check") ? "Validated" : "Generated"} ${result.pageCount} documentation pages in ${result.moduleCount} modules with ${result.searchCount} search entries (${result.warningCount} TypeDoc warnings).`,
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  await main();
}
