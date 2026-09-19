import { describe, expect, it, vi } from "vitest";
import { Circle, Curve, Line, Polygon, Rectangle, Triangle } from "../Op";
import { Num } from "../Num";
import { Group, Pt } from "../Pt";
import { Util } from "../Util";

function values(value: ArrayLike<number>) {
  return Array.from(value);
}

function groupValues(value: ArrayLike<ArrayLike<number>>) {
  return Array.from(value, values);
}

const line = (a: number[], b: number[]) => Group.fromArray([a, b]);
const rect = (a = [0, 0], b = [10, 10]) =>
  Rectangle.fromTopLeft(a, new Pt(b).subtract(a));

describe("Line", () => {
  it("constructs lines and calculates scalar properties", () => {
    const angled = Line.fromAngle([1, 2], 0, 5);
    expect(groupValues(angled)).toEqual([
      [1, 2],
      [6, 2],
    ]);
    expect(Line.slope([3, -2], [9, 2])).toBeCloseTo(2 / 3);
    expect(Line.slope([3, -2], [3, 2])).toBeUndefined();
    expect(Line.intercept([0, 1], [2, 5])).toEqual({
      slope: 2,
      yi: 1,
      xi: -0.5,
    });
    expect(Line.intercept([0, 1], [2, 1])).toEqual({
      slope: 0,
      yi: 1,
      xi: undefined,
    });
    expect(Line.intercept([1, 0], [1, 2])).toBeUndefined();
    expect(Line.sideOfPt2D(line([0, 0], [10, 0]), [5, 2])).toBe(20);
    expect(Line.collinear([0, 0], [1, 1], [2, 2])).toBe(true);
    expect(Line.collinear([0, 0], [1, 1], [2, 30])).toBe(false);
    expect(Line.magnitude(line([0, 0], [3, 4]))).toBe(5);
    expect(Line.magnitudeSq(line([0, 0], [3, 4]))).toBe(25);
    expect(Line.magnitude(new Group(new Pt()))).toBe(0);
    expect(Line.magnitudeSq(new Group(new Pt()))).toBe(0);
  });

  it("projects points and calculates distance including degenerate lines", () => {
    const horizontal = line([0, 0], [10, 0]);
    expect(values(Line.perpendicularFromPt(horizontal, [3, 4])!)).toEqual([
      3, 0,
    ]);
    expect(values(Line.perpendicularFromPt(horizontal, [3, 4], true)!)).toEqual(
      [0, -4],
    );
    expect(Line.distanceFromPt(horizontal, [3, 4])).toBe(4);
    const pointLine = line([1, 1], [1, 1]);
    expect(Line.perpendicularFromPt(pointLine, [4, 5])).toBeUndefined();
    expect(Line.distanceFromPt(pointLine, [4, 5])).toBe(5);
  });

  it("intersects rays through vertical, parallel, coincident, and crossing paths", () => {
    expect(
      values(
        Line.intersectRay2D(line([0, 0], [0, 10]), line([-5, 5], [5, 5]))!,
      ),
    ).toEqual([0, 5]);
    expect(
      values(
        Line.intersectRay2D(line([-5, 5], [5, 5]), line([0, 0], [0, 10]))!,
      ),
    ).toEqual([0, 5]);
    expect(
      Line.intersectRay2D(line([0, 0], [0, 10]), line([2, 0], [2, 10])),
    ).toBeUndefined();
    expect(
      Line.intersectRay2D(line([0, 0], [10, 10]), line([0, 1], [10, 11])),
    ).toBeUndefined();
    expect(
      values(
        Line.intersectRay2D(line([0, 0], [10, 10]), line([2, 2], [8, 8]))!,
      ),
    ).toEqual([0, 0]);
    expect(
      values(
        Line.intersectRay2D(line([0, 0], [10, 10]), line([0, 10], [10, 0]))!,
      ),
    ).toEqual([5, 5]);
  });

  it("limits intersections to segments or one segment plus a ray", () => {
    const crossingA = line([0, 0], [10, 10]);
    const crossingB = line([0, 10], [10, 0]);
    expect(values(Line.intersectLine2D(crossingA, crossingB)!)).toEqual([5, 5]);
    expect(
      Line.intersectLine2D(line([0, 0], [1, 1]), crossingB),
    ).toBeUndefined();
    expect(values(Line.intersectLineWithRay2D(crossingA, crossingB)!)).toEqual([
      5, 5,
    ]);
    expect(
      Line.intersectLineWithRay2D(line([0, 0], [1, 1]), crossingB),
    ).toBeUndefined();
  });

  it("intersects polygons, line collections, grids, and rectangles", () => {
    const square = Rectangle.corners(rect());
    const crossing = line([-5, 5], [15, 5]);
    expect(Line.intersectPolygon2D(crossing, square)).toHaveLength(2);
    expect(
      Line.intersectPolygon2D(line([-5, 20], [15, 20]), square),
    ).toBeUndefined();
    expect(
      Line.intersectPolygon2D(line([5, 5], [6, 5]), square, true),
    ).toHaveLength(2);
    expect(
      Line.intersectLines2D([crossing], Rectangle.sides(rect())),
    ).toHaveLength(2);
    expect(
      Line.intersectLines2D(
        [line([5, 5], [6, 5])],
        Rectangle.sides(rect()),
        true,
      ),
    ).toHaveLength(0);
    expect(
      Line.intersectGridWithRay2D(line([1, 1], [3, 2]), [0, 0]),
    ).toHaveLength(2);
    expect(
      Line.intersectGridWithRay2D(line([0, 0], [0, 2]), [0, 0]),
    ).toHaveLength(0);
    expect(
      Line.intersectGridWithLine2D(line([1, 1], [3, 2]), [0, 0]).length,
    ).toBeLessThanOrEqual(2);
    expect(Line.intersectRect2D(crossing, rect())).toHaveLength(2);
    expect(Line.intersectRect2D(line([20, 20], [30, 30]), rect())).toHaveLength(
      0,
    );
  });

  it("creates subpoints, cropped endpoints, markers, and rectangles", () => {
    expect(groupValues(Line.subpoints(line([0, 0], [9, 9]), 2))).toEqual([
      [3, 3],
      [6, 6],
    ]);
    const horizontal = line([0, 0], [10, 0]);
    expect(values(Line.crop(horizontal, [2, 3], 0, true)!)).toEqual([3, 0]);
    expect(values(Line.crop(line([0, 0], [0, 10]), [2, 3])!)).toEqual([0, 3]);
    expect(Line.crop(horizontal, [4, 4], 0, false)).toBeTruthy();
    expect(Line.crop(line([0, 0], [1, 10]), [4, 4], 1, false)).toBeTruthy();
    expect(Line.marker(horizontal, [2, 3], "arrow", true)).toHaveLength(3);
    expect(Line.marker(horizontal, [2, 3], "line", false)).toHaveLength(2);
    expect(Line.marker(line([1, 1], [1, 1]), [2, 3])).toHaveLength(0);
    expect(groupValues(Line.toRect(line([10, 2], [1, 8])))).toEqual([
      [1, 2],
      [10, 8],
    ]);
  });
});

