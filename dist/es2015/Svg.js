/*! Source code licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */
import { VisualForm, Font } from "./Form";
import { Geom } from './Num';
import { Const } from './Util';
import { Pt, Group } from './Pt';
import { Rectangle } from "./Op";
import { DOMSpace } from "./Dom";
export class SVGSpace extends DOMSpace {
    constructor(elem, callback) {
        super(elem, callback);
        this.id = "svgspace";
        this._bgcolor = "#999";
        if (this._canvas.nodeName.toLowerCase() != "svg") {
            let s = SVGSpace.svgElement(this._canvas, "svg", `${this.id}_svg`);
            this._container = this._canvas;
            this._canvas = s;
        }
    }
    getForm() { return new SVGForm(this); }
    get element() {
        return this._canvas;
    }
    resize(b, evt) {
        super.resize(b, evt);
        SVGSpace.setAttr(this.element, {
            "viewBox": `0 0 ${this.bound.width} ${this.bound.height}`,
            "width": `${this.bound.width}`,
            "height": `${this.bound.height}`,
            "xmlns": "http://www.w3.org/2000/svg",
            "version": "1.1"
        });
        return this;
    }
    static svgElement(parent, name, id) {
        if (!parent || !parent.appendChild)
            throw new Error("parent is not a valid DOM element");
        let elem = document.querySelector(`#${id}`);
        if (!elem) {
            elem = document.createElementNS("http://www.w3.org/2000/svg", name);
            elem.setAttribute("id", id);
            parent.appendChild(elem);
        }
        return elem;
    }
    remove(player) {
        let temp = this._container.querySelectorAll("." + SVGForm.scopeID(player));
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
export class SVGForm extends VisualForm {
    constructor(space) {
        super();
        this._style = {
            "filled": true,
            "stroked": true,
            "fill": "#f03",
            "stroke": "#fff",
            "stroke-width": 1,
            "stroke-linejoin": "bevel",
            "stroke-linecap": "sqaure",
            "opacity": 1
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
                this._ctx.groupID = "pts_svg_" + (SVGForm.groupID++);
                this._ctx.style = Object.assign({}, this._style);
                this._ready = true;
            } });
    }
    get space() { return this._space; }
    styleTo(k, v) {
        if (this._ctx.style[k] === undefined)
            throw new Error(`${k} style property doesn't exist`);
        this._ctx.style[k] = v;
    }
    alpha(a) {
        this.styleTo("opacity", a);
        return this;
    }
    fill(c) {
        if (typeof c == "boolean") {
            this.styleTo("filled", c);
        }
        else {
            this.styleTo("filled", true);
            this.styleTo("fill", c);
        }
        return this;
    }
    stroke(c, width, linejoin, linecap) {
        if (typeof c == "boolean") {
            this.styleTo("stroked", c);
        }
        else {
            this.styleTo("stroked", true);
            this.styleTo("stroke", c);
            if (width)
                this.styleTo("stroke-width", width);
            if (linejoin)
                this.styleTo("stroke-linejoin", linejoin);
            if (linecap)
                this.styleTo("stroke-linecap", linecap);
        }
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
        return this.updateScope(SVGForm.scopeID(item), this.space.element);
    }
    nextID() {
        this._ctx.groupCount++;
        this._ctx.currentID = `${this._ctx.groupID}-${this._ctx.groupCount}`;
        return this._ctx.currentID;
    }
    static getID(ctx) {
        return ctx.currentID || `p-${SVGForm.domID++}`;
    }
    static scopeID(item) {
        return `item-${item.animateID}`;
    }
    static style(elem, styles) {
        let st = [];
        if (!styles["filled"])
            st.push("fill: none");
        if (!styles["stroked"])
            st.push("stroke: none");
        for (let k in styles) {
            if (styles.hasOwnProperty(k) && k != "filled" && k != "stroked") {
                let v = styles[k];
                if (v) {
                    if (!styles["filled"] && k.indexOf('fill') === 0) {
                        continue;
                    }
                    else if (!styles["stroked"] && k.indexOf('stroke') === 0) {
                        continue;
                    }
                    else {
                        st.push(`${k}: ${v}`);
                    }
                }
            }
        }
        return DOMSpace.setAttr(elem, { style: st.join(";") });
    }
    static point(ctx, pt, radius = 5, shape = "square") {
        if (shape === "circle") {
            return SVGForm.circle(ctx, pt, radius);
        }
        else {
            return SVGForm.square(ctx, pt, radius);
        }
    }
    point(pt, radius = 5, shape = "square") {
        this.nextID();
        SVGForm.point(this._ctx, pt, radius, shape);
        return this;
    }
    static circle(ctx, pt, radius = 10) {
        let elem = SVGSpace.svgElement(ctx.group, "circle", SVGForm.getID(ctx));
        DOMSpace.setAttr(elem, {
            cx: pt[0],
            cy: pt[1],
            r: radius,
            'class': `pts-svgform pts-circle ${ctx.currentClass}`,
        });
        SVGForm.style(elem, ctx.style);
        return elem;
    }
    circle(pts) {
        this.nextID();
        SVGForm.circle(this._ctx, pts[0], pts[1][0]);
        return this;
    }
    static arc(ctx, pt, radius, startAngle, endAngle, cc) {
        let elem = SVGSpace.svgElement(ctx.group, "path", SVGForm.getID(ctx));
        const start = new Pt(pt).toAngle(startAngle, radius, true);
        const end = new Pt(pt).toAngle(endAngle, radius, true);
        const diff = Geom.boundAngle(endAngle) - Geom.boundAngle(startAngle);
        let largeArc = (diff > Const.pi) ? true : false;
        if (cc)
            largeArc = !largeArc;
        const sweep = (cc) ? "0" : "1";
        const d = `M ${start[0]} ${start[1]} A ${radius} ${radius} 0 ${largeArc ? "1" : "0"} ${sweep} ${end[0]} ${end[1]}`;
        DOMSpace.setAttr(elem, {
            d: d,
            'class': `pts-svgform pts-arc ${ctx.currentClass}`,
        });
        SVGForm.style(elem, ctx.style);
        return elem;
    }
    arc(pt, radius, startAngle, endAngle, cc) {
        this.nextID();
        SVGForm.arc(this._ctx, pt, radius, startAngle, endAngle, cc);
        return this;
    }
    static square(ctx, pt, halfsize) {
        let elem = SVGSpace.svgElement(ctx.group, "rect", SVGForm.getID(ctx));
        DOMSpace.setAttr(elem, {
            x: pt[0] - halfsize,
            y: pt[1] - halfsize,
            width: halfsize * 2,
            height: halfsize * 2,
            'class': `pts-svgform pts-square ${ctx.currentClass}`,
        });
        SVGForm.style(elem, ctx.style);
        return elem;
    }
    square(pt, halfsize) {
        this.nextID();
        SVGForm.square(this._ctx, pt, halfsize);
        return this;
    }
    static line(ctx, pts) {
        if (!this._checkSize(pts))
            return;
        if (pts.length > 2)
            return SVGForm._poly(ctx, pts, false);
        let elem = SVGSpace.svgElement(ctx.group, "line", SVGForm.getID(ctx));
        DOMSpace.setAttr(elem, {
            x1: pts[0][0],
            y1: pts[0][1],
            x2: pts[1][0],
            y2: pts[1][1],
            'class': `pts-svgform pts-line ${ctx.currentClass}`,
        });
        SVGForm.style(elem, ctx.style);
        return elem;
    }
    line(pts) {
        this.nextID();
        SVGForm.line(this._ctx, pts);
        return this;
    }
    static _poly(ctx, pts, closePath = true) {
        if (!this._checkSize(pts))
            return;
        let elem = SVGSpace.svgElement(ctx.group, ((closePath) ? "polygon" : "polyline"), SVGForm.getID(ctx));
        let points = pts.reduce((a, p) => a + `${p[0]},${p[1]} `, "");
        DOMSpace.setAttr(elem, {
            points: points,
            'class': `pts-svgform pts-polygon ${ctx.currentClass}`,
        });
        SVGForm.style(elem, ctx.style);
        return elem;
    }
    static polygon(ctx, pts) {
        return SVGForm._poly(ctx, pts, true);
    }
    polygon(pts) {
        this.nextID();
        SVGForm.polygon(this._ctx, pts);
        return this;
    }
    static rect(ctx, pts) {
        if (!this._checkSize(pts))
            return;
        let elem = SVGSpace.svgElement(ctx.group, "rect", SVGForm.getID(ctx));
        let bound = Group.fromArray(pts).boundingBox();
        let size = Rectangle.size(bound);
        DOMSpace.setAttr(elem, {
            x: bound[0][0],
            y: bound[0][1],
            width: size[0],
            height: size[1],
            'class': `pts-svgform pts-rect ${ctx.currentClass}`,
        });
        SVGForm.style(elem, ctx.style);
        return elem;
    }
    rect(pts) {
        this.nextID();
        SVGForm.rect(this._ctx, pts);
        return this;
    }
    static text(ctx, pt, txt) {
        let elem = SVGSpace.svgElement(ctx.group, "text", SVGForm.getID(ctx));
        DOMSpace.setAttr(elem, {
            "pointer-events": "none",
            x: pt[0],
            y: pt[1],
            dx: 0, dy: 0,
            'class': `pts-svgform pts-text ${ctx.currentClass}`,
        });
        elem.textContent = txt;
        SVGForm.style(elem, ctx.style);
        return elem;
    }
    text(pt, txt) {
        this.nextID();
        SVGForm.text(this._ctx, pt, txt);
        return this;
    }
    log(txt) {
        this.fill("#000").stroke("#fff", 0.5).text([10, 14], txt);
        return this;
    }
}
SVGForm.groupID = 0;
SVGForm.domID = 0;
//# sourceMappingURL=Svg.js.map