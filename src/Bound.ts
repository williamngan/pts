import {Pt, IPt} from "./Pt"


export class Bound extends Pt {


  constructor(x?:number|Array<number>|IPt, y=0, z=0, w=0) {
    super(x,y,z,w);
    if (!this.z) this.z = 0;
    this._update();
  }

  bound( x?:number|Array<number>|IPt, y?:number, z?:number, w?:number ) {
    let b = Pt.getArgs( [x,y,z,w] );
    this.set(5, (b[0] || 0));
    this.set(6, (b[1] || 0));
    this.set(7, (b[2] || 0));
    this._update();
  }

  static fromBoundingRect( rect:ClientRect ) {
    let b = new Bound();
    if (rect.top) b.y = rect.top;
    if (rect.left) b.x = rect.left;
    b.width = (rect.width) ? rect.width : ((rect.right) ? rect.right-rect.left : 0);
    b.height = (rect.height) ? rect.height : ((rect.bottom) ? rect.bottom-rect.top : 0);
    return b;
  }

  protected _update( which?:string ) {
    if (!which || which == "x" || which == "w") this.set(8, this.x + this.width/2);
    if (!which || which == "y" || which == "h") this.set(9, this.y + this.height/2);
    if (!which || which == "z" || which == "d") this.set(10, this.z + this.depth/2);
  }

  setSize( w:number, h:number, d?:number ):this {
    this.width = w;
    this.height = h;
    if (d != undefined) this.depth = d;
    return this;
  }

  set x( _x:number ) { this.set(0, _x); this._update('x'); }
  set y( _y:number ) { this.set(0, _y); this._update('y'); }
  set z( _z:number ) { this.set(0, _z); this._update('z'); }

  get width():number { return this.get(5); }
  set width( _w:number ) { this.set(5, _w); this._update('w'); }

  get height():number { return this.get(6); }
  set height( _h:number ) { this.set(6, _h); this._update('h'); }

  get size():Pt { return new Pt( this.width, this.height, this.depth ); }

  get depth():number { return this.get(7); }
  set depth( _d:number ) { this.set(7, _d); this._update('d'); }

  get center():Pt { return new Pt( this.get(8), this.get(9), this.get(10) ); }
  get centerX(): number { return this.get(8); }
  get centerY(): number { return this.get(9); }
  get centerZ(): number { return this.get(10); }

}