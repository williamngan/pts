"use strict";
// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan)
Object.defineProperty(exports, "__esModule", { value: true });
const Util_1 = require("./Util");
const Num_1 = require("./Num");
const Pt_1 = require("./Pt");
const LinearAlgebra_1 = require("./LinearAlgebra");
let _errorLength = (obj, param = "expected") => Util_1.Util.warn("Group's length is less than " + param, obj);
let _errorOutofBound = (obj, param = "") => Util_1.Util.warn(`Index ${param} is out of bound in Group`, obj);
/**
 * Line class provides static functions to create and operate on lines. A line is usually represented as a Group of 2 Pts.
 * You can use the static function as-is, or apply the `op` method in Group or Pt to many of these functions.
 * See [Op guide](../../guide/Op-0400.html) for details.
 */
class Line {
    /**
     * Create a line by "drawing" from an anchor point, given an angle and a magnitude
     * @param anchor an anchor Pt
     * @param angle an angle in radian
     * @param magnitude magnitude of the line
     * @return a Group of 2 Pts representing a line segement
     */
    static fromAngle(anchor, angle, magnitude) {
        let g = new Pt_1.Group(new Pt_1.Pt(anchor), new Pt_1.Pt(anchor));
        g[1].toAngle(angle, magnitude, true);
        return g;
    }
    /**
     * Calculate the slope of a line
     * @param p1 line's first end point
     * @param p2 line's second end point
     */
    static slope(p1, p2) {
        return (p2[0] - p1[0] === 0) ? undefined : (p2[1] - p1[1]) / (p2[0] - p1[0]);
    }
    /**
     * Calculate the slope and xy intercepts of a line
     * @param p1 line's first end point
     * @param p2 line's second end point
     * @returns an object with `slope`, `xi`, `yi` properties
     */
    static intercept(p1, p2) {
        if (p2[0] - p1[0] === 0) {
            return undefined;
        }
        else {
            let m = (p2[1] - p1[1]) / (p2[0] - p1[0]);
            let c = p1[1] - m * p1[0];
            return { slope: m, yi: c, xi: (m === 0) ? undefined : -c / m };
        }
    }
    /**
     * Given a 2D path and a point, find whether the point is on left or right side of the line
     * @param line  a Group of at least 2 Pts
     * @param pt a Pt
     * @returns a negative value if on left and a positive value if on right. If collinear, then the return value is 0.
     */
    static sideOfPt2D(line, pt) {
        return (line[1][0] - line[0][0]) * (pt[1] - line[0][1]) - (pt[0] - line[0][0]) * (line[1][1] - line[0][1]);
    }
    /**
     * Check if three Pts are collinear, ie, on the same straight path.
     * @param p1 first Pt
     * @param p2 second Pt
     * @param p3 third Pt
     * @param threshold a threshold where a smaller value means higher precision threshold for the straight line. Default is 0.01.
     */
    static collinear(p1, p2, p3, threshold = 0.01) {
        // Use cross product method
        let a = new Pt_1.Pt(0, 0, 0).to(p1).$subtract(p2);
        let b = new Pt_1.Pt(0, 0, 0).to(p1).$subtract(p3);
        return a.$cross(b).divide(1000).equals(new Pt_1.Pt(0, 0, 0), threshold);
    }
    /**
     * Get magnitude of a line segment
     * @param line a Group of at least 2 Pts
     */
    static magnitude(line) {
        return (line.length >= 2) ? line[1].$subtract(line[0]).magnitude() : 0;
    }
    /**
     * Get squared magnitude of a line segment
     * @param line a Group of at least 2 Pts
     */
    static magnitudeSq(line) {
        return (line.length >= 2) ? line[1].$subtract(line[0]).magnitudeSq() : 0;
    }
    /**
     * Find a point on a line that is perpendicular (shortest distance) to a target point
     * @param pt a target Pt
     * @param ln a group of Pts that defines a line
     * @param asProjection if true, this returns the projection vector instead. Default is false.
     * @returns a Pt on the line that is perpendicular to the target Pt, or a projection vector if `asProjection` is true.
     */
    static perpendicularFromPt(line, pt, asProjection = false) {
        if (line[0].equals(line[1]))
            return undefined;
        let a = line[0].$subtract(line[1]);
        let b = line[1].$subtract(pt);
        let proj = b.$subtract(a.$project(b));
        return (asProjection) ? proj : proj.$add(pt);
    }
    /**
     * Given a line and a point, find the shortest distance from the point to the line
     * @param line a Group of 2 Pts
     * @param pt a Pt
     * @see `Line.perpendicularFromPt`
     */
    static distanceFromPt(line, pt) {
        return Line.perpendicularFromPt(line, pt, true).magnitude();
    }
    /**
     * Given two lines as rays (infinite lines), find their intersection point if any.
     * @param la a Group of 2 Pts representing a ray
     * @param lb a Group of 2 Pts representing a ray
     * @returns an intersection Pt or undefined if no intersection
     */
    static intersectRay2D(la, lb) {
        let a = Line.intercept(la[0], la[1]);
        let b = Line.intercept(lb[0], lb[1]);
        let pa = la[0];
        let pb = lb[0];
        if (a == undefined) {
            if (b == undefined)
                return undefined;
            // one of them is vertical line, while the other is not, so they will intersect
            let y1 = -b.slope * (pb[0] - pa[0]) + pb[1]; // -slope * x + y
            return new Pt_1.Pt(pa[0], y1);
        }
        else {
            // diff slope, or b slope is vertical line
            if (b == undefined) {
                let y1 = -a.slope * (pa[0] - pb[0]) + pa[1];
                return new Pt_1.Pt(pb[0], y1);
            }
            else if (b.slope != a.slope) {
                let px = (a.slope * pa[0] - b.slope * pb[0] + pb[1] - pa[1]) / (a.slope - b.slope);
                let py = a.slope * (px - pa[0]) + pa[1];
                return new Pt_1.Pt(px, py);
            }
            else {
                if (a.yi == b.yi) {
                    return new Pt_1.Pt(pa[0], pa[1]);
                }
                else {
                    return undefined;
                }
            }
        }
    }
    /**
     * Given two line segemnts, find their intersection point if any.
     * @param la a Group of 2 Pts representing a line segment
     * @param lb a Group of 2 Pts representing a line segment
     * @returns an intersection Pt or undefined if no intersection
     */
    static intersectLine2D(la, lb) {
        let pt = Line.intersectRay2D(la, lb);
        return (pt && Num_1.Geom.withinBound(pt, la[0], la[1]) && Num_1.Geom.withinBound(pt, lb[0], lb[1])) ? pt : undefined;
    }
    /**
     * Given a line segemnt and a ray (infinite line), find their intersection point if any.
     * @param line a Group of 2 Pts representing a line segment
     * @param ray a Group of 2 Pts representing a ray
     * @returns an intersection Pt or undefined if no intersection
     */
    static intersectLineWithRay2D(line, ray) {
        let pt = Line.intersectRay2D(line, ray);
        return (pt && Num_1.Geom.withinBound(pt, line[0], line[1])) ? pt : undefined;
    }
    /**
     * Given a line segemnt and a ray (infinite line), find its intersection point(s) with a polygon.
     * @param lineOrRay a Group of 2 Pts representing a line or ray
     * @param poly a Group of Pts representing a polygon
     * @param sourceIsRay a boolean value to treat the line as a ray (infinite line). Default is `false`.
     */
    static intersectPolygon2D(lineOrRay, poly, sourceIsRay = false) {
        let fn = sourceIsRay ? Line.intersectLineWithRay2D : Line.intersectLine2D;
        let pts = new Pt_1.Group();
        for (let i = 0, len = poly.length; i < len; i++) {
            let d = fn(poly[i], lineOrRay);
            if (d)
                pts.push(d);
        }
        return (pts.length > 0) ? pts : undefined;
    }
    /**
     * Get two intersection Pts of a ray with a 2D grid point
     * @param ray a ray specified by 2 Pts
     * @param gridPt a Pt on the grid
     * @returns a group of two intersecting Pts. The first one is horizontal intersection and the second one is vertical intersection.
     */
    static intersectGridWithRay2D(ray, gridPt) {
        let t = Line.intercept(new Pt_1.Pt(ray[0]).subtract(gridPt), new Pt_1.Pt(ray[1]).subtract(gridPt));
        let g = new Pt_1.Group();
        if (t && t.xi)
            g.push(new Pt_1.Pt(gridPt[0] + t.xi, gridPt[1]));
        if (t && t.yi)
            g.push(new Pt_1.Pt(gridPt[0], gridPt[1] + t.yi));
        return g;
    }
    /**
     * Get two intersection Pts of a line segment with a 2D grid point
     * @param ray a ray specified by 2 Pts
     * @param gridPt a Pt on the grid
     * @returns a group of two intersecting Pts. The first one is horizontal intersection and the second one is vertical intersection.
     */
    static intersectGridWithLine2D(line, gridPt) {
        let g = Line.intersectGridWithRay2D(line, gridPt);
        let gg = new Pt_1.Group();
        for (let i = 0, len = g.length; i < len; i++) {
            if (Num_1.Geom.withinBound(g[i], line[0], line[1]))
                gg.push(g[i]);
        }
        return gg;
    }
    /**
     * Quick way to check rectangle intersection.
     * For more optimized implementation, store the rectangle's sides separately (eg, `Rectangle.sides()`) and use `Polygon.intersect2D()`.
     * @param line a Group representing a line
     * @param rect a Group representing a rectangle
     */
    static intersectRect2D(line, rect) {
        return Rectangle.intersectRect2D(Line.toRect(line), rect);
    }
    /**
     * Get evenly distributed points on a line
     * @param line a Group representing a line
     * @param num number of points to get
     */
    static subpoints(line, num) {
        let pts = new Pt_1.Group();
        for (let i = 1; i <= num; i++) {
            pts.push(Num_1.Geom.interpolate(line[0], line[1], i / (num + 1)));
        }
        return pts;
    }
    /**
     * Convert this line to a rectangle representation
     * @param line a Group representing a line
     */
    static toRect(line) {
        return new Pt_1.Group(line[0].$min(line[1]), line[0].$max(line[1]));
    }
}
exports.Line = Line;
/**
 * Rectangle class provides static functions to create and operate on rectangles. A rectangle is usually represented as a Group of 2 Pts, marking the top-left and bottom-right corners of the rectangle.
 * You can use the static function as-is, or apply the `op` method in Group or Pt to many of these functions.
 * See [Op guide](../../guide/Op-0400.html) for details.
 */
