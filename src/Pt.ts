/*! Source code licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */

import {Util, Const} from "./Util";
import {Geom, Num} from "./Num";
import {Vec, Mat} from "./LinearAlgebra";
import {IPt, GroupLike, PtLike} from "./Types";

/**
 * Pt is a subclass of standard [`Float32Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float32Array) with additional properties and functions to support vector and geometric calculations.
 * See [Pt guide](../guide/Pt-0200.html) for details.
 */
export class Pt extends Float32Array implements IPt, Iterable<number> {

  protected _id:string;

  /**
   * Create a Pt. If no parameter is provided, this will instantiate a Pt with 2 dimensions [0, 0]. 
   * Note that `new Pt(3)` will only instantiate Pt with length of 3 (ie, same as `new Float32Array(3)` ). If you need a Pt with 1 dimension of value 3, use `new Pt([3])`.
   * @example `new Pt()`, `new Pt(1,2,3,4,5)`, `new Pt([1,2])`, `new Pt({x:0, y:1})`, `new Pt(pt)`
   * @param args a list of numeric parameters, an array of numbers, or an object with {x,y,z,w} properties
   */
  constructor(...args) {
    if (args.length === 1 && typeof args[0] == "number") {
      super( args[0] ); // init with the TypedArray's length. Needed this in order to make ".map", ".slice" etc work.
    } else {
      super( (args.length>0) ? Util.getArgs(args) : [0,0] );
    }    
  }


  /**
   * Create an n-dimensional Pt with either default value or random values.
   * @param dimensions number of dimensions
   * @param defaultValue optional default value to fill the dimensions
   * @param randomize if `true`, randomize the value between 0 to default value
   */
  static make( dimensions:number, defaultValue:number=0, randomize:boolean=false ):Pt {
    let p = new Float32Array(dimensions);
    if (defaultValue) p.fill( defaultValue );
    if (randomize) {
      for (let i=0, len=p.length; i<len; i++) {
        p[i] = p[i]*Math.random();
      }
    }
    return new Pt( p );
  }

  /**
   * ID string of this Pt
   */
  get id():string { return this._id; }
  set id( s:string ) { this._id = s; }

  /**
   * Value in the first dimensional of this Pt
   */
  get x():number { return this[0]; }
  set x( n:number ) { this[0] = n; }

  /**
   * Value in the second dimension of this Pt
   */
  get y():number { return this[1]; }
  set y( n:number ) { this[1] = n; }

  /**
   * Value in the third dimension of this Pt
   */
  get z():number { return this[2]; }
  set z( n:number ) { this[2] = n; }

  /**
   * Value in the forth dimension of this Pt
   */
  get w():number { return this[3]; }  
  set w( n:number ) { this[3] = n; }
  

  /**
   * Clone this Pt and return it as a new Pt.
   */
  clone():Pt {
    return new Pt( this );
  }


  /**
   * Check if another Pt is equal to this Pt, within a threshold.
   * @param p another Pt to compare with
   * @param threshold a threshold value within which the two Pts are considered equal. Default is 0.000001.
   */
  equals( p:PtLike, threshold=0.000001 ):boolean {
    for (let i=0, len=this.length; i<len; i++) {
      if ( Math.abs(this[i]-p[i]) > threshold ) return false;
    }
    return true;
  }


  /**
   * Update the values of this Pt.
   * @param args can be either a list of numbers, an array, a Pt, or an object with {x,y,z,w} properties
   */
  to( ...args ):this {
    let p = Util.getArgs( args );
    for (let i=0, len=Math.min(this.length, p.length); i<len; i++) {
      this[i] = p[i];
    }
    return this;
  }


  /**
   * Like [`Pt.to`](#link) but returns a new Pt.
   * @param args can be either a list of numbers, an array, a Pt, or an object with {x,y,z,w} properties
   */
  $to( ...args ):Pt {
    return this.clone().to( ...args );
  }


  /**
   * Update the values of this Pt to point at a specific angle.
   * @param radian target angle in radian
   * @param magnitude Optional magnitude if known. If not provided, it'll calculate and use this Pt's magnitude.
   * @param anchorFromPt If `true`, translate to new position from current position. Default is `false` which update the position from origin (0,0);
   */
  toAngle( radian:number, magnitude?:number, anchorFromPt:boolean=false ):this {
    let m = (magnitude!=undefined) ? magnitude : this.magnitude();
    let change = [Math.cos(radian)*m, Math.sin(radian)*m];
    return (anchorFromPt) ? this.add( change ) : this.to( change );
  }


