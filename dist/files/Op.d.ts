import { Pt, PtLike, Group, GroupLike } from "./Pt";
export declare type IntersectContext = {
    which: number;
    dist: number;
    normal: Pt;
    vertex: Pt;
    edge: Group;
    other?: any;
};
/**
 * Line class provides static functions to create and operate on lines. A line is usually represented as a Group of 2 Pts.
 * You can use the static function as-is, or apply the `op` method in Group or Pt to many of these functions.
 * See [Op guide](../../guide/Op-0400.html) for details.
 */
export declare class Line {
    /**
     * Create a line by "drawing" from an anchor point, given an angle and a magnitude
     * @param anchor an anchor Pt
     * @param angle an angle in radian
     * @param magnitude magnitude of the line
     * @return a Group of 2 Pts representing a line segement
     */
    static fromAngle(anchor: PtLike, angle: number, magnitude: number): Group;
    /**
     * Calculate the slope of a line
     * @param p1 line's first end point
     * @param p2 line's second end point
     */
    static slope(p1: PtLike | number[], p2: PtLike | number[]): number;
    /**
     * Calculate the slope and xy intercepts of a line
     * @param p1 line's first end point
     * @param p2 line's second end point
     * @returns an object with `slope`, `xi`, `yi` properties
     */
    static intercept(p1: PtLike | number[], p2: PtLike | number[]): {
        slope: number;
        xi: number;
        yi: number;
    };
    /**
     * Given a 2D path and a point, find whether the point is on left or right side of the line
     * @param line  a Group of at least 2 Pts
     * @param pt a Pt
     * @returns a negative value if on left and a positive value if on right. If collinear, then the return value is 0.
     */
    static sideOfPt2D(line: GroupLike, pt: PtLike): number;
    /**
     * Check if three Pts are collinear, ie, on the same straight path.
     * @param p1 first Pt
     * @param p2 second Pt
     * @param p3 third Pt
     * @param threshold a threshold where a smaller value means higher precision threshold for the straight line. Default is 0.01.
     */
    static collinear(p1: PtLike | number[], p2: PtLike | number[], p3: PtLike | number[], threshold?: number): boolean;
    /**
     * Get magnitude of a line segment
     * @param line a Group of at least 2 Pts
     */
    static magnitude(line: GroupLike): number;
    /**
     * Get squared magnitude of a line segment
     * @param line a Group of at least 2 Pts
     */
    static magnitudeSq(line: GroupLike): number;
    /**
     * Find a point on a line that is perpendicular (shortest distance) to a target point
     * @param pt a target Pt
     * @param ln a group of Pts that defines a line
     * @param asProjection if true, this returns the projection vector instead. Default is false.
     * @returns a Pt on the line that is perpendicular to the target Pt, or a projection vector if `asProjection` is true.
     */
    static perpendicularFromPt(line: GroupLike, pt: PtLike | number[], asProjection?: boolean): Pt;
    /**
     * Given a line and a point, find the shortest distance from the point to the line
     * @param line a Group of 2 Pts
     * @param pt a Pt
     * @see `Line.perpendicularFromPt`
     */
    static distanceFromPt(line: GroupLike, pt: PtLike | number[]): number;
    /**
     * Given two lines as rays (infinite lines), find their intersection point if any.
     * @param la a Group of 2 Pts representing a ray
     * @param lb a Group of 2 Pts representing a ray
     * @returns an intersection Pt or undefined if no intersection
     */
    static intersectRay2D(la: GroupLike, lb: GroupLike): Pt;
    /**
     * Given two line segemnts, find their intersection point if any.
     * @param la a Group of 2 Pts representing a line segment
     * @param lb a Group of 2 Pts representing a line segment
     * @returns an intersection Pt or undefined if no intersection
     */
    static intersectLine2D(la: GroupLike, lb: GroupLike): Pt;
    /**
     * Given a line segemnt and a ray (infinite line), find their intersection point if any.
     * @param line a Group of 2 Pts representing a line segment
     * @param ray a Group of 2 Pts representing a ray
     * @returns an intersection Pt or undefined if no intersection
     */
    static intersectLineWithRay2D(line: GroupLike, ray: GroupLike): Pt;
    /**
     * Given a line segemnt and a ray (infinite line), find its intersection point(s) with a polygon.
     * @param lineOrRay a Group of 2 Pts representing a line or ray
     * @param poly a Group of Pts representing a polygon
     * @param sourceIsRay a boolean value to treat the line as a ray (infinite line). Default is `false`.
     */
    static intersectPolygon2D(lineOrRay: GroupLike, poly: GroupLike, sourceIsRay?: boolean): Group;
    /**
     * Find intersection points of 2 polygons. This checks all line segments in the two lists. Consider using a bounding-box check before calling this.
     * @param lines1 an array of line segments
     * @param lines2 an array of line segments
     * @param isRay a boolean value to treat the line as a ray (infinite line). Default is `false`.
     */
    static intersectLines2D(lines1: GroupLike[], lines2: GroupLike[], isRay?: boolean): Group;
    /**
     * Get two intersection Pts of a ray with a 2D grid point
     * @param ray a ray specified by 2 Pts
     * @param gridPt a Pt on the grid
     * @returns a group of two intersecting Pts. The first one is horizontal intersection and the second one is vertical intersection.
     */
    static intersectGridWithRay2D(ray: GroupLike, gridPt: PtLike | number[]): Group;
    /**
     * Get two intersection Pts of a line segment with a 2D grid point
     * @param ray a ray specified by 2 Pts
     * @param gridPt a Pt on the grid
     * @returns a group of two intersecting Pts. The first one is horizontal intersection and the second one is vertical intersection.
     */
    static intersectGridWithLine2D(line: GroupLike, gridPt: PtLike | number[]): Group;
    /**
     * Quick way to check rectangle intersection.
     * For more optimized implementation, store the rectangle's sides separately (eg, `Rectangle.sides()`) and use `Polygon.intersectPolygon2D()`.
     * @param line a Group representing a line
     * @param rect a Group representing a rectangle
     * @returns a Group of intersecting Pts
     */
    static intersectRect2D(line: GroupLike, rect: GroupLike): Group;
    /**
     * Get evenly distributed points on a line
     * @param line a Group representing a line
     * @param num number of points to get
     */
    static subpoints(line: GroupLike | number[][], num: number): Group;
    /**
     * Crop this line by a circle or rectangle at end point.
     * @param line line to crop
     * @param size size of circle or rectangle as Pt
     * @param index line's end point index, ie, 0 = start and 1 = end.
     * @param cropAsCircle a boolean to specify whether the `size` parameter should be treated as circle. Default is `true`.
     * @return an intersecting point on the line that can be used for cropping.
     */
    static crop(line: GroupLike, size: PtLike, index?: number, cropAsCircle?: boolean): Pt;
    /**
     * Create an marker arrow or line, placed at an end point of this line
     * @param line line to place marker
     * @param size size of the marker as Pt
     * @param graphic either "arrow" or "line"
     * @param atTail a boolean, if `true`, the marker will be positioned at tail of the line (ie, index = 1). Default is `true`.
     * @returns a Group that defines the marker's shape
     */
    static marker(line: GroupLike, size: PtLike, graphic?: string, atTail?: boolean): Group;
    /**
     * Convert this line to a rectangle representation
     * @param line a Group representing a line
     */
    static toRect(line: GroupLike): Group;
}
/**
 * Rectangle class provides static functions to create and operate on rectangles. A rectangle is usually represented as a Group of 2 Pts, marking the top-left and bottom-right corners of the rectangle.
 * You can use the static function as-is, or apply the `op` method in Group or Pt to many of these functions.
 * See [Op guide](../../guide/Op-0400.html) for details.
 */
