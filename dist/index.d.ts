/*! Pts.js is licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */

declare const UIShape: {
    rectangle: string;
    circle: string;
    polygon: string;
    polyline: string;
    line: string;
};
declare const UIPointerActions: {
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
    click: string;
    keydown: string;
    keyup: string;
    contextmenu: string;
    all: string;
};
declare class UI {
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
    constructor(group: PtLikeIterable, shape: string, states?: {
        [key: string]: any;
    }, id?: string);
    static fromRectangle(group: PtLikeIterable, states: {}, id?: string): UI;
    static fromCircle(group: PtLikeIterable, states: {}, id?: string): UI;
    static fromPolygon(group: PtLikeIterable, states: {}, id?: string): UI;
    static fromUI(ui: UI, states?: object, id?: string): UI;
    get id(): string;
    set id(d: string);
    get group(): Group;
    set group(d: Group);
    get shape(): string;
    set shape(d: string);
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
declare class UIButton extends UI {
    private _hoverID;
    constructor(group: PtLikeIterable, shape: string, states?: {
        [key: string]: any;
    }, id?: string);
    onClick(fn: UIHandler): number;
    offClick(id: number): boolean;
    onContextMenu(fn: UIHandler): number;
    offContextMenu(id: number): boolean;
    onHover(enter?: UIHandler, leave?: UIHandler): number[];
    offHover(enterID?: number, leaveID?: number): boolean[];
}
declare class UIDragger extends UIButton {
    private _draggingID;
    private _moveHoldID;
    private _dropHoldID;
    private _upHoldID;
    constructor(group: PtLikeIterable, shape: string, states?: {
        [key: string]: any;
    }, id?: string);
    onDrag(fn: UIHandler): number;
    offDrag(id: number): boolean;
    onDrop(fn: UIHandler): number;
    offDrop(id: number): boolean;
}

/*! Pts.js is licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */

interface IPt {
    x?: number;
    y?: number;
    z?: number;
    w?: number;
}
declare type PtLike = Pt | Float32Array | number[];
declare type GroupLike = Group | Pt[];
declare type PtIterable = GroupLike | Pt[] | Iterable<Pt>;
declare type PtLikeIterable = GroupLike | PtLike[] | Iterable<PtLike>;
declare type AnimateCallbackFn = (time?: number, frameTime?: number, currentSpace?: any) => void;
interface IPlayer {
    animateID?: string;
    animate?: AnimateCallbackFn;
    resize?(bound: Bound, evt?: Event): void;
    action?(type: string, px: number, py: number, evt: Event): void;
    start?(bound: Bound, space: Space): void;
}
interface ISpacePlayers {
    [key: string]: IPlayer;
}
interface ITimer {
    prev: number;
    diff: number;
    end: number;
    min: number;
}
declare type TouchPointsKey = "touches" | "changedTouches" | "targetTouches";
interface MultiTouchElement {
    addEventListener(evt: any, callback: Function): any;
    removeEventListener(evt: any, callback: Function): any;
}
interface PtsCanvasRenderingContext2D extends CanvasRenderingContext2D {
    webkitBackingStorePixelRatio?: number;
    mozBackingStorePixelRatio?: number;
    msBackingStorePixelRatio?: number;
    oBackingStorePixelRatio?: number;
    backingStorePixelRatio?: number;
}
declare type CanvasSpaceOptions = {
    bgcolor?: string;
    resize?: boolean;
    retina?: boolean;
    offscreen?: boolean;
    pixelDensity?: number;
};
declare type ColorType = "rgb" | "hsl" | "hsb" | "lab" | "lch" | "luv" | "xyz";
declare type DelaunayShape = {
    i: number;
    j: number;
    k: number;
    triangle: GroupLike;
    circle: Group;
};
declare type DelaunayMesh = {
    [key: string]: DelaunayShape;
}[];
declare type DOMFormContext = {
    group: Element;
    groupID: string;
    groupCount: number;
    currentID: string;
    currentClass?: string;
    style: object;
};
declare type IntersectContext = {
    which: number;
    dist: number;
    normal: Pt;
    vertex: Pt;
    edge: Group;
    other?: any;
};
declare type UIHandler = (target: UI, pt: PtLike, type: string, evt: MouseEvent) => void;
declare type WarningType = "error" | "warn" | "mute";
declare type ITempoStartFn = (count: number) => void | boolean;
declare type ITempoProgressFn = (count: number, t: number, ms: number, start: boolean) => void | boolean;
declare type ITempoListener = {
    name?: string;
    beats?: number | number[];
    period?: number;
    duration?: number;
    offset?: number;
    continuous?: boolean;
    index?: number;
    fn: Function;
};
declare type ITempoResponses = {
    start: (fn: ITempoStartFn, offset: number, name?: string) => string;
    progress: (fn: ITempoProgressFn, offset: number, name?: string) => string;
};
declare type ISoundAnalyzer = {
    node: AnalyserNode;
    size: number;
    data: Uint8Array;
};
declare type SoundType = "file" | "gen" | "input";
declare type DefaultFormStyle = {
    fillStyle?: string | CanvasGradient | CanvasPattern;
    strokeStyle?: string | CanvasGradient | CanvasPattern;
    lineWidth?: number;
    lineJoin?: string;
    lineCap?: string;
    globalAlpha?: number;
};
declare type CanvasPatternRepetition = "repeat" | "repeat-x" | "repeat-y" | "no-repeat";

/*! Pts.js is licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */

declare class Pt extends Float32Array implements IPt, Iterable<number> {
    protected _id: string;
    constructor(...args: any[]);
    static make(dimensions: number, defaultValue?: number, randomize?: boolean): Pt;
    get id(): string;
    set id(s: string);
    get x(): number;
    set x(n: number);
    get y(): number;
    set y(n: number);
    get z(): number;
    set z(n: number);
    get w(): number;
    set w(n: number);
    clone(): Pt;
    equals(p: PtLike, threshold?: number): boolean;
    to(...args: any[]): this;
    $to(...args: any[]): Pt;
    toAngle(radian: number, magnitude?: number, anchorFromPt?: boolean): this;
    op(fn: (p1: PtLike, ...rest: any[]) => any): (...rest: any[]) => any;
    ops(fns: ((p1: PtLike, ...rest: any[]) => any)[]): ((...rest: any[]) => any)[];
    $take(axis: string | number[]): Pt;
    $concat(...args: any[]): Pt;
    add(...args: any[]): this;
    $add(...args: any[]): Pt;
    subtract(...args: any[]): this;
    $subtract(...args: any[]): Pt;
    multiply(...args: any[]): this;
    $multiply(...args: any[]): Pt;
    divide(...args: any[]): this;
    $divide(...args: any[]): Pt;
    magnitudeSq(): number;
    magnitude(): number;
    unit(magnitude?: number): Pt;
    $unit(magnitude?: number): Pt;
    dot(...args: any[]): number;
    $cross2D(...args: any[]): number;
    $cross(...args: any[]): Pt;
    $project(...args: any[]): Pt;
    projectScalar(...args: any[]): number;
    abs(): Pt;
    $abs(): Pt;
    floor(): Pt;
    $floor(): Pt;
    ceil(): Pt;
    $ceil(): Pt;
    round(): Pt;
    $round(): Pt;
    minValue(): {
        value: number;
        index: number;
    };
    maxValue(): {
        value: number;
        index: number;
    };
    $min(...args: any[]): Pt;
    $max(...args: any[]): Pt;
    angle(axis?: string | number[]): number;
    angleBetween(p: Pt, axis?: string | number[]): number;
    scale(scale: number | number[] | PtLike, anchor?: PtLike): this;
    rotate2D(angle: number, anchor?: PtLike, axis?: string): this;
    shear2D(scale: number | number[] | PtLike, anchor?: PtLike, axis?: string): this;
    reflect2D(line: GroupLike, axis?: string): this;
    toString(): string;
    toArray(): number[];
    toGroup(): Group;
    toBound(): Bound;
}
declare class Group extends Array<Pt> {
    protected _id: string;
    constructor(...args: Pt[]);
    get id(): string;
    set id(s: string);
    get p1(): Pt;
    get p2(): Pt;
    get p3(): Pt;
    get p4(): Pt;
    get q1(): Pt;
    get q2(): Pt;
    get q3(): Pt;
    get q4(): Pt;
    clone(): Group;
    static fromArray(list: PtLikeIterable): Group;
    static fromPtArray(list: PtIterable): Group;
    split(chunkSize: number, stride?: number, loopBack?: boolean): Group[];
    insert(pts: PtIterable, index?: number): this;
    remove(index?: number, count?: number): Group;
    segments(pts_per_segment?: number, stride?: number, loopBack?: boolean): Group[];
    lines(): Group[];
    centroid(): Pt;
    boundingBox(): Group;
    anchorTo(ptOrIndex?: PtLike | number): void;
    anchorFrom(ptOrIndex?: PtLike | number): void;
    op(fn: (g1: PtIterable, ...rest: any[]) => any): (...rest: any[]) => any;
    ops(fns: ((g1: PtIterable, ...rest: any[]) => any)[]): ((...rest: any[]) => any)[];
    interpolate(t: number): Pt;
    moveBy(...args: any[]): this;
    moveTo(...args: any[]): this;
    scale(scale: number | number[] | PtLike, anchor?: PtLike): this;
    rotate2D(angle: number, anchor?: PtLike, axis?: string): this;
    shear2D(scale: number | number[] | PtLike, anchor?: PtLike, axis?: string): this;
    reflect2D(line: PtLikeIterable, axis?: string): this;
    sortByDimension(dim: number, desc?: boolean): this;
    forEachPt(ptFn: string, ...args: any[]): this;
    add(...args: any[]): this;
    subtract(...args: any[]): this;
    multiply(...args: any[]): this;
    divide(...args: any[]): this;
    $matrixAdd(g: GroupLike | number[][] | number): Group;
    $matrixMultiply(g: GroupLike | number, transposed?: boolean, elementwise?: boolean): Group;
    zipSlice(index: number, defaultValue?: number | boolean): Pt;
    $zip(defaultValue?: number | boolean, useLongest?: boolean): Group;
    toBound(): Group;
    toString(): string;
}
declare class Bound extends Group implements IPt {
    protected _center: Pt;
    protected _size: Pt;
    protected _topLeft: Pt;
    protected _bottomRight: Pt;
    protected _inited: boolean;
    constructor(...args: Pt[]);
    static fromBoundingRect(rect: ClientRect): Bound;
    static fromGroup(g: PtLikeIterable): Bound;
    protected init(): void;
    clone(): Bound;
    protected _updateSize(): void;
    protected _updateCenter(): void;
    protected _updatePosFromTop(): void;
    protected _updatePosFromBottom(): void;
    protected _updatePosFromCenter(): void;
    get size(): Pt;
    set size(p: Pt);
    get center(): Pt;
    set center(p: Pt);
    get topLeft(): Pt;
    set topLeft(p: Pt);
    get bottomRight(): Pt;
    set bottomRight(p: Pt);
    get width(): number;
    set width(w: number);
    get height(): number;
    set height(h: number);
    get depth(): number;
    set depth(d: number);
    get x(): number;
    get y(): number;
    get z(): number;
    get inited(): boolean;
    update(): this;
}

/*! Pts.js is licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */

declare abstract class Form {
    protected _ready: boolean;
    get ready(): boolean;
}
declare abstract class VisualForm extends Form {
    protected _filled: boolean;
    protected _stroked: boolean;
    protected _font: Font;
    get filled(): boolean;
    set filled(b: boolean);
    get stroked(): boolean;
    set stroked(b: boolean);
    get currentFont(): Font;
    protected _multiple(groups: GroupLike[], shape: string, ...rest: any[]): this;
    abstract reset(): this;
    alpha(a: number): this;
    fill(c: string | boolean): this;
    fillOnly(c: string | boolean): this;
    stroke(c: string | boolean, width?: number, linejoin?: string, linecap?: string): this;
    strokeOnly(c: string | boolean, width?: number, linejoin?: string, linecap?: string): this;
    abstract point(p: PtLike, radius: number, shape: string): this;
    points(pts: GroupLike | number[][], radius: number, shape: string): this;
    abstract circle(pts: GroupLike | number[][]): this;
    circles(groups: GroupLike[]): this;
    squares(groups: GroupLike[]): this;
    abstract arc(pt: PtLike, radius: number, startAngle: number, endAngle: number, cc?: boolean): this;
    abstract line(pts: GroupLike | number[][]): this;
    lines(groups: GroupLike[]): this;
    abstract polygon(pts: GroupLike | number[][]): this;
    polygons(groups: GroupLike[]): this;
    abstract rect(pts: number[][] | Pt[]): this;
    rects(groups: GroupLike[]): this;
    abstract text(pt: PtLike, txt: string, maxWidth?: number): this;
    abstract font(sizeOrFont: number | Font, weight?: string, style?: string, lineHeight?: number, family?: string): this;
}
declare class Font {
    size: number;
    lineHeight: number;
    face: string;
    style: string;
    weight: string;
    constructor(size?: number, face?: string, weight?: string, style?: string, lineHeight?: number);
    get value(): string;
    toString(): string;
}

/*! Pts.js is licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */

declare abstract class Space {
    id: string;
    protected bound: Bound;
    protected _time: ITimer;
    protected players: ISpacePlayers;
    protected playerCount: number;
    protected _ctx: any;
    private _animID;
    private _pause;
    private _refresh;
    private _renderFunc;
    protected _pointer: Pt;
    protected _isReady: boolean;
    protected _playing: boolean;
    protected _keyDownBind: (evt: KeyboardEvent) => boolean;
    protected _keyUpBind: (evt: KeyboardEvent) => boolean;
    refresh(b: boolean): this;
    minFrameTime(ms?: number): void;
    add(p: IPlayer | AnimateCallbackFn): this;
    remove(player: IPlayer): this;
    removeAll(): this;
    play(time?: number): this;
    replay(): void;
    protected playItems(time: number): void;
    pause(toggle?: boolean): this;
    resume(): this;
    stop(t?: number): this;
    playOnce(duration?: number): this;
    protected render(context: any): this;
    set customRendering(f: (context: any, self: Space) => null);
    get customRendering(): (context: any, self: Space) => null;
    get isPlaying(): boolean;
    get outerBound(): Bound;
    get innerBound(): Bound;
    get size(): Pt;
    get center(): Pt;
    get width(): number;
    get height(): number;
    abstract resize(b: Bound, evt?: Event): this;
    abstract clear(): this;
    abstract getForm(): Form;
}
declare abstract class MultiTouchSpace extends Space {
    protected _pressed: boolean;
    protected _dragged: boolean;
    protected _hasMouse: boolean;
    protected _hasTouch: boolean;
    protected _hasKeyboard: boolean;
    protected _canvas: EventTarget;
    get pointer(): Pt;
    bindCanvas(evt: string, callback: EventListener, options?: any, customTarget?: Element): void;
    unbindCanvas(evt: string, callback: EventListener, options?: any, customTarget?: Element): void;
    bindDoc(evt: string, callback: EventListener, options?: any): void;
    unbindDoc(evt: string, callback: EventListener, options?: any): void;
    bindMouse(bind?: boolean, customTarget?: Element): this;
    bindTouch(bind?: boolean, passive?: boolean, customTarget?: Element): this;
    bindKeyboard(bind?: boolean): this;
    touchesToPoints(evt: TouchEvent, which?: TouchPointsKey): Pt[];
    protected _mouseAction(type: string, evt: MouseEvent | TouchEvent): void;
    protected _mouseDown(evt: MouseEvent | TouchEvent): boolean;
    protected _mouseUp(evt: MouseEvent | TouchEvent): boolean;
    protected _mouseMove(evt: MouseEvent | TouchEvent): boolean;
    protected _mouseOver(evt: MouseEvent | TouchEvent): boolean;
    protected _mouseOut(evt: MouseEvent | TouchEvent): boolean;
    protected _mouseClick(evt: MouseEvent | TouchEvent): boolean;
    protected _contextMenu(evt: MouseEvent): boolean;
    protected _touchMove(evt: TouchEvent): boolean;
    protected _touchStart(evt: TouchEvent): boolean;
    protected _keyDown(evt: KeyboardEvent): boolean;
    protected _keyUp(evt: KeyboardEvent): boolean;
    protected _keyboardAction(type: string, evt: KeyboardEvent): void;
}

/*! Pts.js is licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */

declare class Vec {
    static add(a: PtLike, b: PtLike | number): PtLike;
    static subtract(a: PtLike, b: PtLike | number): PtLike;
    static multiply(a: PtLike, b: PtLike | number): PtLike;
    static divide(a: PtLike, b: PtLike | number): PtLike;
    static dot(a: PtLike, b: PtLike): number;
    static cross2D(a: PtLike, b: PtLike): number;
    static cross(a: PtLike, b: PtLike): Pt;
    static magnitude(a: PtLike): number;
    static unit(a: PtLike, magnitude?: number): PtLike;
    static abs(a: PtLike): PtLike;
    static floor(a: PtLike): PtLike;
    static ceil(a: PtLike): PtLike;
    static round(a: PtLike): PtLike;
    static max(a: PtLike): {
        value: any;
        index: any;
    };
    static min(a: PtLike): {
        value: any;
        index: any;
    };
    static sum(a: PtLike): number;
    static map(a: PtLike, fn: (n: number, index: number, arr: any) => number): PtLike;
}
declare class Mat {
    protected _33: GroupLike;
    constructor();
    get value(): GroupLike;
    get domMatrix(): DOMMatrix;
    reset(): void;
    scale2D(val: PtLike, at?: PtLike): this;
    rotate2D(ang: number, at?: PtLike): this;
    translate2D(val: PtLike): this;
    shear2D(val: PtLike, at?: PtLike): this;
    static add(a: GroupLike, b: GroupLike | number[][] | number): Group;
    static multiply(a: GroupLike, b: GroupLike | number[][] | number, transposed?: boolean, elementwise?: boolean): Group;
    static zipSlice(g: GroupLike | number[][], index: number, defaultValue?: number | boolean): Pt;
    static zip(g: GroupLike | number[][], defaultValue?: number | boolean, useLongest?: boolean): Group;
    static transpose(g: GroupLike | number[][], defaultValue?: number | boolean, useLongest?: boolean): Group;
    static toDOMMatrix(m: GroupLike | number[][]): number[];
    static transform2D(pt: PtLike, m: GroupLike | number[][]): Pt;
    static scale2DMatrix(x: number, y: number): GroupLike;
    static rotate2DMatrix(cosA: number, sinA: number): GroupLike;
    static shear2DMatrix(tanX: number, tanY: number): GroupLike;
    static translate2DMatrix(x: number, y: number): GroupLike;
    static scaleAt2DMatrix(sx: number, sy: number, at: PtLike): GroupLike;
    static rotateAt2DMatrix(cosA: number, sinA: number, at: PtLike): GroupLike;
    static shearAt2DMatrix(tanX: number, tanY: number, at: PtLike): GroupLike;
    static reflectAt2DMatrix(p1: PtLike, p2: PtLike): Pt[];
}

declare class Img {
    protected _img: HTMLImageElement;
    protected _data: ImageData;
    protected _cv: HTMLCanvasElement;
    protected _ctx: CanvasRenderingContext2D;
    protected _scale: number;
    protected _loaded: boolean;
    protected _editable: boolean;
    protected _space: CanvasSpace;
    constructor(editable?: boolean, space?: CanvasSpace, crossOrigin?: boolean);
    static load(src: string, editable?: boolean, space?: CanvasSpace, ready?: (img: any) => {}): Img;
    static loadAsync(src: string, editable?: boolean, space?: CanvasSpace): Promise<Img>;
    static loadPattern(src: string, space: CanvasSpace, repeat?: CanvasPatternRepetition, editable?: boolean): Promise<CanvasPattern>;
    static blank(size: PtLike, space: CanvasSpace, scale?: number): Img;
    load(src: string): Promise<Img>;
    protected _drawToScale(canvasScale: number | PtLike, img: CanvasImageSource): void;
    initCanvas(width: number, height: number, canvasScale?: number | PtLike): void;
    bitmap(size?: PtLike): Promise<ImageBitmap>;
    pattern(reptition?: CanvasPatternRepetition, dynamic?: boolean): CanvasPattern;
    sync(): void;
    pixel(p: PtLike, rescale?: boolean | number): Pt;
    static getPixel(imgData: ImageData, p: PtLike): Pt;
    resize(sizeOrScale: PtLike, asScale?: boolean): this;
    crop(box: Bound): ImageData;
    filter(css: string): this;
    cleanup(): void;
    static fromBlob(blob: Blob, editable?: boolean, space?: CanvasSpace): Promise<Img>;
    static imageDataToBlob(data: ImageData): Promise<Blob>;
    toBase64(): string;
    toBlob(): Promise<Blob>;
    getForm(): CanvasForm;
    get current(): CanvasImageSource;
    get image(): HTMLImageElement;
    get canvas(): HTMLCanvasElement;
    get data(): ImageData;
    get ctx(): CanvasRenderingContext2D;
    get loaded(): boolean;
    get pixelScale(): number;
    get imageSize(): Pt;
    get canvasSize(): Pt;
    get scaledMatrix(): Mat;
}

/*! Pts.js is licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */

declare class CanvasSpace extends MultiTouchSpace {
    protected _canvas: HTMLCanvasElement;
    protected _container: Element;
    protected _pixelScale: number;
    protected _autoResize: boolean;
    protected _bgcolor: string;
    protected _ctx: PtsCanvasRenderingContext2D;
    protected _offscreen: boolean;
    protected _offCanvas: HTMLCanvasElement;
    protected _offCtx: PtsCanvasRenderingContext2D;
    protected _initialResize: boolean;
    constructor(elem: string | Element, callback?: Function);
    protected _createElement(elem: string, id: any): HTMLElement;
    private _ready;
    setup(opt: CanvasSpaceOptions): this;
    set autoResize(auto: boolean);
    get autoResize(): boolean;
    resize(b: Bound, evt?: Event): this;
    protected _resizeHandler(evt: Event): void;
    set background(bg: string);
    get background(): string;
    get pixelScale(): number;
    get hasOffscreen(): boolean;
    get offscreenCtx(): PtsCanvasRenderingContext2D;
    get offscreenCanvas(): HTMLCanvasElement;
    getForm(): CanvasForm;
    get element(): HTMLCanvasElement;
    get parent(): Element;
    get ready(): boolean;
    get ctx(): PtsCanvasRenderingContext2D;
    clear(bg?: string): this;
    clearOffscreen(bg?: string): this;
    protected playItems(time: number): void;
    dispose(): this;
    recorder(downloadOrCallback: boolean | ((blobURL: string) => {}), filetype?: string, bitrate?: number): MediaRecorder;
}
declare class CanvasForm extends VisualForm {
    protected _space: CanvasSpace;
    protected _ctx: CanvasRenderingContext2D;
    protected _estimateTextWidth: (string: any) => number;
    protected _style: DefaultFormStyle;
    constructor(space: CanvasSpace | CanvasRenderingContext2D);
    get space(): CanvasSpace;
    get ctx(): PtsCanvasRenderingContext2D;
    useOffscreen(off?: boolean, clear?: boolean | string): this;
    renderOffscreen(offset?: PtLike): void;
    alpha(a: number): this;
    fill(c: string | boolean | CanvasGradient | CanvasPattern): this;
    stroke(c: string | boolean | CanvasGradient | CanvasPattern, width?: number, linejoin?: CanvasLineJoin, linecap?: CanvasLineCap): this;
    applyFillStroke(filled?: boolean | string, stroked?: boolean | string, strokeWidth?: number): this;
    gradient(stops: [number, string][] | string[]): ((area1: GroupLike, area2?: GroupLike) => CanvasGradient);
    composite(mode?: GlobalCompositeOperation): this;
    clip(): this;
    dash(segments?: PtLike | boolean, offset?: number): this;
    font(sizeOrFont: number | Font, weight?: string, style?: string, lineHeight?: number, family?: string): this;
    fontWidthEstimate(estimate?: boolean): this;
    getTextWidth(c: string): number;
    protected _textTruncate(str: string, width: number, tail?: string): [string, number];
    protected _textAlign(box: PtLikeIterable, vertical: string, offset?: PtLike, center?: Pt): Pt;
    reset(): this;
    protected _paint(): void;
    static point(ctx: CanvasRenderingContext2D, p: PtLike, radius?: number, shape?: string): void;
    point(p: PtLike, radius?: number, shape?: string): this;
    static circle(ctx: CanvasRenderingContext2D, pt: PtLike, radius?: number): void;
    circle(pts: PtLikeIterable): this;
    static ellipse(ctx: CanvasRenderingContext2D, pt: PtLike, radius: PtLike, rotation?: number, startAngle?: number, endAngle?: number, cc?: boolean): void;
    ellipse(pt: PtLike, radius: PtLike, rotation?: number, startAngle?: number, endAngle?: number, cc?: boolean): this;
    static arc(ctx: CanvasRenderingContext2D, pt: PtLike, radius: number, startAngle: number, endAngle: number, cc?: boolean): void;
    arc(pt: PtLike, radius: number, startAngle: number, endAngle: number, cc?: boolean): this;
    static square(ctx: CanvasRenderingContext2D, pt: PtLike, halfsize: number): void;
    square(pt: PtLike, halfsize: number): this;
    static line(ctx: CanvasRenderingContext2D, pts: PtLikeIterable): void;
    line(pts: PtLikeIterable): this;
    static polygon(ctx: CanvasRenderingContext2D, pts: PtLikeIterable): void;
    polygon(pts: PtLikeIterable): this;
    static rect(ctx: CanvasRenderingContext2D, pts: PtLikeIterable): void;
    rect(pts: PtLikeIterable): this;
    static image(ctx: CanvasRenderingContext2D, ptOrRect: PtLike | PtLikeIterable, img: CanvasImageSource | Img, orig?: PtLikeIterable): void;
    image(ptOrRect: PtLike | PtLikeIterable, img: CanvasImageSource | Img, orig?: PtLikeIterable): this;
    static imageData(ctx: CanvasRenderingContext2D, ptOrRect: PtLike | PtLikeIterable, img: ImageData): void;
    imageData(ptOrRect: PtLike | PtLikeIterable, img: ImageData): this;
    static text(ctx: CanvasRenderingContext2D, pt: PtLike, txt: string, maxWidth?: number): void;
    text(pt: PtLike, txt: string, maxWidth?: number): this;
    textBox(box: PtIterable, txt: string, verticalAlign?: string, tail?: string, overrideBaseline?: boolean): this;
    paragraphBox(box: PtLikeIterable, txt: string, lineHeight?: number, verticalAlign?: string, crop?: boolean): this;
    alignText(alignment?: CanvasTextAlign, baseline?: CanvasTextBaseline): this;
    log(txt: any): this;
}

/*! Pts.js is licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */

declare class Create {
    static distributeRandom(bound: Bound, count: number, dimensions?: number): Group;
    static distributeLinear(line: PtIterable, count: number): Group;
    static gridPts(bound: Bound, columns: number, rows: number, orientation?: PtLike): Group;
    static gridCells(bound: Bound, columns: number, rows: number): Group[];
    static radialPts(center: PtLike, radius: number, count: number, angleOffset?: number): Group;
    static noisePts(pts: PtIterable, dx?: number, dy?: number, rows?: number, columns?: number): Group;
    static delaunay(pts: GroupLike): Delaunay;
}
declare class Noise extends Pt {
    protected perm: number[];
    private _n;
    constructor(...args: any[]);
    initNoise(...args: any[]): this;
    step(x?: number, y?: number): this;
    seed(s: any): this;
    noise2D(): number;
}
declare class Delaunay extends Group {
    private _mesh;
    delaunay(triangleOnly?: boolean): GroupLike[] | DelaunayShape[];
    voronoi(): Group[];
    mesh(): DelaunayMesh;
    neighborPts(i: number, sort?: boolean): GroupLike;
    neighbors(i: number): DelaunayShape[];
    protected _cache(o: any): void;
    protected _superTriangle(): Group;
    protected _triangle(i: number, j: number, k: number, pts?: GroupLike): Group;
    protected _circum(i: number, j: number, k: number, tri: GroupLike | false, pts?: GroupLike): DelaunayShape;
    protected static _dedupe(edges: number[]): number[];
}

/*! Pts.js is licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */

declare class Num {
    static generator: any;
    static equals(a: number, b: number, threshold?: number): boolean;
    static lerp(a: number, b: number, t: number): number;
    static clamp(val: number, min: number, max: number): number;
    static boundValue(val: number, min: number, max: number): number;
    static within(p: number, a: number, b: number): boolean;
    static randomRange(a: number, b?: number): number;
    static randomPt(a: PtLike, b?: PtLike): Pt;
    static normalizeValue(n: number, a: number, b: number): number;
    static sum(pts: PtLikeIterable): Pt;
    static average(pts: PtLikeIterable): Pt;
    static cycle(t: number, method?: (t: number) => number): number;
    static mapToRange(n: number, currA: number, currB: number, targetA: number, targetB: number): number;
    static seed(seed: string): void;
    static random(): number;
}
declare class Geom {
    static boundAngle(angle: number): number;
    static boundRadian(radian: number): number;
    static toRadian(angle: number): number;
    static toDegree(radian: number): number;
    static boundingBox(pts: PtIterable): Group;
    static centroid(pts: PtLikeIterable): Pt;
    static anchor(pts: PtLikeIterable, ptOrIndex?: PtLike | number, direction?: ("to" | "from")): void;
    static interpolate(a: PtLike, b: PtLike, t?: number): Pt;
    static perpendicular(pt: PtLike, axis?: string | PtLike): Group;
    static isPerpendicular(p1: PtLike, p2: PtLike): boolean;
    static withinBound(pt: PtLike, boundPt1: PtLike, boundPt2: PtLike): boolean;
    static sortEdges(pts: PtIterable): GroupLike;
    static scale(ps: Pt | PtIterable, scale: number | PtLike, anchor?: PtLike): Geom;
    static rotate2D(ps: Pt | PtIterable, angle: number, anchor?: PtLike, axis?: string | PtLike): Geom;
    static shear2D(ps: Pt | PtIterable, scale: number | PtLike, anchor?: PtLike, axis?: string | PtLike): Geom;
    static reflect2D(ps: Pt | PtIterable, line: PtLikeIterable, axis?: string | PtLike): Geom;
    static cosTable(): {
        table: Float64Array;
        cos: (rad: number) => number;
    };
    static sinTable(): {
        table: Float64Array;
        sin: (rad: number) => number;
    };
}
declare class Shaping {
    static linear(t: number, c?: number): number;
    static quadraticIn(t: number, c?: number): number;
    static quadraticOut(t: number, c?: number): number;
    static quadraticInOut(t: number, c?: number): number;
    static cubicIn(t: number, c?: number): number;
    static cubicOut(t: number, c?: number): number;
    static cubicInOut(t: number, c?: number): number;
    static exponentialIn(t: number, c?: number, p?: number): number;
    static exponentialOut(t: number, c?: number, p?: number): number;
    static sineIn(t: number, c?: number): number;
    static sineOut(t: number, c?: number): number;
    static sineInOut(t: number, c?: number): number;
    static cosineApprox(t: number, c?: number): number;
    static circularIn(t: number, c?: number): number;
    static circularOut(t: number, c?: number): number;
    static circularInOut(t: number, c?: number): number;
    static elasticIn(t: number, c?: number, p?: number): number;
    static elasticOut(t: number, c?: number, p?: number): number;
    static elasticInOut(t: number, c?: number, p?: number): number;
    static bounceIn(t: number, c?: number): number;
    static bounceOut(t: number, c?: number): number;
    static bounceInOut(t: number, c?: number): number;
    static sigmoid(t: number, c?: number, p?: number): number;
    static logSigmoid(t: number, c?: number, p?: number): number;
    static seat(t: number, c?: number, p?: number): number;
    static quadraticBezier(t: number, c?: number, p?: number | PtLike): number;
    static cubicBezier(t: number, c?: number, p1?: PtLike, p2?: PtLike): number;
    static quadraticTarget(t: number, c?: number, p1?: PtLike): number;
    static cliff(t: number, c?: number, p?: number): number;
    static step(fn: Function, steps: number, t: number, c: number, ...args: any[]): any;
}
declare class Range {
    protected _source: Group;
    protected _max: Pt;
    protected _min: Pt;
    protected _mag: Pt;
    protected _dims: number;
    constructor(g: PtIterable);
    get max(): Pt;
    get min(): Pt;
    get magnitude(): Pt;
    calc(): this;
    mapTo(min: number, max: number, exclude?: boolean[]): Group;
    append(pts: PtLikeIterable, update?: boolean): this;
    ticks(count: number): Group;
}

/*! Pts.js is licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */

declare class Line {
    static fromAngle(anchor: PtLike, angle: number, magnitude: number): Group;
    static slope(p1: PtLike, p2: PtLike): number;
    static intercept(p1: PtLike, p2: PtLike): {
        slope: number;
        xi: number;
        yi: number;
    };
    static sideOfPt2D(line: PtLikeIterable, pt: PtLike): number;
    static collinear(p1: PtLike, p2: PtLike, p3: PtLike, threshold?: number): boolean;
    static magnitude(line: PtIterable): number;
    static magnitudeSq(line: PtIterable): number;
    static perpendicularFromPt(line: PtIterable, pt: PtLike, asProjection?: boolean): Pt;
    static distanceFromPt(line: GroupLike, pt: PtLike | number[]): number;
    static intersectRay2D(la: PtIterable, lb: PtIterable): Pt;
    static intersectLine2D(la: PtIterable, lb: PtIterable): Pt;
    static intersectLineWithRay2D(line: PtIterable, ray: PtIterable): Pt;
    static intersectPolygon2D(lineOrRay: PtIterable, poly: PtIterable, sourceIsRay?: boolean): Group;
    static intersectLines2D(lines1: Iterable<PtIterable>, lines2: Iterable<PtIterable>, isRay?: boolean): Group;
    static intersectGridWithRay2D(ray: PtIterable, gridPt: PtLike): Group;
    static intersectGridWithLine2D(line: GroupLike, gridPt: PtLike | number[]): Group;
    static intersectRect2D(line: GroupLike, rect: GroupLike): Group;
    static subpoints(line: PtLikeIterable, num: number): Group;
    static crop(line: PtIterable, size: PtLike, index?: number, cropAsCircle?: boolean): Pt;
    static marker(line: PtIterable, size: PtLike, graphic?: string, atTail?: boolean): Group;
    static toRect(line: GroupLike): Group;
}
declare class Rectangle {
    static from(topLeft: PtLike, widthOrSize: number | PtLike, height?: number): Group;
    static fromTopLeft(topLeft: PtLike, widthOrSize: number | PtLike, height?: number): Group;
    static fromCenter(center: PtLike, widthOrSize: number | PtLike, height?: number): Group;
    static toCircle(pts: PtIterable, within?: boolean): Group;
    static toSquare(pts: PtIterable, enclose?: boolean): Group;
    static size(pts: PtIterable): Pt;
    static center(pts: PtIterable): Pt;
    static corners(rect: PtIterable): Group;
    static sides(rect: PtIterable): Group[];
    static boundingBox(rects: Iterable<PtLikeIterable>): Group;
    static polygon(rect: PtIterable): Group;
    static quadrants(rect: PtIterable, center?: PtLike): Group[];
    static halves(rect: PtIterable, ratio?: number, asRows?: boolean): Group[];
    static withinBound(rect: GroupLike, pt: PtLike): boolean;
    static hasIntersectRect2D(rect1: GroupLike, rect2: GroupLike, resetBoundingBox?: boolean): boolean;
    static intersectRect2D(rect1: GroupLike, rect2: GroupLike): Group;
}
declare class Circle {
    static fromRect(pts: PtLikeIterable, enclose?: boolean): Group;
    static fromTriangle(pts: PtIterable, enclose?: boolean): Group;
    static fromCenter(pt: PtLike, radius: number): Group;
    static withinBound(pts: PtIterable, pt: PtLike, threshold?: number): boolean;
    static intersectRay2D(circle: PtIterable, ray: PtIterable): Group;
    static intersectLine2D(circle: PtIterable, line: PtIterable): Group;
    static intersectCircle2D(circle1: PtIterable, circle2: PtIterable): Group;
    static intersectRect2D(circle: PtIterable, rect: PtIterable): Group;
    static toRect(circle: PtIterable, within?: boolean): Group;
    static toTriangle(circle: PtIterable, within?: boolean): Group;
}
declare class Triangle {
    static fromRect(rect: PtIterable): Group;
    static fromCircle(circle: PtIterable): Group;
    static fromCenter(pt: PtLike, size: number): Group;
    static medial(tri: PtIterable): Group;
    static oppositeSide(tri: PtIterable, index: number): Group;
    static altitude(tri: PtIterable, index: number): Group;
    static orthocenter(tri: PtIterable): Pt;
    static incenter(tri: PtIterable): Pt;
    static incircle(tri: PtIterable, center?: Pt): Group;
    static circumcenter(tri: PtIterable): Pt;
    static circumcircle(tri: PtIterable, center?: Pt): Group;
}
declare class Polygon {
    static centroid(pts: PtLikeIterable): Pt;
    static rectangle(center: PtLike, widthOrSize: number | PtLike, height?: number): Group;
    static fromCenter(center: PtLike, radius: number, sides: number): Group;
    static lineAt(pts: PtLikeIterable, index: number): Group;
    static lines(poly: PtIterable, closePath?: boolean): Group[];
    static midpoints(poly: PtIterable, closePath?: boolean, t?: number): Group;
    static adjacentSides(poly: PtIterable, index: number, closePath?: boolean): Group[];
    static bisector(poly: PtIterable, index: number): Pt;
    static perimeter(poly: PtIterable, closePath?: boolean): {
        total: number;
        segments: Pt;
    };
    static area(pts: PtLikeIterable): any;
    static convexHull(pts: PtLikeIterable, sorted?: boolean): Group;
    static network(poly: PtIterable, originIndex?: number): Group[];
    static nearestPt(poly: PtIterable, pt: PtLike): number;
    static projectAxis(poly: PtIterable, unitAxis: Pt): Pt;
    protected static _axisOverlap(poly1: PtIterable, poly2: PtIterable, unitAxis: Pt): number;
    static hasIntersectPoint(poly: PtLikeIterable, pt: PtLike): boolean;
    static hasIntersectCircle(poly: PtIterable, circle: PtIterable): IntersectContext;
    static hasIntersectPolygon(poly1: PtIterable, poly2: PtIterable): IntersectContext;
    static intersectPolygon2D(poly1: PtIterable, poly2: PtIterable): Group;
    static toRects(polys: Iterable<PtIterable>): Group[];
}
declare class Curve {
    static getSteps(steps: number): Group;
    static controlPoints(pts: PtLikeIterable, index?: number, copyStart?: boolean): Group;
    static _calcPt(ctrls: GroupLike, params: PtLike): Pt;
    static catmullRom(pts: PtLikeIterable, steps?: number): Group;
    static catmullRomStep(step: Pt, ctrls: GroupLike): Pt;
    static cardinal(pts: PtLikeIterable, steps?: number, tension?: number): Group;
    static cardinalStep(step: Pt, ctrls: GroupLike, tension?: number): Pt;
    static bezier(pts: GroupLike, steps?: number): Group;
    static bezierStep(step: Pt, ctrls: GroupLike): Pt;
    static bspline(pts: GroupLike, steps?: number, tension?: number): Group;
    static bsplineStep(step: Pt, ctrls: GroupLike): Pt;
    static bsplineTensionStep(step: Pt, ctrls: GroupLike, tension?: number): Pt;
}

/*! Pts.js is licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */

declare class Color extends Pt {
    private static D65;
    protected _mode: ColorType;
    private _isNorm;
    static ranges: {
        [name: string]: Group;
    };
    constructor(...args: any[]);
    static from(...args: any[]): Color;
    static fromHex(hex: string): Color;
    static rgb(...args: any[]): Color;
    static hsl(...args: any[]): Color;
    static hsb(...args: any[]): Color;
    static lab(...args: any[]): Color;
    static lch(...args: any[]): Color;
    static luv(...args: any[]): Color;
    static xyz(...args: any[]): Color;
    static maxValues(mode: string): Pt;
    get hex(): string;
    get rgb(): string;
    get rgba(): string;
    clone(): Color;
    toMode(mode: ColorType, convert?: boolean): this;
    get mode(): ColorType;
    get r(): number;
    set r(n: number);
    get g(): number;
    set g(n: number);
    get b(): number;
    set b(n: number);
    get h(): number;
    set h(n: number);
    get s(): number;
    set s(n: number);
    get l(): number;
    set l(n: number);
    get a(): number;
    set a(n: number);
    get c(): number;
    set c(n: number);
    get u(): number;
    set u(n: number);
    get v(): number;
    set v(n: number);
    set alpha(n: number);
    get alpha(): number;
    get normalized(): boolean;
    set normalized(b: boolean);
    normalize(toNorm?: boolean): Color;
    $normalize(toNorm?: boolean): Color;
    toString(format?: ("hex" | "rgb" | "rgba" | "mode")): string;
    static RGBtoHSL(rgb: Color, normalizedInput?: boolean, normalizedOutput?: boolean): Color;
    static HSLtoRGB(hsl: Color, normalizedInput?: boolean, normalizedOutput?: boolean): Color;
    static RGBtoHSB(rgb: Color, normalizedInput?: boolean, normalizedOutput?: boolean): Color;
    static HSBtoRGB(hsb: Color, normalizedInput?: boolean, normalizedOutput?: boolean): Color;
    static RGBtoLAB(rgb: Color, normalizedInput?: boolean, normalizedOutput?: boolean): Color;
    static LABtoRGB(lab: Color, normalizedInput?: boolean, normalizedOutput?: boolean): Color;
    static RGBtoLCH(rgb: Color, normalizedInput?: boolean, normalizedOutput?: boolean): Color;
    static LCHtoRGB(lch: Color, normalizedInput?: boolean, normalizedOutput?: boolean): Color;
    static RGBtoLUV(rgb: Color, normalizedInput?: boolean, normalizedOutput?: boolean): Color;
    static LUVtoRGB(luv: Color, normalizedInput?: boolean, normalizedOutput?: boolean): Color;
    static RGBtoXYZ(rgb: Color, normalizedInput?: boolean, normalizedOutput?: boolean): Color;
    static XYZtoRGB(xyz: Color, normalizedInput?: boolean, normalizedOutput?: boolean): Color;
    static XYZtoLAB(xyz: Color, normalizedInput?: boolean, normalizedOutput?: boolean): Color;
    static LABtoXYZ(lab: Color, normalizedInput?: boolean, normalizedOutput?: boolean): Color;
    static XYZtoLUV(xyz: Color, normalizedInput?: boolean, normalizedOutput?: boolean): Color;
    static LUVtoXYZ(luv: Color, normalizedInput?: boolean, normalizedOutput?: boolean): Color;
    static LABtoLCH(lab: Color, normalizedInput?: boolean, normalizedOutput?: boolean): Color;
    static LCHtoLAB(lch: Color, normalizedInput?: boolean, normalizedOutput?: boolean): Color;
}

/*! Pts.js is licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */

declare const Const: {
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
declare class Util {
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
    static download(space: CanvasSpace, filename?: string, filetype?: ("jpeg" | "jpg" | "png" | "webp"), quality?: number): void;
    static performance(avgFrames?: number): () => number;
    static arrayCheck(pts: PtLikeIterable, minRequired?: number): boolean;
    static iterToArray(it: Iterable<any>): any[];
    static isMobile(): boolean;
}

/*! Pts.js is licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */

declare class DOMSpace extends MultiTouchSpace {
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
    set autoResize(auto: boolean);
    get autoResize(): boolean;
    resize(b: Bound, evt?: Event): this;
    protected _resizeHandler(evt: Event): void;
    get element(): Element;
    get parent(): Element;
    get ready(): boolean;
    clear(bg?: string): this;
    set background(bg: string);
    get background(): string;
    style(key: string, val: string, update?: boolean): this;
    styles(styles: object, update?: boolean): this;
    static setAttr(elem: Element, data: object): Element;
    static getInlineStyles(data: object): string;
    dispose(): this;
}
declare class HTMLSpace extends DOMSpace {
    getForm(): Form;
    static htmlElement(parent: Element, name: string, id?: string, autoClass?: boolean): HTMLElement;
    remove(player: IPlayer): this;
    removeAll(): this;
}
declare class HTMLForm extends VisualForm {
    protected _style: {
        filled: boolean;
        stroked: boolean;
        background: string;
        "border-color": string;
        color: string;
        "border-width": string;
        "border-radius": string;
        "border-style": string;
        opacity: number;
        position: string;
        top: number;
        left: number;
        width: number;
        height: number;
    };
    protected _ctx: DOMFormContext;
    static groupID: number;
    static domID: number;
    protected _space: HTMLSpace;
    protected _ready: boolean;
    constructor(space: HTMLSpace);
    get space(): HTMLSpace;
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
    static rect(ctx: DOMFormContext, pts: PtLikeIterable): Element;
    rect(pts: PtLikeIterable): this;
    static text(ctx: DOMFormContext, pt: PtLike, txt: string): Element;
    text(pt: PtLike, txt: string): this;
    log(txt: any): this;
    arc(pt: PtLike, radius: number, startAngle: number, endAngle: number, cc?: boolean): this;
    line(pts: GroupLike | number[][]): this;
    polygon(pts: GroupLike | number[][]): this;
}

/*! Pts.js is licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */

declare class SVGSpace extends DOMSpace {
    protected _bgcolor: string;
    constructor(elem: string | Element, callback?: Function);
    getForm(): SVGForm;
    get element(): Element;
    resize(b: Bound, evt?: Event): this;
    static svgElement(parent: Element, name: string, id?: string): SVGElement;
    remove(player: IPlayer): this;
    removeAll(): this;
}
declare class SVGForm extends VisualForm {
    protected _style: {
        filled: boolean;
        stroked: boolean;
        fill: string;
        stroke: string;
        "stroke-width": number;
        "stroke-linejoin": string;
        "stroke-linecap": string;
        opacity: number;
    };
    protected _ctx: DOMFormContext;
    static groupID: number;
    static domID: number;
    protected _space: SVGSpace;
    protected _ready: boolean;
    constructor(space: SVGSpace);
    get space(): SVGSpace;
    styleTo(k: any, v: any): void;
    alpha(a: number): this;
    fill(c: string | boolean): this;
    stroke(c: string | boolean, width?: number, linejoin?: string, linecap?: string): this;
    cls(c: string | boolean): this;
    font(sizeOrFont: number | Font, weight?: string, style?: string, lineHeight?: number, family?: string): this;
    reset(): this;
    updateScope(group_id: string, group?: Element): object;
    scope(item: IPlayer): object;
    nextID(): string;
    static getID(ctx: any): string;
    static scopeID(item: IPlayer): string;
    static style(elem: SVGElement, styles: object): Element;
    static point(ctx: DOMFormContext, pt: PtLike, radius?: number, shape?: string): SVGElement;
    point(pt: PtLike, radius?: number, shape?: string): this;
    static circle(ctx: DOMFormContext, pt: PtLike, radius?: number): SVGElement;
    circle(pts: PtLikeIterable): this;
    static arc(ctx: DOMFormContext, pt: PtLike, radius: number, startAngle: number, endAngle: number, cc?: boolean): SVGElement;
    arc(pt: PtLike, radius: number, startAngle: number, endAngle: number, cc?: boolean): this;
    static square(ctx: DOMFormContext, pt: PtLike, halfsize: number): SVGElement;
    square(pt: PtLike, halfsize: number): this;
    static line(ctx: DOMFormContext, pts: PtLikeIterable): SVGElement;
    line(pts: PtLikeIterable): this;
    protected static _poly(ctx: DOMFormContext, points: string, closePath?: boolean): SVGElement;
    protected static pointsString(pts: PtLikeIterable): {
        string: string;
        count: number;
    };
    static polygon(ctx: DOMFormContext, pts: PtLikeIterable): SVGElement;
    polygon(pts: PtLikeIterable): this;
    static rect(ctx: DOMFormContext, pts: PtLikeIterable): SVGElement;
    rect(pts: PtLikeIterable): this;
    static text(ctx: DOMFormContext, pt: PtLike, txt: string): SVGElement;
    text(pt: PtLike, txt: string): this;
    log(txt: any): this;
}

/*! Pts.js is licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */

declare class Typography {
    static textWidthEstimator(fn: (string: any) => number, samples?: string[], distribution?: number[]): (string: any) => number;
    static truncate(fn: (string: any) => number, str: string, width: number, tail?: string): [string, number];
    static fontSizeToBox(box: PtLikeIterable, ratio?: number, byHeight?: boolean): (GroupLike: any) => number;
    static fontSizeToThreshold(threshold: number, direction?: number): (a: number, b: number) => number;
}

/*! Pts.js is licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */

declare class World {
    private _lastTime;
    protected _gravity: Pt;
    protected _friction: number;
    protected _damping: number;
    protected _bound: Bound;
    protected _particles: Particle[];
    protected _bodies: Body[];
    protected _pnames: string[];
    protected _bnames: string[];
    protected _drawParticles: (p: Particle, i: number) => void;
    protected _drawBodies: (p: Body, i: number) => void;
    constructor(bound: PtIterable, friction?: number, gravity?: PtLike | number);
    get bound(): Bound;
    set bound(bound: Bound);
    get gravity(): Pt;
    set gravity(g: Pt);
    get friction(): number;
    set friction(f: number);
    get damping(): number;
    set damping(f: number);
    get bodyCount(): number;
    get particleCount(): number;
    body(id: number | string): any;
    particle(id: number | string): any;
    bodyIndex(name: string): number;
    particleIndex(name: string): number;
    update(ms: number): void;
    drawParticles(fn: (p: Particle, i: number) => void): void;
    drawBodies(fn: (p: Body, i: number) => void): void;
    add(p: Particle | Body, name?: string): this;
    private _index;
    removeBody(from: number | string, count?: number): this;
    removeParticle(from: number | string, count?: number): this;
    static edgeConstraint(p1: Particle, p2: Particle, dist: number, stiff?: number, precise?: boolean): Particle;
    static boundConstraint(p: Particle, rect: PtIterable, damping?: number): void;
    protected integrate(p: Particle, dt: number, prevDt?: number): Particle;
    protected _updateParticles(dt: number): void;
    protected _updateBodies(dt: number): void;
}
declare class Particle extends Pt {
    protected _mass: number;
    protected _radius: number;
    protected _force: Pt;
    protected _prev: Pt;
    protected _body: Body;
    protected _lock: boolean;
    protected _lockPt: Pt;
    constructor(...args: any[]);
    get mass(): number;
    set mass(m: number);
    get radius(): number;
    set radius(f: number);
    get previous(): Pt;
    set previous(p: Pt);
    get force(): Pt;
    set force(g: Pt);
    get body(): Body;
    set body(b: Body);
    get lock(): boolean;
    set lock(b: boolean);
    get changed(): Pt;
    set position(p: Pt);
    size(r: number): this;
    addForce(...args: any[]): Pt;
    verlet(dt: number, friction: number, lastDt?: number): this;
    hit(...args: any[]): this;
    collide(p2: Particle, damp?: number): void;
    toString(): string;
}
declare class Body extends Group {
    protected _cs: Array<number[]>;
    protected _stiff: number;
    protected _locks: {
        [index: string]: Particle;
    };
    protected _mass: number;
    constructor();
    static fromGroup(body: PtIterable, stiff?: number, autoLink?: boolean, autoMass?: boolean): Body;
    init(body: PtIterable, stiff?: number): this;
    get mass(): number;
    set mass(m: number);
    autoMass(): this;
    link(index1: number, index2: number, stiff?: number): this;
    linkAll(stiff: number): void;
    linksToLines(): Group[];
    processEdges(): void;
    processBody(b: Body): void;
    processParticle(b: Particle): void;
}

declare class Tempo implements IPlayer {
    protected _bpm: number;
    protected _ms: number;
    protected _listeners: {
        [key: string]: ITempoListener;
    };
    protected _listenerInc: number;
    animateID: string;
    constructor(bpm: number);
    static fromBeat(ms: number): Tempo;
    get bpm(): number;
    set bpm(n: number);
    get ms(): number;
    set ms(n: number);
    protected _createID(listener: ITempoListener | Function): string;
    every(beats: number | number[]): ITempoResponses;
    track(time: any): void;
    stop(name: string): void;
    animate(time: any, ftime: any): void;
    resize(bound: Bound, evt?: Event): void;
    action(type: string, px: number, py: number, evt: Event): void;
}
declare class Sound {
    private _type;
    _ctx: AudioContext;
    _node: AudioNode;
    _outputNode: AudioNode;
    _stream: MediaStream;
    _source: HTMLMediaElement;
    _buffer: AudioBuffer;
    analyzer: ISoundAnalyzer;
    protected _playing: boolean;
    protected _timestamp: number;
    constructor(type: SoundType);
    static from(node: AudioNode, ctx: AudioContext, type?: SoundType, stream?: MediaStream): Sound;
    static load(source: HTMLMediaElement | string, crossOrigin?: string): Promise<Sound>;
    static loadAsBuffer(url: string): Promise<Sound>;
    protected createBuffer(buf: AudioBuffer): this;
    static generate(type: OscillatorType, val: number | PeriodicWave): Sound;
    protected _gen(type: OscillatorType, val: number | PeriodicWave): Sound;
    static input(constraint?: MediaStreamConstraints): Promise<Sound>;
    get ctx(): AudioContext;
    get node(): AudioNode;
    get outputNode(): AudioNode;
    get stream(): MediaStream;
    get source(): HTMLMediaElement;
    get buffer(): AudioBuffer;
    set buffer(b: AudioBuffer);
    get type(): SoundType;
    get playing(): boolean;
    get progress(): number;
    get playable(): boolean;
    get binSize(): number;
    get sampleRate(): number;
    get frequency(): number;
    set frequency(f: number);
    connect(node: AudioNode): this;
    setOutputNode(outputNode: AudioNode): this;
    removeOutputNode(): this;
    analyze(size?: number, minDb?: number, maxDb?: number, smooth?: number): this;
    protected _domain(time: boolean): Uint8Array;
    protected _domainTo(time: boolean, size: PtLike, position?: PtLike, trim?: number[]): Group;
    timeDomain(): Uint8Array;
    timeDomainTo(size: PtLike, position?: PtLike, trim?: number[]): Group;
    freqDomain(): Uint8Array;
    freqDomainTo(size: PtLike, position?: PtLike, trim?: number[]): Group;
    reset(): this;
    start(timeAt?: number): this;
    stop(): this;
    toggle(): this;
}

export { AnimateCallbackFn, Body, Bound, CanvasForm, CanvasPatternRepetition, CanvasSpace, CanvasSpaceOptions, Circle, Color, ColorType, Const, Create, Curve, DOMFormContext, DOMSpace, DefaultFormStyle, Delaunay, DelaunayMesh, DelaunayShape, Font, Form, Geom, Group, GroupLike, HTMLForm, HTMLSpace, IPlayer, IPt, ISoundAnalyzer, ISpacePlayers, ITempoListener, ITempoProgressFn, ITempoResponses, ITempoStartFn, ITimer, Img, IntersectContext, Line, Mat, MultiTouchElement, MultiTouchSpace, Noise, Num, Particle, Polygon, Pt, PtIterable, PtLike, PtLikeIterable, PtsCanvasRenderingContext2D, Range, Rectangle, SVGForm, SVGSpace, Shaping, Sound, SoundType, Space, Tempo, TouchPointsKey, Triangle, Typography, UI, UIButton, UIDragger, UIHandler, UIPointerActions, UIShape, Util, Vec, VisualForm, WarningType, World };
