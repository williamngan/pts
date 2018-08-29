/*! Source code licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */
import { Pt, Group } from "./Pt";
import { PtLike, GroupLike, IntersectContext } from "./Types";
export declare class Line {
    static fromAngle(anchor: PtLike, angle: number, magnitude: number): Group;
    static slope(p1: PtLike | number[], p2: PtLike | number[]): number;
    static intercept(p1: PtLike | number[], p2: PtLike | number[]): {
        slope: number;
        xi: number;
        yi: number;
    };
    static sideOfPt2D(line: GroupLike, pt: PtLike): number;
    static collinear(p1: PtLike | number[], p2: PtLike | number[], p3: PtLike | number[], threshold?: number): boolean;
    static magnitude(line: GroupLike): number;
    static magnitudeSq(line: GroupLike): number;
    static perpendicularFromPt(line: GroupLike, pt: PtLike | number[], asProjection?: boolean): Pt;
    static distanceFromPt(line: GroupLike, pt: PtLike | number[]): number;
    static intersectRay2D(la: GroupLike, lb: GroupLike): Pt;
    static intersectLine2D(la: GroupLike, lb: GroupLike): Pt;
    static intersectLineWithRay2D(line: GroupLike, ray: GroupLike): Pt;
    static intersectPolygon2D(lineOrRay: GroupLike, poly: GroupLike, sourceIsRay?: boolean): Group;
    static intersectLines2D(lines1: GroupLike[], lines2: GroupLike[], isRay?: boolean): Group;
    static intersectGridWithRay2D(ray: GroupLike, gridPt: PtLike | number[]): Group;
    static intersectGridWithLine2D(line: GroupLike, gridPt: PtLike | number[]): Group;
    static intersectRect2D(line: GroupLike, rect: GroupLike): Group;
    static subpoints(line: GroupLike | number[][], num: number): Group;
    static crop(line: GroupLike, size: PtLike, index?: number, cropAsCircle?: boolean): Pt;
    static marker(line: GroupLike, size: PtLike, graphic?: string, atTail?: boolean): Group;
    static toRect(line: GroupLike): Group;
}
export declare class Rectangle {
    static from(topLeft: PtLike | number[], widthOrSize: number | PtLike, height?: number): Group;
    static fromTopLeft(topLeft: PtLike | number[], widthOrSize: number | PtLike, height?: number): Group;
    static fromCenter(center: PtLike | number[], widthOrSize: number | PtLike, height?: number): Group;
    static toCircle(pts: GroupLike, within?: boolean): Group;
    static toSquare(pts: GroupLike, enclose?: boolean): Group;
    static size(pts: GroupLike): Pt;
    static center(pts: GroupLike): Pt;
    static corners(rect: GroupLike): Group;
    static sides(rect: GroupLike): Group[];
    static boundingBox(rects: GroupLike[]): Group;
    static polygon(rect: GroupLike): Group;
    static quadrants(rect: GroupLike, center?: PtLike): Group[];
    static halves(rect: GroupLike, ratio?: number, asRows?: boolean): Group[];
    static withinBound(rect: GroupLike, pt: PtLike): boolean;
    static hasIntersectRect2D(rect1: GroupLike, rect2: GroupLike, resetBoundingBox?: boolean): boolean;
    static intersectRect2D(rect1: GroupLike, rect2: GroupLike): Group;
}
export declare class Circle {
    static fromRect(pts: GroupLike, enclose?: boolean): Group;
    static fromTriangle(pts: GroupLike, enclose?: boolean): Group;
    static fromCenter(pt: PtLike, radius: number): Group;
    static withinBound(pts: GroupLike, pt: PtLike, threshold?: number): boolean;
    static intersectRay2D(pts: GroupLike, ray: GroupLike): Group;
    static intersectLine2D(pts: GroupLike, line: GroupLike): Group;
    static intersectCircle2D(pts: GroupLike, circle: GroupLike): Group;
    static intersectRect2D(pts: GroupLike, rect: GroupLike): Group;
    static toRect(pts: GroupLike, within?: boolean): Group;
    static toTriangle(pts: GroupLike, within?: boolean): Group;
}
export declare class Triangle {
    static fromRect(rect: GroupLike): Group;
    static fromCircle(circle: GroupLike): Group;
    static fromCenter(pt: PtLike, size: number): Group;
    static medial(pts: GroupLike): Group;
    static oppositeSide(pts: GroupLike, index: number): Group;
    static altitude(pts: GroupLike, index: number): Group;
    static orthocenter(pts: GroupLike): Pt;
    static incenter(pts: GroupLike): Pt;
    static incircle(pts: GroupLike, center?: Pt): Group;
    static circumcenter(pts: GroupLike): Pt;
    static circumcircle(pts: GroupLike, center?: Pt): Group;
}
export declare class Polygon {
    static centroid(pts: GroupLike): Pt;
    static rectangle(center: PtLike, widthOrSize: number | PtLike, height?: number): Group;
    static fromCenter(center: PtLike, radius: number, sides: number): Group;
    static lineAt(pts: GroupLike, idx: number): Group;
    static lines(pts: GroupLike, closePath?: boolean): Group[];
    static midpoints(pts: GroupLike, closePath?: boolean, t?: number): Group;
    static adjacentSides(pts: GroupLike, index: number, closePath?: boolean): Group[];
    static bisector(pts: GroupLike, index: number): Pt;
    static perimeter(pts: GroupLike, closePath?: boolean): {
        total: number;
        segments: Pt;
    };
    static area(pts: GroupLike): any;
    static convexHull(pts: GroupLike, sorted?: boolean): Group;
    static network(pts: GroupLike, originIndex?: number): Group[];
    static nearestPt(pts: GroupLike, pt: PtLike): number;
    static projectAxis(poly: GroupLike, unitAxis: Pt): Pt;
    protected static _axisOverlap(poly1: any, poly2: any, unitAxis: any): number;
    static hasIntersectPoint(poly: GroupLike, pt: PtLike): boolean;
    static hasIntersectCircle(poly: GroupLike, circle: GroupLike): IntersectContext;
    static hasIntersectPolygon(poly1: GroupLike, poly2: GroupLike): IntersectContext;
    static intersectPolygon2D(poly1: GroupLike, poly2: GroupLike): Group;
    static toRects(polys: GroupLike[]): GroupLike[];
}
export declare class Curve {
    static getSteps(steps: number): Group;
    static controlPoints(pts: GroupLike, index?: number, copyStart?: boolean): Group;
    static _calcPt(ctrls: GroupLike, params: PtLike): Pt;
    static catmullRom(pts: GroupLike, steps?: number): Group;
    static catmullRomStep(step: Pt, ctrls: GroupLike): Pt;
    static cardinal(pts: GroupLike, steps?: number, tension?: number): Group;
    static cardinalStep(step: Pt, ctrls: GroupLike, tension?: number): Pt;
    static bezier(pts: GroupLike, steps?: number): Group;
    static bezierStep(step: Pt, ctrls: GroupLike): Pt;
    static bspline(pts: GroupLike, steps?: number, tension?: number): Group;
    static bsplineStep(step: Pt, ctrls: GroupLike): Pt;
    static bsplineTensionStep(step: Pt, ctrls: GroupLike, tension?: number): Pt;
}