class Rectangle {
    /**
     * Same as `Rectangle.fromTopLeft`
     */
    static from(topLeft, widthOrSize, height) {
        return Rectangle.fromTopLeft(topLeft, widthOrSize, height);
    }
    /**
     * Create a rectangle given a top-left position and a size
     * @param topLeft top-left point
     * @param widthOrSize width as a number, or a Pt that defines its size
     * @param height optional height as a number
     */
    static fromTopLeft(topLeft, widthOrSize, height) {
        let size = (typeof widthOrSize == "number") ? [widthOrSize, (height || widthOrSize)] : widthOrSize;
        return new Pt_1.Group(new Pt_1.Pt(topLeft), new Pt_1.Pt(topLeft).add(size));
    }
    /**
     * Create a rectangle given a center position and a size
     * @param topLeft top-left point
     * @param widthOrSize width as a number, or a Pt that defines its size
     * @param height optional height as a number
     */
    static fromCenter(center, widthOrSize, height) {
        let half = (typeof widthOrSize == "number") ? [widthOrSize / 2, (height || widthOrSize) / 2] : new Pt_1.Pt(widthOrSize).divide(2);
        return new Pt_1.Group(new Pt_1.Pt(center).subtract(half), new Pt_1.Pt(center).add(half));
    }
    /**
     * Convert this rectangle to a circle that fits within the rectangle
     * @returns a Group that represents a circle
     * @see `Circle`
     */
    static toCircle(pts) {
        return Circle.fromRect(pts);
    }
    /**
     * Get the size of this rectangle as a Pt
     * @param pts a Group of 2 Pts representing a Rectangle
     */
    static size(pts) {
        return pts[0].$max(pts[1]).subtract(pts[0].$min(pts[1]));
    }
    /**
     * Get the center of this rectangle
     * @param pts a Group of 2 Pts representing a Rectangle
     */
    static center(pts) {
        let min = pts[0].$min(pts[1]);
        let max = pts[0].$max(pts[1]);
        return min.add(max.$subtract(min).divide(2));
    }
    /**
     * Get the 4 corners of this rectangle as a Group
     * @param rect a Group of 2 Pts representing a Rectangle
     */
    static corners(rect) {
        let p0 = rect[0].$min(rect[1]);
        let p2 = rect[0].$max(rect[1]);
        return new Pt_1.Group(p0, new Pt_1.Pt(p2.x, p0.y), p2, new Pt_1.Pt(p0.x, p2.y));
    }
    /**
     * Get the 4 sides of this rectangle as an array of 4 Groups
     * @param rect a Group of 2 Pts representing a Rectangle
     * @returns an array of 4 Groups, each of which represents a line segment
     */
    static sides(rect) {
        let [p0, p1, p2, p3] = Rectangle.corners(rect);
        return [
            new Pt_1.Group(p0, p1), new Pt_1.Group(p1, p2),
            new Pt_1.Group(p2, p3), new Pt_1.Group(p3, p0)
        ];
    }
    /**
     * Same as `Rectangle.sides`
     */
    static lines(rect) {
        return Rectangle.sides(rect);
    }
    /**
     * Given an array of rectangles, get a rectangle that bounds all of them
     * @param rects an array of Groups that represent rectangles
     * @returns the bounding rectangle as a Group
     */
    static boundingBox(rects) {
        let merged = Util_1.Util.flatten(rects, false);
        let min = Pt_1.Pt.make(2, Number.MAX_VALUE);
        let max = Pt_1.Pt.make(2, Number.MIN_VALUE);
        // calculate min max in a single pass
        for (let i = 0, len = merged.length; i < len; i++) {
            for (let k = 0; k < 2; k++) {
                min[k] = Math.min(min[k], merged[i][k]);
                max[k] = Math.max(max[k], merged[i][k]);
            }
        }
        return new Pt_1.Group(min, max);
    }
    /**
     * Convert this rectangle into a Group representing a polygon
     * @param rect a Group of 2 Pts representing a Rectangle
     */
    static polygon(rect) {
        return Rectangle.corners(rect);
    }
    /**
     * Subdivide this rectangle into 4 rectangles, one for each quadrant
     * @param rect a Group of 2 Pts representing a Rectangle
     * @returns an array of 4 Groups
     */
    static quadrants(rect, center) {
        let corners = Rectangle.corners(rect);
        let _center = (center != undefined) ? new Pt_1.Pt(center) : Num_1.Geom.interpolate(rect[0], rect[1], 0.5);
        return corners.map((c) => new Pt_1.Group(c, _center).boundingBox());
    }
    /**
     * Check if a point is within a rectangle
     * @param rect a Group of 2 Pts representing a Rectangle
     * @param pt the point to check
     */
    static withinBound(rect, pt) {
        return Num_1.Geom.withinBound(pt, rect[0], rect[1]);
    }
    /**
     * Check if a rectangle is within the bounds of another rectangle
     * @param rect1 a Group of 2 Pts representing a rectangle
     * @param rect2 a Group of 2 Pts representing a rectangle
     */
    static hasIntersectRect2D(rect1, rect2) {
        let pts = Rectangle.corners(rect1);
        for (let i = 0, len = pts.length; i < len; i++) {
            if (Num_1.Geom.withinBound(pts[i], rect2[0], rect2[1]))
                return true;
        }
        return false;
    }
    /**
     * Quick way to check rectangle intersection.
     * For more optimized implementation, store the rectangle's sides separately (eg, `Rectangle.sides()`) and use `Polygon.intersect2D()`.
     * @param rect1 a Group of 2 Pts representing a rectangle
     * @param rect2 a Group of 2 Pts representing a rectangle
     */
    static intersectRect2D(rect1, rect2) {
        return Util_1.Util.flatten(Polygon.intersect2D(Rectangle.sides(rect1), Rectangle.sides(rect2)));
    }
}
exports.Rectangle = Rectangle;
/**
 * Circle class provides static functions to create and operate on circles. A circle is usually represented as a Group of 2 Pts, where the first Pt specifies the center, and the second Pt specifies the radius.
 * You can use the static function as-is, or apply the `op` method in Group or Pt to many of these functions.
 * See [Op guide](../../guide/Op-0400.html) for details.
 */
