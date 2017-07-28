// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan)


import {Space} from './Space';
import {Form, Font} from "./Form";
import {Bound} from './Bound';
import {Pt, IPt, Group, PtLike, GroupLike} from "./Pt";
import {Const, Util} from "./Util";


interface PtsCanvasRenderingContext2D extends CanvasRenderingContext2D {
  webkitBackingStorePixelRatio?:number;
  mozBackingStorePixelRatio?:number;
  msBackingStorePixelRatio?:number;
  oBackingStorePixelRatio?:number;
  backingStorePixelRatio?:number;
}

export type TouchPointsKey = "touches" | "changedTouches" | "targetTouches";

export class CanvasSpace extends Space {

  protected _canvas:HTMLCanvasElement;

  protected _container:Element;
  protected _pixelScale = 1;
  protected _autoResize = true;
  protected _bgcolor = "#e1e9f0";
  protected _ctx:PtsCanvasRenderingContext2D;

  protected _offscreen = false;
  protected _offCanvas:HTMLCanvasElement;
  protected _offCtx:PtsCanvasRenderingContext2D;

  // track mouse dragging
  private _pressed = false;
  private _dragged = false;

  private _hasMouse = false;
  private _hasTouch = false;
  
  private _renderFunc: Function = undefined;
  private _isReady = false;

  /**
   * Create a CanvasSpace which represents a HTML Canvas Space
   * @param elem Specify an element by its "id" attribute as string, or by the element object itself. An element can be an existing `<canvas>`, or a `<div>` container in which a new `<canvas>` will be created. If left empty, a `<div id="pt_container"><canvas id="pt" /></div>` will be added to DOM. Use css to customize its appearance if needed.
   * @param callback an optional callback `function(boundingBox, spaceElement)` to be called when canvas is appended and ready. A "ready" event will also be fired from the `<canvas>` element when it's appended, which can be traced with `spaceInstance.space.addEventListener("ready")`
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
    setTimeout( this._ready.bind( this, callback ), 50 );

    // store canvas 2d rendering context
    this._ctx = this._canvas.getContext('2d');

    //
    

  }


  /**
   * Helper function to create a DOM element
   * @param elem element tag name
   * @param id element id attribute
   */
  private _createElement( elem="div", id ) {
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

    let b = (this._autoResize) ? this._container.getBoundingClientRect() : this._canvas.getBoundingClientRect();
    if (b) this.resize( Bound.fromBoundingRect(b) );
    
    this.clear( this._bgcolor );
    this._canvas.dispatchEvent( new Event("ready") );

    for (let k in this.players) {
      if (this.players[k].start) this.players[k].start( this.bound.clone(), this );
    }

    this._pointer = this.center;

    if (callback) callback( this.bound, this._canvas );
  }


