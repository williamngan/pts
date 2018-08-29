/*! Source code licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */

import { Const } from "./Util";
import { Curve } from "./Op";
import { Pt, Group } from "./Pt";
import { Vec, Mat } from "./LinearAlgebra";
import {PtLike, GroupLike} from "./Types";
/**
 * Num class provides static helper functions for basic numeric operations.
 */
export class Num {

  /**
   * Check if two numbers are equal or almost equal within a threshold.
   * @param a number a
   * @param b number b
   * @param threshold threshold value that specifies the minimum difference within which the two numbers are considered equal
   */
  static equals( a:number, b:number, threshold=0.00001 ):boolean {
    return Math.abs( a-b ) < threshold;
  }


  /**
   * Calculate linear interpolation between 2 values.
   * @param a start value
   * @param b end value
   * @param t an interpolation value, usually between 0 to 1
   */
  static lerp( a:number, b:number, t:number ):number {
    return (1 - t) * a + t * b;
  }


  /**
   * Clamp values between min and max.
   * @param val value to clamp
   * @param min min value
   * @param max max value
   */
  static clamp( val:number, min:number, max:number ):number {
    return Math.max(min, Math.min(max, val));
  }


  /**
   * Different from [`Num.clamp`](#link) in that the value out-of-bound will be "looped back" to the other end.
   * @param val value to bound
   * @param min min value
   * @param max max value
   * @example `boundValue(361, 0, 360)` will return 1
   */
  static boundValue( val:number, min:number, max:number ):number {
    let len = Math.abs(max - min);
    let a = val % len;

    if (a > max) a -= len;
    else if (a < min) a += len;

    return a;
  }


  /**
   * Check if a value is within two other values
   * @param p value to check
   * @param a first bounding value
   * @param b second bounding value
   */
  static within( p:number, a:number, b:number ):boolean {
    return p >= Math.min(a, b) && p <= Math.max(a, b);
  }


  /**
   * Get a random number within a range.
   * @param a range value 1
   * @param b range value 2
   */
  static randomRange( a:number, b:number = 0 ):number {
    let r = (a > b) ? (a - b) : (b - a);
    return a + Math.random() * r;
  }


  /**
   * Normalize a value within a range.
   * @param n the value to normalize
   * @param a range value 1
   * @param b range value 1
   */
  static normalizeValue(n:number, a:number, b:number):number {
    let min = Math.min(a, b);
    let max = Math.max(a, b);
    return (n - min) / (max - min);
  }


  /**
   * Sum a group of numeric arrays.
   * @param pts an array of numeric arrays
   * @returns a Pt of the dimensional sums
   */
  static sum(pts: GroupLike|number[][]): Pt {
    let c = new Pt( pts[0] );
    for (let i = 1, len = pts.length; i < len; i++) {
      Vec.add(c, pts[i]);
    }
    return c;
  }


  /**
   * Average a group of numeric arrays
   * @param pts an array of numeric arrays
   * @returns a Pt of averages
   */
  static average(pts: GroupLike|number[][]): Pt {
    return Num.sum(pts).divide(pts.length);
  }


  /**
   * Given a value between 0 to 1, returns a value that cycles between 0 -> 1 -> 0 using sine method.
   * @param t a value between 0 to 1
   * @return a value between 0 to 1
   */
  static cycle( t:number ):number {
    return (Math.sin( Math.PI * 2 * t ) + 1) / 2;
  }


  /**  
   * Map a value from one range to another.
   * @param n a value in the first range
   * @param currMin lower bound of the first range
   * @param currMax upper bound of the first range
   * @param targetMin lower bound of the second range
   * @param targetMax upper bound of the second range
   * @returns a remapped value in the second range
   */
  static mapToRange(n:number, currA:number, currB:number, targetA:number, targetB:number) {
    if (currA == currB) throw new Error("[currMin, currMax] must define a range that is not zero");
    let min = Math.min(targetA, targetB);
    let max = Math.max(targetA, targetB);
    return Num.normalizeValue(n, currA, currB) * (max - min) + min;
  }
}



