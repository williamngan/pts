// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan)


import {Pt, Group, PtLike, GroupLike} from "./Pt";
import {Line} from "./Op";
import {Bound} from "./Bound";
import {Const} from "./Util";
import {Num} from "./Num";
import {Vec} from "./LinearAlgebra";


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
   * Create a set of points that distribute evenly on a line
   * @param line a Group representing a line
   * @param count number of points to create
   */
  static distributeLinear( line:GroupLike, count:number ):Group {
    let ln = Line.subpoints( line, count-2 );
    ln.unshift( line[0] );
    ln.push( line[line.length-1] );
    return ln;
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
    if (columns === 0 || rows === 0) throw new Error("grid columns and rows cannot be 0");
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
    if (columns === 0 || rows === 0) throw new Error("grid columns and rows cannot be 0");
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


  /**
   * Given a group of Pts, return a new group of `Noise` Pts.
   * @param pts a Group or an array of Pts
   * @param dx small increment value in x dimension
   * @param dy small increment value in y dimension
   * @param rows Optional row count to generate 2D noise
   * @param columns Optional column count to generate 2D noise
   */
  static noisePts( pts:GroupLike, dx=0.01, dy=0.01, rows=0, columns=0 ):Group {
    let seed = Math.random();
    let g = new Group();
    for (let i=0, len=pts.length; i<len; i++) {
      let np = new Noise( pts[i] );
      let r = (rows && rows > 0) ? Math.floor(i/rows) : i;
      let c = (columns && columns > 0) ? i%columns : i;
      np.initNoise( dx*c, dy*r );
      np.seed( seed );
      g.push( np );
    }
    return g;
  }
  
}

/**
 * Perlin noise gradient indices
 */
const grad3 = [
  [1,1, 0], [-1,1, 0], [1,-1,0], [-1,-1,0],
  [1,0, 1], [-1, 0, 1], [1,0,-1], [-1,0,-1],
  [0, 1,1], [ 0,-1,1], [0,1,-1], [ 0,-1,-1]
];


/**
 * Perlin noise permutation table
 */ 
const permTable = [151,160,137,91,90,15,
  131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
  190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
  88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,
  77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
  102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,
  135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,
  5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
  223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,
  129,22,39,253,9,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,
  251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
  49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,
  138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180
];


/**
 * A class to generate Perlin noise. Currently it implements a basic 2D noise. More to follow.
 * Based on https://gist.github.com/banksean/304522
 */
export class Noise extends Pt {

  protected perm:number[] = [];
  private _n:Pt = new Pt(0.01, 0.01);

  /**
   * Create a Noise Pt that's capable of generating noise
   * @param args a list of numeric parameters, an array of numbers, or an object with {x,y,z,w} properties
   */
  constructor(...args) {
    super( ...args );

    // For easier index wrapping, double the permutation table length
    this.perm = permTable.concat( permTable );
  }


  /**
   * Set the initial noise values
   * @param args a list of numeric parameters, an array of numbers, or an object with {x,y,z,w} properties
   * @example `noise.initNoise( 0.01, 0.1 )`
   */
  initNoise( ...args ) {
    this._n = new Pt( ...args );
  }


  /**
   * Add a small increment to the noise values
   * @param x step in x dimension
   * @param y step in y dimension
   */
  step( x=0, y=0 ) {
    this._n.add( x, y );
  }

  /**
   * Specify a seed for this Noise
   * @param s seed value
   */
  seed( s ) {
    if (s > 0 && s < 1) s *= 65536;
    
    s = Math.floor(s);
    if (s < 256)s |= s << 8;

    for (let i=0; i<255; i++) {
      let v = (i & 1) ? permTable[i] ^ (s & 255) : permTable[i] ^ ((s>>8) & 255);
      this.perm[i] = this.perm[i + 256] = v;
    }
  }
  
  
  /**
   * Generate a 2D Perlin noise value
   */
  noise2D() {
  
    let i = Math.floor( this._n[0] ) % 255;
    let j = Math.floor( this._n[1] ) % 255;
    let x = (this._n[0] % 255) - i;
    let y = (this._n[1] % 255) - j;

    let n00 = Vec.dot(grad3[ (i+this.perm[j]) % 12 ], [x, y, 0] );
    let n01 = Vec.dot(grad3[ (i+this.perm[j+1]) % 12 ], [x, y-1, 0] );
    let n10 = Vec.dot(grad3[ (i+1+this.perm[j]) % 12 ], [x-1, y, 0] );
    let n11 = Vec.dot(grad3[ (i+1+this.perm[j+1]) % 12 ], [x-1, y-1, 0] );

    let _fade = (f) => f*f*f*(f*(f*6-15)+10);
    let tx = _fade(x);
    return Num.lerp( Num.lerp(n00, n10, tx), Num.lerp(n01, n11, tx), _fade(y) );
  }
  

}