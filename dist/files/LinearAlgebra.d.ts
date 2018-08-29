/*! Source code licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */
import { Pt, Group } from "./Pt";
import { PtLike, GroupLike } from "./Types";
export declare class Vec {
    static add(a: PtLike, b: PtLike | number): PtLike;
    static subtract(a: PtLike, b: PtLike | number): PtLike;
    static multiply(a: PtLike, b: PtLike | number): PtLike;
    static divide(a: PtLike, b: PtLike | number): PtLike;
    static dot(a: PtLike, b: PtLike): number;
    static cross2D(a: PtLike, b: PtLike): number;
    static cross(a: PtLike, b: PtLike): Pt;
    static magnitude(a: PtLike): number;
    static unit(a: PtLike, magnitude?: number): PtLike;
    static abs(a: PtLike): PtLike;
    static floor(a: PtLike): PtLike;
    static ceil(a: PtLike): PtLike;
    static round(a: PtLike): PtLike;
    static max(a: PtLike): {
        value: any;
        index: any;
    };
    static min(a: PtLike): {
        value: any;
        index: any;
    };
    static sum(a: PtLike): number;
    static map(a: PtLike, fn: (n: number, index: number, arr: any) => number): PtLike;
}
export declare class Mat {
    static add(a: GroupLike, b: GroupLike | number[][] | number): Group;
    static multiply(a: GroupLike, b: GroupLike | number[][] | number, transposed?: boolean, elementwise?: boolean): Group;
    static zipSlice(g: GroupLike | number[][], index: number, defaultValue?: number | boolean): Pt;
    static zip(g: GroupLike | number[][], defaultValue?: number | boolean, useLongest?: boolean): Group;
    static transpose(g: GroupLike | number[][], defaultValue?: number | boolean, useLongest?: boolean): Group;
    static transform2D(pt: PtLike, m: GroupLike | number[][]): Pt;
    static scale2DMatrix(x: number, y: number): GroupLike;
    static rotate2DMatrix(cosA: number, sinA: number): GroupLike;
    static shear2DMatrix(tanX: number, tanY: number): GroupLike;
    static translate2DMatrix(x: number, y: number): GroupLike;
    static scaleAt2DMatrix(sx: number, sy: number, at: PtLike): GroupLike;
    static rotateAt2DMatrix(cosA: number, sinA: number, at: PtLike): GroupLike;
    static shearAt2DMatrix(tanX: number, tanY: number, at: PtLike): GroupLike;
    static reflectAt2DMatrix(p1: PtLike, p2: PtLike): Pt[];
}
