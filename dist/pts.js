var pts =
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
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const Util_1 = __webpack_require__(3);
const LinearAlgebra_1 = __webpack_require__(2);
let TypedArray = Float64Array;
let LA = LinearAlgebra_1.LinearAlgebra;
class Pt extends TypedArray {
    /**
     * Create a Pt. This will instantiate with at least 3 dimensions. If provided parameters are less than 3 dimensions, default value of 0 will be used to fill. Use 'Pt.$()' if you need 1D or 2D specifically.
     * Example: `new Pt()`, `new Pt(1,2,3,4,5)`, `new Pt([1,2])`, `new Pt({x:0, y:1})`, `new Pt(pt)`
     * @param args a list of numbers, an array of number, or an object with {x,y,z,w} properties
     */
    constructor(...args) {
        super(Util_1.Util.getArgs(args));
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
     * Get a new Pt based on a slice of this Pt. Similar to `Array.slice()`.
     * @param start start index
     * @param end end index (ie, entry will not include value at this index)
     */
    $slice(start, end) {
        let m = new TypedArray(this).slice(start, end);
        return new Pt(m);
    }
    $concat(...args) {
        return new Pt(this.toArray().concat(Util_1.Util.getArgs(args)));
    }
    add(...args) {
        args.length === 1 && typeof args[0] == "number" ? LA.add(this, args[0]) : LA.add(this, Util_1.Util.getArgs(args));
        return this;
    }
    $add(...args) {
        return this.clone().add(...args);
    }

    subtract(...args) {
        args.length === 1 && typeof args[0] == "number" ? LA.subtract(this, args[0]) : LA.subtract(this, Util_1.Util.getArgs(args));
        return this;
    }
    $subtract(...args) {
        return this.clone().subtract(...args);
    }

    multiply(...args) {
        args.length === 1 && typeof args[0] == "number" ? LA.multiply(this, args[0]) : LA.multiply(this, Util_1.Util.getArgs(args));
        return this;
    }
    $multiply(...args) {
        return this.clone().multiply(...args);
    }

    divide(...args) {
        args.length === 1 && typeof args[0] == "number" ? LA.divide(this, args[0]) : LA.divide(this, Util_1.Util.getArgs(args));
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
        return LA.dot(this, this);
    }
    magnitude() {
        return LA.magnitude(this);
    }
    /**
     * Convert to a unit vector
     */
    unit() {
        LA.unit(this);
        return this;
    }
    /**
     * Get a unit vector from this Pt
     */
    $unit() {
        return this.clone().unit();
    }
    dot(...args) {
        return LA.dot(this, Util_1.Util.getArgs(args));
    }
    cross(...args) {
        let p = Util_1.Util.getArgs(args);
        return new Pt(this[1] * p[2] - this[2] * p[1], this[2] * p[0] - this[0] * p[2], this[0] * p[1] - this[1] * p[0]);
    }
    project(p) {
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
        LA.abs(this);
        return this;
    }
    /**
     * Get a new Pt with absolute values of this Pt
     */
    $abs() {
        return this.clone().abs();
    }
    toString() {
        return `Pt(${this.join(", ")})`;
    }
    toArray() {
        return [].slice.call(this);
    }
}
exports.Pt = Pt;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const Pt_1 = __webpack_require__(0);
class Pts {
    constructor() {}
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
        return new Pt_1.Pt(z);
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
            ps.push(Pts.zipOne(pts, i, defaultValue));
        }
        return ps;
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
        /*
        function c(agg, i) {
          if (i>=pts.length) return;
          agg.push( pts.slice(i, i+size) );
          c(agg, i+size);
        }
        return c([], 0);
        */
    }
    /**
     * Provide a string representation of an array of Pt
     * @param pts an array of Pt
     */
    static toString(pts) {
        return pts.reduce((a, b) => a + `${b.toString()}, `, "[ ") + "]";
    }
}
exports.Pts = Pts;

