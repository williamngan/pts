// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan)


import {Util, Const} from "./Util"
import {Geom, Num} from "./Num"
import {Bound} from "./Bound"
import {Vec, Mat} from "./LinearAlgebra"


export interface IPt {
  x?:number,
  y?:number,
  z?:number,
  w?:number
}

export var PtBaseArray = Float32Array;
export type GroupLike = Group | Pt[];
export type PtLike = Pt | Float32Array | number[];


export class Pt extends PtBaseArray implements IPt, Iterable<number> {

  protected _id:string;

  /**
   * Create a Pt. If no parameter is provided, this will instantiate a Pt with 2 dimensions [0, 0].  
   * Note that `new Pt(3)` will only instantiate Pt with length of 3 (ie, same as `new Float32Array(3)` ). If you need a Pt with 1 dimension of value 3, use `new Pt([3])`.
   * Example: `new Pt()`, `new Pt(1,2,3,4,5)`, `new Pt([1,2])`, `new Pt({x:0, y:1})`, `new Pt(pt)`
   * @param args a list of numbers, an array of number, or an object with {x,y,z,w} properties
   */
  constructor(...args) {
    if (args.length === 1 && typeof args[0] == "number") {
      super( args[0] ); // init with the TypedArray's length. Needed this in order to make ".map", ".slice" etc work.
    } else {
      super( (args.length>0) ? Util.getArgs(args) : [0,0] );
    }    
  }

  static make( dimensions:number, defaultValue:number=0 ):Pt {
    let p = new PtBaseArray(dimensions);
    if (defaultValue) p.fill( defaultValue );
    return new Pt( p );
  }

  get id():string { return this._id; }
  set id( s:string ) { this._id = s; }

  get x():number { return this[0]; }
  get y():number { return this[1]; }
  get z():number { return this[2]; }
  get w():number { return this[3]; }

  set x( n:number ) { this[0] = n; }
  set y( n:number ) { this[1] = n; }
  set z( n:number ) { this[2] = n; }
  set w( n:number ) { this[3] = n; }
  

  clone():Pt {
    return new Pt( this );
  }

  equals( p:PtLike, threshold=0.000001 ):boolean {
    for (let i=0, len=this.length; i<len; i++) {
      if ( Math.abs(this[i]-p[i]) > threshold ) return false;
    }
    return true;
  }


  /**
   * Update the values of this Pt
   * @param args a list of numbers, an array of number, or an object with {x,y,z,w} properties
   */
  to( ...args ):this {
    let p = Util.getArgs( args );
    for (let i=0, len=Math.min(this.length, p.length); i<len; i++) {
      this[i] = p[i];
    }
    return this;
  }

  /**
   * Update the values of this Pt to point at a specific angle
   * @param radian target angle in radian
   * @param magnitude Optional magnitude if known. If not provided, it'll calculate and use this Pt's magnitude.
   */
  toAngle( radian:number, magnitude?:number ):this {
    let m = (magnitude!=undefined) ? magnitude : this.magnitude();
    return this.to( Math.cos(radian)*m, Math.sin(radian)*m );
  }

  /**
   * Create an operation using this Pt, passing this Pt into a custom function's first parameter
   * For example: `let myOp = pt.op( fn ); let result = myOp( [1,2,3] );`
   * @param fn any function that takes a Pt as its first parameter
   * @returns a resulting function that takes other parameters required in `fn`
   */
  op( fn:(p1:PtLike, ...rest:any[]) => any ): ( ...rest:any[] ) => any {
    let self = this;
    return ( ...params:any[] ) => {
      return fn( self, ...params );
    }
  }

  /**
   * This combines a series of operations into an array. See `op()` for details.
   * For example: `let myOps = pt.ops([fn1, fn2, fn3]); let results = myOps.map( (op) => op([1,2,3]) );`
   * @param fns an array of functions for `op`
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
   * Take specific dimensional values from this Pt and create a new Pt
   * @param axis a string such as "xy" (use Const.xy) or an array to specify index for two dimensions
   */
  $take( axis:string|number[] ):Pt {
    let p = [];
    for (let i=0, len=axis.length; i<len; i++) {
      p.push( this[axis[i]] || 0 );
    }
    return new Pt(p);
  }


  $concat( ...args ) {
    return new Pt( this.toArray().concat( Util.getArgs( args ) ) );
  }

