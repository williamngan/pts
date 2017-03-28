import {Vector} from "vectorious";

interface IPt {
  x:number,
  y?:number,
  z?:number,
  w?:number
}

export default class Pt extends Vector {

  constructor(x:number|Array<number>|IPt, y?:number, z?:number, w?:number) {
    // positional arguments: x,y,z,w
    if (typeof x === 'number') {
      let p = y != undefined ? ( z != undefined ? ( w != undefined ? [x, y, z, w] : [x, y, z]) : [x, y] ) : [x];
      super(p);

    // as an object of {x, y?, z?, w?}, with a second argument of a default value if certain properties are undefined
    } else if (typeof x === 'object') {
      let a:Array<string> = ["x", "y", "z", "w"];
      let b = [];
      for (let p of a) {
        if (x[p] == undefined && y == undefined) break;
        b.push( x[p] || y );
      }
      super(b);

    // as an array of values
    } else {
      super(x);
    }

  }


}