/**
 * Geom class provides static helper functions for basic geometric operations.
 */
export class Geom {

  /**
   * Bound an angle between 0 to 360 degrees.
   * @param angle angle value
   */
  static boundAngle( angle:number ):number {
    return Num.boundValue(angle, 0, 360);
  }


  /**
   * Bound a radian between 0 to two PI.
   * @param radian radian value
   */
  static boundRadian( radian:number ):number {
    return Num.boundValue(radian, 0, Const.two_pi);
  }


  /**
   * Convert an angle in degree to radian.
   * @param angle angle value
   */
  static toRadian( angle:number ):number {
    return angle * Const.deg_to_rad;
  }


  /**
   * Convert an angle in radian to degree.
   * @param radian radian value
   */
  static toDegree( radian:number ):number {
    return radian * Const.rad_to_deg;
  }


  /**
   * Get a bounding box for a set of Pts.
   * @param pts a Group or an array of Pts
   * @return a Group of two Pts, representing the top-left and bottom-right corners
   */
  static boundingBox( pts:GroupLike ): Group {
    let minPt = pts.reduce((a: Pt, p: Pt) => a.$min(p));
    let maxPt = pts.reduce((a: Pt, p: Pt) => a.$max(p));
    return new Group(minPt, maxPt);
  }


  /**
   * Get a centroid (the average middle point) for a set of Pts.
   * @param pts a Group or an array of Pts
   * @return a centroid Pt 
   */
  static centroid( pts:GroupLike|number[][] ):Pt {
    return Num.average(pts);
  }


  /**
   * Given an anchor Pt, rebase all Pts in this group either to or from this anchor base.
   * @param pts a Group or array of Pt
   * @param ptOrIndex an index for the Pt array, or an external Pt
   * @param direction a string either "to" (subtract all Pt with this anchor base), or "from" (add all Pt from this anchor base)
   */
  static anchor( pts:GroupLike, ptOrIndex:PtLike|number=0, direction:("to"|"from")="to") {
    let method = (direction == "to") ? "subtract" : "add";
    for (let i = 0, len = pts.length; i < len; i++) {
      if (typeof ptOrIndex == "number") {
        if (ptOrIndex !== i) pts[i][method](pts[ptOrIndex]);
      } else {
        pts[i][method](ptOrIndex);
      }
    }
  }


  /**
   * Get an interpolated (or extrapolated) value between two Pts. For linear interpolation between 2 scalar values, use [`Num.lerp`](#link).
   * @param a first Pt
   * @param b second Pt
   * @param t a value between 0 to 1 to interpolate, or any other value to extrapolate
   * @returns interpolated point as a new Pt
   */
  static interpolate( a:Pt|number[], b:Pt|number[], t:number=0.5 ):Pt {
    let len = Math.min(a.length, b.length);
    let d = Pt.make(len);
    for (let i = 0; i < len; i++) {
      d[i] = a[i] * (1 - t) + b[i] * t;
    }
    return d;
  }


  /**
   * Find two Pts that are perpendicular to this Pt (2D only).
   * @param axis a string such as "xy" (use Const.xy) or an array to specify index for two dimensions
   * @returns an array of two Pt that are perpendicular to this Pt
   */
  static perpendicular( pt:PtLike, axis:string|number[]=Const.xy ):Group {
    let y = axis[1];
    let x = axis[0];

    let p = new Pt(pt);
    let pa = new Pt(p);
    pa[x] = -p[y];
    pa[y] = p[x];
    let pb = new Pt(p);
    pb[x] = p[y];
    pb[y] = -p[x];

    return new Group(pa, pb);
  }


  /**
   * Check if two Pts are perpendicular to each other (2D only).
   */
  static isPerpendicular( p1:PtLike, p2:PtLike ):boolean {
    return new Pt(p1).dot(p2) === 0;
  }