describe("Rectangle", () => {
  it("constructs rectangles from top-left and center anchors", () => {
    expect(groupValues(Rectangle.from([1, 2], 4))).toEqual([
      [1, 2],
      [5, 6],
    ]);
    expect(groupValues(Rectangle.fromTopLeft([1, 2], 4, 6))).toEqual([
      [1, 2],
      [5, 8],
    ]);
    expect(groupValues(Rectangle.fromTopLeft([1, 2], [4, 6]))).toEqual([
      [1, 2],
      [5, 8],
    ]);
    expect(groupValues(Rectangle.fromCenter([5, 5], 4, 6))).toEqual([
      [3, 2],
      [7, 8],
    ]);
    expect(groupValues(Rectangle.fromCenter([5, 5], [4, 6]))).toEqual([
      [3, 2],
      [7, 8],
    ]);
  });

  it("derives circle/square, size, center, corners, sides, and polygon", () => {
    const rectangle = rect([0, 0], [20, 10]);
    expect(Rectangle.toCircle(rectangle, true)).toHaveLength(2);
    expect(Rectangle.toCircle(rectangle, false)).toHaveLength(2);
    expect(groupValues(Rectangle.toSquare(rectangle))).toEqual([
      [5, 0],
      [15, 10],
    ]);
    expect(groupValues(Rectangle.toSquare(rectangle, true))).toEqual([
      [0, -5],
      [20, 15],
    ]);
    expect(values(Rectangle.size(rectangle))).toEqual([20, 10]);
    expect(values(Rectangle.center(rectangle))).toEqual([10, 5]);
    expect(Rectangle.corners(rectangle)).toHaveLength(4);
    expect(Rectangle.sides(rectangle)).toHaveLength(4);
    expect(Rectangle.polygon(rectangle)).toHaveLength(4);
  });

  it("bounds many rectangles and subdivides quadrants and halves", () => {
    const first = rect([0, 0], [10, 10]);
    const second = rect([-5, 5], [20, 15]);
    expect(groupValues(Rectangle.boundingBox([first, second]))).toEqual([
      [-5, 0],
      [20, 15],
    ]);
    expect(Rectangle.quadrants(first)).toHaveLength(4);
    expect(Rectangle.quadrants(first, [2, 3])).toHaveLength(4);
    expect(Rectangle.halves(first, 0)).toHaveLength(2);
    expect(Rectangle.halves(first, 0.25, true)).toHaveLength(2);
  });

  it("bounds rectangles that lie entirely in negative space", () => {
    const bounds = Rectangle.boundingBox([
      rect([-40, -30], [-20, -10]),
      rect([-15, -25], [-5, -5]),
    ]);
    expect(groupValues(bounds)).toEqual([
      [-40, -30],
      [-5, -5],
    ]);
  });

  it("returns an empty group when there is nothing to bound", () => {
    expect(Rectangle.boundingBox([])).toHaveLength(0);
  });

  it("checks points and rectangle intersections", () => {
    const first = rect();
    expect(Rectangle.withinBound(first, [0, 0])).toBe(true);
    expect(Rectangle.withinBound(first, [10, 10])).toBe(true);
    expect(Rectangle.withinBound(first, [11, 5])).toBe(false);
    expect(Rectangle.hasIntersectRect2D(first, rect([5, 5], [15, 15]))).toBe(
      true,
    );
    expect(Rectangle.hasIntersectRect2D(first, rect([20, 20], [30, 30]))).toBe(
      false,
    );
    expect(
      groupValues(Rectangle.intersectRect2D(first, rect([5, 5], [15, 15]))),
    ).toEqual([
      [10, 5],
      [5, 10],
    ]);
    expect(
      Rectangle.intersectRect2D(first, rect([20, 20], [30, 30])),
    ).toHaveLength(0);
  });
});

describe("Circle", () => {
  it("moves the center without changing the encoded radius", () => {
    const circle = Circle.fromCenter([10, 10], 5);
    circle[0].to(20, 20);
    expect(groupValues(circle)).toEqual([
      [20, 20],
      [5, 5],
    ]);
    circle[0].add(3, -2);
    expect(groupValues(circle)).toEqual([
      [23, 18],
      [5, 5],
    ]);
    // Group transforms remain generic: both stored Pts are translated.
    const wholeGroup = Circle.fromCenter([10, 10], 5).moveTo(20, 20);
    expect(groupValues(wholeGroup)).toEqual([
      [20, 20],
      [15, 15],
    ]);
  });

  it("constructs circles from rectangles, triangles, and centers", () => {
    const rectangle = rect([0, 0], [20, 10]);
    expect(values(Circle.fromRect(rectangle, false)[1])).toEqual([5, 5]);
    expect(Circle.fromRect(rectangle, true)[1].x).toBeCloseTo(Math.sqrt(125));
    const triangle = Group.fromArray([
      [0, 0],
      [10, 0],
      [0, 10],
    ]);
    expect(Circle.fromTriangle(triangle, false)).toHaveLength(2);
    expect(Circle.fromTriangle(triangle, true)).toHaveLength(2);
    expect(groupValues(Circle.fromCenter([2, 3], 4))).toEqual([
      [2, 3],
      [4, 4],
    ]);
  });

  it("checks point containment", () => {
    const circle = Circle.fromCenter([0, 0], 5);
    expect(Circle.withinBound(circle, [3, 3])).toBe(true);
    expect(Circle.withinBound(circle, [3, 4])).toBe(false);
    expect(Circle.withinBound(circle, [6, 0])).toBe(false);
    expect(Circle.withinBound(circle, [0, 0], 1)).toBe(true);
  });

  it("intersects rays and line segments through tangent, secant, and miss cases", () => {
    const circle = Circle.fromCenter([0, 0], 5);
    expect(Circle.intersectRay2D(circle, line([-10, 0], [10, 0]))).toHaveLength(
      2,
    );
    expect(Circle.intersectRay2D(circle, line([-10, 5], [10, 5]))).toHaveLength(
      1,
    );
    expect(Circle.intersectRay2D(circle, line([-10, 6], [10, 6]))).toHaveLength(
      0,
    );
    expect(
      Circle.intersectLine2D(circle, line([-10, 0], [10, 0])),
    ).toHaveLength(2);
    expect(Circle.intersectLine2D(circle, line([10, 0], [20, 0]))).toHaveLength(
      0,
    );
  });

  it("intersects disjoint, tangent, overlapping, contained, and coincident circles", () => {
    const circle = Circle.fromCenter([0, 0], 5);
    expect(
      Circle.intersectCircle2D(circle, Circle.fromCenter([20, 0], 5)),
    ).toHaveLength(0);
    expect(
      Circle.intersectCircle2D(circle, Circle.fromCenter([10, 0], 5)),
    ).toHaveLength(2);
    expect(
      Circle.intersectCircle2D(circle, Circle.fromCenter([6, 0], 5)),
    ).toHaveLength(2);
    expect(
      Circle.intersectCircle2D(circle, Circle.fromCenter([1, 0], 1)),
    ).toHaveLength(1);
    // coincident circles have no discrete intersection points
    expect(
      Circle.intersectCircle2D(circle, Circle.fromCenter([0, 0], 5)),
    ).toHaveLength(0);
  });

  it("intersects rectangles and converts to rectangles and triangles", () => {
    const circle = Circle.fromCenter([5, 5], 5);
    expect(Circle.intersectRect2D(circle, rect())).not.toBeNull();
    expect(
      Circle.intersectRect2D(circle, rect([20, 20], [30, 30])),
    ).toHaveLength(0);
    expect(Circle.toRect(circle)).toHaveLength(2);
    expect(Circle.toRect(circle, true)).toHaveLength(2);
    expect(Circle.toTriangle(circle)).toHaveLength(3);
    expect(Circle.toTriangle(circle, false)).toHaveLength(3);
  });
});

