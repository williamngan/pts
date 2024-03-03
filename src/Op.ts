/*! Pts.js is licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */

import {Util} from "./Util";
import {Geom, Num} from "./Num";
import {Pt, Group} from "./Pt";
import {Mat} from "./LinearAlgebra";
import {PtLike, GroupLike, PtLikeIterable, IntersectContext, PtIterable} from "./Types";


let _errorLength = ( obj, param:number | string = "expected" ) => Util.warn( "Group's length is less than " + param, obj  );
let _errorOutofBound = ( obj, param:number | string = "" ) => Util.warn( `Index ${param} is out of bound in Group`, obj  );


/**
 * Line class provides static functions to create and operate on lines. A line is usually represented as a Group of 2 Pts.
 * You can use the static functions as-is, or apply the [`Group.op`](#link) or [`Pt.op`](#link) to enable functional programming.
 * See [Op guide](../guide/Op-0400.html) for details.
 */
export class Line {

  /**
   * Create a line that originates from an anchor point, given an angle and a magnitude.
   * @param anchor an anchor Pt
   * @param angle an angle in radian
   * @param magnitude magnitude of the line
   * @return a Group of 2 Pts representing a line segement
   */
  static fromAngle( anchor:PtLike, angle:number, magnitude:number ):Group {
    let g = new Group( new Pt( anchor ), new Pt( anchor ) );
    g[1].toAngle( angle, magnitude, true );
    return g;
  }


  /**
   * Calculate the slope of a line.
   * @param p1 line's first end point
   * @param p2 line's second end point
   */
  static slope( p1:PtLike, p2:PtLike ):number {
    return ( p2[0] - p1[0] === 0 ) ? undefined : ( p2[1] - p1[1] ) / ( p2[0] - p1[0] );
  }


  /**
   * Calculate the slope and xy intercepts of a line.
   * @param p1 line's first end point
   * @param p2 line's second end point
   * @returns an object with `slope`, `xi`, `yi` properties 
   */
  static intercept( p1:PtLike, p2:PtLike ):{ slope:number, xi:number, yi:number } {
    if ( p2[0] - p1[0] === 0 ) {
      return undefined;
    } else {
      let m = ( p2[1] - p1[1] ) / ( p2[0] - p1[0] );
      let c = p1[1] - m * p1[0];
      return { slope: m, yi: c, xi: ( m === 0 ) ? undefined : -c / m };
    }
  }


  /**
   * Given a 2D path and a point, find whether the point is on left or right side of the line.
   * @param line  a Group or an Iterable<PtLike> representing a line
   * @param pt a Pt or numeric array
   * @returns a negative value if on left and a positive value if on right. If collinear, then the return value is 0.
   */
  static sideOfPt2D( line:PtLikeIterable, pt:PtLike ):number {
    let _line = Util.iterToArray( line );
    return ( _line[1][0] - _line[0][0] ) * ( pt[1] - _line[0][1] ) - ( pt[0] - _line[0][0] ) * ( _line[1][1] - _line[0][1] );
  }


  /**
   * Check if three Pts are collinear, ie, on the same straight path.
   * @param p1 first Pt
   * @param p2 second Pt
   * @param p3 third Pt
   * @param threshold a threshold where a smaller value means higher precision threshold for the straight line. Default is 0.01.
   */
  static collinear( p1:PtLike, p2:PtLike, p3:PtLike, threshold:number = 0.01 ):boolean {
    // Use cross product method
    let a = new Pt( 0,0,0 ).to( p1 ).$subtract( p2 );
    let b = new Pt( 0,0,0 ).to( p1 ).$subtract( p3 );    
    return a.$cross( b ).divide( 1000 ).equals( new Pt( 0,0,0 ), threshold );
  }


  /**
   * Get magnitude of a line segment.
   * @param line a Group or an Iterable<Pt> with at least 2 Pt
   */
  static magnitude( line:PtIterable ):number {
    let _line = Util.iterToArray( line );
    return ( _line.length >= 2 ) ? _line[1].$subtract( _line[0] ).magnitude() : 0;
  }


  /**
   * Get squared magnitude of a line segment.
   * @param _line a Group or an Iterable<Pt> with at least 2 Pt
   */
  static magnitudeSq( line:PtIterable ):number {
    let _line = Util.iterToArray( line );
    return ( _line.length >= 2 ) ? _line[1].$subtract( _line[0] ).magnitudeSq() : 0;
  }


  /**
   * Find a point on a line that is perpendicular (shortest distance) to a target point.
   * @param line a Group or an Iterable<Pt> that defines a line
   * @param pt a target Pt 
   * @param asProjection if true, this returns the projection vector instead. Default is false.
   * @returns a Pt on the line that is perpendicular to the target Pt, or a projection vector if `asProjection` is true.
   */
  static perpendicularFromPt( line:PtIterable, pt:PtLike, asProjection:boolean = false ):Pt {
    let _line = Util.iterToArray( line );
    if ( _line[0].equals( _line[1] ) ) return undefined;
    let a = _line[0].$subtract( _line[1] );
    let b = _line[1].$subtract( pt );
    let proj = b.$subtract( a.$project( b ) );

    return ( asProjection ) ? proj : proj.$add( pt );
  }


  /**
   * Given a line and a point, find the shortest distance from the point to the line.
   * @param line a Group of 2 Pts
   * @param pt a Pt
   * @see `Line.perpendicularFromPt`
   */
  static distanceFromPt( line:GroupLike, pt:PtLike | number[] ):number {
    let _line = Util.iterToArray( line );
    let projectionVector = Line.perpendicularFromPt( _line, pt, true );
    if ( projectionVector ) {
      return projectionVector.magnitude();
    } else {
      // line is made of 2 identical points, return distance between this point and pt
      return _line[0].$subtract( pt ).magnitude();
    }
  }


  /**
   * Given two lines as rays (infinite lines), find their intersection point if any.
   * @param la a Group or an Iterable<Pt> with 2 Pt representing a ray
   * @param lb a Group or an Iterable<Pt> with 2 Pts representing another ray
   * @returns an intersection Pt or undefined if no intersection
   */
  static intersectRay2D( la:PtIterable, lb:PtIterable ):Pt {
    let _la = Util.iterToArray( la );
    let _lb = Util.iterToArray( lb );

    let a = Line.intercept( _la[0], _la[1] );
    let b = Line.intercept( _lb[0], _lb[1] );

    let pa = _la[0];
    let pb = _lb[0];

    if ( a == undefined ) {
      if ( b == undefined ) return undefined;
      // one of them is vertical line, while the other is not, so they will intersect
      let y1 = -b.slope *  ( pb[0] - pa[0] ) + pb[1]; // -slope * x + y
      return new Pt( pa[0], y1 );

    } else {
      // diff slope, or b slope is vertical line
      if ( b == undefined ) {
        let y1 = -a.slope *  ( pa[0] - pb[0] ) + pa[1];
        return new Pt( pb[0], y1 );

      } else if ( b.slope != a.slope ) {
        let px = ( a.slope * pa[0] - b.slope * pb[0] + pb[1] - pa[1] ) / ( a.slope - b.slope );
        let py = a.slope * ( px - pa[0] ) + pa[1];
        return new Pt( px, py );
        
      } else {
        if ( a.yi == b.yi ) { // exactly along the same path
          return new Pt( pa[0], pa[1] );
        } else {
          return undefined;
        }
      }
    }
  }


  /**
   * Given two line segemnts, find their intersection point if any.
   * @param la a Group or an Iterable<Pt> with 2 Pt representing a line segment
   * @param lb a Group or an Iterable<Pt> with 2 Pt representing a line segment
   * @returns an intersection Pt or undefined if no intersection
   */
  static intersectLine2D( la:PtIterable, lb:PtIterable ):Pt {
    let _la = Util.iterToArray( la );
    let _lb = Util.iterToArray( lb );

    let pt = Line.intersectRay2D( _la, _lb );
    return ( pt && Geom.withinBound( pt, _la[0], _la[1] ) && Geom.withinBound( pt, _lb[0], _lb[1] ) ) ? pt : undefined;
  }


  /**
   * Given a line segemnt and a ray (infinite line), find their intersection point if any.
   * @param line a Group of 2 Pts representing a line segment
   * @param ray a Group of 2 Pts representing a ray
   * @returns an intersection Pt or undefined if no intersection
   */
  static intersectLineWithRay2D( line:PtIterable, ray:PtIterable ):Pt {
    let _line = Util.iterToArray( line );
    let _ray = Util.iterToArray( ray );
    let pt = Line.intersectRay2D( _line, _ray );
    return ( pt && Geom.withinBound( pt, _line[0], _line[1] ) ) ? pt : undefined;
  }


