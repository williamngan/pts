import {Space, IPlayer} from './Space';
import {Form} from "./Form";
import {Bound} from './Bound';
import {PtLike, GroupLike} from './Pt';


export class DOMSpace extends Space {

  id: string = "domspace";
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

  setup( opt:{bgcolor?:string, resize?:boolean} ):this {
    if (opt.bgcolor) {
      this._bgcolor = opt.bgcolor;
    }

    if (opt.resize) {
      this._element.setAttribute("width", "100%");
      this._element.setAttribute("height", "100%");
    } 
    
    return this;
  }

  getForm():Form {
    return new DOMForm( this );
  }

  /**
  * Get the html element
  */
  get element():Element {
    return this._element;
  }
  
  
  /**
  * Get the parent element that contains the html element
  */
  get parent():Element {
    return this._container;
  }

  get ready():boolean { return this._isReady; }

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
      if (this.players.hasOwnProperty(k)) {
        if (this.players[k].start) this.players[k].start( this.bound.clone(), this );
      }
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
    (this._container as HTMLElement).style.backgroundColor = this._bgcolor;
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


export class DOMForm extends Form {
  protected _space:DOMSpace;

  constructor( space:DOMSpace ) {
    super();
    this._space = space;
  }

  get space():DOMSpace { return this._space; }
}



export class SVGSpace extends DOMSpace {

  id: string = "svgspace";
  protected _bgcolor:string = "#999";
  

  constructor( elem:string|Element, callback?:Function ) {
    super( elem, callback );

    if (this._element.nodeName.toLowerCase() != "svg") {
      let s = this._createElement( "svg", `${this.id}_svg` );
      this._element.appendChild( s );
      this._container = this._element;
      this._element = s as SVGElement;
    }
    
  }

  getForm():SVGForm { return new SVGForm( this ); }

  /**
  * Get the html element
  */
  get element():Element {
    return this._element;
  }

  static svgElement( parent:Element, name:string, id?:string ):SVGElement {
    if (!parent || !parent.appendChild ) throw new Error( "parent is not a valid DOM element" );

    let elem = document.querySelector(`#${id}`);
    if (!elem) {
      elem = document.createElementNS( "http://www.w3.org/2000/svg", name );
      elem.setAttribute( "id", id );
      
      elem.setAttribute( "class",id.substring(0, id.indexOf("-")) );
      parent.appendChild( elem );
    }
    return elem as SVGElement;
  }

  _createElement( elem:string="svg", id:string ):Element {
    let d = document.createElementNS( "http://www.w3.org/2000/svg", elem );
    if (id) d.setAttribute( "id", id );
    return d;
  }



  // remove( item ):this

  // remoevAll

}

export type SVGFormContext = {
  group:Element, groupID:string, groupCount:number,
  currentID:string,
  style:object,
  font:string, fontSize:number, fontFamily:string
};




export class SVGForm extends Form {

  protected _ctx:SVGFormContext = {
    group: null,
    groupID: "pts",
    groupCount: 0,
    currentID: "pts0",
    style: {
      "filled": true,
      "stroked": true,
      "fill": "#f03",
      "stroke": "#fff",
      "stroke-width": 1,
      "stroke-linejoin": "bevel",
      "stroke-linecap": "sqaure"
    },
    font: "11px sans-serif",
    fontSize: 11,
    fontFamily: "sans-serif"
  };

  static domID:number = 0;

  protected _space:SVGSpace;
  protected _ready:boolean = false;

  constructor( space:SVGSpace ) {
    super();
    this._space = space;
    
    
    this._space.add( { start: () => {
      this._ctx.group = this._space.element;
      this._ready = true;
    }} );
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


  /**
  * Set current stroke style and without fill.
  * @example `form.strokeOnly("#F90")`, `form.strokeOnly("#000", 0.5, 'round', 'square')`
  * @param c stroke color which can be as color, gradient, or pattern. (See [canvas documentation](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/strokeStyle)
  */
  strokeOnly( c:string|boolean, width?:number, linejoin?:string, linecap?:string ):this {
    this.fill( false );
    return this.stroke( c, width, linejoin, linecap );
  }
    

  branch( group_id:string, group?:Element ):object {
    this._ctx.group = group;
    this._ctx.groupID = group_id;
    this._ctx.groupCount = 0;
    this.nextID();
    return this._ctx;
  }

  base( item:IPlayer ) {
    if (!item || item.animateID == null ) throw new Error("item not defined or not yet added to Space");
    return this.branch( this._branchID( item ), this.space.element );
  }


  nextID():string {
    this._ctx.groupCount++;
    this._ctx.currentID = `${this._ctx.groupID}-${this._ctx.groupCount}`;
    return this._ctx.currentID;
  }

  static getID( ctx ):string {
    return ctx.currentID || `p-${SVGForm.domID++}`;
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

    return DOMSpace.attr( elem, {style: st.join(";")} );
  }


  protected _branchID( item:IPlayer ):string {
    return `item-${item.animateID}`;
  }


  static point( ctx:SVGFormContext, pt:PtLike, radius:number=5, shape:string="rect" ):SVGElement {
    let elem = SVGSpace.svgElement( ctx.group, shape, SVGForm.getID( ctx ) );
    if (!elem) return undefined;

    if (shape == "circle") {
      DOMSpace.attr( elem, { cx: pt[0], cy: pt[1], r:radius } );
    } else {
      DOMSpace.attr( elem, {x: pt[0]-radius, y:pt[1]-radius, width: radius*2, height: radius*2} );
    }

    SVGForm.style( elem, ctx.style );
    return elem;
  }

  point( pt:PtLike, radius:number=5, shape:string="rect" ):this {
    this.nextID();
    SVGForm.point( this._ctx, pt, radius, shape );
    return this;
  }

  static line( ctx:SVGFormContext, pts:GroupLike|number[][] ):SVGElement {
    if (pts.length<2) return;
    let elem = SVGSpace.svgElement( ctx.group, "line", SVGForm.getID( ctx ) );

    DOMSpace.attr( elem, {
      x1: pts[0][0],
      y1: pts[0][1],
      x2: pts[1][0],
      y2: pts[1][1]
    });

    SVGForm.style( elem, ctx.style );
    return elem;
  }

  line( pts:GroupLike|number[][] ):this {
    this.nextID();
    SVGForm.line( this._ctx, pts );
    return this;
  }
  

}