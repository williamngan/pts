/*! Source code licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */
import { Pt, Group } from "./Pt";
import { PtLike, GroupLike, PtLikeIterable, IntersectContext, PtIterable } from "./Types";
export declare class Line {
    static fromAngle(anchor: PtLike, angle: number, magnitude: number): Group;
    static slope(p1: PtLike, p2: PtLike): number;
    static intercept(p1: PtLike, p2: PtLike): {
        slope: number;
        xi: number;
        yi: number;
    };
    static sideOfPt2D(line: PtLikeIterable, pt: PtLike): number;
    static collinear(p1: PtLike, p2: PtLike, p3: PtLike, threshold?: number): boolean;
    static magnitude(line: PtIterable): number;
    static magnitudeSq(line: PtIterable): number;
    static perpendicularFromPt(line: PtIterable, pt: PtLike, asProjection?: boolean): Pt;
    static distanceFromPt(line: GroupLike, pt: PtLike | number[]): number;
    static intersectRay2D(la: PtIterable, lb: PtIterable): Pt;
    static intersectLine2D(la: PtIterable, lb: PtIterable): Pt;
    static intersectLineWithRay2D(line: PtIterable, ray: PtIterable): Pt;
    static intersectPolygon2D(lineOrRay: PtIterable, poly: PtIterable, sourceIsRay?: boolean): Group;
    static intersectLines2D(lines1: Iterable<PtIterable>, lines2: Iterable<PtIterable>, isRay?: boolean): Group;
    static intersectGridWithRay2D(ray: PtIterable, gridPt: PtLike): Group;
    static intersectGridWithLine2D(line: GroupLike, gridPt: PtLike | number[]): Group;
    static intersectRect2D(line: GroupLike, rect: GroupLike): Group;
    static subpoints(line: PtLikeIterable, num: number): Group;
    static crop(line: PtIterable, size: PtLike, index?: number, cropAsCircle?: boolean): Pt;
    static marker(line: PtIterable, size: PtLike, graphic?: string, atTail?: boolean): Group;
    static toRect(line: GroupLike): Group;
}
export declare class Rectangle {
    static from(topLeft: PtLike, widthOrSize: number | PtLike, height?: number): Group;
    static fromTopLeft(topLeft: PtLike, widthOrSize: number | PtLike, height?: number): Group;
    static fromCenter(center: PtLike, widthOrSize: number | PtLike, height?: number): Group;
    static toCircle(pts: PtIterable, within?: boolean): Group;
    static toSquare(pts: PtIterable, enclose?: boolean): Group;
    static size(pts: PtIterable): Pt;
    static center(pts: PtIterable): Pt;
    static corners(rect: PtIterable): Group;
    static sides(rect: PtIterable): Group[];
    static boundingBox(rects: Iterable<PtLikeIterable>): Group;
    static polygon(rect: PtIterable): Group;
    static quadrants(rect: PtIterable, center?: PtLike): Group[];
    static halves(rect: PtIterable, ratio?: number, asRows?: boolean): Group[];
    static withinBound(rect: GroupLike, pt: PtLike): boolean;
    static hasIntersectRect2D(rect1: GroupLike, rect2: GroupLike, resetBoundingBox?: boolean): boolean;
    static intersectRect2D(rect1: GroupLike, rect2: GroupLike): Group;
}
export declare class Circle {
    static fromRect(pts: PtLikeIterable, enclose?: boolean): Group;
    static fromTriangle(pts: PtIterable, enclose?: boolean): Group;
    static fromCenter(pt: PtLike, radius: number): Group;
    static withinBound(pts: PtIterable, pt: PtLike, threshold?: number): boolean;
    static intersectRay2D(circle: PtIterable, ray: PtIterable): Group;
    static intersectLine2D(circle: PtIterable, line: PtIterable): Group;
    static intersectCircle2D(circle1: PtIterable, circle2: PtIterable): Group;
    static intersectRect2D(circle: PtIterable, rect: PtIterable): Group;
    static toRect(circle: PtIterable, within?: boolean): Group;
    static toTriangle(circle: PtIterable, within?: boolean): Group;
}
export declare class Triangle {
    static fromRect(rect: PtIterable): Group;
    static fromCircle(circle: PtIterable): Group;
    static fromCenter(pt: PtLike, size: number): Group;
    static medial(tri: PtIterable): Group;
    static oppositeSide(tri: PtIterable, index: number): Group;
    static altitude(tri: PtIterable, index: number): Group;
    static orthocenter(tri: PtIterable): Pt;
    static incenter(tri: PtIterable): Pt;
    static incircle(tri: PtIterable, center?: Pt): Group;
    static circumcenter(tri: PtIterable): Pt;
    static circumcircle(tri: PtIterable, center?: Pt): Group;
}
export declare class Polygon {
    static centroid(pts: PtLikeIterable): Pt;
    static rectangle(center: PtLike, widthOrSize: number | PtLike, height?: number): Group;
    static fromCenter(center: PtLike, radius: number, sides: number): Group;
    static lineAt(pts: PtLikeIterable, index: number): Group;
    static lines(poly: PtIterable, closePath?: boolean): Group[];
    static midpoints(poly: PtIterable, closePath?: boolean, t?: number): Group;
    static adjacentSides(poly: PtIterable, index: number, closePath?: boolean): Group[];
    static bisector(poly: PtIterable, index: number): Pt;
    static perimeter(poly: PtIterable, closePath?: boolean): {
        total: number;
        segments: Pt;
    };
    static area(pts: PtLikeIterable): any;
    static convexHull(pts: PtLikeIterable, sorted?: boolean): Group;
    static network(poly: PtIterable, originIndex?: number): Group[];
    static nearestPt(poly: PtIterable, pt: PtLike): number;
    static projectAxis(poly: PtIterable, unitAxis: Pt): Pt;
    protected static _axisOverlap(poly1: PtIterable, poly2: PtIterable, unitAxis: Pt): number;
    static hasIntersectPoint(poly: PtLikeIterable, pt: PtLike): boolean;
    static hasIntersectCircle(poly: PtIterable, circle: PtIterable): IntersectContext;
    static hasIntersectPolygon(poly1: PtIterable, poly2: PtIterable): IntersectContext;
    static intersectPolygon2D(poly1: PtIterable, poly2: PtIterable): Group;
    static toRects(polys: Iterable<PtIterable>): Group[];
}
export declare class Curve {
    static getSteps(steps: number): Group;
    static controlPoints(pts: PtLikeIterable, index?: number, copyStart?: boolean): Group;
    static _calcPt(ctrls: GroupLike, params: PtLike): Pt;
    static catmullRom(pts: PtLikeIterable, steps?: number): Group;
    static catmullRomStep(step: Pt, ctrls: GroupLike): Pt;
    static cardinal(pts: PtLikeIterable, steps?: number, tension?: number): Group;
    static cardinalStep(step: Pt, ctrls: GroupLike, tension?: number): Pt;
    static bezier(pts: GroupLike, steps?: number): Group;
    static bezierStep(step: Pt, ctrls: GroupLike): Pt;
    static bspline(pts: GroupLike, steps?: number, tension?: number): Group;
    static bsplineStep(step: Pt, ctrls: GroupLike): Pt;
    static bsplineTensionStep(step: Pt, ctrls: GroupLike, tension?: number): Pt;
}