  /**
   * Create an operation using this Pt, passing this Pt into a custom function's first parameter. See the [Op guide](../guide/Op-0400.html) for details.
   * @param fn any function that takes a Pt as its first parameter
   * @example `let myOp = pt.op( fn ); let result = myOp( [1,2,3] );`
   * @returns a resulting function that takes other parameters required in `fn`
   */
  op( fn:(p1:PtLike, ...rest:any[]) => any ): ( ...rest:any[] ) => any {
    let self = this;
    return ( ...params:any[] ) => {
      return fn( self, ...params );
    };
  }


  /**
   * This combines a series of operations into an array. See the [Op guide](../guide/Op-0400.html) for details.
   * @param fns an array of functions for `op`
   * @example `let myOps = pt.ops([fn1, fn2, fn3]); let results = myOps.map( (op) => op([1,2,3]) );`
   * @returns an array of resulting functions
   */
  ops( fns:((p1:PtLike, ...rest:any[]) => any)[] ): (( ...rest:any[] ) => any)[] {
    let _ops = [];
    for (let i=0, len=fns.length; i<len; i++) {
      _ops.push( this.op( fns[i] ) );
    }
    return _ops;
  }


  /**
   * Take specific dimensional values from this Pt and create a new Pt.
   * @param axis a string such as "xy" (use Const.xy) or an array to specify indices
   */
  $take( axis:string|number[] ):Pt {
    let p = [];
    for (let i=0, len=axis.length; i<len; i++) {
      p.push( this[axis[i]] || 0 );
    }
    return new Pt(p);
  }


  /**
   * Concatenate this Pt with addition dimensional values and return as a new Pt.
   * @param args can be either a list of numbers, an array, a Pt,  or an object with {x,y,z,w} properties
   */
  $concat( ...args ):Pt {
    return new Pt( this.toArray().concat( Util.getArgs( args ) ) );
  }


  /**
   * Add scalar or vector values to this Pt.
   * @param args can be either a list of numbers, an array, a Pt, or an object with {x,y,z,w} properties
   */
  add(...args): this { 
    (args.length === 1 && typeof args[0] == "number") ? Vec.add( this, args[0] ) : Vec.add( this, Util.getArgs(args) );
    return this; 
  }


  /**
   * Like [`Pt.add`](#link), but returns result as a new Pt.
   * @param args can be either a list of numbers, an array, a Pt, or an object with {x,y,z,w} properties
   */
  $add(...args): Pt { return this.clone().add(...args); }


  /**
   * Subtract scalar or vector values from this Pt.
   * @param args can be either a list of numbers, an array, a Pt, or an object with {x,y,z,w} properties
   */
  subtract(...args): this { 
    (args.length === 1 && typeof args[0] == "number") ? Vec.subtract( this, args[0] ) : Vec.subtract( this, Util.getArgs(args) );
    return this; 
  }


  /**
   * Like [`Pt.subtract`](#link), but returns result as a new Pt.
   * @param args can be either a list of numbers, an array, a Pt, or an object with {x,y,z,w} properties
   */
  $subtract(...args): Pt { return this.clone().subtract(...args); }


  /**
   * Multiply scalar or vector values (as element-wise) with this Pt.
   * @param args can be either a list of numbers, an array, a Pt, or an object with {x,y,z,w} properties
   */
  multiply(...args): this { 
    (args.length === 1 && typeof args[0] == "number") ? Vec.multiply( this, args[0] ) : Vec.multiply( this, Util.getArgs(args) );
    return this;
  }


  /**
   * Like [`Pt.multiply`](#link), but returns result as a new Pt.
   * @param args can be either a list of numbers, an array, a Pt, or an object with {x,y,z,w} properties
   */
  $multiply(...args): Pt { return this.clone().multiply(...args); }


  /**
   * Divide this Pt over scalar or vector values (as element-wise).
   * @param args can be either a list of numbers, an array, a Pt, or an object with {x,y,z,w} properties
   */
  divide(...args): this { 
    (args.length === 1 && typeof args[0] == "number") ? Vec.divide( this, args[0] ) : Vec.divide( this, Util.getArgs(args) );
    return this; 
  }