describe("Triangle", () => {
  const triangle = Group.fromArray([
    [0, 0],
    [10, 0],
    [0, 10],
  ]);

  it("constructs triangles and derives medial/opposite/altitude lines", () => {
    expect(Triangle.fromRect(rect())).toHaveLength(3);
    expect(Triangle.fromCircle(Circle.fromCenter([0, 0], 5))).toHaveLength(3);
    expect(Triangle.fromCenter([0, 0], 10)).toHaveLength(3);
    expect(Triangle.medial(triangle)).toHaveLength(3);
    expect(Triangle.oppositeSide(triangle, 0)).toHaveLength(2);
    expect(Triangle.oppositeSide(triangle, 9)).toHaveLength(2);
    expect(Triangle.altitude(triangle, 0)).toHaveLength(2);
    expect(Triangle.altitude(triangle, 9)?.[0]).toBeUndefined();
  });

  it("calculates centers and inscribed/circumscribed circles", () => {
    expect(values(Triangle.orthocenter(triangle)!)).toEqual([0, 0]);
    expect(Triangle.incenter(triangle)).toBeInstanceOf(Pt);
    expect(Triangle.incircle(triangle)).toHaveLength(2);
    expect(Triangle.incircle(triangle, new Pt(2, 2))).toHaveLength(2);
    expect(values(Triangle.circumcenter(triangle)!)).toEqual([5, 5]);
    expect(Triangle.circumcircle(triangle)).toHaveLength(2);
    expect(Triangle.circumcircle(triangle, new Pt(5, 5))).toHaveLength(2);
  });
});

describe("Polygon", () => {
  const square = () => Rectangle.corners(rect());

  it("constructs polygons and derives lines, sides, midpoints, and bisectors", () => {
    expect(values(Polygon.centroid(square()))).toEqual([5, 5]);
    expect(Polygon.rectangle([5, 5], 10, 20)).toHaveLength(4);
    expect(Polygon.rectangle([5, 5], [10, 20])).toHaveLength(4);
    expect(Polygon.fromCenter([0, 0], 5, 6)).toHaveLength(6);
    expect(Polygon.lineAt(square(), 0)).toHaveLength(2);
    expect(() => Polygon.lineAt(square(), -1)).toThrow(
      "out of the Polygon's range",
    );
    expect(Polygon.lines(square(), true)).toHaveLength(4);
    expect(Polygon.lines(square(), false)).toHaveLength(3);
    expect(Polygon.midpoints(square(), true)).toHaveLength(4);
    expect(Polygon.midpoints(square(), false, 0.25)).toHaveLength(3);
    expect(Polygon.adjacentSides(square(), 0)).toHaveLength(1);
    expect(Polygon.adjacentSides(square(), 1)).toHaveLength(2);
    expect(Polygon.adjacentSides(square(), 99)).toHaveLength(0);
    expect(Polygon.bisector(square(), 0)).toBeInstanceOf(Pt);
  });

  it("calculates perimeter and signed area", () => {
    expect(Polygon.perimeter(square(), true).total).toBe(40);
    expect(Polygon.perimeter(square(), false).segments).toHaveLength(3);
    expect(Polygon.area(square())).toBe(100);
    expect(
      Polygon.area(
        Group.fromArray([
          [0, 0],
          [0, 10],
          [10, 10],
          [10, 0],
        ]),
      ),
    ).toBe(100);
  });

  it("builds convex hulls and networks and finds nearest points", () => {
    const points = Group.fromArray([
      [0, 0],
      [10, 0],
      [10, 10],
      [0, 10],
      [5, 5],
      [3, 4],
    ]);
    expect(Polygon.convexHull(points)).toHaveLength(4);
    expect(
      Polygon.convexHull(points.clone().sortByDimension(0), true),
    ).toHaveLength(4);
    expect(
      Polygon.convexHull(
        Group.fromArray([
          [0, 0],
          [1, 1],
        ]),
      ),
    ).toHaveLength(0);
    expect(Polygon.network(square(), 1)).toHaveLength(3);
    expect(Polygon.nearestPt(square(), [9, 9])).toBe(2);
    expect(Polygon.nearestPt(new Group(), [0, 0])).toBe(-1);
    expect(values(Polygon.projectAxis(square(), new Pt(1, 0)))).toEqual([
      0, 10,
    ]);
  });

  it("checks points, circle SAT, and polygon SAT", () => {
    expect(Polygon.hasIntersectPoint(square(), [5, 5])).toBe(true);
    expect(Polygon.hasIntersectPoint(square(), [15, 5])).toBe(false);
    expect(
      Polygon.hasIntersectCircle(square(), Circle.fromCenter([10, 5], 3)),
    ).toBeTruthy();
    expect(
      Polygon.hasIntersectCircle(square(), Circle.fromCenter([30, 5], 3)),
    ).toBeNull();
    // a circle past a vertex, inside every edge normal's projection but
    // farther than its radius from the polygon: the vertex axis separates it
    const wedge = Group.fromArray([
      [2.88, 1.26],
      [-1.2, 4.69],
      [-1.09, -1.28],
    ]);
    expect(
      Polygon.hasIntersectCircle(wedge, Circle.fromCenter([6.16, -0.69], 3.52)),
    ).toBeNull();
    expect(
      Polygon.hasIntersectCircle(wedge, Circle.fromCenter([6.16, -0.69], 3.9)),
    ).toBeTruthy();
    expect(
      Polygon.hasIntersectPolygon(
        square(),
        Rectangle.corners(rect([5, 5], [15, 15])),
      ),
    ).toBeTruthy();
    expect(
      Polygon.hasIntersectPolygon(
        square(),
        Rectangle.corners(rect([20, 20], [30, 30])),
      ),
    ).toBeNull();
  });

  it("finds polygon intersections and creates individual and merged boxes", () => {
    const first = square();
    const second = Rectangle.corners(rect([5, 5], [15, 15]));
    expect(Polygon.intersectPolygon2D(first, second)).not.toHaveLength(0);
    const boxes = Polygon.toRects([first, second]);
    expect(boxes).toHaveLength(3);
    expect(groupValues(boxes[0])).toEqual([
      [0, 0],
      [15, 15],
    ]);
    expect(Polygon.toRects(new Set([first]))).toHaveLength(2);
  });
});

