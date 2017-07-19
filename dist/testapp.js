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
/******/ 	return __webpack_require__(__webpack_require__.s = 11);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan)
Object.defineProperty(exports, "__esModule", { value: true });
const Util_1 = __webpack_require__(1);
const Num_1 = __webpack_require__(4);
const LinearAlgebra_1 = __webpack_require__(2);
exports.PtBaseArray = Float32Array;
class Pt extends exports.PtBaseArray {
    /**
     * Create a Pt. If no parameter is provided, this will instantiate a Pt with 2 dimensions [0, 0].
     * Example: `new Pt()`, `new Pt(1,2,3,4,5)`, `new Pt([1,2])`, `new Pt({x:0, y:1})`, `new Pt(pt)`
     * @param args a list of numbers, an array of number, or an object with {x,y,z,w} properties
     */
    constructor(...args) {
        super((args.length > 0) ? Util_1.Util.getArgs(args) : [0, 0]);
    }
    static make(dimensions, defaultValue = 0) {
        let p = new exports.PtBaseArray(dimensions);
        if (defaultValue)
            p.fill(defaultValue);
        return new Pt(p);
    }
    get id() { return this._id; }
    set id(s) { this._id = s; }
    get x() { return this[0]; }
    get y() { return this[1]; }
    get z() { return this[2]; }
    get w() { return this[3]; }
    set x(n) { this[0] = n; }
    set y(n) { this[1] = n; }
    set z(n) { this[2] = n; }
    set w(n) { this[3] = n; }
    clone() {
        return new Pt(this);
    }
    equals(p, threshold = 0.000001) {
        for (let i = 0, len = this.length; i < len; i++) {
            if (Math.abs(this[i] - p[i]) > threshold)
                return false;
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
        let m = (magnitude != undefined) ? magnitude : this.magnitude();
        return this.to(Math.cos(radian) * m, Math.sin(radian) * m);
    }
    /**
     * Create an operation using this Pt, passing this Pt into a custom function's first parameter
     * For example: `let myOp = pt.op( fn ); let result = myOp( [1,2,3] );`
     * @param fn any function that takes a Pt as its first parameter
     * @returns a resulting function that takes other parameters required in `fn`
     */
    op(fn) {
        let self = this;
        return (...params) => {
            return fn(self, ...params);
        };
    }
    /**
     * This combines a series of operations into an array. See `op()` for details.
     * For example: `let myOps = pt.ops([fn1, fn2, fn3]); let results = myOps.map( (op) => op([1,2,3]) );`
     * @param fns an array of functions for `op`
     * @returns an array of resulting functions
     */
    ops(fns) {
        let _ops = [];
        for (let i = 0, len = fns.length; i < len; i++) {
            _ops.push(this.op(fns[i]));
        }
        return _ops;
    }
    $map(fn) {
        let m = this.clone();
        LinearAlgebra_1.Vec.map(m, fn);
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
        let m = new exports.PtBaseArray(this).slice(start, end);
        return new Pt(m);
    }
    $concat(...args) {
        return new Pt(this.toArray().concat(Util_1.Util.getArgs(args)));
    }
    add(...args) {
        (args.length === 1 && typeof args[0] == "number") ? LinearAlgebra_1.Vec.add(this, args[0]) : LinearAlgebra_1.Vec.add(this, Util_1.Util.getArgs(args));
        return this;
    }
    $add(...args) { return this.clone().add(...args); }
    ;
    subtract(...args) {
        (args.length === 1 && typeof args[0] == "number") ? LinearAlgebra_1.Vec.subtract(this, args[0]) : LinearAlgebra_1.Vec.subtract(this, Util_1.Util.getArgs(args));
        return this;
    }
    $subtract(...args) { return this.clone().subtract(...args); }
    ;
    multiply(...args) {
        (args.length === 1 && typeof args[0] == "number") ? LinearAlgebra_1.Vec.multiply(this, args[0]) : LinearAlgebra_1.Vec.multiply(this, Util_1.Util.getArgs(args));
        return this;
    }
    $multiply(...args) { return this.clone().multiply(...args); }
    ;
    divide(...args) {
        (args.length === 1 && typeof args[0] == "number") ? LinearAlgebra_1.Vec.divide(this, args[0]) : LinearAlgebra_1.Vec.divide(this, Util_1.Util.getArgs(args));
        return this;
    }
    $divide(...args) { return this.clone().divide(...args); }
    ;
    magnitudeSq() { return LinearAlgebra_1.Vec.dot(this, this); }
    magnitude() { return LinearAlgebra_1.Vec.magnitude(this); }
    /**
     * Convert to a unit vector
     * @param magnitude Optional: if the magnitude is known, pass it as a parameter to avoid duplicate calculation.
     */
    unit(magnitude = undefined) {
        LinearAlgebra_1.Vec.unit(this, magnitude);
        return this;
    }
    /**
     * Get a unit vector from this Pt
     */
    $unit(magnitude = undefined) { return this.clone().unit(magnitude); }
    dot(...args) { return LinearAlgebra_1.Vec.dot(this, Util_1.Util.getArgs(args)); }
    $cross(...args) { return LinearAlgebra_1.Vec.cross(this, Util_1.Util.getArgs(args)); }
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
        LinearAlgebra_1.Vec.abs(this);
        return this;
    }
    /**
     * Get a new Pt with absolute values of this Pt
     */
    $abs() {
        return this.clone().abs();
    }
    /**
     * Floor values for all values in this pt
     */
    floor() {
        LinearAlgebra_1.Vec.floor(this);
        return this;
    }
    /**
     * Get a new Pt with floor values of this Pt
     */
    $floor() {
        return this.clone().floor();
    }
    /**
     * Ceil values for all values in this pt
     */
    ceil() {
        LinearAlgebra_1.Vec.ceil(this);
        return this;
    }
    /**
     * Get a new Pt with ceil values of this Pt
     */
    $ceil() {
        return this.clone().ceil();
    }
    /**
     * Round values for all values in this pt
     */
    round() {
        LinearAlgebra_1.Vec.round(this);
        return this;
    }
    /**
     * Get a new Pt with round values of this Pt
     */
    $round() {
        return this.clone().round();
    }
    minValue() {
        return LinearAlgebra_1.Vec.min(this);
    }
    maxValue() {
        return LinearAlgebra_1.Vec.max(this);
    }
    $min(...args) {
        let p = Util_1.Util.getArgs(args);
        let m = this.clone();
        for (let i = 0, len = Math.min(this.length, p.length); i < len; i++) {
            m[i] = Math.min(this[i], p[i]);
        }
        return m;
    }
    $max(...args) {
        let p = Util_1.Util.getArgs(args);
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
        return Num_1.Geom.boundRadian(this.angle(axis)) - Num_1.Geom.boundRadian(p.angle(axis));
    }
    scale(scale, anchor) {
        Num_1.Geom.scale(this, scale, anchor || Pt.make(this.length, 0));
        return this;
    }
    rotate2D(angle, anchor, axis) {
        Num_1.Geom.rotate2D(this, angle, anchor || Pt.make(this.length, 0), axis);
        return this;
    }
    shear2D(scale, anchor, axis) {
        Num_1.Geom.shear2D(this, scale, anchor || Pt.make(this.length, 0), axis);
        return this;
    }
    reflect2D(line, axis) {
        Num_1.Geom.reflect2D(this, line, axis);
        return this;
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
     * Given two groups of Pts, and a function that operate on two Pt, return a group of Pts
     * @param a a group of Pts
     * @param b another array of Pts
     * @param op a function that takes two parameters (p1, p2) and returns a Pt
     */
    static combine(a, b, op) {
        let result = new Group();
        for (let i = 0, len = a.length; i < len; i++) {
            for (let k = 0, len = b.length; k < len; k++) {
                result.push(op(a[i], b[k]));
            }
        }
        return result;
    }
}
exports.Pt = Pt;
class Group extends Array {
    constructor(...args) {
        super(...args);
    }
    get id() { return this._id; }
    set id(s) { this._id = s; }
    get p1() { return this[0]; }
    get p2() { return this[1]; }
    get p3() { return this[2]; }
    get p4() { return this[2]; }
    clone() {
        let group = new Group();
        for (let i = 0, len = this.length; i < len; i++) {
            group.push(this[i].clone());
        }
        return group;
    }
    static fromArray(list) {
        let g = new Group();
        for (let i = 0, len = list.length; i < len; i++) {
            let p = (list[i] instanceof Pt) ? list[i] : new Pt(list[i]);
            g.push(p);
        }
        return g;
    }
    static fromGroup(list) {
        return Group.from(list);
    }
    split(chunkSize, stride) {
        let sp = Util_1.Util.split(this, chunkSize, stride);
        return sp.map((g) => Group.fromGroup(g));
    }
    /**
     * Insert a Pt into this group
     * @param pts Another group of Pts
     * @param index the index position to insert into
     */
    insert(pts, index = 0) {
        let g = Group.prototype.splice.apply(this, [index, 0, ...pts]);
        return this;
    }
    /**
     * Like Array's splice function, with support for negative index and a friendlier name.
     * @param index start index, which can be negative (where -1 is at index 0, -2 at index 1, etc)
     * @param count number of items to remove
     * @returns The items that are removed.
     */
    remove(index = 0, count = 1) {
        let param = (index < 0) ? [index * -1 - 1, count] : [index, count];
        return Group.prototype.splice.apply(this, param);
    }
    segments(pts_per_segment = 2, stride = 2) { return this.split(2, stride); }
    /**
     * Get all the lines (ie, edges in a graph) of this group
     */
    lines() { return this.segments(2, 1); }
    centroid() {
        return Num_1.Geom.centroid(this);
    }
    boundingBox() {
        return Num_1.Geom.boundingBox(this);
    }
    anchorTo(ptOrIndex = 0) { Num_1.Geom.anchor(this, ptOrIndex, "to"); }
    anchorFrom(ptOrIndex = 0) { Num_1.Geom.anchor(this, ptOrIndex, "from"); }
    /**
     * Create an operation using this Group, passing this Group into a custom function's first parameter
     * For example: `let myOp = group.op( fn ); let result = myOp( [1,2,3] );`
     * @param fn any function that takes a Group as its first parameter
     * @returns a resulting function that takes other parameters required in `fn`
     */
    op(fn) {
        let self = this;
        return (...params) => {
            return fn(self, ...params);
        };
    }
    /**
     * This combines a series of operations into an array. See `op()` for details.
     * For example: `let myOps = pt.ops([fn1, fn2, fn3]); let results = myOps.map( (op) => op([1,2,3]) );`
     * @param fns an array of functions for `op`
     * @returns an array of resulting functions
     */
    ops(fns) {
        let _ops = [];
        for (let i = 0, len = fns.length; i < len; i++) {
            _ops.push(this.op(fns[i]));
        }
        return _ops;
    }
    /**
     * Get an interpolated point on the line segments defined by this Group
     * @param t a value between 0 to 1 usually
     */
    interpolate(t) {
        t = Num_1.Num.limitValue(t, 0, 1);
        let chunk = this.length - 1;
        let tc = 1 / (this.length - 1);
        let idx = Math.floor(t / tc);
        return Num_1.Geom.interpolate(this[idx], this[Math.min(this.length - 1, idx + 1)], (t - idx * tc) * chunk);
    }
    moveBy(...args) {
        let pt = Util_1.Util.getArgs(args);
        for (let i = 0, len = this.length; i < len; i++) {
            this[i].add(pt);
        }
        return this;
    }
    /**
     * Move the first Pt in this group to a specific position, and move all the other Pts correspondingly
     * @param args a list of numbers, an array of number, or an object with {x,y,z,w} properties
     */
    moveTo(...args) {
        let d = new Pt(Util_1.Util.getArgs(args)).subtract(this[0]);
        this.moveBy(d);
        return this;
    }
    scale(scale, anchor) {
        for (let i = 0, len = this.length; i < len; i++) {
            Num_1.Geom.scale(this[i], scale, anchor || this[0]);
        }
        return this;
    }
    rotate2D(angle, anchor, axis) {
        for (let i = 0, len = this.length; i < len; i++) {
            Num_1.Geom.rotate2D(this[i], angle, anchor || this[0], axis);
        }
        return this;
    }
    shear2D(scale, anchor, axis) {
        for (let i = 0, len = this.length; i < len; i++) {
            Num_1.Geom.shear2D(this[i], scale, anchor || this[0], axis);
        }
        return this;
    }
    reflect2D(line, axis) {
        for (let i = 0, len = this.length; i < len; i++) {
            Num_1.Geom.reflect2D(this[i], line, axis);
        }
        return this;
    }
    /**
     * Sort this group's Pts by values in a specific dimension
     * @param dim dimensional index
     * @param desc if true, sort descending. Default is false (ascending)
     */
    sortByDimension(dim, desc = false) {
        return this.sort((a, b) => (desc) ? b[dim] - a[dim] : a[dim] - b[dim]);
    }
    $add(g) {
        return LinearAlgebra_1.Mat.add(this, g);
    }
    $multiply(g, transposed = false) {
        return LinearAlgebra_1.Mat.multiply(this, g, transposed);
    }
    zipSlice(index, defaultValue = false) {
        return LinearAlgebra_1.Mat.zipSlice(this, index, defaultValue);
    }
    /**
     * Zip a group of Pt. eg, [[1,2],[3,4],[5,6]] => [[1,3,5],[2,4,6]]
     * @param defaultValue a default value to fill if index out of bound. If not provided, it will throw an error instead.
     * @param useLongest If true, find the longest list of values in a Pt and use its length for zipping. Default is false, which uses the first item's length for zipping.
     */
    $zip(defaultValue = false, useLongest = false) {
        return LinearAlgebra_1.Mat.zip(this, defaultValue, useLongest);
    }
    toString() {
        return "Group[ " + this.reduce((p, c) => p + c.toString() + " ", "") + " ]";
    }
    /**
     * Given two arrays of Groups, and a function that operate on two Groups, return an array of Group
     * @param a an array of Groups, eg [ Group, Group, ... ]
     * @param b another array of Groups
     * @param op a function that takes two parameters (group1, group2) and returns a Group
     */
    static combine(a, b, op) {
        let result = [];
        for (let i = 0, len = a.length; i < len; i++) {
            for (let k = 0, len = b.length; k < len; k++) {
                result.push(op(a[i], b[k]));
            }
        }
        return result;
    }
}
exports.Group = Group;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan)
Object.defineProperty(exports, "__esModule", { value: true });
const Pt_1 = __webpack_require__(0);
exports.Const = {
    xy: "xy",
    yz: "yz",
    xz: "xz",
    xyz: "xyz",
    horizontal: 0,
    vertical: 1,
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
        if (args.length < 1)
            return [];
        var pos = [];
        var isArray = Array.isArray(args[0]) || ArrayBuffer.isView(args[0]);
        // positional arguments: x,y,z,w,...
        if (typeof args[0] === 'number') {
            pos = Array.prototype.slice.call(args);
            // as an object of {x, y?, z?, w?}
        }
        else if (typeof args[0] === 'object' && !isArray) {
            let a = ["x", "y", "z", "w"];
            let p = args[0];
            for (let i = 0; i < a.length; i++) {
                if ((p.length && i >= p.length) || !(a[i] in p))
                    break; // check for length and key exist
                pos.push(p[a[i]]);
            }
            // as an array of values
        }
        else if (isArray) {
            pos = [].slice.call(args[0]);
        }
        return pos;
    }
    static warn(defaultReturn, message = "error") {
        if (Util.warnLevel == "error") {
            throw new Error(message);
        }
        else if (Util.warnLevel == "warn") {
            console.warn(message);
        }
        return defaultReturn;
    }
    /**
     * Split an array into chunks of sub-array
     * @param pts an array
     * @param size chunk size, ie, number of items in a chunk
     * @param stride optional parameter to "walk through" the array in steps
     */
    static split(pts, size, stride) {
        let st = stride || size;
        let chunks = [];
        for (let i = 0; i < pts.length; i++) {
            if (i * st + size > pts.length)
                break;
            chunks.push(pts.slice(i * st, i * st + size));
        }
        return chunks;
    }
    static flatten(pts, flattenAsGroup = true) {
        let arr = (flattenAsGroup) ? new Pt_1.Group() : new Array();
        return arr.concat.apply(arr, pts);
    }
}
Util.warnLevel = "default";
exports.Util = Util;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan)
Object.defineProperty(exports, "__esModule", { value: true });
const Pt_1 = __webpack_require__(0);
const Op_1 = __webpack_require__(5);
class Vec {
    static add(a, b) {
        if (typeof b == "number") {
            for (let i = 0, len = a.length; i < len; i++)
                a[i] += b;
        }
        else {
            for (let i = 0, len = a.length; i < len; i++)
                a[i] += b[i] || 0;
        }
        return a;
    }
    static subtract(a, b) {
        if (typeof b == "number") {
            for (let i = 0, len = a.length; i < len; i++)
                a[i] -= b;
        }
        else {
            for (let i = 0, len = a.length; i < len; i++)
                a[i] -= b[i] || 0;
        }
        return a;
    }
    static multiply(a, b) {
        if (typeof b == "number") {
            for (let i = 0, len = a.length; i < len; i++)
                a[i] *= b;
        }
        else {
            if (a.length != b.length) {
                throw new Error(`Cannot do element-wise multiply since the array lengths don't match: ${a.toString()} multiply-with ${b.toString()}`);
            }
            for (let i = 0, len = a.length; i < len; i++)
                a[i] *= b[i];
        }
        return a;
    }
    static divide(a, b) {
        if (typeof b == "number") {
            if (b === 0)
                throw "Cannot divide by zero";
            for (let i = 0, len = a.length; i < len; i++)
                a[i] /= b;
        }
        else {
            if (a.length != b.length) {
                throw new Error(`Cannot do element-wise divide since the array lengths don't match. ${a.toString()} divide-by ${b.toString()}`);
            }
            for (let i = 0, len = a.length; i < len; i++)
                a[i] /= b[i];
        }
        return a;
    }
    static dot(a, b) {
        if (a.length != b.length)
            throw "Array lengths don't match";
        let d = 0;
        for (let i = 0, len = a.length; i < len; i++) {
            d += a[i] * b[i];
        }
        return d;
    }
    static cross(a, b) {
        return new Pt_1.Pt((a[1] * b[2] - a[2] * b[1]), (a[2] * b[0] - a[0] * b[2]), (a[0] * b[1] - a[1] * b[0]));
    }
    static magnitude(a) {
        return Math.sqrt(Vec.dot(a, a));
    }
    static unit(a, magnitude = undefined) {
        let m = (magnitude === undefined) ? Vec.magnitude(a) : magnitude;
        return Vec.divide(a, m);
    }
    static abs(a) {
        return Vec.map(a, Math.abs);
    }
    static floor(a) {
        return Vec.map(a, Math.floor);
    }
    static ceil(a) {
        return Vec.map(a, Math.ceil);
    }
    static round(a) {
        return Vec.map(a, Math.round);
    }
    static max(a) {
        let m = Number.MIN_VALUE;
        let index = 0;
        for (let i = 0, len = a.length; i < len; i++) {
            m = Math.max(m, a[i]);
            if (m === a[i])
                index = i;
        }
        return { value: m, index: index };
    }
    static min(a) {
        let m = Number.MAX_VALUE;
        let index = 0;
        for (let i = 0, len = a.length; i < len; i++) {
            m = Math.min(m, a[i]);
            if (m === a[i])
                index = i;
        }
        return { value: m, index: index };
    }
    static sum(a) {
        let s = 0;
        for (let i = 0, len = a.length; i < len; i++)
            s += a[i];
        return s;
    }
    static map(a, fn) {
        for (let i = 0, len = a.length; i < len; i++) {
            a[i] = fn(a[i], i, a);
        }
        return a;
    }
}
exports.Vec = Vec;
class Mat {
    /**
     * Matrix additions. Matrices should have the same rows and columns.
     * @param a a group of Pt
     * @param b a scalar number or a group of Pt
     * @returns a group with the same rows and columns as a and b
     */
    static add(a, b) {
        if (typeof b != "number") {
            if (a[0].length != b[0].length)
                throw "Cannot add matrix if rows' and columns' size don't match.";
            if (a.length != b.length)
                throw "Cannot add matrix if rows' and columns' size don't match.";
        }
        let g = new Pt_1.Group();
        let isNum = typeof b == "number";
        for (let i = 0, len = a.length; i < len; i++) {
            g.push(a[i].$add((isNum) ? b : b[i]));
        }
        return g;
    }
    /**
     * Matrix multiplication
     * @param a a Group of M Pts, each with K dimensions (M-rows, K-columns)
     * @param b a scalar number, or a Group of K Pts, each with N dimensions (K-rows, N-columns) -- or if transposed is true, then N Pts with K dimensions
     * @param transposed if true, then a and b's columns should match (ie, each Pt should have the same dimensions).
     * @returns a group with M Pt, each with N dimensions (M-rows, N-columns)
     */
    static multiply(a, b, transposed = false) {
        let g = new Pt_1.Group();
        if (typeof b != "number") {
            if (!transposed && a[0].length != b.length)
                throw "Cannot multiply matrix if rows in matrix-a don't match columns in matrix-b.";
            if (transposed && a[0].length != b[0].length)
                throw "Cannot multiply matrix if transposed and the columns in both matrices don't match.";
            if (!transposed)
                b = Mat.transpose(b);
            for (let ai = 0, alen = a.length; ai < alen; ai++) {
                let p = Pt_1.Pt.make(b.length, 0);
                for (let bi = 0, blen = b.length; bi < blen; bi++) {
                    p[bi] = a[ai].dot(b[bi]);
                }
                g.push(p);
            }
        }
        else {
            for (let ai = 0, alen = a.length; ai < alen; ai++) {
                g.push(a[ai].$multiply(b));
            }
        }
        return g;
    }
    /**
     * Zip one slice of an array of Pt
     * @param g a group of Pt
     * @param idx index to zip at
     * @param defaultValue a default value to fill if index out of bound. If not provided, it will throw an error instead.
     */
    static zipSlice(g, index, defaultValue = false) {
        let f = (typeof defaultValue == "boolean") ? "get" : "at"; // choose `get` or `at` function
        let z = [];
        for (let i = 0, len = g.length; i < len; i++) {
            if (g[i].length - 1 < index && defaultValue === false)
                throw `Index ${index} is out of bounds`;
            z.push(g[i][index] || defaultValue);
        }
        return new Pt_1.Pt(z);
    }
    /**
     * Zip a group of Pt. eg, [[1,2],[3,4],[5,6]] => [[1,3,5],[2,4,6]]
     * @param g a group of Pt
     * @param defaultValue a default value to fill if index out of bound. If not provided, it will throw an error instead.
     * @param useLongest If true, find the longest list of values in a Pt and use its length for zipping. Default is false, which uses the first item's length for zipping.
     */
    static zip(g, defaultValue = false, useLongest = false) {
        let ps = new Pt_1.Group();
        let len = (useLongest) ? g.reduce((a, b) => Math.max(a, b.length), 0) : g[0].length;
        for (let i = 0; i < len; i++) {
            ps.push(Mat.zipSlice(g, i, defaultValue));
        }
        return ps;
    }
    static transpose(g) {
        return Mat.zip(g);
    }
    static transform2D(pt, m) {
        let x = pt[0] * m[0][0] + pt[1] * m[1][0] + m[2][0];
        let y = pt[0] * m[0][1] + pt[1] * m[1][1] + m[2][1];
        return new Pt_1.Pt(x, y);
    }
    static scale2DMatrix(x, y) {
        return new Pt_1.Group(new Pt_1.Pt(x, 0, 0), new Pt_1.Pt(0, y, 0), new Pt_1.Pt(0, 0, 1));
    }
    static rotate2DMatrix(cosA, sinA) {
        return new Pt_1.Group(new Pt_1.Pt(cosA, sinA, 0), new Pt_1.Pt(-sinA, cosA, 0), new Pt_1.Pt(0, 0, 1));
    }
    static shear2DMatrix(tanX, tanY) {
        return new Pt_1.Group(new Pt_1.Pt(1, tanX, 0), new Pt_1.Pt(tanY, 1, 0), new Pt_1.Pt(0, 0, 1));
    }
    static translate2DMatrix(x, y) {
        return new Pt_1.Group(new Pt_1.Pt(1, 0, 0), new Pt_1.Pt(0, 1, 0), new Pt_1.Pt(x, y, 1));
    }
    static scaleAt2DMatrix(sx, sy, at) {
        let m = Mat.scale2DMatrix(sx, sy);
        m[2][0] = -at[0] * sx + at[0];
        m[2][1] = -at[1] * sy + at[1];
        return m;
    }
    static rotateAt2DMatrix(cosA, sinA, at) {
        let m = Mat.rotate2DMatrix(cosA, sinA);
        m[2][0] = at[0] * (1 - cosA) + at[1] * sinA;
        m[2][1] = at[1] * (1 - cosA) - at[0] * sinA;
        return m;
    }
    static shearAt2DMatrix(tanX, tanY, at) {
        let m = Mat.shear2DMatrix(tanX, tanY);
        m[2][0] = -at[1] * tanY;
        m[2][1] = -at[0] * tanX;
        return m;
    }
    static reflectAt2DMatrix(p1, p2) {
        let intercept = Op_1.Line.intercept(p1, p2);
        if (intercept == undefined) {
            return [
                new Pt_1.Pt([-1, 0, 0]),
                new Pt_1.Pt([0, 1, 0]),
                new Pt_1.Pt([p1[0] + p2[0], 0, 1])
            ];
        }
        else {
            let yi = intercept.yi;
            let ang2 = Math.atan(intercept.slope) * 2;
            let cosA = Math.cos(ang2);
            let sinA = Math.sin(ang2);
            return [
                new Pt_1.Pt([cosA, sinA, 0]),
                new Pt_1.Pt([sinA, -cosA, 0]),
                new Pt_1.Pt([-yi * sinA, yi + yi * cosA, 1])
            ];
        }
    }
}
exports.Mat = Mat;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan)
Object.defineProperty(exports, "__esModule", { value: true });
const Pt_1 = __webpack_require__(0);
class Bound extends Pt_1.Group {
    constructor(...args) {
        super(...args);
        this._center = new Pt_1.Pt();
        this._size = new Pt_1.Pt();
        this._topLeft = new Pt_1.Pt();
        this._bottomRight = new Pt_1.Pt();
        this._inited = false;
        this.init();
    }
    init() {
        if (this.p1) {
            this._size = this.p1.clone();
            this._inited = true;
        }
        if (this.p1 && this.p2) {
            let a = this.p1;
            let b = this.p2;
            this.topLeft = a.$min(b);
            this._bottomRight = a.$max(b);
            this._updateSize();
        }
    }
    clone() {
        return new Bound(this._topLeft.clone(), this._bottomRight.clone());
    }
    _updateSize() {
        this._size = this._bottomRight.$subtract(this._topLeft).abs();
        this._updateCenter();
    }
    _updateCenter() {
        this._center = this._size.$multiply(0.5).add(this._topLeft);
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
        let half = this._size.$multiply(0.5);
        this._topLeft = this._center.$subtract(half);
        this._bottomRight = this._center.$add(half);
    }
    get size() { return new Pt_1.Pt(this._size); }
    set size(p) {
        this._size = new Pt_1.Pt(p);
        this._updatePosFromTop();
    }
    get center() { return new Pt_1.Pt(this._center); }
    set center(p) {
        this._center = new Pt_1.Pt(p);
        this._updatePosFromCenter();
    }
    get topLeft() { return new Pt_1.Pt(this._topLeft); }
    set topLeft(p) {
        this._topLeft = new Pt_1.Pt(p);
        this[0] = this._topLeft;
        this._updateSize();
    }
    get bottomRight() { return new Pt_1.Pt(this._bottomRight); }
    set bottomRight(p) {
        this._bottomRight = new Pt_1.Pt(p);
        this[1] = this._bottomRight;
        this._updateSize();
    }
    get width() { return (this._size.length > 0) ? this._size.x : 0; }
    set width(w) {
        this._size.x = w;
        this._updatePosFromTop();
    }
    get height() { return (this._size.length > 1) ? this._size.y : 0; }
    set height(h) {
        this._size.y = h;
        this._updatePosFromTop();
    }
    get depth() { return (this._size.length > 2) ? this._size.z : 0; }
    set depth(d) {
        this._size.z = d;
        this._updatePosFromTop();
    }
    get x() { return this.topLeft.x; }
    get y() { return this.topLeft.y; }
    get z() { return this.topLeft.z; }
    get inited() { return this._inited; }
    /**
     * If the Group elements are changed, call this function to update the Bound's properties.
     * It's preferable to change the topLeft/bottomRight etc properties instead of changing the Group array directly.
     */
    update() {
        this._topLeft = this[0];
        this._bottomRight = this[1];
        this._updateSize();
    }
    static fromBoundingRect(rect) {
        let b = new Bound(new Pt_1.Pt(rect.left || 0, rect.top || 0), new Pt_1.Pt(rect.right || 0, rect.bottom || 0));
        if (rect.width && rect.height)
            b.size = new Pt_1.Pt(rect.width, rect.height);
        return b;
    }
}
exports.Bound = Bound;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan)
Object.defineProperty(exports, "__esModule", { value: true });
const Util_1 = __webpack_require__(1);
const Op_1 = __webpack_require__(5);
const Pt_1 = __webpack_require__(0);
const LinearAlgebra_1 = __webpack_require__(2);
/**
 * A collection of helper functions for basic numeric operations
 */
