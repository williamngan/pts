import assert from "node:assert/strict";
import { chromium } from "playwright";

const dist = new URL("../dist/", import.meta.url);
const browser = await chromium.launch({ headless: true });

try {
  for (const file of ["pts.js", "pts.min.js"]) {
    const page = await browser.newPage();
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
    await page.close();
  }
} finally {
  await browser.close();
}

console.log(
  "Readable and minified IIFE builds passed the Chromium CanvasSpace smoke test.",
);