describe("Curve", () => {
  const controls = () =>
    Group.fromArray([
      [0, 0, 0],
      [10, 10, 1],
      [20, -10, 2],
      [30, 0, 3],
      [40, 10, 4],
      [50, 0, 5],
      [60, 5, 6],
    ]);

  it("generates coefficients and control point windows", () => {
    expect(Curve.getSteps(4)).toHaveLength(5);
    expect(values(Curve.getSteps(2)[1])).toEqual([0.125, 0.25, 0.5, 1]);
    expect(Curve.controlPoints(controls(), 0)).toHaveLength(4);
    const points = controls();
    expect(Curve.controlPoints(points, 0, true)[1]).toBe(points[0]);
    expect(Curve.controlPoints(controls(), 99)).toHaveLength(0);
    expect(
      values(
        Curve._calcPt(
          Group.fromArray([
            [1, 2, 3],
            [4, 5, 6],
          ]),
          [0.25, 0.75],
        ),
      ),
    ).toEqual([3.25, 4.25, 5.25]);
  });

  it("creates Catmull-Rom and Cardinal curves and direct steps", () => {
    expect(Curve.catmullRom(new Group(new Pt()), 3)).toHaveLength(0);
    expect(Curve.cardinal(new Group(new Pt()), 3)).toHaveLength(0);
    expect(Curve.catmullRom(controls(), 3).length).toBeGreaterThan(4);
    expect(Curve.cardinal(controls(), 3, 0.75).length).toBeGreaterThan(4);
    const step = Curve.getSteps(2)[1];
    const control = Curve.controlPoints(controls(), 0);
    expect(Curve.catmullRomStep(step, control)).toHaveLength(3);
    expect(Curve.cardinalStep(step, control, 0.75)).toHaveLength(3);
  });

  it("creates Bezier curves and direct steps", () => {
    expect(
      Curve.bezier(
        Group.fromArray([
          [0, 0],
          [1, 1],
          [2, 2],
        ]),
      ),
    ).toHaveLength(0);
    expect(Curve.bezier(controls(), 3)).toHaveLength(8);
    expect(
      Curve.bezierStep(
        Curve.getSteps(2)[1],
        Curve.controlPoints(controls(), 0),
      ),
    ).toHaveLength(3);
  });

  it("creates regular and tensioned B-splines and direct steps", () => {
    expect(Curve.bspline(new Group(new Pt()), 3)).toHaveLength(0);
    expect(Curve.bspline(controls(), 3, 1).length).toBeGreaterThan(0);
    expect(Curve.bspline(controls(), 3, 0.5).length).toBeGreaterThan(0);
    const step = Curve.getSteps(2)[1];
    const control = Curve.controlPoints(controls(), 0);
    expect(Curve.bsplineStep(step, control)).toHaveLength(3);
    expect(Curve.bsplineTensionStep(step, control, 0.5)).toHaveLength(3);
  });

  it("uses warning policies for invalid polygon indices without throwing", () => {
    const warning = vi
      .spyOn(Util, "warn")
      .mockImplementation((_, fallback) => fallback);
    expect(Polygon.adjacentSides(Rectangle.corners(rect()), 999)).toHaveLength(
      0,
    );
    expect(warning).toHaveBeenCalled();
  });
});

describe("Curve fast paths match the step-function reference", () => {
  function seededPath(count: number, seed = 4242) {
    let a = seed;
    const rand = () => {
      a = (a * 16807) % 2147483647;
      return a / 2147483647;
    };
    const g = new Group();
    for (let i = 0; i < count; i++) g.push(new Pt(rand() * 200, rand() * 200));
    return g;
  }

  function referenceChain(
    pts: Group,
    steps: number,
    stepFn: (step: Pt, c: Group) => Pt,
  ): Group {
    // the retained public *Step functions are the old machinery; use them to
    // compute the expected values for the table-driven implementations
    const ts = Curve.getSteps(steps);
    const out = new Group();
    const first = Curve.controlPoints(pts, 0, true);
    for (let i = 0; i <= steps; i++) out.push(stepFn(ts[i], first));
    let k = 0;
    while (k < pts.length - 2) {
      const cp = Curve.controlPoints(pts, k);
      if (cp.length > 0) {
        for (let i = 0; i <= steps; i++) out.push(stepFn(ts[i], cp));
        k++;
      }
    }
    return out;
  }

  function expectClose(actual: Group, expected: Group) {
    expect(actual.length).toBe(expected.length);
    for (let i = 0; i < actual.length; i++) {
      expect(actual[i][0]).toBeCloseTo(expected[i][0], 3);
      expect(actual[i][1]).toBeCloseTo(expected[i][1], 3);
    }
  }

  it("catmullRom matches catmullRomStep", () => {
    const pts = seededPath(12);
    expectClose(
      Curve.catmullRom(pts, 7) as Group,
      referenceChain(pts, 7, (s, c) => Curve.catmullRomStep(s, c)),
    );
  });

  it("cardinal matches cardinalStep with tension", () => {
    const pts = seededPath(12, 99);
    expectClose(
      Curve.cardinal(pts, 7, 0.75) as Group,
      referenceChain(pts, 7, (s, c) => Curve.cardinalStep(s, c, 0.75)),
    );
  });

  it("bspline matches bsplineStep and bsplineTensionStep", () => {
    const pts = seededPath(12, 7);
    const steps = 6;
    const ts = Curve.getSteps(steps);
    const plain = new Group();
    const tensioned = new Group();
    let k = 0;
    while (k < pts.length - 3) {
      const c = Curve.controlPoints(pts, k);
      for (let i = 0; i <= steps; i++) {
        plain.push(Curve.bsplineStep(ts[i], c));
        tensioned.push(Curve.bsplineTensionStep(ts[i], c, 0.4));
      }
      k++;
    }
    expectClose(Curve.bspline(pts, steps) as Group, plain);
    expectClose(Curve.bspline(pts, steps, 0.4) as Group, tensioned);
  });

  it("bezier matches bezierStep", () => {
    const pts = seededPath(13, 55); // 13 points = 4 bezier segments
    const steps = 5;
    const ts = Curve.getSteps(steps);
    const expected = new Group();
    let k = 0;
    while (k < pts.length - 3) {
      const c = Curve.controlPoints(pts, k);
      for (let i = 0; i <= steps; i++)
        expected.push(Curve.bezierStep(ts[i], c));
      k += 3;
    }
    expectClose(Curve.bezier(pts, steps) as Group, expected);
  });

  it("supports 3D points and plain-array input", () => {
    const pts3d = Group.fromArray([
      [0, 0, 0],
      [10, 5, 2],
      [20, 0, 6],
      [30, 8, 1],
      [40, 2, 4],
    ]);
    const curve3d = Curve.catmullRom(pts3d, 4);
    expect(curve3d[0].length).toBe(3);
    expect(Number.isFinite(curve3d[8][2])).toBe(true);

    // plain arrays used to produce NaN through the .x/.y accessors; the
    // indexed fast path handles them correctly
    const arrays = [
      [0, 0],
      [10, 5],
      [20, 0],
      [30, 8],
    ];
    const curve = Curve.catmullRom(arrays, 4);
    expect(curve.length).toBeGreaterThan(0);
    expect(
      curve.every((p) => Number.isFinite(p[0]) && Number.isFinite(p[1])),
    ).toBe(true);
  });
});

