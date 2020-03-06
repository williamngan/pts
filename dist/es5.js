/*!
 * pts.js 0.9.1 - Copyright © 2017-2020 William Ngan and contributors.
 * Licensed under Apache 2.0 License.
 * See https://github.com/williamngan/pts for details.
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
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
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
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
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/_module.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/Canvas.ts":
/*!***********************!*\
  !*** ./src/Canvas.ts ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*! Source code licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

Object.defineProperty(exports, "__esModule", { value: true });
var Space_1 = __webpack_require__(/*! ./Space */ "./src/Space.ts");
var Form_1 = __webpack_require__(/*! ./Form */ "./src/Form.ts");
var Pt_1 = __webpack_require__(/*! ./Pt */ "./src/Pt.ts");
var Util_1 = __webpack_require__(/*! ./Util */ "./src/Util.ts");
var Typography_1 = __webpack_require__(/*! ./Typography */ "./src/Typography.ts");
var Op_1 = __webpack_require__(/*! ./Op */ "./src/Op.ts");

var CanvasSpace = function (_Space_1$MultiTouchSp) {
    _inherits(CanvasSpace, _Space_1$MultiTouchSp);

    function CanvasSpace(elem, callback) {
        _classCallCheck(this, CanvasSpace);

        var _this = _possibleConstructorReturn(this, (CanvasSpace.__proto__ || Object.getPrototypeOf(CanvasSpace)).call(this));

        _this._pixelScale = 1;
        _this._autoResize = true;
        _this._bgcolor = "#e1e9f0";
        _this._offscreen = false;
        _this._initialResize = false;
        var _selector = null;
        var _existed = false;
        _this.id = "pt";
        if (elem instanceof Element) {
            _selector = elem;
            _this.id = "pts_existing_space";
        } else {
            var id = elem;
            id = elem[0] === "#" || elem[0] === "." ? elem : "#" + elem;
            _selector = document.querySelector(id);
            _existed = true;
            _this.id = id.substr(1);
        }
        if (!_selector) {
            _this._container = _this._createElement("div", _this.id + "_container");
            _this._canvas = _this._createElement("canvas", _this.id);
            _this._container.appendChild(_this._canvas);
            document.body.appendChild(_this._container);
            _existed = false;
        } else if (_selector.nodeName.toLowerCase() != "canvas") {
            _this._container = _selector;
            _this._canvas = _this._createElement("canvas", _this.id + "_canvas");
            _this._container.appendChild(_this._canvas);
            _this._initialResize = true;
        } else {
            _this._canvas = _selector;
            _this._container = _selector.parentElement;
            _this._autoResize = false;
        }
        setTimeout(_this._ready.bind(_this, callback), 100);
        _this._ctx = _this._canvas.getContext('2d');
        return _this;
    }

    _createClass(CanvasSpace, [{
        key: "_createElement",
        value: function _createElement() {
            var elem = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "div";
            var id = arguments[1];

            var d = document.createElement(elem);
            d.setAttribute("id", id);
            return d;
        }
    }, {
        key: "_ready",
        value: function _ready(callback) {
            if (!this._container) throw new Error("Cannot initiate #" + this.id + " element");
            this._isReady = true;
            this._resizeHandler(null);
            this.clear(this._bgcolor);
            this._canvas.dispatchEvent(new Event("ready"));
            for (var k in this.players) {
                if (this.players.hasOwnProperty(k)) {
                    if (this.players[k].start) this.players[k].start(this.bound.clone(), this);
                }
            }
            this._pointer = this.center;
            this._initialResize = false;
            if (callback) callback(this.bound, this._canvas);
        }
    }, {
        key: "setup",
        value: function setup(opt) {
            if (opt.bgcolor) this._bgcolor = opt.bgcolor;
            this.autoResize = opt.resize != undefined ? opt.resize : false;
            if (opt.retina !== false) {
                var r1 = window.devicePixelRatio || 1;
                var r2 = this._ctx.webkitBackingStorePixelRatio || this._ctx.mozBackingStorePixelRatio || this._ctx.msBackingStorePixelRatio || this._ctx.oBackingStorePixelRatio || this._ctx.backingStorePixelRatio || 1;
                this._pixelScale = Math.max(1, r1 / r2);
            }
            if (opt.offscreen) {
                this._offscreen = true;
                this._offCanvas = this._createElement("canvas", this.id + "_offscreen");
                this._offCtx = this._offCanvas.getContext('2d');
            } else {
                this._offscreen = false;
            }
            return this;
        }
    }, {
        key: "resize",
        value: function resize(b, evt) {
            this.bound = b;
            this._canvas.width = this.bound.size.x * this._pixelScale;
            this._canvas.height = this.bound.size.y * this._pixelScale;
            this._canvas.style.width = Math.floor(this.bound.size.x) + "px";
            this._canvas.style.height = Math.floor(this.bound.size.y) + "px";
            if (this._offscreen) {
                this._offCanvas.width = this.bound.size.x * this._pixelScale;
                this._offCanvas.height = this.bound.size.y * this._pixelScale;
            }
            if (this._pixelScale != 1) {
                this._ctx.scale(this._pixelScale, this._pixelScale);
                this._ctx.translate(0.5, 0.5);
                if (this._offscreen) {
                    this._offCtx.scale(this._pixelScale, this._pixelScale);
                    this._offCtx.translate(0.5, 0.5);
                }
            }
            for (var k in this.players) {
                if (this.players.hasOwnProperty(k)) {
                    var p = this.players[k];
                    if (p.resize) p.resize(this.bound, evt);
                }
            }
            this.render(this._ctx);
            if (evt && !this.isPlaying) this.playOnce(0);
            return this;
        }
    }, {
        key: "_resizeHandler",
        value: function _resizeHandler(evt) {
            var b = this._autoResize || this._initialResize ? this._container.getBoundingClientRect() : this._canvas.getBoundingClientRect();
            if (b) {
                var box = Pt_1.Bound.fromBoundingRect(b);
                box.center = box.center.add(window.pageXOffset, window.pageYOffset);
                this.resize(box, evt);
            }
        }
    }, {
        key: "getForm",
        value: function getForm() {
            return new CanvasForm(this);
        }
    }, {
        key: "clear",
        value: function clear(bg) {
            if (bg) this._bgcolor = bg;
            var lastColor = this._ctx.fillStyle;
            if (this._bgcolor && this._bgcolor != "transparent") {
                this._ctx.fillStyle = this._bgcolor;
                this._ctx.fillRect(-1, -1, this._canvas.width + 1, this._canvas.height + 1);
            } else {
                this._ctx.clearRect(-1, -1, this._canvas.width + 1, this._canvas.height + 1);
            }
            this._ctx.fillStyle = lastColor;
            return this;
        }
    }, {
        key: "clearOffscreen",
        value: function clearOffscreen(bg) {
            if (this._offscreen) {
                if (bg) {
                    this._offCtx.fillStyle = bg;
                    this._offCtx.fillRect(-1, -1, this._canvas.width + 1, this._canvas.height + 1);
                } else {
                    this._offCtx.clearRect(-1, -1, this._offCanvas.width + 1, this._offCanvas.height + 1);
                }
            }
            return this;
        }
    }, {
        key: "playItems",
        value: function playItems(time) {
            if (this._isReady) {
                this._ctx.save();
                if (this._offscreen) this._offCtx.save();
                _get(CanvasSpace.prototype.__proto__ || Object.getPrototypeOf(CanvasSpace.prototype), "playItems", this).call(this, time);
                this._ctx.restore();
                if (this._offscreen) this._offCtx.restore();
                this.render(this._ctx);
            }
        }
    }, {
        key: "autoResize",
        set: function set(auto) {
            this._autoResize = auto;
            if (auto) {
                window.addEventListener('resize', this._resizeHandler.bind(this));
            } else {
                window.removeEventListener('resize', this._resizeHandler.bind(this));
            }
        },
        get: function get() {
            return this._autoResize;
        }
    }, {
        key: "background",
        set: function set(bg) {
            this._bgcolor = bg;
        },
        get: function get() {
            return this._bgcolor;
        }
    }, {
        key: "pixelScale",
        get: function get() {
            return this._pixelScale;
        }
    }, {
        key: "hasOffscreen",
        get: function get() {
            return this._offscreen;
        }
    }, {
        key: "offscreenCtx",
        get: function get() {
            return this._offCtx;
        }
    }, {
        key: "offscreenCanvas",
        get: function get() {
            return this._offCanvas;
        }
    }, {
        key: "element",
        get: function get() {
            return this._canvas;
        }
    }, {
        key: "parent",
        get: function get() {
            return this._container;
        }
    }, {
        key: "ready",
        get: function get() {
            return this._isReady;
        }
    }, {
        key: "ctx",
        get: function get() {
            return this._ctx;
        }
    }]);

    return CanvasSpace;
}(Space_1.MultiTouchSpace);

exports.CanvasSpace = CanvasSpace;

var CanvasForm = function (_Form_1$VisualForm) {
    _inherits(CanvasForm, _Form_1$VisualForm);

    function CanvasForm(space) {
        _classCallCheck(this, CanvasForm);

        var _this2 = _possibleConstructorReturn(this, (CanvasForm.__proto__ || Object.getPrototypeOf(CanvasForm)).call(this));

        _this2._style = {
            fillStyle: "#f03", strokeStyle: "#fff",
            lineWidth: 1, lineJoin: "bevel", lineCap: "butt",
            globalAlpha: 1
        };
        _this2._space = space;
        _this2._space.add({ start: function start() {
                _this2._ctx = _this2._space.ctx;
                _this2._ctx.fillStyle = _this2._style.fillStyle;
                _this2._ctx.strokeStyle = _this2._style.strokeStyle;
                _this2._ctx.lineJoin = "bevel";
                _this2._ctx.font = _this2._font.value;
                _this2._ready = true;
            } });
        return _this2;
    }

    _createClass(CanvasForm, [{
        key: "useOffscreen",
        value: function useOffscreen() {
            var off = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
            var clear = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            if (clear) this._space.clearOffscreen(typeof clear == "string" ? clear : null);
            this._ctx = this._space.hasOffscreen && off ? this._space.offscreenCtx : this._space.ctx;
            return this;
        }
    }, {
        key: "renderOffscreen",
        value: function renderOffscreen() {
            var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [0, 0];

            if (this._space.hasOffscreen) {
                this._space.ctx.drawImage(this._space.offscreenCanvas, offset[0], offset[1], this._space.width, this._space.height);
            }
        }
    }, {
        key: "alpha",
        value: function alpha(a) {
            this._ctx.globalAlpha = a;
            this._style.globalAlpha = a;
            return this;
        }
    }, {
        key: "fill",
        value: function fill(c) {
            if (typeof c == "boolean") {
                this.filled = c;
            } else {
                this.filled = true;
                this._style.fillStyle = c;
                this._ctx.fillStyle = c;
            }
            return this;
        }
    }, {
        key: "stroke",
        value: function stroke(c, width, linejoin, linecap) {
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
    }, {
        key: "gradient",
        value: function gradient(stops) {
            var _this3 = this;

            var vals = [];
            if (stops.length < 2) stops.push([0.99, "#000"], [1, "#000"]);
            for (var i = 0, len = stops.length; i < len; i++) {
                var t = typeof stops[i] === 'string' ? i * (1 / (stops.length - 1)) : stops[i][0];
                var v = typeof stops[i] === 'string' ? stops[i] : stops[i][1];
                vals.push([t, v]);
            }
            return function (area1, area2) {
                area1 = area1.map(function (a) {
                    return a.abs();
                });
                if (area2) area2.map(function (a) {
                    return a.abs();
                });
                var grad = area2 ? _this3.ctx.createRadialGradient(area1[0][0], area1[0][1], area1[1][0], area2[0][0], area2[0][1], area2[1][0]) : _this3.ctx.createLinearGradient(area1[0][0], area1[0][1], area1[1][0], area1[1][1]);
                for (var _i = 0, _len = vals.length; _i < _len; _i++) {
                    grad.addColorStop(vals[_i][0], vals[_i][1]);
                }
                return grad;
            };
        }
    }, {
        key: "composite",
        value: function composite() {
            var mode = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'source-over';

            this.ctx.globalCompositeOperation = mode;
            return this;
        }
    }, {
        key: "clip",
        value: function clip() {
            this.ctx.clip();
            return this;
        }
    }, {
        key: "dash",
        value: function dash() {
            var segments = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
            var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

            if (!segments) {
                this._ctx.setLineDash([]);
                this._ctx.lineDashOffset = 0;
            } else {
                if (segments === true) {
                    segments = [5, 5];
                }
                this._ctx.setLineDash([segments[0], segments[1]]);
                this._ctx.lineDashOffset = offset;
            }
            return this;
        }
    }, {
        key: "font",
        value: function font(sizeOrFont, weight, style, lineHeight, family) {
            if (typeof sizeOrFont == "number") {
                this._font.size = sizeOrFont;
                if (family) this._font.face = family;
                if (weight) this._font.weight = weight;
                if (style) this._font.style = style;
                if (lineHeight) this._font.lineHeight = lineHeight;
            } else {
                this._font = sizeOrFont;
            }
            this._ctx.font = this._font.value;
            if (this._estimateTextWidth) this.fontWidthEstimate(true);
            return this;
        }
    }, {
        key: "fontWidthEstimate",
        value: function fontWidthEstimate() {
            var _this4 = this;

            var estimate = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

            this._estimateTextWidth = estimate ? Typography_1.Typography.textWidthEstimator(function (c) {
                return _this4._ctx.measureText(c).width;
            }) : undefined;
            return this;
        }
    }, {
        key: "getTextWidth",
        value: function getTextWidth(c) {
            return !this._estimateTextWidth ? this._ctx.measureText(c + " .").width : this._estimateTextWidth(c);
        }
    }, {
        key: "_textTruncate",
        value: function _textTruncate(str, width) {
            var tail = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "";

            return Typography_1.Typography.truncate(this.getTextWidth.bind(this), str, width, tail);
        }
    }, {
        key: "_textAlign",
        value: function _textAlign(box, vertical, offset, center) {
            if (!center) center = Op_1.Rectangle.center(box);
            var px = box[0][0];
            if (this._ctx.textAlign == "end" || this._ctx.textAlign == "right") {
                px = box[1][0];
            } else if (this._ctx.textAlign == "center" || this._ctx.textAlign == "middle") {
                px = center[0];
            }
            var py = center[1];
            if (vertical == "top" || vertical == "start") {
                py = box[0][1];
            } else if (vertical == "end" || vertical == "bottom") {
                py = box[1][1];
            }
            return offset ? new Pt_1.Pt(px + offset[0], py + offset[1]) : new Pt_1.Pt(px, py);
        }
    }, {
        key: "reset",
        value: function reset() {
            for (var k in this._style) {
                if (this._style.hasOwnProperty(k)) {
                    this._ctx[k] = this._style[k];
                }
            }
            this._font = new Form_1.Font();
            this._ctx.font = this._font.value;
            return this;
        }
    }, {
        key: "_paint",
        value: function _paint() {
            if (this._filled) this._ctx.fill();
            if (this._stroked) this._ctx.stroke();
        }
    }, {
        key: "point",
        value: function point(p) {
            var radius = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5;
            var shape = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "square";

            if (!p) return;
            if (!CanvasForm[shape]) throw new Error(shape + " is not a static function of CanvasForm");
            CanvasForm[shape](this._ctx, p, radius);
            this._paint();
            return this;
        }
    }, {
        key: "circle",
        value: function circle(pts) {
            CanvasForm.circle(this._ctx, pts[0], pts[1][0]);
            this._paint();
            return this;
        }
    }, {
        key: "ellipse",
        value: function ellipse(pt, radius) {
            var rotation = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
            var startAngle = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
            var endAngle = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : Util_1.Const.two_pi;
            var cc = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;

            CanvasForm.ellipse(this._ctx, pt, radius, rotation, startAngle, endAngle, cc);
            this._paint();
            return this;
        }
    }, {
        key: "arc",
        value: function arc(pt, radius, startAngle, endAngle, cc) {
            CanvasForm.arc(this._ctx, pt, radius, startAngle, endAngle, cc);
            this._paint();
            return this;
        }
    }, {
        key: "square",
        value: function square(pt, halfsize) {
            CanvasForm.square(this._ctx, pt, halfsize);
            this._paint();
            return this;
        }
    }, {
        key: "line",
        value: function line(pts) {
            CanvasForm.line(this._ctx, pts);
            this._paint();
            return this;
        }
    }, {
        key: "polygon",
        value: function polygon(pts) {
            CanvasForm.polygon(this._ctx, pts);
            this._paint();
            return this;
        }
    }, {
        key: "rect",
        value: function rect(pts) {
            CanvasForm.rect(this._ctx, pts);
            this._paint();
            return this;
        }
    }, {
        key: "image",
        value: function image(img, target, original) {
            CanvasForm.image(this._ctx, img, target, original);
            return this;
        }
    }, {
        key: "text",
        value: function text(pt, txt, maxWidth) {
            CanvasForm.text(this._ctx, pt, txt, maxWidth);
            return this;
        }
    }, {
        key: "textBox",
        value: function textBox(box, txt) {
            var verticalAlign = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "middle";
            var tail = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "";
            var overrideBaseline = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;

            if (overrideBaseline) this._ctx.textBaseline = verticalAlign;
            var size = Op_1.Rectangle.size(box);
            var t = this._textTruncate(txt, size[0], tail);
            this.text(this._textAlign(box, verticalAlign), t[0]);
            return this;
        }
    }, {
        key: "paragraphBox",
        value: function paragraphBox(box, txt) {
            var lineHeight = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1.2;

            var _this5 = this;

            var verticalAlign = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "top";
            var crop = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;

            var size = Op_1.Rectangle.size(box);
            this._ctx.textBaseline = "top";
            var lstep = this._font.size * lineHeight;
            var nextLine = function nextLine(sub) {
                var buffer = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
                var cc = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

                if (!sub) return buffer;
                if (crop && cc * lstep > size[1] - lstep * 2) return buffer;
                if (cc > 10000) throw new Error("max recursion reached (10000)");
                var t = _this5._textTruncate(sub, size[0], "");
                var newln = t[0].indexOf("\n");
                if (newln >= 0) {
                    buffer.push(t[0].substr(0, newln));
                    return nextLine(sub.substr(newln + 1), buffer, cc + 1);
                }
                var dt = t[0].lastIndexOf(" ") + 1;
                if (dt <= 0 || t[1] === sub.length) dt = undefined;
                var line = t[0].substr(0, dt);
                buffer.push(line);
                return t[1] <= 0 || t[1] === sub.length ? buffer : nextLine(sub.substr(dt || t[1]), buffer, cc + 1);
            };
            var lines = nextLine(txt);
            var lsize = lines.length * lstep;
            var lbox = box;
            if (verticalAlign == "middle" || verticalAlign == "center") {
                var lpad = (size[1] - lsize) / 2;
                if (crop) lpad = Math.max(0, lpad);
                lbox = new Pt_1.Group(box[0].$add(0, lpad), box[1].$subtract(0, lpad));
            } else if (verticalAlign == "bottom") {
                lbox = new Pt_1.Group(box[0].$add(0, size[1] - lsize), box[1]);
            } else {
                lbox = new Pt_1.Group(box[0], box[0].$add(size[0], lsize));
            }
            var center = Op_1.Rectangle.center(lbox);
            for (var i = 0, len = lines.length; i < len; i++) {
                this.text(this._textAlign(lbox, "top", [0, i * lstep], center), lines[i]);
            }
            return this;
        }
    }, {
        key: "alignText",
        value: function alignText() {
            var alignment = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "left";
            var baseline = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "alphabetic";

            if (baseline == "center") baseline = "middle";
            if (baseline == "baseline") baseline = "alphabetic";
            this._ctx.textAlign = alignment;
            this._ctx.textBaseline = baseline;
            return this;
        }
    }, {
        key: "log",
        value: function log(txt) {
            var w = this._ctx.measureText(txt).width + 20;
            this.stroke(false).fill("rgba(0,0,0,.4)").rect([[0, 0], [w, 20]]);
            this.fill("#fff").text([10, 14], txt);
            return this;
        }
    }, {
        key: "space",
        get: function get() {
            return this._space;
        }
    }, {
        key: "ctx",
        get: function get() {
            return this._space.ctx;
        }
    }], [{
        key: "circle",
        value: function circle(ctx, pt) {
            var radius = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 10;

            if (!pt) return;
            ctx.beginPath();
            ctx.arc(pt[0], pt[1], radius, 0, Util_1.Const.two_pi, false);
            ctx.closePath();
        }
    }, {
        key: "ellipse",
        value: function ellipse(ctx, pt, radius) {
            var rotation = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
            var startAngle = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
            var endAngle = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : Util_1.Const.two_pi;
            var cc = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : false;

            if (!pt || !radius) return;
            ctx.beginPath();
            ctx.ellipse(pt[0], pt[1], radius[0], radius[1], rotation, startAngle, endAngle, cc);
        }
    }, {
        key: "arc",
        value: function arc(ctx, pt, radius, startAngle, endAngle, cc) {
            if (!pt) return;
            ctx.beginPath();
            ctx.arc(pt[0], pt[1], radius, startAngle, endAngle, cc);
        }
    }, {
        key: "square",
        value: function square(ctx, pt, halfsize) {
            if (!pt) return;
            var x1 = pt[0] - halfsize;
            var y1 = pt[1] - halfsize;
            var x2 = pt[0] + halfsize;
            var y2 = pt[1] + halfsize;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x1, y2);
            ctx.lineTo(x2, y2);
            ctx.lineTo(x2, y1);
            ctx.closePath();
        }
    }, {
        key: "line",
        value: function line(ctx, pts) {
            if (pts.length < 2) return;
            ctx.beginPath();
            ctx.moveTo(pts[0][0], pts[0][1]);
            for (var i = 1, len = pts.length; i < len; i++) {
                if (pts[i]) ctx.lineTo(pts[i][0], pts[i][1]);
            }
        }
    }, {
        key: "polygon",
        value: function polygon(ctx, pts) {
            if (pts.length < 2) return;
            ctx.beginPath();
            ctx.moveTo(pts[0][0], pts[0][1]);
            for (var i = 1, len = pts.length; i < len; i++) {
                if (pts[i]) ctx.lineTo(pts[i][0], pts[i][1]);
            }
            ctx.closePath();
        }
    }, {
        key: "rect",
        value: function rect(ctx, pts) {
            if (pts.length < 2) return;
            ctx.beginPath();
            ctx.moveTo(pts[0][0], pts[0][1]);
            ctx.lineTo(pts[0][0], pts[1][1]);
            ctx.lineTo(pts[1][0], pts[1][1]);
            ctx.lineTo(pts[1][0], pts[0][1]);
            ctx.closePath();
        }
    }, {
        key: "image",
        value: function image(ctx, img) {
            var target = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : new Pt_1.Pt();
            var orig = arguments[3];

            if (typeof target[0] === "number") {
                ctx.drawImage(img, target[0], target[1]);
            } else {
                var t = target;
                if (orig) {
                    ctx.drawImage(img, orig[0][0], orig[0][1], orig[1][0] - orig[0][0], orig[1][1] - orig[0][1], t[0][0], t[0][1], t[1][0] - t[0][0], t[1][1] - t[0][1]);
                } else {
                    ctx.drawImage(img, t[0][0], t[0][1], t[1][0] - t[0][0], t[1][1] - t[0][1]);
                }
            }
        }
    }, {
        key: "text",
        value: function text(ctx, pt, txt, maxWidth) {
            if (!pt) return;
            ctx.fillText(txt, pt[0], pt[1], maxWidth);
        }
    }]);

    return CanvasForm;
}(Form_1.VisualForm);

exports.CanvasForm = CanvasForm;

/***/ }),

/***/ "./src/Color.ts":
/*!**********************!*\
  !*** ./src/Color.ts ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*! Source code licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

Object.defineProperty(exports, "__esModule", { value: true });
var Pt_1 = __webpack_require__(/*! ./Pt */ "./src/Pt.ts");
var Util_1 = __webpack_require__(/*! ./Util */ "./src/Util.ts");
var Num_1 = __webpack_require__(/*! ./Num */ "./src/Num.ts");

