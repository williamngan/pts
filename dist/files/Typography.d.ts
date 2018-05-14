import { GroupLike } from "./Pt";
export declare class Typography {
    static textWidthEstimator(fn: (string) => number, samples?: string[], distribution?: number[]): (string) => number;
    static truncate(fn: (string) => number, str: string, width: number, tail?: string): [string, number];
    static fontSizeToBox(box: GroupLike, ratio?: number, byHeight?: boolean): (GroupLike) => number;
    static fontSizeToThreshold(threshold: number, direction?: number): (a: number, b: number) => number;
}
