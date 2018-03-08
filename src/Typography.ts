import {Pt, GroupLike} from "./Pt";

/** Various functions to support typography */
export class Typography {

  /**
   * Create a heuristic text width estimate function. It will be less accurate but faster.
   * @param fn a reference function that can measure text width accurately
   * @param samples a list of string samples. Default is ["M", "n", "."]
   * @param distribution a list of the samples' probability distribution. Default is [0.06, 0.8, 0.14].
   * @return a function that can estimate text width
   */
  static textWidthEstimator(  fn:(string) => number, samples:string[] = ["M", "n", "."], distribution:number[] = [0.06, 0.8, 0.14] ):(string) => number {
    let m = samples.map( fn );
    let avg = new Pt(distribution).dot( m );
    return (str:string) => str.length * avg;
  }


  /**
   * Truncate text to fit width
   * @param fn a function that can measure text width
   * @param str text to truncate
   * @param width width to fit
   * @param tail text to indicate overflow such as "...". Default is empty "".
   */
  static truncate( fn:(string) => number, str:string, width:number, tail:string="" ):[string, number] {
    let trim = Math.floor( str.length * Math.min( 1, width / (fn(str)*1.1) ) );
    if (trim < str.length) {
      trim = Math.max( 0, trim - tail.length );
      return [str.substr(0, trim) + tail, trim];
    } else {
      return [str, str.length];
    }
  }


  /**
   * Get a function to scale font size proportionally to text box size changes.
   * @param box Initial box as a Group
   * @param ratio font-size change ratio. Default is 1.
   * @returns a function where input parameter is a new box, and returns the new font size value
   */
  static fontSizeToBox( box:GroupLike, ratio:number=1 ) {
    let h = (box[1][1] - box[0][1]);
    let f = ratio * h;
    return function( b:GroupLike ) {
      let nh = (b[1][1] - b[0][1]) / h;
      return f * nh;
    };
  }
}