var Color = function (_Pt_1$Pt) {
    _inherits(Color, _Pt_1$Pt);

    function Color() {
        var _ref;

        _classCallCheck(this, Color);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        var _this = _possibleConstructorReturn(this, (_ref = Color.__proto__ || Object.getPrototypeOf(Color)).call.apply(_ref, [this].concat(args)));

        _this._mode = "rgb";
        _this._isNorm = false;
        return _this;
    }

    _createClass(Color, [{
        key: "clone",
        value: function clone() {
            var c = new Color(this);
            c.toMode(this._mode);
            return c;
        }
    }, {
        key: "toMode",
        value: function toMode(mode) {
            var convert = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            if (convert) {
                var fname = this._mode.toUpperCase() + "to" + mode.toUpperCase();
                if (Color[fname]) {
                    this.to(Color[fname](this, this._isNorm, this._isNorm));
                } else {
                    throw new Error("Cannot convert color with " + fname);
                }
            }
            this._mode = mode;
            return this;
        }
    }, {
        key: "normalize",
        value: function normalize() {
            var toNorm = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

            if (this._isNorm == toNorm) return this;
            var ranges = Color.ranges[this._mode];
            for (var i = 0; i < 3; i++) {
                this[i] = !toNorm ? Num_1.Num.mapToRange(this[i], 0, 1, ranges[i][0], ranges[i][1]) : Num_1.Num.mapToRange(this[i], ranges[i][0], ranges[i][1], 0, 1);
            }
            this._isNorm = toNorm;
            return this;
        }
    }, {
        key: "$normalize",
        value: function $normalize() {
            var toNorm = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
            return this.clone().normalize(toNorm);
        }
    }, {
        key: "toString",
        value: function toString() {
            var format = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "mode";

            if (format == "hex") {
                var _hex = function _hex(n) {
                    var s = Math.floor(n).toString(16);
                    return s.length < 2 ? '0' + s : s;
                };
                return "#" + _hex(this[0]) + _hex(this[1]) + _hex(this[2]);
            } else if (format == "rgba") {
                return "rgba(" + Math.floor(this[0]) + "," + Math.floor(this[1]) + "," + Math.floor(this[2]) + "," + this.alpha;
            } else if (format == "rgb") {
                return "rgb(" + Math.floor(this[0]) + "," + Math.floor(this[1]) + "," + Math.floor(this[2]);
            } else {
                return this._mode + "(" + this[0] + "," + this[1] + "," + this[2] + "," + this.alpha + ")";
            }
        }
    }, {
        key: "hex",
        get: function get() {
            return this.toString("hex");
        }
    }, {
        key: "rgb",
        get: function get() {
            return this.toString("rgb");
        }
    }, {
        key: "rgba",
        get: function get() {
            return this.toString("rgba");
        }
    }, {
        key: "mode",
        get: function get() {
            return this._mode;
        }
    }, {
        key: "r",
        get: function get() {
            return this[0];
        },
        set: function set(n) {
            this[0] = n;
        }
    }, {
        key: "g",
        get: function get() {
            return this[1];
        },
        set: function set(n) {
            this[1] = n;
        }
    }, {
        key: "b",
        get: function get() {
            return this[2];
        },
        set: function set(n) {
            this[2] = n;
        }
    }, {
        key: "h",
        get: function get() {
            return this._mode == "lch" ? this[2] : this[0];
        },
        set: function set(n) {
            var i = this._mode == "lch" ? 2 : 0;
            this[i] = n;
        }
    }, {
        key: "s",
        get: function get() {
            return this[1];
        },
        set: function set(n) {
            this[1] = n;
        }
    }, {
        key: "l",
        get: function get() {
            return this._mode == "hsl" ? this[2] : this[0];
        },
        set: function set(n) {
            var i = this._mode == "hsl" ? 2 : 0;
            this[i] = n;
        }
    }, {
        key: "a",
        get: function get() {
            return this[1];
        },
        set: function set(n) {
            this[1] = n;
        }
    }, {
        key: "c",
        get: function get() {
            return this[1];
        },
        set: function set(n) {
            this[1] = n;
        }
    }, {
        key: "u",
        get: function get() {
            return this[1];
        },
        set: function set(n) {
            this[1] = n;
        }
    }, {
        key: "v",
        get: function get() {
            return this[2];
        },
        set: function set(n) {
            this[2] = n;
        }
    }, {
        key: "alpha",
        set: function set(n) {
            if (this.length > 3) this[3] = n;
        },
        get: function get() {
            return this.length > 3 ? this[3] : 1;
        }
    }, {
        key: "normalized",
        get: function get() {
            return this._isNorm;
        },
        set: function set(b) {
            this._isNorm = b;
        }
    }], [{
        key: "from",
        value: function from() {
            var p = [1, 1, 1, 1];

            for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                args[_key2] = arguments[_key2];
            }

            var c = Util_1.Util.getArgs(args);
            for (var i = 0, len = p.length; i < len; i++) {
                if (i < c.length) p[i] = c[i];
            }
            return new Color(p);
        }
    }, {
        key: "fromHex",
        value: function fromHex(hex) {
            if (hex[0] == "#") hex = hex.substr(1);
            if (hex.length <= 3) {
                var fn = function fn(i) {
                    return hex[i] || "F";
                };
                hex = "" + fn(0) + fn(0) + fn(1) + fn(1) + fn(2) + fn(2);
            }
            var alpha = 1;
            if (hex.length === 8) {
                alpha = hex.substr(6) && 0xFF / 255;
                hex = hex.substring(0, 6);
            }
            var hexVal = parseInt(hex, 16);
            return new Color(hexVal >> 16, hexVal >> 8 & 0xFF, hexVal & 0xFF, alpha);
        }
    }, {
        key: "rgb",
        value: function rgb() {
            return Color.from.apply(Color, arguments).toMode("rgb");
        }
    }, {
        key: "hsl",
        value: function hsl() {
            return Color.from.apply(Color, arguments).toMode("hsl");
        }
    }, {
        key: "hsb",
        value: function hsb() {
            return Color.from.apply(Color, arguments).toMode("hsb");
        }
    }, {
        key: "lab",
        value: function lab() {
            return Color.from.apply(Color, arguments).toMode("lab");
        }
    }, {
        key: "lch",
        value: function lch() {
            return Color.from.apply(Color, arguments).toMode("lch");
        }
    }, {
        key: "luv",
        value: function luv() {
            return Color.from.apply(Color, arguments).toMode("luv");
        }
    }, {
        key: "xyz",
        value: function xyz() {
            return Color.from.apply(Color, arguments).toMode("xyz");
        }
    }, {
        key: "maxValues",
        value: function maxValues(mode) {
            return Color.ranges[mode].zipSlice(1).$take([0, 1, 2]);
        }
    }, {
        key: "RGBtoHSL",
        value: function RGBtoHSL(rgb) {
            var normalizedInput = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
            var normalizedOutput = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            var _ref2 = !normalizedInput ? rgb.$normalize() : rgb,
                _ref3 = _slicedToArray(_ref2, 3),
                r = _ref3[0],
                g = _ref3[1],
                b = _ref3[2];

            var max = Math.max(r, g, b);
            var min = Math.min(r, g, b);
            var h = (max + min) / 2;
            var s = h;
            var l = h;
            if (max == min) {
                h = 0;
                s = 0;
            } else {
                var d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                h = 0;
                if (max === r) {
                    h = (g - b) / d + (g < b ? 6 : 0);
                } else if (max === g) {
                    h = (b - r) / d + 2;
                } else if (max === b) {
                    h = (r - g) / d + 4;
                }
            }
            return Color.hsl(normalizedOutput ? h / 60 : h * 60, s, l, rgb.alpha);
        }
    }, {
        key: "HSLtoRGB",
        value: function HSLtoRGB(hsl) {
            var normalizedInput = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
            var normalizedOutput = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            var _hsl = _slicedToArray(hsl, 3),
                h = _hsl[0],
                s = _hsl[1],
                l = _hsl[2];

            if (!normalizedInput) h = h / 360;
            if (s == 0) return Color.rgb(l * 255, l * 255, l * 255, hsl.alpha);
            var q = l <= 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            var convert = function convert(t) {
                t = t < 0 ? t + 1 : t > 1 ? t - 1 : t;
                if (t * 6 < 1) {
                    return p + (q - p) * t * 6;
                } else if (t * 2 < 1) {
                    return q;
                } else if (t * 3 < 2) {
                    return p + (q - p) * (2 / 3 - t) * 6;
                } else {
                    return p;
                }
            };
            var sc = normalizedOutput ? 1 : 255;
            return Color.rgb(sc * convert(h + 1 / 3), sc * convert(h), sc * convert(h - 1 / 3), hsl.alpha);
        }
    }, {
        key: "RGBtoHSB",
        value: function RGBtoHSB(rgb) {
            var normalizedInput = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
            var normalizedOutput = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            var _ref4 = !normalizedInput ? rgb.$normalize() : rgb,
                _ref5 = _slicedToArray(_ref4, 3),
                r = _ref5[0],
                g = _ref5[1],
                b = _ref5[2];

            var max = Math.max(r, g, b);
            var min = Math.min(r, g, b);
            var d = max - min;
            var h = 0;
            var s = max === 0 ? 0 : d / max;
            var v = max;
            if (max != min) {
                if (max === r) {
                    h = (g - b) / d + (g < b ? 6 : 0);
                } else if (max === g) {
                    h = (b - r) / d + 2;
                } else if (max === b) {
                    h = (r - g) / d + 4;
                }
            }
            return Color.hsb(normalizedOutput ? h / 60 : h * 60, s, v, rgb.alpha);
        }
    }, {
        key: "HSBtoRGB",
        value: function HSBtoRGB(hsb) {
            var normalizedInput = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
            var normalizedOutput = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            var _hsb = _slicedToArray(hsb, 3),
                h = _hsb[0],
                s = _hsb[1],
                v = _hsb[2];

            if (!normalizedInput) h = h / 360;
            var i = Math.floor(h * 6);
            var f = h * 6 - i;
            var p = v * (1 - s);
            var q = v * (1 - f * s);
            var t = v * (1 - (1 - f) * s);
            var pick = [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]];
            var c = pick[i % 6];
            var sc = normalizedOutput ? 1 : 255;
            return Color.rgb(sc * c[0], sc * c[1], sc * c[2], hsb.alpha);
        }
    }, {
        key: "RGBtoLAB",
        value: function RGBtoLAB(rgb) {
            var normalizedInput = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
            var normalizedOutput = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            var c = normalizedInput ? rgb.$normalize(false) : rgb;
            return Color.XYZtoLAB(Color.RGBtoXYZ(c), false, normalizedOutput);
        }
    }, {
        key: "LABtoRGB",
        value: function LABtoRGB(lab) {
            var normalizedInput = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
            var normalizedOutput = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            var c = normalizedInput ? lab.$normalize(false) : lab;
            return Color.XYZtoRGB(Color.LABtoXYZ(c), false, normalizedOutput);
        }
    }, {
        key: "RGBtoLCH",
        value: function RGBtoLCH(rgb) {
            var normalizedInput = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
            var normalizedOutput = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            var c = normalizedInput ? rgb.$normalize(false) : rgb;
            return Color.LABtoLCH(Color.RGBtoLAB(c), false, normalizedOutput);
        }
    }, {
        key: "LCHtoRGB",
        value: function LCHtoRGB(lch) {
            var normalizedInput = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
            var normalizedOutput = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            var c = normalizedInput ? lch.$normalize(false) : lch;
            return Color.LABtoRGB(Color.LCHtoLAB(c), false, normalizedOutput);
        }
    }, {
        key: "RGBtoLUV",
        value: function RGBtoLUV(rgb) {
            var normalizedInput = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
            var normalizedOutput = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            var c = normalizedInput ? rgb.$normalize(false) : rgb;
            return Color.XYZtoLUV(Color.RGBtoXYZ(c), false, normalizedOutput);
        }
    }, {
        key: "LUVtoRGB",
        value: function LUVtoRGB(luv) {
            var normalizedInput = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
            var normalizedOutput = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            var c = normalizedInput ? luv.$normalize(false) : luv;
            return Color.XYZtoRGB(Color.LUVtoXYZ(c), false, normalizedOutput);
        }
    }, {
        key: "RGBtoXYZ",
        value: function RGBtoXYZ(rgb) {
            var normalizedInput = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
            var normalizedOutput = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            var c = !normalizedInput ? rgb.$normalize() : rgb.clone();
            for (var i = 0; i < 3; i++) {
                c[i] = c[i] > 0.04045 ? Math.pow((c[i] + 0.055) / 1.055, 2.4) : c[i] / 12.92;
                if (!normalizedOutput) c[i] = c[i] * 100;
            }
            var cc = Color.xyz(c[0] * 0.4124564 + c[1] * 0.3575761 + c[2] * 0.1804375, c[0] * 0.2126729 + c[1] * 0.7151522 + c[2] * 0.0721750, c[0] * 0.0193339 + c[1] * 0.1191920 + c[2] * 0.9503041, rgb.alpha);
            return normalizedOutput ? cc.normalize() : cc;
        }
    }, {
        key: "XYZtoRGB",
        value: function XYZtoRGB(xyz) {
            var normalizedInput = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
            var normalizedOutput = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            var _ref6 = !normalizedInput ? xyz.$normalize() : xyz,
                _ref7 = _slicedToArray(_ref6, 3),
                x = _ref7[0],
                y = _ref7[1],
                z = _ref7[2];

            var rgb = [x * 3.2404542 + y * -1.5371385 + z * -0.4985314, x * -0.9692660 + y * 1.8760108 + z * 0.0415560, x * 0.0556434 + y * -0.2040259 + z * 1.0572252];
            for (var i = 0; i < 3; i++) {
                rgb[i] = rgb[i] < 0 ? 0 : rgb[i] > 0.0031308 ? 1.055 * Math.pow(rgb[i], 1 / 2.4) - 0.055 : 12.92 * rgb[i];
                rgb[i] = Math.max(0, Math.min(1, rgb[i]));
                if (!normalizedOutput) rgb[i] = Math.round(rgb[i] * 255);
            }
            var cc = Color.rgb(rgb[0], rgb[1], rgb[2], xyz.alpha);
            return normalizedOutput ? cc.normalize() : cc;
        }
    }, {
        key: "XYZtoLAB",
        value: function XYZtoLAB(xyz) {
            var normalizedInput = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
            var normalizedOutput = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            var c = normalizedInput ? xyz.$normalize(false) : xyz.clone();
            c.divide(Color.D65);
            var fn = function fn(n) {
                return n > 0.008856 ? Math.pow(n, 1 / 3) : 7.787 * n + 16 / 116;
            };
            var cy = fn(c[1]);
            var cc = Color.lab(116 * cy - 16, 500 * (fn(c[0]) - cy), 200 * (cy - fn(c[2])), xyz.alpha);
            return normalizedOutput ? cc.normalize() : cc;
        }
    }, {
        key: "LABtoXYZ",
        value: function LABtoXYZ(lab) {
            var normalizedInput = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
            var normalizedOutput = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            var c = normalizedInput ? lab.$normalize(false) : lab;
            var y = (c[0] + 16) / 116;
            var x = c[1] / 500 + y;
            var z = y - c[2] / 200;
            var fn = function fn(n) {
                var nnn = n * n * n;
                return nnn > 0.008856 ? nnn : (n - 16 / 116) / 7.787;
            };
            var d = Color.D65;
            var cc = Color.xyz(Math.max(0, d[0] * fn(x)), Math.max(0, d[1] * fn(y)), Math.max(0, d[2] * fn(z)), lab.alpha);
            return normalizedOutput ? cc.normalize() : cc;
        }
    }, {
        key: "XYZtoLUV",
        value: function XYZtoLUV(xyz) {
            var normalizedInput = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
            var normalizedOutput = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            var _ref8 = normalizedInput ? xyz.$normalize(false) : xyz,
                _ref9 = _slicedToArray(_ref8, 3),
                x = _ref9[0],
                y = _ref9[1],
                z = _ref9[2];

            var u = 4 * x / (x + 15 * y + 3 * z);
            var v = 9 * y / (x + 15 * y + 3 * z);
            y = y / 100;
            y = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
            var refU = 4 * Color.D65[0] / (Color.D65[0] + 15 * Color.D65[1] + 3 * Color.D65[2]);
            var refV = 9 * Color.D65[1] / (Color.D65[0] + 15 * Color.D65[1] + 3 * Color.D65[2]);
            var L = 116 * y - 16;
            return Color.luv(L, 13 * L * (u - refU), 13 * L * (v - refV), xyz.alpha);
        }
    }, {
        key: "LUVtoXYZ",
        value: function LUVtoXYZ(luv) {
            var normalizedInput = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
            var normalizedOutput = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            var _ref10 = normalizedInput ? luv.$normalize(false) : luv,
                _ref11 = _slicedToArray(_ref10, 3),
                l = _ref11[0],
                u = _ref11[1],
                v = _ref11[2];

            var y = (l + 16) / 116;
            var cubeY = y * y * y;
            y = cubeY > 0.008856 ? cubeY : (y - 16 / 116) / 7.787;
            var refU = 4 * Color.D65[0] / (Color.D65[0] + 15 * Color.D65[1] + 3 * Color.D65[2]);
            var refV = 9 * Color.D65[1] / (Color.D65[0] + 15 * Color.D65[1] + 3 * Color.D65[2]);
            u = u / (13 * l) + refU;
            v = v / (13 * l) + refV;
            y = y * 100;
            var x = -1 * (9 * y * u) / ((u - 4) * v - u * v);
            var z = (9 * y - 15 * v * y - v * x) / (3 * v);
            return Color.xyz(x, y, z, luv.alpha);
        }
    }, {
        key: "LABtoLCH",
        value: function LABtoLCH(lab) {
            var normalizedInput = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
            var normalizedOutput = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            var c = normalizedInput ? lab.$normalize(false) : lab;
            var h = Num_1.Geom.toDegree(Num_1.Geom.boundRadian(Math.atan2(c[2], c[1])));
            return Color.lch(c[0], Math.sqrt(c[1] * c[1] + c[2] * c[2]), h, lab.alpha);
        }
    }, {
        key: "LCHtoLAB",
        value: function LCHtoLAB(lch) {
            var normalizedInput = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
            var normalizedOutput = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            var c = normalizedInput ? lch.$normalize(false) : lch;
            var rad = Num_1.Geom.toRadian(c[2]);
            return Color.lab(c[0], Math.cos(rad) * c[1], Math.sin(rad) * c[1], lch.alpha);
        }
    }]);

    return Color;
}(Pt_1.Pt);

Color.D65 = new Pt_1.Pt(95.047, 100, 108.883, 1);
Color.ranges = {
    rgb: new Pt_1.Group(new Pt_1.Pt(0, 255), new Pt_1.Pt(0, 255), new Pt_1.Pt(0, 255)),
    hsl: new Pt_1.Group(new Pt_1.Pt(0, 360), new Pt_1.Pt(0, 1), new Pt_1.Pt(0, 1)),
    hsb: new Pt_1.Group(new Pt_1.Pt(0, 360), new Pt_1.Pt(0, 1), new Pt_1.Pt(0, 1)),
    lab: new Pt_1.Group(new Pt_1.Pt(0, 100), new Pt_1.Pt(-128, 127), new Pt_1.Pt(-128, 127)),
    lch: new Pt_1.Group(new Pt_1.Pt(0, 100), new Pt_1.Pt(0, 100), new Pt_1.Pt(0, 360)),
    luv: new Pt_1.Group(new Pt_1.Pt(0, 100), new Pt_1.Pt(-134, 220), new Pt_1.Pt(-140, 122)),
    xyz: new Pt_1.Group(new Pt_1.Pt(0, 100), new Pt_1.Pt(0, 100), new Pt_1.Pt(0, 100))
};
exports.Color = Color;

/***/ }),

/***/ "./src/Create.ts":
/*!***********************!*\
  !*** ./src/Create.ts ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*! Source code licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

Object.defineProperty(exports, "__esModule", { value: true });
var Pt_1 = __webpack_require__(/*! ./Pt */ "./src/Pt.ts");
var Op_1 = __webpack_require__(/*! ./Op */ "./src/Op.ts");
var Util_1 = __webpack_require__(/*! ./Util */ "./src/Util.ts");
var Num_1 = __webpack_require__(/*! ./Num */ "./src/Num.ts");
var LinearAlgebra_1 = __webpack_require__(/*! ./LinearAlgebra */ "./src/LinearAlgebra.ts");

var Create = function () {
    function Create() {
        _classCallCheck(this, Create);
    }

    _createClass(Create, null, [{
        key: "distributeRandom",
        value: function distributeRandom(bound, count) {
            var dimensions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 2;

            var pts = new Pt_1.Group();
            for (var i = 0; i < count; i++) {
                var p = [bound.x + Math.random() * bound.width];
                if (dimensions > 1) p.push(bound.y + Math.random() * bound.height);
                if (dimensions > 2) p.push(bound.z + Math.random() * bound.depth);
                pts.push(new Pt_1.Pt(p));
            }
            return pts;
        }
    }, {
        key: "distributeLinear",
        value: function distributeLinear(line, count) {
            var ln = Op_1.Line.subpoints(line, count - 2);
            ln.unshift(line[0]);
            ln.push(line[line.length - 1]);
            return ln;
        }
    }, {
        key: "gridPts",
        value: function gridPts(bound, columns, rows) {
            var orientation = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [0.5, 0.5];

            if (columns === 0 || rows === 0) throw new Error("grid columns and rows cannot be 0");
            var unit = bound.size.$subtract(1).$divide(columns, rows);
            var offset = unit.$multiply(orientation);
            var g = new Pt_1.Group();
            for (var r = 0; r < rows; r++) {
                for (var c = 0; c < columns; c++) {
                    g.push(bound.topLeft.$add(unit.$multiply(c, r)).add(offset));
                }
            }
            return g;
        }
    }, {
        key: "gridCells",
        value: function gridCells(bound, columns, rows) {
            if (columns === 0 || rows === 0) throw new Error("grid columns and rows cannot be 0");
            var unit = bound.size.$subtract(1).divide(columns, rows);
            var g = [];
            for (var r = 0; r < rows; r++) {
                for (var c = 0; c < columns; c++) {
                    g.push(new Pt_1.Group(bound.topLeft.$add(unit.$multiply(c, r)), bound.topLeft.$add(unit.$multiply(c, r).add(unit))));
                }
            }
            return g;
        }
    }, {
        key: "radialPts",
        value: function radialPts(center, radius, count) {
            var angleOffset = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : -Util_1.Const.half_pi;

            var g = new Pt_1.Group();
            var a = Util_1.Const.two_pi / count;
            for (var i = 0; i < count; i++) {
                g.push(new Pt_1.Pt(center).toAngle(a * i + angleOffset, radius, true));
            }
            return g;
        }
    }, {
        key: "noisePts",
        value: function noisePts(pts) {
            var dx = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0.01;
            var dy = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0.01;
            var rows = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
            var columns = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;

            var seed = Math.random();
            var g = new Pt_1.Group();
            for (var i = 0, len = pts.length; i < len; i++) {
                var np = new Noise(pts[i]);
                var r = rows && rows > 0 ? Math.floor(i / rows) : i;
                var c = columns && columns > 0 ? i % columns : i;
                np.initNoise(dx * c, dy * r);
                np.seed(seed);
                g.push(np);
            }
            return g;
        }
    }, {
        key: "delaunay",
        value: function delaunay(pts) {
            return Delaunay.from(pts);
        }
    }]);

    return Create;
}();

exports.Create = Create;
var __noise_grad3 = [[1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0], [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1], [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]];
var __noise_permTable = [151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 9, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180];

var Noise = function (_Pt_1$Pt) {
    _inherits(Noise, _Pt_1$Pt);

    function Noise() {
        var _ref;

        _classCallCheck(this, Noise);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        var _this = _possibleConstructorReturn(this, (_ref = Noise.__proto__ || Object.getPrototypeOf(Noise)).call.apply(_ref, [this].concat(args)));

        _this.perm = [];
        _this._n = new Pt_1.Pt(0.01, 0.01);
        _this.perm = __noise_permTable.concat(__noise_permTable);
        return _this;
    }

    _createClass(Noise, [{
        key: "initNoise",
        value: function initNoise() {
            for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                args[_key2] = arguments[_key2];
            }

            this._n = new (Function.prototype.bind.apply(Pt_1.Pt, [null].concat(args)))();
            return this;
        }
    }, {
        key: "step",
        value: function step() {
            var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
            var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

            this._n.add(x, y);
            return this;
        }
    }, {
        key: "seed",
        value: function seed(s) {
            if (s > 0 && s < 1) s *= 65536;
            s = Math.floor(s);
            if (s < 256) s |= s << 8;
            for (var i = 0; i < 255; i++) {
                var v = i & 1 ? __noise_permTable[i] ^ s & 255 : __noise_permTable[i] ^ s >> 8 & 255;
                this.perm[i] = this.perm[i + 256] = v;
            }
            return this;
        }
    }, {
        key: "noise2D",
        value: function noise2D() {
            var i = Math.max(0, Math.floor(this._n[0])) % 255;
            var j = Math.max(0, Math.floor(this._n[1])) % 255;
            var x = this._n[0] % 255 - i;
            var y = this._n[1] % 255 - j;
            var n00 = LinearAlgebra_1.Vec.dot(__noise_grad3[(i + this.perm[j]) % 12], [x, y, 0]);
            var n01 = LinearAlgebra_1.Vec.dot(__noise_grad3[(i + this.perm[j + 1]) % 12], [x, y - 1, 0]);
            var n10 = LinearAlgebra_1.Vec.dot(__noise_grad3[(i + 1 + this.perm[j]) % 12], [x - 1, y, 0]);
            var n11 = LinearAlgebra_1.Vec.dot(__noise_grad3[(i + 1 + this.perm[j + 1]) % 12], [x - 1, y - 1, 0]);
            var _fade = function _fade(f) {
                return f * f * f * (f * (f * 6 - 15) + 10);
            };
            var tx = _fade(x);
            return Num_1.Num.lerp(Num_1.Num.lerp(n00, n10, tx), Num_1.Num.lerp(n01, n11, tx), _fade(y));
        }
    }]);

    return Noise;
}(Pt_1.Pt);

exports.Noise = Noise;

var Delaunay = function (_Pt_1$Group) {
    _inherits(Delaunay, _Pt_1$Group);

    function Delaunay() {
        _classCallCheck(this, Delaunay);

        var _this2 = _possibleConstructorReturn(this, (Delaunay.__proto__ || Object.getPrototypeOf(Delaunay)).apply(this, arguments));

        _this2._mesh = [];
        return _this2;
    }

    _createClass(Delaunay, [{
        key: "delaunay",
        value: function delaunay() {
            var _this3 = this;

            var triangleOnly = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

            if (this.length < 3) return [];
            this._mesh = [];
            var n = this.length;
            var indices = [];
            for (var i = 0; i < n; i++) {
                indices[i] = i;
            }indices.sort(function (i, j) {
                return _this3[j][0] - _this3[i][0];
            });
            var pts = this.slice();
            var st = this._superTriangle();
            pts = pts.concat(st);
            var opened = [this._circum(n, n + 1, n + 2, st)];
            var closed = [];
            var tris = [];
            for (var _i = 0, len = indices.length; _i < len; _i++) {
                var c = indices[_i];
                var edges = [];
                var j = opened.length;
                if (!this._mesh[c]) this._mesh[c] = {};
                while (j--) {
                    var circum = opened[j];
                    var radius = circum.circle[1][0];
                    var d = pts[c].$subtract(circum.circle[0]);
                    if (d[0] > 0 && d[0] * d[0] > radius * radius) {
                        closed.push(circum);
                        tris.push(circum.triangle);
                        opened.splice(j, 1);
                        continue;
                    }
                    if (d[0] * d[0] + d[1] * d[1] - radius * radius > Util_1.Const.epsilon) {
                        continue;
                    }
                    edges.push(circum.i, circum.j, circum.j, circum.k, circum.k, circum.i);
                    opened.splice(j, 1);
                }
                Delaunay._dedupe(edges);
                j = edges.length;
                while (j > 1) {
                    opened.push(this._circum(edges[--j], edges[--j], c, false, pts));
                }
            }
            for (var _i2 = 0, _len3 = opened.length; _i2 < _len3; _i2++) {
                var o = opened[_i2];
                if (o.i < n && o.j < n && o.k < n) {
                    closed.push(o);
                    tris.push(o.triangle);
                    this._cache(o);
                }
            }
            return triangleOnly ? tris : closed;
        }
    }, {
        key: "voronoi",
        value: function voronoi() {
            var vs = [];
            var n = this._mesh;
            for (var i = 0, len = n.length; i < len; i++) {
                vs.push(this.neighborPts(i, true));
            }
            return vs;
        }
    }, {
        key: "mesh",
        value: function mesh() {
            return this._mesh;
        }
    }, {
        key: "neighborPts",
        value: function neighborPts(i) {
            var sort = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            var cs = new Pt_1.Group();
            var n = this._mesh;
            for (var k in n[i]) {
                if (n[i].hasOwnProperty(k)) cs.push(n[i][k].circle[0]);
            }
            return sort ? Num_1.Geom.sortEdges(cs) : cs;
        }
    }, {
        key: "neighbors",
        value: function neighbors(i) {
            var cs = [];
            var n = this._mesh;
            for (var k in n[i]) {
                if (n[i].hasOwnProperty(k)) cs.push(n[i][k]);
            }
            return cs;
        }
    }, {
        key: "_cache",
        value: function _cache(o) {
            this._mesh[o.i][Math.min(o.j, o.k) + "-" + Math.max(o.j, o.k)] = o;
            this._mesh[o.j][Math.min(o.i, o.k) + "-" + Math.max(o.i, o.k)] = o;
            this._mesh[o.k][Math.min(o.i, o.j) + "-" + Math.max(o.i, o.j)] = o;
        }
    }, {
        key: "_superTriangle",
        value: function _superTriangle() {
            var minPt = this[0];
            var maxPt = this[0];
            for (var i = 1, len = this.length; i < len; i++) {
                minPt = minPt.$min(this[i]);
                maxPt = maxPt.$max(this[i]);
            }
            var d = maxPt.$subtract(minPt);
            var mid = minPt.$add(maxPt).divide(2);
            var dmax = Math.max(d[0], d[1]);
            return new Pt_1.Group(mid.$subtract(20 * dmax, dmax), mid.$add(0, 20 * dmax), mid.$add(20 * dmax, -dmax));
        }
    }, {
        key: "_triangle",
        value: function _triangle(i, j, k) {
            var pts = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : this;

            return new Pt_1.Group(pts[i], pts[j], pts[k]);
        }
    }, {
        key: "_circum",
        value: function _circum(i, j, k, tri) {
            var pts = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : this;

            var t = tri || this._triangle(i, j, k, pts);
            return {
                i: i,
                j: j,
                k: k,
                triangle: t,
                circle: Op_1.Triangle.circumcircle(t)
            };
        }
    }], [{
        key: "_dedupe",
        value: function _dedupe(edges) {
            var j = edges.length;
            while (j > 1) {
                var b = edges[--j];
                var a = edges[--j];
                var i = j;
                while (i > 1) {
                    var n = edges[--i];
                    var m = edges[--i];
                    if (a == m && b == n || a == n && b == m) {
                        edges.splice(j, 2);
                        edges.splice(i, 2);
                        break;
                    }
                }
            }
            return edges;
        }
    }]);

    return Delaunay;
}(Pt_1.Group);

exports.Delaunay = Delaunay;

/***/ }),

/***/ "./src/Dom.ts":
/*!********************!*\
  !*** ./src/Dom.ts ***!
  \********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*! Source code licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

Object.defineProperty(exports, "__esModule", { value: true });
var Space_1 = __webpack_require__(/*! ./Space */ "./src/Space.ts");
var Form_1 = __webpack_require__(/*! ./Form */ "./src/Form.ts");
var Util_1 = __webpack_require__(/*! ./Util */ "./src/Util.ts");
var Pt_1 = __webpack_require__(/*! ./Pt */ "./src/Pt.ts");

var DOMSpace = function (_Space_1$MultiTouchSp) {
    _inherits(DOMSpace, _Space_1$MultiTouchSp);

    function DOMSpace(elem, callback) {
        _classCallCheck(this, DOMSpace);

        var _this = _possibleConstructorReturn(this, (DOMSpace.__proto__ || Object.getPrototypeOf(DOMSpace)).call(this));

        _this.id = "domspace";
        _this._autoResize = true;
        _this._bgcolor = "#e1e9f0";
        _this._css = {};
        var _selector = null;
        var _existed = false;
        _this.id = "pts";
        if (elem instanceof Element) {
            _selector = elem;
            _this.id = "pts_existing_space";
        } else {
            _selector = document.querySelector(elem);
            _existed = true;
            _this.id = elem.substr(1);
        }
        if (!_selector) {
            _this._container = DOMSpace.createElement("div", "pts_container");
            _this._canvas = DOMSpace.createElement("div", "pts_element");
            _this._container.appendChild(_this._canvas);
            document.body.appendChild(_this._container);
            _existed = false;
        } else {
            _this._canvas = _selector;
            _this._container = _selector.parentElement;
        }
        setTimeout(_this._ready.bind(_this, callback), 50);
        return _this;
    }

    _createClass(DOMSpace, [{
        key: "_ready",
        value: function _ready(callback) {
            if (!this._container) throw new Error("Cannot initiate #" + this.id + " element");
            this._isReady = true;
            this._resizeHandler(null);
            this.clear(this._bgcolor);
            this._canvas.dispatchEvent(new Event("ready"));
            for (var k in this.players) {
                if (this.players.hasOwnProperty(k)) {
                    if (this.players[k].start) this.players[k].start(this.bound.clone(), this);
                }
            }
            this._pointer = this.center;
            this.refresh(false);
            if (callback) callback(this.bound, this._canvas);
        }
    }, {
        key: "setup",
        value: function setup(opt) {
            if (opt.bgcolor) {
                this._bgcolor = opt.bgcolor;
            }
            this.autoResize = opt.resize != undefined ? opt.resize : false;
            return this;
        }
    }, {
        key: "getForm",
        value: function getForm() {
            return null;
        }
    }, {
        key: "resize",
        value: function resize(b, evt) {
            this.bound = b;
            this.styles({ width: b.width + "px", height: b.height + "px" }, true);
            for (var k in this.players) {
                if (this.players.hasOwnProperty(k)) {
                    var p = this.players[k];
                    if (p.resize) p.resize(this.bound, evt);
                }
            }
            return this;
        }
    }, {
        key: "_resizeHandler",
        value: function _resizeHandler(evt) {
            var b = Pt_1.Bound.fromBoundingRect(this._container.getBoundingClientRect());
            if (this._autoResize) {
                this.styles({ width: "100%", height: "100%" }, true);
            } else {
                this.styles({ width: b.width + "px", height: b.height + "px" }, true);
            }
            this.resize(b, evt);
        }
    }, {
        key: "clear",
        value: function clear(bg) {
            if (bg) this.background = bg;
            this._canvas.innerHTML = "";
            return this;
        }
    }, {
        key: "style",
        value: function style(key, val) {
            var update = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            this._css[key] = val;
            if (update) this._canvas.style[key] = val;
            return this;
        }
    }, {
        key: "styles",
        value: function styles(_styles) {
            var update = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            for (var k in _styles) {
                if (_styles.hasOwnProperty(k)) this.style(k, _styles[k], update);
            }
            return this;
        }
    }, {
        key: "autoResize",
        set: function set(auto) {
            this._autoResize = auto;
            if (auto) {
                window.addEventListener('resize', this._resizeHandler.bind(this));
            } else {
                delete this._css['width'];
                delete this._css['height'];
                window.removeEventListener('resize', this._resizeHandler.bind(this));
            }
        },
        get: function get() {
            return this._autoResize;
        }
    }, {
        key: "element",
        get: function get() {
            return this._canvas;
        }
    }, {
        key: "parent",
        get: function get() {
            return this._container;
        }
    }, {
        key: "ready",
        get: function get() {
            return this._isReady;
        }
    }, {
        key: "background",
        set: function set(bg) {
            this._bgcolor = bg;
            this._container.style.backgroundColor = this._bgcolor;
        },
        get: function get() {
            return this._bgcolor;
        }
    }], [{
        key: "createElement",
        value: function createElement() {
            var elem = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "div";
            var id = arguments[1];
            var appendTo = arguments[2];

            var d = document.createElement(elem);
            if (id) d.setAttribute("id", id);
            if (appendTo && appendTo.appendChild) appendTo.appendChild(d);
            return d;
        }
    }, {
        key: "setAttr",
        value: function setAttr(elem, data) {
            for (var k in data) {
                if (data.hasOwnProperty(k)) {
                    elem.setAttribute(k, data[k]);
                }
            }
            return elem;
        }
    }, {
        key: "getInlineStyles",
        value: function getInlineStyles(data) {
            var str = "";
            for (var k in data) {
                if (data.hasOwnProperty(k)) {
                    if (data[k]) str += k + ": " + data[k] + "; ";
                }
            }
            return str;
        }
    }]);

    return DOMSpace;
}(Space_1.MultiTouchSpace);

exports.DOMSpace = DOMSpace;

var HTMLSpace = function (_DOMSpace) {
    _inherits(HTMLSpace, _DOMSpace);

    function HTMLSpace() {
        _classCallCheck(this, HTMLSpace);

        return _possibleConstructorReturn(this, (HTMLSpace.__proto__ || Object.getPrototypeOf(HTMLSpace)).apply(this, arguments));
    }

    _createClass(HTMLSpace, [{
        key: "getForm",
        value: function getForm() {
            return new HTMLForm(this);
        }
    }, {
        key: "remove",
        value: function remove(player) {
            var temp = this._container.querySelectorAll("." + HTMLForm.scopeID(player));
            temp.forEach(function (el) {
                el.parentNode.removeChild(el);
            });
            return _get(HTMLSpace.prototype.__proto__ || Object.getPrototypeOf(HTMLSpace.prototype), "remove", this).call(this, player);
        }
    }, {
        key: "removeAll",
        value: function removeAll() {
            this._container.innerHTML = "";
            return _get(HTMLSpace.prototype.__proto__ || Object.getPrototypeOf(HTMLSpace.prototype), "removeAll", this).call(this);
        }
    }], [{
        key: "htmlElement",
        value: function htmlElement(parent, name, id) {
            var autoClass = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

            if (!parent || !parent.appendChild) throw new Error("parent is not a valid DOM element");
            var elem = document.querySelector("#" + id);
            if (!elem) {
                elem = document.createElement(name);
                elem.setAttribute("id", id);
                if (autoClass) elem.setAttribute("class", id.substring(0, id.indexOf("-")));
                parent.appendChild(elem);
            }
            return elem;
        }
    }]);

    return HTMLSpace;
}(DOMSpace);