  /**
   * Set up various options for CanvasSpace. The `opt` parameter is an object with the following fields. This is usually set during instantiation, eg `new CanvasSpace(...).setup( { opt } )`
   * @param opt an object with optional settings, as follows.
   * @param opt.bgcolor a hex or rgba string to set initial background color of the canvas, or use `false` or "transparent" to set a transparent background. You may also change it later with `clear()`    
   * @param opt.resize a boolean to set whether `<canvas>` size should auto resize to match its container's size. You can also set it manually with `autoSize()`    
   * @param opt.retina a boolean to set if device pixel scaling should be used. This may make drawings on retina displays look sharper but may reduce performance slightly. Default is `true`.    
   * @param opt.offscreen a boolean to set if a duplicate canvas should be created for offscreen rendering. Default is `false`.    
   */
  setup( opt:{bgcolor?:string, resize?:boolean, retina?:boolean, offscreen?:boolean} ):this {
    if (opt.bgcolor) this._bgcolor = opt.bgcolor;
    
    if (opt.resize != undefined) this.autoResize( opt.resize );

    if (opt.retina !== false) {
      let r1 = window.devicePixelRatio || 1
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
   * Get the rendering context of canvas
   */
  public get ctx():PtsCanvasRenderingContext2D { return this._ctx; }

  /**
   * Get the canvas element in this space
   */
  public get canvas():HTMLCanvasElement { return this._canvas; }

  /**
   * Get the rendering context of offscreen canvas (if created via `setup()`)
   */
  public get offscreenCtx():PtsCanvasRenderingContext2D { return this._offCtx; }

  /**
   * Get the offscreen canvas element
   */
  public get offscreenCanvas():HTMLCanvasElement { return this._offCanvas; }

  /**
   * Get the mouse or touch pointer that stores the last action
   */
  public get pointer():Pt {
    let p = this._pointer.clone();
    p.id = this._pointer.id;
    return p;
  }

  /**
   * Get a new CanvasForm for drawing
   */
  public getForm():CanvasForm { return new CanvasForm(this); }


  /**
   * Window resize handling
   * @param evt 
   */
  protected _resizeHandler( evt:Event ) {
    let b = (this._autoResize) ? this._container.getBoundingClientRect() : this._canvas.getBoundingClientRect();
    if (b) this.resize( Bound.fromBoundingRect(b), evt );
  }


  /**
   * Set whether the canvas element should resize when its container is resized. Default will auto size
   * @param auto a boolean value indicating if auto size is set. Default is `true`.
   */
  autoResize( auto:boolean=true ):this {
    this._autoResize = auto;
    if (auto) {
      window.addEventListener( 'resize', this._resizeHandler.bind(this) );
    } else {
      window.removeEventListener( 'resize', this._resizeHandler.bind(this) );
    }
    return this;
  }


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
   * This overrides Space's `resize` function. It's a callback function for window's resize event. Keep track of this with `resize: (bound ,evt)` callback in your added objects.
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
      let p = this.players[k];
      if (p.resize) p.resize( this.bound, evt);
    }

    this.render( this._ctx );
  
    return this;
  }


  /**
   * Clear the canvas with its background color. Overrides Space's `clear` function.
   * @param bg Optionally specify a custom background color in hex or rgba string, or "transparent". If not defined, it will use its `bgcolor` property as background color to clear the canvas.
   */
  clear( bg?:string ):this {

    if (bg) this._bgcolor = bg;
    let lastColor = this._ctx.fillStyle

    if (this._bgcolor && this._bgcolor != "transparent") {
      this._ctx.fillStyle = this._bgcolor;
      this._ctx.fillRect( -1, -1, this._canvas.width+1, this._canvas.height+1 );
    } else {
      this._ctx.clearRect( -1, -1, this._canvas.width+1, this._canvas.height+1 );
    }

    this._ctx.fillStyle = lastColor;
    return this;
  }


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


  /**
   * Bind event listener in canvas element, for events such as mouse events
   * @param evt an event string such as "mousedown"
   * @param callback callback function for this event
   */
  bindCanvas(evt:string, callback:EventListener) {
    this._canvas.addEventListener( evt, callback );
  }


  /**
   * Unbind a callback from the event listener
   * @param evt an event string such as "mousedown"
   * @param callback callback function to unbind
   */
  unbindCanvas(evt:string, callback:EventListener) {
    this._canvas.removeEventListener( evt, callback );
  }


  /**
   * A convenient method to bind (or unbind) all mouse events in canvas element. All item added to `players` property that implements an `onMouseAction` callback will receive mouse event callbacks. The types of mouse actions are: "up", "down", "move", "drag", "drop", "over", and "out".
   * @param _bind a boolean value to bind mouse events if set to `true`. If `false`, all mouse events will be unbound. Default is true.
   */
  bindMouse( _bind:boolean=true ):this {
    if ( _bind) {
      this.bindCanvas( "mousedown", this._mouseDown.bind(this) )
      this.bindCanvas( "mouseup", this._mouseUp.bind(this) )
      this.bindCanvas( "mouseover", this._mouseOver.bind(this) )
      this.bindCanvas( "mouseout", this._mouseOut.bind(this) )
      this.bindCanvas( "mousemove", this._mouseMove.bind(this) )
      this._hasMouse = true;
    } else {
      this.unbindCanvas( "mousedown", this._mouseDown.bind(this) )
      this.unbindCanvas( "mouseup", this._mouseUp.bind(this) )
      this.unbindCanvas( "mouseover", this._mouseOver.bind(this) )
      this.unbindCanvas( "mouseout", this._mouseOut.bind(this) )
      this.unbindCanvas( "mousemove", this._mouseMove.bind(this) )
      this._hasMouse = false;
    }
    return this;
  }


