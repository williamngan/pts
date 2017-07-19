// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan)


import {Pt, Group, PtLike} from "./Pt";
import {Bound} from "./Bound";

export class Create {
  
  static distributeRandom( bound:Bound, count:number, dimensions=2 ):Group {
    let pts = new Group();
    for (let i=0; i<count; i++) {
      let p = [ bound.x + Math.random()*bound.width ];
      if (dimensions>1) p.push( bound.y + Math.random()*bound.height, );
      if (dimensions>2) p.push( bound.z + Math.random()*bound.depth );
      pts.push( new Pt( p ) );
    }
    return pts;
  }
  
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
  
}