  /**
   * Given a line segemnt or a ray (infinite line), find its intersection point(s) with a polygon.
   * @param lineOrRay a Group or an Iterable<Pt> with 2 Pt representing a line or ray
   * @param poly a Group or an Iterable<Pt> representing a polygon
   * @param sourceIsRay a boolean value to treat the line as a ray (infinite line). Default is `false`.
   */
  static intersectPolygon2D( lineOrRay:PtIterable, poly:PtIterable, sourceIsRay:boolean = false ):Group {
    let _lineOrRay = Util.iterToArray( lineOrRay );
    let _poly = Util.iterToArray( poly );

    let fn = sourceIsRay ? Line.intersectLineWithRay2D : Line.intersectLine2D; 
    let pts = new Group();
    for ( let i = 0, len = _poly.length; i < len; i++ ) {
      let next = ( i === len - 1 ) ? 0 : i + 1;
      let d = fn( [_poly[i], _poly[next]], _lineOrRay );
      if ( d ) pts.push( d ); 
    }
    return ( pts.length > 0 ) ? pts : undefined;
  } 


  /**
   * Find intersection points of 2 sets of lines. This checks all line segments in the two lists. Consider using a bounding-box check before calling this. If you are checking convex polygon intersections, using [`Polygon.intersectPolygon2D`](#link) will be more efficient.
   * @param lines1 an Array/Iterable of (Groups or Iterables<Pt>)
   * @param lines2 an Array/Iterable of (Groups or Iterables<Pt>)
   * @param isRay a boolean value to treat the line as a ray (infinite line). Default is `false`.
   */
  static intersectLines2D( lines1:Iterable<PtIterable>, lines2:Iterable<PtIterable>, isRay:boolean = false ):Group {
    let group = new Group();
    let fn = isRay ? Line.intersectLineWithRay2D : Line.intersectLine2D; 
    for ( let l1 of lines1 ) {
      for ( let l2 of lines2 ) {
        let _ip = fn( l1, l2 );
        if ( _ip ) group.push( _ip );
      }
    }
    return group;
  }


  /**
   * Get two points of a ray that intersects with a point on a 2D grid.
   * @param ray a Group or an Iterable<Pt> representing a ray
   * @param gridPt a Pt on the grid
   * @returns a group of two intersecting Pts. The first one is horizontal intersection and the second one is vertical intersection.
   */
  static intersectGridWithRay2D( ray:PtIterable, gridPt:PtLike ):Group {
    let _ray = Util.iterToArray( ray );
    let t = Line.intercept( new Pt( _ray[0] ).subtract( gridPt ), new Pt( _ray[1] ).subtract( gridPt ) );
    let g = new Group();
    if ( t && t.xi ) g.push( new Pt( gridPt[0] + t.xi, gridPt[1] ) );
    if ( t && t.yi ) g.push( new Pt( gridPt[0], gridPt[1] + t.yi ) );
    return g;
  }  


  /**
   * Get two intersection Pts of a line segment with a 2D grid point.
   * @param line a ray specified by 2 Pts
   * @param gridPt a Pt on the grid
   * @returns a group of two intersecting Pts. The first one is horizontal intersection and the second one is vertical intersection.
   */
  static intersectGridWithLine2D( line:GroupLike, gridPt:PtLike | number[] ):Group {
    let _line = Util.iterToArray( line );
    let g = Line.intersectGridWithRay2D( _line, gridPt );
    let gg = new Group();
    for ( let i = 0, len = g.length; i < len; i++ ) {
      if ( Geom.withinBound( g[i], _line[0], _line[1] ) ) gg.push( g[i] );
    }
    return gg;
  }


  /**
   * An easy way to get rectangle-line intersection points. For more optimized implementation, store the rectangle's sides separately (eg, `Rectangle.sides()`) and use `Polygon.intersectPolygon2D()`.
   * @param line a Group representing a line
   * @param rect a Group representing a rectangle
   * @returns a Group of intersecting Pts
   */
  static intersectRect2D( line:GroupLike, rect:GroupLike ):Group {
    let _line = Util.iterToArray( line );
    let _rect = Util.iterToArray( rect );
    let box = Geom.boundingBox( Group.fromPtArray( _line ) );
    if ( !Rectangle.hasIntersectRect2D( box, _rect ) ) return new Group();
    return Line.intersectLines2D( [_line], Rectangle.sides( _rect ) );
  }


  /**
   * Get evenly distributed points on a line. Similar to [`Create.distributeLinear`](#link) but excluding end points.
   * @param line a Group or an Iterable<PtLike> representing a line
   * @param num number of points to get
   */
  static subpoints( line:PtLikeIterable, num:number ) {
    let _line = Util.iterToArray( line );
    let pts = new Group();
    for ( let i = 1; i <= num; i++ ) {
      pts.push( Geom.interpolate( _line[0], _line[1], i / ( num + 1 ) ) );
    }
    return pts;
  }


  /**
   * Crop this line by a circle or rectangle at end points. This can be useful for creating arrows that connect to an object's edge.
   * @param line a Group or an Iterable<Pt> representing a line to crop
   * @param size size of circle or rectangle as Pt
   * @param index line's end point index, ie, 0 = start and 1 = end.
   * @param cropAsCircle a boolean to specify whether the `size` parameter should be treated as circle. Default is `true`.
   * @return an intersecting point on the line that can be used for cropping.
   */
  static crop( line:PtIterable, size:PtLike, index:number = 0, cropAsCircle:boolean = true ):Pt {
    let _line = Util.iterToArray( line );
    let tdx = ( index === 0 ) ? 1 : 0;
    let ls = _line[tdx].$subtract( _line[index] );

    if ( ls[0] === 0 || size[0] === 0 ) return _line[index];

    if ( cropAsCircle ) {
      let d = ls.unit().multiply( size[1] );
      return _line[index].$add( d );

    } else {
      let rect = Rectangle.fromCenter( _line[index], size );
      let sides = Rectangle.sides( rect );
      let sideIdx = 0;

      if ( Math.abs( ls[1] / ls[0] ) > Math.abs( size[1] / size[0] ) ) {
        sideIdx = ( ls[1] < 0 ) ? 0 : 2;
      } else {
        sideIdx = ( ls[0] < 0 ) ? 3 : 1;
      }
      return Line.intersectRay2D( sides[sideIdx], _line );

    }
  }

  /**
   * Create an marker arrow or line, placed at an end point of this line.
   * @param line a Group or an Iterable<Pt> representing a line to place marker
   * @param size size of the marker as Pt
   * @param graphic either "arrow" or "line"
   * @param atTail a boolean, if `true`, the marker will be positioned at tail of the line (ie, index = 1). Default is `true`.
   * @returns a Group that defines the marker's shape
   */
  static marker( line:PtIterable, size:PtLike, graphic:string = ( "arrow" || "line" ), atTail:boolean = true ):Group {
    let _line = Util.iterToArray( line );
    let h = atTail ? 0 : 1;
    let t = atTail ? 1 : 0;
    let unit = _line[h].$subtract( _line[t] );

    if ( unit.magnitudeSq() === 0 ) return new Group();
    unit.unit();
    
    let ps = Geom.perpendicular( unit ).multiply( size[0] ).add( _line[t] );
    if ( graphic == "arrow" ) {
      ps.add( unit.$multiply( size[1] ) );
      return new Group( _line[t], ps[0], ps[1] );
    } else {
      return new Group( ps[0], ps[1] );
    }

  }

  /**
   * Convert this line to a new rectangle representation.
   * @param line a Group representing a line
   */
  static toRect( line:GroupLike ) {
    let _line = Util.iterToArray( line );
    return new Group( _line[0].$min( _line[1] ), _line[0].$max( _line[1] ) );
  }

}



/**
 * Rectangle class provides static functions to create and operate on rectangles. A rectangle is usually represented as a Group of 2 Pts, marking the top-left and bottom-right corners of the rectangle.
 * You can use the static functions as-is, or apply the [`Group.op`](#link) or [`Pt.op`](#link) to enable functional programming.
 * See [Op guide](../guide/Op-0400.html) for details.
 */
export class Rectangle {

  /**
   * Create a rectangle from top-left anchor point. Same as [`Rectangle.fromTopLeft`](#link).
   * @param topLeft top-left point
   * @param widthOrSize width as a number, or a Pt that defines its size
   * @param height optional height as a number
   * @returns a Group of 2 Pts representing a rectangle
   */
  static from( topLeft:PtLike, widthOrSize:number | PtLike, height?:number ):Group {
    return Rectangle.fromTopLeft( topLeft, widthOrSize, height );
  }


  /**
   * Create a rectangle given a top-left position and a size.
   * @param topLeft top-left point
   * @param widthOrSize width as a number, or a Pt that defines its size
   * @param height optional height as a number
   * @returns a Group of 2 Pts representing a rectangle
   */
  static fromTopLeft( topLeft:PtLike, widthOrSize:number | PtLike, height?:number ):Group {
    let size = ( typeof widthOrSize == "number" ) ? [widthOrSize, ( height || widthOrSize )] : widthOrSize;
    return new Group( new Pt( topLeft ), new Pt( topLeft ).add( size ) );
  }


