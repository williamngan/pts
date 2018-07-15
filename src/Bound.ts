// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)


import {Pt, Group} from "./Pt";
import {IPt, GroupLike} from "./Types";

/**
 * Bound is a subclass of Group that represents a rectangular boundary.
 * It includes some convenient properties (eg, bottomRight, center) for bounding box calculations. 
 */
export class Bound extends Group implements IPt {

  protected _center:Pt = new Pt();
  protected _size:Pt = new Pt();
  protected _topLeft:Pt = new Pt();
  protected _bottomRight:Pt = new Pt();
  protected _inited = false;

  
  /**
   * Create a Bound. This is similar to the Group constructor. You can also create a Bound via the static function [`Color.from`](#link).
   * @param args a list of Pt as parameters
   * @see Bound.fromGroup
   */
  constructor( ...args:Pt[] ) {
    super(...args);
    this.init();
  }


  /**
   * Create a Bound from a [ClientRect](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect) object.
   * @param rect an object has top/left/bottom/right/width/height properties
   * @returns a Bound object
   */
  static fromBoundingRect( rect:ClientRect ):Bound {
    let b = new Bound( new Pt( rect.left||0, rect.top||0 ), new Pt( rect.right||0, rect.bottom||0 ) );
    if (rect.width && rect.height) b.size = new Pt(rect.width, rect.height);
    return b;
  }

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
   * Clone this bound and return a new one
   */
  clone():Bound {
    return new Bound( this._topLeft.clone(), this._bottomRight.clone() );
  }

  
  /**
   * Recalculte size and center
   */
  protected _updateSize() {
    this._size = this._bottomRight.$subtract( this._topLeft ).abs();
    this._updateCenter();
  }


  /**
   * Recalculate center
   */
  protected _updateCenter() {
    this._center = this._size.$multiply(0.5).add( this._topLeft );
  }


  /**
   * Recalculate based on top-left position and size
   */
  protected _updatePosFromTop() {
    this._bottomRight = this._topLeft.$add( this._size );
    this._updateCenter();
  }


  /**
   * Recalculate based on bottom-right position and size
   */
  protected _updatePosFromBottom() {
    this._topLeft = this._bottomRight.$subtract( this._size );
    this._updateCenter();
  }


  /**
   * Recalculate based on center position and size
   */
  protected _updatePosFromCenter() {
    let half = this._size.$multiply(0.5);
    this._topLeft = this._center.$subtract( half );
    this._bottomRight = this._center.$add( half );
  }


  get size():Pt { return new Pt(this._size); }
  set size(p: Pt) { 
    this._size = new Pt(p); 
    this._updatePosFromTop();
  }
  

  get center():Pt { return new Pt(this._center); }
  set center( p:Pt ) {
    this._center = new Pt(p);
    this._updatePosFromCenter();
  }


  get topLeft():Pt { return new Pt(this._topLeft); }
  set topLeft( p:Pt ) {
    this._topLeft = new Pt(p);
    this[0] = this._topLeft;
    this._updateSize();
  }


  get bottomRight():Pt { return new Pt(this._bottomRight); }
  set bottomRight( p:Pt ) {
    this._bottomRight = new Pt(p);
    this[1] = this._bottomRight;
    this._updateSize();
  }


  get width():number { return (this._size.length > 0) ? this._size.x : 0; }
  set width( w:number ) {
    this._size.x = w;
    this._updatePosFromTop();
  }


  get height():number { return (this._size.length > 1) ? this._size.y : 0; }
  set height( h:number ) {
    this._size.y = h;
    this._updatePosFromTop();
  }


  get depth():number { return (this._size.length > 2) ? this._size.z : 0; }
  set depth( d:number ) {
    this._size.z = d;
    this._updatePosFromTop();
  }
  

  get x():number { return this.topLeft.x; }
  get y():number { return this.topLeft.y; }
  get z():number { return this.topLeft.z; }


  get inited():boolean { return this._inited; }

  /**
   * If the Group elements are changed, call this function to update the Bound's properties.
   * It's preferable to change the topLeft/bottomRight etc properties instead of changing the Group array directly.
   */
  update() {
    this._topLeft = this[0];
    this._bottomRight = this[1];
    this._updateSize();
    return this;
  }


}