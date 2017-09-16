import {MultiTouchSpace, IPlayer} from './Space';
import {Form, VisualForm, Font} from "./Form";
import {Bound} from './Bound';
import {Geom} from './Num';
import {Const} from './Util';
import {Pt, PtLike, GroupLike, Group} from './Pt';
import {Rectangle} from "./Op";


/**
 * A Space for DOM elements
 */
export class DOMSpace extends MultiTouchSpace {
  
  protected _canvas:HTMLElement|SVGElement;
  protected _container:Element;
  
  id: string = "domspace";
  protected _autoResize = true;
  protected _bgcolor = "#e1e9f0";
  
  protected _css = {};
  
  
  /**
  * Create a DOMSpace which represents a Space for DOM elements
  * @param elem Specify an element by its "id" attribute as string, or by the element object itself. Use css to customize its appearance if needed.
  * @param callback an optional callback `function(boundingBox, spaceElement)` to be called when canvas is appended and ready. Alternatively, a "ready" event will also be fired from the element when it's appended, which can be traced with `spaceInstance.canvas.addEventListener("ready")`
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
  * Set up various options for DOMSpace. The `opt` parameter is an object with the following fields. This is usually set during instantiation, eg `new DOMSpace(...).setup( { opt } )`
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
    this.styles( {width: `${b.width}px`, height: `${b.height}px`}, true );

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
    
    let b = Bound.fromBoundingRect( this._container.getBoundingClientRect() );

    if (this._autoResize) {
      this.styles( {width: "100%", height: "100%"}, true );
    } else {
      this.styles( {width: `${b.width}px`, height: `${b.height}px`}, true );
    }

    this.resize( b, evt );
    
  }
  
  
  /**
  * Get a new `DOMForm` for drawing
  * @see `DOMForm`
  */
  getForm():Form {
    return new DOMForm( this );
  }
  
  
  /**
  * Get this DOM element
  */
  get element():Element {
    return this._canvas;
  }
  
  
  /**
  * Get the parent DOM element that contains this DOM element
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
  @param bg background color as hex or rgba string
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
  * @return this
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
  * @returns this DOM element 
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


/**
 * Form for DOMSpace. Note that this is currently not implemented.
 */
export class DOMForm extends Form {

  protected _ctx:DOMFormContext = {
    group: null,
    groupID: "pts",
    groupCount: 0,
    currentID: "pts0",
    style: {
      "filled": true,
      "stroked": true,
      "background": "#f03",
      "border-color": "#fff",
      "border-width": 1,
      "stroke-linejoin": "none",
      "stroke-linecap": "none"
    },
    font: "11px sans-serif",
    fontSize: 11,
    fontFamily: "sans-serif"
  };

  static domID:number = 0;
  
  protected _space:DOMSpace;
  protected _ready:boolean = false;
  
  constructor( space:DOMSpace ) {
    super();
    this._space = space;
  }
  
  get space():DOMSpace { return this._space; }
}



/**
 * A Space for SVG elements
 */
export class SVGSpace extends DOMSpace {
  
  id: string = "svgspace";
  protected _bgcolor:string = "#999";
  

  /**
  * Create a SVGSpace which represents a Space for SVG elements
  * @param elem Specify an element by its "id" attribute as string, or by the element object itself. An element can be an existing `<svg>`, or a `<div>` container in which a new `<svg>` will be created. If left empty, a `<div id="pt_container"><svg id="pt" /></div>` will be added to DOM. Use css to customize its appearance if needed.
  * @param callback an optional callback `function(boundingBox, spaceElement)` to be called when canvas is appended and ready. Alternatively, a "ready" event will also be fired from the `<svg>` element when it's appended, which can be traced with `spaceInstance.canvas.addEventListener("ready")`
  * @example `new SVGSpace( "#myElementID" )`
  */
  constructor( elem:string|Element, callback?:Function ) {
    super( elem, callback );
    
    if (this._canvas.nodeName.toLowerCase() != "svg") {
      let s = this._createElement( "svg", `${this.id}_svg` );
      this._canvas.appendChild( s );
      this._container = this._canvas;
      this._canvas = s as SVGElement;
    }
  }
  

  /**
  * Get a new `SVGForm` for drawing
  * @see `SVGForm`
  */
  getForm():SVGForm { return new SVGForm( this ); }
  

  /**
  * Get the html element
  */
  get element():Element {
    return this._canvas;
  }

  /**
  * This overrides Space's `resize` function. It's used as a callback function for window's resize event and not usually called directly. You can keep track of resize events with `resize: (bound ,evt)` callback in your player objects (See `Space`'s `add()` function). 
  * @param b a Bound object to resize to
  * @param evt Optionally pass a resize event
  */
  resize( b:Bound, evt?:Event):this {
    super.resize( b, evt );
    this.element.setAttribute("viewBox", `0 0 ${this.bound.width} ${this.bound.height}`);
    this.element.setAttribute("width", `${this.bound.width}px`);
    this.element.setAttribute("height", `${this.bound.height}px`);
    return this;
  }
  

