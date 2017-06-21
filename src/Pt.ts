import {Util, Const} from "./Util"
import {Geom} from "./Op"
import {Bound} from "./Bound"
import {Vec} from "./LinearAlgebra"


export interface IPt {
  x?:number,
  y?:number,
  z?:number,
  w?:number,
  props?:any
}

export type PtArrayType = Float64Array;
export var PtBaseArray = Float64Array;

export class Pt extends PtBaseArray implements IPt, Iterable<number> {


  /**
   * Create a Pt. If no parameter is provided, this will instantiate a Pt with 2 dimensions [0, 0].
   * Example: `new Pt()`, `new Pt(1,2,3,4,5)`, `new Pt([1,2])`, `new Pt({x:0, y:1})`, `new Pt(pt)`
   * @param args a list of numbers, an array of number, or an object with {x,y,z,w} properties
   */
  constructor(...args) {
    super( (args.length>0) ? Util.getArgs(args) : [0,0] );
  }

  static make( dimensions:number, defaultValue:number=0 ):Pt {
    let p = new PtBaseArray(dimensions);
    if (defaultValue) p.fill( defaultValue );
    return new Pt( p );
  }


  get x():number { return this[0]; }
  get y():number { return this[1]; }
  get z():number { return this[2]; }
  get w():number { return this[3]; }

  set x( n:number ) { this[0] = n; }
  set y( n:number ) { this[1] = n; }
  set z( n:number ) { this[2] = n; }
  set w( n:number ) { this[3] = n; }
  

  clone():Pt {
    return new Pt( this );
  }

  equals( p:PtArrayType|number[], threshold=0 ):boolean {
    for (let i=0, len=this.length; i<len; i++) {
      if ( Math.abs(this[i]-p[i]) > threshold ) return false;
    }
    return true;
  }


  /**
   * Update the values of this Pt
   * @param args a list of numbers, an array of number, or an object with {x,y,z,w} properties
   */
  to( ...args ):this {
    let p = Util.getArgs( args );
    for (let i=0, len=Math.min(this.length, p.length); i<len; i++) {
      this[i] = p[i];
    }
    return this;
  }

  /**
   * Update the values of this Pt to point at a specific angle
   * @param radian target angle in radian
   * @param magnitude Optional magnitude if known. If not provided, it'll calculate and use this Pt's magnitude.
   */
  toAngle( radian:number, magnitude?:number ):this {
    let m = (magnitude!=undefined) ? magnitude : this.magnitude();
    return this.to( Math.cos(radian)*m, Math.sin(radian)*m );
  }

  /**
   * Apply a series of functions to transform this Pt. The function should have this form: (p:Pt) => Pt
   * @param fns a list of function as array or object {key: function}
   */
  op( fns: ((p:Pt) => Pt)[] | {[key:string]:(p:Pt) => Pt} ):Pt[] {
    let results = [];
    for (var k in fns) {
      results[k] = fns[k]( this );
    }
    return results;
  }


  $map( fn:(currentValue:number, index:number, array:PtArrayType) => number):Pt {
    let m = this.clone();
    Vec.map( m, fn );
    return m;
  }

  /**
   * Take specific dimensional values from this Pt and create a new Pt
   * @param axis a string such as "xy" (use Const.xy) or an array to specify index for two dimensions
   */
  $take( axis:string|number[] ):Pt {
    let p = [];
    for (let i=0, len=axis.length; i<len; i++) {
      p.push( this[axis[i]] || 0 );
    }
    return new Pt(p);
  }


  /**
   * Get a new Pt based on a slice of this Pt. Similar to `Array.slice()`.
   * @param start start index
   * @param end end index (ie, entry will not include value at this index)
   */
  $slice(start?:number, end?:number):Pt {
    // seems like new Pt(...).slice will return an error, must use Float64Array
    let m = new PtBaseArray( this ).slice(start, end); 
    return new Pt( m );
  }

  $concat( ...args ) {
    return new Pt( this.toArray().concat( Util.getArgs( args ) ) );
  }

  add(...args): this { 
    (args.length === 1 && typeof args[0] == "number") ? Vec.add( this, args[0] ) : Vec.add( this, Util.getArgs(args) );
    return this; 
  }

  $add(...args): Pt { return this.clone().add(...args) };


  subtract(...args): this { 
    (args.length === 1 && typeof args[0] == "number") ? Vec.subtract( this, args[0] ) : Vec.subtract( this, Util.getArgs(args) );
    return this; 
  }

  $subtract(...args): Pt { return this.clone().subtract(...args) };


  multiply(...args): this { 
    (args.length === 1 && typeof args[0] == "number") ? Vec.multiply( this, args[0] ) : Vec.multiply( this, Util.getArgs(args) );
    return this;
  }

  $multiply(...args): Pt { return this.clone().multiply(...args) };


  divide(...args): this { 
    (args.length === 1 && typeof args[0] == "number") ? Vec.divide( this, args[0] ) : Vec.divide( this, Util.getArgs(args) );
    return this; 
  }

  $divide(...args): Pt { return this.clone().divide(...args) };