class Circle {
    /**
     * Create a circle that either fits within or encloses a rectangle
     * @param pts a Group of 2 Pts representing a rectangle
     * @param enclose if `true`, the circle will enclose the rectangle. Default is `false`, which will fit the circle inside the rectangle.
     */
    static fromRect(pts, enclose = false) {
        let r = 0;
        let min = r = Rectangle.size(pts).minValue().value / 2;
        if (enclose) {
            let max = Rectangle.size(pts).maxValue().value / 2;
            r = Math.sqrt(min * min + max * max);
        }
        else {
            r = min;
        }
        return new Pt_1.Group(Rectangle.center(pts), new Pt_1.Pt(r, r));
    }
    /**
     * Create a circle based on a center point and a radius
     * @param pt center point of circle
     * @param radius radius of circle
     */
    static fromCenter(pt, radius) {
        return new Pt_1.Group(new Pt_1.Pt(pt), new Pt_1.Pt(radius, radius));
    }
    /**
     * Check if a point is within a circle
     * @param pts a Group of 2 Pts representing a circle
     * @param pt the point to checks
     */
    static withinBound(pts, pt) {
        let d = pts[0].$subtract(pt);
        return d.dot(d) < pts[1].x * pts[1].x;
    }
    /**
     * Get the intersection points between a circle and a ray (infinite line)
     * @param pts a Group of 2 Pts representing a circle
     * @param ray a Group of 2 Pts representing a ray
     * @returns a Group of intersection points, or an empty Group if no intersection is found
     */
    static intersectRay2D(pts, ray) {
        let d = ray[0].$subtract(ray[1]);
        let f = pts[0].$subtract(ray[0]);
        let a = d.dot(d);
        let b = f.dot(d);
        let c = f.dot(f) - pts[1].x * pts[1].x;
        let p = b / a;
        let q = c / a;
        let disc = p * p - q; // discriminant
        if (disc < 0) {
            return new Pt_1.Group();
        }
        else {
            let discSqrt = Math.sqrt(disc);
            let t1 = -p + discSqrt;
            let p1 = ray[0].$subtract(d.$multiply(t1));
            if (disc === 0)
                return new Pt_1.Group(p1);
            let t2 = -p - discSqrt;
            let p2 = ray[0].$subtract(d.$multiply(t2));
            return new Pt_1.Group(p1, p2);
        }
    }
    /**
     * Get the intersection points between a circle and a line segment
     * @param pts a Group of 2 Pts representing a circle
     * @param ray a Group of 2 Pts representing a line
     * @returns a Group of intersection points, or an empty Group if no intersection is found
     */
    static intersectLine2D(pts, line) {
        let ps = Circle.intersectRay2D(pts, line);
        let g = new Pt_1.Group();
        if (ps.length > 0) {
            for (let i = 0, len = ps.length; i < len; i++) {
                if (Rectangle.withinBound(line, ps[i]))
                    g.push(ps[i]);
            }
        }
        return g;
    }
    /**
     * Get the intersection points between two circles
     * @param pts a Group of 2 Pts representing a circle
     * @param circle a Group of 2 Pts representing a circle
     * @returns a Group of intersection points, or an empty Group if no intersection is found
     */
    static intersectCircle2D(pts, circle) {
        let dv = circle[0].$subtract(pts[0]);
        let dr2 = dv.magnitudeSq();
        let dr = Math.sqrt(dr2);
        let ar = pts[1].x;
        let br = circle[1].x;
        let ar2 = ar * ar;
        let br2 = br * br;
        if (dr > ar + br) {
            return new Pt_1.Group();
        }
        else if (dr < Math.abs(ar - br)) {
            return new Pt_1.Group(pts[0].clone());
        }
        else {
            let a = (ar2 - br2 + dr2) / (2 * dr);
            let h = Math.sqrt(ar2 - a * a);
            let p = dv.$multiply(a / dr).add(pts[0]);
            return new Pt_1.Group(new Pt_1.Pt(p.x + h * dv.y / dr, p.y - h * dv.x / dr), new Pt_1.Pt(p.x - h * dv.y / dr, p.y + h * dv.x / dr));
        }
    }
    /**
     * Quick way to check rectangle intersection with a circle.
     * For more optimized implementation, store the rectangle's sides separately (eg, `Rectangle.sides()`) and use `Polygon.intersect2D()`.
     * @param pts a Group of 2 Pts representing a circle
     * @param rect a Group of 2 Pts representing a rectangle
     * @returns a Group of intersection points, or an empty Group if no intersection is found
     */
    static intersectRect2D(pts, rect) {
        let sides = Rectangle.sides(rect);
        let g = [];
        for (let i = 0, len = sides.length; i < len; i++) {
            let ps = Circle.intersectLine2D(pts, sides[i]);
            if (ps.length > 0)
                g.push(ps);
        }
        return Util_1.Util.flatten(g);
    }
    /**
     * Convert this cirlce to a rectangle that encloses this circle
     * @param pts a Group of 2 Pts representing a circle
     */
    static toRect(pts) {
        let r = pts[1][0];
        return new Pt_1.Group(pts[0].$subtract(r), pts[0].$add(r));
    }
    /**
     * Convert this cirlce to a rectangle that fits within this circle
     * @param pts a Group of 2 Pts representing a circle
     */
    static toInnerRect(pts) {
        let r = pts[1][0];
        let half = Math.sqrt(r * r) / 2;
        return new Pt_1.Group(pts[0].$subtract(half), pts[0].$add(half));
    }
    /**
     * Convert this cirlce to a triangle that fits within this circle
     * @param pts a Group of 2 Pts representing a circle
     */
    static toInnerTriangle(pts) {
        let ang = -Math.PI / 2;
        let inc = Math.PI * 2 / 3;
        let g = new Pt_1.Group();
        for (let i = 0; i < 3; i++) {
            g.push(pts[0].clone().toAngle(ang, pts[1][0], true));
            ang += inc;
        }
        return g;
    }
}
exports.Circle = Circle;
/**
 * Triangle class provides static functions to create and operate on trianges. A triange is usually represented as a Group of 3 Pts.
 * You can use the static function as-is, or apply the `op` method in Group or Pt to many of these functions.
 * See [Op guide](../../guide/Op-0400.html) for details.
 */
