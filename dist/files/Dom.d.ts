import { MultiTouchSpace, IPlayer } from './Space';
import { Form, VisualForm, Font } from "./Form";
import { Bound } from './Bound';
import { Pt, PtLike, GroupLike } from './Pt';
/**
 * A type that represents the current context for an DOMForm
 */
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
/**
 * A Space for DOM elements
 */
export declare class DOMSpace extends MultiTouchSpace {
    protected _canvas: HTMLElement | SVGElement;
    protected _container: Element;
    id: string;
    protected _autoResize: boolean;
    protected _bgcolor: string;
    protected _css: {};
    /**
    * Create a DOMSpace which represents a Space for DOM elements
    * @param elem Specify an element by its "id" attribute as string, or by the element object itself. Use css to customize its appearance if needed.
    * @param callback an optional callback `function(boundingBox, spaceElement)` to be called when canvas is appended and ready. Alternatively, a "ready" event will also be fired from the element when it's appended, which can be traced with `spaceInstance.canvas.addEventListener("ready")`
    * @example `new DOMSpace( "#myElementID" )`
    */
    constructor(elem: string | Element, callback?: Function);
    /**
    * Helper function to create a DOM element
    * @param elem element tag name
    * @param id element id attribute
    * @param appendTo Optional, if specified, the created element will be appended to this element
    */
    static createElement(elem: string, id: string, appendTo?: Element): Element;
    /**
    * Handle callbacks after element is mounted in DOM
    * @param callback
    */
    private _ready(callback);
    /**
    * Set up various options for DOMSpace. The `opt` parameter is an object with the following fields. This is usually set during instantiation, eg `new DOMSpace(...).setup( { opt } )`
    * @param opt an object with optional settings, as follows.
    * @param opt.bgcolor a hex or rgba string to set initial background color of the canvas, or use `false` or "transparent" to set a transparent background. You may also change it later with `clear()`
    * @param opt.resize a boolean to set whether `<canvas>` size should auto resize to match its container's size. You can also set it manually with `autoSize()`
    * @example `space.setup({ bgcolor: "#f00", resize: true })`
    */
    setup(opt: {
        bgcolor?: string;
        resize?: boolean;
    }): this;
    /**
     * Not implemented. See SVGSpace and HTMLSpace for implementation
     */
    getForm(): Form;
    /**
    * Set whether the canvas element should resize when its container is resized.
    * @param auto a boolean value indicating if auto size is set
    */
    autoResize: boolean;
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
    * Get this DOM element
    */
    readonly element: Element;
    /**
    * Get the parent DOM element that contains this DOM element
    */
    readonly parent: Element;
    /**
    * A property to indicate if the Space is ready
    */
    readonly ready: boolean;
    /**
    * Clear the element's contents, and ptionally set a new backgrounc color. Overrides Space's `clear` function.
    * @param bg Optionally specify a custom background color in hex or rgba string, or "transparent". If not defined, it will use its `bgcolor` property as background color to clear the canvas.
    */
    clear(bg?: string): this;
    /**
    * Set a background color on the container element
    @param bg background color as hex or rgba string
    */
    background: string;
    /**
    * Add or update a style definition, and optionally update that style in the Element
    * @param key style name
    * @param val style value
    * @param update a boolean to update the element's style immediately if set to `true`. Default is `false`.
    */
    style(key: string, val: string, update?: boolean): this;
    /**
    * Add of update a list of style definitions, and optionally update those styles in the Element
    * @param styles a key-value objects of style definitions
    * @param update a boolean to update the element's style immediately if set to `true`. Default is `false`.
    * @return this
    */
    styles(styles: object, update?: boolean): this;
    /**
    * A static helper function to add or update Element attributes
    * @param elem Element to update
    * @param data an object with key-value pairs
    * @returns this DOM element
    */
    static setAttr(elem: Element, data: object): Element;
    /**
    * A static helper function to compose an inline style string from a object of styles
    * @param elem Element to update
    * @param data an object with key-value pairs
    * @exmaple DOMSpace.getInlineStyles( {width: "100px", "font-size": "10px"} ); // returns "width: 100px; font-size: 10px"
    */
    static getInlineStyles(data: object): string;
}
/**
 * HTMLSpace. Note that this is currently experimental and may change in future.
 */
