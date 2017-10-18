// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan)


import {MultiTouchSpace} from './Space';
import {VisualForm, Font} from "./Form";
import {Bound} from './Bound';
import {Pt, PtLike, GroupLike} from "./Pt";
import {Const} from "./Util";


export interface PtsCanvasRenderingContext2D extends CanvasRenderingContext2D {
  webkitBackingStorePixelRatio?:number;
  mozBackingStorePixelRatio?:number;
  msBackingStorePixelRatio?:number;
  oBackingStorePixelRatio?:number;
  backingStorePixelRatio?:number;
}


/**
* CanvasSpace is an implementation of the abstract class Space. It represents a space for HTML Canvas.
* Learn more about the concept of Space in [this guide](..guide/Space-0500.html)
*/
export class CanvasSpace extends MultiTouchSpace {
  
  protected _canvas:HTMLCanvasElement;
  protected _container:Element;

  protected _pixelScale = 1;
  protected _autoResize = true;
  protected _bgcolor = "#e1e9f0";
  protected _ctx:PtsCanvasRenderingContext2D;
  
  protected _offscreen = false;
  protected _offCanvas:HTMLCanvasElement;
  protected _offCtx:PtsCanvasRenderingContext2D;

  protected _initialResize = false;
  

  
  /**
  * Create a CanvasSpace which represents a HTML Canvas Space
  * @param elem Specify an element by its "id" attribute as string, or by the element object itself. An element can be an existing `<canvas>`, or a `<div>` container in which a new `<canvas>` will be created. If left empty, a `<div id="pt_container"><canvas id="pt" /></div>` will be added to DOM. Use css to customize its appearance if needed.
  * @param callback an optional callback `function(boundingBox, spaceElement)` to be called when canvas is appended and ready. Alternatively, a "ready" event will also be fired from the `<canvas>` element when it's appended, which can be traced with `spaceInstance.canvas.addEventListener("ready")`
  * @example `new CanvasSpace( "#myElementID" )`
  */
  constructor( elem:string|Element, callback?:Function) {
    super();
    
    var _selector:Element = null;
    var _existed = false;
    this.id = "pt";
    
    // check element or element id string
    if ( elem instanceof Element ) {
      _selector = elem;
      this.id = "pts_existing_space";
    } else {;
      _selector = document.querySelector( <string>elem );
      _existed = true;
      this.id = elem;
    }
    
    // if selector is not defined, create a canvas
    if (!_selector) {      
      this._container = this._createElement( "div", this.id+"_container" );
      this._canvas = this._createElement( "canvas", this.id ) as HTMLCanvasElement;
      this._container.appendChild( this._canvas );
      document.body.appendChild( this._container );
      _existed = false;
      
      // if selector is element but not canvas, create a canvas inside it
    } else if (_selector.nodeName.toLowerCase() != "canvas") {      
      this._container = _selector;
      this._canvas = this._createElement( "canvas", this.id+"_canvas" ) as HTMLCanvasElement;
      this._container.appendChild( this._canvas );
      this._initialResize = true;
      
      // if selector is an existing canvas
    } else {
      this._canvas = _selector as HTMLCanvasElement;
      this._container = _selector.parentElement;
      this._autoResize = false;
    }
    
    // if size is known then set it immediately
    // if (_existed) {
    // let b = this._container.getBoundingClientRect();
    // this.resize( Bound.fromBoundingRect(b) );
    // }
    
    // no mutation observer, so we set a timeout for ready event
    setTimeout( this._ready.bind( this, callback ), 100 );
    
    // store canvas 2d rendering context
    this._ctx = this._canvas.getContext('2d');
    
  }
  
  
  /**
  * Helper function to create a DOM element
  * @param elem element tag name
  * @param id element id attribute
  */
  protected _createElement( elem="div", id ) {
    let d = document.createElement( elem );
    d.setAttribute("id", id);
    return d;
  }
  
  
  /**
  * Handle callbacks after element is mounted in DOM
  * @param callback 
  */
  private _ready( callback:Function ) {
    if (!this._container) throw new Error(`Cannot initiate #${this.id} element`);
    
    this._isReady = true;
    
    this._resizeHandler( null );

    this.clear( this._bgcolor );
    this._canvas.dispatchEvent( new Event("ready") );
    
    for (let k in this.players) {
      if (this.players.hasOwnProperty(k)) {
        if (this.players[k].start) this.players[k].start( this.bound.clone(), this );
      }
    }
    
    this._pointer = this.center;
    this._initialResize = false; // unset
    
    if (callback) callback( this.bound, this._canvas );
  }
  
  
  /**
  * Set up various options for CanvasSpace. The `opt` parameter is an object with the following fields. This is usually set during instantiation, eg `new CanvasSpace(...).setup( { opt } )`
  * @param opt an object with optional settings, as follows.
  * @param opt.bgcolor a hex or rgba string to set initial background color of the canvas, or use `false` or "transparent" to set a transparent background. You may also change it later with `clear()`    
  * @param opt.resize a boolean to set whether `<canvas>` size should auto resize to match its container's size. You can also set it manually with `autoSize()`    
  * @param opt.retina a boolean to set if device pixel scaling should be used. This may make drawings on retina displays look sharper but may reduce performance slightly. Default is `true`.    
  * @param opt.offscreen a boolean to set if a duplicate canvas should be created for offscreen rendering. Default is `false`.    
  * @example `space.setup({ bgcolor: "#f00", retina: true, resize: true })`
  */
  setup( opt:{bgcolor?:string, resize?:boolean, retina?:boolean, offscreen?:boolean} ):this {
    if (opt.bgcolor) this._bgcolor = opt.bgcolor;
    
    this.autoResize = (opt.resize != undefined) ? opt.resize : false;
    
    if (opt.retina !== false) {
      let r1 = window.devicePixelRatio || 1;
      let r2 = this._ctx.webkitBackingStorePixelRatio || this._ctx.mozBackingStorePixelRatio || this._ctx.msBackingStorePixelRatio || this._ctx.oBackingStorePixelRatio || this._ctx.backingStorePixelRatio || 1;      
      this._pixelScale = r1/r2;
    }
    
    if (opt.offscreen) {
      this._offscreen = true;
      this._offCanvas = this._createElement( "canvas", this.id+"_offscreen" ) as HTMLCanvasElement;
      this._offCtx = this._offCanvas.getContext('2d');
    } else {
      this._offscreen = false;
    }
    
    return this;
  }
  
  
  /**
  * Set whether the canvas element should resize when its container is resized. 
  * @param auto a boolean value indicating if auto size is set
  */
  set autoResize( auto ) {
    this._autoResize = auto;
    if (auto) {
      window.addEventListener( 'resize', this._resizeHandler.bind(this) );
    } else {
      window.removeEventListener( 'resize', this._resizeHandler.bind(this) );
    }
  }
  get autoResize(): boolean { return this._autoResize; }
  
  
    /**
  * This overrides Space's `resize` function. It's used as a callback function for window's resize event and not usually called directly. You can keep track of resize events with `resize: (bound ,evt)` callback in your player objects (See `Space`'s `add()` function). 
  * @param b a Bound object to resize to
  * @param evt Optionally pass a resize event
  */
  resize( b:Bound, evt?:Event):this {
    
    this.bound = b;

    this._canvas.width = this.bound.size.x * this._pixelScale;
    this._canvas.height = this.bound.size.y * this._pixelScale;
    this._canvas.style.width = Math.floor(this.bound.size.x) + "px";
    this._canvas.style.height = Math.floor(this.bound.size.y) + "px";
    
    if (this._offscreen) {
      this._offCanvas.width = this.bound.size.x * this._pixelScale;
      this._offCanvas.height = this.bound.size.y * this._pixelScale;
      // this._offCanvas.style.width = Math.floor(this.bound.size.x) + "px";
      // this._offCanvas.style.height = Math.floor(this.bound.size.y) + "px";
    }
    
    if (this._pixelScale != 1) {
      this._ctx.scale( this._pixelScale, this._pixelScale );
      this._ctx.translate( 0.5, 0.5);
      
      if (this._offscreen) {
        this._offCtx.scale( this._pixelScale, this._pixelScale );
        this._offCtx.translate( 0.5, 0.5);      
      }
    }
    
    for (let k in this.players) {
      if (this.players.hasOwnProperty(k)) {
        let p = this.players[k];
        if (p.resize) p.resize( this.bound, evt);
      }
    };
    
    this.render( this._ctx );

    // if it's a valid resize event and space is not playing, repaint the canvas once
    if (evt && !this.isPlaying) this.playOnce( 0 ); 
    
    return this;
  }
  
  
  /**
  * Window resize handling
  * @param evt 
  */
  protected _resizeHandler( evt:Event ) {
    let b = (this._autoResize || this._initialResize) ? this._container.getBoundingClientRect() : this._canvas.getBoundingClientRect();

    if (b) {
      let box = Bound.fromBoundingRect(b);
      
      // Need to compute offset from window scroll. See outerBound calculation in Space's _mouseAction 
      box.center = box.center.add( window.pageXOffset, window.pageYOffset ); 
      this.resize( box, evt );
    }
  }
  

  
  /**
  * `pixelScale` property returns a number that let you determine if the screen is "retina" (when value >= 2)
  */
  public get pixelScale():number {
    return this._pixelScale;
  }
  
  
  /**
  * Check if an offscreen canvas is created
  */
  public get hasOffscreen():boolean {
    return this._offscreen;
  }
  
  
  /**
  * Get the rendering context of offscreen canvas (if created via `setup()`)
  */
  public get offscreenCtx():PtsCanvasRenderingContext2D { return this._offCtx; }
  
  
  /**
  * Get the offscreen canvas element
  */
  public get offscreenCanvas():HTMLCanvasElement { return this._offCanvas; }
  
  

  
  /**
  * Get a new `CanvasForm` for drawing
  * @see `CanvasForm`
  */
  public getForm():CanvasForm { return new CanvasForm(this); }
  
  
  /**
  * Get the html canvas element
  */
  get element():HTMLCanvasElement {
    return this._canvas;
  }
  
  
  /**
  * Get the parent element that contains the canvas element
  */
  get parent():Element {
    return this._container;
  }