  /**
   * Check if a Pt is within the rectangular boundary defined by two Pts.
   * @param pt the Pt to check
   * @param boundPt1 boundary Pt 1
   * @param boundPt2 boundary Pt 2
   */
  static withinBound( pt:PtLike|number[], boundPt1:PtLike|number[], boundPt2:PtLike|number[] ):boolean {
    for (let i = 0, len = Math.min(pt.length, boundPt1.length, boundPt2.length); i < len; i++) {
      if (!Num.within(pt[i], boundPt1[i], boundPt2[i])) return false;
    }
    return true;
  }


  /**
   * Sort the Pts so that their edges will form a non-overlapping polygon. ([Reference](https://stackoverflow.com/questions/6989100/sort-points-in-clockwise-order))
   * @param pts an array of Pts
   */
  static sortEdges( pts:GroupLike ):GroupLike {

    let bounds = Geom.boundingBox( pts );
    let center = bounds[1].add(bounds[0]).divide(2);
    
    let fn = ( a:Pt, b:Pt ):number => {
      if (a.length < 2 || b.length < 2) throw new Error( "Pt dimension cannot be less than 2");

      let da = a.$subtract( center );
      let db = b.$subtract( center );
      
      if (da[0] >= 0 && db[0] < 0) return 1;
      if (da[0] < 0 && db[0] >= 0) return -1;
      if (da[0] == 0 && db[0] == 0) {
          if (da[1] >= 0 || db[1] >= 0)
              return (da[1] > db[1]) ? 1 : -1;
          return (db[1] > da[1]) ? 1 : -1;
      }

      // compute the cross product of vectors (center -> a) x (center -> b)
      let det = da.$cross2D( db );
      if (det < 0) return 1;
      if (det > 0) return -1;
      
      // points a and b are on the same line from the center
      // check which point is closer to the center
      return (da[0]*da[0] + da[1]*da[1] > db[0]*db[0] + db[1]*db[1]) ? 1 : -1;
    };

    return pts.sort( fn );
  }


  /**
   * Scale a Pt or a Group of Pts. You may also use [`Pt.scale`](#link) instance method.
   * @param ps a Pt or a Group of Pts
   * @param scale scale value
   * @param anchor optional anchor point to scale from
   */
  static scale( ps:Pt|GroupLike, scale:number|number[]|PtLike, anchor?:PtLike ):Geom {
    let pts = (!Array.isArray(ps)) ? [ps] : ps;
    let scs = (typeof scale == "number") ? Pt.make(pts[0].length, scale) : scale;
    if (!anchor) anchor = Pt.make(pts[0].length, 0);

    for (let i = 0, len = pts.length; i < len; i++) {
      let p = pts[i];
      for (let k = 0, lenP = p.length; k < lenP; k++) {
        p[k] = (anchor && anchor[k]) ? anchor[k] + (p[k] - anchor[k]) * scs[k] : p[k] * scs[k];
      }
    }

    return Geom;
  }


  /**
   * Rotate a Pt or a Group of Pts in 2D space. You may also use [`Pt.rotate2D`](#link) instance method.
   * @param ps a Pt or a Group of Pts
   * @param angle rotate angle
   * @param anchor optional anchor point to rotate from
   * @param axis optional axis such as "yz" to define a 2D plane of rotation
   */
  static rotate2D( ps:Pt|GroupLike, angle:number, anchor?:PtLike, axis?:string ):Geom {
    let pts = (!Array.isArray(ps)) ? [ps] : ps;
    let fn = (anchor) ? Mat.rotateAt2DMatrix : Mat.rotate2DMatrix;
    if (!anchor) anchor = Pt.make(pts[0].length, 0);
    let cos = Math.cos(angle);
    let sin = Math.sin(angle);

    for (let i = 0, len = pts.length; i < len; i++) {
      let p = (axis) ? pts[i].$take(axis) : pts[i];
      p.to(Mat.transform2D(p, fn(cos, sin, anchor)));
    }

    return Geom;
  }


