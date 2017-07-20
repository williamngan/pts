// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan)


import {Util, Const} from "./Util";
import {Num, Geom} from "./Num";
import {Bound} from "./Bound";
import {Pt, PtLike, Group, GroupLike} from "./Pt";
import {Vec, Mat} from "./LinearAlgebra";


let _errorLength = (obj, param:number|string="expected") => Util.warn( obj, "Group's length is less than "+param  );
let _errorOutofBound = (obj, param:number|string="") => Util.warn( obj, `Index ${param} is out of bound in Group`  );



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

  static magnitude( line:GroupLike ) {
    return (line.length >= 2) ? line[1].$subtract( line[0] ).magnitude() : 0;
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

  static lines( rect:GroupLike ): Group[] {
    return Rectangle.sides( rect );
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


export class Triangle {
  

  /**
   * Get the medial, which is an inner triangle formed by connecting the midpoints of this triangle's sides
   * @param pts a Group of Pts
   * @returns a Group representing a medial triangle
   */
  static medial( pts:GroupLike ):Group {
    if (pts.length < 3) return _errorLength( new Group(), 3 );
    return Polygon.midpoints( pts, true );
  }

  /**
   * Given a point of the triangle, the opposite side is the side which the point doesn't touch.
   * @param pts a Group of Pts
   * @param index a Pt on the triangle group
   * @returns a Group that represents a line of the opposite side
   */
  static oppositeSide( pts:GroupLike, index:number ):Group {
    if (pts.length < 3) return _errorLength( new Group(), 3 );
    if (index === 0) {
      return Group.fromPtArray( [pts[1], pts[2]] );
    } else if (index === 1) {
      return Group.fromPtArray( [pts[0], pts[2]] );
    } else {
      return Group.fromPtArray( [pts[0], pts[1]] );
    }
  }

  /**
   * Get a triangle's altitude, which is a line from a triangle's point to its opposite side, and perpendicular to its opposite side.
   * @param pts a Group of Pts
   * @param index a Pt on the triangle group
   * @returns a Group that represents the altitude line
   */
  static altitude( pts:GroupLike, index:number ):Group {
    let opp = Triangle.oppositeSide( pts, index );
    if (opp.length > 1) {
      return new Group( pts[index], Line.perpendicularFromPt( opp, pts[index] ) ); 
    } else {
      return new Group();
    }
  }

  /**
   * Get orthocenter, which is the intersection point of a triangle's 3 altitudes (the 3 lines that are perpendicular to its 3 opposite sides).
   * @param pts a Group of Pts
   * @returns the orthocenter as a Pt
   */
  static orthocenter( pts:GroupLike ):Pt {
    if (pts.length < 3) return _errorLength( undefined, 3 );
    let a = Triangle.altitude( pts, 0 );
    let b = Triangle.altitude( pts, 1 );
    return Line.intersectRay2D( a, b );
  }

  /**
   * Get incenter, which is the center point of its inner circle, and also the intersection point of its 3 angle bisector lines (each of which cuts one of the 3 angles in half).
   * @param pts a Group of Pts
   * @returns the incenter as a Pt
   */
  static incenter( pts:GroupLike ):Pt {
    if (pts.length < 3) return _errorLength( undefined, 3 );
    let a = Polygon.bisector( pts, 0 ).add( pts[0] );
    let b = Polygon.bisector( pts, 1 ).add( pts[1] );
    return Line.intersectRay2D( new Group(pts[0], a), new Group(pts[1], b) );
  }

  /**
   * Get an interior circle, which is the largest circle completed enclosed by this triangle
   * @param pts a Group of Pts
   * @param center Optional parameter if the incenter is already known. Otherwise, leave it empty and the incenter will be calculated
   */
  static incircle( pts:GroupLike, center?:Pt ):Group {
    let c = (center) ? center : Triangle.incenter( pts );
    let area = Polygon.area( pts );
    let perim = Polygon.perimeter( pts, true );
    let r = 2 * area / perim.total;
    return Circle.fromPt( c, r );
  }

  /**
   * Get circumcenter, which is the intersection point of its 3 perpendicular bisectors lines ( each of which divides a side in half and is perpendicular to the side)
   * @param pts a Group of Pts
   * @returns the circumcenter as a Pt
   */
  static circumcenter( pts:GroupLike ):Pt {
    let md = Triangle.medial( pts );
    let a = [ md[0], Geom.perpendicular( pts[0].$subtract( md[0] )).p1.$add( md[0] ) ];
    let b = [ md[1], Geom.perpendicular( pts[1].$subtract( md[1] )).p1.$add( md[1] ) ];
    return Line.intersectRay2D( a, b );
  } 

  /**
   * Get circumcenter, which is the intersection point of its 3 perpendicular bisectors lines ( each of which divides a side in half and is perpendicular to the side)
   * @param pts a Group of Pts
   * @param center Optional parameter if the circumcenter is already known. Otherwise, leave it empty and the circumcenter will be calculated 
   */
  static circumcircle( pts:GroupLike, center?:Pt ):Group {
    let c = (center) ? center : Triangle.circumcenter( pts );
    let r = pts[0].$subtract( c ).magnitude();
    return Circle.fromPt( c, r );
  }
}


export class Polygon {

  static centroid( pts:GroupLike ):Pt {
    return Geom.centroid( pts );
  }

  /**
   * Get the line segments in this polygon
   * @param pts a Group of Pts
   * @param closePath a boolean to specify whether the polygon should be closed (ie, whether the final segment should be counted).
   * @returns an array of Groups which has 2 Pts in each group
   */
  static lines( pts:GroupLike, closePath:boolean=false ):Group[] {
    if (pts.length < 2) return _errorLength( new Group(), 2 );
    let sp = Util.split( pts, 2, 1 );
    if (closePath) sp.push( new Group( pts[pts.length-1], pts[0]) );
    return sp.map( (g) => g as Group );
  }

  /**
   * Get a new polygon group that is derived from midpoints in this polygon
   * @param pts a Group of Pts
   * @param closePath a boolean to specify whether the polygon should be closed (ie, whether the final segment should be counted).
   * @param t a value between 0 to 1 for interpolation. Default to 0.5 which will get the middle point.
   */
  static midpoints( pts:GroupLike, closePath:boolean=false, t:number=0.5 ):Group {
    if (pts.length < 2) return _errorLength( new Group(), 2 );
    let sides = Polygon.lines( pts, closePath );
    let mids = sides.map( (s) => Geom.interpolate( s[0], s[1], t) );
    return mids as Group;
  }

  /**
   * Given a Pt in the polygon group, the adjacent sides are the two sides which the Pt touches.
   * @param pts a group of Pts
   * @param index the target Pt
   * @param closePath a boolean to specify whether the polygon should be closed (ie, whether the final segment should be counted).
   */
  static adjacentSides( pts:GroupLike, index:number, closePath:boolean=false ):Group[] {
    if (pts.length < 2) return _errorLength( new Group(), 2 );
    if (index < 0 || index >= pts.length) return _errorOutofBound( new Group(), index );

    let gs = [];
    let left = index-1;
    if (closePath && left < 0) left = pts.length-1;
    if (left >= 0) gs.push( new Group( pts[index], pts[left]) );

    let right = index+1;
    if (closePath && right > pts.length-1) right = 0;
    if (right <= pts.length-1) gs.push( new Group( pts[index], pts[right]) );

    return gs;
  }


  /**
   * Get a bisector which is a line that split between two sides of a polygon equally. 
   * @param pts a group of Pts
   * @param index the Pt in the polygon to bisect from
   * @param closePath a boolean to specify whether the polygon should be closed (ie, whether the final segment should be counted).
   * @returns a bisector Pt that's a normalized unit vector
   */
  static bisector( pts:GroupLike, index:number ):Pt {
    
    let sides = Polygon.adjacentSides( pts, index, true );
    if (sides.length >= 2) {
      let a = sides[0][1].$subtract( sides[0][0] ).unit();
      let b = sides[1][1].$subtract( sides[1][0] ).unit();
      return a.add( b ).divide( 2 ); 
    } else {
      return undefined;
    }

  }
  

  /**
   * Find the perimeter of this polygon, ie, the lengths of its sides.
   * @param pts a group of Pts
   * @param closePath a boolean to specify whether the polygon should be closed (ie, whether the final segment should be counted).
   * @returns an object with `total` length, and `segments` which is a Pt that stores each segment's length
   */
  static perimeter( pts:GroupLike, closePath:boolean=false ):{total:number, segments:Pt} {
    if (pts.length < 2) return _errorLength( new Group(), 2 );
    let lines = Polygon.lines( pts, closePath );
    let mag = 0;
    let p = Pt.make( lines.length, 0 );

    for (let i=0, len=lines.length; i<len; i++) {
      let m = Line.magnitude( lines[i] );
      mag += m;
      p[i] = m;
    }

    return {
      total: mag,
      segments: p
    }
  }

  
  /**
   * Find the area of a *convex* polygon.
   * @param pts a group of Pts
   */
  static area( pts:GroupLike ) {
    if (pts.length < 3) return _errorLength( new Group(), 3 );
    // determinant
    let det = (a, b) => a[0] * b[1] - a[1] * b[0];

    let area = 0;
    for (let i=0, len=pts.length; i<len; i++) {
      if (i < pts.length-1) {
        area += det( pts[i], pts[i+1]);
      } else {  
        area += det( pts[i], pts[0] );
      }
    }
    return Math.abs( area/2 );
  }

  /**
   * Get a convex hull of the point set using Melkman's algorithm
   * @param pts a group of Pt
   * @param sorted a boolean value to indicate if the group is pre-sorted by x position. Default is false.
   * @returns a group of Pt that defines the convex hull polygon
   */
  static convexHull( pts:GroupLike, sorted:boolean=false ): Group {
    if (pts.length < 3) return _errorLength( new Group(), 3 );

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
   * Given a target Pt, find a Pt in a Group that's nearest to it.
   * @param pts a Group of Pt
   * @param pt Pt to check
   */
  static nearestPt( pts:GroupLike, pt:PtLike ) {
    let _near = Number.MAX_VALUE;
    let _item = -1;
    for (let i=0, len=pts.length; i<len; i++) {
      let d = pts[i].$subtract( pt ).magnitudeSq()
      if (d < _near) {
        _near = d;
        _item = i;
      }
    }
    return (_item >= 0) ? pts[_item] : undefined;
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