export declare class Rectangle {
    /**
     * Same as `Rectangle.fromTopLeft`
     */
    static from(topLeft: PtLike | number[], widthOrSize: number | PtLike, height?: number): Group;
    /**
     * Create a rectangle given a top-left position and a size
     * @param topLeft top-left point
     * @param widthOrSize width as a number, or a Pt that defines its size
     * @param height optional height as a number
     */
    static fromTopLeft(topLeft: PtLike | number[], widthOrSize: number | PtLike, height?: number): Group;
    /**
     * Create a rectangle given a center position and a size
     * @param topLeft top-left point
     * @param widthOrSize width as a number, or a Pt that defines its size
     * @param height optional height as a number
     */
    static fromCenter(center: PtLike | number[], widthOrSize: number | PtLike, height?: number): Group;
    /**
     * Convert this rectangle to a circle that fits within the rectangle
     * @returns a Group that represents a circle
     * @see `Circle`
     */
    static toCircle(pts: GroupLike): Group;
    /**
     * Create a square that either fits within or encloses a rectangle
     * @param pts a Group of 2 Pts representing a rectangle
     * @param enclose if `true`, the square will enclose the rectangle. Default is `false`, which will fit the square inside the rectangle.
     */
    static toSquare(pts: GroupLike, enclose?: boolean): Group;
    /**
     * Get the size of this rectangle as a Pt
     * @param pts a Group of 2 Pts representing a Rectangle
     */
    static size(pts: GroupLike): Pt;
    /**
     * Get the center of this rectangle
     * @param pts a Group of 2 Pts representing a Rectangle
     */
    static center(pts: GroupLike): Pt;
    /**
     * Get the 4 corners of this rectangle as a Group
     * @param rect a Group of 2 Pts representing a Rectangle
     */
    static corners(rect: GroupLike): Group;
    /**
     * Get the 4 sides of this rectangle as an array of 4 Groups
     * @param rect a Group of 2 Pts representing a Rectangle
     * @returns an array of 4 Groups, each of which represents a line segment
     */
    static sides(rect: GroupLike): Group[];
    /**
     * Same as `Rectangle.sides`
     */
    static lines(rect: GroupLike): Group[];
    /**
     * Given an array of rectangles, get a rectangle that bounds all of them
     * @param rects an array of Groups that represent rectangles
     * @returns the bounding rectangle as a Group
     */
    static boundingBox(rects: GroupLike[]): Group;
    /**
     * Convert this rectangle into a Group representing a polygon
     * @param rect a Group of 2 Pts representing a Rectangle
     */
    static polygon(rect: GroupLike): Group;
    /**
     * Subdivide a rectangle into 4 rectangles, one for each quadrant
     * @param rect a Group of 2 Pts representing a Rectangle
     * @returns an array of 4 Groups of rectangles
     */
    static quadrants(rect: GroupLike, center?: PtLike): Group[];
    /**
     * Subdivde a rectangle into 2 rectangles, by row or by column
     * @param rect Group of 2 Pts representing a Rectangle
     * @param ratio a value between 0 to 1 to indicate the split ratio
     * @param asRows if `true`, split into 2 rows. Default is `false` which splits into 2 columns.
     * @returns an array of 2 Groups of rectangles
     */
    static halves(rect: GroupLike, ratio?: number, asRows?: boolean): Group[];
    /**
     * Check if a point is within a rectangle
     * @param rect a Group of 2 Pts representing a Rectangle
     * @param pt the point to check
     */
    static withinBound(rect: GroupLike, pt: PtLike): boolean;
    /**
     * Check if a rectangle is within the bounds of another rectangle
     * @param rect1 a Group of 2 Pts representing a rectangle
     * @param rect2 a Group of 2 Pts representing a rectangle
     * @param resetBoundingBox if `true`, reset the bounding box. Default is `false` which assumes the rect's first Pt at is its top-left corner.
     */
    static hasIntersectRect2D(rect1: GroupLike, rect2: GroupLike, resetBoundingBox?: boolean): boolean;
    /**
     * Quick way to check rectangle intersection.
     * For more optimized implementation, store the rectangle's sides separately (eg, `Rectangle.sides()`) and use `Polygon.intersectPolygon2D()`.
     * @param rect1 a Group of 2 Pts representing a rectangle
     * @param rect2 a Group of 2 Pts representing a rectangle
     */
    static intersectRect2D(rect1: GroupLike, rect2: GroupLike): Group;
}
/**
 * Circle class provides static functions to create and operate on circles. A circle is usually represented as a Group of 2 Pts, where the first Pt specifies the center, and the second Pt specifies the radius.
 * You can use the static function as-is, or apply the `op` method in Group or Pt to many of these functions.
 * See [Op guide](../../guide/Op-0400.html) for details.
 */
