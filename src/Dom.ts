import {Space} from './Space';
import {VisualForm, Font} from "./Form";
import {Bound} from './Bound';
import {Pt, PtLike, GroupLike} from "./Pt";
import {Const} from "./Util";

export class DOMSpace extends Space {

  protected _element:HTMLElement|SVGElement;
  protected _container:Element;
  protected _ctx = {};
  protected _autoResize = true;
  protected _bgcolor = "#e1e9f0";

  protected _css = {};

  // track mouse dragging
  private _pressed = false;
  private _dragged = false;
  
  private _hasMouse = false;
  private _hasTouch = false;
  
  private _renderFunc: Function = undefined;
  private _isReady = false;


  constructor( elem:string|Element, callback?:Function) {
    super();
    
    var _selector:Element = null;
    var _existed = false;
    this.id = "pts";
    
    // check element or element id string
    if ( elem instanceof Element ) {
      _selector = elem;
      this.id = "pts_existing_space";
    } else {
      _selector = document.querySelector( <string>elem );
      _existed = true;
      this.id = elem;
    }
    
    // if selector is not defined, create a canvas
    if (!_selector) {      
      this._container = this._createElement( "div", "pts_container" );
      this._element = this._createElement( "div", "pts_element" ) as HTMLElement;
      this._container.appendChild( this._element );
      document.body.appendChild( this._container );
      _existed = false;
      
    } else {
      this._element = _selector as HTMLElement;
      this._container = _selector.parentElement;
    }
    
    
    // no mutation observer, so we set a timeout for ready event
    setTimeout( this._ready.bind( this, callback ), 50 );
    
    // store canvas 2d rendering context
    this._ctx = {};
    
  }


  _createElement( elem:string="div", id:string ):Element {
    let d = document.createElement( elem );
    d.setAttribute( "id,", id );
    return d;
  }


  /**
  * Handle callbacks after element is mounted in DOM
  * @param callback 
  */
  private _ready( callback:Function ) {
    if (!this._container) throw new Error(`Cannot initiate #${this.id} element`);
    
    this._isReady = true;
    
    let b = (this._autoResize) ? this._container.getBoundingClientRect() : this._element.getBoundingClientRect();
    if (b) this.resize( Bound.fromBoundingRect(b) );
    
    this.clear( this._bgcolor );
    this._element.dispatchEvent( new Event("ready") );
    
    for (let k in this.players) {
      if (this.players[k].start) this.players[k].start( this.bound.clone(), this );
    }
    
    this._pointer = this.center;
    
    if (callback) callback( this.bound, this._element );
  }
  

  style( key:string, val:string, update:boolean=false ):this {
    this._css[key] = val;
    if (update) this._element.style[key] = val;
    return this;
  }

  styles( st:object, update:boolean=false ):this {
    for (let k in st) {
      if ( st.hasOwnProperty(k) ) this.style( k, st[k], update );
    }
    return this;
  }

  updateStyles():this {
    for (let k in this._css) {
      if ( this._css.hasOwnProperty(k) ) this._element.style[k] = this._css[k];
    }
    return this;
  }

  clear( bg?:string ):this {
    if (bg) this.background = bg;
    this._element.innerHTML = "";
    return this;
  } 

  set background( bg:string ) {
    this._bgcolor = bg;
    this.style( "backgroundColor", this._bgcolor );
    this._element.style["backgroundColor"] = this._bgcolor;
  }
  
  get background():string { return this._bgcolor; }

    /**
  * This overrides Space's `resize` function. It's used as a callback function for window's resize event and not usually called directly. You can keep track of resize events with `resize: (bound ,evt)` callback in your player objects (See `Space`'s `add()` function). 
  * @param b a Bound object to resize to
  * @param evt Optionally pass a resize event
  */
  resize( b:Bound, evt?:Event):this {
    
    this.bound = b;
        
    for (let k in this.players) {
      if (this.players.hasOwnProperty(k)) {
        let p = this.players[k];
        if (p.resize) p.resize( this.bound, evt);
      }
    };
    
    return this;
  }


  /**
  * Set whether the canvas element should resize when its container is resized. 
  * @param auto a boolean value indicating if auto size is set
  */
  set autoResize( auto:boolean ) {
    this._autoResize = auto;
    if (auto) {
      this.styles( {width: "100%", height: "100%"}, true );
      window.addEventListener( 'resize', this._resizeHandler.bind(this) );
    } else {
      delete this._css['width'];
      delete this._css['height'];
      window.removeEventListener( 'resize', this._resizeHandler.bind(this) );
    }
  }
  get autoResize(): boolean { return this._autoResize; }

  /**
  * Window resize handling
  * @param evt 
  */
  protected _resizeHandler( evt:Event ) {
    let b = (this._autoResize) ? this._container.getBoundingClientRect() : this._element.getBoundingClientRect();
    if (b) this.resize( Bound.fromBoundingRect(b), evt );
  }
  
  
}