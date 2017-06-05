import {Pt, IPt} from "./Pt"


export class Bound implements IPt{

  protected _center:Pt = new Pt();
  protected _size:Pt = new Pt();
  protected _topLeft:Pt = new Pt();
  protected _bottomRight:Pt = new Pt();

  constructor( p1?:IPt, p2?:IPt ) {
    if (!p2) {
      this._size = new Pt(p1);
    } else if (p1) {
      this._topLeft = new Pt(p1);
      this._bottomRight = new Pt(p2);
      this._updateSize();
    }
  }

  public clone():Bound {
    return new Bound( this._topLeft, this._bottomRight );
  }

  protected _updateSize() {
    this._size = this._bottomRight.$subtract( this._topLeft ).abs();
    this._updateCenter();
  }

  protected _updateCenter() {
    this._center = this._size.$scale(0.5).add( this._topLeft );
  }

  protected _updatePosFromTop() {
    this._bottomRight = this._topLeft.$add( this._size );
    this._updateCenter();
  }

  protected _updatePosFromBottom() {
    this._topLeft = this._bottomRight.$subtract( this._size );
    this._updateCenter();
  }

  protected _updatePosFromCenter() {
    let half = this._size.$scale(0.5);
    this._topLeft = this._center.$subtract( half );
    this._bottomRight = this._center.$add( half );
  }


  public get size():Pt { return new Pt(this._size); }
  public set size(p: Pt) { 
    this._size = new Pt(p); 
    this._updatePosFromTop();
  }

  public get center():Pt { return new Pt(this._center); }
  public set center( p:Pt ) {
    this._center = new Pt(p);
    this._updatePosFromCenter();
  }

  public get topLeft():Pt { return new Pt(this._topLeft); }
  public set topLeft( p:Pt ) {
    this._topLeft = new Pt(p);
    this._updateSize();
  }

  public get bottomRight():Pt { return new Pt(this._bottomRight); }
  public set bottomRight( p:Pt ) {
    this._bottomRight = new Pt(p);
    this._updateSize();
  }

  public get width():number { return this._size.x; }
  public set width( w:number ) {
    this._size.x = w;
    this._updatePosFromTop();
  }

  public get height():number { return (this._size.length > 1) ? this._size.y : 0; }
  public set height( h:number ) {
    this._size.y = h;
    this._updatePosFromTop();
  }

  public get depth():number { return (this._size.length > 2) ? this._size.z : 0; }
  public set depth( d:number ) {
    this._size.z = d;
    this._updatePosFromTop();
  }

  public get x():number { return this.topLeft.x; }
  public get y():number { return this.topLeft.y; }
  public get z():number { return this.topLeft.z; }

  static fromBoundingRect( rect:ClientRect ) {
    let b = new Bound( new Pt( rect.left||0, rect.top||0 ), new Pt( rect.right||0, rect.bottom||0 ) );
    if (rect.width && rect.height) b.size = new Pt(rect.width, rect.height);
    return b;
  }

}