  add(...args): this { 
    (args.length === 1 && typeof args[0] == "number") ? Vec.add( this, args[0] ) : Vec.add( this, Util.getArgs(args) );
    return this; 
  }

  $add(...args): Pt { return this.clone().add(...args) };


  subtract(...args): this { 
    (args.length === 1 && typeof args[0] == "number") ? Vec.subtract( this, args[0] ) : Vec.subtract( this, Util.getArgs(args) );
    return this; 
  }

  $subtract(...args): Pt { return this.clone().subtract(...args) };


  multiply(...args): this { 
    (args.length === 1 && typeof args[0] == "number") ? Vec.multiply( this, args[0] ) : Vec.multiply( this, Util.getArgs(args) );
    return this;
  }

  $multiply(...args): Pt { return this.clone().multiply(...args) };


  divide(...args): this { 
    (args.length === 1 && typeof args[0] == "number") ? Vec.divide( this, args[0] ) : Vec.divide( this, Util.getArgs(args) );
    return this; 
  }

  $divide(...args): Pt { return this.clone().divide(...args) };

  magnitudeSq():number {  return Vec.dot( this, this ); }

  magnitude():number { return Vec.magnitude( this ); }


  /**
   * Convert to a unit vector
   * @param magnitude Optional: if the magnitude is known, pass it as a parameter to avoid duplicate calculation.
   */
  unit( magnitude:number=undefined ):Pt {
    Vec.unit( this, magnitude );
    return this;
  }

  /**
   * Get a unit vector from this Pt
   */
  $unit( magnitude:number=undefined ):Pt { return this.clone().unit( magnitude ); }

  dot( ...args ):number { return Vec.dot( this, Util.getArgs(args) ); }

  $cross( ...args ): Pt { return Vec.cross( this, Util.getArgs( args ) ); }

  $project( p:Pt ):Pt {
    let m = p.magnitude();
    let a = this.$unit();
    let b = p.$divide(m);
    let dot = a.dot( b );
    return a.multiply( m * dot );
  }


  /**
   * Absolute values for all values in this pt
   */
  abs():Pt {
    Vec.abs( this );
    return this;
  }

  /**
   * Get a new Pt with absolute values of this Pt
   */
  $abs():Pt {
    return this.clone().abs();
  }

  /**
   * Floor values for all values in this pt
   */
  floor():Pt {
    Vec.floor( this );
    return this;
  }

  /**
   * Get a new Pt with floor values of this Pt
   */
  $floor():Pt {
    return this.clone().floor();
  }


  /**
   * Ceil values for all values in this pt
   */
  ceil():Pt {
    Vec.ceil( this );
    return this;
  }

  /**
   * Get a new Pt with ceil values of this Pt
   */
  $ceil():Pt {
    return this.clone().ceil();
  }

  /**
   * Round values for all values in this pt
   */
  round():Pt {
    Vec.round( this );
    return this;
  }

  /**
   * Get a new Pt with round values of this Pt
   */
  $round():Pt {
    return this.clone().round();
  }

  minValue():{value:number, index:number} {
    return Vec.min( this );
  }

  maxValue():{value:number, index:number} {
    return Vec.max( this );
  }

  $min( ...args ):Pt {
    let p = Util.getArgs( args );
    let m = this.clone();
    for (let i=0, len=Math.min( this.length, p.length ); i<len; i++) {
      m[i] = Math.min( this[i], p[i] );
    }
    return m;
  }

  $max( ...args ):Pt {
    let p = Util.getArgs( args );
    let m = this.clone();
    for (let i=0, len=Math.min( this.length, p.length ); i<len; i++) {
      m[i] = Math.max( this[i], p[i] );
    }
    return m;
  }
  

  /**
   * Get angle of this vector from origin
   * @param axis a string such as "xy" (use Const.xy) or an array to specify index for two dimensions
   */
  angle( axis:string|number[]=Const.xy ):number {
    return Math.atan2( this[axis[1]], this[axis[0]] );
  }

  /**
   * Get the angle between this and another Pt
   * @param p the other Pt
   * @param axis a string such as "xy" (use Const.xy) or an array to specify index for two dimensions
   */
  angleBetween( p:Pt, axis:string|number[]=Const.xy ):number {
    return Geom.boundRadian( this.angle(axis) ) - Geom.boundRadian( p.angle(axis) );
  }

