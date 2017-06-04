import {Form} from "./Form";
import {IPt, Pt} from "./Pt";
import {CanvasSpace} from "./CanvasSpace";
import {Const} from "./Util";

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

  public get space():CanvasSpace { return this._space; }


  /**
   * Set current fill style. For example: `form.fill("#F90")` `form.fill("rgba(0,0,0,.5")` `form.fill(false)`
   * @param c fill color which can be as color, gradient, or pattern. (See [canvas documentation](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillStyle))
   * @return this
   */
  public fill( c:string|boolean ):this {
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
  public stroke( c:string|boolean, width?:number, linejoin?:string, linecap?:string ):this {
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
  public reset():this {
    for (let k in this._style) {
      this._ctx[k] = this._style[k];
    }
    return this;
  }


  protected _paint() {
    if (this._filled) this._ctx.fill();
    if (this._stroked) this._ctx.stroke();
  }

  public point( p:IPt, radius:number=5, shape:string="square" ):this {
    if (CanvasForm[shape]) {
      CanvasForm[shape]( this._ctx, p, radius );
      this._paint();
    } else {
      console.warn( `${shape} is not a static function of CanvasForm`);
    }
    return this;
  }


  public circle( pts:IPt, radius:number ) {
    CanvasForm.circle( this._ctx, pts, radius );
  }

  public static circle( ctx:CanvasRenderingContext2D, pt:IPt, radius:number ) {
    ctx.beginPath()
    ctx.arc( pt.x, pt.y, radius, 0, Const.two_pi, false );
    ctx.closePath();
  }

  public static square( ctx:CanvasRenderingContext2D, pt:IPt, halfsize:number ) {
    let x1 = pt.x-halfsize
    let y1 = pt.y-halfsize
    let x2 = pt.x+halfsize
    let y2 = pt.y+halfsize

    // faster than using `rect`
    ctx.beginPath()
    ctx.moveTo( x1, y1 )
    ctx.lineTo( x1, y2 )
    ctx.lineTo( x2, y2 )
    ctx.lineTo( x2, y1 )
    ctx.closePath()
  }


  public draw( ps:Pt[], shape?:string ):this {
    return this;
  }
  
}