/*! Source code licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */

import {MultiTouchSpace} from './Space';
import {Form, VisualForm, Font} from "./Form";
import {Util} from './Util';
import {Pt, Bound} from './Pt';
import {PtLike, GroupLike, IPlayer, DOMFormContext} from "./Types";



/**
 * DOMSpace is a space for DOM elements. Usually its subclasses such as [`HTMLSpace`](#link) and [`#SVGSpace`](#link) should be used instead. 
 * Learn more about spaces in [this guide](../guide/space-0500).
 */
export class DOMSpace extends MultiTouchSpace {
  
  protected _canvas:HTMLElement|SVGElement;
  protected _container:Element;
  
  id: string = "domspace";
  protected _autoResize = true;
  protected _bgcolor = "#e1e9f0";
  protected _css = {};
  
  
  /**
  * Create a DOMSpace for HTML DOM elements
  * @param elem Specify an element by its "id" attribute as string, or by the element object itself. Use css to customize its appearance if needed.
  * @param callback an optional callback `function(boundingBox, spaceElement)` to be called when element is appended and ready. Alternatively, a "ready" event will also be fired from the element when it's appended, which can be traced with `spaceInstance.element.addEventListener("ready")`
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
      this.id = elem.substr(1);
    }
    
    // if selector is not defined, create a canvas
    if (!_selector) {      
      this._container = DOMSpace.createElement( "div", "pts_container" );
      this._canvas = DOMSpace.createElement( "div", "pts_element" ) as HTMLElement;
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
  * Helper function to create a DOM element.
  * @param elem element tag name
  * @param id element id attribute
  * @param appendTo Optional, if specified, the created element will be appended to this element
  */
  static createElement( elem:string="div", id:string, appendTo?:Element ):Element {
    let d = document.createElement( elem );
    if (id) d.setAttribute( "id", id );
    if (appendTo && appendTo.appendChild) appendTo.appendChild( d );
    return d;
    
  }
  
  
  /**
  * Handle callbacks after element is mounted in DOM.
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

    this.refresh(false); // No need to clear and redraw for every frame in DOM
    
    if (callback) callback( this.bound, this._canvas );
  }
  
  
  /**
  * Set up various options for DOMSpace. This is usually set during instantiation, eg `new DOMSpace(...).setup( {opt} )`.
  * @param opt an object with these optional properties: **bgcolor** is a hex or rgba string to set initial background color of the canvas, or use `false` or "transparent" to set a transparent background; **resize** a boolean to set whether `<canvas>` size should auto resize to match its container's size, which can also be set using `autoSize()`.
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
   * Not implemented. See SVGSpace and HTMLSpace for implementation.
   */
  getForm():Form {
    return null;
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
  * This overrides Space's `resize` function. It's used as a callback function for window's resize event and not usually called directly. You can keep track of resize events with `resize: (bound, evt)` callback in your player objects (See [`Space.add`](#link) function). 
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
    }
    
    return this;
  }
  
  
  /**
  * Window resize handling.
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
  * Get this DOM element.
  */
  get element():Element {
    return this._canvas;
  }
  
  
  /**
  * Get the parent DOM element that contains this DOM element.
  */
  get parent():Element {
    return this._container;
  }
  
  
  /**
  * A property to indicate if the Space is ready.
  */
  get ready():boolean { return this._isReady; }
  
  
  /**
  * Clear the element's contents, and optionally set a new background color. This overrides Space's `clear` function.
  * @param bg Optionally specify a custom background color in hex or rgba string, or "transparent". If not defined, it will use its `bgcolor` property as background color to clear the canvas.
  */
  clear( bg?:string ):this {
    if (bg) this.background = bg;
    this._canvas.innerHTML = "";
    return this;
  } 
  
  
  /**
  * Set a background color on the container element.
  @param bg background color as hex or rgba string
  */
  set background( bg:string ) {
    this._bgcolor = bg;
    (this._container as HTMLElement).style.backgroundColor = this._bgcolor;
  }
  get background():string { return this._bgcolor; }
  
  
  /**
  * Add or update a style definition, and optionally update that style in the Element.
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
  * Add of update a list of style definitions, and optionally update those styles in the Element.
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
  * A static helper function to add or update Element attributes.
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
  * A static helper function to compose an inline style string from a object of styles.
  * @param elem Element to update
  * @param data an object with key-value pairs
  * @exmaple `DOMSpace.getInlineStyles( {width: "100px", "font-size": "10px"} )`
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
 * **[Experimental]** HTMLSpace is a subclass of DOMSpace that works with HTML elements. Note that this is currently experimental and may change in future.  See [a demo here](../demo/index.html?name=htmlform.scope).
 */