exports.HTMLSpace = HTMLSpace;

var HTMLForm = function (_Form_1$VisualForm) {
    _inherits(HTMLForm, _Form_1$VisualForm);

    function HTMLForm(space) {
        _classCallCheck(this, HTMLForm);

        var _this3 = _possibleConstructorReturn(this, (HTMLForm.__proto__ || Object.getPrototypeOf(HTMLForm)).call(this));

        _this3._style = {
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
        _this3._ctx = {
            group: null,
            groupID: "pts",
            groupCount: 0,
            currentID: "pts0",
            currentClass: "",
            style: {}
        };
        _this3._ready = false;
        _this3._space = space;
        _this3._space.add({ start: function start() {
                _this3._ctx.group = _this3._space.element;
                _this3._ctx.groupID = "pts_dom_" + HTMLForm.groupID++;
                _this3._ctx.style = Object.assign({}, _this3._style);
                _this3._ready = true;
            } });
        return _this3;
    }

    _createClass(HTMLForm, [{
        key: "styleTo",
        value: function styleTo(k, v) {
            var unit = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

            if (this._ctx.style[k] === undefined) throw new Error(k + " style property doesn't exist");
            this._ctx.style[k] = "" + v + unit;
        }
    }, {
        key: "alpha",
        value: function alpha(a) {
            this.styleTo("opacity", a);
            return this;
        }
    }, {
        key: "fill",
        value: function fill(c) {
            if (typeof c == "boolean") {
                this.styleTo("filled", c);
                if (!c) this.styleTo("background", "transparent");
            } else {
                this.styleTo("filled", true);
                this.styleTo("background", c);
            }
            return this;
        }
    }, {
        key: "stroke",
        value: function stroke(c, width, linejoin, linecap) {
            if (typeof c == "boolean") {
                this.styleTo("stroked", c);
                if (!c) this.styleTo("border-width", 0);
            } else {
                this.styleTo("stroked", true);
                this.styleTo("border-color", c);
                this.styleTo("border-width", (width || 1) + "px");
            }
            return this;
        }
    }, {
        key: "fillText",
        value: function fillText(c) {
            this.styleTo("color", c);
            return this;
        }
    }, {
        key: "cls",
        value: function cls(c) {
            if (typeof c == "boolean") {
                this._ctx.currentClass = "";
            } else {
                this._ctx.currentClass = c;
            }
            return this;
        }
    }, {
        key: "font",
        value: function font(sizeOrFont, weight, style, lineHeight, family) {
            if (typeof sizeOrFont == "number") {
                this._font.size = sizeOrFont;
                if (family) this._font.face = family;
                if (weight) this._font.weight = weight;
                if (style) this._font.style = style;
                if (lineHeight) this._font.lineHeight = lineHeight;
            } else {
                this._font = sizeOrFont;
            }
            this._ctx.style['font'] = this._font.value;
            return this;
        }
    }, {
        key: "reset",
        value: function reset() {
            this._ctx.style = Object.assign({}, this._style);
            this._font = new Form_1.Font(10, "sans-serif");
            this._ctx.style['font'] = this._font.value;
            return this;
        }
    }, {
        key: "updateScope",
        value: function updateScope(group_id, group) {
            this._ctx.group = group;
            this._ctx.groupID = group_id;
            this._ctx.groupCount = 0;
            this.nextID();
            return this._ctx;
        }
    }, {
        key: "scope",
        value: function scope(item) {
            if (!item || item.animateID == null) throw new Error("item not defined or not yet added to Space");
            return this.updateScope(HTMLForm.scopeID(item), this.space.element);
        }
    }, {
        key: "nextID",
        value: function nextID() {
            this._ctx.groupCount++;
            this._ctx.currentID = this._ctx.groupID + "-" + this._ctx.groupCount;
            return this._ctx.currentID;
        }
    }, {
        key: "point",
        value: function point(pt) {
            var radius = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5;
            var shape = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "square";

            this.nextID();
            if (shape == "circle") this.styleTo("border-radius", "100%");
            HTMLForm.point(this._ctx, pt, radius, shape);
            return this;
        }
    }, {
        key: "circle",
        value: function circle(pts) {
            this.nextID();
            this.styleTo("border-radius", "100%");
            HTMLForm.circle(this._ctx, pts[0], pts[1][0]);
            return this;
        }
    }, {
        key: "square",
        value: function square(pt, halfsize) {
            this.nextID();
            HTMLForm.square(this._ctx, pt, halfsize);
            return this;
        }
    }, {
        key: "rect",
        value: function rect(pts) {
            this.nextID();
            this.styleTo("border-radius", "0");
            HTMLForm.rect(this._ctx, pts);
            return this;
        }
    }, {
        key: "text",
        value: function text(pt, txt) {
            this.nextID();
            HTMLForm.text(this._ctx, pt, txt);
            return this;
        }
    }, {
        key: "log",
        value: function log(txt) {
            this.fill("#000").stroke("#fff", 0.5).text([10, 14], txt);
            return this;
        }
    }, {
        key: "arc",
        value: function arc(pt, radius, startAngle, endAngle, cc) {
            Util_1.Util.warn("arc is not implemented in HTMLForm");
            return this;
        }
    }, {
        key: "line",
        value: function line(pts) {
            Util_1.Util.warn("line is not implemented in HTMLForm");
            return this;
        }
    }, {
        key: "polygon",
        value: function polygon(pts) {
            Util_1.Util.warn("polygon is not implemented in HTMLForm");
            return this;
        }
    }, {
        key: "space",
        get: function get() {
            return this._space;
        }
    }], [{
        key: "getID",
        value: function getID(ctx) {
            return ctx.currentID || "p-" + HTMLForm.domID++;
        }
    }, {
        key: "scopeID",
        value: function scopeID(item) {
            return "item-" + item.animateID;
        }
    }, {
        key: "style",
        value: function style(elem, styles) {
            var st = [];
            if (!styles["filled"]) st.push("background: none");
            if (!styles["stroked"]) st.push("border: none");
            for (var k in styles) {
                if (styles.hasOwnProperty(k) && k != "filled" && k != "stroked") {
                    var v = styles[k];
                    if (v) {
                        if (!styles["filled"] && k.indexOf('background') === 0) {
                            continue;
                        } else if (!styles["stroked"] && k.indexOf('border-width') === 0) {
                            continue;
                        } else {
                            st.push(k + ": " + v);
                        }
                    }
                }
            }
            return HTMLSpace.setAttr(elem, { style: st.join(";") });
        }
    }, {
        key: "rectStyle",
        value: function rectStyle(ctx, pt, size) {
            ctx.style["left"] = pt[0] + "px";
            ctx.style["top"] = pt[1] + "px";
            ctx.style["width"] = size[0] + "px";
            ctx.style["height"] = size[1] + "px";
            return ctx;
        }
    }, {
        key: "textStyle",
        value: function textStyle(ctx, pt) {
            ctx.style["left"] = pt[0] + "px";
            ctx.style["top"] = pt[1] + "px";
            return ctx;
        }
    }, {
        key: "point",
        value: function point(ctx, pt) {
            var radius = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 5;
            var shape = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "square";

            if (shape === "circle") {
                return HTMLForm.circle(ctx, pt, radius);
            } else {
                return HTMLForm.square(ctx, pt, radius);
            }
        }
    }, {
        key: "circle",
        value: function circle(ctx, pt) {
            var radius = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 10;

            var elem = HTMLSpace.htmlElement(ctx.group, "div", HTMLForm.getID(ctx));
            HTMLSpace.setAttr(elem, { class: "pts-form pts-circle " + ctx.currentClass });
            HTMLForm.rectStyle(ctx, new Pt_1.Pt(pt).$subtract(radius), new Pt_1.Pt(radius * 2, radius * 2));
            HTMLForm.style(elem, ctx.style);
            return elem;
        }
    }, {
        key: "square",
        value: function square(ctx, pt, halfsize) {
            var elem = HTMLSpace.htmlElement(ctx.group, "div", HTMLForm.getID(ctx));
            HTMLSpace.setAttr(elem, { class: "pts-form pts-square " + ctx.currentClass });
            HTMLForm.rectStyle(ctx, new Pt_1.Pt(pt).$subtract(halfsize), new Pt_1.Pt(halfsize * 2, halfsize * 2));
            HTMLForm.style(elem, ctx.style);
            return elem;
        }
    }, {
        key: "rect",
        value: function rect(ctx, pts) {
            if (!this._checkSize(pts)) return;
            var elem = HTMLSpace.htmlElement(ctx.group, "div", HTMLForm.getID(ctx));
            HTMLSpace.setAttr(elem, { class: "pts-form pts-rect " + ctx.currentClass });
            HTMLForm.rectStyle(ctx, pts[0], pts[1]);
            HTMLForm.style(elem, ctx.style);
            return elem;
        }
    }, {
        key: "text",
        value: function text(ctx, pt, txt) {
            var elem = HTMLSpace.htmlElement(ctx.group, "div", HTMLForm.getID(ctx));
            HTMLSpace.setAttr(elem, { class: "pts-form pts-text " + ctx.currentClass });
            elem.textContent = txt;
            HTMLForm.textStyle(ctx, pt);
            HTMLForm.style(elem, ctx.style);
            return elem;
        }
    }]);

    return HTMLForm;
}(Form_1.VisualForm);

HTMLForm.groupID = 0;
HTMLForm.domID = 0;
exports.HTMLForm = HTMLForm;

/***/ }),

/***/ "./src/Form.ts":
/*!*********************!*\
  !*** ./src/Form.ts ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*! Source code licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

Object.defineProperty(exports, "__esModule", { value: true });
var Util_1 = __webpack_require__(/*! ./Util */ "./src/Util.ts");

var Form = function () {
    function Form() {
        _classCallCheck(this, Form);

        this._ready = false;
    }

    _createClass(Form, [{
        key: "ready",
        get: function get() {
            return this._ready;
        }
    }], [{
        key: "_checkSize",
        value: function _checkSize(pts) {
            var required = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;

            if (pts.length < required) {
                Util_1.Util.warn("Requires 2 or more Pts in this Group.");
                return false;
            }
            return true;
        }
    }]);

    return Form;
}();

exports.Form = Form;

var VisualForm = function (_Form) {
    _inherits(VisualForm, _Form);

    function VisualForm() {
        _classCallCheck(this, VisualForm);

        var _this = _possibleConstructorReturn(this, (VisualForm.__proto__ || Object.getPrototypeOf(VisualForm)).apply(this, arguments));

        _this._filled = true;
        _this._stroked = true;
        _this._font = new Font(14, "sans-serif");
        return _this;
    }

    _createClass(VisualForm, [{
        key: "_multiple",
        value: function _multiple(groups, shape) {
            if (!groups) return this;

            for (var _len = arguments.length, rest = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
                rest[_key - 2] = arguments[_key];
            }

            for (var i = 0, len = groups.length; i < len; i++) {
                this[shape].apply(this, [groups[i]].concat(rest));
            }
            return this;
        }
    }, {
        key: "alpha",
        value: function alpha(a) {
            return this;
        }
    }, {
        key: "fill",
        value: function fill(c) {
            return this;
        }
    }, {
        key: "fillOnly",
        value: function fillOnly(c) {
            this.stroke(false);
            return this.fill(c);
        }
    }, {
        key: "stroke",
        value: function stroke(c, width, linejoin, linecap) {
            return this;
        }
    }, {
        key: "strokeOnly",
        value: function strokeOnly(c, width, linejoin, linecap) {
            this.fill(false);
            return this.stroke(c, width, linejoin, linecap);
        }
    }, {
        key: "points",
        value: function points(pts, radius, shape) {
            if (!pts) return;
            for (var i = 0, len = pts.length; i < len; i++) {
                this.point(pts[i], radius, shape);
            }
            return this;
        }
    }, {
        key: "circles",
        value: function circles(groups) {
            return this._multiple(groups, "circle");
        }
    }, {
        key: "squares",
        value: function squares(groups) {
            return this._multiple(groups, "square");
        }
    }, {
        key: "lines",
        value: function lines(groups) {
            return this._multiple(groups, "line");
        }
    }, {
        key: "polygons",
        value: function polygons(groups) {
            return this._multiple(groups, "polygon");
        }
    }, {
        key: "rects",
        value: function rects(groups) {
            return this._multiple(groups, "rect");
        }
    }, {
        key: "filled",
        get: function get() {
            return this._filled;
        },
        set: function set(b) {
            this._filled = b;
        }
    }, {
        key: "stroked",
        get: function get() {
            return this._stroked;
        },
        set: function set(b) {
            this._stroked = b;
        }
    }, {
        key: "currentFont",
        get: function get() {
            return this._font;
        }
    }]);

    return VisualForm;
}(Form);

exports.VisualForm = VisualForm;

var Font = function () {
    function Font() {
        var size = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 12;
        var face = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "sans-serif";
        var weight = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "";
        var style = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "";
        var lineHeight = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 1.5;

        _classCallCheck(this, Font);

        this.size = size;
        this.face = face;
        this.style = style;
        this.weight = weight;
        this.lineHeight = lineHeight;
    }

    _createClass(Font, [{
        key: "toString",
        value: function toString() {
            return this.value;
        }
    }, {
        key: "value",
        get: function get() {
            return this.style + " " + this.weight + " " + this.size + "px/" + this.lineHeight + " " + this.face;
        }
    }]);

    return Font;
}();

exports.Font = Font;

/***/ }),

/***/ "./src/LinearAlgebra.ts":
/*!******************************!*\
  !*** ./src/LinearAlgebra.ts ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*! Source code licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

Object.defineProperty(exports, "__esModule", { value: true });
var Pt_1 = __webpack_require__(/*! ./Pt */ "./src/Pt.ts");
var Op_1 = __webpack_require__(/*! ./Op */ "./src/Op.ts");

var Vec = function () {
    function Vec() {
        _classCallCheck(this, Vec);
    }

    _createClass(Vec, null, [{
        key: "add",
        value: function add(a, b) {
            if (typeof b == "number") {
                for (var i = 0, len = a.length; i < len; i++) {
                    a[i] += b;
                }
            } else {
                for (var _i = 0, _len = a.length; _i < _len; _i++) {
                    a[_i] += b[_i] || 0;
                }
            }
            return a;
        }
    }, {
        key: "subtract",
        value: function subtract(a, b) {
            if (typeof b == "number") {
                for (var i = 0, len = a.length; i < len; i++) {
                    a[i] -= b;
                }
            } else {
                for (var _i2 = 0, _len2 = a.length; _i2 < _len2; _i2++) {
                    a[_i2] -= b[_i2] || 0;
                }
            }
            return a;
        }
    }, {
        key: "multiply",
        value: function multiply(a, b) {
            if (typeof b == "number") {
                for (var i = 0, len = a.length; i < len; i++) {
                    a[i] *= b;
                }
            } else {
                if (a.length != b.length) {
                    throw new Error("Cannot do element-wise multiply since the array lengths don't match: " + a.toString() + " multiply-with " + b.toString());
                }
                for (var _i3 = 0, _len3 = a.length; _i3 < _len3; _i3++) {
                    a[_i3] *= b[_i3];
                }
            }
            return a;
        }
    }, {
        key: "divide",
        value: function divide(a, b) {
            if (typeof b == "number") {
                if (b === 0) throw new Error("Cannot divide by zero");
                for (var i = 0, len = a.length; i < len; i++) {
                    a[i] /= b;
                }
            } else {
                if (a.length != b.length) {
                    throw new Error("Cannot do element-wise divide since the array lengths don't match. " + a.toString() + " divide-by " + b.toString());
                }
                for (var _i4 = 0, _len4 = a.length; _i4 < _len4; _i4++) {
                    a[_i4] /= b[_i4];
                }
            }
            return a;
        }
    }, {
        key: "dot",
        value: function dot(a, b) {
            if (a.length != b.length) throw new Error("Array lengths don't match");
            var d = 0;
            for (var i = 0, len = a.length; i < len; i++) {
                d += a[i] * b[i];
            }
            return d;
        }
    }, {
        key: "cross2D",
        value: function cross2D(a, b) {
            return a[0] * b[1] - a[1] * b[0];
        }
    }, {
        key: "cross",
        value: function cross(a, b) {
            return new Pt_1.Pt(a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]);
        }
    }, {
        key: "magnitude",
        value: function magnitude(a) {
            return Math.sqrt(Vec.dot(a, a));
        }
    }, {
        key: "unit",
        value: function unit(a) {
            var magnitude = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;

            var m = magnitude === undefined ? Vec.magnitude(a) : magnitude;
            if (m === 0) return Pt_1.Pt.make(a.length);
            return Vec.divide(a, m);
        }
    }, {
        key: "abs",
        value: function abs(a) {
            return Vec.map(a, Math.abs);
        }
    }, {
        key: "floor",
        value: function floor(a) {
            return Vec.map(a, Math.floor);
        }
    }, {
        key: "ceil",
        value: function ceil(a) {
            return Vec.map(a, Math.ceil);
        }
    }, {
        key: "round",
        value: function round(a) {
            return Vec.map(a, Math.round);
        }
    }, {
        key: "max",
        value: function max(a) {
            var m = Number.MIN_VALUE;
            var index = 0;
            for (var i = 0, len = a.length; i < len; i++) {
                m = Math.max(m, a[i]);
                if (m === a[i]) index = i;
            }
            return { value: m, index: index };
        }
    }, {
        key: "min",
        value: function min(a) {
            var m = Number.MAX_VALUE;
            var index = 0;
            for (var i = 0, len = a.length; i < len; i++) {
                m = Math.min(m, a[i]);
                if (m === a[i]) index = i;
            }
            return { value: m, index: index };
        }
    }, {
        key: "sum",
        value: function sum(a) {
            var s = 0;
            for (var i = 0, len = a.length; i < len; i++) {
                s += a[i];
            }return s;
        }
    }, {
        key: "map",
        value: function map(a, fn) {
            for (var i = 0, len = a.length; i < len; i++) {
                a[i] = fn(a[i], i, a);
            }
            return a;
        }
    }]);

    return Vec;
}();

exports.Vec = Vec;

var Mat = function () {
    function Mat() {
        _classCallCheck(this, Mat);
    }

    _createClass(Mat, null, [{
        key: "add",
        value: function add(a, b) {
            if (typeof b != "number") {
                if (a[0].length != b[0].length) throw new Error("Cannot add matrix if rows' and columns' size don't match.");
                if (a.length != b.length) throw new Error("Cannot add matrix if rows' and columns' size don't match.");
            }
            var g = new Pt_1.Group();
            var isNum = typeof b == "number";
            for (var i = 0, len = a.length; i < len; i++) {
                g.push(a[i].$add(isNum ? b : b[i]));
            }
            return g;
        }
    }, {
        key: "multiply",
        value: function multiply(a, b) {
            var transposed = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
            var elementwise = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

            var g = new Pt_1.Group();
            if (typeof b != "number") {
                if (elementwise) {
                    if (a.length != b.length) throw new Error("Cannot multiply matrix element-wise because the matrices' sizes don't match.");
                    for (var ai = 0, alen = a.length; ai < alen; ai++) {
                        g.push(a[ai].$multiply(b[ai]));
                    }
                } else {
                    if (!transposed && a[0].length != b.length) throw new Error("Cannot multiply matrix if rows in matrix-a don't match columns in matrix-b.");
                    if (transposed && a[0].length != b[0].length) throw new Error("Cannot multiply matrix if transposed and the columns in both matrices don't match.");
                    if (!transposed) b = Mat.transpose(b);
                    for (var _ai = 0, _alen = a.length; _ai < _alen; _ai++) {
                        var p = Pt_1.Pt.make(b.length, 0);
                        for (var bi = 0, blen = b.length; bi < blen; bi++) {
                            p[bi] = Vec.dot(a[_ai], b[bi]);
                        }
                        g.push(p);
                    }
                }
            } else {
                for (var _ai2 = 0, _alen2 = a.length; _ai2 < _alen2; _ai2++) {
                    g.push(a[_ai2].$multiply(b));
                }
            }
            return g;
        }
    }, {
        key: "zipSlice",
        value: function zipSlice(g, index) {
            var defaultValue = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            var z = [];
            for (var i = 0, len = g.length; i < len; i++) {
                if (g[i].length - 1 < index && defaultValue === false) throw "Index " + index + " is out of bounds";
                z.push(g[i][index] || defaultValue);
            }
            return new Pt_1.Pt(z);
        }
    }, {
        key: "zip",
        value: function zip(g) {
            var defaultValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
            var useLongest = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            var ps = new Pt_1.Group();
            var len = useLongest ? g.reduce(function (a, b) {
                return Math.max(a, b.length);
            }, 0) : g[0].length;
            for (var i = 0; i < len; i++) {
                ps.push(Mat.zipSlice(g, i, defaultValue));
            }
            return ps;
        }
    }, {
        key: "transpose",
        value: function transpose(g) {
            var defaultValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
            var useLongest = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            return Mat.zip(g, defaultValue, useLongest);
        }
    }, {
        key: "transform2D",
        value: function transform2D(pt, m) {
            var x = pt[0] * m[0][0] + pt[1] * m[1][0] + m[2][0];
            var y = pt[0] * m[0][1] + pt[1] * m[1][1] + m[2][1];
            return new Pt_1.Pt(x, y);
        }
    }, {
        key: "scale2DMatrix",
        value: function scale2DMatrix(x, y) {
            return new Pt_1.Group(new Pt_1.Pt(x, 0, 0), new Pt_1.Pt(0, y, 0), new Pt_1.Pt(0, 0, 1));
        }
    }, {
        key: "rotate2DMatrix",
        value: function rotate2DMatrix(cosA, sinA) {
            return new Pt_1.Group(new Pt_1.Pt(cosA, sinA, 0), new Pt_1.Pt(-sinA, cosA, 0), new Pt_1.Pt(0, 0, 1));
        }
    }, {
        key: "shear2DMatrix",
        value: function shear2DMatrix(tanX, tanY) {
            return new Pt_1.Group(new Pt_1.Pt(1, tanX, 0), new Pt_1.Pt(tanY, 1, 0), new Pt_1.Pt(0, 0, 1));
        }
    }, {
        key: "translate2DMatrix",
        value: function translate2DMatrix(x, y) {
            return new Pt_1.Group(new Pt_1.Pt(1, 0, 0), new Pt_1.Pt(0, 1, 0), new Pt_1.Pt(x, y, 1));
        }
    }, {
        key: "scaleAt2DMatrix",
        value: function scaleAt2DMatrix(sx, sy, at) {
            var m = Mat.scale2DMatrix(sx, sy);
            m[2][0] = -at[0] * sx + at[0];
            m[2][1] = -at[1] * sy + at[1];
            return m;
        }
    }, {
        key: "rotateAt2DMatrix",
        value: function rotateAt2DMatrix(cosA, sinA, at) {
            var m = Mat.rotate2DMatrix(cosA, sinA);
            m[2][0] = at[0] * (1 - cosA) + at[1] * sinA;
            m[2][1] = at[1] * (1 - cosA) - at[0] * sinA;
            return m;
        }
    }, {
        key: "shearAt2DMatrix",
        value: function shearAt2DMatrix(tanX, tanY, at) {
            var m = Mat.shear2DMatrix(tanX, tanY);
            m[2][0] = -at[1] * tanY;
            m[2][1] = -at[0] * tanX;
            return m;
        }
    }, {
        key: "reflectAt2DMatrix",
        value: function reflectAt2DMatrix(p1, p2) {
            var intercept = Op_1.Line.intercept(p1, p2);
            if (intercept == undefined) {
                return [new Pt_1.Pt([-1, 0, 0]), new Pt_1.Pt([0, 1, 0]), new Pt_1.Pt([p1[0] + p2[0], 0, 1])];
            } else {
                var yi = intercept.yi;
                var ang2 = Math.atan(intercept.slope) * 2;
                var cosA = Math.cos(ang2);
                var sinA = Math.sin(ang2);
                return [new Pt_1.Pt([cosA, sinA, 0]), new Pt_1.Pt([sinA, -cosA, 0]), new Pt_1.Pt([-yi * sinA, yi + yi * cosA, 1])];
            }
        }
    }]);

    return Mat;
}();

exports.Mat = Mat;

/***/ }),

/***/ "./src/Num.ts":
/*!********************!*\
  !*** ./src/Num.ts ***!
  \********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*! Source code licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

Object.defineProperty(exports, "__esModule", { value: true });
var Util_1 = __webpack_require__(/*! ./Util */ "./src/Util.ts");
var Op_1 = __webpack_require__(/*! ./Op */ "./src/Op.ts");
var Pt_1 = __webpack_require__(/*! ./Pt */ "./src/Pt.ts");
var LinearAlgebra_1 = __webpack_require__(/*! ./LinearAlgebra */ "./src/LinearAlgebra.ts");

var Num = function () {
    function Num() {
        _classCallCheck(this, Num);
    }

    _createClass(Num, null, [{
        key: "equals",
        value: function equals(a, b) {
            var threshold = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0.00001;

            return Math.abs(a - b) < threshold;
        }
    }, {
        key: "lerp",
        value: function lerp(a, b, t) {
            return (1 - t) * a + t * b;
        }
    }, {
        key: "clamp",
        value: function clamp(val, min, max) {
            return Math.max(min, Math.min(max, val));
        }
    }, {
        key: "boundValue",
        value: function boundValue(val, min, max) {
            var len = Math.abs(max - min);
            var a = val % len;
            if (a > max) a -= len;else if (a < min) a += len;
            return a;
        }
    }, {
        key: "within",
        value: function within(p, a, b) {
            return p >= Math.min(a, b) && p <= Math.max(a, b);
        }
    }, {
        key: "randomRange",
        value: function randomRange(a) {
            var b = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

            var r = a > b ? a - b : b - a;
            return a + Math.random() * r;
        }
    }, {
        key: "normalizeValue",
        value: function normalizeValue(n, a, b) {
            var min = Math.min(a, b);
            var max = Math.max(a, b);
            return (n - min) / (max - min);
        }
    }, {
        key: "sum",
        value: function sum(pts) {
            var c = new Pt_1.Pt(pts[0]);
            for (var i = 1, len = pts.length; i < len; i++) {
                LinearAlgebra_1.Vec.add(c, pts[i]);
            }
            return c;
        }
    }, {
        key: "average",
        value: function average(pts) {
            return Num.sum(pts).divide(pts.length);
        }
    }, {
        key: "cycle",
        value: function cycle(t) {
            var method = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Shaping.sineInOut;

            return method(t > 0.5 ? 2 - t * 2 : t * 2);
        }
    }, {
        key: "mapToRange",
        value: function mapToRange(n, currA, currB, targetA, targetB) {
            if (currA == currB) throw new Error("[currMin, currMax] must define a range that is not zero");
            var min = Math.min(targetA, targetB);
            var max = Math.max(targetA, targetB);
            return Num.normalizeValue(n, currA, currB) * (max - min) + min;
        }
    }]);

    return Num;
}();

exports.Num = Num;