class Triangle {
    /**
     * Create a triangle from a rectangle. The triangle will be isosceles, with the bottom of the rectangle as its base.
     * @param rect a Group of 2 Pts representing a rectangle
     */
    static fromRect(rect) {
        let top = rect[0].$add(rect[1]).divide(2);
        top.y = rect[0][1];
        let left = rect[1].clone();
        left.x = rect[0][0];
        return new Pt_1.Group(top, rect[1].clone(), left);
    }
    /**
     * Create a triangle that fits within a circle
     * @param circle a Group of 2 Pts representing a circle
     */
    static fromCircle(circle) {
        return Circle.toInnerTriangle(circle);
    }
    /**
     * Create an equilateral triangle based on a center point and a size
     * @param pt the center point
     * @param size size is the magnitude of lines from center to the triangle's vertices, like a "radius".
     */
    static fromCenter(pt, size) {
        return Triangle.fromCircle(Circle.fromCenter(pt, size));
    }
    /**
     * Get the medial, which is an inner triangle formed by connecting the midpoints of this triangle's sides
     * @param pts a Group of Pts
     * @returns a Group representing a medial triangle
     */
    static medial(pts) {
        if (pts.length < 3)
            return _errorLength(new Pt_1.Group(), 3);
        return Polygon.midpoints(pts, true);
    }
    /**
     * Given a point of the triangle, the opposite side is the side which the point doesn't touch.
     * @param pts a Group of Pts
     * @param index a Pt on the triangle group
     * @returns a Group that represents a line of the opposite side
     */
    static oppositeSide(pts, index) {
        if (pts.length < 3)
            return _errorLength(new Pt_1.Group(), 3);
        if (index === 0) {
            return Pt_1.Group.fromPtArray([pts[1], pts[2]]);
        }
        else if (index === 1) {
            return Pt_1.Group.fromPtArray([pts[0], pts[2]]);
        }
        else {
            return Pt_1.Group.fromPtArray([pts[0], pts[1]]);
        }
    }
    /**
     * Get a triangle's altitude, which is a line from a triangle's point to its opposite side, and perpendicular to its opposite side.
     * @param pts a Group of Pts
     * @param index a Pt on the triangle group
     * @returns a Group that represents the altitude line
     */
    static altitude(pts, index) {
        let opp = Triangle.oppositeSide(pts, index);
        if (opp.length > 1) {
            return new Pt_1.Group(pts[index], Line.perpendicularFromPt(opp, pts[index]));
        }
        else {
            return new Pt_1.Group();
        }
    }
    /**
     * Get orthocenter, which is the intersection point of a triangle's 3 altitudes (the 3 lines that are perpendicular to its 3 opposite sides).
     * @param pts a Group of Pts
     * @returns the orthocenter as a Pt
     */
    static orthocenter(pts) {
        if (pts.length < 3)
            return _errorLength(undefined, 3);
        let a = Triangle.altitude(pts, 0);
        let b = Triangle.altitude(pts, 1);
        return Line.intersectRay2D(a, b);
    }
    /**
     * Get incenter, which is the center point of its inner circle, and also the intersection point of its 3 angle bisector lines (each of which cuts one of the 3 angles in half).
     * @param pts a Group of Pts
     * @returns the incenter as a Pt
     */
    static incenter(pts) {
        if (pts.length < 3)
            return _errorLength(undefined, 3);
        let a = Polygon.bisector(pts, 0).add(pts[0]);
        let b = Polygon.bisector(pts, 1).add(pts[1]);
        return Line.intersectRay2D(new Pt_1.Group(pts[0], a), new Pt_1.Group(pts[1], b));
    }
    /**
     * Get an interior circle, which is the largest circle completed enclosed by this triangle
     * @param pts a Group of Pts
     * @param center Optional parameter if the incenter is already known. Otherwise, leave it empty and the incenter will be calculated
     */
    static incircle(pts, center) {
        let c = (center) ? center : Triangle.incenter(pts);
        let area = Polygon.area(pts);
        let perim = Polygon.perimeter(pts, true);
        let r = 2 * area / perim.total;
        return Circle.fromCenter(c, r);
    }
    /**
     * Get circumcenter, which is the intersection point of its 3 perpendicular bisectors lines ( each of which divides a side in half and is perpendicular to the side)
     * @param pts a Group of Pts
     * @returns the circumcenter as a Pt
     */
    static circumcenter(pts) {
        let md = Triangle.medial(pts);
        let a = [md[0], Num_1.Geom.perpendicular(pts[0].$subtract(md[0])).p1.$add(md[0])];
        let b = [md[1], Num_1.Geom.perpendicular(pts[1].$subtract(md[1])).p1.$add(md[1])];
        return Line.intersectRay2D(a, b);
    }
    /**
     * Get circumcenter, which is the intersection point of its 3 perpendicular bisectors lines ( each of which divides a side in half and is perpendicular to the side)
     * @param pts a Group of Pts
     * @param center Optional parameter if the circumcenter is already known. Otherwise, leave it empty and the circumcenter will be calculated
     */
    static circumcircle(pts, center) {
        let c = (center) ? center : Triangle.circumcenter(pts);
        let r = pts[0].$subtract(c).magnitude();
        return Circle.fromCenter(c, r);
    }
}
exports.Triangle = Triangle;
/**
 * Polygon class provides static functions to create and operate on polygons. A polygon is usually represented as a Group of 3 or more Pts.
 * You can use the static function as-is, or apply the `op` method in Group or Pt to many of these functions.
 * See [Op guide](../../guide/Op-0400.html) for details.
 */
