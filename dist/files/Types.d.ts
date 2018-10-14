/*! Source code licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */
import { Pt, Group, Bound } from "./Pt";
import { Space } from "./Space";
import { UI } from "./UI";
export interface IPt {
    x?: number;
    y?: number;
    z?: number;
    w?: number;
}
export declare type PtLike = Pt | Float32Array | number[];
export declare type GroupLike = Group | Pt[];
export declare type AnimateCallbackFn = (time?: number, frameTime?: number, currentSpace?: any) => void;
export interface IPlayer {
    animateID?: string;
    animate?: AnimateCallbackFn;
    resize?(size: Bound, evt?: Event): void;
    action?(type: string, px: number, py: number, evt: Event): void;
    start?(bound: Bound, space: Space): void;
}
export interface ISpacePlayers {
    [key: string]: IPlayer;
}
export interface ITimer {
    prev: number;
    diff: number;
    end: number;
}
export declare type TouchPointsKey = "touches" | "changedTouches" | "targetTouches";
export interface MultiTouchElement {
    addEventListener(evt: any, callback: Function): any;
    removeEventListener(evt: any, callback: Function): any;
}
export interface PtsCanvasRenderingContext2D extends CanvasRenderingContext2D {
    webkitBackingStorePixelRatio?: number;
    mozBackingStorePixelRatio?: number;
    msBackingStorePixelRatio?: number;
    oBackingStorePixelRatio?: number;
    backingStorePixelRatio?: number;
}
export declare type ColorType = "rgb" | "hsl" | "hsb" | "lab" | "lch" | "luv" | "xyz";
export declare type DelaunayShape = {
    i: number;
    j: number;
    k: number;
    triangle: GroupLike;
    circle: Group;
};
export declare type DelaunayMesh = {
    [key: string]: DelaunayShape;
}[];
export declare type DOMFormContext = {
    group: Element;
    groupID: string;
    groupCount: number;
    currentID: string;
    currentClass?: string;
    style: object;
    font: string;
    fontSize: number;
    fontFamily: string;
};
export declare type IntersectContext = {
    which: number;
    dist: number;
    normal: Pt;
    vertex: Pt;
    edge: Group;
    other?: any;
};
export declare type UIHandler = (target: UI, pt: PtLike, type: string) => void;
export declare type WarningType = "error" | "warn" | "mute";
