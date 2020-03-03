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
    resize?(bound: Bound, evt?: Event): void;
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
};
export declare type IntersectContext = {
    which: number;
    dist: number;
    normal: Pt;
    vertex: Pt;
    edge: Group;
    other?: any;
};
export declare type UIHandler = (target: UI, pt: PtLike, type: string, evt: MouseEvent) => void;
export declare type WarningType = "error" | "warn" | "mute";
export declare type ITempoStartFn = (count: number) => void | boolean;
export declare type ITempoProgressFn = (count: number, t: number, ms: number, start: boolean) => void | boolean;
export declare type ITempoListener = {
    name?: string;
    beats?: number | number[];
    period?: number;
    duration?: number;
    offset?: number;
    continuous?: boolean;
    index?: number;
    fn: Function;
};
export declare type ITempoResponses = {
    start: (fn: ITempoStartFn, offset: number, name?: string) => string;
    progress: (fn: ITempoProgressFn, offset: number, name?: string) => string;
};
export declare type ISoundAnalyzer = {
    node: AnalyserNode;
    size: number;
    data: Uint8Array;
};
export declare type SoundType = "file" | "gen" | "input";
export declare type DefaultFormStyle = {
    fillStyle?: string | CanvasGradient | CanvasPattern;
    strokeStyle?: string | CanvasGradient | CanvasPattern;
    lineWidth?: number;
    lineJoin?: string;
    lineCap?: string;
    globalAlpha?: number;
};