class Polygon {
    /**
     * Get the centroid of a polygon, which is the average of all its points.
     * @param pts a Group of Pts representing a polygon
     */
    static centroid(pts) {
        return Num_1.Geom.centroid(pts);
    }
    /**
     * Get the line segments in this polygon
     * @param pts a Group of Pts
     * @param closePath a boolean to specify whether the polygon should be closed (ie, whether the final segment should be counted).
     * @returns an array of Groups which has 2 Pts in each group
     */
    static lines(pts, closePath = false) {
        if (pts.length < 2)
            return _errorLength(new Pt_1.Group(), 2);
        let sp = Util_1.Util.split(pts, 2, 1);
        if (closePath)
            sp.push(new Pt_1.Group(pts[pts.length - 1], pts[0]));
        return sp.map((g) => g);
    }
    /**
     * Get a new polygon group that is derived from midpoints in this polygon
     * @param pts a Group of Pts
     * @param closePath a boolean to specify whether the polygon should be closed (ie, whether the final segment should be counted).
     * @param t a value between 0 to 1 for interpolation. Default to 0.5 which will get the middle point.
     */
    static midpoints(pts, closePath = false, t = 0.5) {
        if (pts.length < 2)
            return _errorLength(new Pt_1.Group(), 2);
        let sides = Polygon.lines(pts, closePath);
        let mids = sides.map((s) => Num_1.Geom.interpolate(s[0], s[1], t));
        return mids;
    }
    /**
     * Given a Pt in the polygon group, the adjacent sides are the two sides which the Pt touches.
     * @param pts a group of Pts
     * @param index the target Pt
     * @param closePath a boolean to specify whether the polygon should be closed (ie, whether the final segment should be counted).
     */
    static adjacentSides(pts, index, closePath = false) {
        if (pts.length < 2)
            return _errorLength(new Pt_1.Group(), 2);
        if (index < 0 || index >= pts.length)
            return _errorOutofBound(new Pt_1.Group(), index);
        let gs = [];
        let left = index - 1;
        if (closePath && left < 0)
            left = pts.length - 1;
        if (left >= 0)
            gs.push(new Pt_1.Group(pts[index], pts[left]));
        let right = index + 1;
        if (closePath && right > pts.length - 1)
            right = 0;
        if (right <= pts.length - 1)
            gs.push(new Pt_1.Group(pts[index], pts[right]));
        return gs;
    }
    /**
     * Get a bisector which is a line that split between two sides of a polygon equally.
     * @param pts a group of Pts
     * @param index the Pt in the polygon to bisect from
     * @param closePath a boolean to specify whether the polygon should be closed (ie, whether the final segment should be counted).
     * @returns a bisector Pt that's a normalized unit vector
     */
    static bisector(pts, index) {
        let sides = Polygon.adjacentSides(pts, index, true);
        if (sides.length >= 2) {
            let a = sides[0][1].$subtract(sides[0][0]).unit();
            let b = sides[1][1].$subtract(sides[1][0]).unit();
            return a.add(b).divide(2);
        }
        else {
            return undefined;
        }
    }
    /**
     * Find the perimeter of this polygon, ie, the lengths of its sides.
     * @param pts a group of Pts
     * @param closePath a boolean to specify whether the polygon should be closed (ie, whether the final segment should be counted).
     * @returns an object with `total` length, and `segments` which is a Pt that stores each segment's length
     */
    static perimeter(pts, closePath = false) {
        if (pts.length < 2)
            return _errorLength(new Pt_1.Group(), 2);
        let lines = Polygon.lines(pts, closePath);
        let mag = 0;
        let p = Pt_1.Pt.make(lines.length, 0);
        for (let i = 0, len = lines.length; i < len; i++) {
            let m = Line.magnitude(lines[i]);
            mag += m;
            p[i] = m;
        }
        return {
            total: mag,
            segments: p
        };
    }
    /**
     * Find the area of a *convex* polygon.
     * @param pts a group of Pts
     */
    static area(pts) {
        if (pts.length < 3)
            return _errorLength(new Pt_1.Group(), 3);
        // determinant
        let det = (a, b) => a[0] * b[1] - a[1] * b[0];
        let area = 0;
        for (let i = 0, len = pts.length; i < len; i++) {
            if (i < pts.length - 1) {
                area += det(pts[i], pts[i + 1]);
            }
            else {
                area += det(pts[i], pts[0]);
            }
        }
        return Math.abs(area / 2);
    }
    /**
     * Get a convex hull of the point set using Melkman's algorithm
     * (Reference: http://geomalgorithms.com/a12-_hull-3.html)
     * @param pts a group of Pt
     * @param sorted a boolean value to indicate if the group is pre-sorted by x position. Default is false.
     * @returns a group of Pt that defines the convex hull polygon
     */
    static convexHull(pts, sorted = false) {
        if (pts.length < 3)
            return _errorLength(new Pt_1.Group(), 3);
        if (!sorted) {
            pts = pts.slice();
            pts.sort((a, b) => a[0] - b[0]);
        }
        // check if is on left of ray a-b
        let left = (a, b, c) => {
            return (b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1]) > 0;
        };
        // double end queue
        let dq = [];
        let bot = pts.length - 2;
        let top = bot + 3;
        dq[bot] = pts[2];
        dq[top] = pts[2];
        // first 3 pt as counter-clockwise triangle
        if (left(pts[0], pts[1], pts[2])) {
            dq[bot + 1] = pts[0];
            dq[bot + 2] = pts[1];
        }
        else {
            dq[bot + 1] = pts[1];
            dq[bot + 2] = pts[0];
        }
        // remaining pts
        for (let i = 3, len = pts.length; i < len; i++) {
            let pt = pts[i];
            // if inside the hull
            if (left(dq[bot], dq[bot + 1], pt) && left(dq[top - 1], dq[top], pt)) {
                continue;
            }
            // rightmost tangent
            while (!left(dq[bot], dq[bot + 1], pt)) {
                bot += 1;
            }
            bot -= 1;
            dq[bot] = pt;
            // leftmost tangent
            while (!left(dq[top - 1], dq[top], pt)) {
                top -= 1;
            }
            top += 1;
            dq[top] = pt;
        }
        let hull = new Pt_1.Group();
        for (let h = 0; h < (top - bot); h++) {
            hull.push(dq[bot + h]);
        }
        return hull;
    }
    /**
     * Find intersection points of 2 polygons
     * @param poly a Group representing a polygon
     * @param linesOrRays an array of Groups representing lines
     * @param sourceIsRay a boolean value to treat the line as a ray (infinite line). Default is `false`.
     */
    static intersect2D(poly, linesOrRays, sourceIsRay = false) {
        let groups = [];
        for (let i = 0, len = linesOrRays.length; i < len; i++) {
            let _ip = Line.intersectPolygon2D(linesOrRays[i], poly, sourceIsRay);
            if (_ip)
                groups.push(_ip);
        }
        return groups;
    }
    /**
     * Given a point in the polygon as an origin, get an array of lines that connect all the remaining points to the origin point.
     * @param pts a Group representing a polygon
     * @param originIndex the origin point's index in the polygon
     */
    static network(pts, originIndex = 0) {
        let g = [];
        for (let i = 0, len = pts.length; i < len; i++) {
            if (i != originIndex)
                g.push(new Pt_1.Group(pts[originIndex], pts[i]));
        }
        return g;
    }
    /**
     * Given a target Pt, find a Pt in a Group that's nearest to it.
     * @param pts a Group of Pt
     * @param pt Pt to check
     */
    static nearestPt(pts, pt) {
        let _near = Number.MAX_VALUE;
        let _item = -1;
        for (let i = 0, len = pts.length; i < len; i++) {
            let d = pts[i].$subtract(pt).magnitudeSq();
            if (d < _near) {
                _near = d;
                _item = i;
            }
        }
        return (_item >= 0) ? pts[_item] : undefined;
    }
    /**
     * Get a bounding box for each polygon group, as well as a union bounding-box for all groups
     * @param polys an array of Groups, or an array of Pt arrays
     */
    static toRects(poly) {
        let boxes = poly.map((g) => Num_1.Geom.boundingBox(g));
        let merged = Util_1.Util.flatten(boxes, false);
        boxes.unshift(Num_1.Geom.boundingBox(merged));
        return boxes;
    }
}
exports.Polygon = Polygon;
/**
 * Curve class provides static functions to interpolate curves. A curve is usually represented as a Group of 3 control points.
 * You can use the static function as-is, or apply the `op` method in Group or Pt to many of these functions.
 * See [Op guide](../../guide/Op-0400.html) for details.
 */
