/*! Source code licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */

import {Pt, Group} from "./Pt";
import {Util} from "./Util";
import {Num, Geom} from "./Num";
import {PtLike, ColorType} from "./Types";


/**
 * Color is a subclass of Pt. Since a color in a color space is analogous to a point or vector in a space, you can apply all Pt operations to colors too. The Color class provides support for many color spaces like HSL and LAB.
 */
export class Color extends Pt {

  // XYZ property for Standard Observer 2deg, Daylight/sRGB illuminant D65
  private static D65:PtLike = new Pt(95.047, 100, 108.883, 1);

  protected _mode:ColorType = "rgb";
  private _isNorm:boolean = false;

  /**
   * Value range for each color space
   */
  static ranges:{ [name: string]: Group } = {
    rgb: new Group( new Pt(0,255), new Pt(0,255), new Pt(0,255) ),
    hsl: new Group( new Pt(0,360), new Pt(0,1), new Pt(0,1) ),
    hsb: new Group( new Pt(0,360), new Pt(0,1), new Pt(0,1) ),
    lab: new Group( new Pt(0,100), new Pt(-128,127), new Pt(-128, 127) ),
    lch: new Group( new Pt(0,100), new Pt(0,100), new Pt(0,360) ),
    luv: new Group( new Pt(0,100), new Pt(-134,220), new Pt(-140,122) ),
    xyz: new Group( new Pt(0,100), new Pt(0,100), new Pt(0,100) )
  };

  /**
   * Create a Color. Same as creating a Pt. Optionally you may use [`Color.from`](#link) to create a color.
   * @param args Pt-like parameters which can be a list of numeric parameters, an array of numbers, or an object with {x,y,z,w} properties
   */
  constructor( ...args ) {
    super( ...args );
  }


  /**
   * Create a Color object with 4 default dimensional values (1,1,1,1).
   * @param args Pt-like parameters which can be a list of numeric parameters, an array of numbers, or an object with {x,y,z,w} properties
   */
  static from( ...args ):Color {
    let p = [1,1,1,1];
    let c = Util.getArgs( args );
    for (let i=0, len=p.length; i<len; i++) {
      if (i < c.length) p[i] = c[i];
    }
    return new Color( p );
  }


  /**
   * Convert a rgb hex string like `"#FF0000"` or `"#F00"` to a Color object.
   * @param hex a hex string, with optional '#' prefix
   */
  static fromHex( hex:string ):Color {

    if (hex[0] == "#") hex = hex.substr(1); // remove '#' if needed
    if (hex.length <= 3) {
      let fn = (i) => hex[i]||"F";
      hex = `${fn(0)}${fn(0)}${fn(1)}${fn(1)}${fn(2)}${fn(2)}`;
    }

    let alpha = 1;
    if (hex.length === 8) {
      alpha = hex.substr(6) && 0xFF / 255;
      hex = hex.substring( 0, 6 );
    }

    let hexVal = parseInt( hex, 16 );
    return new Color( hexVal >> 16, hexVal >> 8 & 0xFF, hexVal & 0xFF, alpha );

  }


  /**
   * Create RGB Color. RGB color ranges are (0...255, 0...255, 0...255) respectively. You may use [`Color.normalize`](#link) to convert the ranges to 0...1.
   * @param args Pt-like parameters which can be a list of numeric parameters, an array of numbers, or an object with {x,y,z,w} properties.
   */
  static rgb( ...args ):Color { return Color.from( ...args ).toMode( "rgb" ); }
  
  /**
   * Create HSL Color. HSL color ranges are (0...360, 0...1, 0...1) respectively. You may use [`Color.normalize`](#link) to convert the ranges to 0...1.
   * @param args Pt-like parameters which can be a list of numeric parameters, an array of numbers, or an object with {x,y,z,w} properties.
   */
  static hsl( ...args ):Color { return Color.from( ...args ).toMode( "hsl" ); }

  /**
   * Create HSB Color. HSB color ranges are (0...360, 0...1, 0...1) respectively. You may use [`Color.normalize`](#link) to convert the ranges to 0...1.
   * @param args Pt-like parameters which can be a list of numeric parameters, an array of numbers, or an object with {x,y,z,w} properties.
   */
  static hsb( ...args ):Color { return Color.from( ...args ).toMode( "hsb" ); }
  