var Geom = function () {
    function Geom() {
        _classCallCheck(this, Geom);
    }

    _createClass(Geom, null, [{
        key: "boundAngle",
        value: function boundAngle(angle) {
            return Num.boundValue(angle, 0, 360);
        }
    }, {
        key: "boundRadian",
        value: function boundRadian(radian) {
            return Num.boundValue(radian, 0, Util_1.Const.two_pi);
        }
    }, {
        key: "toRadian",
        value: function toRadian(angle) {
            return angle * Util_1.Const.deg_to_rad;
        }
    }, {
        key: "toDegree",
        value: function toDegree(radian) {
            return radian * Util_1.Const.rad_to_deg;
        }
    }, {
        key: "boundingBox",
        value: function boundingBox(pts) {
            var minPt = pts.reduce(function (a, p) {
                return a.$min(p);
            });
            var maxPt = pts.reduce(function (a, p) {
                return a.$max(p);
            });
            return new Pt_1.Group(minPt, maxPt);
        }
    }, {
        key: "centroid",
        value: function centroid(pts) {
            return Num.average(pts);
        }
    }, {
        key: "anchor",
        value: function anchor(pts) {
            var ptOrIndex = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
            var direction = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "to";

            var method = direction == "to" ? "subtract" : "add";
            for (var i = 0, len = pts.length; i < len; i++) {
                if (typeof ptOrIndex == "number") {
                    if (ptOrIndex !== i) pts[i][method](pts[ptOrIndex]);
                } else {
                    pts[i][method](ptOrIndex);
                }
            }
        }
    }, {
        key: "interpolate",
        value: function interpolate(a, b) {
            var t = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0.5;

            var len = Math.min(a.length, b.length);
            var d = Pt_1.Pt.make(len);
            for (var i = 0; i < len; i++) {
                d[i] = a[i] * (1 - t) + b[i] * t;
            }
            return d;
        }
    }, {
        key: "perpendicular",
        value: function perpendicular(pt) {
            var axis = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Util_1.Const.xy;

            var y = axis[1];
            var x = axis[0];
            var p = new Pt_1.Pt(pt);
            var pa = new Pt_1.Pt(p);
            pa[x] = -p[y];
            pa[y] = p[x];
            var pb = new Pt_1.Pt(p);
            pb[x] = p[y];
            pb[y] = -p[x];
            return new Pt_1.Group(pa, pb);
        }
    }, {
        key: "isPerpendicular",
        value: function isPerpendicular(p1, p2) {
            return new Pt_1.Pt(p1).dot(p2) === 0;
        }
    }, {
        key: "withinBound",
        value: function withinBound(pt, boundPt1, boundPt2) {
            for (var i = 0, len = Math.min(pt.length, boundPt1.length, boundPt2.length); i < len; i++) {
                if (!Num.within(pt[i], boundPt1[i], boundPt2[i])) return false;
            }
            return true;
        }
    }, {
        key: "sortEdges",
        value: function sortEdges(pts) {
            var bounds = Geom.boundingBox(pts);
            var center = bounds[1].add(bounds[0]).divide(2);
            var fn = function fn(a, b) {
                if (a.length < 2 || b.length < 2) throw new Error("Pt dimension cannot be less than 2");
                var da = a.$subtract(center);
                var db = b.$subtract(center);
                if (da[0] >= 0 && db[0] < 0) return 1;
                if (da[0] < 0 && db[0] >= 0) return -1;
                if (da[0] == 0 && db[0] == 0) {
                    if (da[1] >= 0 || db[1] >= 0) return da[1] > db[1] ? 1 : -1;
                    return db[1] > da[1] ? 1 : -1;
                }
                var det = da.$cross2D(db);
                if (det < 0) return 1;
                if (det > 0) return -1;
                return da[0] * da[0] + da[1] * da[1] > db[0] * db[0] + db[1] * db[1] ? 1 : -1;
            };
            return pts.sort(fn);
        }
    }, {
        key: "scale",
        value: function scale(ps, _scale, anchor) {
            var pts = !Array.isArray(ps) ? [ps] : ps;
            var scs = typeof _scale == "number" ? Pt_1.Pt.make(pts[0].length, _scale) : _scale;
            if (!anchor) anchor = Pt_1.Pt.make(pts[0].length, 0);
            for (var i = 0, len = pts.length; i < len; i++) {
                var p = pts[i];
                for (var k = 0, lenP = p.length; k < lenP; k++) {
                    p[k] = anchor && anchor[k] ? anchor[k] + (p[k] - anchor[k]) * scs[k] : p[k] * scs[k];
                }
            }
            return Geom;
        }
    }, {
        key: "rotate2D",
        value: function rotate2D(ps, angle, anchor, axis) {
            var pts = !Array.isArray(ps) ? [ps] : ps;
            var fn = anchor ? LinearAlgebra_1.Mat.rotateAt2DMatrix : LinearAlgebra_1.Mat.rotate2DMatrix;
            if (!anchor) anchor = Pt_1.Pt.make(pts[0].length, 0);
            var cos = Math.cos(angle);
            var sin = Math.sin(angle);
            for (var i = 0, len = pts.length; i < len; i++) {
                var p = axis ? pts[i].$take(axis) : pts[i];
                p.to(LinearAlgebra_1.Mat.transform2D(p, fn(cos, sin, anchor)));
            }
            return Geom;
        }
    }, {
        key: "shear2D",
        value: function shear2D(ps, scale, anchor, axis) {
            var pts = !Array.isArray(ps) ? [ps] : ps;
            var s = typeof scale == "number" ? [scale, scale] : scale;
            if (!anchor) anchor = Pt_1.Pt.make(pts[0].length, 0);
            var fn = anchor ? LinearAlgebra_1.Mat.shearAt2DMatrix : LinearAlgebra_1.Mat.shear2DMatrix;
            var tanx = Math.tan(s[0]);
            var tany = Math.tan(s[1]);
            for (var i = 0, len = pts.length; i < len; i++) {
                var p = axis ? pts[i].$take(axis) : pts[i];
                p.to(LinearAlgebra_1.Mat.transform2D(p, fn(tanx, tany, anchor)));
            }
            return Geom;
        }
    }, {
        key: "reflect2D",
        value: function reflect2D(ps, line, axis) {
            var pts = !Array.isArray(ps) ? [ps] : ps;
            var mat = LinearAlgebra_1.Mat.reflectAt2DMatrix(line[0], line[1]);
            for (var i = 0, len = pts.length; i < len; i++) {
                var p = axis ? pts[i].$take(axis) : pts[i];
                p.to(LinearAlgebra_1.Mat.transform2D(p, mat));
            }
            return Geom;
        }
    }, {
        key: "cosTable",
        value: function cosTable() {
            var cos = new Float64Array(360);
            for (var i = 0; i < 360; i++) {
                cos[i] = Math.cos(i * Math.PI / 180);
            }var find = function find(rad) {
                return cos[Math.floor(Geom.boundAngle(Geom.toDegree(rad)))];
            };
            return { table: cos, cos: find };
        }
    }, {
        key: "sinTable",
        value: function sinTable() {
            var sin = new Float64Array(360);
            for (var i = 0; i < 360; i++) {
                sin[i] = Math.sin(i * Math.PI / 180);
            }var find = function find(rad) {
                return sin[Math.floor(Geom.boundAngle(Geom.toDegree(rad)))];
            };
            return { table: sin, sin: find };
        }
    }]);

    return Geom;
}();

exports.Geom = Geom;

var Shaping = function () {
    function Shaping() {
        _classCallCheck(this, Shaping);
    }

    _createClass(Shaping, null, [{
        key: "linear",
        value: function linear(t) {
            var c = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

            return c * t;
        }
    }, {
        key: "quadraticIn",
        value: function quadraticIn(t) {
            var c = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

            return c * t * t;
        }
    }, {
        key: "quadraticOut",
        value: function quadraticOut(t) {
            var c = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

            return -c * t * (t - 2);
        }
    }, {
        key: "quadraticInOut",
        value: function quadraticInOut(t) {
            var c = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

            var dt = t * 2;
            return t < 0.5 ? c / 2 * t * t * 4 : -c / 2 * ((dt - 1) * (dt - 3) - 1);
        }
    }, {
        key: "cubicIn",
        value: function cubicIn(t) {
            var c = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

            return c * t * t * t;
        }
    }, {
        key: "cubicOut",
        value: function cubicOut(t) {
            var c = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

            var dt = t - 1;
            return c * (dt * dt * dt + 1);
        }
    }, {
        key: "cubicInOut",
        value: function cubicInOut(t) {
            var c = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

            var dt = t * 2;
            return t < 0.5 ? c / 2 * dt * dt * dt : c / 2 * ((dt - 2) * (dt - 2) * (dt - 2) + 2);
        }
    }, {
        key: "exponentialIn",
        value: function exponentialIn(t) {
            var c = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
            var p = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0.25;

            return c * Math.pow(t, 1 / p);
        }
    }, {
        key: "exponentialOut",
        value: function exponentialOut(t) {
            var c = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
            var p = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0.25;

            return c * Math.pow(t, p);
        }
    }, {
        key: "sineIn",
        value: function sineIn(t) {
            var c = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

            return -c * Math.cos(t * Util_1.Const.half_pi) + c;
        }
    }, {
        key: "sineOut",
        value: function sineOut(t) {
            var c = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

            return c * Math.sin(t * Util_1.Const.half_pi);
        }
    }, {
        key: "sineInOut",
        value: function sineInOut(t) {
            var c = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

            return -c / 2 * (Math.cos(Math.PI * t) - 1);
        }
    }, {
        key: "cosineApprox",
        value: function cosineApprox(t) {
            var c = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

            var t2 = t * t;
            var t4 = t2 * t2;
            var t6 = t4 * t2;
            return c * (4 * t6 / 9 - 17 * t4 / 9 + 22 * t2 / 9);
        }
    }, {
        key: "circularIn",
        value: function circularIn(t) {
            var c = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

            return -c * (Math.sqrt(1 - t * t) - 1);
        }
    }, {
        key: "circularOut",
        value: function circularOut(t) {
            var c = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

            var dt = t - 1;
            return c * Math.sqrt(1 - dt * dt);
        }
    }, {
        key: "circularInOut",
        value: function circularInOut(t) {
            var c = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

            var dt = t * 2;
            return t < 0.5 ? -c / 2 * (Math.sqrt(1 - dt * dt) - 1) : c / 2 * (Math.sqrt(1 - (dt - 2) * (dt - 2)) + 1);
        }
    }, {
        key: "elasticIn",
        value: function elasticIn(t) {
            var c = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
            var p = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0.7;

            var dt = t - 1;
            var s = p / Util_1.Const.two_pi * 1.5707963267948966;
            return c * (-Math.pow(2, 10 * dt) * Math.sin((dt - s) * Util_1.Const.two_pi / p));
        }
    }, {
        key: "elasticOut",
        value: function elasticOut(t) {
            var c = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
            var p = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0.7;

            var s = p / Util_1.Const.two_pi * 1.5707963267948966;
            return c * (Math.pow(2, -10 * t) * Math.sin((t - s) * Util_1.Const.two_pi / p)) + c;
        }
    }, {
        key: "elasticInOut",
        value: function elasticInOut(t) {
            var c = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
            var p = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0.6;

            var dt = t * 2;
            var s = p / Util_1.Const.two_pi * 1.5707963267948966;
            if (t < 0.5) {
                dt -= 1;
                return c * (-0.5 * (Math.pow(2, 10 * dt) * Math.sin((dt - s) * Util_1.Const.two_pi / p)));
            } else {
                dt -= 1;
                return c * (0.5 * (Math.pow(2, -10 * dt) * Math.sin((dt - s) * Util_1.Const.two_pi / p))) + c;
            }
        }
    }, {
        key: "bounceIn",
        value: function bounceIn(t) {
            var c = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

            return c - Shaping.bounceOut(1 - t, c);
        }
    }, {
        key: "bounceOut",
        value: function bounceOut(t) {
            var c = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

            if (t < 1 / 2.75) {
                return c * (7.5625 * t * t);
            } else if (t < 2 / 2.75) {
                t -= 1.5 / 2.75;
                return c * (7.5625 * t * t + 0.75);
            } else if (t < 2.5 / 2.75) {
                t -= 2.25 / 2.75;
                return c * (7.5625 * t * t + 0.9375);
            } else {
                t -= 2.625 / 2.75;
                return c * (7.5625 * t * t + 0.984375);
            }
        }
    }, {
        key: "bounceInOut",
        value: function bounceInOut(t) {
            var c = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

            return t < 0.5 ? Shaping.bounceIn(t * 2, c) / 2 : Shaping.bounceOut(t * 2 - 1, c) / 2 + c / 2;
        }
    }, {
        key: "sigmoid",
        value: function sigmoid(t) {
            var c = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
            var p = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 10;

            var d = p * (t - 0.5);
            return c / (1 + Math.exp(-d));
        }
    }, {
        key: "logSigmoid",
        value: function logSigmoid(t) {
            var c = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
            var p = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0.7;

            p = Math.max(Util_1.Const.epsilon, Math.min(1 - Util_1.Const.epsilon, p));
            p = 1 / (1 - p);
            var A = 1 / (1 + Math.exp((t - 0.5) * p * -2));
            var B = 1 / (1 + Math.exp(p));
            var C = 1 / (1 + Math.exp(-p));
            return c * (A - B) / (C - B);
        }
    }, {
        key: "seat",
        value: function seat(t) {
            var c = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
            var p = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0.5;

            if (t < 0.5) {
                return c * Math.pow(2 * t, 1 - p) / 2;
            } else {
                return c * (1 - Math.pow(2 * (1 - t), 1 - p) / 2);
            }
        }
    }, {
        key: "quadraticBezier",
        value: function quadraticBezier(t) {
            var c = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
            var p = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [0.05, 0.95];

            var a = typeof p != "number" ? p[0] : p;
            var b = typeof p != "number" ? p[1] : 0.5;
            var om2a = 1 - 2 * a;
            if (om2a === 0) {
                om2a = Util_1.Const.epsilon;
            }
            var d = (Math.sqrt(a * a + om2a * t) - a) / om2a;
            return c * ((1 - 2 * b) * (d * d) + 2 * b * d);
        }
    }, {
        key: "cubicBezier",
        value: function cubicBezier(t) {
            var c = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
            var p1 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [0.1, 0.7];
            var p2 = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [0.9, 0.2];

            var curve = new Pt_1.Group(new Pt_1.Pt(0, 0), new Pt_1.Pt(p1), new Pt_1.Pt(p2), new Pt_1.Pt(1, 1));
            return c * Op_1.Curve.bezierStep(new Pt_1.Pt(t * t * t, t * t, t, 1), Op_1.Curve.controlPoints(curve)).y;
        }
    }, {
        key: "quadraticTarget",
        value: function quadraticTarget(t) {
            var c = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
            var p1 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [0.2, 0.35];

            var a = Math.min(1 - Util_1.Const.epsilon, Math.max(Util_1.Const.epsilon, p1[0]));
            var b = Math.min(1, Math.max(0, p1[1]));
            var A = (1 - b) / (1 - a) - b / a;
            var B = (A * (a * a) - b) / a;
            var y = A * (t * t) - B * t;
            return c * Math.min(1, Math.max(0, y));
        }
    }, {
        key: "cliff",
        value: function cliff(t) {
            var c = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
            var p = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0.5;

            return t > p ? c : 0;
        }
    }, {
        key: "step",
        value: function step(fn, steps, t, c) {
            var s = 1 / steps;
            var tt = Math.floor(t / s) * s;

            for (var _len = arguments.length, args = Array(_len > 4 ? _len - 4 : 0), _key = 4; _key < _len; _key++) {
                args[_key - 4] = arguments[_key];
            }

            return fn.apply(undefined, [tt, c].concat(args));
        }
    }]);

    return Shaping;
}();

exports.Shaping = Shaping;

var Range = function () {
    function Range(g) {
        _classCallCheck(this, Range);

        this._dims = 0;
        this._source = Pt_1.Group.fromPtArray(g);
        this.calc();
    }

    _createClass(Range, [{
        key: "calc",
        value: function calc() {
            if (!this._source) return;
            var dims = this._source[0].length;
            this._dims = dims;
            var max = new Pt_1.Pt(dims);
            var min = new Pt_1.Pt(dims);
            var mag = new Pt_1.Pt(dims);
            for (var i = 0; i < dims; i++) {
                max[i] = Util_1.Const.min;
                min[i] = Util_1.Const.max;
                mag[i] = 0;
                var s = this._source.zipSlice(i);
                for (var k = 0, len = s.length; k < len; k++) {
                    max[i] = Math.max(max[i], s[k]);
                    min[i] = Math.min(min[i], s[k]);
                    mag[i] = max[i] - min[i];
                }
            }
            this._max = max;
            this._min = min;
            this._mag = mag;
            return this;
        }
    }, {
        key: "mapTo",
        value: function mapTo(min, max, exclude) {
            var target = new Pt_1.Group();
            for (var i = 0, len = this._source.length; i < len; i++) {
                var g = this._source[i];
                var n = new Pt_1.Pt(this._dims);
                for (var k = 0; k < this._dims; k++) {
                    n[k] = exclude && exclude[k] ? g[k] : Num.mapToRange(g[k], this._min[k], this._max[k], min, max);
                }
                target.push(n);
            }
            return target;
        }
    }, {
        key: "append",
        value: function append(g) {
            var update = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

            if (g[0].length !== this._dims) throw new Error("Dimensions don't match. " + this._dims + " dimensions in Range and " + g[0].length + " provided in parameter. ");
            this._source = this._source.concat(g);
            if (update) this.calc();
            return this;
        }
    }, {
        key: "ticks",
        value: function ticks(count) {
            var g = new Pt_1.Group();
            for (var i = 0; i <= count; i++) {
                var p = new Pt_1.Pt(this._dims);
                for (var k = 0, len = this._max.length; k < len; k++) {
                    p[k] = Num.lerp(this._min[k], this._max[k], i / count);
                }
                g.push(p);
            }
            return g;
        }
    }, {
        key: "max",
        get: function get() {
            return this._max.clone();
        }
    }, {
        key: "min",
        get: function get() {
            return this._min.clone();
        }
    }, {
        key: "magnitude",
        get: function get() {
            return this._mag.clone();
        }
    }]);

    return Range;
}();

exports.Range = Range;

/***/ }),

/***/ "./src/Op.ts":
/*!*******************!*\
  !*** ./src/Op.ts ***!
  \*******************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*! Source code licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

Object.defineProperty(exports, "__esModule", { value: true });
var Util_1 = __webpack_require__(/*! ./Util */ "./src/Util.ts");
var Num_1 = __webpack_require__(/*! ./Num */ "./src/Num.ts");
var Pt_1 = __webpack_require__(/*! ./Pt */ "./src/Pt.ts");
var LinearAlgebra_1 = __webpack_require__(/*! ./LinearAlgebra */ "./src/LinearAlgebra.ts");
var _errorLength = function _errorLength(obj) {
    var param = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "expected";
    return Util_1.Util.warn("Group's length is less than " + param, obj);
};
var _errorOutofBound = function _errorOutofBound(obj) {
    var param = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
    return Util_1.Util.warn("Index " + param + " is out of bound in Group", obj);
};

var Line = function () {
    function Line() {
        _classCallCheck(this, Line);
    }

    _createClass(Line, null, [{
        key: "fromAngle",
        value: function fromAngle(anchor, angle, magnitude) {
            var g = new Pt_1.Group(new Pt_1.Pt(anchor), new Pt_1.Pt(anchor));
            g[1].toAngle(angle, magnitude, true);
            return g;
        }
    }, {
        key: "slope",
        value: function slope(p1, p2) {
            return p2[0] - p1[0] === 0 ? undefined : (p2[1] - p1[1]) / (p2[0] - p1[0]);
        }
    }, {
        key: "intercept",
        value: function intercept(p1, p2) {
            if (p2[0] - p1[0] === 0) {
                return undefined;
            } else {
                var m = (p2[1] - p1[1]) / (p2[0] - p1[0]);
                var c = p1[1] - m * p1[0];
                return { slope: m, yi: c, xi: m === 0 ? undefined : -c / m };
            }
        }
    }, {
        key: "sideOfPt2D",
        value: function sideOfPt2D(line, pt) {
            return (line[1][0] - line[0][0]) * (pt[1] - line[0][1]) - (pt[0] - line[0][0]) * (line[1][1] - line[0][1]);
        }
    }, {
        key: "collinear",
        value: function collinear(p1, p2, p3) {
            var threshold = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0.01;

            var a = new Pt_1.Pt(0, 0, 0).to(p1).$subtract(p2);
            var b = new Pt_1.Pt(0, 0, 0).to(p1).$subtract(p3);
            return a.$cross(b).divide(1000).equals(new Pt_1.Pt(0, 0, 0), threshold);
        }
    }, {
        key: "magnitude",
        value: function magnitude(line) {
            return line.length >= 2 ? line[1].$subtract(line[0]).magnitude() : 0;
        }
    }, {
        key: "magnitudeSq",
        value: function magnitudeSq(line) {
            return line.length >= 2 ? line[1].$subtract(line[0]).magnitudeSq() : 0;
        }
    }, {
        key: "perpendicularFromPt",
        value: function perpendicularFromPt(line, pt) {
            var asProjection = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            if (line[0].equals(line[1])) return undefined;
            var a = line[0].$subtract(line[1]);
            var b = line[1].$subtract(pt);
            var proj = b.$subtract(a.$project(b));
            return asProjection ? proj : proj.$add(pt);
        }
    }, {
        key: "distanceFromPt",
        value: function distanceFromPt(line, pt) {
            return Line.perpendicularFromPt(line, pt, true).magnitude();
        }
    }, {
        key: "intersectRay2D",
        value: function intersectRay2D(la, lb) {
            var a = Line.intercept(la[0], la[1]);
            var b = Line.intercept(lb[0], lb[1]);
            var pa = la[0];
            var pb = lb[0];
            if (a == undefined) {
                if (b == undefined) return undefined;
                var y1 = -b.slope * (pb[0] - pa[0]) + pb[1];
                return new Pt_1.Pt(pa[0], y1);
            } else {
                if (b == undefined) {
                    var _y = -a.slope * (pa[0] - pb[0]) + pa[1];
                    return new Pt_1.Pt(pb[0], _y);
                } else if (b.slope != a.slope) {
                    var px = (a.slope * pa[0] - b.slope * pb[0] + pb[1] - pa[1]) / (a.slope - b.slope);
                    var py = a.slope * (px - pa[0]) + pa[1];
                    return new Pt_1.Pt(px, py);
                } else {
                    if (a.yi == b.yi) {
                        return new Pt_1.Pt(pa[0], pa[1]);
                    } else {
                        return undefined;
                    }
                }
            }
        }
    }, {
        key: "intersectLine2D",
        value: function intersectLine2D(la, lb) {
            var pt = Line.intersectRay2D(la, lb);
            return pt && Num_1.Geom.withinBound(pt, la[0], la[1]) && Num_1.Geom.withinBound(pt, lb[0], lb[1]) ? pt : undefined;
        }
    }, {
        key: "intersectLineWithRay2D",
        value: function intersectLineWithRay2D(line, ray) {
            var pt = Line.intersectRay2D(line, ray);
            return pt && Num_1.Geom.withinBound(pt, line[0], line[1]) ? pt : undefined;
        }
    }, {
        key: "intersectPolygon2D",
        value: function intersectPolygon2D(lineOrRay, poly) {
            var sourceIsRay = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            var fn = sourceIsRay ? Line.intersectLineWithRay2D : Line.intersectLine2D;
            var pts = new Pt_1.Group();
            for (var i = 0, len = poly.length; i < len; i++) {
                var next = i === len - 1 ? 0 : i + 1;
                var d = fn([poly[i], poly[next]], lineOrRay);
                if (d) pts.push(d);
            }
            return pts.length > 0 ? pts : undefined;
        }
    }, {
        key: "intersectLines2D",
        value: function intersectLines2D(lines1, lines2) {
            var isRay = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            var group = new Pt_1.Group();
            var fn = isRay ? Line.intersectLineWithRay2D : Line.intersectLine2D;
            for (var i = 0, len = lines1.length; i < len; i++) {
                for (var k = 0, lenk = lines2.length; k < lenk; k++) {
                    var _ip = fn(lines1[i], lines2[k]);
                    if (_ip) group.push(_ip);
                }
            }
            return group;
        }
    }, {
        key: "intersectGridWithRay2D",
        value: function intersectGridWithRay2D(ray, gridPt) {
            var t = Line.intercept(new Pt_1.Pt(ray[0]).subtract(gridPt), new Pt_1.Pt(ray[1]).subtract(gridPt));
            var g = new Pt_1.Group();
            if (t && t.xi) g.push(new Pt_1.Pt(gridPt[0] + t.xi, gridPt[1]));
            if (t && t.yi) g.push(new Pt_1.Pt(gridPt[0], gridPt[1] + t.yi));
            return g;
        }
    }, {
        key: "intersectGridWithLine2D",
        value: function intersectGridWithLine2D(line, gridPt) {
            var g = Line.intersectGridWithRay2D(line, gridPt);
            var gg = new Pt_1.Group();
            for (var i = 0, len = g.length; i < len; i++) {
                if (Num_1.Geom.withinBound(g[i], line[0], line[1])) gg.push(g[i]);
            }
            return gg;
        }
    }, {
        key: "intersectRect2D",
        value: function intersectRect2D(line, rect) {
            var box = Num_1.Geom.boundingBox(Pt_1.Group.fromPtArray(line));
            if (!Rectangle.hasIntersectRect2D(box, rect)) return new Pt_1.Group();
            return Line.intersectLines2D([line], Rectangle.sides(rect));
        }
    }, {
        key: "subpoints",
        value: function subpoints(line, num) {
            var pts = new Pt_1.Group();
            for (var i = 1; i <= num; i++) {
                pts.push(Num_1.Geom.interpolate(line[0], line[1], i / (num + 1)));
            }
            return pts;
        }
    }, {
        key: "crop",
        value: function crop(line, size) {
            var index = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
            var cropAsCircle = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

            var tdx = index === 0 ? 1 : 0;
            var ls = line[tdx].$subtract(line[index]);
            if (ls[0] === 0 || size[0] === 0) return line[index];
            if (cropAsCircle) {
                var d = ls.unit().multiply(size[1]);
                return line[index].$add(d);
            } else {
                var rect = Rectangle.fromCenter(line[index], size);
                var sides = Rectangle.sides(rect);
                var sideIdx = 0;
                if (Math.abs(ls[1] / ls[0]) > Math.abs(size[1] / size[0])) {
                    sideIdx = ls[1] < 0 ? 0 : 2;
                } else {
                    sideIdx = ls[0] < 0 ? 3 : 1;
                }
                return Line.intersectRay2D(sides[sideIdx], line);
            }
        }
    }, {
        key: "marker",
        value: function marker(line, size) {
            var graphic = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "arrow" || "line";
            var atTail = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

            var h = atTail ? 0 : 1;
            var t = atTail ? 1 : 0;
            var unit = line[h].$subtract(line[t]);
            if (unit.magnitudeSq() === 0) return new Pt_1.Group();
            unit.unit();
            var ps = Num_1.Geom.perpendicular(unit).multiply(size[0]).add(line[t]);
            if (graphic == "arrow") {
                ps.add(unit.$multiply(size[1]));
                return new Pt_1.Group(line[t], ps[0], ps[1]);
            } else {
                return new Pt_1.Group(ps[0], ps[1]);
            }
        }
    }, {
        key: "toRect",
        value: function toRect(line) {
            return new Pt_1.Group(line[0].$min(line[1]), line[0].$max(line[1]));
        }
    }]);

    return Line;
}();

exports.Line = Line;

var Rectangle = function () {
    function Rectangle() {
        _classCallCheck(this, Rectangle);
    }

    _createClass(Rectangle, null, [{
        key: "from",
        value: function from(topLeft, widthOrSize, height) {
            return Rectangle.fromTopLeft(topLeft, widthOrSize, height);
        }
    }, {
        key: "fromTopLeft",
        value: function fromTopLeft(topLeft, widthOrSize, height) {
            var size = typeof widthOrSize == "number" ? [widthOrSize, height || widthOrSize] : widthOrSize;
            return new Pt_1.Group(new Pt_1.Pt(topLeft), new Pt_1.Pt(topLeft).add(size));
        }
    }, {
        key: "fromCenter",
        value: function fromCenter(center, widthOrSize, height) {
            var half = typeof widthOrSize == "number" ? [widthOrSize / 2, (height || widthOrSize) / 2] : new Pt_1.Pt(widthOrSize).divide(2);
            return new Pt_1.Group(new Pt_1.Pt(center).subtract(half), new Pt_1.Pt(center).add(half));
        }
    }, {
        key: "toCircle",
        value: function toCircle(pts) {
            var within = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

            return Circle.fromRect(pts, within);
        }
    }, {
        key: "toSquare",
        value: function toSquare(pts) {
            var enclose = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            var s = Rectangle.size(pts);
            var m = enclose ? s.maxValue().value : s.minValue().value;
            return Rectangle.fromCenter(Rectangle.center(pts), m, m);
        }
    }, {
        key: "size",
        value: function size(pts) {
            return pts[0].$max(pts[1]).subtract(pts[0].$min(pts[1]));
        }
    }, {
        key: "center",
        value: function center(pts) {
            var min = pts[0].$min(pts[1]);
            var max = pts[0].$max(pts[1]);
            return min.add(max.$subtract(min).divide(2));
        }
    }, {
        key: "corners",
        value: function corners(rect) {
            var p0 = rect[0].$min(rect[1]);
            var p2 = rect[0].$max(rect[1]);
            return new Pt_1.Group(p0, new Pt_1.Pt(p2.x, p0.y), p2, new Pt_1.Pt(p0.x, p2.y));
        }
    }, {
        key: "sides",
        value: function sides(rect) {
            var _Rectangle$corners = Rectangle.corners(rect),
                _Rectangle$corners2 = _slicedToArray(_Rectangle$corners, 4),
                p0 = _Rectangle$corners2[0],
                p1 = _Rectangle$corners2[1],
                p2 = _Rectangle$corners2[2],
                p3 = _Rectangle$corners2[3];

            return [new Pt_1.Group(p0, p1), new Pt_1.Group(p1, p2), new Pt_1.Group(p2, p3), new Pt_1.Group(p3, p0)];
        }
    }, {
        key: "boundingBox",
        value: function boundingBox(rects) {
            var merged = Util_1.Util.flatten(rects, false);
            var min = Pt_1.Pt.make(2, Number.MAX_VALUE);
            var max = Pt_1.Pt.make(2, Number.MIN_VALUE);
            for (var i = 0, len = merged.length; i < len; i++) {
                for (var k = 0; k < 2; k++) {
                    min[k] = Math.min(min[k], merged[i][k]);
                    max[k] = Math.max(max[k], merged[i][k]);
                }
            }
            return new Pt_1.Group(min, max);
        }
    }, {
        key: "polygon",
        value: function polygon(rect) {
            return Rectangle.corners(rect);
        }
    }, {
        key: "quadrants",
        value: function quadrants(rect, center) {
            var corners = Rectangle.corners(rect);
            var _center = center != undefined ? new Pt_1.Pt(center) : Rectangle.center(rect);
            return corners.map(function (c) {
                return new Pt_1.Group(c, _center).boundingBox();
            });
        }
    }, {
        key: "halves",
        value: function halves(rect) {
            var ratio = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0.5;
            var asRows = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            var min = rect[0].$min(rect[1]);
            var max = rect[0].$max(rect[1]);
            var mid = asRows ? Num_1.Num.lerp(min[1], max[1], ratio) : Num_1.Num.lerp(min[0], max[0], ratio);
            return asRows ? [new Pt_1.Group(min, new Pt_1.Pt(max[0], mid)), new Pt_1.Group(new Pt_1.Pt(min[0], mid), max)] : [new Pt_1.Group(min, new Pt_1.Pt(mid, max[1])), new Pt_1.Group(new Pt_1.Pt(mid, min[1]), max)];
        }
    }, {
        key: "withinBound",
        value: function withinBound(rect, pt) {
            return Num_1.Geom.withinBound(pt, rect[0], rect[1]);
        }
    }, {
        key: "hasIntersectRect2D",
        value: function hasIntersectRect2D(rect1, rect2) {
            var resetBoundingBox = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            if (resetBoundingBox) {
                rect1 = Num_1.Geom.boundingBox(rect1);
                rect2 = Num_1.Geom.boundingBox(rect2);
            }
            if (rect1[0][0] > rect2[1][0] || rect2[0][0] > rect1[1][0]) return false;
            if (rect1[0][1] > rect2[1][1] || rect2[0][1] > rect1[1][1]) return false;
            return true;
        }
    }, {
        key: "intersectRect2D",
        value: function intersectRect2D(rect1, rect2) {
            if (!Rectangle.hasIntersectRect2D(rect1, rect2)) return new Pt_1.Group();
            return Line.intersectLines2D(Rectangle.sides(rect1), Rectangle.sides(rect2));
        }
    }]);

    return Rectangle;
}();

exports.Rectangle = Rectangle;

