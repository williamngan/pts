"use strict";
// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan)
Object.defineProperty(exports, "__esModule", { value: true });
const Util_1 = require("./Util");
/**
* Form is an abstract class that represents a form that's used in a Space for expressions.
*/
class Form {
    constructor() {
        this._ready = false;
    }
    /**
    * get whether the Form has received the Space's rendering context
    */
    get ready() { return this._ready; }
    /**
     * Check number of items in a Group against a required number
     * @param pts
     */
    static _checkSize(pts, required = 2) {
        if (pts.length < required) {
            Util_1.Util.warn("Requires 2 or more Pts in this Group.");
            return false;
        }
        return true;
    }
}
exports.Form = Form;
/**
* VisualForm is an abstract class that represents a form that can be used to express Pts visually.
* For example, CanvasForm is an implementation of VisualForm that draws on CanvasSpace which represents a html canvas.
*/
class VisualForm extends Form {
    constructor() {
        super(...arguments);
        this._filled = true;
        this._stroked = true;
        this._font = new Font(14, "sans-serif");
    }
    get filled() { return this._filled; }
    set filled(b) { this._filled = b; }
    get stroked() { return this._stroked; }
    set stroked(b) { this._stroked = b; }
    get currentFont() { return this._font; }
    _multiple(groups, shape, ...rest) {
        if (!groups)
            return this;
        for (let i = 0, len = groups.length; i < len; i++) {
            this[shape](groups[i], ...rest);
        }
        return this;
    }
    /**
    * Set fill color (not implemented)
    */
    fill(c) {
        return this;
    }
    /**
    * Set current fill style and without stroke.
    * @example `form.fillOnly("#F90")`, `form.fillOnly("rgba(0,0,0,.5")`
    * @param c fill color which can be as color, gradient, or pattern. (See [canvas documentation](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillStyle))
    */
    fillOnly(c) {
        this.stroke(false);
        return this.fill(c);
    }
    /**
    * Set stroke style (not implemented)
    */
    stroke(c, width, linejoin, linecap) {
        return this;
    }
    /**
    * Set current stroke style and without fill.
    * @example `form.strokeOnly("#F90")`, `form.strokeOnly("#000", 0.5, 'round', 'square')`
    * @param c stroke color which can be as color, gradient, or pattern. (See [canvas documentation](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/strokeStyle)
    */
    strokeOnly(c, width, linejoin, linecap) {
        this.fill(false);
        return this.stroke(c, width, linejoin, linecap);
    }
    /**
    * Draw multiple points at once
    * @param pts an array of Pt or an array of number arrays
    * @param radius radius of the point. Default is 5.
    * @param shape The shape of the point. Defaults to "square", but it can be "circle" or a custom shape function in your own implementation.
    */
    points(pts, radius, shape) {
        if (!pts)
            return;
        for (let i = 0, len = pts.length; i < len; i++) {
            this.point(pts[i], radius, shape);
        }
        return this;
    }
    /**
    * Draw multiple circles at once
    * @param groups an array of Groups that defines multiple circles
    */
    circles(groups) {
        return this._multiple(groups, "circle");
    }
    /**
    * Draw multiple squares at once
    * @param groups an array of Groups that defines multiple circles
    */
    squares(groups) {
        return this._multiple(groups, "square");
    }
    /**
    * Draw multiple lines at once
    * @param groups An array of Groups of Pts
    */
    lines(groups) {
        return this._multiple(groups, "line");
    }
    /**
    * Draw multiple polygons at once
    * @param groups An array of Groups of Pts
    */
    polygons(groups) {
        return this._multiple(groups, "polygon");
    }
    /**
    * Draw multiple rectangles at once
    * @param groups An array of Groups of Pts
    */
    rects(groups) {
        return this._multiple(groups, "rect");
    }
}
exports.VisualForm = VisualForm;
/**
* Font class lets you create a specific font style with properties for its size and style
*/
class Font {
    /**
    * Create a font style
    * @param size font size. Defaults is 12px.
    * @param face Optional font-family, use css-like string such as "Helvetica" or "Helvetica, sans-serif". Default is "sans-serif".
    * @param weight Optional font weight such as "bold". Default is "" (none).
    * @param style Optional font style such as "italic". Default is "" (none).
    * @param lineHeight Optional line height. Default is 1.5.
    * @example `new Font(12, "Frutiger, sans-serif", "bold", "underline", 1.5)`
    */
    constructor(size = 12, face = "sans-serif", weight = "", style = "", lineHeight = 1.5) {
        this.size = size;
        this.face = face;
        this.style = style;
        this.weight = weight;
        this.lineHeight = lineHeight;
    }
    /**
    * Get a string representing the font style, in css-like string such as "italic bold 12px/1.5 sans-serif"
    */
    get value() { return `${this.style} ${this.weight} ${this.size}px/${this.lineHeight} ${this.face}`; }
    /**
    * Get a string representing the font style, in css-like string such as "italic bold 12px/1.5 sans-serif"
    */
    toString() { return this.value; }
}
exports.Font = Font;
//# sourceMappingURL=Form.js.map