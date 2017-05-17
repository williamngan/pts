import {Vector} from "vectorious";

export interface IPt {
  x?:number,
  y?:number,
  z?:number,
  w?:number
}

export class Pt extends Vector implements IPt {

  constructor( ...args:any[]) {
    super( Pt.getArgs( args ) );
  }

  static getArgs( args:any[] ):Array<number> {
    if (args.length<1) return [];

    var pos = [];
    
    // positional arguments: x,y,z,w
    if (typeof args[0] === 'number') {
      pos = Array.prototype.slice.call( args );

    // as an object of {x, y?, z?, w?}
    } else if (typeof args[0] === 'object' && !Array.isArray( args[0] )) {
      let a:Array<string> = ["x", "y", "z", "w"];
      for (let p of a) {
        if ( args[0][p] == undefined) break;
        pos.push( args[0][p] );
      }

    // as an array of values
    } else if (Array.isArray( args[0] )) {
      let _x = args[0] as Array<number>;
      pos = _x.slice();
    }
    
    return pos;
  }

  to( ...args:any[]):Pt {
    let p = Pt.getArgs( args );
    if (p[0] != undefined) this.x = p[0];
    if (p[1] != undefined) this.y = p[1];
    if (p[2] != undefined) this.z = p[2];
    if (p[3] != undefined) this.w = p[3];
    return this;
  }


  get x():number { return this.get(0); }
  set x( _x:number ) {this.set(0, _x); }

  get y():number { return this.get(1); }
  set y( _y:number ) {this.set(1, _y); }

  get z():number { return this.get(2); }
  set z( _z:number ) {this.set(2, _z); }

  get w():number { return this.get(3); }
  set w( _w:number ) {this.set(3, _w); }



}