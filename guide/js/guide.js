/*!
 * Guide demo loader.
 *
 * Each demo in the guide is authored in markdown as an image whose alt text
 * carries a marker, e.g. `![js:getting_started](./assets/bg.png)`. The image is
 * the static preview; this script overlays a live sketch on top of it.
 *
 * The loading rules exist because the previous version got them wrong, and the
 * failure was invisible on a fast connection:
 *
 *  - A demo is never constructed against a zero-sized container. The overlay
 *    takes its height from the preview image, so before that image loads there
 *    is nothing to draw into. Building a space there produced a correctly-sized
 *    but permanently empty canvas, because resizing a canvas clears it and an
 *    idle space is not repainted by the ResizeObserver path.
 *  - A demo is not loaded until it is near the viewport, so a twelve-demo page
 *    does not start twelve render loops before the reader has scrolled.
 *  - The preview image stays visible until the sketch has actually painted, and
 *    stays forever if it never does. A static preview is a good fallback; a flat
 *    coloured rectangle is not.
 *  - Every way of failing ends in a visible state with a message.
 */

Pts.namespace(this);

(function () {
  "use strict";

  // Relative, so the guide works when the site is served from a subpath.
  const EDIT_PATH = "../demo/edit/?name=guide.";

  // One timer budget, defined once.
  const SPINNER_DELAY = 250; // don't flash a spinner for an instant demo
  const SIZE_TIMEOUT = 6000; // container never got a usable size
  const REGISTER_TIMEOUT = 8000; // script loaded but never registered
  const RESIZE_DEBOUNCE = 150;
  const VIEWPORT_MARGIN = "200px"; // start loading a little before it scrolls in

  const registry = Object.create(null); // id -> registration
  const controllers = Object.create(null); // id -> controller

  /**
   * Called by each example at the end of its script.
   * @param id the demo id, matching the container element
   * @param space the Space instance the example created
   * @param startFn optional callback when the demo becomes active
   * @param stopFn optional callback when the demo stops (sound examples use it)
   * @param isCustom if true, the example drives its own play/stop
   */
  window.registerDemo = function (id, space, startFn, stopFn, isCustom) {
    registry[id] = {
      space: space,
      startCallback: startFn,
      stopCallback: stopFn,
      isCustom: isCustom,
    };
    if (controllers[id]) controllers[id].registered();
  };

  function createDemo(imgElem) {
    const id = imgElem.getAttribute("alt").replace(/^js:/i, "");
    if (!id || controllers[id]) return;

    const container = document.createElement("div");
    container.className = "demoOverlay is-pending";
    container.setAttribute("id", id);

    const spinner = document.createElement("div");
    spinner.className = "demoSpinner";
    spinner.setAttribute("aria-hidden", "true");
    container.appendChild(spinner);

    const status = document.createElement("p");
    status.className = "demoStatus";
    container.appendChild(status);

    const link = document.createElement("a");
    link.textContent = "Edit live code ";
    link.className = "sourceCodeLink";
    link.setAttribute("target", "pts_editor");
    link.setAttribute("href", EDIT_PATH + id);
    container.appendChild(link);

    imgElem.parentNode.appendChild(container);

    let state = "pending";
    let isSized = false;
    let isVisible = false;
    let isPreviewSettled = false;
    let spinnerTimer = null;
    let sizeTimer = null;
    let registerTimer = null;
    let canvasObserver = null;

    function setState(next) {
      container.classList.remove("is-" + state);
      state = next;
      container.classList.add("is-" + state);
    }

    function fail(message) {
      if (state === "failed" || state === "ready") return;
      clearTimeout(spinnerTimer);
      clearTimeout(sizeTimer);
      clearTimeout(registerTimer);
      setState("failed");
      status.textContent = message;
      sizeObserver.disconnect();
      viewObserver.disconnect();
    }

    /**
     * Three independent latches on one state, any of which may settle first: a
     * demo can be visible before its preview image gives it a size, or sized
     * long before it scrolls into view. Nothing drives the sequence; each latch
     * just retries the transition.
     *
     * The preview image is a latch of its own because the container inherits its
     * height from it. Between "has some height" and "has its final height" the
     * container passes through a single text line, and a space built there gets
     * a canvas a couple of dozen pixels tall.
     */
    function maybeLoad() {
      if (state !== "pending" || !isSized || !isVisible || !isPreviewSettled) {
        return;
      }
      clearTimeout(sizeTimer);
      setState("loading");

      spinnerTimer = setTimeout(function () {
        container.classList.add("show-spinner");
      }, SPINNER_DELAY);

      registerTimer = setTimeout(function () {
        fail("This demo did not start. Its source may be out of date.");
      }, REGISTER_TIMEOUT);

      const script = document.createElement("script");
      script.src = "./js/examples/" + id + ".js";
      script.onerror = function () {
        fail("This demo could not be loaded.");
      };
      document.body.appendChild(script);
    }

    /**
     * The example calls registerDemo synchronously at the end of its script,
     * having already created its space and asked it to paint. That paint is not
     * enough to show, though: a Space finishes initialising on a timer, and
     * until it does, `playItems` skips every player and paints only the
     * background. The examples all use `playOnce(200)`, which compares the
     * absolute animation timestamp against its end time — so on a page that has
     * been open for longer than 200ms it renders exactly one frame, and that
     * frame is the one that lands too early.
     *
     * So wait for the space to report itself ready, repaint, and only then
     * reveal the canvas over the preview image.
     */
    function registered() {
      if (state === "failed") return;
      clearTimeout(spinnerTimer);
      clearTimeout(registerTimer);
      container.classList.remove("show-spinner");

      const demo = registry[id];
      const space = demo && demo.space;
      if (!space) {
        fail("This demo did not provide a space to render.");
        return;
      }

      whenReady(space, function () {
        setState("ready");
        watchCanvas(space);
        repaintIfIdle();
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            container.classList.add("has-painted");
          });
        });
      });
    }

    /**
     * Repaint whenever the space resizes its own canvas.
     *
     * Setting `canvas.width`/`height` clears it, and `CanvasSpace.resize` only
     * repaints an idle space when it was given a resize *event* — but its own
     * ResizeObserver calls the handler with `null`, so an observer-driven
     * resize clears the canvas and leaves it blank. That is what made these
     * demos come up empty once loading became lazy: the space is built, paints,
     * and is then cleared by its own observer a frame later.
     *
     * Watching the canvas element covers it from the guide's side, whichever
     * path did the resizing.
     */
    function watchCanvas(space) {
      const canvas = space.element;
      if (!canvas || canvasObserver) return;
      canvasObserver = new ResizeObserver(function () {
        scheduleRepaint();
      });
      canvasObserver.observe(canvas);
    }

    function whenReady(space, fn) {
      let done = false;
      const once = function () {
        if (done) return;
        done = true;
        fn();
      };
      if (space.ready) return once();
      if (space.element && space.element.addEventListener) {
        space.element.addEventListener("ready", once, { once: true });
      }
      // Never let readiness be the thing that hangs the demo.
      setTimeout(once, REGISTER_TIMEOUT);
    }

    function repaintIfIdle() {
      const demo = registry[id];
      if (!demo || !demo.space || demo.isCustom) return;
      if (demo.space.isPlaying) return;
      try {
        demo.space.playOnce(0);
      } catch (e) {
        // a demo that cannot repaint is not worth breaking the page over
      }
    }

    function start() {
      const demo = registry[id];
      if (state !== "ready" || !demo) return;
      container.classList.add("active");
      if (demo.space && !demo.isCustom) demo.space.replay();
      if (demo.startCallback) demo.startCallback();
    }

    function stop() {
      const demo = registry[id];
      container.classList.remove("active");
      if (!demo) return;
      if (demo.space && !demo.isCustom) demo.space.stop();
      // Sound examples hold an AudioContext; this is what releases it.
      if (demo.stopCallback) demo.stopCallback();
    }

    if (imgElem.complete) {
      isPreviewSettled = true;
    } else {
      const settle = function () {
        isPreviewSettled = true;
        maybeLoad();
      };
      imgElem.addEventListener("load", settle, { once: true });
      // A missing preview still settles: the size timeout below reports it.
      imgElem.addEventListener("error", settle, { once: true });
    }

    const sizeObserver = new ResizeObserver(function (entries) {
      const box = entries[0].contentRect;
      isSized = box.width > 0 && box.height > 0;
      if (isSized) maybeLoad();
      if (state === "ready") scheduleRepaint();
    });
    sizeObserver.observe(container);

    const viewObserver = new IntersectionObserver(
      function (entries) {
        isVisible = entries[0].isIntersecting;
        if (isVisible) {
          startSizeWatchdog();
          maybeLoad();
        } else {
          // Not a failure — a demo the reader has not reached yet simply waits.
          clearTimeout(sizeTimer);
          sizeTimer = null;
          stop();
        }
      },
      { rootMargin: VIEWPORT_MARGIN },
    );
    viewObserver.observe(container);

    /**
     * Report a demo that is on screen but never gets a usable size.
     *
     * This only runs while the demo is actually in view. Timing it from page
     * load instead meant every demo further down the page — which is correctly
     * waiting to be scrolled to — failed with "could not be sized" after six
     * seconds, on the first load of every guide page.
     */
    function startSizeWatchdog() {
      if (sizeTimer || state !== "pending") return;
      sizeTimer = setTimeout(function () {
        sizeTimer = null;
        if (state === "pending" && isVisible) {
          fail("This demo could not be sized on this page.");
        }
      }, SIZE_TIMEOUT);
    }

    let repaintTimer = null;
    function scheduleRepaint() {
      clearTimeout(repaintTimer);
      repaintTimer = setTimeout(repaintIfIdle, RESIZE_DEBOUNCE);
    }

    container.addEventListener("mouseenter", start);
    container.addEventListener("touchstart", start, { passive: true });
    container.addEventListener("mouseleave", stop);
    container.addEventListener("touchend", stop);

    controllers[id] = { registered: registered };
  }

  function cap(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  /** Rewrite in-page `#class-name` code links to point at the docs site. */
  function updateCodeLinks() {
    const codes = document.querySelectorAll("a > code");
    for (let i = 0, len = codes.length; i < len; i++) {
      const c = codes[i];
      if (
        c.parentNode.getAttribute("href").indexOf("#") === 0 &&
        c.textContent
      ) {
        let link = c.parentNode
          .getAttribute("href")
          .replace(/#/g, "")
          .split("-");
        let linkAnchor = c.textContent.split(".");
        const ftype =
          linkAnchor.length > 1 && linkAnchor[0] === ""
            ? "accessor"
            : "function";
        linkAnchor = linkAnchor[linkAnchor.length - 1].replace(
          /[^a-zA-Z0-9._$]/g,
          "_",
        );
        c.parentNode.setAttribute(
          "href",
          `../docs/?p=${cap(link[0])}_${cap(link[1] || link[0])}#${ftype}_${linkAnchor}`,
        );
        c.parentNode.setAttribute("target", "ptsdocs");
      }
    }
  }

  const blocks = Array.from(document.querySelectorAll("img")).filter(
    function (img) {
      const alt = img.getAttribute("alt");
      return alt && alt.indexOf("js:") === 0;
    },
  );

  for (let i = 0, len = blocks.length; i < len; i++) {
    createDemo(blocks[i]);
  }

  window.addEventListener("load", updateCodeLinks);
})();
