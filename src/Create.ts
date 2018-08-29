/*! Source code licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */

import {Pt, Group, Bound} from "./Pt";
import {Line, Triangle} from "./Op";
import {Const} from "./Util";
import {Num, Geom} from "./Num";
import {Vec} from "./LinearAlgebra";
import {PtLike, GroupLike, DelaunayMesh, DelaunayShape} from "./Types";


/**
 * The `Create` class helps you create structures from sets of points. 
 */
export class Create {
  

  /**
   * Create a set of random points inside a bounday.
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
   * Create a set of points that distribute evenly on a line. Similar to [`Line.subpoints`](#link) but includes the end points.
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
    for (let r=0; r<rows; r++) {
      for (let c=0; c<columns; c++) {
        g.push( bound.topLeft.$add( unit.$multiply(c, r) ).add( offset ) );
      }
    }
    return g;
    
  }

  /**
   * Create a grid of cells inside a boundary, where each cell is defined by a group of 2 Pt.
   * @param bound the rectangular boundary
   * @param columns number of columns
   * @param rows number of rows
   * @returns an array of Groups, where each group represents a rectangular cell
   */
  static gridCells( bound:Bound, columns:number, rows:number  ):Group[] {
    if (columns === 0 || rows === 0) throw new Error("grid columns and rows cannot be 0");
    let unit = bound.size.$subtract(1).divide( columns, rows ); // subtract 1 to fill whole border of rectangles
    let g = [];
    for (let r=0; r<rows; r++) {
      for (let c=0; c<columns; c++) {
        g.push( new Group(
          bound.topLeft.$add( unit.$multiply(c, r) ),
          bound.topLeft.$add( unit.$multiply(c, r).add( unit ) )
        ));
      }
    }
    return g;
  }


