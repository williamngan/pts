import {Util} from "./Util"
import {LinearAlgebra as LA} from "./LinearAlgebra"


export interface IPt {
  x?:number,
  y?:number,
  z?:number,
  w?:number,
  props?:any
}

export type PtArrayType = Float64Array;
let PtBaseArray = Float64Array;

export class Pt extends PtBaseArray implements IPt, Iterable<number> {


  /**
   * Create a Pt. If no parameter is provided, this will instantiate a Pt with 2 dimensions [0, 0].
   * Example: `new Pt()`, `new Pt(1,2,3,4,5)`, `new Pt([1,2])`, `new Pt({x:0, y:1})`, `new Pt(pt)`
   * @param args a list of numbers, an array of number, or an object with {x,y,z,w} properties
   */
  constructor(...args) {
    super( (args.length>0) ? Util.getArgs(args) : [0,0] );
  }

  static make( dimensions:number, defaultValue:number ):Pt {
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
    LA.map( m, fn );
    return m;
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
    (args.length === 1 && typeof args[0] == "number") ? LA.add( this, args[0] ) : LA.add( this, Util.getArgs(args) );
    return this; 
  }

  $add(...args): Pt { return this.clone().add(...args) };


  subtract(...args): this { 
    (args.length === 1 && typeof args[0] == "number") ? LA.subtract( this, args[0] ) : LA.subtract( this, Util.getArgs(args) );
    return this; 
  }

  $subtract(...args): Pt { return this.clone().subtract(...args) };


  multiply(...args): this { 
    (args.length === 1 && typeof args[0] == "number") ? LA.multiply( this, args[0] ) : LA.multiply( this, Util.getArgs(args) );
    return this;
  }

  $multiply(...args): Pt { return this.clone().multiply(...args) };


  divide(...args): this { 
    (args.length === 1 && typeof args[0] == "number") ? LA.divide( this, args[0] ) : LA.divide( this, Util.getArgs(args) );
    return this; 
  }

  $divide(...args): Pt { return this.clone().divide(...args) };


  scale(...args ): this { return this.multiply(...args); }

  $scale(...args ): Pt { return this.clone().scale(...args) };
  

  magnitudeSq():number {  return LA.dot( this, this ); }

  magnitude():number { return LA.magnitude( this ); }


  /**
   * Convert to a unit vector
   * @param magnitude Optional: if the magnitude is known, pass it as a parameter to avoid duplicate calculation.
   */
  unit( magnitude:number=undefined ):Pt {
    LA.unit( this, magnitude );
    return this;
  }

  /**
   * Get a unit vector from this Pt
   */
  $unit( magnitude:number=undefined ):Pt { return this.clone().unit( magnitude ); }

  dot( ...args ):number { return LA.dot( this, Util.getArgs(args) ); }

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
    LA.abs( this );
    return this;
  }

  /**
   * Get a new Pt with absolute values of this Pt
   */
  $abs():Pt {
    return this.clone().abs();
  }

  $min( p: Pt ) {
    let m = this.clone();
    for (let i=0, len=Math.min( this.length, p.length ); i<len; i++) {
      m[i] = Math.min( this[i], p[i] );
    }
    return m;
  }

  $max( p: Pt ) {
    let m = this.clone();
    for (let i=0, len=Math.min( this.length, p.length ); i<len; i++) {
      m[i] = Math.max( this[i], p[i] );
    }
    return m;
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


  static sum( pts:Pt[] ):Pt {
    let c = Pt.make( pts[0].length, 0 );
    for (let i=0, len=pts.length; i<len; i++) {
      c.add( pts[i] );
    }
    return c;
  }


  static average( pts:Pt[] ):Pt {
    return Pt.sum( pts ).divide( pts.length );
  }

}