  /**
   * Create LAB Color. LAB color ranges are (0...100, -128...127, -128...127) respectively. You may use [`Color.normalize`](#link) to convert the ranges to 0...1.
   * @param args Pt-like parameters which can be a list of numeric parameters, an array of numbers, or an object with {x,y,z,w} properties.
   */
  static lab( ...args ):Color { return Color.from( ...args ).toMode( "lab" ); }

  /**
   * Create LCH Color. LCH color ranges are (0...100, 0...100, 0...360) respectively. You may use [`Color.normalize`](#link) to convert the ranges to 0...1.
   * @param args Pt-like parameters which can be a list of numeric parameters, an array of numbers, or an object with {x,y,z,w} properties.
   */
  static lch( ...args ):Color { return Color.from( ...args ).toMode( "lch" ); }

  /**
   * Create LUV Color. LUV color ranges are (0...100, -134...220, -140...122) respectively. You may use [`Color.normalize`](#link) to convert the ranges to 0...1.
   * @param args Pt-like parameters which can be a list of numeric parameters, an array of numbers, or an object with {x,y,z,w} properties.
   */
  static luv( ...args ):Color { return Color.from( ...args ).toMode( "luv" ); }

  /**
   * Create XYZ Color. XYZ color ranges are (0...100, 0...100, 0...100) respectively. You may use [`Color.normalize`](#link) to convert the ranges to 0...1.
   * @param args Pt-like parameters which can be a list of numeric parameters, an array of numbers, or an object with {x,y,z,w} properties.
   */
  static xyz( ...args ):Color { return Color.from( ...args ).toMode( "xyz" ); }


  /**
   * Get a Color object whose values are the maximum of its mode.
   * @param mode a mode string such as "rgb" or "lab"
   * @example Color.maxValue("rgb") will return a rgb Color object with values (255,255,255)
   */
  static maxValues( mode:string ):Pt { return Color.ranges[mode].zipSlice(1).$take([0,1,2]); }


  /**
   * Get a hex string such as "#FF0000". Same as `toString("hex")`.
   */
  public get hex():string { return this.toString("hex"); }
  
  /**
   * Get a rgb string such as "rgb(255,0,0)". Same as `toString("rgb")`.
   */
  public get rgb():string { return this.toString("rgb"); }

  /**
   * Get a rgba string such as "rgb(255,0,0,0.5)". Same as `toString("rgba")`.
   */
  public get rgba():string { return this.toString("rgba"); }
  

  /**
   * Clone this Color.
   */
  clone():Color {
    let c = new Color( this );
    c.toMode( this._mode );
    return c;
  }

  /**
   * Convert this color from current color space to another color space.
   * @param mode a ColorType string: "rgb" "hsl" "hsb" "lab" "lch" "luv" "xyz";
   * @param convert if `true`, convert this Color to the new color space specified in `mode`. Default is `false`, which only sets the color mode without converting color values.
   */
  toMode( mode:ColorType, convert:boolean=false ):this { 
    
    if (convert) {
      let fname = this._mode.toUpperCase()+"to"+mode.toUpperCase();      
      if (Color[fname]) {
        this.to( Color[fname]( this, this._isNorm, this._isNorm ) );
      } else {
        throw new Error( "Cannot convert color with "+fname);
      }
    }

    this._mode = mode; 
    return this;
  }


  /**
   * Get this Color's mode.
   */
  get mode():ColorType { return this._mode; }


  // rgb
  /**
   * the `r` value in RGB color mode. Same as `x`.
   */
  get r():number { return this[0]; }
  set r( n:number ) { this[0] = n; }

  /**
   * the `g` value in RGB color mode. Same as `y`.
   */
  get g():number { return this[1]; }
  set g( n:number ) { this[1] = n; }

  /**
   * the `b` value in RGB/LAB/HSB color mode. Same as `z`.
   */
  get b():number { return this[2]; }
  set b( n:number ) { this[2] = n; }

  // hsl, hsb
  /**
   * the `h` value in HSL/HSB or LCH color mode. Same as either `x` or `z` depending on current color mode.
   */
  get h():number { return (this._mode == "lch") ? this[2] : this[0]; }
  set h( n:number ) { 
    let i = (this._mode == "lch") ? 2 : 0; 
    this[i] = n;
  }

