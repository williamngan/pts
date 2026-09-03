/**
 * Pts live editor.
 *
 * Two things here are load-bearing and easy to undo by accident:
 *
 *  1. Every Run builds a brand new sketch document (see `runCode`). Reusing one
 *     document and undoing the previous sketch by hand is not possible — see the
 *     comment on `FRAME_SRCDOC`.
 *  2. The sketch shell is embedded here via `srcdoc`, not fetched from a
 *     `frame.html` next to this file. See `FRAME_SRCDOC` for why.
 */

(function () {
  "use strict";

  var RUN_TIMEOUT = 8000;
  var ASSET_TIMEOUT = 10000;

  var editor = null;
  var runID = 0;
  var frame = document.getElementById("demo");
  var loader = document.getElementById("loader");
  var errorBar = document.getElementById("error");
  var loadButton = document.getElementById("load");
  var loadMenu = document.getElementById("loadmenu");

  /**
   * The sketch host document. Every Run creates a *new* iframe with this
   * `srcdoc` and injects the sketch once it has loaded, then swaps the new
   * frame in for the old one.
   *
   * A fresh document per Run is deliberate. Injecting each new version into one
   * long-lived document and undoing the previous sketch by hand cannot work:
   * stopping the old sketch through `window.space` misses any sketch holding
   * its space in a local variable (leaking its render loop on every Run), and
   * removing a <script> element does not release its top-level `let`/`const`
   * bindings, so the second Run of such a sketch throws "already been
   * declared". A fresh document has neither problem and needs no teardown.
   *
   * The shell is embedded rather than fetched from a `frame.html` because a
   * fetched shell is the one editor asset whose cache freshness can drift from
   * the editor itself. Clean-URL static servers (`serve`, Vercel, Netlify)
   * 301-redirect `frame.html?v=...` to an extensionless `frame`, stripping the
   * cache-busting version and funnelling every deployment's frame requests
   * onto a single unversioned, cacheable URL — so a stale shell could pair
   * with a newer editor, which is exactly the mixed-deployment blanking the
   * versioning exists to prevent. Embedded, the shell and the editor are
   * fetched, cached, and versioned as one unit and can never disagree.
   *
   * Notes on the document itself: it is in standards mode, where <body> is
   * only as tall as its content — HTMLSpace and DOMSpace measure their
   * container, so without `height: 100%` they would size to zero. And
   * `Pts.namespace(window)` puts the Pts classes in scope so sketches can
   * write `new CanvasSpace(...)`, which is what the guide teaches; each fresh
   * document has to do this deliberately. The library comes from the same
   * content-versioned asset as the completions, so preview and export cannot
   * drift onto a different release. Relative sketch assets still resolve
   * against this page's base (srcdoc documents inherit it).
   */
  var FRAME_SRCDOC = [
    "<!doctype html>",
    '<html lang="en">',
    "<head>",
    '<meta charset="UTF-8" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1" />',
    "<title>Pts demo preview</title>",
    "<script>",
    scriptText((window.PTS_API && window.PTS_API.library) || ""),
    "</script>",
    "<style>",
    "html, body { height: 100%; }",
    // overflow hidden: sketch content that outgrows the viewport by even a
    // fraction of a pixel must not summon scrollbars — on systems where they
    // take up layout space, they shrink the viewport and can put container-
    // measuring sketches into a resize feedback loop.
    "body { background-color: #f1f3f7; font-family: sans-serif; margin: 0; overflow: hidden; }",
    "#pt { position: absolute; top: 0; left: 0; right: 0; bottom: 0; }",
    "</style>",
    "</head>",
    "<body>",
    '<div id="pt"></div>',
    '<script type="text/javascript">Pts.namespace(window);</script>',
    "</body>",
    "</html>",
  ].join("\n");

  // ---------------------------------------------------------------- helpers

  function scriptText(source) {
    return source.replace(/<\/script/gi, "<\\/script");
  }

  function queryName() {
    var name = new URLSearchParams(window.location.search).get("name") || "";
    if (!name) return "";
    if (name.length <= 50 && /^[a-zA-Z0-9_]+\.[a-zA-Z0-9_]+$/.test(name)) {
      return name;
    }
    showError("Invalid demo name.");
    return "";
  }

  async function loadText(url) {
    var controller = new AbortController();
    var timer = setTimeout(function () {
      controller.abort();
    }, ASSET_TIMEOUT);

    try {
      var response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error(url + " returned " + response.status);
      return await response.text();
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error("timed out loading " + url, { cause: error });
      }
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }

  function showError(message, line) {
    if (!errorBar) return;
    if (!message) {
      errorBar.textContent = "";
      errorBar.classList.remove("show");
      setMarkers([]);
      return;
    }
    errorBar.textContent = line ? message + "  (line " + line + ")" : message;
    errorBar.classList.add("show");
    if (line) {
      setMarkers([
        {
          startLineNumber: line,
          endLineNumber: line,
          startColumn: 1,
          endColumn: 1000,
          message: message,
          severity: window.monaco ? monaco.MarkerSeverity.Error : 8,
        },
      ]);
    }
  }

  function setMarkers(markers) {
    if (!editor || !window.monaco) return;
    monaco.editor.setModelMarkers(editor.getModel(), "sketch", markers);
  }

  // ------------------------------------------------------------ sketch runs

  /**
   * Run the current source in a brand new document.
   *
   * The replacement frame is built hidden and only swapped in once it has
   * loaded, so there is no flash, and a frame that never loads leaves the
   * previous sketch on screen instead of a blank rectangle.
   */
  /**
   * True when the preview pane is not being displayed.
   *
   * Below 768px the stylesheet hides the sketch frame and tells the reader to
   * open a larger window. A hidden frame still loads, but lays out at 0x0, and
   * sketches that measure their space then divide by it fail in ways that have
   * nothing to do with the code being edited — `Create.delaunay` ends up
   * calling `Geom.sortEdges` on an empty group, for instance. Running there
   * produces a scary error over the code and no drawing, so don't.
   */
  function previewHidden() {
    if (!frame) return true;
    if (getComputedStyle(frame).display === "none") return true;
    var box = frame.getBoundingClientRect();
    return box.width === 0 || box.height === 0;
  }

  function runCode() {
    if (!editor) return;
    if (previewHidden()) {
      showError(null);
      return;
    }
    var source = editor.getValue();
    var id = ++runID;
    showError(null);

    var next = document.createElement("iframe");
    next.setAttribute("title", "Pts demo preview");
    next.className = "pending";
    next.srcdoc = FRAME_SRCDOC;
    // `id="demo"` is not decoration: the stylesheet hides #demo below 768px,
    // among other rules. A replacement without it escapes all of them, which
    // showed up as the preview pane covering the editor on narrow windows.
    // The id is moved off the outgoing frame first so it is never duplicated.

    var settled = false;
    var timer = setTimeout(function () {
      if (settled) return;
      settled = true;
      if (next.parentNode) next.parentNode.removeChild(next);
      if (id === runID) showError("The sketch frame took too long to load.");
    }, RUN_TIMEOUT);

    next.addEventListener("load", function () {
      if (settled) return;
      settled = true;
      clearTimeout(timer);

      // A slower previous Run must never replace a newer one.
      if (id !== runID) {
        if (next.parentNode) next.parentNode.removeChild(next);
        return;
      }

      try {
        injectSketch(next, source, id);
      } catch (e) {
        showError(e.message);
      }

      if (frame && frame.parentNode) {
        frame.removeAttribute("id");
        frame.parentNode.removeChild(frame);
      }
      next.setAttribute("id", "demo");
      next.className = "";
      frame = next;
    });

    // Inserted where the previous frame sits rather than appended to the body,
    // so the replacement keeps the same place in the document.
    if (frame && frame.parentNode) {
      frame.parentNode.insertBefore(next, frame);
    } else {
      document.body.appendChild(next);
    }
  }

  /**
   * Inject the sketch into a freshly loaded frame.
   *
   * The frame is same-origin, so this appends a script element directly rather
   * than routing the source through the URL, which would cap sketch length.
   * This editor runs code the visitor writes or deliberately opens; it is not an
   * isolation boundary for untrusted shared code. A real sandbox would also need
   * a separate preview origin or an asset proxy so local sound/image demos keep
   * working.
   */
  function injectSketch(iframe, source, id) {
    var win = iframe.contentWindow;
    var doc = iframe.contentDocument;
    if (!win || !doc) throw new Error("The sketch frame is not accessible.");

    win.addEventListener("error", function (e) {
      if (id === runID) showError(e.message, e.lineno);
    });
    win.addEventListener("unhandledrejection", function (e) {
      if (id !== runID) return;
      var reason = e.reason;
      showError(reason && reason.message ? reason.message : String(reason));
    });

    var script = doc.createElement("script");
    script.type = "text/javascript";
    // Names the sketch in stack traces so reported line numbers match the
    // editor rather than the host document.
    script.textContent = source + "\n//# sourceURL=sketch.js";
    doc.body.appendChild(script);
  }

  // ------------------------------------------------------------------ boot

  /**
   * Resolve once the Monaco module has run, whether or not it already has.
   *
   * A module that fails to load fires no event, so this also gives up after a
   * timeout — a visible message beats sitting at "Loading Editor..." forever,
   * which is what a stale cache or a blocked request used to produce.
   */
  function monacoReady() {
    return new Promise(function (resolve, reject) {
      if (window.__monacoReady) return resolve();
      var timer = setTimeout(function () {
        if (window.__monacoReady) return resolve();
        reject(
          new Error(
            "the editor failed to load. A hard refresh (Cmd/Ctrl+Shift+R) usually fixes this.",
          ),
        );
      }, ASSET_TIMEOUT);
      window.addEventListener(
        "monaco-ready",
        function () {
          clearTimeout(timer);
          resolve();
        },
        { once: true },
      );
    });
  }

  function createEditor() {
    registerPtsCompletions();

    editor = monaco.editor.create(document.getElementById("editor"), {
      value:
        "// Welcome to the Pts editor.\n// Load a demo, or start coding from scratch.",
      language: "javascript",
      theme: "vs",
      minimap: { enabled: false },
      // Without this Monaco keeps rendering at its original width when the
      // window changes size.
      automaticLayout: true,
      scrollBeyondLastLine: false,
    });
    window.editor = editor;

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, runCode);

    loadCode().then(function () {
      loader.style.display = "none";
      document.getElementById("run").disabled = false;
      document.getElementById("save").disabled = false;
    });
  }

  /**
   * Completions for the Pts API.
   *
   * This replaces Monaco's TypeScript language service, which was 1.6MB and was
   * being fed a hand-maintained `autocomplete.d.ts` that had drifted out of date
   * — it was missing Img, Sound, Tempo and UIDragger entirely. The data here is
   * generated from `docs/json` by `scripts/build-editor.mjs`, so it is produced
   * from the same source as the published documentation and cannot go stale.
   */
  function registerPtsCompletions() {
    var api = window.PTS_API;
    if (!api || !api.classes) return;

    var byName = {};
    var classItems = api.classes.map(function (cls) {
      byName[cls.name] = cls;
      return {
        label: cls.name,
        kind: monaco.languages.CompletionItemKind.Class,
        detail: "Pts class",
        documentation: cls.comment,
        insertText: cls.name,
      };
    });

    function memberItems(cls, wantStatic) {
      return cls.members
        .filter(function (m) {
          return wantStatic ? m.s === 1 : m.s === 0;
        })
        .map(function (m) {
          return {
            label: m.l,
            kind:
              m.k === "method"
                ? monaco.languages.CompletionItemKind.Method
                : monaco.languages.CompletionItemKind.Property,
            detail: m.r ? cls.name + " → " + m.r : cls.name,
            documentation: m.d,
            insertText: m.i,
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            filterText: m.n,
          };
        });
    }

    // Members of every class, for completing on an arbitrary instance where the
    // receiver's type is unknown.
    var allMembers = [];
    var seen = {};
    api.classes.forEach(function (cls) {
      memberItems(cls, false).forEach(function (item) {
        if (seen[item.label]) return;
        seen[item.label] = true;
        allMembers.push(item);
      });
    });

    monaco.languages.registerCompletionItemProvider("javascript", {
      triggerCharacters: ["."],
      provideCompletionItems: function (model, position) {
        var line = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        });

        var word = model.getWordUntilPosition(position);
        var range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        // `Something.` — offer that class's statics when we know the class.
        var receiver = /([A-Za-z_$][\w$]*)\s*\.\s*[\w$]*$/.exec(line);
        if (receiver) {
          var cls = byName[receiver[1]];
          var items = cls ? memberItems(cls, true) : allMembers;
          return {
            suggestions: items.map(function (item) {
              return Object.assign({ range: range }, item);
            }),
          };
        }

        return {
          suggestions: classItems.map(function (item) {
            return Object.assign({ range: range }, item);
          }),
        };
      },
    });
  }

  function loadCode() {
    var name = queryName();
    if (!name) return Promise.resolve();

    var backURL = new URL("../", window.location.href);
    backURL.searchParams.set("name", name);
    document.getElementById("back").href = backURL.href;

    return loadText("../" + name + ".js").then(
      function (text) {
        editor.setValue(text);
        runCode();
      },
      function (error) {
        editor.setValue(
          "// Could not load the demo '" +
            name +
            "'.\n// " +
            error.message +
            "\n\n// Pick another from Open, or start typing here.",
        );
      },
    );
  }

  function boot() {
    monacoReady()
      .then(function () {
        if (!window.monaco) throw new Error("the editor bundle did not load");
        if (!window.PTS_API || !window.PTS_API.library) {
          throw new Error(
            "the Pts library did not load. Please refresh the page.",
          );
        }
        createEditor();
      })
      .catch(function (error) {
        loader.textContent = "Could not start the editor: " + error.message;
      });
  }

  // ------------------------------------------------------------------- UI

  function openLoadMenu() {
    loadMenu.inert = false;
    loadMenu.classList.add("open");
    loadMenu.setAttribute("aria-hidden", "false");
    loadButton.setAttribute("aria-expanded", "true");
    loadMenu.querySelector(".demo").focus();
  }

  function closeLoadMenu(restoreFocus) {
    loadMenu.classList.remove("open");
    loadMenu.setAttribute("aria-hidden", "true");
    loadMenu.inert = true;
    loadButton.setAttribute("aria-expanded", "false");
    if (restoreFocus) loadButton.focus();
  }

  function downloadHTML(html) {
    var blob = new Blob([html], { type: "text/html;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = "pts_demo.html";
    link.hidden = true;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1000);
  }

  document.getElementById("run").addEventListener("click", runCode);
  loadButton.addEventListener("click", openLoadMenu);
  document.getElementById("closemenu").addEventListener("click", function () {
    closeLoadMenu(true);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && loadMenu.classList.contains("open")) {
      closeLoadMenu(true);
    }
  });

  document.getElementById("save").addEventListener("click", function () {
    if (!editor) return;
    var source = scriptText(editor.getValue());
    var html = [
      "<!doctype html>",
      '<html lang="en">',
      "  <head>",
      '    <meta charset="UTF-8" />',
      '    <meta name="viewport" content="width=device-width, initial-scale=1" />',
      "    <title>Pts demo</title>",
      "    <script>",
      scriptText(window.PTS_API.library),
      "    </script>",
      "    <style>html, body { height: 100%; } #pt { width: min(800px, 100%); height: 600px; margin: 30px auto 0; }</style>",
      "  </head>",
      '  <body style="font-family: sans-serif; margin: 0;">',
      '    <div id="pt"></div>',
      '    <div style="padding: 20px 0; font-size: 0.8em; color: #9ab; text-align: center;">',
      '      Generated by <a href="https://ptsjs.org/demo/edit">Pts demo editor</a>.',
      "    </div>",
      "    <script>",
      "Pts.namespace(window);",
      "",
      source,
      "",
      "    </script>",
      "  </body>",
      "</html>",
    ].join("\n");
    downloadHTML(html);
  });

  boot();
})();
