import assert from "node:assert/strict";
import { Canvas } from "skia-canvas";
import { CanvasForm, Circle, Pt } from "pts";

const canvas = new Canvas(320, 180);
const context = canvas.getContext("2d");
context.fillStyle = "#0f172a";
context.fillRect(0, 0, canvas.width, canvas.height);

const form = new CanvasForm(context);
assert.equal(form.ready, true);
form.fillOnly("#f97316").point(new Pt(160, 90), 14, "circle");
form.strokeOnly("#38bdf8", 4).line([
  [20, 20],
  [300, 160],
]);
form.fillOnly("#a3e635").circle(Circle.fromCenter([60, 120], 18));

assert.equal(new Pt(1, 2).add(3).toString(), "Pt(4, 5)");
const png = await canvas.png;
assert.ok(png.length > 1_000, `PNG output is too small: ${png.length} bytes`);
assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);

console.log(`skia-canvas rendered a ${png.length}-byte PNG with CanvasForm.`);
