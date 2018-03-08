import { Pt, PtLike, Group, GroupLike } from "./Pt";
/**
 * Num class provides various helper functions for basic numeric operations
 */
export declare class Num {
    /**
     * Check if two numbers are equal or almost equal within a threshold
     * @param a number a
     * @param b number b
     * @param threshold a threshold within which the two numbers are considered equal
     */
    static equals(a: number, b: number, threshold?: number): boolean;
    /**
     * Linear interpolation
     * @param a start value
     * @param b end value
     * @param t usually a value between 0 to 1
     */
    static lerp(a: number, b: number, t: number): number;
    /**
     * Clamp values between min and max
     * @param val value to clamp
     * @param min min value
     * @param max max value
     */
    static clamp(val: number, min: number, max: number): number;
    /**
     * Different from Num.clamp in that the value out-of-bound will be "looped back" to the other end.
     * @param val value to bound
     * @param min min value
     * @param max max value
     * @example `boundValue(361, 0, 360)` will return 1
     */
    static boundValue(val: number, min: number, max: number): number;
    /**
     * Check if a value is within
     * @param p
     * @param a
     * @param b
     */
    static within(p: number, a: number, b: number): boolean;
    /**
     * Get a random number within a range
     * @param a range value 1
     * @param b range value 2
     */
    static randomRange(a: number, b?: number): number;
    /**
     * Normalize a value within a range
     * @param n the value to normalize
     * @param a range value 1
     * @param b range value 1
     */
    static normalizeValue(n: number, a: number, b: number): number;
    /**
     * Sum a group of numeric arrays
     * @param pts an array of numeric arrays
     * @returns a array of sums
     */
    static sum(pts: GroupLike | number[][]): Pt;
    /**
     * Sum a group of numeric arrays
     * @param pts an array of numeric arrays
     * @returns a array of sums
     */
    static average(pts: GroupLike | number[][]): Pt;
    /**
     * Given a value between 0 to 1, returns a value that cycles between 0 -> 1 -> 0 using sine method.
     * @param t a value between 0 to 1
     * @return a value between 0 to 1
     */
    static cycle(t: number): number;
    /**
     * Map a value from one range to another
     * @param n a value in the first range
     * @param currMin lower bound of the first range
     * @param currMax upper bound of the first range
     * @param targetMin lower bound of the second range
     * @param targetMax upper bound of the second range
     * @returns a remapped value in the second range
     */
    static mapToRange(n: number, currA: any, currB: any, targetA: any, targetB: any): number;
}
/**
 * Geom class provides various helper functions for basic geometric operations
 */