  /**
   * Shear a Pt or a Group of Pts in 2D space. You may also use [`Pt.shear2D`](#link) instance method.
   * @param ps a Pt or a Group of Pts
   * @param scale shearing value which can be a number or an array of 2 numbers
   * @param anchor optional anchor point to shear from
   * @param axis optional axis such as "yz" to define a 2D plane of shearing
   */
  static shear2D( ps:Pt|GroupLike, scale:number|number[]|PtLike, anchor?:PtLike, axis?:string):Geom {
    let pts = (!Array.isArray(ps)) ? [ps] : ps;
    let s = (typeof scale == "number") ? [scale, scale] : scale;
    if (!anchor) anchor = Pt.make(pts[0].length, 0);
    let fn = (anchor) ? Mat.shearAt2DMatrix : Mat.shear2DMatrix;
    let tanx = Math.tan(s[0]);
    let tany = Math.tan(s[1]);

    for (let i = 0, len = pts.length; i < len; i++) {
      let p = (axis) ? pts[i].$take(axis) : pts[i];
      p.to(Mat.transform2D(p, fn(tanx, tany, anchor)));
    }

    return Geom;
  }


  /**
   * Reflect a Pt or a Group of Pts along a 2D line. You may also use [`Pt.reflect2D`](#link) instance method.
   * @param ps a Pt or a Group of Pts
   * @param line a Group of 2 Pts that defines a line for reflection
   * @param axis optional axis such as "yz" to define a 2D plane of reflection
   */
  static reflect2D( ps:Pt|GroupLike, line:GroupLike, axis?:string ):Geom {
    let pts = (!Array.isArray(ps)) ? [ps] : ps;
    let mat = Mat.reflectAt2DMatrix(line[0], line[1]);

    for (let i = 0, len = pts.length; i < len; i++) {
      let p = (axis) ? pts[i].$take(axis) : pts[i];
      p.to(Mat.transform2D(p, mat));
    }

    return Geom;
  }


  /**
   * Generate a cosine lookup table.
   * @returns an object with a cosine tables (array of 360 values) and a function to get cosine given a radian input. 
   */
  static cosTable() {
    let cos = new Float64Array(360);

    for (let i = 0; i < 360; i++) cos[i] = Math.cos(i * Math.PI / 180);
    let find = (rad:number) => cos[Math.floor(Geom.boundAngle(Geom.toDegree(rad)))];

    return { table: cos, cos: find };
  }

  /**
   * Generate a sine lookup table.
   * @returns an object with a sine tables (array of 360 values) and a function to get sine value given a radian input. 
   */
  static sinTable() {
    let sin = new Float64Array(360);

    for (let i = 0; i < 360; i++) sin[i] = Math.sin(i * Math.PI / 180);
    let find = (rad:number) => sin[Math.floor(Geom.boundAngle(Geom.toDegree(rad)))];

    return { table: sin, sin: find };
  }
}



/**
 * Shaping provides shaping functions to interpolate a value. These are useful for easing and transitions.
 */
export class Shaping {

  /**
   * Linear mapping.
   * @param t a value between 0 to 1
   * @param c the value to shape, default is 1
   */
  static linear(t:number, c:number = 1):number {
    return c * t;
  }

  /** 
   * Quadratic in, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/).
   * @param t a value between 0 to 1
   * @param c the value to shape, default is 1
  */
  static quadraticIn(t:number, c:number = 1):number {
    return c * t * t;
  }

  /** 
   * Quadratic out, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/).
   * @param t a value between 0 to 1
   * @param c the value to shape, default is 1
  */
  static quadraticOut(t:number, c:number = 1):number {
    return -c * t * (t - 2);
  }

  /** 
   * Quadratic in-out, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/).
   * @param t a value between 0 to 1
   * @param c the value to shape, default is 1
   */
  static quadraticInOut(t:number, c:number = 1):number {
    let dt = t * 2;
    return (t < 0.5) ? c / 2 * t * t * 4 : -c / 2 * ((dt - 1) * (dt - 3) - 1);
  }

