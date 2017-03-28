import {Vector} from "vectorious";

interface IPt {
  x?:number,
  y?:number,
  z?:number,
  w?:number
}

export default class Pt extends Vector implements IPt {

  constructor(x?:number|Array<number>|IPt, y?:number, z?:number, w?:number) {
    super( Pt.getArgs(x,y,z,w) );
  }

  static getArgs(x?:number|Array<number>|IPt, y?:number, z?:number, w?:number):Array<number> {
    var pos = [];
    // positional arguments: x,y,z,w
    if (typeof x === 'number') {
      pos = y != undefined ? ( z != undefined ? ( w != undefined ? [x, y, z, w] : [x, y, z]) : [x, y] ) : [x];

    // as an object of {x, y?, z?, w?}, with a second argument of a default value if certain properties are undefined
    } else if (typeof x === 'object' && !Array.isArray(x)) {
      let a:Array<string> = ["x", "y", "z", "w"];
      for (let p of a) {
        if (x[p] == undefined && y == undefined) break;
        pos.push( x[p] || y );
      }

    // as an array of values, with a second argument of a default value if certain properties are undefined
    } else if (Array.isArray(x)) {
      let _x = x as Array<number>;
      pos = _x.slice();
      if (y != undefined) {
        while (pos.length < 4) {
          pos.push( y );
        }
      }
    }
    
    return pos;
  }

  to(x?:number|Array<number>|IPt, y?:number, z?:number, w?:number):Pt {
    let p = Pt.getArgs(x,y,z,w);
    if (p[0] != undefined) this.x = p[0];
    if (p[1] != undefined) this.y = p[1];
    if (p[2] != undefined) this.z = p[2];
    if (p[3] != undefined) this.w = p[3];
    return this;
  }

  get dims():number { return this.data.length; }

  get x():number { return this.get(0); }
  set x( _x:number ) {this.set(0, _x); }

  get y():number { return this.get(1); }
  set y( _y:number ) {this.set(1, _y); }

  get z():number { return this.get(2); }
  set z( _z:number ) {this.set(2, _z); }

  get w():number { return this.get(3); }
  set w( _w:number ) {this.set(3, _w); }



}