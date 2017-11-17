// Source code licensed under Apache License 2.0.
// Copyright © 2017 William Ngan. (https://github.com/williamngan)


import {Group} from "./Pt";


/**
 * Various constant values for enumerations and calculations
 */
export const Const: {
  xy: "xy",
  yz: "yz",
  xz: "xz",
  xyz: "xyz",

  horizontal: number,
  vertical: number,

  /* represents identical point or value */
  identical: number,

  /* represents right position or direction */
  right: number,

  /* represents bottom right position or direction */
  bottom_right: number,

  /* represents bottom position or direction */
  bottom: number,

  /* represents bottom left position or direction */
  bottom_left: number,

  /* represents left position or direction */
  left: number,

  /* represents top left position or direction */
  top_left: number,

  /* represents top position or direction */
  top: number,

  /* represents top right position or direction */
  top_right: number,

  /* represents an arbitrary very small number. It is set as 0.0001 here. */
  epsilon : number,

  /* pi radian (180 deg) */
  pi: number,

  /* two pi radian (360deg) */
  two_pi : number,

  /* half pi radian (90deg) */
  half_pi :number,

  /* pi/4 radian (45deg) */
  quarter_pi : number,

  /* pi/180: 1 degree in radian */
  one_degree: number,

  /* multiply this constant with a radian to get a degree */
  rad_to_deg: number,

  /* multiply this constant with a degree to get a radian */
  deg_to_rad: number,

  /* Gravity acceleration (unit: m/s^2) and gravity force (unit: Newton) on 1kg of mass. */
  gravity: number,

  /* 1 Newton: 0.10197 Kilogram-force */
  newton: number,

  /* Gaussian constant (1 / Math.sqrt(2 * Math.PI)) */
  gaussian: number

} = {
  xy: "xy",
  yz: "yz",
  xz: "xz",
  xyz: "xyz",

  horizontal: 0,
  vertical: 1,

  /* represents identical point or value */
  identical: 0,

  /* represents right position or direction */
  right: 4,

  /* represents bottom right position or direction */
  bottom_right: 5,

  /* represents bottom position or direction */
  bottom: 6,

  /* represents bottom left position or direction */
  bottom_left: 7,

  /* represents left position or direction */
  left: 8,

  /* represents top left position or direction */
  top_left: 1,

  /* represents top position or direction */
  top: 2,

  /* represents top right position or direction */
  top_right: 3,

  /* represents an arbitrary very small number. It is set as 0.0001 here. */
  epsilon : 0.0001,

  /* pi radian (180 deg) */
  pi: Math.PI,

  /* two pi radian (360deg) */
  two_pi : 6.283185307179586,

  /* half pi radian (90deg) */
  half_pi : 1.5707963267948966,

  /* pi/4 radian (45deg) */
  quarter_pi : 0.7853981633974483,

  /* pi/180: 1 degree in radian */
  one_degree: 0.017453292519943295,

  /* multiply this constant with a radian to get a degree */
  rad_to_deg: 57.29577951308232,

  /* multiply this constant with a degree to get a radian */
  deg_to_rad: 0.017453292519943295,

  /* Gravity acceleration (unit: m/s^2) and gravity force (unit: Newton) on 1kg of mass. */
  gravity: 9.81,

  /* 1 Newton: 0.10197 Kilogram-force */
  newton: 0.10197,

  /* Gaussian constant (1 / Math.sqrt(2 * Math.PI)) */
  gaussian: 0.3989422804014327

};


/**
 * Util provides various helper functions
 */
export class Util {

  static warnLevel:"error"|"warn"|"default" = "default";

