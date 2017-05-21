import {Vector} from "vectorious";

export interface IPt {
  x?:number,
  y?:number,
  z?:number,
  w?:number
}

export class Pt extends Vector implements IPt, Iterable<number> {

  constructor( ...args:any[]) {
    super( Pt.getArgs( args ) );
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
  to( ...args:any[]):this {
    let p = Pt.getArgs( args );
    for (let i=0; i<p.length; i++) {
      this.set( i, p[i] );
    }
    this.length = Math.max( this.length, p.length );
    return this;
  }

  $add( p:Vector ):Pt { return new Pt(this).add( p ); }
  $subtract( p:Vector ):Pt { return new Pt(this).subtract( p ); }
  $scale( n:number ):Pt { return new Pt(this).scale(n); }
  $normalize():Pt { return new Pt(this).normalize(); }
  $project( p:Vector ):Pt { return new Pt(this).project( new Pt(p) ); }

  multiply( n:number ):this { return this.scale( n ); }
  $multiply( n:number ):Pt { return this.$scale( n ); }
  divide( n:number ):this { return this.scale(1/n); }
  $divide( n:number ):Pt { return this.$scale(1/n); }



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



}