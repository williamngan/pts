import assert from "node:assert/strict";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const docsJsonDirectory = path.join(projectRoot, "docs", "json");
const guideMarkdownDirectory = path.join(projectRoot, "guide", "md");
const demoDirectory = path.join(projectRoot, "demo");
const studyDirectory = path.join(projectRoot, "study");
const siteOrigin = "https://ptsjs.org";
const sourceOrigin = "https://github.com/williamngan/pts/blob/master";

function normalizeLineEndings(value) {
  return value.replaceAll("\r\n", "\n");
}

function slug(value) {
  return value
    .replaceAll("$", "dollar-")
    .replaceAll("[Symbol.", "symbol-")
    .replaceAll("]", "")
    .replace(/([a-z0-9])([A-Z])/gu, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-|-$/gu, "");
}

function declarationAnchor(moduleName, declarationName) {
  const compact = (value) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/gu, "-")
      .replace(/^-|-$/gu, "");
  return `${compact(moduleName)}-${compact(declarationName)}`;
}

function memberAnchor(
  moduleName,
  declarationName,
  memberName,
  isStatic = false,
) {
  return `${declarationAnchor(moduleName, declarationName)}-${isStatic ? "static-" : ""}${slug(memberName)}`;
}

function inlineCode(value) {
  const text = String(value).replaceAll("`", "");
  return `\`${text}\``;
}

function typeText(value) {
  return String(value).replaceAll("`", "");
}