  /**
   * the `s` value in HSL/HSB color mode. Same as `y`.
   */
  get s():number { return this[1]; }
  set s( n:number ) { this[1] = n; }

  /**
   * the `l` value in HSL or LCH/LAB color mode. Same as either `x` or `z` depending on current color mode.
   */
  get l():number { return (this._mode == "hsl") ? this[2] : this[0]; }
  set l( n:number ) { 
    let i = (this._mode == "hsl") ? 2 : 0; 
    this[i] = n;
  }

  // lab, lch, luv
  /**
   * the `a` value in LAB color mode. Same as `y`.
   */
  get a():number { return this[1]; }
  set a( n:number ) { this[1] = n; }

  /**
   * the `c` value in LCH color mode. Same as `y`.
   */
  get c():number { return this[1]; }
  set c( n:number ) { this[1] = n; }

  /**
   * the `u` value in LUV color mode. Same as `y`.
   */
  get u():number { return this[1]; }
  set u( n:number ) { this[1] = n; }

  /**
   * the `v` value in LUV color mode. Same as `z`.
   */
  get v():number { return this[2]; }
  set v( n:number ) { this[2] = n; }


  /**
   * Get alpha value
   */
  get alpha():number { return (this.length > 3) ? this[3] : 1; }

  /**
   * Check if color values are normalized (between 0 to 1). If conversion is needed, use [`Color.normalize`](#link) function.
   */
  get normalized():boolean { return this._isNorm; }
  set normalized( b:boolean ) { this._isNorm = b; }


  /**
   * Normalize the color values to between 0 to 1, or revert it back to the min/max values in current color mode.
   * @param toNorm a boolean value specifying whether to normalize (`true`) or revert (`false`)
   */
  normalize( toNorm:boolean=true ):Color {
    if (this._isNorm == toNorm) return this;

    let ranges = Color.ranges[ this._mode ];
    
    for (let i=0; i<3; i++) {
      this[i] = (!toNorm) 
        ? Num.mapToRange( this[i], 0, 1, ranges[i][0], ranges[i][1] ) 
        : Num.mapToRange( this[i], ranges[i][0], ranges[i][1], 0, 1 );
    }
    
    this._isNorm = toNorm;

    return this;
  }


  /**
   * Like `normalize()` but returns a new Color.
   * @param toNorm a boolean value specifying whether to normalize (`true`) or revert (`false`)
   * @returns new Color
   */
  $normalize( toNorm:boolean=true ):Color { return this.clone().normalize( toNorm ); }


  /**
   * Convert this Color to a string. It can be used to get a hex or rgb string for use in rendering.
   * @param format "hex", "rgb", "rgba", or "mode" which means using current color mode label. Default is "mode".
   */
  toString( format:("hex"|"rgb"|"rgba"|"mode")="mode" ):string {
    if (format == "hex") {
      let _hex = (n:number) => {
        let s = Math.floor(n).toString(16);
        return (s.length < 2) ? '0'+s : s;
      };
      return `#${_hex(this[0])}${_hex(this[1])}${_hex(this[2])}`;

    } else if (format == "rgba") {
      return `rgba(${Math.floor(this[0])},${Math.floor(this[1])},${Math.floor(this[2])},${this.alpha}`;

    } else if (format == "rgb") {  
      return `rgb(${Math.floor(this[0])},${Math.floor(this[1])},${Math.floor(this[2])}`;

    } else {
      return `${this._mode}(${this[0]},${this[1]},${this[2]},${this.alpha})`;
    }
  }


  /**
   * A static function to convert RGB to HSL.
   * @param rgb a RGB Color
   * @param normalizedInput a boolean specifying whether input color is normalized. Default is not normalized: `false`.
   * @param normalizedOutput a boolean specifying whether output color shoud be normalized. Default is not normalized: `false`.
   * @returns a new HSL Color
   */
  static RGBtoHSL( rgb:Color, normalizedInput:boolean=false, normalizedOutput:boolean=false):Color {
    let [r,g,b] = (!normalizedInput) ? rgb.$normalize() : rgb;

    let max = Math.max( r, g, b );
    let min = Math.min( r, g, b );
    let h = (max+min)/2;
    let s = h;
    let l = h;

    if (max == min) {
      h = 0;
      s = 0; // achromatic
    } else {
      let d = max - min;
      s = (l > 0.5) ? d / (2 - max - min) : d / (max + min);

      h = 0;
      if (max === r) {
        h = (g - b) / d + ( (g < b) ? 6 : 0 );
      } else if (max === g) {
        h = (b - r) / d + 2;
      } else if (max === b) {
        h = (r - g) / d + 4;
      }
    }

    return Color.hsl( ((normalizedOutput) ? h/60 : h*60), s, l, rgb.alpha );
  }