  /** 
   * Cubic in, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/).
   * @param t a value between 0 to 1
   * @param c the value to shape, default is 1
   */
  static cubicIn(t:number, c:number = 1):number {
    return c * t * t * t;
  }

  /** 
   * Cubic out, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/).
   * @param t a value between 0 to 1
   * @param c the value to shape, default is 1
   */
  static cubicOut(t:number, c:number = 1):number {
    let dt = t - 1;
    return c * (dt * dt * dt + 1);
  }

  /** 
   * Cubic in-out, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/).
   * @param t a value between 0 to 1
   * @param c the value to shape, default is 1
   */
  static cubicInOut(t:number, c:number = 1):number {
    let dt = t * 2;
    return (t < 0.5) ? c / 2 * dt * dt * dt : c / 2 * ((dt - 2) * (dt - 2) * (dt - 2) + 2);
  }

  /** 
   * Exponential ease in, adapted from Golan Levin's [polynomial shapers](http://www.flong.com/texts/code/shapers_poly/).
   * @param t a value between 0 to 1
   * @param c the value to shape, default is 1
   * @param p a value between 0 to 1 to control the curve. Default is 0.25.
   */
  static exponentialIn(t:number, c:number = 1, p:number = 0.25):number {
    return c * Math.pow(t, 1 / p);
  }

  /** 
   * Exponential ease out, adapted from Golan Levin's [polynomial shapers](http://www.flong.com/texts/code/shapers_poly/).
   * @param t a value between 0 to 1
   * @param c the value to shape, default is 1
   * @param p a value between 0 to 1 to control the curve. Default is 0.25.
   */
  static exponentialOut(t:number, c:number = 1, p:number = 0.25):number {
    return c * Math.pow(t, p);
  }

  /** 
   * Sinuous in, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/).
   * @param t a value between 0 to 1
   * @param c the value to shape, default is 1
   */
  static sineIn(t:number, c:number = 1):number {
    return -c * Math.cos(t * Const.half_pi) + c;
  }

  /** 
   * Sinuous out, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/).
   * @param t a value between 0 to 1
   * @param c the value to shape, default is 1
   */
  static sineOut(t:number, c:number = 1):number {
    return c * Math.sin(t * Const.half_pi);
  }

  /** 
   * Sinuous in-out, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/).
   * @param t a value between 0 to 1
   * @param c the value to shape, default is 1
   */
  static sineInOut(t:number, c:number = 1):number {
    return -c / 2 * (Math.cos(Math.PI * t) - 1);
  }

  /** 
   * A faster way to approximate cosine ease in-out using Blinn-Wyvill Approximation. Adapated from Golan Levin's [polynomial shaping](http://www.flong.com/texts/code/shapers_poly/).
   * @param t a value between 0 to 1
   * @param c the value to shape, default is 1
   */
  static cosineApprox(t:number, c:number = 1) {
    let t2 = t * t;
    let t4 = t2 * t2;
    let t6 = t4 * t2;
    return c * (4 * t6 / 9 - 17 * t4 / 9 + 22 * t2 / 9);
  }

  /** 
   * Circular in, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/).
   * @param t a value between 0 to 1
   * @param c the value to shape, default is 1
   */
  static circularIn(t:number, c:number = 1):number {
    return -c * (Math.sqrt(1 - t * t) - 1);
  }

  /** 
   * Circular out, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/).
   * @param t a value between 0 to 1
   * @param c the value to shape, default is 1
   */
  static circularOut(t:number, c:number = 1):number {
    let dt = t - 1;
    return c * Math.sqrt(1 - dt * dt);
  }

  /** 
   * Circular in-out, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/).
   * @param t a value between 0 to 1
   * @param c the value to shape, default is 1
   */
  static circularInOut(t:number, c:number = 1):number {
    let dt = t * 2;
    return (t < 0.5) ? -c / 2 * (Math.sqrt(1 - dt * dt) - 1) : c / 2 * (Math.sqrt(1 - (dt - 2) * (dt - 2)) + 1);
  }

