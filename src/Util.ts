import {Pt, PtLike, Group, GroupLike} from "./Pt";

export const Const = {
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


export class Util {

  static warnLevel:"error"|"warn"|"default" = "default"; 
  
  /**
   * Convert different kinds of parameters (arguments, array, object) into an array of numbers
   * @param args a list of numbers, an array of number, or an object with {x,y,z,w} properties
   */
  static getArgs( args:any[] ):Array<number> {
    if (args.length<1) return [];

    var pos = [];
    
    var isArray = Array.isArray( args[0] ) || ArrayBuffer.isView( args[0] );
    
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

  static warn( defaultReturn:any, message:string="error" ):any {
    if (Util.warnLevel == "error") {
      throw new Error( message );
    } else if (Util.warnLevel == "warn") {
      console.warn( message );
    }
    return defaultReturn;
  
  }


  /**
   * Split an array into chunks of sub-array
   * @param pts an array 
   * @param size chunk size, ie, number of items in a chunk
   * @param stride optional parameter to "walk through" the array in steps
   */
  static split( pts:any[], size:number, stride?:number ):any[][] {
    let st = stride || size;
    let chunks = [];
    for (let i=0; i<pts.length; i++) {
      if (i*st+size > pts.length) break;
      chunks.push( pts.slice(i*st, i*st+size ) );
    }
    return chunks;
  }


  static flatten( pts:any[], flattenAsGroup:boolean=true ) {
    let arr = (flattenAsGroup) ? new Group() : new Array();
    return arr.concat.apply(arr, pts);
  }


}