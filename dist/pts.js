var pts =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
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
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

(function () {
  'use strict';

  /**
   * @method constructor
   * @desc Creates a two-dimensional `Vector` from the supplied arguments.
   **/
  function Vector (data) {
    this.type = Float64Array;
    this.length = 0;

    if (data instanceof Vector) {
      this.combine(data);
    } else if (data && data.shape) {
      this.data = new data.type(data.data);
      this.length = data.shape[0] * data.shape[1];
      this.type = data.type;
    } else if (data instanceof Array) {
      this.data = new this.type(data);
      this.length = data.length;
    } else if (data && data.buffer && data.buffer instanceof ArrayBuffer) {
      this.data = data;
      this.length = data.length;
      this.type = data.constructor;
    }
  }

  /**
   * Static method. Perform binary operation on two vectors `a` and `b` together.
   * @param {Vector} a
   * @param {Vector} b
   * @param {function } op
   * @returns {Vector} a vector containing the results of binaery operation of `a` and `b`
   **/
  Vector.binOp = function(a, b, op) {
    return new Vector(a).binOp(b, op);
  };

  /**
   * Perform binary operation on `vector` to the current vector.
   * @param {Vector} vector
   * @param {function } op
   * @returns {Vector} this
   **/
  Vector.prototype.binOp = function(vector, op) {
    var l1 = this.length,
        l2 = vector.length;
    if (l1 !== l2)
      throw new Error('sizes do not match!');
    if (!l1 && !l2)
      return this;

    var i;
    for (i = 0; i < l1; i++)
      this.data[i] = op(this.data[i], vector.data[i], i);

    return this;
  };

  /**
   * Static method. Adds two vectors `a` and `b` together.
   * @param {Vector} a
   * @param {Vector} b
   * @returns {Vector} a vector containing the sum of `a` and `b`
   **/
  Vector.add = function (a, b) {
    return new Vector(a).add(b);
  };

  /**
   * Adds `vector` to the current vector.
   * @param {Vector} vector
   * @returns {Vector} this
   **/
  Vector.prototype.add = function (vector) {
    return this.binOp(vector, function(a, b) { return a + b });
  };

  /**
   * Static method. Subtracts the vector `b` from vector `a`.
   * @param {Vector} a
   * @param {Vector} b
   * @returns {Vector} a vector containing the difference between `a` and `b`
   **/
  Vector.subtract = function (a, b) {
    return new Vector(a).subtract(b);
  };

  /**
   * Subtracts `vector` from the current vector.
   * @param {Vector} vector
   * @returns {Vector} this
   **/
  Vector.prototype.subtract = function (vector) {
    return this.binOp(vector, function(a, b) { return a - b });
  };

  /**
   * Static method. Multiplies all elements of `vector` with a specified `scalar`.
   * @param {Vector} vector
   * @param {Number} scalar
   * @returns {Vector} a resultant scaled vector
   **/
  Vector.scale = function (vector, scalar) {
    return new Vector(vector).scale(scalar);
  };

  /**
   * Multiplies all elements of current vector with a specified `scalar`.
   * @param {Number} scalar
   * @returns {Vector} this
   **/
  Vector.prototype.scale = function (scalar) {
    return this.each(function(value, i, data){
      data[i] *= scalar;
    });
  };

  /**
   * Static method. Normalizes `vector`, i.e. divides all elements with the magnitude.
   * @param {Vector} vector
   * @returns {Vector} a resultant normalized vector
   **/
  Vector.normalize = function (vector) {
    return new Vector(vector).normalize();
  };

  /**
   * Normalizes current vector.
   * @returns {Vector} a resultant normalized vector
   **/
  Vector.prototype.normalize = function () {
    return this.scale(1 / this.magnitude());
  };

  /**
   * Static method. Projects the vector `a` onto the vector `b` using
   * the projection formula `(b * (a * b / b * b))`.
   * @param {Vector} a
   * @param {Vector} b
   * @returns {Vector} a new resultant projected vector
   **/
  Vector.project = function (a, b) {
    return a.project(new Vector(b));
  };

  /**
   * Projects the current vector onto `vector` using
   * the projection formula `(b * (a * b / b * b))`.
   * @param {Vector} vector
   * @returns {Vector} `vector`
   **/
  Vector.prototype.project = function (vector) {
    return vector.scale(this.dot(vector) / vector.dot(vector));
  };

   /**
   * Static method. Creates a vector containing optional 'value' (default 0) of `count` size, takes
   * an optional `type` argument which should be an instance of `TypedArray`.
   * @param {Number} count
   * @param {Number || function } value
   * @param {TypedArray} type
   * @returns {Vector} a new vector of the specified size and `type`
   **/
  Vector.fill = function (count, value, type) {
    if (count < 0)
      throw new Error('invalid size');
    else if (count === 0)
      return new Vector();
   
    value = value || +0.0;
    type = type || Float64Array;
    var data = new type(count),
        isValueFn = typeof value === 'function',
        i;

    for (i = 0; i < count; i++)
      data[i] = isValueFn ? value(i) : value;

    return new Vector(data);
  };
  
  /**
   * Static method. Creates a vector containing zeros (`0`) of `count` size, takes
   * an optional `type` argument which should be an instance of `TypedArray`.
   * @param {Number} count
   * @param {TypedArray} type
   * @returns {Vector} a new vector of the specified size and `type`
   **/
  Vector.zeros = function (count, type) {
    return Vector.fill(count, +0.0, type);
  };

  /**
   * Static method. Creates a vector containing ones (`1`) of `count` size, takes
   * an optional `type` argument which should be an instance of `TypedArray`.
   * @param {Number} count
   * @param {TypedArray} type
   * @returns {Vector} a new vector of the specified size and `type`
   **/
  Vector.ones = function (count, type) {
    return Vector.fill(count, 1, type);
  };

  /**
   * Static method. Creates a vector of `count` elements containing random
   * values according to a normal distribution, takes an optional `type`
   * argument which should be an instance of `TypedArray`.
   * @param {Number} count
   * @param {Number} deviation (default 1)
   * @param {Number} mean (default 0)
   * @param {TypedArray} type
   * @returns {Vector} a new vector of the specified size and `type`
   **/
  Vector.random = function (count, deviation, mean, type) {
    deviation = deviation || 1;
    mean = mean || 0;
    return Vector.fill(count, function() {
      return deviation * Math.random() + mean;
    }, type);
  };

  /**
   * Static method. Creates a vector containing a range (can be either ascending or descending)
   * of numbers specified by the arguments provided (e.g. `Vector.range(0, .5, 2)`
   * gives a vector containing all numbers in the interval `[0, 2)` separated by
   * steps of `0.5`), takes an optional `type` argument which should be an instance of
   * `TypedArray`.
   * @param {Number} start
   * @param {Number} step - optional
   * @param {Number} end
   * @returns {Vector} a new vector containing the specified range of the specified `type`
   **/
  Vector.range = function () {
    var args = [].slice.call(arguments, 0),
        backwards = false,
        start, step, end;

    var type = Float64Array;
    if (typeof args[args.length - 1] === 'function')
      type = args.pop();

    switch(args.length) {
      case 2:
        end = args.pop();
        step = 1;
        start = args.pop();
        break;
      case 3:
        end = args.pop();
        step = args.pop();
        start = args.pop();
        break;
      default:
        throw new Error('invalid range');
    }

    if (end - start < 0) {
      var copy = end;
      end = start;
      start = copy;
      backwards = true;
    }

    if (step > end - start)
      throw new Error('invalid range');

    var data = new type(Math.ceil((end - start) / step)),
        i, j;
    for (i = start, j = 0; i < end; i += step, j++)
      data[j] = backwards ? end - i + start : i;

    return new Vector(data);
  };

  /**
   * Static method. Performs dot multiplication with two vectors `a` and `b`.
   * @param {Vector} a
   * @param {Vector} b
   * @returns {Number} the dot product of the two vectors
   **/
  Vector.dot = function (a, b) {
    return a.dot(b);
  };

  /**
   * Performs dot multiplication with current vector and `vector`
   * @param {Vector} vector
   * @returns {Number} the dot product of the two vectors
   **/
  Vector.prototype.dot = function (vector) {
    if (this.length !== vector.length)
      throw new Error('sizes do not match');

    var a = this.data,
        b = vector.data,
        result = 0,
        i, l;

    for (i = 0, l = this.length; i < l; i++)
      result += a[i] * b[i];

    return result;
  };

  /**
   * Calculates the magnitude of a vector (also called L2 norm or Euclidean length).
   * @returns {Number} the magnitude (L2 norm) of the vector
   **/
  Vector.prototype.magnitude = function () {
    if (!this.length)
      return 0;

    var result = 0,
        data = this.data,
        i, l;
    for (i = 0, l = this.length; i < l; i++)
      result += data[i] * data[i];

    return Math.sqrt(result);
  };

  /**
   * Static method. Determines the angle between two vectors `a` and `b`.
   * @param {Vector} a
   * @param {Vector} b
   * @returns {Number} the angle between the two vectors in radians
   **/
  Vector.angle = function (a, b) {
    return a.angle(b);
  };

  /**
   * Determines the angle between the current vector and `vector`.
   * @param {Vector} vector
   * @returns {Number} the angle between the two vectors in radians
   **/
  Vector.prototype.angle = function (vector) {
    return Math.acos(this.dot(vector) / this.magnitude() / vector.magnitude());
  };

  /**
   * Static method. Checks the equality of two vectors `a` and `b`.
   * @param {Vector} a
   * @param {Vector} b
   * @returns {Boolean} `true` if the two vectors are equal, `false` otherwise
   **/
  Vector.equals = function (a, b) {
    return a.equals(b);
  };

  /**
   * Checks the equality of the current vector and `vector`.
   * @param {Vector} vector
   * @returns {Boolean} `true` if the two vectors are equal, `false` otherwise
   **/
  Vector.prototype.equals = function (vector) {
    if (this.length !== vector.length)
      return false;

    var a = this.data,
        b = vector.data,
        length = this.length,
        i = 0;

    while (i < length && a[i] === b[i])
      i++;
    return i === length;
  };

  /**
   * Gets the minimum value (smallest) element of current vector.
   * @returns {Number} the smallest element of the current vector
   **/
  Vector.prototype.min = function () {
    return this.reduce(function(acc, item) {
      return Math.min(acc, item);
    }, Number.POSITIVE_INFINITY);
  };

  /**
   * Gets the maximum value (largest) element of current vector.
   * @returns {Number} the largest element of current vector
   **/
  Vector.prototype.max = function () {
    return this.reduce(function(acc, item) {
      return Math.max(acc, item);
    }, Number.NEGATIVE_INFINITY);
  };

  /**
   * Check if `index` is within the bound for current vector.
   * @param {Number} index
   **/
  Vector.prototype.check = function (index) {  
    if (index < 0 || index > this.length - 1)
      throw new Error('index out of bounds');
  }

  /**
   * Gets the element at `index` from current vector.
   * @param {Number} index
   * @returns {Number} the element at `index`
   **/
  Vector.prototype.get = function (index) {
    this.check(index);
    return this.data[index];
  };

  /**
   * Sets the element at `index` to `value`.
   * @param {Number} index
   * @param {Number} value
   * @returns {Vector} this
   **/
  Vector.prototype.set = function (index, value) {
    this.check(index);
    this.data[index] = value;
    return this;
  };

  /**
   * Convenience property for vector[0]
   * @property {Number}
   * @name Vector#x
   */

  /**
   * Convenience property for vector[1]
   * @property {Number}
   * @name Vector#y
   */

  /**
   * Convenience property for vector[2]
   * @property {Number}
   * @name Vector#z
   */

  /**
   * Convenience property for vector[3]
   * @property {Number}
   * @name Vector#w
   */

  function indexProperty(index) {
    return {
      get: function() { return this.get(index); },
      set: function(value) { return this.set(index, value) }
    };
  }

  Object.defineProperties(Vector.prototype, {
    x: indexProperty(0),
    y: indexProperty(1),
    z: indexProperty(2),
    w: indexProperty(3)
  });

  /**
   * Static method. Combines two vectors `a` and `b` (appends `b` to `a`).
   * @param {Vector} a
   * @param {Vector} b
   * @returns {Vector} `b` appended to vector `a`
   **/
  Vector.combine = function (a, b) {
    return new Vector(a).combine(b);
  };

  /**
   * Combines the current vector with `vector`
   * @param {Vector} vector
   * @returns {Vector} `vector` combined with current vector
   **/
  Vector.prototype.combine = function (vector) {
    if (!vector.length)
      return this;
    if (!this.length) {
      this.data = new vector.type(vector.data);
      this.length = vector.length;
      this.type = vector.type;
      return this;
    }

    var l1 = this.length,
        l2 = vector.length,
        d1 = this.data,
        d2 = vector.data;

    var data = new this.type(l1 + l2);
    data.set(d1);
    data.set(d2, l1);

    this.data = data;
    this.length = l1 + l2;

    return this;
  };

  /**
   * Pushes a new `value` into current vector.
   * @param {Number} value
   * @returns {Vector} `this`
   **/
  Vector.prototype.push = function (value) {
    return this.combine(new Vector([value]));
  };

  /**
   * Maps a function `callback` to all elements of current vector.
   * @param {Function} callback
   * @returns {Vector} `this`
   **/
  Vector.prototype.map = function (callback) {
    var mapped = new Vector(this),
        data = mapped.data,
        i;
    for (i = 0; i < this.length; i++)
      data[i] = callback.call(mapped, data[i], i, data);

    return mapped;
  };

  /**
   * Functional version of for-looping the vector, is equivalent
   * to `Array.prototype.forEach`.
   * @param {Function} callback
   * @returns {Vector} `this`
   **/
  Vector.prototype.each = function (callback) {
    var i;
    for (i = 0; i < this.length; i++)
      callback.call(this, this.data[i], i, this.data);

    return this;
  };

  /**
   * Equivalent to `TypedArray.prototype.reduce`.
   * @param {Function} callback
   * @param {Number} initialValue
   * @returns {Number} result of reduction
   **/
  Vector.prototype.reduce = function (callback, initialValue) {
    var l = this.length;
    if (l === 0 && !initialValue)
      throw new Error('Reduce of empty matrix with no initial value.');

    var i = 0,
        value = initialValue || this.data[i++];

    for (; i < l; i++)
      value = callback.call(this, value, this.data[i], i, this.data);
    return value;
  };

  /**
   * Converts current vector into a readable formatted string.
   * @returns {String} a string of the vector's contents
   **/
  Vector.prototype.toString = function () {
    var result = ['['],
        i;
    for (i = 0; i < this.length; i++)
      result.push(i > 0 ? ', ' + this.data[i] : this.data[i]);
    
    result.push(']');

    return result.join('');
  };

  /**
   * Converts current vector into a JavaScript array.
   * @returns {Array} an array containing all elements of current vector
   **/
  Vector.prototype.toArray = function () {
    if (!this.data)
      return [];

    return Array.prototype.slice.call(this.data);
  };

  module.exports = Vector;
  try {
    window.Vector = Vector;
  } catch (e) {}
}());


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var __extends = this && this.__extends || function () {
    var extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
        d.__proto__ = b;
    } || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() {
            this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
}();
Object.defineProperty(exports, "__esModule", { value: true });
var vectorious_1 = __webpack_require__(5);
var Pt = function (_super) {
    __extends(Pt, _super);
    function Pt() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return _super.call(this, Pt.getArgs(args)) || this;
    }
    /**
     * Convert different kinds of parameters (arguments, array, object) into an array of numbers
     * @param args a list of numbers, an array of number, or an object with {x,y,z,w} properties
     */
    Pt.getArgs = function (args) {
        if (args.length < 1) return [];
        var pos = [];
        // positional arguments: x,y,z,w,...
        if (typeof args[0] === 'number') {
            pos = Array.prototype.slice.call(args);
            // as an object of {x, y?, z?, w?}
        } else if (typeof args[0] === 'object' && !Array.isArray(args[0])) {
            var a = ["x", "y", "z", "w"];
            var p = args[0];
            for (var i = 0; i < a.length; i++) {
                if (p.length && i >= p.length || !(a[i] in p)) break; // check for length and key exist
                pos.push(p[a[i]]);
            }
            // as an array of values
        } else if (Array.isArray(args[0])) {
            var _x = args[0];
            pos = _x.slice();
        }
        return pos;
    };
    /**
     * Update the values of this Pt
     * @param args a list of numbers, an array of number, or an object with {x,y,z,w} properties
     */
    Pt.prototype.to = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var p = Pt.getArgs(args);
        for (var i = 0; i < p.length; i++) {
            this.set(i, p[i]);
        }
        this.length = Math.max(this.length, p.length);
        return this;
    };
    Pt.prototype.$add = function (p) {
        return new Pt(this).add(p);
    };
    Pt.prototype.$subtract = function (p) {
        return new Pt(this).subtract(p);
    };
    Pt.prototype.$scale = function (n) {
        return new Pt(this).scale(n);
    };
    Pt.prototype.$normalize = function () {
        return new Pt(this).normalize();
    };
    Pt.prototype.$project = function (p) {
        return new Pt(this).project(new Pt(p));
    };
    Pt.prototype.multiply = function (n) {
        return this.scale(n);
    };
    Pt.prototype.$multiply = function (n) {
        return this.$scale(n);
    };
    Pt.prototype.divide = function (n) {
        return this.scale(1 / n);
    };
    Pt.prototype.$divide = function (n) {
        return this.$scale(1 / n);
    };
    /**
     * Iterator implementation to support for ... of loop
     */
    Pt.prototype[Symbol.iterator] = function () {
        var idx = 0;
        var count = this.length;
        var self = this;
        return {
            next: function () {
                return idx < count ? { done: false, value: self.get(idx++) } : { done: true, value: null };
            }
        };
    };
    Pt.prototype.abs = function () {
        this.each(function (p) {
            return Math.abs(p);
        });
        return this;
    };
    return Pt;
}(vectorious_1.Vector);
exports.Pt = Pt;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
var Pts = function () {
    function Pts() {
        this.vecs = [];
        this.names = [];
    }
    Pts.prototype.push = function (pt, name) {
        this.vecs.push(pt);
        this.names.push(name || "field" + this.vecs.length);
        return this;
    };
    Pts.prototype.pop = function () {
        var dv = this.vecs.pop();
        var dn = this.names.pop();
        return [dv, dn];
    };
    Pts.prototype.slice = function (start, end) {
        var dv = this.vecs.slice(start, end);
        var dn = this.names.slice(start, end);
        return [dv, dn];
    };
    return Pts;
}();
exports.Pts = Pts;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
var Pt_1 = __webpack_require__(1);
var Pts_1 = __webpack_require__(2);
var CanvasSpace_1 = __webpack_require__(7);
window["Pt"] = Pt_1.Pt;
window["Pts"] = Pts_1.Pts;
var canvas = new CanvasSpace_1.default("#pt");
console.log(canvas);
canvas.setup({ bgcolor: "#f00", resize: false });
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

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