export class HTMLSpace extends DOMSpace {

  /**
  * Get a new `HTMLForm` which provides visualization functions in html elements. 
  * @see `HTMLForm`
  */
  getForm():Form {
    return new HTMLForm( this );
  }

  /**
   * A static function to add a DOM element inside a node. Usually you don't need to use this directly. See methods in [`HTMLForm`](#link) instead.
   * @param parent the parent element, or `null` to use current `<svg>` as parent.
   * @param name a string of element name,  such as `rect` or `circle`
   * @param id id attribute of the new element
   * @param autoClass add a class based on the id (from char 0 to index of "-"). Default is true.
   */
  static htmlElement( parent:Element, name:string, id?:string, autoClass:boolean=true ):HTMLElement {
    
    if (!parent || !parent.appendChild ) throw new Error( "parent is not a valid DOM element" );
    
    let elem = document.querySelector(`#${id}`);
    if (!elem) {
      elem = document.createElement( name );
      elem.setAttribute( "id", id );
      
      if (autoClass) elem.setAttribute( "class",id.substring(0, id.indexOf("-")) );
      parent.appendChild( elem );
    }
    return elem as HTMLElement;
  }


  /**
  * Remove an item from this space.
  * @param item a player item with an auto-assigned `animateID` property
  */
  remove( player:IPlayer ):this {
    let temp = this._container.querySelectorAll( "."+HTMLForm.scopeID( player ) );
    
    temp.forEach( (el:Element) => { 
      el.parentNode.removeChild( el );
    });
    
    return super.remove( player );
  }
  
  
  /**
   * Remove all items from this space.
   */
  removeAll():this {
    this._container.innerHTML = "";
    return super.removeAll();
  }
}


/**
 * **[Experimental]** HTMLForm is an implementation of abstract class [`VisualForm`](#link). It provide methods to express Pts on [`HTMLSpace`](#link). Note that this is currently experimental and may change in future.
 */
export class HTMLForm extends VisualForm {

  protected _ctx:DOMFormContext = {
    group: null,
    groupID: "pts",
    groupCount: 0,
    currentID: "pts0",
    currentClass: "",
    style: {
      "filled": true,
      "stroked": true,
      "background": "#f03",
      "border-color": "#fff",
      "color": "#000",
      "border-width": "1px",
      "border-radius": "0",
      "border-style": "solid",
      "position": "absolute",
      "top": 0,
      "left": 0,
      "width": 0,
      "height": 0
    },
    font: "11px sans-serif",
    fontSize: 11,
    fontFamily: "sans-serif"
  };

  static groupID:number = 0;
  static domID:number = 0;
  
  protected _space:HTMLSpace;
  protected _ready:boolean = false;
  
  /**
   * Create a new `HTMLForm`. Alternatively, you can use [`HTMLSpace.getForm`](#link) function to get an instance of HTMLForm.
   * @param space the space to use
   */
  constructor( space:HTMLSpace ) {
    super();
    this._space = space;
    
    this._space.add( { start: () => {
      this._ctx.group = this._space.element;
      this._ctx.groupID = "pts_dom_"+(HTMLForm.groupID++);
      this._ready = true;
    }} );
  }
  
  /**
   * Get the corresponding space for this form
   */
  get space():HTMLSpace { return this._space; }