  /**
   * A static function to add a svg element inside a node. Usually you don't need to use this directly. See methods in `SVGForm` instead.
   * @param parent the parent element, or `null` to use current `<svg>` as parent.
   * @param name a string of element name,  such as `rect` or `circle`
   * @param id id attribute of the new element
   */
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
  

  /**
   * A private function to create the svg namespaced element. This will create a <svg> if elem parameter is not set.
   * @param elem tag name
   * @param id id string
   */
  _createElement( elem:string="svg", id:string ):Element {
    let d = document.createElementNS( "http://www.w3.org/2000/svg", elem );
    if (id) d.setAttribute( "id", id );
    return d;
  }
  
  
  /**
  * Remove an item from this Space
  * @param item a player item with an auto-assigned `animateID` property
  */
  remove( player:IPlayer ):this {
    let temp = this._container.querySelectorAll( "."+SVGForm.scopeID( player ) );
    
    temp.forEach( (el:Element) => { 
      el.parentNode.removeChild( el );
    });
    
    return super.remove( player );
  }
  
  
  /**
   * Remove all items from this Space
   */
  removeAll():this {
    this._container.innerHTML = "";
    return super.removeAll();
  }
  
}


/**
 * A type that represents the current context for an SVGForm
 */
export type DOMFormContext = {
  group:Element, groupID:string, groupCount:number,
  currentID:string,
  style:object,
  font:string, fontSize:number, fontFamily:string
};


/**
* SVGForm is an implementation of abstract class VisualForm. It provide methods to express Pts on SVGSpace.   
* You may extend SVGForm to implement your own expressions for SVGSpace.
*/
export class SVGForm extends VisualForm {
  