describe("Geometry correctness pins", () => {
  const square = () =>
    Group.fromArray([
      [0, 0],
      [10, 0],
      [10, 10],
      [0, 10],
    ]);

  it("returns the maximal inscribed square from Circle.toRect", () => {
    const inner = Circle.toRect(Circle.fromCenter([0, 0], 10), true);
    const half = 10 / Math.SQRT2;
    expect(inner[1][0]).toBeCloseTo(half, 4);
    expect(inner[0][0]).toBeCloseTo(-half, 4);
    // corners land on the circle
    expect(Math.hypot(inner[1][0], inner[1][1])).toBeCloseTo(10, 4);
  });

  it("handles degenerate circle intersections without NaN", () => {
    const c = Circle.fromCenter([0, 0], 5);
    expect(
      Circle.intersectCircle2D(c, Circle.fromCenter([0, 0], 5)),
    ).toHaveLength(0);
    const enclosed = Circle.intersectCircle2D(c, Circle.fromCenter([1, 0], 1));
    expect(enclosed).toHaveLength(1); // legacy enclosed-marker behavior kept
    expect(Circle.intersectRay2D(c, line([1, 1], [1, 1]))).toHaveLength(0);
  });

  it("includes grid intersections that pass exactly through the grid point", () => {
    const through = Line.intersectGridWithRay2D(line([-5, -5], [5, 5]), [0, 0]);
    expect(through.length).toBeGreaterThan(0);
    for (const p of through) expect(values(p)).toEqual([0, 0]);
  });

  it("returns real Groups from Polygon.lines, midpoints, and Triangle.medial", () => {
    const tri = Group.fromArray([
      [0, 0],
      [10, 0],
      [5, 10],
    ]);
    const lines = Polygon.lines(tri);
    expect(lines).toHaveLength(3);
    for (const l of lines) expect(l instanceof Group).toBe(true);
    const mids = Polygon.midpoints(tri, true);
    expect(mids instanceof Group).toBe(true);
    expect(Triangle.medial(tri) instanceof Group).toBe(true);
  });

  it("judges collinearity scale-independently", () => {
    expect(Line.collinear([0, 0], [1, 0], [0.5, 0.4])).toBe(false);
    expect(Line.collinear([0, 0], [1000, 1000], [2000, 2000])).toBe(true);
    expect(Line.collinear([0, 0], [0.001, 0.001], [0.002, 0.002])).toBe(true);
    expect(Line.collinear([1, 1], [1, 1], [5, 5])).toBe(true); // coincident
  });

  it("respects explicit zero height in rectangle constructors", () => {
    expect(groupValues(Rectangle.fromTopLeft([0, 0], 10, 0))).toEqual([
      [0, 0],
      [10, 0],
    ]);
    expect(groupValues(Rectangle.fromCenter([5, 5], 10, 0))).toEqual([
      [0, 5],
      [10, 5],
    ]);
  });

  it("returns undefined for degenerate triangle centers", () => {
    const degenerate = Group.fromArray([
      [0, 0],
      [5, 5],
      [10, 10],
    ]);
    expect(Triangle.circumcenter(degenerate)).toBeUndefined();
    expect(Triangle.orthocenter(degenerate)).toBeUndefined();
    expect(Triangle.circumcircle(degenerate)).toBeUndefined();
  });

  it("keeps ray intersection contract on the parametric form", () => {
    // coincident lines return the first line's start point
    expect(
      values(
        Line.intersectRay2D(line([3, 3], [10, 10]), line([2, 2], [8, 8]))!,
      ),
    ).toEqual([3, 3]);
    // near-vertical stays finite and accurate
    const ix = Line.intersectRay2D(
      line([100, 0], [100.0001, 1000]),
      line([0, 500], [1000, 500]),
    );
    expect(ix![0]).toBeCloseTo(100.00005, 3);
    expect(ix![1]).toBeCloseTo(500, 6);
  });

  it("keeps point-in-polygon results for hit testing", () => {
    expect(Polygon.hasIntersectPoint(square(), [5, 5])).toBe(true);
    expect(Polygon.hasIntersectPoint(square(), [15, 5])).toBe(false);
    expect(Polygon.hasIntersectPoint(square(), [-0.1, 5])).toBe(false);
  });

  it("computes perimeter totals and segments", () => {
    const tri = Group.fromArray([
      [0, 0],
      [3, 0],
      [3, 4],
    ]);
    const open = Polygon.perimeter(tri);
    expect(open.total).toBeCloseTo(7);
    expect(values(open.segments)).toEqual([3, 4]);
    const closed = Polygon.perimeter(tri, true);
    expect(closed.total).toBeCloseTo(12);
    expect(values(closed.segments)).toEqual([3, 4, 5]);
  });

  it("keeps single-step curve functions consistent with batch curves", () => {
    const g4 = Group.fromArray([
      [0, 0],
      [4, 8],
      [9, 2],
      [12, 6],
    ]);
    const t = 0.3;
    const step = new Pt(t * t * t, t * t, t, 1);

    const bz = Curve.bezierStep(step, g4);
    expect(values(Curve.bezier(g4, 10)[3])).toEqual(
      values(bz).map((v) => expect.closeTo(v, 5)) as unknown as number[],
    );

    const cmCtrl = Curve.controlPoints(g4, 0, true);
    const cm = Curve.catmullRomStep(step, cmCtrl);
    const cmBatch = Curve.catmullRom(g4, 10)[3];
    expect(cmBatch[0]).toBeCloseTo(cm[0], 5);
    expect(cmBatch[1]).toBeCloseTo(cm[1], 5);

    const cd = Curve.cardinalStep(step, cmCtrl, 0.5);
    const cdBatch = Curve.cardinal(g4, 10)[3];
    expect(cdBatch[0]).toBeCloseTo(cd[0], 5);
    expect(cdBatch[1]).toBeCloseTo(cd[1], 5);

    const bs = Curve.bsplineStep(step, g4);
    const bsBatch = Curve.bspline(g4, 10)[3];
    expect(bsBatch[0]).toBeCloseTo(bs[0], 5);
    expect(bsBatch[1]).toBeCloseTo(bs[1], 5);

    const bst = Curve.bsplineTensionStep(step, g4, 0.8);
    const bstBatch = Curve.bspline(g4, 10, 0.8)[3];
    expect(bstBatch[0]).toBeCloseTo(bst[0], 5);
    expect(bstBatch[1]).toBeCloseTo(bst[1], 5);
  });
});