export declare class Geom {
    /**
     * Bound an angle between 0 to 360 degrees
     */
    static boundAngle(angle: number): number;
    /**
     * Bound a radian between 0 to 2-PI
     */
    static boundRadian(angle: number): number;
    /**
     * Convert an angle in degree to radian
     */
    static toRadian(angle: number): number;
    /**
     * Convert an angle in radian to degree
     */
    static toDegree(radian: number): number;
    /**
     * Get a bounding box for a set of Pts
     * @param pts a Group or an array of Pts
     * @return a Group of two Pts, representing the top-left and bottom-right corners.
     */
    static boundingBox(pts: GroupLike): Group;
    /**
     * Get a centroid (the average middle point) for a set of Pts
     * @param pts a Group or an array of Pts
     * @return a centroid Pt
     */
    static centroid(pts: GroupLike | number[][]): Pt;
    /**
     * Given an anchor Pt, rebase all Pts in this group either to or from this anchor base.
     * @param pts a Group or array of Pt
     * @param ptOrIndex an index for the Pt array, or an external Pt
     * @param direction "to" (subtract all Pt with this anchor base) or "from" (add all Pt from this anchor base)
     */
    static anchor(pts: GroupLike, ptOrIndex?: PtLike | number, direction?: ("to" | "from")): void;
    /**
     * Get an interpolated (or extrapolated) value between two Pts
     * @param a first Pt
     * @param b second Pt
     * @param t a value between 0 to 1 to interpolate, or any other value to extrapolate
     * @returns interpolated point as a new Pt
     */
    static interpolate(a: Pt | number[], b: Pt | number[], t?: number): Pt;
    /**
     * Find two Pt that are perpendicular to this Pt (2D)
     * @param axis a string such as "xy" (use Const.xy) or an array to specify index for two dimensions
     * @returns an array of two Pt that are perpendicular to this Pt
     */
    static perpendicular(pt: PtLike, axis?: string | number[]): Group;
    /**
     * Check if two Pts (vectors) are perpendicular to each other
     */
    static isPerpendicular(p1: PtLike, p2: PtLike): boolean;
    /**
     * Check if a Pt is within the rectangular boundary defined by two Pts
     * @param pt the Pt to check
     * @param boundPt1 boundary Pt 1
     * @param boundPt2 boundary Pt 2
     */
    static withinBound(pt: PtLike | number[], boundPt1: PtLike | number[], boundPt2: PtLike | number[]): boolean;
    /**
     * Sort the Pts so that their edges will form a non-overlapping polygon
     * Ref: https://stackoverflow.com/questions/6989100/sort-points-in-clockwise-order
     * @param pts an array of Pts
     */
    static sortEdges(pts: GroupLike): GroupLike;
    /**
     * Scale a Pt or a Group of Pts
     * @param ps a Pt or a Group of Pts
     * @param scale scale value
     * @param anchor optional anchor point to scale from
     */
    static scale(ps: Pt | GroupLike, scale: number | number[] | PtLike, anchor?: PtLike): Geom;
    /**
     * Rotate a Pt or a Group of Pts in 2D space
     * @param ps a Pt or a Group of Pts
     * @param angle rotate angle
     * @param anchor optional anchor point to rotate from
     * @param axis optional axis such as "yz" to define a 2D plane of rotation
     */
    static rotate2D(ps: Pt | GroupLike, angle: number, anchor?: PtLike, axis?: string): Geom;
    /**
     * Shear a Pt or a Group of Pts in 2D space
     * @param ps a Pt or a Group of Pts
     * @param scale shearing value which can be a number or an array of 2 numbers
     * @param anchor optional anchor point to shear from
     * @param axis optional axis such as "yz" to define a 2D plane of shearing
     */
    static shear2D(ps: Pt | GroupLike, scale: number | number[] | PtLike, anchor?: PtLike, axis?: string): Geom;
    /**
     * Reflect a Pt or a Group of Pts along a 2D line
     * @param ps a Pt or a Group of Pts
     * @param line a Group of 2 Pts that defines a line for reflection
     * @param axis optional axis such as "yz" to define a 2D plane of reflection
     */
    static reflect2D(ps: Pt | GroupLike, line: GroupLike, axis?: string): Geom;
    /**
     * Generate a sine and cosine lookup table
     * @returns an object with 2 tables (array of 360 values) and 2 functions to get sin/cos given a radian parameter. { sinTable:Float64Array, cosTable:Float64Array, sin:(rad)=>number, cos:(rad)=>number }
     */
    static cosTable(): {
        table: Float64Array;
        cos: (rad: number) => number;
    };
    /**
     * Generate a sine and cosine lookup table
     * @returns an object with 2 tables (array of 360 values) and 2 functions to get sin/cos given a radian parameter. { sinTable:Float64Array, cosTable:Float64Array, sin:(rad)=>number, cos:(rad)=>number }
     */
    static sinTable(): {
        table: Float64Array;
        sin: (rad: number) => number;
    };
}
/**
 * Shaping provides various shaping/easing functions to interpolate a value non-linearly.
 */