  scale(...args ): this { return this.multiply(...args); }

  $scale(...args ): Pt { return this.clone().scale(...args) };
  

  magnitudeSq():number {  return Vec.dot( this, this ); }

  magnitude():number { return Vec.magnitude( this ); }


  /**
   * Convert to a unit vector
   * @param magnitude Optional: if the magnitude is known, pass it as a parameter to avoid duplicate calculation.
   */
  unit( magnitude:number=undefined ):Pt {
    Vec.unit( this, magnitude );
    return this;
  }

  /**
   * Get a unit vector from this Pt
   */
  $unit( magnitude:number=undefined ):Pt { return this.clone().unit( magnitude ); }

  dot( ...args ):number { return Vec.dot( this, Util.getArgs(args) ); }

  $cross( ...args ): Pt { 
    let p = Util.getArgs( args );
    return new Pt( (this[1]*p[2] - this[2]*p[1]), (this[2]*p[0] - this[0]*p[2]), (this[0]*p[1] - this[1]*p[0]) )
  }

  $project( p:Pt ):Pt {
    let m = p.magnitude();
    let a = this.$unit();
    let b = p.$divide(m);
    let dot = a.dot( b );
    return a.multiply( m * dot );
  }


  /**
   * Absolute values for all values in this pt
   */
  abs():Pt {
    Vec.abs( this );
    return this;
  }

  /**
   * Get a new Pt with absolute values of this Pt
   */
  $abs():Pt {
    return this.clone().abs();
  }

  $min( p: Pt ):Pt {
    let m = this.clone();
    for (let i=0, len=Math.min( this.length, p.length ); i<len; i++) {
      m[i] = Math.min( this[i], p[i] );
    }
    return m;
  }

  $max( p: Pt ):Pt {
    let m = this.clone();
    for (let i=0, len=Math.min( this.length, p.length ); i<len; i++) {
      m[i] = Math.max( this[i], p[i] );
    }
    return m;
  }

  /**
   * Get angle of this vector from origin
   * @param axis a string such as "xy" (use Const.xy) or an array to specify index for two dimensions
   */
  angle( axis:string|number[]=Const.xy ):number {
    return Math.atan2( this[axis[1]], this[axis[0]] );
  }

  /**
   * Get the angle between this and another Pt
   * @param p the other Pt
   * @param axis a string such as "xy" (use Const.xy) or an array to specify index for two dimensions
   */
  angleBetween( p:Pt, axis:string|number[]=Const.xy ):number {
    console.log(  Geom.boundRadian( this.angle(axis) ) - Geom.boundRadian( p.angle(axis) ) );
    return Geom.boundRadian( this.angle(axis) ) - Geom.boundRadian( p.angle(axis) );
  }

  /**
   * Check if another Pt is perpendicular to this Pt
   * @param p another Pt
   */
  isPerpendicular( p ) {
    return this.dot(p) == 0
  } 


  toString():string {
    return `Pt(${ this.join(", ")})`
  }

  toArray():number[] {
    return [].slice.call( this );
  }


  /**
   * Zip one slice of an array of Pt
   * @param pts an array of Pt
   * @param idx index to zip at
   * @param defaultValue a default value to fill if index out of bound. If not provided, it will throw an error instead.
   */
  static zipOne( pts:Pt[],  index:number, defaultValue:number|boolean = false ):Pt {
    let f = (typeof defaultValue == "boolean") ? "get" : "at"; // choose `get` or `at` function
    let z = [];
    for (let i=0, len=pts.length; i<len; i++) {
      if (pts[i].length-1 < index && defaultValue === false) throw `Index ${index} is out of bounds`;
      z.push( pts[i][index] || defaultValue );
    }
    return new Pt(z);
  }


  /**
   * Zip an array of Pt. eg, [[1,2],[3,4],[5,6]] => [[1,3,5],[2,4,6]]
   * @param pts an array of Pt
   * @param defaultValue a default value to fill if index out of bound. If not provided, it will throw an error instead.
   * @param useLongest If true, find the longest list of values in a Pt and use its length for zipping. Default is false, which uses the first item's length for zipping.
   */
  static zip( pts:Pt[], defaultValue:number|boolean = false, useLongest=false ):Pt[] {
    let ps = [];
    let len = (useLongest) ? pts.reduce( (a,b) => Math.max(a, b.length), 0 ) : pts[0].length;
    for (let i=0; i<len; i++) {
      ps.push( Pt.zipOne( pts, i, defaultValue ) )
    }
    return ps;
  }

}


export class Group extends Array<Pt> {


  clone():Group {
    let group = new Group();   
    for (let i=0, len=this.length; i<len; i++) {
      group.push( this[i].clone() );
    }
    return group;
  }

  boundingBox():Bound {
    return Geom.boundingBox( this );
  }

  centroid():Pt {
    return Geom.centroid( this );
  }

  interpolate( t:number ):Pt {
    let chunk = this.length-1;
    let tc = 1/(this.length-1);
    let idx = Math.floor( t / tc );
    return Geom.interpolate( this[idx], this[idx+1], (t - idx*tc) * chunk );
  }

}