  /**
   * A property to indicate if the Space is ready
   */
  get ready():boolean { 
    return this._isReady; 
  }
  
  
  /**
  * Get the rendering context of canvas
  */
  public get ctx():PtsCanvasRenderingContext2D { return this._ctx; }
  
  
  
  /**
  * Clear the canvas with its background color. Overrides Space's `clear` function.
  * @param bg Optionally specify a custom background color in hex or rgba string, or "transparent". If not defined, it will use its `bgcolor` property as background color to clear the canvas.
  */
  clear( bg?:string ):this {
    
    if (bg) this._bgcolor = bg;
    let lastColor = this._ctx.fillStyle;
    
    if (this._bgcolor && this._bgcolor != "transparent") {
      this._ctx.fillStyle = this._bgcolor;
      this._ctx.fillRect( -1, -1, this._canvas.width+1, this._canvas.height+1 );
    } else {
      this._ctx.clearRect( -1, -1, this._canvas.width+1, this._canvas.height+1 );
    }
    
    this._ctx.fillStyle = lastColor;
    return this;
  }
  
  
  /**
  * Similiar to `clear()` but clear the offscreen canvas instead
  * @param bg Optionally specify a custom background color in hex or rgba string, or "transparent". If not defined, it will use its `bgcolor` property as background color to clear the canvas.
  */
  clearOffscreen( bg?:string ):this {
    if (this._offscreen) {
      if (bg) {
        this._offCtx.fillStyle = bg;
        this._offCtx.fillRect( -1, -1, this._canvas.width+1, this._canvas.height+1 );
      } else {
        this._offCtx.clearRect( -1, -1, this._offCanvas.width+1, this._offCanvas.height+1 );
      }
    }
    return this;
  }
  
  
  /**
  * Main animation function. Call `Space.playItems`.
  * @param time current time
  */
  protected playItems( time: number ) {
    if (this._isReady) {
      this._ctx.save();
      if (this._offscreen) this._offCtx.save();
      super.playItems( time );
      this._ctx.restore();
      if (this._offscreen) this._offCtx.restore();
      this.render( this._ctx );
    }
  }
  
  

}