  /**
   * Create a rectangle given a center position and a size.
   * @param topLeft top-left point
   * @param widthOrSize width as a number, or a Pt that defines its size
   * @param height optional height as a number
   * @returns a Group of 2 Pts representing a rectangle
   */
  static fromCenter( center:PtLike, widthOrSize:number | PtLike, height?:number ):Group {
    let half = ( typeof widthOrSize == "number" ) ? [widthOrSize / 2, ( height || widthOrSize ) / 2] : new Pt( widthOrSize ).divide( 2 );
    return new Group( new Pt( center ).subtract( half ), new Pt( center ).add( half ) );
  }


  /**
   * Create a new circle that either fits within or encloses the rectangle. Same as [`Circle.fromRect`](#link).
   * @param pts a Group or an Iterable<Pt> with 2 Pt representing a rectangle
   * @param within if `true`, the circle will be within the rectangle. If `false`, the circle will enclose the rectangle. 
   * @returns a Group that represents a circle
   */
  static toCircle( pts:PtIterable, within:boolean = true ):Group {
    return Circle.fromRect( pts, within );
  }

  
  /**
   * Create a square that either fits within or encloses a rectangle.
   * @param pts a Group or an Iterable<Pt> with 2 Pt representing a rectangle
   * @param enclose if `true`, the square will enclose the rectangle. Default is `false`, which will fit the square inside the rectangle.
   * @returns a Group of 2 Pts representing a rectangle
   */
  static toSquare( pts:PtIterable, enclose = false ):Group {
    let _pts = Util.iterToArray( pts );
    let s = Rectangle.size( _pts );
    let m = ( enclose ) ? s.maxValue().value : s.minValue().value;
    return Rectangle.fromCenter( Rectangle.center( _pts ), m, m );
  }


  /**
   * Get the size of this rectangle as a Pt.
   * @param p a Group or an Iterable<Pt> with 2 Pt representing a Rectangle
   */
  static size( pts:PtIterable ):Pt {
    let p = Util.iterToArray( pts );
    return p[0].$max( p[1] ).subtract( p[0].$min( p[1] ) );
  }


  /**
   * Get the center of this rectangle.
   * @param p a Group or an Iterable<Pt> with 2 Pt representing a Rectangle
   */
  static center( pts:PtIterable ):Pt {
    let p = Util.iterToArray( pts );
    let min = p[0].$min( p[1] );
    let max = p[0].$max( p[1] );
    return min.add( max.$subtract( min ).divide( 2 ) );
  }


  /**
   * Get the 4 corners of this rectangle as a Group.
   * @param rect a Group or an Iterable<Pt> with 2 Pt representing a Rectangle
   */
  static corners( rect:PtIterable ):Group {
    let _rect = Util.iterToArray( rect );
    let p0 = _rect[0].$min( _rect[1] );
    let p2 = _rect[0].$max( _rect[1] );
    return new Group( p0,  new Pt( p2.x, p0.y ), p2, new Pt( p0.x, p2.y ) );
  }


  /**
   * Get the 4 sides of this rectangle as an array of 4 Groups.
   * @param rect a Group or an Iterable<Pt> with 2 Pt representing a Rectangle
   * @returns an array of 4 Groups, each of which represents a line segment
   */
  static sides( rect:PtIterable ):Group[] {
    let [p0, p1, p2, p3] = Rectangle.corners( rect );
    return [
      new Group( p0, p1 ), new Group( p1, p2 ),
      new Group( p2, p3 ), new Group( p3, p0 )
    ];
  }


  /**
   * Given an array of rectangles, get a rectangle that bounds all of them.
   * @param rects an array of (Groups or Iterables<PtLike>) that represents a set of rectangles
   * @returns the bounding rectangle as a Group
   */
  static boundingBox( rects:Iterable<PtLikeIterable> ):Group {
    let _rects = Util.iterToArray( rects );
    let merged = Util.flatten( _rects, false );
    let min = Pt.make( 2, Number.MAX_VALUE );
    let max = Pt.make( 2, Number.MIN_VALUE );

    // calculate min max in a single pass
    for ( let i = 0, len = merged.length; i < len; i++ ) {
      let k = 0;
      for ( let m of merged[i] ) {
        min[k] = Math.min( min[k], m[k] );
        max[k] = Math.max( max[k], m[k] );
        if ( ++k >= 2 ) break;
      }
    }
    return new Group( min, max );
  }


  /**
   * Convert this rectangle into a Group representing a polygon. An alias for [`Rectangle.corners`](#link)
   * @param rect a Group or an Iterable<Pt> with 2 Pt representing a Rectangle
   */
  static polygon( rect:PtIterable ):Group {
    return Rectangle.corners( rect );
  }


  /**
   * Subdivide a rectangle into 4 rectangles, one for each quadrant.
   * @param rect a Group or an Iterable<Pt> with 2 Pt representing a Rectangle
   * @returns an array of 4 Groups of rectangles
   */
  static quadrants( rect:PtIterable, center?:PtLike ):Group[] {
    let _rect = Util.iterToArray( rect );
    let corners = Rectangle.corners( _rect );
    let _center = ( center != undefined ) ? new Pt( center ) : Rectangle.center( _rect );
    return corners.map( ( c ) => new Group( c, _center ).boundingBox() );
  }


  /**
   * Subdivde a rectangle into 2 rectangles, by row or by column.
   * @param rect a Group or an Iterable<Pt> with 2 Pt representing a Rectangle
   * @param ratio a value between 0 to 1 to indicate the split ratio
   * @param asRows if `true`, split into 2 rows. Default is `false` which splits into 2 columns.
   * @returns an array of 2 Groups of rectangles
   */
  static halves( rect:PtIterable, ratio:number = 0.5, asRows:boolean = false ):Group[] {
    let _rect = Util.iterToArray( rect );
    let min = _rect[0].$min( _rect[1] );
    let max = _rect[0].$max( _rect[1] );
    let mid = ( asRows ) ? Num.lerp( min[1], max[1], ratio ) : Num.lerp( min[0], max[0], ratio );
    return ( asRows ) 
      ? [new Group( min, new Pt( max[0],mid ) ), new Group( new Pt( min[0],mid ), max )]
      : [new Group( min, new Pt( mid,max[1] ) ), new Group( new Pt( mid,min[1] ), max )];
  }


  /**
   * Check if a point is within a rectangle.
   * @param rect a Group of 2 Pts representing a Rectangle
   * @param pt the point to check
   */
  static withinBound( rect:GroupLike, pt:PtLike ):boolean {
    let _rect = Util.iterToArray( rect );
    return Geom.withinBound( pt, _rect[0], _rect[1] );
  }


  /**
   * Check if a rectangle is within the bounds of another rectangle.
   * @param rect1 a Group of 2 Pts representing a rectangle
   * @param rect2 a Group of 2 Pts representing a rectangle
   * @param resetBoundingBox if `true`, reset the bounding box. Default is `false` which assumes the rect's first Pt at is its top-left corner.
   */
  static hasIntersectRect2D( rect1:GroupLike, rect2:GroupLike, resetBoundingBox:boolean = false ):boolean {
    let _rect1 = Util.iterToArray( rect1 );
    let _rect2 = Util.iterToArray( rect2 );

    if ( resetBoundingBox ) {
      _rect1 = Geom.boundingBox( _rect1 );
      _rect2 = Geom.boundingBox( _rect2 );
    }

    if ( _rect1[0][0] > _rect2[1][0] || _rect2[0][0] > _rect1[1][0] ) return false;
    if ( _rect1[0][1] > _rect2[1][1] || _rect2[0][1] > _rect1[1][1] ) return false; 
    return true;
    
  }


  /**
   * An easy way to get rectangle-rectangle intersection points. For more optimized implementation, store the rectangle's sides separately (eg, `Rectangle.sides()`) and use `Polygon.intersectPolygon2D()`.
   * @param rect1 a Group of 2 Pts representing a rectangle
   * @param rect2 a Group of 2 Pts representing a rectangle
   */
  static intersectRect2D( rect1:GroupLike, rect2:GroupLike ):Group {
    let _rect1 = Util.iterToArray( rect1 );
    let _rect2 = Util.iterToArray( rect2 );
    if ( !Rectangle.hasIntersectRect2D( _rect1, _rect2 ) ) return new Group();
    return Line.intersectLines2D( Rectangle.sides( _rect1 ), Rectangle.sides( _rect2 ) );
  }

}



/**
 * Circle class provides static functions to create and operate on circles. A circle is usually represented as a Group of 2 Pts, where the first Pt specifies the center, and the second Pt specifies the radius.
 * You can use the static functions as-is, or apply the [`Group.op`](#link) or [`Pt.op`](#link) to enable functional programming.
 * See [Op guide](../guide/Op-0400.html) for details.
 */