  /** 
   * Elastic in, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/).
   * @param t a value between 0 to 1
   * @param c the value to shape, default is 1
   * @param p elastic parmeter between 0 to 1. The lower the number, the more elastic it will be. Default is 0.7.
   */
  static elasticIn(t:number, c:number = 1, p:number = 0.7):number {
    let dt = t - 1;
    let s = (p / Const.two_pi) * 1.5707963267948966;
    return c * (-Math.pow(2, 10 * dt) * Math.sin((dt - s) * Const.two_pi / p));
  }

  /** 
   * Elastic out, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/).
   * @param t a value between 0 to 1
   * @param c the value to shape, default is 1
   * @param p elastic parmeter between 0 to 1. The lower the number, the more elastic it will be. Default is 0.7.
   */
  static elasticOut(t:number, c:number = 1, p:number = 0.7):number {
    let s = (p / Const.two_pi) * 1.5707963267948966;
    return c * (Math.pow(2, -10 * t) * Math.sin((t - s) * Const.two_pi / p)) + c;
  }

  /** 
   * Elastic in-out, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/).
   * @param t a value between 0 to 1
   * @param c the value to shape, default is 1
   * @param p elastic parmeter between 0 to 1. The lower the number, the more elastic it will be. Default is 0.6.
   */
  static elasticInOut(t:number, c:number = 1, p:number = 0.6):number {
    let dt = t * 2;
    let s = (p / Const.two_pi) * 1.5707963267948966;
    if (t < 0.5) {
      dt -= 1;
      return c * (-0.5 * (Math.pow(2, 10 * dt) * Math.sin((dt - s) * Const.two_pi / p)));
    } else {
      dt -= 1;
      return c * (0.5 * (Math.pow(2, -10 * dt) * Math.sin((dt - s) * Const.two_pi / p))) + c;
    }
  }

  /** 
   * Bounce in, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/).
   * @param t a value between 0 to 1
   * @param c the value to shape, default is 1
   */
  static bounceIn(t:number, c:number = 1):number {
    return c - Shaping.bounceOut((1 - t), c);
  }

  /** 
   * Bounce out, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/).
   * @param t a value between 0 to 1
   * @param c the value to shape, default is 1
   */
  static bounceOut(t:number, c:number = 1) {
    if (t < (1 / 2.75)) {
      return c * (7.5625 * t * t);
    } else if (t < (2 / 2.75)) {
      t -= 1.5 / 2.75;
      return c * (7.5625 * t * t + 0.75);
    } else if (t < (2.5 / 2.75)) {
      t -= 2.25 / 2.75;
      return c * (7.5625 * t * t + 0.9375);
    } else {
      t -= 2.625 / 2.75;
      return c * (7.5625 * t * t + 0.984375);
    }
  }

  /** 
   * Bounce in-out, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/).
   * @param t a value between 0 to 1
   * @param c the value to shape, default is 1
   */
  static bounceInOut(t:number, c:number = 1):number {
    return (t < 0.5) ? Shaping.bounceIn(t * 2, c) / 2 : Shaping.bounceOut(t * 2 - 1, c) / 2 + c / 2;
  }

  /** 
   * Sigmoid curve changes its shape adapted from the input value, but always returns a value between 0 to 1.
   * @param t a value between 0 to 1
   * @param c the value to shape, default is 1
   * @param p the larger the value, the "steeper" the curve will be. Default is 10.
   */
  static sigmoid(t:number, c:number = 1, p:number = 10):number {
    let d = p * (t - 0.5);
    return c / (1 + Math.exp(-d));
  }

  /** 
   * Logistic sigmoid, adapted from Golan Levin's [shaping function](http://www.flong.com/texts/code/shapers_exp/).
   * @param t a value between 0 to 1
   * @param c the value to shape, default is 1
   * @param p a parameter between 0 to 1 to control the steepness of the curve. Higher is steeper. Default is 0.7.
   */
  static logSigmoid(t:number, c:number = 1, p:number = 0.7):number {
    p = Math.max(Const.epsilon, Math.min(1 - Const.epsilon, p));
    p = 1 / (1 - p);

    let A = 1 / (1 + Math.exp(((t - 0.5) * p * -2)));
    let B = 1 / (1 + Math.exp(p));
    let C = 1 / (1 + Math.exp(-p));
    return c * (A - B) / (C - B);
  }


