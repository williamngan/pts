import { Space } from './Space';
import { VisualForm, Font } from "./Form";
import { Bound } from './Bound';
import { Pt, PtLike, GroupLike } from "./Pt";
export interface PtsCanvasRenderingContext2D extends CanvasRenderingContext2D {
    webkitBackingStorePixelRatio?: number;
    mozBackingStorePixelRatio?: number;
    msBackingStorePixelRatio?: number;
    oBackingStorePixelRatio?: number;
    backingStorePixelRatio?: number;
}
export declare type TouchPointsKey = "touches" | "changedTouches" | "targetTouches";
/**
* CanvasSpace is an implementation of the abstract class Space. It represents a space for HTML Canvas.
* Learn more about the concept of Space in [this guide](..guide/Space-0500.html)
*/
export declare class CanvasSpace extends Space {
    protected _canvas: HTMLCanvasElement;
    protected _container: Element;
    protected _pixelScale: number;
    protected _autoResize: boolean;
    protected _bgcolor: string;
    protected _ctx: PtsCanvasRenderingContext2D;
    protected _offscreen: boolean;
    protected _offCanvas: HTMLCanvasElement;
    protected _offCtx: PtsCanvasRenderingContext2D;
    private _pressed;
    private _dragged;
    private _hasMouse;
    private _hasTouch;
    private _renderFunc;
    private _isReady;
    /**
    * Create a CanvasSpace which represents a HTML Canvas Space
    * @param elem Specify an element by its "id" attribute as string, or by the element object itself. An element can be an existing `<canvas>`, or a `<div>` container in which a new `<canvas>` will be created. If left empty, a `<div id="pt_container"><canvas id="pt" /></div>` will be added to DOM. Use css to customize its appearance if needed.
    * @param callback an optional callback `function(boundingBox, spaceElement)` to be called when canvas is appended and ready. Alternatively, a "ready" event will also be fired from the `<canvas>` element when it's appended, which can be traced with `spaceInstance.canvas.addEventListener("ready")`
    * @example `new CanvasSpace( "#myElementID" )`
    */
    constructor(elem: string | Element, callback?: Function);
    /**
    * Helper function to create a DOM element
    * @param elem element tag name
    * @param id element id attribute
    */
    private _createElement(elem, id);
    /**
    * Handle callbacks after element is mounted in DOM
    * @param callback
    */
    private _ready(callback);
    /**
    * Set up various options for CanvasSpace. The `opt` parameter is an object with the following fields. This is usually set during instantiation, eg `new CanvasSpace(...).setup( { opt } )`
    * @param opt an object with optional settings, as follows.
    * @param opt.bgcolor a hex or rgba string to set initial background color of the canvas, or use `false` or "transparent" to set a transparent background. You may also change it later with `clear()`
    * @param opt.resize a boolean to set whether `<canvas>` size should auto resize to match its container's size. You can also set it manually with `autoSize()`
    * @param opt.retina a boolean to set if device pixel scaling should be used. This may make drawings on retina displays look sharper but may reduce performance slightly. Default is `true`.
    * @param opt.offscreen a boolean to set if a duplicate canvas should be created for offscreen rendering. Default is `false`.
    * @example `space.setup({ bgcolor: "#f00", retina: true, resize: true })`
    */
    setup(opt: {
        bgcolor?: string;
        resize?: boolean;
        retina?: boolean;
        offscreen?: boolean;
    }): this;
    /**
    * Set whether the canvas element should resize when its container is resized.
    * @param auto a boolean value indicating if auto size is set
    */
    autoResize: boolean;
    /**
    * `pixelScale` property returns a number that let you determine if the screen is "retina" (when value >= 2)
    */
    readonly pixelScale: number;
    /**
    * Check if an offscreen canvas is created
    */
    readonly hasOffscreen: boolean;
    /**
    * Get the rendering context of offscreen canvas (if created via `setup()`)
    */
    readonly offscreenCtx: PtsCanvasRenderingContext2D;
    /**
    * Get the offscreen canvas element
    */
    readonly offscreenCanvas: HTMLCanvasElement;
    /**
    * Get the mouse or touch pointer that stores the last action
    */
    readonly pointer: Pt;
    /**
    * Get a new `CanvasForm` for drawing
    * @see `CanvasForm`
    */
    getForm(): CanvasForm;
    /**
    * Get the html canvas element
    */
    readonly element: HTMLCanvasElement;
    /**
    * Get the parent element that contains the canvas element
    */
    readonly parent: Element;
    /**
    * Get the rendering context of canvas
    */
    readonly ctx: PtsCanvasRenderingContext2D;
    /**
    * Get the canvas element in this space
    */
    readonly canvas: HTMLCanvasElement;
    /**
    * This overrides Space's `resize` function. It's used as a callback function for window's resize event and not usually called directly. You can keep track of resize events with `resize: (bound ,evt)` callback in your player objects (See `Space`'s `add()` function).
    * @param b a Bound object to resize to
    * @param evt Optionally pass a resize event
    */
    resize(b: Bound, evt?: Event): this;
    /**
    * Window resize handling
    * @param evt
    */
    protected _resizeHandler(evt: Event): void;
    /**
    * Clear the canvas with its background color. Overrides Space's `clear` function.
    * @param bg Optionally specify a custom background color in hex or rgba string, or "transparent". If not defined, it will use its `bgcolor` property as background color to clear the canvas.
    */
    clear(bg?: string): this;
    /**
    * Similiar to `clear()` but clear the offscreen canvas instead
    * @param bg Optionally specify a custom background color in hex or rgba string, or "transparent". If not defined, it will use its `bgcolor` property as background color to clear the canvas.
    */
    clearOffscreen(bg?: string): this;
    /**
    * Main animation function. Call `Space.playItems`.
    * @param time current time
    */
    protected playItems(time: number): void;
    /**
    * Bind event listener in canvas element. You can also use `bindMouse` or `bindTouch` to bind mouse or touch events conveniently.
    * @param evt an event string such as "mousedown"
    * @param callback callback function for this event
    */
    bindCanvas(evt: string, callback: EventListener): void;
    /**
    * Unbind a callback from the event listener
    * @param evt an event string such as "mousedown"
    * @param callback callback function to unbind
    */
    unbindCanvas(evt: string, callback: EventListener): void;
    /**
    * A convenient method to bind (or unbind) all mouse events in canvas element. All "players" added to this space that implements an `action` callback property will receive mouse event callbacks. The types of mouse actions are: "up", "down", "move", "drag", "drop", "over", and "out". See `Space`'s `add()` function fore more.
    * @param _bind a boolean value to bind mouse events if set to `true`. If `false`, all mouse events will be unbound. Default is true.
    * @see Space`'s [`add`](./_space_.space.html#add) function
    */
    bindMouse(_bind?: boolean): this;
    /**
    * A convenient method to bind (or unbind) all touch events in canvas element. All "players" added to this space that implements an `action` callback property will receive mouse event callbacks. The types of mouse actions are: "up", "down", "move", "drag", "drop", "over", and "out".
    * @param _bind a boolean value to bind touch events if set to `true`. If `false`, all mouse events will be unbound. Default is true.
    * @see Space`'s [`add`](./_space_.space.html#add) function
    */
    bindTouch(_bind?: boolean): this;
    /**
    * A convenient method to convert the touch points in a touch event to an array of `Pt`.
    * @param evt a touch event which contains touches, changedTouches, and targetTouches list
    * @param which a string to select a touches list: "touches", "changedTouches", or "targetTouches". Default is "touches"
    * @return an array of Pt, whose origin position (0,0) is offset to the top-left of this space
    */
    touchesToPoints(evt: TouchEvent, which?: TouchPointsKey): Pt[];
    /**
    * Go through all the `players` and call its `action` callback function
    * @param type "up", "down", "move", "drag", "drop", "over", and "out"
    * @param evt mouse or touch event
    */
    protected _mouseAction(type: string, evt: MouseEvent | TouchEvent): void;
    /**
    * MouseDown handler
    * @param evt
    */
    protected _mouseDown(evt: MouseEvent | TouchEvent): boolean;
    /**
    * MouseUp handler
    * @param evt
    */
    protected _mouseUp(evt: MouseEvent | TouchEvent): boolean;
    /**
    * MouseMove handler
    * @param evt
    */
    protected _mouseMove(evt: MouseEvent | TouchEvent): boolean;
    /**
    * MouseOver handler
    * @param evt
    */
    protected _mouseOver(evt: MouseEvent | TouchEvent): boolean;
    /**
    * MouseOut handler
    * @param evt
    */
    protected _mouseOut(evt: MouseEvent | TouchEvent): boolean;
    /**
    * TouchMove handler
    * @param evt
    */
    protected _touchMove(evt: TouchEvent): boolean;
    /**
    * Custom rendering
    * @param context rendering context
    */
    protected render(context: CanvasRenderingContext2D): this;
    /**
    * Set a custom rendering `function(graphics_context, canvas_space)` if needed
    */
    customRendering: Function;
}
/**
* CanvasForm is an implementation of abstract class VisualForm. It provide methods to express Pts on CanvasSpace.
* You may extend CanvasForm to implement your own expressions for CanvasSpace.
*/
export declare class CanvasForm extends VisualForm {
    protected _space: CanvasSpace;
    protected _ctx: CanvasRenderingContext2D;
    protected _ready: boolean;
    /**
    * store common styles so that they can be restored to canvas context when using multiple forms. See `reset()`.
    */
    protected _style: {
        fillStyle: string;
        strokeStyle: string;
        lineWidth: number;
        lineJoin: string;
        lineCap: string;
    };
    protected _font: Font;
    /**
    * Create a new CanvasForm. You may also use `space.getForm()` to get the default form.
    * @param space an instance of CanvasSpace
    */
    constructor(space: CanvasSpace);
    /**
    * get the CanvasSpace instance that this form is associated with
    */
    readonly space: CanvasSpace;
    /**
     * get whether the CanvasForm has received the Space's rendering context
     */
    readonly ready: boolean;
    /**
    * Toggle whether to draw on offscreen canvas (if offscreen is set in CanvasSpace)
    * @param off if `true`, draw on offscreen canvas instead of the visible canvas. Default is `true`
    * @param clear optionally provide a valid color string to fill a bg color. see CanvasSpace's `clearOffscreen` function.
    */
    useOffscreen(off?: boolean, clear?: boolean | string): this;
    /**
    * Render the offscreen canvas's content on the visible canvas
    * @param offset Optional offset on the top-left position when drawing on the visible canvas
    */
    renderOffscreen(offset?: PtLike): void;
    /**
    * Set current fill style. Provide a valid color string or `false` to specify no fill color.
    * @example `form.fill("#F90")`, `form.fill("rgba(0,0,0,.5")`, `form.fill(false)`
    * @param c fill color which can be as color, gradient, or pattern. (See [canvas documentation](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillStyle))
    */
    fill(c: string | boolean): this;
    /**
    * Set current fill style and without stroke.
    * @example `form.fillOnly("#F90")`, `form.fillOnly("rgba(0,0,0,.5")`
    * @param c fill color which can be as color, gradient, or pattern. (See [canvas documentation](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillStyle))
    */
    fillOnly(c: string | boolean): this;
    /**
    * Set current stroke style. Provide a valid color string or `false` to specify no stroke color.
    * @example `form.stroke("#F90")`, `form.stroke("rgba(0,0,0,.5")`, `form.stroke(false)`, `form.stroke("#000", 0.5, 'round', 'square')`
    * @param c stroke color which can be as color, gradient, or pattern. (See [canvas documentation](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/strokeStyle))
    * @param width Optional value (can be floating point) to set line width
    * @param linejoin Optional string to set line joint style. Can be "miter", "bevel", or "round".
    * @param linecap Optional string to set line cap style. Can be "butt", "round", or "square".
    */
    stroke(c: string | boolean, width?: number, linejoin?: string, linecap?: string): this;
    /**
    * Set current stroke style and without fill.
    * @example `form.strokeOnly("#F90")`, `form.strokeOnly("#000", 0.5, 'round', 'square')`
    * @param c stroke color which can be as color, gradient, or pattern. (See [canvas documentation](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/strokeStyle)
    */
    strokeOnly(c: string | boolean, width?: number, linejoin?: string, linecap?: string): this;
    /**
    * Set the current font
    * @param sizeOrFont either a number to specify font-size, or a `Font` object to specify all font properties
    * @param weight Optional font-weight string such as "bold"
    * @param style Optional font-style string such as "italic"
    * @param lineHeight Optional line-height number suchas 1.5
    * @param family Optional font-family such as "Helvetica, sans-serif"
    * @example `form.font( myFont )`, `form.font(14, "bold")`
    */
    font(sizeOrFont: number | Font, weight?: string, style?: string, lineHeight?: number, family?: string): this;
    /**
    * Reset the rendering context's common styles to this form's styles. This supports using multiple forms on the same canvas context.
    */
    reset(): this;
    protected _paint(): void;
    protected _multiple(groups: GroupLike[], shape: string, ...rest: any[]): this;
    /**
    * Draws a point
    * @param p a Pt object
    * @param radius radius of the point. Default is 5.
    * @param shape The shape of the point. Defaults to "square", but it can be "circle" or a custom shape function in your own implementation.
    * @example `form.point( p )`, `form.point( p, 10, "circle" )`
    */
    point(p: PtLike, radius?: number, shape?: string): this;
    /**
    * Draw multiple points at once
    * @param pts an array of Pt or an array of number arrays
    * @param radius radius of the point. Default is 5.
    * @param shape The shape of the point. Defaults to "square", but it can be "circle" or a custom shape function in your own implementation.
    */
    points(pts: GroupLike | number[][], radius?: number, shape?: string): this;
    /**
    * A static function to draw a circle
    * @param ctx canvas rendering context
    * @param pt center position of the circle
    * @param radius radius of the circle
    */
    static circle(ctx: CanvasRenderingContext2D, pt: PtLike, radius?: number): void;
    /**
    * Draw a circle
    * @param pts usually a Group of 2 Pts, but it can also take an array of two numeric arrays [ [position], [size] ]
    * @see [`Circle.fromCenter`](./_op_.circle.html#frompt)
    */
    circle(pts: GroupLike | number[][]): this;
    /**
    * Draw multiple circles at once
    * @param groups an array of Groups that defines multiple circles
    */
    circles(groups: GroupLike[]): this;
    /**
    * A static function to draw an arc.
    * @param ctx canvas rendering context
    * @param pt center position
    * @param radius radius of the arc circle
    * @param startAngle start angle of the arc
    * @param endAngle end angle of the arc
    * @param cc an optional boolean value to specify if it should be drawn clockwise (`false`) or counter-clockwise (`true`). Default is clockwise.
    */
    static arc(ctx: CanvasRenderingContext2D, pt: PtLike, radius: number, startAngle: number, endAngle: number, cc?: boolean): void;
    /**
    * Draw an arc.
    * @param pt center position
    * @param radius radius of the arc circle
    * @param startAngle start angle of the arc
    * @param endAngle end angle of the arc
    * @param cc an optional boolean value to specify if it should be drawn clockwise (`false`) or counter-clockwise (`true`). Default is clockwise.
    */
    arc(pt: PtLike, radius: number, startAngle: number, endAngle: number, cc?: boolean): this;
    /**
    * A static function to draw a square
    * @param ctx canvas rendering context
    * @param pt center position of the square
    * @param halfsize half size of the square
    */
    static square(ctx: CanvasRenderingContext2D, pt: PtLike, halfsize: number): void;
    /**
    * A static function to draw a line
    * @param ctx canvas rendering context
    * @param pts a Group of multiple Pts, or an array of multiple numeric arrays
    */
    static line(ctx: CanvasRenderingContext2D, pts: GroupLike | number[][]): void;
    /**
    * Draw a line or polyline
    * @param pts a Group of multiple Pts, or an array of multiple numeric arrays
    */
    line(pts: GroupLike | number[][]): this;
    /**
    * Draw multiple lines at once
    * @param groups An array of Groups of Pts
    */
    lines(groups: GroupLike[]): this;
    /**
    * A static function to draw polygon
    * @param ctx canvas rendering context
    * @param pts a Group of multiple Pts, or an array of multiple numeric arrays
    */
    static polygon(ctx: CanvasRenderingContext2D, pts: GroupLike | number[][]): void;
    /**
    * Draw a polygon
    * @param pts a Group of multiple Pts, or an array of multiple numeric arrays
    */
    polygon(pts: GroupLike | number[][]): this;
    /**
    * Draw multiple polygons at once
    * @param groups An array of Groups of Pts
    */
    polygons(groups: GroupLike[]): this;
    /**
    * A static function to draw a rectangle
    * @param ctx canvas rendering context
    * @param pts usually a Group of 2 Pts specifying the top-left and bottom-right positions. Alternatively it can be an array of numeric arrays.
    */
    static rect(ctx: CanvasRenderingContext2D, pts: GroupLike | number[][]): void;
    /**
    * Draw a rectangle
    * @param pts usually a Group of 2 Pts specifying the top-left and bottom-right positions. Alternatively it can be an array of numeric arrays.
    */
    rect(pts: number[][] | Pt[]): this;
    /**
    * Draw multiple rectangles at once
    * @param groups An array of Groups of Pts
    */
    rects(groups: GroupLike[]): this;
    /**
    * A static function to draw text
    * @param ctx canvas rendering context
    * @param `pt` a Point object to specify the anchor point
    * @param `txt` a string of text to draw
    * @param `maxWidth` specify a maximum width per line
    */
    static text(ctx: CanvasRenderingContext2D, pt: PtLike, txt: string, maxWidth?: number): void;
    /**
    * Draw text on canvas
    * @param `pt` a Pt or numeric array to specify the anchor point
    * @param `txt` text
    * @param `maxWidth` specify a maximum width per line
    */
    text(pt: PtLike, txt: string, maxWidth?: number): this;
    /**
    * A convenient way to draw some text on canvas for logging or debugging. It'll be draw on the top-left of the canvas as an overlay.
    * @param txt text
    */
    log(txt: any): this;
}
