/*! Source code licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */
import { Pt } from "./Pt";
import { PtLike, GroupLike } from "./Types";
export declare abstract class Form {
    protected _ready: boolean;
    readonly ready: boolean;
    static _checkSize(pts: GroupLike | number[][], required?: number): boolean;
}
export declare abstract class VisualForm extends Form {
    protected _filled: boolean;
    filled: boolean;
    protected _stroked: boolean;
    stroked: boolean;
    protected _font: Font;
    readonly currentFont: Font;
    protected _multiple(groups: GroupLike[], shape: string, ...rest: any[]): this;
    abstract reset(): this;
    alpha(a: number): this;
    fill(c: string | boolean): this;
    fillOnly(c: string | boolean): this;
    stroke(c: string | boolean, width?: number, linejoin?: string, linecap?: string): this;
    strokeOnly(c: string | boolean, width?: number, linejoin?: string, linecap?: string): this;
    abstract point(p: PtLike, radius: number, shape: string): this;
    points(pts: GroupLike | number[][], radius: number, shape: string): this;
    abstract circle(pts: GroupLike | number[][]): this;
    circles(groups: GroupLike[]): this;
    squares(groups: GroupLike[]): this;
    abstract arc(pt: PtLike, radius: number, startAngle: number, endAngle: number, cc?: boolean): this;
    abstract line(pts: GroupLike | number[][]): this;
    lines(groups: GroupLike[]): this;
    abstract polygon(pts: GroupLike | number[][]): this;
    polygons(groups: GroupLike[]): this;
    abstract rect(pts: number[][] | Pt[]): this;
    rects(groups: GroupLike[]): this;
    abstract text(pt: PtLike, txt: string, maxWidth?: number): this;
    abstract font(sizeOrFont: number | Font, weight?: string, style?: string, lineHeight?: number, family?: string): this;
}
export declare class Font {
    size: number;
    lineHeight: number;
    face: string;
    style: string;
    weight: string;
    constructor(size?: number, face?: string, weight?: string, style?: string, lineHeight?: number);
    readonly value: string;
    toString(): string;
}