(function () {
  'use strict';

  var Vector = __webpack_require__(0);

  /**
   * @method constructor
   * @desc Creates a `Matrix` from the supplied arguments.
   **/
  function Matrix (data, options) {
    this.type = Float64Array;
    this.shape = [];

    if (data && data.buffer && data.buffer instanceof ArrayBuffer) {
      return Matrix.fromTypedArray(data, options && options.shape);
    } else if (data instanceof Array) {
      return Matrix.fromArray(data);
    } else if (data instanceof Vector) {
      return Matrix.fromVector(data, options && options.shape);
    } else if (data instanceof Matrix) {
      return Matrix.fromMatrix(data);
    } else if (typeof data === "number" && typeof options === "number") {
      // Handle new Matrix(r, c)
      return Matrix.fromShape([data, options]);
    } else if (data && !data.buffer && data.shape) {
      // Handle new Matrix({ shape: [r, c] })
      return Matrix.fromShape(data.shape);
    }
  }
  
  Matrix.fromTypedArray = function (data, shape) {
    if (data.length !== shape[0] * shape[1])
      throw new Error("Shape does not match typed array dimensions.");

    var self = Object.create(Matrix.prototype);
    self.shape = shape;
    self.data = data;
    self.type = data.constructor;

    return self;
  };

  Matrix.fromArray = function (array) {
    var r = array.length, // number of rows
        c = array[0].length,  // number of columns
        data = new Float64Array(r * c);

    var i, j;
    for (i = 0; i < r; ++i)
      for (j = 0; j < c; ++j)
        data[i * c + j] = array[i][j];

    return Matrix.fromTypedArray(data, [r, c]);
  };
  
  Matrix.fromMatrix = function (matrix) {
    var self = Object.create(Matrix.prototype);
    self.shape = [matrix.shape[0], matrix.shape[1]];
    self.data = new matrix.type(matrix.data);
    self.type = matrix.type;
    
    return self;
  }
  
  Matrix.fromVector = function (vector, shape) {
    if (shape && vector.length !== shape[0] * shape[1])
      throw new Error("Shape does not match vector dimensions.");

    var self = Object.create(Matrix.prototype);
    self.shape = shape ? shape : [vector.length, 1];
    self.data = new vector.type(vector.data);
    self.type = vector.type;

    return self;
  }

  Matrix.fromShape = function (shape) {
    var r = shape[0], // number of rows
        c = shape[1]; // number of columns

    return Matrix.fromTypedArray(new Float64Array(r * c), shape);
  }

  /**
   * Static method. Perform binary operation on two matrices `a` and `b` together.
   * @param {Matrix} a
   * @param {Matrix} b
   * @param {function } op
   * @returns {Matrix} a new matrix containing the results of binary operation of `a` and `b`
   **/
  Matrix.binOp = function(a, b, op) {
    return new Matrix(a).binOp(b, op);
  };

  /**
   * Perform binary operation on `matrix` to the current matrix.
   * @param {Matrix} matrix
   * @param {function } op
   * @returns {Matrix} this
   **/
  Matrix.prototype.binOp = function(matrix, op) {
    var r = this.shape[0],          // rows in this matrix
        c = this.shape[1],          // columns in this matrix
        size = r * c,
        d1 = this.data,
        d2 = matrix.data;

    if (r !== matrix.shape[0] || c !== matrix.shape[1])
      throw new Error('sizes do not match!');

    var i;
    for (i = 0; i < size; i++)
      d1[i] = op(d1[i], d2[i], i);

    return this;
  };

  /**
   * Static method. Adds two matrices `a` and `b` together.
   * @param {Matrix} a
   * @param {Matrix} b
   * @returns {Matrix} a new matrix containing the sum of `a` and `b`
   **/
  Matrix.add = function (a, b) {
    return new Matrix(a).add(b);
  };

  /**
   * Adds `matrix` to current matrix.
   * @param {Matrix} a
   * @param {Matrix} b
   * @returns {Matrix} `this`
   **/
  Matrix.prototype.add = function (matrix) {
    return this.binOp(matrix, function(a, b) { return a + b });
  };

  /**
   * Static method. Subtracts the matrix `b` from matrix `a`.
   * @param {Matrix} a
   * @param {Matrix} b
   * @returns {Matrix} a new matrix containing the difference between `a` and `b`
   **/
  Matrix.subtract = function (a, b) {
    return new Matrix(a).subtract(b);
  };

  /**
   * Subtracts `matrix` from current matrix.
   * @param {Matrix} a
   * @param {Matrix} b
   * @returns {Matrix} `this`
   **/
  Matrix.prototype.subtract = function (matrix) {
    return this.binOp(matrix, function(a, b) { return a - b });
  };

  /**
   * Static method. Hadamard product of matrices
   * @param {Matrix} a
   * @param {Matrix} b
   * @returns {Matrix} a new matrix containing the hadamard product
   **/
  Matrix.product = function (a, b) {
    return new Matrix(a).product(b);
  };

  /**
   * Hadamard product of matrices
   * @param {Matrix} a
   * @param {Matrix} b
   * @returns {Matrix} `this`
   **/
  Matrix.prototype.product = function (matrix) {
    return this.binOp(matrix, function(a, b) { return a * b });
  };

  /**
   * Static method. Multiplies all elements of a matrix `a` with a specified `scalar`.
   * @param {Matrix} a
   * @param {Number} scalar
   * @returns {Matrix} a new scaled matrix
   **/
  Matrix.scale = function (a, scalar) {
    return new Matrix(a).scale(scalar);
  };

  /**
   * Multiplies all elements of current matrix with a specified `scalar`.
   * @param {Number} scalar
   * @returns {Matrix} `this`
   **/
  Matrix.prototype.scale = function (scalar) {
    var r = this.shape[0],          // rows in this matrix
        c = this.shape[1],          // columns in this matrix
        size = r * c,
        d1 = this.data,
        i;

    for (i = 0; i < size; i++)
      d1[i] *= scalar;

    return this;
  };

  /**
   * Static method. Creates a `r x c` matrix containing optional 'value' (default 0), takes
   * an optional `type` argument which should be an instance of `TypedArray`.
   * @param {Number} r
   * @param {Number} c
   * @param {Number || function} value
   * @param {TypedArray} type
   * @returns {Vector} a new matrix of the specified size and `type`
   **/
  Matrix.fill = function (r, c, value, type) {
    if (r <= 0 || c <= 0)
      throw new Error('invalid size');

    value = value || +0.0;
    type = type || Float64Array;

    var size = r * c,
        data = new type(size),
        isValueFn = typeof value === 'function',
        i, j, k = 0;
    
    for (i = 0; i < r; i++)
      for (j = 0; j < c; j++, k++)
        data[k] = isValueFn ? value(i, j) : value;

    return Matrix.fromTypedArray(data, [r, c]);
  };

  /**
   * Static method. Creates an `r x c` matrix containing zeros (`0`), takes an
   * optional `type` argument which should be an instance of `TypedArray`.
   * @param {Number} r
   * @param {Number} c
   * @param {TypedArray} type
   * @returns {Matrix} a matrix of the specified dimensions and `type`
   **/
  Matrix.zeros = function (r, c, type) {
    return Matrix.fill(r, c, +0.0, type);
  };

  /**
   * Static method. Creates an `r x c` matrix containing ones (`1`), takes an
   * optional `type` argument which should be an instance of `TypedArray`.
   * @param {Number} r
   * @param {Number} c
   * @param {TypedArray} type
   * @returns {Matrix} a matrix of the specified dimensions and `type`
   **/
  Matrix.ones = function (r, c, type) {
    return Matrix.fill(r, c, +1.0, type);
  };

  /**
   * Static method. Creates an `r x c` matrix containing random values
   * according to a normal distribution, takes an optional `type` argument
   * which should be an instance of `TypedArray`.
   * @param {Number} r
   * @param {Number} c
   * @param {Number} mean (default 0)
   * @param {Number} standard deviation (default 1)
   * @param {TypedArray} type
   * @returns {Matrix} a matrix of the specified dimensions and `type`
   **/
  Matrix.random = function (r, c, deviation, mean, type) {
    deviation = deviation || 1;
    mean = mean || 0;
    return Matrix.fill(r, c, function() {
      return deviation * Math.random() + mean;
    }, type);
  };

  /**
   * Static method. Multiplies two matrices `a` and `b` of matching dimensions.
   * @param {Matrix} a
   * @param {Matrix} b
   * @returns {Matrix} a new resultant matrix containing the matrix product of `a` and `b`
   **/
  Matrix.multiply = function (a, b) {
    return a.multiply(b);
  };

  /**
   * Multiplies two matrices `a` and `b` of matching dimensions.
   * @param {Matrix} a
   * @param {Matrix} b
   * @returns {Matrix} a new resultant matrix containing the matrix product of `a` and `b`
   **/
  Matrix.prototype.multiply = function (matrix) {
    var r1 = this.shape[0],   // rows in this matrix
        c1 = this.shape[1],   // columns in this matrix
        r2 = matrix.shape[0], // rows in multiplicand
        c2 = matrix.shape[1], // columns in multiplicand
        d1 = this.data,
        d2 = matrix.data;

    if (c1 !== r2)
      throw new Error('sizes do not match');

    var data = new this.type(r1 * c2),
        i, j, k,
        sum;
    for (i = 0; i < r1; i++) {
      for (j = 0; j < c2; j++) {
        sum = +0;
        for (k = 0; k < c1; k++)
          sum += d1[i * c1 + k] * d2[j + k * c2];

        data[i * c2 + j] = sum;
      }
    }

    return Matrix.fromTypedArray(data, [r1, c2]);
  };

  /**
   * Transposes a matrix (mirror across the diagonal).
   * @returns {Matrix} `this`
   **/

  Object.defineProperty(Matrix.prototype, 'T', {
    get: function() { return this.transpose(); }
  });

  Matrix.prototype.transpose = function () {
    var r = this.shape[0],
        c = this.shape[1],
        i, j;

    var data = new this.type(c * r);
    for (i = 0; i < r; i++)
      for (j = 0; j < c; j++)
        data[j * r + i] = this.data[i * c + j];

    return Matrix.fromTypedArray(data, [c, r]);
  };

  /**
   * Determines the inverse of any invertible square matrix using
   * Gaussian elimination.
   * @returns {Matrix} the inverse of the matrix
   **/
  Matrix.prototype.inverse = function () {
    var l = this.shape[0],
        m = this.shape[1];

    if (l !== m)
      throw new Error('invalid dimensions');

    var identity = Matrix.identity(l);
    var augmented = Matrix.augment(this, identity);
    var gauss = augmented.gauss();

    var left = Matrix.zeros(l, m),
        right = Matrix.zeros(l, m),
        n = gauss.shape[1],
        i, j;
    for (i = 0; i < l; i++) {
      for (j = 0; j < n; j++) {
        if (j < m)
          left.set(i, j, gauss.get(i, j));
        else
          right.set(i, j - l, gauss.get(i, j));
      }
    }

    if (!left.equals(Matrix.identity(l)))
      throw new Error('matrix is not invertible');

    return right;
  };

  /**
   * Performs Gaussian elimination on a matrix.
   * @returns {Matrix} the matrix in reduced row echelon form
   **/
  Matrix.prototype.gauss = function () {
    var l = this.shape[0],
        m = this.shape[1];

    var copy = new Matrix(this),
        lead = 0,
        pivot,
        i, j, k,
        leadValue;

    for (i = 0; i < l; i++) {
      if (m <= lead)
        return new Error('matrix is singular');

      j = i;
      while (copy.data[j * m + lead] === 0) {
        j++;
        if (l === j) {
          j = i;
          lead++;

          if (m === lead)
            return new Error('matrix is singular');
        }
      }

      copy.swap(i, j);

      pivot = copy.data[i * m + lead];
      if (pivot !== 0) {
        // scale down the row by value of pivot
        for (k = 0; k < m; k++)
          copy.data[(i * m) + k] = copy.data[(i * m) + k] / pivot;
      }


      for (j = 0; j < l; j++) {
        leadValue = copy.data[j * m + lead];
        if (j !== i)
          for (k = 0; k < m; k++)
            copy.data[j * m + k] = copy.data[j * m + k] - (copy.data[i * m + k] * leadValue);
      }

      lead++;
    }

    for (i = 0; i < l; i++) {
      pivot = 0;
      for (j = 0; j < m; j++)
        if (!pivot)
          pivot = copy.data[i * m + j];

      if (pivot)
        // scale down the row by value of pivot
        for (k = 0; k < m; k++)
          copy.data[(i * m) + k] = copy.data[(i * m) + k] / pivot;
    }

    return copy;
  };

  /**
   * Performs full LU decomposition on a matrix.
   * @returns {Array} a triple (3-tuple) of the lower triangular resultant matrix `L`, the upper
   * triangular resultant matrix `U` and the pivot array `ipiv`
   **/
  Matrix.prototype.lu = function () {
    var r = this.shape[0],
        c = this.shape[1],
        plu = Matrix.plu(this),
        ipiv = plu[1],
        pivot = Matrix.identity(r),
        lower = new Matrix(plu[0]),
        upper = new Matrix(plu[0]),
        i, j;

    for (i = 0; i < r; i++)
      for (j = i; j < c; j++)
        lower.data[i * c + j] = i === j ? 1 : 0;

    for (i = 0; i < r; i++)
      for (j = 0; j < i && j < c; j++)
        upper.data[i * c + j] = 0;

    return [lower, upper, ipiv];
  };

  /**
   * Static method. Performs LU factorization on current matrix.
   * @returns {Array} an array with a new instance of the current matrix LU-
   * factorized and the corresponding pivot Int32Array
   **/
  Matrix.plu = function(matrix) {
    return new Matrix(matrix).plu();
  };

  /**
   * Performs LU factorization on current matrix.
   * @returns {Array} an array with the current matrix LU-factorized and the
   * corresponding pivot Int32Array
   **/
  Matrix.prototype.plu = function () {
    var data = this.data,
        n = this.shape[0],
        ipiv = new Int32Array(n),
        max, abs, diag, p,
        i, j, k;

    for (k = 0; k < n; ++k) {
      p = k;
      max = Math.abs(data[k * n + k]);
      for (j = k + 1; j < n; ++j) {
        abs = Math.abs(data[j * n + k]);
        if (max < abs) {
          max = abs;
          p = j;
        }
      }

      ipiv[k] = p;

      if (p !== k)
        this.swap(k, p);

      diag = data[k * n + k];
      for (i = k + 1; i < n; ++i)
        data[i * n + k] /= diag;

      for (i = k + 1; i < n; ++i) {
        for (j = k + 1; j < n - 1; ++j) {
          data[i * n + j] -= data[i * n + k] * data[k * n + j];
          ++j;
          data[i * n + j] -= data[i * n + k] * data[k * n + j];
        }

        if(j === n - 1)
          data[i * n + j] -= data[i * n + k] * data[k * n + j];
      }
    }

    return [this, ipiv];
  };

  /**
   * Solves an LU factorized matrix with the supplied right hand side(s)
   * @param {Matrix} rhs, right hand side(s) to solve for
   * @param {Int32Array} array of pivoted row indices
   * @returns {Matrix} rhs replaced by the solution
   **/
  Matrix.prototype.lusolve = function (rhs, ipiv) {
    var lu = this.data,
        n = rhs.shape[0],
        nrhs = rhs.shape[1],
        x = rhs.data,
        i, j, k;

    // pivot right hand side
    for (i = 0; i < ipiv.length; i++)
      if (i !== ipiv[i])
        rhs.swap(i, ipiv[i]);

    for (k = 0; k < nrhs; k++) {
      // forward solve
      for (i = 0; i < n; i++)
        for (j = 0; j < i; j++)
          x[i * nrhs + k] -= lu[i * n + j] * x[j * nrhs + k];

      // backward solve
      for (i = n - 1; i >= 0; i--) {
        for (j = i + 1; j < n; j++)
          x[i * nrhs + k] -= lu[i * n + j] * x[j * nrhs + k];
        x[i * nrhs + k] /= lu[i * n + i];
      }
    }

    return rhs;
  };

  /**
   * Solves AX = B using LU factorization, where A is the current matrix and
   * B is a Vector/Matrix containing the right hand side(s) of the equation.
   * @param {Matrix/Vector} rhs, right hand side(s) to solve for
   * @param {Int32Array} array of pivoted row indices
   * @returns {Matrix} a new matrix containing the solutions of the system
   **/
  Matrix.prototype.solve = function (rhs) {
    var plu = Matrix.plu(this),
        lu = plu[0],
        ipiv = plu[1];

    return lu.lusolve(new Matrix(rhs), ipiv);
  };

  /**
   * Static method. Augments two matrices `a` and `b` of matching dimensions
   * (appends `b` to `a`).
   * @param {Matrix} a
   * @param {Matrix} b
   * @returns {Matrix} the resultant matrix of `b` augmented to `a`
   **/
  Matrix.augment = function (a, b) {
    return new Matrix(a).augment(b);
  };

  /**
   * Augments `matrix` with current matrix.
   * @param {Matrix} matrix
   * @returns {Matrix} `this`
   **/
  Matrix.prototype.augment = function (matrix) {
    if (matrix.shape.length === 0)
     return this;

    var r1 = this.shape[0],
        c1 = this.shape[1],
        r2 = matrix.shape[0],
        c2 = matrix.shape[1],
        d1 = this.data,
        d2 = matrix.data,
        i, j;

    if (r1 !== r2)
      throw new Error("Rows do not match.");

    var length = c1 + c2,
        data = new this.type(length * r1);

    for (i = 0; i < r1; i++)
      for (j = 0; j < c1; j++)
        data[i * length + j] = d1[i * c1 + j];

    for (i = 0; i < r2; i++)
      for (j = 0; j < c2; j++)
        data[i * length + j + c1] = d2[i * c2 + j];

    this.shape = [r1, length];
    this.data = data;

    return this;
  };

  /**
   * Static method. Creates an identity matrix of `size`, takes an optional `type` argument
   * which should be an instance of `TypedArray`.
   * @param {Number} size
   * @param {TypedArray} type
   * @returns {Matrix} an identity matrix of the specified `size` and `type`
   **/
  Matrix.identity = function (size, type) {
    return Matrix.fill(size, size, function (i, j) {
      return i === j ? +1.0 : +0.0;
    })
  };

  /**
   * Static method. Creates a magic square matrix of `size`, takes an optional `type` argument
   * which should be an instance of `TypedArray`.
   * @param {Number} size
   * @param {Number} type
   * @returns {Matrix} a magic square matrix of the specified `size` and `type`
   **/
  Matrix.magic = function (size, type) {
    if (size < 0)
      throw new Error('invalid size');

    function f(n, x, y) {
      return (x + y * 2 + 1) % n;
    }

    type = type || Float64Array;
    var data = new type(size * size),
        i, j;
    for (i = 0; i < size; i++)
      for (j = 0; j < size; j++)
        data[(size - i - 1) * size + (size - j - 1)] =
          f(size, size - j - 1, i) * size + f(size, j, i) + 1;

    return Matrix.fromTypedArray(data, [size, size]);
  };

  /**
   * Gets the diagonal of a matrix.
   * @returns {Vector} the diagonal of the matrix as a vector
   **/
  Matrix.prototype.diag = function () {
    var r = this.shape[0],
        c = this.shape[1],
        data = new this.type(Math.min(r, c)),
        i;

    for (i = 0; i < r && i < c; i++)
      data[i] = this.data[i * c + i];

    return new Vector(data);
  };

  /**
   * Gets the determinant of any square matrix using LU factorization.
   * @returns {Number} the determinant of the matrix
   **/
  Matrix.prototype.determinant = function () {
    if (this.shape[0] !== this.shape[1])
      throw new Error('matrix is not square');

    var plu = Matrix.plu(this),
        ipiv = plu.pop(),
        lu = plu.pop(),
        r = this.shape[0],
        c = this.shape[1],
        product = 1,
        sign = 1,
        i;

    // get sign from ipiv
    for (i = 0; i < r; i++)
      if (i !== ipiv[i])
        sign *= -1;

    for (i = 0; i < r; i++)
      product *= lu.data[i * c + i];

    return sign * product;
  };

  /**
   * Gets the trace of the matrix (the sum of all diagonal elements).
   * @returns {Number} the trace of the matrix
   **/
  Matrix.prototype.trace = function () {
    var diagonal = this.diag(),
        result = 0,
        i, l;

    for (i = 0, l = diagonal.length; i < l; i++)
      result += diagonal.get(i);

    return result;
  };

  /**
   * Static method. Checks the equality of two matrices `a` and `b`.
   * @param {Matrix} a
   * @param {Matrix} b
   * @returns {Boolean} `true` if equal, `false` otherwise
   **/
  Matrix.equals = function (a, b) {
    return a.equals(b);
  };

  /**
   * Checks the equality of `matrix` and current matrix.
   * @param {Matrix} matrix
   * @returns {Boolean} `true` if equal, `false` otherwise
   **/
  Matrix.prototype.equals = function (matrix) {
    var r = this.shape[0],
        c = this.shape[1],
        size = r * c,
        d1 = this.data,
        d2 = matrix.data;

    if (r !== matrix.shape[0] || c !== matrix.shape[1] || this.type !== matrix.type)
      return false;

    var i;
    for (i = 0; i < size; i++)
      if (d1[i] !== d2[i])
        return false;

    return true;
  };

  /**
   * Gets the value of the element in row `i`, column `j` of current matrix
   * @param {Number} i
   * @param {Number} j
   * @returns {Number} the element at row `i`, column `j` of current matrix
   **/
  Matrix.prototype.get = function (i, j) {
    if (i < 0 || j < 0 || i > this.shape[0] - 1 || j > this.shape[1] - 1)
      throw new Error('index out of bounds');

    return this.data[i * this.shape[1] + j];
  };

  /**
   * Sets the element at row `i`, column `j` to value
   * @param {Number} i
   * @param {Number} j
   * @param {Number} value
   * @returns {Matrix} `this`
   **/
  Matrix.prototype.set = function (i, j, value) {
    if (i < 0 || j < 0 || i > this.shape[0] - 1 || j > this.shape[1] - 1)
      throw new Error('index out of bounds');

    this.data[i * this.shape[1] + j] = value;
    return this;
  };

  /**
   * Swaps two rows `i` and `j` in a matrix
   * @param {Number} i
   * @param {Number} j
   * @returns {Matrix} `this`
   **/
  Matrix.prototype.swap = function (i, j) {
    if (i < 0 || j < 0 || i > this.shape[0] - 1 || j > this.shape[0] - 1)
      throw new Error('index out of bounds');

    var c = this.shape[1];

    // copy first row
    var copy = this.data.slice(i * c, (i + 1) * c);
    // move second row into first row spot
    this.data.copyWithin(i * c, j * c, (j + 1) * c);
    // copy first row back into second row spot
    this.data.set(copy, j * c);

    return this;
  };

  /**
   * Maps a function `callback` to all elements of a copy of current matrix.
   * @param {Function} callback
   * @returns {Matrix} the resultant mapped matrix
   **/
  Matrix.prototype.map = function (callback) {
    var r = this.shape[0],
        c = this.shape[1],
        size = r * c,
        mapped = new Matrix(this),
        data = mapped.data,
        i;

    for (i = 0; i < size; i++)
      data[i] = callback.call(mapped, data[i], i / c | 0, i % c, data);

    return mapped;
  };

  /**
   * Functional version of for-looping the elements in a matrix, is
   * equivalent to `Array.prototype.forEach`.
   * @param {Function} callback
   * @returns {Matrix} `this`
   **/
  Matrix.prototype.each = function (callback) {
    var r = this.shape[0],
        c = this.shape[1],
        size = r * c,
        i;

    for (i = 0; i < size; i++)
      callback.call(this, this.data[i], i / c | 0, i % c);

    return this;
  };

  /**
   * Equivalent to `TypedArray.prototype.reduce`.
   * @param {Function} callback
   * @param {Number} initialValue
   * @returns {Number} result of reduction
   **/
  Matrix.prototype.reduce = function (callback, initialValue) {
    var r = this.shape[0],
        c = this.shape[1],
        size = r * c;

    if (size === 0 && !initialValue)
      throw new Error('Reduce of empty matrix with no initial value.');

    var i = 0,
        value = initialValue || this.data[i++];

    for (; i < size; i++)
      value = callback.call(this, value, this.data[i], i / c | 0, i % c);
    return value;
  };

  /**
   * Finds the rank of the matrix using row echelon form
   * @returns {Number} rank
   **/
  Matrix.prototype.rank = function () {
    var vectors = this
      .toArray()
      .map(function(r) {
        return new Vector(r);
      });

    var r = this.shape[0],
        c = this.shape[1],
        counter = 0,
        i, j, tmp,
        pivot, target, scalar;

    for (i = 0; i < r - 1; i++) {
      // go through each row until the row before the last
      pivot = null;
      for (j = i; j < r; j++) {
        // find the pivot (first row where column of same index is non-zero)
        if (vectors[i].get(i)) {
          if (i !== j) {
            // if not the current row, swap the rows, bring pivot the current row index
            tmp = vectors[i];
            vectors[i] = vectors[j];
            vectors[j] = tmp;
          }
          pivot = vectors[i];
          break;
        }
      }
      // if pivot not found, continue
      if (!pivot)
        continue;

      // otherwise, for all rows underneath pivot, cancel all column index to zero
      for (j = (i + 1); j < r; j++) {
        target = vectors[j];
        scalar = target.get(i) / pivot.get(i);
        vectors[j] = target.subtract(pivot.scale(scalar));
      }
    }

    // now vectors should be in row echelon form!
    // use optimized loops to count number of vectors that have non-zero values
    for (i = 0; i < r; i++) {
      for (j = 0; j < c; j++) {
        if (vectors[i].get(j)) {
          counter++;
          break;
        }
      }
    }

    // should be rank
    return counter;
  };

  Matrix.rank = function (matrix) {
    return new Matrix(matrix).rank();
  };

  /**
   * Converts current matrix into a readable formatted string
   * @returns {String} a string of the matrix' contents
   **/
  Matrix.prototype.toString = function () {
    var result = [],
        r = this.shape[0],
        c = this.shape[1],
        i;

    for (i = 0; i < r; i++)
      // get string version of current row and store it
      result.push('[' + this.data.subarray(i * c, (i + 1) * c ).toString() + ']');

    return '[' + result.join(', \n') + ']';
  };

  /**
   * Converts current matrix into a two-dimensional array
   * @returns {Array} an array of the matrix' contents
   **/
  Matrix.prototype.toArray = function () {
    var result = [],
        r = this.shape[0],
        c = this.shape[1],
        i;

    for (i = 0; i < r; i++)
      // copy current row into a native array and store it
      result.push(Array.prototype.slice.call(this.data.subarray(i * c, (i + 1) * c)));

    return result;
  };

  module.exports = Matrix;
  try {
    window.Matrix = Matrix;
  } catch (e) {}
}());


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