  /**
   * Like [`Pt.divide`](#link), but returns result as a new Pt.
   * @param args can be either a list of numbers, an array, a Pt, or an object with {x,y,z,w} properties
   */
  $divide(...args): Pt { return this.clone().divide(...args); }


  /**
   * Get the sqaured distance (magnitude) of this Pt from origin.
   */
  magnitudeSq():number {  return Vec.dot( this, this ); }


  /**
   * Get the distance (magnitude) of this Pt from origin.
   */
  magnitude():number { return Vec.magnitude( this ); }


  /**
   * Convert to a unit vector, which is a normalized vector whose magnitude equals to 1.
   * @param magnitude Optional: if the magnitude is known, pass it as a parameter to avoid duplicate calculation.
   */
  unit( magnitude:number=undefined ):Pt {
    Vec.unit( this, magnitude );
    return this;
  }


  /**
   * Get a new unit vector from this Pt.
   */
  $unit( magnitude:number=undefined ):Pt { return this.clone().unit( magnitude ); }


  /**
   * Dot product of this Pt and another Pt.
   * @param args can be either a list of numbers, an array, a Pt, or an object with {x,y,z,w} properties
   */
  dot( ...args ):number { return Vec.dot( this, Util.getArgs(args) ); }


  /**
   * 2D Cross product of this Pt and another Pt. Return results as a new Pt.
   * @param args can be either a list of numbers, an array, a Pt, or an object with {x,y,z,w} properties
   */
  $cross2D( ...args ):number { return Vec.cross2D( this, Util.getArgs(args) ); }

  
  /**
   * 3D Cross product of this Pt and another Pt. Return results as a new Pt.
   * @param args can be either a list of numbers, an array, a Pt, or an object with {x,y,z,w} properties
   */
  $cross( ...args ): Pt { return Vec.cross( this, Util.getArgs( args ) ); }


  /**
   * Calculate vector projection of this Pt on another Pt. 
   * @param args can be either a list of numbers, an array, a Pt, or an object with {x,y,z,w} properties
   * @returns the projection vector as a Pt
   */
  $project( ...args ):Pt {
    return this.$multiply( this.dot( ...args ) / this.magnitudeSq() );
  }


  /**
   * Calculate scalar projection.
   * @param args can be either a list of numbers, an array, a Pt, or an object with {x,y,z,w} properties
   */
  projectScalar( ...args ):number {
    return this.dot( ...args ) / this.magnitude();
  }


  /**
   * Absolute values for all values in this pt.
   */
  abs():Pt {
    Vec.abs( this );
    return this;
  }


  /**
   * Get a new Pt with absolute values of this Pt.
   */
  $abs():Pt {
    return this.clone().abs();
  }


  /**
   * Floor values for all values in this Pt.
   */
  floor():Pt {
    Vec.floor( this );
    return this;
  }


  /**
   * Get a new Pt with floor values of this Pt.
   */
  $floor():Pt {
    return this.clone().floor();
  }


  /**
   * Ceiling values for all values in this Pt.
   */
  ceil():Pt {
    Vec.ceil( this );
    return this;
  }


  /**
   * Get a new Pt with ceiling values of this Pt.
   */
  $ceil():Pt {
    return this.clone().ceil();
  }


  /**
   * Rounded values for all values in this Pt.
   */
  round():Pt {
    Vec.round( this );
    return this;
  }


  /**
   * Get a new Pt with rounded values of this Pt.
   */
  $round():Pt {
    return this.clone().round();
  }


  /**
   * Find the minimum value across all dimensions in this Pt.
   * @returns an object with `value` and `index` which returns the minimum value and its dimensional index
   */
  minValue():{value:number, index:number} {
    return Vec.min( this );
  }


  /**
   * Find the maximum value across all dimensions in this Pt.
   * @returns an object with `value` and `index` which returns the maximum value and its dimensional index
   */
  maxValue():{value:number, index:number} {
    return Vec.max( this );
  }


  /**
   * Get a new Pt that has the minimum dimensional values of this Pt and another Pt.
   * @param args can be either a list of numbers, an array, a Pt, or an object with {x,y,z,w} properties
   */
  $min( ...args ):Pt {
    let p = Util.getArgs( args );
    let m = this.clone();
    for (let i=0, len=Math.min( this.length, p.length ); i<len; i++) {
      m[i] = Math.min( this[i], p[i] );
    }
    return m;
  }


