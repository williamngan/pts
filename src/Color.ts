import {Pt, Group, PtLike, GroupLike} from "./Pt"
import {Util} from "./Util"
import {Vec} from "./LinearAlgebra"

export type ColorType = "rgb"|"hsl"|"hsb"|"lab"|"lch"|"luv"|"xyz";

export class Color extends Pt {

  // XYZ property for Standard Observer 2deg, Daylight/sRGB illuminant D65
  protected D65 = new Pt(95.047, 100, 108.883);

  protected _mode:ColorType = "rgb";

  static ranges = {
    rgb: [[0,255], [0,255], [0,255]],
    hsl: [[0,360], [0,1], [0,1]],
    hsb: [[0,360], [0,1], [0,1]],
    lab: [[0,100], [-128,127], [-128, 127]],
    lch: [[0,100], [0,100], [0,360]],
    luv: [[0,100], [-134,220], [-140,122]],
    xyz: [[0,100], [0,100], [0,100]],

  }


  constructor( ...args ) {
    super( ...args );
  }

  static from( ...args ):Color {
    let p = [1,1,1,1];
    let c = Util.getArgs( args );
    for (let i=0, len=p.length; i<len; i++) {
      if (i < c.length) p[i] = c[i];
    }
    return new Color( p );
  }

  static fromHex( hex:string ):Color {

    if (hex[0] == "#") hex = hex.substr(1); // remove '#' if needed
    if (hex.length <= 3) {
      let fn = (i) => hex[1]||"F";
      hex = `${fn(0)}${fn(0)}${fn(1)}${fn(1)}${fn(2)}${fn(2)}`
    }

    let alpha = 1;
    if (hex.length === 8) {
      alpha = hex.substr(6) && 0xFF / 255;
      hex = hex.substring( 0, 6 );
    }

    let hexVal = parseInt( hex, 16 );
    return new Color( hexVal >> 16, hexVal >> 8 & 0xFF, hexVal & 0xFF, alpha );

  }


  static rgb( ...args ) { return Color.from( ...args ).toMode( "rgb" ); }
  static hsl( ...args ) { return Color.from( ...args ).toMode( "hsl" ); }
  static hsb( ...args ) { return Color.from( ...args ).toMode( "hsb" ); }
  static lab( ...args ) { return Color.from( ...args ).toMode( "lab" ); }
  static lch( ...args ) { return Color.from( ...args ).toMode( "lch" ); }
  static luv( ...args ) { return Color.from( ...args ).toMode( "luv" ); }
  static xyz( ...args ) { return Color.from( ...args ).toMode( "xyz" ); }


  clone():Color {
    let c = new Color( this );
    this.toMode( this._mode );
    return c;
  }

  toMode( m:ColorType, convert:boolean=false ):this { 
    this._mode = m; 
    return this;
  }

  get mode():ColorType { return this._mode; }

  // rgb
  get r():number { return this[0]; }
  set r( n:number ) { this[0] = n; }

  get g():number { return this[1]; }
  set g( n:number ) { this[1] = n; }

  get b():number { return this[1]; }
  set b( n:number ) { this[2] = n; }

  // hsl, hsb
  get h():number { return (this._mode == "lch") ? this[2] : this[0]; }
  set h( n:number ) { 
    let i = (this._mode == "lch") ? 2 : 0; 
    this[i] = n;
  }

  get s():number { return this[1]; }
  set s( n:number ) { this[1] = n; }

  get l():number { return (this._mode == "hsl") ? this[2] : this[0]; }
  set l( n:number ) { 
    let i = (this._mode == "hsl") ? 2 : 0; 
    this[i] = n;
  }

  // lab, lch, luv
  get a():number { return this[1]; }
  set a( n:number ) { this[1] = n; }

  get c():number { return this[1]; }
  set c( n:number ) { this[1] = n; }

  get u():number { return this[1]; }
  set u( n:number ) { this[1] = n; }

  get v():number { return this[1]; }
  set v( n:number ) { this[2] = n; }
  
