import {Vector} from "vectorious";
import "./augment"

export interface IPt {
  x?:number,
  y?:number,
  z?:number,
  w?:number,
  props?:any
}

export class Pt extends Vector implements IPt, Iterable<number> {

  protected data:Float64Array;

  /**
   * Create a Pt. This will instantiate with at least 3 dimensions. If provided parameters are less than 3 dimensions, default value of 0 will be used to fill. Use 'Pt.$()' if you need 1D or 2D specifically.
   * Example: `new Pt()`, `new Pt(1,2,3,4,5)`, `new Pt([1,2])`, `new Pt({x:0, y:1})`, `new Pt(pt)`
   * @param args a list of numbers, an array of number, or an object with {x,y,z,w} properties
   */
  constructor( ...args:any[]) {
    let p = Pt.getArgs( args );
    for (let i=p.length; i<3; i++) { p.push(0); } // fill to 3 dimensions
    super( p );
  }


  /**
   * Create a Pt without padding to 3 dimensions. This allows you to create Pt with less than 3 dimensions.
   * Example: `Pt.$()`, `Pt.$(1,2,3,4,5)`, `Pt.$([1,2])`, `Pt.$({x:0, y:1})`, `Pt.$(pt)`
   * @param args a list of numbers, an array of number, or an object with {x,y,z,w} properties
   */
  static $( ...args:any[]) {
    let p = Pt.getArgs( args );
    let pt = new Pt();
    pt.data = new Float64Array(p);
    pt.length = p.length;
    return pt;
  }


  /**
   * Convert different kinds of parameters (arguments, array, object) into an array of numbers
   * @param args a list of numbers, an array of number, or an object with {x,y,z,w} properties
   */
  static getArgs( args:any[] ):Array<number> {
    if (args.length<1) return [];

    var pos = [];
    
    // positional arguments: x,y,z,w,...
    if (typeof args[0] === 'number') {
      pos = Array.prototype.slice.call( args );

    // as an object of {x, y?, z?, w?}
    } else if (typeof args[0] === 'object' && !Array.isArray( args[0] )) {
      let a = ["x", "y", "z", "w"];
      let p = args[0];
      for (let i=0; i<a.length; i++) {
        if ( (p.length && i>=p.length) || !(a[i] in p) ) break; // check for length and key exist
        pos.push( p[ a[i] ] );
      }

    // as an array of values
    } else if (Array.isArray( args[0] )) {
      let _x = args[0] as Array<number>;
      pos = _x.slice();
    }
    
    return pos;
  }


  /**
   * Update the values of this Pt
   * @param args a list of numbers, an array of number, or an object with {x,y,z,w} properties
   */
  set( ...args:any[]):this {
    let p = Pt.getArgs( args );
    for (let i=0; i<p.length; i++) {
      super.set( i, p[i] );
    }
    this.length = Math.max( this.length, p.length );
    return this;
  }

  /**
   * Apply a series of functions to transform this Pt. The function should have this form: (p:Pt) => Pt
   * @param fns a list of function as array or object {key: function}
   */
  to( fns: ((p:Pt) => Pt)[] | {[key:string]:(p:Pt) => Pt} ):Pt[] {
    let results = [];
    for (var k in fns) {
      results[k] = fns[k]( this );
    }
    return results;
  }


  // Override the functions in vectorious library
  add( ...args:any[] ):this { return super.add( new Pt( Pt.getArgs(args)) ); }
  subtract( ...args:any[] ):this { return super.subtract( new Pt( Pt.getArgs(args)) ); }
  multiply( n:number ):this { return this.scale( n ); }
  divide( n:number ):this { return this.scale(1/n); }

  $add( ...args:any[] ):Pt { return new Pt(this).add( Pt.getArgs(args) ); }
  $subtract( ...args:any[] ):Pt { return new Pt(this).subtract( Pt.getArgs(args) ); }
  $multiply( n:number ):Pt { return this.$scale( n ); }
  $divide( n:number ):Pt { return this.$scale(1/n); }
  $scale( n:number ):Pt { return new Pt(this).scale(n); }
  $normalize():Pt { return new Pt(this).normalize(); }
  $project( p:Vector ):Pt { return new Pt(this).project( new Pt(p) ); }


  /**
   * Iterator implementation to support for ... of loop
   */
  [Symbol.iterator]():Iterator<number> {

    let idx = 0;
    let count = this.length;
    let self = this;

    return {
      next(): IteratorResult<number> {
        return (idx < count) ? { done: false, value: self.get(idx++) } : { done: true, value: null };
      }
    }
  }


  /**
   * Clone this and return a new Pt
   */
  clone():Pt {
    return new Pt( this );
  }


  /**
   * Similar to `get()`, but return a default value instead of throwing error when index is out-of-bound, 
   * @param idx index to get
   * @param defaultValue value to return when index is out of bound
   */
  at(idx:number, defaultValue?:number):number {
    return this.data[idx] || defaultValue;
  }


  /**
   * Get a new Pt based on a slice of this Pt. Similar to `Array.slice()`.
   * @param start start index
   * @param end end index (ie, entry will not include value at this index)
   */
  slice(start?:number, end?:number):Pt {
    return new Pt( [].slice.call( this.data.slice(start, end) ) );
  }


  /**
   * Absolute values for all values in this pt
   */
  abs():Pt {
    this.each( (p) => Math.abs(p) );
    return this;
  }

  /**
   * Get a new Pt with absolute values of this Pt
   */
  $abs():Pt {
    return this.clone().abs();
  }

  /**
   * Convert to a unit vector
   */
  unit():Pt {
    return this.divide( this.magnitude() );
  }

  /**
   * Get a unit vector from this Pt
   */
  $unit():Pt {
    return this.clone().unit();
  }


}