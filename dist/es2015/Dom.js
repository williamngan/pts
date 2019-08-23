/*! Source code licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */
import { MultiTouchSpace } from './Space';
import { VisualForm, Font } from "./Form";
import { Util } from './Util';
import { Pt, Bound } from './Pt';
export class DOMSpace extends MultiTouchSpace {
    constructor(elem, callback) {
        super();
        this.id = "domspace";
        this._autoResize = true;
        this._bgcolor = "#e1e9f0";
        this._css = {};
        var _selector = null;
        var _existed = false;
        this.id = "pts";
        if (elem instanceof Element) {
            _selector = elem;
            this.id = "pts_existing_space";
        }
        else {
            _selector = document.querySelector(elem);
            _existed = true;
            this.id = elem.substr(1);
        }
        if (!_selector) {
            this._container = DOMSpace.createElement("div", "pts_container");
            this._canvas = DOMSpace.createElement("div", "pts_element");
            this._container.appendChild(this._canvas);
            document.body.appendChild(this._container);
            _existed = false;
        }
        else {
            this._canvas = _selector;
            this._container = _selector.parentElement;
        }
        setTimeout(this._ready.bind(this, callback), 50);
    }
    static createElement(elem = "div", id, appendTo) {
        let d = document.createElement(elem);
        if (id)
            d.setAttribute("id", id);
        if (appendTo && appendTo.appendChild)
            appendTo.appendChild(d);
        return d;
    }
    _ready(callback) {
        if (!this._container)
            throw new Error(`Cannot initiate #${this.id} element`);
        this._isReady = true;
        this._resizeHandler(null);
        this.clear(this._bgcolor);
        this._canvas.dispatchEvent(new Event("ready"));
        for (let k in this.players) {
            if (this.players.hasOwnProperty(k)) {
                if (this.players[k].start)
                    this.players[k].start(this.bound.clone(), this);
            }
        }
        this._pointer = this.center;
        this.refresh(false);
        if (callback)
            callback(this.bound, this._canvas);
    }
    setup(opt) {
        if (opt.bgcolor) {
            this._bgcolor = opt.bgcolor;
        }
        this.autoResize = (opt.resize != undefined) ? opt.resize : false;
        return this;
    }
    getForm() {
        return null;
    }
    set autoResize(auto) {
        this._autoResize = auto;
        if (auto) {
            window.addEventListener('resize', this._resizeHandler.bind(this));
        }
        else {
            delete this._css['width'];
            delete this._css['height'];
            window.removeEventListener('resize', this._resizeHandler.bind(this));
        }
    }
    get autoResize() { return this._autoResize; }
    resize(b, evt) {
        this.bound = b;
        this.styles({ width: `${b.width}px`, height: `${b.height}px` }, true);
        for (let k in this.players) {
            if (this.players.hasOwnProperty(k)) {
                let p = this.players[k];
                if (p.resize)
                    p.resize(this.bound, evt);
            }
        }
        return this;
    }
    _resizeHandler(evt) {
        let b = Bound.fromBoundingRect(this._container.getBoundingClientRect());
        if (this._autoResize) {
            this.styles({ width: "100%", height: "100%" }, true);
        }
        else {
            this.styles({ width: `${b.width}px`, height: `${b.height}px` }, true);
        }
        this.resize(b, evt);
    }
    get element() {
        return this._canvas;
    }
    get parent() {
        return this._container;
    }
    get ready() { return this._isReady; }
    clear(bg) {
        if (bg)
            this.background = bg;
        this._canvas.innerHTML = "";
        return this;
    }
    set background(bg) {
        this._bgcolor = bg;
        this._container.style.backgroundColor = this._bgcolor;
    }
    get background() { return this._bgcolor; }
    style(key, val, update = false) {
        this._css[key] = val;
        if (update)
            this._canvas.style[key] = val;
        return this;
    }
    styles(styles, update = false) {
        for (let k in styles) {
            if (styles.hasOwnProperty(k))
                this.style(k, styles[k], update);
        }
        return this;
    }
    static setAttr(elem, data) {
        for (let k in data) {
            if (data.hasOwnProperty(k)) {
                elem.setAttribute(k, data[k]);
            }
        }
        return elem;
    }
    static getInlineStyles(data) {
        let str = "";
        for (let k in data) {
            if (data.hasOwnProperty(k)) {
                if (data[k])
                    str += `${k}: ${data[k]}; `;
            }
        }
        return str;
    }
}
export class HTMLSpace extends DOMSpace {
    getForm() {
        return new HTMLForm(this);
    }
    static htmlElement(parent, name, id, autoClass = true) {
        if (!parent || !parent.appendChild)
            throw new Error("parent is not a valid DOM element");
        let elem = document.querySelector(`#${id}`);
        if (!elem) {
            elem = document.createElement(name);
            elem.setAttribute("id", id);
            if (autoClass)
                elem.setAttribute("class", id.substring(0, id.indexOf("-")));
            parent.appendChild(elem);
        }
        return elem;
    }
    remove(player) {
        let temp = this._container.querySelectorAll("." + HTMLForm.scopeID(player));
        temp.forEach((el) => {
            el.parentNode.removeChild(el);
        });
        return super.remove(player);
    }
    removeAll() {
        this._container.innerHTML = "";
        return super.removeAll();
    }
}
export class HTMLForm extends VisualForm {
    constructor(space) {
        super();
        this._style = {
            "filled": true,
            "stroked": true,
            "background": "#f03",
            "border-color": "#fff",
            "color": "#000",
            "border-width": "1px",
            "border-radius": "0",
            "border-style": "solid",
            "opacity": 1,
            "position": "absolute",
            "top": 0,
            "left": 0,
            "width": 0,
            "height": 0
        };
        this._ctx = {
            group: null,
            groupID: "pts",
            groupCount: 0,
            currentID: "pts0",
            currentClass: "",
            style: {},
        };
        this._ready = false;
        this._space = space;
        this._space.add({ start: () => {
                this._ctx.group = this._space.element;
                this._ctx.groupID = "pts_dom_" + (HTMLForm.groupID++);
                this._ctx.style = Object.assign({}, this._style);
                this._ready = true;
            } });
    }
    get space() { return this._space; }
    styleTo(k, v, unit = '') {
        if (this._ctx.style[k] === undefined)
            throw new Error(`${k} style property doesn't exist`);
        this._ctx.style[k] = `${v}${unit}`;
    }
    alpha(a) {
        this.styleTo("opacity", a);
        return this;
    }
    fill(c) {
        if (typeof c == "boolean") {
            this.styleTo("filled", c);
            if (!c)
                this.styleTo("background", "transparent");
        }
        else {
            this.styleTo("filled", true);
            this.styleTo("background", c);
        }
        return this;
    }
    stroke(c, width, linejoin, linecap) {
        if (typeof c == "boolean") {
            this.styleTo("stroked", c);
            if (!c)
                this.styleTo("border-width", 0);
        }
        else {
            this.styleTo("stroked", true);
            this.styleTo("border-color", c);
            this.styleTo("border-width", (width || 1) + "px");
        }
        return this;
    }
    fillText(c) {
        this.styleTo("color", c);
        return this;
    }
    cls(c) {
        if (typeof c == "boolean") {
            this._ctx.currentClass = "";
        }
        else {
            this._ctx.currentClass = c;
        }
        return this;
    }
    font(sizeOrFont, weight, style, lineHeight, family) {
        if (typeof sizeOrFont == "number") {
            this._font.size = sizeOrFont;
            if (family)
                this._font.face = family;
            if (weight)
                this._font.weight = weight;
            if (style)
                this._font.style = style;
            if (lineHeight)
                this._font.lineHeight = lineHeight;
        }
        else {
            this._font = sizeOrFont;
        }
        this._ctx.style['font'] = this._font.value;
        return this;
    }
    reset() {
        this._ctx.style = Object.assign({}, this._style);
        this._font = new Font(10, "sans-serif");
        this._ctx.style['font'] = this._font.value;
        return this;
    }
    updateScope(group_id, group) {
        this._ctx.group = group;
        this._ctx.groupID = group_id;
        this._ctx.groupCount = 0;
        this.nextID();
        return this._ctx;
    }
    scope(item) {
        if (!item || item.animateID == null)
            throw new Error("item not defined or not yet added to Space");
        return this.updateScope(HTMLForm.scopeID(item), this.space.element);
    }
    nextID() {
        this._ctx.groupCount++;
        this._ctx.currentID = `${this._ctx.groupID}-${this._ctx.groupCount}`;
        return this._ctx.currentID;
    }
    static getID(ctx) {
        return ctx.currentID || `p-${HTMLForm.domID++}`;
    }
    static scopeID(item) {
        return `item-${item.animateID}`;
    }
    static style(elem, styles) {
        let st = [];
        if (!styles["filled"])
            st.push("background: none");
        if (!styles["stroked"])
            st.push("border: none");
        for (let k in styles) {
            if (styles.hasOwnProperty(k) && k != "filled" && k != "stroked") {
                let v = styles[k];
                if (v) {
                    if (!styles["filled"] && k.indexOf('background') === 0) {
                        continue;
                    }
                    else if (!styles["stroked"] && k.indexOf('border-width') === 0) {
                        continue;
                    }
                    else {
                        st.push(`${k}: ${v}`);
                    }
                }
            }
        }
        return HTMLSpace.setAttr(elem, { style: st.join(";") });
    }
    static rectStyle(ctx, pt, size) {
        ctx.style["left"] = pt[0] + "px";
        ctx.style["top"] = pt[1] + "px";
        ctx.style["width"] = size[0] + "px";
        ctx.style["height"] = size[1] + "px";
        return ctx;
    }
    static textStyle(ctx, pt) {
        ctx.style["left"] = pt[0] + "px";
        ctx.style["top"] = pt[1] + "px";
        return ctx;
    }
    static point(ctx, pt, radius = 5, shape = "square") {
        if (shape === "circle") {
            return HTMLForm.circle(ctx, pt, radius);
        }
        else {
            return HTMLForm.square(ctx, pt, radius);
        }
    }
    point(pt, radius = 5, shape = "square") {
        this.nextID();
        if (shape == "circle")
            this.styleTo("border-radius", "100%");
        HTMLForm.point(this._ctx, pt, radius, shape);
        return this;
    }
    static circle(ctx, pt, radius = 10) {
        let elem = HTMLSpace.htmlElement(ctx.group, "div", HTMLForm.getID(ctx));
        HTMLSpace.setAttr(elem, { class: `pts-form pts-circle ${ctx.currentClass}` });
        HTMLForm.rectStyle(ctx, new Pt(pt).$subtract(radius), new Pt(radius * 2, radius * 2));
        HTMLForm.style(elem, ctx.style);
        return elem;
    }
    circle(pts) {
        this.nextID();
        this.styleTo("border-radius", "100%");
        HTMLForm.circle(this._ctx, pts[0], pts[1][0]);
        return this;
    }
    static square(ctx, pt, halfsize) {
        let elem = HTMLSpace.htmlElement(ctx.group, "div", HTMLForm.getID(ctx));
        HTMLSpace.setAttr(elem, { class: `pts-form pts-square ${ctx.currentClass}` });
        HTMLForm.rectStyle(ctx, new Pt(pt).$subtract(halfsize), new Pt(halfsize * 2, halfsize * 2));
        HTMLForm.style(elem, ctx.style);
        return elem;
    }
    square(pt, halfsize) {
        this.nextID();
        HTMLForm.square(this._ctx, pt, halfsize);
        return this;
    }
    static rect(ctx, pts) {
        if (!this._checkSize(pts))
            return;
        let elem = HTMLSpace.htmlElement(ctx.group, "div", HTMLForm.getID(ctx));
        HTMLSpace.setAttr(elem, { class: `pts-form pts-rect ${ctx.currentClass}` });
        HTMLForm.rectStyle(ctx, pts[0], pts[1]);
        HTMLForm.style(elem, ctx.style);
        return elem;
    }
    rect(pts) {
        this.nextID();
        this.styleTo("border-radius", "0");
        HTMLForm.rect(this._ctx, pts);
        return this;
    }
    static text(ctx, pt, txt) {
        let elem = HTMLSpace.htmlElement(ctx.group, "div", HTMLForm.getID(ctx));
        HTMLSpace.setAttr(elem, { class: `pts-form pts-text ${ctx.currentClass}` });
        elem.textContent = txt;
        HTMLForm.textStyle(ctx, pt);
        HTMLForm.style(elem, ctx.style);
        return elem;
    }
    text(pt, txt) {
        this.nextID();
        HTMLForm.text(this._ctx, pt, txt);
        return this;
    }
    log(txt) {
        this.fill("#000").stroke("#fff", 0.5).text([10, 14], txt);
        return this;
    }
    arc(pt, radius, startAngle, endAngle, cc) {
        Util.warn("arc is not implemented in HTMLForm");
        return this;
    }
    line(pts) {
        Util.warn("line is not implemented in HTMLForm");
        return this;
    }
    polygon(pts) {
        Util.warn("polygon is not implemented in HTMLForm");
        return this;
    }
}
HTMLForm.groupID = 0;
HTMLForm.domID = 0;
//# sourceMappingURL=Dom.js.map