import {Form} from "./Form";
import {Pt, Group, PtLike, GroupLike} from "./Pt";
import {CanvasSpace} from "./CanvasSpace";
import {Const, Util} from "./Util";

export class CanvasForm extends Form {

  protected _space:CanvasSpace;
  protected _ctx:CanvasRenderingContext2D;

  // store common styles so that they can be restored to canvas context when using multiple forms. See `reset()`.
  protected _style = {fillStyle: "#e51c23", strokeStyle:"#fff", lineWidth: 1, lineJoin: "miter", lineCap: "butt" }


  constructor( space:CanvasSpace ) {
    super();
    this._space = space;
    this._ctx = this._space.ctx;
    this._ctx.fillStyle = this._style.fillStyle;
    this._ctx.strokeStyle = this._style.strokeStyle;
  }

  get space():CanvasSpace { return this._space; }


  /**
   * Set current fill style. For example: `form.fill("#F90")` `form.fill("rgba(0,0,0,.5")` `form.fill(false)`
   * @param c fill color which can be as color, gradient, or pattern. (See [canvas documentation](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillStyle))
   * @return this
   */
  fill( c:string|boolean ):this {
    if (typeof c == "boolean") {
      this.filled = c;
    } else {
      this.filled = true;
      this._style.fillStyle = c;
      this._ctx.fillStyle = c;
    }
    return this;
  }


  /**
   * Set current stroke style. For example: `form.stroke("#F90")` `form.stroke("rgba(0,0,0,.5")` `form.stroke(false)` `form.stroke("#000", 0.5, 'round')`
   * @param c stroke color which can be as color, gradient, or pattern. (See [canvas documentation](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/strokeStyle))
   * @param width Optional value (can be floating point) to set line width
   * @param linejoin Optional string to set line joint style. Can be "miter", "bevel", or "round".
   * @param linecap Optional string to set line cap style. Can be "butt", "round", or "square".
   * @return this
   */
  stroke( c:string|boolean, width?:number, linejoin?:string, linecap?:string ):this {
    if (typeof c == "boolean") {
      this.stroked = c;
    } else {
      this.stroked = true;
      this._style.strokeStyle = c;
      this._ctx.strokeStyle = c;
      if (width) {
        this._ctx.lineWidth = width;
        this._style.lineWidth = width;
      }
      if (linejoin) {
        this._ctx.lineJoin = linejoin;
        this._style.lineJoin = linejoin;
      }
      if (linecap) {
        this._ctx.lineCap = linecap;
        this._style.lineCap = linecap;
      }
    }
    return this;
  }


  /**
   * Reset the rendering context's common styles to this form's styles. This supports using multiple forms on the same canvas context.
   */
  reset():this {
    for (let k in this._style) {
      this._ctx[k] = this._style[k];
    }
    return this;
  }


  protected _paint() {
    if (this._filled) this._ctx.fill();
    if (this._stroked) this._ctx.stroke();
  }

  point( p:PtLike, radius:number=5, shape:string="square" ):this {
    if (!CanvasForm[shape]) throw `${shape} is not a static function of CanvasForm`;

    CanvasForm[shape]( this._ctx, p, radius );
    this._paint();
    
    return this;
  }

  points( pts:GroupLike|number[][], radius:number=5, shape:string="square" ): this {
    for (let i=0, len=pts.length; i<len; i++) {
      this.point( pts[i], radius, shape );
    }
    return this;
  }

  static circle( ctx:CanvasRenderingContext2D, pt:PtLike, radius:number ) {
    ctx.beginPath()
    ctx.arc( pt[0], pt[1], radius, 0, Const.two_pi, false );
    ctx.closePath();
  }

  circle( pts:GroupLike ) {
    CanvasForm.circle( this._ctx, pts[0], pts[1][0] );
    this._paint();
    return this;
  }

  static ellipse( ctx:CanvasRenderingContext2D, pts:GroupLike|number[][] ) {
    if (pts.length<2) return;
    if (pts[1].length < 2) {
      CanvasForm.circle( ctx, pts[0], pts[1][0] );
    } else {
      ctx.ellipse( pts[0][0], pts[0][1], pts[1][0], pts[1][1], 0, 0, Const.two_pi );
    }
  }

  ellipse( pts:GroupLike|number[][] ):this {
    CanvasForm.ellipse( this._ctx, pts );
    return this;
  }


  static arc( ctx:CanvasRenderingContext2D, pt:PtLike, radius:number, startAngle:number, endAngle:number, cc?:boolean ) {
    ctx.beginPath()
    ctx.arc( pt[0], pt[1], radius, startAngle, endAngle, cc );
  }

  arc( pt:PtLike, radius:number, startAngle:number, endAngle:number, cc?:boolean ):this {
    CanvasForm.arc( this._ctx, pt, radius, startAngle, endAngle, cc );
    this._paint();
    return this;
  }

  static square( ctx:CanvasRenderingContext2D, pt:PtLike, halfsize:number ) {
    let x1 = pt[0]-halfsize
    let y1 = pt[1]-halfsize
    let x2 = pt[0]+halfsize
    let y2 = pt[1]+halfsize

    // faster than using `rect`
    ctx.beginPath()
    ctx.moveTo( x1, y1 )
    ctx.lineTo( x1, y2 )
    ctx.lineTo( x2, y2 )
    ctx.lineTo( x2, y1 )
    ctx.closePath()
  }

  line( pts:GroupLike|number[][] ):this {
    CanvasForm.line( this._ctx, pts );
    this._ctx.stroke();
    return this;
  }

  lines( pts:GroupLike[] ):this {
    this.line( Util.flatten( pts ) );
    return this;
  }

  static line( ctx:CanvasRenderingContext2D, pts:GroupLike|number[][] ) {
    if (pts.length<2) return;
    ctx.beginPath();
    ctx.moveTo( pts[0][0], pts[0][1] );
    for (let i=1, len=pts.length; i<len; i++) {
      if (pts[i]) ctx.lineTo( pts[i][0], pts[i][1] );
    }
  }


  static rect( ctx:CanvasRenderingContext2D, pts:GroupLike|number[][] ) {
    if (pts.length<2) return;
    ctx.beginPath();
    ctx.moveTo( pts[0][0], pts[0][1] );
    ctx.lineTo( pts[0][0], pts[1][1] );
    ctx.lineTo( pts[1][0], pts[1][1] );
    ctx.lineTo( pts[1][0], pts[0][1] );
    ctx.closePath();
  }


  rect( pts:number[][]|Pt[] ):this {
    CanvasForm.rect( this._ctx, pts );
    this._paint();
    return this;
  }


  /**
   * A static function to draw text
   * @param `ctx` canvas rendering context
   * @param `pt` a Point object to specify the anchor point
   * @param `txt` a string of text to draw
   * @param `maxWidth` specify a maximum width per line
   */
  static text( ctx:CanvasRenderingContext2D, pt:PtLike, txt:string, maxWidth?:number ) {
    if (!pt) return;
    ctx.fillText( txt, pt[0], pt[1], maxWidth )
  }


  text( pt:PtLike, txt:string, maxWidth?:number): this {
    CanvasForm.text( this._ctx, pt, txt, maxWidth );
    return this;
  }

  log( txt ):this {
    this._ctx.font = "12px sans-serif";
    let w = this._ctx.measureText( txt ).width + 20;
    this.stroke(false).fill("rgba(0,0,0,.4)").rect( [[0,0], [w, 20]] );
    this.fill("#fff").text( [10,14], txt );   
    return this;
  }


  draw( ps:Pt[], shape?:string ):this {
    return this;
  }
  
}