export class Circle {
  

  /**
   * Create a circle that either fits within, or encloses, a rectangle.
   * @param pts a Group or an Iterable<PtLike> with 2 Pt representing a rectangle
   * @param enclose if `true`, the circle will enclose the rectangle. Default is `false`, which will fit the circle inside the rectangle.
   * @returns a Group that represents a circle
   */
  static fromRect( pts:PtLikeIterable, enclose = false ):Group {
    let _pts = Util.iterToArray( pts );
    let r = 0;
    let min = r = Rectangle.size( _pts ).minValue().value / 2;
    if ( enclose ) {
      let max = Rectangle.size( _pts ).maxValue().value / 2;
      r = Math.sqrt( min * min + max * max );
    } else {
      r = min;
    }
    return new Group( Rectangle.center( _pts ), new Pt( r, r ) );
  }


  /**
   * Create a circle that either fits within, or encloses, a triangle. Same as [`Triangle.circumcircle`](#link) or [`Triangle.incircle`](#link).
   * @param pts a Group or an Iterable<Pt> with 3 Pt representing a rectangle
   * @param enclose if `true`, the circle will enclose the triangle. Default is `false`, which will fit the circle inside the triangle.
   * @returns a Group that represents a circle
   */
  static fromTriangle( pts:PtIterable, enclose:boolean = false ):Group {
    if ( enclose ) {
      return Triangle.circumcircle( pts );
    } else {
      return Triangle.incircle( pts );
    }
  }


  /**
   * Create a circle based on a center point and a radius.
   * @param pt center point of circle
   * @param radius radius of circle
   * @returns a Group that represents a circle
   */
  static fromCenter( pt:PtLike, radius:number ):Group {
    return new Group( new Pt( pt ), new Pt( radius, radius ) );
  }


  /**
   * Check if a point is within a circle.
   * @param pts a Group or an Iterable<Pt> with 2 Pt representing a circle
   * @param pt the point to checks
   * @param threshold an optional small number to set threshold. Default is 0.
   */
  static withinBound( pts:PtIterable, pt:PtLike, threshold:number = 0 ):boolean  {
    let _pts = Util.iterToArray( pts );
    let d = _pts[0].$subtract( pt );
    return d.dot( d ) + threshold < _pts[1].x * _pts[1].x;
  }


  /**
   * Get the intersection points between a circle and a ray (infinite line).
   * @param circle a Group or an Iterable<Pt> with 2 Pt representing a circle
   * @param ray a Group or an Iterable<Pt> with 2 Pt representing a ray 
   * @returns a Group of intersection points, or an empty Group if no intersection is found
   */
  static intersectRay2D( circle:PtIterable, ray:PtIterable ):Group {
    let _pts = Util.iterToArray( circle );
    let _ray = Util.iterToArray( ray );

    let d = _ray[0].$subtract( _ray[1] );
    let f = _pts[0].$subtract( _ray[0] );

    let a = d.dot( d );
    let b = f.dot( d );
    let c = f.dot( f ) - _pts[1].x * _pts[1].x;
    let p = b / a;
    let q = c / a;
    let disc = p * p - q; // discriminant

    if ( disc < 0 ) {
      return new Group();
    } else {
      let discSqrt = Math.sqrt( disc );

      let t1 = -p + discSqrt;
      let p1 = _ray[0].$subtract( d.$multiply( t1 ) );
      if ( disc === 0 ) return new Group( p1 );

      let t2 = -p - discSqrt;
      let p2 = _ray[0].$subtract( d.$multiply( t2 ) );
      return new Group( p1, p2 );
    }
  }


  /**
   * Get the intersection points between a circle and a line segment.
   * @param circle a Group or an Iterable<Pt> with Pt representing a circle
   * @param line a Group or an Iterable<Pt> with 2 Pt representing a line
   * @returns a Group of intersection points, or an empty Group if no intersection is found
   */
  static intersectLine2D( circle:PtIterable, line:PtIterable ):Group {
    let _pts = Util.iterToArray( circle );
    let _line = Util.iterToArray( line );

    let ps = Circle.intersectRay2D( _pts, _line );
    let g = new Group();
    if ( ps.length > 0 ) {
      for ( let i = 0, len = ps.length; i < len; i++ ) {
        if ( Rectangle.withinBound( _line, ps[i] ) ) g.push( ps[i] );
      }
    }
    return g;
  }


  /**
   * Get the intersection points between two circles.
   * @param circle1 a Group or an Iterable<Pt> with 2 Pt representing a circle
   * @param circle2 a Group or an Iterable<Pt> with 2 Pt representing a circle
   * @returns a Group of intersection points, or an empty Group if no intersection is found
   */
  static intersectCircle2D( circle1:PtIterable, circle2:PtIterable ):Group {
    let _pts = Util.iterToArray( circle1 );
    let _circle = Util.iterToArray( circle2 );
    
    let dv = _circle[0].$subtract( _pts[0] );
    let dr2 = dv.magnitudeSq();
    let dr = Math.sqrt( dr2 );

    let ar = _pts[1].x;
    let br = _circle[1].x;
    let ar2 = ar * ar;
    let br2 = br * br;


    if ( dr > ar + br ) { // not intersected
      return new Group();
    } else if ( dr < Math.abs( ar - br ) ) { // completely enclosed
      return new Group( _pts[0].clone() );
    } else {
      let a = ( ar2 - br2 + dr2 ) / ( 2 * dr );
      let h = Math.sqrt( ar2 - a * a );
      let p = dv.$multiply( a / dr ).add( _pts[0] );
      return new Group(  
        new Pt( p.x + h * dv.y / dr, p.y - h * dv.x / dr ),
        new Pt( p.x - h * dv.y / dr, p.y + h * dv.x / dr )
      );
    }
  }


  /**
   * Quick way to check rectangle intersection with a circle. 
   * For more optimized implementation, store the rectangle's sides separately (eg, [`Rectangle.sides`](#link)) and use [`Polygon.intersectPolygon2D()`](#link).
   * @param circle a Group or an Iterable<Pt> with 2 Pt representing a circle
   * @param rect a Group or an Iterable<Pt> with 2 Pt representing a rectangle
   * @returns a Group of intersection points, or an empty Group if no intersection is found
   */
  static intersectRect2D( circle:PtIterable, rect:PtIterable ):Group {
    let _pts = Util.iterToArray( circle );
    let _rect = Util.iterToArray( rect );

    let sides = Rectangle.sides( _rect );
    let g = [];
    for ( let i = 0, len = sides.length; i < len; i++ ) {
      let ps = Circle.intersectLine2D( _pts, sides[i] );
      if ( ps.length > 0 ) g.push( ps );
    }
    return Util.flatten( g );
  }


  /**
   * Get a rectangle that either fits within or encloses this circle. See also [`Rectangle.toCircle`](#link)
   * @param circle a Group or an Iterable<Pt> with 2 Pt representing a circle
   * @param within if `true`, the rectangle will be within the circle. If `false`, the rectangle will enclose the circle. 
   * @returns a Group representing a rectangle
   */
  static toRect( circle:PtIterable, within:boolean = false ):Group {
    let _pts = Util.iterToArray( circle );
    let r = _pts[1][0];
    if ( within ) {
      let half = Math.sqrt( r * r ) / 2;
      return new Group( _pts[0].$subtract( half ), _pts[0].$add( half ) );
    } else {
      return new Group( _pts[0].$subtract( r ), _pts[0].$add( r ) );
    }
  }


  /**
   * Get a triangle that fits within this circle.
   * @param circle a Group or an Iterable<Pt> with 2 Pt representing a circle
   * @param within if `true`, the triangle will be within the circle. If `false`, the triangle will enclose the circle. 
   */
  static toTriangle( circle:PtIterable, within:boolean = true ):Group {
    let _pts = Util.iterToArray( circle );
    if ( within ) {
      let ang = -Math.PI / 2;
      let inc = Math.PI * 2 / 3;
      let g = new Group();
      for ( let i = 0; i < 3; i++ ) {
        g.push( _pts[0].clone().toAngle( ang, _pts[1][0], true ) );
        ang += inc;
      }
      return g;
    } else {
      return Triangle.fromCenter( _pts[0], _pts[1][0] );
    }
  }

}



/**
 * Triangle class provides static functions to create and operate on trianges. A triange is a polygon represented as a Group of 3 Pts.
 * You can use the static functions as-is, or apply the [`Group.op`](#link) or [`Pt.op`](#link) to enable functional programming.
 * See [Op guide](../guide/Op-0400.html) for details.
 */
export class Triangle {
 
