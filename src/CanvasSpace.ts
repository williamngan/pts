import {Space} from './Space';
import {Pt, IPt} from './Pt';
import {Pts} from './Pts';
import {Bound} from './Bound';
import {CanvasForm} from "./CanvasForm";

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

  // track mouse dragging
  private _pressed = false;
  private _dragged = false;
  
  private _renderFunc: Function = undefined;

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
    if (!this._container) throw `Cannot initiate #${this.id} element`;

    let b = (this._autoResize) ? this._container.getBoundingClientRect() : this._canvas.getBoundingClientRect();
    this.resize( Bound.fromBoundingRect(b) );
    
    this.clear( this._bgcolor );
    this._canvas.dispatchEvent( new Event("ready") );

    if (callback) callback( this.bound, this._canvas );
  }


  /**
   * Set up various options for CanvasSpace. The `opt` parameter is an object with the following fields. This is usually set during instantiation, eg `new CanvasSpace(...).setup( { opt } )`
   * @param opt an object with optional settings, as follows.
   * @param opt.bgcolor a hex or rgba string to set initial background color of the canvas, or use `false` or "transparent" to set a transparent background. You may also change it later with `clear()`    
   * @param opt.resize a boolean to set whether `<canvas>` size should auto resize to match its container's size. You can also set it manually with `autoSize()`    
   * @param opt.retina a boolean to set if device pixel scaling should be used. This may make drawings on retina displays look sharper but may reduce performance slightly. Default is `true`.    
   */
  setup( opt:{bgcolor?:string, resize?:boolean, retina?:boolean} ):this {
    if (opt.bgcolor) this._bgcolor = opt.bgcolor;
    
    if (opt.resize != undefined) this._autoResize = opt.resize;

    if (opt.retina !== false) {
      let r1 = window.devicePixelRatio || 1
      let r2 = this._ctx.webkitBackingStorePixelRatio || this._ctx.mozBackingStorePixelRatio || this._ctx.msBackingStorePixelRatio || this._ctx.oBackingStorePixelRatio || this._ctx.backingStorePixelRatio || 1;      
      this._pixelScale = r1/r2;
    }
    return this;
  }


  /**
   * Get the rendering context of canvas
   */
  public get ctx():PtsCanvasRenderingContext2D { return this._ctx; }


  /**
   * Get a new CanvasForm for drawing
   */
  public getForm():CanvasForm { return new CanvasForm(this); }


  /**
   * Window resize handling
   * @param evt 
   */
  protected _resizeHandler( evt:Event ) {
    let b = this._container.getBoundingClientRect();
    this.resize( Bound.fromBoundingRect(b), evt );
  }


  /**
   * Set whether the canvas element should resize when its container is resized. Default will auto size
   * @param auto a boolean value indicating if auto size is set. Default is `true`.
   */
  autoResize( auto:boolean=true ):this {
    if (auto) {
      window.addEventListener( 'resize', this._resizeHandler );
    } else {
      window.removeEventListener( 'resize', this._resizeHandler );
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
   * This overrides Space's `resize` function. It's a callback function for window's resize event. Keep track of this with `onSpaceResize(w,h,evt)` callback in your added objects.
   * @param b a Bound object to resize to
   * @param evt Optionally pass a resize event
   */
  resize( b:Bound, evt?:Event):this {

    this.bound = b;

    this._canvas.width = this.bound.size.x * this._pixelScale;
    this._canvas.height = this.bound.size.y * this._pixelScale;
    this._canvas.style.width = this.bound.size.x + "px";
    this._canvas.style.height = this.bound.size.y + "px";

    if (this._pixelScale != 1) {
      this._ctx.scale( this._pixelScale, this._pixelScale );
      this._ctx.translate( 0.5, 0.5);
    }

    for (let k in this.players) {
      let p = this.players[k];
      if (p.onSpaceResize) p.onSpaceResize( this.bound.size, evt);
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
      this._ctx.fillRect( 0, 0, this._canvas.width, this._canvas.height );
    } else {
      this._ctx.clearRect( 0, 0, this._canvas.width, this._canvas.height );
    }

    this._ctx.fillStyle = lastColor;
    return this;
  }


  /**
   * Main animation function. Call `Space.playItems`.
   * @param time current time
   */
  protected playItems( time: number ) {
    this._ctx.save();
    super.playItems( time );
    this._ctx.restore();
    this.render( this._ctx );
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
  bindMouse( _bind:boolean=true ) {
    if ( _bind) {
      this.bindCanvas( "mousedown", this._mouseDown.bind(this) )
      this.bindCanvas( "mouseup", this._mouseUp.bind(this) )
      this.bindCanvas( "mouseover", this._mouseOver.bind(this) )
      this.bindCanvas( "mouseout", this._mouseOut.bind(this) )
      this.bindCanvas( "mousemove", this._mouseMove.bind(this) )
    } else {
      this.unbindCanvas( "mousedown", this._mouseDown.bind(this) )
      this.unbindCanvas( "mouseup", this._mouseUp.bind(this) )
      this.unbindCanvas( "mouseover", this._mouseOver.bind(this) )
      this.unbindCanvas( "mouseout", this._mouseOut.bind(this) )
      this.unbindCanvas( "mousemove", this._mouseMove.bind(this) )
    }
    
  }


  /**
   * A convenient method to bind (or unbind) all mobile touch events in canvas element. All item added to `players` property that implements an `onTouchAction` callback will receive touch event callbacks. The types of touch actions are the same as the mouse actions: "up", "down", "move", and "out"
   * @param _bind a boolean value to bind touch events if set to `true`. If `false`, all touch events will be unbound. Default is true.
   */
  bindTouch( _bind:boolean=true ) {
    if (_bind) {
      this.bindCanvas( "touchstart", this._mouseDown.bind(this) )
      this.bindCanvas( "touchend", this._mouseUp.bind(this) )
      this.bindCanvas( "touchmove", this._touchMove.bind(this) );
      this.bindCanvas( "touchcancel", this._mouseOut.bind(this) )
    } else {
      this.unbindCanvas( "touchstart", this._mouseDown.bind(this) )
      this.unbindCanvas( "touchend", this._mouseUp.bind(this) )
      this.unbindCanvas( "touchmove", this._touchMove.bind(this) );
      this.unbindCanvas( "touchcancel", this._mouseOut.bind(this) )
    }
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
    if (evt instanceof TouchEvent) {
      for (let k in this.players) {
        let v = this.players[k];
        let c = evt.changedTouches && evt.changedTouches.length > 0
        let px = (c) ? evt.changedTouches.item(0).pageX : 0;
        let py = (c) ? evt.changedTouches.item(0).pageY : 0;
        v.onTouchAction( type, px, py, evt );
      }
    } else {
      for (let k in this.players) {
        let v = this.players[k];
        let px = evt.offsetX || evt.layerX;
        let py = evt.offsetY || evt.layerY;
        v.onMouseAction( type, px, py, evt );
      }
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