  /**
   * Create a set of Pts around a circular path.
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


  /**
   * Create a Delaunay Group. Use the [`Delaunay.delaunay()`](#link) and [`Delaunay.voronoi()`](#link) functions in the returned group to generate tessellations.
   * @param pts a Group or an array of Pts
   * @returns an instance of the Delaunay class
   */
  static delaunay( pts:GroupLike ):Delaunay {
    return Delaunay.from( pts ) as Delaunay;
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
 * Noise is a subclass of Pt that generates Perlin noise. Current implementation supports basic 2D noise.
 * This implementation is based on this [gist](https://gist.github.com/banksean/304522).
 */
export class Noise extends Pt {

  protected perm:number[] = [];
  private _n:Pt = new Pt(0.01, 0.01);

  /**
   * Create a Noise Pt that can generate noise continuously. See a [Noise demo here](../demo/index.html?name=create.noisePts).
   * @param args a list of numeric parameters, an array of numbers, or an object with {x,y,z,w} properties
   */
  constructor(...args) {
    super( ...args );

    // For easier index wrapping, double the permutation table length
    this.perm = permTable.concat( permTable );
  }


  /**
   * Set the initial dimensional values of the noise.
   * @param args a list of numeric parameters, an array of numbers, or an object with {x,y,z,w} properties
   * @example `noise.initNoise( 0.01, 0.1 )`
   */
  initNoise( ...args ) {
    this._n = new Pt( ...args );
  }


  /**
   * Add a small increment to the noise values.
   * @param x step in x dimension
   * @param y step in y dimension
   */
  step( x=0, y=0 ) {
    this._n.add( x, y );
  }

  /**
   * Specify a seed for this Noise.
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
   * Generate a 2D Perlin noise value.
   */
  noise2D() {
  
    let i = Math.max(0, Math.floor( this._n[0] )) % 255;
    let j = Math.max(0, Math.floor( this._n[1] )) % 255;
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



/**
 * Delaunay is a [`Group`](#link) of Pts that generates Delaunay and Voronoi tessellations. The triangulation algorithm is ported from [Pt](https://github.com/williamngan/pt). 
 * Based on [Paul Bourke's algorithm](http://paulbourke.net/papers/triangulate/)
 * with reference to its [javascript implementation](https://github.com/ironwallaby/delaunay) by ironwallaby.
 */
export class Delaunay extends Group {

  private _mesh:DelaunayMesh = [];

  /**
   * Generate Delaunay triangles. This function also caches the mesh that is used to generate Voronoi tessellation in `voronoi()`. See a [Delaunay demo here](../demo/index.html?name=create.delaunay).
   * @param triangleOnly if true, returns an array of triangles in Groups, otherwise return the whole DelaunayShape
   * @returns an array of Groups or an array of DelaunayShapes `{i, j, k, triangle, circle}` which records the indices of the vertices, and the calculated triangles and circumcircles
   */
  delaunay( triangleOnly:boolean=true ):GroupLike[]|DelaunayShape[] {
    if (this.length < 3) return [];

    this._mesh = [];

    let n = this.length;

    // sort the points and store the sorted index
    let indices:number[] = [];
    for (let i=0; i<n; i++) indices[i] = i;
    indices.sort( (i,j) => this[j][0] - this[i][0] );

    // duplicate the points list and add super triangle's points to it
    let pts = this.slice();
    let st = this._superTriangle();
    pts = pts.concat( st );

    // arrays to store edge buffer and opened triangles
    let opened:DelaunayShape[] = [ this._circum( n, n+1, n+2, st) ];
    let closed:DelaunayShape[] = [];
    let tris:GroupLike[] = [];

    // Go through each point using the sorted indices
    for (let i=0, len=indices.length; i<len; i++) {
      let c = indices[i];
      let edges:number[] = [];
      let j = opened.length;
      if (!this._mesh[c]) this._mesh[c] = {};

      // Go through each opened triangles
      while (j--) {
        let circum:DelaunayShape = opened[j];
        let radius = circum.circle[1][0];
        let d = pts[c].$subtract( circum.circle[0] );

        // if point is to the right of circumcircle, add it to closed list and don't check again
        if (d[0] > 0 && d[0]*d[0] > radius*radius) {
          closed.push( circum );
          tris.push( circum.triangle );
          opened.splice(j, 1);
          continue;
        }

        // if it's outside the circumcircle, skip
        if ( d[0]*d[0] + d[1]*d[1] - radius*radius > Const.epsilon) {
          continue;
        }

        // otherwise it's inside the circumcircle, so we add to edge buffer and remove it from the opened list
        edges.push( circum.i, circum.j,    circum.j, circum.k,    circum.k, circum.i );
        opened.splice(j, 1);
      }

      // dedup edges
      Delaunay._dedupe( edges );

      // Go through the edge buffer and create a triangle for each edge
      j = edges.length;
      while (j > 1) {
        opened.push( this._circum( edges[--j], edges[--j], c, false, pts) );
      }

    }

    for (let i=0, len=opened.length; i<len; i++) {
      let o = opened[i];
      if (o.i < n && o.j < n && o.k < n) {
        closed.push( o );
        tris.push( o.triangle );
        this._cache( o );
      }
    }

    return (triangleOnly) ? tris : closed;
  }


  /**
   * Generate Voronoi cells. `delaunay()` must be called before calling this function. See a [Voronoi demo here](../demo/index.html?name=create.delaunay).
   * @returns an array of Groups, each of which represents a Voronoi cell
   */
  voronoi():Group[] {
    let vs = [];
    let n = this._mesh;
    for (let i=0, len=n.length; i<len; i++) {
      vs.push( this.neighborPts( i, true ) );
    }
    return vs;
  }


  /**
   * Get the cached mesh. The mesh is an array of objects, each of which representing the enclosing triangles around a Pt in this Delaunay group.
   * @return an array of objects that store a series of DelaunayShapes
   */
  mesh():DelaunayMesh {
    return this._mesh;
  }


  /**
   * Given an index of a Pt in this Delaunay Group, returns its neighboring Pts in the network.
   * @param i index of a Pt
   * @param sort if true, sort the neighbors so that their edges will form a polygon
   * @returns an array of Pts
   */
  neighborPts( i:number, sort=false ):GroupLike {
    let cs = new Group();
    let n = this._mesh;
    for (let k in n[i]) {
      if (n[i].hasOwnProperty(k)) cs.push( n[i][k].circle[0] );
    }
    return (sort) ? Geom.sortEdges( cs ) : cs;
  }


  /**
   * Given an index of a Pt in this Delaunay Group, returns its neighboring DelaunayShapes.
   * @param i index of a Pt
   * @returns an array of DelaunayShapes `{i, j, k, triangle, circle}`
   */
  neighbors( i:number ):DelaunayShape[] {
    let cs = [];
    let n = this._mesh;
    for (let k in n[i]) {
      if (n[i].hasOwnProperty(k)) cs.push( n[i][k] );
    }
    return cs;
  }


  /**
   * Record a DelaunayShape in the mesh.
   * @param o DelaunayShape instance
   */
  protected _cache( o ):void {
    this._mesh[o.i][`${Math.min(o.j,o.k)}-${Math.max(o.j,o.k)}`] = o;
    this._mesh[o.j][`${Math.min(o.i,o.k)}-${Math.max(o.i,o.k)}`] = o;
    this._mesh[o.k][`${Math.min(o.i,o.j)}-${Math.max(o.i,o.j)}`] = o;
  }


  /**
   * Get the initial "super triangle" that contains all the points in this set.
   * @returns a Group representing a triangle
   */
  protected _superTriangle():Group {
    let minPt = this[0];
    let maxPt = this[0];
    for (let i=1, len=this.length; i<len; i++) {
      minPt = minPt.$min( this[i] );
      maxPt = maxPt.$max( this[i] );
    }

    let d = maxPt.$subtract( minPt );
    let mid = minPt.$add( maxPt ).divide(2);
    let dmax = Math.max( d[0], d[1] );

    return new Group( mid.$subtract(20*dmax, dmax), mid.$add( 0, 20*dmax), mid.$add(20*dmax, -dmax) );
  }


  /**
   * Get a triangle from 3 points in a list of points
   * @param i index 1
   * @param j index 2
   * @param k index 3
   * @param pts a Group of Pts
   */
  protected _triangle( i:number, j:number, k:number, pts:GroupLike=this):Group {
    return new Group( pts[i], pts[j], pts[k] );
  }


  /**
   * Get a circumcircle and triangle from 3 points in a list of points
   * @param i index 1
   * @param j index 2
   * @param k index 3
   * @param tri a Group representing a triangle, or `false` to create it from indices
   * @param pts a Group of Pts
   */
  protected _circum(i:number, j:number, k:number, tri:GroupLike|false, pts:GroupLike=this):DelaunayShape {
    let t = tri || this._triangle( i, j, k, pts );
    return {
      i: i,
      j: j,
      k: k,
      triangle: t,
      circle: Triangle.circumcircle( t )
    };
  }


  /**
   * Dedupe the edges array
   * @param edges 
   */
  protected static _dedupe( edges:number[] ):number[] {
    let j = edges.length;

    while (j > 1) {
      let b = edges[--j];
      let a = edges[--j];
      let i=j;

      while (i > 1) {
        let n = edges[--i];
        let m = edges[--i];

        if ((a == m && b == n) || (a == n && b == m)) {
          edges.splice(j, 2);
          edges.splice(i, 2);
          break;
        }
      }
    }

    return edges;
  }


}