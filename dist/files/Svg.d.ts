import { IPlayer } from './Space';
import { VisualForm, Font } from "./Form";
import { Bound } from './Bound';
import { Pt, PtLike, GroupLike } from './Pt';
import { DOMSpace, DOMFormContext } from "./Dom";
/**
 * A Space for SVG elements
 */
export declare class SVGSpace extends DOMSpace {
    id: string;
    protected _bgcolor: string;
    /**
    * Create a SVGSpace which represents a Space for SVG elements
    * @param elem Specify an element by its "id" attribute as string, or by the element object itself. An element can be an existing `<svg>`, or a `<div>` container in which a new `<svg>` will be created. If left empty, a `<div id="pt_container"><svg id="pt" /></div>` will be added to DOM. Use css to customize its appearance if needed.
    * @param callback an optional callback `function(boundingBox, spaceElement)` to be called when canvas is appended and ready. Alternatively, a "ready" event will also be fired from the `<svg>` element when it's appended, which can be traced with `spaceInstance.canvas.addEventListener("ready")`
    * @example `new SVGSpace( "#myElementID" )`
    */
    constructor(elem: string | Element, callback?: Function);
    /**
    * Get a new `SVGForm` for drawing
    * @see `SVGForm`
    */
    getForm(): SVGForm;
    /**
    * Get the html element
    */
    readonly element: Element;
    /**
    * This overrides Space's `resize` function. It's used as a callback function for window's resize event and not usually called directly. You can keep track of resize events with `resize: (bound ,evt)` callback in your player objects (See `Space`'s `add()` function).
    * @param b a Bound object to resize to
    * @param evt Optionally pass a resize event
    */
    resize(b: Bound, evt?: Event): this;
    /**
     * A static function to add a svg element inside a node. Usually you don't need to use this directly. See methods in `SVGForm` instead.
     * @param parent the parent element, or `null` to use current `<svg>` as parent.
     * @param name a string of element name,  such as `rect` or `circle`
     * @param id id attribute of the new element
     */
    static svgElement(parent: Element, name: string, id?: string): SVGElement;
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
* SVGForm is an implementation of abstract class VisualForm. It provide methods to express Pts on SVGSpace.
* You may extend SVGForm to implement your own expressions for SVGSpace.
*/
export declare class SVGForm extends VisualForm {
    protected _ctx: DOMFormContext;
    static groupID: number;
    static domID: number;
    protected _space: SVGSpace;
    protected _ready: boolean;
    /**
    * Create a new SVGForm. You may also use `space.getForm()` to get the default form.
    * @param space an instance of SVGSpace
    */
    constructor(space: SVGSpace);
    /**
    * get the SVGSpace instance that this form is associated with
    */
    readonly space: SVGSpace;
    /**
     * Update a style in _ctx context or throw an Erorr if the style doesn't exist
     * @param k style key
     * @param v  style value
     */
    protected styleTo(k: any, v: any): void;
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
      * @param linejoin Optional string to set line joint style. Can be "miter", "bevel", or "round".
      * @param linecap Optional string to set line cap style. Can be "butt", "round", or "square".
      */
    stroke(c: string | boolean, width?: number, linejoin?: string, linecap?: string): this;
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
     * @param group Optional DOM or SVG element to define this group's parent element
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
     * @param ctx a context object for an SVGForm
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
     * @example `SVGForm.style(elem, {fill: "#f90", stroke: false})`
     * @returns this DOM element
     */
    static style(elem: SVGElement, styles: object): Element;
    /**
      * Draws a point
      * @param ctx a context object of SVGForm
      * @param pt a Pt object or numeric array
      * @param radius radius of the point. Default is 5.
      * @param shape The shape of the point. Defaults to "square", but it can be "circle" or a custom shape function in your own implementation.
      * @example `SVGForm.point( p )`, `SVGForm.point( p, 10, "circle" )`
      */
    static point(ctx: DOMFormContext, pt: PtLike, radius?: number, shape?: string): SVGElement;
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
      * @param ctx a context object of SVGForm
      * @param pt center position of the circle
      * @param radius radius of the circle
      */
    static circle(ctx: DOMFormContext, pt: PtLike, radius?: number): SVGElement;
    /**
      * Draw a circle
      * @param pts usually a Group of 2 Pts, but it can also take an array of two numeric arrays [ [position], [size] ]
      * @see [`Circle.fromCenter`](./_op_.circle.html#frompt)
      */
    circle(pts: GroupLike | number[][]): this;
    /**
      * A static function to draw an arc.
      * @param ctx a context object of SVGForm
      * @param pt center position
      * @param radius radius of the arc circle
      * @param startAngle start angle of the arc
      * @param endAngle end angle of the arc
      * @param cc an optional boolean value to specify if it should be drawn clockwise (`false`) or counter-clockwise (`true`). Default is clockwise.
      */
    static arc(ctx: DOMFormContext, pt: PtLike, radius: number, startAngle: number, endAngle: number, cc?: boolean): SVGElement;
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
      * @param ctx a context object of SVGForm
      * @param pt center position of the square
      * @param halfsize half size of the square
      */
    static square(ctx: DOMFormContext, pt: PtLike, halfsize: number): SVGElement;
    /**
     * Draw a square, given a center and its half-size
     * @param pt center Pt
     * @param halfsize half-size
     */
    square(pt: PtLike, halfsize: number): this;
    /**
    * A static function to draw a line
    * @param ctx a context object of SVGForm
    * @param pts a Group of multiple Pts, or an array of multiple numeric arrays
    */
    static line(ctx: DOMFormContext, pts: GroupLike | number[][]): SVGElement;
    /**
    * Draw a line or polyline
    * @param pts a Group of multiple Pts, or an array of multiple numeric arrays
    */
    line(pts: GroupLike | number[][]): this;
    /**
     * A static helper function to draw polyline or polygon
     * @param ctx a context object of SVGForm
     * @param pts a Group of multiple Pts, or an array of multiple numeric arrays
     * @param closePath a boolean to specify if the polygon path should be closed
     */
    static _poly(ctx: DOMFormContext, pts: GroupLike | number[][], closePath?: boolean): SVGElement;
    /**
      * A static function to draw polygon
      * @param ctx a context object of SVGForm
      * @param pts a Group of multiple Pts, or an array of multiple numeric arrays
      */
    static polygon(ctx: DOMFormContext, pts: GroupLike | number[][]): SVGElement;
    /**
    * Draw a polygon
    * @param pts a Group of multiple Pts, or an array of multiple numeric arrays
    */
    polygon(pts: GroupLike | number[][]): this;
    /**
    * A static function to draw a rectangle
    * @param ctx a context object of SVGForm
    * @param pts usually a Group of 2 Pts specifying the top-left and bottom-right positions. Alternatively it can be an array of numeric arrays.
    */
    static rect(ctx: DOMFormContext, pts: GroupLike | number[][]): SVGElement;
    /**
      * Draw a rectangle
      * @param pts usually a Group of 2 Pts specifying the top-left and bottom-right positions. Alternatively it can be an array of numeric arrays.
      */
    rect(pts: number[][] | Pt[]): this;
    /**
      * A static function to draw text
      * @param ctx a context object of SVGForm
      * @param `pt` a Point object to specify the anchor point
      * @param `txt` a string of text to draw
      * @param `maxWidth` specify a maximum width per line
      */
    static text(ctx: DOMFormContext, pt: PtLike, txt: string): SVGElement;
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
}