  /**
   * A convenient method to bind (or unbind) all mobile touch events in canvas element. All item added to `players` property that implements an `onTouchAction` callback will receive touch event callbacks. The types of touch actions are the same as the mouse actions: "up", "down", "move", and "out"
   * @param _bind a boolean value to bind touch events if set to `true`. If `false`, all touch events will be unbound. Default is true.
   */
  bindTouch( _bind:boolean=true ):this {
    if (_bind) {
      this.bindCanvas( "touchstart", this._mouseDown.bind(this) );
      this.bindCanvas( "touchend", this._mouseUp.bind(this) );
      this.bindCanvas( "touchmove", this._touchMove.bind(this) );
      this.bindCanvas( "touchcancel", this._mouseOut.bind(this) );
      this._hasTouch = true;
    } else {
      this.unbindCanvas( "touchstart", this._mouseDown.bind(this) );
      this.unbindCanvas( "touchend", this._mouseUp.bind(this) );
      this.unbindCanvas( "touchmove", this._touchMove.bind(this) );
      this.unbindCanvas( "touchcancel", this._mouseOut.bind(this) );
      this._hasTouch = false;
    }
    return this;
  }

  
  /**
   * A convenient method to convert the touch points in a touch event to an array of `Pt`.
   * @param evt a touch event which contains touches, changedTouches, and targetTouches list
   * @param which a string to select a touches list: "touches", "changedTouches", or "targetTouches". Default is "touches"
   * @return an array of Pt, whose origin position (0,0) is offset to the top-left of this space
   */
  touchesToPoints( evt:TouchEvent, which:TouchPointsKey="touches" ): Pt[] {
    if (!evt || !evt[which]) return [];
    let ts = [];
    for (var i=0; i<evt[which].length; i++) {
      let t = evt[which].item(i);
      ts.push( new Pt( t.pageX - this.bound.topLeft.x, t.pageY - this.bound.topLeft.y ) );
    }
    return ts;
  }


  /**
   * Go through all the `players` and call its `onMouseAction` callback function
   * @param type 
   * @param evt 
   */
  protected _mouseAction( type:string, evt:MouseEvent|TouchEvent ) {
    let px = 0, py = 0;
    if (evt instanceof MouseEvent) {
      for (let k in this.players) {
        let v = this.players[k];
        px = evt.offsetX || evt.layerX;
        py = evt.offsetY || evt.layerY;
        if (v.action) v.action( type, px, py, evt );
      }
    } else {
      for (let k in this.players) {
        let v = this.players[k];
        let c = evt.changedTouches && evt.changedTouches.length > 0;
        let touch = evt.changedTouches.item(0);
        let bound = this._canvas.getBoundingClientRect();
        px = (c) ? touch.clientX - bound.left : 0;
        py = (c) ? touch.clientY - bound.top : 0;
        if (v.action) v.action( type, px, py, evt );
      }
    }
    if (type) {
      this._pointer.to( px, py );
      this._pointer.id = type;
    }
  }


  /**
   * MouseDown handler
   * @param evt 
   */
  protected _mouseDown( evt:MouseEvent|TouchEvent ) {
    this._mouseAction( "down", evt );
    this._pressed = true;
  }


