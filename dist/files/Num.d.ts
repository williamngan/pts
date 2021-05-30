/*! Source code licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */
import { Pt, Group } from "./Pt";
import { PtLike, GroupLike, PtLikeIterable, PtIterable } from "./Types";
export declare class Num {
    static generator: any;
    static equals(a: number, b: number, threshold?: number): boolean;
    static lerp(a: number, b: number, t: number): number;
    static clamp(val: number, min: number, max: number): number;
    static boundValue(val: number, min: number, max: number): number;
    static within(p: number, a: number, b: number): boolean;
    static randomRange(a: number, b?: number): number;
    static randomPt(a: PtLike, b?: PtLike): Pt;
    static normalizeValue(n: number, a: number, b: number): number;
    static sum(pts: PtLikeIterable): Pt;
    static average(pts: PtLikeIterable): Pt;
    static cycle(t: number, method?: (t: number) => number): number;
    static mapToRange(n: number, currA: number, currB: number, targetA: number, targetB: number): number;
    static seed(seed: string): void;
    static random(): number;
}
export declare class Geom {
    static boundAngle(angle: number): number;
    static boundRadian(radian: number): number;
    static toRadian(angle: number): number;
    static toDegree(radian: number): number;
    static boundingBox(pts: PtIterable): Group;
    static centroid(pts: PtLikeIterable): Pt;
    static anchor(pts: PtLikeIterable, ptOrIndex?: PtLike | number, direction?: ("to" | "from")): void;
    static interpolate(a: PtLike, b: PtLike, t?: number): Pt;
    static perpendicular(pt: PtLike, axis?: string | PtLike): Group;
    static isPerpendicular(p1: PtLike, p2: PtLike): boolean;
    static withinBound(pt: PtLike, boundPt1: PtLike, boundPt2: PtLike): boolean;
    static sortEdges(pts: PtIterable): GroupLike;
    static scale(ps: Pt | PtIterable, scale: number | PtLike, anchor?: PtLike): Geom;
    static rotate2D(ps: Pt | PtIterable, angle: number, anchor?: PtLike, axis?: string | PtLike): Geom;
    static shear2D(ps: Pt | PtIterable, scale: number | PtLike, anchor?: PtLike, axis?: string | PtLike): Geom;
    static reflect2D(ps: Pt | PtIterable, line: PtLikeIterable, axis?: string | PtLike): Geom;
    static cosTable(): {
        table: Float64Array;
        cos: (rad: number) => number;
    };
    static sinTable(): {
        table: Float64Array;
        sin: (rad: number) => number;
    };
}
export declare class Shaping {
    static linear(t: number, c?: number): number;
    static quadraticIn(t: number, c?: number): number;
    static quadraticOut(t: number, c?: number): number;
    static quadraticInOut(t: number, c?: number): number;
    static cubicIn(t: number, c?: number): number;
    static cubicOut(t: number, c?: number): number;
    static cubicInOut(t: number, c?: number): number;
    static exponentialIn(t: number, c?: number, p?: number): number;
    static exponentialOut(t: number, c?: number, p?: number): number;
    static sineIn(t: number, c?: number): number;
    static sineOut(t: number, c?: number): number;
    static sineInOut(t: number, c?: number): number;
    static cosineApprox(t: number, c?: number): number;
    static circularIn(t: number, c?: number): number;
    static circularOut(t: number, c?: number): number;
    static circularInOut(t: number, c?: number): number;
    static elasticIn(t: number, c?: number, p?: number): number;
    static elasticOut(t: number, c?: number, p?: number): number;
    static elasticInOut(t: number, c?: number, p?: number): number;
    static bounceIn(t: number, c?: number): number;
    static bounceOut(t: number, c?: number): number;
    static bounceInOut(t: number, c?: number): number;
    static sigmoid(t: number, c?: number, p?: number): number;
    static logSigmoid(t: number, c?: number, p?: number): number;
    static seat(t: number, c?: number, p?: number): number;
    static quadraticBezier(t: number, c?: number, p?: number | PtLike): number;
    static cubicBezier(t: number, c?: number, p1?: PtLike, p2?: PtLike): number;
    static quadraticTarget(t: number, c?: number, p1?: PtLike): number;
    static cliff(t: number, c?: number, p?: number): number;
    static step(fn: Function, steps: number, t: number, c: number, ...args: any[]): any;
}
export declare class Range {
    protected _source: Group;
    protected _max: Pt;
    protected _min: Pt;
    protected _mag: Pt;
    protected _dims: number;
    constructor(g: PtIterable);
    get max(): Pt;
    get min(): Pt;
    get magnitude(): Pt;
    calc(): this;
    mapTo(min: number, max: number, exclude?: boolean[]): Group;
    append(pts: PtLikeIterable, update?: boolean): this;
    ticks(count: number): Group;
}