  /**
   * Get a new Pt that has the maximum dimensional values of this Pt and another Pt.
   * @param args can be either a list of numbers, an array, a Pt, or an object with {x,y,z,w} properties
   */
  $max( ...args ):Pt {
    let p = Util.getArgs( args );
    let m = this.clone();
    for (let i=0, len=Math.min( this.length, p.length ); i<len; i++) {
      m[i] = Math.max( this[i], p[i] );
    }
    return m;
  }
  

  /**
   * Get angle of this Pt from origin.
   * @param axis a string such as "xy" (use Const.xy) or an array to specify index for two dimensions
   */
  angle( axis:string|number[]=Const.xy ):number {
    return Math.atan2( this[axis[1]], this[axis[0]] );
  }


  /**
   * Get the angle between this and another Pt.
   * @param p the other Pt
   * @param axis a string such as "xy" (use Const.xy) or an array to specify index for two dimensions
   */
  angleBetween( p:Pt, axis:string|number[]=Const.xy ):number {
    return Geom.boundRadian( this.angle(axis) ) - Geom.boundRadian( p.angle(axis) );
  }


  /**
   * Scale this Pt from origin or from an anchor point.
   * @param scale scale ratio
   * @param anchor optional anchor point to scale from
   */
  scale( scale:number|number[]|PtLike, anchor?:PtLike ) {    
    Geom.scale( this, scale, anchor || Pt.make( this.length, 0) );
    return this;
  }


  /**
   * Rotate this Pt from origin or from an anchor point in 2D.
   * @param angle rotate angle
   * @param anchor optional anchor point to scale from
   * @param axis optional string such as "yz" to specify a 2D plane
   */
  rotate2D( angle:number, anchor?:PtLike, axis?:string ) {    
    Geom.rotate2D( this, angle, anchor || Pt.make( this.length, 0), axis );
    return this;
  }


  /**
   * Shear this Pt from origin or from an anchor point in 2D.
   * @param shear shearing value which can be a number or an array of 2 numbers
   * @param anchor optional anchor point to scale from
   * @param axis optional string such as "yz" to specify a 2D plane
   */
  shear2D( scale:number|number[]|PtLike, anchor?:PtLike, axis?:string) {
    Geom.shear2D( this, scale, anchor || Pt.make( this.length, 0), axis );
    return this;
  }


  /**
   * Reflect this Pt along a 2D line.
   * @param line a Group of 2 Pts that defines a line for reflection
   * @param axis optional axis such as "yz" to define a 2D plane of reflection
   */
  reflect2D( line:GroupLike, axis?:string):this {
    Geom.reflect2D( this, line, axis );
    return this;
  }


  /**
   * A string representation of this Pt. Eg, "Pt(1, 2, 3)".
   */
  toString():string {
    return `Pt(${ this.join(", ")})`;
  }


  /**
   * Convert this Pt to a javascript Array.
   */
  toArray():number[] {
    return [].slice.call( this );
  }

}




/**
 * A Group is a subclass of standard javascript [`Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array). It should only contain Pt instances. You can think of it as an array of Float32Arrays.
 * See [Group guide](../guide/Group-0300.html) for details.
 */
export class Group extends Array<Pt> {

  protected _id:string;
  
  /**
   * Create a Group by passing an array of [`Pt`](#link). You may also create a Group using [`Group.fromArray`](#link) or [`Group.fromPtArray`](#link).
   * @param args an array of Pts
   */
  constructor(...args:Pt[]) {
    super(...args);
  }

  /**
   * ID string of this Group
   */
  get id():string { return this._id; }
  set id( s:string ) { this._id = s; }

  /** 
   * The first Pt in this Group 
   */
  get p1():Pt { return this[0]; }

  /** 
   * The second Pt in this Group 
   */
  get p2():Pt { return this[1]; }

  /** 
   * The third Pt in this Group 
   */
  get p3():Pt { return this[2]; }

  /** 
   * The forth Pt in this Group 
   */
  get p4():Pt { return this[3]; }

  /** 
   * The last Pt in this Group 
   */
  get q1():Pt { return this[this.length-1]; }

  /** 
   * The second-last Pt in this Group 
   */
  get q2():Pt { return this[this.length-2]; }

  /** 
   * The third-last Pt in this Group 
   */
  get q3():Pt { return this[this.length-3]; }

  /** 
   * The forth-last Pt in this Group 
   */
  get q4():Pt { return this[this.length-4]; }

  