  /** 
   * Exponential seat curve, adapted from Golan Levin's [shaping functions](http://www.flong.com/texts/code/shapers_exp/).
   * @param t a value between 0 to 1
   * @param c the value to shape, default is 1
   * @param p a parameter between 0 to 1 to control the steepness of the curve. Higher is steeper. Default is 0.5.
   */
  static seat(t:number, c:number = 1, p:number = 0.5):number {
    if ((t < 0.5)) {
      return c * (Math.pow(2 * t, 1 - p)) / 2;
    } else {
      return c * (1 - (Math.pow(2 * (1 - t), 1 - p)) / 2);
    }
  }


  /** 
   * Quadratic bezier curve, adapted from Golan Levin's [shaping functions](http://www.flong.com/texts/code/shapers_exp/).
   * @param t a value between 0 to 1
   * @param c the value to shape, default is 1
   * @param p1 a Pt object specifying the first control Pt, or a value specifying the control Pt's x position (its y position will default to 0.5). Default is `Pt(0.95, 0.95)
   */
  static quadraticBezier(t:number, c:number = 1, p:number|PtLike=[0.05, 0.95] ):number {
    let a:number = (typeof p != "number") ? p[0] : p;
    let b:number = (typeof p != "number") ? p[1] : 0.5;
    let om2a = 1 - 2 * a;
    if (om2a === 0) {
      om2a = Const.epsilon;
    }
    let d = (Math.sqrt(a * a + om2a * t) - a) / om2a;
    return c * ((1 - 2 * b) * (d * d) + (2 * b) * d);
  }


  /** 
   * Cubic bezier curve. This reuses the bezier functions in Curve class.
   * @param t a value between 0 to 1
   * @param c the value to shape, default is 1
   * @param p1` a Pt object specifying the first control Pt. Default is `Pt(0.1, 0.7).
   * @param p2` a Pt object specifying the second control Pt. Default is `Pt(0.9, 0.2).
   */
  static cubicBezier(t:number, c:number = 1, p1:PtLike=[0.1, 0.7], p2:PtLike=[0.9, 0.2] ):number {
    let curve = new Group( new Pt(0, 0), new Pt(p1), new Pt(p2), new Pt(1, 1) );
    return c * Curve.bezierStep(new Pt(t*t*t, t*t, t, 1), Curve.controlPoints(curve)).y;
  }


  /** 
   * Give a Pt, draw a quadratic curve that will pass through that Pt as closely as possible. Adapted from Golan Levin's [shaping functions](http://www.flong.com/texts/code/shapers_poly/).
   * @param t a value between 0 to 1
   * @param c the value to shape, default is 1
   * @param p1` a Pt object specifying the Pt to pass through. Default is `Pt(0.2, 0.35)
   */
  static quadraticTarget(t:number, c:number = 1, p1:PtLike = [0.2, 0.35]):number {
    let a = Math.min(1 - Const.epsilon, Math.max( Const.epsilon, p1[0] ));
    let b = Math.min(1, Math.max( 0, p1[1] ));
    let A = (1 - b) / (1 - a) - (b / a);
    let B = (A * (a * a) - b) / a;
    let y = A * (t * t) - B * t;
    return c * Math.min(1, Math.max(0, y));
  }


  /** 
   * Step function is a simple jump from 0 to 1 at a specific Pt in time.
   * @param t a value between 0 to 1
   * @param c the value to shape, default is 1
   * @param p usually a value between 0 to 1, which specify the Pt to "jump". Default is 0.5 which is in the middle.
   */
  static cliff(t:number, c:number = 1, p:number = 0.5):number {
    return (t > p) ? c : 0;
  }