function seededPath(n: number, seed: number = 1): Group {
  Num.seed(`bezier-${seed}`);
  const g = new Group();
  for (let i = 0; i < n; i++) {
    g.push(new Pt(i * 50 + Num.random() * 30, 100 + Num.random() * 200));
  }
  return g;
}

function expectClose(actual: Group, expected: Group, digits = 3) {
  expect(actual.length).toBe(expected.length);
  for (let i = 0; i < actual.length; i++) {
    expect(actual[i].length).toBe(expected[i].length);
    for (let k = 0; k < expected[i].length; k++) {
      expect(actual[i][k]).toBeCloseTo(expected[i][k], digits);
    }
  }
}

describe("Curve to Bezier conversions", () => {
  it("accepts generators for all conversions without mutating their points", () => {
    const pts = seededPath(7);
    const original = pts.clone();
    for (const convert of [
      Curve.cardinalToBezier,
      Curve.bsplineToBezier,
      Curve.bezierToCardinal,
      Curve.bezierToBspline,
    ]) {
      function* points() {
        yield* pts;
      }
      expectClose(convert(points()), convert(pts));
      expectClose(pts, original);
    }
  });
  // Barry-Goldman pyramid: the reference definition of a non-uniform Catmull-Rom segment
  function barryGoldman(
    P: ArrayLike<number>[],
    T: number[],
    u: number,
  ): number[] {
    const lerp = (
      a: ArrayLike<number>,
      b: ArrayLike<number>,
      ta: number,
      tb: number,
    ) =>
      Array.from(
        { length: a.length },
        (_, k) => ((tb - u) * a[k] + (u - ta) * b[k]) / (tb - ta),
      );
    const a1 = lerp(P[0], P[1], T[0], T[1]);
    const a2 = lerp(P[1], P[2], T[1], T[2]);
    const a3 = lerp(P[2], P[3], T[2], T[3]);
    return lerp(lerp(a1, a2, T[0], T[2]), lerp(a2, a3, T[1], T[3]), T[1], T[2]);
  }

  it("cardinalToBezier traces the curve that cardinal samples, for any tension and size", () => {
    for (const tension of [0.2, 0.5, 0.8, 1]) {
      for (const n of [2, 3, 5, 12]) {
        const pts = seededPath(n, n);
        const ctrls = Curve.cardinalToBezier(pts, tension);
        expect(ctrls).toHaveLength(3 * (n - 1) + 1);
        expectClose(Curve.bezier(ctrls, 10), Curve.cardinal(pts, 10, tension));
      }
    }
  });

  it("cardinalToBezier defaults to Catmull-Rom and keeps the anchors in place", () => {
    const pts = seededPath(9, 2);
    const ctrls = Curve.cardinalToBezier(pts);
    expectClose(Curve.bezier(ctrls, 8), Curve.catmullRom(pts, 8));
    for (let i = 0; i < pts.length; i++) {
      expect(ctrls[i * 3].equals(pts[i])).toBe(true);
      expect(ctrls[i * 3]).not.toBe(pts[i]); // a copy, not the caller's Pt
    }
  });

  it("cardinalToBezier handles too few or two anchors", () => {
    expect(Curve.cardinalToBezier([])).toHaveLength(0);
    expect(Curve.cardinalToBezier([[1, 2]])).toHaveLength(0);
    const two = Curve.cardinalToBezier([
      [0, 0],
      [30, 60],
    ]);
    expect(two).toHaveLength(4);
    expectClose(
      two,
      Group.fromArray([
        [0, 0],
        [5, 10],
        [25, 50],
        [30, 60],
      ]),
    );
  });

  it("cardinalToBezier with alpha matches the Barry-Goldman form of a non-uniform Catmull-Rom", () => {
    const pts = seededPath(8, 3);
    for (const alpha of [0, 0.5, 1]) {
      const T = [0];
      for (let i = 1; i < pts.length; i++) {
        T.push(
          T[i - 1] + Math.pow(pts[i].$subtract(pts[i - 1]).magnitude(), alpha),
        );
      }
      const ctrls = Curve.cardinalToBezier(pts, 0.5, alpha);
      for (let i = 1; i < pts.length - 2; i++) {
        const P = [pts[i - 1], pts[i], pts[i + 1], pts[i + 2]];
        const K = [T[i - 1], T[i], T[i + 1], T[i + 2]];
        const seg = ctrls.slice(i * 3, i * 3 + 4);
        for (let j = 0; j <= 10; j++) {
          const u = j / 10;
          const ref = barryGoldman(P, K, K[1] + u * (K[2] - K[1]));
          const got = Curve.bezierStep(new Pt(u * u * u, u * u, u, 1), seg);
          expect(got[0]).toBeCloseTo(ref[0], 3);
          expect(got[1]).toBeCloseTo(ref[1], 3);
        }
      }
    }
  });

  it("centripetal alpha keeps a short segment between long ones from overshooting", () => {
    const pts = Group.fromArray([
      [0, 0],
      [100, 0],
      [102, 5],
      [0, 80],
    ]);
    const uniform = Curve.cardinalToBezier(pts).slice(3, 7);
    const centripetal = Curve.cardinalToBezier(pts, 0.5, 0.5).slice(3, 7);
    // the segment runs from (100,0) to (102,5); its controls should stay near it
    const within = (g: Pt[], r: number) =>
      g.every((c) => Math.abs(c[0] - 101) <= r && Math.abs(c[1] - 2.5) <= r);
    expect(within(centripetal, 5)).toBe(true);
    expect(within(uniform, 5)).toBe(false);
  });

  it("preserves non-uniform curves under scaling and reversal in 2D and 3D", () => {
    for (const dim of [2, 3]) {
      const pts = [
        [0, 0, 3],
        [100, 0, 10],
        [102, 5, 11],
        [0, 80, 0],
      ].map((p) => p.slice(0, dim));
      for (const alpha of [0.5, 1]) {
        const reference = Curve.cardinalToBezier(pts, 0.5, alpha);
        for (const scale of [1e-12, 1e-6, 1, 1e6]) {
          const scaled = pts.map((p) => p.map((v) => v * scale));
          const converted = Curve.cardinalToBezier(scaled, 0.5, alpha);
          const reversed = Curve.cardinalToBezier(
            [...scaled].reverse(),
            0.5,
            alpha,
          ).reverse();
          for (let i = 0; i < converted.length; i++) {
            for (let k = 0; k < dim; k++) {
              expect(converted[i][k] / scale).toBeCloseTo(reference[i][k], 4);
              expect(reversed[i][k] / scale).toBeCloseTo(reference[i][k], 4);
            }
          }
          // An independent double-precision reference also pins the shape at small scales.
          const knots = [0];
          for (let i = 1; i < scaled.length; i++) {
            knots.push(
              knots[i - 1] +
                Math.hypot(...scaled[i].map((v, k) => v - scaled[i - 1][k])) **
                  alpha,
            );
          }
          const samples = Curve.bezier(converted.slice(3, 7), 8);
          for (let j = 0; j <= 8; j++) {
            const expected = barryGoldman(
              scaled,
              knots,
              knots[1] + (j / 8) * (knots[2] - knots[1]),
            );
            for (let k = 0; k < dim; k++)
              expect(samples[j][k] / scale).toBeCloseTo(expected[k] / scale, 4);
          }
        }
      }
    }
  });

  it("keeps repeated non-uniform segments constant, with zero end tangents", () => {
    const pts = [
      [0, 0],
      [0, 0],
      [100, 0],
      [100, 0],
      [100, 0],
      [100, 100],
      [100, 100],
    ];
    for (const alpha of [0.5, 1]) {
      const reference = Curve.cardinalToBezier(pts, 0.5, alpha);
      for (const scale of [1e-10, 1, 1e6]) {
        const scaled = pts.map((p) => p.map((v) => v * scale));
        const converted = Curve.cardinalToBezier(scaled, 0.5, alpha);
        const reversed = Curve.cardinalToBezier(
          [...scaled].reverse(),
          0.5,
          alpha,
        ).reverse();
        for (let i = 0; i < converted.length; i++) {
          for (let k = 0; k < 2; k++) {
            expect(converted[i][k] / scale).toBeCloseTo(reference[i][k], 4);
            expect(reversed[i][k] / scale).toBeCloseTo(reference[i][k], 4);
          }
        }
        for (const segment of [0, 2, 3, 5]) {
          const start = segment * 3;
          for (let j = 0; j < 4; j++)
            expect([...converted[start + j]]).toEqual([
              ...new Pt(scaled[segment]),
            ]);
          if (segment > 0)
            expect([...converted[start - 1]]).toEqual([...converted[start]]);
          if (start + 4 < converted.length)
            expect([...converted[start + 4]]).toEqual([
              ...converted[start + 3],
            ]);
        }
      }
    }
  });

  it("cardinalToBezier rejects a negative or NaN alpha instead of returning NaN points", () => {
    const pts = seededPath(5, 11);
    const warn = vi.spyOn(Util, "warn").mockImplementation((_m, d) => d);
    expect(Curve.cardinalToBezier(pts, 0.5, -0.5)).toHaveLength(0);
    expect(Curve.cardinalToBezier(pts, 0.5, NaN)).toHaveLength(0);
    expect(warn).toHaveBeenCalledTimes(2);
    expect(Curve.cardinalToBezier(pts, 0.5, 0)).toHaveLength(13);
  });

  it("cardinalToBezier stays finite on coincident anchors with any alpha", () => {
    const pts = Group.fromArray([
      [10, 10],
      [10, 10],
      [50, 20],
      [50, 20],
      [90, 90],
    ]);
    for (const alpha of [0, 0.5, 1]) {
      const ctrls = Curve.cardinalToBezier(pts, 0.5, alpha);
      expect(ctrls).toHaveLength(13);
      expect(
        ctrls.every((c) => Number.isFinite(c[0]) && Number.isFinite(c[1])),
      ).toBe(true);
    }
    const same = Curve.cardinalToBezier(
      [
        [3, 4],
        [3, 4],
        [3, 4],
      ],
      0.5,
      0.5,
    );
    expect(same.every((c) => c.equals(new Pt(3, 4)))).toBe(true);
  });

  it("cardinalToBezier converts 3D anchors", () => {
    Num.seed("bezier-3d");
    const pts = new Group();
    for (let i = 0; i < 6; i++) {
      pts.push(new Pt(i * 40, Num.random() * 100, Num.random() * 100));
    }
    const ctrls = Curve.cardinalToBezier(pts, 0.7);
    expect(ctrls[1]).toHaveLength(3);
    expectClose(Curve.bezier(ctrls, 6), Curve.cardinal(pts, 6, 0.7));
  });

  it("bsplineToBezier traces the curve that bspline samples, with and without tension", () => {
    const pts = seededPath(9, 4);
    for (const tension of [1, 0.4, 1.6]) {
      const ctrls = Curve.bsplineToBezier(pts, tension);
      expect(ctrls).toHaveLength(3 * (pts.length - 3) + 1);
      expectClose(Curve.bezier(ctrls, 10), Curve.bspline(pts, 10, tension));
    }
    expect(Curve.bsplineToBezier(pts.slice(0, 3))).toHaveLength(0);
    expect(Curve.bsplineToBezier([])).toHaveLength(0);
  });

  it("bsplineToBezier converts 3D anchors", () => {
    const pts = Group.fromArray([
      [0, 0, 0],
      [10, 20, 30],
      [40, 10, 5],
      [60, 50, 25],
      [80, 0, 40],
    ]);
    const ctrls = Curve.bsplineToBezier(pts);
    expect(ctrls[0]).toHaveLength(3);
    expectClose(Curve.bezier(ctrls, 5), Curve.bspline(pts, 5));
  });
});