  /**
   * A static function to convert HSL to RGB.
   * @param hsl a HSL Color
   * @param normalizedInput a boolean specifying whether input color is normalized. Default is not normalized: `false`.
   * @param normalizedOutput a boolean specifying whether output color shoud be normalized. Default is not normalized: `false`.
   * @returns a new RGB Color
   */
  static HSLtoRGB( hsl:Color, normalizedInput:boolean=false, normalizedOutput:boolean=false):Color {
    let [h, s, l] = hsl;
    if (!normalizedInput) h = h/360;
    
    if (s == 0) return Color.rgb( l*255, l*255, l*255, hsl.alpha );

    let q = (l <= 0.5) ? l * (1 + s) : l + s - (l * s);
    let p = 2 * l - q;

    let convert = (t) => {
      t = (t < 0) ? t + 1 : (t > 1) ? t - 1 : t;
      if (t * 6 < 1) {
        return p + (q - p) * t * 6;
      } else if (t * 2 < 1) {
        return q;
      } else if (t * 3 < 2) {
        return p + (q - p) * ((2 / 3) - t) * 6;
      } else {
        return p;
      }
    };

    let sc = (normalizedOutput) ? 1 : 255; 
    
    return Color.rgb( 
      sc * convert( ( h + 1/3 ) ),
      sc * convert( h ),
      sc * convert( ( h - 1/3 ) ),
      hsl.alpha
    );

  }
  
  /**
   * A static function to convert RGB to HSB.
   * @param rgb a RGB Color
   * @param normalizedInput a boolean specifying whether input color is normalized. Default is not normalized: `false`.
   * @param normalizedOutput a boolean specifying whether output color shoud be normalized. Default is not normalized: `false`.
   * @returns a new HSB Color
   */
  static RGBtoHSB( rgb:Color, normalizedInput:boolean=false, normalizedOutput:boolean=false):Color {
    let [r,g,b] = (!normalizedInput) ? rgb.$normalize() : rgb;

    let max = Math.max( r, g, b );
    let min = Math.min( r, g, b );
    let d = max - min;
    let h = 0;
    let s = (max === 0) ? 0 : d/max;
    let v = max;

    if (max != min) {
      if (max === r) {
        h = (g - b) / d + ( (g < b) ? 6 : 0 );
      } else if (max === g) {
        h = (b - r) / d + 2;
      } else if (max === b) {
        h = (r - g) / d + 4;
      }
    }

    return Color.hsb( ((normalizedOutput) ? h/60 : h*60), s, v, rgb.alpha );
  }


  /**
   * A static function to convert HSB to RGB.
   * @param hsb a HSB Color
   * @param normalizedInput a boolean specifying whether input color is normalized. Default is not normalized: `false`.
   * @param normalizedOutput a boolean specifying whether output color shoud be normalized. Default is not normalized: `false`.
   * @returns a new RGB Color
   */
  static HSBtoRGB( hsb:Color, normalizedInput:boolean=false, normalizedOutput:boolean=false):Color {
    let [h, s, v] = hsb;
    if (!normalizedInput) h = h/360;

    let i = Math.floor( h * 6 );
    let f = h * 6 - i;
    let p = v * (1 - s);
    let q = v * (1 - f * s);
    let t = v * (1 - (1 - f) * s);
    
    let pick = [
      [v, t, p], [q, v, p], [p, v, t],
      [p, q, v], [t, p, v], [v, p, q] 
    ];
    let c = pick[ i%6 ];
    
    let sc = (normalizedOutput) ? 1 : 255; 

    return Color.rgb( 
      sc * c[0],
      sc * c[1],
      sc * c[2],
      hsb.alpha
    );
  }