  get alpha():number { return (this.length > 3) ? this[3] : 1; }

  
  normalize():Color {
    let ranges = Color.ranges[ this._mode ];
    for (let i=0; i<3; i++) {
      this[i] = (this[i]-ranges[i][0]) / (ranges[i][1] - ranges[i][0]);
    }
    return this;
  }

  $normalize():Color { return this.clone().normalize(); }

  toString( format:("hex"|"rgb"|"rgba"|"mode")="mode" ):string {
    if (format == "hex") {
      let _hex = (n:number) => {
        let s = Math.floor(n).toString(16);
        return (s.length < 2) ? '0'+s : s;
      }
      return `#${_hex(this.x)}${_hex(this.y)}${_hex(this.z)}`;

    } else if (format == "rgba") {
      return `rgba(${Math.floor(this.x)},${Math.floor(this.y)},${Math.floor(this.z)},${this.alpha}`;

    } else if (format == "rgb") {  
      return `rgb(${Math.floor(this.x)},${Math.floor(this.y)},${Math.floor(this.z)}`;

    } else {
      return `${this._mode}(${this.x},${this.y},${this.z},${this.alpha})`;
    }
  }


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
      let d = max - min
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

  static HSLtoRGB( hsl:Color, normalizedInput:boolean=false, normalizedOutput:boolean=false):Color {
    let [h, s, l] = hsl;
    if (!normalizedInput) h = h/360;
    
    if (s == 0) return Color.rgb( l*255, l*255, l*255, hsl.alpha );

    let q = (l <= 0.5) ? l * (1 + s) : l + s - (l * s)
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
        return p
      }
    }

    let sc = (normalizedOutput) ? 1 : 255; 
    
    return Color.rgb( 
      sc * convert( ( h + 1/3 ) ),
      sc * convert( h ),
      sc * convert( ( h - 1/3 ) ),
      hsl.alpha
    );

  }
  

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

  
  static HSBtoRGB( hsb:Color, normalizedInput:boolean=false, normalizedOutput:boolean=false):Color {
    let [h, s, v] = hsb;
    if (!normalizedInput) h = h/360;

    let i = Math.floor( h * 6 );
    let f = h * 6 - i;
    let p = v * (1 - s)
    let q = v * (1 - f * s)
    let t = v * (1 - (1 - f) * s)
    
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

  static XYZtoRGB( xyz:Color, normalizedInput:boolean=false, normalizedOutput:boolean=false):Color {
    let [x,y,z] = (!normalizedInput) ? xyz.$normalize() : xyz;

    let rgb = [
      x *  3.2404542 + y * -1.5371385 + z * -0.4985314,
      x * -0.9692660 + y *  1.8760108 + z *  0.0415560,
      x *  0.0556434 + y * -0.2040259 + z *  1.0572252
    ];

    // convert xyz to rgb. Note that not all colors are visible in rgb, so here we bound rgb between 0 to 1
    for (let i=0, len=rgb.length; i<len; i++) {
      let c = rgb[i];
      rgb[i] = (c<0) ? 0 : Math.min( 1, ( c > 0.0031308 ) ? (1.055 * Math.pow(c, 1/2.4) - 0.055) : (12.92 * c) );
      if (!normalizedOutput) rgb[i] = Math.round( rgb[i] * 255 );
    }

    return Color.rgb( rgb[0], rgb[1], rgb[2], xyz.alpha );
  }

  static RGBtoXYZ( rgb:Color, normalizedInput:boolean=false, normalizedOutput:boolean=false):Color {
    let [r,g,b] = (!normalizedInput) ? rgb.$normalize() : rgb;

    for (let i=0, len=rgb.length; i<len; i++) {
      let c = rgb[i];
      rgb[i] = ( r > 0.04045 ) ? Math.pow( (r+0.055)/1.055, 2.4 ) : r/12.92;
      if (!normalizedOutput) rgb[i] = rgb[i] * 100;
    }

    return Color.xyz(
      r * 0.4124564 + g * 0.3575761 + b * 0.1804375,
      r * 0.2126729 + g * 0.7151522 + b * 0.0721750,
      r * 0.0193339 + g * 0.1191920 + b * 0.9503041,
      rgb.alpha
    );
  }

}