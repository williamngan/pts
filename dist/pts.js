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
/******/ 	return __webpack_require__(__webpack_require__.s = 9);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
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
var Vector_1 = __webpack_require__(11);
__webpack_require__(10);
var Pt = function (_super) {
    __extends(Pt, _super);
    /**
     * Create a Pt. This will instantiate with at least 3 dimensions. If provided parameters are less than 3 dimensions, default value of 0 will be used to fill. Use 'Pt.$()' if you need 1D or 2D specifically.
     * Example: `new Pt()`, `new Pt(1,2,3,4,5)`, `new Pt([1,2])`, `new Pt({x:0, y:1})`, `new Pt(pt)`
     * @param args a list of numbers, an array of number, or an object with {x,y,z,w} properties
     */
    function Pt() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var _this = this;
        var p = Pt.getArgs(args);
        for (var i = p.length; i < 3; i++) {
            p.push(0);
        } // fill to 3 dimensions
        _this = _super.call(this, p) || this;
        return _this;
    }
    /**
     * Create a Pt without padding to 3 dimensions. This allows you to create Pt with less than 3 dimensions.
     * Example: `Pt.$()`, `Pt.$(1,2,3,4,5)`, `Pt.$([1,2])`, `Pt.$({x:0, y:1})`, `Pt.$(pt)`
     * @param args a list of numbers, an array of number, or an object with {x,y,z,w} properties
     */
    Pt.$ = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var p = Pt.getArgs(args);
        var pt = new Pt();
        pt.data = new Float64Array(p);
        pt.length = p.length;
        return pt;
    };
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
    Pt.prototype.set = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var p = Pt.getArgs(args);
        for (var i = 0; i < p.length; i++) {
            _super.prototype.set.call(this, i, p[i]);
        }
        this.length = Math.max(this.length, p.length);
        return this;
    };
    /**
     * Apply a series of functions to transform this Pt. The function should have this form: (p:Pt) => Pt
     * @param fns a list of function as array or object {key: function}
     */
    Pt.prototype.to = function (fns) {
        var results = [];
        for (var k in fns) {
            results[k] = fns[k](this);
        }
        return results;
    };
    // Override the functions in vectorious library
    Pt.prototype.add = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return _super.prototype.add.call(this, new Pt(Pt.getArgs(args)));
    };
    Pt.prototype.subtract = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return _super.prototype.subtract.call(this, new Pt(Pt.getArgs(args)));
    };
    Pt.prototype.multiply = function (n) {
        return this.scale(n);
    };
    Pt.prototype.divide = function (n) {
        return this.scale(1 / n);
    };
    Pt.prototype.$add = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return new Pt(this).add(Pt.getArgs(args));
    };
    Pt.prototype.$subtract = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return new Pt(this).subtract(Pt.getArgs(args));
    };
    Pt.prototype.$multiply = function (n) {
        return this.$scale(n);
    };
    Pt.prototype.$divide = function (n) {
        return this.$scale(1 / n);
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
    /**
     * Clone this and return a new Pt
     */
    Pt.prototype.clone = function () {
        return new Pt(this);
    };
    /**
     * Similar to `get()`, but return a default value instead of throwing error when index is out-of-bound,
     * @param idx index to get
     * @param defaultValue value to return when index is out of bound
     */
    Pt.prototype.at = function (idx, defaultValue) {
        return this.data[idx] || defaultValue;
    };
    /**
     * Get a new Pt based on a slice of this Pt. Similar to `Array.slice()`.
     * @param start start index
     * @param end end index (ie, entry will not include value at this index)
     */
    Pt.prototype.slice = function (start, end) {
        return new Pt([].slice.call(this.data.slice(start, end)));
    };
    /**
     * Absolute values for all values in this pt
     */
    Pt.prototype.abs = function () {
        this.each(function (p) {
            return Math.abs(p);
        });
        return this;
    };
    /**
     * Get a new Pt with absolute values of this Pt
     */
    Pt.prototype.$abs = function () {
        return this.clone().abs();
    };
    /**
     * Convert to a unit vector
     */
    Pt.prototype.unit = function () {
        return this.divide(this.magnitude());
    };
    /**
     * Get a unit vector from this Pt
     */
    Pt.prototype.$unit = function () {
        return this.clone().unit();
    };
    return Pt;
}(Vector_1.Vector);
exports.Pt = Pt;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
var Pt_1 = __webpack_require__(0);
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
    Bound.prototype.clone = function () {
        return new Bound(this._topLeft, this._bottomRight);
    };
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
            return this._size.length > 1 ? this._size.y : 0;
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
            return this._size.length > 2 ? this._size.z : 0;
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
/* 2 */
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
var Space_1 = __webpack_require__(7);
var Pt_1 = __webpack_require__(0);
var Bound_1 = __webpack_require__(1);
var CanvasForm_1 = __webpack_require__(5);
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
        _this._autoResize = true;
        _this._bgcolor = "#e1e9f0";
        // track mouse dragging
        _this._pressed = false;
        _this._dragged = false;
        _this._renderFunc = undefined;
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
            _this._autoResize = false;
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
        //
    }
    /**
     * Helper function to create a DOM element
     * @param elem element tag name
     * @param id element id attribute
     */
    CanvasSpace.prototype._createElement = function (elem, id) {
        if (elem === void 0) {
            elem = "div";
        }
        var d = document.createElement(elem);
        d.setAttribute("id", id);
        return d;
    };
    /**
     * Handle callbacks after element is mounted in DOM
     * @param callback
     */
    CanvasSpace.prototype._ready = function (callback) {
        if (!this._container) throw "Cannot initiate #" + this.id + " element";
        var b = this._autoResize ? this._container.getBoundingClientRect() : this._canvas.getBoundingClientRect();
        this.resize(Bound_1.Bound.fromBoundingRect(b));
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
        if (opt.resize != undefined) this._autoResize = opt.resize;
        if (opt.retina !== false) {
            var r1 = window.devicePixelRatio || 1;
            var r2 = this._ctx.webkitBackingStorePixelRatio || this._ctx.mozBackingStorePixelRatio || this._ctx.msBackingStorePixelRatio || this._ctx.oBackingStorePixelRatio || this._ctx.backingStorePixelRatio || 1;
            this._pixelScale = r1 / r2;
        }
        return this;
    };
    Object.defineProperty(CanvasSpace.prototype, "ctx", {
        /**
         * Get the rendering context of canvas
         */
        get: function () {
            return this._ctx;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Get a new CanvasForm for drawing
     */
    CanvasSpace.prototype.getForm = function () {
        return new CanvasForm_1.CanvasForm(this);
    };
    /**
     * Window resize handling
     * @param evt
     */
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
        /**
         * Get the html canvas element
         */
        get: function () {
            return this._canvas;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CanvasSpace.prototype, "parent", {
        /**
         * Get the parent element that contains the canvas element
         */
        get: function () {
            return this._container;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * This overrides Space's `resize` function. It's a callback function for window's resize event. Keep track of this with `onSpaceResize(w,h,evt)` callback in your added objects.
     * @param b a Bound object to resize to
     * @param evt Optionally pass a resize event
     */
    CanvasSpace.prototype.resize = function (b, evt) {
        this.bound = b;
        this._canvas.width = this.bound.size.x * this._pixelScale;
        this._canvas.height = this.bound.size.y * this._pixelScale;
        this._canvas.style.width = this.bound.size.x + "px";
        this._canvas.style.height = this.bound.size.y + "px";
        if (this._pixelScale != 1) {
            this._ctx.scale(this._pixelScale, this._pixelScale);
            this._ctx.translate(0.5, 0.5);
        }
        for (var k in this.players) {
            var p = this.players[k];
            if (p.onSpaceResize) p.onSpaceResize(this.bound.size, evt);
        }
        this.render(this._ctx);
        return this;
    };
    /**
     * Clear the canvas with its background color. Overrides Space's `clear` function.
     * @param bg Optionally specify a custom background color in hex or rgba string, or "transparent". If not defined, it will use its `bgcolor` property as background color to clear the canvas.
     */
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
    /**
     * Main animation function. Call `Space.playItems`.
     * @param time current time
     */
    CanvasSpace.prototype.playItems = function (time) {
        this._ctx.save();
        _super.prototype.playItems.call(this, time);
        this._ctx.restore();
        this.render(this._ctx);
    };
    /**
     * Bind event listener in canvas element, for events such as mouse events
     * @param evt an event string such as "mousedown"
     * @param callback callback function for this event
     */
    CanvasSpace.prototype.bindCanvas = function (evt, callback) {
        this._canvas.addEventListener(evt, callback);
    };
    /**
     * Unbind a callback from the event listener
     * @param evt an event string such as "mousedown"
     * @param callback callback function to unbind
     */
    CanvasSpace.prototype.unbindCanvas = function (evt, callback) {
        this._canvas.removeEventListener(evt, callback);
    };
    /**
     * A convenient method to bind (or unbind) all mouse events in canvas element. All item added to `players` property that implements an `onMouseAction` callback will receive mouse event callbacks. The types of mouse actions are: "up", "down", "move", "drag", "drop", "over", and "out".
     * @param _bind a boolean value to bind mouse events if set to `true`. If `false`, all mouse events will be unbound. Default is true.
     */
    CanvasSpace.prototype.bindMouse = function (_bind) {
        if (_bind === void 0) {
            _bind = true;
        }
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
    };
    /**
     * A convenient method to bind (or unbind) all mobile touch events in canvas element. All item added to `players` property that implements an `onTouchAction` callback will receive touch event callbacks. The types of touch actions are the same as the mouse actions: "up", "down", "move", and "out"
     * @param _bind a boolean value to bind touch events if set to `true`. If `false`, all touch events will be unbound. Default is true.
     */
    CanvasSpace.prototype.bindTouch = function (_bind) {
        if (_bind === void 0) {
            _bind = true;
        }
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
    };
    /**
     * A convenient method to convert the touch points in a touch event to an array of `Pt`.
     * @param evt a touch event which contains touches, changedTouches, and targetTouches list
     * @param which a string to select a touches list: "touches", "changedTouches", or "targetTouches". Default is "touches"
     * @return an array of Pt, whose origin position (0,0) is offset to the top-left of this space
     */
    CanvasSpace.prototype.touchesToPoints = function (evt, which) {
        if (which === void 0) {
            which = "touches";
        }
        if (!evt || !evt[which]) return [];
        var ts = [];
        for (var i = 0; i < evt[which].length; i++) {
            var t = evt[which].item(i);
            ts.push(new Pt_1.Pt(t.pageX - this.bound.topLeft.x, t.pageY - this.bound.topLeft.y));
        }
        return ts;
    };
    /**
     * Go through all the `players` and call its `onMouseAction` callback function
     * @param type
     * @param evt
     */
    CanvasSpace.prototype._mouseAction = function (type, evt) {
        if (evt instanceof TouchEvent) {
            for (var k in this.players) {
                var v = this.players[k];
                var c = evt.changedTouches && evt.changedTouches.length > 0;
                var px = c ? evt.changedTouches.item(0).pageX : 0;
                var py = c ? evt.changedTouches.item(0).pageY : 0;
                v.onTouchAction(type, px, py, evt);
            }
        } else {
            for (var k in this.players) {
                var v = this.players[k];
                var px = evt.offsetX || evt.layerX;
                var py = evt.offsetY || evt.layerY;
                v.onMouseAction(type, px, py, evt);
            }
        }
    };
    /**
     * MouseDown handler
     * @param evt
     */
    CanvasSpace.prototype._mouseDown = function (evt) {
        this._mouseAction("down", evt);
        this._pressed = true;
    };
    /**
     * MouseUp handler
     * @param evt
     */
    CanvasSpace.prototype._mouseUp = function (evt) {
        this._mouseAction("up", evt);
        if (this._dragged) this._mouseAction("drop", evt);
        this._pressed = false;
        this._dragged = false;
    };
    /**
     * MouseMove handler
     * @param evt
     */
    CanvasSpace.prototype._mouseMove = function (evt) {
        this._mouseAction("move", evt);
        if (this._pressed) {
            this._dragged = true;
            this._mouseAction("drag", evt);
        }
    };
    /**
     * MouseOver handler
     * @param evt
     */
    CanvasSpace.prototype._mouseOver = function (evt) {
        this._mouseAction("over", evt);
    };
    /**
     * MouseOut handler
     * @param evt
     */
    CanvasSpace.prototype._mouseOut = function (evt) {
        this._mouseAction("out", evt);
        if (this._dragged) this._mouseAction("drop", evt);
        this._dragged = false;
    };
    /**
     * TouchMove handler
     * @param evt
     */
    CanvasSpace.prototype._touchMove = function (evt) {
        evt.preventDefault();
        this._mouseMove(evt);
    };
    /**
     * Custom rendering
     * @param context rendering context
     */
    CanvasSpace.prototype.render = function (context) {
        if (this._renderFunc) this._renderFunc(context, this);
        return this;
    };
    Object.defineProperty(CanvasSpace.prototype, "customRendering", {
        get: function () {
            return this._renderFunc;
        },
        /**
         * Set a custom rendering `function(graphics_context, canvas_space)` if needed
         */
        set: function (f) {
            this._renderFunc = f;
        },
        enumerable: true,
        configurable: true
    });
    return CanvasSpace;
}(Space_1.Space);
exports.CanvasSpace = CanvasSpace;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
var Pt_1 = __webpack_require__(0);
var Create = function () {
    function Create() {}
    Create.distributeRandom = function (bound, count) {
        var pts = [];
        for (var i = 0; i < count; i++) {
            pts.push(new Pt_1.Pt(bound.x + Math.random() * bound.width, bound.y + Math.random() * bound.height, bound.z + Math.random() * bound.depth));
        }
        return pts;
    };
    return Create;
}();
exports.Create = Create;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
var Pt_1 = __webpack_require__(0);
var Pts = function () {
    function Pts() {}
    /**
     * Zip one slice of an array of Pt
     * @param pts an array of Pt
     * @param idx index to zip at
     * @param defaultValue a default value to fill if index out of bound. If not provided, it will throw an error instead.
     */
    Pts.zipOne = function (pts, index, defaultValue) {
        if (defaultValue === void 0) {
            defaultValue = false;
        }
        var f = typeof defaultValue == "boolean" ? "get" : "at"; // choose `get` or `at` function
        return pts.reduce(function (prev, curr) {
            return prev.push(curr[f](index, defaultValue));
        }, Pt_1.Pt.$());
    };
    /**
     * Zip an array of Pt. eg, [[1,2],[3,4],[5,6]] => [[1,3,5],[2,4,6]]
     * @param pts an array of Pt
     * @param defaultValue a default value to fill if index out of bound. If not provided, it will throw an error instead.
     * @param useLongest If true, find the longest list of values in a Pt and use its length for zipping. Default is false, which uses the first item's length for zipping.
     */
    Pts.zip = function (pts, defaultValue, useLongest) {
        if (defaultValue === void 0) {
            defaultValue = false;
        }
        if (useLongest === void 0) {
            useLongest = false;
        }
        var ps = [];
        var len = useLongest ? pts.reduce(function (a, b) {
            return Math.max(a, b.length);
        }, 0) : pts[0].length;
        for (var i = 0; i < len; i++) {
            ps.push(Pts.zipOne(pts, i, defaultValue));
        }
        return ps;
    };
    /**
     * Split an array into chunks of sub-array
     * @param pts an array
     * @param size chunk size, ie, number of items in a chunk
     */
    Pts.split = function (pts, size) {
        var count = Math.ceil(pts.length / size);
        var chunks = [];
        for (var i = 0; i < count; i++) {
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
    };
    /**
     * Provide a string representation of an array of Pt
     * @param pts an array of Pt
     */
    Pts.toString = function (pts) {
        return pts.reduce(function (a, b) {
            return a + (b.toString() + ", ");
        }, "[ ") + "]";
    };
    return Pts;
}();
exports.Pts = Pts;

/***/ }),
/* 5 */
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
var Form_1 = __webpack_require__(6);
var Util_1 = __webpack_require__(8);
var CanvasForm = function (_super) {
    __extends(CanvasForm, _super);
    function CanvasForm(space) {
        var _this = _super.call(this) || this;
        // store common styles so that they can be restored to canvas context when using multiple forms. See `reset()`.
        _this._style = { fillStyle: "#e51c23", strokeStyle: "#fff", lineWidth: 1, lineJoin: "miter", lineCap: "butt" };
        _this._space = space;
        _this._ctx = _this._space.ctx;
        _this._ctx.fillStyle = _this._style.fillStyle;
        _this._ctx.strokeStyle = _this._style.strokeStyle;
        return _this;
    }
    Object.defineProperty(CanvasForm.prototype, "space", {
        get: function () {
            return this._space;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Set current fill style. For example: `form.fill("#F90")` `form.fill("rgba(0,0,0,.5")` `form.fill(false)`
     * @param c fill color which can be as color, gradient, or pattern. (See [canvas documentation](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillStyle))
     * @return this
     */
    CanvasForm.prototype.fill = function (c) {
        if (typeof c == "boolean") {
            this.filled = c;
        } else {
            this.filled = true;
            this._style.fillStyle = c;
            this._ctx.fillStyle = c;
        }
        return this;
    };
    /**
     * Set current stroke style. For example: `form.stroke("#F90")` `form.stroke("rgba(0,0,0,.5")` `form.stroke(false)` `form.stroke("#000", 0.5, 'round')`
     * @param c stroke color which can be as color, gradient, or pattern. (See [canvas documentation](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/strokeStyle))
     * @param width Optional value (can be floating point) to set line width
     * @param linejoin Optional string to set line joint style. Can be "miter", "bevel", or "round".
     * @param linecap Optional string to set line cap style. Can be "butt", "round", or "square".
     * @return this
     */
    CanvasForm.prototype.stroke = function (c, width, linejoin, linecap) {
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
    };
    /**
     * Reset the rendering context's common styles to this form's styles. This supports using multiple forms on the same canvas context.
     */
    CanvasForm.prototype.reset = function () {
        for (var k in this._style) {
            this._ctx[k] = this._style[k];
        }
        return this;
    };
    CanvasForm.prototype._paint = function () {
        if (this._filled) this._ctx.fill();
        if (this._stroked) this._ctx.stroke();
    };
    CanvasForm.prototype.point = function (p, radius, shape) {
        if (radius === void 0) {
            radius = 5;
        }
        if (shape === void 0) {
            shape = "square";
        }
        if (CanvasForm[shape]) {
            CanvasForm[shape](this._ctx, p, radius);
            this._paint();
        } else {
            console.warn(shape + " is not a static function of CanvasForm");
        }
        return this;
    };
    CanvasForm.prototype.circle = function (pts, radius) {
        CanvasForm.circle(this._ctx, pts, radius);
    };
    CanvasForm.circle = function (ctx, pt, radius) {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, radius, 0, Util_1.Const.two_pi, false);
        ctx.closePath();
    };
    CanvasForm.square = function (ctx, pt, halfsize) {
        var x1 = pt.x - halfsize;
        var y1 = pt.y - halfsize;
        var x2 = pt.x + halfsize;
        var y2 = pt.y + halfsize;
        // faster than using `rect`
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1, y2);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x2, y1);
        ctx.closePath();
    };
    CanvasForm.prototype.draw = function (ps, shape) {
        return this;
    };
    return CanvasForm;
}(Form_1.Form);
exports.CanvasForm = CanvasForm;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
var Font = function () {
    function Font(size, face, style) {
        if (size === void 0) {
            size = 11;
        }
        if (face === void 0) {
            face = "sans-serif";
        }
        if (style === void 0) {
            style = "";
        }
        this.size = size;
        this.face = face;
        this.style = style;
    }
    Object.defineProperty(Font.prototype, "data", {
        get: function () {
            return this.style + " " + this.size + "px " + this.face;
        },
        enumerable: true,
        configurable: true
    });
    ;
    return Font;
}();
exports.Font = Font;
var Form = function () {
    function Form() {
        this._filled = true;
        this._stroked = true;
    }
    Object.defineProperty(Form.prototype, "filled", {
        get: function () {
            return this._filled;
        },
        set: function (b) {
            this._filled = b;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Form.prototype, "stroked", {
        get: function () {
            return this._stroked;
        },
        set: function (b) {
            this._stroked = b;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Form.prototype, "font", {
        get: function () {
            return this._font;
        },
        set: function (b) {
            this._font = b;
        },
        enumerable: true,
        configurable: true
    });
    return Form;
}();
exports.Form = Form;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
var Bound_1 = __webpack_require__(1);
var Space = function () {
    function Space() {
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
    Space.prototype.refresh = function (b) {
        this._refresh = b;
        return this;
    };
    /**
     * Add an item to this space. An item must define a callback function `animate( time, fps, context )` and will be assigned a property `animateID` automatically.
     * An item should also define a callback function `onSpaceResize( w, h, evt )`.
     * Subclasses of Space may define other callback functions.
     * @param player an IPlayer object with animate function, or simply a function(time, fps, context){}
     */
    Space.prototype.add = function (p) {
        var player = typeof p == "function" ? { animate: p } : p;
        var k = this.playerCount++;
        var pid = this.id + k;
        this.players[pid] = player;
        player.animateID = pid;
        if (player.onSpaceResize) player.onSpaceResize(this.bound);
        // if _refresh is not set, set it to true
        if (this._refresh === undefined) this._refresh = true;
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
            this.players[k].animate(time, this._time.diff, this);
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
    Object.defineProperty(Space.prototype, "boundingBox", {
        /**
         * Get this space's bounding box
         */
        get: function () {
            return this.bound.clone();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Space.prototype, "size", {
        /**
         * Get the size of this bounding box as a Pt
         */
        get: function () {
            return this.bound.size.clone();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Space.prototype, "width", {
        /**
         * Get width of canvas
         */
        get: function () {
            return this.bound.width;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Space.prototype, "height", {
        /**
         * Get height of canvas
         */
        get: function () {
            return this.bound.height;
        },
        enumerable: true,
        configurable: true
    });
    return Space;
}();
exports.Space = Space;

/***/ }),
/* 8 */
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

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
var Pt_1 = __webpack_require__(0);
var Pts_1 = __webpack_require__(4);
var Bound_1 = __webpack_require__(1);
var Create_1 = __webpack_require__(3);
var CanvasSpace_1 = __webpack_require__(2);
window["Pt"] = Pt_1.Pt;
window["Pts"] = Pts_1.Pts;
console.log(new Pt_1.Pt(32, 43).unit().magnitude());
// console.log( Pts.zipOne( [new Pt(1,3), new Pt(2,4), new Pt(5,10)], 1, 0 ).toString() );
// console.log( new Pt(1,2,3,4,5,6).slice(2,5).toString() );
// console.log( Pts.toString( Pts.zip( [new Pt(1,2), new Pt(3,4), new Pt(5,6)] ) ) );
// console.log( Pts.toString( Pts.zip( Pts.zip( [new Pt(1,2), new Pt(3,4), new Pt(5,6)] ) ) ) );
console.log(Pts_1.Pts.split([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], 5));
var cs = [];
for (var i_1 = 0; i_1 < 500; i_1++) {
    var c = new Pt_1.Pt(Math.random() * 200, Math.random() * 200);
    cs.push(c);
}
var canvas = new CanvasSpace_1.CanvasSpace("#pt", ready).setup({ retina: true });
var form = canvas.getForm();
var form2 = canvas.getForm();
var pt = new Pt_1.Pt(50, 50);
var pto = pt.to([function (p) {
    return p.$add(10, 10);
}, function (p) {
    return p.$add(20, 25);
}]);
var pto2 = pt.to({
    "a": function (p) {
        return p.$add(10, 10);
    },
    "b": function (p) {
        return p.$add(20, 25);
    }
});
for (var i in pto2) {
    console.log("==>", pto2[i].toString());
}
console.log(pto.reduce(function (a, b) {
    return a + " | " + b.toString();
}, ""));
console.log(pt.toString());
var ps = [];
var fs = {
    "size": function (p) {
        var dist = p.$subtract(canvas.size.$divide(2)).magnitude();
        return new Pt_1.Pt(dist / 8, dist / (Math.max(canvas.width, canvas.height) / 2));
    }
};
function ready(bound, space) {
    ps = Create_1.Create.distributeRandom(new Bound_1.Bound(canvas.size), 200);
}
canvas.add({
    animate: function (time, fps, space) {
        form.reset();
        form.stroke(false);
        ps.forEach(function (p) {
            var attrs = p.to(fs);
            form.fill("rgba(255,0,0," + (1.2 - attrs.size.y));
            form.point(p, attrs.size.x, "circle");
        });
        // form.point( {x:50.5, y: 50.5}, 20, "circle");
        // form.point( {x:50.5, y: 140.5}, 20, );
        // console.log(time, fps);
        // form.point( {x:50, y:50}, 100);    
    },
    onMouseAction: function (type, px, py) {
        if (type == "move") {
            var d = canvas.boundingBox.center.$subtract(px, py);
            var p1 = canvas.boundingBox.center.$subtract(d);
            var bound = new Bound_1.Bound(p1, p1.$add(d.$abs().multiply(2)));
            ps = Create_1.Create.distributeRandom(bound, 200);
        }
    }
});
canvas.bindMouse();
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
canvas.playOnce(5000);
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
/* 10 */
/***/ (function(module, exports) {

/*
import {Vector} from "vectorious";

// Augment the Vectorious typing
// https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation
// https://stackoverflow.com/questions/42941806/typescript-custom-types-package-for-types-react-router/42943237


declare module "vectorious" {

  interface Vector {
    x: number;
    y: number;
    z: number;
    w: number;
    length: number;
    add(...args:any[]): this;
    subtract(...args:any[]): this;
    scale(scalar:number): this;
    normalize():this;
    project (vector: Vector): this;
    set (index: number, value: number): this;
    combine (vector: Vector): this;
    push (value: number): this;
    map (callback: (element: number) => number): this;
    each (callback: (element: number) => void): this;
  }

  interface Matrix {
    add (matrix: Matrix): this;
    subtract (matrix: Matrix): this;
    scale (scalar: number): this;
    product (matrix: Matrix): this;
    multiply (matrix: Matrix): this;
    transpose (): this;
    inverse (): this;
    gauss (): this;
    lusolve (rhs: Matrix, ipiv: Int32Array): this;
    solve (rhs: Matrix|Vector): this;
    augment (matrix: Matrix): this;
    diag (): this;
    set (i: number, j: number, value: number): this;
    swap (i: number, j: number): this;
    map (callback: (element: number) => number): this;
    each (callback: (element: number) => void): this;
  }
  
}

*/

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
var Vector = function () {
    function Vector(list) {}
    Object.defineProperty(Vector.prototype, "length", {
        get: function () {
            return 0;
        },
        set: function (n) {},
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Vector.prototype, "x", {
        get: function () {
            return 0;
        },
        set: function (n) {},
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Vector.prototype, "y", {
        get: function () {
            return 0;
        },
        set: function (n) {},
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Vector.prototype, "z", {
        get: function () {
            return 0;
        },
        set: function (n) {},
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Vector.prototype, "w", {
        get: function () {
            return 0;
        },
        set: function (n) {},
        enumerable: true,
        configurable: true
    });
    Vector.prototype.magnitude = function () {
        return 0;
    };
    Vector.prototype.get = function (id) {
        return 0;
    };
    Vector.prototype.set = function (id, value) {
        return this;
    };
    Vector.prototype.project = function (vec) {
        return this;
    };
    Vector.prototype.equals = function (vec) {
        return this;
    };
    Vector.prototype.scale = function (scalar) {
        return this;
    };
    Vector.prototype.add = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return this;
    };
    Vector.prototype.subtract = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return this;
    };
    Vector.prototype.normalize = function () {
        return this;
    };
    Vector.prototype.each = function (fn) {
        return;
    };
    Vector.prototype.push = function (p) {
        return this;
    };
    Vector.prototype.pop = function () {
        return 0;
    };
    return Vector;
}();
exports.Vector = Vector;

/***/ })
/******/ ]);
//# sourceMappingURL=pts.js.map