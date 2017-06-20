import {Const, Util} from "./Util"
import {Pt, PtArrayType, PtBaseArray} from "./Pt"
import {Line} from "./Op"


export class Vec {

  static add( a:PtArrayType|number[], b:PtArrayType|number[]|number ) {
    if (typeof b == "number") {
      for (let i=0, len=a.length; i<len; i++) a[i] += b;
    } else {
      for (let i=0, len=a.length; i<len; i++) a[i] += b[i] || 0;
    }
    return Vec;
  }

  static subtract( a:PtArrayType|number[], b:PtArrayType|number[]|number ) {
    if (typeof b == "number") {
      for (let i=0, len=a.length; i<len; i++) a[i] -= b;
    } else {
      for (let i=0, len=a.length; i<len; i++) a[i] -= b[i] || 0;
    }
    return Vec;
  }

  static multiply( a:PtArrayType|number[], b:PtArrayType|number[]|number ) {
    if (typeof b == "number") {
      for (let i=0, len=a.length; i<len; i++) a[i] *= b;
    } else {
      for (let i=0, len=a.length; i<len; i++) a[i] *= b[i] || 1;
    }
    return Vec;
  }

  static divide( a:PtArrayType|number[], b:PtArrayType|number[]|number ) {
    if (typeof b == "number") {
      for (let i=0, len=a.length; i<len; i++) a[i] /= b;
    } else {
      for (let i=0, len=a.length; i<len; i++) a[i] /= b[i] || 1;
    }
    return Vec;
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
    return Math.sqrt( Vec.dot( a, a ) );
  }

  static unit( a:PtArrayType|number[], magnitude:number=undefined ) {
    let m = (magnitude===undefined) ? Vec.magnitude(a) : magnitude;
    return Vec.divide( a, m );
  }

  static abs( a:PtArrayType|number[] ) {
    return Vec.map( a, Math.abs );
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
    return Vec;
  }
  
}


export class Mat {

  static transform2D( pt:PtArrayType|number[], m:PtArrayType[]|number[][] ):Pt {
    let x = pt[0] * m[0][0] + pt[1] * m[1][0] + m[2][0];
    let y = pt[0] * m[0][1] + pt[1] * m[1][1] + m[2][1];
    return new Pt(x, y);
  }

  static scale2DMatrix( x:number, y:number ):PtArrayType[] {
    return [
      new PtBaseArray( [x, 0, 0] ),
      new PtBaseArray( [0, y, 0] ),
      new PtBaseArray( [0, 0, 1] )
    ];
  }

  static rotate2DMatrix( cosA:number, sinA:number ):PtArrayType[] {
    return [
      new PtBaseArray( [cosA, sinA, 0] ),
      new PtBaseArray( [-sinA, cosA, 0,] ),
      new PtBaseArray( [0, 0, 1] )
    ];
  }

  static shear2DMatrix( tanX:number, tanY:number ):PtArrayType[] {
    return [
      new PtBaseArray( [1, tanX, 0] ),
      new PtBaseArray( [tanY, 1, 0] ),
      new PtBaseArray( [0, 0, 1] )
    ];
  }

  static translate2DMatrix( x:number, y:number ):PtArrayType[] {
    return [
      new PtBaseArray( [1, 0, 0] ),
      new PtBaseArray( [0, 1, 0,] ),
      new PtBaseArray( [x, y, 1] )
    ];
  }

  static scaleAt2DMatrix( sx:number, sy:number, at:PtArrayType|number[] ):PtArrayType[] {
    let m = Mat.scale2DMatrix(sx, sy);
    m[2][0] = -at[0]*sx + at[0];
    m[2][1] = -at[1]*sy + at[1];
    return m;
  }


  static rotateAt2DMatrix( cosA:number, sinA:number, at:PtArrayType|number[] ):PtArrayType[] {
    let m = Mat.rotate2DMatrix(cosA, sinA);
    m[2][0] = at[0]*(1-cosA) + at[1]*sinA;
    m[2][1] = at[1]*(1-cosA)-at[0]*sinA;
    return m;
  }

  static shearAt2DMatrix( tanX:number, tanY:number, at:PtArrayType|number[] ):PtArrayType[] {
    let m = Mat.shear2DMatrix(tanX, tanY);
    m[2][0] = -at[1]*tanY;
    m[2][1] = -at[0]*tanX;
    return m;
  }

  static reflectAt2DMatrix( p1:PtArrayType|number[], p2:PtArrayType|number[], at:PtArrayType|number[]) {
    let intercept = Line.intercept( p1, p2 );
    let ang2 = Math.atan( intercept.slope ) * 2;
    let cosA = Math.cos( ang2 );
    let sinA = Math.sin( ang2 );
    return [
      new PtBaseArray( [cosA, sinA, 0] ),
      new PtBaseArray( [sinA, -cosA, 0] ),
      new PtBaseArray( [-intercept.yi*sinA, intercept.yi + intercept.yi*cosA, 1] )
    ]
  }

  
}