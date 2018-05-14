import { Pt, Group } from "./Pt";
export declare enum UIShape {
    Rectangle = 0,
    Circle = 1,
    Polygon = 2,
    Polyline = 3,
    Line = 4,
}
export declare const UIPointerActions: {
    up: string;
    down: string;
    move: string;
    drag: string;
    drop: string;
    over: string;
    out: string;
};
export declare type UIHandler = (pt: Pt, target: UI, type: string) => void;
export declare class UI {
    group: Group;
    shape: UIShape;
    protected _id: string;
    protected _actions: {
        [key: string]: UIHandler;
    };
    protected _states: {
        [key: string]: any;
    };
    constructor(group: Group, shape: UIShape, states: {}, id?: string);
    id: string;
    state(key: string): any;
    on(key: string, fn: UIHandler): this;
    off(key: string): this;
    listen(key: string, p: Pt): boolean;
    render(fn: (group: Group, states: {
        [key: string]: any;
    }) => void): void;
    protected _trigger(p: Pt): boolean;
}
export declare class UIButton extends UI {
    _clicks: number;
    constructor(group: Group, shape: UIShape, states: {}, id?: string);
    readonly clicks: number;
    onClick(fn: UIHandler): void;
    onHover(over: UIHandler, out: UIHandler): void;
}
