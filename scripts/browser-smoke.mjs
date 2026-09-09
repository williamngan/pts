import assert from "node:assert/strict";
import { chromium } from "playwright";

const dist = new URL("../dist/", import.meta.url);
const browser = await chromium.launch({ headless: true });

try {
  for (const file of ["pts.js", "pts.min.js"]) {
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setContent(`
      <!doctype html>
      <style>#container { width: 320px; height: 180px; }</style>
      <div id="container"><canvas id="stage"></canvas></div>
    `);
    await page.addScriptTag({ path: new URL(file, dist).pathname });

    const result = await page.evaluate(async () => {
      const namespaceTarget = {};
      globalThis.Pts.namespace(namespaceTarget);

      const space = new globalThis.Pts.CanvasSpace("#stage").setup({
        bgcolor: "#123456",
        resize: true,
        retina: false,
      });
      await new Promise((resolve) =>
        space.element.addEventListener("ready", resolve, { once: true }),
      );

      const form = space.getForm();
      let frames = 0;
      space.add({
        animate: () => {
          frames += 1;
          form.fillOnly("#fff").point([20, 20], 3);
        },
      });
      space.play();
      await new Promise((resolve) => setTimeout(resolve, 100));
      space.stop();

      const output = {
        exports: Object.keys(globalThis.Pts).sort(),
        frames,
        height: space.element.height,
        namespaceWorked: namespaceTarget.Pt === globalThis.Pts.Pt,
        quickStart: typeof globalThis.Pts.quickStart,
        width: space.element.width,
      };
      space.dispose();
      await new Promise((resolve) => setTimeout(resolve, 50));
      output.disposed =
        !space.isPlaying && Object.keys(space.players).length === 0;
      return output;
    });

    assert.ok(result.exports.length >= 47, `${file} exposed too few globals`);
    assert.ok(result.frames > 0, `${file} did not animate`);
    assert.ok(
      result.width > 0 && result.height > 0,
      `${file} did not size its canvas`,
    );
    assert.equal(result.namespaceWorked, true);
    assert.equal(result.quickStart, "function");
    assert.equal(result.disposed, true);

    // Exercise the native input bridge, not just synthetic UI.listen calls.
    const setupDragger = async (tracking, binding) => {
      await page.setContent(`<!doctype html>
        <style>body { margin: 0; } #host { width: 320px; height: 180px; touch-action: none; }</style>
        <div id="host"></div>`);
      await page.evaluate(
        async ({ tracking, binding }) => {
          const { CanvasSpace, UIDragger, UI, Pt } = globalThis.Pts;
          const space = new CanvasSpace("host").setup({ retina: false });
          await new Promise((resolve) =>
            space.element.addEventListener("ready", resolve, { once: true }),
          );
          const dragger = UIDragger.fromRectangle(
            [
              [20, 20],
              [100, 100],
            ],
            {},
          );
          const state = {
            drags: 0,
            drops: 0,
            touchMoves: 0,
            pointerMatches: true,
          };
          dragger.onDrag((target, pt) => {
            state.drags++;
            state.pointerMatches &&= space.pointer.equals(pt);
            target.group.moveTo(new Pt(pt).subtract(target.state("offset")));
          });
          dragger.onDrop(() => state.drops++);
          if (tracking === "auto") space.track(dragger);
          else
            space.add({
              animate: () => {},
              action: (type, x, y, evt) =>
                UI.track([dragger], type, new Pt(x, y), evt),
            });
          if (binding !== "touch") space.bindMouse();
          if (binding === "separate") {
            const touchTarget = document.createElement("div");
            document.body.appendChild(touchTarget);
            space.bindTouch(true, false, touchTarget);
          } else if (binding !== "mouse") space.bindTouch();
          space.element.addEventListener("touchmove", () => state.touchMoves++);
          space.play();
          globalThis.inputProbe = { space, dragger, state };
        },
        { tracking, binding },
      );
    };
    const dragState = () =>
      page.evaluate(() => ({
        ...globalThis.inputProbe.state,
        dragging: globalThis.inputProbe.dragger.state("dragging"),
      }));
    for (const tracking of ["auto", "manual"]) {
      await setupDragger(tracking, "mouse");
      await page.mouse.move(40, 40);
      await page.mouse.down();
      await page.mouse.move(350, 120, { steps: 4 }); // beyond the UI and canvas
      await page.mouse.up();
      assert.deepEqual(
        await dragState(),
        {
          drags: 4,
          drops: 1,
          touchMoves: 0,
          pointerMatches: true,
          dragging: false,
        },
        `${file}: ${tracking} native mouse drag`,
      );
      await page.evaluate(() => globalThis.inputProbe.space.dispose());
    }
    for (const binding of ["touch", "both", "separate"]) {
      await setupDragger("auto", binding);
      const session = await page.context().newCDPSession(page);
      const touch = (type, x, y) =>
        session.send("Input.dispatchTouchEvent", {
          type,
          touchPoints: x === undefined ? [] : [{ x, y, id: 1 }],
        });
      await touch("touchStart", 40, 40);
      await touch("touchMove", 100, 80);
      await touch("touchMove", 150, 100);
      await touch("touchEnd");
      const state = await dragState();
      assert.ok(state.touchMoves > 0);
      assert.equal(
        state.drags,
        state.touchMoves,
        `${file}: ${binding} must not duplicate touch drags`,
      );
      assert.equal(state.drops, 1);
      assert.equal(state.dragging, false);
      assert.equal(state.pointerMatches, true);
      // Cancellation without moving must still release the dragger.
      await touch("touchStart", 150, 100);
      await touch("touchCancel");
      assert.equal((await dragState()).dragging, false);
      assert.equal((await dragState()).drops, 1);
      await session.detach();
      await page.evaluate(() => globalThis.inputProbe.space.dispose());
    }
    await setupDragger("auto", "mouse");
    await page.mouse.move(40, 40);
    await page.mouse.down();
    await page.evaluate(() =>
      globalThis.inputProbe.space.element.dispatchEvent(
        new PointerEvent("pointercancel", { clientX: 300, clientY: 150 }),
      ),
    );
    assert.equal((await dragState()).dragging, false);
    await page.mouse.up();
    assert.equal((await dragState()).drops, 0);
    await page.evaluate(() => globalThis.inputProbe.space.dispose());

    for (const kind of ["canvas", "svg", "svg-container"]) {
      for (const argument of ["bare-id", "selector", "element"]) {
        await page.setContent(
          `<!doctype html><div id="host" style="width:320px;height:180px">${
            kind === "svg-container"
              ? '<div id="mount"><svg></svg></div>'
              : `<${kind} id="mount"></${kind}>`
          }</div>`,
        );
        const mounted = await page.evaluate(
          ({ kind, argument }) => {
            const mount = document.getElementById("mount");
            const input =
              argument === "element"
                ? mount
                : argument === "selector"
                  ? "#mount"
                  : "mount";
            globalThis.Pts.quickStart(input);
            const space = globalThis.space;
            const expected =
              kind === "canvas"
                ? globalThis.Pts.CanvasSpace
                : globalThis.Pts.SVGSpace;
            const valid =
              space instanceof expected && mount.contains(space.element);
            space.dispose();
            return valid;
          },
          { kind, argument },
        );
        assert.equal(mounted, true, `${file}: ${kind} mount using ${argument}`);
      }
    }
    assert.deepEqual(errors, [], `${file}: unexpected browser errors`);
    await page.close();
  }
} finally {
  await browser.close();
}

console.log(
  "Readable and minified IIFE builds passed the Chromium CanvasSpace smoke test.",
);
