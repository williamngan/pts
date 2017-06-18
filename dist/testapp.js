var Pts =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 10);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const Util_1 = __webpack_require__(2);
const Op_1 = __webpack_require__(6);
const LinearAlgebra_1 = __webpack_require__(5);
let PtBaseArray = Float64Array;
class Pt extends PtBaseArray {
    /**
     * Create a Pt. If no parameter is provided, this will instantiate a Pt with 2 dimensions [0, 0].
     * Example: `new Pt()`, `new Pt(1,2,3,4,5)`, `new Pt([1,2])`, `new Pt({x:0, y:1})`, `new Pt(pt)`
     * @param args a list of numbers, an array of number, or an object with {x,y,z,w} properties
     */
    constructor(...args) {
        super(args.length > 0 ? Util_1.Util.getArgs(args) : [0, 0]);
    }
    static make(dimensions, defaultValue) {
        let p = new PtBaseArray(dimensions);
        if (defaultValue) p.fill(defaultValue);
        return new Pt(p);
    }
    get x() {
        return this[0];
    }
    get y() {
        return this[1];
    }
    get z() {
        return this[2];
    }
    get w() {
        return this[3];
    }
    set x(n) {
        this[0] = n;
    }
    set y(n) {
        this[1] = n;
    }
    set z(n) {
        this[2] = n;
    }
    set w(n) {
        this[3] = n;
    }
    clone() {
        return new Pt(this);
    }
    equals(p, threshold = 0) {
        for (let i = 0, len = this.length; i < len; i++) {
            if (Math.abs(this[i] - p[i]) > threshold) return false;
        }
        return true;
    }
    /**
     * Update the values of this Pt
     * @param args a list of numbers, an array of number, or an object with {x,y,z,w} properties
     */
    to(...args) {
        let p = Util_1.Util.getArgs(args);
        for (let i = 0, len = Math.min(this.length, p.length); i < len; i++) {
            this[i] = p[i];
        }
        return this;
    }
    /**
     * Update the values of this Pt to point at a specific angle
     * @param radian target angle in radian
     * @param magnitude Optional magnitude if known. If not provided, it'll calculate and use this Pt's magnitude.
     */
    toAngle(radian, magnitude) {
        let m = magnitude != undefined ? magnitude : this.magnitude();
        return this.to(Math.cos(radian) * m, Math.sin(radian) * m);
    }
    /**
     * Apply a series of functions to transform this Pt. The function should have this form: (p:Pt) => Pt
     * @param fns a list of function as array or object {key: function}
     */
    op(fns) {
        let results = [];
        for (var k in fns) {
            results[k] = fns[k](this);
        }
        return results;
    }
    $map(fn) {
        let m = this.clone();
        LinearAlgebra_1.LinearAlgebra.map(m, fn);
        return m;
    }
    /**
     * Take specific dimensional values from this Pt and create a new Pt
     * @param axis a string such as "xy" (use Const.xy) or an array to specify index for two dimensions
     */
    $take(axis) {
        let p = [];
        for (let i = 0, len = axis.length; i < len; i++) {
            p.push(this[axis[i]] || 0);
        }
        return new Pt(p);
    }
    /**
     * Get a new Pt based on a slice of this Pt. Similar to `Array.slice()`.
     * @param start start index
     * @param end end index (ie, entry will not include value at this index)
     */
    $slice(start, end) {
        // seems like new Pt(...).slice will return an error, must use Float64Array
        let m = new PtBaseArray(this).slice(start, end);
        return new Pt(m);
    }
    $concat(...args) {
        return new Pt(this.toArray().concat(Util_1.Util.getArgs(args)));
    }
    add(...args) {
        args.length === 1 && typeof args[0] == "number" ? LinearAlgebra_1.LinearAlgebra.add(this, args[0]) : LinearAlgebra_1.LinearAlgebra.add(this, Util_1.Util.getArgs(args));
        return this;
    }
    $add(...args) {
        return this.clone().add(...args);
    }

    subtract(...args) {
        args.length === 1 && typeof args[0] == "number" ? LinearAlgebra_1.LinearAlgebra.subtract(this, args[0]) : LinearAlgebra_1.LinearAlgebra.subtract(this, Util_1.Util.getArgs(args));
        return this;
    }
    $subtract(...args) {
        return this.clone().subtract(...args);
    }

    multiply(...args) {
        args.length === 1 && typeof args[0] == "number" ? LinearAlgebra_1.LinearAlgebra.multiply(this, args[0]) : LinearAlgebra_1.LinearAlgebra.multiply(this, Util_1.Util.getArgs(args));
        return this;
    }
    $multiply(...args) {
        return this.clone().multiply(...args);
    }

    divide(...args) {
        args.length === 1 && typeof args[0] == "number" ? LinearAlgebra_1.LinearAlgebra.divide(this, args[0]) : LinearAlgebra_1.LinearAlgebra.divide(this, Util_1.Util.getArgs(args));
        return this;
    }
    $divide(...args) {
        return this.clone().divide(...args);
    }

    scale(...args) {
        return this.multiply(...args);
    }
    $scale(...args) {
        return this.clone().scale(...args);
    }