export declare class Shaping {
    /**
     * Linear mapping
     * @parma t a value between 0 to 1
     * @parma c the value to shape, default is 1
     */
    static linear(t: number, c?: number): number;
    /**
     * Quadratic in, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/)
     * @parma t a value between 0 to 1
     * @parma c the value to shape, default is 1
    */
    static quadraticIn(t: number, c?: number): number;
    /**
     * Quadratic out, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/)
     * @parma t a value between 0 to 1
     * @parma c the value to shape, default is 1
    */
    static quadraticOut(t: number, c?: number): number;
    /**
     * Quadratic in-out, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/)
     * @parma t a value between 0 to 1
     * @parma c the value to shape, default is 1
     */
    static quadraticInOut(t: number, c?: number): number;
    /**
     * Cubic in, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/)
     * @parma t a value between 0 to 1
     * @parma c the value to shape, default is 1
     */
    static cubicIn(t: number, c?: number): number;
    /**
     * Cubic out, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/)
     * @parma t a value between 0 to 1
     * @parma c the value to shape, default is 1
     */
    static cubicOut(t: number, c?: number): number;
    /**
     * Cubic in-out, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/)
     * @parma t a value between 0 to 1
     * @parma c the value to shape, default is 1
     */
    static cubicInOut(t: number, c?: number): number;
    /**
     * Exponential ease In, adapted from Golan Levin's [polynomial shapers](http://www.flong.com/texts/code/shapers_poly/)
     * @parma t a value between 0 to 1
     * @parma c the value to shape, default is 1
     * @parma p a value between 0 to 1 to control the curve. Default is 0.25.
     */
    static exponentialIn(t: number, c?: number, p?: number): number;
    /**
     * Exponential ease out, adapted from Golan Levin's [polynomial shapers](http://www.flong.com/texts/code/shapers_poly/)
     * @parma t a value between 0 to 1
     * @parma c the value to shape, default is 1
     * @parma p a value between 0 to 1 to control the curve. Default is 0.25.
     */
    static exponentialOut(t: number, c?: number, p?: number): number;
    /**
     * Sinuous in, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/)
     * @parma t a value between 0 to 1
     * @parma c the value to shape, default is 1
     */
    static sineIn(t: number, c?: number): number;
    /**
     * Sinuous out, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/)
     * @parma t a value between 0 to 1
     * @parma c the value to shape, default is 1
     */
    static sineOut(t: number, c?: number): number;
    /**
     * Sinuous in-out, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/)
     * @parma t a value between 0 to 1
     * @parma c the value to shape, default is 1
     */
    static sineInOut(t: number, c?: number): number;
    /**
     * A faster way to approximate cosine ease in-out using Blinn-Wyvill Approximation. Adapated from Golan Levin's [polynomial shaping](http://www.flong.com/texts/code/shapers_poly/)
     * @parma t a value between 0 to 1
     * @parma c the value to shape, default is 1
     */
    static cosineApprox(t: number, c?: number): number;
    /**
     * Circular in, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/)
     * @parma t a value between 0 to 1
     * @parma c the value to shape, default is 1
     */
    static circularIn(t: number, c?: number): number;
    /**
     * Circular out, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/)
     * @parma t a value between 0 to 1
     * @parma c the value to shape, default is 1
     */
    static circularOut(t: number, c?: number): number;
    /**
     * Circular in-out, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/)
     * @parma t a value between 0 to 1
     * @parma c the value to shape, default is 1
     */
    static circularInOut(t: number, c?: number): number;
    /**
     * Elastic in, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/)
     * @parma t a value between 0 to 1
     * @parma c the value to shape, default is 1
     * @parma p elastic parmeter between 0 to 1. The lower the number, the more elastic it will be. Default is 0.7.
     */
    static elasticIn(t: number, c?: number, p?: number): number;
    /**
     * Elastic out, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/)
     * @parma t a value between 0 to 1
     * @parma c the value to shape, default is 1
     * @parma p elastic parmeter between 0 to 1. The lower the number, the more elastic it will be. Default is 0.7.
     */
    static elasticOut(t: number, c?: number, p?: number): number;
    /**
     * Elastic in-out, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/)
     * @parma t a value between 0 to 1
     * @parma c the value to shape, default is 1
     * @parma p elastic parmeter between 0 to 1. The lower the number, the more elastic it will be. Default is 0.6.
     */
    static elasticInOut(t: number, c?: number, p?: number): number;
    /**
     * Bounce in, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/)
     * @parma t a value between 0 to 1
     * @parma c the value to shape, default is 1
     */
    static bounceIn(t: number, c?: number): number;
    /**
     * Bounce out, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/)
     * @parma t a value between 0 to 1
     * @parma c the value to shape, default is 1
     */
    static bounceOut(t: number, c?: number): number;
    /**
     * Bounce in-out, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/)
     * @parma t a value between 0 to 1
     * @parma c the value to shape, default is 1
     */
    static bounceInOut(t: number, c?: number): number;
    /**
     * Sigmoid curve changes its shape adapted from the input value, but always returns a value between 0 to 1.
     * @parma t a value between 0 to 1
     * @parma c the value to shape, default is 1
     * @parma p the larger the value, the "steeper" the curve will be. Default is 10.
     */
    static sigmoid(t: number, c?: number, p?: number): number;
    /**
     * The Logistic Sigmoid is a useful curve. Adapted from Golan Levin's [shaping function](http://www.flong.com/texts/code/shapers_exp/)
     * @parma t a value between 0 to 1
     * @parma c the value to shape, default is 1
     * @parma p a parameter between 0 to 1 to control the steepness of the curve. Higher is steeper. Default is 0.7.
     */
    static logSigmoid(t: number, c?: number, p?: number): number;
    /**
     * An exponential seat curve. Adapted from Golan Levin's [shaping functions](http://www.flong.com/texts/code/shapers_exp/)
     * @parma t a value between 0 to 1
     * @parma c the value to shape, default is 1
     * @parma p a parameter between 0 to 1 to control the steepness of the curve. Higher is steeper. Default is 0.5.
     */
    static seat(t: number, c?: number, p?: number): number;
    /**
     * Quadratic bezier curve. Adapted from Golan Levin's [shaping functions](http://www.flong.com/texts/code/shapers_exp/)
     * @parma t a value between 0 to 1
     * @parma c the value to shape, default is 1
     * @parma p1 a Pt object specifying the first control Pt, or a value specifying the control Pt's x position (its y position will default to 0.5). Default is `Pt(0.95, 0.95)
     */
    static quadraticBezier(t: number, c?: number, p?: number | PtLike): number;
    /**
     * Cubic bezier curve. This reuses the bezier functions in Curve class.
     * @parma t a value between 0 to 1
     * @parma c the value to shape, default is 1
     * @parma p1` a Pt object specifying the first control Pt. Default is `Pt(0.1, 0.7).
     * @parma p2` a Pt object specifying the second control Pt. Default is `Pt(0.9, 0.2).
     */
    static cubicBezier(t: number, c?: number, p1?: PtLike, p2?: PtLike): number;
    /**
     * Give a Pt, draw a quadratic curve that will pass through that Pt as closely as possible. Adapted from Golan Levin's [shaping functions](http://www.flong.com/texts/code/shapers_poly/)
     * @parma t a value between 0 to 1
     * @parma c the value to shape, default is 1
     * @parma p1` a Pt object specifying the Pt to pass through. Default is `Pt(0.2, 0.35)
     */
    static quadraticTarget(t: number, c?: number, p1?: PtLike): number;
    /**
     * Step function is a simple jump from 0 to 1 at a specific Pt in time
     * @parma t a value between 0 to 1
     * @parma c the value to shape, default is 1
     * @parma p usually a value between 0 to 1, which specify the Pt to "jump". Default is 0.5 which is in the middle.
     */
    static cliff(t: number, c?: number, p?: number): number;
    /**
     * Convert any shaping functions into a series of steps
     * @parma fn the original shaping function
     * @parma steps the number of steps
     * @parma t a value between 0 to 1
     * @parma c the value to shape, default is 1
     * @parma args optional paramters to pass to original function
     */
    static step(fn: Function, steps: number, t: number, c: number, ...args: any[]): any;
}
/**
 * Range object keeps track of a Group of n-dimensional Pts to provide its minimum, maximum, and magnitude in each dimension.
 * It also provides convenient functions such as mapping the Group to another range.
 */
