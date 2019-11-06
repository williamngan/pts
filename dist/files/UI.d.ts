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
    uidrop: string;
    over: string;
    out: string;
    enter: string;
    leave: string;
    contextmenu: string;
    all: string;
};
export declare class UI {
    _group: Group;
    _shape: string;
    protected static _counter: number;
    protected _id: string;
    protected _actions: {
        [type: string]: UIHandler[];
    };
    protected _states: {
        [key: string]: any;
    };
    protected _holds: Map<number, string>;
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
    on(type: string, fn: UIHandler): number;
    off(type: string, which?: number): boolean;
    listen(type: string, p: PtLike, evt: MouseEvent): boolean;
    protected hold(type: string): number;
    protected unhold(key?: number): void;
    static track(uis: UI[], type: string, p: PtLike, evt: MouseEvent): void;
    render(fn: (group: Group, states: {
        [key: string]: any;
    }) => void): void;
    toString(): string;
    protected _within(p: PtLike): boolean;
    protected static _trigger(fns: UIHandler[], target: UI, pt: PtLike, type: string, evt: MouseEvent): void;
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
    onContextMenu(fn: UIHandler): number;
    offContextMenu(id: number): boolean;
    onHover(enter?: UIHandler, leave?: UIHandler): number[];
    offHover(enterID?: number, leaveID?: number): boolean[];
}
export declare class UIDragger extends UIButton {
    private _draggingID;
    private _moveHoldID;
    private _dropHoldID;
    private _upHoldID;
    constructor(group: GroupLike, shape: string, states?: {
        [key: string]: any;
    }, id?: string);
    onDrag(fn: UIHandler): number;
    offDrag(id: number): boolean;
    onDrop(fn: UIHandler): number;
    offDrop(id: number): boolean;
}
