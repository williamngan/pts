export interface IPt {
    x?: number;
    y?: number;
    z?: number;
    w?: number;
}
export declare var PtBaseArray: Float32ArrayConstructor;
export declare type GroupLike = Group | Pt[];
export declare type PtLike = Pt | Float32Array | number[];
/**
 * Pt is a subclass of Float32Array with additional properties and functions to support vector and geometric calculations.
 * See [Pt guide](../../guide/Pt-0200.html) for details
 */
export declare class Pt extends PtBaseArray implements IPt, Iterable<number> {
    protected _id: string;
    /**
     * Create a Pt. If no parameter is provided, this will instantiate a Pt with 2 dimensions [0, 0].
     *
     * Note that `new Pt(3)` will only instantiate Pt with length of 3 (ie, same as `new Float32Array(3)` ). If you need a Pt with 1 dimension of value 3, use `new Pt([3])`.
     * @example `new Pt()`, `new Pt(1,2,3,4,5)`, `new Pt([1,2])`, `new Pt({x:0, y:1})`, `new Pt(pt)`
     * @param args a list of numeric parameters, an array of numbers, or an object with {x,y,z,w} properties
     */
    constructor(...args: any[]);
    static make(dimensions: number, defaultValue?: number, randomize?: boolean): Pt;
    id: string;
    x: number;
    y: number;
    z: number;
    w: number;
    /**
     * Clone this Pt
     */
    clone(): Pt;
    /**
     * Check if another Pt is equal to this Pt, within a threshold
     * @param p another Pt to compare with
     * @param threshold a threshold value within which the two Pts are considered equal. Default is 0.000001.
     */
    equals(p: PtLike, threshold?: number): boolean;
    /**
     * Update the values of this Pt
     * @param args a list of numbers, an array of number, or an object with {x,y,z,w} properties
     */
    to(...args: any[]): this;
    /**
     * Like `to()` but returns a new Pt
     * @param args a list of numbers, an array of number, or an object with {x,y,z,w} properties
     */
    $to(...args: any[]): Pt;
    /**
     * Update the values of this Pt to point at a specific angle
     * @param radian target angle in radian
     * @param magnitude Optional magnitude if known. If not provided, it'll calculate and use this Pt's magnitude.
     * @param anchorFromPt If `true`, translate to new position from current position. Default is `false` which update the position from origin (0,0);
     */
    toAngle(radian: number, magnitude?: number, anchorFromPt?: boolean): this;
    /**
     * Create an operation using this Pt, passing this Pt into a custom function's first parameter. See the [Op guide](../../guide/Op-0400.html) for details.
     * For example: `let myOp = pt.op( fn ); let result = myOp( [1,2,3] );`
     * @param fn any function that takes a Pt as its first parameter
     * @returns a resulting function that takes other parameters required in `fn`
     */
    op(fn: (p1: PtLike, ...rest: any[]) => any): (...rest: any[]) => any;
    /**
     * This combines a series of operations into an array. See `op()` for details.
     * For example: `let myOps = pt.ops([fn1, fn2, fn3]); let results = myOps.map( (op) => op([1,2,3]) );`
     * @param fns an array of functions for `op`
     * @returns an array of resulting functions
     */
    ops(fns: ((p1: PtLike, ...rest: any[]) => any)[]): ((...rest: any[]) => any)[];
    /**
     * Take specific dimensional values from this Pt and create a new Pt
     * @param axis a string such as "xy" (use Const.xy) or an array to specify index for two dimensions
     */
    $take(axis: string | number[]): Pt;
    /**
     * Concatenate this Pt with addition dimensional values and return as a new Pt
     * @param args a list of numbers, an array of number, or an object with {x,y,z,w} properties
     */
    $concat(...args: any[]): Pt;
    /**
     * Add scalar or vector values to this Pt
     * @param args a list of numbers, an array of number, or an object with {x,y,z,w} properties
     */
    add(...args: any[]): this;
    /**
     * Like `add`, but returns result as a new Pt
     */
    $add(...args: any[]): Pt;
    /**
     * Subtract scalar or vector values from this Pt
     * @param args a list of numbers, an array of number, or an object with {x,y,z,w} properties
     */
    subtract(...args: any[]): this;
    /**
     * Like `subtract`, but returns result as a new Pt
     */
    $subtract(...args: any[]): Pt;
    /**
     * Multiply scalar or vector values (as element-wise) with this Pt.
     * @param args a list of numbers, an array of number, or an object with {x,y,z,w} properties
     */
    multiply(...args: any[]): this;
    /**
     * Like `multiply`, but returns result as a new Pt
     */
    $multiply(...args: any[]): Pt;
    /**
     * Divide this Pt over scalar or vector values (as element-wise)
     * @param args a list of numbers, an array of number, or an object with {x,y,z,w} properties
     */
    divide(...args: any[]): this;
    /**
     * Like `divide`, but returns result as a new Pt
     */
    $divide(...args: any[]): Pt;
    /**
     * Get the sqaured distance (magnitude) of this Pt from origin
     */
    magnitudeSq(): number;
    /**
     * Get the distance (magnitude) of this Pt from origin
     */
    magnitude(): number;
    /**
     * Convert to a unit vector, which is a normalized vector whose magnitude equals 1.
     * @param magnitude Optional: if the magnitude is known, pass it as a parameter to avoid duplicate calculation.
     */
    unit(magnitude?: number): Pt;
    /**
     * Get a unit vector from this Pt
     */
    $unit(magnitude?: number): Pt;
    /**
     * Dot product of this Pt and another Pt
     * @param args a list of numbers, an array of number, or an object with {x,y,z,w} properties
     */
    dot(...args: any[]): number;
    /**
     * 3D Cross product of this Pt and another Pt. Return results as a new Pt.
     * @param args a list of numbers, an array of number, or an object with {x,y,z,w} properties
     */
    $cross(...args: any[]): Pt;
    /**
     * Calculate vector projection of this Pt on another Pt. Returns result as a new Pt.
     * @param p a list of numbers, an array of number, or an object with {x,y,z,w} properties
     */
    $project(p: Pt): Pt;
    /**
     * Absolute values for all values in this pt
     */
    abs(): Pt;
    /**
     * Get a new Pt with absolute values of this Pt
     */
    $abs(): Pt;
    /**
     * Floor values for all values in this pt
     */
    floor(): Pt;
    /**
     * Get a new Pt with floor values of this Pt
     */
    $floor(): Pt;
    /**
     * Ceil values for all values in this pt
     */
    ceil(): Pt;
    /**
     * Get a new Pt with ceil values of this Pt
     */
    $ceil(): Pt;
    /**
     * Round values for all values in this pt
     */
    round(): Pt;
    /**
     * Get a new Pt with round values of this Pt
     */
    $round(): Pt;
    /**
     * Find the minimum value across all dimensions in this Pt
     * @returns an object with `value` and `index` which returns the minimum value and its dimensional index
     */
    minValue(): {
        value: number;
        index: number;
    };
    /**
     * Find the maximum value across all dimensions in this Pt
     * @returns an object with `value` and `index` which returns the maximum value and its dimensional index
     */
    maxValue(): {
        value: number;
        index: number;
    };
    /**
     * Get a new Pt that has the minimum dimensional values of this Pt and another Pt
     * @param args a list of numbers, an array of number, or an object with {x,y,z,w} properties
     */
    $min(...args: any[]): Pt;
    /**
     * Get a new Pt that has the maximum dimensional values of this Pt and another Pt
     * @param args a list of numbers, an array of number, or an object with {x,y,z,w} properties
     */
    $max(...args: any[]): Pt;
    /**
     * Get angle of this vector from origin
     * @param axis a string such as "xy" (use Const.xy) or an array to specify index for two dimensions
     */
    angle(axis?: string | number[]): number;
    /**
     * Get the angle between this and another Pt
     * @param p the other Pt
     * @param axis a string such as "xy" (use Const.xy) or an array to specify index for two dimensions
     */
    angleBetween(p: Pt, axis?: string | number[]): number;
    /**
     * Scale this Pt from origin or from an anchor point
     * @param scale scale ratio
     * @param anchor optional anchor point to scale from
     */
    scale(scale: number | number[] | PtLike, anchor?: PtLike): this;
    /**
     * Rotate this Pt from origin or from an anchor point in 2D
     * @param angle rotate angle
     * @param anchor optional anchor point to scale from
     * @param axis optional string such as "yz" to specify a 2D plane
     */
    rotate2D(angle: number, anchor?: PtLike, axis?: string): this;
    /**
     * Shear this Pt from origin or from an anchor point in 2D
     * @param shear shearing value which can be a number or an array of 2 numbers
     * @param anchor optional anchor point to scale from
     * @param axis optional string such as "yz" to specify a 2D plane
     */
    shear2D(scale: number | number[] | PtLike, anchor?: PtLike, axis?: string): this;
    /**
     * Reflect this Pt along a 2D line
     * @param line a Group of 2 Pts that defines a line for reflection
     * @param axis optional axis such as "yz" to define a 2D plane of reflection
     */
    reflect2D(line: GroupLike, axis?: string): this;
    /**
     * A string representation of this Pt: "Pt(1, 2, 3)"
     */
    toString(): string;
    /**
     * Convert this Pt to a javascript Array
     */
    toArray(): number[];
}
/**
 * A Group is a subclass of Array. It should onnly contain Pt instances. You can think of it as an array of arrays (Float32Arrays to be specific).
 * See [Group guide](../../guide/Group-0300.html) for details
 */
