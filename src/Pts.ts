import {Pt} from "./Pt";

export class Pts {

  constructor() {
    
  }

  /**
   * Zip one slice of an array of Pt
   * @param pts an array of Pt
   * @param idx index to zip at
   * @param defaultValue a default value to fill if index out of bound. If not provided, it will throw an error instead.
   */
  static zipOne( pts:Pt[],  idx:number, defaultValue:number|boolean = false ):Pt {
    let f = (typeof defaultValue == "boolean") ? "get" : "at"; // choose `get` or `at` function
    return pts.reduce( (prev, curr) => { return prev.push( curr[f](idx, defaultValue) ); }, new Pt());
  }


  /**
   * Zip an array of Pt. eg, [[1,2],[3,4],[5,6]] => [[1,3,5],[2,4,6]]
   * @param pts an array of Pt
   * @param defaultValue a default value to fill if index out of bound. If not provided, it will throw an error instead.
   * @param useLongest If true, find the longest list of values in a Pt and use its length for zipping. Default is false, which uses the first item's length for zipping.
   */
  static zip( pts:Pt[], defaultValue:number|boolean = false, useLongest=false ):Pt[] {
    let ps = [];
    let len = (useLongest) ? pts.reduce( (a,b) => Math.max(a, b.length), 0 ) : pts[0].length;
    for (let i=0; i<len; i++) {
      ps.push( Pts.zipOne( pts, i, defaultValue ) )
    }
    return ps;
  }

  /**
   * Provide a string representation of an array of Pt
   * @param pts an array of Pt
   */
  static toString( pts:Pt[] ) {
    return pts.reduce( (a, b) => a + `${b.toString()}, `, "[ " ) + "]";
  }

}