(function () {
  'use strict';

  var Vector = module.exports.Vector = __webpack_require__(0),
      Matrix = module.exports.Matrix = __webpack_require__(4);

/*
  try {
    var nblas = module.exports.BLAS = require('nblas'),
        applyBlasOptimizations = require('./applyBlasOptimizations');
    
    applyBlasOptimizations(Vector, Matrix, nblas);
  } catch (error) {

  }
*/

}());


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
var Pt_1 = __webpack_require__(1);
var Bound = function () {
    function Bound(p1, p2) {
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
    Bound.prototype._updateSize = function () {
        this._size = this._bottomRight.$subtract(this._topLeft).abs();
        this._updateCenter();
    };
    Bound.prototype._updateCenter = function () {
        this._center = this._size.$scale(0.5).add(this._topLeft);
    };
    Bound.prototype._updatePosFromTop = function () {
        this._bottomRight = this._topLeft.$add(this._size);
        this._updateCenter();
    };
    Bound.prototype._updatePosFromBottom = function () {
        this._topLeft = this._bottomRight.$subtract(this._size);
        this._updateCenter();
    };
    Bound.prototype._updatePosFromCenter = function () {
        var half = this._size.$scale(0.5);
        this._topLeft = this._center.$subtract(half);
        this._bottomRight = this._center.$add(half);
    };
    Object.defineProperty(Bound.prototype, "size", {
        get: function () {
            return new Pt_1.Pt(this._size);
        },
        set: function (p) {
            this._size = new Pt_1.Pt(p);
            this._updatePosFromTop();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Bound.prototype, "center", {
        get: function () {
            return new Pt_1.Pt(this._center);
        },
        set: function (p) {
            this._center = new Pt_1.Pt(p);
            this._updatePosFromCenter();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Bound.prototype, "topLeft", {
        get: function () {
            return new Pt_1.Pt(this._topLeft);
        },
        set: function (p) {
            this._topLeft = new Pt_1.Pt(p);
            this._updateSize();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Bound.prototype, "bottomRight", {
        get: function () {
            return new Pt_1.Pt(this._bottomRight);
        },
        set: function (p) {
            this._bottomRight = new Pt_1.Pt(p);
            this._updateSize();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Bound.prototype, "width", {
        get: function () {
            return this._size.x;
        },
        set: function (w) {
            this._size.x = w;
            this._updatePosFromTop();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Bound.prototype, "height", {
        get: function () {
            return this._size.y;
        },
        set: function (h) {
            this._size.y = h;
            this._updatePosFromTop();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Bound.prototype, "depth", {
        get: function () {
            return this._size.z;
        },
        set: function (d) {
            this._size.z = d;
            this._updatePosFromTop();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Bound.prototype, "x", {
        get: function () {
            return this.topLeft.x;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Bound.prototype, "y", {
        get: function () {
            return this.topLeft.y;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Bound.prototype, "z", {
        get: function () {
            return this.topLeft.z;
        },
        enumerable: true,
        configurable: true
    });
    Bound.fromBoundingRect = function (rect) {
        var b = new Bound(new Pt_1.Pt(rect.left || 0, rect.top || 0), new Pt_1.Pt(rect.right || 0, rect.bottom || 0));
        if (rect.width && rect.height) b.size = new Pt_1.Pt(rect.width, rect.height);
        return b;
    };
    return Bound;
}();
exports.Bound = Bound;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var __extends = this && this.__extends || function () {
    var extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
        d.__proto__ = b;
    } || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() {
            this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
}();
Object.defineProperty(exports, "__esModule", { value: true });
var Space_1 = __webpack_require__(8);
var Pts_1 = __webpack_require__(2);
var Bound_1 = __webpack_require__(6);
var CanvasSpace = function (_super) {
    __extends(CanvasSpace, _super);
    /**
     * Create a CanvasSpace which represents a HTML Canvas Space
     * @param elem Specify an element by its "id" attribute as string, or by the element object itself. An element can be an existing `<canvas>`, or a `<div>` container in which a new `<canvas>` will be created. If left empty, a `<div id="pt_container"><canvas id="pt" /></div>` will be added to DOM. Use css to customize its appearance if needed.
     * @param callback an optional callback `function(boundingBox, spaceElement)` to be called when canvas is appended and ready. A "ready" event will also be fired from the `<canvas>` element when it's appended, which can be traced with `spaceInstance.space.addEventListener("ready")`
     */
    function CanvasSpace(elem, callback) {
        var _this = _super.call(this) || this;
        _this._pixelScale = 1;
        _this._autoResize = false;
        _this._bgcolor = "#F3F7FA";
        // track mouse dragging
        _this._mousedown = false;
        _this._mousedrag = false;
        var _selector = null;
        var _existed = false;
        _this.id = "pt";
        // check element or element id string
        if (elem instanceof Element) {
            _selector = elem;
            _this.id = "pts_existing_space";
        } else {
            ;
            _selector = document.querySelector(elem);
            _existed = true;
            _this.id = elem;
        }
        // if selector is not defined, create a canvas
        if (!_selector) {
            _this._container = _this._createElement("div", _this.id + "_container");
            _this._canvas = _this._createElement("canvas", _this.id);
            _this._container.appendChild(_this._canvas);
            document.body.appendChild(_this._container);
            _existed = false;
            // if selector is element but not canvas, create a canvas inside it
        } else if (_selector.nodeName.toLowerCase() != "canvas") {
            _this._container = _selector;
            _this._canvas = _this._createElement("canvas", _this.id + "_canvas");
            _this._container.appendChild(_this._canvas);
            // if selector is an existing canvas
        } else {
            _this._canvas = _selector;
            _this._container = _selector.parentElement;
        }
        // if size is known then set it immediately
        // if (_existed) {
        // let b = this._container.getBoundingClientRect();
        // this.resize( Bound.fromBoundingRect(b) );
        // }
        // no mutation observer, so we set a timeout for ready event
        setTimeout(_this._ready.bind(_this, callback), 50);
        // store canvas 2d rendering context
        _this._ctx = _this._canvas.getContext('2d');
        return _this;
    }
    CanvasSpace.prototype._createElement = function (elem, id) {
        if (elem === void 0) {
            elem = "div";
        }
        var d = document.createElement(elem);
        d.setAttribute("id", id);
        return d;
    };
    CanvasSpace.prototype._ready = function (callback) {
        if (!this._container) throw "Cannot initiate #" + this.id + " element";
        if (this._autoResize) {
            var b = this._container.getBoundingClientRect();
            this.resize(Bound_1.Bound.fromBoundingRect(b));
        }
        this.clear(this._bgcolor);
        this._canvas.dispatchEvent(new Event("ready"));
        if (callback) callback(this.bound, this._canvas);
    };
    /**
     * Set up various options for CanvasSpace. The `opt` parameter is an object with the following fields. This is usually set during instantiation, eg `new CanvasSpace(...).setup( { opt } )`
     * @param opt an object with optional settings, as follows.
     * @param opt.bgcolor a hex or rgba string to set initial background color of the canvas, or use `false` or "transparent" to set a transparent background. You may also change it later with `clear()`
     * @param opt.resize a boolean to set whether `<canvas>` size should auto resize to match its container's size. You can also set it manually with `autoSize()`
     * @param opt.retina a boolean to set if device pixel scaling should be used. This may make drawings on retina displays look sharper but may reduce performance slightly. Default is `true`.
     */
    CanvasSpace.prototype.setup = function (opt) {
        if (opt.bgcolor) this._bgcolor = opt.bgcolor;
        this._autoResize = opt.resize === true;
        if (opt.retina !== false) {
            var r1 = window.devicePixelRatio || 1;
            var r2 = this._ctx.webkitBackingStorePixelRatio || this._ctx.mozBackingStorePixelRatio || this._ctx.msBackingStorePixelRatio || this._ctx.oBackingStorePixelRatio || this._ctx.backingStorePixelRatio || 1;
            this._pixelScale = r1 / r2;
        }
        return this;
    };
    CanvasSpace.prototype._resizeHandler = function (evt) {
        var b = this._container.getBoundingClientRect();
        this.resize(Bound_1.Bound.fromBoundingRect(b), evt);
    };
    /**
     * Set whether the canvas element should resize when its container is resized. Default will auto size
     * @param auto a boolean value indicating if auto size is set. Default is `true`.
     */
    CanvasSpace.prototype.autoResize = function (auto) {
        if (auto === void 0) {
            auto = true;
        }
        if (auto) {
            window.addEventListener('resize', this._resizeHandler);
        } else {
            window.removeEventListener('resize', this._resizeHandler);
        }
        return this;
    };
    Object.defineProperty(CanvasSpace.prototype, "element", {
        get: function () {
            return this._canvas;
        },
        enumerable: true,
        configurable: true
    });
    CanvasSpace.prototype.render = function (context) {
        return this;
    };
    CanvasSpace.prototype.resize = function (b, evt) {
        this.bound = b;
        var s = this.bound.size.$scale(this._pixelScale);
        this._canvas.width = s.x;
        this._canvas.height = s.y;
        this._canvas.style.width = s.x + "px";
        this._canvas.style.height = s.y + "px";
        if (this._pixelScale != 1) this._ctx.scale(this._pixelScale, this._pixelScale);
        for (var k in this.players) {
            var p = this.players[k];
            if (p.onSpaceResize) p.onSpaceResize(this.bound.size, evt);
        }
        this.render(this._ctx);
        return this;
    };
    CanvasSpace.prototype.clear = function (bg) {
        if (bg) this._bgcolor = bg;
        var lastColor = this._ctx.fillStyle;
        if (this._bgcolor && this._bgcolor != "transparent") {
            this._ctx.fillStyle = this._bgcolor;
            this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
        } else {
            this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
        }
        this._ctx.fillStyle = lastColor;
        return this;
    };
    CanvasSpace.prototype.playItems = function (time) {
        this._ctx.save();
        _super.prototype.playItems.call(this, time);
        this._ctx.restore();
    };
    CanvasSpace.prototype.bindCanvas = function (evt, callback) {
        this._canvas.addEventListener(evt, callback);
    };
    CanvasSpace.prototype.unbindCanvas = function (evt, callback) {
        this._canvas.removeEventListener(evt, callback);
    };
    CanvasSpace.prototype.bindMouse = function (_bind) {
        if (_bind === void 0) {
            _bind = true;
        }
        if (_bind) {
            // this.bindCanvas( "mousedown", this._mousedown.bind(this) )
        } else {}
    };
    CanvasSpace.prototype.bindTouch = function (_bind) {
        if (_bind === void 0) {
            _bind = true;
        }
    };
    CanvasSpace.prototype.touchesToPoints = function (evt, which) {
        return new Pts_1.Pts();
    };
    CanvasSpace.prototype._mouseAction = function (type, evt) {
        if (evt instanceof TouchEvent) {
            for (var k in this.playItems) {
                var v = this.playItems[k];
                var c = evt.changedTouches && evt.changedTouches.length > 0;
                var px = c ? evt.changedTouches.item(0).pageX : 0;
                var py = c ? evt.changedTouches.item(0).pageY : 0;
                v.onTouchAction(type, px, py, evt);
            }
        } else {
            for (var k in this.playItems) {
                var v = this.playItems[k];
                var px = evt.offsetX || evt.layerX;
                var py = evt.offsetY || evt.layerY;
                v.onMouseAction(type, px, py, evt);
            }
        }
    };
    CanvasSpace.prototype._mouseDown = function (evt) {};
    CanvasSpace.prototype._mouseUp = function (evt) {};
    return CanvasSpace;
}(Space_1.Space);
exports.default = CanvasSpace;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
var Bound_1 = __webpack_require__(6);
var Pts_1 = __webpack_require__(2);
var Space = function () {
    function Space() {
        this.id = "space";
        this.bound = new Bound_1.Bound();
        this._time = { prev: 0, diff: 0, end: -1 };
        this.players = {};
        this.playerCount = 0;
        this.ctx = {};
        this._animID = -1;
        this._pause = false;
        this._refresh = false;
    }
    /**
     * Set whether the rendering should be repainted on each frame
     * @param b a boolean value to set whether to repaint each frame
     */
    Space.prototype.refresh = function (b) {
        this._refresh = b;
        return this;
    };
    /**
     * Add an item to this space. An item must define a callback function `animate( time, fps, context )` and will be assigned a property `animateID` automatically.
     * An item should also define a callback function `onSpaceResize( w, h, evt )`.
     * Subclasses of Space may define other callback functions.
     * @param player
     */
    Space.prototype.add = function (player) {
        var k = this.playerCount++;
        var pid = this.id + k;
        this.players[pid] = player;
        player.animateID = pid;
        player.onSpaceResize(this.bound);
        return this;
    };
    /**
     * Remove a player from this Space
     * @param player an IPlayer that has an `animateID` property
     */
    Space.prototype.remove = function (player) {
        delete this.players[player.animateID];
        return this;
    };
    /**
     * Remove all players from this Space
     */
    Space.prototype.removeAll = function () {
        this.players = {};
        return this;
    };
    /**
     * Main play loop. This implements window.requestAnimationFrame and calls it recursively.
     * Override this `play()` function to implemenet your own animation loop.
     * @param time current time
     */
    Space.prototype.play = function (time) {
        var _this = this;
        if (time === void 0) {
            time = 0;
        }
        this._animID = requestAnimationFrame(function (t) {
            return _this.play(t);
        });
        if (this._pause) return this;
        this._time.diff = time - this._time.prev;
        try {
            this.playItems(time);
        } catch (err) {
            cancelAnimationFrame(this._animID);
            throw err;
        }
        return this;
    };
    /**
     * Main animate function. This calls all the items to perform
     * @param time current time
     */
    Space.prototype.playItems = function (time) {
        // clear before draw if refresh is true
        if (this._refresh) this.clear();
        // animate all players
        for (var k in this.players) {
            this.players[k].animate(time, this._time.diff, this.ctx);
        }
        // stop if time ended
        if (this._time.end >= 0 && time > this._time.end) {
            cancelAnimationFrame(this._animID);
        }
    };
    /**
     * Pause the animation
     * @param toggle a boolean value to set if this function call should be a toggle (between pause and resume)
     */
    Space.prototype.pause = function (toggle) {
        if (toggle === void 0) {
            toggle = false;
        }
        this._pause = toggle ? !this._pause : true;
        return this;
    };
    /**
     * Resume the pause animation
     */
    Space.prototype.resume = function () {
        this._pause = false;
        return this;
    };
    /**
     * Specify when the animation should stop: immediately, after a time period, or never stops.
     * @param t a value in millisecond to specify a time period to play before stopping, or `-1` to play forever, or `0` to end immediately. Default is 0 which will stop the animation immediately.
     */
    Space.prototype.stop = function (t) {
        if (t === void 0) {
            t = 0;
        }
        this._time.end = t;
        return this;
    };
    /**
     * Play animation loop, and then stop after `duration` time has passed.
     * @param duration a value in millisecond to specify a time period to play before stopping, or `-1` to play forever
     */
    Space.prototype.playOnce = function (duration) {
        if (duration === void 0) {
            duration = 5000;
        }
        this.play();
        this.stop(duration);
        return this;
    };
    /**
     * Bind event listener in canvas element, for events such as mouse events. Not implemented.
     * @param evt
     * @param callback
     */
    Space.prototype.bindCanvas = function (evt, callback) {};
    /**
     * Unbind event listener in canvas element, for events such as mouse events. Not implemented.
     * @param evt
     * @param callback
     */
    Space.prototype.unbindCanvas = function (evt, callback) {};
    /**
     * A convenient method to bind (or unbind) all mouse events. Not implemented.
     * @param _bind
     */
    Space.prototype.bindMouse = function (_bind) {};
    /**
     * A convenient method to bind (or unbind) all mobile touch events. Not implemented.
     * @param _bind
     */
    Space.prototype.bindTouch = function (_bind) {};
    /**
     * A convenient method to convert the touch points in a touch event to a Pts. Not implemented.
     * @param evt
     * @param which
     */
    Space.prototype.touchesToPoints = function (evt, which) {
        return new Pts_1.Pts();
    };
    return Space;
}();
exports.Space = Space;

/***/ })
/******/ ]);
//# sourceMappingURL=pts.js.map