export declare class Circle {
    /**
     * Create a circle that either fits within or encloses a rectangle
     * @param pts a Group of 2 Pts representing a rectangle
     * @param enclose if `true`, the circle will enclose the rectangle. Default is `false`, which will fit the circle inside the rectangle.
     */
    static fromRect(pts: GroupLike, enclose?: boolean): Group;
    /**
     * Create a circle based on a center point and a radius
     * @param pt center point of circle
     * @param radius radius of circle
     */
    static fromCenter(pt: PtLike, radius: number): Group;
    /**
     * Check if a point is within a circle
     * @param pts a Group of 2 Pts representing a circle
     * @param pt the point to checks
     * @param threshold an optional small number to set threshold. Default is 0.
     */
    static withinBound(pts: GroupLike, pt: PtLike, threshold?: number): boolean;
    /**
     * Get the intersection points between a circle and a ray (infinite line)
     * @param pts a Group of 2 Pts representing a circle
     * @param ray a Group of 2 Pts representing a ray
     * @returns a Group of intersection points, or an empty Group if no intersection is found
     */
    static intersectRay2D(pts: GroupLike, ray: GroupLike): Group;
    /**
     * Get the intersection points between a circle and a line segment
     * @param pts a Group of 2 Pts representing a circle
     * @param ray a Group of 2 Pts representing a line
     * @returns a Group of intersection points, or an empty Group if no intersection is found
     */
    static intersectLine2D(pts: GroupLike, line: GroupLike): Group;
    /**
     * Get the intersection points between two circles
     * @param pts a Group of 2 Pts representing a circle
     * @param circle a Group of 2 Pts representing a circle
     * @returns a Group of intersection points, or an empty Group if no intersection is found
     */
    static intersectCircle2D(pts: GroupLike, circle: GroupLike): Group;
    /**
     * Quick way to check rectangle intersection with a circle.
     * For more optimized implementation, store the rectangle's sides separately (eg, `Rectangle.sides()`) and use `Polygon.intersectPolygon2D()`.
     * @param pts a Group of 2 Pts representing a circle
     * @param rect a Group of 2 Pts representing a rectangle
     * @returns a Group of intersection points, or an empty Group if no intersection is found
     */
    static intersectRect2D(pts: GroupLike, rect: GroupLike): Group;
    /**
     * Convert this cirlce to a rectangle that encloses this circle
     * @param pts a Group of 2 Pts representing a circle
     */
    static toRect(pts: GroupLike): Group;
    /**
     * Convert this cirlce to a rectangle that fits within this circle
     * @param pts a Group of 2 Pts representing a circle
     */
    static toInnerRect(pts: GroupLike): Group;
    /**
     * Convert this cirlce to a triangle that fits within this circle
     * @param pts a Group of 2 Pts representing a circle
     */
    static toInnerTriangle(pts: GroupLike): Group;
}
/**
 * Triangle class provides static functions to create and operate on trianges. A triange is usually represented as a Group of 3 Pts.
 * You can use the static function as-is, or apply the `op` method in Group or Pt to many of these functions.
 * See [Op guide](../../guide/Op-0400.html) for details.
 */
