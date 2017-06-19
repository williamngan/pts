import {Util, Const} from "./Util";
import {Bound} from "./Bound";
import {Pt} from "./Pt";


export class Num {
  
  static lerp( a:number, b:number, t:number ):number { 
    return (1-t) * a + t * b;
  }

  static boundValue( val:number, min:number, max:number, positive=false ):number {
    let len = Math.abs(max - min);
    let a = val % len;
    
    if (a > max) a -= len
    else if (a < min) a += len

    return a;
  }

  static within( p:number, a:number, b:number ) {
    return p >= Math.min(a, b) && p <= Math.max(a, b)
  }

  static randomRange( a:number, b:number=0 ) {
    let r = (a > b) ? (a - b) : (b - a)
    return a + Math.random() * r
  }

  static normalizeValue( n:number, a:number, b:number ):number {
    let min = Math.min(a,b);
    let max = Math.max(a,b);
    return (n-min) / (max-min);
  }
    
  /**  
   * Map a value from one range to another
   * @param n a value in the first range
   * @param currMin lower bound of the first range
   * @param currMax upper bound of the first range
   * @param targetMin lower bound of the second range
   * @param targetMax upper bound of the second range
   * @returns a remapped value in the second range
   */
  static mapToRange(n:number, currA, currB, targetA, targetB) {
    if (currA == currB) throw "[currMin, currMax] must define a range that is not zero"
    let min = Math.min(targetA, targetB);
    let max = Math.max(targetA, targetB);
    return Num.normalizeValue(n, currA, currB) * (max - min) + min;
  }
}


export class Geom {


  static boundAngle( angle:number ) { 
    return Num.boundValue(angle, 0, 360); 
  }

  static boundRadian( angle:number ) { 
    return Num.boundValue(angle, 0, Const.two_pi ); 
  }

  static toRadian( angle: number ):number {
    return angle * Const.deg_to_rad;
  }

  static toDegree( radian: number ):number {
    return radian * Const.rad_to_deg;
  }

  static boundingBox( pts:Pt[] ):Bound {
    let minPt = pts[0].clone().fill( Number.MAX_VALUE );
    let maxPt = pts[0].clone().fill( Number.MIN_VALUE );
    for (let i=0, len=pts.length; i<len; i++) {
      for (let d=0, len=pts[i].length; d<len; d++) {
        if (pts[i][d] < minPt[d] ) minPt[d] = pts[i][d];
        if (pts[i][d] > maxPt[d] ) maxPt[d] = pts[i][d];
      }
    }
    return new Bound( minPt, maxPt );
  }

  static centroid(pts:Pt[]):Pt {
    return Pt.average( pts );
  }


  /**
   * Get a bisector between two Pts
   * @param a first Pt
   * @param b second Pt
   * @param t a ratio between 0 to 1
   * @param returnAsNormalized if true, return the bisector as a unit vector; otherwise, it'll have an interpolated magnitude.
   */
  static interpolate( a:Pt, b:Pt, t=0.5, returnAsNormalized:boolean = false ) {
    let ma = a.magnitude();
    let mb = b.magnitude();
    let ua = a.$unit( ma );
    let ub = b.$unit( mb );
    
    let bisect = ua.$multiply( 1-t ).add( ub.$multiply( t ) );
    return (returnAsNormalized) ? bisect : bisect.$multiply( ma*(1-t) + mb*t );
  }

  /**
   * Find two Pt that are perpendicular to this Pt (2D)
   * @param axis a string such as "xy" (use Const.xy) or an array to specify index for two dimensions
   * @returns an array of two Pt that are perpendicular to this Pt
   */
  static perpendicular( p:Pt, axis:string|number[]=Const.xy ):Pt[] {
    let y = axis[1];
    let x = axis[0];

    let pa = p.clone();
    pa[x] = -p[y];
    pa[y] = p[x];
    let pb = p.clone();
    pb[x] = p[y];
    pb[y] = -p[x];
    
    return [pa, pb];
  }
  

  /**
   * Generate a sine and cosine lookup table
   * @returns an object with 2 tables (array of 360 values) and 2 functions to get sin/cos given a radian parameter. { sinTable:Float64Array, cosTable:Float64Array, sin:(rad)=>number, cos:(rad)=>number }
   */
  static sinCosTable() {
    let cos = new Float64Array(360);
    let sin = new Float64Array(360);

    for (let i=0; i<360; i++) {
      cos[i] = Math.cos( i * Math.PI / 180 );
      sin[i] = Math.sin( i * Math.PI / 180 );
    }

    let getSin = ( rad:number ) => sin[ Math.floor( Geom.boundAngle( Geom.toDegree(rad) ) ) ];
    let getCos = ( rad:number ) => cos[ Math.floor( Geom.boundAngle( Geom.toDegree(rad) ) ) ];
    
    return {sinTable: sin, cosTable: cos, sin: getSin, cos: getCos};
  }
}



export class Line {

  static slope( p1:Pt|number[], p2:Pt|number[] ):number {
    return (p2[0] - p1[0] === 0) ? undefined : (p2[1] - p1[1]) / (p2[0] - p1[0]);
  }

  static intercept( p1:Pt|number[], p2:Pt|number[] ):{ slope:number, xi:number, yi:number } {
    if (p2[0] - p1[0] === 0) {
      return undefined;
    } else {
      let m = (p2[1] - p1[1]) / (p2[0] - p1[0]);
      let c = p1[1] - m * p1[0];
      return { slope: m, yi: c, xi: (m===0) ? undefined : -c/m };
    }
  }
  
}