  /**
   * Create a triangle from a rectangle. The triangle will be isosceles, with the bottom of the rectangle as its base.
   * @param rect a Group or an Iterable<Pt> with 2 Pt representing a rectangle
   */
  static fromRect( rect:PtIterable ):Group {
    let _rect = Util.iterToArray( rect );
    let top = _rect[0].$add( _rect[1] ).divide( 2 );
    top.y = _rect[0][1];
    let left = _rect[1].clone();
    left.x = _rect[0][0];
    return new Group( top, _rect[1].clone(), left );
  }


  /**
   * Create a triangle that fits within a circle.
   * @param circle a Group or an Iterable<Pt> with 2 Pt representing a circle
   */
  static fromCircle( circle:PtIterable ):Group {
    return Circle.toTriangle( circle, true );
  }


  /**
   * Create an equilateral triangle based on a center point and a size.
   * @param pt the center point
   * @param size size is the magnitude of lines from center to the triangle's vertices, like a "radius".
   */
  static fromCenter( pt:PtLike, size:number ):Group {
    return Triangle.fromCircle( Circle.fromCenter( pt, size ) );
  }


  /**
   * Get the medial, which is an inner triangle formed by connecting the midpoints of this triangle's sides.
   * @param tri a Group or an Iterable<Pt> representing a triangle
   * @returns a Group representing a medial triangle
   */
  static medial( tri:PtIterable ):Group {
    let _pts = Util.iterToArray( tri );
    if ( _pts.length < 3 ) return _errorLength( new Group(), 3 );
    return Polygon.midpoints( _pts, true );
  }


  /**
   * Given a point of the triangle, the opposite side is the side which the point doesn't touch.
   * @param tri a Group or an Iterable<Pt> representing a triangle
   * @param index a Pt on the triangle group
   * @returns a Group that represents a line of the opposite side
   */
  static oppositeSide( tri:PtIterable, index:number ):Group {
    let _pts = Util.iterToArray( tri );
    if ( _pts.length < 3 ) return _errorLength( new Group(), 3 );
    if ( index === 0 ) {
      return Group.fromPtArray( [_pts[1], _pts[2]] );
    } else if ( index === 1 ) {
      return Group.fromPtArray( [_pts[0], _pts[2]] );
    } else {
      return Group.fromPtArray( [_pts[0], _pts[1]] );
    }
  }

  /**
   * Get a triangle's altitude, which is a line from a triangle's point to its opposite side, and perpendicular to its opposite side.
   * @param tri a Group or an Iterable<Pt> representing a triangle
   * @param index a Pt on the triangle group
   * @returns a Group that represents the altitude line
   */
  static altitude( tri:PtIterable, index:number ):Group {
    let _pts = Util.iterToArray( tri );
    let opp = Triangle.oppositeSide( _pts, index );
    if ( opp.length > 1 ) {
      return new Group( _pts[index], Line.perpendicularFromPt( opp, _pts[index] ) ); 
    } else {
      return new Group();
    }
  }

  /**
   * Get orthocenter, which is the intersection point of a triangle's 3 altitudes (the 3 lines that are perpendicular to its 3 opposite sides).
   * @param tri a Group or an Iterable<Pt> representing a triangle
   * @returns the orthocenter as a Pt
   */
  static orthocenter( tri:PtIterable ):Pt {
    let _pts = Util.iterToArray( tri );
    if ( _pts.length < 3 ) return _errorLength( undefined, 3 );
    let a = Triangle.altitude( _pts, 0 );
    let b = Triangle.altitude( _pts, 1 );
    return Line.intersectRay2D( a, b );
  }

  /**
   * Get incenter, which is the center point of its inner circle, and also the intersection point of its 3 angle bisector lines (each of which cuts one of the 3 angles in half).
   * @param tri a Group or an Iterable<Pt> representing a triangle
   * @returns the incenter as a Pt
   */
  static incenter( tri:PtIterable ):Pt {
    let _pts = Util.iterToArray( tri );
    if ( _pts.length < 3 ) return _errorLength( undefined, 3 );
    let a = Polygon.bisector( _pts, 0 ).add( _pts[0] );
    let b = Polygon.bisector( _pts, 1 ).add( _pts[1] );
    return Line.intersectRay2D( new Group( _pts[0], a ), new Group( _pts[1], b ) );
  }

  /**
   * Get an interior circle, which is the largest circle completed enclosed by this triangle.
   * @param tri a Group or an Iterable<Pt> representing a triangle
   * @param center Optional parameter if the incenter is already known. Otherwise, leave it empty and the incenter will be calculated
   */
  static incircle( tri:PtIterable, center?:Pt ):Group {
    let _pts = Util.iterToArray( tri );
    let c = ( center ) ? center : Triangle.incenter( _pts );
    let area = Polygon.area( _pts );
    let perim = Polygon.perimeter( _pts, true );
    let r = 2 * area / perim.total;
    return Circle.fromCenter( c, r );
  }

  /**
   * Get circumcenter, which is the intersection point of its 3 perpendicular bisectors lines ( each of which divides a side in half and is perpendicular to the side).
   * @param tri a Group or an Iterable<Pt> representing a triangle
   * @returns the circumcenter as a Pt
   */
  static circumcenter( tri:PtIterable ):Pt {
    let _pts = Util.iterToArray( tri );
    let md = Triangle.medial( _pts );
    let a = [md[0], Geom.perpendicular( _pts[0].$subtract( md[0] ) ).p1.$add( md[0] )];
    let b = [md[1], Geom.perpendicular( _pts[1].$subtract( md[1] ) ).p1.$add( md[1] )];
    return Line.intersectRay2D( a, b );
  } 

  /**
   * Get circumcenter, which is the intersection point of its 3 perpendicular bisectors lines ( each of which divides a side in half and is perpendicular to the side).
   * @param tri a Group or an Iterable<Pt> representing a triangle
   * @param center Optional parameter if the circumcenter is already known. Otherwise, leave it empty and the circumcenter will be calculated 
   */
  static circumcircle( tri:PtIterable, center?:Pt ):Group {
    let _pts = Util.iterToArray( tri );
    let c = ( center ) ? center : Triangle.circumcenter( _pts );
    let r = _pts[0].$subtract( c ).magnitude();
    return Circle.fromCenter( c, r );
  }
}



/**
 * Polygon class provides static functions to create and operate on polygons. A polygon is usually represented as a Group of 3 or more Pts.
 * You can use the static functions as-is, or apply the [`Group.op`](#link) or [`Pt.op`](#link) to enable functional programming.
 * See [Op guide](../guide/Op-0400.html) for details.
 */
export class Polygon {

  /**
   * Get the centroid of a polygon, which is the average of all its points.
   * @param pts a Group or an Iterable<PtLike> representing a polygon
   */
  static centroid( pts:PtLikeIterable ):Pt {
    return Geom.centroid( pts );
  }


  /**
   * Create a rectangular polygon. Same as creating a Rectangle and then getting its corners via [`Rectangle.corners`](#link).
   * @param center center point of the rectangle
   * @param widthOrSize width as number, or a Pt representing the size of the rectangle
   * @param height optional height
   */
  static rectangle( center:PtLike, widthOrSize:number | PtLike, height?: number ):Group {
    return Rectangle.corners( Rectangle.fromCenter( center, widthOrSize, height ) );
  }


  /**
   * Create a regular polygon.
   * @param center The center position of the polygon
   * @param radius The radius, ie, a length from the center position to one of the polygon's corners.
   * @param sides Number of sides
   */
  static fromCenter( center:PtLike, radius:number, sides:number ) {
    let g = new Group();
    for ( let i = 0; i < sides; i++ ) {
      let ang = Math.PI * 2 * i / sides;
      g.push( new Pt( Math.cos( ang ) * radius, Math.sin( ang ) * radius ).add( center ) );
    }
    return g;
  }


  /**
   * Given a polygon, get one edge using an index.
   * @param pts a Group or an Iterable<PtLike> representing a polygon
   * @param index index of a Pt in the Group
   */
  static lineAt( pts:PtLikeIterable, index:number ) {
    let _pts = Util.iterToArray( pts );
    if ( index < 0 || index >= _pts.length ) throw new Error( "index out of the Polygon's range" );
    return new Group( _pts[index], ( index === _pts.length - 1 ) ? _pts[0] : _pts[index + 1] );
  }

  /**
   * Get the line segments in this polygon.
   * @param poly a Group or an Iterable<Pt>
   * @param closePath a boolean to specify whether the polygon should be closed (ie, whether the final segment should be counted).
   * @returns an array of Groups which has 2 Pts in each group
   */
  static lines( poly:PtIterable, closePath:boolean = true ):Group[] {
    let _pts = Util.iterToArray( poly );
    if ( _pts.length < 2 ) return _errorLength( new Group(), 2 );
    let sp = Util.split( _pts, 2, 1 );
    if ( closePath ) sp.push( new Group( _pts[_pts.length - 1], _pts[0] ) );
    return sp.map( ( g ) => g as Group );
  }

