import {Pt} from "./Pt";
import {Bound} from "./Bound";

export class Create {

  static distributeRandom( bound:Bound, count:number ):Pt[] {
    let pts = [];
    for (let i=0; i<count; i++) {
      pts.push( new Pt(
        bound.x + Math.random()*bound.width,
        bound.y + Math.random()*bound.height,
        bound.z + Math.random()*bound.depth
      ));
    }
    return pts;
  }

}