  /**
   * Usually not used directly. This updates a style in `_ctx` context or throw an Error if the style doesn't exist.
   * @param k style key
   * @param v  style value
   * @param unit Optional unit like 'px' to append to value
   */
  protected styleTo( k, v, unit:string='' ) { 
    if (this._ctx.style[k] === undefined) throw new Error(`${k} style property doesn't exist`);
    this._ctx.style[k] = `${v}${unit}`; 
  }


  /**
  * Set current fill style. Provide a valid color string or `false` to specify no fill color.
  * @example `form.fill("#F90")`, `form.fill("rgba(0,0,0,.5")`, `form.fill(false)`
  * @param c fill color
  */
  fill( c:string|boolean ):this {
    if (typeof c == "boolean") {
      this.styleTo( "filled", c );
      if (!c) this.styleTo( "background", "transparent" );
    } else {
      this.styleTo( "filled", true );
      this.styleTo( "background", c );
    }
    return this;
  }

  /**
  * Set current stroke style. Provide a valid color string or `false` to specify no stroke color.
  * @example `form.stroke("#F90")`, `form.stroke("rgba(0,0,0,.5")`, `form.stroke(false)`, `form.stroke("#000", 0.5, 'round', 'square')`
  * @param c stroke color which can be as color, gradient, or pattern. (See [canvas documentation](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/strokeStyle))
  * @param width Optional value (can be floating point) to set line width
  * @param linejoin not implemented in HTMLForm
  * @param linecap not implemented in HTMLForm
  */
  stroke( c:string|boolean, width?:number, linejoin?:string, linecap?:string ):this {
    if (typeof c == "boolean") {
      this.styleTo( "stroked", c );
      if (!c) this.styleTo("border-width", 0);
    } else {
      this.styleTo( "stroked", true );
      this.styleTo( "border-color", c );
      this.styleTo( "border-width", (width || 1)+"px" );
    }
    return this;
  }


  /**
  * Set current text color style. Provide a valid color string.
  * @example `form.fill("#F90")`, `form.fill("rgba(0,0,0,.5")`, `form.fill(false)`
  * @param c fill color
  */
  fillText( c:string ):this {
    this.styleTo( "color", c );
    return this;
  }


  /**
   * Add custom class to the created element.
   * @param c custom class name or `false` to reset it
   * @example `form.fill("#f00").cls("myClass").rects(r)` `form.cls(false).circles(c)`
   */
  cls( c:string|boolean ) {
    if (typeof c == "boolean") {
      this._ctx.currentClass = "";
    } else {
      this._ctx.currentClass = c;
    }
    return this;
  }
  

  /**
  * Set the current font.
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
      "background": "#f03", "border-color": "#fff",
      "border-width": "1px"
    };

    this._font = new Font( 14, "sans-serif");
    this._ctx.font = this._font.value;

    return this;
  }

  /**
   * Set this form's group scope by an ID, and optionally define the group's parent element. A group scope keeps track of elements by their generated IDs, and updates their properties as needed. See also `scope()`.
   * @param group_id a string to use as prefix for the group's id. For example, group_id "hello" will create elements with id like "hello-1", "hello-2", etc
   * @param group Optional DOM element to define this group's parent element
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
    return this.updateScope( HTMLForm.scopeID( item ), this.space.element );
  }
  
  
  /**
   * Get next available id in the current group.
   * @returns an id string
   */
  nextID():string {
    this._ctx.groupCount++;
    this._ctx.currentID = `${this._ctx.groupID}-${this._ctx.groupCount}`;
    return this._ctx.currentID;
  }
  

  /**
   * A static function to generate an ID string based on a context object.
   * @param ctx a context object for an HTMLForm
   */
  static getID( ctx ):string {
    return ctx.currentID || `p-${HTMLForm.domID++}`;
  }