  /**
   * A static function to convert RGB to LAB.
   * @param rgb a RGB Color
   * @param normalizedInput a boolean specifying whether input color is normalized. Default is not normalized: `false`.
   * @param normalizedOutput a boolean specifying whether output color shoud be normalized. Default is not normalized: `false`.
   * @returns a new LAB Color
   */
  static RGBtoLAB( rgb:Color, normalizedInput:boolean=false, normalizedOutput:boolean=false):Color {
    let c = (normalizedInput) ? rgb.$normalize( false ) : rgb;
    return Color.XYZtoLAB( Color.RGBtoXYZ(c), false, normalizedOutput );
  }


  /**
   * A static function to convert LAB to RGB.
   * @param lab a LAB Color
   * @param normalizedInput a boolean specifying whether input color is normalized. Default is not normalized: `false`.
   * @param normalizedOutput a boolean specifying whether output color shoud be normalized. Default is not normalized: `false`.
   * @returns a new RGB Color
   */
  static LABtoRGB( lab:Color, normalizedInput:boolean=false, normalizedOutput:boolean=false):Color {
    let c = (normalizedInput) ? lab.$normalize( false ) : lab;
    return Color.XYZtoRGB( Color.LABtoXYZ( c ), false, normalizedOutput );
  }


  /**
   * A static function to convert RGB to LCH.
   * @param rgb a RGB Color
   * @param normalizedInput a boolean specifying whether input color is normalized. Default is not normalized: `false`.
   * @param normalizedOutput a boolean specifying whether output color shoud be normalized. Default is not normalized: `false`.
   * @returns a new LCH Color
   */
  static RGBtoLCH( rgb:Color, normalizedInput:boolean=false, normalizedOutput:boolean=false):Color {
    let c = (normalizedInput) ? rgb.$normalize( false ) : rgb;
    return Color.LABtoLCH( Color.RGBtoLAB(c), false, normalizedOutput );
  }
  

  /**
   * A static function to convert LCH to RGB.
   * @param lch a LCH Color
   * @param normalizedInput a boolean specifying whether input color is normalized. Default is not normalized: `false`.
   * @param normalizedOutput a boolean specifying whether output color shoud be normalized. Default is not normalized: `false`.
   * @returns a new RGB Color
   */
  static LCHtoRGB( lch:Color, normalizedInput:boolean=false, normalizedOutput:boolean=false):Color {
    let c = (normalizedInput) ? lch.$normalize( false ) : lch;
    return Color.LABtoRGB( Color.LCHtoLAB(c), false, normalizedOutput );
  }


  /**
   * A static function to convert RGB to LUV.
   * @param rgb a RGB Color
   * @param normalizedInput a boolean specifying whether input color is normalized. Default is not normalized: `false`.
   * @param normalizedOutput a boolean specifying whether output color shoud be normalized. Default is not normalized: `false`.
   * @returns a new LUV Color
   */
  static RGBtoLUV( rgb:Color, normalizedInput:boolean=false, normalizedOutput:boolean=false):Color {
    let c = (normalizedInput) ? rgb.$normalize( false ) : rgb;
    return Color.XYZtoLUV( Color.RGBtoXYZ(c), false, normalizedOutput );
  }


  /**
   * A static function to convert LUV to RGB.
   * @param rgb a RGB Color
   * @param normalizedInput a boolean specifying whether input color is normalized. Default is not normalized: `false`.
   * @param normalizedOutput a boolean specifying whether output color shoud be normalized. Default is not normalized: `false`.
   * @returns a new RGB Color
   */
  static LUVtoRGB( luv:Color, normalizedInput:boolean=false, normalizedOutput:boolean=false):Color {
    let c = (normalizedInput) ? luv.$normalize( false ) : luv;
    return Color.XYZtoRGB( Color.LUVtoXYZ( c ), false, normalizedOutput );
  }


  /**
   * A static function to convert RGB to XYZ.
   * @param rgb a RGB Color
   * @param normalizedInput a boolean specifying whether input color is normalized. Default is not normalized: `false`.
   * @param normalizedOutput a boolean specifying whether output color shoud be normalized. Default is not normalized: `false`.
   * @returns a new XYZ Color
   */
  static RGBtoXYZ( rgb:Color, normalizedInput:boolean=false, normalizedOutput:boolean=false):Color {
    let c = (!normalizedInput) ? rgb.$normalize() : rgb.clone();

    for (let i=0; i<3; i++) {
      c[i] = ( c[i] > 0.04045 ) ? Math.pow( (c[i]+0.055)/1.055, 2.4 ) : c[i]/12.92;
      if (!normalizedOutput) c[i] = c[i] * 100;
    }

    let cc = Color.xyz(
      c[0] * 0.4124564 + c[1] * 0.3575761 + c[2] * 0.1804375,
      c[0] * 0.2126729 + c[1] * 0.7151522 + c[2] * 0.0721750,
      c[0] * 0.0193339 + c[1] * 0.1191920 + c[2] * 0.9503041,
      rgb.alpha
    );

    return (normalizedOutput) ? cc.normalize() : cc;
  }