function fencedCode(value, language = "") {
  const text = normalizeLineEndings(String(value))
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .replace(/\n+$/u, "");
  const longest = Math.max(
    2,
    ...[...text.matchAll(/`+/gu)].map((match) => match[0].length),
  );
  const fence = "`".repeat(longest + 1);
  return `${fence}${language}\n${text}\n${fence}`;
}

function sourceReferences(sources) {
  if (!sources?.length) return "";
  return sources
    .map(([file, line]) => {
      const label = `${file}:${line}`;
      if (file.startsWith("src/")) {
        return `[${inlineCode(label)}](${sourceOrigin}/${file}#L${line})`;
      }
      return inlineCode(label);
    })
    .join(", ");
}

function relationDetails(reflection) {
  const details = [];
  const flags = Object.entries(reflection.flags ?? {})
    .filter(([, enabled]) => enabled)
    .map(([name]) => name.replace(/^is/u, "").toLowerCase());
  if (flags.length) details.push(flags.join(", "));
  if (reflection.inherits) {
    details.push(`inherited from ${inlineCode(reflection.inherits)}`);
  }
  if (reflection.overrides) {
    details.push(`overrides ${inlineCode(reflection.overrides)}`);
  }
  return details.length ? `*${details.join(" · ")}*` : "";
}

function methodSignature(owner, method, signature, constructor = false) {
  const prefix = method.flags?.isStatic ? "static " : "";
  const optional = method.flags?.isOptional ? "?" : "";
  const parameters = (signature.parameters ?? [])
    .map((parameter) => {
      const defaultValue = parameter.default ? ` = ${parameter.default}` : "";
      return `${parameter.name}: ${typeText(parameter.type)}${defaultValue}`;
    })
    .join(", ");
  if (constructor) {
    return `new ${owner}(${parameters}): ${typeText(signature.returns)}`;
  }
  return `${prefix}${method.name}${optional}(${parameters}): ${typeText(signature.returns)}`;
}

function renderParameters(parameters, declarationsByName, currentTarget) {
  if (!parameters?.length) return "";
  const lines = ["**Parameters**", ""];
  for (const parameter of parameters) {
    const defaultValue = parameter.default
      ? `; default ${inlineCode(parameter.default)}`
      : "";
    const description = parameter.comment
      ? ` — ${rewriteApiComment(
          parameter.comment.replaceAll("\n", " "),
          declarationsByName,
          currentTarget,
        )}`
      : "";
    lines.push(
      `- ${inlineCode(parameter.name)} (${inlineCode(parameter.type)}${defaultValue})${description}`,
    );
  }
  return lines.join("\n");
}

function renderTags(tags, declarationsByName, currentTarget) {
  const sections = [];
  for (const tag of tags ?? []) {
    if (["example", "exmaple"].includes(tag.tag)) {
      const example = tag.text.trim().replace(/^`|`$/gu, "");
      sections.push(`**Example**\n\n${fencedCode(example, "ts")}`);
    } else {
      const label = tag.tag === "see" ? "See also" : tag.tag;
      sections.push(
        `**${label}:** ${rewriteApiComment(tag.text, declarationsByName, currentTarget)}`,
      );
    }
  }
  return sections.join("\n\n");
}

function declarationMembers(declaration) {
  return [
    ...(declaration.constructor ?? []),
    ...(declaration.accessors ?? []),
    ...(declaration.methods ?? []),
    ...(declaration.variables ?? []),
    ...(declaration.properties ?? []),
  ];
}

function resolveApiReference(
  reference,
  declarationsByName,
  currentTarget,
  visited = new Set(),
) {
  if (visited.has(reference)) return "";
  visited.add(reference);
  const separator = reference.indexOf(".");
  let target =
    separator >= 0
      ? declarationsByName.get(reference.slice(0, separator))
      : declarationsByName.get(reference);
  let rawMember = separator >= 0 ? reference.slice(separator + 1) : "";

  if (!target && currentTarget && separator < 0) {
    target = currentTarget;
    rawMember = reference;
  }
  if (!target) return "";
  if (!rawMember) {
    return declarationAnchor(target.moduleName, target.document.name);
  }

  const memberName = rawMember.replace(/\(\)$/u, "");
  let member = declarationMembers(target.document).find(
    (candidate) => candidate.name === memberName,
  );
  if (!member) {
    const candidates = [...declarationsByName.values()]
      .flatMap((candidateTarget) =>
        declarationMembers(candidateTarget.document).map((candidate) => ({
          member: candidate,
          target: candidateTarget,
        })),
      )
      .filter((candidate) => candidate.member.name === memberName)
      .sort(
        (left, right) =>
          Number(Boolean(left.member.inherits)) -
          Number(Boolean(right.member.inherits)),
      );
    if (candidates.length) {
      ({ member, target } = candidates[0]);
    }
  }
  if (!member)
    return declarationAnchor(target.moduleName, target.document.name);
  if (member.inherits) {
    const inheritedAnchor = resolveApiReference(
      member.inherits,
      declarationsByName,
      undefined,
      visited,
    );
    if (inheritedAnchor) return inheritedAnchor;
  }
  return memberAnchor(
    target.moduleName,
    target.document.name,
    member.name,
    Boolean(member.flags?.isStatic),
  );
}

function rewriteApiComment(comment, declarationsByName, currentTarget) {
  if (!comment) return "";
  return comment
    .replace(/\[([^\]]+)\]\(#link\)/gu, (match, label) => {
      const reference = label.replaceAll("`", "");
      const anchor = resolveApiReference(
        reference,
        declarationsByName,
        currentTarget,
      );
      if (!anchor) return label;
      return `[${label}](#${anchor})`;
    })
    .replaceAll("(../guide/", `(${siteOrigin}/guide/`)
    .replaceAll("(../demo/", `(${siteOrigin}/demo/`)
    .replaceAll("(../study/", `(${siteOrigin}/study/`);
}

function inheritedOwner(relation) {
  const symbolIndex = relation.indexOf(".[Symbol.");
  if (symbolIndex >= 0) return relation.slice(0, symbolIndex);
  const separator = relation.lastIndexOf(".");
  return separator >= 0 ? relation.slice(0, separator) : relation;
}

function renderInheritedApi(inherited, declarationsByName) {
  if (!inherited.length) return "";
  const groups = new Map();
  for (const member of inherited) {
    const owner = inheritedOwner(member.inherits);
    if (!groups.has(owner)) groups.set(owner, []);
    groups.get(owner).push(member);
  }

  const standardTypes = new Map([
    [
      "Array",
      "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array",
    ],
    [
      "Float32Array",
      "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float32Array",
    ],
  ]);
  const lines = ["#### Inherited API", ""];
  for (const [owner, members] of groups) {
    const standardUrl = standardTypes.get(owner);
    if (standardUrl) {
      lines.push(
        `- From [${inlineCode(owner)}](${standardUrl}): ${members.length} standard properties and methods (not repeated here).`,
      );
      continue;
    }

    const target = declarationsByName.get(owner);
    const ownerLabel = target
      ? `[${inlineCode(owner)}](#${declarationAnchor(target.moduleName, target.document.name)})`
      : inlineCode(owner);
    const memberLinks = members.map((member) => {
      const anchor = resolveApiReference(
        `${owner}.${member.name}`,
        declarationsByName,
        target,
      );
      return anchor
        ? `[${inlineCode(member.name)}](#${anchor})`
        : inlineCode(member.name);
    });
    lines.push(`- From ${ownerLabel}: ${memberLinks.join(", ")}.`);
  }
  return lines.join("\n");
}

function renderMethod(
  moduleName,
  declaration,
  method,
  declarationsByName,
  constructor = false,
) {
  const anchor = memberAnchor(
    moduleName,
    declaration.name,
    constructor ? "constructor" : method.name,
    !constructor && Boolean(method.flags?.isStatic),
  );
  const currentTarget = { moduleName, document: declaration };
  const lines = [
    `<a id="${anchor}"></a>`,
    `##### ${constructor ? "Constructor" : inlineCode(method.name)}`,
  ];
  const details = relationDetails(method);
  if (details) lines.push("", details);

  for (const [index, signature] of (method.signatures ?? []).entries()) {
    if ((method.signatures?.length ?? 0) > 1) {
      lines.push("", `**Overload ${index + 1}**`);
    }
    lines.push(
      "",
      fencedCode(
        methodSignature(declaration.name, method, signature, constructor),
        "ts",
      ),
    );
    if (signature.comment) {
      lines.push(
        "",
        rewriteApiComment(signature.comment, declarationsByName, currentTarget),
      );
    }
    const parameters = renderParameters(
      signature.parameters,
      declarationsByName,
      currentTarget,
    );
    if (parameters) lines.push("", parameters);
    if (signature.returns_comment) {
      lines.push(
        "",
        `**Returns:** ${rewriteApiComment(signature.returns_comment, declarationsByName, currentTarget)}`,
      );
    }
    const tags = renderTags(signature.tags, declarationsByName, currentTarget);
    if (tags) lines.push("", tags);
  }
  return lines.join("\n");
}

function renderAccessor(moduleName, declaration, accessor, declarationsByName) {
  const lines = [
    `<a id="${memberAnchor(moduleName, declaration.name, accessor.name, Boolean(accessor.flags?.isStatic))}"></a>`,
    `##### ${inlineCode(accessor.name)}`,
  ];
  const details = relationDetails(accessor);
  if (details) lines.push("", details);
  const signatures = [];
  if (accessor.getter) {
    signatures.push(
      `get ${accessor.name}(): ${typeText(accessor.getter.type)}`,
    );
  }
  if (accessor.setter) {
    const parameter = accessor.setter.parameters;
    signatures.push(
      `set ${accessor.name}(${parameter.name}: ${typeText(parameter.type)}): ${typeText(accessor.setter.type)}`,
    );
  }
  if (signatures.length)
    lines.push("", fencedCode(signatures.join("\n"), "ts"));
  if (accessor.comment) {
    lines.push(
      "",
      rewriteApiComment(accessor.comment, declarationsByName, {
        moduleName,
        document: declaration,
      }),
    );
  }
  return lines.join("\n");
}

function renderValue(moduleName, declaration, value, declarationsByName) {
  const lines = [
    `<a id="${memberAnchor(moduleName, declaration.name, value.name, Boolean(value.flags?.isStatic))}"></a>`,
    `##### ${inlineCode(value.name)}`,
  ];
  const details = relationDetails(value);
  if (details) lines.push("", details);
  const prefix = [
    value.flags?.isStatic ? "static" : "",
    value.flags?.isReadonly ? "readonly" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const optional = value.flags?.isOptional ? "?" : "";
  lines.push(
    "",
    fencedCode(
      `${prefix ? `${prefix} ` : ""}${value.name}${optional}: ${typeText(value.type)}`,
      "ts",
    ),
  );
  if (value.comment) {
    lines.push(
      "",
      rewriteApiComment(value.comment, declarationsByName, {
        moduleName,
        document: declaration,
      }),
    );
  }
  return lines.join("\n");
}

function renderDeclaration(moduleName, declaration, declarationsByName) {
  const anchor = declarationAnchor(moduleName, declaration.name);
  const lines = [
    `<a id="${anchor}"></a>`,
    `### ${inlineCode(declaration.name)}`,
    "",
    `**Kind:** ${declaration.kind}${declaration.source?.length ? ` · **Source:** ${sourceReferences(declaration.source)}` : ""}`,
  ];

  if (declaration.extends?.length) {
    lines.push(
      "",
      `**Extends:** ${declaration.extends.map(inlineCode).join(", ")}`,
    );
  }
  if (declaration.implements?.length) {
    lines.push(
      "",
      `**Implements:** ${declaration.implements.map(inlineCode).join(", ")}`,
    );
  }
  if (declaration.comment) {
    lines.push(
      "",
      rewriteApiComment(declaration.comment, declarationsByName, {
        moduleName,
        document: declaration,
      }),
    );
  }
  if (declaration.type_alias) {
    const type = declaration.type_alias.join(" | ").replaceAll("`", "");
    lines.push("", fencedCode(`type ${declaration.name} = ${type};`, "ts"));
  }

  const sections = [
    ["Constructors", declaration.constructor, "method", true],
    ["Accessors", declaration.accessors, "accessor", false],
    ["Methods", declaration.methods, "method", false],
    ["Values", declaration.variables, "value", false],
    ["Properties", declaration.properties, "value", false],
  ];
  const inherited = [];
  for (const [title, members, kind, constructor] of sections) {
    const declared = (members ?? []).filter((member) => {
      if (member.inherits) {
        inherited.push(member);
        return false;
      }
      return true;
    });
    if (!declared.length) continue;
    lines.push("", `#### ${title}`);
    for (const member of declared) {
      const rendered =
        kind === "method"
          ? renderMethod(
              moduleName,
              declaration,
              member,
              declarationsByName,
              constructor,
            )
          : kind === "accessor"
            ? renderAccessor(
                moduleName,
                declaration,
                member,
                declarationsByName,
              )
            : renderValue(moduleName, declaration, member, declarationsByName);
      lines.push("", rendered);
    }
  }
  const inheritedApi = renderInheritedApi(inherited, declarationsByName);
  if (inheritedApi) lines.push("", inheritedApi);
  return lines
    .join("\n")
    .replace(/\]\(#+(?:f?unction_)([^)]+)\)/gu, (match, name) => {
      const member = declarationMembers(declaration).find(
        (candidate) => candidate.name === name,
      );
      return member
        ? `](#${memberAnchor(moduleName, declaration.name, member.name, Boolean(member.flags?.isStatic))})`
        : match;
    });
}

async function apiMarkdown(version) {
  const modules = JSON.parse(
    await readFile(path.join(docsJsonDirectory, "modules.json"), "utf8"),
  );
  const documents = new Map();
  const declarationsByName = new Map();
  for (const [moduleName, declarationNames] of Object.entries(modules)) {
    for (const declarationName of declarationNames) {
      const document = JSON.parse(
        await readFile(
          path.join(
            docsJsonDirectory,
            "class",
            `${moduleName}_${declarationName}.json`,
          ),
          "utf8",
        ),
      );
      documents.set(`${moduleName}_${declarationName}`, document);
      if (!declarationsByName.has(declarationName)) {
        declarationsByName.set(declarationName, { moduleName, document });
      }
    }
  }

  const lines = [
    "<!-- Generated by scripts/generate-markdown-docs.mjs. Do not edit directly. -->",
    "# Pts API Reference",
    "",
    `Complete API reference for [Pts ${version}](${siteOrigin}), generated from the same TypeDoc data used by the documentation website. Members are documented in full where they are declared and linked from subclasses that inherit them. For tutorials and runnable examples, see the [Pts guides and demos](${siteOrigin}/guide.md).`,
    "",
    "## Contents",
  ];
  for (const [moduleName, declarationNames] of Object.entries(modules)) {
    lines.push(
      "",
      `- [${inlineCode(moduleName)}](#module-${slug(moduleName)})`,
    );
    for (const declarationName of declarationNames) {
      lines.push(
        `  - [${inlineCode(declarationName)}](#${declarationAnchor(moduleName, declarationName)})`,
      );
    }
  }

  for (const [moduleName, declarationNames] of Object.entries(modules)) {
    lines.push(
      "",
      `<a id="module-${slug(moduleName)}"></a>`,
      `## Module: ${inlineCode(moduleName)}`,
    );
    for (const declarationName of declarationNames) {
      lines.push(
        "",
        renderDeclaration(
          moduleName,
          documents.get(`${moduleName}_${declarationName}`),
          declarationsByName,
        ),
      );
    }
  }

  const output = `${lines.join("\n")}\n`;
  assert.doesNotMatch(output, /\]\(#link\)/u, "Unresolved API link");
  return output;
}

function adjustHeadingLevels(markdown, levels = 1) {
  let fence = "";
  return normalizeLineEndings(markdown)
    .split("\n")
    .map((line) => {
      const fenceMatch = /^\s*(`{3,}|~{3,})/u.exec(line);
      if (fenceMatch) {
        if (!fence) fence = fenceMatch[1][0];
        else if (fence === fenceMatch[1][0]) fence = "";
        return line.trimEnd();
      }
      if (fence) return line.trimEnd();
      return line
        .replace(/^(#{1,5})(\s+)/u, (match, hashes, spacing) => {
          const level =
            typeof levels === "function"
              ? levels(hashes.length)
              : Math.min(6, hashes.length + levels);
          return `${"#".repeat(level)}${spacing}`;
        })
        .trimEnd();
    })
    .join("\n")
    .trim();
}

function rewriteGuide(markdown, apiAnchors, demoNames) {
  return adjustHeadingLevels(markdown, (level) => {
    const guideLevels = { 1: 3, 2: 4, 3: 4, 4: 5, 5: 5 };
    return guideLevels[level];
  })
    .replace(/!\[js:([^\]]+)\]\([^)]*\)/gu, (match, exampleName) => {
      const demoName = `guide.${exampleName}`;
      assert.ok(demoNames.has(demoName), `Missing guide demo ${demoName}`);
      return `> Interactive example: [${inlineCode(demoName)}](#demo-${slug(demoName)}) · [open live](${siteOrigin}/demo/?name=${demoName})`;
    })
    .replace(/\]\(#([^)]+)\)/gu, (match, anchor) => {
      if (apiAnchors.has(anchor)) {
        return `](${siteOrigin}/docs.md#${anchor})`;
      }
      return anchor === "play-quickstart" ? "](#demo-pts-quick-start)" : match;
    })
    .replaceAll("(./assets/", `(${siteOrigin}/guide/assets/`)
    .replaceAll("(./js/examples/", `(${siteOrigin}/guide/js/examples/`)
    .replaceAll("(../docs/", `(${siteOrigin}/docs/`)
    .replaceAll("(../demo/", `(${siteOrigin}/demo/`)
    .replaceAll("(../study/", `(${siteOrigin}/study/`);
}

function descriptionOf(source, fallback) {
  const match = /window\.demoDescription\s*=\s*("(?:\\.|[^"\\])*")\s*;/u.exec(
    source,
  );
  if (!match) return fallback;
  return JSON.parse(match[1]).trim();
}

async function javascriptFiles(directory) {
  return (await readdir(directory))
    .filter((file) => file.endsWith(".js"))
    .sort((left, right) =>
      left.localeCompare(right, "en", { sensitivity: "base" }),
    );
}

async function renderSketch(directoryName, file, anchorPrefix) {
  const absolute = path.join(projectRoot, directoryName, file);
  const source = normalizeLineEndings(await readFile(absolute, "utf8"));
  const name = file.replace(/\.js$/u, "");
  const liveUrl = `${siteOrigin}/${directoryName}/?name=${encodeURIComponent(name)}`;
  const fallback =
    directoryName === "study"
      ? `Study of ${inlineCode(name)}.`
      : `Interactive Pts demo ${inlineCode(name)}.`;
  return [
    `<a id="${anchorPrefix}-${slug(name)}"></a>`,
    `### ${inlineCode(name)}`,
    "",
    descriptionOf(source, fallback),
    "",
    `[Open live](${liveUrl}) · [Source code](${siteOrigin}/${directoryName}/${file}) · [GitHub](${sourceOrigin}/${directoryName}/${file})`,
  ].join("\n");
}

async function guideMarkdown(version) {
  const packageModules = JSON.parse(
    await readFile(path.join(docsJsonDirectory, "modules.json"), "utf8"),
  );
  const apiAnchors = new Set(
    Object.entries(packageModules).flatMap(([moduleName, declarations]) =>
      declarations.map((name) => declarationAnchor(moduleName, name)),
    ),
  );
  const guideFiles = (await readdir(guideMarkdownDirectory))
    .filter((file) => file.endsWith(".md"))
    .sort();
  const demoFiles = await javascriptFiles(demoDirectory);
  const studyFiles = await javascriptFiles(studyDirectory);
  const demoNames = new Set(
    demoFiles.map((file) => file.replace(/\.js$/u, "")),
  );
  const guides = [];
  for (const file of guideFiles) {
    const raw = await readFile(path.join(guideMarkdownDirectory, file), "utf8");
    const title = /^#\s+(.+)$/mu.exec(raw)?.[1];
    assert.ok(title, `Guide ${file} has no title`);
    guides.push({ file, raw, title, anchor: `guide-${slug(title)}` });
  }

  const regularDemos = demoFiles.filter((file) => !file.startsWith("guide."));
  const guideDemos = demoFiles.filter((file) => file.startsWith("guide."));
  const lines = [
    "<!-- Generated by scripts/generate-markdown-docs.mjs. Do not edit directly. -->",
    "# Pts Guides and Demos",
    "",
    `Tutorials and a complete example catalog for [Pts ${version}](${siteOrigin}). For class and method details, see the [complete API reference](${siteOrigin}/docs.md).`,
    "",
    "Demo and study source files are linked directly from `ptsjs.org` instead of embedded, so agents can fetch only the examples they need.",
    "",
    "## Contents",
    "",
    "### Guides",
    "",
    ...guides.map((guide) => `- [${guide.title}](#${guide.anchor})`),
    "",
    "### Demos",
    "",
    ...regularDemos.map((file) => {
      const name = file.replace(/\.js$/u, "");
      return `- [${inlineCode(name)}](#demo-${slug(name)})`;
    }),
    "",
    "### Guide examples",
    "",
    ...guideDemos.map((file) => {
      const name = file.replace(/\.js$/u, "");
      return `- [${inlineCode(name)}](#demo-${slug(name)})`;
    }),
    "",
    "### Studies",
    "",
    ...studyFiles.map((file) => {
      const name = file.replace(/\.js$/u, "");
      return `- [${inlineCode(name)}](#study-${slug(name)})`;
    }),
    "",
    "## Guides",
  ];

  for (const guide of guides) {
    lines.push(
      "",
      `<a id="${guide.anchor}"></a>`,
      rewriteGuide(guide.raw, apiAnchors, demoNames),
      "",
      `[Guide source](${sourceOrigin}/guide/md/${guide.file})`,
    );
  }

  lines.push("", "## Demos");
  for (const file of regularDemos) {
    lines.push("", await renderSketch("demo", file, "demo"));
  }
  lines.push("", "## Guide Examples");
  for (const file of guideDemos) {
    lines.push("", await renderSketch("demo", file, "demo"));
  }
  lines.push("", "## Studies");
  for (const file of studyFiles) {
    lines.push("", await renderSketch("study", file, "study"));
  }
  return `${lines.join("\n")}\n`;
}

function llmsText() {
  return `# Pts\n\n> Pts is a TypeScript and JavaScript library for visualization and creative coding.\n\n- [Complete API reference](${siteOrigin}/docs.md): Classes, interfaces, types, methods, properties, signatures, parameters, and examples.\n- [Guides and demos](${siteOrigin}/guide.md): All guides plus a catalog of interactive demos and studies with direct source links.\n`;
}

function markdownProse(markdown) {
  let fence = "";
  return markdown
    .split("\n")
    .map((line) => {
      const fenceMatch = /^\s*(`{3,}|~{3,})/u.exec(line);
      if (fenceMatch) {
        if (!fence) fence = fenceMatch[1][0];
        else if (fence === fenceMatch[1][0]) fence = "";
        return "";
      }
      return fence ? "" : line;
    })
    .join("\n");
}

function validateMarkdown(file, markdown) {
  const prose = markdownProse(markdown);
  const ids = [...prose.matchAll(/<a id="([^"]+)"><\/a>/gu)].map(
    (match) => match[1],
  );
  assert.equal(
    new Set(ids).size,
    ids.length,
    `${file} contains duplicate explicit anchors`,
  );
  for (const match of prose.matchAll(/\]\(#([^)]+)\)/gu)) {
    assert.ok(
      ids.includes(match[1]),
      `${file} has missing anchor #${match[1]}`,
    );
  }
  assert.doesNotMatch(prose, /\]\(#link\)/u, `${file} has an unresolved link`);
  assert.equal(
    markdown.includes(projectRoot),
    false,
    `${file} exposes a local filesystem path`,
  );
  if (file === "guide.md") {
    assert.doesNotMatch(
      prose,
      /!\[js:/u,
      "guide.md has an unresolved interactive placeholder",
    );
  }
}

async function expectedOutputs() {
  const packageJson = JSON.parse(
    await readFile(path.join(projectRoot, "package.json"), "utf8"),
  );
  const outputs = new Map([
    ["docs.md", await apiMarkdown(packageJson.version)],
    ["guide.md", await guideMarkdown(packageJson.version)],
    ["llms.txt", llmsText()],
  ]);
  for (const [file, markdown] of outputs) validateMarkdown(file, markdown);
  return outputs;
}

async function generateMarkdownDocumentation({ check = false } = {}) {
  const outputs = await expectedOutputs();
  const changed = [];
  for (const [file, expected] of outputs) {
    const absolute = path.join(projectRoot, file);
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
    `Markdown documentation is stale; run 'pnpm run docs'. Changed files:\n${changed.map((file) => `- ${file}`).join("\n")}`,
  );
  return outputs;
}

async function main() {
  const unknown = process.argv.slice(2).filter((arg) => arg !== "--check");
  assert.deepEqual(unknown, [], `Unknown arguments: ${unknown.join(" ")}`);
  const check = process.argv.includes("--check");
  const outputs = await generateMarkdownDocumentation({ check });
  const sizes = [...outputs]
    .map(([file, contents]) => `${file} (${Buffer.byteLength(contents)} bytes)`)
    .join(", ");
  console.log(`${check ? "Validated" : "Generated"} ${sizes}.`);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  await main();
}

export { generateMarkdownDocumentation };