var Circle = function () {
    function Circle() {
        _classCallCheck(this, Circle);
    }

    _createClass(Circle, null, [{
        key: "fromRect",
        value: function fromRect(pts) {
            var enclose = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            var r = 0;
            var min = r = Rectangle.size(pts).minValue().value / 2;
            if (enclose) {
                var max = Rectangle.size(pts).maxValue().value / 2;
                r = Math.sqrt(min * min + max * max);
            } else {
                r = min;
            }
            return new Pt_1.Group(Rectangle.center(pts), new Pt_1.Pt(r, r));
        }
    }, {
        key: "fromTriangle",
        value: function fromTriangle(pts) {
            var enclose = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            if (enclose) {
                return Triangle.circumcircle(pts);
            } else {
                return Triangle.incircle(pts);
            }
        }
    }, {
        key: "fromCenter",
        value: function fromCenter(pt, radius) {
            return new Pt_1.Group(new Pt_1.Pt(pt), new Pt_1.Pt(radius, radius));
        }
    }, {
        key: "withinBound",
        value: function withinBound(pts, pt) {
            var threshold = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

            var d = pts[0].$subtract(pt);
            return d.dot(d) + threshold < pts[1].x * pts[1].x;
        }
    }, {
        key: "intersectRay2D",
        value: function intersectRay2D(pts, ray) {
            var d = ray[0].$subtract(ray[1]);
            var f = pts[0].$subtract(ray[0]);
            var a = d.dot(d);
            var b = f.dot(d);
            var c = f.dot(f) - pts[1].x * pts[1].x;
            var p = b / a;
            var q = c / a;
            var disc = p * p - q;
            if (disc < 0) {
                return new Pt_1.Group();
            } else {
                var discSqrt = Math.sqrt(disc);
                var t1 = -p + discSqrt;
                var p1 = ray[0].$subtract(d.$multiply(t1));
                if (disc === 0) return new Pt_1.Group(p1);
                var t2 = -p - discSqrt;
                var p2 = ray[0].$subtract(d.$multiply(t2));
                return new Pt_1.Group(p1, p2);
            }
        }
    }, {
        key: "intersectLine2D",
        value: function intersectLine2D(pts, line) {
            var ps = Circle.intersectRay2D(pts, line);
            var g = new Pt_1.Group();
            if (ps.length > 0) {
                for (var i = 0, len = ps.length; i < len; i++) {
                    if (Rectangle.withinBound(line, ps[i])) g.push(ps[i]);
                }
            }
            return g;
        }
    }, {
        key: "intersectCircle2D",
        value: function intersectCircle2D(pts, circle) {
            var dv = circle[0].$subtract(pts[0]);
            var dr2 = dv.magnitudeSq();
            var dr = Math.sqrt(dr2);
            var ar = pts[1].x;
            var br = circle[1].x;
            var ar2 = ar * ar;
            var br2 = br * br;
            if (dr > ar + br) {
                return new Pt_1.Group();
            } else if (dr < Math.abs(ar - br)) {
                return new Pt_1.Group(pts[0].clone());
            } else {
                var a = (ar2 - br2 + dr2) / (2 * dr);
                var h = Math.sqrt(ar2 - a * a);
                var p = dv.$multiply(a / dr).add(pts[0]);
                return new Pt_1.Group(new Pt_1.Pt(p.x + h * dv.y / dr, p.y - h * dv.x / dr), new Pt_1.Pt(p.x - h * dv.y / dr, p.y + h * dv.x / dr));
            }
        }
    }, {
        key: "intersectRect2D",
        value: function intersectRect2D(pts, rect) {
            var sides = Rectangle.sides(rect);
            var g = [];
            for (var i = 0, len = sides.length; i < len; i++) {
                var ps = Circle.intersectLine2D(pts, sides[i]);
                if (ps.length > 0) g.push(ps);
            }
            return Util_1.Util.flatten(g);
        }
    }, {
        key: "toRect",
        value: function toRect(pts) {
            var within = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            var r = pts[1][0];
            if (within) {
                var half = Math.sqrt(r * r) / 2;
                return new Pt_1.Group(pts[0].$subtract(half), pts[0].$add(half));
            } else {
                return new Pt_1.Group(pts[0].$subtract(r), pts[0].$add(r));
            }
        }
    }, {
        key: "toTriangle",
        value: function toTriangle(pts) {
            var within = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

            if (within) {
                var ang = -Math.PI / 2;
                var inc = Math.PI * 2 / 3;
                var g = new Pt_1.Group();
                for (var i = 0; i < 3; i++) {
                    g.push(pts[0].clone().toAngle(ang, pts[1][0], true));
                    ang += inc;
                }
                return g;
            } else {
                return Triangle.fromCenter(pts[0], pts[1][0]);
            }
        }
    }]);

    return Circle;
}();

exports.Circle = Circle;

var Triangle = function () {
    function Triangle() {
        _classCallCheck(this, Triangle);
    }

    _createClass(Triangle, null, [{
        key: "fromRect",
        value: function fromRect(rect) {
            var top = rect[0].$add(rect[1]).divide(2);
            top.y = rect[0][1];
            var left = rect[1].clone();
            left.x = rect[0][0];
            return new Pt_1.Group(top, rect[1].clone(), left);
        }
    }, {
        key: "fromCircle",
        value: function fromCircle(circle) {
            return Circle.toTriangle(circle, true);
        }
    }, {
        key: "fromCenter",
        value: function fromCenter(pt, size) {
            return Triangle.fromCircle(Circle.fromCenter(pt, size));
        }
    }, {
        key: "medial",
        value: function medial(pts) {
            if (pts.length < 3) return _errorLength(new Pt_1.Group(), 3);
            return Polygon.midpoints(pts, true);
        }
    }, {
        key: "oppositeSide",
        value: function oppositeSide(pts, index) {
            if (pts.length < 3) return _errorLength(new Pt_1.Group(), 3);
            if (index === 0) {
                return Pt_1.Group.fromPtArray([pts[1], pts[2]]);
            } else if (index === 1) {
                return Pt_1.Group.fromPtArray([pts[0], pts[2]]);
            } else {
                return Pt_1.Group.fromPtArray([pts[0], pts[1]]);
            }
        }
    }, {
        key: "altitude",
        value: function altitude(pts, index) {
            var opp = Triangle.oppositeSide(pts, index);
            if (opp.length > 1) {
                return new Pt_1.Group(pts[index], Line.perpendicularFromPt(opp, pts[index]));
            } else {
                return new Pt_1.Group();
            }
        }
    }, {
        key: "orthocenter",
        value: function orthocenter(pts) {
            if (pts.length < 3) return _errorLength(undefined, 3);
            var a = Triangle.altitude(pts, 0);
            var b = Triangle.altitude(pts, 1);
            return Line.intersectRay2D(a, b);
        }
    }, {
        key: "incenter",
        value: function incenter(pts) {
            if (pts.length < 3) return _errorLength(undefined, 3);
            var a = Polygon.bisector(pts, 0).add(pts[0]);
            var b = Polygon.bisector(pts, 1).add(pts[1]);
            return Line.intersectRay2D(new Pt_1.Group(pts[0], a), new Pt_1.Group(pts[1], b));
        }
    }, {
        key: "incircle",
        value: function incircle(pts, center) {
            var c = center ? center : Triangle.incenter(pts);
            var area = Polygon.area(pts);
            var perim = Polygon.perimeter(pts, true);
            var r = 2 * area / perim.total;
            return Circle.fromCenter(c, r);
        }
    }, {
        key: "circumcenter",
        value: function circumcenter(pts) {
            var md = Triangle.medial(pts);
            var a = [md[0], Num_1.Geom.perpendicular(pts[0].$subtract(md[0])).p1.$add(md[0])];
            var b = [md[1], Num_1.Geom.perpendicular(pts[1].$subtract(md[1])).p1.$add(md[1])];
            return Line.intersectRay2D(a, b);
        }
    }, {
        key: "circumcircle",
        value: function circumcircle(pts, center) {
            var c = center ? center : Triangle.circumcenter(pts);
            var r = pts[0].$subtract(c).magnitude();
            return Circle.fromCenter(c, r);
        }
    }]);

    return Triangle;
}();

exports.Triangle = Triangle;

var Polygon = function () {
    function Polygon() {
        _classCallCheck(this, Polygon);
    }

    _createClass(Polygon, null, [{
        key: "centroid",
        value: function centroid(pts) {
            return Num_1.Geom.centroid(pts);
        }
    }, {
        key: "rectangle",
        value: function rectangle(center, widthOrSize, height) {
            return Rectangle.corners(Rectangle.fromCenter(center, widthOrSize, height));
        }
    }, {
        key: "fromCenter",
        value: function fromCenter(center, radius, sides) {
            var g = new Pt_1.Group();
            for (var i = 0; i < sides; i++) {
                var ang = Math.PI * 2 * i / sides;
                g.push(new Pt_1.Pt(Math.cos(ang) * radius, Math.sin(ang) * radius).add(center));
            }
            return g;
        }
    }, {
        key: "lineAt",
        value: function lineAt(pts, idx) {
            if (idx < 0 || idx >= pts.length) throw new Error("index out of the Polygon's range");
            return new Pt_1.Group(pts[idx], idx === pts.length - 1 ? pts[0] : pts[idx + 1]);
        }
    }, {
        key: "lines",
        value: function lines(pts) {
            var closePath = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

            if (pts.length < 2) return _errorLength(new Pt_1.Group(), 2);
            var sp = Util_1.Util.split(pts, 2, 1);
            if (closePath) sp.push(new Pt_1.Group(pts[pts.length - 1], pts[0]));
            return sp.map(function (g) {
                return g;
            });
        }
    }, {
        key: "midpoints",
        value: function midpoints(pts) {
            var closePath = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
            var t = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0.5;

            if (pts.length < 2) return _errorLength(new Pt_1.Group(), 2);
            var sides = Polygon.lines(pts, closePath);
            var mids = sides.map(function (s) {
                return Num_1.Geom.interpolate(s[0], s[1], t);
            });
            return mids;
        }
    }, {
        key: "adjacentSides",
        value: function adjacentSides(pts, index) {
            var closePath = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            if (pts.length < 2) return _errorLength(new Pt_1.Group(), 2);
            if (index < 0 || index >= pts.length) return _errorOutofBound(new Pt_1.Group(), index);
            var gs = [];
            var left = index - 1;
            if (closePath && left < 0) left = pts.length - 1;
            if (left >= 0) gs.push(new Pt_1.Group(pts[index], pts[left]));
            var right = index + 1;
            if (closePath && right > pts.length - 1) right = 0;
            if (right <= pts.length - 1) gs.push(new Pt_1.Group(pts[index], pts[right]));
            return gs;
        }
    }, {
        key: "bisector",
        value: function bisector(pts, index) {
            var sides = Polygon.adjacentSides(pts, index, true);
            if (sides.length >= 2) {
                var a = sides[0][1].$subtract(sides[0][0]).unit();
                var b = sides[1][1].$subtract(sides[1][0]).unit();
                return a.add(b).divide(2);
            } else {
                return undefined;
            }
        }
    }, {
        key: "perimeter",
        value: function perimeter(pts) {
            var closePath = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            if (pts.length < 2) return _errorLength(new Pt_1.Group(), 2);
            var lines = Polygon.lines(pts, closePath);
            var mag = 0;
            var p = Pt_1.Pt.make(lines.length, 0);
            for (var i = 0, len = lines.length; i < len; i++) {
                var m = Line.magnitude(lines[i]);
                mag += m;
                p[i] = m;
            }
            return {
                total: mag,
                segments: p
            };
        }
    }, {
        key: "area",
        value: function area(pts) {
            if (pts.length < 3) return _errorLength(new Pt_1.Group(), 3);
            var det = function det(a, b) {
                return a[0] * b[1] - a[1] * b[0];
            };
            var area = 0;
            for (var i = 0, len = pts.length; i < len; i++) {
                if (i < pts.length - 1) {
                    area += det(pts[i], pts[i + 1]);
                } else {
                    area += det(pts[i], pts[0]);
                }
            }
            return Math.abs(area / 2);
        }
    }, {
        key: "convexHull",
        value: function convexHull(pts) {
            var sorted = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            if (pts.length < 3) return _errorLength(new Pt_1.Group(), 3);
            if (!sorted) {
                pts = pts.slice();
                pts.sort(function (a, b) {
                    return a[0] - b[0];
                });
            }
            var left = function left(a, b, c) {
                return (b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1]) > 0;
            };
            var dq = [];
            var bot = pts.length - 2;
            var top = bot + 3;
            dq[bot] = pts[2];
            dq[top] = pts[2];
            if (left(pts[0], pts[1], pts[2])) {
                dq[bot + 1] = pts[0];
                dq[bot + 2] = pts[1];
            } else {
                dq[bot + 1] = pts[1];
                dq[bot + 2] = pts[0];
            }
            for (var i = 3, len = pts.length; i < len; i++) {
                var pt = pts[i];
                if (left(dq[bot], dq[bot + 1], pt) && left(dq[top - 1], dq[top], pt)) {
                    continue;
                }
                while (!left(dq[bot], dq[bot + 1], pt)) {
                    bot += 1;
                }
                bot -= 1;
                dq[bot] = pt;
                while (!left(dq[top - 1], dq[top], pt)) {
                    top -= 1;
                }
                top += 1;
                dq[top] = pt;
            }
            var hull = new Pt_1.Group();
            for (var h = 0; h < top - bot; h++) {
                hull.push(dq[bot + h]);
            }
            return hull;
        }
    }, {
        key: "network",
        value: function network(pts) {
            var originIndex = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

            var g = [];
            for (var i = 0, len = pts.length; i < len; i++) {
                if (i != originIndex) g.push(new Pt_1.Group(pts[originIndex], pts[i]));
            }
            return g;
        }
    }, {
        key: "nearestPt",
        value: function nearestPt(pts, pt) {
            var _near = Number.MAX_VALUE;
            var _item = -1;
            for (var i = 0, len = pts.length; i < len; i++) {
                var d = pts[i].$subtract(pt).magnitudeSq();
                if (d < _near) {
                    _near = d;
                    _item = i;
                }
            }
            return _item;
        }
    }, {
        key: "projectAxis",
        value: function projectAxis(poly, unitAxis) {
            var dot = unitAxis.dot(poly[0]);
            var d = new Pt_1.Pt(dot, dot);
            for (var n = 1, len = poly.length; n < len; n++) {
                dot = unitAxis.dot(poly[n]);
                d = new Pt_1.Pt(Math.min(dot, d[0]), Math.max(dot, d[1]));
            }
            return d;
        }
    }, {
        key: "_axisOverlap",
        value: function _axisOverlap(poly1, poly2, unitAxis) {
            var pa = Polygon.projectAxis(poly1, unitAxis);
            var pb = Polygon.projectAxis(poly2, unitAxis);
            return pa[0] < pb[0] ? pb[0] - pa[1] : pa[0] - pb[1];
        }
    }, {
        key: "hasIntersectPoint",
        value: function hasIntersectPoint(poly, pt) {
            var c = false;
            for (var i = 0, len = poly.length; i < len; i++) {
                var ln = Polygon.lineAt(poly, i);
                if (ln[0][1] > pt[1] != ln[1][1] > pt[1] && pt[0] < (ln[1][0] - ln[0][0]) * (pt[1] - ln[0][1]) / (ln[1][1] - ln[0][1]) + ln[0][0]) {
                    c = !c;
                }
            }
            return c;
        }
    }, {
        key: "hasIntersectCircle",
        value: function hasIntersectCircle(poly, circle) {
            var info = {
                which: -1,
                dist: 0,
                normal: null,
                edge: null,
                vertex: null
            };
            var c = circle[0];
            var r = circle[1][0];
            var minDist = Number.MAX_SAFE_INTEGER;
            for (var i = 0, len = poly.length; i < len; i++) {
                var edge = Polygon.lineAt(poly, i);
                var axis = new Pt_1.Pt(edge[0].y - edge[1].y, edge[1].x - edge[0].x).unit();
                var poly2 = new Pt_1.Group(c.$add(axis.$multiply(r)), c.$subtract(axis.$multiply(r)));
                var dist = Polygon._axisOverlap(poly, poly2, axis);
                if (dist > 0) {
                    return null;
                } else if (Math.abs(dist) < minDist) {
                    var check = Rectangle.withinBound(edge, Line.perpendicularFromPt(edge, c)) || Circle.intersectLine2D(circle, edge).length > 0;
                    if (check) {
                        info.edge = edge;
                        info.normal = axis;
                        minDist = Math.abs(dist);
                        info.which = i;
                    }
                }
            }
            if (!info.edge) return null;
            var dir = c.$subtract(Polygon.centroid(poly)).dot(info.normal);
            if (dir < 0) info.normal.multiply(-1);
            info.dist = minDist;
            info.vertex = c;
            return info;
        }
    }, {
        key: "hasIntersectPolygon",
        value: function hasIntersectPolygon(poly1, poly2) {
            var info = {
                which: -1,
                dist: 0,
                normal: new Pt_1.Pt(),
                edge: new Pt_1.Group(),
                vertex: new Pt_1.Pt()
            };
            var minDist = Number.MAX_SAFE_INTEGER;
            for (var i = 0, plen = poly1.length + poly2.length; i < plen; i++) {
                var edge = i < poly1.length ? Polygon.lineAt(poly1, i) : Polygon.lineAt(poly2, i - poly1.length);
                var axis = new Pt_1.Pt(edge[0].y - edge[1].y, edge[1].x - edge[0].x).unit();
                var dist = Polygon._axisOverlap(poly1, poly2, axis);
                if (dist > 0) {
                    return null;
                } else if (Math.abs(dist) < minDist) {
                    info.edge = edge;
                    info.normal = axis;
                    minDist = Math.abs(dist);
                    info.which = i < poly1.length ? 0 : 1;
                }
            }
            info.dist = minDist;
            var b1 = info.which === 0 ? poly2 : poly1;
            var b2 = info.which === 0 ? poly1 : poly2;
            var c1 = Polygon.centroid(b1);
            var c2 = Polygon.centroid(b2);
            var dir = c1.$subtract(c2).dot(info.normal);
            if (dir < 0) info.normal.multiply(-1);
            var smallest = Number.MAX_SAFE_INTEGER;
            for (var _i = 0, len = b1.length; _i < len; _i++) {
                var d = info.normal.dot(b1[_i].$subtract(c2));
                if (d < smallest) {
                    smallest = d;
                    info.vertex = b1[_i];
                }
            }
            return info;
        }
    }, {
        key: "intersectPolygon2D",
        value: function intersectPolygon2D(poly1, poly2) {
            var lp = Polygon.lines(poly1);
            var g = [];
            for (var i = 0, len = lp.length; i < len; i++) {
                var ins = Line.intersectPolygon2D(lp[i], poly2, false);
                if (ins) g.push(ins);
            }
            return Util_1.Util.flatten(g, true);
        }
    }, {
        key: "toRects",
        value: function toRects(polys) {
            var boxes = polys.map(function (g) {
                return Num_1.Geom.boundingBox(g);
            });
            var merged = Util_1.Util.flatten(boxes, false);
            boxes.unshift(Num_1.Geom.boundingBox(merged));
            return boxes;
        }
    }]);

    return Polygon;
}();

exports.Polygon = Polygon;

var Curve = function () {
    function Curve() {
        _classCallCheck(this, Curve);
    }

    _createClass(Curve, null, [{
        key: "getSteps",
        value: function getSteps(steps) {
            var ts = new Pt_1.Group();
            for (var i = 0; i <= steps; i++) {
                var t = i / steps;
                ts.push(new Pt_1.Pt(t * t * t, t * t, t, 1));
            }
            return ts;
        }
    }, {
        key: "controlPoints",
        value: function controlPoints(pts) {
            var index = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
            var copyStart = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            if (index > pts.length - 1) return new Pt_1.Group();
            var _index = function _index(i) {
                return i < pts.length - 1 ? i : pts.length - 1;
            };
            var p0 = pts[index];
            index = copyStart ? index : index + 1;
            return new Pt_1.Group(p0, pts[_index(index++)], pts[_index(index++)], pts[_index(index++)]);
        }
    }, {
        key: "_calcPt",
        value: function _calcPt(ctrls, params) {
            var x = ctrls.reduce(function (a, c, i) {
                return a + c.x * params[i];
            }, 0);
            var y = ctrls.reduce(function (a, c, i) {
                return a + c.y * params[i];
            }, 0);
            if (ctrls[0].length > 2) {
                var z = ctrls.reduce(function (a, c, i) {
                    return a + c.z * params[i];
                }, 0);
                return new Pt_1.Pt(x, y, z);
            }
            return new Pt_1.Pt(x, y);
        }
    }, {
        key: "catmullRom",
        value: function catmullRom(pts) {
            var steps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10;

            if (pts.length < 2) return new Pt_1.Group();
            var ps = new Pt_1.Group();
            var ts = Curve.getSteps(steps);
            var c = Curve.controlPoints(pts, 0, true);
            for (var i = 0; i <= steps; i++) {
                ps.push(Curve.catmullRomStep(ts[i], c));
            }
            var k = 0;
            while (k < pts.length - 2) {
                var cp = Curve.controlPoints(pts, k);
                if (cp.length > 0) {
                    for (var _i2 = 0; _i2 <= steps; _i2++) {
                        ps.push(Curve.catmullRomStep(ts[_i2], cp));
                    }
                    k++;
                }
            }
            return ps;
        }
    }, {
        key: "catmullRomStep",
        value: function catmullRomStep(step, ctrls) {
            var m = new Pt_1.Group(new Pt_1.Pt(-0.5, 1, -0.5, 0), new Pt_1.Pt(1.5, -2.5, 0, 1), new Pt_1.Pt(-1.5, 2, 0.5, 0), new Pt_1.Pt(0.5, -0.5, 0, 0));
            return Curve._calcPt(ctrls, LinearAlgebra_1.Mat.multiply([step], m, true)[0]);
        }
    }, {
        key: "cardinal",
        value: function cardinal(pts) {
            var steps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10;
            var tension = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0.5;

            if (pts.length < 2) return new Pt_1.Group();
            var ps = new Pt_1.Group();
            var ts = Curve.getSteps(steps);
            var c = Curve.controlPoints(pts, 0, true);
            for (var i = 0; i <= steps; i++) {
                ps.push(Curve.cardinalStep(ts[i], c, tension));
            }
            var k = 0;
            while (k < pts.length - 2) {
                var cp = Curve.controlPoints(pts, k);
                if (cp.length > 0) {
                    for (var _i3 = 0; _i3 <= steps; _i3++) {
                        ps.push(Curve.cardinalStep(ts[_i3], cp, tension));
                    }
                    k++;
                }
            }
            return ps;
        }
    }, {
        key: "cardinalStep",
        value: function cardinalStep(step, ctrls) {
            var tension = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0.5;

            var m = new Pt_1.Group(new Pt_1.Pt(-1, 2, -1, 0), new Pt_1.Pt(-1, 1, 0, 0), new Pt_1.Pt(1, -2, 1, 0), new Pt_1.Pt(1, -1, 0, 0));
            var h = LinearAlgebra_1.Mat.multiply([step], m, true)[0].multiply(tension);
            var h2 = 2 * step[0] - 3 * step[1] + 1;
            var h3 = -2 * step[0] + 3 * step[1];
            var pt = Curve._calcPt(ctrls, h);
            pt.x += h2 * ctrls[1].x + h3 * ctrls[2].x;
            pt.y += h2 * ctrls[1].y + h3 * ctrls[2].y;
            if (pt.length > 2) pt.z += h2 * ctrls[1].z + h3 * ctrls[2].z;
            return pt;
        }
    }, {
        key: "bezier",
        value: function bezier(pts) {
            var steps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10;

            if (pts.length < 4) return new Pt_1.Group();
            var ps = new Pt_1.Group();
            var ts = Curve.getSteps(steps);
            var k = 0;
            while (k < pts.length - 3) {
                var c = Curve.controlPoints(pts, k);
                if (c.length > 0) {
                    for (var i = 0; i <= steps; i++) {
                        ps.push(Curve.bezierStep(ts[i], c));
                    }
                    k += 3;
                }
            }
            return ps;
        }
    }, {
        key: "bezierStep",
        value: function bezierStep(step, ctrls) {
            var m = new Pt_1.Group(new Pt_1.Pt(-1, 3, -3, 1), new Pt_1.Pt(3, -6, 3, 0), new Pt_1.Pt(-3, 3, 0, 0), new Pt_1.Pt(1, 0, 0, 0));
            return Curve._calcPt(ctrls, LinearAlgebra_1.Mat.multiply([step], m, true)[0]);
        }
    }, {
        key: "bspline",
        value: function bspline(pts) {
            var steps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10;
            var tension = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

            if (pts.length < 2) return new Pt_1.Group();
            var ps = new Pt_1.Group();
            var ts = Curve.getSteps(steps);
            var k = 0;
            while (k < pts.length - 3) {
                var c = Curve.controlPoints(pts, k);
                if (c.length > 0) {
                    if (tension !== 1) {
                        for (var i = 0; i <= steps; i++) {
                            ps.push(Curve.bsplineTensionStep(ts[i], c, tension));
                        }
                    } else {
                        for (var _i4 = 0; _i4 <= steps; _i4++) {
                            ps.push(Curve.bsplineStep(ts[_i4], c));
                        }
                    }
                    k++;
                }
            }
            return ps;
        }
    }, {
        key: "bsplineStep",
        value: function bsplineStep(step, ctrls) {
            var m = new Pt_1.Group(new Pt_1.Pt(-0.16666666666666666, 0.5, -0.5, 0.16666666666666666), new Pt_1.Pt(0.5, -1, 0, 0.6666666666666666), new Pt_1.Pt(-0.5, 0.5, 0.5, 0.16666666666666666), new Pt_1.Pt(0.16666666666666666, 0, 0, 0));
            return Curve._calcPt(ctrls, LinearAlgebra_1.Mat.multiply([step], m, true)[0]);
        }
    }, {
        key: "bsplineTensionStep",
        value: function bsplineTensionStep(step, ctrls) {
            var tension = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

            var m = new Pt_1.Group(new Pt_1.Pt(-0.16666666666666666, 0.5, -0.5, 0.16666666666666666), new Pt_1.Pt(-1.5, 2, 0, -0.3333333333333333), new Pt_1.Pt(1.5, -2.5, 0.5, 0.16666666666666666), new Pt_1.Pt(0.16666666666666666, 0, 0, 0));
            var h = LinearAlgebra_1.Mat.multiply([step], m, true)[0].multiply(tension);
            var h2 = 2 * step[0] - 3 * step[1] + 1;
            var h3 = -2 * step[0] + 3 * step[1];
            var pt = Curve._calcPt(ctrls, h);
            pt.x += h2 * ctrls[1].x + h3 * ctrls[2].x;
            pt.y += h2 * ctrls[1].y + h3 * ctrls[2].y;
            if (pt.length > 2) pt.z += h2 * ctrls[1].z + h3 * ctrls[2].z;
            return pt;
        }
    }]);

    return Curve;
}();

exports.Curve = Curve;

/***/ }),

/***/ "./src/Physics.ts":
/*!************************!*\
  !*** ./src/Physics.ts ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*! Source code licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

Object.defineProperty(exports, "__esModule", { value: true });
var Pt_1 = __webpack_require__(/*! ./Pt */ "./src/Pt.ts");
var Op_1 = __webpack_require__(/*! ./Op */ "./src/Op.ts");

var World = function () {
    function World(bound) {
        var friction = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
        var gravity = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

        _classCallCheck(this, World);

        this._lastTime = null;
        this._gravity = new Pt_1.Pt();
        this._friction = 1;
        this._damping = 0.75;
        this._particles = [];
        this._bodies = [];
        this._pnames = [];
        this._bnames = [];
        this._bound = Pt_1.Bound.fromGroup(bound);
        this._friction = friction;
        this._gravity = typeof gravity === "number" ? new Pt_1.Pt(0, gravity) : new Pt_1.Pt(gravity);
        return this;
    }

    _createClass(World, [{
        key: "body",
        value: function body(id) {
            var idx = id;
            if (typeof id === "string" && id.length > 0) {
                idx = this._bnames.indexOf(id);
            }
            if (!(idx >= 0)) return undefined;
            return this._bodies[idx];
        }
    }, {
        key: "particle",
        value: function particle(id) {
            var idx = id;
            if (typeof id === "string" && id.length > 0) {
                idx = this._pnames.indexOf(id);
            }
            if (!(idx >= 0)) return undefined;
            return this._particles[idx];
        }
    }, {
        key: "bodyIndex",
        value: function bodyIndex(name) {
            return this._bnames.indexOf(name);
        }
    }, {
        key: "particleIndex",
        value: function particleIndex(name) {
            return this._pnames.indexOf(name);
        }
    }, {
        key: "update",
        value: function update(ms) {
            var dt = ms / 1000;
            this._updateParticles(dt);
            this._updateBodies(dt);
        }
    }, {
        key: "drawParticles",
        value: function drawParticles(fn) {
            this._drawParticles = fn;
        }
    }, {
        key: "drawBodies",
        value: function drawBodies(fn) {
            this._drawBodies = fn;
        }
    }, {
        key: "add",
        value: function add(p) {
            var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

            if (p instanceof Body) {
                this._bodies.push(p);
                this._bnames.push(name);
            } else {
                this._particles.push(p);
                this._pnames.push(name);
            }
            return this;
        }
    }, {
        key: "_index",
        value: function _index(fn, id) {
            var index = 0;
            if (typeof id === "string") {
                index = fn(id);
                if (index < 0) throw new Error("Cannot find index of " + id + ". You can use particleIndex() or bodyIndex() function to check existence by name.");
            } else {
                index = id;
            }
            return index;
        }
    }, {
        key: "removeBody",
        value: function removeBody(from) {
            var count = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

            var index = this._index(this.bodyIndex.bind(this), from);
            var param = index < 0 ? [index * -1 - 1, count] : [index, count];
            this._bodies.splice(param[0], param[1]);
            this._bnames.splice(param[0], param[1]);
            return this;
        }
    }, {
        key: "removeParticle",
        value: function removeParticle(from) {
            var count = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

            var index = this._index(this.particleIndex.bind(this), from);
            var param = index < 0 ? [index * -1 - 1, count] : [index, count];
            this._particles.splice(param[0], param[1]);
            this._pnames.splice(param[0], param[1]);
            return this;
        }
    }, {
        key: "integrate",
        value: function integrate(p, dt, prevDt) {
            p.addForce(this._gravity);
            p.verlet(dt, this._friction, prevDt);
            return p;
        }
    }, {
        key: "_updateParticles",
        value: function _updateParticles(dt) {
            for (var i = 0, len = this._particles.length; i < len; i++) {
                var p = this._particles[i];
                this.integrate(p, dt, this._lastTime);
                World.boundConstraint(p, this._bound, this._damping);
                for (var k = i + 1; k < len; k++) {
                    if (i !== k) {
                        var p2 = this._particles[k];
                        p.collide(p2, this._damping);
                    }
                }
                if (this._drawParticles) this._drawParticles(p, i);
            }
            this._lastTime = dt;
        }
    }, {
        key: "_updateBodies",
        value: function _updateBodies(dt) {
            for (var i = 0, len = this._bodies.length; i < len; i++) {
                var bds = this._bodies[i];
                if (bds) {
                    for (var k = 0, klen = bds.length; k < klen; k++) {
                        var bk = bds[k];
                        World.boundConstraint(bk, this._bound, this._damping);
                        this.integrate(bk, dt, this._lastTime);
                    }
                    for (var _k = i + 1; _k < len; _k++) {
                        bds.processBody(this._bodies[_k]);
                    }
                    for (var m = 0, mlen = this._particles.length; m < mlen; m++) {
                        bds.processParticle(this._particles[m]);
                    }
                    bds.processEdges();
                    if (this._drawBodies) this._drawBodies(bds, i);
                }
            }
        }
    }, {
        key: "bound",
        get: function get() {
            return this._bound;
        },
        set: function set(bound) {
            this._bound = bound;
        }
    }, {
        key: "gravity",
        get: function get() {
            return this._gravity;
        },
        set: function set(g) {
            this._gravity = g;
        }
    }, {
        key: "friction",
        get: function get() {
            return this._friction;
        },
        set: function set(f) {
            this._friction = f;
        }
    }, {
        key: "damping",
        get: function get() {
            return this._damping;
        },
        set: function set(f) {
            this._damping = f;
        }
    }, {
        key: "bodyCount",
        get: function get() {
            return this._bodies.length;
        }
    }, {
        key: "particleCount",
        get: function get() {
            return this._particles.length;
        }
    }], [{
        key: "edgeConstraint",
        value: function edgeConstraint(p1, p2, dist) {
            var stiff = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;
            var precise = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

            var m1 = 1 / (p1.mass || 1);
            var m2 = 1 / (p2.mass || 1);
            var mm = m1 + m2;
            var delta = p2.$subtract(p1);
            var distSq = dist * dist;
            var d = precise ? dist / delta.magnitude() - 1 : distSq / (delta.dot(delta) + distSq) - 0.5;
            var f = delta.$multiply(d * stiff);
            p1.subtract(f.$multiply(m1 / mm));
            p2.add(f.$multiply(m2 / mm));
            return p1;
        }
    }, {
        key: "boundConstraint",
        value: function boundConstraint(p, rect) {
            var damping = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0.75;

            var bound = rect.boundingBox();
            var np = p.$min(bound[1].subtract(p.radius)).$max(bound[0].add(p.radius));
            if (np[0] === bound[0][0] || np[0] === bound[1][0]) {
                var c = p.changed.$multiply(damping);
                p.previous = np.$subtract(new Pt_1.Pt(-c[0], c[1]));
            } else if (np[1] === bound[0][1] || np[1] === bound[1][1]) {
                var _c = p.changed.$multiply(damping);
                p.previous = np.$subtract(new Pt_1.Pt(_c[0], -_c[1]));
            }
            p.to(np);
        }
    }]);

    return World;
}();

