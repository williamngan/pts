import {Pt, IPt} from "./Pt"

export class Bound extends Pt {


  constructor(x?:number|Array<number>|IPt, y?:number, z?:number, w?:number) {
    super(x,y,z,w);
    if (!this.z) this.z = 0;
    this._update();
  }

  protected _update( which?:string ) {
    if (!which || which == 'x') this.set(4, this.x/2);
    if (!which || which == 'y') this.set(5, this.y/2);
    if (!which || which == 'z') this.set(6, this.z/2);
  }

  set x( _x:number ) { this.set(0, _x); this._update('x'); }
  set y( _y:number ) { this.set(0, _y); this._update('y'); }
  set z( _z:number ) { this.set(0, _z); this._update('z'); }

  get width():number { return this.get(0); }
  set width( _x:number ) { this.x = _x; }

  get height():number { return this.get(1); }
  set height( _y:number ) {this.y = _y; }

  get depth():number { return this.get(2); }
  set depth( _z:number ) {this.z = _z; }

  get center():Pt { return new Pt( this.get(4), this.get(5), this.get(6) ); }
  get centerX(): number { return this.get(4); }
  get centerY(): number { return this.get(5); }
  get centerZ(): number { return this.get(6); }

}