export declare class Group extends Array<Pt> {
    protected _id: string;
    constructor(...args: Pt[]);
    id: string;
    /** The first Pt in this group */
    readonly p1: Pt;
    /** The second Pt in this group */
    readonly p2: Pt;
    /** The third Pt in this group */
    readonly p3: Pt;
    /** The forth Pt in this group */
    readonly p4: Pt;
    /** The last Pt in this group */
    readonly q1: Pt;
    /** The second-last Pt in this group */
    readonly q2: Pt;
    /** The third-last Pt in this group */
    readonly q3: Pt;
    /** The forth-last Pt in this group */
    readonly q4: Pt;
    /**
     * Depp clone this group and its Pts
     */
    clone(): Group;
    /**
     * Convert an array of numeric arrays into a Group of Pts
     * @param list an array of numeric arrays
     * @example `Group.fromArray( [[1,2], [3,4], [5,6]] )`
     */
    static fromArray(list: PtLike[]): Group;
    /**
     * Convert an array of Pts into a Group.
     * @param list an array of Pts
     */
    static fromPtArray(list: GroupLike): Group;
    /**
     * Split this Group into an array of sub-groups
     * @param chunkSize number of items per sub-group
     * @param stride forward-steps after each sub-group
     * @param loopBack if `true`, always go through the array till the end and loop back to the beginning to complete the segments if needed
     */
    split(chunkSize: number, stride?: number, loopBack?: boolean): Group[];
    /**
     * Insert a Pt into this group
     * @param pts Another group of Pts
     * @param index the index position to insert into
     */
    insert(pts: GroupLike, index?: number): this;
    /**
     * Like Array's splice function, with support for negative index and a friendlier name.
     * @param index start index, which can be negative (where -1 is at index 0, -2 at index 1, etc)
     * @param count number of items to remove
     * @returns The items that are removed.
     */
    remove(index?: number, count?: number): Group;
    /**
     * Split this group into an array of sub-group segments
     * @param pts_per_segment number of Pts in each segment
     * @param stride forward-step to take
     * @param loopBack if `true`, always go through the array till the end and loop back to the beginning to complete the segments if needed
     */
    segments(pts_per_segment?: number, stride?: number, loopBack?: boolean): Group[];
    /**
     * Get all the line segments (ie, edges in a graph) of this group
     */
    lines(): Group[];
    /**
     * Find the centroid of this group's Pts, which is the average middle point.
     */
    centroid(): Pt;
    /**
     * Find the rectangular bounding box of this group's Pts.
     * @returns a Group of 2 Pts representing the top-left and bottom-right of the rectangle
     */
    boundingBox(): Group;
    /**
     * Anchor all the Pts in this Group using a target Pt as origin. (ie, subtract all Pt with the target anchor to get a relative position). All the Pts' values will be updated.
     * @param ptOrIndex a Pt, or a numeric index to target a specific Pt in this Group
     */
    anchorTo(ptOrIndex?: PtLike | number): void;
    /**
     * Anchor all the Pts in this Group by its absolute position from a target Pt. (ie, add all Pt with the target anchor to get an absolute position).  All the Pts' values will be updated.
     * @param ptOrIndex a Pt, or a numeric index to target a specific Pt in this Group
     */
    anchorFrom(ptOrIndex?: PtLike | number): void;
    /**
     * Create an operation using this Group, passing this Group into a custom function's first parameter.  See the [Op guide](../../guide/Op-0400.html) for details.
     * For example: `let myOp = group.op( fn ); let result = myOp( [1,2,3] );`
     * @param fn any function that takes a Group as its first parameter
     * @returns a resulting function that takes other parameters required in `fn`
     */
    op(fn: (g1: GroupLike, ...rest: any[]) => any): (...rest: any[]) => any;
    /**
     * This combines a series of operations into an array. See `op()` for details.
     * For example: `let myOps = pt.ops([fn1, fn2, fn3]); let results = myOps.map( (op) => op([1,2,3]) );`
     * @param fns an array of functions for `op`
     * @returns an array of resulting functions
     */
    ops(fns: ((g1: GroupLike, ...rest: any[]) => any)[]): ((...rest: any[]) => any)[];
    /**
     * Get an interpolated point on the line segments defined by this Group
     * @param t a value between 0 to 1 usually
     */
    interpolate(t: number): Pt;
    /**
     * Move every Pt's position by a specific amount. Same as `add`.
     * @param args a list of numbers, an array of number, or an object with {x,y,z,w} properties
     */
    moveBy(...args: any[]): this;
    /**
     * Move the first Pt in this group to a specific position, and move all the other Pts correspondingly
     * @param args a list of numbers, an array of number, or an object with {x,y,z,w} properties
     */
    moveTo(...args: any[]): this;
    /**
     * Scale this group's Pts from an anchor point. Default anchor point is the first Pt in this group.
     * @param scale scale ratio
     * @param anchor optional anchor point to scale from
     */
    scale(scale: number | number[] | PtLike, anchor?: PtLike): this;
    /**
     * Rotate this group's Pt from an anchor point in 2D. Default anchor point is the first Pt in this group.
     * @param angle rotate angle
     * @param anchor optional anchor point to scale from
     * @param axis optional string such as "yz" to specify a 2D plane
     */
    rotate2D(angle: number, anchor?: PtLike, axis?: string): this;
    /**
     * Shear this group's Pt from an anchor point in 2D. Default anchor point is the first Pt in this group.
     * @param shear shearing value which can be a number or an array of 2 numbers
     * @param anchor optional anchor point to scale from
     * @param axis optional string such as "yz" to specify a 2D plane
     */
    shear2D(scale: number | number[] | PtLike, anchor?: PtLike, axis?: string): this;
    /**
     * Reflect this group's Pts along a 2D line. Default anchor point is the first Pt in this group.
     * @param line a Group of 2 Pts that defines a line for reflection
     * @param axis optional axis such as "yz" to define a 2D plane of reflection
     */
    reflect2D(line: GroupLike, axis?: string): this;
    /**
     * Sort this group's Pts by values in a specific dimension
     * @param dim dimensional index
     * @param desc if true, sort descending. Default is false (ascending)
     */
    sortByDimension(dim: number, desc?: boolean): this;
    /**
     * Update each Pt in this Group with a Pt function
     * @param ptFn string name of an existing Pt function. Note that the function must return Pt.
     * @param args arguments for the function specified in ptFn
     */
    forEachPt(ptFn: string, ...args: any[]): this;
    /**
     * Add scalar or vector values to this group's Pts.
     * @param args a list of numbers, an array of number, or an object with {x,y,z,w} properties
     */
    add(...args: any[]): this;
    /**
     * Subtract scalar or vector values from this group's Pts.
     * @param args a list of numbers, an array of number, or an object with {x,y,z,w} properties
     */
    subtract(...args: any[]): this;
    /**
     * Multiply scalar or vector values (as element-wise) with this group's Pts.
     * @param args a list of numbers, an array of number, or an object with {x,y,z,w} properties
     */
    multiply(...args: any[]): this;
    /**
     * Divide this group's Pts over scalar or vector values (as element-wise)
     * @param args a list of numbers, an array of number, or an object with {x,y,z,w} properties
     */
    divide(...args: any[]): this;
    /**
     * Apply this group as a matrix and calculate matrix addition
     * @param g a scalar number, an array of numeric arrays, or a group of Pt
     * @returns a new Group
     */
    $matrixAdd(g: GroupLike | number[][] | number): Group;
    /**
     * Apply this group as a matrix and calculate matrix multiplication
     * @param g a scalar number, an array of numeric arrays, or a Group of K Pts, each with N dimensions (K-rows, N-columns) -- or if transposed is true, then N Pts with K dimensions
     * @param transposed (Only applicable if it's not elementwise multiplication) If true, then a and b's columns should match (ie, each Pt should have the same dimensions). Default is `false`.
     * @param elementwise if true, then the multiplication is done element-wise. Default is `false`.
     * @returns If not elementwise, this will return a new  Group with M Pt, each with N dimensions (M-rows, N-columns).
     */
    $matrixMultiply(g: GroupLike | number, transposed?: boolean, elementwise?: boolean): Group;
    /**
     * Zip one slice of an array of Pt. Imagine the Pts are organized in rows, then this function will take the values in a specific column.
     * @param idx index to zip at
     * @param defaultValue a default value to fill if index out of bound. If not provided, it will throw an error instead.
     */
    zipSlice(index: number, defaultValue?: number | boolean): Pt;
    /**
     * Zip a group of Pt. eg, [[1,2],[3,4],[5,6]] => [[1,3,5],[2,4,6]]
     * @param defaultValue a default value to fill if index out of bound. If not provided, it will throw an error instead.
     * @param useLongest If true, find the longest list of values in a Pt and use its length for zipping. Default is false, which uses the first item's length for zipping.
     */
    $zip(defaultValue?: number | boolean, useLongest?: boolean): Group;
    /**
     * Get a string representation of this group
     */
    toString(): string;
}