  /**
   * Depp clone this group and its Pts.
   */
  clone():Group {
    let group = new Group();   
    for (let i=0, len=this.length; i<len; i++) {
      group.push( this[i].clone() );
    }
    return group;
  }


  /**
   * Convert an array of numeric arrays into a Group of Pts.
   * @param list an array of numeric arrays
   * @example `Group.fromArray( [[1,2], [3,4], [5,6]] )`
   */
  static fromArray( list:PtLike[] ):Group {
    let g = new Group();
    for (let i=0, len=list.length; i<len; i++) {
      let p = (list[i] instanceof Pt) ? list[i] as Pt : new Pt(list[i]);
      g.push( p );
    }
    return g;
  }


  /**
   * Convert an array of Pts into a Group.
   * @param list an array of Pts
   */
  static fromPtArray( list:GroupLike ):Group {
    return Group.from( list ) as Group;
  }


  /**
   * Split this Group into an array of sub-groups.
   * @param chunkSize number of items per sub-group
   * @param stride forward-steps after each sub-group
   * @param loopBack if `true`, always go through the array till the end and loop back to the beginning to complete the segments if needed
   */
  split( chunkSize:number, stride?:number, loopBack:boolean=false ):Group[] {
    let sp = Util.split( this, chunkSize, stride, loopBack );
    return sp as Group[];
  }


  /**
   * Insert a Pt into this group.
   * @param pts Another group of Pts
   * @param index the index position to insert into
   */
  insert( pts:GroupLike, index=0 ):this {
    Group.prototype.splice.apply( this, [index, 0, ...pts] );
    return this;
  }
  

  /**
   * Like Array's splice function, with support for negative index and a friendlier name.
   * @param index start index, which can be negative (where -1 is at index 0, -2 at index 1, etc)
   * @param count number of items to remove
   * @returns The items that are removed. 
   */
  remove( index=0, count:number=1 ):Group {
    let param = (index<0) ? [index*-1 - 1, count] : [index, count];
    return Group.prototype.splice.apply( this, param );
  }


  /**
   * Split this group into an array of sub-group segments.
   * @param pts_per_segment number of Pts in each segment
   * @param stride forward-step to take
   * @param loopBack if `true`, always go through the array till the end and loop back to the beginning to complete the segments if needed
   */
  segments( pts_per_segment:number=2, stride:number=1, loopBack:boolean=false ):Group[] { 
    return this.split(pts_per_segment, stride, loopBack); 
  }


  /**
   * Get all the line segments (ie, edges in a graph) of this group.
   */
  lines():Group[] { return this.segments(2, 1); }


  /**
   * Find the centroid of this group's Pts, which is the average middle point.
   */
  centroid(): Pt {
    return Geom.centroid( this );
  }

  
  /**
   * Find the rectangular bounding box of this group's Pts.
   * @returns a Group of 2 Pts representing the top-left and bottom-right of the rectangle
   */
  boundingBox():Group {
    return Geom.boundingBox( this );
  }


  /**
   * Anchor all the Pts in this Group using a target Pt as origin. (ie, subtract all Pt with the target anchor to get a relative position). All the Pts' values will be updated.
   * @param ptOrIndex a Pt, or a numeric index to target a specific Pt in this Group
   */
  anchorTo( ptOrIndex:PtLike|number=0 ) { Geom.anchor( this, ptOrIndex, "to" ); }


  /**
   * Anchor all the Pts in this Group by its absolute position from a target Pt. (ie, add all Pt with the target anchor to get an absolute position).  All the Pts' values will be updated.
   * @param ptOrIndex a Pt, or a numeric index to target a specific Pt in this Group
   */
  anchorFrom( ptOrIndex:PtLike|number=0 ) { Geom.anchor( this, ptOrIndex, "from" ); }


  /**
   * Create an operation using this Group, passing this Group into a custom function's first parameter.  See the [Op guide](../guide/Op-0400.html) for details.
   * @param fn any function that takes a Group as its first parameter
   * @example `let myOp = group.op( fn ); let result = myOp( [1,2,3] );`
   * @returns a resulting function that takes other parameters required in `fn`
   */
  op( fn:(g1:GroupLike, ...rest:any[]) => any ): ( ...rest:any[] ) => any {
    let self = this;
    return ( ...params:any[] ) => {
      return fn( self, ...params );
    };
  }


