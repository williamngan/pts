/**
 * Various constant values for enumerations and calculations
 */
export declare const Const: {
    xy: string;
    yz: string;
    xz: string;
    xyz: string;
    horizontal: number;
    vertical: number;
    identical: number;
    right: number;
    bottom_right: number;
    bottom: number;
    bottom_left: number;
    left: number;
    top_left: number;
    top: number;
    top_right: number;
    epsilon: number;
    pi: number;
    two_pi: number;
    half_pi: number;
    quarter_pi: number;
    one_degree: number;
    rad_to_deg: number;
    deg_to_rad: number;
    gravity: number;
    newton: number;
    gaussian: number;
};
/**
 * Util provides various helper functions
 */
export declare class Util {
    static warnLevel: "error" | "warn" | "default";
    /**
     * Convert different kinds of parameters (arguments, array, object) into an array of numbers
     * @param args a list of numbers, an array of number, or an object with {x,y,z,w} properties
     */
    static getArgs(args: any[]): Array<number>;
    /**
     * Send a warning message based on Util.warnLevel global setting. This allows you to dynamically set whether minor errors should be thrown or printed in console or muted.
     * @param message any error or warning message
     * @param defaultReturn optional return value
     */
    static warn(message?: string, defaultReturn?: any): any;
    static randomInt(range: number, start?: number): number;
    /**
     * Split an array into chunks of sub-array
     * @param pts an array
     * @param size chunk size, ie, number of items in a chunk
     * @param stride optional parameter to "walk through" the array in steps
     * @param loopBack if `true`, always go through the array till the end and loop back to the beginning to complete the segments if needed
     */
    static split(pts: any[], size: number, stride?: number, loopBack?: boolean): any[][];
    /**
     * Flatten an array of arrays such as Group[] to a flat Array or Group
     * @param pts an array, usually an array of Groups
     * @param flattenAsGroup a boolean to specify whether the return type should be a Group or Array. Default is `true` which returns a Group.
     */
    static flatten(pts: any[], flattenAsGroup?: boolean): any;
    /**
   * Given two arrays of object<T>, and a function that operate on two object<T>, return an array of T
   * @param a an array of object<T>, eg [ Group, Group, ... ]
   * @param b another array of object<T>
   * @param op a function that takes two parameters (a, b) and returns a T
   */
    static combine<T>(a: T[], b: T[], op: (a: T, b: T) => T): T[];
    /**
     * Zip arrays. eg, [[1,2],[3,4],[5,6]] => [[1,3,5],[2,4,6]]
     * @param arrays an array of arrays
     */
    static zip(...arrays: Array<any>[]): any[];
}