  /**
   * MouseUp handler
   * @param evt 
   */
  protected _mouseUp( evt:MouseEvent|TouchEvent ) {
    this._mouseAction( "up", evt );
    if (this._dragged) this._mouseAction( "drop", evt );
    this._pressed = false;
    this._dragged = false;
  }


  /**
   * MouseMove handler
   * @param evt 
   */
  protected _mouseMove( evt:MouseEvent|TouchEvent ) {
    this._mouseAction( "move", evt );
    if (this._pressed) {
      this._dragged = true;
      this._mouseAction( "drag", evt );
    }
  }


  /**
   * MouseOver handler
   * @param evt 
   */
  protected _mouseOver( evt:MouseEvent|TouchEvent ) {
    this._mouseAction( "over", evt );
  }


  /**
   * MouseOut handler
   * @param evt 
   */
  protected _mouseOut( evt:MouseEvent|TouchEvent ) {
    this._mouseAction( "out", evt );
    if (this._dragged) this._mouseAction( "drop", evt );
    this._dragged = false;
  }


  /**
   * TouchMove handler
   * @param evt 
   */
  protected _touchMove( evt:TouchEvent) {
    evt.preventDefault();
    this._mouseMove(evt);
  }

  
  /**
   * Custom rendering
   * @param context rendering context
   */
  protected render( context:CanvasRenderingContext2D ):this {
    if (this._renderFunc) this._renderFunc( context, this );
    return this;
  }


  /**
   * Set a custom rendering `function(graphics_context, canvas_space)` if needed
   */
  set customRendering( f:Function ) { this._renderFunc = f; }
  get customRendering():Function { return this._renderFunc; }
}










/**
 * CanvasForm provide methods to visualize Pts on CanvasSpace
 */
export class CanvasForm extends Form {

  protected _space:CanvasSpace;
  protected _ctx:CanvasRenderingContext2D;

  // store common styles so that they can be restored to canvas context when using multiple forms. See `reset()`.
  protected _style = {
    fillStyle: "#f03", strokeStyle:"#fff", 
    lineWidth: 1, lineJoin: "bevel", lineCap: "butt",
  }

  protected _font:Font = new Font( 14, "sans-serif");


  constructor( space:CanvasSpace ) {
    super();
    this._space = space;
    this._space.add( { start: () => {
      this._ctx = this._space.ctx;
      this._ctx.fillStyle = this._style.fillStyle;
      this._ctx.strokeStyle = this._style.strokeStyle;    
      this._ctx.lineJoin = "bevel";
      this._ctx.font = this._font.value;
    }} );
  }

  get space():CanvasSpace { return this._space; }

  
  useOffscreen( off:boolean=true, clear:boolean|string=false ) {
    if (clear) this._space.clearOffscreen( (typeof clear == "string") ? clear : null );
    this._ctx = (this._space.hasOffscreen && off) ? this._space.offscreenCtx : this._space.ctx;
    return this;
  }

  renderOffscreen( offsetX:number=0, offsetY:number=0) {
    if (this._space.hasOffscreen) {
      this._space.ctx.drawImage( 
        this._space.offscreenCanvas, offsetX, offsetY, this._space.width, this._space.height );
    }
  }


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