describe("Curve from Bezier conversions", () => {
  it("reconstructs a B-spline with continuous first and second derivatives", () => {
    for (const dim of [2, 3]) {
      const chain = Array.from({ length: 13 }, (_, i) =>
        Array.from({ length: dim }, (_, k) => 100 * Math.sin(i * 1.3 + k * 2)),
      );
      const smooth = Curve.bsplineToBezier(Curve.bezierToBspline(chain));
      for (let i = 3; i < smooth.length - 1; i += 3) {
        for (let k = 0; k < dim; k++) {
          const left = 3 * (smooth[i][k] - smooth[i - 1][k]);
          const right = 3 * (smooth[i + 1][k] - smooth[i][k]);
          const left2 =
            6 * (smooth[i][k] - 2 * smooth[i - 1][k] + smooth[i - 2][k]);
          const right2 =
            6 * (smooth[i + 2][k] - 2 * smooth[i + 1][k] + smooth[i][k]);
          expect(left).toBeCloseTo(right, 3);
          expect(left2).toBeCloseTo(right2, 3);
        }
      }
    }
  });

  it("bezierToCardinal inverts cardinalToBezier exactly for any tension and alpha", () => {
    for (const [tension, alpha] of [
      [0.5, 0],
      [0.2, 0.5],
      [1, 1],
    ]) {
      const pts = seededPath(9, 1);
      const back = Curve.bezierToCardinal(
        Curve.cardinalToBezier(pts, tension, alpha),
      );
      expect(back).toHaveLength(9);
      for (let i = 0; i < 9; i++) {
        expect(back[i].equals(pts[i])).toBe(true);
        expect(back[i]).not.toBe(pts[i]);
      }
    }
  });

  it("bezierToCardinal keeps the anchors, ignores a partial segment, and needs one full segment", () => {
    const chain = seededPath(13, 2);
    const anchors = Curve.bezierToCardinal(chain);
    expect(anchors).toHaveLength(5);
    anchors.forEach((a, k) => expect(a.equals(chain[3 * k])).toBe(true));
    expect(Curve.bezierToCardinal(chain.slice(0, 6))).toHaveLength(2);
    expect(Curve.bezierToCardinal(chain.slice(0, 3))).toHaveLength(0);
    expect(Curve.bezierToCardinal([])).toHaveLength(0);
    // the anchors trace a cardinal curve through the same points
    expect(Curve.cardinal(anchors, 4)[0].equals(chain[0])).toBe(true);
  });

  it("bezierToBspline inverts bsplineToBezier", () => {
    for (const n of [4, 5, 9, 30]) {
      const pts = seededPath(n, n);
      const chain = Curve.bsplineToBezier(pts);
      const back = Curve.bezierToBspline(chain);
      expect(back).toHaveLength(n);
      // float32 Bezier points are amplified a little by the solve: 2 decimals on coordinates in the hundreds
      expectClose(back, pts, 2);
      expectClose(Curve.bsplineToBezier(back), chain, 3);
    }
  });

  it("bezierToBspline passes through every anchor and keeps the end tangents of any chain", () => {
    const chain = seededPath(13, 7); // 4 segments with arbitrary handles
    const ctrls = Curve.bezierToBspline(chain);
    expect(ctrls).toHaveLength(7);
    const steps = 8;
    const curve = Curve.bspline(ctrls, steps);
    for (let k = 0; k <= 4; k++) {
      const at = k === 0 ? 0 : k * (steps + 1) - 1;
      expect(curve[at][0]).toBeCloseTo(chain[3 * k][0], 2);
      expect(curve[at][1]).toBeCloseTo(chain[3 * k][1], 2);
    }
    // start and end derivatives: (P2 - P0) / 2 equals the Bezier's 3 * handle
    const start = ctrls[2].$subtract(ctrls[0]).divide(2);
    const end = ctrls[6].$subtract(ctrls[4]).divide(2);
    expectClose(
      new Group(start, end),
      new Group(
        chain[1].$subtract(chain[0]).multiply(3),
        chain[12].$subtract(chain[11]).multiply(3),
      ),
      1,
    );
  });

  it("bezierToBspline handles one segment, a partial segment, short input, and 3D", () => {
    const one = Curve.bezierToBspline([
      [0, 0],
      [10, 30],
      [40, 30],
      [50, 0],
    ]);
    expect(one).toHaveLength(4);
    expectClose(
      Curve.bsplineToBezier(one),
      Group.fromArray([
        [0, 0],
        [10, 30],
        [40, 30],
        [50, 0],
      ]),
      2,
    );
    expect(Curve.bezierToBspline(seededPath(6, 3))).toHaveLength(4);
    expect(Curve.bezierToBspline(seededPath(3, 3))).toHaveLength(0);
    expect(Curve.bezierToBspline(new Set<number[]>())).toHaveLength(0);

    const pts = Group.fromArray([
      [0, 0, 0],
      [10, 20, 30],
      [40, 10, 5],
      [60, 50, 25],
      [80, 0, 40],
    ]);
    const back = Curve.bezierToBspline(Curve.bsplineToBezier(pts));
    expect(back[0]).toHaveLength(3);
    expectClose(back, pts, 2);
  });
});

describe("Curve conversion guards and tension range", () => {
  it("cardinalToBezier rejects an infinite alpha and survives an overflowing one", () => {
    const pts = seededPath(6, 21);
    const warn = vi.spyOn(Util, "warn").mockImplementation((_m, d) => d);
    expect(Curve.cardinalToBezier(pts, 0.5, Infinity)).toHaveLength(0);
    expect(warn).toHaveBeenCalledTimes(1);
    // pow(distance, 400) overflows to Infinity: the interval acts like a repeated anchor
    const huge = Curve.cardinalToBezier(pts, 0.5, 400);
    expect(huge).toHaveLength(16);
    expect(
      huge.every((p) => Number.isFinite(p[0]) && Number.isFinite(p[1])),
    ).toBe(true);
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it("cardinalToBezier matches the sampler at tension 0, above 1 and below 0", () => {
    const pts = seededPath(8, 22);
    for (const tension of [0, 1.5, -0.5]) {
      expectClose(
        Curve.bezier(Curve.cardinalToBezier(pts, tension), 6),
        Curve.cardinal(pts, 6, tension),
      );
    }
  });
});