export declare class Triangle {
    /**
     * Create a triangle from a rectangle. The triangle will be isosceles, with the bottom of the rectangle as its base.
     * @param rect a Group of 2 Pts representing a rectangle
     */
    static fromRect(rect: GroupLike): Group;
    /**
     * Create a triangle that fits within a circle
     * @param circle a Group of 2 Pts representing a circle
     */
    static fromCircle(circle: GroupLike): Group;
    /**
     * Create an equilateral triangle based on a center point and a size
     * @param pt the center point
     * @param size size is the magnitude of lines from center to the triangle's vertices, like a "radius".
     */
    static fromCenter(pt: PtLike, size: number): Group;
    /**
     * Get the medial, which is an inner triangle formed by connecting the midpoints of this triangle's sides
     * @param pts a Group of Pts
     * @returns a Group representing a medial triangle
     */
    static medial(pts: GroupLike): Group;
    /**
     * Given a point of the triangle, the opposite side is the side which the point doesn't touch.
     * @param pts a Group of Pts
     * @param index a Pt on the triangle group
     * @returns a Group that represents a line of the opposite side
     */
    static oppositeSide(pts: GroupLike, index: number): Group;
    /**
     * Get a triangle's altitude, which is a line from a triangle's point to its opposite side, and perpendicular to its opposite side.
     * @param pts a Group of Pts
     * @param index a Pt on the triangle group
     * @returns a Group that represents the altitude line
     */
    static altitude(pts: GroupLike, index: number): Group;
    /**
     * Get orthocenter, which is the intersection point of a triangle's 3 altitudes (the 3 lines that are perpendicular to its 3 opposite sides).
     * @param pts a Group of Pts
     * @returns the orthocenter as a Pt
     */
    static orthocenter(pts: GroupLike): Pt;
    /**
     * Get incenter, which is the center point of its inner circle, and also the intersection point of its 3 angle bisector lines (each of which cuts one of the 3 angles in half).
     * @param pts a Group of Pts
     * @returns the incenter as a Pt
     */
    static incenter(pts: GroupLike): Pt;
    /**
     * Get an interior circle, which is the largest circle completed enclosed by this triangle
     * @param pts a Group of Pts
     * @param center Optional parameter if the incenter is already known. Otherwise, leave it empty and the incenter will be calculated
     */
    static incircle(pts: GroupLike, center?: Pt): Group;
    /**
     * Get circumcenter, which is the intersection point of its 3 perpendicular bisectors lines ( each of which divides a side in half and is perpendicular to the side)
     * @param pts a Group of Pts
     * @returns the circumcenter as a Pt
     */
    static circumcenter(pts: GroupLike): Pt;
    /**
     * Get circumcenter, which is the intersection point of its 3 perpendicular bisectors lines ( each of which divides a side in half and is perpendicular to the side)
     * @param pts a Group of Pts
     * @param center Optional parameter if the circumcenter is already known. Otherwise, leave it empty and the circumcenter will be calculated
     */
    static circumcircle(pts: GroupLike, center?: Pt): Group;
}
/**
 * Polygon class provides static functions to create and operate on polygons. A polygon is usually represented as a Group of 3 or more Pts.
 * You can use the static function as-is, or apply the `op` method in Group or Pt to many of these functions.
 * See [Op guide](../../guide/Op-0400.html) for details.
 */
