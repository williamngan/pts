import {Util, Const} from "./Util";
import {Bound} from "./Bound";
import {Pt, PtLike, Group, GroupLike} from "./Pt";
import {Vec, Mat} from "./LinearAlgebra";


export class Num {
  
  static lerp( a:number, b:number, t:number ):number { 
    return (1-t) * a + t * b;
  }

  /**
   * Clamp values between min and max
   * @param val 
   * @param min 
   * @param max 
   */
  static limitValue( val:number, min:number, max:number ){
    return Math.max(min, Math.min( max, val ));
  }

  /**
   * Different from Num.limitValue in that the value out-of-bound will be "looped back" to the other end.
   * @param val 
   * @param min 
   * @param max 
   */
  static boundValue( val:number, min:number, max:number ):number {
    let len = Math.abs(max - min);
    let a = val % len;
    
    if (a > max) a -= len;
    else if (a < min) a += len;

    return a;
  }

  static within( p:number, a:number, b:number ) {
    return p >= Math.min(a, b) && p <= Math.max(a, b);
  }

  static randomRange( a:number, b:number=0 ) {
    let r = (a > b) ? (a - b) : (b - a);
    return a + Math.random() * r;
  }

  static normalizeValue( n:number, a:number, b:number ):number {
    let min = Math.min(a,b);
    let max = Math.max(a,b);
    return (n-min) / (max-min);
  }

  static sum( pts:GroupLike|number[][] ):Pt {
    let c = Pt.make( pts[0].length, 0 );
    for (let i=0, len=pts.length; i<len; i++) {
      c.add( pts[i] );
    }
    return c;
  }


  static average( pts:GroupLike|number[][] ):Pt {
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

  static boundingBox( pts:GroupLike ):Group {
    let minPt = pts.reduce( (a:Pt, p:Pt) => a.$min( p ) );
    let maxPt = pts.reduce( (a:Pt, p:Pt) => a.$max( p ) );
    return new Group( minPt, maxPt );
  }

  static centroid( pts:GroupLike|number[][] ):Pt {
    return Num.average( pts );
  }

  /**
   * Given an anchor Pt, rebase all Pts in this group either to or from this anchor base.
   * @param pts a Group or array of Pt
   * @param ptOrIndex an index for the Pt array, or an external Pt
   * @param direction "to" (subtract all Pt with this anchor base) or "from" (add all Pt from this anchor base)
   */
  static anchor( pts:GroupLike, ptOrIndex:PtLike|number=0, direction:("to"|"from")="to" ) {
    let method = (direction == "to") ? "subtract" : "add";
    for (let i=0, len=pts.length; i<len; i++) {
      if (typeof ptOrIndex=="number") {
        if (ptOrIndex !== i) pts[i][method]( pts[ptOrIndex] );
      } else {
        pts[i][method]( ptOrIndex );
      }
    }
  }


  /**
   * Get an interpolated value between two Pts
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
  static perpendicular( pt:PtLike, axis:string|number[]=Const.xy ):Group {
    let y = axis[1];
    let x = axis[0];
    
    let p = new Pt(pt);
    let pa = new Pt(p);
    pa[x] = -p[y];
    pa[y] = p[x];
    let pb = new Pt(p);
    pb[x] = p[y];
    pb[y] = -p[x];
    
    return new Group(pa, pb);
  }

  static isPerpendicular( p1:PtLike, p2:PtLike ):boolean {
    return new Pt(p1).dot( p2 ) === 0;
  }


  static withinBound( pt:PtLike|number[], boundPt1:PtLike|number[], boundPt2:PtLike|number[] ):boolean {
    for (let i=0, len=Math.min( pt.length, boundPt1.length, boundPt2.length); i<len; i++) {
      if ( !(pt[i] >= Math.min( boundPt1[i], boundPt2[i] ) && pt[i] <= Math.max( boundPt1[i], boundPt2[i] )) ) return false;
    }
    return true;
  }

  static scale( ps:Pt|GroupLike, scale:number|number[]|PtLike, anchor?:PtLike ):Geom {
    let pts = (!Array.isArray(ps)) ? [ps] : ps;
    let scs = (typeof scale == "number") ? Pt.make( pts[0].length, scale) : scale;
    if (!anchor) anchor = Pt.make( pts[0].length, 0 );
  
    for (let i=0, len=pts.length; i<len; i++) {
      let p = pts[i];
      for (let k=0, lenP=p.length; k<lenP; k++) {
        p[k] = (anchor && anchor[k]) ? anchor[k] + (p[k] - anchor[k])*scs[k] : p[k] * scs[k];
      }
    }

    return Geom;
  }

  static rotate2D( ps:Pt|GroupLike, angle:number, anchor?:PtLike, axis?:string):Geom {
    let pts = (!Array.isArray(ps)) ? [ps] : ps;
    let fn = (anchor) ? Mat.rotateAt2DMatrix : Mat.rotate2DMatrix;
    if (!anchor) anchor = Pt.make( pts[0].length, 0 );
    let cos = Math.cos(angle);
    let sin = Math.sin(angle);

    for (let i=0, len=pts.length; i<len; i++) {
      let p = (axis) ? pts[i].$take( axis ) : pts[i];
      p.to( Mat.transform2D( p, fn( cos, sin, anchor ) ) );
    }

    return Geom;
  }
  

  static shear2D( ps:Pt|GroupLike, scale:number|number[]|PtLike, anchor?:PtLike, axis?:string):Geom {
    let pts = (!Array.isArray(ps)) ? [ps] : ps;
    let s = (typeof scale == "number") ? [scale, scale] : scale;
    if (!anchor) anchor = Pt.make( pts[0].length, 0 );
    let fn = (anchor) ? Mat.shearAt2DMatrix : Mat.shear2DMatrix;
    let tanx = Math.tan( s[0] );
    let tany = Math.tan( s[1] );

    for (let i=0, len=pts.length; i<len; i++) {
      let p = (axis) ? pts[i].$take( axis ) : pts[i];
      p.to( Mat.transform2D( p, fn( tanx, tany, anchor ) ) );
    }
    
    return Geom;
  }

  static reflect2D( ps:Pt|GroupLike, line:GroupLike, axis?:string):Geom {
    let pts = (!Array.isArray(ps)) ? [ps] : ps;
    
    for (let i=0, len=pts.length; i<len; i++) {
      let p = (axis) ? pts[i].$take( axis ) : pts[i];
      p.to( Mat.transform2D( p, Mat.reflectAt2DMatrix( line[0], line[1] ) ) );
    }

    return Geom;
  }
  

  /**
   * Generate a sine and cosine lookup table
   * @returns an object with 2 tables (array of 360 values) and 2 functions to get sin/cos given a radian parameter. { sinTable:Float64Array, cosTable:Float64Array, sin:(rad)=>number, cos:(rad)=>number }
   */
  static cosTable() {
    let cos = new Float64Array(360);

    for (let i=0; i<360; i++) cos[i] = Math.cos( i * Math.PI / 180 );
    let find = ( rad:number ) => cos[ Math.floor( Geom.boundAngle( Geom.toDegree(rad) ) ) ];

    return {table: cos, cos: find};
  }

  /**
   * Generate a sine and cosine lookup table
   * @returns an object with 2 tables (array of 360 values) and 2 functions to get sin/cos given a radian parameter. { sinTable:Float64Array, cosTable:Float64Array, sin:(rad)=>number, cos:(rad)=>number }
   */
  static sinTable() {
    let sin = new Float64Array(360);

    for (let i=0; i<360; i++) sin[i] = Math.sin( i * Math.PI / 180 );
    let find = ( rad:number ) => sin[ Math.floor( Geom.boundAngle( Geom.toDegree(rad) ) ) ];
    
    return {table: sin, sin: find};
  }
}



export class Line {

