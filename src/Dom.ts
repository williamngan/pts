import {Space, IPlayer} from './Space';
import {Form} from "./Form";
import {Bound} from './Bound';


export class DomSpace extends Space {

  protected _element:HTMLElement|SVGElement;
  protected _container:Element;
  // protected _ctx = {};
  protected _autoResize = true;
  protected _bgcolor = "#e1e9f0";

  protected _css = {};

  // track mouse dragging
  // private _pressed = false;
  // private _dragged = false;
  
  // private _hasMouse = false;
  // private _hasTouch = false;
  
  // private _renderFunc: Function = undefined;
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
    // this._ctx = {};
    
  }


  _createElement( elem:string="div", id:string ):Element {
    let d = document.createElement( elem );
    if (id) d.setAttribute( "id,", id );
    return d;
  }

  getForm():Form {
    return new DomForm( this );
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
    this._element.style.backgroundColor = this._bgcolor;
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
  

  static attr( elem:Element, data:object):Element {
    for (let k in data) {
      if (data.hasOwnProperty(k)) {
        elem.setAttribute( k, data[k] );
      }
    }
    return elem;
  }
  

  static css( data:object ):string {
    let str = "";
    for (let k in data) {
      if (data.hasOwnProperty(k)) {
        if (data[k]) str += `${k}: ${data[k]}; `;
      }
    }
    return str;
  }
}


export class DomForm extends Form {
  protected _space:DomSpace;

  constructor( space:DomSpace ) {
    super();
    this._space = space;
  }

  get space():DomSpace { return this._space; }
}

export class SVGSpace extends DomSpace {

  constructor( elem:string|Element, callback?:Function ) {
    super( elem, callback );

    if (this._element.nodeName.toLowerCase() != "svg") {
      let s = this._createElement( "svg", `${this.id}_svg` );
      this._element.appendChild( s );
      this._container = this._element;
      this._element = s as SVGElement;
    }
    
  }

  static svgElement( parent:Element, name:string, id?:string ):SVGElement {
    if (!parent || !parent.appendChild ) throw new Error( "parent is not a valid DOM element" );

    let elem = document.querySelector(`#${id}`);
    if (!id || !elem) {
      elem = document.createElementNS( "http://www.w3.org/2000/svg", name );
      elem.setAttribute( "id", id );
      elem.setAttribute( "class",id.substring(0, id.indexOf("-")) );
      parent.appendChild( elem );
    }
    return elem as SVGElement;
  }

  _createElement( elem:string="svg", id:string ):Element {
    let d = document.createElementNS( "http://www.w3.org/2000/svg", elem );
    if (id) d.setAttribute( "id,", id );
    return d;
  }

  // remove( item ):this

  // remoevAll

}



export class SVGForm extends Form {

  protected _ctx = {
    group: null,
    groupID: "pts",
    groupCount: 0,
    currentID: "pts0",
    style: {
      "filled": false,
      "stroked": false,
      "fill": "#f03",
      "stroke": "#fff",
      "stroke-width": 1,
      "stroke-linejoin": "bevel",
      "stroke-linecap": "sqaure"
    },
    font: "11px sans-serif",
    fontSize: 11,
    fontFace: "sans-serif"
  };

  static domID:number = 0;

  protected _space:SVGSpace;
  protected _ready:boolean = false;

  constructor( space:SVGSpace ) {
    super();
    this._space = space;
  }

  get space():SVGSpace { return this._space; }


  protected styleTo( k, v ) { 
    if (this._ctx.style[k] === undefined) throw new Error(`${k} style property doesn't exist`);
    this._ctx.style[k] = v; 
  }

  fill( c:string|boolean ):this {
    if (typeof c == "boolean") {
      this.styleTo( "filled", c );
    } else {
      this.styleTo( "filled", true );
      this.styleTo( "fill", c );
    }
    return this;
  }

  stroke( c:string|boolean, width?:number, linejoin?:string, linecap?:string ):this {
    if (typeof c == "boolean") {
      this.styleTo( "stroke", c );
    } else {
      this.styleTo( "stroked", true );
      this.styleTo( "stroke", c );
      if (width) this.styleTo( "stroke-width", width );
      if (linejoin) this.styleTo( "stroke-linejoin", linejoin );
      if (linecap) this.styleTo( "stroke-linecap", linecap );
    }
    return this;
  }

  branch( group_id:string, group:boolean=false ):object {
    // this._ctx.group = group;
    this._ctx.groupID = group_id;
    this._ctx.groupCount = 0;
    this.nextID();
    return this._ctx;
  }

  context( item:IPlayer ) {
    if (!item || item.animateID == null ) throw new Error("item not defined or not yet added to Space");
    return this.branch( this._branchID( item ) );
  }

  
  currentID():string {
    return this._ctx.currentID || `p-${SVGForm.domID++}`;
  }

  nextID():string {
    this._ctx.groupCount++;
    this._ctx.currentID = `${this._ctx.groupID}-${this._ctx.groupCount}`;
    return this._ctx.currentID;
  }

  static style( elem:SVGElement, styles:object) {
    let st = [];

    for (let k in styles) {
      if ( styles.hasOwnProperty(k) ) {
        let v = styles[k];
        if (v) {
          if (k=="fill" && styles["filled"] !== true) {
            st.push( "fill: none");
          } else if (k=="stroke" && styles["stroked"] !== true) {
            st.push( "stroke: none");
          } else {
            st.push( `${k}: ${v}` );
          }
        }
      }
    }

    return DomSpace.attr( elem, {style: st.join(";")} );
  }


  protected _branchID( item:IPlayer ):string {
    return `item-${item.animateID}`;
  }
}