  /**
   * This combines a series of operations into an array. See the [Op guide](../guide/Op-0400.html) for details.
   * @param fns an array of functions for `op`
   * @example `let myOps = pt.ops([fn1, fn2, fn3]); let results = myOps.map( (op) => op([1,2,3]) );`
   * @returns an array of resulting functions
   */
  ops( fns:((g1:GroupLike, ...rest:any[]) => any)[] ): (( ...rest:any[] ) => any)[] {
    let _ops = [];
    for (let i=0, len=fns.length; i<len; i++) {
      _ops.push( this.op( fns[i] ) );
    }
    return _ops;
  }


  /**
   * Get an interpolated point on the line segments defined by this Group.
   * @param t a value between 0 to 1 usually
   */
  interpolate( t:number ):Pt {
    t = Num.clamp( t, 0, 1 );
    let chunk = this.length-1;
    let tc = 1/(this.length-1);
    let idx = Math.floor( t / tc );
    return Geom.interpolate( this[idx], this[ Math.min( this.length-1, idx+1)], (t - idx*tc) * chunk );
  }


  /**
   * Move every Pt's position by a specific amount. Same as [`Group.add`](#link).
   * @param args can be either a list of numbers, an array, a Pt, or an object with {x,y,z,w} properties
   */
  moveBy( ...args ):this {
    return this.add( ...args );
  }


  /**
   * Move the first Pt in this group to a specific position, and move all the other Pts correspondingly.
   * @param args can be either a list of numbers, an array, a Pt, or an object with {x,y,z,w} properties
   */
  moveTo( ...args ):this {
    let d = new Pt( Util.getArgs(args) ).subtract( this[0] );
    this.moveBy( d );
    return this; 
  }


  /**
   * Scale this group's Pts from an anchor point. Default anchor point is the first Pt in this group.
   * @param scale scale ratio
   * @param anchor optional anchor point to scale from
   */
  scale( scale:number|number[]|PtLike, anchor?:PtLike ):this {    
    for (let i=0, len=this.length; i<len; i++) {
      Geom.scale( this[i], scale, anchor || this[0] );
    }
    return this;
  }


  /**
   * Rotate this group's Pt from an anchor point in 2D. Default anchor point is the first Pt in this group.
   * @param angle rotate angle
   * @param anchor optional anchor point to scale from
   * @param axis optional string such as "yz" to specify a 2D plane
   */
  rotate2D( angle:number, anchor?:PtLike, axis?:string ):this {   
    for (let i=0, len=this.length; i<len; i++) {
      Geom.rotate2D( this[i], angle, anchor || this[0], axis );
    } 
    return this;
  }


  /**
   * Shear this group's Pt from an anchor point in 2D. Default anchor point is the first Pt in this group.
   * @param shear shearing value which can be a number or an array of 2 numbers
   * @param anchor optional anchor point to scale from
   * @param axis optional string such as "yz" to specify a 2D plane
   */
  shear2D( scale:number|number[]|PtLike, anchor?:PtLike, axis?:string):this {
    for (let i=0, len=this.length; i<len; i++) {
      Geom.shear2D( this[i], scale, anchor || this[0], axis );
    }
    return this;
  }


  /**
   * Reflect this group's Pts along a 2D line. Default anchor point is the first Pt in this group.
   * @param line a Group of 2 Pts that defines a line for reflection
   * @param axis optional axis such as "yz" to define a 2D plane of reflection
   */
  reflect2D( line:GroupLike, axis?:string):this {
    for (let i=0, len=this.length; i<len; i++) {
      Geom.reflect2D( this[i], line, axis );
    }
    return this;
  }


  /**
   * Sort this group's Pts by values in a specific dimension.
   * @param dim dimensional index
   * @param desc if true, sort descending. Default is false (ascending)
   */
  sortByDimension( dim:number, desc:boolean=false ):this {
    return this.sort( (a, b) => (desc) ? b[dim] - a[dim] : a[dim] - b[dim] );
  }


  /**
   * Update each Pt in this Group with an existing Pt function.
   * @param ptFn string name of an existing Pt function. Note that the function must return Pt.
   * @param args arguments for the function specified in ptFn
   */
  forEachPt( ptFn:string, ...args ):this {
    if (!this[0][ptFn]) {
      Util.warn( `${ptFn} is not a function of Pt` );
      return this;
    }
    for (let i=0, len=this.length; i<len; i++) {
      this[i] = this[i][ptFn]( ...args );
    }
    return this;
  }


