/**
 * Minimal Monaco bundle for the Pts editor.
 *
 * Built by `scripts/build-editor.mjs` into `demo/edit/vs/`. The output is
 * committed because the site is served statically straight from the repo.
 *
 * Assembled from parts rather than importing the stock `editor.main` entry,
 * which pulls ~80 language definitions plus the TypeScript, CSS, HTML and JSON
 * language services and their web workers — 15MB in total, of which the
 * TypeScript worker alone is 6.9MB. None of it is used to edit a Pts sketch.
 * The previously vendored copy carried the same dead weight: 4.2MB of its 6.6MB
 * was `language/`.
 *
 * What is included: the editor API, the JavaScript tokenizer, and the editor
 * contributions a small code editor actually uses. Importing every contribution
 * instead costs about another 1.4MB for features like rename, code actions,
 * codelens and sticky scroll, none of which apply here.
 *
 * Completions for the Pts API come from `js/pts-api.js`, generated from the
 * same docs the website publishes — see `registerPtsCompletions` in edit.js.
 */
import * as monaco from "monaco-editor/editor/editor.api";

import "monaco-editor/editor/contrib/bracketMatching/browser/bracketMatching";
import "monaco-editor/editor/contrib/clipboard/browser/clipboard";
import "monaco-editor/editor/contrib/comment/browser/comment";
import "monaco-editor/editor/contrib/contextmenu/browser/contextmenu";
import "monaco-editor/editor/contrib/cursorUndo/browser/cursorUndo";
import "monaco-editor/editor/contrib/folding/browser/folding";
import "monaco-editor/editor/contrib/hover/browser/hoverContribution";
import "monaco-editor/editor/contrib/indentation/browser/indentation";
import "monaco-editor/editor/contrib/lineSelection/browser/lineSelection";
import "monaco-editor/editor/contrib/linesOperations/browser/linesOperations";
import "monaco-editor/editor/contrib/links/browser/links";
import "monaco-editor/editor/contrib/longLinesHelper/browser/longLinesHelper";
import "monaco-editor/editor/contrib/multicursor/browser/multicursor";
import "monaco-editor/editor/contrib/parameterHints/browser/parameterHints";
import "monaco-editor/editor/contrib/placeholderText/browser/placeholderText.contribution";
import "monaco-editor/editor/contrib/smartSelect/browser/smartSelect";
import "monaco-editor/editor/contrib/suggest/browser/suggestInlineCompletions";
import "monaco-editor/editor/contrib/tokenization/browser/tokenization";
import "monaco-editor/editor/contrib/unusualLineTerminators/browser/unusualLineTerminators";
import "monaco-editor/editor/contrib/wordHighlighter/browser/wordHighlighter";
import "monaco-editor/editor/contrib/wordOperations/browser/wordOperations";
import "monaco-editor/editor/contrib/find/browser/findController";
import "monaco-editor/editor/contrib/suggest/browser/suggestController";

// The only language this editor edits.
import "monaco-editor/languages/definitions/javascript/register";

import EditorWorker from "monaco-editor/editor/editor.worker?worker&inline";

self.MonacoEnvironment = {
  getWorker() {
    return new EditorWorker();
  },
};

window.monaco = monaco;
// The editor script is a classic script and cannot await this module, so
// announce readiness both ways: a flag for "already loaded" and an event for
// "still loading".
window.__monacoReady = true;
window.dispatchEvent(new Event("monaco-ready"));