class Num {
    static equals(a, b, threshold = 0.00001) {
        return Math.abs(a - b) < threshold;
    }
    static lerp(a, b, t) {
        return (1 - t) * a + t * b;
    }
    /**
     * Clamp values between min and max
     * @param val
     * @param min
     * @param max
     */
    static limitValue(val, min, max) {
        return Math.max(min, Math.min(max, val));
    }
    /**
     * Different from Num.limitValue in that the value out-of-bound will be "looped back" to the other end.
     * @param val
     * @param min
     * @param max
     */
    static boundValue(val, min, max) {
        let len = Math.abs(max - min);
        let a = val % len;
        if (a > max)
            a -= len;
        else if (a < min)
            a += len;
        return a;
    }
    static within(p, a, b) {
        return p >= Math.min(a, b) && p <= Math.max(a, b);
    }
    static randomRange(a, b = 0) {
        let r = (a > b) ? (a - b) : (b - a);
        return a + Math.random() * r;
    }
    static normalizeValue(n, a, b) {
        let min = Math.min(a, b);
        let max = Math.max(a, b);
        return (n - min) / (max - min);
    }
    static sum(pts) {
        let c = Pt_1.Pt.make(pts[0].length, 0);
        for (let i = 0, len = pts.length; i < len; i++) {
            c.add(pts[i]);
        }
        return c;
    }
    /**
     * Given a value between 0 to 1, returns a value that cycles between 0 -> 1 -> 0
     * @param t a value between 0 to 1
     * @return a value between 0 to 1
     */
    static cycle(t) {
        return (Math.sin(Math.PI * 2 * t) + 1) / 2;
    }
    static average(pts) {
        return Num.sum(pts).divide(pts.length);
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
        if (currA == currB)
            throw new Error("[currMin, currMax] must define a range that is not zero");
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
        let minPt = pts.reduce((a, p) => a.$min(p));
        let maxPt = pts.reduce((a, p) => a.$max(p));
        return new Pt_1.Group(minPt, maxPt);
    }
    static centroid(pts) {
        return Num.average(pts);
    }
    /**
     * Given an anchor Pt, rebase all Pts in this group either to or from this anchor base.
     * @param pts a Group or array of Pt
     * @param ptOrIndex an index for the Pt array, or an external Pt
     * @param direction "to" (subtract all Pt with this anchor base) or "from" (add all Pt from this anchor base)
     */
    static anchor(pts, ptOrIndex = 0, direction = "to") {
        let method = (direction == "to") ? "subtract" : "add";
        for (let i = 0, len = pts.length; i < len; i++) {
            if (typeof ptOrIndex == "number") {
                if (ptOrIndex !== i)
                    pts[i][method](pts[ptOrIndex]);
            }
            else {
                pts[i][method](ptOrIndex);
            }
        }
    }
    /**
     * Get an interpolated value between two Pts
     * @param a first Pt
     * @param b second Pt
     * @param t a ratio between 0 to 1
     * @returns interpolated point as a new Pt
     */
    static interpolate(a, b, t = 0.5) {
        let len = Math.min(a.length, b.length);
        let d = Pt_1.Pt.make(len);
        for (let i = 0; i < len; i++) {
            d[i] = a[i] * (1 - t) + b[i] * t;
        }
        return d;
    }
    /**
     * Find two Pt that are perpendicular to this Pt (2D)
     * @param axis a string such as "xy" (use Const.xy) or an array to specify index for two dimensions
     * @returns an array of two Pt that are perpendicular to this Pt
     */
    static perpendicular(pt, axis = Util_1.Const.xy) {
        let y = axis[1];
        let x = axis[0];
        let p = new Pt_1.Pt(pt);
        let pa = new Pt_1.Pt(p);
        pa[x] = -p[y];
        pa[y] = p[x];
        let pb = new Pt_1.Pt(p);
        pb[x] = p[y];
        pb[y] = -p[x];
        return new Pt_1.Group(pa, pb);
    }
    static isPerpendicular(p1, p2) {
        return new Pt_1.Pt(p1).dot(p2) === 0;
    }
    static withinBound(pt, boundPt1, boundPt2) {
        for (let i = 0, len = Math.min(pt.length, boundPt1.length, boundPt2.length); i < len; i++) {
            if (!Num.within(pt[i], boundPt1[i], boundPt2[i]))
                return false;
        }
        return true;
    }
    static scale(ps, scale, anchor) {
        let pts = (!Array.isArray(ps)) ? [ps] : ps;
        let scs = (typeof scale == "number") ? Pt_1.Pt.make(pts[0].length, scale) : scale;
        if (!anchor)
            anchor = Pt_1.Pt.make(pts[0].length, 0);
        for (let i = 0, len = pts.length; i < len; i++) {
            let p = pts[i];
            for (let k = 0, lenP = p.length; k < lenP; k++) {
                p[k] = (anchor && anchor[k]) ? anchor[k] + (p[k] - anchor[k]) * scs[k] : p[k] * scs[k];
            }
        }
        return Geom;
    }
    static rotate2D(ps, angle, anchor, axis) {
        let pts = (!Array.isArray(ps)) ? [ps] : ps;
        let fn = (anchor) ? LinearAlgebra_1.Mat.rotateAt2DMatrix : LinearAlgebra_1.Mat.rotate2DMatrix;
        if (!anchor)
            anchor = Pt_1.Pt.make(pts[0].length, 0);
        let cos = Math.cos(angle);
        let sin = Math.sin(angle);
        for (let i = 0, len = pts.length; i < len; i++) {
            let p = (axis) ? pts[i].$take(axis) : pts[i];
            p.to(LinearAlgebra_1.Mat.transform2D(p, fn(cos, sin, anchor)));
        }
        return Geom;
    }
    static shear2D(ps, scale, anchor, axis) {
        let pts = (!Array.isArray(ps)) ? [ps] : ps;
        let s = (typeof scale == "number") ? [scale, scale] : scale;
        if (!anchor)
            anchor = Pt_1.Pt.make(pts[0].length, 0);
        let fn = (anchor) ? LinearAlgebra_1.Mat.shearAt2DMatrix : LinearAlgebra_1.Mat.shear2DMatrix;
        let tanx = Math.tan(s[0]);
        let tany = Math.tan(s[1]);
        for (let i = 0, len = pts.length; i < len; i++) {
            let p = (axis) ? pts[i].$take(axis) : pts[i];
            p.to(LinearAlgebra_1.Mat.transform2D(p, fn(tanx, tany, anchor)));
        }
        return Geom;
    }
    static reflect2D(ps, line, axis) {
        let pts = (!Array.isArray(ps)) ? [ps] : ps;
        for (let i = 0, len = pts.length; i < len; i++) {
            let p = (axis) ? pts[i].$take(axis) : pts[i];
            p.to(LinearAlgebra_1.Mat.transform2D(p, LinearAlgebra_1.Mat.reflectAt2DMatrix(line[0], line[1])));
        }
        return Geom;
    }
    /**
     * Generate a sine and cosine lookup table
     * @returns an object with 2 tables (array of 360 values) and 2 functions to get sin/cos given a radian parameter. { sinTable:Float64Array, cosTable:Float64Array, sin:(rad)=>number, cos:(rad)=>number }
     */
    static cosTable() {
        let cos = new Float64Array(360);
        for (let i = 0; i < 360; i++)
            cos[i] = Math.cos(i * Math.PI / 180);
        let find = (rad) => cos[Math.floor(Geom.boundAngle(Geom.toDegree(rad)))];
        return { table: cos, cos: find };
    }
    /**
     * Generate a sine and cosine lookup table
     * @returns an object with 2 tables (array of 360 values) and 2 functions to get sin/cos given a radian parameter. { sinTable:Float64Array, cosTable:Float64Array, sin:(rad)=>number, cos:(rad)=>number }
     */
    static sinTable() {
        let sin = new Float64Array(360);
        for (let i = 0; i < 360; i++)
            sin[i] = Math.sin(i * Math.PI / 180);
        let find = (rad) => sin[Math.floor(Geom.boundAngle(Geom.toDegree(rad)))];
        return { table: sin, sin: find };
    }
}
exports.Geom = Geom;
class Shaping {
    /**
     * Linear mapping
     * @parma t a value between 0 to 1
     * @parma c the value to shape, default is 1
     */
    static linear(t, c = 1) {
        return c * t;
    }
    /**
     * Quadratic in, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/)
     * @parma t a value between 0 to 1
     * @parma c the value to shape, default is 1
    */
    static quadraticIn(t, c = 1) {
        return c * t * t;
    }
    /**
     * Quadratic out, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/)
     * @parma t a value between 0 to 1
     * @parma c the value to shape, default is 1
    */
    static quadraticOut(t, c = 1) {
        return -c * t * (t - 2);
    }
    /**
     * Quadratic in-out, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/)
     * @parma t a value between 0 to 1
     * @parma c the value to shape, default is 1
     */
    static quadraticInOut(t, c = 1) {
        let dt = t * 2;
        return (t < 0.5) ? c / 2 * t * t * 4 : -c / 2 * ((dt - 1) * (dt - 3) - 1);
    }
    /**
     * Cubic in, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/)
     * @parma t a value between 0 to 1
     * @parma c the value to shape, default is 1
     */
    static cubicIn(t, c = 1) {
        return c * t * t * t;
    }
    /**
     * Cubic out, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/)
     * @parma t a value between 0 to 1
     * @parma c the value to shape, default is 1
     */
    static cubicOut(t, c = 1) {
        let dt = t - 1;
        return c * (dt * dt * dt + 1);
    }
    /**
     * Cubic in-out, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/)
     * @parma t a value between 0 to 1
     * @parma c the value to shape, default is 1
     */
    static cubicInOut(t, c = 1) {
        let dt = t * 2;
        return (t < 0.5) ? c / 2 * dt * dt * dt : c / 2 * ((dt - 2) * (dt - 2) * (dt - 2) + 2);
    }
    /**
     * Exponential ease In, adapted from Golan Levin's [polynomial shapers](http://www.flong.com/texts/code/shapers_poly/)
     * @parma t a value between 0 to 1
     * @parma c the value to shape, default is 1
     * @parma p a value between 0 to 1 to control the curve. Default is 0.25.
     */
    static exponentialIn(t, c = 1, p = 0.25) {
        return c * Math.pow(t, 1 / p);
    }
    /**
     * Exponential ease out, adapted from Golan Levin's [polynomial shapers](http://www.flong.com/texts/code/shapers_poly/)
     * @parma t a value between 0 to 1
     * @parma c the value to shape, default is 1
     * @parma p a value between 0 to 1 to control the curve. Default is 0.25.
     */
    static exponentialOut(t, c = 1, p = 0.25) {
        return c * Math.pow(t, p);
    }
    /**
     * Sinuous in, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/)
     * @parma t a value between 0 to 1
     * @parma c the value to shape, default is 1
     */
    static sineIn(t, c = 1) {
        return -c * Math.cos(t * Util_1.Const.half_pi) + c;
    }
    /**
     * Sinuous out, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/)
     * @parma t a value between 0 to 1
     * @parma c the value to shape, default is 1
     */
    static sineOut(t, c = 1) {
        return c * Math.sin(t * Util_1.Const.half_pi);
    }
    /**
     * Sinuous in-out, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/)
     * @parma t a value between 0 to 1
     * @parma c the value to shape, default is 1
     */
    static sineInOut(t, c = 1) {
        return -c / 2 * (Math.cos(Math.PI * t) - 1);
    }
    /**
     * A faster way to approximate cosine ease in-out using Blinn-Wyvill Approximation. Adapated from Golan Levin's [polynomial shaping](http://www.flong.com/texts/code/shapers_poly/)
     * @parma t a value between 0 to 1
     * @parma c the value to shape, default is 1
     */
    static cosineApprox(t, c = 1) {
        let t2 = t * t;
        let t4 = t2 * t2;
        let t6 = t4 * t2;
        return c * (4 * t6 / 9 - 17 * t4 / 9 + 22 * t2 / 9);
    }
    /**
     * Circular in, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/)
     * @parma t a value between 0 to 1
     * @parma c the value to shape, default is 1
     */
    static circularIn(t, c = 1) {
        return -c * (Math.sqrt(1 - t * t) - 1);
    }
    /**
     * Circular out, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/)
     * @parma t a value between 0 to 1
     * @parma c the value to shape, default is 1
     */
    static circularOut(t, c = 1) {
        let dt = t - 1;
        return c * Math.sqrt(1 - dt * dt);
    }
    /**
     * Circular in-out, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/)
     * @parma t a value between 0 to 1
     * @parma c the value to shape, default is 1
     */
    static circularInOut(t, c = 1) {
        let dt = t * 2;
        return (t < 0.5) ? -c / 2 * (Math.sqrt(1 - dt * dt) - 1) : c / 2 * (Math.sqrt(1 - (dt - 2) * (dt - 2)) + 1);
    }
    /**
     * Elastic in, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/)
     * @parma t a value between 0 to 1
     * @parma c the value to shape, default is 1
     * @parma p elastic parmeter between 0 to 1. The lower the number, the more elastic it will be. Default is 0.7.
     */
    static elasticIn(t, c = 1, p = 0.7) {
        let dt = t - 1;
        let s = (p / Util_1.Const.two_pi) * 1.5707963267948966;
        return c * (-Math.pow(2, 10 * dt) * Math.sin((dt - s) * Util_1.Const.two_pi / p));
    }
    /**
     * Elastic out, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/)
     * @parma t a value between 0 to 1
     * @parma c the value to shape, default is 1
     * @parma p elastic parmeter between 0 to 1. The lower the number, the more elastic it will be. Default is 0.7.
     */
    static elasticOut(t, c = 1, p = 0.7) {
        let s = (p / Util_1.Const.two_pi) * 1.5707963267948966;
        return c * (Math.pow(2, -10 * t) * Math.sin((t - s) * Util_1.Const.two_pi / p)) + c;
    }
    /**
     * Elastic in-out, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/)
     * @parma t a value between 0 to 1
     * @parma c the value to shape, default is 1
     * @parma p elastic parmeter between 0 to 1. The lower the number, the more elastic it will be. Default is 0.6.
     */
    static elasticInOut(t, c = 1, p = 0.6) {
        let dt = t * 2;
        let s = (p / Util_1.Const.two_pi) * 1.5707963267948966;
        if (t < 0.5) {
            dt -= 1;
            return c * (-0.5 * (Math.pow(2, 10 * dt) * Math.sin((dt - s) * Util_1.Const.two_pi / p)));
        }
        else {
            dt -= 1;
            return c * (0.5 * (Math.pow(2, -10 * dt) * Math.sin((dt - s) * Util_1.Const.two_pi / p))) + c;
        }
    }
    /**
     * Bounce in, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/)
     * @parma t a value between 0 to 1
     * @parma c the value to shape, default is 1
     */
    static bounceIn(t, c = 1) {
        return c - Shaping.bounceOut((1 - t), c);
    }
    /**
     * Bounce out, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/)
     * @parma t a value between 0 to 1
     * @parma c the value to shape, default is 1
     */
    static bounceOut(t, c = 1) {
        if (t < (1 / 2.75)) {
            return c * (7.5625 * t * t);
        }
        else if (t < (2 / 2.75)) {
            t -= 1.5 / 2.75;
            return c * (7.5625 * t * t + 0.75);
        }
        else if (t < (2.5 / 2.75)) {
            t -= 2.25 / 2.75;
            return c * (7.5625 * t * t + 0.9375);
        }
        else {
            t -= 2.625 / 2.75;
            return c * (7.5625 * t * t + 0.984375);
        }
    }
    /**
     * Bounce in-out, adapted from Robert Penner's [easing functions](http://robertpenner.com/easing/)
     * @parma t a value between 0 to 1
     * @parma c the value to shape, default is 1
     */
    static bounceInOut(t, c = 1) {
        return (t < 0.5) ? Shaping.bounceIn(t * 2, c) / 2 : Shaping.bounceOut(t * 2 - 1, c) / 2 + c / 2;
    }
    /**
     * Sigmoid curve changes its shape adapted from the input value, but always returns a value between 0 to 1.
     * @parma t a value between 0 to 1
     * @parma c the value to shape, default is 1
     * @parma p the larger the value, the "steeper" the curve will be. Default is 10.
     */
    static sigmoid(t, c = 1, p = 10) {
        let d = p * (t - 0.5);
        return c / (1 + Math.exp(-d));
    }
    /**
     * The Logistic Sigmoid is a useful curve. Adapted from Golan Levin's [shaping function](http://www.flong.com/texts/code/shapers_exp/)
     * @parma t a value between 0 to 1
     * @parma c the value to shape, default is 1
     * @parma p a parameter between 0 to 1 to control the steepness of the curve. Higher is steeper. Default is 0.7.
     */
    static logSigmoid(t, c = 1, p = 0.7) {
        p = Math.max(Util_1.Const.epsilon, Math.min(1 - Util_1.Const.epsilon, p));
        p = 1 / (1 - p);
        let A = 1 / (1 + Math.exp(((t - 0.5) * p * -2)));
        let B = 1 / (1 + Math.exp(p));
        let C = 1 / (1 + Math.exp(-p));
        return c * (A - B) / (C - B);
    }
    /**
     * An exponential seat curve. Adapted from Golan Levin's [shaping functions](http://www.flong.com/texts/code/shapers_exp/)
     * @parma t a value between 0 to 1
     * @parma c the value to shape, default is 1
     * @parma p a parameter between 0 to 1 to control the steepness of the curve. Higher is steeper. Default is 0.5.
     */
    static seat(t, c = 1, p = 0.5) {
        if ((t < 0.5)) {
            return c * (Math.pow(2 * t, 1 - p)) / 2;
        }
        else {
            return c * (1 - (Math.pow(2 * (1 - t), 1 - p)) / 2);
        }
    }
    /**
     * Quadratic bezier curve. Adapted from Golan Levin's [shaping functions](http://www.flong.com/texts/code/shapers_exp/)
     * @parma t a value between 0 to 1
     * @parma c the value to shape, default is 1
     * @parma p1 a Pt object specifying the first control Pt, or a value specifying the control Pt's x position (its y position will default to 0.5). Default is `Pt(0.95, 0.95)
     */
    static quadraticBezier(t, c = 1, p = [0.05, 0.95]) {
        let a = (typeof p != "number") ? p[0] : p;
        let b = (typeof p != "number") ? p[1] : 0.5;
        let om2a = 1 - 2 * a;
        if (om2a === 0) {
            om2a = Util_1.Const.epsilon;
        }
        let d = (Math.sqrt(a * a + om2a * t) - a) / om2a;
        return c * ((1 - 2 * b) * (d * d) + (2 * b) * d);
    }
    /**
     * Cubic bezier curve. This reuses the bezier functions in Curve class.
     * @parma t a value between 0 to 1
     * @parma c the value to shape, default is 1
     * @parma p1` a Pt object specifying the first control Pt. Default is `Pt(0.1, 0.7).
     * @parma p2` a Pt object specifying the second control Pt. Default is `Pt(0.9, 0.2).
     */
    static cubicBezier(t, c = 1, p1 = [0.1, 0.7], p2 = [0.9, 0.2]) {
        let curve = new Pt_1.Group(new Pt_1.Pt(0, 0), new Pt_1.Pt(p1), new Pt_1.Pt(p2), new Pt_1.Pt(1, 1));
        return c * Op_1.Curve.bezierStep(new Pt_1.Pt(t, t * t, t * t * t), Op_1.Curve.controlPoints(curve)).y;
    }
    /**
     * Give a Pt, draw a quadratic curve that will pass through that Pt as closely as possible. Adapted from Golan Levin's [shaping functions](http://www.flong.com/texts/code/shapers_poly/)
     * @parma t a value between 0 to 1
     * @parma c the value to shape, default is 1
     * @parma p1` a Pt object specifying the Pt to pass through. Default is `Pt(0.2, 0.35)
     */
    static quadraticTarget(t, c = 1, p1 = [0.2, 0.35]) {
        let a = Math.min(1 - Util_1.Const.epsilon, Math.max(Util_1.Const.epsilon, p1[0]));
        let b = Math.min(1, Math.max(0, p1[1]));
        let A = (1 - b) / (1 - a) - (b / a);
        let B = (A * (a * a) - b) / a;
        let y = A * (t * t) - B * t;
        return c * Math.min(1, Math.max(0, y));
    }
    /**
     * Step function is a simple jump from 0 to 1 at a specific Pt in time
     * @parma t a value between 0 to 1
     * @parma c the value to shape, default is 1
     * @parma p usually a value between 0 to 1, which specify the Pt to "jump". Default is 0.5 which is in the middle.
     */
    static cliff(t, c = 1, p = 0.5) {
        return (t > p) ? c : 0;
    }
    /**
     * Convert any shaping functions into a series of steps
     * @parma fn the original shaping function
     * @parma steps the number of steps
     * @parma t a value between 0 to 1
     * @parma c the value to shape, default is 1
     * @parma args optional paramters to pass to original function
     */
    static step(fn, steps, t, c, ...args) {
        let s = 1 / steps;
        let tt = Math.floor(t / s) * s;
        return fn(tt, c, ...args);
    }
}
exports.Shaping = Shaping;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan)
Object.defineProperty(exports, "__esModule", { value: true });
const Util_1 = __webpack_require__(1);
const Num_1 = __webpack_require__(4);
const Pt_1 = __webpack_require__(0);
const LinearAlgebra_1 = __webpack_require__(2);
let _errorLength = (obj, param = "expected") => Util_1.Util.warn(obj, "Group's length is less than " + param);
let _errorOutofBound = (obj, param = "") => Util_1.Util.warn(obj, `Index ${param} is out of bound in Group`);
class Line {
    static slope(p1, p2) {
        return (p2[0] - p1[0] === 0) ? undefined : (p2[1] - p1[1]) / (p2[0] - p1[0]);
    }
    static intercept(p1, p2) {
        if (p2[0] - p1[0] === 0) {
            return undefined;
        }
        else {
            let m = (p2[1] - p1[1]) / (p2[0] - p1[0]);
            let c = p1[1] - m * p1[0];
            return { slope: m, yi: c, xi: (m === 0) ? undefined : -c / m };
        }
    }
    static collinear(p1, p2, p3) {
        // Use cross product method
        let a = new Pt_1.Pt(0, 0, 0).to(p2).$subtract(p1);
        let b = new Pt_1.Pt(0, 0, 0).to(p1).$subtract(p3);
        return a.$cross(b).equals(new Pt_1.Pt(0, 0, 0));
    }
    static magnitude(line) {
        return (line.length >= 2) ? line[1].$subtract(line[0]).magnitude() : 0;
    }
    /**
     * Find a Pt on a line that is perpendicular (shortest distance) to a target Pt
     * @param pt a target Pt
     * @param ln a group of Pts that defines a line
     * @param asProjection if true, this returns the projection vector instead. Default is false.
     * @returns a Pt on the line that is perpendicular to the target Pt, or a projection vector if `asProjection` is true.
     */
    static perpendicularFromPt(line, pt, asProjection = false) {
        let a = line[0].$subtract(line[1]);
        let b = line[1].$subtract(pt);
        let proj = b.$subtract(a.$project(b));
        return (asProjection) ? proj : proj.$add(pt);
    }
    static distanceFromPt(line, pt, asProjection = false) {
        return Line.perpendicularFromPt(line, pt, true).magnitude();
    }
    static intersectRay2D(la, lb) {
        let a = Line.intercept(la[0], la[1]);
        let b = Line.intercept(lb[0], lb[1]);
        let pa = la[0];
        let pb = lb[0];
        if (a == undefined) {
            if (b == undefined)
                return undefined;
            // one of them is vertical line, while the other is not, so they will intersect
            let y1 = -b.slope * (pb[0] - pa[0]) + pb[1]; // -slope * x + y
            return new Pt_1.Pt(pa[0], y1);
        }
        else {
            // diff slope, or b slope is vertical line
            if (b == undefined) {
                let y1 = -a.slope * (pa[0] - pb[0]) + pa[1];
                return new Pt_1.Pt(pb[0], y1);
            }
            else if (b.slope != a.slope) {
                let px = (a.slope * pa[0] - b.slope * pb[0] + pb[1] - pa[1]) / (a.slope - b.slope);
                let py = a.slope * (px - pa[0]) + pa[1];
                return new Pt_1.Pt(px, py);
            }
            else {
                if (a.yi == b.yi) {
                    return new Pt_1.Pt(pa[0], pa[1]);
                }
                else {
                    return undefined;
                }
            }
        }
    }
    static intersectLine2D(la, lb) {
        let pt = Line.intersectRay2D(la, lb);
        return (pt && Num_1.Geom.withinBound(pt, la[0], la[1]) && Num_1.Geom.withinBound(pt, lb[0], lb[1])) ? pt : undefined;
    }
    static intersectLineWithRay2D(line, ray) {
        let pt = Line.intersectRay2D(line, ray);
        return (pt && Num_1.Geom.withinBound(pt, line[0], line[1])) ? pt : undefined;
    }
    static intersectPolygon2D(lineOrRay, poly, sourceIsRay = false) {
        let fn = sourceIsRay ? Line.intersectLineWithRay2D : Line.intersectLine2D;
        let pts = new Pt_1.Group();
        for (let i = 0, len = poly.length; i < len; i++) {
            let d = fn(poly[i], lineOrRay);
            if (d)
                pts.push(d);
        }
        return (pts.length > 0) ? pts : undefined;
    }
    /**
     * Get two intersection Pts on a standard xy grid
     * @param ray a ray specified by 2 Pts
     * @param gridPt a Pt on the grid
     * @returns a group of two intersecting Pts. The first one is horizontal intersection and the second one is vertical intersection.
     */
    static intersectGridWithRay2D(ray, gridPt) {
        let t = Line.intercept(new Pt_1.Pt(ray[0]).subtract(gridPt), new Pt_1.Pt(ray[1]).subtract(gridPt));
        let g = new Pt_1.Group();
        if (t && t.xi)
            g.push(new Pt_1.Pt(gridPt[0] + t.xi, gridPt[1]));
        if (t && t.yi)
            g.push(new Pt_1.Pt(gridPt[0], gridPt[1] + t.yi));
        return g;
    }
    static intersectGridWithLine2D(line, gridPt) {
        let g = Line.intersectGridWithRay2D(line, gridPt);
        let gg = new Pt_1.Group();
        for (let i = 0, len = g.length; i < len; i++) {
            if (Num_1.Geom.withinBound(g[i], line[0], line[1]))
                gg.push(g[i]);
        }
        return gg;
    }
    /**
     * Quick way to check rectangle intersection.
     * For more optimized implementation, store the rectangle's sides separately (eg, `Rectangle.sides()`) and use `Polygon.intersect2D()`.
     * @param line a Group representing a line
     * @param rect a Group representing a rectangle
     */
    static intersectRect2D(line, rect) {
        return Rectangle.intersectRect2D(Line.toRect(line), rect);
    }
    static subpoints(line, num) {
        let pts = new Pt_1.Group();
        for (let i = 1; i <= num; i++) {
            pts.push(Num_1.Geom.interpolate(line[0], line[1], i / (num + 1)));
        }
        return pts;
    }
    static toRect(line) {
        return new Pt_1.Group(line[0].$min(line[1]), line[0].$max(line[1]));
    }
}
exports.Line = Line;
class Rectangle {
    static from(topLeft, widthOrSize, height) {
        return Rectangle.fromTopLeft(topLeft, widthOrSize, height);
    }
    static fromTopLeft(topLeft, widthOrSize, height) {
        let size = (typeof widthOrSize == "number") ? [widthOrSize, (height || widthOrSize)] : widthOrSize;
        return new Pt_1.Group(new Pt_1.Pt(topLeft), new Pt_1.Pt(topLeft).add(size));
    }
    static fromCenter(center, widthOrSize, height) {
        let half = (typeof widthOrSize == "number") ? [widthOrSize / 2, (height || widthOrSize) / 2] : new Pt_1.Pt(widthOrSize).divide;
        return new Pt_1.Group(new Pt_1.Pt(center).subtract(half), new Pt_1.Pt(center).add(half));
    }
    static toCircle(pts) {
        return Circle.fromRect(pts);
    }
    static size(pts) {
        return pts[0].$max(pts[1]).subtract(pts[0].$min(pts[1]));
    }
    static center(pts) {
        let min = pts[0].$min(pts[1]);
        let max = pts[0].$max(pts[1]);
        return min.add(max.$subtract(min).divide(2));
    }
    static corners(rect) {
        let p0 = rect[0].$min(rect[1]);
        let p2 = rect[0].$max(rect[1]);
        return new Pt_1.Group(p0, new Pt_1.Pt(p2.x, p0.y), p2, new Pt_1.Pt(p0.x, p2.y));
    }
    static sides(rect) {
        let [p0, p1, p2, p3] = Rectangle.corners(rect);
        return [
            new Pt_1.Group(p0, p1), new Pt_1.Group(p1, p2),
            new Pt_1.Group(p2, p3), new Pt_1.Group(p3, p0)
        ];
    }
    static lines(rect) {
        return Rectangle.sides(rect);
    }
    static union(rects) {
        let merged = Util_1.Util.flatten(rects, false);
        let min = Pt_1.Pt.make(2, Number.MAX_VALUE);
        let max = Pt_1.Pt.make(2, Number.MIN_VALUE);
        // calculate min max in a single pass
        for (let i = 0, len = merged.length; i < len; i++) {
            for (let k = 0; k < 2; k++) {
                min[k] = Math.min(min[k], merged[i][k]);
                max[k] = Math.max(max[k], merged[i][k]);
            }
        }
        return new Pt_1.Group(min, max);
    }
    static polygon(rect) {
        let corners = Rectangle.corners(rect);
        corners.push(corners[0].clone());
        return corners;
    }
    static quadrants(rect) {
        let corners = Rectangle.corners(rect);
        let center = Num_1.Geom.interpolate(rect[0], rect[1], 0.5);
        return corners.map((c) => new Pt_1.Group(c, center.clone()));
    }
    static withinBound(rect, pt) {
        return Num_1.Geom.withinBound(pt, rect[0], rect[1]);
    }
    static intersectBound2D(rect1, rect2) {
        let pts = Rectangle.corners(rect1);
        for (let i = 0, len = pts.length; i < len; i++) {
            if (Num_1.Geom.withinBound(pts[i], rect2[0], rect2[1]))
                return true;
        }
        return false;
    }
    /**
     * Quick way to check rectangle intersection.
     * For more optimized implementation, store the rectangle's sides separately (eg, `Rectangle.sides()`) and use `Polygon.intersect2D()`.
     * @param rect1 a Group representing a rectangle
     * @param rect2 a Group representing a rectangle
     */
    static intersectRect2D(rect1, rect2) {
        return Util_1.Util.flatten(Polygon.intersect2D(Rectangle.sides(rect1), Rectangle.sides(rect2)));
    }
}
exports.Rectangle = Rectangle;
class Circle {
    static fromRect(pts, enclose = false) {
        let r = 0;
        let min = r = Rectangle.size(pts).minValue().value / 2;
        if (enclose) {
            let max = Rectangle.size(pts).maxValue().value / 2;
            r = Math.sqrt(min * min + max * max);
        }
        else {
            r = min;
        }
        return new Pt_1.Group(Rectangle.center(pts), new Pt_1.Pt(r, r));
    }
    static fromPt(pt, radius) {
        return new Pt_1.Group(pt, new Pt_1.Pt(radius, radius));
    }
    static withinBound(pts, pt) {
        let d = pts[0].$subtract(pt);
        return d.dot(d) < pts[1].x * pts[1].x;
    }
    static intersectRay2D(pts, ray) {
        let d = ray[0].$subtract(ray[1]);
        let f = pts[0].$subtract(ray[0]);
        let a = d.dot(d);
        let b = f.dot(d);
        let c = f.dot(f) - pts[1].x * pts[1].x;
        let p = b / a;
        let q = c / a;
        let disc = p * p - q; // discriminant
        if (disc < 0) {
            return new Pt_1.Group();
        }
        else {
            let discSqrt = Math.sqrt(disc);
            let t1 = -p + discSqrt;
            let p1 = ray[0].$subtract(d.$multiply(t1));
            if (disc === 0)
                return new Pt_1.Group(p1);
            let t2 = -p - discSqrt;
            let p2 = ray[0].$subtract(d.$multiply(t2));
            return new Pt_1.Group(p1, p2);
        }
    }
    static intersectLine2D(pts, line) {
        let ps = Circle.intersectRay2D(pts, line);
        let g = new Pt_1.Group();
        if (ps.length > 0) {
            for (let i = 0, len = ps.length; i < len; i++) {
                if (Rectangle.withinBound(line, ps[i]))
                    g.push(ps[i]);
            }
        }
        return g;
    }
    static intersectCircle2D(pts, circle) {
        let dv = circle[0].$subtract(pts[0]);
        let dr2 = dv.magnitudeSq();
        let dr = Math.sqrt(dr2);
        let ar = pts[1].x;
        let br = circle[1].x;
        let ar2 = ar * ar;
        let br2 = br * br;
        if (dr > ar + br) {
            return new Pt_1.Group();
        }
        else if (dr < Math.abs(ar - br)) {
            return new Pt_1.Group(pts[0].clone());
        }
        else {
            let a = (ar2 - br2 + dr2) / (2 * dr);
            let h = Math.sqrt(ar2 - a * a);
            let p = dv.$multiply(a / dr).add(pts[0]);
            return new Pt_1.Group(new Pt_1.Pt(p.x + h * dv.y / dr, p.y - h * dv.x / dr), new Pt_1.Pt(p.x - h * dv.y / dr, p.y + h * dv.x / dr));
        }
    }
    /**
     * Quick way to check rectangle intersection.
     * For more optimized implementation, store the rectangle's sides separately (eg, `Rectangle.sides()`) and use `Polygon.intersect2D()`.
     * @param pts a Group representing a circle
     * @param rect a Group representing a rectangle
     */
    static intersectRect2D(pts, rect) {
        let sides = Rectangle.sides(rect);
        let g = [];
        for (let i = 0, len = sides.length; i < len; i++) {
            let ps = Circle.intersectLine2D(pts, sides[i]);
            if (ps.length > 0)
                g.push(ps);
        }
        return Util_1.Util.flatten(g);
    }
    static toRect(pts) {
        let r = pts[1][0];
        return new Pt_1.Group(pts[0].$subtract(r), pts[0].$add(r));
    }
}
exports.Circle = Circle;
class Triangle {
    /**
     * Get the medial, which is an inner triangle formed by connecting the midpoints of this triangle's sides
     * @param pts a Group of Pts
     * @returns a Group representing a medial triangle
     */
    static medial(pts) {
        if (pts.length < 3)
            return _errorLength(new Pt_1.Group(), 3);
        return Polygon.midpoints(pts, true);
    }
    /**
     * Given a point of the triangle, the opposite side is the side which the point doesn't touch.
     * @param pts a Group of Pts
     * @param index a Pt on the triangle group
     * @returns a Group that represents a line of the opposite side
     */
    static oppositeSide(pts, index) {
        if (pts.length < 3)
            return _errorLength(new Pt_1.Group(), 3);
        if (index === 0) {
            return Pt_1.Group.fromGroup([pts[1], pts[2]]);
        }
        else if (index === 1) {
            return Pt_1.Group.fromGroup([pts[0], pts[2]]);
        }
        else {
            return Pt_1.Group.fromGroup([pts[0], pts[1]]);
        }
    }
    /**
     * Get a triangle's altitude, which is a line from a triangle's point to its opposite side, and perpendicular to its opposite side.
     * @param pts a Group of Pts
     * @param index a Pt on the triangle group
     * @returns a Group that represents the altitude line
     */
    static altitude(pts, index) {
        let opp = Triangle.oppositeSide(pts, index);
        if (opp.length > 1) {
            return new Pt_1.Group(pts[index], Line.perpendicularFromPt(opp, pts[index]));
        }
        else {
            return new Pt_1.Group();
        }
    }
    /**
     * Get orthocenter, which is the intersection point of a triangle's 3 altitudes (the 3 lines that are perpendicular to its 3 opposite sides).
     * @param pts a Group of Pts
     * @returns the orthocenter as a Pt
     */
    static orthocenter(pts) {
        if (pts.length < 3)
            return _errorLength(undefined, 3);
        let a = Triangle.altitude(pts, 0);
        let b = Triangle.altitude(pts, 1);
        return Line.intersectRay2D(a, b);
    }
    /**
     * Get incenter, which is the center point of its inner circle, and also the intersection point of its 3 angle bisector lines (each of which cuts one of the 3 angles in half).
     * @param pts a Group of Pts
     * @returns the incenter as a Pt
     */
    static incenter(pts) {
        if (pts.length < 3)
            return _errorLength(undefined, 3);
        let a = Polygon.bisector(pts, 0).add(pts[0]);
        let b = Polygon.bisector(pts, 1).add(pts[1]);
        return Line.intersectRay2D(new Pt_1.Group(pts[0], a), new Pt_1.Group(pts[1], b));
    }
    /**
     * Get an interior circle, which is the largest circle completed enclosed by this triangle
     * @param pts a Group of Pts
     * @param center Optional parameter if the incenter is already known. Otherwise, leave it empty and the incenter will be calculated
     */
    static incircle(pts, center) {
        let c = (center) ? center : Triangle.incenter(pts);
        let area = Polygon.area(pts);
        let perim = Polygon.perimeter(pts, true);
        let r = 2 * area / perim.total;
        return Circle.fromPt(c, r);
    }
    /**
     * Get circumcenter, which is the intersection point of its 3 perpendicular bisectors lines ( each of which divides a side in half and is perpendicular to the side)
     * @param pts a Group of Pts
     * @returns the circumcenter as a Pt
     */
    static circumcenter(pts) {
        let md = Triangle.medial(pts);
        let a = [md[0], Num_1.Geom.perpendicular(pts[0].$subtract(md[0])).p1.$add(md[0])];
        let b = [md[1], Num_1.Geom.perpendicular(pts[1].$subtract(md[1])).p1.$add(md[1])];
        return Line.intersectRay2D(a, b);
    }
    /**
     * Get circumcenter, which is the intersection point of its 3 perpendicular bisectors lines ( each of which divides a side in half and is perpendicular to the side)
     * @param pts a Group of Pts
     * @param center Optional parameter if the circumcenter is already known. Otherwise, leave it empty and the circumcenter will be calculated
     */
    static circumcircle(pts, center) {
        let c = (center) ? center : Triangle.circumcenter(pts);
        let r = pts[0].$subtract(c).magnitude();
        return Circle.fromPt(c, r);
    }
}
exports.Triangle = Triangle;
class Polygon {
    static centroid(pts) {
        return Num_1.Geom.centroid(pts);
    }
    /**
     * Get the line segments in this polygon
     * @param pts a Group of Pts
     * @param closePath a boolean to specify whether the polygon should be closed (ie, whether the final segment should be counted).
     * @returns an array of Groups which has 2 Pts in each group
     */
    static lines(pts, closePath = false) {
        if (pts.length < 2)
            return _errorLength(new Pt_1.Group(), 2);
        let sp = Util_1.Util.split(pts, 2, 1);
        if (closePath)
            sp.push(new Pt_1.Group(pts[pts.length - 1], pts[0]));
        return sp.map((g) => Pt_1.Group.fromGroup(g));
    }
    /**
     * Get a new polygon group that is derived from midpoints in this polygon
     * @param pts a Group of Pts
     * @param closePath a boolean to specify whether the polygon should be closed (ie, whether the final segment should be counted).
     * @param t a value between 0 to 1 for interpolation. Default to 0.5 which will get the middle point.
     */
    static midpoints(pts, closePath = false, t = 0.5) {
        if (pts.length < 2)
            return _errorLength(new Pt_1.Group(), 2);
        let sides = Polygon.lines(pts, closePath);
        let mids = sides.map((s) => Num_1.Geom.interpolate(s[0], s[1], t));
        return Pt_1.Group.fromGroup(mids);
    }
    /**
     * Given a Pt in the polygon group, the adjacent sides are the two sides which the Pt touches.
     * @param pts a group of Pts
     * @param index the target Pt
     * @param closePath a boolean to specify whether the polygon should be closed (ie, whether the final segment should be counted).
     */
    static adjacentSides(pts, index, closePath = false) {
        if (pts.length < 2)
            return _errorLength(new Pt_1.Group(), 2);
        if (index < 0 || index >= pts.length)
            return _errorOutofBound(new Pt_1.Group(), index);
        let gs = [];
        let left = index - 1;
        if (closePath && left < 0)
            left = pts.length - 1;
        if (left >= 0)
            gs.push(new Pt_1.Group(pts[index], pts[left]));
        let right = index + 1;
        if (closePath && right > pts.length - 1)
            right = 0;
        if (right <= pts.length - 1)
            gs.push(new Pt_1.Group(pts[index], pts[right]));
        return gs;
    }
    /**
     * Get a bisector which is a line that split between two sides of a polygon equally.
     * @param pts a group of Pts
     * @param index the Pt in the polygon to bisect from
     * @param closePath a boolean to specify whether the polygon should be closed (ie, whether the final segment should be counted).
     * @returns a bisector Pt that's a normalized unit vector
     */
    static bisector(pts, index) {
        let sides = Polygon.adjacentSides(pts, index, true);
        if (sides.length >= 2) {
            let a = sides[0][1].$subtract(sides[0][0]).unit();
            let b = sides[1][1].$subtract(sides[1][0]).unit();
            return a.add(b).divide(2);
        }
        else {
            return undefined;
        }
    }
    /**
     * Find the perimeter of this polygon, ie, the lengths of its sides.
     * @param pts a group of Pts
     * @param closePath a boolean to specify whether the polygon should be closed (ie, whether the final segment should be counted).
     * @returns an object with `total` length, and `segments` which is a Pt that stores each segment's length
     */
    static perimeter(pts, closePath = false) {
        if (pts.length < 2)
            return _errorLength(new Pt_1.Group(), 2);
        let lines = Polygon.lines(pts, closePath);
        let mag = 0;
        let p = Pt_1.Pt.make(lines.length, 0);
        for (let i = 0, len = lines.length; i < len; i++) {
            let m = Line.magnitude(lines[i]);
            mag += m;
            p[i] = m;
        }
        return {
            total: mag,
            segments: p
        };
    }
    /**
     * Find the area of a *convex* polygon.
     * @param pts a group of Pts
     */
    static area(pts) {
        if (pts.length < 3)
            return _errorLength(new Pt_1.Group(), 3);
        // determinant
        let det = (a, b) => a[0] * b[1] - a[1] * b[0];
        let area = 0;
        for (let i = 0, len = pts.length; i < len; i++) {
            if (i < pts.length - 1) {
                area += det(pts[i], pts[i + 1]);
            }
            else {
                area += det(pts[i], pts[0]);
            }
        }
        return Math.abs(area / 2);
    }
    /**
     * Get a convex hull of the point set using Melkman's algorithm
     * @param pts a group of Pt
     * @param sorted a boolean value to indicate if the group is pre-sorted by x position. Default is false.
     * @returns a group of Pt that defines the convex hull polygon
     */
    static convexHull(pts, sorted = false) {
        if (pts.length < 3)
            return _errorLength(new Pt_1.Group(), 3);
        if (!sorted) {
            pts = pts.slice();
            pts.sort((a, b) => a.x - b.x);
        }
        // check if is on left of ray a-b
        let left = (a, b, pt) => (b.x - a.x) * (pt.y - a.y) - (pt.x - a.x) * (b.y - a.y) > 0;
        // double end queue
        let dq = new Pt_1.Group();
        // first 3 pt
        if (left(pts[0], pts[1], pts[2])) {
            dq.push(pts[0], pts[1]);
        }
        else {
            dq.push(pts[1], pts[0]);
        }
        dq.unshift(pts[0]);
        dq.push(pts[2]);
        // remaining pts
        let i = 3;
        while (i < pts.length) {
            let pt = pts[i];
            if (left(pt, dq[0], dq[1]) && left(dq[dq.length - 2], dq[dq.length - 1], pt)) {
                i++;
                continue;
            }
            while (!left(dq[dq.length - 2], dq[dq.length - 1], pt))
                dq.pop();
            dq.push(pt);
            while (!left(dq[0], dq[1], pt))
                dq.shift();
            dq.unshift(pt);
            i++;
        }
        return dq;
    }
    static intersect2D(poly, linesOrRays, sourceIsRay = false) {
        let groups = [];
        for (let i = 0, len = linesOrRays.length; i < len; i++) {
            let _ip = Line.intersectPolygon2D(linesOrRays[i], poly, sourceIsRay);
            if (_ip)
                groups.push(_ip);
        }
        return groups;
    }
    static network(pts, originIndex = 0) {
        let g = [];
        for (let i = 0, len = pts.length; i < len; i++) {
            if (i != originIndex)
                g.push(new Pt_1.Group(pts[originIndex], pts[i]));
        }
        return g;
    }
    /**
     * Given a target Pt, find a Pt in a Group that's nearest to it.
     * @param pts a Group of Pt
     * @param pt Pt to check
     */
    static nearestPt(pts, pt) {
        let _near = Number.MAX_VALUE;
        let _item = -1;
        for (let i = 0, len = pts.length; i < len; i++) {
            let d = pts[i].$subtract(pt).magnitudeSq();
            if (d < _near) {
                _near = d;
                _item = i;
            }
        }
        return (_item >= 0) ? pts[_item] : undefined;
    }
    /**
     * Get a bounding box for each polygon group, as well as a union bounding-box for all groups
     * @param polys an array of Groups, or an array of Pt arrays
     */
    static toRects(poly) {
        let boxes = poly.map((g) => Num_1.Geom.boundingBox(g));
        let merged = Util_1.Util.flatten(boxes, false);
        boxes.unshift(Num_1.Geom.boundingBox(merged));
        return boxes;
    }
}
exports.Polygon = Polygon;
class Curve {
    /**
     * Get a precalculated coefficients per step
     * @param steps number of steps
     */
    static getSteps(steps) {
        let ts = new Pt_1.Group();
        for (let i = 0; i <= steps; i++) {
            let t = i / steps;
            ts.push(new Pt_1.Pt(t * t * t, t * t, t, 1));
        }
        return ts;
    }
    /**
     * Given an index for the starting position in a Pt group, get the control and/or end points of a curve segment
     * @param pts a group of Pt
     * @param index start index in `pts` array. Default is 0.
     * @param copyStart an optional boolean value to indicate if the start index should be used twice. Default is false.
     * @returns a group of 4 Pts
     */
    static controlPoints(pts, index = 0, copyStart = false) {
        if (index > pts.length - 1)
            return new Pt_1.Group();
        let _index = (i) => (i < pts.length - 1) ? i : pts.length - 1;
        let p0 = pts[index];
        index = (copyStart) ? index : index + 1;
        // get points based on index
        return new Pt_1.Group(p0, pts[_index(index++)], pts[_index(index++)], pts[_index(index++)]);
    }
    /**
     * Calulcate weighted sum to get the interpolated points
     * @param ctrls anchors
     * @param params parameters
     */
    static _calcPt(ctrls, params) {
        let x = ctrls.reduce((a, c, i) => a + c.x * params[i], 0);
        let y = ctrls.reduce((a, c, i) => a + c.y * params[i], 0);
        if (ctrls[0].length > 2) {
            let z = ctrls.reduce((a, c, i) => a + c.z * params[i], 0);
            return new Pt_1.Pt(x, y, z);
        }
        return new Pt_1.Pt(x, y);
    }
    /**
     * Create a Catmull-Rom curve. Catmull-Rom is a kind of Cardinal curve with smooth-looking curve.
     * @param pts a group of anchor Pt
     * @param steps the number of line segments per curve. Defaults to 10 steps.
     * @returns a curve as a group of interpolated Pt
     */
    static catmullRom(pts, steps = 10) {
        if (pts.length < 2)
            return new Pt_1.Group();
        let ps = new Pt_1.Group();
        let ts = Curve.getSteps(steps);
        // use first point twice
        let c = Curve.controlPoints(pts, 0, true);
        for (let i = 0; i <= steps; i++) {
            ps.push(Curve.catmullRomStep(ts[i], c));
        }
        let k = 0;
        while (k < pts.length - 2) {
            let c = Curve.controlPoints(pts, k);
            if (c.length > 0) {
                for (let i = 0; i <= steps; i++) {
                    ps.push(Curve.catmullRomStep(ts[i], c));
                }
                k++;
            }
        }
        return ps;
    }
    /**
     * Interpolate to get a point on Catmull-Rom curve
     * @param step the coefficients [t*t*t, t*t, t, 1]
     * @param ctrls a group of anchor Pts
     * @return an interpolated Pt on the curve
     */
    static catmullRomStep(step, ctrls) {
        /*
        * Basis Matrix (http://mrl.nyu.edu/~perlin/courses/fall2002/hw/12.html)
        * [-0.5,  1.5, -1.5, 0.5],
        * [ 1  , -2.5,  2  ,-0.5],
        * [-0.5,  0  ,  0.5, 0  ],
        * [ 0  ,  1  ,  0  , 0  ]
        */
        let m = new Pt_1.Group(new Pt_1.Pt(-0.5, 1, -0.5, 0), new Pt_1.Pt(1.5, -2.5, 0, 1), new Pt_1.Pt(-1.5, 2, 0.5, 0), new Pt_1.Pt(0.5, -0.5, 0, 0));
        return Curve._calcPt(ctrls, LinearAlgebra_1.Mat.multiply([step], m, true)[0]);
    }
    /**
     * Create a Cardinal spline curve
     * @param pts a group of anchor Pt
     * @param steps the number of line segments per curve. Defaults to 10 steps.
     * @param tension optional value between 0 to 1 to specify a "tension". Default to 0.5 which is the tension for Catmull-Rom curve.
     * @returns a curve as a group of interpolated Pt
     */
    static cardinal(pts, steps = 10, tension = 0.5) {
        if (pts.length < 2)
            return new Pt_1.Group();
        let ps = new Pt_1.Group();
        let ts = Curve.getSteps(steps);
        // use first point twice
        let c = Curve.controlPoints(pts, 0, true);
        for (let i = 0; i <= steps; i++) {
            ps.push(Curve.cardinalStep(ts[i], c, tension));
        }
        let k = 0;
        while (k < pts.length - 2) {
            let c = Curve.controlPoints(pts, k);
            if (c.length > 0) {
                for (let i = 0; i <= steps; i++) {
                    ps.push(Curve.cardinalStep(ts[i], c, tension));
                }
                k++;
            }
        }
        return ps;
    }
    /**
     * Interpolate to get a point on Catmull-Rom curve
     * @param step the coefficients [t*t*t, t*t, t, 1]
     * @param ctrls a group of anchor Pts
     * @param tension optional value between 0 to 1 to specify a "tension". Default to 0.5 which is the tension for Catmull-Rom curve
     * @return an interpolated Pt on the curve
     */
    static cardinalStep(step, ctrls, tension = 0.5) {
        /*
        * Basis Matrix (http://algorithmist.wordpress.com/2009/10/06/cardinal-splines-part-4/)
        * [ -s  2-s  s-2   s ]
        * [ 2s  s-3  3-2s -s ]
        * [ -s   0    s    0 ]
        * [  0   1    0    0 ]
        */
        let m = new Pt_1.Group(new Pt_1.Pt(-1, 2, -1, 0), new Pt_1.Pt(-1, 1, 0, 0), new Pt_1.Pt(1, -2, 1, 0), new Pt_1.Pt(1, -1, 0, 0));
        let h = LinearAlgebra_1.Mat.multiply([step], m, true)[0].multiply(tension);
        let h2 = (2 * step[0] - 3 * step[1] + 1);
        let h3 = -2 * step[0] + 3 * step[1];
        let pt = Curve._calcPt(ctrls, h);
        pt.x += h2 * ctrls[1].x + h3 * ctrls[2].x;
        pt.y += h2 * ctrls[1].y + h3 * ctrls[2].y;
        if (pt.length > 2)
            pt.z += h2 * ctrls[1].z + h3 * ctrls[2].z;
        return pt;
    }
    /**
     * Create a Bezier curve. In a cubic bezier curve, the first and 4th anchors are end-points, and 2nd and 3rd anchors are control-points.
     * @param pts a group of anchor Pt
     * @param steps the number of line segments per curve. Defaults to 10 steps.
     * @returns a curve as a group of interpolated Pt
     */
    static bezier(pts, steps = 10) {
        if (pts.length < 4)
            return new Pt_1.Group();
        let ps = new Pt_1.Group();
        let ts = Curve.getSteps(steps);
        let k = 0;
        while (k < pts.length - 3) {
            let c = Curve.controlPoints(pts, k);
            if (c.length > 0) {
                for (let i = 0; i <= steps; i++) {
                    ps.push(Curve.bezierStep(ts[i], c));
                }
                // go to the next set of point, but assume current end pt is next start pt
                k += 3;
            }
        }
        return ps;
    }
    /**
     * Interpolate to get a point on a cubic Bezier curve
     * @param step the coefficients [t*t*t, t*t, t, 1]
     * @param ctrls a group of anchor Pts
     * @return an interpolated Pt on the curve
     */
    static bezierStep(step, ctrls) {
        /*
        * Bezier basis matrix
        * [ -1,  3, -3,  1 ]
        * [  3, -6,  3,  0 ]
        * [ -3,  3,  0,  0 ]
        * [  1,  0,  0,  0 ]
        */
        let m = new Pt_1.Group(new Pt_1.Pt(-1, 3, -3, 1), new Pt_1.Pt(3, -6, 3, 0), new Pt_1.Pt(-3, 3, 0, 0), new Pt_1.Pt(1, 0, 0, 0));
        return Curve._calcPt(ctrls, LinearAlgebra_1.Mat.multiply([step], m, true)[0]);
    }
    /**
     * Create a B-spline curve
     * @param pts a group of anchor Pt
     * @param steps the number of line segments per curve. Defaults to 10 steps.
     * @param tension optional value between 0 to n to specify a "tension". Default is 1 which is the usual tension.
     * @returns a curve as a group of interpolated Pt
     */
    static bspline(pts, steps = 10, tension = 1) {
        if (pts.length < 2)
            return new Pt_1.Group();
        let ps = new Pt_1.Group();
        let ts = Curve.getSteps(steps);
        let k = 0;
        while (k < pts.length - 3) {
            let c = Curve.controlPoints(pts, k);
            if (c.length > 0) {
                if (tension !== 1) {
                    for (let i = 0; i <= steps; i++) {
                        ps.push(Curve.bsplineTensionStep(ts[i], c, tension));
                    }
                }
                else {
                    for (let i = 0; i <= steps; i++) {
                        ps.push(Curve.bsplineStep(ts[i], c));
                    }
                }
                k++;
            }
        }
        return ps;
    }
    /**
     * Interpolate to get a point on a B-spline curve
     * @param step the coefficients [t*t*t, t*t, t, 1]
     * @param ctrls a group of anchor Pts
     * @return an interpolated Pt on the curve
     */
    static bsplineStep(step, ctrls) {
        /*
        * Basis matrix:
        * [ -1.0/6.0,  3.0/6.0, -3.0/6.0, 1.0/6.0 ],
        * [  3.0/6.0, -6.0/6.0,  3.0/6.0,    0.0 ],
        * [ -3.0/6.0,      0.0,  3.0/6.0,    0.0 ],
        * [  1.0/6.0,  4.0/6.0,  1.0/6.0,    0.0 ]
        */
        let m = new Pt_1.Group(new Pt_1.Pt(-0.16666666666666666, 0.5, -0.5, 0.16666666666666666), new Pt_1.Pt(0.5, -1, 0, 0.6666666666666666), new Pt_1.Pt(-0.5, 0.5, 0.5, 0.16666666666666666), new Pt_1.Pt(0.16666666666666666, 0, 0, 0));
        return Curve._calcPt(ctrls, LinearAlgebra_1.Mat.multiply([step], m, true)[0]);
    }
    /**
     * Interpolate to get a point on a B-spline curve
     * @param step the coefficients [t*t*t, t*t, t, 1]
     * @param ctrls a group of anchor Pts
     * @param tension optional value between 0 to n to specify a "tension". Default to 1 which is the usual tension.
     * @return an interpolated Pt on the curve
     */
    static bsplineTensionStep(step, ctrls, tension = 1) {
        /*
        * Basis matrix:
        * [ -1/6a, 2 - 1.5a, 1.5a - 2, 1/6a ]
        * [ 0.5a,  2a-3,     3-2.5a    0 ]
        * [ -0.5a, 0,        0.5a,     0 ]
        * [ 1/6a,  1 - 1/3a, 1/6a,     0 ]
        */
        let m = new Pt_1.Group(new Pt_1.Pt(-0.16666666666666666, 0.5, -0.5, 0.16666666666666666), new Pt_1.Pt(-1.5, 2, 0, -0.3333333333333333), new Pt_1.Pt(1.5, -2.5, 0.5, 0.16666666666666666), new Pt_1.Pt(0.16666666666666666, 0, 0, 0));
        let h = LinearAlgebra_1.Mat.multiply([step], m, true)[0].multiply(tension);
        let h2 = (2 * step[0] - 3 * step[1] + 1);
        let h3 = -2 * step[0] + 3 * step[1];
        let pt = Curve._calcPt(ctrls, h);
        pt.x += h2 * ctrls[1].x + h3 * ctrls[2].x;
        pt.y += h2 * ctrls[1].y + h3 * ctrls[2].y;
        if (pt.length > 2)
            pt.z += h2 * ctrls[1].z + h3 * ctrls[2].z;
        return pt;
    }
}
exports.Curve = Curve;


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan)
Object.defineProperty(exports, "__esModule", { value: true });
class Font {
    constructor(size = 11, face = "sans-serif", style = "") {
        this.size = size;
        this.face = face;
        this.style = style;
    }
    get data() { return `${this.style} ${this.size}px ${this.face}`; }
    ;
}
exports.Font = Font;
class Form {
    constructor() {
        this._filled = true;
        this._stroked = true;
    }
    get filled() { return this._filled; }
    set filled(b) { this._filled = b; }
    get stroked() { return this._stroked; }
    set stroked(b) { this._stroked = b; }
    get font() { return this._font; }
    set font(b) { this._font = b; }
}
exports.Form = Form;


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan)
Object.defineProperty(exports, "__esModule", { value: true });
const Bound_1 = __webpack_require__(3);
const Pt_1 = __webpack_require__(0);
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
        this._pointer = new Pt_1.Pt();
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
     * An item should also define a callback function `resize:( bound, evt )`.
     * Subclasses of Space may define other callback functions.
     * @param player an IPlayer object with animate function, or simply a function(time, fps, context){}
     */
    add(p) {
        let player = (typeof p == "function") ? { animate: p } : p;
        let k = this.playerCount++;
        let pid = this.id + k;
        this.players[pid] = player;
        player.animateID = pid;
        if (player.resize && this.bound.inited)
            player.resize(this.bound);
        // if _refresh is not set, set it to true
        if (this._refresh === undefined)
            this._refresh = true;
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
        this._animID = requestAnimationFrame(this.play.bind(this));
        if (this._pause)
            return this;
        this._time.diff = time - this._time.prev;
        this._time.prev = time;
        try {
            this.playItems(time);
        }
        catch (err) {
            cancelAnimationFrame(this._animID);
            throw err;
        }
        return this;
    }
    /**
     * Replay the animation after `stop()`. This resets the end-time counter.
     * You may also use `pause()` and `resume()` for temporary pause.
     */
    replay() {
        this._time.end = -1;
        this.play();
    }
    /**
     * Main animate function. This calls all the items to perform
     * @param time current time
     */
    playItems(time) {
        // clear before draw if refresh is true
        if (this._refresh)
            this.clear();
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
        this._pause = (toggle) ? !this._pause : true;
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
    get outerBound() { return this.bound.clone(); }
    /**
     * The bounding box of the canvas
     */
    get innerBound() { return new Bound_1.Bound(Pt_1.Pt.make(this.size.length, 0), this.size.clone()); }
    /**
     * Get the size of this bounding box as a Pt
     */
    get size() { return this.bound.size.clone(); }
    /**
     * Get the size of this bounding box as a Pt
     */
    get center() { return this.size.divide(2); }
    /**
     * Get width of canvas
     */
    get width() { return this.bound.width; }
    /**
     * Get height of canvas
     */
    get height() { return this.bound.height; }
}
exports.Space = Space;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan)
Object.defineProperty(exports, "__esModule", { value: true });
const Space_1 = __webpack_require__(7);
const Form_1 = __webpack_require__(6);
const Bound_1 = __webpack_require__(3);
const Pt_1 = __webpack_require__(0);
const Util_1 = __webpack_require__(1);
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
        this._offscreen = false;
        // track mouse dragging
        this._pressed = false;
        this._dragged = false;
        this._hasMouse = false;
        this._hasTouch = false;
        this._renderFunc = undefined;
        this._isReady = false;
        var _selector = null;
        var _existed = false;
        this.id = "pt";
        // check element or element id string
        if (elem instanceof Element) {
            _selector = elem;
            this.id = "pts_existing_space";
        }
        else {
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
        }
        else if (_selector.nodeName.toLowerCase() != "canvas") {
            this._container = _selector;
            this._canvas = this._createElement("canvas", this.id + "_canvas");
            this._container.appendChild(this._canvas);
            // if selector is an existing canvas
        }
        else {
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
        if (!this._container)
            throw new Error(`Cannot initiate #${this.id} element`);
        this._isReady = true;
        let b = (this._autoResize) ? this._container.getBoundingClientRect() : this._canvas.getBoundingClientRect();
        if (b)
            this.resize(Bound_1.Bound.fromBoundingRect(b));
        this.clear(this._bgcolor);
        this._canvas.dispatchEvent(new Event("ready"));
        for (let k in this.players) {
            if (this.players[k].start)
                this.players[k].start(this.bound.clone(), this);
        }
        this._pointer = this.center;
        if (callback)
            callback(this.bound, this._canvas);
    }
    /**
     * Set up various options for CanvasSpace. The `opt` parameter is an object with the following fields. This is usually set during instantiation, eg `new CanvasSpace(...).setup( { opt } )`
     * @param opt an object with optional settings, as follows.
     * @param opt.bgcolor a hex or rgba string to set initial background color of the canvas, or use `false` or "transparent" to set a transparent background. You may also change it later with `clear()`
     * @param opt.resize a boolean to set whether `<canvas>` size should auto resize to match its container's size. You can also set it manually with `autoSize()`
     * @param opt.retina a boolean to set if device pixel scaling should be used. This may make drawings on retina displays look sharper but may reduce performance slightly. Default is `true`.
     * @param opt.offscreen a boolean to set if a duplicate canvas should be created for offscreen rendering. Default is `false`.
     */
    setup(opt) {
        if (opt.bgcolor)
            this._bgcolor = opt.bgcolor;
        if (opt.resize != undefined)
            this.autoResize(opt.resize);
        if (opt.retina !== false) {
            let r1 = window.devicePixelRatio || 1;
            let r2 = this._ctx.webkitBackingStorePixelRatio || this._ctx.mozBackingStorePixelRatio || this._ctx.msBackingStorePixelRatio || this._ctx.oBackingStorePixelRatio || this._ctx.backingStorePixelRatio || 1;
            this._pixelScale = r1 / r2;
        }
        if (opt.offscreen) {
            this._offscreen = true;
            this._offCanvas = this._createElement("canvas", this.id + "_offscreen");
            this._offCtx = this._offCanvas.getContext('2d');
        }
        else {
            this._offscreen = false;
        }
        return this;
    }
    /**
     * Check if an offscreen canvas is created
     */
    get hasOffscreen() {
        return this._offscreen;
    }
    /**
     * Get the rendering context of canvas
     */
    get ctx() { return this._ctx; }
    /**
     * Get the canvas element in this space
     */
    get canvas() { return this._canvas; }
    /**
     * Get the rendering context of offscreen canvas (if created via `setup()`)
     */
    get offscreenCtx() { return this._offCtx; }
    /**
     * Get the offscreen canvas element
     */
    get offscreenCanvas() { return this._offCanvas; }
    /**
     * Get the mouse or touch pointer that stores the last action
     */
    get pointer() {
        let p = this._pointer.clone();
        p.id = this._pointer.id;
        return p;
    }
    /**
     * Get a new CanvasForm for drawing
     */
    getForm() { return new CanvasForm(this); }
    /**
     * Window resize handling
     * @param evt
     */
    _resizeHandler(evt) {
        let b = (this._autoResize) ? this._container.getBoundingClientRect() : this._canvas.getBoundingClientRect();
        if (b)
            this.resize(Bound_1.Bound.fromBoundingRect(b), evt);
    }
    /**
     * Set whether the canvas element should resize when its container is resized. Default will auto size
     * @param auto a boolean value indicating if auto size is set. Default is `true`.
     */
    autoResize(auto = true) {
        this._autoResize = auto;
        if (auto) {
            window.addEventListener('resize', this._resizeHandler.bind(this));
        }
        else {
            window.removeEventListener('resize', this._resizeHandler.bind(this));
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
     * This overrides Space's `resize` function. It's a callback function for window's resize event. Keep track of this with `resize: (bound ,evt)` callback in your added objects.
     * @param b a Bound object to resize to
     * @param evt Optionally pass a resize event
     */
    resize(b, evt) {
        this.bound = b;
        this._canvas.width = this.bound.size.x * this._pixelScale;
        this._canvas.height = this.bound.size.y * this._pixelScale;
        this._canvas.style.width = Math.floor(this.bound.size.x) + "px";
        this._canvas.style.height = Math.floor(this.bound.size.y) + "px";
        if (this._offscreen) {
            this._offCanvas.width = this.bound.size.x * this._pixelScale;
            this._offCanvas.height = this.bound.size.y * this._pixelScale;
            // this._offCanvas.style.width = Math.floor(this.bound.size.x) + "px";
            // this._offCanvas.style.height = Math.floor(this.bound.size.y) + "px";
        }
        if (this._pixelScale != 1) {
            this._ctx.scale(this._pixelScale, this._pixelScale);
            this._ctx.translate(0.5, 0.5);
            if (this._offscreen) {
                this._offCtx.scale(this._pixelScale, this._pixelScale);
                this._offCtx.translate(0.5, 0.5);
            }
        }
        for (let k in this.players) {
            let p = this.players[k];
            if (p.resize)
                p.resize(this.bound, evt);
        }
        this.render(this._ctx);
        return this;
    }
    /**
     * Clear the canvas with its background color. Overrides Space's `clear` function.
     * @param bg Optionally specify a custom background color in hex or rgba string, or "transparent". If not defined, it will use its `bgcolor` property as background color to clear the canvas.
     */
    clear(bg) {
        if (bg)
            this._bgcolor = bg;
        let lastColor = this._ctx.fillStyle;
        if (this._bgcolor && this._bgcolor != "transparent") {
            this._ctx.fillStyle = this._bgcolor;
            this._ctx.fillRect(-1, -1, this._canvas.width + 1, this._canvas.height + 1);
        }
        else {
            this._ctx.clearRect(-1, -1, this._canvas.width + 1, this._canvas.height + 1);
        }
        this._ctx.fillStyle = lastColor;
        return this;
    }
    clearOffscreen(bg) {
        if (this._offscreen) {
            if (bg) {
                this._offCtx.fillStyle = bg;
                this._offCtx.fillRect(-1, -1, this._canvas.width + 1, this._canvas.height + 1);
            }
            else {
                this._offCtx.clearRect(-1, -1, this._offCanvas.width + 1, this._offCanvas.height + 1);
            }
        }
        return this;
    }
    /**
     * Main animation function. Call `Space.playItems`.
     * @param time current time
     */
    playItems(time) {
        if (this._isReady) {
            this._ctx.save();
            if (this._offscreen)
                this._offCtx.save();
            super.playItems(time);
            this._ctx.restore();
            if (this._offscreen)
                this._offCtx.restore();
            this.render(this._ctx);
        }
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
            this._hasMouse = true;
        }
        else {
            this.unbindCanvas("mousedown", this._mouseDown.bind(this));
            this.unbindCanvas("mouseup", this._mouseUp.bind(this));
            this.unbindCanvas("mouseover", this._mouseOver.bind(this));
            this.unbindCanvas("mouseout", this._mouseOut.bind(this));
            this.unbindCanvas("mousemove", this._mouseMove.bind(this));
            this._hasMouse = false;
        }
        return this;
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
            this._hasTouch = true;
        }
        else {
            this.unbindCanvas("touchstart", this._mouseDown.bind(this));
            this.unbindCanvas("touchend", this._mouseUp.bind(this));
            this.unbindCanvas("touchmove", this._touchMove.bind(this));
            this.unbindCanvas("touchcancel", this._mouseOut.bind(this));
            this._hasTouch = false;
        }
        return this;
    }
    /**
     * A convenient method to convert the touch points in a touch event to an array of `Pt`.
     * @param evt a touch event which contains touches, changedTouches, and targetTouches list
     * @param which a string to select a touches list: "touches", "changedTouches", or "targetTouches". Default is "touches"
     * @return an array of Pt, whose origin position (0,0) is offset to the top-left of this space
     */
    touchesToPoints(evt, which = "touches") {
        if (!evt || !evt[which])
            return [];
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
        let px = 0, py = 0;
        if (evt instanceof MouseEvent) {
            for (let k in this.players) {
                let v = this.players[k];
                px = evt.offsetX || evt.layerX;
                py = evt.offsetY || evt.layerY;
                if (v.action)
                    v.action(type, px, py, evt);
            }
        }
        else {
            for (let k in this.players) {
                let v = this.players[k];
                let c = evt.changedTouches && evt.changedTouches.length > 0;
                let touch = evt.changedTouches.item(0);
                let bound = this._canvas.getBoundingClientRect();
                px = (c) ? touch.clientX - bound.left : 0;
                py = (c) ? touch.clientY - bound.top : 0;
                if (v.action)
                    v.action(type, px, py, evt);
            }
        }
        if (type) {
            this._pointer.to(px, py);
            this._pointer.id = type;
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
        if (this._dragged)
            this._mouseAction("drop", evt);
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
        if (this._dragged)
            this._mouseAction("drop", evt);
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
        if (this._renderFunc)
            this._renderFunc(context, this);
        return this;
    }
    /**
     * Set a custom rendering `function(graphics_context, canvas_space)` if needed
     */
    set customRendering(f) { this._renderFunc = f; }
    get customRendering() { return this._renderFunc; }
}
exports.CanvasSpace = CanvasSpace;
/**
 * CanvasForm provide methods to visualize Pts on CanvasSpace
 */
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
    get space() { return this._space; }
    useOffscreen(off = true, clear = false) {
        if (clear)
            this._space.clearOffscreen((typeof clear == "string") ? clear : null);
        this._ctx = (this._space.hasOffscreen && off) ? this._space.offscreenCtx : this._space.ctx;
        return this;
    }
    renderOffscreen(offsetX = 0, offsetY = 0) {
        if (this._space.hasOffscreen) {
            this._space.ctx.drawImage(this._space.offscreenCanvas, offsetX, offsetY, this._space.width, this._space.height);
        }
    }
    /**
     * Set current fill style. For example: `form.fill("#F90")` `form.fill("rgba(0,0,0,.5")` `form.fill(false)`
     * @param c fill color which can be as color, gradient, or pattern. (See [canvas documentation](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillStyle))
     * @return this
     */
    fill(c) {
        if (typeof c == "boolean") {
            this.filled = c;
        }
        else {
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
        }
        else {
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
        if (this._filled)
            this._ctx.fill();
        if (this._stroked)
            this._ctx.stroke();
    }
    point(p, radius = 5, shape = "square") {
        if (!CanvasForm[shape])
            throw new Error(`${shape} is not a static function of CanvasForm`);
        CanvasForm[shape](this._ctx, p, radius);
        this._paint();
        return this;
    }
    points(pts, radius = 5, shape = "square") {
        if (!pts)
            return;
        for (let i = 0, len = pts.length; i < len; i++) {
            this.point(pts[i], radius, shape);
        }
        return this;
    }
    static circle(ctx, pt, radius = 10) {
        if (!pt)
            return;
        ctx.beginPath();
        ctx.arc(pt[0], pt[1], radius, 0, Util_1.Const.two_pi, false);
        ctx.closePath();
    }
    circle(pts) {
        CanvasForm.circle(this._ctx, pts[0], pts[1][0]);
        this._paint();
        return this;
    }
    circles(groups) {
        for (let i = 0, len = groups.length; i < len; i++) {
            this.circle(groups[i]);
        }
        return this;
    }
    static ellipse(ctx, pts) {
        if (pts.length < 2)
            return;
        if (pts[1].length < 2) {
            CanvasForm.circle(ctx, pts[0], pts[1][0]);
        }
        else {
            ctx.ellipse(pts[0][0], pts[0][1], pts[1][0], pts[1][1], 0, 0, Util_1.Const.two_pi);
        }
    }
    ellipse(pts) {
        CanvasForm.ellipse(this._ctx, pts);
        return this;
    }
    static arc(ctx, pt, radius, startAngle, endAngle, cc) {
        if (!pt)
            return;
        ctx.beginPath();
        ctx.arc(pt[0], pt[1], radius, startAngle, endAngle, cc);
    }
    arc(pt, radius, startAngle, endAngle, cc) {
        CanvasForm.arc(this._ctx, pt, radius, startAngle, endAngle, cc);
        this._paint();
        return this;
    }
    static square(ctx, pt, halfsize) {
        if (!pt)
            return;
        let x1 = pt[0] - halfsize;
        let y1 = pt[1] - halfsize;
        let x2 = pt[0] + halfsize;
        let y2 = pt[1] + halfsize;
        // faster than using `rect`
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1, y2);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x2, y1);
        ctx.closePath();
    }
    static line(ctx, pts) {
        if (pts.length < 2)
            return;
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1, len = pts.length; i < len; i++) {
            if (pts[i])
                ctx.lineTo(pts[i][0], pts[i][1]);
        }
    }
    line(pts) {
        CanvasForm.line(this._ctx, pts);
        this._paint();
        return this;
    }
    lines(groups) {
        for (let i = 0, len = groups.length; i < len; i++) {
            this.line(groups[i]);
        }
        return this;
    }
    static polygon(ctx, pts) {
        if (pts.length < 2)
            return;
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1, len = pts.length; i < len; i++) {
            if (pts[i])
                ctx.lineTo(pts[i][0], pts[i][1]);
        }
        ctx.closePath();
    }
    polygon(pts) {
        CanvasForm.polygon(this._ctx, pts);
        this._paint();
        return this;
    }
    static rect(ctx, pts) {
        if (pts.length < 2)
            return;
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
    rects(groups) {
        for (let i = 0, len = groups.length; i < len; i++) {
            this.rect(groups[i]);
        }
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
        if (!pt)
            return;
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
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan)
Object.defineProperty(exports, "__esModule", { value: true });
const Pt_1 = __webpack_require__(0);
class Create {
    static distributeRandom(bound, count, dimensions = 2) {
        let pts = new Pt_1.Group();
        for (let i = 0; i < count; i++) {
            let p = [bound.x + Math.random() * bound.width];
            if (dimensions > 1)
                p.push(bound.y + Math.random() * bound.height);
            if (dimensions > 2)
                p.push(bound.z + Math.random() * bound.depth);
            pts.push(new Pt_1.Pt(p));
        }
        return pts;
    }
    static gridPts(bound, columns, rows, orientation = [0.5, 0.5]) {
        let unit = bound.size.$subtract(1).$divide(columns, rows);
        let offset = unit.$multiply(orientation);
        let g = new Pt_1.Group();
        for (let c = 0; c < columns; c++) {
            for (let r = 0; r < rows; r++) {
                g.push(bound.topLeft.$add(unit.$multiply(c, r)).add(offset));
            }
        }
        return g;
    }
    static gridCells(bound, columns, rows) {
        let unit = bound.size.$subtract(1).divide(columns, rows); // subtract 1 to fill whole border of rectangles
        let g = [];
        for (let c = 0; c < columns; c++) {
            for (let r = 0; r < rows; r++) {
                g.push(new Pt_1.Group(bound.topLeft.$add(unit.$multiply(c, r)), bound.topLeft.$add(unit.$multiply(c, r).add(unit))));
            }
        }
        return g;
    }
}
exports.Create = Create;


/***/ }),
/* 10 */,
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Pt_1 = __webpack_require__(0);
const Util_1 = __webpack_require__(1);
const Bound_1 = __webpack_require__(3);
const Create_1 = __webpack_require__(9);
const Canvas_1 = __webpack_require__(8);
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
var canvas = new Canvas_1.CanvasSpace("#pt", ready).setup({ retina: true });
var form = canvas.getForm();
var form2 = canvas.getForm();
var pt = new Pt_1.Pt(50, 50);
var ptAdd = pt.op((a, b) => a.$add(b));
var pto = [ptAdd(10, 10), ptAdd(20, 25)];
var pto2 = {
    "a": ptAdd(10, 10),
    "b": ptAdd(20, 25)
};
for (var i in pto2) {
    console.log("==>", pto2[i].toString());
}
console.log(pto.reduce((a, b) => a + " | " + b.toString(), ""));
console.log(pt.toString());
var ps = [];
let fs = {
    "size": (p) => {
        let dist = p.$subtract(canvas.size.$divide(2)).magnitude();
        return new Pt_1.Pt(dist / 8, dist / (Math.max(canvas.width, canvas.height) / 2));
    },
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
        ps.forEach((p) => {
            let attrs = p.op(fs);
            form.fill(`rgba(255,0,0,${1.2 - attrs.size.y}`);
            form.point(p, attrs.size.x, "circle");
        });
        // form.point( {x:50.5, y: 50.5}, 20, "circle");
        // form.point( {x:50.5, y: 140.5}, 20, );
        // console.log(time, fps);
        // form.point( {x:50, y:50}, 100);    
    },
    action: (type, px, py) => {
        if (type == "move") {
            let d = canvas.outerBound.center.$subtract(px, py);
            let p1 = canvas.outerBound.center.$subtract(d);
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