  /**
   * Get a new polygon group that is derived from midpoints in this polygon.
   * @param poly a Group or an Iterable<Pt>
   * @param closePath a boolean to specify whether the polygon should be closed (ie, whether the final segment should be counted).
   * @param t a value between 0 to 1 for interpolation. Default to 0.5 which will get the middle point.
   */
  static midpoints( poly:PtIterable, closePath:boolean = false, t:number = 0.5 ):Group {
    let sides = Polygon.lines( poly, closePath );
    let mids = sides.map( ( s ) => Geom.interpolate( s[0], s[1], t ) );
    return mids as Group;
  }

  /**
   * Given a Pt in the polygon group, the adjacent sides are the two sides which the Pt touches.
   * @param poly a Group or an Iterable<Pt>
   * @param index the target Pt
   * @param closePath a boolean to specify whether the polygon should be closed (ie, whether the final segment should be counted).
   */
  static adjacentSides( poly:PtIterable, index:number, closePath:boolean = false ):Group[] {
    let _pts = Util.iterToArray( poly );
    if ( _pts.length < 2 ) return _errorLength( new Group(), 2 );
    if ( index < 0 || index >= _pts.length ) return _errorOutofBound( new Group(), index );

    let gs = [];
    let left = index - 1;
    if ( closePath && left < 0 ) left = _pts.length - 1;
    if ( left >= 0 ) gs.push( new Group( _pts[index], _pts[left] ) );

    let right = index + 1;
    if ( closePath && right > _pts.length - 1 ) right = 0;
    if ( right <= _pts.length - 1 ) gs.push( new Group( _pts[index], _pts[right] ) );

    return gs;
  }


  /**
   * Get a bisector which is a line that split between two sides of a polygon equally. 
   * @param poly a Group or an Iterable<Pt>
   * @param index the Pt in the polygon to bisect from
   * @param closePath a boolean to specify whether the polygon should be closed (ie, whether the final segment should be counted).
   * @returns a bisector Pt that's a normalized unit vector
   */
  static bisector( poly:PtIterable, index:number ):Pt {
    let sides = Polygon.adjacentSides( poly, index, true );
    if ( sides.length >= 2 ) {
      let a = sides[0][1].$subtract( sides[0][0] ).unit();
      let b = sides[1][1].$subtract( sides[1][0] ).unit();
      return a.add( b ).divide( 2 ); 
    } else {
      return undefined;
    }
  }
  

  /**
   * Find the perimeter of this polygon, ie, the lengths of its sides.
   * @param poly a Group or an Iterable<Pt>
   * @param closePath a boolean to specify whether the polygon should be closed (ie, whether the final segment should be counted).
   * @returns an object with `total` length, and `segments` which is a Pt that stores each segment's length
   */
  static perimeter( poly:PtIterable, closePath:boolean = false ):{total:number, segments:Pt} {
    let lines = Polygon.lines( poly, closePath );
    let mag = 0;
    let p = Pt.make( lines.length, 0 );

    for ( let i = 0, len = lines.length; i < len; i++ ) {
      let m = Line.magnitude( lines[i] );
      mag += m;
      p[i] = m;
    }

    return {
      total: mag,
      segments: p
    };
  }

  
  /**
   * Find the area of a *convex* polygon.
   * @param pts a Group or an Iterable<PtLike> representing a polygon
   */
  static area( pts:PtLikeIterable ) {
    let _pts = Util.iterToArray( pts );
    if ( _pts.length < 3 ) return _errorLength( new Group(), 3 );
    // determinant
    let det = ( a, b ) => a[0] * b[1] - a[1] * b[0];

    let area = 0;
    for ( let i = 0, len = _pts.length; i < len; i++ ) {
      if ( i < _pts.length - 1 ) {
        area += det( _pts[i], _pts[i + 1] );
      } else {  
        area += det( _pts[i], _pts[0] );
      }
    }
    return Math.abs( area / 2 );
  }

  /**
   * Get a convex hull of a set of points, using Melkman's algorithm. ([Reference](http://geomalgorithms.com/a12-_hull-3.html)).
   * @param pts a Group or an Iterable<PtLike>
   * @param sorted a boolean value to indicate if the group is pre-sorted by x position. Default is false.
   * @returns a group of Pt that defines the convex hull polygon
   */
  static convexHull( pts:PtLikeIterable, sorted:boolean = false ): Group {
    let _pts = Util.iterToArray( pts );
    if ( _pts.length < 3 ) return _errorLength( new Group(), 3 );

    if ( !sorted ) {
      _pts = _pts.slice();
      _pts.sort( ( a,b ) => a[0] - b[0] );
    } 

    // check if is on left of ray a-b
    let left = ( a, b, c ) => {
      return ( b[0] - a[0] ) * ( c[1] - a[1] ) - ( c[0] - a[0] ) * ( b[1] - a[1] ) > 0;
    };
    
    // double end queue
    let dq = [];
    let bot = _pts.length - 2;
    let top = bot + 3;
    dq[bot] = _pts[2];
    dq[top] = _pts[2];

    // first 3 pt as counter-clockwise triangle
    if ( left( _pts[0], _pts[1], _pts[2] ) ) {
      dq[bot + 1] = _pts[0];
      dq[bot + 2] = _pts[1];
    } else {
      dq[bot + 1] = _pts[1];
      dq[bot + 2] = _pts[0];
    }

    // remaining pts
    for ( let i = 3, len = _pts.length; i < len; i++ ) {
      let pt = _pts[i];
      
      // if inside the hull
      if ( left( dq[bot], dq[bot + 1], pt ) && left( dq[top - 1], dq[top], pt ) ) {
        continue;
      }

      // rightmost tangent
      while ( !left( dq[bot], dq[bot + 1], pt ) ) { bot += 1; }
      bot -= 1;
      dq[bot] = pt;
      
      // leftmost tangent
      while ( !left( dq[top - 1], dq[top], pt ) ) { top -= 1; }
      top += 1;
      dq[top] = pt;
    }

    let hull = new Group();
    for ( let h = 0; h < ( top - bot ); h++ ) {
      hull.push( dq[bot + h] );
    }

    return hull;

  }


  /**
   * Given a point in the polygon as an origin, get an array of lines that connect all the remaining points to the origin point.
   * @param poly a Group or an Iterable<Pt> representing a polygon
   * @param originIndex the origin point's index in the polygon
   * @returns an array of Groups of line segments
   */
  static network( poly:PtIterable, originIndex:number = 0 ):Group[] {
    let _pts = Util.iterToArray( poly );
    let g = [];
    for ( let i = 0, len = _pts.length; i < len; i++ ) {
      if ( i != originIndex ) g.push( new Group( _pts[originIndex], _pts[i] ) );
    }
    return g;
  }


  /**
   * Given a target Pt, find a Pt in the polygon's corners that's nearest to it.
   * @param poly a Group or an Iterable<Pt>
   * @param pt Pt to check
   * @returns an index in the pts indicating the nearest Pt, or -1 if none found
   */
  static nearestPt( poly:PtIterable, pt:PtLike ):number {
    let _near = Number.MAX_VALUE;
    let _item = -1;
    let i = 0;
    for ( let p of poly ) {
      let d = p.$subtract( pt ).magnitudeSq();
      if ( d < _near ) {
        _near = d;
        _item = i;
      }
      i++;
    }
    return _item;
  }


  /**
   * Project axis (eg, for use in Separation Axis Theorem).
   * @param poly a Group or an Iterable<Pt>
   * @param unitAxis unit axis for calculating dot product
   */
  static projectAxis( poly:PtIterable, unitAxis:Pt ):Pt {
    let _poly = Util.iterToArray( poly );
    let dot = unitAxis.dot( _poly[0] );
    let d = new Pt( dot, dot );
    for ( let n = 1, len = _poly.length; n < len; n++ ) {
      dot = unitAxis.dot( _poly[n] );
      d = new Pt( Math.min( dot, d[0] ), Math.max( dot, d[1] ) );
    }
    return d;
  }


  /**
   * Check overlap distance from projected axis.
   * @param poly1 a Group or an Iterable<Pt> representing the first polygon
   * @param poly2 a Group or an Iterable<Pt> representing the second polygon
   * @param unitAxis unit axis
   */
  protected static _axisOverlap( poly1:PtIterable, poly2:PtIterable, unitAxis:Pt ) {
    let pa = Polygon.projectAxis( poly1, unitAxis );
    let pb = Polygon.projectAxis( poly2, unitAxis );
    return ( pa[0] < pb[0] ) ? pb[0] - pa[1] : pa[0] - pb[1];
  }