  scale( scale:number|number[]|PtLike, anchor?:PtLike ) {    
    Geom.scale( this, scale, anchor || Pt.make( this.length, 0) );
    return this;
  }


  rotate2D( angle:number, anchor?:PtLike, axis?:string ) {    
    Geom.rotate2D( this, angle, anchor || Pt.make( this.length, 0), axis );
    return this;
  }

  shear2D( scale:number|number[]|PtLike, anchor?:PtLike, axis?:string) {
    Geom.shear2D( this, scale, anchor || Pt.make( this.length, 0), axis );
    return this;
  }

  reflect2D( line:GroupLike, axis?:string):this {
    Geom.reflect2D( this, line, axis );
    return this;
  }

  toString():string {
    return `Pt(${ this.join(", ")})`
  }

  toArray():number[] {
    return [].slice.call( this );
  }


  /**
   * Given two groups of Pts, and a function that operate on two Pt, return a group of Pts  
   * @param a a group of Pts
   * @param b another array of Pts
   * @param op a function that takes two parameters (p1, p2) and returns a Pt 
   */
  static combine( a:GroupLike, b:GroupLike, op:(p1:Pt, p2:Pt) => Pt ):Group {
    let result = new Group();
    for (let i=0, len=a.length; i<len; i++) {
      for (let k=0, len=b.length; k<len; k++) {
        result.push( op(a[i], b[k]) );
      }
    }
    return result;
  }

}


export class Group extends Array<Pt> {

  protected _id:string;
  
  constructor(...args) {
    super(...args);
  }

  get id():string { return this._id; }
  set id( s:string ) { this._id = s; }

  get p1():Pt { return this[0]; }
  get p2():Pt { return this[1]; }
  get p3():Pt { return this[2]; }
  get p4():Pt { return this[2]; }

  clone():Group {
    let group = new Group();   
    for (let i=0, len=this.length; i<len; i++) {
      group.push( this[i].clone() );
    }
    return group;
  }

  static fromArray( list:PtLike[] ):Group {
    let g = new Group();
    for (let i=0, len=list.length; i<len; i++) {
      let p = (list[i] instanceof Pt) ? list[i] as Pt : new Pt(list[i]);
      g.push( p );
    }
    return g;
  }

  static fromPtArray( list:GroupLike ):Group {
    return Group.from( list ) as Group;
  }

  /**
   * Split this Group into an array of sub-groups
   * @param chunkSize number of items per sub-group
   * @param stride forward-steps after each sub-group
   */
  split( chunkSize:number, stride?:number ):Group[] {
    let sp = Util.split( this, chunkSize, stride );
    return sp.map( (g) => g as Group );
  }