  /**
   * A static function to convert XYZ to RGB.
   * @param xyz a XYZ Color
   * @param normalizedInput a boolean specifying whether input color is normalized. Default is not normalized: `false`.
   * @param normalizedOutput a boolean specifying whether output color shoud be normalized. Default is not normalized: `false`.
   * @returns a new RGB Color
   */
  static XYZtoRGB( xyz:Color, normalizedInput:boolean=false, normalizedOutput:boolean=false):Color {
    let [x,y,z] = (!normalizedInput) ? xyz.$normalize() : xyz;

    let rgb = [
      x *  3.2404542 + y * -1.5371385 + z * -0.4985314,
      x * -0.9692660 + y *  1.8760108 + z *  0.0415560,
      x *  0.0556434 + y * -0.2040259 + z *  1.0572252
    ];

    // convert xyz to rgb. Note that not all colors are visible in rgb, so here we bound rgb between 0 to 1
    for (let i=0; i<3; i++) {
      rgb[i] = (rgb[i]<0) ? 0 : ( rgb[i] > 0.0031308 ) ? (1.055 * Math.pow(rgb[i], 1/2.4) - 0.055) : (12.92 * rgb[i]);
      rgb[i] = Math.max( 0,  Math.min( 1, rgb[i] ));
      if (!normalizedOutput) rgb[i] = Math.round( rgb[i] * 255 );
    }

    let cc = Color.rgb( rgb[0], rgb[1], rgb[2], xyz.alpha );
    return (normalizedOutput) ? cc.normalize() : cc;
  }


  /**
   * A static function to convert XYZ to LAB.
   * @param xyz a XYZ Color
   * @param normalizedInput a boolean specifying whether input color is normalized. Default is not normalized: `false`.
   * @param normalizedOutput a boolean specifying whether output color shoud be normalized. Default is not normalized: `false`.
   * @returns a new LAB Color
   */
  static XYZtoLAB( xyz:Color, normalizedInput:boolean=false, normalizedOutput:boolean=false):Color {
    let c = (normalizedInput) ? xyz.$normalize(false) : xyz.clone();

    // adjust for D65  
    c.divide( Color.D65 );

    let fn = (n)=> ( n > 0.008856 ) ? Math.pow(n, 1/3) : (7.787 * n) + 16/116;
    let cy = fn( c[1] );

    let cc = Color.lab(
      (116 * cy) - 16,
      500 * (fn(c[0]) - cy),
      200 * (cy - fn(c[2])),
      xyz.alpha
    );
    return (normalizedOutput) ? cc.normalize() : cc;
  }

  /**
   * A static function to convert LAB to XYZ.
   * @param lab a LAB Color
   * @param normalizedInput a boolean specifying whether input color is normalized. Default is not normalized: `false`.
   * @param normalizedOutput a boolean specifying whether output color shoud be normalized. Default is not normalized: `false`.
   * @returns a new XYZ Color
   */
  static LABtoXYZ( lab:Color, normalizedInput:boolean=false, normalizedOutput:boolean=false):Color {
    let c = (normalizedInput) ? lab.$normalize(false) : lab;
    let y = (c[0] + 16) / 116;
    let x = (c[1] / 500) + y;
    let z = y - c[2]/200;

    let fn = (n) => {
      let nnn = n*n*n;
      return ( nnn > 0.008856 ) ? nnn : ( n - 16 / 116 ) / 7.787;
    };

    let d = Color.D65;

    // adjusted
    let cc = Color.xyz(
      // Math.max(0, Math.min( 100, d[0] * fn(x) )),
      // Math.max(0, Math.min( 100, d[1] * fn(y) )),
      // Math.max(0, Math.min( 100, d[2] * fn(z) )),
      Math.max( 0, d[0] * fn(x) ),
      Math.max( 0, d[1] * fn(y) ),
      Math.max( 0, d[2] * fn(z) ),
      lab.alpha
    );

    return (normalizedOutput) ? cc.normalize() : cc;
  }


