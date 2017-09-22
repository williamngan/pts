import { Pt, IPt, Group, GroupLike } from "./Pt";
/**
 * Bound is a subclass of Group that represents a rectangular boundary.
 * It includes some convenient properties such as `x`, `y`, bottomRight`, `center`, and `size`.
 */
export declare class Bound extends Group implements IPt {
    protected _center: Pt;
    protected _size: Pt;
    protected _topLeft: Pt;
    protected _bottomRight: Pt;
    protected _inited: boolean;
    /**
     * Create a Bound. This is similar to the Group constructor.
     * @param args a list of Pt as parameters
     */
    constructor(...args: Pt[]);
    /**
     * Create a Bound from a [ClientRect](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect) object.
     * @param rect an object has top/left/bottom/right/width/height properties
     * @returns a Bound object
     */
    static fromBoundingRect(rect: ClientRect): Bound;
    static fromGroup(g: GroupLike): Bound;
    /**
     * Initiate the bound's properties.
     */
    protected init(): void;
    /**
     * Clone this bound and return a new one
     */
    clone(): Bound;
    /**
     * Recalculte size and center
     */
    protected _updateSize(): void;
    /**
     * Recalculate center
     */
    protected _updateCenter(): void;
    /**
     * Recalculate based on top-left position and size
     */
    protected _updatePosFromTop(): void;
    /**
     * Recalculate based on bottom-right position and size
     */
    protected _updatePosFromBottom(): void;
    /**
     * Recalculate based on center position and size
     */
    protected _updatePosFromCenter(): void;
    size: Pt;
    center: Pt;
    topLeft: Pt;
    bottomRight: Pt;
    width: number;
    height: number;
    depth: number;
    readonly x: number;
    readonly y: number;
    readonly z: number;
    readonly inited: boolean;
    /**
     * If the Group elements are changed, call this function to update the Bound's properties.
     * It's preferable to change the topLeft/bottomRight etc properties instead of changing the Group array directly.
     */
    update(): this;
}
