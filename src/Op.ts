import {Util, Const} from "./Util";
import {Bound} from "./Bound";
import {Pt, PtArrayType, Group} from "./Pt";
import {Vec, Mat} from "./LinearAlgebra";


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

  static sum( pts:Pt[]|number[][] ):Pt {
    let c = Pt.make( pts[0].length, 0 );
    for (let i=0, len=pts.length; i<len; i++) {
      c.add( pts[i] );
    }
    return c;
  }


  static average( pts:Pt[]|number[][] ):Pt {
    return Num.sum( pts ).divide( pts.length );
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

  static boundingBox( pts:Pt[] ):Group {
    let minPt = pts[0].clone().fill( Number.MAX_VALUE );
    let maxPt = pts[0].clone().fill( Number.MIN_VALUE );
    for (let i=0, len=pts.length; i<len; i++) {
      for (let d=0, len=pts[i].length; d<len; d++) {
        if (pts[i][d] < minPt[d] ) minPt[d] = pts[i][d];
        if (pts[i][d] > maxPt[d] ) maxPt[d] = pts[i][d];
      }
    }
    return new Group( minPt, maxPt );
  }

  static centroid( pts:Pt[]|number[][] ):Pt {
    return Num.average( pts );
  }


  /**
   * Get a bisector between two Pts
   * @param a first Pt
   * @param b second Pt
   * @param t a ratio between 0 to 1
   * @returns interpolated point as a new Pt
   */
  static interpolate( a:Pt|number[], b:Pt|number[], t=0.5 ):Pt {

    let len = Math.min(a.length, b.length);
    let d = Pt.make( len );
    for (let i=0; i<len; i++) {
      d[i] = a[i]*(1-t) + b[i]*t
    }
    return d;

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

  static rotate2D( ps:Pt|Pt[], angle:number, anchor?:Pt, axis?:string) {
    let pts = (!Array.isArray(ps)) ? [ps] : ps;
    let fn = (anchor != undefined) ? Mat.rotateAt2DMatrix : Mat.rotate2DMatrix;
    let cos = Math.cos(angle);
    let sin = Math.sin(angle);

    for (let i=0, len=pts.length; i<len; i++) {
      let p = (axis !=undefined) ? pts[i].$take( axis ) : pts[i];
      p.to( Mat.transform2D( p, fn( cos, sin, anchor ) ) );
    }

    return Geom;
  }
  
  static scale2D( ps:Pt[], scale:number|number[]|PtArrayType, anchor?:Pt, axis?:string) {
    let pts = (!Array.isArray(ps)) ? [ps] : ps;
    let s = (typeof scale == "number") ? [scale, scale] : scale;
    let fn = (anchor != undefined) ? Mat.scaleAt2DMatrix : Mat.scale2DMatrix;
    
    for (let i=0, len=pts.length; i<len; i++) {
      let p = (axis !=undefined) ? pts[i].$take( axis ) : pts[i];
      p.to( Mat.transform2D( p, fn( s[0], s[1], anchor ) ) );
    }

    return Geom;
  }

  static shear2D( ps:Pt[], scale:number|number[]|PtArrayType, anchor?:Pt, axis?:string) {
    let pts = (!Array.isArray(ps)) ? [ps] : ps;
    let s = (typeof scale == "number") ? [scale, scale] : scale;
    let fn = (anchor != undefined) ? Mat.shearAt2DMatrix : Mat.shear2DMatrix;
    let tanx = Math.tan( s[0] );
    let tany = Math.tan( s[1] );

    for (let i=0, len=pts.length; i<len; i++) {
      let p = (axis !=undefined) ? pts[i].$take( axis ) : pts[i];
      p.to( Mat.transform2D( p, fn( tanx, tany, anchor ) ) );
    }
    
    return Geom;
  }

  static reflect2D( ps:Pt[], line:Pt[]|number[][], anchor?:Pt, axis?:string) {
    let pts = (!Array.isArray(ps)) ? [ps] : ps;
    
    for (let i=0, len=pts.length; i<len; i++) {
      let p = (axis !=undefined) ? pts[i].$take( axis ) : pts[i];
      p.to( Mat.transform2D( p, Mat.reflectAt2DMatrix( line[0], line[1], anchor ) ) );
    }

    return Geom;
  }


  static withinBound( pt:PtArrayType|number[], boundPt1:PtArrayType|number[], boundPt2:PtArrayType|number[] ):boolean {
    for (let i=0, len=Math.min( pt.length, boundPt1.length, boundPt2.length); i<len; i++) {
      if ( !(pt[i] >= Math.min( boundPt1[i], boundPt2[i] ) && pt[i] <= Math.max( boundPt1[i], boundPt2[i] )) ) return false;
    }
    return true;
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

  static slope( p1:PtArrayType|number[], p2:PtArrayType|number[] ):number {
    return (p2[0] - p1[0] === 0) ? undefined : (p2[1] - p1[1]) / (p2[0] - p1[0]);
  }

  static intercept( p1:PtArrayType|number[], p2:PtArrayType|number[] ):{ slope:number, xi:number, yi:number } {
    if (p2[0] - p1[0] === 0) {
      return undefined;
    } else {
      let m = (p2[1] - p1[1]) / (p2[0] - p1[0]);
      let c = p1[1] - m * p1[0];
      return { slope: m, yi: c, xi: (m===0) ? undefined : -c/m };
    }
  }

  static collinear( p1:PtArrayType|number[], p2:PtArrayType|number[], p3:PtArrayType|number[] ) {
    // Use cross product method
    let a = new Pt(0,0,0).to(p2).$subtract( p1 );
    let b = new Pt(0,0,0).to(p1).$subtract( p3 );
    return a.$cross( b ).equals( new Pt(0,0,0) );
  }


  /**
   * Find a Pt on a line that is perpendicular (shortest distance) to a target Pt
   * @param pt a target Pt 
   * @param ln a group of Pts that defines a line
   * @param asProjection if true, this returns the projection vector instead. Default is false.
   * @returns a Pt on the line that is perpendicular to the target Pt, or a projection vector if `asProjection` is true.
   */
  static perpendicularFromPt( pt:PtArrayType|number[], ln:Pt[], asProjection:boolean=false ):Pt {
    let a = ln[0].$subtract( ln[1] );
    let b = ln[1].$subtract( pt );
    let proj = b.$subtract( a.$project( b ) );
    return (asProjection) ? proj : proj.$add( pt );
  }

  static distanceFromPt( pt:PtArrayType|number[], ln:Pt[], asProjection:boolean=false ):number {
    return Line.perpendicularFromPt( pt, ln, true ).magnitude();
  }

  static intersectPath2D( la:Pt[], lb:Pt[] ):Pt {

    let a = Line.intercept( la[0], la[1] );
    let b = Line.intercept( lb[0], lb[1] );

    let pa = la[0];
    let pb = lb[0];

    if (a == undefined) {
      if (b == undefined) return undefined;
      // one of them is vertical line, while the other is not, so they will intersect
      let y1 = -b.slope *  (pb[0] - pa[0]) + pb[1]; // -slope * x + y
      return new Pt( pa[0], y1 );

    } else {
      // diff slope, or b slope is vertical line
      if (b == undefined) {
        let y1 = -a.slope *  (pa[0] - pb[0]) + pa[1];
        return new Pt( pb[0], y1 )

      } else if (b.slope != a.slope) {
        let px = (a.slope * pa[0] - b.slope * pb[0] + pb[1] - pa[1]) / (a.slope - b.slope)
        let py = a.slope * ( px - pa[0] ) + pa[1]
        return new Pt( px, py )
        
      } else {
        if (a.yi == b.yi) { // exactly along the same path
          return new Pt( pa[0], pa[1] );
        } else {
          return undefined;
        }
      }
    }
  }

  static intersectLine2D( la:Pt[], lb:Pt[] ) {
    let pt = Line.intersectPath2D( la, lb );
    return ( pt && Geom.withinBound( pt, la[0], la[1] ) && Geom.withinBound(pt, lb[0], lb[1]) ) ? pt : undefined;
  }


  /**
   * Get two intersection points on a standard xy grid
   * @param pt a target Pt
   * @param gridPt a Pt on the grid
   * @returns a group of two intersection points. The first one is horizontal intersection and the second one is vertical intersection.
   */
  static intersectGrid2D( pt:PtArrayType|number[], gridPt:PtArrayType|number[] ):Group {
    return new Group( new Pt( gridPt[0], pt[1] ), new Pt( pt[0], gridPt[1] ) );
  }  

  static subpoints( ln:Pt[]|number[][], num:number ) {
    let pts = new Group();
    for (let i=1; i<=num; i++) {
      pts.push( Geom.interpolate( ln[0], ln[1], i/(num+1) ) );
    }
    return pts;
  }
}
