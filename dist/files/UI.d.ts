import { Pt, Group } from "./Pt";
/**
 * An enumeration of different UI types
 */
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
/**
 * UIListener type
 */
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
    /**
     * Wrap an UI insider a group
     */
    constructor(group: Group, shape: UIShape, states: {}, id?: string);
    /**
     * Get and set uique id
     */
    id: string;
    /**
     * Get a state
     * @param key state's name
     */
    state(key: string): any;
    /**
     * Add an event handler
     * @param key event key
     * @param fn handler function
     */
    on(key: string, fn: UIHandler): this;
    /**
     * Remove an event handler
     * @param key even key
     * @param fn
     */
    off(key: string): this;
    /**
     * Listen for interactions and trigger action handlers
     * @param key action key
     * @param p point to check
     */
    listen(key: string, p: Pt): boolean;
    /**
     * Take a custom render function to render this UI
     * @param fn render function
     */
    render(fn: (group: Group, states: {
        [key: string]: any;
    }) => void): void;
    /**
     * Check intersection using a specific function based on UIShape
     * @param p a point to check
     */
    protected _trigger(p: Pt): boolean;
}
/**
 * A simple UI button that can track clicks and hovers
 */
export declare class UIButton extends UI {
    _clicks: number;
    constructor(group: Group, shape: UIShape, states: {}, id?: string);
    /**
     * Get the total number of clicks on this UIButton
     */
    readonly clicks: number;
    /**
     * Add a click handler
     * @param fn a function to handle clicks
     */
    onClick(fn: UIHandler): void;
    /**
     * Add hover handler
     * @param over a function to handle when pointer enters hover
     * @param out a function to handle when pointer exits hover
     */
    onHover(over: UIHandler, out: UIHandler): void;
}