  /**
   * A static function to generate an ID string for a scope, based on a "player" item in the Space.
   * @param item a "player" item that's added to space (see `space.add(...)`) and has an `animateID` property
   */
  static scopeID( item:IPlayer ):string {
    return `item-${item.animateID}`;
  }
  
  
  /**
   * A static function to help adding style object to an element. This put all styles into `style` attribute instead of individual attributes, so that the styles can be parsed by Adobe Illustrator.
   * @param elem A DOM element to add to
   * @param styles an object of style properties
   * @example `HTMLForm.style(elem, {fill: "#f90", stroke: false})`
   * @returns DOM element 
   */
  static style( elem:Element, styles:object):Element {
    let st = [];

    if ( !styles["filled"] ) st.push( "background: none");
    if ( !styles["stroked"] ) st.push( "border: none");
        
    for (let k in styles) {
      if ( styles.hasOwnProperty(k) && k != "filled" && k != "stroked" ) {
        let v = styles[k];
        if (v) {
          if ( !styles["filled"] && k.indexOf('background') === 0 ) {
            continue;
          } else if ( !styles["stroked"] && k.indexOf('border-width') === 0 ) {
            continue;
          } else {
            st.push( `${k}: ${v}` );
          }
        }
      }
    }
    
    return HTMLSpace.setAttr( elem, {style: st.join(";")} );
  }

  /**
   * A helper function to set top, left, width, height of DOM element.
   * @param x left position
   * @param y top position
   * @param w width
   * @param h height
   */
  static rectStyle( ctx:DOMFormContext, pt:PtLike, size:PtLike ):DOMFormContext {
    ctx.style["left"] = pt[0]+"px"; 
    ctx.style["top"] = pt[1]+"px"; 
    ctx.style["width"] = size[0]+"px"; 
    ctx.style["height"] = size[1]+"px"; 
    return ctx;
  }
  
  /**
  * A static function to draws a point.
  * @param ctx a context object of HTMLForm
  * @param pt a Pt object or numeric array
  * @param radius radius of the point. Default is 5.
  * @param shape The shape of the point. Defaults to "square", but it can be "circle" or a custom shape function in your own implementation.
  * @example `HTMLForm.point( p )`, `HTMLForm.point( p, 10, "circle" )`
  */
  static point( ctx:DOMFormContext, pt:PtLike, radius:number=5, shape:string="square" ):Element {
    if (shape === "circle") {
      return HTMLForm.circle( ctx, pt, radius );
    } else {
      return HTMLForm.square( ctx, pt, radius );
    }
  }


  /**
  * Draws a point.
  * @param p a Pt object
  * @param radius radius of the point. Default is 5.
  * @param shape The shape of the point. Defaults to "square", but it can be "circle" or a custom shape function in your own implementation.
  * @example `form.point( p )`, `form.point( p, 10, "circle" )`
  */
  point( pt:PtLike, radius:number=5, shape:string="square" ):this {
    this.nextID();
    if (shape == "circle") this.styleTo("border-radius", "100%");
    HTMLForm.point( this._ctx, pt, radius, shape );
    return this;
  }

  
  /**
  * A static function to draw a circle.
  * @param ctx a context object of HTMLForm
  * @param pt center position of the circle
  * @param radius radius of the circle
  */
  static circle( ctx:DOMFormContext, pt:PtLike, radius:number=10 ):Element {
    let elem = HTMLSpace.htmlElement( ctx.group, "div", HTMLForm.getID(ctx) );
    HTMLSpace.setAttr( elem, {class: `pts-form pts-circle ${ctx.currentClass}` });
    HTMLForm.rectStyle( ctx, new Pt(pt).$subtract( radius ), new Pt(radius*2, radius*2) );
    HTMLForm.style( elem, ctx.style );
    return elem;
  }  


  /**
  * Draw a circle.
  * @param pts usually a Group of 2 Pts, but it can also take an array of two numeric arrays [ [position], [size] ]
  * @see [`Circle.fromCenter`](./_op_.circle.html#frompt)
  */
  circle( pts:GroupLike|number[][] ):this {
    this.nextID();
    this.styleTo("border-radius", "100%");
    HTMLForm.circle( this._ctx, pts[0], pts[1][0] );
    return this;
  }