  fillOnly( c:string|boolean ):this {
    this.stroke( false );
    return this.fill( c );
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

  strokeOnly( c:string|boolean, width?:number, linejoin?:string, linecap?:string ):this {
    this.fill( false );
    return this.stroke( c, width, linejoin, linecap );
  }

  font( size?:number, weight?:string, style?:string, lineHeight?:number, family?:string ):this {
    if (size) this._font.size = size;
    if (family) this._font.face = family;
    if (weight) this._font.weight = weight;
    if (style) this._font.style = style;
    if (lineHeight) this._font.lineHeight = lineHeight;
    this._ctx.font = this._font.value;
    return this;
  }


  /**
   * Reset the rendering context's common styles to this form's styles. This supports using multiple forms on the same canvas context.
   */
  reset():this {
    for (let k in this._style) {
      this._ctx[k] = this._style[k];
    }
    this._font = new Font();
    this._ctx.font = this._font.value;
    return this;
  }


  protected _paint() {
    if (this._filled) this._ctx.fill();
    if (this._stroked) this._ctx.stroke();
  }

  
  point( p:PtLike, radius:number=5, shape:string="square" ):this {
    if (!p) return;
    if (!CanvasForm[shape]) throw new Error(`${shape} is not a static function of CanvasForm`);

    CanvasForm[shape]( this._ctx, p, radius );
    this._paint();
    
    return this;
  }

  points( pts:GroupLike|number[][], radius:number=5, shape:string="square" ): this {
    if (!pts) return;
    for (let i=0, len=pts.length; i<len; i++) {
      this.point( pts[i], radius, shape );
    }
    return this;
  }

  protected _multiple( groups:GroupLike[], shape:string, ...rest ):this {
    if (!groups) return this;
    for (let i=0, len=groups.length; i<len; i++) {
      this[shape]( groups[i], ...rest );
    }
    return this;
  }

  static circle( ctx:CanvasRenderingContext2D, pt:PtLike, radius:number=10 ) {
    if (!pt) return;
    ctx.beginPath()
    ctx.arc( pt[0], pt[1], radius, 0, Const.two_pi, false );
    ctx.closePath();
  }

  circle( pts:GroupLike|number[][] ) {
    CanvasForm.circle( this._ctx, pts[0], pts[1][0] );
    this._paint();
    return this;
  }

  circles( groups:GroupLike[] ):this {
    return this._multiple( groups, "circle" );
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

  ellipses( groups:GroupLike[] ):this {
    return this._multiple( groups, "ellipse" );
  }


  static arc( ctx:CanvasRenderingContext2D, pt:PtLike, radius:number, startAngle:number, endAngle:number, cc?:boolean ) {
    if (!pt) return;
    ctx.beginPath()
    ctx.arc( pt[0], pt[1], radius, startAngle, endAngle, cc );
  }

  arc( pt:PtLike, radius:number, startAngle:number, endAngle:number, cc?:boolean ):this {
    CanvasForm.arc( this._ctx, pt, radius, startAngle, endAngle, cc );
    this._paint();
    return this;
  }

  static square( ctx:CanvasRenderingContext2D, pt:PtLike, halfsize:number ) {
    if (!pt) return;
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


  static line( ctx:CanvasRenderingContext2D, pts:GroupLike|number[][] ) {
    if (pts.length<2) return;
    ctx.beginPath();
    ctx.moveTo( pts[0][0], pts[0][1] );
    for (let i=1, len=pts.length; i<len; i++) {
      if (pts[i]) ctx.lineTo( pts[i][0], pts[i][1] );
    }
  }

  line( pts:GroupLike|number[][] ):this {
    CanvasForm.line( this._ctx, pts );
    this._paint();
    return this;
  }

  lines( groups:GroupLike[] ):this {
    return this._multiple( groups, "line" );
  }


  static polygon( ctx:CanvasRenderingContext2D, pts:GroupLike|number[][] ) {
    if (pts.length<2) return;
    ctx.beginPath();
    ctx.moveTo( pts[0][0], pts[0][1] );
    for (let i=1, len=pts.length; i<len; i++) {
      if (pts[i]) ctx.lineTo( pts[i][0], pts[i][1] );
    }
    ctx.closePath();
  }

  polygon( pts:GroupLike|number[][] ):this {
    CanvasForm.polygon( this._ctx, pts );
    this._paint();
    return this;
  }

  polygons( groups:GroupLike[] ):this {
    return this._multiple( groups, "polygon" );
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

  rects( groups:GroupLike[] ):this {
    return this._multiple( groups, "rect" );
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
    let w = this._ctx.measureText( txt ).width + 20;
    this.stroke(false).fill("rgba(0,0,0,.4)").rect( [[0,0], [w, 20]] );
    this.fill("#fff").text( [10,14], txt );   
    return this;
  }


  
}