/***/ }),
/* 2 */
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
    static unit(a) {
        return LinearAlgebra.divide(a, LinearAlgebra.magnitude(a));
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
            console.log(a[i], i);
            a[i] = fn(a[i], i, a);
        }
        return LinearAlgebra;
    }
}
exports.LinearAlgebra = LinearAlgebra;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
var Key;
(function (Key) {
    Key[Key["xy"] = 0] = "xy";
    Key[Key["yz"] = 1] = "yz";
    Key[Key["xz"] = 2] = "xz";
    Key[Key["xyz"] = 3] = "xyz";
    /* represents identical point or value */
    Key[Key["identical"] = 0] = "identical";
    /* represents right position or direction */
    Key[Key["right"] = 4] = "right";
    /* represents bottom right position or direction */
    Key[Key["bottom_right"] = 5] = "bottom_right";
    /* represents bottom position or direction */
    Key[Key["bottom"] = 6] = "bottom";
    /* represents bottom left position or direction */
    Key[Key["bottom_left"] = 7] = "bottom_left";
    /* represents left position or direction */
    Key[Key["left"] = 8] = "left";
    /* represents top left position or direction */
    Key[Key["top_left"] = 1] = "top_left";
    /* represents top position or direction */
    Key[Key["top"] = 2] = "top";
    /* represents top right position or direction */
    Key[Key["top_right"] = 3] = "top_right";
})(Key = exports.Key || (exports.Key = {}));
;
exports.Const = {
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
}
exports.Util = Util;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const Pt_1 = __webpack_require__(0);
const Pts_1 = __webpack_require__(1);
window["Pt"] = Pt_1.Pt;
window["Pts"] = Pts_1.Pts;
var p = new Pt_1.Pt([1, 2, 3]);
console.log(p, p.x);
p.add(10, 20);
console.log(p, p.x);
p.add(1);
console.log(p, p.x);
var p2 = p.clone();
p2.add(10, 20);
var p3 = p2.$add(100);
console.log(p, p2, p3);
var p4 = p3.$map((n, i) => n * i * 10);
console.log(p3, p4);
console.log(new Pt_1.Pt([1, 2, 3]).$slice(0, 2).toString());
/*
console.log( new Pt(32,43).unit().magnitude() );

// console.log( Pts.zipOne( [new Pt(1,3), new Pt(2,4), new Pt(5,10)], 1, 0 ).toString() );
// console.log( new Pt(1,2,3,4,5,6).slice(2,5).toString() );
// console.log( Pts.toString( Pts.zip( [new Pt(1,2), new Pt(3,4), new Pt(5,6)] ) ) );
// console.log( Pts.toString( Pts.zip( Pts.zip( [new Pt(1,2), new Pt(3,4), new Pt(5,6)] ) ) ) );

console.log( Pts.split( [1,2,3,4,5,6,7,8,9,10,11,12,13], 5 ) );

let cs = [];
for (let i=0; i<500; i++) {
  let c = new Pt( Math.random()*200, Math.random()*200 );
  cs.push( c );
}

var canvas = new CanvasSpace("#pt", ready).setup({retina: true});
var form = canvas.getForm();
var form2 = canvas.getForm();

var pt = new Pt(50, 50);
var pto = pt.to([
  (p:Pt) => p.$add( 10, 10 ),
  (p:Pt) => p.$add( 20, 25 )
]);

var pto2 = pt.to({
  "a": (p:Pt) => p.$add( 10, 10 ),
  "b": (p:Pt) => p.$add( 20, 25 )
});


for (var i in pto2) {
  console.log( "==>", pto2[i].toString() );
}

console.log( pto.reduce( (a,b) => a+" | "+b.toString(), "" ) );
console.log( pt.toString() );

var ps = [];

let fs = {
  "size": (p:Pt) => {
    let dist = p.$subtract( canvas.size.$divide(2) ).magnitude();
    return new Pt( dist/8, dist/(Math.max(canvas.width, canvas.height)/2) );
  },
}

function ready( bound, space) {
  ps = Create.distributeRandom( new Bound(canvas.size), 200 );
}

canvas.add( {
 animate: (time, fps, space) => {
    form.reset();
    form.stroke( false );
    ps.forEach( (p) => {
      let attrs = p.to( fs );
      form.fill(`rgba(255,0,0,${1.2-attrs.size.y}`);
      form.point( p, attrs.size.x, "circle" );
    })
    // form.point( {x:50.5, y: 50.5}, 20, "circle");
    // form.point( {x:50.5, y: 140.5}, 20, );
      // console.log(time, fps);

      // form.point( {x:50, y:50}, 100);
  },

  onMouseAction: (type, px, py) => {
    if (type=="move") {
      let d = canvas.boundingBox.center.$subtract( px, py);
      let p1 = canvas.boundingBox.center.$subtract(d);

      let bound = new Bound( p1, p1.$add( d.$abs().multiply(2) ) )
      ps = Create.distributeRandom( bound, 200 );
    }
  }
});

canvas.bindMouse();
*/
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
//# sourceMappingURL=pts.js.map