  /**
   * Check if a Pt is inside a convex polygon.
   * @param poly a Group or an Iterable<PtLike> representing a convex polygon
   * @param pt the Pt to check
   */
  static hasIntersectPoint( poly:PtLikeIterable, pt:PtLike ):boolean {
    let _poly = Util.iterToArray( poly );
    let c = false;
    for ( let i = 0, len = _poly.length; i < len; i++ ) {
      let ln = Polygon.lineAt( _poly, i );
      if ( ( ( ln[0][1] > pt[1] ) != ( ln[1][1] > pt[1] ) ) &&
          ( pt[0] < ( ln[1][0] - ln[0][0] ) * ( pt[1] - ln[0][1] ) / ( ln[1][1] - ln[0][1] ) + ln[0][0] ) ) {
        c = !c;
      }
    }
    return c;

  }


  /**
   * Check if a convex polygon and a circle has intersections using Separating Axis Theorem. 
   * @param poly a Group or an Iterable<Pt> representing a convex polygon
   * @param circle a Group or an Iterable<Pt> representing a circle
   * @returns an `IntersectContext` object that stores the intersection info, or undefined if there's no intersection
   */
  static hasIntersectCircle( poly:PtIterable, circle:PtIterable ):IntersectContext {
    let _poly = Util.iterToArray( poly );
    let _circle = Util.iterToArray( circle );

    let info = {
      which: -1, // 0 if vertex is on second polygon and edge is on first polygon. 1 if the other way round.
      dist: 0,
      normal: null, // perpendicular to edge
      edge: null, // the edge where the intersection occur
      vertex: null, // the vertex on a polygon that has intersected
    };

    let c = _circle[0];
    let r = _circle[1][0];

    let minDist = Number.MAX_SAFE_INTEGER;
  
    for ( let i = 0, len = _poly.length; i < len; i++ ) {
      let edge = Polygon.lineAt( _poly, i );
      let axis = new Pt( edge[0].y - edge[1].y, edge[1].x - edge[0].x ).unit();
      let poly2 = new Group( c.$add( axis.$multiply( r ) ), c.$subtract( axis.$multiply( r ) ) );
    
      let dist = Polygon._axisOverlap( _poly, poly2, axis );

      if ( dist > 0 ) {
        return null;
      } else if ( Math.abs( dist ) < minDist ) {
        // Fix edge case and make sure the circle is intersecting. To be improved.
        let check = Rectangle.withinBound( edge, Line.perpendicularFromPt( edge, c ) ) || Circle.intersectLine2D( circle, edge ).length > 0;

        if ( check ) {
          info.edge = edge;
          info.normal = axis;
          minDist = Math.abs( dist );
          info.which = i;
        }
      }

    }
    
    if ( !info.edge ) return null;

    // direction
    let dir = c.$subtract( Polygon.centroid( _poly ) ).dot( info.normal );
    if ( dir < 0 ) info.normal.multiply( -1 );

    info.dist = minDist;
    info.vertex = c;

    return info;

  }


  /**
   * Check if two convex polygons have intersections using Separating Axis Theorem. 
   * @param poly1 a Group or an Iterable<Pt> representing a convex polygon
   * @param poly2 a Group or an Iterable<Pt> representing another convex polygon
   * @return an `IntersectContext` object that stores the intersection info, or undefined if there's no intersection
   */
  static hasIntersectPolygon( poly1:PtIterable, poly2:PtIterable ):IntersectContext {    
    // Reference: https://www.gamedev.net/articles/programming/math-and-physics/a-verlet-based-approach-for-2d-game-physics-r2714/
    let _poly1 = Util.iterToArray( poly1 );
    let _poly2 = Util.iterToArray( poly2 );

    let info = {
      which: -1, // 0 if vertex is on second polygon and edge is on first polygon. 1 if the other way round.
      dist: 0,
      normal: new Pt(), // perpendicular to edge
      edge: new Group(), // the edge where the intersection occur
      vertex: new Pt() // the vertex on a polygon that has intersected
    };

    let minDist = Number.MAX_SAFE_INTEGER;


    for ( let i = 0, plen = ( _poly1.length + _poly2.length ); i < plen; i++ ) {
      
      let edge = ( i < _poly1.length ) ? Polygon.lineAt( _poly1, i ) : Polygon.lineAt( _poly2, i - _poly1.length );
      let axis = new Pt( edge[0].y - edge[1].y, edge[1].x - edge[0].x ).unit(); // unit of a perpendicular vector
      let dist = Polygon._axisOverlap( _poly1, _poly2, axis );

      if ( dist > 0 ) {
        return null;
      } else if ( Math.abs( dist ) < minDist ) {
        // store intersected edge and a normal vector
        info.edge = edge;
        info.normal = axis;
        minDist = Math.abs( dist );
        info.which = ( i < _poly1.length ) ? 0 : 1;
      }
    } 

    info.dist = minDist;

    // flip if neded to make sure vertex and edge are in corresponding polygons
    let b1 = ( info.which === 0 ) ? _poly2 : _poly1;
    let b2 = ( info.which === 0 ) ? _poly1 : _poly2;
    
    let c1 = Polygon.centroid( b1 );
    let c2 = Polygon.centroid( b2 );

    // direction
    let dir = c1.$subtract( c2 ).dot( info.normal );
    if ( dir < 0 ) info.normal.multiply( -1 );

    // find vertex at smallest distance
    let smallest = Number.MAX_SAFE_INTEGER; 
    for ( let i = 0, len = b1.length; i < len; i++ ) {
      let d = info.normal.dot( b1[i].$subtract( c2 ) );
      if ( d < smallest ) {
        smallest = d;
        info.vertex = b1[i];
      }
    }

    return info;
  }


  /**
   * Find intersection points of 2 polygons by checking every side of both polygons. Performance may be slow for complex polygons.
   * @param poly1 a Group or an Iterable<Pt> representing a polygon 
   * @param poly2 a Group or an Iterable<Pt> representing another polygon
   */
  static intersectPolygon2D( poly1:PtIterable, poly2:PtIterable ):Group {
    let _poly1 = Util.iterToArray( poly1 );
    let _poly2 = Util.iterToArray( poly2 );

    let lp = Polygon.lines( _poly1 );
    let g = [];
    for ( let i = 0, len = lp.length; i < len; i++ ) {
      let ins = Line.intersectPolygon2D( lp[i], _poly2, false );
      if ( ins ) g.push( ins );
    }
    return Util.flatten( g, true ) as Group;
  }


  /**
   * Get a bounding box for each polygon group, as well as a union bounding-box for all groups.
   * @param polys an Array/Iterable of (Groups or Iterables<Pt>)
   */
  static toRects( polys:Iterable<PtIterable> ):Group[] {
    let boxes = [];
    for ( let g of polys ) {
      boxes.push( Geom.boundingBox( g ) );
    }

    let merged = Util.flatten( boxes, false );
    boxes.unshift( Geom.boundingBox( merged ) );
    return boxes;
  }

}



/**
 * Curve class provides static functions to interpolate curves. A curve is usually represented as a Group of 3 or more control points.
 * You can use the static functions as-is, or apply the [`Group.op`](#link) or [`Pt.op`](#link) to enable functional programming.
 * See [Op guide](../guide/Op-0400.html) for details.
 */
export class Curve {

  /**
   * Get a precalculated coefficients per step. 
   * @param steps number of steps
   */
  static getSteps( steps:number ):Group {
    let ts = new Group();
    for ( let i = 0; i <= steps; i++ ) {
      let t = i / steps;
      ts.push( new Pt( t * t * t, t * t, t, 1 ) );
    }
    return ts;
  }

  /**
   * Given an index for the starting position in a Pt group, get the control and/or end points of a curve segment.
   * @param pts a Group or an Iterable<PtLike>
   * @param index start index in `pts` array. Default is 0.
   * @param copyStart an optional boolean value to indicate if the start index should be used twice. Default is false.
   * @returns a group of 4 Pts
   */
  static controlPoints( pts:PtLikeIterable, index:number = 0, copyStart:boolean = false ):Group {
    let _pts = Util.iterToArray( pts );

    if ( index > _pts.length - 1 ) return new Group();
    let _index = ( i ) => ( i < _pts.length - 1 ) ? i : _pts.length - 1;

    let p0 = _pts[index];
    index = ( copyStart ) ? index : index + 1;

    // get points based on index
    return new Group(
      p0, _pts[ _index( index++ ) ],
      _pts[ _index( index++ ) ], _pts[ _index( index++ ) ]
    );
  }

  /**
   * Calulcate weighted sum to get the interpolated points.
   * @param ctrls anchors
   * @param params parameters
   */
  static _calcPt( ctrls:GroupLike, params:PtLike ):Pt {
    let x = ctrls.reduce( ( a, c, i ) => a + c.x * params[i], 0 );
    let y = ctrls.reduce( ( a, c, i ) => a + c.y * params[i], 0 );
    if ( ctrls[0].length > 2 ) {
      let z = ctrls.reduce( ( a, c, i ) => a + c.z * params[i], 0 );
      return new Pt( x, y, z );
    }
    return new Pt( x, y );
  }