  /**
   * Insert a Pt into this group
   * @param pts Another group of Pts
   * @param index the index position to insert into
   */
  insert( pts:GroupLike, index=0 ):this {
    let g = Group.prototype.splice.apply( this, [index, 0, ...pts] );
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
   * Split this group into an array of sub-group segments
   * @param pts_per_segment number of Pts in each segment
   * @param stride forward-step to take
   */
  segments( pts_per_segment:number=2, stride:number=1 ):Group[] { return this.split(pts_per_segment, stride); }

  /**
   * Get all the line segments (ie, edges in a graph) of this group
   */
  lines():Group[] { return this.segments(2, 1); }

  centroid(): Pt {
    return Geom.centroid( this );
  }

  boundingBox():Group {
    return Geom.boundingBox( this );
  }

  /**
   * Anchor all the Pts in this Group using a target Pt as origin. (ie, subtract all Pt with the target anchor to get a relative position)
   * @param ptOrIndex a Pt, or a numeric index to target a specific Pt in this Group
   */
  anchorTo( ptOrIndex:PtLike|number=0 ) { Geom.anchor( this, ptOrIndex, "to" ); }

  /**
   * Anchor all the Pts in this Group by its absolute position from a target Pt. (ie, add all Pt with the target anchor to get an absolute position)
   * @param ptOrIndex a Pt, or a numeric index to target a specific Pt in this Group
   */
  anchorFrom( ptOrIndex:PtLike|number=0 ) { Geom.anchor( this, ptOrIndex, "from" ); }

  /**
   * Create an operation using this Group, passing this Group into a custom function's first parameter
   * For example: `let myOp = group.op( fn ); let result = myOp( [1,2,3] );`
   * @param fn any function that takes a Group as its first parameter
   * @returns a resulting function that takes other parameters required in `fn`
   */
  op( fn:(g1:GroupLike, ...rest:any[]) => any ): ( ...rest:any[] ) => any {
    let self = this;
    return ( ...params:any[] ) => {
      return fn( self, ...params );
    }
  }


  /**
   * This combines a series of operations into an array. See `op()` for details.
   * For example: `let myOps = pt.ops([fn1, fn2, fn3]); let results = myOps.map( (op) => op([1,2,3]) );`
   * @param fns an array of functions for `op`
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
   * Get an interpolated point on the line segments defined by this Group
   * @param t a value between 0 to 1 usually
   */
  interpolate( t:number ):Pt {
    t = Num.limitValue( t, 0, 1 );
    let chunk = this.length-1;
    let tc = 1/(this.length-1);
    let idx = Math.floor( t / tc );
    return Geom.interpolate( this[idx], this[ Math.min( this.length-1, idx+1)], (t - idx*tc) * chunk );
  }

  moveBy( ...args ):this {
    let pt = Util.getArgs( args );
    for (let i=0, len=this.length; i<len; i++) {
      this[i].add( pt );
    }
    return this;
  }

  /**
   * Move the first Pt in this group to a specific position, and move all the other Pts correspondingly
   * @param args a list of numbers, an array of number, or an object with {x,y,z,w} properties
   */
  moveTo( ...args ):this {
    let d = new Pt( Util.getArgs(args) ).subtract( this[0] );
    this.moveBy( d );
    return this; 
  }

  scale( scale:number|number[]|PtLike, anchor?:PtLike ):this {    
    for (let i=0, len=this.length; i<len; i++) {
      Geom.scale( this[i], scale, anchor || this[0] );
    }
    return this;
  }

  rotate2D( angle:number, anchor?:PtLike, axis?:string ):this {   
    for (let i=0, len=this.length; i<len; i++) {
      Geom.rotate2D( this[i], angle, anchor || this[0], axis );
    } 
    return this;
  }

  shear2D( scale:number|number[]|PtLike, anchor?:PtLike, axis?:string):this {
    for (let i=0, len=this.length; i<len; i++) {
      Geom.shear2D( this[i], scale, anchor || this[0], axis );
    }
    return this;
  }

  reflect2D( line:GroupLike, axis?:string):this {
    for (let i=0, len=this.length; i<len; i++) {
      Geom.reflect2D( this[i], line, axis );
    }
    return this;
  }

  /**
   * Sort this group's Pts by values in a specific dimension
   * @param dim dimensional index
   * @param desc if true, sort descending. Default is false (ascending)
   */
  sortByDimension( dim:number, desc:boolean=false ):this {
    return this.sort( (a, b) => (desc) ? b[dim] - a[dim] : a[dim] - b[dim] );
  }

  add( ...args ):this {
    return this.moveBy( ...args );
  }

  $add(...args):Group {
    return this.clone().add( ...args );
  }

  multiply( ...args ):this {
    return this.scale( Util.getArgs(args) );
  }

  $multiply(...args):Group {
    return this.clone().multiply( ...args );
  }

  $matrixAdd( g:GroupLike|number ):Group {
    return Mat.add( this, g );
  }

  $matrixMultiply( g:GroupLike|number, transposed:boolean=false ):Group {
    return Mat.multiply( this, g, transposed );
  }

  zipSlice( index:number, defaultValue:number|boolean = false ):Pt {
    return Mat.zipSlice( this, index, defaultValue );
  }

  /**
   * Zip a group of Pt. eg, [[1,2],[3,4],[5,6]] => [[1,3,5],[2,4,6]]
   * @param defaultValue a default value to fill if index out of bound. If not provided, it will throw an error instead.
   * @param useLongest If true, find the longest list of values in a Pt and use its length for zipping. Default is false, which uses the first item's length for zipping.
   */
  $zip( defaultValue:number|boolean = false, useLongest=false ):Group {
    return Mat.zip( this, defaultValue, useLongest );
  }

  toString():string {
    return "Group[ "+ this.reduce( (p, c) => p+c.toString()+" ", "" )+" ]";
  }


}