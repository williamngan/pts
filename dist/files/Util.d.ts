/*! Source code licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */
import { WarningType } from "./Types";
export declare const Const: {
    xy: string;
    yz: string;
    xz: string;
    xyz: string;
    horizontal: number;
    vertical: number;
    identical: number;
    right: number;
    bottom_right: number;
    bottom: number;
    bottom_left: number;
    left: number;
    top_left: number;
    top: number;
    top_right: number;
    epsilon: number;
    max: number;
    min: number;
    pi: number;
    two_pi: number;
    half_pi: number;
    quarter_pi: number;
    one_degree: number;
    rad_to_deg: number;
    deg_to_rad: number;
    gravity: number;
    newton: number;
    gaussian: number;
};
export declare class Util {
    static _warnLevel: WarningType;
    static warnLevel(lv?: WarningType): WarningType;
    static getArgs(args: any[]): Array<number>;
    static warn(message?: string, defaultReturn?: any): any;
    static randomInt(range: number, start?: number): number;
    static split(pts: any[], size: number, stride?: number, loopBack?: boolean, matchSize?: boolean): any[][];
    static flatten(pts: any[], flattenAsGroup?: boolean): any;
    static combine<T>(a: T[], b: T[], op: (a: T, b: T) => T): T[];
    static zip(arrays: Array<any>[]): any[];
    static stepper(max: number, min?: number, stride?: number, callback?: (n: number) => void): (() => number);
    static forRange(fn: (index: number) => any, range: number, start?: number, step?: number): any[];
    static load(url: string, callback: (response: string, success: boolean) => void): void;
}
