import {Pt} from "./Pt";
import {Bound} from "./Bound";

export class Create {

  static distributeRandom( bound:Bound, count:number, dimensions=2 ):Pt[] {
    let pts = [];
    for (let i=0; i<count; i++) {
      let p = [ bound.x + Math.random()*bound.width ];
      if (dimensions>1) p.push( bound.y + Math.random()*bound.height, );
      if (dimensions>2) p.push( bound.z + Math.random()*bound.depth );
      pts.push( new Pt( p ) );
    }
    return pts;
  }

}