exports.World = World;

var Particle = function (_Pt_1$Pt) {
    _inherits(Particle, _Pt_1$Pt);

    function Particle() {
        var _ref;

        _classCallCheck(this, Particle);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        var _this = _possibleConstructorReturn(this, (_ref = Particle.__proto__ || Object.getPrototypeOf(Particle)).call.apply(_ref, [this].concat(args)));

        _this._mass = 1;
        _this._radius = 0;
        _this._force = new Pt_1.Pt();
        _this._prev = new Pt_1.Pt();
        _this._lock = false;
        _this._prev = _this.clone();
        return _this;
    }

    _createClass(Particle, [{
        key: "size",
        value: function size(r) {
            this._mass = r;
            this._radius = r;
            return this;
        }
    }, {
        key: "addForce",
        value: function addForce() {
            var _force;

            (_force = this._force).add.apply(_force, arguments);
            return this._force;
        }
    }, {
        key: "verlet",
        value: function verlet(dt, friction, lastDt) {
            if (this._lock) {
                this.to(this._lockPt);
            } else {
                var lt = lastDt ? lastDt : dt;
                var a = this._force.multiply(dt * (dt + lt) / 2);
                var v = this.changed.multiply(friction * dt / lt).add(a);
                this._prev = this.clone();
                this.add(v);
                this._force = new Pt_1.Pt();
            }
            return this;
        }
    }, {
        key: "hit",
        value: function hit() {
            for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                args[_key2] = arguments[_key2];
            }

            this._prev.subtract(new (Function.prototype.bind.apply(Pt_1.Pt, [null].concat(args)))().$divide(Math.sqrt(this._mass)));
            return this;
        }
    }, {
        key: "collide",
        value: function collide(p2) {
            var damp = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

            var p1 = this;
            var dp = p1.$subtract(p2);
            var distSq = dp.magnitudeSq();
            var dr = p1.radius + p2.radius;
            if (distSq < dr * dr) {
                var c1 = p1.changed;
                var c2 = p2.changed;
                var dist = Math.sqrt(distSq);
                var d = dp.$multiply((dist - dr) / dist / 2);
                var np1 = p1.$subtract(d);
                var np2 = p2.$add(d);
                p1.to(np1);
                p2.to(np2);
                var f1 = damp * dp.dot(c1) / distSq;
                var f2 = damp * dp.dot(c2) / distSq;
                var dm1 = p1.mass / (p1.mass + p2.mass);
                var dm2 = p2.mass / (p1.mass + p2.mass);
                c1.add(new Pt_1.Pt(f2 * dp[0] - f1 * dp[0], f2 * dp[1] - f1 * dp[1]).$multiply(dm2));
                c2.add(new Pt_1.Pt(f1 * dp[0] - f2 * dp[0], f1 * dp[1] - f2 * dp[1]).$multiply(dm1));
                p1.previous = p1.$subtract(c1);
                p2.previous = p2.$subtract(c2);
            }
        }
    }, {
        key: "toString",
        value: function toString() {
            return "Particle: " + this[0] + " " + this[1] + " | previous " + this._prev[0] + " " + this._prev[1] + " | mass " + this._mass;
        }
    }, {
        key: "mass",
        get: function get() {
            return this._mass;
        },
        set: function set(m) {
            this._mass = m;
        }
    }, {
        key: "radius",
        get: function get() {
            return this._radius;
        },
        set: function set(f) {
            this._radius = f;
        }
    }, {
        key: "previous",
        get: function get() {
            return this._prev;
        },
        set: function set(p) {
            this._prev = p;
        }
    }, {
        key: "force",
        get: function get() {
            return this._force;
        },
        set: function set(g) {
            this._force = g;
        }
    }, {
        key: "body",
        get: function get() {
            return this._body;
        },
        set: function set(b) {
            this._body = b;
        }
    }, {
        key: "lock",
        get: function get() {
            return this._lock;
        },
        set: function set(b) {
            this._lock = b;
            this._lockPt = new Pt_1.Pt(this);
        }
    }, {
        key: "changed",
        get: function get() {
            return this.$subtract(this._prev);
        }
    }, {
        key: "position",
        set: function set(p) {
            this.previous.to(this);
            if (this._lock) this._lockPt = p;
            this.to(p);
        }
    }]);

    return Particle;
}(Pt_1.Pt);

exports.Particle = Particle;

var Body = function (_Pt_1$Group) {
    _inherits(Body, _Pt_1$Group);

    function Body() {
        _classCallCheck(this, Body);

        var _this2 = _possibleConstructorReturn(this, (Body.__proto__ || Object.getPrototypeOf(Body)).call(this));

        _this2._cs = [];
        _this2._stiff = 1;
        _this2._locks = {};
        _this2._mass = 1;
        return _this2;
    }

    _createClass(Body, [{
        key: "init",
        value: function init(list) {
            var stiff = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

            var c = new Pt_1.Pt();
            for (var i = 0, len = list.length; i < len; i++) {
                var p = new Particle(list[i]);
                p.body = this;
                c.add(list[i]);
                this.push(p);
            }
            this._stiff = stiff;
            return this;
        }
    }, {
        key: "autoMass",
        value: function autoMass() {
            this.mass = Math.sqrt(Op_1.Polygon.area(this)) / 10;
            return this;
        }
    }, {
        key: "link",
        value: function link(index1, index2, stiff) {
            if (index1 < 0 || index1 >= this.length) throw new Error("index1 is not in the Group's indices");
            if (index2 < 0 || index2 >= this.length) throw new Error("index1 is not in the Group's indices");
            var d = this[index1].$subtract(this[index2]).magnitude();
            this._cs.push([index1, index2, d, stiff || this._stiff]);
            return this;
        }
    }, {
        key: "linkAll",
        value: function linkAll(stiff) {
            var half = this.length / 2;
            for (var i = 0, len = this.length; i < len; i++) {
                var n = i >= len - 1 ? 0 : i + 1;
                this.link(i, n, stiff);
                if (len > 4) {
                    var nd = Math.floor(half / 2) + 1;
                    var n2 = i >= len - nd ? i % len : i + nd;
                    this.link(i, n2, stiff);
                }
                if (i <= half - 1) {
                    this.link(i, Math.min(this.length - 1, i + Math.floor(half)));
                }
            }
        }
    }, {
        key: "linksToLines",
        value: function linksToLines() {
            var gs = [];
            for (var i = 0, len = this._cs.length; i < len; i++) {
                var ln = this._cs[i];
                gs.push(new Pt_1.Group(this[ln[0]], this[ln[1]]));
            }
            return gs;
        }
    }, {
        key: "processEdges",
        value: function processEdges() {
            for (var i = 0, len = this._cs.length; i < len; i++) {
                var _cs$i = _slicedToArray(this._cs[i], 4),
                    m = _cs$i[0],
                    n = _cs$i[1],
                    d = _cs$i[2],
                    s = _cs$i[3];

                World.edgeConstraint(this[m], this[n], d, s);
            }
        }
    }, {
        key: "processBody",
        value: function processBody(b) {
            var b1 = this;
            var b2 = b;
            var hit = Op_1.Polygon.hasIntersectPolygon(b1, b2);
            if (hit) {
                var cv = hit.normal.$multiply(hit.dist);
                var t = void 0;
                var eg = hit.edge;
                if (Math.abs(eg[0][0] - eg[1][0]) > Math.abs(eg[0][1] - eg[1][1])) {
                    t = (hit.vertex[0] - cv[0] - eg[0][0]) / (eg[1][0] - eg[0][0]);
                } else {
                    t = (hit.vertex[1] - cv[1] - eg[0][1]) / (eg[1][1] - eg[0][1]);
                }
                var lambda = 1 / (t * t + (1 - t) * (1 - t));
                var m0 = hit.vertex.body.mass || 1;
                var m1 = hit.edge[0].body.mass || 1;
                var mr0 = m0 / (m0 + m1);
                var mr1 = m1 / (m0 + m1);
                eg[0].subtract(cv.$multiply(mr0 * (1 - t) * lambda / 2));
                eg[1].subtract(cv.$multiply(mr0 * t * lambda / 2));
                hit.vertex.add(cv.$multiply(mr1));
            }
        }
    }, {
        key: "processParticle",
        value: function processParticle(b) {
            var b1 = this;
            var b2 = b;
            var hit = Op_1.Polygon.hasIntersectCircle(b1, Op_1.Circle.fromCenter(b, b.radius));
            if (hit) {
                var cv = hit.normal.$multiply(hit.dist);
                var t = void 0;
                var eg = hit.edge;
                if (Math.abs(eg[0][0] - eg[1][0]) > Math.abs(eg[0][1] - eg[1][1])) {
                    t = (hit.vertex[0] - cv[0] - eg[0][0]) / (eg[1][0] - eg[0][0]);
                } else {
                    t = (hit.vertex[1] - cv[1] - eg[0][1]) / (eg[1][1] - eg[0][1]);
                }
                var lambda = 1 / (t * t + (1 - t) * (1 - t));
                var m0 = hit.vertex.mass || b2.mass || 1;
                var m1 = hit.edge[0].body.mass || 1;
                var mr0 = m0 / (m0 + m1);
                var mr1 = m1 / (m0 + m1);
                eg[0].subtract(cv.$multiply(mr0 * (1 - t) * lambda / 2));
                eg[1].subtract(cv.$multiply(mr0 * t * lambda / 2));
                var c1 = b.changed.add(cv.$multiply(mr1));
                b.previous = b.$subtract(c1);
            }
        }
    }, {
        key: "mass",
        get: function get() {
            return this._mass;
        },
        set: function set(m) {
            this._mass = m;
            for (var i = 0, len = this.length; i < len; i++) {
                this[i].mass = this._mass;
            }
        }
    }], [{
        key: "fromGroup",
        value: function fromGroup(list) {
            var stiff = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
            var autoLink = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
            var autoMass = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

            var b = new Body().init(list);
            if (autoLink) b.linkAll(stiff);
            if (autoMass) b.autoMass();
            return b;
        }
    }]);

    return Body;
}(Pt_1.Group);

exports.Body = Body;

/***/ }),

/***/ "./src/Play.ts":
/*!*********************!*\
  !*** ./src/Play.ts ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var __awaiter = undefined && undefined.__awaiter || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : new P(function (resolve) {
                resolve(result.value);
            }).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
var Pt_1 = __webpack_require__(/*! ./Pt */ "./src/Pt.ts");
var Num_1 = __webpack_require__(/*! ./Num */ "./src/Num.ts");

var Tempo = function () {
    function Tempo(bpm) {
        _classCallCheck(this, Tempo);

        this._listeners = {};
        this._listenerInc = 0;
        this.bpm = bpm;
    }

    _createClass(Tempo, [{
        key: "_createID",
        value: function _createID(listener) {
            var id = '';
            if (typeof listener === 'function') {
                id = '_b' + this._listenerInc++;
            } else {
                id = listener.name || '_b' + this._listenerInc++;
            }
            return id;
        }
    }, {
        key: "every",
        value: function every(beats) {
            var self = this;
            var p = Array.isArray(beats) ? beats[0] : beats;
            return {
                start: function start(fn) {
                    var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
                    var name = arguments[2];

                    var id = name || self._createID(fn);
                    self._listeners[id] = { name: id, beats: beats, period: p, index: 0, offset: offset, duration: -1, continuous: false, fn: fn };
                    return this;
                },
                progress: function progress(fn) {
                    var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
                    var name = arguments[2];

                    var id = name || self._createID(fn);
                    self._listeners[id] = { name: id, beats: beats, period: p, index: 0, offset: offset, duration: -1, continuous: true, fn: fn };
                    return this;
                }
            };
        }
    }, {
        key: "track",
        value: function track(time) {
            for (var k in this._listeners) {
                if (this._listeners.hasOwnProperty(k)) {
                    var li = this._listeners[k];
                    var _t = li.offset ? time + li.offset : time;
                    var ms = li.period * this._ms;
                    var isStart = false;
                    if (_t > li.duration + ms) {
                        li.duration = _t - _t % this._ms;
                        if (Array.isArray(li.beats)) {
                            li.index = (li.index + 1) % li.beats.length;
                            li.period = li.beats[li.index];
                        }
                        isStart = true;
                    }
                    var count = Math.max(0, Math.ceil(Math.floor(li.duration / this._ms) / li.period));
                    var params = li.continuous ? [count, Num_1.Num.clamp((_t - li.duration) / ms, 0, 1), _t, isStart] : [count];
                    if (li.continuous || isStart) {
                        var done = li.fn.apply(li, params);
                        if (done) delete this._listeners[li.name];
                    }
                }
            }
        }
    }, {
        key: "stop",
        value: function stop(name) {
            if (this._listeners[name]) delete this._listeners[name];
        }
    }, {
        key: "animate",
        value: function animate(time, ftime) {
            this.track(time);
        }
    }, {
        key: "resize",
        value: function resize(bound, evt) {
            return;
        }
    }, {
        key: "action",
        value: function action(type, px, py, evt) {
            return;
        }
    }, {
        key: "bpm",
        get: function get() {
            return this._bpm;
        },
        set: function set(n) {
            this._bpm = n;
            this._ms = 60000 / this._bpm;
        }
    }, {
        key: "ms",
        get: function get() {
            return this._ms;
        },
        set: function set(n) {
            this._bpm = Math.floor(60000 / n);
            this._ms = 60000 / this._bpm;
        }
    }], [{
        key: "fromBeat",
        value: function fromBeat(ms) {
            return new Tempo(60000 / ms);
        }
    }]);

    return Tempo;
}();

exports.Tempo = Tempo;

var Sound = function () {
    function Sound(type) {
        _classCallCheck(this, Sound);

        this._playing = false;
        this._type = type;
        var _ctx = window.AudioContext || window.webkitAudioContext || false;
        if (!_ctx) throw new Error("Your browser doesn't support Web Audio. (No AudioContext)");
        this._ctx = _ctx ? new _ctx() : undefined;
    }

    _createClass(Sound, [{
        key: "createBuffer",
        value: function createBuffer(buf) {
            var _this = this;

            this._node = this._ctx.createBufferSource();
            if (buf !== undefined) this._buffer = buf;
            this._node.buffer = this._buffer;
            this._node.onended = function () {
                _this._playing = false;
            };
            return this;
        }
    }, {
        key: "_gen",
        value: function _gen(type, val) {
            this._node = this._ctx.createOscillator();
            var osc = this._node;
            osc.type = type;
            if (type === 'custom') {
                osc.setPeriodicWave(val);
            } else {
                osc.frequency.value = val;
            }
            return this;
        }
    }, {
        key: "connect",
        value: function connect(node) {
            this._node.connect(node);
            return this;
        }
    }, {
        key: "analyze",
        value: function analyze() {
            var size = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 256;
            var minDb = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : -100;
            var maxDb = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : -30;
            var smooth = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0.8;

            var a = this._ctx.createAnalyser();
            a.fftSize = size * 2;
            a.minDecibels = minDb;
            a.maxDecibels = maxDb;
            a.smoothingTimeConstant = smooth;
            this.analyzer = {
                node: a,
                size: a.frequencyBinCount,
                data: new Uint8Array(a.frequencyBinCount)
            };
            this._node.connect(this.analyzer.node);
            return this;
        }
    }, {
        key: "_domain",
        value: function _domain(time) {
            if (this.analyzer) {
                if (time) {
                    this.analyzer.node.getByteTimeDomainData(this.analyzer.data);
                } else {
                    this.analyzer.node.getByteFrequencyData(this.analyzer.data);
                }
                return this.analyzer.data;
            }
            return new Uint8Array(0);
        }
    }, {
        key: "_domainTo",
        value: function _domainTo(time, size) {
            var position = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [0, 0];
            var trim = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [0, 0];

            var data = time ? this.timeDomain() : this.freqDomain();
            var g = new Pt_1.Group();
            for (var i = trim[0], len = data.length - trim[1]; i < len; i++) {
                g.push(new Pt_1.Pt(position[0] + size[0] * i / len, position[1] + size[1] * data[i] / 255));
            }
            return g;
        }
    }, {
        key: "timeDomain",
        value: function timeDomain() {
            return this._domain(true);
        }
    }, {
        key: "timeDomainTo",
        value: function timeDomainTo(size) {
            var position = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [0, 0];
            var trim = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [0, 0];

            return this._domainTo(true, size, position, trim);
        }
    }, {
        key: "freqDomain",
        value: function freqDomain() {
            return this._domain(false);
        }
    }, {
        key: "freqDomainTo",
        value: function freqDomainTo(size) {
            var position = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [0, 0];
            var trim = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [0, 0];

            return this._domainTo(false, size, position, trim);
        }
    }, {
        key: "reset",
        value: function reset() {
            this.stop();
            this._node.disconnect();
            return this;
        }
    }, {
        key: "start",
        value: function start() {
            var timeAt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

            if (this._ctx.state === 'suspended') this._ctx.resume();
            if (this._type === "file") {
                if (!!this._buffer) {
                    this._node.start(timeAt);
                    this._timestamp = this._ctx.currentTime + timeAt;
                } else {
                    this._source.play();
                    if (timeAt > 0) this._source.currentTime = timeAt;
                }
            } else if (this._type === "gen") {
                this._gen(this._node.type, this._node.frequency.value);
                this._node.start();
                if (this.analyzer) this._node.connect(this.analyzer.node);
            }
            this._node.connect(this._ctx.destination);
            this._playing = true;
            return this;
        }
    }, {
        key: "stop",
        value: function stop() {
            if (this._playing) this._node.disconnect(this._ctx.destination);
            if (this._type === "file") {
                if (!!this._buffer) {
                    if (this.progress < 1) this._node.stop();
                } else {
                    this._source.pause();
                }
            } else if (this._type === "gen") {
                this._node.stop();
            } else if (this._type === "input") {
                this._stream.getAudioTracks().forEach(function (track) {
                    return track.stop();
                });
            }
            this._playing = false;
            return this;
        }
    }, {
        key: "toggle",
        value: function toggle() {
            if (this._playing) {
                this.stop();
            } else {
                this.start();
            }
            return this;
        }
    }, {
        key: "ctx",
        get: function get() {
            return this._ctx;
        }
    }, {
        key: "node",
        get: function get() {
            return this._node;
        }
    }, {
        key: "stream",
        get: function get() {
            return this._stream;
        }
    }, {
        key: "source",
        get: function get() {
            return this._source;
        }
    }, {
        key: "buffer",
        get: function get() {
            return this._buffer;
        },
        set: function set(b) {
            this._buffer = b;
        }
    }, {
        key: "type",
        get: function get() {
            return this._type;
        }
    }, {
        key: "playing",
        get: function get() {
            return this._playing;
        }
    }, {
        key: "progress",
        get: function get() {
            var dur = 0;
            var curr = 0;
            if (!!this._buffer) {
                dur = this._buffer.duration;
                curr = this._timestamp ? this._ctx.currentTime - this._timestamp : 0;
            } else {
                dur = this._source.duration;
                curr = this._source.currentTime;
            }
            return curr / dur;
        }
    }, {
        key: "playable",
        get: function get() {
            return this._type === "input" ? this._node !== undefined : !!this._buffer || this._source.readyState === 4;
        }
    }, {
        key: "binSize",
        get: function get() {
            return this.analyzer.size;
        }
    }, {
        key: "sampleRate",
        get: function get() {
            return this._ctx.sampleRate;
        }
    }, {
        key: "frequency",
        get: function get() {
            return this._type === "gen" ? this._node.frequency.value : 0;
        },
        set: function set(f) {
            if (this._type === "gen") this._node.frequency.value = f;
        }
    }], [{
        key: "from",
        value: function from(node, ctx) {
            var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "gen";
            var stream = arguments[3];

            var s = new Sound(type);
            s._node = node;
            s._ctx = ctx;
            if (stream) s._stream = stream;
            return s;
        }
    }, {
        key: "load",
        value: function load(source) {
            var crossOrigin = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "anonymous";

            return new Promise(function (resolve, reject) {
                var s = new Sound("file");
                s._source = typeof source === 'string' ? new Audio(source) : source;
                s._source.autoplay = false;
                s._source.crossOrigin = crossOrigin;
                s._source.addEventListener("ended", function () {
                    s._playing = false;
                });
                s._source.addEventListener('error', function () {
                    reject("Error loading sound");
                });
                s._source.addEventListener('canplaythrough', function () {
                    s._node = s._ctx.createMediaElementSource(s._source);
                    resolve(s);
                });
            });
        }
    }, {
        key: "loadAsBuffer",
        value: function loadAsBuffer(url) {
            return new Promise(function (resolve, reject) {
                var request = new XMLHttpRequest();
                request.open('GET', url, true);
                request.responseType = 'arraybuffer';
                var s = new Sound("file");
                request.onload = function () {
                    s._ctx.decodeAudioData(request.response, function (buffer) {
                        s.createBuffer(buffer);
                        resolve(s);
                    }, function (err) {
                        return reject("Error decoding audio");
                    });
                };
                request.send();
            });
        }
    }, {
        key: "generate",
        value: function generate(type, val) {
            var s = new Sound("gen");
            return s._gen(type, val);
        }
    }, {
        key: "input",
        value: function input(constraint) {
            return __awaiter(this, void 0, void 0, regeneratorRuntime.mark(function _callee() {
                var s, c;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _context.prev = 0;
                                s = new Sound("input");

                                if (s) {
                                    _context.next = 4;
                                    break;
                                }

                                return _context.abrupt("return", undefined);

                            case 4:
                                c = constraint ? constraint : { audio: true, video: false };
                                _context.next = 7;
                                return navigator.mediaDevices.getUserMedia(c);

                            case 7:
                                s._stream = _context.sent;

                                s._node = s._ctx.createMediaStreamSource(s._stream);
                                return _context.abrupt("return", s);

                            case 12:
                                _context.prev = 12;
                                _context.t0 = _context["catch"](0);

                                console.error("Cannot get audio from input device.");
                                return _context.abrupt("return", Promise.resolve(null));

                            case 16:
                            case "end":
                                return _context.stop();
                        }
                    }
                }, _callee, this, [[0, 12]]);
            }));
        }
    }]);

    return Sound;
}();

exports.Sound = Sound;

/***/ }),

/***/ "./src/Pt.ts":
/*!*******************!*\
  !*** ./src/Pt.ts ***!
  \*******************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*! Source code licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _extendableBuiltin3(cls) {
    function ExtendableBuiltin() {
        var instance = Reflect.construct(cls, Array.from(arguments));
        Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
        return instance;
    }

    ExtendableBuiltin.prototype = Object.create(cls.prototype, {
        constructor: {
            value: cls,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });

    if (Object.setPrototypeOf) {
        Object.setPrototypeOf(ExtendableBuiltin, cls);
    } else {
        ExtendableBuiltin.__proto__ = cls;
    }

    return ExtendableBuiltin;
}

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _extendableBuiltin(cls) {
    function ExtendableBuiltin() {
        var instance = Reflect.construct(cls, Array.from(arguments));
        Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
        return instance;
    }

    ExtendableBuiltin.prototype = Object.create(cls.prototype, {
        constructor: {
            value: cls,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });

    if (Object.setPrototypeOf) {
        Object.setPrototypeOf(ExtendableBuiltin, cls);
    } else {
        ExtendableBuiltin.__proto__ = cls;
    }

    return ExtendableBuiltin;
}

Object.defineProperty(exports, "__esModule", { value: true });
var Util_1 = __webpack_require__(/*! ./Util */ "./src/Util.ts");
var Num_1 = __webpack_require__(/*! ./Num */ "./src/Num.ts");
var LinearAlgebra_1 = __webpack_require__(/*! ./LinearAlgebra */ "./src/LinearAlgebra.ts");

var Pt = function (_extendableBuiltin2) {
    _inherits(Pt, _extendableBuiltin2);

    function Pt() {
        _classCallCheck(this, Pt);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        if (args.length === 1 && typeof args[0] == "number") {
            var _this = _possibleConstructorReturn(this, (Pt.__proto__ || Object.getPrototypeOf(Pt)).call(this, args[0]));
        } else {
            var _this = _possibleConstructorReturn(this, (Pt.__proto__ || Object.getPrototypeOf(Pt)).call(this, args.length > 0 ? Util_1.Util.getArgs(args) : [0, 0]));
        }
        return _possibleConstructorReturn(_this);
    }

    _createClass(Pt, [{
        key: "clone",
        value: function clone() {
            return new Pt(this);
        }
    }, {
        key: "equals",
        value: function equals(p) {
            var threshold = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0.000001;

            for (var i = 0, len = this.length; i < len; i++) {
                if (Math.abs(this[i] - p[i]) > threshold) return false;
            }
            return true;
        }
    }, {
        key: "to",
        value: function to() {
            for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                args[_key2] = arguments[_key2];
            }

            var p = Util_1.Util.getArgs(args);
            for (var i = 0, len = Math.min(this.length, p.length); i < len; i++) {
                this[i] = p[i];
            }
            return this;
        }
    }, {
        key: "$to",
        value: function $to() {
            var _clone;

            return (_clone = this.clone()).to.apply(_clone, arguments);
        }
    }, {
        key: "toAngle",
        value: function toAngle(radian, magnitude) {
            var anchorFromPt = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            var m = magnitude != undefined ? magnitude : this.magnitude();
            var change = [Math.cos(radian) * m, Math.sin(radian) * m];
            return anchorFromPt ? this.add(change) : this.to(change);
        }
    }, {
        key: "op",
        value: function op(fn) {
            var self = this;
            return function () {
                for (var _len3 = arguments.length, params = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                    params[_key3] = arguments[_key3];
                }

                return fn.apply(undefined, [self].concat(params));
            };
        }
    }, {
        key: "ops",
        value: function ops(fns) {
            var _ops = [];
            for (var i = 0, len = fns.length; i < len; i++) {
                _ops.push(this.op(fns[i]));
            }
            return _ops;
        }
    }, {
        key: "$take",
        value: function $take(axis) {
            var p = [];
            for (var i = 0, len = axis.length; i < len; i++) {
                p.push(this[axis[i]] || 0);
            }
            return new Pt(p);
        }
    }, {
        key: "$concat",
        value: function $concat() {
            for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
                args[_key4] = arguments[_key4];
            }

            return new Pt(this.toArray().concat(Util_1.Util.getArgs(args)));
        }
    }, {
        key: "add",
        value: function add() {
            for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
                args[_key5] = arguments[_key5];
            }

            args.length === 1 && typeof args[0] == "number" ? LinearAlgebra_1.Vec.add(this, args[0]) : LinearAlgebra_1.Vec.add(this, Util_1.Util.getArgs(args));
            return this;
        }
    }, {
        key: "$add",
        value: function $add() {
            var _clone2;

            return (_clone2 = this.clone()).add.apply(_clone2, arguments);
        }
    }, {
        key: "subtract",
        value: function subtract() {
            for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
                args[_key6] = arguments[_key6];
            }

            args.length === 1 && typeof args[0] == "number" ? LinearAlgebra_1.Vec.subtract(this, args[0]) : LinearAlgebra_1.Vec.subtract(this, Util_1.Util.getArgs(args));
            return this;
        }
    }, {
        key: "$subtract",
        value: function $subtract() {
            var _clone3;

            return (_clone3 = this.clone()).subtract.apply(_clone3, arguments);
        }
    }, {
        key: "multiply",
        value: function multiply() {
            for (var _len7 = arguments.length, args = Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
                args[_key7] = arguments[_key7];
            }

            args.length === 1 && typeof args[0] == "number" ? LinearAlgebra_1.Vec.multiply(this, args[0]) : LinearAlgebra_1.Vec.multiply(this, Util_1.Util.getArgs(args));
            return this;
        }
    }, {
        key: "$multiply",
        value: function $multiply() {
            var _clone4;

            return (_clone4 = this.clone()).multiply.apply(_clone4, arguments);
        }
    }, {
        key: "divide",
        value: function divide() {
            for (var _len8 = arguments.length, args = Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
                args[_key8] = arguments[_key8];
            }

            args.length === 1 && typeof args[0] == "number" ? LinearAlgebra_1.Vec.divide(this, args[0]) : LinearAlgebra_1.Vec.divide(this, Util_1.Util.getArgs(args));
            return this;
        }
    }, {
        key: "$divide",
        value: function $divide() {
            var _clone5;

            return (_clone5 = this.clone()).divide.apply(_clone5, arguments);
        }
    }, {
        key: "magnitudeSq",
        value: function magnitudeSq() {
            return LinearAlgebra_1.Vec.dot(this, this);
        }
    }, {
        key: "magnitude",
        value: function magnitude() {
            return LinearAlgebra_1.Vec.magnitude(this);
        }
    }, {
        key: "unit",
        value: function unit() {
            var magnitude = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;

            LinearAlgebra_1.Vec.unit(this, magnitude);
            return this;
        }
    }, {
        key: "$unit",
        value: function $unit() {
            var magnitude = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
            return this.clone().unit(magnitude);
        }
    }, {
        key: "dot",
        value: function dot() {
            for (var _len9 = arguments.length, args = Array(_len9), _key9 = 0; _key9 < _len9; _key9++) {
                args[_key9] = arguments[_key9];
            }

            return LinearAlgebra_1.Vec.dot(this, Util_1.Util.getArgs(args));
        }
    }, {
        key: "$cross2D",
        value: function $cross2D() {
            for (var _len10 = arguments.length, args = Array(_len10), _key10 = 0; _key10 < _len10; _key10++) {
                args[_key10] = arguments[_key10];
            }

            return LinearAlgebra_1.Vec.cross2D(this, Util_1.Util.getArgs(args));
        }
    }, {
        key: "$cross",
        value: function $cross() {
            for (var _len11 = arguments.length, args = Array(_len11), _key11 = 0; _key11 < _len11; _key11++) {
                args[_key11] = arguments[_key11];
            }

            return LinearAlgebra_1.Vec.cross(this, Util_1.Util.getArgs(args));
        }
    }, {
        key: "$project",
        value: function $project() {
            return this.$multiply(this.dot.apply(this, arguments) / this.magnitudeSq());
        }
    }, {
        key: "projectScalar",
        value: function projectScalar() {
            return this.dot.apply(this, arguments) / this.magnitude();
        }
    }, {
        key: "abs",
        value: function abs() {
            LinearAlgebra_1.Vec.abs(this);
            return this;
        }
    }, {
        key: "$abs",
        value: function $abs() {
            return this.clone().abs();
        }
    }, {
        key: "floor",
        value: function floor() {
            LinearAlgebra_1.Vec.floor(this);
            return this;
        }
    }, {
        key: "$floor",
        value: function $floor() {
            return this.clone().floor();
        }
    }, {
        key: "ceil",
        value: function ceil() {
            LinearAlgebra_1.Vec.ceil(this);
            return this;
        }
    }, {
        key: "$ceil",
        value: function $ceil() {
            return this.clone().ceil();
        }
    }, {
        key: "round",
        value: function round() {
            LinearAlgebra_1.Vec.round(this);
            return this;
        }
    }, {
        key: "$round",
        value: function $round() {
            return this.clone().round();
        }
    }, {
        key: "minValue",
        value: function minValue() {
            return LinearAlgebra_1.Vec.min(this);
        }
    }, {
        key: "maxValue",
        value: function maxValue() {
            return LinearAlgebra_1.Vec.max(this);
        }
    }, {
        key: "$min",
        value: function $min() {
            for (var _len12 = arguments.length, args = Array(_len12), _key12 = 0; _key12 < _len12; _key12++) {
                args[_key12] = arguments[_key12];
            }

            var p = Util_1.Util.getArgs(args);
            var m = this.clone();
            for (var i = 0, len = Math.min(this.length, p.length); i < len; i++) {
                m[i] = Math.min(this[i], p[i]);
            }
            return m;
        }
    }, {
        key: "$max",
        value: function $max() {
            for (var _len13 = arguments.length, args = Array(_len13), _key13 = 0; _key13 < _len13; _key13++) {
                args[_key13] = arguments[_key13];
            }

            var p = Util_1.Util.getArgs(args);
            var m = this.clone();
            for (var i = 0, len = Math.min(this.length, p.length); i < len; i++) {
                m[i] = Math.max(this[i], p[i]);
            }
            return m;
        }
    }, {
        key: "angle",
        value: function angle() {
            var axis = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Util_1.Const.xy;

            return Math.atan2(this[axis[1]], this[axis[0]]);
        }
    }, {
        key: "angleBetween",
        value: function angleBetween(p) {
            var axis = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Util_1.Const.xy;

            return Num_1.Geom.boundRadian(this.angle(axis)) - Num_1.Geom.boundRadian(p.angle(axis));
        }
    }, {
        key: "scale",
        value: function scale(_scale, anchor) {
            Num_1.Geom.scale(this, _scale, anchor || Pt.make(this.length, 0));
            return this;
        }
    }, {
        key: "rotate2D",
        value: function rotate2D(angle, anchor, axis) {
            Num_1.Geom.rotate2D(this, angle, anchor || Pt.make(this.length, 0), axis);
            return this;
        }
    }, {
        key: "shear2D",
        value: function shear2D(scale, anchor, axis) {
            Num_1.Geom.shear2D(this, scale, anchor || Pt.make(this.length, 0), axis);
            return this;
        }
    }, {
        key: "reflect2D",
        value: function reflect2D(line, axis) {
            Num_1.Geom.reflect2D(this, line, axis);
            return this;
        }
    }, {
        key: "toString",
        value: function toString() {
            return "Pt(" + this.join(", ") + ")";
        }
    }, {
        key: "toArray",
        value: function toArray() {
            return [].slice.call(this);
        }
    }, {
        key: "toGroup",
        value: function toGroup() {
            return new Group(Pt.make(this.length), this.clone());
        }
    }, {
        key: "toBound",
        value: function toBound() {
            return new Bound(Pt.make(this.length), this.clone());
        }
    }, {
        key: "id",
        get: function get() {
            return this._id;
        },
        set: function set(s) {
            this._id = s;
        }
    }, {
        key: "x",
        get: function get() {
            return this[0];
        },
        set: function set(n) {
            this[0] = n;
        }
    }, {
        key: "y",
        get: function get() {
            return this[1];
        },
        set: function set(n) {
            this[1] = n;
        }
    }, {
        key: "z",
        get: function get() {
            return this[2];
        },
        set: function set(n) {
            this[2] = n;
        }
    }, {
        key: "w",
        get: function get() {
            return this[3];
        },
        set: function set(n) {
            this[3] = n;
        }
    }], [{
        key: "make",
        value: function make(dimensions) {
            var defaultValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
            var randomize = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            var p = new Float32Array(dimensions);
            if (defaultValue) p.fill(defaultValue);
            if (randomize) {
                for (var i = 0, len = p.length; i < len; i++) {
                    p[i] = p[i] * Math.random();
                }
            }
            return new Pt(p);
        }
    }]);

    return Pt;
}(_extendableBuiltin(Float32Array));