/**
* CanvasForm is an implementation of abstract class VisualForm. It provide methods to express Pts on CanvasSpace.   
* You may extend CanvasForm to implement your own expressions for CanvasSpace.
*/
export class CanvasForm extends VisualForm {
  
  protected _space:CanvasSpace;
  protected _ctx:CanvasRenderingContext2D;  

  /** 
  * store common styles so that they can be restored to canvas context when using multiple forms. See `reset()`.
  */
  protected _style = {
    fillStyle: "#f03", strokeStyle:"#fff", 
    lineWidth: 1, lineJoin: "bevel", lineCap: "butt",
  };
  
  
  /**
  * Create a new CanvasForm. You may also use `space.getForm()` to get the default form.
  * @param space an instance of CanvasSpace
  */
  constructor( space:CanvasSpace ) {
    super();
    this._space = space;
    
    this._space.add( { start: () => {
      this._ctx = this._space.ctx;
      this._ctx.fillStyle = this._style.fillStyle;
      this._ctx.strokeStyle = this._style.strokeStyle;    
      this._ctx.lineJoin = "bevel";
      this._ctx.font = this._font.value;
      this._ready = true;
    }} );
  }
  
  
  /**
  * get the CanvasSpace instance that this form is associated with
  */
  get space():CanvasSpace { return this._space; }
  