export declare class HTMLSpace extends DOMSpace {
    /**
    * Get a new `HTMLForm` for drawing
    * @see `HTMLForm`
    */
    getForm(): Form;
    /**
     * A static function to add a DOM element inside a node. Usually you don't need to use this directly. See methods in `DOMForm` instead.
     * @param parent the parent element, or `null` to use current `<svg>` as parent.
     * @param name a string of element name,  such as `rect` or `circle`
     * @param id id attribute of the new element
     * @param autoClass add a class based on the id (from char 0 to index of "-"). Default is true.
     */
    static htmlElement(parent: Element, name: string, id?: string, autoClass?: boolean): HTMLElement;
    /**
    * Remove an item from this Space
    * @param item a player item with an auto-assigned `animateID` property
    */
    remove(player: IPlayer): this;
    /**
     * Remove all items from this Space
     */
    removeAll(): this;
}
/**
 * Form for HTMLSpace. Note that this is currently experimental and may change in future.
 */
export declare class HTMLForm extends VisualForm {
    protected _ctx: DOMFormContext;
    static groupID: number;
    static domID: number;
    protected _space: HTMLSpace;
    protected _ready: boolean;
    constructor(space: HTMLSpace);
    readonly space: HTMLSpace;
    /**
     * Update a style in _ctx context or throw an Erorr if the style doesn't exist
     * @param k style key
     * @param v  style value
     * @param unit Optional unit like 'px' to append to value
     */
    protected styleTo(k: any, v: any, unit?: string): void;
    /**
    * Set current fill style. Provide a valid color string or `false` to specify no fill color.
    * @example `form.fill("#F90")`, `form.fill("rgba(0,0,0,.5")`, `form.fill(false)`
    * @param c fill color
    */
    fill(c: string | boolean): this;
    /**
    * Set current stroke style. Provide a valid color string or `false` to specify no stroke color.
    * @example `form.stroke("#F90")`, `form.stroke("rgba(0,0,0,.5")`, `form.stroke(false)`, `form.stroke("#000", 0.5, 'round', 'square')`
    * @param c stroke color which can be as color, gradient, or pattern. (See [canvas documentation](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/strokeStyle))
    * @param width Optional value (can be floating point) to set line width
    * @param linejoin not implemented in HTMLForm
    * @param linecap not implemented in HTMLForm
    */
    stroke(c: string | boolean, width?: number, linejoin?: string, linecap?: string): this;
    /**
    * Set current text color style. Provide a valid color string.
    * @example `form.fill("#F90")`, `form.fill("rgba(0,0,0,.5")`, `form.fill(false)`
    * @param c fill color
    */
    fillText(c: string): this;
    /**
     * Add custom class to the created element
     * @param c custom class name or `false` to reset it
     * @example `form.fill("#f00").cls("myClass").rects(r)` `form.cls(false).circles(c)`
     */
    cls(c: string | boolean): this;
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
    * Reset the context's common styles to this form's styles. This supports using multiple forms on the same canvas context.
    */
    reset(): this;
    /**
     * Set this form's group scope by an ID, and optionally define the group's parent element. A group scope keeps track of elements by their generated IDs, and updates their properties as needed. See also `scope()`.
     * @param group_id a string to use as prefix for the group's id. For example, group_id "hello" will create elements with id like "hello-1", "hello-2", etc
     * @param group Optional DOM element to define this group's parent element
     * @returns this form's context
     */
    updateScope(group_id: string, group?: Element): object;
    /**
     * Set the current group scope to an item added into space, in order to keep track of any point, circle, etc created within it. The item must have an `animateID` property, so that elements created within the item will have generated IDs like "item-{animateID}-{count}".
     * @param item a "player" item that's added to space (see `space.add(...)`) and has an `animateID` property
     * @returns this form's context
     */
    scope(item: IPlayer): object;
    /**
     * Get next available id in the current group
     * @returns an id string
     */
    nextID(): string;
    /**
     * A static function to generate an ID string based on a context object
     * @param ctx a context object for an HTMLForm
     */
    static getID(ctx: any): string;
    /**
     * A static function to generate an ID string for a scope, based on a "player" item in the Space
     * @param item a "player" item that's added to space (see `space.add(...)`) and has an `animateID` property
     */
    static scopeID(item: IPlayer): string;
    /**
     * A static function to help adding style object to an element. This put all styles into `style` attribute instead of individual attributes, so that the styles can be parsed by Adobe Illustrator.
     * @param elem A DOM element to add to
     * @param styles an object of style properties
     * @example `HTMLForm.style(elem, {fill: "#f90", stroke: false})`
     * @returns DOM element
     */
    static style(elem: Element, styles: object): Element;
    /**
   * A helper function to set top, left, width, height of DOM element
   * @param x left position
   * @param y top position
   * @param w width
   * @param h height
   */
    static rectStyle(ctx: DOMFormContext, pt: PtLike, size: PtLike): DOMFormContext;
    /**
    * Draws a point
    * @param ctx a context object of HTMLForm
    * @param pt a Pt object or numeric array
    * @param radius radius of the point. Default is 5.
    * @param shape The shape of the point. Defaults to "square", but it can be "circle" or a custom shape function in your own implementation.
    * @example `HTMLForm.point( p )`, `HTMLForm.point( p, 10, "circle" )`
    */
    static point(ctx: DOMFormContext, pt: PtLike, radius?: number, shape?: string): Element;
    /**
    * Draws a point
    * @param p a Pt object
    * @param radius radius of the point. Default is 5.
    * @param shape The shape of the point. Defaults to "square", but it can be "circle" or a custom shape function in your own implementation.
    * @example `form.point( p )`, `form.point( p, 10, "circle" )`
    */
    point(pt: PtLike, radius?: number, shape?: string): this;
    /**
    * A static function to draw a circle
    * @param ctx a context object of HTMLForm
    * @param pt center position of the circle
    * @param radius radius of the circle
    */
    static circle(ctx: DOMFormContext, pt: PtLike, radius?: number): Element;
    /**
    * Draw a circle
    * @param pts usually a Group of 2 Pts, but it can also take an array of two numeric arrays [ [position], [size] ]
    * @see [`Circle.fromCenter`](./_op_.circle.html#frompt)
    */
    circle(pts: GroupLike | number[][]): this;
    /**
    * A static function to draw a square
    * @param ctx a context object of HTMLForm
    * @param pt center position of the square
    * @param halfsize half size of the square
    */
    static square(ctx: DOMFormContext, pt: PtLike, halfsize: number): HTMLElement;
    /**
     * Draw a square, given a center and its half-size
     * @param pt center Pt
     * @param halfsize half-size
     */
    square(pt: PtLike, halfsize: number): this;
    /**
    * A static function to draw a rectangle
    * @param ctx a context object of HTMLForm
    * @param pts usually a Group of 2 Pts specifying the top-left and bottom-right positions. Alternatively it can be an array of numeric arrays.
    */
    static rect(ctx: DOMFormContext, pts: GroupLike | number[][]): Element;
    /**
    * Draw a rectangle
    * @param pts usually a Group of 2 Pts specifying the top-left and bottom-right positions. Alternatively it can be an array of numeric arrays.
    */
    rect(pts: number[][] | Pt[]): this;
    /**
    * A static function to draw text
    * @param ctx a context object of HTMLForm
    * @param `pt` a Point object to specify the anchor point
    * @param `txt` a string of text to draw
    * @param `maxWidth` specify a maximum width per line
    */
    static text(ctx: DOMFormContext, pt: PtLike, txt: string): Element;
    /**
    * Draw text on canvas
    * @param `pt` a Pt or numeric array to specify the anchor point
    * @param `txt` text
    * @param `maxWidth` specify a maximum width per line
    */
    text(pt: PtLike, txt: string): this;
    /**
    * A convenient way to draw some text on canvas for logging or debugging. It'll be draw on the top-left of the canvas as an overlay.
    * @param txt text
    */
    log(txt: any): this;
    /**
     * Arc is not implemented in HTMLForm
     */
    arc(pt: PtLike, radius: number, startAngle: number, endAngle: number, cc?: boolean): this;
    /**
     * Line is not implemented in HTMLForm
     */
    line(pts: GroupLike | number[][]): this;
    /**
     * Polygon is not implemented in HTMLForm
     * @param pts
     */
    polygon(pts: GroupLike | number[][]): this;
}
