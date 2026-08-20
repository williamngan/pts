/**
 * `Create`, `Noise` and `Delaunay`.
 *
 * `Delaunay` accumulates into its own `_mesh`, so those cases build a fresh
 * instance per iteration in `setup` rather than reusing one.
 */

import { SIZES } from "../lib/fixtures.mjs";
import { sink } from "../lib/sink.mjs";
import { defineSuite } from "../lib/suite.mjs";

const N = SIZES.M;
const MESH_POINTS = 128;

export default defineSuite("create", (b, { Pts, fx }) => {
  const { Create, Noise, Num, Pt } = Pts;

  b.case("Create.distributeRandom", {
    batch: N,
    setupOnce: () => {
      Num.seed("pts-bench-create");
      return fx.bound();
    },
    run: (bound) => {
      sink(Create.distributeRandom(bound, N).length);
    },
  });

  b.case("Create.distributeLinear", {
    batch: N,
    setupOnce: () => fx.group("create:linear", 2),
    run: (line) => {
      sink(Create.distributeLinear(line, N).length);
    },
  });

  b.case("Create.gridPts", {
    batch: N,
    setupOnce: () => fx.bound(),
    run: (bound) => {
      sink(Create.gridPts(bound, 32, 16).length);
    },
  });

  b.case("Create.gridCells", {
    batch: N,
    setupOnce: () => fx.bound(),
    run: (bound) => {
      sink(Create.gridCells(bound, 32, 16).length);
    },
  });

  b.case("Create.radialPts", {
    batch: N,
    setupOnce: () => new Pt(200, 200),
    run: (center) => {
      sink(Create.radialPts(center, 150, N).length);
    },
  });

  b.case("Create.noisePts", {
    batch: N,
    setupOnce: () => fx.bound(),
    run: (bound) => {
      sink(Create.noisePts(Create.gridPts(bound, 32, 16), 0.05, 0.1).length);
    },
  });

  // ----------------------------------------------------------------- Noise

  b.case("Noise.noise2D", {
    batch: N,
    setupOnce: () => {
      const noise = new Noise(0, 0);
      noise.seed(42);
      return noise;
    },
    run: (noise) => {
      let acc = 0;
      for (let i = 0; i < N; i++) {
        noise.step(0.01, 0.01);
        acc += noise.noise2D();
      }
      sink(acc);
    },
  });

  b.case("Noise.seed", {
    batch: SIZES.S,
    setupOnce: () => new Noise(0, 0),
    run: (noise) => {
      let acc = 0;
      for (let i = 0; i < SIZES.S; i++) {
        noise.seed(i + 1);
        acc += noise.noise2D();
      }
      sink(acc);
    },
  });

  // repeated same-seed path (memoized): the pattern `Create.noisePts` uses
  b.case("Noise.seed (repeated seed)", {
    batch: SIZES.S,
    setupOnce: () => new Noise(0, 0),
    run: (noise) => {
      let acc = 0;
      for (let i = 0; i < SIZES.S; i++) {
        noise.seed(0.42);
        acc += noise.noise2D();
      }
      sink(acc);
    },
  });

  // -------------------------------------------------------------- Delaunay

  b.case("Create.delaunay + triangulate", {
    batch: MESH_POINTS,
    setupOnce: () => fx.group("create:delaunay", MESH_POINTS, 2, 0, 500),
    // a Delaunay caches its mesh, so each iteration needs a fresh one
    setup: (source) => Create.delaunay(source),
    run: (delaunay) => {
      sink(delaunay.delaunay().length);
    },
  });

  // `voronoi`, `mesh` and `neighborPts` all read the mesh that `delaunay()`
  // builds, and quietly return nothing if it was never called — so these cases
  // triangulate in the untimed setup and measure only the read.
  const triangulated = (label) => () => {
    const delaunay = Create.delaunay(fx.group(label, MESH_POINTS, 2, 0, 500));
    delaunay.delaunay();
    return delaunay;
  };

  b.case("Delaunay.voronoi", {
    batch: MESH_POINTS,
    setupOnce: triangulated("create:voronoi"),
    run: (delaunay) => {
      sink(delaunay.voronoi().length);
    },
  });

  b.case("Delaunay.neighborPts", {
    batch: MESH_POINTS,
    setupOnce: triangulated("create:neighbors"),
    run: (delaunay) => {
      let acc = 0;
      for (let i = 0; i < MESH_POINTS; i++) {
        acc += delaunay.neighborPts(i).length;
      }
      sink(acc + 1);
    },
  });

  b.case("Delaunay.neighbors", {
    batch: MESH_POINTS,
    setupOnce: triangulated("create:neighborShapes"),
    run: (delaunay) => {
      let acc = 0;
      for (let i = 0; i < MESH_POINTS; i++) acc += delaunay.neighbors(i).length;
      sink(acc + 1);
    },
  });
});
