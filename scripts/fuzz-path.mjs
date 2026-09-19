/** Seeded coverage oracle for the built Path API. Run after pnpm build. */
import assert from "node:assert/strict";
import { parseArgs } from "node:util";
import { Group, Path } from "../dist/index.mjs";

const { values } = parseArgs({
  options: {
    seed: { type: "string", default: "18311" },
    trials: { type: "string", default: "1500" },
  },
});
const initialSeed = Number(values.seed);
const trials = Number(values.trials);
assert.ok(
  Number.isInteger(initialSeed) &&
    initialSeed >= 0 &&
    initialSeed <= 0xffffffff,
  "seed must be a uint32",
);
assert.ok(
  Number.isSafeInteger(trials) && trials > 0,
  "trials must be a positive integer",
);
let seed = initialSeed;
const random = () => {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
};
function inside(rings, x, y) {
  let winding = 0;
  for (const ring of rings) {
    for (let i = 0; i < ring.length; i++) {
      const a = ring[i],
        b = ring[(i + 1) % ring.length];
      const cross = (b[0] - a[0]) * (y - a[1]) - (x - a[0]) * (b[1] - a[1]);
      if (a[1] <= y && b[1] > y && cross > 0) winding++;
      if (a[1] > y && b[1] <= y && cross < 0) winding--;
    }
  }
  return winding !== 0;
}
function nearBoundary(shapes, x, y) {
  for (const rings of shapes)
    for (const ring of rings) {
      for (let i = 0; i < ring.length; i++) {
        const a = ring[i],
          b = ring[(i + 1) % ring.length];
        const dx = b[0] - a[0],
          dy = b[1] - a[1];
        const length2 = dx * dx + dy * dy;
        const t =
          length2 === 0
            ? 0
            : Math.max(
                0,
                Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / length2),
              );
        if (Math.hypot(x - a[0] - t * dx, y - a[1] - t * dy) < 0.0002)
          return true;
      }
    }
  return false;
}
const predicates = {
  unite: (ins) => ins.some(Boolean),
  intersect: (ins) => ins.every(Boolean),
  exclude: (ins) => ins.filter(Boolean).length % 2 === 1,
  minusFront: (ins) => ins[0] && !ins.slice(1).some(Boolean),
  minusBack: (ins) => ins.at(-1) && !ins.slice(0, -1).some(Boolean),
};
for (let trial = 0; trial < trials; trial++) {
  const coordinate = () =>
    trial % 3 === 0
      ? random() * 30
      : Math.floor(random() * 4) * 10 + (random() - 0.5) * 0.00005;
  let shapes = Array.from({ length: 2 + Math.floor(random() * 3) }, (_, s) =>
    Array.from({ length: trial % 7 === 0 && s === 0 ? 2 : 1 }, () =>
      Array.from({ length: 3 + Math.floor(random() * 5) }, () => [
        coordinate(),
        coordinate(),
      ]),
    ),
  );
  // Every fifth trial uses smooth shapes with many vertices: discs of 64 to
  // 256 points, one of them a copy shifted by a fraction of an edge length,
  // so shallow crossings and near-coincident edges are covered too.
  if (trial % 5 === 4) {
    const n = 64 + Math.floor(random() * 193);
    const discAt = (cx, cy, r, dx = 0, dy = 0) =>
      Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2;
        return [cx + r * Math.cos(a) + dx, cy + r * Math.sin(a) + dy];
      });
    const cx = 10 + random() * 10;
    const cy = 10 + random() * 10;
    const r = 5 + random() * 8;
    shapes = [
      [discAt(cx, cy, r)],
      [discAt(cx, cy, r, random() * 0.1, random() * 0.1)],
      [discAt(cx + random() * 10 - 5, cy + random() * 10 - 5, r * 0.7)],
    ];
  }
  // Exercise both double arrays and the Float32 data sketches normally use.
  if (trial % 2 === 0)
    shapes = shapes.map((rings) => rings.map((ring) => Group.fromArray(ring)));
  try {
    const results = Object.fromEntries(
      Object.keys(predicates).map((mode) => [mode, Path[mode](shapes)]),
    );
    const divided = Path.divide(shapes),
      cropped = Path.crop(shapes);
    for (const ring of [
      ...Object.values(results).flat(),
      ...divided.flat(),
      ...cropped.flat(),
    ]) {
      assert.ok(ring.length >= 3, "short output ring");
      ring.forEach((p, i) => {
        const q = ring[(i + 1) % ring.length];
        assert.ok(
          Number.isFinite(p[0]) && Number.isFinite(p[1]),
          "non-finite output",
        );
        assert.ok(p[0] !== q[0] || p[1] !== q[1], "duplicate output vertex");
      });
    }
    for (let i = 0; i < 36; i++) {
      const x = (i % 6) * 5 + 1.314159,
        y = Math.floor(i / 6) * 5 + 2.718281;
      if (nearBoundary(shapes, x, y)) continue;
      const ins = shapes.map((rings) => inside(rings, x, y));
      for (const [mode, predicate] of Object.entries(predicates))
        assert.equal(
          inside(results[mode], x, y),
          predicate(ins),
          `${mode} at ${x},${y}`,
        );
      assert.equal(
        divided.filter((rings) => inside(rings, x, y)).length,
        ins.some(Boolean) ? 1 : 0,
        `divide at ${x},${y}`,
      );
      assert.equal(
        cropped.filter((rings) => inside(rings, x, y)).length,
        ins.at(-1) && ins.slice(0, -1).some(Boolean) ? 1 : 0,
        `crop at ${x},${y}`,
      );
    }
    // A result is valid input: uniting the divided faces gives the union back.
    if (trial % 4 === 0) {
      const reunited = Path.unite(divided);
      for (let i = 0; i < 36; i++) {
        const x = (i % 6) * 5 + 1.314159,
          y = Math.floor(i / 6) * 5 + 2.718281;
        if (nearBoundary(shapes, x, y)) continue;
        assert.equal(
          inside(reunited, x, y),
          inside(results.unite, x, y),
          `unite of divide at ${x},${y}`,
        );
      }
    }
  } catch (error) {
    console.error(
      JSON.stringify({
        seed: initialSeed,
        trial,
        shapes: shapes.map((rings) =>
          rings.map((ring) => Array.from(ring, (p) => Array.from(p))),
        ),
      }),
    );
    throw error;
  }
}
console.log(
  `Path fuzz passed: seed=${initialSeed}, trials=${trials}, all seven modes.`,
);
