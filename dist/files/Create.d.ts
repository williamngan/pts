import { Pt, Group, PtLike, GroupLike } from "./Pt";
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
     * Create a set of points that distribute evenly on a line
     * @param line a Group representing a line
     * @param count number of points to create
     */
    static distributeLinear(line: GroupLike, count: number): Group;
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
    /**
     * Given a group of Pts, return a new group of `Noise` Pts.
     * @param pts a Group or an array of Pts
     * @param dx small increment value in x dimension
     * @param dy small increment value in y dimension
     * @param rows Optional row count to generate 2D noise
     * @param columns Optional column count to generate 2D noise
     */
    static noisePts(pts: GroupLike, dx?: number, dy?: number, rows?: number, columns?: number): Group;
}
/**
 * A class to generate Perlin noise. Currently it implements a basic 2D noise. More to follow.
 * Based on https://gist.github.com/banksean/304522
 */
export declare class Noise extends Pt {
    protected perm: number[];
    private _n;
    /**
     * Create a Noise Pt that's capable of generating noise
     * @param args a list of numeric parameters, an array of numbers, or an object with {x,y,z,w} properties
     */
    constructor(...args: any[]);
    /**
     * Set the initial noise values
     * @param args a list of numeric parameters, an array of numbers, or an object with {x,y,z,w} properties
     * @example `noise.initNoise( 0.01, 0.1 )`
     */
    initNoise(...args: any[]): void;
    /**
     * Add a small increment to the noise values
     * @param x step in x dimension
     * @param y step in y dimension
     */
    step(x?: number, y?: number): void;
    /**
     * Specify a seed for this Noise
     * @param s seed value
     */
    seed(s: any): void;
    /**
     * Generate a 2D Perlin noise value
     */
    noise2D(): number;
}
