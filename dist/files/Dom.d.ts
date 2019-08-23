/*! Source code licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */
import { MultiTouchSpace } from './Space';
import { Form, VisualForm, Font } from "./Form";
import { Pt, Bound } from './Pt';
import { PtLike, GroupLike, IPlayer, DOMFormContext } from "./Types";
export declare class DOMSpace extends MultiTouchSpace {
    protected _canvas: HTMLElement | SVGElement;
    protected _container: Element;
    id: string;
    protected _autoResize: boolean;
    protected _bgcolor: string;
    protected _css: {};
    constructor(elem: string | Element, callback?: Function);
    static createElement(elem: string, id: string, appendTo?: Element): Element;
    private _ready;
    setup(opt: {
        bgcolor?: string;
        resize?: boolean;
    }): this;
    getForm(): Form;
    autoResize: boolean;
    resize(b: Bound, evt?: Event): this;
    protected _resizeHandler(evt: Event): void;
    readonly element: Element;
    readonly parent: Element;
    readonly ready: boolean;
    clear(bg?: string): this;
    background: string;
    style(key: string, val: string, update?: boolean): this;
    styles(styles: object, update?: boolean): this;
    static setAttr(elem: Element, data: object): Element;
    static getInlineStyles(data: object): string;
}
export declare class HTMLSpace extends DOMSpace {
    getForm(): Form;
    static htmlElement(parent: Element, name: string, id?: string, autoClass?: boolean): HTMLElement;
    remove(player: IPlayer): this;
    removeAll(): this;
}
export declare class HTMLForm extends VisualForm {
    protected _style: {
        "filled": boolean;
        "stroked": boolean;
        "background": string;
        "border-color": string;
        "color": string;
        "border-width": string;
        "border-radius": string;
        "border-style": string;
        "opacity": number;
        "position": string;
        "top": number;
        "left": number;
        "width": number;
        "height": number;
    };
    protected _ctx: DOMFormContext;
    static groupID: number;
    static domID: number;
    protected _space: HTMLSpace;
    protected _ready: boolean;
    constructor(space: HTMLSpace);
    readonly space: HTMLSpace;
    protected styleTo(k: any, v: any, unit?: string): void;
    alpha(a: number): this;
    fill(c: string | boolean): this;
    stroke(c: string | boolean, width?: number, linejoin?: string, linecap?: string): this;
    fillText(c: string): this;
    cls(c: string | boolean): this;
    font(sizeOrFont: number | Font, weight?: string, style?: string, lineHeight?: number, family?: string): this;
    reset(): this;
    updateScope(group_id: string, group?: Element): object;
    scope(item: IPlayer): object;
    nextID(): string;
    static getID(ctx: any): string;
    static scopeID(item: IPlayer): string;
    static style(elem: Element, styles: object): Element;
    static rectStyle(ctx: DOMFormContext, pt: PtLike, size: PtLike): DOMFormContext;
    static textStyle(ctx: DOMFormContext, pt: PtLike): DOMFormContext;
    static point(ctx: DOMFormContext, pt: PtLike, radius?: number, shape?: string): Element;
    point(pt: PtLike, radius?: number, shape?: string): this;
    static circle(ctx: DOMFormContext, pt: PtLike, radius?: number): Element;
    circle(pts: GroupLike | number[][]): this;
    static square(ctx: DOMFormContext, pt: PtLike, halfsize: number): HTMLElement;
    square(pt: PtLike, halfsize: number): this;
    static rect(ctx: DOMFormContext, pts: GroupLike | number[][]): Element;
    rect(pts: number[][] | Pt[]): this;
    static text(ctx: DOMFormContext, pt: PtLike, txt: string): Element;
    text(pt: PtLike, txt: string): this;
    log(txt: any): this;
    arc(pt: PtLike, radius: number, startAngle: number, endAngle: number, cc?: boolean): this;
    line(pts: GroupLike | number[][]): this;
    polygon(pts: GroupLike | number[][]): this;
}