exports.Pt = Pt;

var Group = function (_extendableBuiltin4) {
    _inherits(Group, _extendableBuiltin4);

    function Group() {
        var _ref;

        _classCallCheck(this, Group);

        for (var _len14 = arguments.length, args = Array(_len14), _key14 = 0; _key14 < _len14; _key14++) {
            args[_key14] = arguments[_key14];
        }

        return _possibleConstructorReturn(this, (_ref = Group.__proto__ || Object.getPrototypeOf(Group)).call.apply(_ref, [this].concat(args)));
    }

    _createClass(Group, [{
        key: "clone",
        value: function clone() {
            var group = new Group();
            for (var i = 0, len = this.length; i < len; i++) {
                group.push(this[i].clone());
            }
            return group;
        }
    }, {
        key: "split",
        value: function split(chunkSize, stride) {
            var loopBack = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            var sp = Util_1.Util.split(this, chunkSize, stride, loopBack);
            return sp;
        }
    }, {
        key: "insert",
        value: function insert(pts) {
            var index = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

            Group.prototype.splice.apply(this, [index, 0].concat(_toConsumableArray(pts)));
            return this;
        }
    }, {
        key: "remove",
        value: function remove() {
            var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
            var count = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

            var param = index < 0 ? [index * -1 - 1, count] : [index, count];
            return Group.prototype.splice.apply(this, param);
        }
    }, {
        key: "segments",
        value: function segments() {
            var pts_per_segment = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 2;
            var stride = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
            var loopBack = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            return this.split(pts_per_segment, stride, loopBack);
        }
    }, {
        key: "lines",
        value: function lines() {
            return this.segments(2, 1);
        }
    }, {
        key: "centroid",
        value: function centroid() {
            return Num_1.Geom.centroid(this);
        }
    }, {
        key: "boundingBox",
        value: function boundingBox() {
            return Num_1.Geom.boundingBox(this);
        }
    }, {
        key: "anchorTo",
        value: function anchorTo() {
            var ptOrIndex = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
            Num_1.Geom.anchor(this, ptOrIndex, "to");
        }
    }, {
        key: "anchorFrom",
        value: function anchorFrom() {
            var ptOrIndex = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
            Num_1.Geom.anchor(this, ptOrIndex, "from");
        }
    }, {
        key: "op",
        value: function op(fn) {
            var self = this;
            return function () {
                for (var _len15 = arguments.length, params = Array(_len15), _key15 = 0; _key15 < _len15; _key15++) {
                    params[_key15] = arguments[_key15];
                }

                return fn.apply(undefined, [self].concat(params));
            };
        }
    }, {
        key: "ops",
        value: function ops(fns) {
            var _ops = [];
            for (var i = 0, len = fns.length; i < len; i++) {
                _ops.push(this.op(fns[i]));
            }
            return _ops;
        }
    }, {
        key: "interpolate",
        value: function interpolate(t) {
            t = Num_1.Num.clamp(t, 0, 1);
            var chunk = this.length - 1;
            var tc = 1 / (this.length - 1);
            var idx = Math.floor(t / tc);
            return Num_1.Geom.interpolate(this[idx], this[Math.min(this.length - 1, idx + 1)], (t - idx * tc) * chunk);
        }
    }, {
        key: "moveBy",
        value: function moveBy() {
            return this.add.apply(this, arguments);
        }
    }, {
        key: "moveTo",
        value: function moveTo() {
            for (var _len16 = arguments.length, args = Array(_len16), _key16 = 0; _key16 < _len16; _key16++) {
                args[_key16] = arguments[_key16];
            }

            var d = new Pt(Util_1.Util.getArgs(args)).subtract(this[0]);
            this.moveBy(d);
            return this;
        }
    }, {
        key: "scale",
        value: function scale(_scale2, anchor) {
            for (var i = 0, len = this.length; i < len; i++) {
                Num_1.Geom.scale(this[i], _scale2, anchor || this[0]);
            }
            return this;
        }
    }, {
        key: "rotate2D",
        value: function rotate2D(angle, anchor, axis) {
            for (var i = 0, len = this.length; i < len; i++) {
                Num_1.Geom.rotate2D(this[i], angle, anchor || this[0], axis);
            }
            return this;
        }
    }, {
        key: "shear2D",
        value: function shear2D(scale, anchor, axis) {
            for (var i = 0, len = this.length; i < len; i++) {
                Num_1.Geom.shear2D(this[i], scale, anchor || this[0], axis);
            }
            return this;
        }
    }, {
        key: "reflect2D",
        value: function reflect2D(line, axis) {
            for (var i = 0, len = this.length; i < len; i++) {
                Num_1.Geom.reflect2D(this[i], line, axis);
            }
            return this;
        }
    }, {
        key: "sortByDimension",
        value: function sortByDimension(dim) {
            var desc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            return this.sort(function (a, b) {
                return desc ? b[dim] - a[dim] : a[dim] - b[dim];
            });
        }
    }, {
        key: "forEachPt",
        value: function forEachPt(ptFn) {
            if (!this[0][ptFn]) {
                Util_1.Util.warn(ptFn + " is not a function of Pt");
                return this;
            }

            for (var _len17 = arguments.length, args = Array(_len17 > 1 ? _len17 - 1 : 0), _key17 = 1; _key17 < _len17; _key17++) {
                args[_key17 - 1] = arguments[_key17];
            }

            for (var i = 0, len = this.length; i < len; i++) {
                var _i;

                this[i] = (_i = this[i])[ptFn].apply(_i, args);
            }
            return this;
        }
    }, {
        key: "add",
        value: function add() {
            for (var _len18 = arguments.length, args = Array(_len18), _key18 = 0; _key18 < _len18; _key18++) {
                args[_key18] = arguments[_key18];
            }

            return this.forEachPt.apply(this, ["add"].concat(args));
        }
    }, {
        key: "subtract",
        value: function subtract() {
            for (var _len19 = arguments.length, args = Array(_len19), _key19 = 0; _key19 < _len19; _key19++) {
                args[_key19] = arguments[_key19];
            }

            return this.forEachPt.apply(this, ["subtract"].concat(args));
        }
    }, {
        key: "multiply",
        value: function multiply() {
            for (var _len20 = arguments.length, args = Array(_len20), _key20 = 0; _key20 < _len20; _key20++) {
                args[_key20] = arguments[_key20];
            }

            return this.forEachPt.apply(this, ["multiply"].concat(args));
        }
    }, {
        key: "divide",
        value: function divide() {
            for (var _len21 = arguments.length, args = Array(_len21), _key21 = 0; _key21 < _len21; _key21++) {
                args[_key21] = arguments[_key21];
            }

            return this.forEachPt.apply(this, ["divide"].concat(args));
        }
    }, {
        key: "$matrixAdd",
        value: function $matrixAdd(g) {
            return LinearAlgebra_1.Mat.add(this, g);
        }
    }, {
        key: "$matrixMultiply",
        value: function $matrixMultiply(g) {
            var transposed = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
            var elementwise = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            return LinearAlgebra_1.Mat.multiply(this, g, transposed, elementwise);
        }
    }, {
        key: "zipSlice",
        value: function zipSlice(index) {
            var defaultValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            return LinearAlgebra_1.Mat.zipSlice(this, index, defaultValue);
        }
    }, {
        key: "$zip",
        value: function $zip() {
            var defaultValue = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
            var useLongest = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            return LinearAlgebra_1.Mat.zip(this, defaultValue, useLongest);
        }
    }, {
        key: "toString",
        value: function toString() {
            return "Group[ " + this.reduce(function (p, c) {
                return p + c.toString() + " ";
            }, "") + " ]";
        }
    }, {
        key: "id",
        get: function get() {
            return this._id;
        },
        set: function set(s) {
            this._id = s;
        }
    }, {
        key: "p1",
        get: function get() {
            return this[0];
        }
    }, {
        key: "p2",
        get: function get() {
            return this[1];
        }
    }, {
        key: "p3",
        get: function get() {
            return this[2];
        }
    }, {
        key: "p4",
        get: function get() {
            return this[3];
        }
    }, {
        key: "q1",
        get: function get() {
            return this[this.length - 1];
        }
    }, {
        key: "q2",
        get: function get() {
            return this[this.length - 2];
        }
    }, {
        key: "q3",
        get: function get() {
            return this[this.length - 3];
        }
    }, {
        key: "q4",
        get: function get() {
            return this[this.length - 4];
        }
    }], [{
        key: "fromArray",
        value: function fromArray(list) {
            var g = new Group();
            for (var i = 0, len = list.length; i < len; i++) {
                var p = list[i] instanceof Pt ? list[i] : new Pt(list[i]);
                g.push(p);
            }
            return g;
        }
    }, {
        key: "fromPtArray",
        value: function fromPtArray(list) {
            return Group.from(list);
        }
    }]);

    return Group;
}(_extendableBuiltin3(Array));

exports.Group = Group;

var Bound = function (_Group) {
    _inherits(Bound, _Group);

    function Bound() {
        var _ref2;

        _classCallCheck(this, Bound);

        for (var _len22 = arguments.length, args = Array(_len22), _key22 = 0; _key22 < _len22; _key22++) {
            args[_key22] = arguments[_key22];
        }

        var _this3 = _possibleConstructorReturn(this, (_ref2 = Bound.__proto__ || Object.getPrototypeOf(Bound)).call.apply(_ref2, [this].concat(args)));

        _this3._center = new Pt();
        _this3._size = new Pt();
        _this3._topLeft = new Pt();
        _this3._bottomRight = new Pt();
        _this3._inited = false;
        _this3.init();
        return _this3;
    }

    _createClass(Bound, [{
        key: "init",
        value: function init() {
            if (this.p1) {
                this._size = this.p1.clone();
                this._inited = true;
            }
            if (this.p1 && this.p2) {
                var a = this.p1;
                var b = this.p2;
                this.topLeft = a.$min(b);
                this._bottomRight = a.$max(b);
                this._updateSize();
                this._inited = true;
            }
        }
    }, {
        key: "clone",
        value: function clone() {
            return new Bound(this._topLeft.clone(), this._bottomRight.clone());
        }
    }, {
        key: "_updateSize",
        value: function _updateSize() {
            this._size = this._bottomRight.$subtract(this._topLeft).abs();
            this._updateCenter();
        }
    }, {
        key: "_updateCenter",
        value: function _updateCenter() {
            this._center = this._size.$multiply(0.5).add(this._topLeft);
        }
    }, {
        key: "_updatePosFromTop",
        value: function _updatePosFromTop() {
            this._bottomRight = this._topLeft.$add(this._size);
            this._updateCenter();
        }
    }, {
        key: "_updatePosFromBottom",
        value: function _updatePosFromBottom() {
            this._topLeft = this._bottomRight.$subtract(this._size);
            this._updateCenter();
        }
    }, {
        key: "_updatePosFromCenter",
        value: function _updatePosFromCenter() {
            var half = this._size.$multiply(0.5);
            this._topLeft = this._center.$subtract(half);
            this._bottomRight = this._center.$add(half);
        }
    }, {
        key: "update",
        value: function update() {
            this._topLeft = this[0];
            this._bottomRight = this[1];
            this._updateSize();
            return this;
        }
    }, {
        key: "size",
        get: function get() {
            return new Pt(this._size);
        },
        set: function set(p) {
            this._size = new Pt(p);
            this._updatePosFromTop();
        }
    }, {
        key: "center",
        get: function get() {
            return new Pt(this._center);
        },
        set: function set(p) {
            this._center = new Pt(p);
            this._updatePosFromCenter();
        }
    }, {
        key: "topLeft",
        get: function get() {
            return new Pt(this._topLeft);
        },
        set: function set(p) {
            this._topLeft = new Pt(p);
            this[0] = this._topLeft;
            this._updateSize();
        }
    }, {
        key: "bottomRight",
        get: function get() {
            return new Pt(this._bottomRight);
        },
        set: function set(p) {
            this._bottomRight = new Pt(p);
            this[1] = this._bottomRight;
            this._updateSize();
        }
    }, {
        key: "width",
        get: function get() {
            return this._size.length > 0 ? this._size.x : 0;
        },
        set: function set(w) {
            this._size.x = w;
            this._updatePosFromTop();
        }
    }, {
        key: "height",
        get: function get() {
            return this._size.length > 1 ? this._size.y : 0;
        },
        set: function set(h) {
            this._size.y = h;
            this._updatePosFromTop();
        }
    }, {
        key: "depth",
        get: function get() {
            return this._size.length > 2 ? this._size.z : 0;
        },
        set: function set(d) {
            this._size.z = d;
            this._updatePosFromTop();
        }
    }, {
        key: "x",
        get: function get() {
            return this.topLeft.x;
        }
    }, {
        key: "y",
        get: function get() {
            return this.topLeft.y;
        }
    }, {
        key: "z",
        get: function get() {
            return this.topLeft.z;
        }
    }, {
        key: "inited",
        get: function get() {
            return this._inited;
        }
    }], [{
        key: "fromBoundingRect",
        value: function fromBoundingRect(rect) {
            var b = new Bound(new Pt(rect.left || 0, rect.top || 0), new Pt(rect.right || 0, rect.bottom || 0));
            if (rect.width && rect.height) b.size = new Pt(rect.width, rect.height);
            return b;
        }
    }, {
        key: "fromGroup",
        value: function fromGroup(g) {
            if (g.length < 2) throw new Error("Cannot create a Bound from a group that has less than 2 Pt");
            return new Bound(g[0], g[g.length - 1]);
        }
    }]);

    return Bound;
}(Group);

exports.Bound = Bound;

/***/ }),

/***/ "./src/Space.ts":
/*!**********************!*\
  !*** ./src/Space.ts ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*! Source code licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

Object.defineProperty(exports, "__esModule", { value: true });
var Pt_1 = __webpack_require__(/*! ./Pt */ "./src/Pt.ts");
var UI_1 = __webpack_require__(/*! ./UI */ "./src/UI.ts");

var Space = function () {
    function Space() {
        _classCallCheck(this, Space);

        this.id = "space";
        this.bound = new Pt_1.Bound();
        this._time = { prev: 0, diff: 0, end: -1 };
        this.players = {};
        this.playerCount = 0;
        this._animID = -1;
        this._pause = false;
        this._refresh = undefined;
        this._pointer = new Pt_1.Pt();
        this._isReady = false;
        this._playing = false;
    }

    _createClass(Space, [{
        key: "refresh",
        value: function refresh(b) {
            this._refresh = b;
            return this;
        }
    }, {
        key: "add",
        value: function add(p) {
            var player = typeof p == "function" ? { animate: p } : p;
            var k = this.playerCount++;
            var pid = this.id + k;
            this.players[pid] = player;
            player.animateID = pid;
            if (player.resize && this.bound.inited) player.resize(this.bound);
            if (this._refresh === undefined) this._refresh = true;
            return this;
        }
    }, {
        key: "remove",
        value: function remove(player) {
            delete this.players[player.animateID];
            return this;
        }
    }, {
        key: "removeAll",
        value: function removeAll() {
            this.players = {};
            return this;
        }
    }, {
        key: "play",
        value: function play() {
            var time = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

            if (time === 0 && this._animID !== -1) {
                return;
            }
            this._animID = requestAnimationFrame(this.play.bind(this));
            if (this._pause) return this;
            this._time.diff = time - this._time.prev;
            this._time.prev = time;
            try {
                this.playItems(time);
            } catch (err) {
                cancelAnimationFrame(this._animID);
                this._animID = -1;
                this._playing = false;
                throw err;
            }
            return this;
        }
    }, {
        key: "replay",
        value: function replay() {
            this._time.end = -1;
            this.play();
        }
    }, {
        key: "playItems",
        value: function playItems(time) {
            this._playing = true;
            if (this._refresh) this.clear();
            if (this._isReady) {
                for (var k in this.players) {
                    if (this.players[k].animate) this.players[k].animate(time, this._time.diff, this);
                }
            }
            if (this._time.end >= 0 && time > this._time.end) {
                cancelAnimationFrame(this._animID);
                this._animID = -1;
                this._playing = false;
            }
        }
    }, {
        key: "pause",
        value: function pause() {
            var toggle = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

            this._pause = toggle ? !this._pause : true;
            return this;
        }
    }, {
        key: "resume",
        value: function resume() {
            this._pause = false;
            return this;
        }
    }, {
        key: "stop",
        value: function stop() {
            var t = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

            this._time.end = t;
            return this;
        }
    }, {
        key: "playOnce",
        value: function playOnce() {
            var duration = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 5000;

            this.play();
            this.stop(duration);
            return this;
        }
    }, {
        key: "render",
        value: function render(context) {
            if (this._renderFunc) this._renderFunc(context, this);
            return this;
        }
    }, {
        key: "customRendering",
        set: function set(f) {
            this._renderFunc = f;
        },
        get: function get() {
            return this._renderFunc;
        }
    }, {
        key: "isPlaying",
        get: function get() {
            return this._playing;
        }
    }, {
        key: "outerBound",
        get: function get() {
            return this.bound.clone();
        }
    }, {
        key: "innerBound",
        get: function get() {
            return new Pt_1.Bound(Pt_1.Pt.make(this.size.length, 0), this.size.clone());
        }
    }, {
        key: "size",
        get: function get() {
            return this.bound.size.clone();
        }
    }, {
        key: "center",
        get: function get() {
            return this.size.divide(2);
        }
    }, {
        key: "width",
        get: function get() {
            return this.bound.width;
        }
    }, {
        key: "height",
        get: function get() {
            return this.bound.height;
        }
    }]);

    return Space;
}();

exports.Space = Space;

var MultiTouchSpace = function (_Space) {
    _inherits(MultiTouchSpace, _Space);

    function MultiTouchSpace() {
        _classCallCheck(this, MultiTouchSpace);

        var _this = _possibleConstructorReturn(this, (MultiTouchSpace.__proto__ || Object.getPrototypeOf(MultiTouchSpace)).apply(this, arguments));

        _this._pressed = false;
        _this._dragged = false;
        _this._hasMouse = false;
        _this._hasTouch = false;
        return _this;
    }

    _createClass(MultiTouchSpace, [{
        key: "bindCanvas",
        value: function bindCanvas(evt, callback) {
            this._canvas.addEventListener(evt, callback);
        }
    }, {
        key: "unbindCanvas",
        value: function unbindCanvas(evt, callback) {
            this._canvas.removeEventListener(evt, callback);
        }
    }, {
        key: "bindMouse",
        value: function bindMouse() {
            var _bind = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

            if (_bind) {
                this.bindCanvas("mousedown", this._mouseDown.bind(this));
                this.bindCanvas("mouseup", this._mouseUp.bind(this));
                this.bindCanvas("mouseover", this._mouseOver.bind(this));
                this.bindCanvas("mouseout", this._mouseOut.bind(this));
                this.bindCanvas("mousemove", this._mouseMove.bind(this));
                this.bindCanvas("contextmenu", this._contextMenu.bind(this));
                this._hasMouse = true;
            } else {
                this.unbindCanvas("mousedown", this._mouseDown.bind(this));
                this.unbindCanvas("mouseup", this._mouseUp.bind(this));
                this.unbindCanvas("mouseover", this._mouseOver.bind(this));
                this.unbindCanvas("mouseout", this._mouseOut.bind(this));
                this.unbindCanvas("mousemove", this._mouseMove.bind(this));
                this.unbindCanvas("contextmenu", this._contextMenu.bind(this));
                this._hasMouse = false;
            }
            return this;
        }
    }, {
        key: "bindTouch",
        value: function bindTouch() {
            var _bind = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

            if (_bind) {
                this.bindCanvas("touchstart", this._touchStart.bind(this));
                this.bindCanvas("touchend", this._mouseUp.bind(this));
                this.bindCanvas("touchmove", this._touchMove.bind(this));
                this.bindCanvas("touchcancel", this._mouseOut.bind(this));
                this._hasTouch = true;
            } else {
                this.unbindCanvas("touchstart", this._touchStart.bind(this));
                this.unbindCanvas("touchend", this._mouseUp.bind(this));
                this.unbindCanvas("touchmove", this._touchMove.bind(this));
                this.unbindCanvas("touchcancel", this._mouseOut.bind(this));
                this._hasTouch = false;
            }
            return this;
        }
    }, {
        key: "touchesToPoints",
        value: function touchesToPoints(evt) {
            var which = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "touches";

            if (!evt || !evt[which]) return [];
            var ts = [];
            for (var i = 0; i < evt[which].length; i++) {
                var t = evt[which].item(i);
                ts.push(new Pt_1.Pt(t.pageX - this.bound.topLeft.x, t.pageY - this.bound.topLeft.y));
            }
            return ts;
        }
    }, {
        key: "_mouseAction",
        value: function _mouseAction(type, evt) {
            var px = 0,
                py = 0;
            if (evt instanceof MouseEvent) {
                for (var k in this.players) {
                    if (this.players.hasOwnProperty(k)) {
                        var v = this.players[k];
                        px = evt.pageX - this.outerBound.x;
                        py = evt.pageY - this.outerBound.y;
                        if (v.action) v.action(type, px, py, evt);
                    }
                }
            } else {
                for (var _k in this.players) {
                    if (this.players.hasOwnProperty(_k)) {
                        var _v = this.players[_k];
                        var c = evt.changedTouches && evt.changedTouches.length > 0;
                        var touch = evt.changedTouches.item(0);
                        px = c ? touch.pageX - this.outerBound.x : 0;
                        py = c ? touch.pageY - this.outerBound.y : 0;
                        if (_v.action) _v.action(type, px, py, evt);
                    }
                }
            }
            if (type) {
                this._pointer.to(px, py);
                this._pointer.id = type;
            }
        }
    }, {
        key: "_mouseDown",
        value: function _mouseDown(evt) {
            this._mouseAction(UI_1.UIPointerActions.down, evt);
            this._pressed = true;
            return false;
        }
    }, {
        key: "_mouseUp",
        value: function _mouseUp(evt) {
            if (this._dragged) {
                this._mouseAction(UI_1.UIPointerActions.drop, evt);
            } else {
                this._mouseAction(UI_1.UIPointerActions.up, evt);
            }
            this._pressed = false;
            this._dragged = false;
            return false;
        }
    }, {
        key: "_mouseMove",
        value: function _mouseMove(evt) {
            this._mouseAction(UI_1.UIPointerActions.move, evt);
            if (this._pressed) {
                this._dragged = true;
                this._mouseAction(UI_1.UIPointerActions.drag, evt);
            }
            return false;
        }
    }, {
        key: "_mouseOver",
        value: function _mouseOver(evt) {
            this._mouseAction(UI_1.UIPointerActions.over, evt);
            return false;
        }
    }, {
        key: "_mouseOut",
        value: function _mouseOut(evt) {
            this._mouseAction(UI_1.UIPointerActions.out, evt);
            if (this._dragged) this._mouseAction(UI_1.UIPointerActions.drop, evt);
            this._dragged = false;
            return false;
        }
    }, {
        key: "_contextMenu",
        value: function _contextMenu(evt) {
            this._mouseAction(UI_1.UIPointerActions.contextmenu, evt);
            return false;
        }
    }, {
        key: "_touchMove",
        value: function _touchMove(evt) {
            this._mouseMove(evt);
            evt.preventDefault();
            return false;
        }
    }, {
        key: "_touchStart",
        value: function _touchStart(evt) {
            this._mouseDown(evt);
            evt.preventDefault();
            return false;
        }
    }, {
        key: "pointer",
        get: function get() {
            var p = this._pointer.clone();
            p.id = this._pointer.id;
            return p;
        }
    }]);

    return MultiTouchSpace;
}(Space);

exports.MultiTouchSpace = MultiTouchSpace;

/***/ }),

/***/ "./src/Svg.ts":
/*!********************!*\
  !*** ./src/Svg.ts ***!
  \********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*! Source code licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

Object.defineProperty(exports, "__esModule", { value: true });
var Form_1 = __webpack_require__(/*! ./Form */ "./src/Form.ts");
var Num_1 = __webpack_require__(/*! ./Num */ "./src/Num.ts");
var Util_1 = __webpack_require__(/*! ./Util */ "./src/Util.ts");
var Pt_1 = __webpack_require__(/*! ./Pt */ "./src/Pt.ts");
var Op_1 = __webpack_require__(/*! ./Op */ "./src/Op.ts");
var Dom_1 = __webpack_require__(/*! ./Dom */ "./src/Dom.ts");

var SVGSpace = function (_Dom_1$DOMSpace) {
    _inherits(SVGSpace, _Dom_1$DOMSpace);

    function SVGSpace(elem, callback) {
        _classCallCheck(this, SVGSpace);

        var _this = _possibleConstructorReturn(this, (SVGSpace.__proto__ || Object.getPrototypeOf(SVGSpace)).call(this, elem, callback));

        _this.id = "svgspace";
        _this._bgcolor = "#999";
        if (_this._canvas.nodeName.toLowerCase() != "svg") {
            var s = SVGSpace.svgElement(_this._canvas, "svg", _this.id + "_svg");
            _this._container = _this._canvas;
            _this._canvas = s;
        }
        return _this;
    }

    _createClass(SVGSpace, [{
        key: "getForm",
        value: function getForm() {
            return new SVGForm(this);
        }
    }, {
        key: "resize",
        value: function resize(b, evt) {
            _get(SVGSpace.prototype.__proto__ || Object.getPrototypeOf(SVGSpace.prototype), "resize", this).call(this, b, evt);
            SVGSpace.setAttr(this.element, {
                "viewBox": "0 0 " + this.bound.width + " " + this.bound.height,
                "width": "" + this.bound.width,
                "height": "" + this.bound.height,
                "xmlns": "http://www.w3.org/2000/svg",
                "version": "1.1"
            });
            return this;
        }
    }, {
        key: "remove",
        value: function remove(player) {
            var temp = this._container.querySelectorAll("." + SVGForm.scopeID(player));
            temp.forEach(function (el) {
                el.parentNode.removeChild(el);
            });
            return _get(SVGSpace.prototype.__proto__ || Object.getPrototypeOf(SVGSpace.prototype), "remove", this).call(this, player);
        }
    }, {
        key: "removeAll",
        value: function removeAll() {
            this._container.innerHTML = "";
            return _get(SVGSpace.prototype.__proto__ || Object.getPrototypeOf(SVGSpace.prototype), "removeAll", this).call(this);
        }
    }, {
        key: "element",
        get: function get() {
            return this._canvas;
        }
    }], [{
        key: "svgElement",
        value: function svgElement(parent, name, id) {
            if (!parent || !parent.appendChild) throw new Error("parent is not a valid DOM element");
            var elem = document.querySelector("#" + id);
            if (!elem) {
                elem = document.createElementNS("http://www.w3.org/2000/svg", name);
                elem.setAttribute("id", id);
                parent.appendChild(elem);
            }
            return elem;
        }
    }]);

    return SVGSpace;
}(Dom_1.DOMSpace);

