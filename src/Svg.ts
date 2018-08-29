/*! Source code licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */

import {VisualForm, Font} from "./Form";
import {Geom} from './Num';
import {Const} from './Util';
import {Pt, Group, Bound} from './Pt';
import {Rectangle} from "./Op";
import {DOMSpace} from "./Dom";
import {PtLike, GroupLike, IPlayer, DOMFormContext} from "./Types";



/**
 * **[Experimental]** SVGSpace extends [`DOMSpace`](#link) to support SVG elements. Use it with [`SVGForm`](#link) to express Pts in svg. 
 * You may easily switch between html canvas and svg renderings with minimal code changes. Check out the [Space guide](../guide/Space-0500.html) for details, and see [a demo here](../demo/index.html?name=svgform.scope).
 */
export class SVGSpace extends DOMSpace {
  
  id: string = "svgspace";
  protected _bgcolor:string = "#999";
  

  /**
  * Create a SVGSpace which represents a Space for SVG elements.
  * @param elem Specify an element by its "id" attribute as string, or by the element object itself. An element can be an existing `<svg>`, or a `<div>` container in which a new `<svg>` will be created. If left empty, a `<div id="pt_container"><svg id="pt" /></div>` will be added to DOM. Use css to customize its appearance if needed.
  * @param callback an optional callback `function(boundingBox, spaceElement)` to be called when canvas is appended and ready. Alternatively, a "ready" event will also be fired from the `<svg>` element when it's appended, which can be traced with `spaceInstance.canvas.addEventListener("ready")`
  * @example `new SVGSpace( "#myElementID" )`
  */
  constructor( elem:string|Element, callback?:Function ) {
    super( elem, callback );
    
    if (this._canvas.nodeName.toLowerCase() != "svg") {
      let s = SVGSpace.svgElement( this._canvas, "svg", `${this.id}_svg` );
      this._container = this._canvas;
      this._canvas = s as SVGElement;
    }
  }
  

  /**
  * Get a new [`SVGForm`](#link) for drawing.
  * @see `SVGForm`
  */
  getForm():SVGForm { return new SVGForm( this ); }
  

  /**
  * Get the DOM element.
  */
  get element():Element {
    return this._canvas;
  }

  /**
  * This overrides Space's `resize` function. It's used as a callback function for window's resize event and not usually called directly. 
  * You can keep track of resize events with `resize: (bound ,evt)` callback in your [`IPlayer`](#link) objects (See [`Space.add`](#link)). 
  * @param b a Bound object to resize to
  * @param evt Optionally pass a resize event
  */
  resize( b:Bound, evt?:Event):this {
    super.resize( b, evt );
    SVGSpace.setAttr( this.element, {
      "viewBox": `0 0 ${this.bound.width} ${this.bound.height}`,
      "width": `${this.bound.width}`,
      "height": `${this.bound.height}`,
      "xmlns": "http://www.w3.org/2000/svg",
      "version": "1.1"
    });
    return this;
  }
  

  /**
   * A static function to add a svg element inside a node. Usually you don't need to call this directly. See methods in [`SVGForm`](#link) instead.
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
      
      parent.appendChild( elem );
    }
    return elem as SVGElement;
  }
  
  
  
  /**
  * Remove an item from this Space.
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
   * Remove all items from this Space.
   */
  removeAll():this {
    this._container.innerHTML = "";
    return super.removeAll();
  }
  
}


/**
* **[Experimental]** SVGForm is an implementation of abstract class [`VisualForm`](#link). It provide methods to express Pts in [`SVGSpace`](#link).   
* You may extend SVGForm to implement your own expressions for SVGSpace. See out the [Space guide](../guide/Space-0500.html) for details.
*/
export class SVGForm extends VisualForm {
  
