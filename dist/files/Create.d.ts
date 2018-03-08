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
    /**
     * Create a Delaunay Group. Use the `.delaunay()` and `.voronoi()` functions in the returned group to generate tessellations.
     * @param pts a Group or an array of Pts
     * @returns an instance of the Delaunay class
     */
    static delaunay(pts: GroupLike): Delaunay;
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
/**
 * A DelaunayShape is an object with 3 indices, a Triangle Group and a Circle Group.
 */
export declare type DelaunayShape = {
    i: number;
    j: number;
    k: number;
    triangle: GroupLike;
    circle: Group;
};
export declare type DelaunayMesh = {
    [key: string]: DelaunayShape;
}[];
/**
 * Delaunay is a Group of Pts that can generate Delaunay and Voronoi tessellations. The triangulation algorithm is ported from [Pt](https://github.com/williamngan/pt)
 * This implementation is based on [Paul Bourke's algorithm](http://paulbourke.net/papers/triangulate/)
 * with reference to its [javascript implementation by ironwallaby](https://github.com/ironwallaby/delaunay)
 */
export declare class Delaunay extends Group {
    private _mesh;
    /**
     * Generate Delaunay triangles. This function also caches the mesh that is used to generate Voronoi tessellation in `voronoi()`.
     * @param triangleOnly if true, returns an array of triangles in Groups, otherwise return the whole DelaunayShape
     * @returns an array of Groups or an array of DelaunayShapes `{i, j, k, triangle, circle}` which records the indices of the vertices, and the calculated triangles and circumcircles
     */
    delaunay(triangleOnly?: boolean): GroupLike[] | DelaunayShape[];
    /**
     * Generate Voronoi cells. `delaunay()` must be called before calling this function.
     * @returns an array of Groups, each of which represents a Voronoi cell
     */
    voronoi(): Group[];
    /**
     * Get the cached mesh. The mesh is an array of objects, each of which representing the enclosing triangles around a Pt in this Delaunay group
     * @return an array of objects that store a series of DelaunayShapes
     */
    mesh(): DelaunayMesh;
    /**
     * Given an index of a Pt in this Delaunay Group, returns its neighboring Pts in the network
     * @param i index of a Pt
     * @param sort if true, sort the neighbors so that their edges will form a polygon
     * @returns an array of Pts
     */
    neighborPts(i: number, sort?: boolean): GroupLike;
    /**
     * Given an index of a Pt in this Delaunay Group, returns its neighboring DelaunayShapes
     * @param i index of a Pt
     * @returns an array of DelaunayShapes `{i, j, k, triangle, circle}`
     */
    neighbors(i: number): DelaunayShape[];
    /**
     * Record a DelaunayShape in the mesh
     * @param o DelaunayShape instance
     */
    protected _cache(o: any): void;
    /**
     * Get the initial "super triangle" that contains all the points in this set
     * @returns a Group representing a triangle
     */
    protected _superTriangle(): Group;
    /**
     * Get a triangle from 3 points in a list of points
     * @param i index 1
     * @param j index 2
     * @param k index 3
     * @param pts a Group of Pts
     */
    protected _triangle(i: number, j: number, k: number, pts?: GroupLike): Group;
    /**
     * Get a circumcircle and triangle from 3 points in a list of points
     * @param i index 1
     * @param j index 2
     * @param k index 3
     * @param tri a Group representing a triangle, or `false` to create it from indices
     * @param pts a Group of Pts
     */
    protected _circum(i: number, j: number, k: number, tri: GroupLike | false, pts?: GroupLike): DelaunayShape;
    /**
     * Dedupe the edges array
     * @param edges
     */
    protected static _dedupe(edges: number[]): number[];
}
