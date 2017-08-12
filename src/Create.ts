// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan)


import {Pt, Group, PtLike} from "./Pt";
import {Bound} from "./Bound";
import {Const} from "./Util";


/**
 * The `Create` class provides various convenient functions to create structures or shapes. 
 */
export class Create {
  

  /**
   * Create a set of random points inside a bounday
   * @param bound the rectangular boundary
   * @param count number of random points to create
   * @param dimensions number of dimensions in each point
   */
  static distributeRandom( bound:Bound, count:number, dimensions:number=2 ):Group {
    let pts = new Group();
    for (let i=0; i<count; i++) {
      let p = [ bound.x + Math.random()*bound.width ];
      if (dimensions>1) p.push( bound.y + Math.random()*bound.height, );
      if (dimensions>2) p.push( bound.z + Math.random()*bound.depth );
      pts.push( new Pt( p ) );
    }
    return pts;
  }
  

  /**
   * Create an evenly distributed set of points (like a grid of points) inside a boundary.
   * @param bound the rectangular boundary
   * @param columns number of columns
   * @param rows number of rows
   * @param orientation a Pt or number array to specify where the point should be inside a cell. Default is [0.5, 0.5] which places the point in the middle.
   * @returns a Group of Pts
   */
  static gridPts( bound:Bound, columns:number, rows:number, orientation:PtLike=[0.5, 0.5] ):Group {
    let unit = bound.size.$subtract(1).$divide( columns, rows );
    let offset = unit.$multiply( orientation );
    let g = new Group();
    for (let c=0; c<columns; c++) {
      for (let r=0; r<rows; r++) {
        g.push( bound.topLeft.$add( unit.$multiply(c, r) ).add( offset ) );
      }
    }
    return g;
    
  }

  /**
   * Create a grid inside a boundary
   * @param bound the rectangular boundary
   * @param columns number of columns
   * @param rows number of rows
   * @returns an array of Groups, where each group represents a rectangular cell
   */
  static gridCells( bound:Bound, columns:number, rows:number  ):Group[] {
    let unit = bound.size.$subtract(1).divide( columns, rows ); // subtract 1 to fill whole border of rectangles
    let g = [];
    for (let c=0; c<columns; c++) {
      for (let r=0; r<rows; r++) {
        g.push( new Group(
          bound.topLeft.$add( unit.$multiply(c, r) ),
          bound.topLeft.$add( unit.$multiply(c, r).add( unit ) )
        ));
      }
    }
    return g;
  }


  /**
   * Create a set of Pts around a circular path
   * @param center circle center
   * @param radius circle radius
   * @param count number of Pts to create
   */
  static radialPts( center:PtLike, radius:number, count:number ):Group {
    let g = new Group();
    let a = Const.two_pi/count;
    for (let i=0; i<count; i++) {
      g.push( new Pt(center).toAngle( a*i - Const.half_pi, radius, true ) );
    }
    return g;
  }
  
}