  /**
  * Toggle whether to draw on offscreen canvas (if offscreen is set in CanvasSpace)
  * @param off if `true`, draw on offscreen canvas instead of the visible canvas. Default is `true`
  * @param clear optionally provide a valid color string to fill a bg color. see CanvasSpace's `clearOffscreen` function.
  */
  useOffscreen( off:boolean=true, clear:boolean|string=false ) {
    if (clear) this._space.clearOffscreen( (typeof clear == "string") ? clear : null );
    this._ctx = (this._space.hasOffscreen && off) ? this._space.offscreenCtx : this._space.ctx;
    return this;
  }
  
  
  /**
  * Render the offscreen canvas's content on the visible canvas
  * @param offset Optional offset on the top-left position when drawing on the visible canvas
  */
  renderOffscreen( offset:PtLike=[0,0] ) {
    if (this._space.hasOffscreen) {
      this._space.ctx.drawImage( 
        this._space.offscreenCanvas, offset[0], offset[1], this._space.width, this._space.height );
      }
    }
    
    
    /**
    * Set current fill style. Provide a valid color string or `false` to specify no fill color.
    * @example `form.fill("#F90")`, `form.fill("rgba(0,0,0,.5")`, `form.fill(false)`
    * @param c fill color which can be as color, gradient, or pattern. (See [canvas documentation](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillStyle))
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
    * Set current stroke style. Provide a valid color string or `false` to specify no stroke color.
    * @example `form.stroke("#F90")`, `form.stroke("rgba(0,0,0,.5")`, `form.stroke(false)`, `form.stroke("#000", 0.5, 'round', 'square')`
    * @param c stroke color which can be as color, gradient, or pattern. (See [canvas documentation](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/strokeStyle))
    * @param width Optional value (can be floating point) to set line width
    * @param linejoin Optional string to set line joint style. Can be "miter", "bevel", or "round".
    * @param linecap Optional string to set line cap style. Can be "butt", "round", or "square".
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
    * Set the current font 
    * @param sizeOrFont either a number to specify font-size, or a `Font` object to specify all font properties
    * @param weight Optional font-weight string such as "bold"
    * @param style Optional font-style string such as "italic"
    * @param lineHeight Optional line-height number suchas 1.5
    * @param family Optional font-family such as "Helvetica, sans-serif"
    * @example `form.font( myFont )`, `form.font(14, "bold")`
    */
    font( sizeOrFont:number|Font, weight?:string, style?:string, lineHeight?:number, family?:string ):this {
      if (typeof sizeOrFont == "number") {
        
        this._font.size = sizeOrFont;
        if (family) this._font.face = family;
        if (weight) this._font.weight = weight;
        if (style) this._font.style = style;
        if (lineHeight) this._font.lineHeight = lineHeight;
        this._ctx.font = this._font.value;
        
      } else {
        this._font = sizeOrFont;
      }
      return this;
    }
    
    
    /**
    * Reset the rendering context's common styles to this form's styles. This supports using multiple forms on the same canvas context.
    */
    reset():this {
      for (let k in this._style) {
        if (this._style.hasOwnProperty(k)) {
          this._ctx[k] = this._style[k];
        }
      }
      this._font = new Font();
      this._ctx.font = this._font.value;
      return this;
    }
    
    
    protected _paint() {
      if (this._filled) this._ctx.fill();
      if (this._stroked) this._ctx.stroke();
    }
    
    
    /**
    * Draws a point
    * @param p a Pt object
    * @param radius radius of the point. Default is 5.
    * @param shape The shape of the point. Defaults to "square", but it can be "circle" or a custom shape function in your own implementation.
    * @example `form.point( p )`, `form.point( p, 10, "circle" )`
    */
    point( p:PtLike, radius:number=5, shape:string="square" ):this {
      if (!p) return;
      if (!CanvasForm[shape]) throw new Error(`${shape} is not a static function of CanvasForm`);
      
      CanvasForm[shape]( this._ctx, p, radius );
      this._paint();
      
      return this;
    }
    
    
    /**
    * A static function to draw a circle
    * @param ctx canvas rendering context
    * @param pt center position of the circle
    * @param radius radius of the circle
    */
    static circle( ctx:CanvasRenderingContext2D, pt:PtLike, radius:number=10 ) {
      if (!pt) return;
      ctx.beginPath();
      ctx.arc( pt[0], pt[1], radius, 0, Const.two_pi, false );
      ctx.closePath();
    }
    
    
    /**
    * Draw a circle
    * @param pts usually a Group of 2 Pts, but it can also take an array of two numeric arrays [ [position], [size] ]
    * @see [`Circle.fromCenter`](./_op_.circle.html#frompt)
    */
    circle( pts:GroupLike|number[][] ):this {
      CanvasForm.circle( this._ctx, pts[0], pts[1][0] );
      this._paint();
      return this;
    }
    
    
    /**
    * A static function to draw an arc.
    * @param ctx canvas rendering context
    * @param pt center position 
    * @param radius radius of the arc circle
    * @param startAngle start angle of the arc
    * @param endAngle end angle of the arc
    * @param cc an optional boolean value to specify if it should be drawn clockwise (`false`) or counter-clockwise (`true`). Default is clockwise.
    */
    static arc( ctx:CanvasRenderingContext2D, pt:PtLike, radius:number, startAngle:number, endAngle:number, cc?:boolean ) {
      if (!pt) return;
      ctx.beginPath();
      ctx.arc( pt[0], pt[1], radius, startAngle, endAngle, cc );
    }
    
    
    /**
    * Draw an arc.
    * @param pt center position
    * @param radius radius of the arc circle
    * @param startAngle start angle of the arc
    * @param endAngle end angle of the arc
    * @param cc an optional boolean value to specify if it should be drawn clockwise (`false`) or counter-clockwise (`true`). Default is clockwise.
    */
    arc( pt:PtLike, radius:number, startAngle:number, endAngle:number, cc?:boolean ):this {
      CanvasForm.arc( this._ctx, pt, radius, startAngle, endAngle, cc );
      this._paint();
      return this;
    }
    
    
    /**
    * A static function to draw a square 
    * @param ctx canvas rendering context
    * @param pt center position of the square
    * @param halfsize half size of the square
    */
    static square( ctx:CanvasRenderingContext2D, pt:PtLike, halfsize:number ) {
      if (!pt) return;
      let x1 = pt[0]-halfsize;
      let y1 = pt[1]-halfsize;
      let x2 = pt[0]+halfsize;
      let y2 = pt[1]+halfsize;
      
      // faster than using `rect`
      ctx.beginPath();
      ctx.moveTo( x1, y1 );
      ctx.lineTo( x1, y2 );
      ctx.lineTo( x2, y2 );
      ctx.lineTo( x2, y1 );
      ctx.closePath();
    }
    
    
    /**
     * Draw a square, given a center and its half-size
     * @param pt center Pt
     * @param halfsize half-size
     */
    square( pt:PtLike, halfsize:number ) {
      CanvasForm.square( this._ctx, pt, halfsize );
      this._paint();
      return this;
    }

    
    /**
    * A static function to draw a line
    * @param ctx canvas rendering context
    * @param pts a Group of multiple Pts, or an array of multiple numeric arrays
    */
    static line( ctx:CanvasRenderingContext2D, pts:GroupLike|number[][] ) {
      if (pts.length<2) return;
      ctx.beginPath();
      ctx.moveTo( pts[0][0], pts[0][1] );
      for (let i=1, len=pts.length; i<len; i++) {
        if (pts[i]) ctx.lineTo( pts[i][0], pts[i][1] );
      }
    }
    
    
    /**
    * Draw a line or polyline
    * @param pts a Group of multiple Pts, or an array of multiple numeric arrays
    */
    line( pts:GroupLike|number[][] ):this {
      CanvasForm.line( this._ctx, pts );
      this._paint();
      return this;
    }
    
    
    /**
    * A static function to draw polygon
    * @param ctx canvas rendering context
    * @param pts a Group of multiple Pts, or an array of multiple numeric arrays
    */
    static polygon( ctx:CanvasRenderingContext2D, pts:GroupLike|number[][] ) {
      if (pts.length<2) return;
      ctx.beginPath();
      ctx.moveTo( pts[0][0], pts[0][1] );
      for (let i=1, len=pts.length; i<len; i++) {
        if (pts[i]) ctx.lineTo( pts[i][0], pts[i][1] );
      }
      ctx.closePath();
    }
    
    
    /**
    * Draw a polygon
    * @param pts a Group of multiple Pts, or an array of multiple numeric arrays
    */
    polygon( pts:GroupLike|number[][] ):this {
      CanvasForm.polygon( this._ctx, pts );
      this._paint();
      return this;
    }
    
    
    /**
    * A static function to draw a rectangle
    * @param ctx canvas rendering context
    * @param pts usually a Group of 2 Pts specifying the top-left and bottom-right positions. Alternatively it can be an array of numeric arrays.
    */
    static rect( ctx:CanvasRenderingContext2D, pts:GroupLike|number[][] ) {
      if (pts.length<2) return;
      ctx.beginPath();
      ctx.moveTo( pts[0][0], pts[0][1] );
      ctx.lineTo( pts[0][0], pts[1][1] );
      ctx.lineTo( pts[1][0], pts[1][1] );
      ctx.lineTo( pts[1][0], pts[0][1] );
      ctx.closePath();
    }
    
    
    /**
    * Draw a rectangle
    * @param pts usually a Group of 2 Pts specifying the top-left and bottom-right positions. Alternatively it can be an array of numeric arrays.
    */
    rect( pts:number[][]|Pt[] ):this {
      CanvasForm.rect( this._ctx, pts );
      this._paint();
      return this;
    }
    
    
    /**
    * A static function to draw text
    * @param ctx canvas rendering context
    * @param `pt` a Point object to specify the anchor point
    * @param `txt` a string of text to draw
    * @param `maxWidth` specify a maximum width per line
    */
    static text( ctx:CanvasRenderingContext2D, pt:PtLike, txt:string, maxWidth?:number ) {
      if (!pt) return;
      ctx.fillText( txt, pt[0], pt[1], maxWidth );
    }
    
    
    /**
    * Draw text on canvas
    * @param `pt` a Pt or numeric array to specify the anchor point
    * @param `txt` text
    * @param `maxWidth` specify a maximum width per line
    */
    text( pt:PtLike, txt:string, maxWidth?:number): this {
      CanvasForm.text( this._ctx, pt, txt, maxWidth );
      return this;
    }
    
    
    /**
    * A convenient way to draw some text on canvas for logging or debugging. It'll be draw on the top-left of the canvas as an overlay.
    * @param txt text
    */
    log( txt ):this {
      let w = this._ctx.measureText( txt ).width + 20;
      this.stroke(false).fill("rgba(0,0,0,.4)").rect( [[0,0], [w, 20]] );
      this.fill("#fff").text( [10,14], txt );   
      return this;
    }
    
  }