  static slope( p1:PtLike|number[], p2:PtLike|number[] ):number {
    return (p2[0] - p1[0] === 0) ? undefined : (p2[1] - p1[1]) / (p2[0] - p1[0]);
  }

  static intercept( p1:PtLike|number[], p2:PtLike|number[] ):{ slope:number, xi:number, yi:number } {
    if (p2[0] - p1[0] === 0) {
      return undefined;
    } else {
      let m = (p2[1] - p1[1]) / (p2[0] - p1[0]);
      let c = p1[1] - m * p1[0];
      return { slope: m, yi: c, xi: (m===0) ? undefined : -c/m };
    }
  }

  static collinear( p1:PtLike|number[], p2:PtLike|number[], p3:PtLike|number[] ) {
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
  static perpendicularFromPt( line:GroupLike, pt:PtLike|number[], asProjection:boolean=false ):Pt {
    let a = line[0].$subtract( line[1] );
    let b = line[1].$subtract( pt );
    let proj = b.$subtract( a.$project( b ) );
    return (asProjection) ? proj : proj.$add( pt );
  }

  static distanceFromPt( line:GroupLike, pt:PtLike|number[], asProjection:boolean=false ):number {
    return Line.perpendicularFromPt( line, pt, true ).magnitude();
  }

  static intersectRay2D( la:GroupLike, lb:GroupLike ):Pt {

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

  static intersectLine2D( la:GroupLike, lb:GroupLike ):Pt {
    let pt = Line.intersectRay2D( la, lb );
    return ( pt && Geom.withinBound( pt, la[0], la[1] ) && Geom.withinBound(pt, lb[0], lb[1]) ) ? pt : undefined;
  }

  static intersectLineWithRay2D( line:GroupLike, ray:GroupLike ):Pt {
    let pt = Line.intersectRay2D( line, ray );
    return ( pt && Geom.withinBound( pt, line[0], line[1] )) ? pt : undefined;
  }

  static intersectPolygon2D( lineOrRay:GroupLike, poly:GroupLike[], sourceIsRay:boolean = false ):Group {
    let fn = sourceIsRay ? Line.intersectLineWithRay2D : Line.intersectLine2D; 
    let pts = new Group();
    for (let i=0, len=poly.length; i<len; i++) {
      let d = fn( poly[i], lineOrRay );
      if (d) pts.push( d ); 
    }
    return (pts.length > 0) ? pts : undefined;
  } 

  /**
   * Get two intersection points on a standard xy grid
   * @param ray a ray specified by 2 Pts
   * @param gridPt a Pt on the grid
   * @returns a group of two intersection points. The first one is horizontal intersection and the second one is vertical intersection.
   */
  static intersectGridWithRay2D( ray:GroupLike, gridPt:PtLike|number[] ):Group {
    let t = Line.intercept( new Pt( ray[0] ).subtract( gridPt ), new Pt( ray[1] ).subtract( gridPt ) );
    let g = new Group();
    if (t && t.xi) g.push( new Pt( gridPt[0] + t.xi, gridPt[1] ) );
    if (t && t.yi) g.push( new Pt( gridPt[0], gridPt[1] + t.yi ) );
    return g;
  }  

  static intersectGridWithLine2D( line:GroupLike, gridPt:PtLike|number[] ):Group {
    let g = Line.intersectGridWithRay2D( line, gridPt );
    let gg = new Group();
    for (let i=0, len=g.length; i<len; i++) {
      if ( Geom.withinBound( g[i], line[0], line[1] ) ) gg.push( g[i] );
    }
    return gg;
  }

  static subpoints( line:GroupLike|number[][], num:number ) {
    let pts = new Group();
    for (let i=1; i<=num; i++) {
      pts.push( Geom.interpolate( line[0], line[1], i/(num+1) ) );
    }
    return pts;
  }
}


export class Rectangle {

  static from( topLeft:PtLike|number[], widthOrSize:number|PtLike, height?:number ):Group {
    return Rectangle.fromTopLeft( topLeft, widthOrSize, height );
  }

  static fromTopLeft( topLeft:PtLike|number[], widthOrSize:number|PtLike, height?:number ):Group {
    let size = (typeof widthOrSize == "number") ? [widthOrSize, (height||widthOrSize) ] : widthOrSize;
    return new Group(new Pt(topLeft), new Pt(topLeft).add( size ) );
  }

  static fromCenter( center:PtLike|number[], widthOrSize:number|PtLike, height?:number ):Group {
    let half = (typeof widthOrSize == "number") ? [ widthOrSize/2, (height||widthOrSize)/2 ] : new Pt(widthOrSize).divide;
    return new Group(new Pt(center).subtract(half), new Pt(center).add(half));
  }

  static corners( rect:GroupLike ):Group {
    let p0 = rect[0].$min(rect[1]);
    let p2 = rect[0].$max(rect[1]);
    return new Group(p0, new Pt(p0.x, p2.y), p2, new Pt(p2.x, p0.y));
  }

  static sides( rect:GroupLike ):Group[] {
    let [p0, p1, p2, p3] = Rectangle.corners( rect );
    return [
      new Group( p0, p1 ), new Group( p1, p2 ),
      new Group( p2, p3 ), new Group( p3, p0 )
    ];
  }

  static polygon( rect:GroupLike ):Group {
    let corners = Rectangle.corners( rect );
    corners.push( corners[0].clone() );
    return corners;
  }

  static quadrants( rect:GroupLike ):Group[] {
    let corners = Rectangle.corners( rect );
    let center = Geom.interpolate( rect[0], rect[1], 0.5 );
    return corners.map( (c) => new Group(c, center.clone()) );
  }

  static contains( rect:GroupLike, pt:PtLike ) {
    return Geom.withinBound( pt, rect[0], rect[1] );
  }

  static intersect2D( rect:GroupLike, poly:GroupLike[] ):Group[] {
    return Polygon.intersect2D( Rectangle.sides( rect ), poly )
  }

}


export class Cirlce {
  

}




export class Polygon {


  /**
   * Get a bounding box for each polygon group, as well as a union bounding-box for all groups
   * @param polys an array of Groups, or an array of Pt arrays
   */
  static boundingBoxes( polys:GroupLike[] ):GroupLike[] {
    let boxes = polys.map( (g) => Geom.boundingBox(g) );
    let merged = [].concat.apply([], boxes);
    boxes.unshift( Geom.boundingBox( merged ) );
    return boxes;
  }

  static intersect2D( poly:GroupLike[], linesOrRays:GroupLike[], sourceIsRay:boolean=false):Group[] {
    let groups = [];
    for (let i=0, len=linesOrRays.length; i<len; i++) {
      let _ip = Line.intersectPolygon2D( linesOrRays[i], poly, sourceIsRay );
      if (_ip) groups.push( _ip );
    }
    return groups;
  }

  static network( poly:GroupLike, originIndex:number=0 ):Group[] {
    let g = []
    for (let i=0, len=poly.length; i<len; i++) {
      if (i != originIndex) g.push( new Group( poly[originIndex], poly[i] ) );
    }
    return g;
  }
}