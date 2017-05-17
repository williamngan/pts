import {Space} from './Space';
import {Pt, IPt} from './Pt';
import {Pts} from './Pts';
import {Bound} from './Bound';

interface PtsCanvasRenderingContext2D extends CanvasRenderingContext2D {
  webkitBackingStorePixelRatio?:number;
  mozBackingStorePixelRatio?:number;
  msBackingStorePixelRatio?:number;
  oBackingStorePixelRatio?:number;
  backingStorePixelRatio?:number;
}

export class CanvasSpace extends Space {

  protected _canvas:HTMLCanvasElement;
  protected _container:Element;
  protected _pixelScale = 1;
  protected _autoResize = true;
  protected _bgcolor = "#F3F7FA";
  protected _ctx:PtsCanvasRenderingContext2D;

  // track mouse dragging
  private _mousedown = false;
  private _mousedrag = false;

  /**
   * Create a CanvasSpace which represents a HTML Canvas Space
   * @param elem Specify an element by its "id" attribute as string, or by the element object itself. An element can be an existing `<canvas>`, or a `<div>` container in which a new `<canvas>` will be created. If left empty, a `<div id="pt_container"><canvas id="pt" /></div>` will be added to DOM. Use css to customize its appearance if needed.
   * @param callback an optional callback `function(boundingBox, spaceElement)` to be called when canvas is appended and ready. A "ready" event will also be fired from the `<canvas>` element when it's appended, which can be traced with `spaceInstance.space.addEventListener("ready")`
   */
  constructor( elem:string|Element, callback:Function) {
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
    }

    // if size is known then set it immediately
    if (_existed) {
      let b = this._container.getBoundingClientRect();
      this.resize( Bound.fromBoundingRect(b) );
    }

    // no mutation observer, so we set a timeout for ready event
    setTimeout( this._ready.bind( this, callback ), 50 );

    // store canvas 2d rendering context
    this._ctx = this._canvas.getContext('2d');

  }

  private _createElement( elem="div", id ) {
    let d = document.createElement( elem );
    d.setAttribute("id", id);
    return d;
  }

  private _ready( callback:Function ) {
    if (!this._container) throw `Cannot initiate #${this.id} element`;

    let b = this._container.getBoundingClientRect();
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
    
    this._autoResize = (opt.resize !== false)

    if (opt.retina !== false) {
      let r1 = window.devicePixelRatio || 1
      let r2 = this._ctx.webkitBackingStorePixelRatio || this._ctx.mozBackingStorePixelRatio || this._ctx.msBackingStorePixelRatio || this._ctx.oBackingStorePixelRatio || this._ctx.backingStorePixelRatio || 1;
      this._pixelScale = r1/r2
    }
    return this;
  }

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


  get element():HTMLCanvasElement {
    return this._canvas;
  }


  render( context:CanvasRenderingContext2D ):this {
    return this;
  }

  resize( b:Bound, evt?:Event):this {

    this.bound = b;

    let sw = Math.floor(this.bound.width * this._pixelScale);
    let sh = Math.floor(this.bound.height * this._pixelScale);
    this._canvas.width = sw;
    this._canvas.height = sh;
    this._canvas.style.width = sw + "px";
    this._canvas.style.height = sh + "px";

    if (this._pixelScale != 1) this._ctx.scale( this._pixelScale, this._pixelScale );

    for (let k in this.players) {
      let p = this.players[k];
      if (p.onSpaceResize) p.onSpaceResize( this.bound.size, evt);
    }

    this.render( this._ctx );
  
    return this;
  }

  clear( bg?:string ):this {

    if (bg) this._bgcolor = bg;
    let lastColor = this._ctx.fillStyle

    if (this._bgcolor && this._bgcolor != "transparent") {
      this._ctx.fillStyle = this._bgcolor;
      this._ctx.fillRect( 0, 0, this.bound.width, this.bound.height );
    } else {
      this._ctx.clearRect( 0, 0, this.bound.width, this.bound.height );
    }

    this._ctx.fillStyle = lastColor;
    return this;
  }


  protected playItems( time: number ) {
    this._ctx.save();
    super.playItems( time );
    this._ctx.restore();
  }

  bindCanvas(evt:string, callback:EventListener) {
    this._canvas.addEventListener( evt, callback );
  }

  unbindCanvas(evt:string, callback:EventListener) {
    this._canvas.removeEventListener( evt, callback );
  }

  bindMouse( _bind:boolean=true ) {
    if ( _bind) {
      // this.bindCanvas( "mousedown", this._mousedown.bind(this) )
    } else {

    }
    
  }

  bindTouch( _bind:boolean=true ) {

  }

  touchesToPoints( evt:Event, which?:string ): Pts {
    return new Pts()
  }

  protected _mouseAction( type:string, evt:MouseEvent|TouchEvent ) {
    if (evt instanceof TouchEvent) {
      for (let k in this.playItems) {
        let v = this.playItems[k];
        let c = evt.changedTouches && evt.changedTouches.length > 0
        let px = (c) ? evt.changedTouches.item(0).pageX : 0;
        let py = (c) ? evt.changedTouches.item(0).pageY : 0;
        v.onTouchAction( type, px, py, evt );
      }
    } else {
      for (let k in this.playItems) {
        let v = this.playItems[k];
        let px = evt.offsetX || evt.layerX;
        let py = evt.offsetY || evt.layerY;
        v.onMouseAction( type, px, py, evt );
      }
    }
  }

  protected _mouseDown( evt:Event ) {

  }

  protected _mouseUp( evt:Event ) {

  }

}