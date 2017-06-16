import {Util} from "./Util"
import {ArrayType} from "./Pt"

export class LinearAlgebra {

  static add( a:ArrayType|number[], b:ArrayType|number[]|number ) {
    if (typeof b == "number") {
      for (let i=0, len=a.length; i<len; i++) a[i] += b;
    } else {
      for (let i=0, len=a.length; i<len; i++) a[i] += b[i] || 0;
    }
    return LinearAlgebra;
  }

  static subtract( a:ArrayType|number[], b:ArrayType|number[]|number ) {
    if (typeof b == "number") {
      for (let i=0, len=a.length; i<len; i++) a[i] -= b;
    } else {
      for (let i=0, len=a.length; i<len; i++) a[i] -= b[i] || 0;
    }
    return LinearAlgebra;
  }

  static multiply( a:ArrayType|number[], b:ArrayType|number[]|number ) {
    if (typeof b == "number") {
      for (let i=0, len=a.length; i<len; i++) a[i] *= b;
    } else {
      for (let i=0, len=a.length; i<len; i++) a[i] *= b[i] || 1;
    }
    return LinearAlgebra;
  }

  static divide( a:ArrayType|number[], b:ArrayType|number[]|number ) {
    if (typeof b == "number") {
      for (let i=0, len=a.length; i<len; i++) a[i] /= b;
    } else {
      for (let i=0, len=a.length; i<len; i++) a[i] /= b[i] || 1;
    }
    return LinearAlgebra;
  }

  static dot( a:ArrayType|number[], b:ArrayType|number[] ):number {
    if (a.length != b.length) throw "Array lengths don't match"
    let d = 0;
    for (let i=0, len=a.length; i<len; i++) {
      d += a[i]*b[i];
    }
    return d;
  } 

  static magnitude( a:ArrayType|number[] ):number {
    return Math.sqrt( LinearAlgebra.dot( a, a ) );
  }

  static unit( a:ArrayType|number[] ) {
    return LinearAlgebra.divide( a, LinearAlgebra.magnitude(a) );
  }

  static abs( a:ArrayType|number[] ) {
    return LinearAlgebra.map( a, Math.abs );
  }

  static max( a:ArrayType|number[] ) {
    let m = Number.MIN_VALUE;
    for (let i=0, len=this.length; i<len; i++) m = Math.max( m, this[i] );
    return m;
  }

  static min( a:ArrayType|number[] ) {
    let m = Number.MAX_VALUE;
    for (let i=0, len=this.length; i<len; i++) m = Math.min( m, this[i] );
    return m;
  }

  static map( a:ArrayType|number[], fn:(n:number, index:number, arr) => number ) {
    for (let i=0, len=a.length; i<len; i++) {
      console.log( a[i], i );
      a[i] = fn( a[i], i, a );
    }
    return LinearAlgebra;
  }
  
}