  /**
   * Convert different kinds of parameters (arguments, array, object) into an array of numbers
   * @param args a list of numbers, an array of number, or an object with {x,y,z,w} properties
   */
  static getArgs(x:number, y?: number, z?:number, w?:number):Array<number>;
  static getArgs(arg: {x:number, y?: number, z?:number, w?:number}):Array<number>;
  static getArgs(arg: {x:number, y?: number, z?:number, w?:number}[]):Array<number>;
  static getArgs(arg:number[]):Array<number>;
  static getArgs(arg:number[][]):Array<number>;
  static getArgs(args: any):Array<number> {
    if (args.length<1) return [];

    let pos = [];
    
    let isArray = Array.isArray( args[0] ) || ArrayBuffer.isView( args[0] );
    
    // positional arguments: x,y,z,w,...
    if (typeof args[0] === 'number') {
      pos = Array.prototype.slice.call( args );

    // as an object of {x, y?, z?, w?}
    } else if (typeof args[0] === 'object' && !isArray ) {
      let a = ["x", "y", "z", "w"];
      let p = args[0];
      for (let i=0; i<a.length; i++) {
        if ( (p.length && i>=p.length) || !(a[i] in p) ) break; // check for length and key exist
        pos.push( p[ a[i] ] );
      }

    // as an array of values
    } else if (isArray) {
      pos = [].slice.call( args[0] );
    }
    
    return pos;
  }


  /**
   * Send a warning message based on Util.warnLevel global setting. This allows you to dynamically set whether minor errors should be thrown or printed in console or muted.
   * @param message any error or warning message
   * @param defaultReturn optional return value
   */
  static warn( message:string="error", defaultReturn:any=undefined ):any {
    if (Util.warnLevel == "error") {
      throw new Error( message );
    } else if (Util.warnLevel == "warn") {
      console.warn( message );
    }
    return defaultReturn;
  
  }


  static randomInt( range:number, start:number=0 ) {
    return Math.floor( Math.random()*range ) + start;
  }

  /**
   * Split an array into chunks of sub-array
   * @param pts an array 
   * @param size chunk size, ie, number of items in a chunk
   * @param stride optional parameter to "walk through" the array in steps
   * @param loopBack if `true`, always go through the array till the end and loop back to the beginning to complete the segments if needed
   */
  static split( pts:any[], size:number, stride?:number, loopBack:boolean=false ):any[][] {
    let st = stride || size;
    let chunks = [];
    for (let i=0; i<pts.length; i++) {
      if (i*st+size > pts.length) {
        if (loopBack) {
          let g = pts.slice(i*st);
          g = g.concat( pts.slice( 0, (i*st+size)%size ) );
          chunks.push( g );
        } else {
          break;
        }
      } else {
        chunks.push( pts.slice(i*st, i*st+size ) );
      }
    }
    return chunks;
  }


  /**
   * Flatten an array of arrays such as Group[] to a flat Array or Group
   * @param pts an array, usually an array of Groups
   * @param flattenAsGroup a boolean to specify whether the return type should be a Group or Array. Default is `true` which returns a Group.
   */
  static flatten( pts:any[], flattenAsGroup:boolean=true ) {
    let arr = (flattenAsGroup) ? new Group() : new Array();
    return arr.concat.apply(arr, pts);
  }


    /**
   * Given two arrays of object<T>, and a function that operate on two object<T>, return an array of T  
   * @param a an array of object<T>, eg [ Group, Group, ... ]
   * @param b another array of object<T>
   * @param op a function that takes two parameters (a, b) and returns a T
   */
  static combine<T>( a:T[], b:T[], op:(a:T, b:T) => T ):T[] {
    let result = [];
    for (let i=0, len=a.length; i<len; i++) {
      for (let k=0, lenB=b.length; k<lenB; k++) {
        result.push( op(a[i], b[k]) );
      }
    }
    return result;
  }


  /**
   * Zip arrays. eg, [[1,2],[3,4],[5,6]] => [[1,3,5],[2,4,6]]
   * @param arrays an array of arrays 
   */
  static zip( ...arrays:Array<any>[] ) {
    let z = [];
    for (let i=0, len=arrays[0].length; i<len; i++) {
      let p = [];
      for (let k=0; k<arrays.length; k++) {
        p.push( arrays[k][i] );
      }
      z.push( p );
    }
    return z;
  }

  static set<T, S extends keyof T>(object:T, key:any, val: T[S]):void;
  static set<T, S extends keyof T>(object:T, key:S, val: T[S]):void;
  static set<T, S extends keyof T>(object:T, key:S, val: T[S]):void {
    object[key] = val;
  }
  static get<T, S extends keyof T>(object:T, key:any):T[S];
  static get<T, S extends keyof T>(object:T, key:S):T[S];
  static get<T, S extends keyof T>(object:T, key:S):T[S] {
    return object[key];
  }

}