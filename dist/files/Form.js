"use strict";
// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan)
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Form is an abstract class that represents a form that's used in a Space for expressions.
 */
class Form {
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
        this._font = new Font();
    }
    get filled() { return this._filled; }
    set filled(b) { this._filled = b; }
    get stroked() { return this._stroked; }
    set stroked(b) { this._stroked = b; }
    get currentFont() { return this._font; }
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