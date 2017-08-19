import { Group, PtLike } from "./Pt";
import { Bound } from "./Bound";
/**
 * The `Create` class provides various convenient functions to create structures or shapes.
 */
export declare class Create {
    /**
     * Create a set of random points inside a bounday
     * @param bound the rectangular boundary
     * @param count number of random points to create
     * @param dimensions number of dimensions in each point
     */
    static distributeRandom(bound: Bound, count: number, dimensions?: number): Group;
    /**
     * Create an evenly distributed set of points (like a grid of points) inside a boundary.
     * @param bound the rectangular boundary
     * @param columns number of columns
     * @param rows number of rows
     * @param orientation a Pt or number array to specify where the point should be inside a cell. Default is [0.5, 0.5] which places the point in the middle.
     * @returns a Group of Pts
     */
    static gridPts(bound: Bound, columns: number, rows: number, orientation?: PtLike): Group;
    /**
     * Create a grid inside a boundary
     * @param bound the rectangular boundary
     * @param columns number of columns
     * @param rows number of rows
     * @returns an array of Groups, where each group represents a rectangular cell
     */
    static gridCells(bound: Bound, columns: number, rows: number): Group[];
    /**
     * Create a set of Pts around a circular path
     * @param center circle center
     * @param radius circle radius
     * @param count number of Pts to create
     */
    static radialPts(center: PtLike, radius: number, count: number): Group;
}