  /**
   * Add scalar or vector values to this group's Pts.
   * @param args can be either a list of numbers, an array, a Pt, or an object with {x,y,z,w} properties
   */
  add( ...args ):this {
    return this.forEachPt( "add", ...args );
  }


  /**
   * Subtract scalar or vector values from this group's Pts.
   * @param args can be either a list of numbers, an array, a Pt, or an object with {x,y,z,w} properties
   */
  subtract( ...args ):this {
    return this.forEachPt( "subtract", ...args );
  }


  /**
   * Multiply scalar or vector values (as element-wise) with this group's Pts.
   * @param args can be either a list of numbers, an array, a Pt, or an object with {x,y,z,w} properties
   */
  multiply( ...args ):this {
    return this.forEachPt( "multiply", ...args );
  }
  

  /**
   * Divide this group's Pts over scalar or vector values (as element-wise).
   * @param args can be either a list of numbers, an array, a Pt, or an object with {x,y,z,w} properties
   */
  divide( ...args ):this {
    return this.forEachPt( "divide", ...args );
  }


  /**
   * Apply this group as a matrix and calculate matrix addition.
   * @param g a scalar number, an array of numeric arrays, or a group of Pt
   * @returns a new Group
   */
  $matrixAdd( g:GroupLike|number[][]|number ):Group {
    return Mat.add( this, g );
  }


  /**
   * Apply this group as a matrix and calculate matrix multiplication.
   * @param g a scalar number, an array of numeric arrays, or a Group of K Pts, each with N dimensions (K-rows, N-columns) -- or if transposed is true, then N Pts with K dimensions
   * @param transposed (Only applicable if it's not elementwise multiplication) If true, then a and b's columns should match (ie, each Pt should have the same dimensions). Default is `false`.
   * @param elementwise if true, then the multiplication is done element-wise. Default is `false`.
   * @returns If not elementwise, this will return a new  Group with M Pt, each with N dimensions (M-rows, N-columns).
   */
  $matrixMultiply( g:GroupLike|number, transposed:boolean=false, elementwise:boolean=false ):Group {
    return Mat.multiply( this, g, transposed , elementwise);
  }


  /**
   * Zip one slice of an array of Pt. Imagine the Pts are organized in rows, then this function will take the values in a specific column.
   * @param idx index to zip at
   * @param defaultValue a default value to fill if index out of bound. If not provided, it will throw an error instead.
   */
  zipSlice( index:number, defaultValue:number|boolean = false ):Pt {
    return Mat.zipSlice( this, index, defaultValue );
  }


  /**
   * Zip a group of Pt. eg, [[1,2],[3,4],[5,6]] => [[1,3,5],[2,4,6]].
   * @param defaultValue a default value to fill if index out of bound. If not provided, it will throw an error instead.
   * @param useLongest If true, find the longest list of values in a Pt and use its length for zipping. Default is false, which uses the first item's length for zipping.
   */
  $zip( defaultValue:number|boolean = undefined, useLongest=false ):Group {
    return Mat.zip( this, defaultValue, useLongest );
  }


  /**
   * Get a string representation of this group.
   */
  toString():string {
    return "Group[ "+ this.reduce( (p, c) => p+c.toString()+" ", "" )+" ]";
  }


}



/**
 * Bound is a subclass of [`Group`](#link) that represents a rectangular boundary. 
 * It includes some convenient accessors (eg, bottomRight, center) for bounding box calculations. 
 */
export class Bound extends Group implements IPt {

  protected _center:Pt = new Pt();
  protected _size:Pt = new Pt();
  protected _topLeft:Pt = new Pt();
  protected _bottomRight:Pt = new Pt();
  protected _inited = false;

  
  /**
   * Create a Bound. This is similar to the Group constructor. You can also create a Bound via the static function [`Bound.fromGroup`](#link).
   * @param args a list of Pt as parameters
   * @see Bound.fromGroup
   */
  constructor( ...args:Pt[] ) {
    super(...args);
    this.init();
  }


  /**
   * Create a Bound from a [`ClientRect`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect) object.
   * @param rect an object that has {top, left, bottom, right, width, height} properties
   * @returns a Bound object
   */
  static fromBoundingRect( rect:ClientRect ):Bound {
    let b = new Bound( new Pt( rect.left||0, rect.top||0 ), new Pt( rect.right||0, rect.bottom||0 ) );
    if (rect.width && rect.height) b.size = new Pt(rect.width, rect.height);
    return b;
  }


