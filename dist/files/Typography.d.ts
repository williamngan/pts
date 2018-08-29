/*! Source code licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */
import { GroupLike } from "./Types";
export declare class Typography {
    static textWidthEstimator(fn: (string: any) => number, samples?: string[], distribution?: number[]): (string: any) => number;
    static truncate(fn: (string: any) => number, str: string, width: number, tail?: string): [string, number];
    static fontSizeToBox(box: GroupLike, ratio?: number, byHeight?: boolean): (GroupLike: any) => number;
    static fontSizeToThreshold(threshold: number, direction?: number): (a: number, b: number) => number;
}