  /** 
   * Convert any shaping functions into a series of steps.
   * @param fn the original shaping function
   * @param steps the number of steps
   * @param t a value between 0 to 1
   * @param c the value to shape, default is 1
   * @param args optional paramters to pass to original function
   */
  static step(fn: Function, steps:number, t:number, c:number, ...args:any[]) {
    let s = 1 / steps;
    let tt = Math.floor(t / s) * s;
    return fn(tt, c, ...args);
  }

}


/**
 * Range object keeps track of a Group of n-dimensional Pts to provide its minimum, maximum, and magnitude in each dimension. 
 * It also provides convenient functions such as mapping the Group to another range. This class may be useful for visualizing data in charts.
 */
export class Range {

  protected _source:Group;
  protected _max:Pt;
  protected _min:Pt;
  protected _mag:Pt;
  protected _dims:number = 0;


  /**
   * Construct a Range instance for a Group of Pts.
   * @param g a Group or an array of Pts
   */
  constructor( g:GroupLike ) {
    this._source = Group.fromPtArray( g );
    this.calc();
  }

  /**
   * Get this Range's maximum values per dimension.
   */
  get max():Pt { return this._max.clone(); }
  
  /**
   * Get this Range's minimum values per dimension.
   */
  get min():Pt { return this._min.clone(); }
  
  /**
   * Get this Range's magnitude in each dimension.
   */
  get magnitude():Pt { return this._mag.clone(); }


  /**
   * Go through the group and find its min and max values. Usually you don't need to call this function directly.
   */
  calc():this {
    if (!this._source) return;
    let dims = this._source[0].length;
    this._dims = dims;
    let max = new Pt( dims );
    let min = new Pt( dims );
    let mag = new Pt( dims );

    for (let i=0; i<dims; i++) {
      max[i] = Const.min;
      min[i] = Const.max;
      mag[i] = 0;

      let s = this._source.zipSlice( i );
      for (let k=0, len=s.length; k<len; k++) {
        max[i] = Math.max( max[i], s[k] );
        min[i] = Math.min( min[i], s[k] );
        mag[i] = max[i] - min[i];
      }
    }

    this._max = max;
    this._min = min;
    this._mag = mag;
    return this;
  }


  /**
   * Map this Range to another range of values.
   * @param min target range's minimum value
   * @param max target range's maximum value
   * @param exclude Optional boolean array where `true` means excluding the conversion in that specific dimension.
   */
  mapTo( min:number, max:number, exclude?:boolean[] ):Group {
    let target = new Group();
    for (let i=0, len=this._source.length; i<len; i++) {
      let g = this._source[i];
      let n = new Pt( this._dims );
      for (let k=0; k<this._dims; k++) {
        n[k] = (exclude && exclude[k]) ? g[k] : Num.mapToRange( g[k], this._min[k], this._max[k], min, max ); 
      }
      target.push( n ); 
    }
    return target;
  }


  /**
   * Add more Pts to this Range and recalculate its min and max values.
   * @param g a Group or an array of Pts to append to this Range
   * @param update Optional. Set the parameter to `false` if you want to append without immediately updating this Range's min and max values. Default is `true`.
   */
  append( g:GroupLike, update:boolean=true ):this {
    if (g[0].length !== this._dims) throw new Error(`Dimensions don't match. ${this._dims} dimensions in Range and ${g[0].length} provided in parameter. `);
    this._source = this._source.concat( g ) as Group;
    if (update) this.calc();
    return this;
  }


  /**
   * Create a number of evenly spaced "ticks" that span this Range's min and max value.
   * @param count number of subdivision. For example, 10 subdivision will return 11 tick values, which include first(min) and last(max) values.
   */
  ticks( count:number ):Group {
    let g = new Group();
    for (let i=0; i<=count; i++) {
      let p = new Pt( this._dims );
      for (let k=0, len=this._max.length; k<len; k++) {
        p[k] = Num.lerp( this._min[k], this._max[k], i/count );
      }
      g.push( p );
    }
    return g;
  }

}