  /**
  * A static function to draw a square.
  * @param ctx a context object of HTMLForm
  * @param pt center position of the square
  * @param halfsize half size of the square
  */
  static square( ctx:DOMFormContext, pt:PtLike, halfsize:number ) {
    let elem = HTMLSpace.htmlElement( ctx.group, "div", HTMLForm.getID(ctx) );
    HTMLSpace.setAttr( elem, {class: `pts-form pts-square ${ctx.currentClass}` });
    HTMLForm.rectStyle( ctx, new Pt(pt).$subtract( halfsize ), new Pt(halfsize*2, halfsize*2) );
    HTMLForm.style( elem, ctx.style );
    return elem;
  }
  

  /**
   * Draw a square, given a center and its half-size.
   * @param pt center Pt
   * @param halfsize half-size
   */
  square( pt:PtLike, halfsize:number ):this {
    this.nextID();
    HTMLForm.square( this._ctx, pt, halfsize );
    return this;
  } 


  /**
  * A static function to draw a rectangle.
  * @param ctx a context object of HTMLForm
  * @param pts usually a Group of 2 Pts specifying the top-left and bottom-right positions. Alternatively it can be an array of numeric arrays.
  */
  static rect( ctx:DOMFormContext, pts:GroupLike|number[][] ):Element {
    if (!this._checkSize( pts)) return;

    let elem = HTMLSpace.htmlElement( ctx.group, "div", HTMLForm.getID(ctx) );    
    HTMLSpace.setAttr( elem, { class: `pts-form pts-rect ${ctx.currentClass}` });
    HTMLForm.rectStyle( ctx, pts[0], pts[1] );
    HTMLForm.style( elem, ctx.style );
    return elem;
  }


  /**
  * Draw a rectangle.
  * @param pts usually a Group of 2 Pts specifying the top-left and bottom-right positions. Alternatively it can be an array of numeric arrays.
  */
  rect( pts:number[][]|Pt[] ):this {
    this.nextID();
    this.styleTo( "border-radius", "0" );
    HTMLForm.rect( this._ctx, pts );
    return this;
  }


  /**
  * A static function to draw text.
  * @param ctx a context object of HTMLForm
  * @param `pt` a Point object to specify the anchor point
  * @param `txt` a string of text to draw
  * @param `maxWidth` specify a maximum width per line
  */
  static text( ctx:DOMFormContext, pt:PtLike, txt:string ):Element {
    let elem = HTMLSpace.htmlElement( ctx.group, "div", HTMLForm.getID(ctx) );
    
    HTMLSpace.setAttr( elem, {
      position: 'absolute',
      class: `pts-form pts-text ${ctx.currentClass}`,
      left: pt[0],
      top: pt[1],
    });
    
    elem.textContent = txt;
    HTMLForm.style( elem, ctx.style );
    
    return elem;
  }

  /**
  * Draw text on canvas.
  * @param `pt` a Pt or numeric array to specify the anchor point
  * @param `txt` text
  * @param `maxWidth` specify a maximum width per line
  */
  text( pt:PtLike, txt:string ): this {
    this.nextID();
    HTMLForm.text( this._ctx, pt, txt );
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
  

  /**
   * Arc is not implemented in HTMLForm.
   */
  arc( pt:PtLike, radius:number, startAngle:number, endAngle:number, cc?:boolean ):this {
    Util.warn( "arc is not implemented in HTMLForm" );
    return this;
  }


  /**
   * Line is not implemented in HTMLForm.
   */
  line( pts:GroupLike|number[][] ):this {
    Util.warn( "line is not implemented in HTMLForm" );
    return this;
  }


  /**
   * Polygon is not implemented in HTMLForm.
   * @param pts 
   */
  polygon( pts:GroupLike|number[][] ):this {
    Util.warn( "polygon is not implemented in HTMLForm" );
    return this;
  }
}