  protected _ctx:DOMFormContext = {
    group: null,
    groupID: "pts",
    groupCount: 0,
    currentID: "pts0",
    currentClass: "",
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
  
  static groupID:number = 0;
  static domID:number = 0;
  
  protected _space:SVGSpace;
  protected _ready:boolean = false;
  

  /**
  * Create a new SVGForm. You may also use [`SVGSpace.getForm`](#link) to get a default form directly.
  * @param space an instance of SVGSpace
  */
  constructor( space:SVGSpace ) {
    super();
    this._space = space;
    
    this._space.add( { start: () => {
      this._ctx.group = this._space.element;
      this._ctx.groupID = "pts_svg_"+(SVGForm.groupID++);
      this._ready = true;
    }} );
  }
  

  /**
  * Get the [`SVGSpace`](#link) instance that this form is associated with.
  */
  get space():SVGSpace { return this._space; }
  
  
  /**
   * Update a style in current context. It will throw an Erorr if the style doesn't exist.
   * @param k style key
   * @param v  style value
   */
  styleTo( k, v ) { 
    if (this._ctx.style[k] === undefined) throw new Error(`${k} style property doesn't exist`);
    this._ctx.style[k] = v; 
  }
  

  /**
    * Set current fill style. Provide a valid color string or `false` to specify no fill color.
    * @example `form.fill("#F90")`, `form.fill("rgba(0,0,0,.5")`, `form.fill(false)`
    * @param c a valid color string or `false` to specify no fill color.
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
    * @param c a valid color string or `false` to specify no stroke color.
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
  * Reset the context's common styles to this form's styles. This supports using multiple forms in the same space.
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
   * Set this form's group scope by an ID, and optionally define the group's parent element. A group scope keeps track of elements by their generated IDs, and updates their properties as needed. See also [`SVGForm.scope`](#link).
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
   * Set the current group scope to an item added into space, in order to keep track of any point, circle, etc created within it in the DOM. 
   * The item must have an `animateID` property, so that elements created within the item will have generated IDs like "item-{animateID}-{count}". 
   * See the svg section in [`Space guide`](../guide/Space-0500.html) to learn more about scope.
   * @param item a [`IPlayer`](#link) object that's added to space (see [`Space.add`](#link)) and has an `animateID` property
   * @returns this form's context
   */
  scope( item:IPlayer ) {
    if (!item || item.animateID == null ) throw new Error("item not defined or not yet added to Space");
    return this.updateScope( SVGForm.scopeID( item ), this.space.element );
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
   * @param ctx a context object for an SVGForm
   */
  static getID( ctx ):string {
    return ctx.currentID || `p-${SVGForm.domID++}`;
  }


  /**
   * A static function to generate an ID string for a scope, based on an [`IPlayer`](#link) object in the Space.
   * @param item a [`IPlayer`](#link) object that's added to space (see [`Space.add`](#link)) and has an `animateID` property
   */
  static scopeID( item:IPlayer ):string {
    return `item-${item.animateID}`;
  }
  

  /**
   * A static function to help adding style object to an element. 
   * Note that this put all styles into `style` attribute instead of individual svg attributes, so that the styles can be parsed by Adobe Illustrator.
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
    * A static function to draw a point.
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
    * Draws a point.
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
    * A static function to draw a circle.
    * @param ctx a context object of SVGForm
    * @param pt center position of the circle
    * @param radius radius of the circle
    */
  static circle( ctx:DOMFormContext, pt:PtLike, radius:number=10 ):SVGElement {
    let elem = SVGSpace.svgElement( ctx.group, "circle", SVGForm.getID(ctx) );
    
    DOMSpace.setAttr( elem, {
      cx: pt[0],
      cy: pt[1],
      r: radius,
      'class': `pts-svgform pts-circle ${ctx.currentClass}`,
    });
    
    SVGForm.style( elem, ctx.style );
    return elem;
  }
  

  /**
    * Draw a circle.
    * @param pts a Group of 2 Pts, or an array of two numeric arrays `[[position], [size]]`
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
    
    DOMSpace.setAttr( elem, { 
      d: d,
      'class': `pts-svgform pts-arc ${ctx.currentClass}`,
    } );
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
    * A static function to draw a square.
    * @param ctx a context object of SVGForm
    * @param pt center position of the square
    * @param halfsize half size of the square
    */
  static square( ctx:DOMFormContext, pt:PtLike, halfsize:number ) {
    let elem = SVGSpace.svgElement( ctx.group, "rect", SVGForm.getID( ctx ) );
    DOMSpace.setAttr( elem, {
      x: pt[0]-halfsize, 
      y:pt[1]-halfsize, 
      width: halfsize*2, 
      height: halfsize*2,
      'class': `pts-svgform pts-square ${ctx.currentClass}`,
    });
    SVGForm.style( elem, ctx.style );
    return elem;
  }
  

  /**
   * Draw a square, given a center and its half-size.
   * @param pt center Pt
   * @param halfsize half-size
   */
  square( pt:PtLike, halfsize:number ):this {
    this.nextID();
    SVGForm.square( this._ctx, pt, halfsize );
    return this;
  } 
  

  /**
  * A static function to draw a line or polyline.
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
      y2: pts[1][1],
      'class': `pts-svgform pts-line ${ctx.currentClass}`,
    });
    
    SVGForm.style( elem, ctx.style );
    return elem;
  }
  

  /**
  * Draw a line or polyline.
  * @param pts a Group of multiple Pts, or an array of multiple numeric arrays
  */
  line( pts:GroupLike|number[][] ):this {
    this.nextID();
    SVGForm.line( this._ctx, pts );
    return this;
  }
  
  
  /**
   * A static helper function to draw polyline or polygon.
   * @param ctx a context object of SVGForm
   * @param pts a Group of multiple Pts, or an array of multiple numeric arrays
   * @param closePath a boolean to specify if the polygon path should be closed
   */
  protected static _poly( ctx:DOMFormContext, pts:GroupLike|number[][], closePath:boolean=true) {
    if (!this._checkSize( pts)) return;
    
    let elem = SVGSpace.svgElement( ctx.group, ((closePath) ? "polygon" : "polyline"), SVGForm.getID(ctx) );
    let points:string = (pts as number[][]).reduce( (a, p) => a+`${p[0]},${p[1]} `, "");
    DOMSpace.setAttr( elem, {
      points: points,
      'class': `pts-svgform pts-polygon ${ctx.currentClass}`,
    });    
    SVGForm.style( elem, ctx.style );
    return elem;
  }
  
  
  /**
    * A static function to draw polygon.
    * @param ctx a context object of SVGForm
    * @param pts a Group of multiple Pts, or an array of multiple numeric arrays
    */
  static polygon( ctx:DOMFormContext, pts:GroupLike|number[][] ):SVGElement {
    return SVGForm._poly( ctx, pts, true );
  }
  

  /**
  * Draw a polygon.
  * @param pts a Group of multiple Pts, or an array of multiple numeric arrays
  */
  polygon( pts:GroupLike|number[][] ):this {
    this.nextID();
    SVGForm.polygon( this._ctx, pts );
    return this;
  }
  
  
  /**
  * A static function to draw a rectangle.
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
      height: size[1],
      'class': `pts-svgform pts-rect ${ctx.currentClass}`,
    });
    
    SVGForm.style( elem, ctx.style );
    return elem;
  }
  
  
  /**
    * Draw a rectangle.
    * @param pts usually a Group of 2 Pts specifying the top-left and bottom-right positions. Alternatively it can be an array of numeric arrays.
    */
  rect( pts:number[][]|Pt[] ):this {
    this.nextID();
    SVGForm.rect( this._ctx, pts );
    return this;
  }
  
  
  /**
    * A static function to draw text.
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
      dx: 0, dy: 0,
      'class': `pts-svgform pts-text ${ctx.currentClass}`,
    });
    
    elem.textContent = txt;
    
    SVGForm.style( elem, ctx.style );
    
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