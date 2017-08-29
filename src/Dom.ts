import {MultiTouchSpace, IPlayer} from './Space';
import {Form} from "./Form";
import {Bound} from './Bound';
import {Geom} from './Num';
import {Const, Util} from './Util';
import {Pt, PtLike, GroupLike, Group} from './Pt';
import {Rectangle} from "./Op";


export class DOMSpace extends MultiTouchSpace {
  
  protected _canvas:HTMLElement|SVGElement;
  protected _container:Element;
  
  id: string = "domspace";
  protected _autoResize = true;
  protected _bgcolor = "#e1e9f0";
  
  protected _css = {};
  private _isReady = false;
  
  
  /**
  * Create a DOMSpace which represents a Space for HTML Element
  * @param elem Specify an element by its "id" attribute as string, or by the element object itself. An element can be an existing `<canvas>`, or a `<div>` container in which a new `<canvas>` will be created. If left empty, a `<div id="pt_container"><canvas id="pt" /></div>` will be added to DOM. Use css to customize its appearance if needed.
  * @param callback an optional callback `function(boundingBox, spaceElement)` to be called when canvas is appended and ready. Alternatively, a "ready" event will also be fired from the `<canvas>` element when it's appended, which can be traced with `spaceInstance.canvas.addEventListener("ready")`
  * @example `new DOMSpace( "#myElementID" )`
  */
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
      this._canvas = this._createElement( "div", "pts_element" ) as HTMLElement;
      this._container.appendChild( this._canvas );
      document.body.appendChild( this._container );
      _existed = false;
      
    } else {
      this._canvas = _selector as HTMLElement;
      this._container = _selector.parentElement;
    }
    
    
    // no mutation observer, so we set a timeout for ready event
    setTimeout( this._ready.bind( this, callback ), 50 );
    
  }
  
  
  /**
  * Helper function to create a DOM element
  * @param elem element tag name
  * @param id element id attribute
  */
  protected _createElement( elem:string="div", id:string ):Element {
    let d = document.createElement( elem );
    if (id) d.setAttribute( "id,", id );
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
    
    if (callback) callback( this.bound, this._canvas );
  }
  
  
  /**
  * Set up various options for CanvasSpace. The `opt` parameter is an object with the following fields. This is usually set during instantiation, eg `new CanvasSpace(...).setup( { opt } )`
  * @param opt an object with optional settings, as follows.
  * @param opt.bgcolor a hex or rgba string to set initial background color of the canvas, or use `false` or "transparent" to set a transparent background. You may also change it later with `clear()`    
  * @param opt.resize a boolean to set whether `<canvas>` size should auto resize to match its container's size. You can also set it manually with `autoSize()`    
  * @example `space.setup({ bgcolor: "#f00", resize: true })`
  */
  setup( opt:{bgcolor?:string, resize?:boolean} ):this {
    if (opt.bgcolor) {
      this._bgcolor = opt.bgcolor;
    }
    
    this.autoResize = (opt.resize != undefined) ? opt.resize : false;
    
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
  * Window resize handling
  * @param evt 
  */
  protected _resizeHandler( evt:Event ) {
    
    if (this._autoResize) {
      let b = Bound.fromBoundingRect( this._canvas.getBoundingClientRect() );
      this.styles( {width: "100%", height: "100%"}, true );
      this.resize( b, evt );
      
    } else {
      
      let b = Bound.fromBoundingRect( this._container.getBoundingClientRect() );
      this.styles( {width: `${b.width}px`, height: `${b.height}px`}, true );
    }
    
  }
  

  /**
  * Get a new `DOMForm` for drawing
  * @see `DOMForm`
  */
  getForm():Form {
    return new DOMForm( this );
  }
  

  /**
  * Get the html element
  */
  get element():Element {
    return this._canvas;
  }
  
  
  /**
  * Get the parent element that contains the html element
  */
  get parent():Element {
    return this._container;
  }
  
  
  /**
  * A property to indicate if the Space is ready
  */
  get ready():boolean { return this._isReady; }
  
  
  /**
  * Clear the element's contents, and ptionally set a new backgrounc color. Overrides Space's `clear` function.
  * @param bg Optionally specify a custom background color in hex or rgba string, or "transparent". If not defined, it will use its `bgcolor` property as background color to clear the canvas.
  */
  clear( bg?:string ):this {
    if (bg) this.background = bg;
    this._canvas.innerHTML = "";
    return this;
  } 
  
  
  /**
   * Set a background color on the container element
   */
  set background( bg:string ) {
    this._bgcolor = bg;
    (this._container as HTMLElement).style.backgroundColor = this._bgcolor;
  }
  get background():string { return this._bgcolor; }
  

  /**
   * Add or update a style definition, and optionally update that style in the Element
   * @param key style name
   * @param val style value
   * @param update a boolean to update the element's style immediately if set to `true`. Default is `false`.
   */
  style( key:string, val:string, update:boolean=false ):this {
    this._css[key] = val;
    if (update) this._canvas.style[key] = val;
    return this;
  }
  

  /**
   * Add of update a list of style definitions, and optionally update those styles in the Element
   * @param styles a key-value objects of style definitions 
   * @param update a boolean to update the element's style immediately if set to `true`. Default is `false`.
   */
  styles( styles:object, update:boolean=false ):this {
    for (let k in styles) {
      if ( styles.hasOwnProperty(k) ) this.style( k, styles[k], update );
    }
    return this;
  }

  
  /**
   * A static helper function to add or update Element attributes
   * @param elem Element to update
   * @param data an object with key-value pairs
   */
  static setAttr( elem:Element, data:object ):Element {
    for (let k in data) {
      if (data.hasOwnProperty(k)) {
        elem.setAttribute( k, data[k] );
      }
    }
    return elem;
  }
  
  
  /**
   * A static helper function to compose an inline style string from a object of styles
   * @param elem Element to update
   * @param data an object with key-value pairs
   * @exmaple DOMSpace.getInlineStyles( {width: "100px", "font-size": "10px"} ); // returns "width: 100px; font-size: 10px"
   */
  static getInlineStyles( data:object ):string {
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
    
    if (this._canvas.nodeName.toLowerCase() != "svg") {
      let s = this._createElement( "svg", `${this.id}_svg` );
      this._canvas.appendChild( s );
      this._container = this._canvas;
      this._canvas = s as SVGElement;
    }
  }
  
  getForm():SVGForm { return new SVGForm( this ); }
  
  /**
  * Get the html element
  */
  get element():Element {
    return this._canvas;
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
  
  
  static _checkSize( pts:GroupLike|number[][] ):boolean {
    if (pts.length < 2) {
      Util.warn( "Requires 2 or more Pts in this Group." );
      return false;
    } 
    return true;
  }
  
  
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
    
    return DOMSpace.setAttr( elem, {style: st.join(";")} );
  }
  
  
  protected _branchID( item:IPlayer ):string {
    return `item-${item.animateID}`;
  }
  
  
  static point( ctx:SVGFormContext, pt:PtLike, radius:number=5, shape:string="square" ):SVGElement {
    if (shape === "circle") {
      return SVGForm.circle( ctx, pt, radius );
    } else {
      return SVGForm.square( ctx, pt, radius );
    }
  }
  
  point( pt:PtLike, radius:number=5, shape:string="square" ):this {
    this.nextID();
    SVGForm.point( this._ctx, pt, radius, shape );
    return this;
  }
  
  static circle( ctx:SVGFormContext, pt:PtLike, radius:number=10 ):SVGElement {
    let elem = SVGSpace.svgElement( ctx.group, "circle", SVGForm.getID(ctx) );
    
    DOMSpace.setAttr( elem, {
      cx: pt[0],
      cy: pt[1],
      r: radius
    });
    
    SVGForm.style( elem, ctx.style );
    return elem;
  }
  
  circle( pts:GroupLike|number[][] ):this {
    this.nextID();
    SVGForm.circle( this._ctx, pts[0], pts[1][0] );
    return this;
  }
  
  static arc( ctx:SVGFormContext, pt:PtLike, radius:number, startAngle:number, endAngle:number, cc?:boolean ):SVGElement {
    let elem = SVGSpace.svgElement( ctx.group, "path", SVGForm.getID( ctx ) );
    
    const start = new Pt(pt).toAngle( startAngle, radius, true );
    const end = new Pt(pt).toAngle( endAngle, radius, true );
    const diff = Geom.boundAngle(endAngle) - Geom.boundAngle(startAngle);
    let largeArc = ( diff > Const.pi ) ? true : false;
    if (cc) largeArc = !largeArc;
    const sweep = (cc) ? "0" : "1";
    
    const d = `M ${start[0]} ${start[1]} A ${radius} ${radius} 0 ${largeArc ? "1" : "0"} ${sweep} ${end[0]} ${end[1]}`;
    
    DOMSpace.setAttr( elem, { d: d } );
    SVGForm.style( elem, ctx.style );
    return elem;
  }
  
  arc( pt:PtLike, radius:number, startAngle:number, endAngle:number, cc?:boolean ):this {
    this.nextID();
    SVGForm.arc( this._ctx, pt, radius, startAngle, endAngle, cc );
    return this;
  }
  
  static square( ctx:SVGFormContext, pt:PtLike, halfsize:number ) {
    let elem = SVGSpace.svgElement( ctx.group, "rect", SVGForm.getID( ctx ) );
    DOMSpace.setAttr( elem, {x: pt[0]-halfsize, y:pt[1]-halfsize, width: halfsize*2, height: halfsize*2} );
    SVGForm.style( elem, ctx.style );
    return elem;
  }
  
  square( pt:PtLike, halfsize:number ):this {
    this.nextID();
    SVGForm.square( this._ctx, pt, halfsize );
    return this;
  } 
  
  static line( ctx:SVGFormContext, pts:GroupLike|number[][] ):SVGElement {
    if (!this._checkSize( pts)) return;
    
    if (pts.length > 2) return SVGForm._poly( ctx, pts, false );
    
    let elem = SVGSpace.svgElement( ctx.group, "line", SVGForm.getID( ctx ) );
    
    DOMSpace.setAttr( elem, {
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
  
  
  
  static _poly( ctx:SVGFormContext, pts:GroupLike|number[][], closePath:boolean=true) {
    if (!this._checkSize( pts)) return;
    
    let elem = SVGSpace.svgElement( ctx.group, ((closePath) ? "polygon" : "polyline"), SVGForm.getID(ctx) );
    let points:string = (pts as number[][]).reduce( (a, p) => a+`${p[0]},${p[1]} `, "");
    DOMSpace.setAttr( elem, {points: points} );    
    SVGForm.style( elem, ctx.style );
    return elem;
  }
  
  
  static polygon( ctx:SVGFormContext, pts:GroupLike|number[][] ):SVGElement {
    return SVGForm._poly( ctx, pts, true );
  }
  
  polygon( pts:GroupLike|number[][] ):this {
    this.nextID();
    SVGForm.polygon( this._ctx, pts );
    return this;
  }
  
  
  static rect( ctx:SVGFormContext, pts:GroupLike|number[][] ):SVGElement {
    if (!this._checkSize( pts)) return;
    
    let elem = SVGSpace.svgElement( ctx.group, "rect", SVGForm.getID(ctx) );
    let bound = Group.fromArray( pts ).boundingBox();
    let size = Rectangle.size( bound );
    
    DOMSpace.setAttr( elem, {
      x: bound[0][0],
      y: bound[0][1],
      width: size[0],
      height: size[1]
    });
    
    SVGForm.style( elem, ctx.style );
    return elem;
  }
  
  
  rect( pts:number[][]|Pt[] ):this {
    this.nextID();
    SVGForm.rect( this._ctx, pts );
    return this;
  }
  
  
  static text( ctx:SVGFormContext, pt:PtLike, txt:string ):SVGElement {
    let elem = SVGSpace.svgElement( ctx.group, "text", SVGForm.getID(ctx) );
    
    DOMSpace.setAttr( elem, {
      "pointer-events": "none",
      x: pt[0],
      y: pt[1],
      dx: 0, dy: 0
    });
    
    elem.textContent = txt;
    
    SVGForm.style( elem, ctx.style );
    
    return elem;
  }
  
  text( pt:PtLike, txt:string ): this {
    this.nextID();
    SVGForm.text( this._ctx, pt, txt );
    return this;
  }
  
  log( txt ):this {
    this.fill("#000").stroke("#fff", 0.5).text( [10,14], txt );   
    return this;
  }
  
  
}