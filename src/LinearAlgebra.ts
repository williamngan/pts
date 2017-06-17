import {Util} from "./Util"
import {PtArrayType} from "./Pt"

export class LinearAlgebra {

  static add( a:PtArrayType|number[], b:PtArrayType|number[]|number ) {
    if (typeof b == "number") {
      for (let i=0, len=a.length; i<len; i++) a[i] += b;
    } else {
      for (let i=0, len=a.length; i<len; i++) a[i] += b[i] || 0;
    }
    return LinearAlgebra;
  }

  static subtract( a:PtArrayType|number[], b:PtArrayType|number[]|number ) {
    if (typeof b == "number") {
      for (let i=0, len=a.length; i<len; i++) a[i] -= b;
    } else {
      for (let i=0, len=a.length; i<len; i++) a[i] -= b[i] || 0;
    }
    return LinearAlgebra;
  }

  static multiply( a:PtArrayType|number[], b:PtArrayType|number[]|number ) {
    if (typeof b == "number") {
      for (let i=0, len=a.length; i<len; i++) a[i] *= b;
    } else {
      for (let i=0, len=a.length; i<len; i++) a[i] *= b[i] || 1;
    }
    return LinearAlgebra;
  }

  static divide( a:PtArrayType|number[], b:PtArrayType|number[]|number ) {
    if (typeof b == "number") {
      for (let i=0, len=a.length; i<len; i++) a[i] /= b;
    } else {
      for (let i=0, len=a.length; i<len; i++) a[i] /= b[i] || 1;
    }
    return LinearAlgebra;
  }

  static dot( a:PtArrayType|number[], b:PtArrayType|number[] ):number {
    if (a.length != b.length) throw "Array lengths don't match"
    let d = 0;
    for (let i=0, len=a.length; i<len; i++) {
      d += a[i]*b[i];
    }
    return d;
  } 

  static magnitude( a:PtArrayType|number[] ):number {
    return Math.sqrt( LinearAlgebra.dot( a, a ) );
  }

  static unit( a:PtArrayType|number[], magnitude:number=undefined ) {
    let m = (magnitude===undefined) ? LinearAlgebra.magnitude(a) : magnitude;
    return LinearAlgebra.divide( a, m );
  }

  static abs( a:PtArrayType|number[] ) {
    return LinearAlgebra.map( a, Math.abs );
  }

  static max( a:PtArrayType|number[] ) {
    let m = Number.MIN_VALUE;
    for (let i=0, len=this.length; i<len; i++) m = Math.max( m, this[i] );
    return m;
  }

  static min( a:PtArrayType|number[] ) {
    let m = Number.MAX_VALUE;
    for (let i=0, len=this.length; i<len; i++) m = Math.min( m, this[i] );
    return m;
  }

  static map( a:PtArrayType|number[], fn:(n:number, index:number, arr) => number ) {
    for (let i=0, len=a.length; i<len; i++) {
      a[i] = fn( a[i], i, a );
    }
    return LinearAlgebra;
  }
  
}