exports.SVGSpace = SVGSpace;

var SVGForm = function (_Form_1$VisualForm) {
    _inherits(SVGForm, _Form_1$VisualForm);

    function SVGForm(space) {
        _classCallCheck(this, SVGForm);

        var _this2 = _possibleConstructorReturn(this, (SVGForm.__proto__ || Object.getPrototypeOf(SVGForm)).call(this));

        _this2._style = {
            "filled": true,
            "stroked": true,
            "fill": "#f03",
            "stroke": "#fff",
            "stroke-width": 1,
            "stroke-linejoin": "bevel",
            "stroke-linecap": "sqaure",
            "opacity": 1
        };
        _this2._ctx = {
            group: null,
            groupID: "pts",
            groupCount: 0,
            currentID: "pts0",
            currentClass: "",
            style: {}
        };
        _this2._ready = false;
        _this2._space = space;
        _this2._space.add({ start: function start() {
                _this2._ctx.group = _this2._space.element;
                _this2._ctx.groupID = "pts_svg_" + SVGForm.groupID++;
                _this2._ctx.style = Object.assign({}, _this2._style);
                _this2._ready = true;
            } });
        return _this2;
    }

    _createClass(SVGForm, [{
        key: "styleTo",
        value: function styleTo(k, v) {
            if (this._ctx.style[k] === undefined) throw new Error(k + " style property doesn't exist");
            this._ctx.style[k] = v;
        }
    }, {
        key: "alpha",
        value: function alpha(a) {
            this.styleTo("opacity", a);
            return this;
        }
    }, {
        key: "fill",
        value: function fill(c) {
            if (typeof c == "boolean") {
                this.styleTo("filled", c);
            } else {
                this.styleTo("filled", true);
                this.styleTo("fill", c);
            }
            return this;
        }
    }, {
        key: "stroke",
        value: function stroke(c, width, linejoin, linecap) {
            if (typeof c == "boolean") {
                this.styleTo("stroked", c);
            } else {
                this.styleTo("stroked", true);
                this.styleTo("stroke", c);
                if (width) this.styleTo("stroke-width", width);
                if (linejoin) this.styleTo("stroke-linejoin", linejoin);
                if (linecap) this.styleTo("stroke-linecap", linecap);
            }
            return this;
        }
    }, {
        key: "cls",
        value: function cls(c) {
            if (typeof c == "boolean") {
                this._ctx.currentClass = "";
            } else {
                this._ctx.currentClass = c;
            }
            return this;
        }
    }, {
        key: "font",
        value: function font(sizeOrFont, weight, style, lineHeight, family) {
            if (typeof sizeOrFont == "number") {
                this._font.size = sizeOrFont;
                if (family) this._font.face = family;
                if (weight) this._font.weight = weight;
                if (style) this._font.style = style;
                if (lineHeight) this._font.lineHeight = lineHeight;
            } else {
                this._font = sizeOrFont;
            }
            this._ctx.style['font'] = this._font.value;
            return this;
        }
    }, {
        key: "reset",
        value: function reset() {
            this._ctx.style = Object.assign({}, this._style);
            this._font = new Form_1.Font(10, "sans-serif");
            this._ctx.style['font'] = this._font.value;
            return this;
        }
    }, {
        key: "updateScope",
        value: function updateScope(group_id, group) {
            this._ctx.group = group;
            this._ctx.groupID = group_id;
            this._ctx.groupCount = 0;
            this.nextID();
            return this._ctx;
        }
    }, {
        key: "scope",
        value: function scope(item) {
            if (!item || item.animateID == null) throw new Error("item not defined or not yet added to Space");
            return this.updateScope(SVGForm.scopeID(item), this.space.element);
        }
    }, {
        key: "nextID",
        value: function nextID() {
            this._ctx.groupCount++;
            this._ctx.currentID = this._ctx.groupID + "-" + this._ctx.groupCount;
            return this._ctx.currentID;
        }
    }, {
        key: "point",
        value: function point(pt) {
            var radius = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5;
            var shape = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "square";

            this.nextID();
            SVGForm.point(this._ctx, pt, radius, shape);
            return this;
        }
    }, {
        key: "circle",
        value: function circle(pts) {
            this.nextID();
            SVGForm.circle(this._ctx, pts[0], pts[1][0]);
            return this;
        }
    }, {
        key: "arc",
        value: function arc(pt, radius, startAngle, endAngle, cc) {
            this.nextID();
            SVGForm.arc(this._ctx, pt, radius, startAngle, endAngle, cc);
            return this;
        }
    }, {
        key: "square",
        value: function square(pt, halfsize) {
            this.nextID();
            SVGForm.square(this._ctx, pt, halfsize);
            return this;
        }
    }, {
        key: "line",
        value: function line(pts) {
            this.nextID();
            SVGForm.line(this._ctx, pts);
            return this;
        }
    }, {
        key: "polygon",
        value: function polygon(pts) {
            this.nextID();
            SVGForm.polygon(this._ctx, pts);
            return this;
        }
    }, {
        key: "rect",
        value: function rect(pts) {
            this.nextID();
            SVGForm.rect(this._ctx, pts);
            return this;
        }
    }, {
        key: "text",
        value: function text(pt, txt) {
            this.nextID();
            SVGForm.text(this._ctx, pt, txt);
            return this;
        }
    }, {
        key: "log",
        value: function log(txt) {
            this.fill("#000").stroke("#fff", 0.5).text([10, 14], txt);
            return this;
        }
    }, {
        key: "space",
        get: function get() {
            return this._space;
        }
    }], [{
        key: "getID",
        value: function getID(ctx) {
            return ctx.currentID || "p-" + SVGForm.domID++;
        }
    }, {
        key: "scopeID",
        value: function scopeID(item) {
            return "item-" + item.animateID;
        }
    }, {
        key: "style",
        value: function style(elem, styles) {
            var st = [];
            if (!styles["filled"]) st.push("fill: none");
            if (!styles["stroked"]) st.push("stroke: none");
            for (var k in styles) {
                if (styles.hasOwnProperty(k) && k != "filled" && k != "stroked") {
                    var v = styles[k];
                    if (v) {
                        if (!styles["filled"] && k.indexOf('fill') === 0) {
                            continue;
                        } else if (!styles["stroked"] && k.indexOf('stroke') === 0) {
                            continue;
                        } else {
                            st.push(k + ": " + v);
                        }
                    }
                }
            }
            return Dom_1.DOMSpace.setAttr(elem, { style: st.join(";") });
        }
    }, {
        key: "point",
        value: function point(ctx, pt) {
            var radius = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 5;
            var shape = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "square";

            if (shape === "circle") {
                return SVGForm.circle(ctx, pt, radius);
            } else {
                return SVGForm.square(ctx, pt, radius);
            }
        }
    }, {
        key: "circle",
        value: function circle(ctx, pt) {
            var radius = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 10;

            var elem = SVGSpace.svgElement(ctx.group, "circle", SVGForm.getID(ctx));
            Dom_1.DOMSpace.setAttr(elem, {
                cx: pt[0],
                cy: pt[1],
                r: radius,
                'class': "pts-svgform pts-circle " + ctx.currentClass
            });
            SVGForm.style(elem, ctx.style);
            return elem;
        }
    }, {
        key: "arc",
        value: function arc(ctx, pt, radius, startAngle, endAngle, cc) {
            var elem = SVGSpace.svgElement(ctx.group, "path", SVGForm.getID(ctx));
            var start = new Pt_1.Pt(pt).toAngle(startAngle, radius, true);
            var end = new Pt_1.Pt(pt).toAngle(endAngle, radius, true);
            var diff = Num_1.Geom.boundAngle(endAngle) - Num_1.Geom.boundAngle(startAngle);
            var largeArc = diff > Util_1.Const.pi ? true : false;
            if (cc) largeArc = !largeArc;
            var sweep = cc ? "0" : "1";
            var d = "M " + start[0] + " " + start[1] + " A " + radius + " " + radius + " 0 " + (largeArc ? "1" : "0") + " " + sweep + " " + end[0] + " " + end[1];
            Dom_1.DOMSpace.setAttr(elem, {
                d: d,
                'class': "pts-svgform pts-arc " + ctx.currentClass
            });
            SVGForm.style(elem, ctx.style);
            return elem;
        }
    }, {
        key: "square",
        value: function square(ctx, pt, halfsize) {
            var elem = SVGSpace.svgElement(ctx.group, "rect", SVGForm.getID(ctx));
            Dom_1.DOMSpace.setAttr(elem, {
                x: pt[0] - halfsize,
                y: pt[1] - halfsize,
                width: halfsize * 2,
                height: halfsize * 2,
                'class': "pts-svgform pts-square " + ctx.currentClass
            });
            SVGForm.style(elem, ctx.style);
            return elem;
        }
    }, {
        key: "line",
        value: function line(ctx, pts) {
            if (!this._checkSize(pts)) return;
            if (pts.length > 2) return SVGForm._poly(ctx, pts, false);
            var elem = SVGSpace.svgElement(ctx.group, "line", SVGForm.getID(ctx));
            Dom_1.DOMSpace.setAttr(elem, {
                x1: pts[0][0],
                y1: pts[0][1],
                x2: pts[1][0],
                y2: pts[1][1],
                'class': "pts-svgform pts-line " + ctx.currentClass
            });
            SVGForm.style(elem, ctx.style);
            return elem;
        }
    }, {
        key: "_poly",
        value: function _poly(ctx, pts) {
            var closePath = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

            if (!this._checkSize(pts)) return;
            var elem = SVGSpace.svgElement(ctx.group, closePath ? "polygon" : "polyline", SVGForm.getID(ctx));
            var points = pts.reduce(function (a, p) {
                return a + (p[0] + "," + p[1] + " ");
            }, "");
            Dom_1.DOMSpace.setAttr(elem, {
                points: points,
                'class': "pts-svgform pts-polygon " + ctx.currentClass
            });
            SVGForm.style(elem, ctx.style);
            return elem;
        }
    }, {
        key: "polygon",
        value: function polygon(ctx, pts) {
            return SVGForm._poly(ctx, pts, true);
        }
    }, {
        key: "rect",
        value: function rect(ctx, pts) {
            if (!this._checkSize(pts)) return;
            var elem = SVGSpace.svgElement(ctx.group, "rect", SVGForm.getID(ctx));
            var bound = Pt_1.Group.fromArray(pts).boundingBox();
            var size = Op_1.Rectangle.size(bound);
            Dom_1.DOMSpace.setAttr(elem, {
                x: bound[0][0],
                y: bound[0][1],
                width: size[0],
                height: size[1],
                'class': "pts-svgform pts-rect " + ctx.currentClass
            });
            SVGForm.style(elem, ctx.style);
            return elem;
        }
    }, {
        key: "text",
        value: function text(ctx, pt, txt) {
            var elem = SVGSpace.svgElement(ctx.group, "text", SVGForm.getID(ctx));
            Dom_1.DOMSpace.setAttr(elem, {
                "pointer-events": "none",
                x: pt[0],
                y: pt[1],
                dx: 0, dy: 0,
                'class': "pts-svgform pts-text " + ctx.currentClass
            });
            elem.textContent = txt;
            SVGForm.style(elem, ctx.style);
            return elem;
        }
    }]);

    return SVGForm;
}(Form_1.VisualForm);

SVGForm.groupID = 0;
SVGForm.domID = 0;
exports.SVGForm = SVGForm;

/***/ }),

/***/ "./src/Typography.ts":
/*!***************************!*\
  !*** ./src/Typography.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*! Source code licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

Object.defineProperty(exports, "__esModule", { value: true });
var Pt_1 = __webpack_require__(/*! ./Pt */ "./src/Pt.ts");

var Typography = function () {
    function Typography() {
        _classCallCheck(this, Typography);
    }

    _createClass(Typography, null, [{
        key: "textWidthEstimator",
        value: function textWidthEstimator(fn) {
            var samples = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ["M", "n", "."];
            var distribution = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [0.06, 0.8, 0.14];

            var m = samples.map(fn);
            var avg = new Pt_1.Pt(distribution).dot(m);
            return function (str) {
                return str.length * avg;
            };
        }
    }, {
        key: "truncate",
        value: function truncate(fn, str, width) {
            var tail = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "";

            var trim = Math.floor(str.length * Math.min(1, width / fn(str)));
            if (trim < str.length) {
                trim = Math.max(0, trim - tail.length);
                return [str.substr(0, trim) + tail, trim];
            } else {
                return [str, str.length];
            }
        }
    }, {
        key: "fontSizeToBox",
        value: function fontSizeToBox(box) {
            var ratio = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
            var byHeight = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

            var i = byHeight ? 1 : 0;
            var h = box[1][i] - box[0][i];
            var f = ratio * h;
            return function (b) {
                var nh = (b[1][i] - b[0][i]) / h;
                return f * nh;
            };
        }
    }, {
        key: "fontSizeToThreshold",
        value: function fontSizeToThreshold(threshold) {
            var direction = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

            return function (defaultSize, val) {
                var d = defaultSize * val / threshold;
                if (direction < 0) return Math.min(d, defaultSize);
                if (direction > 0) return Math.max(d, defaultSize);
                return d;
            };
        }
    }]);

    return Typography;
}();

exports.Typography = Typography;

/***/ }),

/***/ "./src/UI.ts":
/*!*******************!*\
  !*** ./src/UI.ts ***!
  \*******************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*! Source code licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

Object.defineProperty(exports, "__esModule", { value: true });
var Pt_1 = __webpack_require__(/*! ./Pt */ "./src/Pt.ts");
var Op_1 = __webpack_require__(/*! ./Op */ "./src/Op.ts");
exports.UIShape = {
    rectangle: "rectangle", circle: "circle", polygon: "polygon", polyline: "polyline", line: "line"
};
exports.UIPointerActions = {
    up: "up", down: "down", move: "move", drag: "drag", uidrag: "uidrag", drop: "drop", uidrop: "uidrop", over: "over", out: "out", enter: "enter", leave: "leave", contextmenu: "contextmenu", all: "all"
};

var UI = function () {
    function UI(group, shape) {
        var states = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        var id = arguments[3];

        _classCallCheck(this, UI);

        this._holds = new Map();
        this._group = Pt_1.Group.fromArray(group);
        this._shape = shape;
        this._id = id === undefined ? "ui_" + UI._counter++ : id;
        this._states = states;
        this._actions = {};
    }

    _createClass(UI, [{
        key: "state",
        value: function state(key, value) {
            if (!key) return null;
            if (value !== undefined) {
                this._states[key] = value;
                return this;
            }
            return this._states[key];
        }
    }, {
        key: "on",
        value: function on(type, fn) {
            if (!this._actions[type]) this._actions[type] = [];
            return UI._addHandler(this._actions[type], fn);
        }
    }, {
        key: "off",
        value: function off(type, which) {
            if (!this._actions[type]) return false;
            if (which === undefined) {
                delete this._actions[type];
                return true;
            } else {
                return UI._removeHandler(this._actions[type], which);
            }
        }
    }, {
        key: "listen",
        value: function listen(type, p, evt) {
            if (this._actions[type] !== undefined) {
                if (this._within(p) || Array.from(this._holds.values()).indexOf(type) >= 0) {
                    UI._trigger(this._actions[type], this, p, type, evt);
                    return true;
                } else if (this._actions['all']) {
                    UI._trigger(this._actions['all'], this, p, type, evt);
                    return true;
                }
            }
            return false;
        }
    }, {
        key: "hold",
        value: function hold(type) {
            var newKey = Math.max.apply(Math, [0].concat(_toConsumableArray(Array.from(this._holds.keys())))) + 1;
            this._holds.set(newKey, type);
            return newKey;
        }
    }, {
        key: "unhold",
        value: function unhold(key) {
            if (key !== undefined) {
                this._holds.delete(key);
            } else {
                this._holds.clear();
            }
        }
    }, {
        key: "render",
        value: function render(fn) {
            fn(this._group, this._states);
        }
    }, {
        key: "toString",
        value: function toString() {
            return "UI " + this.group.toString;
        }
    }, {
        key: "_within",
        value: function _within(p) {
            var fn = null;
            if (this._shape === exports.UIShape.rectangle) {
                fn = Op_1.Rectangle.withinBound;
            } else if (this._shape === exports.UIShape.circle) {
                fn = Op_1.Circle.withinBound;
            } else if (this._shape === exports.UIShape.polygon) {
                fn = Op_1.Polygon.hasIntersectPoint;
            } else {
                return false;
            }
            return fn(this._group, p);
        }
    }, {
        key: "id",
        get: function get() {
            return this._id;
        },
        set: function set(d) {
            this._id = d;
        }
    }, {
        key: "group",
        get: function get() {
            return this._group;
        },
        set: function set(d) {
            this._group = d;
        }
    }, {
        key: "shape",
        get: function get() {
            return this._shape;
        },
        set: function set(d) {
            this._shape = d;
        }
    }], [{
        key: "fromRectangle",
        value: function fromRectangle(group, states, id) {
            return new this(group, exports.UIShape.rectangle, states, id);
        }
    }, {
        key: "fromCircle",
        value: function fromCircle(group, states, id) {
            return new this(group, exports.UIShape.circle, states, id);
        }
    }, {
        key: "fromPolygon",
        value: function fromPolygon(group, states, id) {
            return new this(group, exports.UIShape.polygon, states, id);
        }
    }, {
        key: "fromUI",
        value: function fromUI(ui, states, id) {
            return new this(ui.group, ui.shape, states || ui._states, id);
        }
    }, {
        key: "track",
        value: function track(uis, type, p, evt) {
            for (var i = 0, len = uis.length; i < len; i++) {
                uis[i].listen(type, p, evt);
            }
        }
    }, {
        key: "_trigger",
        value: function _trigger(fns, target, pt, type, evt) {
            if (fns) {
                for (var i = 0, len = fns.length; i < len; i++) {
                    if (fns[i]) fns[i](target, pt, type, evt);
                }
            }
        }
    }, {
        key: "_addHandler",
        value: function _addHandler(fns, fn) {
            if (fn) {
                fns.push(fn);
                return fns.length - 1;
            } else {
                return -1;
            }
        }
    }, {
        key: "_removeHandler",
        value: function _removeHandler(fns, index) {
            if (index >= 0 && index < fns.length) {
                var temp = fns.length;
                fns.splice(index, 1);
                return temp > fns.length;
            } else {
                return false;
            }
        }
    }]);

    return UI;
}();

UI._counter = 0;
exports.UI = UI;

var UIButton = function (_UI) {
    _inherits(UIButton, _UI);

    function UIButton(group, shape) {
        var states = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        var id = arguments[3];

        _classCallCheck(this, UIButton);

        var _this = _possibleConstructorReturn(this, (UIButton.__proto__ || Object.getPrototypeOf(UIButton)).call(this, group, shape, states, id));

        _this._hoverID = -1;
        if (states.hover === undefined) _this._states['hover'] = false;
        if (states.clicks === undefined) _this._states['clicks'] = 0;
        var UA = exports.UIPointerActions;
        _this.on(UA.up, function (target, pt, type, evt) {
            _this.state('clicks', _this._states.clicks + 1);
        });
        _this.on(UA.move, function (target, pt, type, evt) {
            var hover = _this._within(pt);
            if (hover && !_this._states.hover) {
                _this.state('hover', true);
                UI._trigger(_this._actions[UA.enter], _this, pt, UA.enter, evt);
                var _capID = _this.hold(UA.move);
                _this._hoverID = _this.on(UA.move, function (t, p) {
                    if (!_this._within(p) && !_this.state('dragging')) {
                        _this.state('hover', false);
                        UI._trigger(_this._actions[UA.leave], _this, pt, UA.leave, evt);
                        _this.off(UA.move, _this._hoverID);
                        _this.unhold(_capID);
                    }
                });
            }
        });
        return _this;
    }

    _createClass(UIButton, [{
        key: "onClick",
        value: function onClick(fn) {
            return this.on(exports.UIPointerActions.up, fn);
        }
    }, {
        key: "offClick",
        value: function offClick(id) {
            return this.off(exports.UIPointerActions.up, id);
        }
    }, {
        key: "onContextMenu",
        value: function onContextMenu(fn) {
            return this.on(exports.UIPointerActions.contextmenu, fn);
        }
    }, {
        key: "offContextMenu",
        value: function offContextMenu(id) {
            return this.off(exports.UIPointerActions.contextmenu, id);
        }
    }, {
        key: "onHover",
        value: function onHover(enter, leave) {
            var ids = [undefined, undefined];
            if (enter) ids[0] = this.on(exports.UIPointerActions.enter, enter);
            if (leave) ids[1] = this.on(exports.UIPointerActions.leave, leave);
            return ids;
        }
    }, {
        key: "offHover",
        value: function offHover(enterID, leaveID) {
            var s = [false, false];
            if (enterID === undefined || enterID >= 0) s[0] = this.off(exports.UIPointerActions.enter, enterID);
            if (leaveID === undefined || leaveID >= 0) s[1] = this.off(exports.UIPointerActions.leave, leaveID);
            return s;
        }
    }]);

    return UIButton;
}(UI);

exports.UIButton = UIButton;

var UIDragger = function (_UIButton) {
    _inherits(UIDragger, _UIButton);

    function UIDragger(group, shape) {
        var states = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        var id = arguments[3];

        _classCallCheck(this, UIDragger);

        var _this2 = _possibleConstructorReturn(this, (UIDragger.__proto__ || Object.getPrototypeOf(UIDragger)).call(this, group, shape, states, id));

        _this2._draggingID = -1;
        _this2._moveHoldID = -1;
        _this2._dropHoldID = -1;
        _this2._upHoldID = -1;
        if (states.dragging === undefined) _this2._states['dragging'] = false;
        if (states.moved === undefined) _this2._states['moved'] = false;
        if (states.offset === undefined) _this2._states['offset'] = new Pt_1.Pt();
        var UA = exports.UIPointerActions;
        _this2.on(UA.down, function (target, pt, type, evt) {
            if (_this2._moveHoldID === -1) {
                _this2.state('dragging', true);
                _this2.state('offset', new Pt_1.Pt(pt).subtract(target.group[0]));
                _this2._moveHoldID = _this2.hold(UA.move);
            }
            if (_this2._dropHoldID === -1) {
                _this2._dropHoldID = _this2.hold(UA.drop);
            }
            if (_this2._upHoldID === -1) {
                _this2._upHoldID = _this2.hold(UA.up);
            }
            if (_this2._draggingID === -1) {
                _this2._draggingID = _this2.on(UA.move, function (t, p) {
                    if (_this2.state('dragging')) {
                        UI._trigger(_this2._actions[UA.uidrag], t, p, UA.uidrag, evt);
                        _this2.state('moved', true);
                    }
                });
            }
        });
        var endDrag = function endDrag(target, pt, type, evt) {
            _this2.state('dragging', false);
            _this2.off(UA.move, _this2._draggingID);
            _this2._draggingID = -1;
            _this2.unhold(_this2._moveHoldID);
            _this2._moveHoldID = -1;
            _this2.unhold(_this2._dropHoldID);
            _this2._dropHoldID = -1;
            _this2.unhold(_this2._upHoldID);
            _this2._upHoldID = -1;
            if (_this2.state('moved')) {
                UI._trigger(_this2._actions[UA.uidrop], target, pt, UA.uidrop, evt);
                _this2.state('moved', false);
            }
        };
        _this2.on(UA.drop, endDrag);
        _this2.on(UA.up, endDrag);
        _this2.on(UA.out, endDrag);
        return _this2;
    }

    _createClass(UIDragger, [{
        key: "onDrag",
        value: function onDrag(fn) {
            return this.on(exports.UIPointerActions.uidrag, fn);
        }
    }, {
        key: "offDrag",
        value: function offDrag(id) {
            return this.off(exports.UIPointerActions.uidrag, id);
        }
    }, {
        key: "onDrop",
        value: function onDrop(fn) {
            return this.on(exports.UIPointerActions.uidrop, fn);
        }
    }, {
        key: "offDrop",
        value: function offDrop(id) {
            return this.off(exports.UIPointerActions.uidrop, id);
        }
    }]);

    return UIDragger;
}(UIButton);

exports.UIDragger = UIDragger;

/***/ }),

/***/ "./src/Util.ts":
/*!*********************!*\
  !*** ./src/Util.ts ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*! Source code licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

Object.defineProperty(exports, "__esModule", { value: true });
var Pt_1 = __webpack_require__(/*! ./Pt */ "./src/Pt.ts");
exports.Const = {
    xy: "xy",
    yz: "yz",
    xz: "xz",
    xyz: "xyz",
    horizontal: 0,
    vertical: 1,
    identical: 0,
    right: 4,
    bottom_right: 5,
    bottom: 6,
    bottom_left: 7,
    left: 8,
    top_left: 1,
    top: 2,
    top_right: 3,
    epsilon: 0.0001,
    max: Number.MAX_VALUE,
    min: Number.MIN_VALUE,
    pi: Math.PI,
    two_pi: 6.283185307179586,
    half_pi: 1.5707963267948966,
    quarter_pi: 0.7853981633974483,
    one_degree: 0.017453292519943295,
    rad_to_deg: 57.29577951308232,
    deg_to_rad: 0.017453292519943295,
    gravity: 9.81,
    newton: 0.10197,
    gaussian: 0.3989422804014327
};

var Util = function () {
    function Util() {
        _classCallCheck(this, Util);
    }

    _createClass(Util, null, [{
        key: "warnLevel",
        value: function warnLevel(lv) {
            if (lv) {
                Util._warnLevel = lv;
            }
            return Util._warnLevel;
        }
    }, {
        key: "getArgs",
        value: function getArgs(args) {
            if (args.length < 1) return [];
            var pos = [];
            var isArray = Array.isArray(args[0]) || ArrayBuffer.isView(args[0]);
            if (typeof args[0] === 'number') {
                pos = Array.prototype.slice.call(args);
            } else if (_typeof(args[0]) === 'object' && !isArray) {
                var a = ["x", "y", "z", "w"];
                var p = args[0];
                for (var i = 0; i < a.length; i++) {
                    if (p.length && i >= p.length || !(a[i] in p)) break;
                    pos.push(p[a[i]]);
                }
            } else if (isArray) {
                pos = [].slice.call(args[0]);
            }
            return pos;
        }
    }, {
        key: "warn",
        value: function warn() {
            var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "error";
            var defaultReturn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;

            if (Util.warnLevel() == "error") {
                throw new Error(message);
            } else if (Util.warnLevel() == "warn") {
                console.warn(message);
            }
            return defaultReturn;
        }
    }, {
        key: "randomInt",
        value: function randomInt(range) {
            var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

            return Math.floor(Math.random() * range) + start;
        }
    }, {
        key: "split",
        value: function split(pts, size, stride) {
            var loopBack = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
            var matchSize = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;

            var chunks = [];
            var part = [];
            var st = stride || size;
            var index = 0;
            if (pts.length <= 0 || st <= 0) return [];
            while (index < pts.length) {
                part = [];
                for (var k = 0; k < size; k++) {
                    if (loopBack) {
                        part.push(pts[(index + k) % pts.length]);
                    } else {
                        if (index + k >= pts.length) break;
                        part.push(pts[index + k]);
                    }
                }
                index += st;
                if (!matchSize || matchSize && part.length === size) chunks.push(part);
            }
            return chunks;
        }
    }, {
        key: "flatten",
        value: function flatten(pts) {
            var flattenAsGroup = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

            var arr = flattenAsGroup ? new Pt_1.Group() : new Array();
            return arr.concat.apply(arr, pts);
        }
    }, {
        key: "combine",
        value: function combine(a, b, op) {
            var result = [];
            for (var i = 0, len = a.length; i < len; i++) {
                for (var k = 0, lenB = b.length; k < lenB; k++) {
                    result.push(op(a[i], b[k]));
                }
            }
            return result;
        }
    }, {
        key: "zip",
        value: function zip(arrays) {
            var z = [];
            for (var i = 0, len = arrays[0].length; i < len; i++) {
                var p = [];
                for (var k = 0; k < arrays.length; k++) {
                    p.push(arrays[k][i]);
                }
                z.push(p);
            }
            return z;
        }
    }, {
        key: "stepper",
        value: function stepper(max) {
            var min = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
            var stride = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
            var callback = arguments[3];

            var c = min;
            return function () {
                c += stride;
                if (c >= max) {
                    c = min + (c - max);
                }
                if (callback) callback(c);
                return c;
            };
        }
    }, {
        key: "forRange",
        value: function forRange(fn, range) {
            var start = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
            var step = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;

            var temp = [];
            for (var i = start, len = range; i < len; i += step) {
                temp[i] = fn(i);
            }
            return temp;
        }
    }, {
        key: "load",
        value: function load(url, callback) {
            var request = new XMLHttpRequest();
            request.open('GET', url, true);
            request.onload = function () {
                if (request.status >= 200 && request.status < 400) {
                    callback(request.responseText, true);
                } else {
                    callback("Server error (" + request.status + ") when loading \"" + url + "\"", false);
                }
            };
            request.onerror = function () {
                callback("Unknown network error", false);
            };
            request.send();
        }
    }]);

    return Util;
}();

Util._warnLevel = "mute";
exports.Util = Util;

/***/ }),

/***/ "./src/_module.ts":
/*!************************!*\
  !*** ./src/_module.ts ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function __export(m) {
    for (var p in m) {
        if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(/*! ./Canvas */ "./src/Canvas.ts"));
__export(__webpack_require__(/*! ./Create */ "./src/Create.ts"));
__export(__webpack_require__(/*! ./Form */ "./src/Form.ts"));
__export(__webpack_require__(/*! ./LinearAlgebra */ "./src/LinearAlgebra.ts"));
__export(__webpack_require__(/*! ./Num */ "./src/Num.ts"));
__export(__webpack_require__(/*! ./Op */ "./src/Op.ts"));
__export(__webpack_require__(/*! ./Pt */ "./src/Pt.ts"));
__export(__webpack_require__(/*! ./Space */ "./src/Space.ts"));
__export(__webpack_require__(/*! ./Color */ "./src/Color.ts"));
__export(__webpack_require__(/*! ./Util */ "./src/Util.ts"));
__export(__webpack_require__(/*! ./Dom */ "./src/Dom.ts"));
__export(__webpack_require__(/*! ./Svg */ "./src/Svg.ts"));
__export(__webpack_require__(/*! ./Typography */ "./src/Typography.ts"));
__export(__webpack_require__(/*! ./Physics */ "./src/Physics.ts"));
__export(__webpack_require__(/*! ./Play */ "./src/Play.ts"));
__export(__webpack_require__(/*! ./UI */ "./src/UI.ts"));

/***/ })

/******/ });
});
//# sourceMappingURL=es5.js.map