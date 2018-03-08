import { Pt, PtLike, GroupLike, Group } from "./Pt";
/**
 * Vec provides static function for vector operations. It's not yet optimized but good enough to use.
 */
export declare class Vec {
    /**
     * Add b to vector `a`
     * @returns vector `a`
     */
    static add(a: PtLike, b: PtLike | number): PtLike;
    /**
     * Subtract `b` from vector `a`
     * @returns vector `a`
     */
    static subtract(a: PtLike, b: PtLike | number): PtLike;
    /**
     * Multiply `b` with vector `a`
     * @returns vector `a`
     */
    static multiply(a: PtLike, b: PtLike | number): PtLike;
    /**
     * Divide `a` over `b`
     * @returns vector `a`
     */
    static divide(a: PtLike, b: PtLike | number): PtLike;
    /**
     * Dot product of `a` and `b`
     */
    static dot(a: PtLike, b: PtLike): number;
    /**
     * 2D cross product of `a` and `b`
     */
    static cross2D(a: PtLike, b: PtLike): number;
    /**
     * 3D Cross product of `a` and `b`
     */
    static cross(a: PtLike, b: PtLike): Pt;
    /**
     * Magnitude of `a`
     */
    static magnitude(a: PtLike): number;
    /**
     * Unit vector of `a`. If magnitude of `a` is already known, pass it in the second paramter to optimize calculation.
     */
    static unit(a: PtLike, magnitude?: number): PtLike;
    /**
     * Set `a` to its absolute value in each dimension
     * @returns vector `a`
     */
    static abs(a: PtLike): PtLike;
    /**
     * Set `a` to its floor value in each dimension
     * @returns vector `a`
     */
    static floor(a: PtLike): PtLike;
    /**
     * Set `a` to its ceiling value in each dimension
     * @returns vector `a`
     */
    static ceil(a: PtLike): PtLike;
    /**
     * Set `a` to its rounded value in each dimension
     * @returns vector `a`
     */
    static round(a: PtLike): PtLike;
    /**
     * Find the max value within a vector's dimensions
     * @returns an object with `value` and `index` that specifies the max value and its corresponding dimension.
     */
    static max(a: PtLike): {
        value;
        index;
    };
    /**
     * Find the min value within a vector's dimensions
     * @returns an object with `value` and `index` that specifies the min value and its corresponding dimension.
     */
    static min(a: PtLike): {
        value;
        index;
    };
    /**
     * Sum all the dimensions' values
     */
    static sum(a: PtLike): number;
    /**
     * Given a mapping function, update `a`'s value in each dimension
     * @returns vector `a`
     */
    static map(a: PtLike, fn: (n: number, index: number, arr) => number): PtLike;
}
/**
 * Mat provides static function for matrix operations. It's not yet optimized but good enough to use.
 */
export declare class Mat {
    /**
     * Matrix additions. Matrices should have the same rows and columns.
     * @param a a group of Pt
     * @param b a scalar number, an array of numeric arrays, or a group of Pt
     * @returns a group with the same rows and columns as a and b
     */
    static add(a: GroupLike, b: GroupLike | number[][] | number): Group;
    /**
     * Matrix multiplication
     * @param a a Group of M Pts, each with K dimensions (M-rows, K-columns)
     * @param b a scalar number, an array of numeric arrays, or a Group of K Pts, each with N dimensions (K-rows, N-columns) -- or if transposed is true, then N Pts with K dimensions
     * @param transposed (Only applicable if it's not elementwise multiplication) If true, then a and b's columns should match (ie, each Pt should have the same dimensions). Default is `false`.
     * @param elementwise if true, then the multiplication is done element-wise. Default is `false`.
     * @returns If not elementwise, this will return a group with M Pt, each with N dimensions (M-rows, N-columns).
     */
    static multiply(a: GroupLike, b: GroupLike | number[][] | number, transposed?: boolean, elementwise?: boolean): Group;
    /**
     * Zip one slice of an array of Pt. Imagine the Pts are organized in rows, then this function will take the values in a specific column.
     * @param g a group of Pt
     * @param idx index to zip at
     * @param defaultValue a default value to fill if index out of bound. If not provided, it will throw an error instead.
     */
    static zipSlice(g: GroupLike | number[][], index: number, defaultValue?: number | boolean): Pt;
    /**
     * Zip a group of Pt. eg, [[1,2],[3,4],[5,6]] => [[1,3,5],[2,4,6]]
     * @param g a group of Pt
     * @param defaultValue a default value to fill if index out of bound. If not provided, it will throw an error instead.
     * @param useLongest If true, find the longest list of values in a Pt and use its length for zipping. Default is false, which uses the first item's length for zipping.
     */
    static zip(g: GroupLike | number[][], defaultValue?: number | boolean, useLongest?: boolean): Group;
    /**
     * Same as `zip` function
     */
    static transpose(g: GroupLike | number[][], defaultValue?: number | boolean, useLongest?: boolean): Group;
    /**
     * Transform a 2D point given a 2x3 or 3x3 matrix
     * @param pt a Pt to be transformed
     * @param m 2x3 or 3x3 matrix
     * @returns a new transformed Pt
     */
    static transform2D(pt: PtLike, m: GroupLike | number[][]): Pt;
    /**
     * Get a scale matrix for use in `transform2D`
     */
    static scale2DMatrix(x: number, y: number): GroupLike;
    /**
     * Get a rotate matrix for use in `transform2D`
     */
    static rotate2DMatrix(cosA: number, sinA: number): GroupLike;
    /**
     * Get a shear matrix for use in `transform2D`
     */
    static shear2DMatrix(tanX: number, tanY: number): GroupLike;
    /**
     * Get a translate matrix for use in `transform2D`
     */
    static translate2DMatrix(x: number, y: number): GroupLike;
    /**
     * Get a matrix to scale a point from an origin point. For use in `transform2D`
     */
    static scaleAt2DMatrix(sx: number, sy: number, at: PtLike): GroupLike;
    /**
     * Get a matrix to rotate a point from an origin point. For use in `transform2D`
     */
    static rotateAt2DMatrix(cosA: number, sinA: number, at: PtLike): GroupLike;
    /**
     * Get a matrix to shear a point from an origin point. For use in `transform2D`
     */
    static shearAt2DMatrix(tanX: number, tanY: number, at: PtLike): GroupLike;
    /**
     * Get a matrix to reflect a point along a line. For use in `transform2D`
     * @param p1 first end point to define the reflection line
     * @param p1 second end point to define the reflection line
     */
    static reflectAt2DMatrix(p1: PtLike, p2: PtLike): Pt[];
}