export declare class Polygon {
    /**
     * Get the centroid of a polygon, which is the average of all its points.
     * @param pts a Group of Pts representing a polygon
     */
    static centroid(pts: GroupLike): Pt;
    /**
     * Create a rectangular polygon
     * @param center center point of the rectangle
     * @param widthOrSize width as number, or a Pt representing the size of the rectangle
     * @param height optional height
     */
    static rectangle(center: PtLike, widthOrSize: number | PtLike, height?: number): Group;
    static fromCenter(center: PtLike, radius: number, sides: number): Group;
    /**
     * Given a Group of Pts that defines a polygon, get one edge using an index
     * @param pts a Group
     * @param idx index of a Pt in the Group
     */
    static lineAt(pts: GroupLike, idx: number): Group;
    /**
     * Get the line segments in this polygon
     * @param pts a Group of Pts
     * @param closePath a boolean to specify whether the polygon should be closed (ie, whether the final segment should be counted).
     * @returns an array of Groups which has 2 Pts in each group
     */
    static lines(pts: GroupLike, closePath?: boolean): Group[];
    /**
     * Get a new polygon group that is derived from midpoints in this polygon
     * @param pts a Group of Pts
     * @param closePath a boolean to specify whether the polygon should be closed (ie, whether the final segment should be counted).
     * @param t a value between 0 to 1 for interpolation. Default to 0.5 which will get the middle point.
     */
    static midpoints(pts: GroupLike, closePath?: boolean, t?: number): Group;
    /**
     * Given a Pt in the polygon group, the adjacent sides are the two sides which the Pt touches.
     * @param pts a group of Pts
     * @param index the target Pt
     * @param closePath a boolean to specify whether the polygon should be closed (ie, whether the final segment should be counted).
     */
    static adjacentSides(pts: GroupLike, index: number, closePath?: boolean): Group[];
    /**
     * Get a bisector which is a line that split between two sides of a polygon equally.
     * @param pts a group of Pts
     * @param index the Pt in the polygon to bisect from
     * @param closePath a boolean to specify whether the polygon should be closed (ie, whether the final segment should be counted).
     * @returns a bisector Pt that's a normalized unit vector
     */
    static bisector(pts: GroupLike, index: number): Pt;
    /**
     * Find the perimeter of this polygon, ie, the lengths of its sides.
     * @param pts a group of Pts
     * @param closePath a boolean to specify whether the polygon should be closed (ie, whether the final segment should be counted).
     * @returns an object with `total` length, and `segments` which is a Pt that stores each segment's length
     */
    static perimeter(pts: GroupLike, closePath?: boolean): {
        total: number;
        segments: Pt;
    };
    /**
     * Find the area of a *convex* polygon.
     * @param pts a group of Pts
     */
    static area(pts: GroupLike): any;
    /**
     * Get a convex hull of the point set using Melkman's algorithm
     * (Reference: http://geomalgorithms.com/a12-_hull-3.html)
     * @param pts a group of Pt
     * @param sorted a boolean value to indicate if the group is pre-sorted by x position. Default is false.
     * @returns a group of Pt that defines the convex hull polygon
     */
    static convexHull(pts: GroupLike, sorted?: boolean): Group;
    /**
     * Given a point in the polygon as an origin, get an array of lines that connect all the remaining points to the origin point.
     * @param pts a Group representing a polygon
     * @param originIndex the origin point's index in the polygon
     */
    static network(pts: GroupLike, originIndex?: number): Group[];
    /**
     * Given a target Pt, find a Pt in a Group that's nearest to it.
     * @param pts a Group of Pt
     * @param pt Pt to check
     * @returns an index in the pts indicating the nearest Pt, or -1 if none found
     */
    static nearestPt(pts: GroupLike, pt: PtLike): number;
    /**
     * Project axis (eg, for use in Separation Axis Theorem)
     * @param poly
     * @param unitAxis
     */
    static projectAxis(poly: GroupLike, unitAxis: Pt): Pt;
    /**
     * Check overlap dist from projected axis
     * @param poly1 first polygon
     * @param poly2 second polygon
     * @param unitAxis unit axis
     */
    protected static _axisOverlap(poly1: any, poly2: any, unitAxis: any): number;
    /**
     * Check if a Pt is inside a convex polygon
     * @param poly a Group of Pt defining a convex polygon
     * @param pt the Pt to check
     */
    static hasIntersectPoint(poly: GroupLike, pt: PtLike): boolean;
    /**
     * Check if a convex polygon and a circle has intersections using Separating Axis Theorem.
     * @param poly a Group representing a convex polygon
     * @param circle a Group representing a circle
     * @returns an `IntersectContext` object that stores the intersection info, or undefined if there's no intersection
     */
    static hasIntersectCircle(poly: GroupLike, circle: GroupLike): IntersectContext;
    /**
     * Check if two convex polygons has intersections using Separating Axis Theorem.
     * @param poly1 a Group representing a convex polygon
     * @param poly2 a Group representing a convex polygon
     * @return an `IntersectContext` object that stores the intersection info, or undefined if there's no intersection
     */
    static hasIntersectPolygon(poly1: GroupLike, poly2: GroupLike): IntersectContext;
    /**
     * Find intersection points of 2 polygons by checking every side of both polygons
     * @param poly1 a Group representing a polygon
     * @param poly2 another Group representing a polygon
     */
    static intersectPolygon2D(poly1: GroupLike, poly2: GroupLike): Group;
    /**
     * Get a bounding box for each polygon group, as well as a union bounding-box for all groups
     * @param polys an array of Groups, or an array of Pt arrays
     */
    static toRects(polys: GroupLike[]): GroupLike[];
}
/**
 * Curve class provides static functions to interpolate curves. A curve is usually represented as a Group of 3 control points.
 * You can use the static function as-is, or apply the `op` method in Group or Pt to many of these functions.
 * See [Op guide](../../guide/Op-0400.html) for details.
 */