  /**
   * A static function to convert XYZ to LUV.
   * @param xyz a XYZ Color
   * @param normalizedInput a boolean specifying whether input color is normalized. Default is not normalized: `false`.
   * @param normalizedOutput a boolean specifying whether output color shoud be normalized. Default is not normalized: `false`.
   * @returns a new LUV Color
   */
  static XYZtoLUV( xyz:Color, normalizedInput:boolean=false, normalizedOutput:boolean=false):Color {
    let [x,y,z] = (normalizedInput) ? xyz.$normalize(false) : xyz;
    let u = (4 * x) / (x + (15 * y) + (3 * z));
    let v = (9 * y) / (x + (15 * y) + (3 * z));

    y = y / 100;
    y = ( y > 0.008856 ) ? Math.pow( y, 1/3 ) : ( 7.787 * y + 16 / 116 );

    let refU = (4 * Color.D65[0]) / (Color.D65[0] + (15 * Color.D65[1]) + ( 3 * Color.D65[2]));
    let refV = (9 * Color.D65[1]) / (Color.D65[0] + (15 * Color.D65[1]) + ( 3 * Color.D65[2]));

    let L = (116 * y) - 16;
    return Color.luv(
      L, 13*L*(u - refU), 13*L*(v - refV), xyz.alpha
    );
  }


  /**
   * A static function to convert LUV to XYZ.
   * @param luv a LUV Color
   * @param normalizedInput a boolean specifying whether input color is normalized. Default is not normalized: `false`.
   * @param normalizedOutput a boolean specifying whether output color shoud be normalized. Default is not normalized: `false`.
   * @returns a new XYZ Color
   */
  static LUVtoXYZ( luv:Color, normalizedInput:boolean=false, normalizedOutput:boolean=false):Color {
    let [l,u,v] = (normalizedInput) ? luv.$normalize(false) : luv;
    let y = ( l + 16 ) / 116;
    let cubeY = y*y*y;
    y = (cubeY > 0.008856) ? cubeY : (y - 16/116) / 7.787;

    let refU = (4 * Color.D65[0]) / ( Color.D65[0] + (15 * Color.D65[1]) + (3 * Color.D65[2]) );
    let refV = (9 * Color.D65[1]) / ( Color.D65[0] + (15 * Color.D65[1]) + (3 * Color.D65[2]) );

    u = u / (13 * l) + refU;
    v = v / (13 * l) + refV;

    y = y * 100;
    let x = -1*(9 * y * u)/((u-4)*v - u*v);
    let z = (9 * y - (15 * v * y) - (v * x))/(3 * v);

    return Color.xyz( x, y, z, luv.alpha );
  }


  /**
   * A static function to convert LAB to LCH.
   * @param lab a LAB Color
   * @param normalizedInput a boolean specifying whether input color is normalized. Default is not normalized: `false`.
   * @param normalizedOutput a boolean specifying whether output color shoud be normalized. Default is not normalized: `false`.
   * @returns a new LCH Color
   */
  static LABtoLCH( lab:Color, normalizedInput:boolean=false, normalizedOutput:boolean=false):Color {
    let c = (normalizedInput) ? lab.$normalize(false) : lab;
    let h = Geom.toDegree( Geom.boundRadian( Math.atan2( c[2], c[1] ) ) ); // 0 to 360 degrees
    return Color.lch(
      c[0], Math.sqrt( c[1]*c[1]+c[2]*c[2] ), h, lab.alpha
    );
  }


  /**
   * A static function to convert LCH to LAB.
   * @param lch a LCH Color
   * @param normalizedInput a boolean specifying whether input color is normalized. Default is not normalized: `false`.
   * @param normalizedOutput a boolean specifying whether output color shoud be normalized. Default is not normalized: `false`.
   * @returns a new LAB Color
   */
  static LCHtoLAB( lch:Color, normalizedInput:boolean=false, normalizedOutput:boolean=false):Color {
    let c = (normalizedInput) ? lch.$normalize(false) : lch;
    let rad = Geom.toRadian( c[2] );
    return Color.lab(
      c[0], Math.cos( rad ) * c[1], Math.sin( rad ) * c[1], lch.alpha
    );
  }


}