class Curve {
    /**
     * Get a precalculated coefficients per step
     * @param steps number of steps
     */
    static getSteps(steps) {
        let ts = new Pt_1.Group();
        for (let i = 0; i <= steps; i++) {
            let t = i / steps;
            ts.push(new Pt_1.Pt(t * t * t, t * t, t, 1));
        }
        return ts;
    }
    /**
     * Given an index for the starting position in a Pt group, get the control and/or end points of a curve segment
     * @param pts a group of Pt
     * @param index start index in `pts` array. Default is 0.
     * @param copyStart an optional boolean value to indicate if the start index should be used twice. Default is false.
     * @returns a group of 4 Pts
     */
    static controlPoints(pts, index = 0, copyStart = false) {
        if (index > pts.length - 1)
            return new Pt_1.Group();
        let _index = (i) => (i < pts.length - 1) ? i : pts.length - 1;
        let p0 = pts[index];
        index = (copyStart) ? index : index + 1;
        // get points based on index
        return new Pt_1.Group(p0, pts[_index(index++)], pts[_index(index++)], pts[_index(index++)]);
    }
    /**
     * Calulcate weighted sum to get the interpolated points
     * @param ctrls anchors
     * @param params parameters
     */
    static _calcPt(ctrls, params) {
        let x = ctrls.reduce((a, c, i) => a + c.x * params[i], 0);
        let y = ctrls.reduce((a, c, i) => a + c.y * params[i], 0);
        if (ctrls[0].length > 2) {
            let z = ctrls.reduce((a, c, i) => a + c.z * params[i], 0);
            return new Pt_1.Pt(x, y, z);
        }
        return new Pt_1.Pt(x, y);
    }
    /**
     * Create a Catmull-Rom curve. Catmull-Rom is a kind of Cardinal curve with smooth-looking curve.
     * @param pts a group of anchor Pt
     * @param steps the number of line segments per curve. Defaults to 10 steps.
     * @returns a curve as a group of interpolated Pt
     */
    static catmullRom(pts, steps = 10) {
        if (pts.length < 2)
            return new Pt_1.Group();
        let ps = new Pt_1.Group();
        let ts = Curve.getSteps(steps);
        // use first point twice
        let c = Curve.controlPoints(pts, 0, true);
        for (let i = 0; i <= steps; i++) {
            ps.push(Curve.catmullRomStep(ts[i], c));
        }
        let k = 0;
        while (k < pts.length - 2) {
            let cp = Curve.controlPoints(pts, k);
            if (cp.length > 0) {
                for (let i = 0; i <= steps; i++) {
                    ps.push(Curve.catmullRomStep(ts[i], cp));
                }
                k++;
            }
        }
        return ps;
    }
    /**
     * Interpolate to get a point on Catmull-Rom curve
     * @param step the coefficients [t*t*t, t*t, t, 1]
     * @param ctrls a group of anchor Pts
     * @return an interpolated Pt on the curve
     */
    static catmullRomStep(step, ctrls) {
        /*
        * Basis Matrix (http://mrl.nyu.edu/~perlin/courses/fall2002/hw/12.html)
        * [-0.5,  1.5, -1.5, 0.5],
        * [ 1  , -2.5,  2  ,-0.5],
        * [-0.5,  0  ,  0.5, 0  ],
        * [ 0  ,  1  ,  0  , 0  ]
        */
        let m = new Pt_1.Group(new Pt_1.Pt(-0.5, 1, -0.5, 0), new Pt_1.Pt(1.5, -2.5, 0, 1), new Pt_1.Pt(-1.5, 2, 0.5, 0), new Pt_1.Pt(0.5, -0.5, 0, 0));
        return Curve._calcPt(ctrls, LinearAlgebra_1.Mat.multiply([step], m, true)[0]);
    }
    /**
     * Create a Cardinal spline curve
     * @param pts a group of anchor Pt
     * @param steps the number of line segments per curve. Defaults to 10 steps.
     * @param tension optional value between 0 to 1 to specify a "tension". Default to 0.5 which is the tension for Catmull-Rom curve.
     * @returns a curve as a group of interpolated Pt
     */
    static cardinal(pts, steps = 10, tension = 0.5) {
        if (pts.length < 2)
            return new Pt_1.Group();
        let ps = new Pt_1.Group();
        let ts = Curve.getSteps(steps);
        // use first point twice
        let c = Curve.controlPoints(pts, 0, true);
        for (let i = 0; i <= steps; i++) {
            ps.push(Curve.cardinalStep(ts[i], c, tension));
        }
        let k = 0;
        while (k < pts.length - 2) {
            let cp = Curve.controlPoints(pts, k);
            if (cp.length > 0) {
                for (let i = 0; i <= steps; i++) {
                    ps.push(Curve.cardinalStep(ts[i], cp, tension));
                }
                k++;
            }
        }
        return ps;
    }
    /**
     * Interpolate to get a point on Catmull-Rom curve
     * @param step the coefficients [t*t*t, t*t, t, 1]
     * @param ctrls a group of anchor Pts
     * @param tension optional value between 0 to 1 to specify a "tension". Default to 0.5 which is the tension for Catmull-Rom curve
     * @return an interpolated Pt on the curve
     */
    static cardinalStep(step, ctrls, tension = 0.5) {
        /*
        * Basis Matrix (http://algorithmist.wordpress.com/2009/10/06/cardinal-splines-part-4/)
        * [ -s  2-s  s-2   s ]
        * [ 2s  s-3  3-2s -s ]
        * [ -s   0    s    0 ]
        * [  0   1    0    0 ]
        */
        let m = new Pt_1.Group(new Pt_1.Pt(-1, 2, -1, 0), new Pt_1.Pt(-1, 1, 0, 0), new Pt_1.Pt(1, -2, 1, 0), new Pt_1.Pt(1, -1, 0, 0));
        let h = LinearAlgebra_1.Mat.multiply([step], m, true)[0].multiply(tension);
        let h2 = (2 * step[0] - 3 * step[1] + 1);
        let h3 = -2 * step[0] + 3 * step[1];
        let pt = Curve._calcPt(ctrls, h);
        pt.x += h2 * ctrls[1].x + h3 * ctrls[2].x;
        pt.y += h2 * ctrls[1].y + h3 * ctrls[2].y;
        if (pt.length > 2)
            pt.z += h2 * ctrls[1].z + h3 * ctrls[2].z;
        return pt;
    }
    /**
     * Create a Bezier curve. In a cubic bezier curve, the first and 4th anchors are end-points, and 2nd and 3rd anchors are control-points.
     * @param pts a group of anchor Pt
     * @param steps the number of line segments per curve. Defaults to 10 steps.
     * @returns a curve as a group of interpolated Pt
     */
    static bezier(pts, steps = 10) {
        if (pts.length < 4)
            return new Pt_1.Group();
        let ps = new Pt_1.Group();
        let ts = Curve.getSteps(steps);
        let k = 0;
        while (k < pts.length - 3) {
            let c = Curve.controlPoints(pts, k);
            if (c.length > 0) {
                for (let i = 0; i <= steps; i++) {
                    ps.push(Curve.bezierStep(ts[i], c));
                }
                // go to the next set of point, but assume current end pt is next start pt
                k += 3;
            }
        }
        return ps;
    }
    /**
     * Interpolate to get a point on a cubic Bezier curve
     * @param step the coefficients [t*t*t, t*t, t, 1]
     * @param ctrls a group of anchor Pts
     * @return an interpolated Pt on the curve
     */
    static bezierStep(step, ctrls) {
        /*
        * Bezier basis matrix
        * [ -1,  3, -3,  1 ]
        * [  3, -6,  3,  0 ]
        * [ -3,  3,  0,  0 ]
        * [  1,  0,  0,  0 ]
        */
        let m = new Pt_1.Group(new Pt_1.Pt(-1, 3, -3, 1), new Pt_1.Pt(3, -6, 3, 0), new Pt_1.Pt(-3, 3, 0, 0), new Pt_1.Pt(1, 0, 0, 0));
        return Curve._calcPt(ctrls, LinearAlgebra_1.Mat.multiply([step], m, true)[0]);
    }
    /**
     * Create a B-spline curve
     * @param pts a group of anchor Pt
     * @param steps the number of line segments per curve. Defaults to 10 steps.
     * @param tension optional value between 0 to n to specify a "tension". Default is 1 which is the usual tension.
     * @returns a curve as a group of interpolated Pt
     */
    static bspline(pts, steps = 10, tension = 1) {
        if (pts.length < 2)
            return new Pt_1.Group();
        let ps = new Pt_1.Group();
        let ts = Curve.getSteps(steps);
        let k = 0;
        while (k < pts.length - 3) {
            let c = Curve.controlPoints(pts, k);
            if (c.length > 0) {
                if (tension !== 1) {
                    for (let i = 0; i <= steps; i++) {
                        ps.push(Curve.bsplineTensionStep(ts[i], c, tension));
                    }
                }
                else {
                    for (let i = 0; i <= steps; i++) {
                        ps.push(Curve.bsplineStep(ts[i], c));
                    }
                }
                k++;
            }
        }
        return ps;
    }
    /**
     * Interpolate to get a point on a B-spline curve
     * @param step the coefficients [t*t*t, t*t, t, 1]
     * @param ctrls a group of anchor Pts
     * @return an interpolated Pt on the curve
     */
    static bsplineStep(step, ctrls) {
        /*
        * Basis matrix:
        * [ -1.0/6.0,  3.0/6.0, -3.0/6.0, 1.0/6.0 ],
        * [  3.0/6.0, -6.0/6.0,  3.0/6.0,    0.0 ],
        * [ -3.0/6.0,      0.0,  3.0/6.0,    0.0 ],
        * [  1.0/6.0,  4.0/6.0,  1.0/6.0,    0.0 ]
        */
        let m = new Pt_1.Group(new Pt_1.Pt(-0.16666666666666666, 0.5, -0.5, 0.16666666666666666), new Pt_1.Pt(0.5, -1, 0, 0.6666666666666666), new Pt_1.Pt(-0.5, 0.5, 0.5, 0.16666666666666666), new Pt_1.Pt(0.16666666666666666, 0, 0, 0));
        return Curve._calcPt(ctrls, LinearAlgebra_1.Mat.multiply([step], m, true)[0]);
    }
    /**
     * Interpolate to get a point on a B-spline curve
     * @param step the coefficients [t*t*t, t*t, t, 1]
     * @param ctrls a group of anchor Pts
     * @param tension optional value between 0 to n to specify a "tension". Default to 1 which is the usual tension.
     * @return an interpolated Pt on the curve
     */
    static bsplineTensionStep(step, ctrls, tension = 1) {
        /*
        * Basis matrix:
        * [ -1/6a, 2 - 1.5a, 1.5a - 2, 1/6a ]
        * [ 0.5a,  2a-3,     3-2.5a    0 ]
        * [ -0.5a, 0,        0.5a,     0 ]
        * [ 1/6a,  1 - 1/3a, 1/6a,     0 ]
        */
        let m = new Pt_1.Group(new Pt_1.Pt(-0.16666666666666666, 0.5, -0.5, 0.16666666666666666), new Pt_1.Pt(-1.5, 2, 0, -0.3333333333333333), new Pt_1.Pt(1.5, -2.5, 0.5, 0.16666666666666666), new Pt_1.Pt(0.16666666666666666, 0, 0, 0));
        let h = LinearAlgebra_1.Mat.multiply([step], m, true)[0].multiply(tension);
        let h2 = (2 * step[0] - 3 * step[1] + 1);
        let h3 = -2 * step[0] + 3 * step[1];
        let pt = Curve._calcPt(ctrls, h);
        pt.x += h2 * ctrls[1].x + h3 * ctrls[2].x;
        pt.y += h2 * ctrls[1].y + h3 * ctrls[2].y;
        if (pt.length > 2)
            pt.z += h2 * ctrls[1].z + h3 * ctrls[2].z;
        return pt;
    }
}
exports.Curve = Curve;
//# sourceMappingURL=Op.js.map