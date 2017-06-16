import {Util} from "./Util"
import {LinearAlgebra} from "./LinearAlgebra"


export interface IPt {
  x?:number,
  y?:number,
  z?:number,
  w?:number,
  props?:any
}

export type ArrayType = Float64Array;

let TypedArray = Float64Array; 
let LA = LinearAlgebra;

export class Pt extends TypedArray implements IPt, Iterable<number> {


  /**
   * Create a Pt. This will instantiate with at least 3 dimensions. If provided parameters are less than 3 dimensions, default value of 0 will be used to fill. Use 'Pt.$()' if you need 1D or 2D specifically.
   * Example: `new Pt()`, `new Pt(1,2,3,4,5)`, `new Pt([1,2])`, `new Pt({x:0, y:1})`, `new Pt(pt)`
   * @param args a list of numbers, an array of number, or an object with {x,y,z,w} properties
   */
  constructor(...args) {
    super( Util.getArgs(args) );
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

  equals( p:ArrayType|number[], threshold=0 ):boolean {
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


  $map( fn:(currentValue:number, index:number, array:ArrayType) => number):Pt {
    let m = this.clone();
    LinearAlgebra.map( m, fn );
    return m;
  }


  /**
   * Get a new Pt based on a slice of this Pt. Similar to `Array.slice()`.
   * @param start start index
   * @param end end index (ie, entry will not include value at this index)
   */
  $slice(start?:number, end?:number):Pt {
    let m = new TypedArray( this ).slice(start, end);
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
   */
  unit():Pt {
    LA.unit( this );
    return this;
  }

  /**
   * Get a unit vector from this Pt
   */
  $unit():Pt { return this.clone().unit(); }

  dot( ...args ):number { return LA.dot( this, Util.getArgs(args) ); }

  cross( ...args ): Pt { 
    let p = Util.getArgs( args );
    return new Pt( (this[1]*p[2] - this[2]*p[1]), (this[2]*p[0] - this[0]*p[2]), (this[0]*p[1] - this[1]*p[0]) )
  }

  project( p:Pt ):Pt {
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


  toString():string {
    return `Pt(${ this.join(", ")})`
  }

  toArray():number[] {
    return [].slice.call( this );
  }
}