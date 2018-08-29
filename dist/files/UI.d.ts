/*! Source code licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */
import { Group } from "./Pt";
import { UIHandler, GroupLike, PtLike } from "./Types";
export declare const UIShape: {
    rectangle: string;
    circle: string;
    polygon: string;
    polyline: string;
    line: string;
};
export declare const UIPointerActions: {
    up: string;
    down: string;
    move: string;
    drag: string;
    uidrag: string;
    drop: string;
    over: string;
    out: string;
    enter: string;
    leave: string;
    all: string;
};
export declare class UI {
    _group: Group;
    _shape: string;
    protected static _counter: number;
    protected _id: string;
    protected _actions: {
        [key: string]: UIHandler[];
    };
    protected _states: {
        [key: string]: any;
    };
    protected _holds: string[];
    constructor(group: GroupLike, shape: string, states?: {
        [key: string]: any;
    }, id?: string);
    static fromRectangle(group: GroupLike, states: {}, id?: string): UI;
    static fromCircle(group: GroupLike, states: {}, id?: string): UI;
    static fromPolygon(group: GroupLike, states: {}, id?: string): UI;
    static fromUI(ui: UI, states?: object, id?: string): UI;
    id: string;
    group: Group;
    shape: string;
    state(key: string, value?: any): any;
    on(key: string, fn: UIHandler): number;
    off(key: string, which?: number): boolean;
    listen(key: string, p: PtLike): boolean;
    protected hold(key: string): number;
    protected unhold(id?: number): void;
    static track(uis: UI[], key: string, p: PtLike): void;
    render(fn: (group: Group, states: {
        [key: string]: any;
    }) => void): void;
    toString(): string;
    protected _within(p: PtLike): boolean;
    protected static _trigger(fns: UIHandler[], target: UI, pt: PtLike, type: string): void;
    protected static _addHandler(fns: UIHandler[], fn: UIHandler): number;
    protected static _removeHandler(fns: UIHandler[], index: number): boolean;
}
export declare class UIButton extends UI {
    private _hoverID;
    constructor(group: GroupLike, shape: string, states?: {
        [key: string]: any;
    }, id?: string);
    onClick(fn: UIHandler): number;
    offClick(id: number): boolean;
    onHover(enter?: UIHandler, leave?: UIHandler): number[];
    offHover(enterID?: number, leaveID?: number): boolean[];
}
export declare class UIDragger extends UIButton {
    private _draggingID;
    private _moveHoldID;
    constructor(group: GroupLike, shape: string, states?: {
        [key: string]: any;
    }, id?: string);
    onDrag(fn: UIHandler): number;
    offDrag(id: number): boolean;
    onDrop(fn: UIHandler): number;
    offDrop(id: number): boolean;
}
