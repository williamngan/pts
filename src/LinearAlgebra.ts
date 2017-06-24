import {Const, Util} from "./Util"
import {Pt, PtLike, GroupLike, Group} from "./Pt"
import {Line} from "./Op"


export class Vec {

  static add( a:PtLike, b:PtLike|number ) {
    if (typeof b == "number") {
      for (let i=0, len=a.length; i<len; i++) a[i] += b;
    } else {
      for (let i=0, len=a.length; i<len; i++) a[i] += b[i] || 0;
    }
    return Vec;
  }

  static subtract( a:PtLike, b:PtLike|number ) {
    if (typeof b == "number") {
      for (let i=0, len=a.length; i<len; i++) a[i] -= b;
    } else {
      for (let i=0, len=a.length; i<len; i++) a[i] -= b[i] || 0;
    }
    return Vec;
  }

  static multiply( a:PtLike, b:PtLike|number ) {
    if (typeof b == "number") {
      for (let i=0, len=a.length; i<len; i++) a[i] *= b;
    } else {
      for (let i=0, len=a.length; i<len; i++) a[i] *= b[i] || 1;
    }
    return Vec;
  }

  static divide( a:PtLike, b:PtLike|number ) {
    if (typeof b == "number") {
      for (let i=0, len=a.length; i<len; i++) a[i] /= b;
    } else {
      for (let i=0, len=a.length; i<len; i++) a[i] /= b[i] || 1;
    }
    return Vec;
  }

  static dot( a:PtLike, b:PtLike ):number {
    if (a.length != b.length) throw "Array lengths don't match"
    let d = 0;
    for (let i=0, len=a.length; i<len; i++) {
      d += a[i]*b[i];
    }
    return d;
  } 

  static cross( a:PtLike, b:PtLike ):Pt {
    return new Pt( (a[1]*b[2] - a[2]*b[1]), (a[2]*b[0] - a[0]*b[2]), (a[0]*b[1] - a[1]*b[0]) );
  }

  static magnitude( a:PtLike ):number {
    return Math.sqrt( Vec.dot( a, a ) );
  }

  static unit( a:PtLike, magnitude:number=undefined ) {
    let m = (magnitude===undefined) ? Vec.magnitude(a) : magnitude;
    return Vec.divide( a, m );
  }

  static abs( a:PtLike ) {
    return Vec.map( a, Math.abs );
  }

  static max( a:PtLike ) {
    let m = Number.MIN_VALUE;
    for (let i=0, len=this.length; i<len; i++) m = Math.max( m, this[i] );
    return m;
  }

  static min( a:PtLike ) {
    let m = Number.MAX_VALUE;
    for (let i=0, len=this.length; i<len; i++) m = Math.min( m, this[i] );
    return m;
  }

  static map( a:PtLike, fn:(n:number, index:number, arr) => number ) {
    for (let i=0, len=a.length; i<len; i++) {
      a[i] = fn( a[i], i, a );
    }
    return Vec;
  }
  
}


export class Mat {

  static transform2D( pt:PtLike, m:GroupLike ):Pt {
    let x = pt[0] * m[0][0] + pt[1] * m[1][0] + m[2][0];
    let y = pt[0] * m[0][1] + pt[1] * m[1][1] + m[2][1];
    return new Pt(x, y);
  }

  static scale2DMatrix( x:number, y:number ):GroupLike {
    return new Group(
      new Pt( x, 0, 0 ),
      new Pt( 0, y, 0 ),
      new Pt( 0, 0, 1 )
    );
  }

  static rotate2DMatrix( cosA:number, sinA:number ):GroupLike {
    return new Group(
      new Pt( cosA, sinA, 0 ),
      new Pt( -sinA, cosA, 0, ),
      new Pt( 0, 0, 1 )
    );
  }

  static shear2DMatrix( tanX:number, tanY:number ):GroupLike {
    return new Group(
      new Pt( 1, tanX, 0 ),
      new Pt( tanY, 1, 0 ),
      new Pt( 0, 0, 1 )
    );
  }

  static translate2DMatrix( x:number, y:number ):GroupLike {
    return new Group(
      new Pt( 1, 0, 0 ),
      new Pt( 0, 1, 0 ),
      new Pt( x, y, 1 )
    );
  }

  static scaleAt2DMatrix( sx:number, sy:number, at:PtLike ):GroupLike {
    let m = Mat.scale2DMatrix(sx, sy);
    m[2][0] = -at[0]*sx + at[0];
    m[2][1] = -at[1]*sy + at[1];
    return m;
  }


  static rotateAt2DMatrix( cosA:number, sinA:number, at:PtLike ):GroupLike {
    let m = Mat.rotate2DMatrix(cosA, sinA);
    m[2][0] = at[0]*(1-cosA) + at[1]*sinA;
    m[2][1] = at[1]*(1-cosA)-at[0]*sinA;
    return m;
  }

  static shearAt2DMatrix( tanX:number, tanY:number, at:PtLike ):GroupLike {
    let m = Mat.shear2DMatrix(tanX, tanY);
    m[2][0] = -at[1]*tanY;
    m[2][1] = -at[0]*tanX;
    return m;
  }

  static reflectAt2DMatrix( p1:PtLike, p2:PtLike, at:PtLike) {
    let intercept = Line.intercept( p1, p2 );
    
    if (intercept == undefined) {
      return [
        new Pt( [-1, 0, 0] ),
        new Pt( [0, 1, 0] ),
        new Pt( [at[0]+p1[0], 0, 1] )  
      ]
    } else {

      let yi = intercept.yi;
      let ang2 = Math.atan( intercept.slope ) * 2;
      let cosA = Math.cos( ang2 );
      let sinA = Math.sin( ang2 );
      
      return [
        new Pt( [cosA, sinA, 0] ),
        new Pt( [sinA, -cosA, 0] ),
        new Pt( [-yi*sinA, yi + yi*cosA, 1] )
      ]
    }
  }

  
}