    magnitudeSq() {
        return LinearAlgebra_1.LinearAlgebra.dot(this, this);
    }
    magnitude() {
        return LinearAlgebra_1.LinearAlgebra.magnitude(this);
    }
    /**
     * Convert to a unit vector
     * @param magnitude Optional: if the magnitude is known, pass it as a parameter to avoid duplicate calculation.
     */
    unit(magnitude = undefined) {
        LinearAlgebra_1.LinearAlgebra.unit(this, magnitude);
        return this;
    }
    /**
     * Get a unit vector from this Pt
     */
    $unit(magnitude = undefined) {
        return this.clone().unit(magnitude);
    }
    dot(...args) {
        return LinearAlgebra_1.LinearAlgebra.dot(this, Util_1.Util.getArgs(args));
    }
    $cross(...args) {
        let p = Util_1.Util.getArgs(args);
        return new Pt(this[1] * p[2] - this[2] * p[1], this[2] * p[0] - this[0] * p[2], this[0] * p[1] - this[1] * p[0]);
    }
    $project(p) {
        let m = p.magnitude();
        let a = this.$unit();
        let b = p.$divide(m);
        let dot = a.dot(b);
        return a.multiply(m * dot);
    }
    /**
     * Absolute values for all values in this pt
     */
    abs() {
        LinearAlgebra_1.LinearAlgebra.abs(this);
        return this;
    }
    /**
     * Get a new Pt with absolute values of this Pt
     */
    $abs() {
        return this.clone().abs();
    }
    $min(p) {
        let m = this.clone();
        for (let i = 0, len = Math.min(this.length, p.length); i < len; i++) {
            m[i] = Math.min(this[i], p[i]);
        }
        return m;
    }
    $max(p) {
        let m = this.clone();
        for (let i = 0, len = Math.min(this.length, p.length); i < len; i++) {
            m[i] = Math.max(this[i], p[i]);
        }
        return m;
    }
    /**
     * Get angle of this vector from origin
     * @param axis a string such as "xy" (use Const.xy) or an array to specify index for two dimensions
     */
    angle(axis = Util_1.Const.xy) {
        return Math.atan2(this[axis[1]], this[axis[0]]);
    }
    /**
     * Get the angle between this and another Pt
     * @param p the other Pt
     * @param axis a string such as "xy" (use Const.xy) or an array to specify index for two dimensions
     */
    angleBetween(p, axis = Util_1.Const.xy) {
        console.log(Op_1.Geom.boundRadian(this.angle(axis)) - Op_1.Geom.boundRadian(p.angle(axis)));
        return Op_1.Geom.boundRadian(this.angle(axis)) - Op_1.Geom.boundRadian(p.angle(axis));
    }
    /**
     * Check if another Pt is perpendicular to this Pt
     * @param p another Pt
     */
    isPerpendicular(p) {
        return this.dot(p) == 0;
    }
    toString() {
        return `Pt(${this.join(", ")})`;
    }
    toArray() {
        return [].slice.call(this);
    }
    /**
     * Zip one slice of an array of Pt
     * @param pts an array of Pt
     * @param idx index to zip at
     * @param defaultValue a default value to fill if index out of bound. If not provided, it will throw an error instead.
     */
    static zipOne(pts, index, defaultValue = false) {
        let f = typeof defaultValue == "boolean" ? "get" : "at"; // choose `get` or `at` function
        let z = [];
        for (let i = 0, len = pts.length; i < len; i++) {
            if (pts[i].length - 1 < index && defaultValue === false) throw `Index ${index} is out of bounds`;
            z.push(pts[i][index] || defaultValue);
        }
        return new Pt(z);
    }
    /**
     * Zip an array of Pt. eg, [[1,2],[3,4],[5,6]] => [[1,3,5],[2,4,6]]
     * @param pts an array of Pt
     * @param defaultValue a default value to fill if index out of bound. If not provided, it will throw an error instead.
     * @param useLongest If true, find the longest list of values in a Pt and use its length for zipping. Default is false, which uses the first item's length for zipping.
     */
    static zip(pts, defaultValue = false, useLongest = false) {
        let ps = [];
        let len = useLongest ? pts.reduce((a, b) => Math.max(a, b.length), 0) : pts[0].length;
        for (let i = 0; i < len; i++) {
            ps.push(Pt.zipOne(pts, i, defaultValue));
        }
        return ps;
    }
    static sum(pts) {
        let c = Pt.make(pts[0].length, 0);
        for (let i = 0, len = pts.length; i < len; i++) {
            c.add(pts[i]);
        }
        return c;
    }
    static average(pts) {
        return Pt.sum(pts).divide(pts.length);
    }
}
exports.Pt = Pt;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const Pt_1 = __webpack_require__(0);
class Bound {
    constructor(p1, p2) {
        this._center = new Pt_1.Pt();
        this._size = new Pt_1.Pt();
        this._topLeft = new Pt_1.Pt();
        this._bottomRight = new Pt_1.Pt();
        if (!p2) {
            this._size = new Pt_1.Pt(p1);
        } else if (p1) {
            this._topLeft = new Pt_1.Pt(p1);
            this._bottomRight = new Pt_1.Pt(p2);
            this._updateSize();
        }
    }
    clone() {
        return new Bound(this._topLeft, this._bottomRight);
    }
    _updateSize() {
        this._size = this._bottomRight.$subtract(this._topLeft).abs();
        this._updateCenter();
    }
    _updateCenter() {
        this._center = this._size.$scale(0.5).add(this._topLeft);
    }
    _updatePosFromTop() {
        this._bottomRight = this._topLeft.$add(this._size);
        this._updateCenter();
    }
    _updatePosFromBottom() {
        this._topLeft = this._bottomRight.$subtract(this._size);
        this._updateCenter();
    }
    _updatePosFromCenter() {
        let half = this._size.$scale(0.5);
        this._topLeft = this._center.$subtract(half);
        this._bottomRight = this._center.$add(half);
    }
    get size() {
        return new Pt_1.Pt(this._size);
    }
    set size(p) {
        this._size = new Pt_1.Pt(p);
        this._updatePosFromTop();
    }
    get center() {
        return new Pt_1.Pt(this._center);
    }
    set center(p) {
        this._center = new Pt_1.Pt(p);
        this._updatePosFromCenter();
    }
    get topLeft() {
        return new Pt_1.Pt(this._topLeft);
    }
    set topLeft(p) {
        this._topLeft = new Pt_1.Pt(p);
        this._updateSize();
    }
    get bottomRight() {
        return new Pt_1.Pt(this._bottomRight);
    }
    set bottomRight(p) {
        this._bottomRight = new Pt_1.Pt(p);
        this._updateSize();
    }
    get width() {
        return this._size.x;
    }
    set width(w) {
        this._size.x = w;
        this._updatePosFromTop();
    }
    get height() {
        return this._size.length > 1 ? this._size.y : 0;
    }
    set height(h) {
        this._size.y = h;
        this._updatePosFromTop();
    }
    get depth() {
        return this._size.length > 2 ? this._size.z : 0;
    }
    set depth(d) {
        this._size.z = d;
        this._updatePosFromTop();
    }
    get x() {
        return this.topLeft.x;
    }
    get y() {
        return this.topLeft.y;
    }
    get z() {
        return this.topLeft.z;
    }
    static fromBoundingRect(rect) {
        let b = new Bound(new Pt_1.Pt(rect.left || 0, rect.top || 0), new Pt_1.Pt(rect.right || 0, rect.bottom || 0));
        if (rect.width && rect.height) b.size = new Pt_1.Pt(rect.width, rect.height);
        return b;
    }
}
exports.Bound = Bound;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
exports.Const = {
    xy: "xy",
    yz: "yz",
    xz: "xz",
    xyz: "xyz",
    /* represents identical point or value */
    identical: 0,
    /* represents right position or direction */
    right: 4,
    /* represents bottom right position or direction */
    bottom_right: 5,
    /* represents bottom position or direction */
    bottom: 6,
    /* represents bottom left position or direction */
    bottom_left: 7,
    /* represents left position or direction */
    left: 8,
    /* represents top left position or direction */
    top_left: 1,
    /* represents top position or direction */
    top: 2,
    /* represents top right position or direction */
    top_right: 3,
    /* represents an arbitrary very small number. It is set as 0.0001 here. */
    epsilon: 0.0001,
    /* pi radian (180 deg) */
    pi: Math.PI,
    /* two pi radian (360deg) */
    two_pi: 6.283185307179586,
    /* half pi radian (90deg) */
    half_pi: 1.5707963267948966,
    /* pi/4 radian (45deg) */
    quarter_pi: 0.7853981633974483,
    /* pi/180: 1 degree in radian */
    one_degree: 0.017453292519943295,
    /* multiply this constant with a radian to get a degree */
    rad_to_deg: 57.29577951308232,
    /* multiply this constant with a degree to get a radian */
    deg_to_rad: 0.017453292519943295,
    /* Gravity acceleration (unit: m/s^2) and gravity force (unit: Newton) on 1kg of mass. */
    gravity: 9.81,
    /* 1 Newton: 0.10197 Kilogram-force */
    newton: 0.10197,
    /* Gaussian constant (1 / Math.sqrt(2 * Math.PI)) */
    gaussian: 0.3989422804014327
};
class Util {
    /**
     * Convert different kinds of parameters (arguments, array, object) into an array of numbers
     * @param args a list of numbers, an array of number, or an object with {x,y,z,w} properties
     */
    static getArgs(args) {
        if (args.length < 1) return [];
        var pos = [];
        var isArray = Array.isArray(args[0]) || ArrayBuffer.isView(args[0]);
        // positional arguments: x,y,z,w,...
        if (typeof args[0] === 'number') {
            pos = Array.prototype.slice.call(args);
            // as an object of {x, y?, z?, w?}
        } else if (typeof args[0] === 'object' && !isArray) {
            let a = ["x", "y", "z", "w"];
            let p = args[0];
            for (let i = 0; i < a.length; i++) {
                if (p.length && i >= p.length || !(a[i] in p)) break; // check for length and key exist
                pos.push(p[a[i]]);
            }
            // as an array of values
        } else if (isArray) {
            pos = [].slice.call(args[0]);
        }
        return pos;
    }
    /**
     * Split an array into chunks of sub-array
     * @param pts an array
     * @param size chunk size, ie, number of items in a chunk
     */
    static split(pts, size) {
        let count = Math.ceil(pts.length / size);
        let chunks = [];
        for (let i = 0; i < count; i++) {
            chunks.push(pts.slice(i * size, i * size + size));
        }
        return chunks;
    }
}
exports.Util = Util;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const Form_1 = __webpack_require__(4);
const Util_1 = __webpack_require__(2);
class CanvasForm extends Form_1.Form {
    constructor(space) {
        super();
        // store common styles so that they can be restored to canvas context when using multiple forms. See `reset()`.
        this._style = { fillStyle: "#e51c23", strokeStyle: "#fff", lineWidth: 1, lineJoin: "miter", lineCap: "butt" };
        this._space = space;
        this._ctx = this._space.ctx;
        this._ctx.fillStyle = this._style.fillStyle;
        this._ctx.strokeStyle = this._style.strokeStyle;
    }
    get space() {
        return this._space;
    }
    /**
     * Set current fill style. For example: `form.fill("#F90")` `form.fill("rgba(0,0,0,.5")` `form.fill(false)`
     * @param c fill color which can be as color, gradient, or pattern. (See [canvas documentation](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillStyle))
     * @return this
     */
    fill(c) {
        if (typeof c == "boolean") {
            this.filled = c;
        } else {
            this.filled = true;
            this._style.fillStyle = c;
            this._ctx.fillStyle = c;
        }
        return this;
    }
    /**
     * Set current stroke style. For example: `form.stroke("#F90")` `form.stroke("rgba(0,0,0,.5")` `form.stroke(false)` `form.stroke("#000", 0.5, 'round')`
     * @param c stroke color which can be as color, gradient, or pattern. (See [canvas documentation](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/strokeStyle))
     * @param width Optional value (can be floating point) to set line width
     * @param linejoin Optional string to set line joint style. Can be "miter", "bevel", or "round".
     * @param linecap Optional string to set line cap style. Can be "butt", "round", or "square".
     * @return this
     */
    stroke(c, width, linejoin, linecap) {
        if (typeof c == "boolean") {
            this.stroked = c;
        } else {
            this.stroked = true;
            this._style.strokeStyle = c;
            this._ctx.strokeStyle = c;
            if (width) {
                this._ctx.lineWidth = width;
                this._style.lineWidth = width;
            }
            if (linejoin) {
                this._ctx.lineJoin = linejoin;
                this._style.lineJoin = linejoin;
            }
            if (linecap) {
                this._ctx.lineCap = linecap;
                this._style.lineCap = linecap;
            }
        }
        return this;
    }
    /**
     * Reset the rendering context's common styles to this form's styles. This supports using multiple forms on the same canvas context.
     */
    reset() {
        for (let k in this._style) {
            this._ctx[k] = this._style[k];
        }
        return this;
    }
    _paint() {
        if (this._filled) this._ctx.fill();
        if (this._stroked) this._ctx.stroke();
    }
    point(p, radius = 5, shape = "square") {
        if (CanvasForm[shape]) {
            CanvasForm[shape](this._ctx, p, radius);
            this._paint();
        } else {
            console.warn(`${shape} is not a static function of CanvasForm`);
        }
        return this;
    }
    static circle(ctx, pt, radius) {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, radius, 0, Util_1.Const.two_pi, false);
        ctx.closePath();
    }
    circle(pts, radius) {
        CanvasForm.circle(this._ctx, pts, radius);
        return this;
    }
    static arc(ctx, pt, radius, startAngle, endAngle, cc) {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, radius, startAngle, endAngle, cc);
    }
    arc(pt, radius, startAngle, endAngle, cc) {
        CanvasForm.arc(this._ctx, pt, radius, startAngle, endAngle, cc);
        this._paint();
        return this;
    }
    static square(ctx, pt, halfsize) {
        let x1 = pt.x - halfsize;
        let y1 = pt.y - halfsize;
        let x2 = pt.x + halfsize;
        let y2 = pt.y + halfsize;
        // faster than using `rect`
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1, y2);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x2, y1);
        ctx.closePath();
    }
    line(pts) {
        CanvasForm.line(this._ctx, pts);
        this._ctx.stroke();
        return this;
    }
    static line(ctx, pts) {
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1, len = pts.length; i < len; i++) {
            ctx.lineTo(pts[i][0], pts[i][1]);
        }
    }
    static rect(ctx, pts) {
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        ctx.lineTo(pts[0][0], pts[1][1]);
        ctx.lineTo(pts[1][0], pts[1][1]);
        ctx.lineTo(pts[1][0], pts[0][1]);
        ctx.closePath();
    }
    rect(pts) {
        CanvasForm.rect(this._ctx, pts);
        this._paint();
        return this;
    }
    /**
     * A static function to draw text
     * @param `ctx` canvas rendering context
     * @param `pt` a Point object to specify the anchor point
     * @param `txt` a string of text to draw
     * @param `maxWidth` specify a maximum width per line
     */
    static text(ctx, pt, txt, maxWidth) {
        ctx.fillText(txt, pt[0], pt[1], maxWidth);
    }
    text(pt, txt, maxWidth) {
        CanvasForm.text(this._ctx, pt, txt, maxWidth);
        return this;
    }
    log(txt) {
        this._ctx.font = "12px sans-serif";
        let w = this._ctx.measureText(txt).width + 20;
        this.stroke(false).fill("rgba(0,0,0,.4)").rect([[0, 0], [w, 20]]);
        this.fill("#fff").text([10, 14], txt);
        return this;
    }
    draw(ps, shape) {
        return this;
    }
}
exports.CanvasForm = CanvasForm;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
class Font {
    constructor(size = 11, face = "sans-serif", style = "") {
        this.size = size;
        this.face = face;
        this.style = style;
    }
    get data() {
        return `${this.style} ${this.size}px ${this.face}`;
    }
}
exports.Font = Font;
class Form {
    constructor() {
        this._filled = true;
        this._stroked = true;
    }
    get filled() {
        return this._filled;
    }
    set filled(b) {
        this._filled = b;
    }
    get stroked() {
        return this._stroked;
    }
    set stroked(b) {
        this._stroked = b;
    }
    get font() {
        return this._font;
    }
    set font(b) {
        this._font = b;
    }
}
exports.Form = Form;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
class LinearAlgebra {
    static add(a, b) {
        if (typeof b == "number") {
            for (let i = 0, len = a.length; i < len; i++) a[i] += b;
        } else {
            for (let i = 0, len = a.length; i < len; i++) a[i] += b[i] || 0;
        }
        return LinearAlgebra;
    }
    static subtract(a, b) {
        if (typeof b == "number") {
            for (let i = 0, len = a.length; i < len; i++) a[i] -= b;
        } else {
            for (let i = 0, len = a.length; i < len; i++) a[i] -= b[i] || 0;
        }
        return LinearAlgebra;
    }
    static multiply(a, b) {
        if (typeof b == "number") {
            for (let i = 0, len = a.length; i < len; i++) a[i] *= b;
        } else {
            for (let i = 0, len = a.length; i < len; i++) a[i] *= b[i] || 1;
        }
        return LinearAlgebra;
    }
    static divide(a, b) {
        if (typeof b == "number") {
            for (let i = 0, len = a.length; i < len; i++) a[i] /= b;
        } else {
            for (let i = 0, len = a.length; i < len; i++) a[i] /= b[i] || 1;
        }
        return LinearAlgebra;
    }
    static dot(a, b) {
        if (a.length != b.length) throw "Array lengths don't match";
        let d = 0;
        for (let i = 0, len = a.length; i < len; i++) {
            d += a[i] * b[i];
        }
        return d;
    }
    static magnitude(a) {
        return Math.sqrt(LinearAlgebra.dot(a, a));
    }
    static unit(a, magnitude = undefined) {
        let m = magnitude === undefined ? LinearAlgebra.magnitude(a) : magnitude;
        return LinearAlgebra.divide(a, m);
    }
    static abs(a) {
        return LinearAlgebra.map(a, Math.abs);
    }
    static max(a) {
        let m = Number.MIN_VALUE;
        for (let i = 0, len = this.length; i < len; i++) m = Math.max(m, this[i]);
        return m;
    }
    static min(a) {
        let m = Number.MAX_VALUE;
        for (let i = 0, len = this.length; i < len; i++) m = Math.min(m, this[i]);
        return m;
    }
    static map(a, fn) {
        for (let i = 0, len = a.length; i < len; i++) {
            a[i] = fn(a[i], i, a);
        }
        return LinearAlgebra;
    }
}
exports.LinearAlgebra = LinearAlgebra;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const Util_1 = __webpack_require__(2);
const Bound_1 = __webpack_require__(1);
const Pt_1 = __webpack_require__(0);
class Num {
    static lerp(a, b, t) {
        return (1 - t) * a + t * b;
    }
    static boundValue(val, min, max, positive = false) {
        let len = Math.abs(max - min);
        let a = val % len;
        if (a > max) a -= len;else if (a < min) a += len;
        return a;
    }
    static within(p, a, b) {
        return p >= Math.min(a, b) && p <= Math.max(a, b);
    }
    static randomRange(a, b = 0) {
        let r = a > b ? a - b : b - a;
        return a + Math.random() * r;
    }
    static normalizeValue(n, a, b) {
        let min = Math.min(a, b);
        let max = Math.max(a, b);
        return (n - min) / (max - min);
    }
    /**
     * Map a value from one range to another
     * @param n a value in the first range
     * @param currMin lower bound of the first range
     * @param currMax upper bound of the first range
     * @param targetMin lower bound of the second range
     * @param targetMax upper bound of the second range
     * @returns a remapped value in the second range
     */
    static mapToRange(n, currA, currB, targetA, targetB) {
        if (currA == currB) throw "[currMin, currMax] must define a range that is not zero";
        let min = Math.min(targetA, targetB);
        let max = Math.max(targetA, targetB);
        return Num.normalizeValue(n, currA, currB) * (max - min) + min;
    }
}
exports.Num = Num;
class Geom {
    static boundAngle(angle) {
        return Num.boundValue(angle, 0, 360);
    }
    static boundRadian(angle) {
        return Num.boundValue(angle, 0, Util_1.Const.two_pi);
    }
    static toRadian(angle) {
        return angle * Util_1.Const.deg_to_rad;
    }
    static toDegree(radian) {
        return radian * Util_1.Const.rad_to_deg;
    }
    static boundingBox(pts) {
        let minPt = pts[0].clone().fill(Number.MAX_VALUE);
        let maxPt = pts[0].clone().fill(Number.MIN_VALUE);
        for (let i = 0, len = pts.length; i < len; i++) {
            for (let d = 0, len = pts[i].length; d < len; d++) {
                if (pts[i][d] < minPt[d]) minPt[d] = pts[i][d];
                if (pts[i][d] > maxPt[d]) maxPt[d] = pts[i][d];
            }
        }
        return new Bound_1.Bound(minPt, maxPt);
    }
    static centroid(pts) {
        return Pt_1.Pt.average(pts);
    }
    /**
     * Get a bisector between two Pts
     * @param a first Pt
     * @param b second Pt
     * @param t a ratio between 0 to 1
     * @param returnAsNormalized if true, return the bisector as a unit vector; otherwise, it'll have an interpolated magnitude.
     */
    static interpolate(a, b, t = 0.5, returnAsNormalized = false) {
        let ma = a.magnitude();
        let mb = b.magnitude();
        let ua = a.$unit(ma);
        let ub = b.$unit(mb);
        let bisect = ua.$multiply(1 - t).add(ub.$multiply(t));
        return returnAsNormalized ? bisect : bisect.$multiply(ma * (1 - t) + mb * t);
    }
    /**
     * Find two Pt that are perpendicular to this Pt (2D)
     * @param axis a string such as "xy" (use Const.xy) or an array to specify index for two dimensions
     * @returns an array of two Pt that are perpendicular to this Pt
     */
    static perpendicular(p, axis = Util_1.Const.xy) {
        let y = axis[1];
        let x = axis[0];
        let pa = p.clone();
        pa[x] = -p[y];
        pa[y] = p[x];
        let pb = p.clone();
        pb[x] = p[y];
        pb[y] = -p[x];
        return [pa, pb];
    }
    /**
     * Generate a sine and cosine lookup table
     * @returns an object with 2 tables (array of 360 values) and 2 functions to get sin/cos given a radian parameter. { sinTable:Float64Array, cosTable:Float64Array, sin:(rad)=>number, cos:(rad)=>number }
     */
    static sinCosTable() {
        let cos = new Float64Array(360);
        let sin = new Float64Array(360);
        for (let i = 0; i < 360; i++) {
            cos[i] = Math.cos(i * Math.PI / 180);
            sin[i] = Math.sin(i * Math.PI / 180);
        }
        let getSin = rad => sin[Math.floor(Geom.boundAngle(Geom.toDegree(rad)))];
        let getCos = rad => cos[Math.floor(Geom.boundAngle(Geom.toDegree(rad)))];
        return { sinTable: sin, cosTable: cos, sin: getSin, cos: getCos };
    }
}
exports.Geom = Geom;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const Bound_1 = __webpack_require__(1);
class Space {
    constructor() {
        this.id = "space";
        this.bound = new Bound_1.Bound();
        this._time = { prev: 0, diff: 0, end: -1 };
        this.players = {};
        this.playerCount = 0;
        this._animID = -1;
        this._pause = false;
        this._refresh = undefined;
    }
    /**
     * Set whether the rendering should be repainted on each frame
     * @param b a boolean value to set whether to repaint each frame
     */
    refresh(b) {
        this._refresh = b;
        return this;
    }
    /**
     * Add an item to this space. An item must define a callback function `animate( time, fps, context )` and will be assigned a property `animateID` automatically.
     * An item should also define a callback function `onSpaceResize( w, h, evt )`.
     * Subclasses of Space may define other callback functions.
     * @param player an IPlayer object with animate function, or simply a function(time, fps, context){}
     */
    add(p) {
        let player = typeof p == "function" ? { animate: p } : p;
        let k = this.playerCount++;
        let pid = this.id + k;
        this.players[pid] = player;
        player.animateID = pid;
        if (player.onSpaceResize) player.onSpaceResize(this.bound);
        // if _refresh is not set, set it to true
        if (this._refresh === undefined) this._refresh = true;
        return this;
    }
    /**
     * Remove a player from this Space
     * @param player an IPlayer that has an `animateID` property
     */
    remove(player) {
        delete this.players[player.animateID];
        return this;
    }
    /**
     * Remove all players from this Space
     */
    removeAll() {
        this.players = {};
        return this;
    }
    /**
     * Main play loop. This implements window.requestAnimationFrame and calls it recursively.
     * Override this `play()` function to implemenet your own animation loop.
     * @param time current time
     */
    play(time = 0) {
        this._animID = requestAnimationFrame(t => this.play(t));
        if (this._pause) return this;
        this._time.diff = time - this._time.prev;
        this._time.prev = time;
        try {
            this.playItems(time);
        } catch (err) {
            cancelAnimationFrame(this._animID);
            throw err;
        }
        return this;
    }
    /**
     * Main animate function. This calls all the items to perform
     * @param time current time
     */
    playItems(time) {
        // clear before draw if refresh is true
        if (this._refresh) this.clear();
        // animate all players
        for (let k in this.players) {
            this.players[k].animate(time, this._time.diff, this);
        }
        // stop if time ended
        if (this._time.end >= 0 && time > this._time.end) {
            cancelAnimationFrame(this._animID);
        }
    }
    /**
     * Pause the animation
     * @param toggle a boolean value to set if this function call should be a toggle (between pause and resume)
     */
    pause(toggle = false) {
        this._pause = toggle ? !this._pause : true;
        return this;
    }
    /**
     * Resume the pause animation
     */
    resume() {
        this._pause = false;
        return this;
    }
    /**
     * Specify when the animation should stop: immediately, after a time period, or never stops.
     * @param t a value in millisecond to specify a time period to play before stopping, or `-1` to play forever, or `0` to end immediately. Default is 0 which will stop the animation immediately.
     */
    stop(t = 0) {
        this._time.end = t;
        return this;
    }
    /**
     * Play animation loop, and then stop after `duration` time has passed.
     * @param duration a value in millisecond to specify a time period to play before stopping, or `-1` to play forever
     */
    playOnce(duration = 5000) {
        this.play();
        this.stop(duration);
        return this;
    }
    /**
     * Get this space's bounding box
     */
    get boundingBox() {
        return this.bound.clone();
    }
    /**
     * Get the size of this bounding box as a Pt
     */
    get size() {
        return this.bound.size.clone();
    }
    /**
     * Get the size of this bounding box as a Pt
     */
    get center() {
        return this.size.divide(2);
    }
    /**
     * Get width of canvas
     */
    get width() {
        return this.bound.width;
    }
    /**
     * Get height of canvas
     */
    get height() {
        return this.bound.height;
    }
}
exports.Space = Space;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const Space_1 = __webpack_require__(7);
const Pt_1 = __webpack_require__(0);
const Bound_1 = __webpack_require__(1);
const CanvasForm_1 = __webpack_require__(3);
class CanvasSpace extends Space_1.Space {
    /**
     * Create a CanvasSpace which represents a HTML Canvas Space
     * @param elem Specify an element by its "id" attribute as string, or by the element object itself. An element can be an existing `<canvas>`, or a `<div>` container in which a new `<canvas>` will be created. If left empty, a `<div id="pt_container"><canvas id="pt" /></div>` will be added to DOM. Use css to customize its appearance if needed.
     * @param callback an optional callback `function(boundingBox, spaceElement)` to be called when canvas is appended and ready. A "ready" event will also be fired from the `<canvas>` element when it's appended, which can be traced with `spaceInstance.space.addEventListener("ready")`
     */
    constructor(elem, callback) {
        super();
        this._pixelScale = 1;
        this._autoResize = true;
        this._bgcolor = "#e1e9f0";
        // track mouse dragging
        this._pressed = false;
        this._dragged = false;
        this._renderFunc = undefined;
        var _selector = null;
        var _existed = false;
        this.id = "pt";
        // check element or element id string
        if (elem instanceof Element) {
            _selector = elem;
            this.id = "pts_existing_space";
        } else {
            ;
            _selector = document.querySelector(elem);
            _existed = true;
            this.id = elem;
        }
        // if selector is not defined, create a canvas
        if (!_selector) {
            this._container = this._createElement("div", this.id + "_container");
            this._canvas = this._createElement("canvas", this.id);
            this._container.appendChild(this._canvas);
            document.body.appendChild(this._container);
            _existed = false;
            // if selector is element but not canvas, create a canvas inside it
        } else if (_selector.nodeName.toLowerCase() != "canvas") {
            this._container = _selector;
            this._canvas = this._createElement("canvas", this.id + "_canvas");
            this._container.appendChild(this._canvas);
            // if selector is an existing canvas
        } else {
            this._canvas = _selector;
            this._container = _selector.parentElement;
            this._autoResize = false;
        }
        // if size is known then set it immediately
        // if (_existed) {
        // let b = this._container.getBoundingClientRect();
        // this.resize( Bound.fromBoundingRect(b) );
        // }
        // no mutation observer, so we set a timeout for ready event
        setTimeout(this._ready.bind(this, callback), 50);
        // store canvas 2d rendering context
        this._ctx = this._canvas.getContext('2d');
        //
    }
    /**
     * Helper function to create a DOM element
     * @param elem element tag name
     * @param id element id attribute
     */
    _createElement(elem = "div", id) {
        let d = document.createElement(elem);
        d.setAttribute("id", id);
        return d;
    }
    /**
     * Handle callbacks after element is mounted in DOM
     * @param callback
     */
    _ready(callback) {
        if (!this._container) throw `Cannot initiate #${this.id} element`;
        let b = this._autoResize ? this._container.getBoundingClientRect() : this._canvas.getBoundingClientRect();
        this.resize(Bound_1.Bound.fromBoundingRect(b));
        this.clear(this._bgcolor);
        this._canvas.dispatchEvent(new Event("ready"));
        if (callback) callback(this.bound, this._canvas);
    }
    /**
     * Set up various options for CanvasSpace. The `opt` parameter is an object with the following fields. This is usually set during instantiation, eg `new CanvasSpace(...).setup( { opt } )`
     * @param opt an object with optional settings, as follows.
     * @param opt.bgcolor a hex or rgba string to set initial background color of the canvas, or use `false` or "transparent" to set a transparent background. You may also change it later with `clear()`
     * @param opt.resize a boolean to set whether `<canvas>` size should auto resize to match its container's size. You can also set it manually with `autoSize()`
     * @param opt.retina a boolean to set if device pixel scaling should be used. This may make drawings on retina displays look sharper but may reduce performance slightly. Default is `true`.
     */
    setup(opt) {
        if (opt.bgcolor) this._bgcolor = opt.bgcolor;
        if (opt.resize != undefined) this._autoResize = opt.resize;
        if (opt.retina !== false) {
            let r1 = window.devicePixelRatio || 1;
            let r2 = this._ctx.webkitBackingStorePixelRatio || this._ctx.mozBackingStorePixelRatio || this._ctx.msBackingStorePixelRatio || this._ctx.oBackingStorePixelRatio || this._ctx.backingStorePixelRatio || 1;
            this._pixelScale = r1 / r2;
        }
        return this;
    }
    /**
     * Get the rendering context of canvas
     */
    get ctx() {
        return this._ctx;
    }
    /**
     * Get a new CanvasForm for drawing
     */
    getForm() {
        return new CanvasForm_1.CanvasForm(this);
    }
    /**
     * Window resize handling
     * @param evt
     */
    _resizeHandler(evt) {
        let b = this._container.getBoundingClientRect();
        this.resize(Bound_1.Bound.fromBoundingRect(b), evt);
    }
    /**
     * Set whether the canvas element should resize when its container is resized. Default will auto size
     * @param auto a boolean value indicating if auto size is set. Default is `true`.
     */
    autoResize(auto = true) {
        if (auto) {
            window.addEventListener('resize', this._resizeHandler);
        } else {
            window.removeEventListener('resize', this._resizeHandler);
        }
        return this;
    }
    /**
     * Get the html canvas element
     */
    get element() {
        return this._canvas;
    }
    /**
     * Get the parent element that contains the canvas element
     */
    get parent() {
        return this._container;
    }
    /**
     * This overrides Space's `resize` function. It's a callback function for window's resize event. Keep track of this with `onSpaceResize(w,h,evt)` callback in your added objects.
     * @param b a Bound object to resize to
     * @param evt Optionally pass a resize event
     */
    resize(b, evt) {
        this.bound = b;
        this._canvas.width = this.bound.size.x * this._pixelScale;
        this._canvas.height = this.bound.size.y * this._pixelScale;
        this._canvas.style.width = this.bound.size.x + "px";
        this._canvas.style.height = this.bound.size.y + "px";
        if (this._pixelScale != 1) {
            this._ctx.scale(this._pixelScale, this._pixelScale);
            this._ctx.translate(0.5, 0.5);
        }
        for (let k in this.players) {
            let p = this.players[k];
            if (p.onSpaceResize) p.onSpaceResize(this.bound.size, evt);
        }
        this.render(this._ctx);
        return this;
    }
    /**
     * Clear the canvas with its background color. Overrides Space's `clear` function.
     * @param bg Optionally specify a custom background color in hex or rgba string, or "transparent". If not defined, it will use its `bgcolor` property as background color to clear the canvas.
     */
    clear(bg) {
        if (bg) this._bgcolor = bg;
        let lastColor = this._ctx.fillStyle;
        if (this._bgcolor && this._bgcolor != "transparent") {
            this._ctx.fillStyle = this._bgcolor;
            this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
        } else {
            this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
        }
        this._ctx.fillStyle = lastColor;
        return this;
    }
    /**
     * Main animation function. Call `Space.playItems`.
     * @param time current time
     */
    playItems(time) {
        this._ctx.save();
        super.playItems(time);
        this._ctx.restore();
        this.render(this._ctx);
    }
    /**
     * Bind event listener in canvas element, for events such as mouse events
     * @param evt an event string such as "mousedown"
     * @param callback callback function for this event
     */
    bindCanvas(evt, callback) {
        this._canvas.addEventListener(evt, callback);
    }
    /**
     * Unbind a callback from the event listener
     * @param evt an event string such as "mousedown"
     * @param callback callback function to unbind
     */
    unbindCanvas(evt, callback) {
        this._canvas.removeEventListener(evt, callback);
    }
    /**
     * A convenient method to bind (or unbind) all mouse events in canvas element. All item added to `players` property that implements an `onMouseAction` callback will receive mouse event callbacks. The types of mouse actions are: "up", "down", "move", "drag", "drop", "over", and "out".
     * @param _bind a boolean value to bind mouse events if set to `true`. If `false`, all mouse events will be unbound. Default is true.
     */
    bindMouse(_bind = true) {
        if (_bind) {
            this.bindCanvas("mousedown", this._mouseDown.bind(this));
            this.bindCanvas("mouseup", this._mouseUp.bind(this));
            this.bindCanvas("mouseover", this._mouseOver.bind(this));
            this.bindCanvas("mouseout", this._mouseOut.bind(this));
            this.bindCanvas("mousemove", this._mouseMove.bind(this));
        } else {
            this.unbindCanvas("mousedown", this._mouseDown.bind(this));
            this.unbindCanvas("mouseup", this._mouseUp.bind(this));
            this.unbindCanvas("mouseover", this._mouseOver.bind(this));
            this.unbindCanvas("mouseout", this._mouseOut.bind(this));
            this.unbindCanvas("mousemove", this._mouseMove.bind(this));
        }
    }
    /**
     * A convenient method to bind (or unbind) all mobile touch events in canvas element. All item added to `players` property that implements an `onTouchAction` callback will receive touch event callbacks. The types of touch actions are the same as the mouse actions: "up", "down", "move", and "out"
     * @param _bind a boolean value to bind touch events if set to `true`. If `false`, all touch events will be unbound. Default is true.
     */
    bindTouch(_bind = true) {
        if (_bind) {
            this.bindCanvas("touchstart", this._mouseDown.bind(this));
            this.bindCanvas("touchend", this._mouseUp.bind(this));
            this.bindCanvas("touchmove", this._touchMove.bind(this));
            this.bindCanvas("touchcancel", this._mouseOut.bind(this));
        } else {
            this.unbindCanvas("touchstart", this._mouseDown.bind(this));
            this.unbindCanvas("touchend", this._mouseUp.bind(this));
            this.unbindCanvas("touchmove", this._touchMove.bind(this));
            this.unbindCanvas("touchcancel", this._mouseOut.bind(this));
        }
    }
    /**
     * A convenient method to convert the touch points in a touch event to an array of `Pt`.
     * @param evt a touch event which contains touches, changedTouches, and targetTouches list
     * @param which a string to select a touches list: "touches", "changedTouches", or "targetTouches". Default is "touches"
     * @return an array of Pt, whose origin position (0,0) is offset to the top-left of this space
     */
    touchesToPoints(evt, which = "touches") {
        if (!evt || !evt[which]) return [];
        let ts = [];
        for (var i = 0; i < evt[which].length; i++) {
            let t = evt[which].item(i);
            ts.push(new Pt_1.Pt(t.pageX - this.bound.topLeft.x, t.pageY - this.bound.topLeft.y));
        }
        return ts;
    }
    /**
     * Go through all the `players` and call its `onMouseAction` callback function
     * @param type
     * @param evt
     */
    _mouseAction(type, evt) {
        if (evt instanceof TouchEvent) {
            for (let k in this.players) {
                let v = this.players[k];
                let c = evt.changedTouches && evt.changedTouches.length > 0;
                let px = c ? evt.changedTouches.item(0).pageX : 0;
                let py = c ? evt.changedTouches.item(0).pageY : 0;
                v.onTouchAction(type, px, py, evt);
            }
        } else {
            for (let k in this.players) {
                let v = this.players[k];
                let px = evt.offsetX || evt.layerX;
                let py = evt.offsetY || evt.layerY;
                v.onMouseAction(type, px, py, evt);
            }
        }
    }
    /**
     * MouseDown handler
     * @param evt
     */
    _mouseDown(evt) {
        this._mouseAction("down", evt);
        this._pressed = true;
    }
    /**
     * MouseUp handler
     * @param evt
     */
    _mouseUp(evt) {
        this._mouseAction("up", evt);
        if (this._dragged) this._mouseAction("drop", evt);
        this._pressed = false;
        this._dragged = false;
    }
    /**
     * MouseMove handler
     * @param evt
     */
    _mouseMove(evt) {
        this._mouseAction("move", evt);
        if (this._pressed) {
            this._dragged = true;
            this._mouseAction("drag", evt);
        }
    }
    /**
     * MouseOver handler
     * @param evt
     */
    _mouseOver(evt) {
        this._mouseAction("over", evt);
    }
    /**
     * MouseOut handler
     * @param evt
     */
    _mouseOut(evt) {
        this._mouseAction("out", evt);
        if (this._dragged) this._mouseAction("drop", evt);
        this._dragged = false;
    }
    /**
     * TouchMove handler
     * @param evt
     */
    _touchMove(evt) {
        evt.preventDefault();
        this._mouseMove(evt);
    }
    /**
     * Custom rendering
     * @param context rendering context
     */
    render(context) {
        if (this._renderFunc) this._renderFunc(context, this);
        return this;
    }
    /**
     * Set a custom rendering `function(graphics_context, canvas_space)` if needed
     */
    set customRendering(f) {
        this._renderFunc = f;
    }
    get customRendering() {
        return this._renderFunc;
    }
}
exports.CanvasSpace = CanvasSpace;

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const Pt_1 = __webpack_require__(0);
class Create {
    static distributeRandom(bound, count, dimensions = 2) {
        let pts = [];
        for (let i = 0; i < count; i++) {
            let p = [bound.x + Math.random() * bound.width];
            if (dimensions > 1) p.push(bound.y + Math.random() * bound.height);
            if (dimensions > 2) p.push(bound.z + Math.random() * bound.depth);
            pts.push(new Pt_1.Pt(p));
        }
        return pts;
    }
}
exports.Create = Create;

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const Pt_1 = __webpack_require__(0);
const Util_1 = __webpack_require__(2);
const Bound_1 = __webpack_require__(1);
const Create_1 = __webpack_require__(9);
const CanvasSpace_1 = __webpack_require__(8);
window["Pt"] = Pt_1.Pt;
console.log(new Pt_1.Pt(32, 43).unit().magnitude());
// console.log( Pts.zipOne( [new Pt(1,3), new Pt(2,4), new Pt(5,10)], 1, 0 ).toString() );
// console.log( new Pt(1,2,3,4,5,6).slice(2,5).toString() );
// console.log( Pts.toString( Pts.zip( [new Pt(1,2), new Pt(3,4), new Pt(5,6)] ) ) );
// console.log( Pts.toString( Pts.zip( Pts.zip( [new Pt(1,2), new Pt(3,4), new Pt(5,6)] ) ) ) );
console.log(Util_1.Util.split([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], 5));
let cs = [];
for (let i = 0; i < 500; i++) {
    let c = new Pt_1.Pt(Math.random() * 200, Math.random() * 200);
    cs.push(c);
}
var canvas = new CanvasSpace_1.CanvasSpace("#pt", ready).setup({ retina: true });
var form = canvas.getForm();
var form2 = canvas.getForm();
var pt = new Pt_1.Pt(50, 50);
var pto = pt.op([p => p.$add(10, 10), p => p.$add(20, 25)]);
var pto2 = pt.op({
    "a": p => p.$add(10, 10),
    "b": p => p.$add(20, 25)
});
for (var i in pto2) {
    console.log("==>", pto2[i].toString());
}
console.log(pto.reduce((a, b) => a + " | " + b.toString(), ""));
console.log(pt.toString());
var ps = [];
let fs = {
    "size": p => {
        let dist = p.$subtract(canvas.size.$divide(2)).magnitude();
        return new Pt_1.Pt(dist / 8, dist / (Math.max(canvas.width, canvas.height) / 2));
    }
};
function ready(bound, space) {
    ps = Create_1.Create.distributeRandom(new Bound_1.Bound(canvas.size), 50);
}
canvas.add({
    animate: (time, ftime, space) => {
        let framerate = 1000 / ftime;
        form.fill("#999").text(new Pt_1.Pt(20, 20), framerate + " fps");
        form.reset();
        form.stroke(false);
        ps.forEach(p => {
            let attrs = p.op(fs);
            form.fill(`rgba(255,0,0,${1.2 - attrs.size.y}`);
            form.point(p, attrs.size.x, "circle");
        });
        // form.point( {x:50.5, y: 50.5}, 20, "circle");
        // form.point( {x:50.5, y: 140.5}, 20, );
        // console.log(time, fps);
        // form.point( {x:50, y:50}, 100);    
    },
    onMouseAction: (type, px, py) => {
        if (type == "move") {
            let d = canvas.boundingBox.center.$subtract(px, py);
            let p1 = canvas.boundingBox.center.$subtract(d);
            let bound = new Bound_1.Bound(p1, p1.$add(d.$abs().multiply(2)));
            ps = Create_1.Create.distributeRandom(bound, 200);
        }
    }
});
canvas.bindMouse();
canvas.playOnce(3000);
/*
canvas.add( {
  animate: (time, fps, space) => {
    form2.reset();
    form2.fill("#fff").stroke("#000").point( {x:150.5, y: 50.5}, 20, "circle");
    form2.fill("#ff0").stroke("#ccc").point( {x:150.5, y: 140.5}, 20, );
    // console.log(time, fps);
  }
})
*/
//canvas.playOnce(5000);
/*
let vec = new Vector( [1000, 2, 3] ).add( new Vector( [2, 3, 4] ) );
console.log(vec.toString());

setInterval( () => vec.add( new Vector( [ 1, 2, 3 ]) ), 500 );

let m1 = Matrix.identity(3);
let m2 = Matrix.identity(3);


console.log( Matrix.add(m1, m2).toString() );

let pts = new Pts();
console.log( pts );
*/
// console.log(pts.toString());
// pts.pt(1,2,3);
// pts.pt(2,3,4);
// console.log(pts.toString());
// console.log( Matrix.augment(m1, m2).toString() );

/***/ })
/******/ ]);
//# sourceMappingURL=testapp.js.map