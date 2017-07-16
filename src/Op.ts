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
    if (currA == currB) throw new Error("[currMin, currMax] must define a range that is not zero");
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
      if ( !Num.within( pt[i], boundPt1[i], boundPt2[i] ) ) return false;
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
   * Get two intersection Pts on a standard xy grid
   * @param ray a ray specified by 2 Pts
   * @param gridPt a Pt on the grid
   * @returns a group of two intersecting Pts. The first one is horizontal intersection and the second one is vertical intersection.
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

  /**
   * Quick way to check rectangle intersection. 
   * For more optimized implementation, store the rectangle's sides separately (eg, `Rectangle.sides()`) and use `Polygon.intersect2D()`.
   * @param line a Group representing a line
   * @param rect a Group representing a rectangle
   */
  static intersectRect2D( line:GroupLike, rect:GroupLike ):Group {
    return Rectangle.intersectRect2D( Line.toRect(line), rect );
  }

  static subpoints( line:GroupLike|number[][], num:number ) {
    let pts = new Group();
    for (let i=1; i<=num; i++) {
      pts.push( Geom.interpolate( line[0], line[1], i/(num+1) ) );
    }
    return pts;
  }

  static toRect( line:GroupLike ) {
    return new Group( line[0].$min( line[1] ), line[0].$max( line[1] ) );
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

  static toCircle( pts:GroupLike ) {
    return Circle.fromRect( pts );
  }

  static size( pts:GroupLike ): Pt {
    return pts[0].$max( pts[1] ).subtract( pts[0].$min( pts[1] ) );
  }

  static center( pts:GroupLike ): Pt {
    let min = pts[0].$min( pts[1] );
    let max = pts[0].$max( pts[1] );
    return min.add( max.$subtract( min ).divide( 2 ) );
  }

  static corners( rect:GroupLike ):Group {
    let p0 = rect[0].$min(rect[1]);
    let p2 = rect[0].$max(rect[1]);
    return new Group(p0,  new Pt(p2.x, p0.y), p2, new Pt(p0.x, p2.y));
  }


  static sides( rect:GroupLike ):Group[] {
    let [p0, p1, p2, p3] = Rectangle.corners( rect );
    return [
      new Group( p0, p1 ), new Group( p1, p2 ),
      new Group( p2, p3 ), new Group( p3, p0 )
    ];
  }

  static union( rects:GroupLike[] ):Group {
    let merged = Util.flatten( rects, false );
    let min = Pt.make( 2, Number.MAX_VALUE );
    let max = Pt.make( 2, Number.MIN_VALUE );

    // calculate min max in a single pass
    for (let i=0, len=merged.length; i<len; i++) {
      for (let k=0; k<2; k++) {
        min[k] = Math.min( min[k], merged[i][k] );
        max[k] = Math.max( max[k], merged[i][k] );
      }
    }
    return new Group( min, max );
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

  static withinBound( rect:GroupLike, pt:PtLike ) {
    return Geom.withinBound( pt, rect[0], rect[1] );
  }

  static intersectBound2D( rect1:GroupLike, rect2:GroupLike ) {
    let pts = Rectangle.corners( rect1 );
    for (let i=0, len=pts.length; i<len; i++) {
      if (Geom.withinBound( pts[i], rect2[0], rect2[1])) return true;
    }
    return false;
  }

  /**
   * Quick way to check rectangle intersection. 
   * For more optimized implementation, store the rectangle's sides separately (eg, `Rectangle.sides()`) and use `Polygon.intersect2D()`.
   * @param rect1 a Group representing a rectangle
   * @param rect2 a Group representing a rectangle
   */
  static intersectRect2D( rect1:GroupLike, rect2:GroupLike ):Group {
    return Util.flatten(
      Polygon.intersect2D( Rectangle.sides( rect1 ), Rectangle.sides( rect2 ) )
    );
  }

}


export class Circle {
  
  static fromRect( pts:GroupLike, enclose=false ):Group {
    let r = 0;
    let min = r = Rectangle.size( pts ).minValue().value / 2;
    if (enclose) {
      let max = Rectangle.size( pts ).maxValue().value / 2;
      r = Math.sqrt( min*min + max*max );
    } else {
      r = min;
    }
    return new Group( Rectangle.center( pts ), new Pt(r, r) )
  }

  static fromPt( pt:PtLike, radius:number ):Group {
    return new Group( pt, new Pt(radius, radius) );
  }

  static withinBound( pts:GroupLike, pt:PtLike ):boolean  {
    let d = pts[0].$subtract( pt );
    return d.dot(d) < pts[1].x * pts[1].x;
  }

  static intersectRay2D( pts:GroupLike, ray:GroupLike ):Group {
    let d = ray[0].$subtract( ray[1] );
    let f = pts[0].$subtract( ray[0] );

    let a = d.dot( d );
    let b = f.dot( d );
    let c = f.dot( f ) - pts[1].x * pts[1].x;
    let p = b/a;
    let q = c/a;
    let disc = p * p - q; // discriminant

    if (disc < 0) {
      return new Group();
    } else {
      let discSqrt = Math.sqrt( disc );

      let t1 = -p + discSqrt;
      let p1 = ray[0].$subtract( d.$multiply( t1 ) );
      if (disc === 0) return new Group( p1 );

      let t2 = -p - discSqrt;
      let p2 = ray[0].$subtract( d.$multiply( t2 ) );
      return new Group( p1, p2 );
    }
  }

  static intersectLine2D( pts:GroupLike, line:GroupLike ):Group {
    let ps = Circle.intersectRay2D( pts, line );
    let g = new Group();
    if (ps.length > 0) {
      for (let i=0, len=ps.length; i<len; i++) {
        if (Rectangle.withinBound( line, ps[i] )) g.push( ps[i] );
      }
    }
    return g;
  }

  static intersectCircle2D( pts:GroupLike, circle:GroupLike ):Group {
    let dv = circle[0].$subtract( pts[0] );
    let dr2 = dv.magnitudeSq();
    let dr = Math.sqrt( dr2 );

    let ar = pts[1].x;
    let br = circle[1].x;
    let ar2 = ar * ar;
    let br2 = br * br;


    if ( dr > ar + br ) { // not intersected
      return new Group();
    } else if ( dr < Math.abs( ar - br ) ) { // completely enclosed
      return new Group( pts[0].clone() );
    } else {
      let a = (ar2 - br2 + dr2) / (2 * dr);
      let h = Math.sqrt( ar2 - a*a );
      let p = dv.$multiply( a/dr ).add( pts[0] );
      return new Group(  
        new Pt( p.x + h*dv.y/dr, p.y - h*dv.x/dr ),
        new Pt( p.x - h*dv.y/dr, p.y + h*dv.x/dr )
      )
    }
  }

  /**
   * Quick way to check rectangle intersection. 
   * For more optimized implementation, store the rectangle's sides separately (eg, `Rectangle.sides()`) and use `Polygon.intersect2D()`.
   * @param pts a Group representing a circle
   * @param rect a Group representing a rectangle
   */
  static intersectRect2D( pts:GroupLike, rect:GroupLike ):Group {
    let sides = Rectangle.sides( rect );
    let g = [];
    for (let i=0, len=sides.length; i<len; i++) {
      let ps = Circle.intersectLine2D( pts, sides[i] );
      if (ps.length > 0) g.push( ps );
    }
    return Util.flatten( g );
  }

  static toRect( pts:GroupLike ):Group {
    let r = pts[1][0];
    return new Group( pts[0].$subtract( r ), pts[0].$add( r ) );
  }


  

}




export class Polygon {

  static centroid( pts:GroupLike ):Pt {
    return Geom.centroid( pts );
  }

  /**
   * Get a convex hull of the point set using Melkman's algorithm
   * @param pts a group of Pt
   * @param sorted a boolean value to indicate if the group is pre-sorted by x position. Default is false.
   * @returns a group of Pt that defines the convex hull polygon
   */
  static convexHull( pts:GroupLike, sorted:boolean=false ): Group {
    if (pts.length < 3) return new Group();

    if (!sorted) {
      pts = pts.slice();
      pts.sort( (a,b) => a.x-b.x );
    } 

    // check if is on left of ray a-b
    let left = (a, b, pt) => (b.x - a.x) * (pt.y - a.y) - (pt.x - a.x) * (b.y - a.y) > 0;
    
    // double end queue
    let dq = new Group();

    // first 3 pt
    if ( left( pts[0], pts[1], pts[2]) ) {
      dq.push( pts[0], pts[1] );
    } else {
      dq.push( pts[1], pts[0] );
    }

    dq.unshift( pts[0] );
    dq.push( pts[2] );

    // remaining pts
    let i = 3;
    while (i < pts.length) {
      let pt = pts[i];
      
      if (left( pt, dq[0], dq[1] ) && left(dq[dq.length-2], dq[dq.length-1], pt)) {
        i++
        continue
      }

      while (!left(dq[dq.length-2], dq[dq.length-1], pt)) dq.pop()
      
      dq.push( pt )

      while (!left( dq[0], dq[1], pt)) dq.shift()
      
      dq.unshift( pt )
      i++
    }

    return dq;

  }

  static intersect2D( poly:GroupLike[], linesOrRays:GroupLike[], sourceIsRay:boolean=false):Group[] {
    let groups = [];
    for (let i=0, len=linesOrRays.length; i<len; i++) {
      let _ip = Line.intersectPolygon2D( linesOrRays[i], poly, sourceIsRay );
      if (_ip) groups.push( _ip );
    }
    return groups;
  }

  static network( pts:GroupLike, originIndex:number=0 ):Group[] {
    let g = []
    for (let i=0, len=pts.length; i<len; i++) {
      if (i != originIndex) g.push( new Group( pts[originIndex], pts[i] ) );
    }
    return g;
  }

  /**
   * Get a bounding box for each polygon group, as well as a union bounding-box for all groups
   * @param polys an array of Groups, or an array of Pt arrays
   */
  static toRects( poly:GroupLike[] ):GroupLike[] {
    let boxes = poly.map( (g) => Geom.boundingBox(g) );
    let merged = Util.flatten( boxes, false );
    boxes.unshift( Geom.boundingBox( merged ) );
    return boxes;
  }

}

export class Curve {

  /**
   * Get a precalculated coefficients per step
   * @param steps number of steps
   */
  static getSteps( steps:number ):Group {
    let ts = new Group();
    for (let i=0; i<=steps; i++) {
      let t = i/steps;
      ts.push( new Pt(t*t*t, t*t, t, 1) );
    }
    return ts;
  }

  /**
   * Given an index for the starting position in a Pt group, get the control and/or end points of a curve segment
   * @param pts a group of Pt
   * @param index start index in `pts` array. Default is 0.
   * @param copyStart an optional boolean value to indicate if the start index should be used twice. Default is false.
   * @returns a group of 4 Pts
   */
  static controlPoints( pts:GroupLike, index:number=0, copyStart:boolean=false):Group {
    if (index > pts.length-1) return new Group();
    let _index = (i) => (i < pts.length-1) ? i : pts.length-1;

    let p0 = pts[index];
    index = (copyStart) ? index : index+1;

    // get points based on index
    return new Group(
      p0, pts[ _index(index++) ],
      pts[ _index(index++) ], pts[ _index(index++) ]
    );
  }

  /**
   * Calulcate weighted sum to get the interpolated points
   * @param ctrls anchors
   * @param params parameters
   */
  static _calcPt( ctrls:GroupLike, params:PtLike ):Pt {
    let x = ctrls.reduce( (a, c, i) => a + c.x*params[i], 0 )
    let y = ctrls.reduce( (a, c, i) => a + c.y*params[i], 0 )
    if (ctrls[0].length > 2) {
      let z = ctrls.reduce( (a, c, i) => a + c.z*params[i], 0 );
      return new Pt( x, y, z );
    }
    return new Pt( x, y );
  }

  /**
   * Create a Catmull-Rom curve. Catmull-Rom is a kind of Cardinal curve with smooth-looking curve.
   * @param pts a group of anchor Pt
   * @param steps the number of line segments per curve. Defaults to 10 steps.
   * @returns a curve as a group of interpolated Pt
   */
  static catmullRom( pts:GroupLike, steps:number=10 ):Group {
    if (pts.length < 2) return new Group();

    let ps = new Group();
    let ts = Curve.getSteps( steps );

    // use first point twice
    let c = Curve.controlPoints( pts, 0, true );
    for (let i=0; i<=steps; i++) {
      ps.push( Curve.catmullRomStep( ts[i], c ) );
    }

    let k = 0;
    while ( k < pts.length-2 ) {
      let c = Curve.controlPoints( pts, k );
      if (c.length > 0) {
        for (let i=0; i<=steps; i++) {
          ps.push( Curve.catmullRomStep( ts[i], c ) );
        }
        k++
      }
    }

    return ps;
  }


  /**
   * Interpolate to get a point on Catmull-Rom curve
   * @param step the coefficients [t*t*t, t*t, t, 1]
   * @param ctrls a group of anchor Pts
   * @return an interpolated Pt on the curve
   */
  static catmullRomStep( step:Pt, ctrls:GroupLike ):Pt {
    /*
    * Basis Matrix (http://mrl.nyu.edu/~perlin/courses/fall2002/hw/12.html)
    * [-0.5,  1.5, -1.5, 0.5],
    * [ 1  , -2.5,  2  ,-0.5],
    * [-0.5,  0  ,  0.5, 0  ],
    * [ 0  ,  1  ,  0  , 0  ]
    */

    let m = new Group(
      new Pt(-0.5, 1, -0.5, 0),
      new Pt(1.5, -2.5, 0, 1),
      new Pt(-1.5, 2, 0.5, 0),
      new Pt( 0.5, -0.5, 0, 0 )
    );

    return Curve._calcPt( ctrls, Mat.multiply( [step], m, true )[0] );
  }

  /**
   * Create a Cardinal spline curve
   * @param pts a group of anchor Pt
   * @param steps the number of line segments per curve. Defaults to 10 steps.
   * @param tension optional value between 0 to 1 to specify a "tension". Default to 0.5 which is the tension for Catmull-Rom curve.
   * @returns a curve as a group of interpolated Pt
   */
  static cardinal( pts:GroupLike, steps:number=10, tension=0.5 ):Group {
    if (pts.length < 2) return new Group();

    let ps = new Group();
    let ts = Curve.getSteps( steps );

    // use first point twice
    let c = Curve.controlPoints( pts, 0, true );
    for (let i=0; i<=steps; i++) {
      ps.push( Curve.cardinalStep( ts[i], c, tension ) );
    }

    let k = 0;
    while ( k < pts.length-2 ) {
      let c = Curve.controlPoints( pts, k );
      if (c.length > 0) {
        for (let i=0; i<=steps; i++) {
          ps.push( Curve.cardinalStep( ts[i], c, tension ) );
        }
        k++
      }
    }

    return ps;
  }

  /**
   * Interpolate to get a point on Catmull-Rom curve
   * @param step the coefficients [t*t*t, t*t, t, 1]
   * @param ctrls a group of anchor Pts
   * @param tension optional value between 0 to 1 to specify a "tension". Default to 0.5 which is the tension for Catmull-Rom curve
   * @return an interpolated Pt on the curve
   */
  static cardinalStep( step:Pt, ctrls:GroupLike, tension:number=0.5 ):Pt {
    /*
    * Basis Matrix (http://algorithmist.wordpress.com/2009/10/06/cardinal-splines-part-4/)
    * [ -s  2-s  s-2   s ]
    * [ 2s  s-3  3-2s -s ]
    * [ -s   0    s    0 ]
    * [  0   1    0    0 ]
    */

    let m = new Group(
      new Pt( -1,  2, -1, 0),
      new Pt( -1,  1,  0, 0),
      new Pt(  1, -2,  1, 0),
      new Pt(  1, -1,  0, 0)
    );

    let h = Mat.multiply( [step], m, true )[0].multiply( tension );
    let h2 = (2*step[0] - 3*step[1] + 1);
    let h3 = -2*step[0] + 3*step[1];

    let pt = Curve._calcPt( ctrls, h );

    pt.x += h2*ctrls[1].x + h3*ctrls[2].x;
    pt.y += h2*ctrls[1].y + h3*ctrls[2].y;
    if (pt.length > 2) pt.z += h2*ctrls[1].z + h3*ctrls[2].z;

    return pt;
  }


  /**
   * Create a Bezier curve. In a cubic bezier curve, the first and 4th anchors are end-points, and 2nd and 3rd anchors are control-points.
   * @param pts a group of anchor Pt
   * @param steps the number of line segments per curve. Defaults to 10 steps.
   * @returns a curve as a group of interpolated Pt
   */
  static bezier( pts:GroupLike, steps:number=10 ) {

    if (pts.length < 4) return new Group();

    let ps = new Group();
    let ts = Curve.getSteps( steps );

    let k = 0;
    while ( k < pts.length-3 ) {
      let c = Curve.controlPoints( pts, k );
      if (c.length > 0) {
        for (let i=0; i<=steps; i++) {
          ps.push( Curve.bezierStep( ts[i], c ) );
        }

        // go to the next set of point, but assume current end pt is next start pt
        k+=3
      }
    }

    return ps;
  }

  /**
   * Interpolate to get a point on a cubic Bezier curve
   * @param step the coefficients [t*t*t, t*t, t, 1]
   * @param ctrls a group of anchor Pts
   * @return an interpolated Pt on the curve
   */
  static bezierStep( step:Pt, ctrls:GroupLike ) {
    /*
    * Bezier basis matrix
    * [ -1,  3, -3,  1 ]
    * [  3, -6,  3,  0 ]
    * [ -3,  3,  0,  0 ]
    * [  1,  0,  0,  0 ]
    */

    let m = new Group(
      new Pt( -1,  3, -3, 1),
      new Pt(  3, -6,  3, 0),
      new Pt( -3,  3,  0, 0),
      new Pt(  1,  0,  0, 0)
    );

    return Curve._calcPt( ctrls, Mat.multiply( [step], m, true )[0] );
  }

  /**
   * Create a B-spline curve
   * @param pts a group of anchor Pt
   * @param steps the number of line segments per curve. Defaults to 10 steps.
   * @param tension optional value between 0 to n to specify a "tension". Default is 1 which is the usual tension.
   * @returns a curve as a group of interpolated Pt
   */
  static bspline( pts:GroupLike, steps:number=10, tension:number=1 ):Group {
    if (pts.length < 2) return new Group();

    let ps = new Group();
    let ts = Curve.getSteps( steps );


    let k = 0;
    while ( k < pts.length-3 ) {
      let c = Curve.controlPoints( pts, k );
      if (c.length > 0) {
        if (tension !== 1) {
          for (let i=0; i<=steps; i++) {
            ps.push( Curve.bsplineTensionStep( ts[i], c, tension ) );
          }
        } else {
          for (let i=0; i<=steps; i++) {
            ps.push( Curve.bsplineStep( ts[i], c ) );
          }
        }
        k++
      }
    }

    return ps;
  }

  /**
   * Interpolate to get a point on a B-spline curve
   * @param step the coefficients [t*t*t, t*t, t, 1]
   * @param ctrls a group of anchor Pts
   * @return an interpolated Pt on the curve
   */  
  static bsplineStep( step:Pt, ctrls:GroupLike ):Pt {
    /*
    * Basis matrix:
    * [ -1.0/6.0,  3.0/6.0, -3.0/6.0, 1.0/6.0 ],
    * [  3.0/6.0, -6.0/6.0,  3.0/6.0,    0.0 ],
    * [ -3.0/6.0,      0.0,  3.0/6.0,    0.0 ],
    * [  1.0/6.0,  4.0/6.0,  1.0/6.0,    0.0 ]
    */

    let m = new Group(
      new Pt( -0.16666666666666666,  0.5, -0.5, 0.16666666666666666),
      new Pt(  0.5, -1,  0, 0.6666666666666666),
      new Pt( -0.5,  0.5,  0.5, 0.16666666666666666),
      new Pt(  0.16666666666666666,  0,  0, 0)
    );

    return Curve._calcPt( ctrls, Mat.multiply( [step], m, true )[0] );
  }

  /**
   * Interpolate to get a point on a B-spline curve
   * @param step the coefficients [t*t*t, t*t, t, 1]
   * @param ctrls a group of anchor Pts
   * @param tension optional value between 0 to n to specify a "tension". Default to 1 which is the usual tension.
   * @return an interpolated Pt on the curve
   */  
  static bsplineTensionStep( step:Pt, ctrls:GroupLike, tension:number=1 ):Pt {
    /*
    * Basis matrix:
    * [ -1/6a, 2 - 1.5a, 1.5a - 2, 1/6a ]
    * [ 0.5a,  2a-3,     3-2.5a    0 ]
    * [ -0.5a, 0,        0.5a,     0 ]
    * [ 1/6a,  1 - 1/3a, 1/6a,     0 ]
    */

    let m = new Group(
      new Pt( -0.16666666666666666,  0.5, -0.5, 0.16666666666666666),
      new Pt(  -1.5, 2,  0, -0.3333333333333333),
      new Pt( 1.5,  -2.5,  0.5, 0.16666666666666666),
      new Pt(  0.16666666666666666,  0,  0, 0)
    );

    let h = Mat.multiply( [step], m, true )[0].multiply( tension );
    let h2 = (2*step[0] - 3*step[1] + 1);
    let h3 = -2*step[0] + 3*step[1];

    let pt = Curve._calcPt( ctrls, h );

    pt.x += h2*ctrls[1].x + h3*ctrls[2].x;
    pt.y += h2*ctrls[1].y + h3*ctrls[2].y;
    if (pt.length > 2) pt.z += h2*ctrls[1].z + h3*ctrls[2].z;

    return pt;
  } 

}