export declare class Range {
    protected _source: Group;
    protected _max: Pt;
    protected _min: Pt;
    protected _mag: Pt;
    protected _dims: number;
    /**
     * Construct a Range instance for a Group of Pts,
     * @param g a Group or an array of Pts
     */
    constructor(g: GroupLike);
    /**
     * Get this Range's maximum values per dimension
     */
    readonly max: Pt;
    /**
     * Get this Range's minimum values per dimension
     */
    readonly min: Pt;
    /**
     * Get this Range's magnitude in each dimension
     */
    readonly magnitude: Pt;
    /**
     * Go through the group and find its min and max values.
     * Usually you don't need to call this function directly.
     */
    calc(): this;
    /**
     * Map this Range to another range of values
     * @param min target range's minimum value
     * @param max target range's maximum value
     * @param exclude Optional boolean array where `true` means excluding the conversion in that specific dimension.
     */
    mapTo(min: number, max: number, exclude?: boolean[]): Group;
    /**
     * Add more Pts to this Range and recalculate its min and max values
     * @param g a Group or an array of Pts to append to this Range
     * @param update Optional. Set the parameter to `false` if you want to append without immediately updating this Range's min and max values. Default is `true`.
     */
    append(g: GroupLike, update?: boolean): this;
    /**
     * Create a number of evenly spaced "ticks" that span this Range's min and max value.
     * @param count number of subdivision. For example, 10 subdivision will return 11 tick values, which include first(min) and last(max) values.
     */
    ticks(count: number): Group;
}
