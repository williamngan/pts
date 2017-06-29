import {Const, Util} from "./Util"
import {Pt, PtLike, GroupLike, Group} from "./Pt"
import {Line} from "./Op"


export class Vec {

  static add( a:PtLike, b:PtLike|number ):PtLike {
    if (typeof b == "number") {
      for (let i=0, len=a.length; i<len; i++) a[i] += b;
    } else {
      for (let i=0, len=a.length; i<len; i++) a[i] += b[i] || 0;
    }
    return a;
  }

  static subtract( a:PtLike, b:PtLike|number ):PtLike {
    if (typeof b == "number") {
      for (let i=0, len=a.length; i<len; i++) a[i] -= b;
    } else {
      for (let i=0, len=a.length; i<len; i++) a[i] -= b[i] || 0;
    }
    return a;
  }

  static multiply( a:PtLike, b:PtLike|number ):PtLike {
    if (typeof b == "number") {
      for (let i=0, len=a.length; i<len; i++) a[i] *= b;
    } else {
      for (let i=0, len=a.length; i<len; i++) a[i] *= b[i] || 1;
    }
    return a;
  }

  static divide( a:PtLike, b:PtLike|number ):PtLike {
    if (typeof b == "number") {
      for (let i=0, len=a.length; i<len; i++) a[i] /= b;
    } else {
      for (let i=0, len=a.length; i<len; i++) a[i] /= b[i] || 1;
    }
    return a;
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

  static unit( a:PtLike, magnitude:number=undefined ):PtLike {
    let m = (magnitude===undefined) ? Vec.magnitude(a) : magnitude;
    return Vec.divide( a, m );
  }

  static abs( a:PtLike ):PtLike {
    return Vec.map( a, Math.abs );
  }

  static max( a:PtLike ):{value, index} {
    let m = Number.MIN_VALUE;
    let index = 0;
    for (let i=0, len=a.length; i<len; i++) {
      m = Math.max( m, a[i] );
      if (m === a[i]) index = i;
    }
    return {value: m, index: index};
  }

  static min( a:PtLike ):{value, index} {
    let m = Number.MAX_VALUE;
    let index = 0;
    for (let i=0, len=a.length; i<len; i++) {
      m = Math.min( m, a[i] );
      if (m === a[i]) index = i;
    }
    return {value: m, index: index};
  }

  static sum( a:PtLike ):number {
    let s = 0;
    for (let i=0, len=a.length; i<len; i++) s += a[i];
    return s;
  }

  static map( a:PtLike, fn:(n:number, index:number, arr) => number ):PtLike {
    for (let i=0, len=a.length; i<len; i++) {
      a[i] = fn( a[i], i, a );
    }
    return a;
  }
  
}


export class Mat {

  static transform2D( pt:PtLike, m:GroupLike|number[][] ):Pt {
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
    m[2][1] = at[1]*(1-cosA) - at[0]*sinA;
    return m;
  }

  static shearAt2DMatrix( tanX:number, tanY:number, at:PtLike ):GroupLike {
    let m = Mat.shear2DMatrix(tanX, tanY);
    m[2][0] = -at[1]*tanY;
    m[2][1] = -at[0]*tanX;
    return m;
  }

  static reflectAt2DMatrix( p1:PtLike, p2:PtLike ) {
    let intercept = Line.intercept( p1, p2 );
    
    if (intercept == undefined) {
      return [
        new Pt( [-1, 0, 0] ),
        new Pt( [0, 1, 0] ),
        new Pt( [p1[0]+p2[0], 0, 1] )  
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