  /**
   * Create a Catmull-Rom curve. Catmull-Rom is a kind of smooth-looking Cardinal curve.
   * @param pts a Group or an Iterable<PtLike>
   * @param steps the number of line segments per curve. Defaults to 10 steps
   * @returns a curve as a group of interpolated Pt
   */
  static catmullRom( pts:PtLikeIterable, steps:number = 10 ):Group {
    let _pts = Util.iterToArray( pts );
    if ( _pts.length < 2 ) return new Group();

    let ps = new Group();
    let ts = Curve.getSteps( steps );

    // use first point twice
    let c = Curve.controlPoints( _pts, 0, true );
    for ( let i = 0; i <= steps; i++ ) {
      ps.push( Curve.catmullRomStep( ts[i], c ) );
    }

    let k = 0;
    while ( k < _pts.length - 2 ) {
      let cp = Curve.controlPoints( _pts, k );
      if ( cp.length > 0 ) {
        for ( let i = 0; i <= steps; i++ ) {
          ps.push( Curve.catmullRomStep( ts[i], cp ) );
        }
        k++;
      }
    }

    return ps;
  }


  /**
   * Interpolate to get a point on Catmull-Rom curve.
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
      new Pt( -0.5, 1, -0.5, 0 ),
      new Pt( 1.5, -2.5, 0, 1 ),
      new Pt( -1.5, 2, 0.5, 0 ),
      new Pt( 0.5, -0.5, 0, 0 )
    );

    return Curve._calcPt( ctrls, Mat.multiply( [step], m, true )[0] );
  }

  /**
   * Create a Cardinal curve.
   * @param pts a Group or an Iterable<PtLike>
   * @param steps the number of line segments per curve. Defaults to 10 steps.
   * @param tension optional value between 0 to 1 to specify a "tension". Default to 0.5 which is the tension for Catmull-Rom curve.
   * @returns a curve as a group of interpolated Pt
   */
  static cardinal( pts:PtLikeIterable, steps:number = 10, tension = 0.5 ):Group {
    let _pts = Util.iterToArray( pts );
    if ( _pts.length < 2 ) return new Group();

    let ps = new Group();
    let ts = Curve.getSteps( steps );

    // use first point twice
    let c = Curve.controlPoints( _pts, 0, true );
    for ( let i = 0; i <= steps; i++ ) {
      ps.push( Curve.cardinalStep( ts[i], c, tension ) );
    }

    let k = 0;
    while ( k < _pts.length - 2 ) {
      let cp = Curve.controlPoints( _pts, k );
      if ( cp.length > 0 ) {
        for ( let i = 0; i <= steps; i++ ) {
          ps.push( Curve.cardinalStep( ts[i], cp, tension ) );
        }
        k++;
      }
    }

    return ps;
  }

  /**
   * Interpolate to get a point on Cardinal curve.
   * @param step the coefficients [t*t*t, t*t, t, 1]
   * @param ctrls a group of anchor Pts
   * @param tension optional value between 0 to 1 to specify a "tension". Default to 0.5 which is the tension for Catmull-Rom curve
   * @return an interpolated Pt on the curve
   */
  static cardinalStep( step:Pt, ctrls:GroupLike, tension:number = 0.5 ):Pt {
    /*
    * Basis Matrix (http://algorithmist.wordpress.com/2009/10/06/cardinal-splines-part-4/)
    * [ -s  2-s  s-2   s ]
    * [ 2s  s-3  3-2s -s ]
    * [ -s   0    s    0 ]
    * [  0   1    0    0 ]
    */

    let m = new Group(
      new Pt( -1,  2, -1, 0 ),
      new Pt( -1,  1,  0, 0 ),
      new Pt(  1, -2,  1, 0 ),
      new Pt(  1, -1,  0, 0 )
    );

    let h = Mat.multiply( [step], m, true )[0].multiply( tension );
    let h2 = ( 2 * step[0] - 3 * step[1] + 1 );
    let h3 = -2 * step[0] + 3 * step[1];

    let pt = Curve._calcPt( ctrls, h );

    pt.x += h2 * ctrls[1].x + h3 * ctrls[2].x;
    pt.y += h2 * ctrls[1].y + h3 * ctrls[2].y;
    if ( pt.length > 2 ) pt.z += h2 * ctrls[1].z + h3 * ctrls[2].z;

    return pt;
  }


  /**
   * Create a Bezier curve. In a cubic bezier curve, the first and 4th anchors are end-points, and 2nd and 3rd anchors are control-points.
   * @param pts a group of anchor Pt
   * @param steps the number of line segments per curve. Defaults to 10 steps.
   * @returns a curve as a group of interpolated Pt
   */
  static bezier( pts:GroupLike, steps:number = 10 ) {
    let _pts = Util.iterToArray( pts );
    if ( _pts.length < 4 ) return new Group();

    let ps = new Group();
    let ts = Curve.getSteps( steps );

    let k = 0;
    while ( k < _pts.length - 3 ) {
      let c = Curve.controlPoints( _pts, k );
      if ( c.length > 0 ) {
        for ( let i = 0; i <= steps; i++ ) {
          ps.push( Curve.bezierStep( ts[i], c ) );
        }

        // go to the next set of point, but assume current end pt is next start pt
        k += 3;
      }
    }

    return ps;
  }

  /**
   * Interpolate to get a point on a cubic Bezier curve.
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
      new Pt( -1,  3, -3, 1 ),
      new Pt(  3, -6,  3, 0 ),
      new Pt( -3,  3,  0, 0 ),
      new Pt(  1,  0,  0, 0 )
    );

    return Curve._calcPt( ctrls, Mat.multiply( [step], m, true )[0] );
  }

  /**
   * Create a basis spline (NURBS) curve.
   * @param pts a group of anchor Pt
   * @param steps the number of line segments per curve. Defaults to 10 steps.
   * @param tension optional value between 0 to n to specify a "tension". Default is 1 which is the usual tension.
   * @returns a curve as a group of interpolated Pt
   */
  static bspline( pts:GroupLike, steps:number = 10, tension:number = 1 ):Group {
    let _pts = Util.iterToArray( pts );
    if ( _pts.length < 2 ) return new Group();

    let ps = new Group();
    let ts = Curve.getSteps( steps );


    let k = 0;
    while ( k < _pts.length - 3 ) {
      let c = Curve.controlPoints( _pts, k );
      if ( c.length > 0 ) {
        if ( tension !== 1 ) {
          for ( let i = 0; i <= steps; i++ ) {
            ps.push( Curve.bsplineTensionStep( ts[i], c, tension ) );
          }
        } else {
          for ( let i = 0; i <= steps; i++ ) {
            ps.push( Curve.bsplineStep( ts[i], c ) );
          }
        }
        k++;
      }
    }

    return ps;
  }

  /**
   * Interpolate to get a point on a basis spline curve.
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
      new Pt( -0.16666666666666666,  0.5, -0.5, 0.16666666666666666 ),
      new Pt(  0.5, -1,  0, 0.6666666666666666 ),
      new Pt( -0.5,  0.5,  0.5, 0.16666666666666666 ),
      new Pt(  0.16666666666666666,  0,  0, 0 )
    );

    return Curve._calcPt( ctrls, Mat.multiply( [step], m, true )[0] );
  }

  /**
   * Interpolate to get a point on a basis spline curve with tension.
   * @param step the coefficients [t*t*t, t*t, t, 1]
   * @param ctrls a group of anchor Pts
   * @param tension optional value between 0 to n to specify a "tension". Default to 1 which is the usual tension.
   * @return an interpolated Pt on the curve
   */  
  static bsplineTensionStep( step:Pt, ctrls:GroupLike, tension:number = 1 ):Pt {
    /*
    * Basis matrix:
    * [ -1/6a, 2 - 1.5a, 1.5a - 2, 1/6a ]
    * [ 0.5a,  2a-3,     3-2.5a    0 ]
    * [ -0.5a, 0,        0.5a,     0 ]
    * [ 1/6a,  1 - 1/3a, 1/6a,     0 ]
    */

    let m = new Group(
      new Pt( -0.16666666666666666,  0.5, -0.5, 0.16666666666666666 ),
      new Pt(  -1.5, 2,  0, -0.3333333333333333 ),
      new Pt( 1.5,  -2.5,  0.5, 0.16666666666666666 ),
      new Pt(  0.16666666666666666,  0,  0, 0 )
    );

    let h = Mat.multiply( [step], m, true )[0].multiply( tension );
    let h2 = ( 2 * step[0] - 3 * step[1] + 1 );
    let h3 = -2 * step[0] + 3 * step[1];

    let pt = Curve._calcPt( ctrls, h );

    pt.x += h2 * ctrls[1].x + h3 * ctrls[2].x;
    pt.y += h2 * ctrls[1].y + h3 * ctrls[2].y;
    if ( pt.length > 2 ) pt.z += h2 * ctrls[1].z + h3 * ctrls[2].z;

    return pt;
  } 

}