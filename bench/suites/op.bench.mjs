/**
 * `Line`, `Rectangle`, `Circle`, `Triangle`, `Polygon` and `Curve`.
 *
 * This is the widest surface in the library and the one sketches call most.
 * Intersection tests and curve subdivision dominate real frame budgets, so both
 * are measured across a workload rather than a single call.
 *
 * Fixtures are spread across a shared region so intersection cases exercise the
 * real work rather than only the early-rejection path.
 */

import { SIZES } from "../lib/fixtures.mjs";
import { sink } from "../lib/sink.mjs";
import { defineSuite } from "../lib/suite.mjs";

const N = SIZES.M;
const POLY_SIDES = 8;
const CURVE_POINTS = 64;
const CURVE_STEPS = 20;

export default defineSuite("op", (b, { Pts, fx }) => {
  const { Line, Rectangle, Circle, Triangle, Polygon, Curve, Group, Pt } = Pts;

  /** Register a case that applies `apply` to every item of a prepared list. */
  const perItem = (name, size, prepare, apply) =>
    b.case(name, {
      batch: size,
      setupOnce: prepare,
      run: (state) => {
        let acc = 0;
        for (let i = 0; i < size; i++) acc += apply(state, i);
        sink(acc);
      },
    });

  const value = (result, key = 0) => {
    if (result === undefined || result === false || result === null) return 0;
    if (typeof result === "number") return result;
    if (typeof result === "boolean") return result ? 1 : 0;
    const item = result[key];
    if (item === undefined) return 0;
    return typeof item === "number" ? item : (item[0] ?? 0);
  };

  // ------------------------------------------------------------------ Line

  perItem(
    "Line.fromAngle",
    N,
    () => fx.pts("op:line:fromAngle", N),
    (pts, i) => Line.fromAngle(pts[i], 0.7, 50)[1][0],
  );

  perItem(
    "Line.slope",
    N,
    () => fx.lines("op:line:slope", N),
    (lines, i) => Line.slope(lines[i][0], lines[i][1]),
  );

  perItem(
    "Line.intercept",
    N,
    () => fx.lines("op:line:intercept", N),
    (lines, i) => value(Line.intercept(lines[i][0], lines[i][1]), "yi"),
  );

  perItem(
    "Line.sideOfPt2D",
    N,
    () => ({
      lines: fx.lines("op:line:side", N),
      pts: fx.pts("op:line:side:pt", N),
    }),
    (s, i) => Line.sideOfPt2D(s.lines[i], s.pts[i]),
  );

  // Half the triples are genuinely collinear, so both branches are measured.
  perItem(
    "Line.collinear",
    N,
    () => {
      const a = fx.pts("op:line:collinear:a", N);
      const b = fx.pts("op:line:collinear:b", N);
      const scattered = fx.pts("op:line:collinear:c", N);
      const c = a.map((p, i) =>
        i % 2 === 0 ? p.$add(b[i].$subtract(p).$multiply(2)) : scattered[i],
      );
      return { a, b, c };
    },
    (s, i) => (Line.collinear(s.a[i], s.b[i], s.c[i]) ? 1 : 0),
  );

  perItem(
    "Line.magnitude",
    N,
    () => fx.lines("op:line:magnitude", N),
    (lines, i) => Line.magnitude(lines[i]),
  );

  perItem(
    "Line.magnitudeSq",
    N,
    () => fx.lines("op:line:magnitudeSq", N),
    (lines, i) => Line.magnitudeSq(lines[i]),
  );

  perItem(
    "Line.perpendicularFromPt",
    N,
    () => ({
      lines: fx.lines("op:line:perp", N),
      pts: fx.pts("op:line:perp:pt", N),
    }),
    (s, i) => value(Line.perpendicularFromPt(s.lines[i], s.pts[i])),
  );

  perItem(
    "Line.distanceFromPt",
    N,
    () => ({
      lines: fx.lines("op:line:dist", N),
      pts: fx.pts("op:line:dist:pt", N),
    }),
    (s, i) => Line.distanceFromPt(s.lines[i], s.pts[i]),
  );

  perItem(
    "Line.intersectRay2D",
    N,
    () => ({
      a: fx.lines("op:line:ray:a", N),
      b: fx.lines("op:line:ray:b", N),
    }),
    (s, i) => value(Line.intersectRay2D(s.a[i], s.b[i])),
  );

  perItem(
    "Line.intersectLine2D",
    N,
    () => ({
      a: fx.lines("op:line:seg:a", N),
      b: fx.lines("op:line:seg:b", N),
    }),
    (s, i) => value(Line.intersectLine2D(s.a[i], s.b[i])),
  );

  perItem(
    "Line.intersectLineWithRay2D",
    N,
    () => ({
      a: fx.lines("op:line:lwr:a", N),
      b: fx.lines("op:line:lwr:b", N),
    }),
    (s, i) => value(Line.intersectLineWithRay2D(s.a[i], s.b[i])),
  );

  perItem(
    "Line.intersectPolygon2D",
    SIZES.S,
    () => ({
      lines: fx.lines("op:line:poly", SIZES.S),
      poly: fx.polygon("op:line:poly:shape", POLY_SIDES, 80),
    }),
    (s, i) => value(Line.intersectPolygon2D(s.lines[i], s.poly)),
  );

  b.case("Line.intersectLines2D", {
    batch: SIZES.S * SIZES.S,
    setupOnce: () => ({
      a: fx.lines("op:line:lines2d:a", SIZES.S),
      b: fx.lines("op:line:lines2d:b", SIZES.S),
    }),
    run: ({ a, b: other }) => {
      sink(Line.intersectLines2D(a, other).length + 1);
    },
  });

  perItem(
    "Line.intersectGridWithRay2D",
    N,
    () => ({
      rays: fx.lines("op:line:grid:ray", N),
      pts: fx.pts("op:line:grid:pt", N),
    }),
    (s, i) => value(Line.intersectGridWithRay2D(s.rays[i], s.pts[i])),
  );

  perItem(
    "Line.intersectGridWithLine2D",
    N,
    () => ({
      lines: fx.lines("op:line:gridline", N),
      pts: fx.pts("op:line:gridline:pt", N),
    }),
    (s, i) => value(Line.intersectGridWithLine2D(s.lines[i], s.pts[i])),
  );

  perItem(
    "Line.intersectRect2D",
    N,
    () => ({
      lines: fx.lines("op:line:rect", N),
      rect: fx.rect("op:line:rect:shape", 120),
    }),
    (s, i) => value(Line.intersectRect2D(s.lines[i], s.rect)),
  );

  perItem(
    "Line.subpoints",
    SIZES.S,
    () => fx.lines("op:line:subpoints", SIZES.S),
    (lines, i) => Line.subpoints(lines[i], 16)[0][0],
  );

  perItem(
    "Line.crop",
    N,
    () => fx.lines("op:line:crop", N),
    (lines, i) => Line.crop(lines[i], [20, 20])[0],
  );

  perItem(
    "Line.marker",
    N,
    () => fx.lines("op:line:marker", N),
    (lines, i) => value(Line.marker(lines[i], [10, 10])),
  );

  perItem(
    "Line.toRect",
    N,
    () => fx.lines("op:line:toRect", N),
    (lines, i) => Line.toRect(lines[i])[0][0],
  );

  // ------------------------------------------------------------- Rectangle

  perItem(
    "Rectangle.fromTopLeft",
    N,
    () => fx.pts("op:rect:fromTopLeft", N),
    (pts, i) => Rectangle.fromTopLeft(pts[i], 40, 30)[1][0],
  );

  perItem(
    "Rectangle.fromCenter",
    N,
    () => fx.pts("op:rect:fromCenter", N),
    (pts, i) => Rectangle.fromCenter(pts[i], 40, 30)[1][0],
  );

  const rectReaders = [
    ["size", (rect) => Rectangle.size(rect)[0]],
    ["center", (rect) => Rectangle.center(rect)[0]],
    ["corners", (rect) => Rectangle.corners(rect)[0][0]],
    ["sides", (rect) => Rectangle.sides(rect)[0][0][0]],
    ["polygon", (rect) => Rectangle.polygon(rect)[0][0]],
    ["quadrants", (rect) => Rectangle.quadrants(rect)[0][0][0]],
    ["halves", (rect) => Rectangle.halves(rect)[0][0][0]],
    ["toCircle", (rect) => Rectangle.toCircle(rect)[0][0]],
    ["toSquare", (rect) => Rectangle.toSquare(rect)[0][0]],
  ];

  for (const [name, apply] of rectReaders) {
    perItem(
      `Rectangle.${name}`,
      N,
      () => fx.rects("op:rect:readers", N),
      (rects, i) => apply(rects[i]),
    );
  }

  perItem(
    "Rectangle.withinBound",
    N,
    () => ({
      rect: fx.rect("op:rect:within", 200),
      pts: fx.pts("op:rect:within:pt", N),
    }),
    (s, i) => (Rectangle.withinBound(s.rect, s.pts[i]) ? 1 : 0),
  );

  perItem(
    "Rectangle.hasIntersectRect2D",
    N,
    () => ({
      a: fx.rects("op:rect:hit:a", N, 80),
      b: fx.rects("op:rect:hit:b", N, 80),
    }),
    (s, i) => (Rectangle.hasIntersectRect2D(s.a[i], s.b[i]) ? 1 : 0),
  );

  perItem(
    "Rectangle.intersectRect2D",
    N,
    () => ({
      a: fx.rects("op:rect:ix:a", N, 120),
      b: fx.rects("op:rect:ix:b", N, 120),
    }),
    (s, i) => Rectangle.intersectRect2D(s.a[i], s.b[i]).length,
  );

  b.case("Rectangle.boundingBox", {
    batch: SIZES.S,
    setupOnce: () => fx.rects("op:rect:bbox", SIZES.S),
    // Sinks the result length rather than a coordinate: this function currently
    // returns NaN for every input, because it flattens its rectangles to Pts
    // and then indexes each Pt's numbers as if they were Pts. The work is still
    // performed and still worth measuring.
    run: (rects) => {
      sink(Rectangle.boundingBox(rects).length);
    },
  });

  // ---------------------------------------------------------------- Circle

  perItem(
    "Circle.fromCenter",
    N,
    () => fx.pts("op:circle:fromCenter", N),
    (pts, i) => Circle.fromCenter(pts[i], 30)[1][0],
  );

  perItem(
    "Circle.fromRect",
    N,
    () => fx.rects("op:circle:fromRect", N),
    (rects, i) => Circle.fromRect(rects[i])[1][0],
  );

  perItem(
    "Circle.fromTriangle",
    N,
    () => fx.triangles("op:circle:fromTriangle", N),
    (tris, i) => Circle.fromTriangle(tris[i])[1][0],
  );

  perItem(
    "Circle.withinBound",
    N,
    () => ({
      circle: fx.circle("op:circle:within", 100),
      pts: fx.pts("op:circle:within:pt", N),
    }),
    (s, i) => (Circle.withinBound(s.circle, s.pts[i]) ? 1 : 0),
  );

  perItem(
    "Circle.intersectRay2D",
    N,
    () => ({
      circle: fx.circle("op:circle:ray", 100),
      rays: fx.lines("op:circle:ray:line", N),
    }),
    (s, i) => value(Circle.intersectRay2D(s.circle, s.rays[i])),
  );

  perItem(
    "Circle.intersectLine2D",
    N,
    () => ({
      circle: fx.circle("op:circle:line", 100),
      lines: fx.lines("op:circle:line:seg", N),
    }),
    (s, i) => value(Circle.intersectLine2D(s.circle, s.lines[i])),
  );

  perItem(
    "Circle.intersectCircle2D",
    N,
    () => ({
      a: fx.circles("op:circle:cc:a", N, 60),
      b: fx.circles("op:circle:cc:b", N, 60),
    }),
    (s, i) => value(Circle.intersectCircle2D(s.a[i], s.b[i])),
  );

  perItem(
    "Circle.intersectRect2D",
    N,
    () => ({
      circles: fx.circles("op:circle:cr", N, 60),
      rect: fx.rect("op:circle:cr:rect", 150),
    }),
    (s, i) => value(Circle.intersectRect2D(s.circles[i], s.rect)),
  );

  perItem(
    "Circle.toRect",
    N,
    () => fx.circles("op:circle:toRect", N),
    (circles, i) => Circle.toRect(circles[i])[0][0],
  );

  perItem(
    "Circle.toTriangle",
    N,
    () => fx.circles("op:circle:toTriangle", N),
    (circles, i) => Circle.toTriangle(circles[i])[0][0],
  );

  // -------------------------------------------------------------- Triangle

  const triangleOps = [
    ["medial", (t) => Triangle.medial(t)[0][0]],
    ["orthocenter", (t) => Triangle.orthocenter(t)[0]],
    ["incenter", (t) => Triangle.incenter(t)[0]],
    ["incircle", (t) => Triangle.incircle(t)[0][0]],
    ["circumcenter", (t) => Triangle.circumcenter(t)[0]],
    ["circumcircle", (t) => Triangle.circumcircle(t)[0][0]],
    ["oppositeSide", (t) => Triangle.oppositeSide(t, 0)[0][0]],
    ["altitude", (t) => Triangle.altitude(t, 0)[0][0]],
  ];

  for (const [name, apply] of triangleOps) {
    perItem(
      `Triangle.${name}`,
      N,
      () => fx.triangles("op:triangle", N),
      (tris, i) => apply(tris[i]),
    );
  }

  perItem(
    "Triangle.fromCenter",
    N,
    () => fx.pts("op:triangle:fromCenter", N),
    (pts, i) => Triangle.fromCenter(pts[i], 30)[0][0],
  );

  perItem(
    "Triangle.fromRect",
    N,
    () => fx.rects("op:triangle:fromRect", N),
    (rects, i) => Triangle.fromRect(rects[i])[0][0],
  );

  perItem(
    "Triangle.fromCircle",
    N,
    () => fx.circles("op:triangle:fromCircle", N),
    (circles, i) => Triangle.fromCircle(circles[i])[0][0],
  );

  // --------------------------------------------------------------- Polygon

  const polygonReaders = [
    ["centroid", (poly) => Polygon.centroid(poly)[0]],
    ["lines", (poly) => Polygon.lines(poly).length],
    ["midpoints", (poly) => Polygon.midpoints(poly)[0][0]],
    ["adjacentSides", (poly) => Polygon.adjacentSides(poly, 1)[0][0][0]],
    ["bisector", (poly) => Polygon.bisector(poly, 1)[0]],
    ["perimeter", (poly) => Polygon.perimeter(poly).total],
    ["area", (poly) => Polygon.area(poly)],
    ["network", (poly) => Polygon.network(poly).length],
    ["toRects", (poly) => Polygon.toRects([poly])[0][0][0]],
  ];

  for (const [name, apply] of polygonReaders) {
    perItem(
      `Polygon.${name}`,
      SIZES.S,
      () => fx.polygons("op:polygon:readers", SIZES.S, POLY_SIDES),
      (polys, i) => apply(polys[i]),
    );
  }

  perItem(
    "Polygon.fromCenter",
    SIZES.S,
    () => fx.pts("op:polygon:fromCenter", SIZES.S),
    (pts, i) => Polygon.fromCenter(pts[i], 40, POLY_SIDES)[0][0],
  );

  perItem(
    "Polygon.nearestPt",
    SIZES.S,
    () => ({
      polys: fx.polygons("op:polygon:nearest", SIZES.S, POLY_SIDES),
      pts: fx.pts("op:polygon:nearest:pt", SIZES.S),
    }),
    (s, i) => Polygon.nearestPt(s.polys[i], s.pts[i]),
  );

  perItem(
    "Polygon.projectAxis",
    SIZES.S,
    () => ({
      polys: fx.polygons("op:polygon:project", SIZES.S, POLY_SIDES),
      axis: new Pt(0.6, 0.8),
    }),
    (s, i) => Polygon.projectAxis(s.polys[i], s.axis)[0],
  );

  perItem(
    "Polygon.hasIntersectPoint",
    N,
    () => ({
      poly: fx.polygon("op:polygon:hitPoint", POLY_SIDES, 120),
      pts: fx.pts("op:polygon:hitPoint:pt", N),
    }),
    (s, i) => (Polygon.hasIntersectPoint(s.poly, s.pts[i]) ? 1 : 0),
  );

  perItem(
    "Polygon.hasIntersectCircle",
    SIZES.S,
    () => ({
      polys: fx.polygons("op:polygon:hitCircle", SIZES.S, POLY_SIDES),
      circle: fx.circle("op:polygon:hitCircle:c", 80),
    }),
    (s, i) => value(Polygon.hasIntersectCircle(s.polys[i], s.circle), "dist"),
  );

  perItem(
    "Polygon.hasIntersectPolygon (SAT)",
    SIZES.S,
    () => ({
      a: fx.polygons("op:polygon:sat:a", SIZES.S, POLY_SIDES),
      b: fx.polygons("op:polygon:sat:b", SIZES.S, POLY_SIDES),
    }),
    (s, i) => value(Polygon.hasIntersectPolygon(s.a[i], s.b[i]), "dist"),
  );

  perItem(
    "Polygon.intersectPolygon2D",
    SIZES.S,
    () => ({
      a: fx.polygons("op:polygon:ix:a", SIZES.S, POLY_SIDES, 80),
      b: fx.polygons("op:polygon:ix:b", SIZES.S, POLY_SIDES, 80),
    }),
    (s, i) => Polygon.intersectPolygon2D(s.a[i], s.b[i]).length,
  );

  b.case("Polygon.convexHull", {
    batch: N,
    setupOnce: () => fx.group("op:polygon:hull", N),
    run: (g) => {
      sink(Polygon.convexHull(g).length);
    },
  });

  b.case("Polygon.convexHull (pre-sorted)", {
    batch: N,
    setupOnce: () =>
      Group.fromPtArray(
        fx.group("op:polygon:hull", N).sort((p, q) => p[0] - q[0]),
      ),
    run: (g) => {
      sink(Polygon.convexHull(g, true).length);
    },
  });

  // ----------------------------------------------------------------- Curve

  b.case("Curve.getSteps", {
    batch: CURVE_STEPS,
    run: () => {
      sink(Curve.getSteps(CURVE_STEPS).length);
    },
  });

  b.case("Curve.controlPoints", {
    batch: SIZES.S,
    setupOnce: () => fx.group("op:curve:controls", 4),
    run: (g) => {
      let acc = 0;
      for (let i = 0; i < SIZES.S; i++) acc += Curve.controlPoints(g)[0][0];
      sink(acc);
    },
  });

  const curves = [
    ["catmullRom", (pts, steps) => Curve.catmullRom(pts, steps)],
    ["cardinal", (pts, steps) => Curve.cardinal(pts, steps)],
    ["bezier", (pts, steps) => Curve.bezier(pts, steps)],
    ["bspline", (pts, steps) => Curve.bspline(pts, steps)],
  ];

  for (const [name, apply] of curves) {
    b.case(`Curve.${name}`, {
      batch: CURVE_POINTS * CURVE_STEPS,
      setupOnce: () => fx.group(`op:curve:${name}`, CURVE_POINTS),
      run: (g) => {
        sink(apply(g, CURVE_STEPS).length);
      },
    });
  }

  b.case("Curve.bspline (tension)", {
    batch: CURVE_POINTS * CURVE_STEPS,
    setupOnce: () => fx.group("op:curve:bspline-tension", CURVE_POINTS),
    run: (g) => {
      sink(Curve.bspline(g, CURVE_STEPS, 0.8).length);
    },
  });
});