export declare class Curve {
    /**
     * Get a precalculated coefficients per step
     * @param steps number of steps
     */
    static getSteps(steps: number): Group;
    /**
     * Given an index for the starting position in a Pt group, get the control and/or end points of a curve segment
     * @param pts a group of Pt
     * @param index start index in `pts` array. Default is 0.
     * @param copyStart an optional boolean value to indicate if the start index should be used twice. Default is false.
     * @returns a group of 4 Pts
     */
    static controlPoints(pts: GroupLike, index?: number, copyStart?: boolean): Group;
    /**
     * Calulcate weighted sum to get the interpolated points
     * @param ctrls anchors
     * @param params parameters
     */
    static _calcPt(ctrls: GroupLike, params: PtLike): Pt;
    /**
     * Create a Catmull-Rom curve. Catmull-Rom is a kind of Cardinal curve with smooth-looking curve.
     * @param pts a group of anchor Pt
     * @param steps the number of line segments per curve. Defaults to 10 steps.
     * @returns a curve as a group of interpolated Pt
     */
    static catmullRom(pts: GroupLike, steps?: number): Group;
    /**
     * Interpolate to get a point on Catmull-Rom curve
     * @param step the coefficients [t*t*t, t*t, t, 1]
     * @param ctrls a group of anchor Pts
     * @return an interpolated Pt on the curve
     */
    static catmullRomStep(step: Pt, ctrls: GroupLike): Pt;
    /**
     * Create a Cardinal spline curve
     * @param pts a group of anchor Pt
     * @param steps the number of line segments per curve. Defaults to 10 steps.
     * @param tension optional value between 0 to 1 to specify a "tension". Default to 0.5 which is the tension for Catmull-Rom curve.
     * @returns a curve as a group of interpolated Pt
     */
    static cardinal(pts: GroupLike, steps?: number, tension?: number): Group;
    /**
     * Interpolate to get a point on Catmull-Rom curve
     * @param step the coefficients [t*t*t, t*t, t, 1]
     * @param ctrls a group of anchor Pts
     * @param tension optional value between 0 to 1 to specify a "tension". Default to 0.5 which is the tension for Catmull-Rom curve
     * @return an interpolated Pt on the curve
     */
    static cardinalStep(step: Pt, ctrls: GroupLike, tension?: number): Pt;
    /**
     * Create a Bezier curve. In a cubic bezier curve, the first and 4th anchors are end-points, and 2nd and 3rd anchors are control-points.
     * @param pts a group of anchor Pt
     * @param steps the number of line segments per curve. Defaults to 10 steps.
     * @returns a curve as a group of interpolated Pt
     */
    static bezier(pts: GroupLike, steps?: number): Group;
    /**
     * Interpolate to get a point on a cubic Bezier curve
     * @param step the coefficients [t*t*t, t*t, t, 1]
     * @param ctrls a group of anchor Pts
     * @return an interpolated Pt on the curve
     */
    static bezierStep(step: Pt, ctrls: GroupLike): Pt;
    /**
     * Create a B-spline curve
     * @param pts a group of anchor Pt
     * @param steps the number of line segments per curve. Defaults to 10 steps.
     * @param tension optional value between 0 to n to specify a "tension". Default is 1 which is the usual tension.
     * @returns a curve as a group of interpolated Pt
     */
    static bspline(pts: GroupLike, steps?: number, tension?: number): Group;
    /**
     * Interpolate to get a point on a B-spline curve
     * @param step the coefficients [t*t*t, t*t, t, 1]
     * @param ctrls a group of anchor Pts
     * @return an interpolated Pt on the curve
     */
    static bsplineStep(step: Pt, ctrls: GroupLike): Pt;
    /**
     * Interpolate to get a point on a B-spline curve
     * @param step the coefficients [t*t*t, t*t, t, 1]
     * @param ctrls a group of anchor Pts
     * @param tension optional value between 0 to n to specify a "tension". Default to 1 which is the usual tension.
     * @return an interpolated Pt on the curve
     */
    static bsplineTensionStep(step: Pt, ctrls: GroupLike, tension?: number): Pt;
}