  protected _ctx:DOMFormContext = {
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
  

  /**
  * Create a new SVGForm. You may also use `space.getForm()` to get the default form.
  * @param space an instance of SVGSpace
  */
  constructor( space:SVGSpace ) {
    super();
    this._space = space;
    
    this._space.add( { start: () => {
      this._ctx.group = this._space.element;
      this._ready = true;
    }} );
  }
  

  /**
  * get the SVGSpace instance that this form is associated with
  */
  get space():SVGSpace { return this._space; }
  
  
  /**
   * Update a style in _ctx context or throw an Erorr if the style doesn't exist
   * @param k style key
   * @param v  style value
   */
  protected styleTo( k, v ) { 
    if (this._ctx.style[k] === undefined) throw new Error(`${k} style property doesn't exist`);
    this._ctx.style[k] = v; 
  }
  

  /**
    * Set current fill style. Provide a valid color string or `false` to specify no fill color.
    * @example `form.fill("#F90")`, `form.fill("rgba(0,0,0,.5")`, `form.fill(false)`
    * @param c fill color
    */
  fill( c:string|boolean ):this {
    if (typeof c == "boolean") {
      this.styleTo( "filled", c );
    } else {
      this.styleTo( "filled", true );
      this.styleTo( "fill", c );
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
      this.styleTo( "stroked", c );
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
  * Reset the context's common styles to this form's styles. This supports using multiple forms on the same canvas context.
  */
  reset():this {
    this._ctx.style = {
      "filled": true, "stroked": true,
      "fill": "#f03", "stroke": "#fff",
      "stroke-width": 1,
      "stroke-linejoin": "bevel",
      "stroke-linecap": "sqaure"
    };

    this._font = new Font( 14, "sans-serif");
    this._ctx.font = this._font.value;

    return this;
  }

  
  /**
   * Set this form's group scope by an ID, and optionally define the group's parent element. A group scope keeps track of elements by their generated IDs, and updates their properties as needed. See also `scope()`.
   * @param group_id a string to use as prefix for the group's id. For example, group_id "hello" will create elements with id like "hello-1", "hello-2", etc
   * @param group Optional DOM or SVG element to define this group's parent element
   * @returns this form's context
   */
  updateScope( group_id:string, group?:Element ):object {
    this._ctx.group = group;
    this._ctx.groupID = group_id;
    this._ctx.groupCount = 0;
    this.nextID();
    return this._ctx;
  }
  

  /**
   * Set the current group scope to an item added into space, in order to keep track of any point, circle, etc created within it. The item must have an `animateID` property, so that elements created within the item will have generated IDs like "item-{animateID}-{count}".
   * @param item a "player" item that's added to space (see `space.add(...)`) and has an `animateID` property
   * @returns this form's context
   */
  scope( item:IPlayer ) {
    if (!item || item.animateID == null ) throw new Error("item not defined or not yet added to Space");
    return this.updateScope( SVGForm.scopeID( item ), this.space.element );
  }
  
  
  /**
   * Get next available id in the current group
   * @returns an id string
   */
  nextID():string {
    this._ctx.groupCount++;
    this._ctx.currentID = `${this._ctx.groupID}-${this._ctx.groupCount}`;
    return this._ctx.currentID;
  }
  

  /**
   * A static function to generate an ID string based on a context object
   * @param ctx a context object for an SVGForm
   */
  static getID( ctx ):string {
    return ctx.currentID || `p-${SVGForm.domID++}`;
  }


  /**
   * A static function to generate an ID string for a scope, based on a "player" item in the Space
   * @param item a "player" item that's added to space (see `space.add(...)`) and has an `animateID` property
   */
  static scopeID( item:IPlayer ):string {
    return `item-${item.animateID}`;
  }
  

  /**
   * A static function to help adding style object to an element. This put all styles into `style` attribute instead of individual attributes, so that the styles can be parsed by Adobe Illustrator.
   * @param elem A DOM element to add to
   * @param styles an object of style properties
   * @example `SVGForm.style(elem, {fill: "#f90", stroke: false})`
   * @returns this DOM element 
   */
  static style( elem:SVGElement, styles:object) {
    let st = [];

    if ( !styles["filled"] ) st.push( "fill: none");
    if ( !styles["stroked"] ) st.push( "stroke: none");
        
    for (let k in styles) {
      if ( styles.hasOwnProperty(k) && k != "filled" && k != "stroked" ) {
        let v = styles[k];
        if (v) {
          if ( !styles["filled"] && k.indexOf('fill') === 0 ) {
            continue;
          } else if ( !styles["stroked"] && k.indexOf('stroke') === 0 ) {
            continue;
          } else {
            st.push( `${k}: ${v}` );
          }
        }
      }
    }
    
    return DOMSpace.setAttr( elem, {style: st.join(";")} );
  }
  
  
  /**
    * Draws a point
    * @param ctx a context object of SVGForm
    * @param pt a Pt object or numeric array
    * @param radius radius of the point. Default is 5.
    * @param shape The shape of the point. Defaults to "square", but it can be "circle" or a custom shape function in your own implementation.
    * @example `SVGForm.point( p )`, `SVGForm.point( p, 10, "circle" )`
    */
  static point( ctx:DOMFormContext, pt:PtLike, radius:number=5, shape:string="square" ):SVGElement {
    if (shape === "circle") {
      return SVGForm.circle( ctx, pt, radius );
    } else {
      return SVGForm.square( ctx, pt, radius );
    }
  }
  
  
  /**
    * Draws a point
    * @param p a Pt object
    * @param radius radius of the point. Default is 5.
    * @param shape The shape of the point. Defaults to "square", but it can be "circle" or a custom shape function in your own implementation.
    * @example `form.point( p )`, `form.point( p, 10, "circle" )`
    */
  point( pt:PtLike, radius:number=5, shape:string="square" ):this {
    this.nextID();
    SVGForm.point( this._ctx, pt, radius, shape );
    return this;
  }
  

  /**
    * A static function to draw a circle
    * @param ctx a context object of SVGForm
    * @param pt center position of the circle
    * @param radius radius of the circle
    */
  static circle( ctx:DOMFormContext, pt:PtLike, radius:number=10 ):SVGElement {
    let elem = SVGSpace.svgElement( ctx.group, "circle", SVGForm.getID(ctx) );
    
    DOMSpace.setAttr( elem, {
      cx: pt[0],
      cy: pt[1],
      r: radius
    });
    
    SVGForm.style( elem, ctx.style );
    return elem;
  }
  

  /**
    * Draw a circle
    * @param pts usually a Group of 2 Pts, but it can also take an array of two numeric arrays [ [position], [size] ]
    * @see [`Circle.fromCenter`](./_op_.circle.html#frompt)
    */
  circle( pts:GroupLike|number[][] ):this {
    this.nextID();
    SVGForm.circle( this._ctx, pts[0], pts[1][0] );
    return this;
  }
  

  /**
    * A static function to draw an arc.
    * @param ctx a context object of SVGForm
    * @param pt center position 
    * @param radius radius of the arc circle
    * @param startAngle start angle of the arc
    * @param endAngle end angle of the arc
    * @param cc an optional boolean value to specify if it should be drawn clockwise (`false`) or counter-clockwise (`true`). Default is clockwise.
    */
  static arc( ctx:DOMFormContext, pt:PtLike, radius:number, startAngle:number, endAngle:number, cc?:boolean ):SVGElement {
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
  

  /**
    * Draw an arc.
    * @param pt center position
    * @param radius radius of the arc circle
    * @param startAngle start angle of the arc
    * @param endAngle end angle of the arc
    * @param cc an optional boolean value to specify if it should be drawn clockwise (`false`) or counter-clockwise (`true`). Default is clockwise.
    */
  arc( pt:PtLike, radius:number, startAngle:number, endAngle:number, cc?:boolean ):this {
    this.nextID();
    SVGForm.arc( this._ctx, pt, radius, startAngle, endAngle, cc );
    return this;
  }
  

  /**
    * A static function to draw a square 
    * @param ctx a context object of SVGForm
    * @param pt center position of the square
    * @param halfsize half size of the square
    */
  static square( ctx:DOMFormContext, pt:PtLike, halfsize:number ) {
    let elem = SVGSpace.svgElement( ctx.group, "rect", SVGForm.getID( ctx ) );
    DOMSpace.setAttr( elem, {x: pt[0]-halfsize, y:pt[1]-halfsize, width: halfsize*2, height: halfsize*2} );
    SVGForm.style( elem, ctx.style );
    return elem;
  }
  

  /**
   * Draw a square, given a center and its half-size
   * @param pt center Pt
   * @param halfsize half-size
   */
  square( pt:PtLike, halfsize:number ):this {
    this.nextID();
    SVGForm.square( this._ctx, pt, halfsize );
    return this;
  } 
  

  /**
  * A static function to draw a line
  * @param ctx a context object of SVGForm
  * @param pts a Group of multiple Pts, or an array of multiple numeric arrays
  */
  static line( ctx:DOMFormContext, pts:GroupLike|number[][] ):SVGElement {
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
  

  /**
  * Draw a line or polyline
  * @param pts a Group of multiple Pts, or an array of multiple numeric arrays
  */
  line( pts:GroupLike|number[][] ):this {
    this.nextID();
    SVGForm.line( this._ctx, pts );
    return this;
  }
  
  
  /**
   * A static helper function to draw polyline or polygon
   * @param ctx a context object of SVGForm
   * @param pts a Group of multiple Pts, or an array of multiple numeric arrays
   * @param closePath a boolean to specify if the polygon path should be closed
   */
  static _poly( ctx:DOMFormContext, pts:GroupLike|number[][], closePath:boolean=true) {
    if (!this._checkSize( pts)) return;
    
    let elem = SVGSpace.svgElement( ctx.group, ((closePath) ? "polygon" : "polyline"), SVGForm.getID(ctx) );
    let points:string = (pts as number[][]).reduce( (a, p) => a+`${p[0]},${p[1]} `, "");
    DOMSpace.setAttr( elem, {points: points} );    
    SVGForm.style( elem, ctx.style );
    return elem;
  }
  
  
  /**
    * A static function to draw polygon
    * @param ctx a context object of SVGForm
    * @param pts a Group of multiple Pts, or an array of multiple numeric arrays
    */
  static polygon( ctx:DOMFormContext, pts:GroupLike|number[][] ):SVGElement {
    return SVGForm._poly( ctx, pts, true );
  }
  

  /**
  * Draw a polygon
  * @param pts a Group of multiple Pts, or an array of multiple numeric arrays
  */
  polygon( pts:GroupLike|number[][] ):this {
    this.nextID();
    SVGForm.polygon( this._ctx, pts );
    return this;
  }
  
  
  /**
  * A static function to draw a rectangle
  * @param ctx a context object of SVGForm
  * @param pts usually a Group of 2 Pts specifying the top-left and bottom-right positions. Alternatively it can be an array of numeric arrays.
  */
  static rect( ctx:DOMFormContext, pts:GroupLike|number[][] ):SVGElement {
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
  
  
  /**
    * Draw a rectangle
    * @param pts usually a Group of 2 Pts specifying the top-left and bottom-right positions. Alternatively it can be an array of numeric arrays.
    */
  rect( pts:number[][]|Pt[] ):this {
    this.nextID();
    SVGForm.rect( this._ctx, pts );
    return this;
  }
  
  
  /**
    * A static function to draw text
    * @param ctx a context object of SVGForm
    * @param `pt` a Point object to specify the anchor point
    * @param `txt` a string of text to draw
    * @param `maxWidth` specify a maximum width per line
    */
  static text( ctx:DOMFormContext, pt:PtLike, txt:string ):SVGElement {
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
  

  /**
    * Draw text on canvas
    * @param `pt` a Pt or numeric array to specify the anchor point
    * @param `txt` text
    * @param `maxWidth` specify a maximum width per line
    */
  text( pt:PtLike, txt:string ): this {
    this.nextID();
    SVGForm.text( this._ctx, pt, txt );
    return this;
  }
  

  /**
    * A convenient way to draw some text on canvas for logging or debugging. It'll be draw on the top-left of the canvas as an overlay.
    * @param txt text
    */
  log( txt ):this {
    this.fill("#000").stroke("#fff", 0.5).text( [10,14], txt );   
    return this;
  }
  
  
}