  /**
   * Create a Bound from a Group or an array of Pts
   * @param g a Group instance or an array of Pts
   */
  static fromGroup( g:GroupLike ):Bound {
    if (g.length < 2) throw new Error( "Cannot create a Bound from a group that has less than 2 Pt" );
    return new Bound( g[0], g[g.length-1] );
  }


  /**
   * Initiate the bound's properties.
   */
  protected init() {
    if (this.p1) {
      this._size = this.p1.clone();
      this._inited = true;
    } 
    if (this.p1 && this.p2) {
      let a = this.p1;
      let b = this.p2;
      this.topLeft = a.$min(b);
      this._bottomRight = a.$max(b);
      this._updateSize();
      this._inited = true;
    }
  }


  /**
   * Clone this bound and return a new one.
   */
  clone():Bound {
    return new Bound( this._topLeft.clone(), this._bottomRight.clone() );
  }

  
  /**
   * Recalculte size and center.
   */
  protected _updateSize() {
    this._size = this._bottomRight.$subtract( this._topLeft ).abs();
    this._updateCenter();
  }


  /**
   * Recalculate center.
   */
  protected _updateCenter() {
    this._center = this._size.$multiply(0.5).add( this._topLeft );
  }


  /**
   * Recalculate based on top-left position and size.
   */
  protected _updatePosFromTop() {
    this._bottomRight = this._topLeft.$add( this._size );
    this._updateCenter();
  }


  /**
   * Recalculate based on bottom-right position and size.
   */
  protected _updatePosFromBottom() {
    this._topLeft = this._bottomRight.$subtract( this._size );
    this._updateCenter();
  }


  /**
   * Recalculate based on center position and size.
   */
  protected _updatePosFromCenter() {
    let half = this._size.$multiply(0.5);
    this._topLeft = this._center.$subtract( half );
    this._bottomRight = this._center.$add( half );
  }


  /**
   * Size of this Bound
   */
  get size():Pt { return new Pt(this._size); }
  set size(p: Pt) { 
    this._size = new Pt(p); 
    this._updatePosFromTop();
  }
  

  /**
   * Center position of this Bound
   */
  get center():Pt { return new Pt(this._center); }
  set center( p:Pt ) {
    this._center = new Pt(p);
    this._updatePosFromCenter();
  }


  /**
   * Top-left position of this Bound
   */
  get topLeft():Pt { return new Pt(this._topLeft); }
  set topLeft( p:Pt ) {
    this._topLeft = new Pt(p);
    this[0] = this._topLeft;
    this._updateSize();
  }


  /**
   * Bottom-right position of this Bound
   */
  get bottomRight():Pt { return new Pt(this._bottomRight); }
  set bottomRight( p:Pt ) {
    this._bottomRight = new Pt(p);
    this[1] = this._bottomRight;
    this._updateSize();
  }


  /**
   * Width of this Bound
   */
  get width():number { return (this._size.length > 0) ? this._size.x : 0; }
  set width( w:number ) {
    this._size.x = w;
    this._updatePosFromTop();
  }


  /**
   * Height of this Bound
   */
  get height():number { return (this._size.length > 1) ? this._size.y : 0; }
  set height( h:number ) {
    this._size.y = h;
    this._updatePosFromTop();
  }


  /**
   * Depth of this Bound
   */
  get depth():number { return (this._size.length > 2) ? this._size.z : 0; }
  set depth( d:number ) {
    this._size.z = d;
    this._updatePosFromTop();
  }
  

  /**
   * First value of the Bound's top-left position
   */
  get x():number { return this.topLeft.x; }


  /**
   * Second value of the Bound's top-left position
   */
  get y():number { return this.topLeft.y; }


  /**
   * Third value of the Bound's top-left position
   */
  get z():number { return this.topLeft.z; }


  /**
   * Whether this Bound has been initiated
   */
  get inited():boolean { return this._inited; }



  /**
   * If the Bound's Pts are changed, call this function to update the Bound's properties.
   * It's simpler and preferable to change the Bound's properties (eg, topLeft, bottomRight) instead of updating the Bound's Pts.
   */
  update() {
    this._topLeft = this[0];
    this._bottomRight = this[1];
    this._updateSize();
    return this;
  }


}
