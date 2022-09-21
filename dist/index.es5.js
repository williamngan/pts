// src/LinearAlgebra.ts
function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
}
function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}
function _assertThisInitialized(self) {
    if (self === void 0) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }
    return self;
}
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        var info = gen[key](arg);
        var value = info.value;
    } catch (error) {
        reject(error);
        return;
    }
    if (info.done) {
        resolve(value);
    } else {
        Promise.resolve(value).then(_next, _throw);
    }
}
function _asyncToGenerator(fn) {
    return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
            var gen = fn.apply(self, args);
            function _next(value) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }
            function _throw(err) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }
            _next(undefined);
        });
    };
}
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}
function isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;
    try {
        Date.prototype.toString.call(Reflect.construct(Date, [], function() {}));
        return true;
    } catch (e) {
        return false;
    }
}
function _construct(Parent, args, Class) {
    if (isNativeReflectConstruct()) {
        _construct = Reflect.construct;
    } else {
        _construct = function _construct(Parent, args, Class) {
            var a = [
                null
            ];
            a.push.apply(a, args);
            var Constructor = Function.bind.apply(Parent, a);
            var instance = new Constructor();
            if (Class) _setPrototypeOf(instance, Class.prototype);
            return instance;
        };
    }
    return _construct.apply(null, arguments);
}
function _defineProperties(target, props) {
    for(var i = 0; i < props.length; i++){
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
    }
}
function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
}
function _get(target, property, receiver) {
    if (typeof Reflect !== "undefined" && Reflect.get) {
        _get = Reflect.get;
    } else {
        _get = function _get(target, property, receiver) {
            var base = _superPropBase(target, property);
            if (!base) return;
            var desc = Object.getOwnPropertyDescriptor(base, property);
            if (desc.get) {
                return desc.get.call(receiver);
            }
            return desc.value;
        };
    }
    return _get(target, property, receiver || target);
}
function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
        return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function");
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            writable: true,
            configurable: true
        }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
}
function _instanceof(left, right) {
    if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) {
        return !!right[Symbol.hasInstance](left);
    } else {
        return left instanceof right;
    }
}
function _isNativeFunction(fn) {
    return Function.toString.call(fn).indexOf("[native code]") !== -1;
}
function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}
function _iterableToArrayLimit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _s, _e;
    try {
        for(_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true){
            _arr.push(_s.value);
            if (i && _arr.length === i) break;
        }
    } catch (err) {
        _d = true;
        _e = err;
    } finally{
        try {
            if (!_n && _i["return"] != null) _i["return"]();
        } finally{
            if (_d) throw _e;
        }
    }
    return _arr;
}
function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _possibleConstructorReturn(self, call) {
    if (call && (_typeof(call) === "object" || typeof call === "function")) {
        return call;
    }
    return _assertThisInitialized(self);
}
function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
        o.__proto__ = p;
        return o;
    };
    return _setPrototypeOf(o, p);
}
function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}
function _superPropBase(object, property) {
    while(!Object.prototype.hasOwnProperty.call(object, property)){
        object = _getPrototypeOf(object);
        if (object === null) break;
    }
    return object;
}
function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}
var _typeof = function(obj) {
    "@swc/helpers - typeof";
    return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj;
};
function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}
function _wrapNativeSuper(Class) {
    var _cache = typeof Map === "function" ? new Map() : undefined;
    _wrapNativeSuper = function _wrapNativeSuper(Class) {
        if (Class === null || !_isNativeFunction(Class)) return Class;
        if (typeof Class !== "function") {
            throw new TypeError("Super expression must either be null or a function");
        }
        if (typeof _cache !== "undefined") {
            if (_cache.has(Class)) return _cache.get(Class);
            _cache.set(Class, Wrapper);
        }
        function Wrapper() {
            return _construct(Class, arguments, _getPrototypeOf(this).constructor);
        }
        Wrapper.prototype = Object.create(Class.prototype, {
            constructor: {
                value: Wrapper,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
        return _setPrototypeOf(Wrapper, Class);
    };
    return _wrapNativeSuper(Class);
}
function _isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;
    try {
        Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
        return true;
    } catch (e) {
        return false;
    }
}
function _createSuper(Derived) {
    var hasNativeReflectConstruct = _isNativeReflectConstruct();
    return function _createSuperInternal() {
        var Super = _getPrototypeOf(Derived), result;
        if (hasNativeReflectConstruct) {
            var NewTarget = _getPrototypeOf(this).constructor;
            result = Reflect.construct(Super, arguments, NewTarget);
        } else {
            result = Super.apply(this, arguments);
        }
        return _possibleConstructorReturn(this, result);
    };
}
var __generator = this && this.__generator || function(thisArg, body) {
    var f, y, t, g, _ = {
        label: 0,
        sent: function() {
            if (t[0] & 1) throw t[1];
            return t[1];
        },
        trys: [],
        ops: []
    };
    return g = {
        next: verb(0),
        "throw": verb(1),
        "return": verb(2)
    }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
        return this;
    }), g;
    function verb(n) {
        return function(v) {
            return step([
                n,
                v
            ]);
        };
    }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while(_)try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [
                op[0] & 2,
                t.value
            ];
            switch(op[0]){
                case 0:
                case 1:
                    t = op;
                    break;
                case 4:
                    _.label++;
                    return {
                        value: op[1],
                        done: false
                    };
                case 5:
                    _.label++;
                    y = op[1];
                    op = [
                        0
                    ];
                    continue;
                case 7:
                    op = _.ops.pop();
                    _.trys.pop();
                    continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                        _ = 0;
                        continue;
                    }
                    if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                        _.label = op[1];
                        break;
                    }
                    if (op[0] === 6 && _.label < t[1]) {
                        _.label = t[1];
                        t = op;
                        break;
                    }
                    if (t && _.label < t[2]) {
                        _.label = t[2];
                        _.ops.push(op);
                        break;
                    }
                    if (t[2]) _.ops.pop();
                    _.trys.pop();
                    continue;
            }
            op = body.call(thisArg, _);
        } catch (e) {
            op = [
                6,
                e
            ];
            y = 0;
        } finally{
            f = t = 0;
        }
        if (op[0] & 5) throw op[1];
        return {
            value: op[0] ? op[1] : void 0,
            done: true
        };
    }
};
var Vec = /*#__PURE__*/ function() {
    "use strict";
    function Vec1() {
        _classCallCheck(this, Vec1);
    }
    _createClass(Vec1, null, [
        {
            key: "add",
            value: function add(a, b) {
                if (typeof b == "number") {
                    for(var i = 0, len = a.length; i < len; i++)a[i] += b;
                } else {
                    for(var i1 = 0, len1 = a.length; i1 < len1; i1++)a[i1] += b[i1] || 0;
                }
                return a;
            }
        },
        {
            key: "subtract",
            value: function subtract(a, b) {
                if (typeof b == "number") {
                    for(var i = 0, len = a.length; i < len; i++)a[i] -= b;
                } else {
                    for(var i1 = 0, len1 = a.length; i1 < len1; i1++)a[i1] -= b[i1] || 0;
                }
                return a;
            }
        },
        {
            key: "multiply",
            value: function multiply(a, b) {
                if (typeof b == "number") {
                    for(var i = 0, len = a.length; i < len; i++)a[i] *= b;
                } else {
                    if (a.length != b.length) {
                        throw new Error("Cannot do element-wise multiply since the array lengths don't match: ".concat(a.toString(), " multiply-with ").concat(b.toString()));
                    }
                    for(var i1 = 0, len1 = a.length; i1 < len1; i1++)a[i1] *= b[i1];
                }
                return a;
            }
        },
        {
            key: "divide",
            value: function divide(a, b) {
                if (typeof b == "number") {
                    if (b === 0) throw new Error("Cannot divide by zero");
                    for(var i = 0, len = a.length; i < len; i++)a[i] /= b;
                } else {
                    if (a.length != b.length) {
                        throw new Error("Cannot do element-wise divide since the array lengths don't match. ".concat(a.toString(), " divide-by ").concat(b.toString()));
                    }
                    for(var i1 = 0, len1 = a.length; i1 < len1; i1++)a[i1] /= b[i1];
                }
                return a;
            }
        },
        {
            key: "dot",
            value: function dot(a, b) {
                if (a.length != b.length) throw new Error("Array lengths don't match");
                var d = 0;
                for(var i = 0, len = a.length; i < len; i++){
                    d += a[i] * b[i];
                }
                return d;
            }
        },
        {
            key: "cross2D",
            value: function cross2D(a, b) {
                return a[0] * b[1] - a[1] * b[0];
            }
        },
        {
            key: "cross",
            value: function cross(a, b) {
                return new Pt(a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]);
            }
        },
        {
            key: "magnitude",
            value: function magnitude(a) {
                return Math.sqrt(Vec.dot(a, a));
            }
        },
        {
            key: "unit",
            value: function unit(a) {
                var magnitude = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : void 0;
                var m = magnitude === void 0 ? Vec.magnitude(a) : magnitude;
                if (m === 0) return Pt.make(a.length);
                return Vec.divide(a, m);
            }
        },
        {
            key: "abs",
            value: function abs(a) {
                return Vec.map(a, Math.abs);
            }
        },
        {
            key: "floor",
            value: function floor(a) {
                return Vec.map(a, Math.floor);
            }
        },
        {
            key: "ceil",
            value: function ceil(a) {
                return Vec.map(a, Math.ceil);
            }
        },
        {
            key: "round",
            value: function round(a) {
                return Vec.map(a, Math.round);
            }
        },
        {
            key: "max",
            value: function max(a) {
                var m = Number.MIN_VALUE;
                var index = 0;
                for(var i = 0, len = a.length; i < len; i++){
                    m = Math.max(m, a[i]);
                    if (m === a[i]) index = i;
                }
                return {
                    value: m,
                    index: index
                };
            }
        },
        {
            key: "min",
            value: function min(a) {
                var m = Number.MAX_VALUE;
                var index = 0;
                for(var i = 0, len = a.length; i < len; i++){
                    m = Math.min(m, a[i]);
                    if (m === a[i]) index = i;
                }
                return {
                    value: m,
                    index: index
                };
            }
        },
        {
            key: "sum",
            value: function sum(a) {
                var s = 0;
                for(var i = 0, len = a.length; i < len; i++)s += a[i];
                return s;
            }
        },
        {
            key: "map",
            value: function map(a, fn) {
                for(var i = 0, len = a.length; i < len; i++){
                    a[i] = fn(a[i], i, a);
                }
                return a;
            }
        }
    ]);
    return Vec1;
}();
var Mat = /*#__PURE__*/ function() {
    "use strict";
    function Mat1() {
        _classCallCheck(this, Mat1);
        this.reset();
    }
    _createClass(Mat1, [
        {
            key: "value",
            get: function get() {
                return this._33;
            }
        },
        {
            key: "domMatrix",
            get: function get() {
                return new DOMMatrix(Mat.toDOMMatrix(this._33));
            }
        },
        {
            key: "reset",
            value: function reset() {
                this._33 = Mat.scale2DMatrix(1, 1);
            }
        },
        {
            key: "scale2D",
            value: function scale2D(val) {
                var at = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : [
                    0,
                    0
                ];
                var m = Mat.scaleAt2DMatrix(val[0] || 1, val[1] || 1, at);
                this._33 = Mat.multiply(this._33, m);
                return this;
            }
        },
        {
            key: "rotate2D",
            value: function rotate2D(ang) {
                var at = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : [
                    0,
                    0
                ];
                var m = Mat.rotateAt2DMatrix(Math.cos(ang), Math.sin(ang), at);
                this._33 = Mat.multiply(this._33, m);
                return this;
            }
        },
        {
            key: "translate2D",
            value: function translate2D(val) {
                var m = Mat.translate2DMatrix(val[0] || 0, val[1] || 0);
                this._33 = Mat.multiply(this._33, m);
                return this;
            }
        },
        {
            key: "shear2D",
            value: function shear2D(val) {
                var at = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : [
                    0,
                    0
                ];
                var m = Mat.shearAt2DMatrix(Math.tan(val[0] || 0), Math.tan(val[1] || 1), at);
                this._33 = Mat.multiply(this._33, m);
                return this;
            }
        }
    ], [
        {
            key: "add",
            value: function add(a, b) {
                if (typeof b != "number") {
                    if (a[0].length != b[0].length) throw new Error("Cannot add matrix if rows' and columns' size don't match.");
                    if (a.length != b.length) throw new Error("Cannot add matrix if rows' and columns' size don't match.");
                }
                var g = new Group();
                var isNum = typeof b == "number";
                for(var i = 0, len = a.length; i < len; i++){
                    g.push(a[i].$add(isNum ? b : b[i]));
                }
                return g;
            }
        },
        {
            key: "multiply",
            value: function multiply(a, b) {
                var transposed = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false, elementwise = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : false;
                var g = new Group();
                if (typeof b != "number") {
                    if (elementwise) {
                        if (a.length != b.length) throw new Error("Cannot multiply matrix element-wise because the matrices' sizes don't match.");
                        for(var ai = 0, alen = a.length; ai < alen; ai++){
                            g.push(a[ai].$multiply(b[ai]));
                        }
                    } else {
                        if (!transposed && a[0].length != b.length) throw new Error("Cannot multiply matrix if rows in matrix-a don't match columns in matrix-b.");
                        if (transposed && a[0].length != b[0].length) throw new Error("Cannot multiply matrix if transposed and the columns in both matrices don't match.");
                        if (!transposed) b = Mat.transpose(b);
                        for(var ai1 = 0, alen1 = a.length; ai1 < alen1; ai1++){
                            var p = Pt.make(b.length, 0);
                            for(var bi = 0, blen = b.length; bi < blen; bi++){
                                p[bi] = Vec.dot(a[ai1], b[bi]);
                            }
                            g.push(p);
                        }
                    }
                } else {
                    for(var ai2 = 0, alen2 = a.length; ai2 < alen2; ai2++){
                        g.push(a[ai2].$multiply(b));
                    }
                }
                return g;
            }
        },
        {
            key: "zipSlice",
            value: function zipSlice(g, index) {
                var defaultValue = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
                var z = [];
                for(var i = 0, len = g.length; i < len; i++){
                    if (g[i].length - 1 < index && defaultValue === false) throw "Index ".concat(index, " is out of bounds");
                    z.push(g[i][index] || defaultValue);
                }
                return new Pt(z);
            }
        },
        {
            key: "zip",
            value: function zip(g) {
                var defaultValue = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false, useLongest = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
                var ps = new Group();
                var len = useLongest ? g.reduce(function(a, b) {
                    return Math.max(a, b.length);
                }, 0) : g[0].length;
                for(var i = 0; i < len; i++){
                    ps.push(Mat.zipSlice(g, i, defaultValue));
                }
                return ps;
            }
        },
        {
            key: "transpose",
            value: function transpose(g) {
                var defaultValue = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false, useLongest = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
                return Mat.zip(g, defaultValue, useLongest);
            }
        },
        {
            key: "toDOMMatrix",
            value: function toDOMMatrix(m) {
                return [
                    m[0][0],
                    m[0][1],
                    m[1][0],
                    m[1][1],
                    m[2][0],
                    m[2][1]
                ];
            }
        },
        {
            key: "transform2D",
            value: function transform2D(pt, m) {
                var x = pt[0] * m[0][0] + pt[1] * m[1][0] + m[2][0];
                var y = pt[0] * m[0][1] + pt[1] * m[1][1] + m[2][1];
                return new Pt(x, y);
            }
        },
        {
            key: "scale2DMatrix",
            value: function scale2DMatrix(x, y) {
                return new Group(new Pt(x, 0, 0), new Pt(0, y, 0), new Pt(0, 0, 1));
            }
        },
        {
            key: "rotate2DMatrix",
            value: function rotate2DMatrix(cosA, sinA) {
                return new Group(new Pt(cosA, sinA, 0), new Pt(-sinA, cosA, 0), new Pt(0, 0, 1));
            }
        },
        {
            key: "shear2DMatrix",
            value: function shear2DMatrix(tanX, tanY) {
                return new Group(new Pt(1, tanX, 0), new Pt(tanY, 1, 0), new Pt(0, 0, 1));
            }
        },
        {
            key: "translate2DMatrix",
            value: function translate2DMatrix(x, y) {
                return new Group(new Pt(1, 0, 0), new Pt(0, 1, 0), new Pt(x, y, 1));
            }
        },
        {
            key: "scaleAt2DMatrix",
            value: function scaleAt2DMatrix(sx, sy, at) {
                var m = Mat.scale2DMatrix(sx, sy);
                m[2][0] = -at[0] * sx + at[0];
                m[2][1] = -at[1] * sy + at[1];
                return m;
            }
        },
        {
            key: "rotateAt2DMatrix",
            value: function rotateAt2DMatrix(cosA, sinA, at) {
                var m = Mat.rotate2DMatrix(cosA, sinA);
                m[2][0] = at[0] * (1 - cosA) + at[1] * sinA;
                m[2][1] = at[1] * (1 - cosA) - at[0] * sinA;
                return m;
            }
        },
        {
            key: "shearAt2DMatrix",
            value: function shearAt2DMatrix(tanX, tanY, at) {
                var m = Mat.shear2DMatrix(tanX, tanY);
                m[2][0] = -at[1] * tanY;
                m[2][1] = -at[0] * tanX;
                return m;
            }
        },
        {
            key: "reflectAt2DMatrix",
            value: function reflectAt2DMatrix(p1, p2) {
                var intercept = Line.intercept(p1, p2);
                if (intercept == void 0) {
                    return [
                        new Pt([
                            -1,
                            0,
                            0
                        ]),
                        new Pt([
                            0,
                            1,
                            0
                        ]),
                        new Pt([
                            p1[0] + p2[0],
                            0,
                            1
                        ])
                    ];
                } else {
                    var yi = intercept.yi;
                    var ang2 = Math.atan(intercept.slope) * 2;
                    var cosA = Math.cos(ang2);
                    var sinA = Math.sin(ang2);
                    return [
                        new Pt([
                            cosA,
                            sinA,
                            0
                        ]),
                        new Pt([
                            sinA,
                            -cosA,
                            0
                        ]),
                        new Pt([
                            -yi * sinA,
                            yi + yi * cosA,
                            1
                        ])
                    ];
                }
            }
        }
    ]);
    return Mat1;
}();
// src/Op.ts
var _errorLength = function(obj) {
    var param = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "expected";
    return Util.warn("Group's length is less than " + param, obj);
};
var _errorOutofBound = function(obj) {
    var param = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
    return Util.warn("Index ".concat(param, " is out of bound in Group"), obj);
};
var Line = /*#__PURE__*/ function() {
    "use strict";
    function Line1() {
        _classCallCheck(this, Line1);
    }
    _createClass(Line1, null, [
        {
            key: "fromAngle",
            value: function fromAngle(anchor, angle, magnitude) {
                var g = new Group(new Pt(anchor), new Pt(anchor));
                g[1].toAngle(angle, magnitude, true);
                return g;
            }
        },
        {
            key: "slope",
            value: function slope(p1, p2) {
                return p2[0] - p1[0] === 0 ? void 0 : (p2[1] - p1[1]) / (p2[0] - p1[0]);
            }
        },
        {
            key: "intercept",
            value: function intercept(p1, p2) {
                if (p2[0] - p1[0] === 0) {
                    return void 0;
                } else {
                    var m = (p2[1] - p1[1]) / (p2[0] - p1[0]);
                    var c = p1[1] - m * p1[0];
                    return {
                        slope: m,
                        yi: c,
                        xi: m === 0 ? void 0 : -c / m
                    };
                }
            }
        },
        {
            key: "sideOfPt2D",
            value: function sideOfPt2D(line, pt) {
                var _line = Util.iterToArray(line);
                return (_line[1][0] - _line[0][0]) * (pt[1] - _line[0][1]) - (pt[0] - _line[0][0]) * (_line[1][1] - _line[0][1]);
            }
        },
        {
            key: "collinear",
            value: function collinear(p1, p2, p3) {
                var threshold = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 0.01;
                var a = new Pt(0, 0, 0).to(p1).$subtract(p2);
                var b = new Pt(0, 0, 0).to(p1).$subtract(p3);
                return a.$cross(b).divide(1e3).equals(new Pt(0, 0, 0), threshold);
            }
        },
        {
            key: "magnitude",
            value: function magnitude(line) {
                var _line = Util.iterToArray(line);
                return _line.length >= 2 ? _line[1].$subtract(_line[0]).magnitude() : 0;
            }
        },
        {
            key: "magnitudeSq",
            value: function magnitudeSq(line) {
                var _line = Util.iterToArray(line);
                return _line.length >= 2 ? _line[1].$subtract(_line[0]).magnitudeSq() : 0;
            }
        },
        {
            key: "perpendicularFromPt",
            value: function perpendicularFromPt(line, pt) {
                var asProjection = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
                var _line = Util.iterToArray(line);
                if (_line[0].equals(_line[1])) return void 0;
                var a = _line[0].$subtract(_line[1]);
                var b = _line[1].$subtract(pt);
                var proj = b.$subtract(a.$project(b));
                return asProjection ? proj : proj.$add(pt);
            }
        },
        {
            key: "distanceFromPt",
            value: function distanceFromPt(line, pt) {
                var _line = Util.iterToArray(line);
                var projectionVector = Line.perpendicularFromPt(_line, pt, true);
                if (projectionVector) {
                    return projectionVector.magnitude();
                } else {
                    return _line[0].$subtract(pt).magnitude();
                }
            }
        },
        {
            key: "intersectRay2D",
            value: function intersectRay2D(la, lb) {
                var _la = Util.iterToArray(la);
                var _lb = Util.iterToArray(lb);
                var a = Line.intercept(_la[0], _la[1]);
                var b = Line.intercept(_lb[0], _lb[1]);
                var pa = _la[0];
                var pb = _lb[0];
                if (a == void 0) {
                    if (b == void 0) return void 0;
                    var y1 = -b.slope * (pb[0] - pa[0]) + pb[1];
                    return new Pt(pa[0], y1);
                } else {
                    if (b == void 0) {
                        var y11 = -a.slope * (pa[0] - pb[0]) + pa[1];
                        return new Pt(pb[0], y11);
                    } else if (b.slope != a.slope) {
                        var px = (a.slope * pa[0] - b.slope * pb[0] + pb[1] - pa[1]) / (a.slope - b.slope);
                        var py = a.slope * (px - pa[0]) + pa[1];
                        return new Pt(px, py);
                    } else {
                        if (a.yi == b.yi) {
                            return new Pt(pa[0], pa[1]);
                        } else {
                            return void 0;
                        }
                    }
                }
            }
        },
        {
            key: "intersectLine2D",
            value: function intersectLine2D(la, lb) {
                var _la = Util.iterToArray(la);
                var _lb = Util.iterToArray(lb);
                var pt = Line.intersectRay2D(_la, _lb);
                return pt && Geom.withinBound(pt, _la[0], _la[1]) && Geom.withinBound(pt, _lb[0], _lb[1]) ? pt : void 0;
            }
        },
        {
            key: "intersectLineWithRay2D",
            value: function intersectLineWithRay2D(line, ray) {
                var _line = Util.iterToArray(line);
                var _ray = Util.iterToArray(ray);
                var pt = Line.intersectRay2D(_line, _ray);
                return pt && Geom.withinBound(pt, _line[0], _line[1]) ? pt : void 0;
            }
        },
        {
            key: "intersectPolygon2D",
            value: function intersectPolygon2D(lineOrRay, poly) {
                var sourceIsRay = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
                var _lineOrRay = Util.iterToArray(lineOrRay);
                var _poly = Util.iterToArray(poly);
                var fn = sourceIsRay ? Line.intersectLineWithRay2D : Line.intersectLine2D;
                var pts = new Group();
                for(var i = 0, len = _poly.length; i < len; i++){
                    var next = i === len - 1 ? 0 : i + 1;
                    var d = fn([
                        _poly[i],
                        _poly[next]
                    ], _lineOrRay);
                    if (d) pts.push(d);
                }
                return pts.length > 0 ? pts : void 0;
            }
        },
        {
            key: "intersectLines2D",
            value: function intersectLines2D(lines1, lines2) {
                var isRay = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
                var group = new Group();
                var fn = isRay ? Line.intersectLineWithRay2D : Line.intersectLine2D;
                var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
                try {
                    for(var _iterator = lines1[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
                        var l1 = _step.value;
                        var _iteratorNormalCompletion1 = true, _didIteratorError1 = false, _iteratorError1 = undefined;
                        try {
                            for(var _iterator1 = lines2[Symbol.iterator](), _step1; !(_iteratorNormalCompletion1 = (_step1 = _iterator1.next()).done); _iteratorNormalCompletion1 = true){
                                var l2 = _step1.value;
                                var _ip = fn(l1, l2);
                                if (_ip) group.push(_ip);
                            }
                        } catch (err) {
                            _didIteratorError1 = true;
                            _iteratorError1 = err;
                        } finally{
                            try {
                                if (!_iteratorNormalCompletion1 && _iterator1.return != null) {
                                    _iterator1.return();
                                }
                            } finally{
                                if (_didIteratorError1) {
                                    throw _iteratorError1;
                                }
                            }
                        }
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally{
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return != null) {
                            _iterator.return();
                        }
                    } finally{
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
                return group;
            }
        },
        {
            key: "intersectGridWithRay2D",
            value: function intersectGridWithRay2D(ray, gridPt) {
                var _ray = Util.iterToArray(ray);
                var t = Line.intercept(new Pt(_ray[0]).subtract(gridPt), new Pt(_ray[1]).subtract(gridPt));
                var g = new Group();
                if (t && t.xi) g.push(new Pt(gridPt[0] + t.xi, gridPt[1]));
                if (t && t.yi) g.push(new Pt(gridPt[0], gridPt[1] + t.yi));
                return g;
            }
        },
        {
            key: "intersectGridWithLine2D",
            value: function intersectGridWithLine2D(line, gridPt) {
                var _line = Util.iterToArray(line);
                var g = Line.intersectGridWithRay2D(_line, gridPt);
                var gg = new Group();
                for(var i = 0, len = g.length; i < len; i++){
                    if (Geom.withinBound(g[i], _line[0], _line[1])) gg.push(g[i]);
                }
                return gg;
            }
        },
        {
            key: "intersectRect2D",
            value: function intersectRect2D(line, rect) {
                var _line = Util.iterToArray(line);
                var _rect = Util.iterToArray(rect);
                var box = Geom.boundingBox(Group.fromPtArray(_line));
                if (!Rectangle.hasIntersectRect2D(box, _rect)) return new Group();
                return Line.intersectLines2D([
                    _line
                ], Rectangle.sides(_rect));
            }
        },
        {
            key: "subpoints",
            value: function subpoints(line, num) {
                var _line = Util.iterToArray(line);
                var pts = new Group();
                for(var i = 1; i <= num; i++){
                    pts.push(Geom.interpolate(_line[0], _line[1], i / (num + 1)));
                }
                return pts;
            }
        },
        {
            key: "crop",
            value: function crop(line, size) {
                var index = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 0, cropAsCircle = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : true;
                var _line = Util.iterToArray(line);
                var tdx = index === 0 ? 1 : 0;
                var ls = _line[tdx].$subtract(_line[index]);
                if (ls[0] === 0 || size[0] === 0) return _line[index];
                if (cropAsCircle) {
                    var d = ls.unit().multiply(size[1]);
                    return _line[index].$add(d);
                } else {
                    var rect = Rectangle.fromCenter(_line[index], size);
                    var sides = Rectangle.sides(rect);
                    var sideIdx = 0;
                    if (Math.abs(ls[1] / ls[0]) > Math.abs(size[1] / size[0])) {
                        sideIdx = ls[1] < 0 ? 0 : 2;
                    } else {
                        sideIdx = ls[0] < 0 ? 3 : 1;
                    }
                    return Line.intersectRay2D(sides[sideIdx], _line);
                }
            }
        },
        {
            key: "marker",
            value: function marker(line, size) {
                var graphic = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "arrow", atTail = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : true;
                var _line = Util.iterToArray(line);
                var h = atTail ? 0 : 1;
                var t = atTail ? 1 : 0;
                var unit = _line[h].$subtract(_line[t]);
                if (unit.magnitudeSq() === 0) return new Group();
                unit.unit();
                var ps = Geom.perpendicular(unit).multiply(size[0]).add(_line[t]);
                if (graphic == "arrow") {
                    ps.add(unit.$multiply(size[1]));
                    return new Group(_line[t], ps[0], ps[1]);
                } else {
                    return new Group(ps[0], ps[1]);
                }
            }
        },
        {
            key: "toRect",
            value: function toRect(line) {
                var _line = Util.iterToArray(line);
                return new Group(_line[0].$min(_line[1]), _line[0].$max(_line[1]));
            }
        }
    ]);
    return Line1;
}();
var Rectangle = /*#__PURE__*/ function() {
    "use strict";
    function Rectangle1() {
        _classCallCheck(this, Rectangle1);
    }
    _createClass(Rectangle1, null, [
        {
            key: "from",
            value: function from(topLeft, widthOrSize, height) {
                return Rectangle.fromTopLeft(topLeft, widthOrSize, height);
            }
        },
        {
            key: "fromTopLeft",
            value: function fromTopLeft(topLeft, widthOrSize, height) {
                var size = typeof widthOrSize == "number" ? [
                    widthOrSize,
                    height || widthOrSize
                ] : widthOrSize;
                return new Group(new Pt(topLeft), new Pt(topLeft).add(size));
            }
        },
        {
            key: "fromCenter",
            value: function fromCenter(center, widthOrSize, height) {
                var half = typeof widthOrSize == "number" ? [
                    widthOrSize / 2,
                    (height || widthOrSize) / 2
                ] : new Pt(widthOrSize).divide(2);
                return new Group(new Pt(center).subtract(half), new Pt(center).add(half));
            }
        },
        {
            key: "toCircle",
            value: function toCircle(pts) {
                var within = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : true;
                return Circle.fromRect(pts, within);
            }
        },
        {
            key: "toSquare",
            value: function toSquare(pts) {
                var enclose = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
                var _pts = Util.iterToArray(pts);
                var s = Rectangle.size(_pts);
                var m = enclose ? s.maxValue().value : s.minValue().value;
                return Rectangle.fromCenter(Rectangle.center(_pts), m, m);
            }
        },
        {
            key: "size",
            value: function size(pts) {
                var p = Util.iterToArray(pts);
                return p[0].$max(p[1]).subtract(p[0].$min(p[1]));
            }
        },
        {
            key: "center",
            value: function center(pts) {
                var p = Util.iterToArray(pts);
                var min = p[0].$min(p[1]);
                var max = p[0].$max(p[1]);
                return min.add(max.$subtract(min).divide(2));
            }
        },
        {
            key: "corners",
            value: function corners(rect) {
                var _rect = Util.iterToArray(rect);
                var p0 = _rect[0].$min(_rect[1]);
                var p2 = _rect[0].$max(_rect[1]);
                return new Group(p0, new Pt(p2.x, p0.y), p2, new Pt(p0.x, p2.y));
            }
        },
        {
            key: "sides",
            value: function sides(rect) {
                var ref = _slicedToArray(Rectangle.corners(rect), 4), p0 = ref[0], p1 = ref[1], p2 = ref[2], p3 = ref[3];
                return [
                    new Group(p0, p1),
                    new Group(p1, p2),
                    new Group(p2, p3),
                    new Group(p3, p0)
                ];
            }
        },
        {
            key: "boundingBox",
            value: function boundingBox(rects) {
                var _rects = Util.iterToArray(rects);
                var merged = Util.flatten(_rects, false);
                var min = Pt.make(2, Number.MAX_VALUE);
                var max = Pt.make(2, Number.MIN_VALUE);
                for(var i = 0, len = merged.length; i < len; i++){
                    var k = 0;
                    var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
                    try {
                        for(var _iterator = merged[i][Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
                            var m = _step.value;
                            min[k] = Math.min(min[k], m[k]);
                            max[k] = Math.max(max[k], m[k]);
                            if (++k >= 2) break;
                        }
                    } catch (err) {
                        _didIteratorError = true;
                        _iteratorError = err;
                    } finally{
                        try {
                            if (!_iteratorNormalCompletion && _iterator.return != null) {
                                _iterator.return();
                            }
                        } finally{
                            if (_didIteratorError) {
                                throw _iteratorError;
                            }
                        }
                    }
                }
                return new Group(min, max);
            }
        },
        {
            key: "polygon",
            value: function polygon(rect) {
                return Rectangle.corners(rect);
            }
        },
        {
            key: "quadrants",
            value: function quadrants(rect, center) {
                var _rect = Util.iterToArray(rect);
                var corners = Rectangle.corners(_rect);
                var _center = center != void 0 ? new Pt(center) : Rectangle.center(_rect);
                return corners.map(function(c) {
                    return new Group(c, _center).boundingBox();
                });
            }
        },
        {
            key: "halves",
            value: function halves(rect) {
                var ratio = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0.5, asRows = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
                var _rect = Util.iterToArray(rect);
                var min = _rect[0].$min(_rect[1]);
                var max = _rect[0].$max(_rect[1]);
                var mid = asRows ? Num.lerp(min[1], max[1], ratio) : Num.lerp(min[0], max[0], ratio);
                return asRows ? [
                    new Group(min, new Pt(max[0], mid)),
                    new Group(new Pt(min[0], mid), max)
                ] : [
                    new Group(min, new Pt(mid, max[1])),
                    new Group(new Pt(mid, min[1]), max)
                ];
            }
        },
        {
            key: "withinBound",
            value: function withinBound(rect, pt) {
                var _rect = Util.iterToArray(rect);
                return Geom.withinBound(pt, _rect[0], _rect[1]);
            }
        },
        {
            key: "hasIntersectRect2D",
            value: function hasIntersectRect2D(rect1, rect2) {
                var resetBoundingBox = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
                var _rect1 = Util.iterToArray(rect1);
                var _rect2 = Util.iterToArray(rect2);
                if (resetBoundingBox) {
                    _rect1 = Geom.boundingBox(_rect1);
                    _rect2 = Geom.boundingBox(_rect2);
                }
                if (_rect1[0][0] > _rect2[1][0] || _rect2[0][0] > _rect1[1][0]) return false;
                if (_rect1[0][1] > _rect2[1][1] || _rect2[0][1] > _rect1[1][1]) return false;
                return true;
            }
        },
        {
            key: "intersectRect2D",
            value: function intersectRect2D(rect1, rect2) {
                var _rect1 = Util.iterToArray(rect1);
                var _rect2 = Util.iterToArray(rect2);
                if (!Rectangle.hasIntersectRect2D(_rect1, _rect2)) return new Group();
                return Line.intersectLines2D(Rectangle.sides(_rect1), Rectangle.sides(_rect2));
            }
        }
    ]);
    return Rectangle1;
}();
var Circle = /*#__PURE__*/ function() {
    "use strict";
    function Circle1() {
        _classCallCheck(this, Circle1);
    }
    _createClass(Circle1, null, [
        {
            key: "fromRect",
            value: function fromRect(pts) {
                var enclose = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
                var _pts = Util.iterToArray(pts);
                var r = 0;
                var min = r = Rectangle.size(_pts).minValue().value / 2;
                if (enclose) {
                    var max = Rectangle.size(_pts).maxValue().value / 2;
                    r = Math.sqrt(min * min + max * max);
                } else {
                    r = min;
                }
                return new Group(Rectangle.center(_pts), new Pt(r, r));
            }
        },
        {
            key: "fromTriangle",
            value: function fromTriangle(pts) {
                var enclose = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
                if (enclose) {
                    return Triangle.circumcircle(pts);
                } else {
                    return Triangle.incircle(pts);
                }
            }
        },
        {
            key: "fromCenter",
            value: function fromCenter(pt, radius) {
                return new Group(new Pt(pt), new Pt(radius, radius));
            }
        },
        {
            key: "withinBound",
            value: function withinBound(pts, pt) {
                var threshold = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 0;
                var _pts = Util.iterToArray(pts);
                var d = _pts[0].$subtract(pt);
                return d.dot(d) + threshold < _pts[1].x * _pts[1].x;
            }
        },
        {
            key: "intersectRay2D",
            value: function intersectRay2D(circle, ray) {
                var _pts = Util.iterToArray(circle);
                var _ray = Util.iterToArray(ray);
                var d = _ray[0].$subtract(_ray[1]);
                var f = _pts[0].$subtract(_ray[0]);
                var a = d.dot(d);
                var b = f.dot(d);
                var c = f.dot(f) - _pts[1].x * _pts[1].x;
                var p = b / a;
                var q = c / a;
                var disc = p * p - q;
                if (disc < 0) {
                    return new Group();
                } else {
                    var discSqrt = Math.sqrt(disc);
                    var t1 = -p + discSqrt;
                    var p1 = _ray[0].$subtract(d.$multiply(t1));
                    if (disc === 0) return new Group(p1);
                    var t2 = -p - discSqrt;
                    var p2 = _ray[0].$subtract(d.$multiply(t2));
                    return new Group(p1, p2);
                }
            }
        },
        {
            key: "intersectLine2D",
            value: function intersectLine2D(circle, line) {
                var _pts = Util.iterToArray(circle);
                var _line = Util.iterToArray(line);
                var ps = Circle.intersectRay2D(_pts, _line);
                var g = new Group();
                if (ps.length > 0) {
                    for(var i = 0, len = ps.length; i < len; i++){
                        if (Rectangle.withinBound(_line, ps[i])) g.push(ps[i]);
                    }
                }
                return g;
            }
        },
        {
            key: "intersectCircle2D",
            value: function intersectCircle2D(circle1, circle2) {
                var _pts = Util.iterToArray(circle1);
                var _circle = Util.iterToArray(circle2);
                var dv = _circle[0].$subtract(_pts[0]);
                var dr2 = dv.magnitudeSq();
                var dr = Math.sqrt(dr2);
                var ar = _pts[1].x;
                var br = _circle[1].x;
                var ar2 = ar * ar;
                var br2 = br * br;
                if (dr > ar + br) {
                    return new Group();
                } else if (dr < Math.abs(ar - br)) {
                    return new Group(_pts[0].clone());
                } else {
                    var a = (ar2 - br2 + dr2) / (2 * dr);
                    var h = Math.sqrt(ar2 - a * a);
                    var p = dv.$multiply(a / dr).add(_pts[0]);
                    return new Group(new Pt(p.x + h * dv.y / dr, p.y - h * dv.x / dr), new Pt(p.x - h * dv.y / dr, p.y + h * dv.x / dr));
                }
            }
        },
        {
            key: "intersectRect2D",
            value: function intersectRect2D(circle, rect) {
                var _pts = Util.iterToArray(circle);
                var _rect = Util.iterToArray(rect);
                var sides = Rectangle.sides(_rect);
                var g = [];
                for(var i = 0, len = sides.length; i < len; i++){
                    var ps = Circle.intersectLine2D(_pts, sides[i]);
                    if (ps.length > 0) g.push(ps);
                }
                return Util.flatten(g);
            }
        },
        {
            key: "toRect",
            value: function toRect(circle) {
                var within = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
                var _pts = Util.iterToArray(circle);
                var r = _pts[1][0];
                if (within) {
                    var half = Math.sqrt(r * r) / 2;
                    return new Group(_pts[0].$subtract(half), _pts[0].$add(half));
                } else {
                    return new Group(_pts[0].$subtract(r), _pts[0].$add(r));
                }
            }
        },
        {
            key: "toTriangle",
            value: function toTriangle(circle) {
                var within = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : true;
                var _pts = Util.iterToArray(circle);
                if (within) {
                    var ang = -Math.PI / 2;
                    var inc = Math.PI * 2 / 3;
                    var g = new Group();
                    for(var i = 0; i < 3; i++){
                        g.push(_pts[0].clone().toAngle(ang, _pts[1][0], true));
                        ang += inc;
                    }
                    return g;
                } else {
                    return Triangle.fromCenter(_pts[0], _pts[1][0]);
                }
            }
        }
    ]);
    return Circle1;
}();
var Triangle = /*#__PURE__*/ function() {
    "use strict";
    function Triangle1() {
        _classCallCheck(this, Triangle1);
    }
    _createClass(Triangle1, null, [
        {
            key: "fromRect",
            value: function fromRect(rect) {
                var _rect = Util.iterToArray(rect);
                var top = _rect[0].$add(_rect[1]).divide(2);
                top.y = _rect[0][1];
                var left = _rect[1].clone();
                left.x = _rect[0][0];
                return new Group(top, _rect[1].clone(), left);
            }
        },
        {
            key: "fromCircle",
            value: function fromCircle(circle) {
                return Circle.toTriangle(circle, true);
            }
        },
        {
            key: "fromCenter",
            value: function fromCenter(pt, size) {
                return Triangle.fromCircle(Circle.fromCenter(pt, size));
            }
        },
        {
            key: "medial",
            value: function medial(tri) {
                var _pts = Util.iterToArray(tri);
                if (_pts.length < 3) return _errorLength(new Group(), 3);
                return Polygon.midpoints(_pts, true);
            }
        },
        {
            key: "oppositeSide",
            value: function oppositeSide(tri, index) {
                var _pts = Util.iterToArray(tri);
                if (_pts.length < 3) return _errorLength(new Group(), 3);
                if (index === 0) {
                    return Group.fromPtArray([
                        _pts[1],
                        _pts[2]
                    ]);
                } else if (index === 1) {
                    return Group.fromPtArray([
                        _pts[0],
                        _pts[2]
                    ]);
                } else {
                    return Group.fromPtArray([
                        _pts[0],
                        _pts[1]
                    ]);
                }
            }
        },
        {
            key: "altitude",
            value: function altitude(tri, index) {
                var _pts = Util.iterToArray(tri);
                var opp = Triangle.oppositeSide(_pts, index);
                if (opp.length > 1) {
                    return new Group(_pts[index], Line.perpendicularFromPt(opp, _pts[index]));
                } else {
                    return new Group();
                }
            }
        },
        {
            key: "orthocenter",
            value: function orthocenter(tri) {
                var _pts = Util.iterToArray(tri);
                if (_pts.length < 3) return _errorLength(void 0, 3);
                var a = Triangle.altitude(_pts, 0);
                var b = Triangle.altitude(_pts, 1);
                return Line.intersectRay2D(a, b);
            }
        },
        {
            key: "incenter",
            value: function incenter(tri) {
                var _pts = Util.iterToArray(tri);
                if (_pts.length < 3) return _errorLength(void 0, 3);
                var a = Polygon.bisector(_pts, 0).add(_pts[0]);
                var b = Polygon.bisector(_pts, 1).add(_pts[1]);
                return Line.intersectRay2D(new Group(_pts[0], a), new Group(_pts[1], b));
            }
        },
        {
            key: "incircle",
            value: function incircle(tri, center) {
                var _pts = Util.iterToArray(tri);
                var c = center ? center : Triangle.incenter(_pts);
                var area = Polygon.area(_pts);
                var perim = Polygon.perimeter(_pts, true);
                var r = 2 * area / perim.total;
                return Circle.fromCenter(c, r);
            }
        },
        {
            key: "circumcenter",
            value: function circumcenter(tri) {
                var _pts = Util.iterToArray(tri);
                var md = Triangle.medial(_pts);
                var a = [
                    md[0],
                    Geom.perpendicular(_pts[0].$subtract(md[0])).p1.$add(md[0])
                ];
                var b = [
                    md[1],
                    Geom.perpendicular(_pts[1].$subtract(md[1])).p1.$add(md[1])
                ];
                return Line.intersectRay2D(a, b);
            }
        },
        {
            key: "circumcircle",
            value: function circumcircle(tri, center) {
                var _pts = Util.iterToArray(tri);
                var c = center ? center : Triangle.circumcenter(_pts);
                var r = _pts[0].$subtract(c).magnitude();
                return Circle.fromCenter(c, r);
            }
        }
    ]);
    return Triangle1;
}();
var Polygon = /*#__PURE__*/ function() {
    "use strict";
    function Polygon1() {
        _classCallCheck(this, Polygon1);
    }
    _createClass(Polygon1, null, [
        {
            key: "centroid",
            value: function centroid(pts) {
                return Geom.centroid(pts);
            }
        },
        {
            key: "rectangle",
            value: function rectangle(center, widthOrSize, height) {
                return Rectangle.corners(Rectangle.fromCenter(center, widthOrSize, height));
            }
        },
        {
            key: "fromCenter",
            value: function fromCenter(center, radius, sides) {
                var g = new Group();
                for(var i = 0; i < sides; i++){
                    var ang = Math.PI * 2 * i / sides;
                    g.push(new Pt(Math.cos(ang) * radius, Math.sin(ang) * radius).add(center));
                }
                return g;
            }
        },
        {
            key: "lineAt",
            value: function lineAt(pts, index) {
                var _pts = Util.iterToArray(pts);
                if (index < 0 || index >= _pts.length) throw new Error("index out of the Polygon's range");
                return new Group(_pts[index], index === _pts.length - 1 ? _pts[0] : _pts[index + 1]);
            }
        },
        {
            key: "lines",
            value: function lines(poly) {
                var closePath = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : true;
                var _pts = Util.iterToArray(poly);
                if (_pts.length < 2) return _errorLength(new Group(), 2);
                var sp = Util.split(_pts, 2, 1);
                if (closePath) sp.push(new Group(_pts[_pts.length - 1], _pts[0]));
                return sp.map(function(g) {
                    return g;
                });
            }
        },
        {
            key: "midpoints",
            value: function midpoints(poly) {
                var closePath = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false, t = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 0.5;
                var sides = Polygon.lines(poly, closePath);
                var mids = sides.map(function(s) {
                    return Geom.interpolate(s[0], s[1], t);
                });
                return mids;
            }
        },
        {
            key: "adjacentSides",
            value: function adjacentSides(poly, index) {
                var closePath = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
                var _pts = Util.iterToArray(poly);
                if (_pts.length < 2) return _errorLength(new Group(), 2);
                if (index < 0 || index >= _pts.length) return _errorOutofBound(new Group(), index);
                var gs = [];
                var left = index - 1;
                if (closePath && left < 0) left = _pts.length - 1;
                if (left >= 0) gs.push(new Group(_pts[index], _pts[left]));
                var right = index + 1;
                if (closePath && right > _pts.length - 1) right = 0;
                if (right <= _pts.length - 1) gs.push(new Group(_pts[index], _pts[right]));
                return gs;
            }
        },
        {
            key: "bisector",
            value: function bisector(poly, index) {
                var sides = Polygon.adjacentSides(poly, index, true);
                if (sides.length >= 2) {
                    var a = sides[0][1].$subtract(sides[0][0]).unit();
                    var b = sides[1][1].$subtract(sides[1][0]).unit();
                    return a.add(b).divide(2);
                } else {
                    return void 0;
                }
            }
        },
        {
            key: "perimeter",
            value: function perimeter(poly) {
                var closePath = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
                var lines = Polygon.lines(poly, closePath);
                var mag = 0;
                var p = Pt.make(lines.length, 0);
                for(var i = 0, len = lines.length; i < len; i++){
                    var m = Line.magnitude(lines[i]);
                    mag += m;
                    p[i] = m;
                }
                return {
                    total: mag,
                    segments: p
                };
            }
        },
        {
            key: "area",
            value: function area(pts) {
                var _pts = Util.iterToArray(pts);
                if (_pts.length < 3) return _errorLength(new Group(), 3);
                var det = function(a, b) {
                    return a[0] * b[1] - a[1] * b[0];
                };
                var area1 = 0;
                for(var i = 0, len = _pts.length; i < len; i++){
                    if (i < _pts.length - 1) {
                        area1 += det(_pts[i], _pts[i + 1]);
                    } else {
                        area1 += det(_pts[i], _pts[0]);
                    }
                }
                return Math.abs(area1 / 2);
            }
        },
        {
            key: "convexHull",
            value: function convexHull(pts) {
                var sorted = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
                var _pts = Util.iterToArray(pts);
                if (_pts.length < 3) return _errorLength(new Group(), 3);
                if (!sorted) {
                    _pts = _pts.slice();
                    _pts.sort(function(a, b) {
                        return a[0] - b[0];
                    });
                }
                var left = function(a, b, c) {
                    return (b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1]) > 0;
                };
                var dq = [];
                var bot = _pts.length - 2;
                var top = bot + 3;
                dq[bot] = _pts[2];
                dq[top] = _pts[2];
                if (left(_pts[0], _pts[1], _pts[2])) {
                    dq[bot + 1] = _pts[0];
                    dq[bot + 2] = _pts[1];
                } else {
                    dq[bot + 1] = _pts[1];
                    dq[bot + 2] = _pts[0];
                }
                for(var i = 3, len = _pts.length; i < len; i++){
                    var pt = _pts[i];
                    if (left(dq[bot], dq[bot + 1], pt) && left(dq[top - 1], dq[top], pt)) {
                        continue;
                    }
                    while(!left(dq[bot], dq[bot + 1], pt)){
                        bot += 1;
                    }
                    bot -= 1;
                    dq[bot] = pt;
                    while(!left(dq[top - 1], dq[top], pt)){
                        top -= 1;
                    }
                    top += 1;
                    dq[top] = pt;
                }
                var hull = new Group();
                for(var h = 0; h < top - bot; h++){
                    hull.push(dq[bot + h]);
                }
                return hull;
            }
        },
        {
            key: "network",
            value: function network(poly) {
                var originIndex = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
                var _pts = Util.iterToArray(poly);
                var g = [];
                for(var i = 0, len = _pts.length; i < len; i++){
                    if (i != originIndex) g.push(new Group(_pts[originIndex], _pts[i]));
                }
                return g;
            }
        },
        {
            key: "nearestPt",
            value: function nearestPt(poly, pt) {
                var _near = Number.MAX_VALUE;
                var _item = -1;
                var i = 0;
                var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
                try {
                    for(var _iterator = poly[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
                        var p = _step.value;
                        var d = p.$subtract(pt).magnitudeSq();
                        if (d < _near) {
                            _near = d;
                            _item = i;
                        }
                        i++;
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally{
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return != null) {
                            _iterator.return();
                        }
                    } finally{
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
                return _item;
            }
        },
        {
            key: "projectAxis",
            value: function projectAxis(poly, unitAxis) {
                var _poly = Util.iterToArray(poly);
                var dot = unitAxis.dot(_poly[0]);
                var d = new Pt(dot, dot);
                for(var n = 1, len = _poly.length; n < len; n++){
                    dot = unitAxis.dot(_poly[n]);
                    d = new Pt(Math.min(dot, d[0]), Math.max(dot, d[1]));
                }
                return d;
            }
        },
        {
            key: "_axisOverlap",
            value: function _axisOverlap(poly1, poly2, unitAxis) {
                var pa = Polygon.projectAxis(poly1, unitAxis);
                var pb = Polygon.projectAxis(poly2, unitAxis);
                return pa[0] < pb[0] ? pb[0] - pa[1] : pa[0] - pb[1];
            }
        },
        {
            key: "hasIntersectPoint",
            value: function hasIntersectPoint(poly, pt) {
                var _poly = Util.iterToArray(poly);
                var c = false;
                for(var i = 0, len = _poly.length; i < len; i++){
                    var ln = Polygon.lineAt(_poly, i);
                    if (ln[0][1] > pt[1] != ln[1][1] > pt[1] && pt[0] < (ln[1][0] - ln[0][0]) * (pt[1] - ln[0][1]) / (ln[1][1] - ln[0][1]) + ln[0][0]) {
                        c = !c;
                    }
                }
                return c;
            }
        },
        {
            key: "hasIntersectCircle",
            value: function hasIntersectCircle(poly, circle) {
                var _poly = Util.iterToArray(poly);
                var _circle = Util.iterToArray(circle);
                var info = {
                    which: -1,
                    dist: 0,
                    normal: null,
                    edge: null,
                    vertex: null
                };
                var c = _circle[0];
                var r = _circle[1][0];
                var minDist = Number.MAX_SAFE_INTEGER;
                for(var i = 0, len = _poly.length; i < len; i++){
                    var edge = Polygon.lineAt(_poly, i);
                    var axis = new Pt(edge[0].y - edge[1].y, edge[1].x - edge[0].x).unit();
                    var poly2 = new Group(c.$add(axis.$multiply(r)), c.$subtract(axis.$multiply(r)));
                    var dist = Polygon._axisOverlap(_poly, poly2, axis);
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
                var dir = c.$subtract(Polygon.centroid(_poly)).dot(info.normal);
                if (dir < 0) info.normal.multiply(-1);
                info.dist = minDist;
                info.vertex = c;
                return info;
            }
        },
        {
            key: "hasIntersectPolygon",
            value: function hasIntersectPolygon(poly1, poly2) {
                var _poly1 = Util.iterToArray(poly1);
                var _poly2 = Util.iterToArray(poly2);
                var info = {
                    which: -1,
                    dist: 0,
                    normal: new Pt(),
                    edge: new Group(),
                    vertex: new Pt()
                };
                var minDist = Number.MAX_SAFE_INTEGER;
                for(var i = 0, plen = _poly1.length + _poly2.length; i < plen; i++){
                    var edge = i < _poly1.length ? Polygon.lineAt(_poly1, i) : Polygon.lineAt(_poly2, i - _poly1.length);
                    var axis = new Pt(edge[0].y - edge[1].y, edge[1].x - edge[0].x).unit();
                    var dist = Polygon._axisOverlap(_poly1, _poly2, axis);
                    if (dist > 0) {
                        return null;
                    } else if (Math.abs(dist) < minDist) {
                        info.edge = edge;
                        info.normal = axis;
                        minDist = Math.abs(dist);
                        info.which = i < _poly1.length ? 0 : 1;
                    }
                }
                info.dist = minDist;
                var b1 = info.which === 0 ? _poly2 : _poly1;
                var b2 = info.which === 0 ? _poly1 : _poly2;
                var c1 = Polygon.centroid(b1);
                var c2 = Polygon.centroid(b2);
                var dir = c1.$subtract(c2).dot(info.normal);
                if (dir < 0) info.normal.multiply(-1);
                var smallest = Number.MAX_SAFE_INTEGER;
                for(var i1 = 0, len = b1.length; i1 < len; i1++){
                    var d = info.normal.dot(b1[i1].$subtract(c2));
                    if (d < smallest) {
                        smallest = d;
                        info.vertex = b1[i1];
                    }
                }
                return info;
            }
        },
        {
            key: "intersectPolygon2D",
            value: function intersectPolygon2D(poly1, poly2) {
                var _poly1 = Util.iterToArray(poly1);
                var _poly2 = Util.iterToArray(poly2);
                var lp = Polygon.lines(_poly1);
                var g = [];
                for(var i = 0, len = lp.length; i < len; i++){
                    var ins = Line.intersectPolygon2D(lp[i], _poly2, false);
                    if (ins) g.push(ins);
                }
                return Util.flatten(g, true);
            }
        },
        {
            key: "toRects",
            value: function toRects(polys) {
                var boxes = [];
                var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
                try {
                    for(var _iterator = polys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
                        var g = _step.value;
                        boxes.push(Geom.boundingBox(g));
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally{
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return != null) {
                            _iterator.return();
                        }
                    } finally{
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
                var merged = Util.flatten(boxes, false);
                boxes.unshift(Geom.boundingBox(merged));
                return boxes;
            }
        }
    ]);
    return Polygon1;
}();
var Curve = /*#__PURE__*/ function() {
    "use strict";
    function Curve1() {
        _classCallCheck(this, Curve1);
    }
    _createClass(Curve1, null, [
        {
            key: "getSteps",
            value: function getSteps(steps) {
                var ts = new Group();
                for(var i = 0; i <= steps; i++){
                    var t = i / steps;
                    ts.push(new Pt(t * t * t, t * t, t, 1));
                }
                return ts;
            }
        },
        {
            key: "controlPoints",
            value: function controlPoints(pts) {
                var index = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0, copyStart = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
                var _pts = Util.iterToArray(pts);
                if (index > _pts.length - 1) return new Group();
                var _index = function(i) {
                    return i < _pts.length - 1 ? i : _pts.length - 1;
                };
                var p0 = _pts[index];
                index = copyStart ? index : index + 1;
                return new Group(p0, _pts[_index(index++)], _pts[_index(index++)], _pts[_index(index++)]);
            }
        },
        {
            key: "_calcPt",
            value: function _calcPt(ctrls, params) {
                var x = ctrls.reduce(function(a, c, i) {
                    return a + c.x * params[i];
                }, 0);
                var y = ctrls.reduce(function(a, c, i) {
                    return a + c.y * params[i];
                }, 0);
                if (ctrls[0].length > 2) {
                    var z = ctrls.reduce(function(a, c, i) {
                        return a + c.z * params[i];
                    }, 0);
                    return new Pt(x, y, z);
                }
                return new Pt(x, y);
            }
        },
        {
            key: "catmullRom",
            value: function catmullRom(pts) {
                var steps = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 10;
                var _pts = Util.iterToArray(pts);
                if (_pts.length < 2) return new Group();
                var ps = new Group();
                var ts = Curve.getSteps(steps);
                var c = Curve.controlPoints(_pts, 0, true);
                for(var i = 0; i <= steps; i++){
                    ps.push(Curve.catmullRomStep(ts[i], c));
                }
                var k = 0;
                while(k < _pts.length - 2){
                    var cp = Curve.controlPoints(_pts, k);
                    if (cp.length > 0) {
                        for(var i1 = 0; i1 <= steps; i1++){
                            ps.push(Curve.catmullRomStep(ts[i1], cp));
                        }
                        k++;
                    }
                }
                return ps;
            }
        },
        {
            key: "catmullRomStep",
            value: function catmullRomStep(step, ctrls) {
                var m = new Group(new Pt(-0.5, 1, -0.5, 0), new Pt(1.5, -2.5, 0, 1), new Pt(-1.5, 2, 0.5, 0), new Pt(0.5, -0.5, 0, 0));
                return Curve._calcPt(ctrls, Mat.multiply([
                    step
                ], m, true)[0]);
            }
        },
        {
            key: "cardinal",
            value: function cardinal(pts) {
                var steps = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 10, tension = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 0.5;
                var _pts = Util.iterToArray(pts);
                if (_pts.length < 2) return new Group();
                var ps = new Group();
                var ts = Curve.getSteps(steps);
                var c = Curve.controlPoints(_pts, 0, true);
                for(var i = 0; i <= steps; i++){
                    ps.push(Curve.cardinalStep(ts[i], c, tension));
                }
                var k = 0;
                while(k < _pts.length - 2){
                    var cp = Curve.controlPoints(_pts, k);
                    if (cp.length > 0) {
                        for(var i1 = 0; i1 <= steps; i1++){
                            ps.push(Curve.cardinalStep(ts[i1], cp, tension));
                        }
                        k++;
                    }
                }
                return ps;
            }
        },
        {
            key: "cardinalStep",
            value: function cardinalStep(step, ctrls) {
                var tension = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 0.5;
                var m = new Group(new Pt(-1, 2, -1, 0), new Pt(-1, 1, 0, 0), new Pt(1, -2, 1, 0), new Pt(1, -1, 0, 0));
                var h = Mat.multiply([
                    step
                ], m, true)[0].multiply(tension);
                var h2 = 2 * step[0] - 3 * step[1] + 1;
                var h3 = -2 * step[0] + 3 * step[1];
                var pt = Curve._calcPt(ctrls, h);
                pt.x += h2 * ctrls[1].x + h3 * ctrls[2].x;
                pt.y += h2 * ctrls[1].y + h3 * ctrls[2].y;
                if (pt.length > 2) pt.z += h2 * ctrls[1].z + h3 * ctrls[2].z;
                return pt;
            }
        },
        {
            key: "bezier",
            value: function bezier(pts) {
                var steps = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 10;
                var _pts = Util.iterToArray(pts);
                if (_pts.length < 4) return new Group();
                var ps = new Group();
                var ts = Curve.getSteps(steps);
                var k = 0;
                while(k < _pts.length - 3){
                    var c = Curve.controlPoints(_pts, k);
                    if (c.length > 0) {
                        for(var i = 0; i <= steps; i++){
                            ps.push(Curve.bezierStep(ts[i], c));
                        }
                        k += 3;
                    }
                }
                return ps;
            }
        },
        {
            key: "bezierStep",
            value: function bezierStep(step, ctrls) {
                var m = new Group(new Pt(-1, 3, -3, 1), new Pt(3, -6, 3, 0), new Pt(-3, 3, 0, 0), new Pt(1, 0, 0, 0));
                return Curve._calcPt(ctrls, Mat.multiply([
                    step
                ], m, true)[0]);
            }
        },
        {
            key: "bspline",
            value: function bspline(pts) {
                var steps = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 10, tension = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 1;
                var _pts = Util.iterToArray(pts);
                if (_pts.length < 2) return new Group();
                var ps = new Group();
                var ts = Curve.getSteps(steps);
                var k = 0;
                while(k < _pts.length - 3){
                    var c = Curve.controlPoints(_pts, k);
                    if (c.length > 0) {
                        if (tension !== 1) {
                            for(var i = 0; i <= steps; i++){
                                ps.push(Curve.bsplineTensionStep(ts[i], c, tension));
                            }
                        } else {
                            for(var i1 = 0; i1 <= steps; i1++){
                                ps.push(Curve.bsplineStep(ts[i1], c));
                            }
                        }
                        k++;
                    }
                }
                return ps;
            }
        },
        {
            key: "bsplineStep",
            value: function bsplineStep(step, ctrls) {
                var m = new Group(new Pt(-0.16666666666666666, 0.5, -0.5, 0.16666666666666666), new Pt(0.5, -1, 0, 0.6666666666666666), new Pt(-0.5, 0.5, 0.5, 0.16666666666666666), new Pt(0.16666666666666666, 0, 0, 0));
                return Curve._calcPt(ctrls, Mat.multiply([
                    step
                ], m, true)[0]);
            }
        },
        {
            key: "bsplineTensionStep",
            value: function bsplineTensionStep(step, ctrls) {
                var tension = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 1;
                var m = new Group(new Pt(-0.16666666666666666, 0.5, -0.5, 0.16666666666666666), new Pt(-1.5, 2, 0, -0.3333333333333333), new Pt(1.5, -2.5, 0.5, 0.16666666666666666), new Pt(0.16666666666666666, 0, 0, 0));
                var h = Mat.multiply([
                    step
                ], m, true)[0].multiply(tension);
                var h2 = 2 * step[0] - 3 * step[1] + 1;
                var h3 = -2 * step[0] + 3 * step[1];
                var pt = Curve._calcPt(ctrls, h);
                pt.x += h2 * ctrls[1].x + h3 * ctrls[2].x;
                pt.y += h2 * ctrls[1].y + h3 * ctrls[2].y;
                if (pt.length > 2) pt.z += h2 * ctrls[1].z + h3 * ctrls[2].z;
                return pt;
            }
        }
    ]);
    return Curve1;
}();
// src/uheprng.ts
function Mash() {
    var n = 4022871197;
    var mash = function mash(data) {
        if (data) {
            data = data.toString();
            for(var i = 0; i < data.length; i++){
                n += data.charCodeAt(i);
                var h = 0.02519603282416938 * n;
                n = h >>> 0;
                h -= n;
                h *= n;
                n = h >>> 0;
                h -= n;
                n += h * 4294967296;
            }
            return (n >>> 0) * 23283064365386963e-26;
        } else n = 4022871197;
    };
    return mash;
}
function uheprng_default(seed) {
    var initState = function initState() {
        mash();
        for(i = 0; i < o; i++)s[i] = mash(" ");
        c = 1;
        p = o;
    };
    var cleanString = function cleanString(inStr) {
        inStr = inStr.replace(/(^\s*)|(\s*$)/gi, "");
        inStr = inStr.replace(/[\x00-\x1F]/gi, "");
        inStr = inStr.replace(/\n /, "\n");
        return inStr;
    };
    var hashString = function hashString(inStr) {
        inStr = cleanString(inStr);
        mash(inStr);
        for(i = 0; i < inStr.length; i++){
            k = inStr.charCodeAt(i);
            for(j = 0; j < o; j++){
                s[j] -= mash(k.toString());
                if (s[j] < 0) s[j] += 1;
            }
        }
    };
    var o = 48;
    var c = 1;
    var p = o;
    var s = new Array(o);
    var i, j, k = 0;
    var mash = Mash();
    for(i = 0; i < o; i++)s[i] = mash(Math.random().toString());
    initState();
    hashString(seed);
    return {
        random: function random() {
            if (++p >= o) p = 0;
            var t = 1768863 * s[p] + c * 23283064365386963e-26;
            return s[p] = t - (c = t | 0);
        }
    };
}
// src/Num.ts
var Num = /*#__PURE__*/ function() {
    "use strict";
    function Num1() {
        _classCallCheck(this, Num1);
    }
    _createClass(Num1, null, [
        {
            key: "equals",
            value: function equals(a, b) {
                var threshold = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 1e-5;
                return Math.abs(a - b) < threshold;
            }
        },
        {
            key: "lerp",
            value: function lerp(a, b, t) {
                return (1 - t) * a + t * b;
            }
        },
        {
            key: "clamp",
            value: function clamp(val, min, max) {
                return Math.max(min, Math.min(max, val));
            }
        },
        {
            key: "boundValue",
            value: function boundValue(val, min, max) {
                var len = Math.abs(max - min);
                var a = val % len;
                if (a > max) a -= len;
                else if (a < min) a += len;
                return a;
            }
        },
        {
            key: "within",
            value: function within(p, a, b) {
                return p >= Math.min(a, b) && p <= Math.max(a, b);
            }
        },
        {
            key: "randomRange",
            value: function randomRange(a) {
                var b = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
                var r = a > b ? a - b : b - a;
                return a + Num.random() * r;
            }
        },
        {
            key: "randomPt",
            value: function randomPt(a, b) {
                var p = new Pt(a.length);
                var range = b ? Vec.subtract(b, a) : a;
                var start = b ? a : new Pt(a.length).fill(0);
                for(var i = 0, len = p.length; i < len; i++){
                    p[i] = Num.random() * range[i] + start[i];
                }
                return p;
            }
        },
        {
            key: "normalizeValue",
            value: function normalizeValue(n, a, b) {
                var min = Math.min(a, b);
                var max = Math.max(a, b);
                return (n - min) / (max - min);
            }
        },
        {
            key: "sum",
            value: function sum(pts) {
                var _pts = Util.iterToArray(pts);
                var c = new Pt(_pts[0]);
                for(var i = 1, len = _pts.length; i < len; i++){
                    Vec.add(c, _pts[i]);
                }
                return c;
            }
        },
        {
            key: "average",
            value: function average(pts) {
                var _pts = Util.iterToArray(pts);
                return Num.sum(_pts).divide(_pts.length);
            }
        },
        {
            key: "cycle",
            value: function cycle(t) {
                var method = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : Shaping.sineInOut;
                return method(t > 0.5 ? 2 - t * 2 : t * 2);
            }
        },
        {
            key: "mapToRange",
            value: function mapToRange(n, currA, currB, targetA, targetB) {
                if (currA == currB) throw new Error("[currMin, currMax] must define a range that is not zero");
                var min = Math.min(targetA, targetB);
                var max = Math.max(targetA, targetB);
                return Num.normalizeValue(n, currA, currB) * (max - min) + min;
            }
        },
        {
            key: "seed",
            value: function seed(seed1) {
                this.generator = uheprng_default(seed1);
            }
        },
        {
            key: "random",
            value: function random() {
                return this.generator ? this.generator.random() : Math.random();
            }
        }
    ]);
    return Num1;
}();
var Geom = /*#__PURE__*/ function() {
    "use strict";
    function Geom1() {
        _classCallCheck(this, Geom1);
    }
    _createClass(Geom1, null, [
        {
            key: "boundAngle",
            value: function boundAngle(angle) {
                return Num.boundValue(angle, 0, 360);
            }
        },
        {
            key: "boundRadian",
            value: function boundRadian(radian) {
                return Num.boundValue(radian, 0, Const.two_pi);
            }
        },
        {
            key: "toRadian",
            value: function toRadian(angle) {
                return angle * Const.deg_to_rad;
            }
        },
        {
            key: "toDegree",
            value: function toDegree(radian) {
                return radian * Const.rad_to_deg;
            }
        },
        {
            key: "boundingBox",
            value: function boundingBox(pts) {
                var minPt, maxPt;
                var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
                try {
                    for(var _iterator = pts[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
                        var p = _step.value;
                        if (minPt == void 0) {
                            minPt = p.clone();
                            maxPt = p.clone();
                        } else {
                            minPt = minPt.$min(p);
                            maxPt = maxPt.$max(p);
                        }
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally{
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return != null) {
                            _iterator.return();
                        }
                    } finally{
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
                return new Group(minPt, maxPt);
            }
        },
        {
            key: "centroid",
            value: function centroid(pts) {
                return Num.average(pts);
            }
        },
        {
            key: "anchor",
            value: function anchor(pts) {
                var ptOrIndex = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0, direction = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "to";
                var method = direction == "to" ? "subtract" : "add";
                var i = 0;
                var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
                try {
                    for(var _iterator = pts[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
                        var p = _step.value;
                        if (typeof ptOrIndex == "number") {
                            if (ptOrIndex !== i) p[method](pts[ptOrIndex]);
                        } else {
                            p[method](ptOrIndex);
                        }
                        i++;
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally{
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return != null) {
                            _iterator.return();
                        }
                    } finally{
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
            }
        },
        {
            key: "interpolate",
            value: function interpolate(a, b) {
                var t = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 0.5;
                var len = Math.min(a.length, b.length);
                var d = Pt.make(len);
                for(var i = 0; i < len; i++){
                    d[i] = a[i] * (1 - t) + b[i] * t;
                }
                return d;
            }
        },
        {
            key: "perpendicular",
            value: function perpendicular(pt) {
                var axis = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : Const.xy;
                var y = axis[1];
                var x = axis[0];
                var p = new Pt(pt);
                var pa = new Pt(p);
                pa[x] = -p[y];
                pa[y] = p[x];
                var pb = new Pt(p);
                pb[x] = p[y];
                pb[y] = -p[x];
                return new Group(pa, pb);
            }
        },
        {
            key: "isPerpendicular",
            value: function isPerpendicular(p1, p2) {
                return new Pt(p1).dot(p2) === 0;
            }
        },
        {
            key: "withinBound",
            value: function withinBound(pt, boundPt1, boundPt2) {
                for(var i = 0, len = Math.min(pt.length, boundPt1.length, boundPt2.length); i < len; i++){
                    if (!Num.within(pt[i], boundPt1[i], boundPt2[i])) return false;
                }
                return true;
            }
        },
        {
            key: "sortEdges",
            value: function sortEdges(pts) {
                var _pts = Util.iterToArray(pts);
                var bounds = Geom.boundingBox(_pts);
                var center = bounds[1].add(bounds[0]).divide(2);
                var fn = function(a, b) {
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
                return _pts.sort(fn);
            }
        },
        {
            key: "scale",
            value: function scale(ps, scale1, anchor) {
                var pts = Util.iterToArray(ps[0] !== void 0 && typeof ps[0] == "number" ? [
                    ps
                ] : ps);
                var scs = typeof scale1 == "number" ? Pt.make(pts[0].length, scale1) : scale1;
                if (!anchor) anchor = Pt.make(pts[0].length, 0);
                for(var i = 0, len = pts.length; i < len; i++){
                    var p = pts[i];
                    for(var k = 0, lenP = p.length; k < lenP; k++){
                        p[k] = anchor && anchor[k] ? anchor[k] + (p[k] - anchor[k]) * scs[k] : p[k] * scs[k];
                    }
                }
                return Geom;
            }
        },
        {
            key: "rotate2D",
            value: function rotate2D(ps, angle, anchor, axis) {
                var pts = Util.iterToArray(ps[0] !== void 0 && typeof ps[0] == "number" ? [
                    ps
                ] : ps);
                var fn = anchor ? Mat.rotateAt2DMatrix : Mat.rotate2DMatrix;
                if (!anchor) anchor = Pt.make(pts[0].length, 0);
                var cos = Math.cos(angle);
                var sin = Math.sin(angle);
                for(var i = 0, len = pts.length; i < len; i++){
                    var p = axis ? pts[i].$take(axis) : pts[i];
                    p.to(Mat.transform2D(p, fn(cos, sin, anchor)));
                    if (axis) {
                        for(var k = 0; k < axis.length; k++){
                            pts[i][axis[k]] = p[k];
                        }
                    }
                }
                return Geom;
            }
        },
        {
            key: "shear2D",
            value: function shear2D(ps, scale, anchor, axis) {
                var pts = Util.iterToArray(ps[0] !== void 0 && typeof ps[0] == "number" ? [
                    ps
                ] : ps);
                var s = typeof scale == "number" ? [
                    scale,
                    scale
                ] : scale;
                if (!anchor) anchor = Pt.make(pts[0].length, 0);
                var fn = anchor ? Mat.shearAt2DMatrix : Mat.shear2DMatrix;
                var tanx = Math.tan(s[0]);
                var tany = Math.tan(s[1]);
                for(var i = 0, len = pts.length; i < len; i++){
                    var p = axis ? pts[i].$take(axis) : pts[i];
                    p.to(Mat.transform2D(p, fn(tanx, tany, anchor)));
                    if (axis) {
                        for(var k = 0; k < axis.length; k++){
                            pts[i][axis[k]] = p[k];
                        }
                    }
                }
                return Geom;
            }
        },
        {
            key: "reflect2D",
            value: function reflect2D(ps, line, axis) {
                var pts = Util.iterToArray(ps[0] !== void 0 && typeof ps[0] == "number" ? [
                    ps
                ] : ps);
                var _line = Util.iterToArray(line);
                var mat = Mat.reflectAt2DMatrix(_line[0], _line[1]);
                for(var i = 0, len = pts.length; i < len; i++){
                    var p = axis ? pts[i].$take(axis) : pts[i];
                    p.to(Mat.transform2D(p, mat));
                    if (axis) {
                        for(var k = 0; k < axis.length; k++){
                            pts[i][axis[k]] = p[k];
                        }
                    }
                }
                return Geom;
            }
        },
        {
            key: "cosTable",
            value: function cosTable() {
                var cos = new Float64Array(360);
                for(var i = 0; i < 360; i++)cos[i] = Math.cos(i * Math.PI / 180);
                var find = function(rad) {
                    return cos[Math.floor(Geom.boundAngle(Geom.toDegree(rad)))];
                };
                return {
                    table: cos,
                    cos: find
                };
            }
        },
        {
            key: "sinTable",
            value: function sinTable() {
                var sin = new Float64Array(360);
                for(var i = 0; i < 360; i++)sin[i] = Math.sin(i * Math.PI / 180);
                var find = function(rad) {
                    return sin[Math.floor(Geom.boundAngle(Geom.toDegree(rad)))];
                };
                return {
                    table: sin,
                    sin: find
                };
            }
        }
    ]);
    return Geom1;
}();
var Shaping = /*#__PURE__*/ function() {
    "use strict";
    function Shaping1() {
        _classCallCheck(this, Shaping1);
    }
    _createClass(Shaping1, null, [
        {
            key: "linear",
            value: function linear(t) {
                var c = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1;
                return c * t;
            }
        },
        {
            key: "quadraticIn",
            value: function quadraticIn(t) {
                var c = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1;
                return c * t * t;
            }
        },
        {
            key: "quadraticOut",
            value: function quadraticOut(t) {
                var c = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1;
                return -c * t * (t - 2);
            }
        },
        {
            key: "quadraticInOut",
            value: function quadraticInOut(t) {
                var c = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1;
                var dt = t * 2;
                return t < 0.5 ? c / 2 * t * t * 4 : -c / 2 * ((dt - 1) * (dt - 3) - 1);
            }
        },
        {
            key: "cubicIn",
            value: function cubicIn(t) {
                var c = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1;
                return c * t * t * t;
            }
        },
        {
            key: "cubicOut",
            value: function cubicOut(t) {
                var c = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1;
                var dt = t - 1;
                return c * (dt * dt * dt + 1);
            }
        },
        {
            key: "cubicInOut",
            value: function cubicInOut(t) {
                var c = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1;
                var dt = t * 2;
                return t < 0.5 ? c / 2 * dt * dt * dt : c / 2 * ((dt - 2) * (dt - 2) * (dt - 2) + 2);
            }
        },
        {
            key: "exponentialIn",
            value: function exponentialIn(t) {
                var c = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1, p = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 0.25;
                return c * Math.pow(t, 1 / p);
            }
        },
        {
            key: "exponentialOut",
            value: function exponentialOut(t) {
                var c = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1, p = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 0.25;
                return c * Math.pow(t, p);
            }
        },
        {
            key: "sineIn",
            value: function sineIn(t) {
                var c = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1;
                return -c * Math.cos(t * Const.half_pi) + c;
            }
        },
        {
            key: "sineOut",
            value: function sineOut(t) {
                var c = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1;
                return c * Math.sin(t * Const.half_pi);
            }
        },
        {
            key: "sineInOut",
            value: function sineInOut(t) {
                var c = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1;
                return -c / 2 * (Math.cos(Math.PI * t) - 1);
            }
        },
        {
            key: "cosineApprox",
            value: function cosineApprox(t) {
                var c = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1;
                var t2 = t * t;
                var t4 = t2 * t2;
                var t6 = t4 * t2;
                return c * (4 * t6 / 9 - 17 * t4 / 9 + 22 * t2 / 9);
            }
        },
        {
            key: "circularIn",
            value: function circularIn(t) {
                var c = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1;
                return -c * (Math.sqrt(1 - t * t) - 1);
            }
        },
        {
            key: "circularOut",
            value: function circularOut(t) {
                var c = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1;
                var dt = t - 1;
                return c * Math.sqrt(1 - dt * dt);
            }
        },
        {
            key: "circularInOut",
            value: function circularInOut(t) {
                var c = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1;
                var dt = t * 2;
                return t < 0.5 ? -c / 2 * (Math.sqrt(1 - dt * dt) - 1) : c / 2 * (Math.sqrt(1 - (dt - 2) * (dt - 2)) + 1);
            }
        },
        {
            key: "elasticIn",
            value: function elasticIn(t) {
                var c = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1, p = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 0.7;
                var dt = t - 1;
                var s = p / Const.two_pi * 1.5707963267948966;
                return c * (-Math.pow(2, 10 * dt) * Math.sin((dt - s) * Const.two_pi / p));
            }
        },
        {
            key: "elasticOut",
            value: function elasticOut(t) {
                var c = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1, p = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 0.7;
                var s = p / Const.two_pi * 1.5707963267948966;
                return c * (Math.pow(2, -10 * t) * Math.sin((t - s) * Const.two_pi / p)) + c;
            }
        },
        {
            key: "elasticInOut",
            value: function elasticInOut(t) {
                var c = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1, p = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 0.6;
                var dt = t * 2;
                var s = p / Const.two_pi * 1.5707963267948966;
                if (t < 0.5) {
                    dt -= 1;
                    return c * (-0.5 * (Math.pow(2, 10 * dt) * Math.sin((dt - s) * Const.two_pi / p)));
                } else {
                    dt -= 1;
                    return c * (0.5 * (Math.pow(2, -10 * dt) * Math.sin((dt - s) * Const.two_pi / p))) + c;
                }
            }
        },
        {
            key: "bounceIn",
            value: function bounceIn(t) {
                var c = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1;
                return c - Shaping.bounceOut(1 - t, c);
            }
        },
        {
            key: "bounceOut",
            value: function bounceOut(t) {
                var c = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1;
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
        },
        {
            key: "bounceInOut",
            value: function bounceInOut(t) {
                var c = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1;
                return t < 0.5 ? Shaping.bounceIn(t * 2, c) / 2 : Shaping.bounceOut(t * 2 - 1, c) / 2 + c / 2;
            }
        },
        {
            key: "sigmoid",
            value: function sigmoid(t) {
                var c = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1, p = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 10;
                var d = p * (t - 0.5);
                return c / (1 + Math.exp(-d));
            }
        },
        {
            key: "logSigmoid",
            value: function logSigmoid(t) {
                var c = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1, p = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 0.7;
                p = Math.max(Const.epsilon, Math.min(1 - Const.epsilon, p));
                p = 1 / (1 - p);
                var A = 1 / (1 + Math.exp((t - 0.5) * p * -2));
                var B = 1 / (1 + Math.exp(p));
                var C = 1 / (1 + Math.exp(-p));
                return c * (A - B) / (C - B);
            }
        },
        {
            key: "seat",
            value: function seat(t) {
                var c = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1, p = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 0.5;
                if (t < 0.5) {
                    return c * Math.pow(2 * t, 1 - p) / 2;
                } else {
                    return c * (1 - Math.pow(2 * (1 - t), 1 - p) / 2);
                }
            }
        },
        {
            key: "quadraticBezier",
            value: function quadraticBezier(t) {
                var c = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1, p = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : [
                    0.05,
                    0.95
                ];
                var a = typeof p != "number" ? p[0] : p;
                var b = typeof p != "number" ? p[1] : 0.5;
                var om2a = 1 - 2 * a;
                if (om2a === 0) {
                    om2a = Const.epsilon;
                }
                var d = (Math.sqrt(a * a + om2a * t) - a) / om2a;
                return c * ((1 - 2 * b) * (d * d) + 2 * b * d);
            }
        },
        {
            key: "cubicBezier",
            value: function cubicBezier(t) {
                var c = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1, p1 = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : [
                    0.1,
                    0.7
                ], p2 = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : [
                    0.9,
                    0.2
                ];
                var curve = new Group(new Pt(0, 0), new Pt(p1), new Pt(p2), new Pt(1, 1));
                return c * Curve.bezierStep(new Pt(t * t * t, t * t, t, 1), Curve.controlPoints(curve)).y;
            }
        },
        {
            key: "quadraticTarget",
            value: function quadraticTarget(t) {
                var c = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1, p1 = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : [
                    0.2,
                    0.35
                ];
                var a = Math.min(1 - Const.epsilon, Math.max(Const.epsilon, p1[0]));
                var b = Math.min(1, Math.max(0, p1[1]));
                var A = (1 - b) / (1 - a) - b / a;
                var B = (A * (a * a) - b) / a;
                var y = A * (t * t) - B * t;
                return c * Math.min(1, Math.max(0, y));
            }
        },
        {
            key: "cliff",
            value: function cliff(t) {
                var c = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1, p = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 0.5;
                return t > p ? c : 0;
            }
        },
        {
            key: "step",
            value: function step(fn, steps, t, c) {
                for(var _len = arguments.length, args = new Array(_len > 4 ? _len - 4 : 0), _key = 4; _key < _len; _key++){
                    args[_key - 4] = arguments[_key];
                }
                var s = 1 / steps;
                var tt = Math.floor(t / s) * s;
                return fn.apply(void 0, [
                    tt,
                    c
                ].concat(_toConsumableArray(args)));
            }
        }
    ]);
    return Shaping1;
}();
var Range = /*#__PURE__*/ function() {
    "use strict";
    function Range(g) {
        _classCallCheck(this, Range);
        this._dims = 0;
        this._source = Group.fromPtArray(g);
        this.calc();
    }
    _createClass(Range, [
        {
            key: "max",
            get: function get() {
                return this._max.clone();
            }
        },
        {
            key: "min",
            get: function get() {
                return this._min.clone();
            }
        },
        {
            key: "magnitude",
            get: function get() {
                return this._mag.clone();
            }
        },
        {
            key: "calc",
            value: function calc() {
                if (!this._source) return;
                var dims = this._source[0].length;
                this._dims = dims;
                var max = new Pt(dims);
                var min = new Pt(dims);
                var mag = new Pt(dims);
                for(var i = 0; i < dims; i++){
                    max[i] = Const.min;
                    min[i] = Const.max;
                    mag[i] = 0;
                    var s = this._source.zipSlice(i);
                    for(var k = 0, len = s.length; k < len; k++){
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
        },
        {
            key: "mapTo",
            value: function mapTo(min, max, exclude) {
                var target = new Group();
                for(var i = 0, len = this._source.length; i < len; i++){
                    var g = this._source[i];
                    var n = new Pt(this._dims);
                    for(var k = 0; k < this._dims; k++){
                        n[k] = exclude && exclude[k] ? g[k] : Num.mapToRange(g[k], this._min[k], this._max[k], min, max);
                    }
                    target.push(n);
                }
                return target;
            }
        },
        {
            key: "append",
            value: function append(pts) {
                var update = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : true;
                var _pts = Util.iterToArray(pts);
                if (_pts[0].length !== this._dims) throw new Error("Dimensions don't match. ".concat(this._dims, " dimensions in Range and ").concat(_pts[0].length, " provided in parameter. "));
                this._source = this._source.concat(_pts);
                if (update) this.calc();
                return this;
            }
        },
        {
            key: "ticks",
            value: function ticks(count) {
                var g = new Group();
                for(var i = 0; i <= count; i++){
                    var p = new Pt(this._dims);
                    for(var k = 0, len = this._max.length; k < len; k++){
                        p[k] = Num.lerp(this._min[k], this._max[k], i / count);
                    }
                    g.push(p);
                }
                return g;
            }
        }
    ]);
    return Range;
}();
// src/Util.ts
var Const = {
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
    epsilon: 1e-4,
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
var _Util = /*#__PURE__*/ function() {
    "use strict";
    function _Util1() {
        _classCallCheck(this, _Util1);
    }
    _createClass(_Util1, null, [
        {
            key: "warnLevel",
            value: function warnLevel(lv) {
                if (lv) {
                    _Util._warnLevel = lv;
                }
                return _Util._warnLevel;
            }
        },
        {
            key: "getArgs",
            value: function getArgs(args) {
                if (args.length < 1) return [];
                var pos = [];
                var isArray = Array.isArray(args[0]) || ArrayBuffer.isView(args[0]);
                if (typeof args[0] === "number") {
                    pos = Array.prototype.slice.call(args);
                } else if (typeof args[0] === "object" && !isArray) {
                    var a = [
                        "x",
                        "y",
                        "z",
                        "w"
                    ];
                    var p = args[0];
                    for(var i = 0; i < a.length; i++){
                        if (p.length && i >= p.length || !(a[i] in p)) break;
                        pos.push(p[a[i]]);
                    }
                } else if (isArray) {
                    pos = [].slice.call(args[0]);
                }
                return pos;
            }
        },
        {
            key: "warn",
            value: function warn() {
                var message = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "error", defaultReturn = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : void 0;
                if (_Util.warnLevel() == "error") {
                    throw new Error(message);
                } else if (_Util.warnLevel() == "warn") {
                    console.warn(message);
                }
                return defaultReturn;
            }
        },
        {
            key: "randomInt",
            value: function randomInt(range) {
                var start = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
                _Util.warn("Util.randomInt is deprecated. Please use `Num.randomRange`");
                return Math.floor(Num.random() * range) + start;
            }
        },
        {
            key: "split",
            value: function split(pts, size, stride) {
                var loopBack = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : false, matchSize = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : true;
                var chunks = [];
                var part = [];
                var st = stride || size;
                var index = 0;
                if (pts.length <= 0 || st <= 0) return [];
                while(index < pts.length){
                    part = [];
                    for(var k = 0; k < size; k++){
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
        },
        {
            key: "flatten",
            value: function flatten(pts) {
                var flattenAsGroup = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : true;
                var arr = flattenAsGroup ? new Group() : new Array();
                return arr.concat.apply(arr, pts);
            }
        },
        {
            key: "combine",
            value: function combine(a, b, op) {
                var result = [];
                for(var i = 0, len = a.length; i < len; i++){
                    for(var k = 0, lenB = b.length; k < lenB; k++){
                        result.push(op(a[i], b[k]));
                    }
                }
                return result;
            }
        },
        {
            key: "zip",
            value: function zip(arrays) {
                var z = [];
                for(var i = 0, len = arrays[0].length; i < len; i++){
                    var p = [];
                    for(var k = 0; k < arrays.length; k++){
                        p.push(arrays[k][i]);
                    }
                    z.push(p);
                }
                return z;
            }
        },
        {
            key: "stepper",
            value: function stepper(max) {
                var min = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0, stride = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 1, callback = arguments.length > 3 ? arguments[3] : void 0;
                var c = min;
                return function() {
                    c += stride;
                    if (c >= max) {
                        c = min + (c - max);
                    }
                    if (callback) callback(c);
                    return c;
                };
            }
        },
        {
            key: "forRange",
            value: function forRange(fn, range) {
                var start = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 0, step = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 1;
                var temp = [];
                for(var i = start, len = range; i < len; i += step){
                    temp[i] = fn(i);
                }
                return temp;
            }
        },
        {
            key: "load",
            value: function load(url, callback) {
                var request = new XMLHttpRequest();
                request.open("GET", url, true);
                request.onload = function() {
                    if (request.status >= 200 && request.status < 400) {
                        callback(request.responseText, true);
                    } else {
                        callback("Server error (".concat(request.status, ') when loading "').concat(url, '"'), false);
                    }
                };
                request.onerror = function() {
                    callback("Unknown network error", false);
                };
                request.send();
            }
        },
        {
            key: "download",
            value: function download(space) {
                var filename = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "pts_canvas_image", filetype = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "png", quality = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 1;
                var ftype = filetype === "jpg" ? "jpeg" : filetype;
                space.element.toBlob(function(blob) {
                    var link = document.createElement("a");
                    var url = URL.createObjectURL(blob);
                    link.href = url;
                    link.download = "".concat(filename, ".").concat(filetype);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                }, "image/".concat(ftype), quality);
            }
        },
        {
            key: "performance",
            value: function performance() {
                var avgFrames = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 10;
                var last = Date.now();
                var avg = [];
                return function() {
                    var now = Date.now();
                    avg.push(now - last);
                    if (avg.length >= avgFrames) avg.shift();
                    last = now;
                    return Math.floor(avg.reduce(function(a, b) {
                        return a + b;
                    }, 0) / avg.length);
                };
            }
        },
        {
            key: "arrayCheck",
            value: function arrayCheck(pts) {
                var minRequired = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 2;
                if (Array.isArray(pts) && pts.length < minRequired) {
                    _Util.warn("Requires ".concat(minRequired, " or more Pts in this Group."));
                    return false;
                }
                return true;
            }
        },
        {
            key: "iterToArray",
            value: function iterToArray(it) {
                return !Array.isArray(it) ? _toConsumableArray(it) : it;
            }
        },
        {
            key: "isMobile",
            value: function isMobile() {
                return /iPhone|iPad|Android/i.test(navigator.userAgent);
            }
        }
    ]);
    return _Util1;
}();
var Util = _Util;
Util._warnLevel = "mute";
// src/Pt.ts
var Pt = /*#__PURE__*/ function(Float32Array1) {
    "use strict";
    _inherits(Pt1, Float32Array1);
    var _super = _createSuper(Pt1);
    function Pt1() {
        for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
            args[_key] = arguments[_key];
        }
        var _this = this;
        _classCallCheck(this, Pt1);
        var _this1;
        var __super = function() {
            for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                args[_key] = arguments[_key];
            }
            _this1 = _super.call.apply(_super, [
                _this
            ].concat(_toConsumableArray(args)));
        };
        if (args.length === 1 && typeof args[0] == "number") {
            __super(args[0]);
        } else {
            __super(args.length > 0 ? Util.getArgs(args) : [
                0,
                0
            ]);
        }
        return _possibleConstructorReturn(_this1);
    }
    _createClass(Pt1, [
        {
            key: "id",
            get: function get() {
                return this._id;
            },
            set: function set(s) {
                this._id = s;
            }
        },
        {
            key: "x",
            get: function get() {
                return this[0];
            },
            set: function set(n) {
                this[0] = n;
            }
        },
        {
            key: "y",
            get: function get() {
                return this[1];
            },
            set: function set(n) {
                this[1] = n;
            }
        },
        {
            key: "z",
            get: function get() {
                return this[2];
            },
            set: function set(n) {
                this[2] = n;
            }
        },
        {
            key: "w",
            get: function get() {
                return this[3];
            },
            set: function set(n) {
                this[3] = n;
            }
        },
        {
            key: "clone",
            value: function clone() {
                return new Pt(this);
            }
        },
        {
            key: "equals",
            value: function equals(p) {
                var threshold = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1e-6;
                for(var i = 0, len = this.length; i < len; i++){
                    if (Math.abs(this[i] - p[i]) > threshold) return false;
                }
                return true;
            }
        },
        {
            key: "to",
            value: function to() {
                for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                    args[_key] = arguments[_key];
                }
                var p = Util.getArgs(args);
                for(var i = 0, len = Math.min(this.length, p.length); i < len; i++){
                    this[i] = p[i];
                }
                return this;
            }
        },
        {
            key: "$to",
            value: function $to() {
                for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                    args[_key] = arguments[_key];
                }
                var _instance;
                return (_instance = this.clone()).to.apply(_instance, _toConsumableArray(args));
            }
        },
        {
            key: "toAngle",
            value: function toAngle(radian, magnitude) {
                var anchorFromPt = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
                var m = magnitude != void 0 ? magnitude : this.magnitude();
                var change = [
                    Math.cos(radian) * m,
                    Math.sin(radian) * m
                ];
                return anchorFromPt ? this.add(change) : this.to(change);
            }
        },
        {
            key: "op",
            value: function op(fn) {
                var self = this;
                return function() {
                    for(var _len = arguments.length, params = new Array(_len), _key = 0; _key < _len; _key++){
                        params[_key] = arguments[_key];
                    }
                    return fn.apply(void 0, [
                        self
                    ].concat(_toConsumableArray(params)));
                };
            }
        },
        {
            key: "ops",
            value: function ops(fns) {
                var _ops = [];
                for(var i = 0, len = fns.length; i < len; i++){
                    _ops.push(this.op(fns[i]));
                }
                return _ops;
            }
        },
        {
            key: "$take",
            value: function $take(axis) {
                var p = [];
                for(var i = 0, len = axis.length; i < len; i++){
                    p.push(this[axis[i]] || 0);
                }
                return new Pt(p);
            }
        },
        {
            key: "$concat",
            value: function $concat() {
                for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                    args[_key] = arguments[_key];
                }
                return new Pt(this.toArray().concat(Util.getArgs(args)));
            }
        },
        {
            key: "add",
            value: function add() {
                for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                    args[_key] = arguments[_key];
                }
                args.length === 1 && typeof args[0] == "number" ? Vec.add(this, args[0]) : Vec.add(this, Util.getArgs(args));
                return this;
            }
        },
        {
            key: "$add",
            value: function $add() {
                for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                    args[_key] = arguments[_key];
                }
                var _instance;
                return (_instance = this.clone()).add.apply(_instance, _toConsumableArray(args));
            }
        },
        {
            key: "subtract",
            value: function subtract() {
                for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                    args[_key] = arguments[_key];
                }
                args.length === 1 && typeof args[0] == "number" ? Vec.subtract(this, args[0]) : Vec.subtract(this, Util.getArgs(args));
                return this;
            }
        },
        {
            key: "$subtract",
            value: function $subtract() {
                for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                    args[_key] = arguments[_key];
                }
                var _instance;
                return (_instance = this.clone()).subtract.apply(_instance, _toConsumableArray(args));
            }
        },
        {
            key: "multiply",
            value: function multiply() {
                for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                    args[_key] = arguments[_key];
                }
                args.length === 1 && typeof args[0] == "number" ? Vec.multiply(this, args[0]) : Vec.multiply(this, Util.getArgs(args));
                return this;
            }
        },
        {
            key: "$multiply",
            value: function $multiply() {
                for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                    args[_key] = arguments[_key];
                }
                var _instance;
                return (_instance = this.clone()).multiply.apply(_instance, _toConsumableArray(args));
            }
        },
        {
            key: "divide",
            value: function divide() {
                for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                    args[_key] = arguments[_key];
                }
                args.length === 1 && typeof args[0] == "number" ? Vec.divide(this, args[0]) : Vec.divide(this, Util.getArgs(args));
                return this;
            }
        },
        {
            key: "$divide",
            value: function $divide() {
                for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                    args[_key] = arguments[_key];
                }
                var _instance;
                return (_instance = this.clone()).divide.apply(_instance, _toConsumableArray(args));
            }
        },
        {
            key: "magnitudeSq",
            value: function magnitudeSq() {
                return Vec.dot(this, this);
            }
        },
        {
            key: "magnitude",
            value: function magnitude() {
                return Vec.magnitude(this);
            }
        },
        {
            key: "unit",
            value: function unit() {
                var magnitude = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : void 0;
                Vec.unit(this, magnitude);
                return this;
            }
        },
        {
            key: "$unit",
            value: function $unit() {
                var magnitude = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : void 0;
                return this.clone().unit(magnitude);
            }
        },
        {
            key: "dot",
            value: function dot() {
                for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                    args[_key] = arguments[_key];
                }
                return Vec.dot(this, Util.getArgs(args));
            }
        },
        {
            key: "$cross2D",
            value: function $cross2D() {
                for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                    args[_key] = arguments[_key];
                }
                return Vec.cross2D(this, Util.getArgs(args));
            }
        },
        {
            key: "$cross",
            value: function $cross() {
                for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                    args[_key] = arguments[_key];
                }
                return Vec.cross(this, Util.getArgs(args));
            }
        },
        {
            key: "$project",
            value: function $project() {
                for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                    args[_key] = arguments[_key];
                }
                return this.$multiply(this.dot.apply(this, _toConsumableArray(args)) / this.magnitudeSq());
            }
        },
        {
            key: "projectScalar",
            value: function projectScalar() {
                for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                    args[_key] = arguments[_key];
                }
                return this.dot.apply(this, _toConsumableArray(args)) / this.magnitude();
            }
        },
        {
            key: "abs",
            value: function abs() {
                Vec.abs(this);
                return this;
            }
        },
        {
            key: "$abs",
            value: function $abs() {
                return this.clone().abs();
            }
        },
        {
            key: "floor",
            value: function floor() {
                Vec.floor(this);
                return this;
            }
        },
        {
            key: "$floor",
            value: function $floor() {
                return this.clone().floor();
            }
        },
        {
            key: "ceil",
            value: function ceil() {
                Vec.ceil(this);
                return this;
            }
        },
        {
            key: "$ceil",
            value: function $ceil() {
                return this.clone().ceil();
            }
        },
        {
            key: "round",
            value: function round() {
                Vec.round(this);
                return this;
            }
        },
        {
            key: "$round",
            value: function $round() {
                return this.clone().round();
            }
        },
        {
            key: "minValue",
            value: function minValue() {
                return Vec.min(this);
            }
        },
        {
            key: "maxValue",
            value: function maxValue() {
                return Vec.max(this);
            }
        },
        {
            key: "$min",
            value: function $min() {
                for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                    args[_key] = arguments[_key];
                }
                var p = Util.getArgs(args);
                var m = this.clone();
                for(var i = 0, len = Math.min(this.length, p.length); i < len; i++){
                    m[i] = Math.min(this[i], p[i]);
                }
                return m;
            }
        },
        {
            key: "$max",
            value: function $max() {
                for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                    args[_key] = arguments[_key];
                }
                var p = Util.getArgs(args);
                var m = this.clone();
                for(var i = 0, len = Math.min(this.length, p.length); i < len; i++){
                    m[i] = Math.max(this[i], p[i]);
                }
                return m;
            }
        },
        {
            key: "angle",
            value: function angle() {
                var axis = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : Const.xy;
                return Math.atan2(this[axis[1]], this[axis[0]]);
            }
        },
        {
            key: "angleBetween",
            value: function angleBetween(p) {
                var axis = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : Const.xy;
                return Geom.boundRadian(this.angle(axis)) - Geom.boundRadian(p.angle(axis));
            }
        },
        {
            key: "scale",
            value: function scale(scale1, anchor) {
                Geom.scale(this, scale1, anchor || Pt.make(this.length, 0));
                return this;
            }
        },
        {
            key: "rotate2D",
            value: function rotate2D(angle, anchor, axis) {
                Geom.rotate2D(this, angle, anchor || Pt.make(this.length, 0), axis);
                return this;
            }
        },
        {
            key: "shear2D",
            value: function shear2D(scale, anchor, axis) {
                Geom.shear2D(this, scale, anchor || Pt.make(this.length, 0), axis);
                return this;
            }
        },
        {
            key: "reflect2D",
            value: function reflect2D(line, axis) {
                Geom.reflect2D(this, line, axis);
                return this;
            }
        },
        {
            key: "toString",
            value: function toString() {
                return "Pt(".concat(this.join(", "), ")");
            }
        },
        {
            key: "toArray",
            value: function toArray() {
                return [].slice.call(this);
            }
        },
        {
            key: "toGroup",
            value: function toGroup() {
                return new Group(Pt.make(this.length), this.clone());
            }
        },
        {
            key: "toBound",
            value: function toBound() {
                return new Bound(Pt.make(this.length), this.clone());
            }
        }
    ], [
        {
            key: "make",
            value: function make(dimensions) {
                var defaultValue = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0, randomize = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
                var p = new Float32Array(dimensions);
                if (defaultValue) p.fill(defaultValue);
                if (randomize) {
                    for(var i = 0, len = p.length; i < len; i++){
                        p[i] = p[i] * Num.random();
                    }
                }
                return new Pt(p);
            }
        }
    ]);
    return Pt1;
}(_wrapNativeSuper(Float32Array));
var Group = /*#__PURE__*/ function(Array1) {
    "use strict";
    _inherits(Group1, Array1);
    var _super = _createSuper(Group1);
    function Group1() {
        for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
            args[_key] = arguments[_key];
        }
        _classCallCheck(this, Group1);
        return _super.call.apply(_super, [
            this
        ].concat(_toConsumableArray(args)));
    }
    _createClass(Group1, [
        {
            key: "id",
            get: function get() {
                return this._id;
            },
            set: function set(s) {
                this._id = s;
            }
        },
        {
            key: "p1",
            get: function get() {
                return this[0];
            }
        },
        {
            key: "p2",
            get: function get() {
                return this[1];
            }
        },
        {
            key: "p3",
            get: function get() {
                return this[2];
            }
        },
        {
            key: "p4",
            get: function get() {
                return this[3];
            }
        },
        {
            key: "q1",
            get: function get() {
                return this[this.length - 1];
            }
        },
        {
            key: "q2",
            get: function get() {
                return this[this.length - 2];
            }
        },
        {
            key: "q3",
            get: function get() {
                return this[this.length - 3];
            }
        },
        {
            key: "q4",
            get: function get() {
                return this[this.length - 4];
            }
        },
        {
            key: "clone",
            value: function clone() {
                var group = new Group();
                for(var i = 0, len = this.length; i < len; i++){
                    group.push(this[i].clone());
                }
                return group;
            }
        },
        {
            key: "split",
            value: function split(chunkSize, stride) {
                var loopBack = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
                var sp = Util.split(this, chunkSize, stride, loopBack);
                return sp;
            }
        },
        {
            key: "insert",
            value: function insert(pts) {
                var index = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
                Group.prototype.splice.apply(this, [
                    index,
                    0
                ].concat(_toConsumableArray(pts)));
                return this;
            }
        },
        {
            key: "remove",
            value: function remove() {
                var index = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, count = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1;
                var param = index < 0 ? [
                    index * -1 - 1,
                    count
                ] : [
                    index,
                    count
                ];
                return Group.prototype.splice.apply(this, param);
            }
        },
        {
            key: "segments",
            value: function segments() {
                var pts_per_segment = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 2, stride = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1, loopBack = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
                return this.split(pts_per_segment, stride, loopBack);
            }
        },
        {
            key: "lines",
            value: function lines() {
                return this.segments(2, 1);
            }
        },
        {
            key: "centroid",
            value: function centroid() {
                return Geom.centroid(this);
            }
        },
        {
            key: "boundingBox",
            value: function boundingBox() {
                return Geom.boundingBox(this);
            }
        },
        {
            key: "anchorTo",
            value: function anchorTo() {
                var ptOrIndex = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0;
                Geom.anchor(this, ptOrIndex, "to");
            }
        },
        {
            key: "anchorFrom",
            value: function anchorFrom() {
                var ptOrIndex = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0;
                Geom.anchor(this, ptOrIndex, "from");
            }
        },
        {
            key: "op",
            value: function op(fn) {
                var self = this;
                return function() {
                    for(var _len = arguments.length, params = new Array(_len), _key = 0; _key < _len; _key++){
                        params[_key] = arguments[_key];
                    }
                    return fn.apply(void 0, [
                        self
                    ].concat(_toConsumableArray(params)));
                };
            }
        },
        {
            key: "ops",
            value: function ops(fns) {
                var _ops = [];
                for(var i = 0, len = fns.length; i < len; i++){
                    _ops.push(this.op(fns[i]));
                }
                return _ops;
            }
        },
        {
            key: "interpolate",
            value: function interpolate(t) {
                t = Num.clamp(t, 0, 1);
                var chunk = this.length - 1;
                var tc = 1 / (this.length - 1);
                var idx = Math.floor(t / tc);
                return Geom.interpolate(this[idx], this[Math.min(this.length - 1, idx + 1)], (t - idx * tc) * chunk);
            }
        },
        {
            key: "moveBy",
            value: function moveBy() {
                for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                    args[_key] = arguments[_key];
                }
                return this.add.apply(this, _toConsumableArray(args));
            }
        },
        {
            key: "moveTo",
            value: function moveTo() {
                for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                    args[_key] = arguments[_key];
                }
                var d = new Pt(Util.getArgs(args)).subtract(this[0]);
                this.moveBy(d);
                return this;
            }
        },
        {
            key: "scale",
            value: function scale(scale1, anchor) {
                for(var i = 0, len = this.length; i < len; i++){
                    Geom.scale(this[i], scale1, anchor || this[0]);
                }
                return this;
            }
        },
        {
            key: "rotate2D",
            value: function rotate2D(angle, anchor, axis) {
                for(var i = 0, len = this.length; i < len; i++){
                    Geom.rotate2D(this[i], angle, anchor || this[0], axis);
                }
                return this;
            }
        },
        {
            key: "shear2D",
            value: function shear2D(scale, anchor, axis) {
                for(var i = 0, len = this.length; i < len; i++){
                    Geom.shear2D(this[i], scale, anchor || this[0], axis);
                }
                return this;
            }
        },
        {
            key: "reflect2D",
            value: function reflect2D(line, axis) {
                for(var i = 0, len = this.length; i < len; i++){
                    Geom.reflect2D(this[i], line, axis);
                }
                return this;
            }
        },
        {
            key: "sortByDimension",
            value: function sortByDimension(dim) {
                var desc = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
                return this.sort(function(a, b) {
                    return desc ? b[dim] - a[dim] : a[dim] - b[dim];
                });
            }
        },
        {
            key: "forEachPt",
            value: function forEachPt(ptFn) {
                for(var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++){
                    args[_key - 1] = arguments[_key];
                }
                if (!this[0][ptFn]) {
                    Util.warn("".concat(ptFn, " is not a function of Pt"));
                    return this;
                }
                for(var i = 0, len = this.length; i < len; i++){
                    var _i;
                    this[i] = (_i = this[i])[ptFn].apply(_i, _toConsumableArray(args));
                }
                return this;
            }
        },
        {
            key: "add",
            value: function add() {
                for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                    args[_key] = arguments[_key];
                }
                return this.forEachPt.apply(this, [
                    "add"
                ].concat(_toConsumableArray(args)));
            }
        },
        {
            key: "subtract",
            value: function subtract() {
                for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                    args[_key] = arguments[_key];
                }
                return this.forEachPt.apply(this, [
                    "subtract"
                ].concat(_toConsumableArray(args)));
            }
        },
        {
            key: "multiply",
            value: function multiply() {
                for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                    args[_key] = arguments[_key];
                }
                return this.forEachPt.apply(this, [
                    "multiply"
                ].concat(_toConsumableArray(args)));
            }
        },
        {
            key: "divide",
            value: function divide() {
                for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                    args[_key] = arguments[_key];
                }
                return this.forEachPt.apply(this, [
                    "divide"
                ].concat(_toConsumableArray(args)));
            }
        },
        {
            key: "$matrixAdd",
            value: function $matrixAdd(g) {
                return Mat.add(this, g);
            }
        },
        {
            key: "$matrixMultiply",
            value: function $matrixMultiply(g) {
                var transposed = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false, elementwise = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
                return Mat.multiply(this, g, transposed, elementwise);
            }
        },
        {
            key: "zipSlice",
            value: function zipSlice(index) {
                var defaultValue = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
                return Mat.zipSlice(this, index, defaultValue);
            }
        },
        {
            key: "$zip",
            value: function $zip() {
                var defaultValue = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : void 0, useLongest = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
                return Mat.zip(this, defaultValue, useLongest);
            }
        },
        {
            key: "toBound",
            value: function toBound() {
                return Bound.fromGroup(this);
            }
        },
        {
            key: "toString",
            value: function toString() {
                return "Group[ " + this.reduce(function(p, c) {
                    return p + c.toString() + " ";
                }, "") + " ]";
            }
        }
    ], [
        {
            key: "fromArray",
            value: function fromArray(list) {
                var g = new Group();
                var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
                try {
                    for(var _iterator = list[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
                        var li = _step.value;
                        var p = _instanceof(li, Pt) ? li : new Pt(li);
                        g.push(p);
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally{
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return != null) {
                            _iterator.return();
                        }
                    } finally{
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
                return g;
            }
        },
        {
            key: "fromPtArray",
            value: function fromPtArray(list) {
                return Group.from(list);
            }
        }
    ]);
    return Group1;
}(_wrapNativeSuper(Array));
var Bound = /*#__PURE__*/ function(Group) {
    "use strict";
    _inherits(Bound1, Group);
    var _super = _createSuper(Bound1);
    function Bound1() {
        for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
            args[_key] = arguments[_key];
        }
        _classCallCheck(this, Bound1);
        var _this;
        _this = _super.call.apply(_super, [
            this
        ].concat(_toConsumableArray(args)));
        _this._center = new Pt();
        _this._size = new Pt();
        _this._topLeft = new Pt();
        _this._bottomRight = new Pt();
        _this._inited = false;
        _this.init();
        return _this;
    }
    _createClass(Bound1, [
        {
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
        },
        {
            key: "clone",
            value: function clone() {
                return new Bound(this._topLeft.clone(), this._bottomRight.clone());
            }
        },
        {
            key: "_updateSize",
            value: function _updateSize() {
                this._size = this._bottomRight.$subtract(this._topLeft).abs();
                this._updateCenter();
            }
        },
        {
            key: "_updateCenter",
            value: function _updateCenter() {
                this._center = this._size.$multiply(0.5).add(this._topLeft);
            }
        },
        {
            key: "_updatePosFromTop",
            value: function _updatePosFromTop() {
                this._bottomRight = this._topLeft.$add(this._size);
                this._updateCenter();
            }
        },
        {
            key: "_updatePosFromBottom",
            value: function _updatePosFromBottom() {
                this._topLeft = this._bottomRight.$subtract(this._size);
                this._updateCenter();
            }
        },
        {
            key: "_updatePosFromCenter",
            value: function _updatePosFromCenter() {
                var half = this._size.$multiply(0.5);
                this._topLeft = this._center.$subtract(half);
                this._bottomRight = this._center.$add(half);
            }
        },
        {
            key: "size",
            get: function get() {
                return new Pt(this._size);
            },
            set: function set(p) {
                this._size = new Pt(p);
                this._updatePosFromTop();
            }
        },
        {
            key: "center",
            get: function get() {
                return new Pt(this._center);
            },
            set: function set(p) {
                this._center = new Pt(p);
                this._updatePosFromCenter();
            }
        },
        {
            key: "topLeft",
            get: function get() {
                return new Pt(this._topLeft);
            },
            set: function set(p) {
                this._topLeft = new Pt(p);
                this[0] = this._topLeft;
                this._updateSize();
            }
        },
        {
            key: "bottomRight",
            get: function get() {
                return new Pt(this._bottomRight);
            },
            set: function set(p) {
                this._bottomRight = new Pt(p);
                this[1] = this._bottomRight;
                this._updateSize();
            }
        },
        {
            key: "width",
            get: function get() {
                return this._size.length > 0 ? this._size.x : 0;
            },
            set: function set(w) {
                this._size.x = w;
                this._updatePosFromTop();
            }
        },
        {
            key: "height",
            get: function get() {
                return this._size.length > 1 ? this._size.y : 0;
            },
            set: function set(h) {
                this._size.y = h;
                this._updatePosFromTop();
            }
        },
        {
            key: "depth",
            get: function get() {
                return this._size.length > 2 ? this._size.z : 0;
            },
            set: function set(d) {
                this._size.z = d;
                this._updatePosFromTop();
            }
        },
        {
            key: "x",
            get: function get() {
                return this.topLeft.x;
            }
        },
        {
            key: "y",
            get: function get() {
                return this.topLeft.y;
            }
        },
        {
            key: "z",
            get: function get() {
                return this.topLeft.z;
            }
        },
        {
            key: "inited",
            get: function get() {
                return this._inited;
            }
        },
        {
            key: "update",
            value: function update() {
                this._topLeft = this[0];
                this._bottomRight = this[1];
                this._updateSize();
                return this;
            }
        }
    ], [
        {
            key: "fromBoundingRect",
            value: function fromBoundingRect(rect) {
                var b = new Bound(new Pt(rect.left || 0, rect.top || 0), new Pt(rect.right || 0, rect.bottom || 0));
                if (rect.width && rect.height) b.size = new Pt(rect.width, rect.height);
                return b;
            }
        },
        {
            key: "fromGroup",
            value: function fromGroup(g) {
                var _g = Util.iterToArray(g);
                if (_g.length < 2) throw new Error("Cannot create a Bound from a group that has less than 2 Pt");
                return new Bound(_g[0], _g[_g.length - 1]);
            }
        }
    ]);
    return Bound1;
}(Group);
// src/UI.ts
var UIShape = {
    rectangle: "rectangle",
    circle: "circle",
    polygon: "polygon",
    polyline: "polyline",
    line: "line"
};
var UIPointerActions = {
    up: "up",
    down: "down",
    move: "move",
    drag: "drag",
    uidrag: "uidrag",
    drop: "drop",
    uidrop: "uidrop",
    over: "over",
    out: "out",
    enter: "enter",
    leave: "leave",
    click: "click",
    keydown: "keydown",
    keyup: "keyup",
    contextmenu: "contextmenu",
    all: "all"
};
var _UI = /*#__PURE__*/ function() {
    "use strict";
    function _UI1(group, shape) {
        var states = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, id = arguments.length > 3 ? arguments[3] : void 0;
        _classCallCheck(this, _UI1);
        this._holds = /* @__PURE__ */ new Map();
        this._group = Group.fromArray(group);
        this._shape = shape;
        this._id = id === void 0 ? "ui_".concat(_UI._counter++) : id;
        this._states = states;
        this._actions = {};
    }
    _createClass(_UI1, [
        {
            key: "id",
            get: function get() {
                return this._id;
            },
            set: function set(d) {
                this._id = d;
            }
        },
        {
            key: "group",
            get: function get() {
                return this._group;
            },
            set: function set(d) {
                this._group = d;
            }
        },
        {
            key: "shape",
            get: function get() {
                return this._shape;
            },
            set: function set(d) {
                this._shape = d;
            }
        },
        {
            key: "state",
            value: function state(key, value) {
                if (!key) return null;
                if (value !== void 0) {
                    this._states[key] = value;
                    return this;
                }
                return this._states[key];
            }
        },
        {
            key: "on",
            value: function on(type, fn) {
                if (!this._actions[type]) this._actions[type] = [];
                return _UI._addHandler(this._actions[type], fn);
            }
        },
        {
            key: "off",
            value: function off(type, which) {
                if (!this._actions[type]) return false;
                if (which === void 0) {
                    delete this._actions[type];
                    return true;
                } else {
                    return _UI._removeHandler(this._actions[type], which);
                }
            }
        },
        {
            key: "listen",
            value: function listen(type, p, evt) {
                if (this._actions[type] !== void 0) {
                    if (this._within(p) || Array.from(this._holds.values()).indexOf(type) >= 0) {
                        _UI._trigger(this._actions[type], this, p, type, evt);
                        return true;
                    } else if (this._actions["all"]) {
                        _UI._trigger(this._actions["all"], this, p, type, evt);
                        return true;
                    }
                }
                return false;
            }
        },
        {
            key: "hold",
            value: function hold(type) {
                var _Math;
                var newKey = (_Math = Math).max.apply(_Math, [
                    0
                ].concat(_toConsumableArray(Array.from(this._holds.keys())))) + 1;
                this._holds.set(newKey, type);
                return newKey;
            }
        },
        {
            key: "unhold",
            value: function unhold(key) {
                if (key !== void 0) {
                    this._holds.delete(key);
                } else {
                    this._holds.clear();
                }
            }
        },
        {
            key: "render",
            value: function render(fn) {
                fn(this._group, this._states);
            }
        },
        {
            key: "toString",
            value: function toString() {
                return "UI ".concat(this.group.toString);
            }
        },
        {
            key: "_within",
            value: function _within(p) {
                var fn = null;
                if (this._shape === UIShape.rectangle) {
                    fn = Rectangle.withinBound;
                } else if (this._shape === UIShape.circle) {
                    fn = Circle.withinBound;
                } else if (this._shape === UIShape.polygon) {
                    fn = Polygon.hasIntersectPoint;
                } else {
                    return false;
                }
                return fn(this._group, p);
            }
        }
    ], [
        {
            key: "fromRectangle",
            value: function fromRectangle(group, states, id) {
                return new this(group, UIShape.rectangle, states, id);
            }
        },
        {
            key: "fromCircle",
            value: function fromCircle(group, states, id) {
                return new this(group, UIShape.circle, states, id);
            }
        },
        {
            key: "fromPolygon",
            value: function fromPolygon(group, states, id) {
                return new this(group, UIShape.polygon, states, id);
            }
        },
        {
            key: "fromUI",
            value: function fromUI(ui, states, id) {
                return new this(ui.group, ui.shape, states || ui._states, id);
            }
        },
        {
            key: "track",
            value: function track(uis, type, p, evt) {
                for(var i = 0, len = uis.length; i < len; i++){
                    uis[i].listen(type, p, evt);
                }
            }
        },
        {
            key: "_trigger",
            value: function _trigger(fns, target, pt, type, evt) {
                if (fns) {
                    for(var i = 0, len = fns.length; i < len; i++){
                        if (fns[i]) fns[i](target, pt, type, evt);
                    }
                }
            }
        },
        {
            key: "_addHandler",
            value: function _addHandler(fns, fn) {
                if (fn) {
                    fns.push(fn);
                    return fns.length - 1;
                } else {
                    return -1;
                }
            }
        },
        {
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
        }
    ]);
    return _UI1;
}();
var UI = _UI;
UI._counter = 0;
var UIButton = /*#__PURE__*/ function(UI1) {
    "use strict";
    _inherits(UIButton, UI1);
    var _super = _createSuper(UIButton);
    function UIButton(group, shape) {
        var states = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, id = arguments.length > 3 ? arguments[3] : void 0;
        _classCallCheck(this, UIButton);
        var _this;
        _this = _super.call(this, group, shape, states, id);
        _this._hoverID = -1;
        if (states.hover === void 0) _this._states["hover"] = false;
        if (states.clicks === void 0) _this._states["clicks"] = 0;
        var UA = UIPointerActions;
        _this.on(UA.up, function(target, pt, type, evt) {
            _this.state("clicks", _this._states.clicks + 1);
        });
        _this.on(UA.move, function(target, pt, type, evt) {
            var hover = _this._within(pt);
            if (hover && !_this._states.hover) {
                _this.state("hover", true);
                UI._trigger(_this._actions[UA.enter], _assertThisInitialized(_this), pt, UA.enter, evt);
                var _capID = _this.hold(UA.move);
                _this._hoverID = _this.on(UA.move, function(t, p) {
                    if (!_this._within(p) && !_this.state("dragging")) {
                        _this.state("hover", false);
                        UI._trigger(_this._actions[UA.leave], _assertThisInitialized(_this), pt, UA.leave, evt);
                        _this.off(UA.move, _this._hoverID);
                        _this.unhold(_capID);
                    }
                });
            }
        });
        return _this;
    }
    _createClass(UIButton, [
        {
            key: "onClick",
            value: function onClick(fn) {
                return this.on(UIPointerActions.up, fn);
            }
        },
        {
            key: "offClick",
            value: function offClick(id) {
                return this.off(UIPointerActions.up, id);
            }
        },
        {
            key: "onContextMenu",
            value: function onContextMenu(fn) {
                return this.on(UIPointerActions.contextmenu, fn);
            }
        },
        {
            key: "offContextMenu",
            value: function offContextMenu(id) {
                return this.off(UIPointerActions.contextmenu, id);
            }
        },
        {
            key: "onHover",
            value: function onHover(enter, leave) {
                var ids = [
                    void 0,
                    void 0
                ];
                if (enter) ids[0] = this.on(UIPointerActions.enter, enter);
                if (leave) ids[1] = this.on(UIPointerActions.leave, leave);
                return ids;
            }
        },
        {
            key: "offHover",
            value: function offHover(enterID, leaveID) {
                var s = [
                    false,
                    false
                ];
                if (enterID === void 0 || enterID >= 0) s[0] = this.off(UIPointerActions.enter, enterID);
                if (leaveID === void 0 || leaveID >= 0) s[1] = this.off(UIPointerActions.leave, leaveID);
                return s;
            }
        }
    ]);
    return UIButton;
}(UI);
var UIDragger = /*#__PURE__*/ function(UIButton) {
    "use strict";
    _inherits(UIDragger, UIButton);
    var _super = _createSuper(UIDragger);
    function UIDragger(group, shape) {
        var states = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, id = arguments.length > 3 ? arguments[3] : void 0;
        _classCallCheck(this, UIDragger);
        var _this;
        _this = _super.call(this, group, shape, states, id);
        _this._draggingID = -1;
        _this._moveHoldID = -1;
        _this._dropHoldID = -1;
        _this._upHoldID = -1;
        if (states.dragging === void 0) _this._states["dragging"] = false;
        if (states.moved === void 0) _this._states["moved"] = false;
        if (states.offset === void 0) _this._states["offset"] = new Pt();
        var UA = UIPointerActions;
        _this.on(UA.down, function(target, pt, type, evt) {
            if (_this._moveHoldID === -1) {
                _this.state("dragging", true);
                _this.state("offset", new Pt(pt).subtract(target.group[0]));
                _this._moveHoldID = _this.hold(UA.move);
            }
            if (_this._dropHoldID === -1) {
                _this._dropHoldID = _this.hold(UA.drop);
            }
            if (_this._upHoldID === -1) {
                _this._upHoldID = _this.hold(UA.up);
            }
            if (_this._draggingID === -1) {
                _this._draggingID = _this.on(UA.move, function(t, p) {
                    if (_this.state("dragging")) {
                        UI._trigger(_this._actions[UA.uidrag], t, p, UA.uidrag, evt);
                        _this.state("moved", true);
                    }
                });
            }
        });
        var endDrag = function(target, pt, type, evt) {
            _this.state("dragging", false);
            _this.off(UA.move, _this._draggingID);
            _this._draggingID = -1;
            _this.unhold(_this._moveHoldID);
            _this._moveHoldID = -1;
            _this.unhold(_this._dropHoldID);
            _this._dropHoldID = -1;
            _this.unhold(_this._upHoldID);
            _this._upHoldID = -1;
            if (_this.state("moved")) {
                UI._trigger(_this._actions[UA.uidrop], target, pt, UA.uidrop, evt);
                _this.state("moved", false);
            }
        };
        _this.on(UA.drop, endDrag);
        _this.on(UA.up, endDrag);
        _this.on(UA.out, endDrag);
        return _this;
    }
    _createClass(UIDragger, [
        {
            key: "onDrag",
            value: function onDrag(fn) {
                return this.on(UIPointerActions.uidrag, fn);
            }
        },
        {
            key: "offDrag",
            value: function offDrag(id) {
                return this.off(UIPointerActions.uidrag, id);
            }
        },
        {
            key: "onDrop",
            value: function onDrop(fn) {
                return this.on(UIPointerActions.uidrop, fn);
            }
        },
        {
            key: "offDrop",
            value: function offDrop(id) {
                return this.off(UIPointerActions.uidrop, id);
            }
        }
    ]);
    return UIDragger;
}(UIButton);
// src/Space.ts
var Space = /*#__PURE__*/ function() {
    "use strict";
    function Space() {
        _classCallCheck(this, Space);
        this.id = "space";
        this.bound = new Bound();
        this._time = {
            prev: 0,
            diff: 0,
            end: -1,
            min: 0
        };
        this.players = {};
        this.playerCount = 0;
        this._animID = -1;
        this._pause = false;
        this._refresh = void 0;
        this._pointer = new Pt();
        this._isReady = false;
        this._playing = false;
    }
    _createClass(Space, [
        {
            key: "refresh",
            value: function refresh(b) {
                this._refresh = b;
                return this;
            }
        },
        {
            key: "minFrameTime",
            value: function minFrameTime() {
                var ms = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0;
                this._time.min = ms;
            }
        },
        {
            key: "add",
            value: function add(p) {
                var player = typeof p == "function" ? {
                    animate: p
                } : p;
                var k = this.playerCount++;
                var pid = this.id + k;
                this.players[pid] = player;
                player.animateID = pid;
                if (player.resize && this.bound.inited) player.resize(this.bound);
                if (this._refresh === void 0) this._refresh = true;
                return this;
            }
        },
        {
            key: "remove",
            value: function remove(player) {
                delete this.players[player.animateID];
                return this;
            }
        },
        {
            key: "removeAll",
            value: function removeAll() {
                this.players = {};
                return this;
            }
        },
        {
            key: "play",
            value: function play() {
                var time = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0;
                if (time === 0 && this._animID !== -1) {
                    return;
                }
                this._animID = requestAnimationFrame(this.play.bind(this));
                if (this._pause) return this;
                this._time.diff = time - this._time.prev;
                if (this._time.diff < this._time.min) return this;
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
        },
        {
            key: "replay",
            value: function replay() {
                this._time.end = -1;
                this.play();
            }
        },
        {
            key: "playItems",
            value: function playItems(time) {
                this._playing = true;
                if (this._refresh) this.clear();
                if (this._isReady) {
                    for(var k in this.players){
                        if (this.players[k].animate) this.players[k].animate(time, this._time.diff, this);
                    }
                }
                if (this._time.end >= 0 && time > this._time.end) {
                    cancelAnimationFrame(this._animID);
                    this._animID = -1;
                    this._playing = false;
                }
            }
        },
        {
            key: "pause",
            value: function pause() {
                var toggle = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : false;
                this._pause = toggle ? !this._pause : true;
                return this;
            }
        },
        {
            key: "resume",
            value: function resume() {
                this._pause = false;
                return this;
            }
        },
        {
            key: "stop",
            value: function stop() {
                var t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0;
                this._time.end = t;
                return this;
            }
        },
        {
            key: "playOnce",
            value: function playOnce() {
                var duration = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0;
                this.play();
                this.stop(duration);
                return this;
            }
        },
        {
            key: "render",
            value: function render(context) {
                if (this._renderFunc) this._renderFunc(context, this);
                return this;
            }
        },
        {
            key: "customRendering",
            get: function get() {
                return this._renderFunc;
            },
            set: function set(f) {
                this._renderFunc = f;
            }
        },
        {
            key: "isPlaying",
            get: function get() {
                return this._playing;
            }
        },
        {
            key: "outerBound",
            get: function get() {
                return this.bound.clone();
            }
        },
        {
            key: "innerBound",
            get: function get() {
                return new Bound(Pt.make(this.size.length, 0), this.size.clone());
            }
        },
        {
            key: "size",
            get: function get() {
                return this.bound.size.clone();
            }
        },
        {
            key: "center",
            get: function get() {
                return this.size.divide(2);
            }
        },
        {
            key: "width",
            get: function get() {
                return this.bound.width;
            }
        },
        {
            key: "height",
            get: function get() {
                return this.bound.height;
            }
        }
    ]);
    return Space;
}();
var MultiTouchSpace = /*#__PURE__*/ function(Space) {
    "use strict";
    _inherits(MultiTouchSpace, Space);
    var _super = _createSuper(MultiTouchSpace);
    function MultiTouchSpace() {
        _classCallCheck(this, MultiTouchSpace);
        var _this;
        _this = _super.call.apply(_super, [
            this
        ].concat(Array.prototype.slice.call(arguments)));
        _this._pressed = false;
        _this._dragged = false;
        _this._hasMouse = false;
        _this._hasTouch = false;
        _this._hasKeyboard = false;
        return _this;
    }
    _createClass(MultiTouchSpace, [
        {
            key: "pointer",
            get: function get() {
                var p = this._pointer.clone();
                p.id = this._pointer.id;
                return p;
            }
        },
        {
            key: "bindCanvas",
            value: function bindCanvas(evt, callback) {
                var options = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, customTarget = arguments.length > 3 ? arguments[3] : void 0;
                var target = customTarget ? customTarget : this._canvas;
                target.addEventListener(evt, callback, options);
            }
        },
        {
            key: "unbindCanvas",
            value: function unbindCanvas(evt, callback) {
                var options = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, customTarget = arguments.length > 3 ? arguments[3] : void 0;
                var target = customTarget ? customTarget : this._canvas;
                target.removeEventListener(evt, callback, options);
            }
        },
        {
            key: "bindDoc",
            value: function bindDoc(evt, callback) {
                var options = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
                if (document) {
                    document.addEventListener(evt, callback, options);
                }
            }
        },
        {
            key: "unbindDoc",
            value: function unbindDoc(evt, callback) {
                var options = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
                if (document) {
                    document.removeEventListener(evt, callback, options);
                }
            }
        },
        {
            key: "bindMouse",
            value: function bindMouse() {
                var bind = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : true, customTarget = arguments.length > 1 ? arguments[1] : void 0;
                if (bind) {
                    this._mouseDown = this._mouseDown.bind(this);
                    this._mouseUp = this._mouseUp.bind(this);
                    this._mouseOver = this._mouseOver.bind(this);
                    this._mouseOut = this._mouseOut.bind(this);
                    this._mouseMove = this._mouseMove.bind(this);
                    this._mouseClick = this._mouseClick.bind(this);
                    this._contextMenu = this._contextMenu.bind(this);
                    this.bindCanvas("mousedown", this._mouseDown, {}, customTarget);
                    this.bindCanvas("mouseup", this._mouseUp, {}, customTarget);
                    this.bindCanvas("mouseover", this._mouseOver, {}, customTarget);
                    this.bindCanvas("mouseout", this._mouseOut, {}, customTarget);
                    this.bindCanvas("mousemove", this._mouseMove, {}, customTarget);
                    this.bindCanvas("click", this._mouseClick, {}, customTarget);
                    this.bindCanvas("contextmenu", this._contextMenu, {}, customTarget);
                    this._hasMouse = true;
                } else {
                    this.unbindCanvas("mousedown", this._mouseDown, {}, customTarget);
                    this.unbindCanvas("mouseup", this._mouseUp, {}, customTarget);
                    this.unbindCanvas("mouseover", this._mouseOver, {}, customTarget);
                    this.unbindCanvas("mouseout", this._mouseOut, {}, customTarget);
                    this.unbindCanvas("mousemove", this._mouseMove, {}, customTarget);
                    this.unbindCanvas("click", this._mouseClick, {}, customTarget);
                    this.unbindCanvas("contextmenu", this._contextMenu, {}, customTarget);
                    this._hasMouse = false;
                }
                return this;
            }
        },
        {
            key: "bindTouch",
            value: function bindTouch() {
                var bind = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : true, passive = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false, customTarget = arguments.length > 2 ? arguments[2] : void 0;
                if (bind) {
                    this.bindCanvas("touchstart", this._touchStart.bind(this), {
                        passive: passive
                    }, customTarget);
                    this.bindCanvas("touchend", this._mouseUp.bind(this), {}, customTarget);
                    this.bindCanvas("touchmove", this._touchMove.bind(this), {
                        passive: passive
                    }, customTarget);
                    this.bindCanvas("touchcancel", this._mouseOut.bind(this), {}, customTarget);
                    this._hasTouch = true;
                } else {
                    this.unbindCanvas("touchstart", this._touchStart.bind(this), {
                        passive: passive
                    }, customTarget);
                    this.unbindCanvas("touchend", this._mouseUp.bind(this), {}, customTarget);
                    this.unbindCanvas("touchmove", this._touchMove.bind(this), {
                        passive: passive
                    }, customTarget);
                    this.unbindCanvas("touchcancel", this._mouseOut.bind(this), {}, customTarget);
                    this._hasTouch = false;
                }
                return this;
            }
        },
        {
            key: "bindKeyboard",
            value: function bindKeyboard() {
                var bind = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : true;
                if (bind) {
                    this._keyDownBind = this._keyDown.bind(this);
                    this._keyUpBind = this._keyUp.bind(this);
                    this.bindDoc("keydown", this._keyDownBind, {});
                    this.bindDoc("keyup", this._keyUpBind, {});
                    this._hasKeyboard = true;
                } else {
                    this.unbindDoc("keydown", this._keyDownBind, {});
                    this.unbindDoc("keyup", this._keyUpBind, {});
                    this._hasKeyboard = false;
                }
                return this;
            }
        },
        {
            key: "touchesToPoints",
            value: function touchesToPoints(evt) {
                var which = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "touches";
                if (!evt || !evt[which]) return [];
                var ts = [];
                for(var i = 0; i < evt[which].length; i++){
                    var t = evt[which].item(i);
                    ts.push(new Pt(t.pageX - this.bound.topLeft.x, t.pageY - this.bound.topLeft.y));
                }
                return ts;
            }
        },
        {
            key: "_mouseAction",
            value: function _mouseAction(type, evt) {
                if (!this.isPlaying) return;
                var px = 0, py = 0;
                if (_instanceof(evt, MouseEvent)) {
                    for(var k in this.players){
                        if (this.players.hasOwnProperty(k)) {
                            var v = this.players[k];
                            px = evt.pageX - this.outerBound.x;
                            py = evt.pageY - this.outerBound.y;
                            if (v.action) v.action(type, px, py, evt);
                        }
                    }
                } else {
                    for(var k1 in this.players){
                        if (this.players.hasOwnProperty(k1)) {
                            var v1 = this.players[k1];
                            var c = evt.changedTouches && evt.changedTouches.length > 0;
                            var touch = evt.changedTouches.item(0);
                            px = c ? touch.pageX - this.outerBound.x : 0;
                            py = c ? touch.pageY - this.outerBound.y : 0;
                            if (v1.action) v1.action(type, px, py, evt);
                        }
                    }
                }
                if (type) {
                    this._pointer.to(px, py);
                    this._pointer.id = type;
                }
            }
        },
        {
            key: "_mouseDown",
            value: function _mouseDown(evt) {
                this._mouseAction(UIPointerActions.down, evt);
                this._pressed = true;
                return false;
            }
        },
        {
            key: "_mouseUp",
            value: function _mouseUp(evt) {
                if (this._dragged) {
                    this._mouseAction(UIPointerActions.drop, evt);
                } else {
                    this._mouseAction(UIPointerActions.up, evt);
                }
                this._pressed = false;
                this._dragged = false;
                return false;
            }
        },
        {
            key: "_mouseMove",
            value: function _mouseMove(evt) {
                this._mouseAction(UIPointerActions.move, evt);
                if (this._pressed) {
                    this._dragged = true;
                    this._mouseAction(UIPointerActions.drag, evt);
                }
                return false;
            }
        },
        {
            key: "_mouseOver",
            value: function _mouseOver(evt) {
                this._mouseAction(UIPointerActions.over, evt);
                return false;
            }
        },
        {
            key: "_mouseOut",
            value: function _mouseOut(evt) {
                this._mouseAction(UIPointerActions.out, evt);
                if (this._dragged) this._mouseAction(UIPointerActions.drop, evt);
                this._dragged = false;
                return false;
            }
        },
        {
            key: "_mouseClick",
            value: function _mouseClick(evt) {
                this._mouseAction(UIPointerActions.click, evt);
                this._pressed = false;
                this._dragged = false;
                return false;
            }
        },
        {
            key: "_contextMenu",
            value: function _contextMenu(evt) {
                this._mouseAction(UIPointerActions.contextmenu, evt);
                return false;
            }
        },
        {
            key: "_touchMove",
            value: function _touchMove(evt) {
                this._mouseMove(evt);
                evt.preventDefault();
                return false;
            }
        },
        {
            key: "_touchStart",
            value: function _touchStart(evt) {
                this._mouseDown(evt);
                evt.preventDefault();
                return false;
            }
        },
        {
            key: "_keyDown",
            value: function _keyDown(evt) {
                this._keyboardAction(UIPointerActions.keydown, evt);
                return false;
            }
        },
        {
            key: "_keyUp",
            value: function _keyUp(evt) {
                this._keyboardAction(UIPointerActions.keyup, evt);
                return false;
            }
        },
        {
            key: "_keyboardAction",
            value: function _keyboardAction(type, evt) {
                if (!this.isPlaying) return;
                for(var k in this.players){
                    if (this.players.hasOwnProperty(k)) {
                        var v = this.players[k];
                        if (v.action) v.action(type, evt.shiftKey ? 1 : 0, evt.altKey ? 1 : 0, evt);
                    }
                }
            }
        }
    ]);
    return MultiTouchSpace;
}(Space);
// src/Form.ts
var Form = /*#__PURE__*/ function() {
    "use strict";
    function Form() {
        _classCallCheck(this, Form);
        this._ready = false;
    }
    _createClass(Form, [
        {
            key: "ready",
            get: function get() {
                return this._ready;
            }
        }
    ]);
    return Form;
}();
var VisualForm = /*#__PURE__*/ function(Form) {
    "use strict";
    _inherits(VisualForm, Form);
    var _super = _createSuper(VisualForm);
    function VisualForm() {
        _classCallCheck(this, VisualForm);
        var _this;
        _this = _super.call.apply(_super, [
            this
        ].concat(Array.prototype.slice.call(arguments)));
        _this._filled = true;
        _this._stroked = true;
        _this._font = new Font(14, "sans-serif");
        return _this;
    }
    _createClass(VisualForm, [
        {
            key: "filled",
            get: function get() {
                return this._filled;
            },
            set: function set(b) {
                this._filled = b;
            }
        },
        {
            key: "stroked",
            get: function get() {
                return this._stroked;
            },
            set: function set(b) {
                this._stroked = b;
            }
        },
        {
            key: "currentFont",
            get: function get() {
                return this._font;
            }
        },
        {
            key: "_multiple",
            value: function _multiple(groups, shape) {
                for(var _len = arguments.length, rest = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++){
                    rest[_key - 2] = arguments[_key];
                }
                if (!groups) return this;
                for(var i = 0, len = groups.length; i < len; i++){
                    this[shape].apply(this, [
                        groups[i]
                    ].concat(_toConsumableArray(rest)));
                }
                return this;
            }
        },
        {
            key: "alpha",
            value: function alpha(a) {
                return this;
            }
        },
        {
            key: "fill",
            value: function fill(c) {
                return this;
            }
        },
        {
            key: "fillOnly",
            value: function fillOnly(c) {
                this.stroke(false);
                return this.fill(c);
            }
        },
        {
            key: "stroke",
            value: function stroke(c, width, linejoin, linecap) {
                return this;
            }
        },
        {
            key: "strokeOnly",
            value: function strokeOnly(c, width, linejoin, linecap) {
                this.fill(false);
                return this.stroke(c, width, linejoin, linecap);
            }
        },
        {
            key: "points",
            value: function points(pts, radius, shape) {
                if (!pts) return;
                for(var i = 0, len = pts.length; i < len; i++){
                    this.point(pts[i], radius, shape);
                }
                return this;
            }
        },
        {
            key: "circles",
            value: function circles(groups) {
                return this._multiple(groups, "circle");
            }
        },
        {
            key: "squares",
            value: function squares(groups) {
                return this._multiple(groups, "square");
            }
        },
        {
            key: "lines",
            value: function lines(groups) {
                return this._multiple(groups, "line");
            }
        },
        {
            key: "polygons",
            value: function polygons(groups) {
                return this._multiple(groups, "polygon");
            }
        },
        {
            key: "rects",
            value: function rects(groups) {
                return this._multiple(groups, "rect");
            }
        }
    ]);
    return VisualForm;
}(Form);
var Font = /*#__PURE__*/ function() {
    "use strict";
    function Font() {
        var size = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 12, face = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "sans-serif", weight = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "", style = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : "", lineHeight = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : 1.5;
        _classCallCheck(this, Font);
        this.size = size;
        this.face = face;
        this.style = style;
        this.weight = weight;
        this.lineHeight = lineHeight;
    }
    _createClass(Font, [
        {
            key: "value",
            get: function get() {
                return "".concat(this.style, " ").concat(this.weight, " ").concat(this.size, "px/").concat(this.lineHeight, " ").concat(this.face);
            }
        },
        {
            key: "toString",
            value: function toString() {
                return this.value;
            }
        }
    ]);
    return Font;
}();
// src/Typography.ts
var Typography = /*#__PURE__*/ function() {
    "use strict";
    function Typography() {
        _classCallCheck(this, Typography);
    }
    _createClass(Typography, null, [
        {
            key: "textWidthEstimator",
            value: function textWidthEstimator(fn) {
                var samples = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : [
                    "M",
                    "n",
                    "."
                ], distribution = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : [
                    0.06,
                    0.8,
                    0.14
                ];
                var m = samples.map(fn);
                var avg = new Pt(distribution).dot(m);
                return function(str) {
                    return str.length * avg;
                };
            }
        },
        {
            key: "truncate",
            value: function truncate(fn, str, width) {
                var tail = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : "";
                var trim = Math.floor(str.length * Math.min(1, width / fn(str)));
                if (trim < str.length) {
                    trim = Math.max(0, trim - tail.length);
                    return [
                        str.substr(0, trim) + tail,
                        trim
                    ];
                } else {
                    return [
                        str,
                        str.length
                    ];
                }
            }
        },
        {
            key: "fontSizeToBox",
            value: function fontSizeToBox(box) {
                var ratio = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1, byHeight = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : true;
                var bound = Bound.fromGroup(box);
                var h = byHeight ? bound.height : bound.width;
                var f = ratio * h;
                return function(box2) {
                    var bound2 = Bound.fromGroup(box2);
                    var nh = (byHeight ? bound2.height : bound2.width) / h;
                    return f * nh;
                };
            }
        },
        {
            key: "fontSizeToThreshold",
            value: function fontSizeToThreshold(threshold) {
                var direction = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
                return function(defaultSize, val) {
                    var d = defaultSize * val / threshold;
                    if (direction < 0) return Math.min(d, defaultSize);
                    if (direction > 0) return Math.max(d, defaultSize);
                    return d;
                };
            }
        }
    ]);
    return Typography;
}();
// src/Image.ts
var Img = /*#__PURE__*/ function() {
    "use strict";
    function Img1() {
        var editable = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : false, space = arguments.length > 1 ? arguments[1] : void 0, crossOrigin = arguments.length > 2 ? arguments[2] : void 0;
        _classCallCheck(this, Img1);
        this._scale = 1;
        this._loaded = false;
        this._editable = editable;
        this._space = space;
        this._scale = this._space ? this._space.pixelScale : 1;
        this._img = new Image();
        if (crossOrigin) this._img.crossOrigin = "Anonymous";
    }
    _createClass(Img1, [
        {
            key: "load",
            value: function load(src) {
                var _this = this;
                return new Promise(function(resolve, reject) {
                    if (_this._editable && !document) {
                        reject("Cannot create html canvas element. document not found.");
                    }
                    _this._img.src = src;
                    _this._img.onload = function() {
                        if (_this._editable) {
                            if (!_this._cv) _this._cv = document.createElement("canvas");
                            _this._drawToScale(_this._scale, _this._img);
                            _this._data = _this._ctx.getImageData(0, 0, _this._cv.width, _this._cv.height);
                        }
                        _this._loaded = true;
                        resolve(_this);
                    };
                    _this._img.onerror = function(evt) {
                        reject(evt);
                    };
                });
            }
        },
        {
            key: "_drawToScale",
            value: function _drawToScale(canvasScale, img) {
                var nw = img.width;
                var nh = img.height;
                this.initCanvas(nw, nh, canvasScale);
                if (img) this._ctx.drawImage(img, 0, 0, nw, nh, 0, 0, this._cv.width, this._cv.height);
            }
        },
        {
            key: "initCanvas",
            value: function initCanvas(width, height) {
                var canvasScale = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 1;
                if (!this._editable) {
                    console.error("Cannot initiate canvas because this Img is not set to be editable");
                    return;
                }
                if (!this._cv) this._cv = document.createElement("canvas");
                var cms = typeof canvasScale === "number" ? [
                    canvasScale,
                    canvasScale
                ] : canvasScale;
                this._cv.width = width * cms[0];
                this._cv.height = height * cms[1];
                this._ctx = this._cv.getContext("2d");
                this._loaded = true;
            }
        },
        {
            key: "bitmap",
            value: function bitmap(size) {
                var w = size ? size[0] : this._cv.width;
                var h = size ? size[1] : this._cv.height;
                return createImageBitmap(this._cv, 0, 0, w, h);
            }
        },
        {
            key: "pattern",
            value: function pattern() {
                var reptition = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "repeat", dynamic = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
                if (!this._space) throw "Cannot find CanvasSpace ctx to create image pattern";
                return this._space.ctx.createPattern(dynamic ? this._cv : this._img, reptition);
            }
        },
        {
            key: "sync",
            value: function sync() {
                var _this = this;
                if (this._scale !== 1) {
                    this.bitmap().then(function(b) {
                        _this._drawToScale(1 / _this._scale, b);
                        _this.load(_this.toBase64());
                    });
                } else {
                    this._img.src = this.toBase64();
                }
            }
        },
        {
            key: "pixel",
            value: function pixel(p) {
                var rescale = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : true;
                var s = typeof rescale == "number" ? rescale : rescale ? this._scale : 1;
                return Img.getPixel(this._data, [
                    p[0] * s,
                    p[1] * s
                ]);
            }
        },
        {
            key: "resize",
            value: function resize(sizeOrScale) {
                var asScale = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
                var s = asScale ? sizeOrScale : [
                    sizeOrScale[0] / this._img.naturalWidth,
                    sizeOrScale[1] / this._img.naturalHeight
                ];
                this._drawToScale(s, this._img);
                this._data = this._ctx.getImageData(0, 0, this._cv.width, this._cv.height);
                return this;
            }
        },
        {
            key: "crop",
            value: function crop(box) {
                var p = box.topLeft.scale(this._scale);
                var s = box.size.scale(this._scale);
                return this._ctx.getImageData(p.x, p.y, s.x, s.y);
            }
        },
        {
            key: "filter",
            value: function filter(css) {
                this._ctx.filter = css;
                this._ctx.drawImage(this._cv, 0, 0);
                this._ctx.filter = "none";
                return this;
            }
        },
        {
            key: "cleanup",
            value: function cleanup() {
                if (this._cv) this._cv.remove();
                if (this._img) this._img.remove();
                this._data = null;
            }
        },
        {
            key: "toBase64",
            value: function toBase64() {
                return this._cv.toDataURL();
            }
        },
        {
            key: "toBlob",
            value: function toBlob() {
                var _this = this;
                return new Promise(function(resolve) {
                    _this._cv.toBlob(function(blob) {
                        return resolve(blob);
                    });
                });
            }
        },
        {
            key: "getForm",
            value: function getForm() {
                if (!this._editable) {
                    console.error("Cannot get a CanvasForm because this Img is not editable");
                }
                return this._ctx ? new CanvasForm(this._ctx) : void 0;
            }
        },
        {
            key: "current",
            get: function get() {
                return this._editable ? this._cv : this._img;
            }
        },
        {
            key: "image",
            get: function get() {
                return this._img;
            }
        },
        {
            key: "canvas",
            get: function get() {
                return this._cv;
            }
        },
        {
            key: "data",
            get: function get() {
                return this._data;
            }
        },
        {
            key: "ctx",
            get: function get() {
                return this._ctx;
            }
        },
        {
            key: "loaded",
            get: function get() {
                return this._loaded;
            }
        },
        {
            key: "pixelScale",
            get: function get() {
                return this._scale;
            }
        },
        {
            key: "imageSize",
            get: function get() {
                if (!this._img.width || !this._img.height) {
                    return this.canvasSize.$divide(this._scale);
                } else {
                    return new Pt(this._img.width, this._img.height);
                }
            }
        },
        {
            key: "canvasSize",
            get: function get() {
                return new Pt(this._cv.width, this._cv.height);
            }
        },
        {
            key: "scaledMatrix",
            get: function get() {
                var s = 1 / this._scale;
                return new Mat().scale2D([
                    s,
                    s
                ]);
            }
        }
    ], [
        {
            key: "load",
            value: function load(src) {
                var editable = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false, space = arguments.length > 2 ? arguments[2] : void 0, ready = arguments.length > 3 ? arguments[3] : void 0;
                var img = new Img(editable, space);
                img.load(src).then(function(res) {
                    if (ready) ready(res);
                });
                return img;
            }
        },
        {
            key: "loadAsync",
            value: function loadAsync(src) {
                var editable = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false, space = arguments.length > 2 ? arguments[2] : void 0;
                return _asyncToGenerator(function() {
                    var img;
                    return __generator(this, function(_state) {
                        switch(_state.label){
                            case 0:
                                return [
                                    4,
                                    new Img(editable, space).load(src)
                                ];
                            case 1:
                                img = _state.sent();
                                return [
                                    2,
                                    img
                                ];
                        }
                    });
                })();
            }
        },
        {
            key: "loadPattern",
            value: function loadPattern(src, space) {
                var repeat = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "repeat", editable = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : false;
                return _asyncToGenerator(function() {
                    var img;
                    return __generator(this, function(_state) {
                        switch(_state.label){
                            case 0:
                                return [
                                    4,
                                    Img.loadAsync(src, editable, space)
                                ];
                            case 1:
                                img = _state.sent();
                                return [
                                    2,
                                    img.pattern(repeat)
                                ];
                        }
                    });
                })();
            }
        },
        {
            key: "blank",
            value: function blank(size, space, scale) {
                var img = new Img(true, space);
                var s = scale ? scale : space.pixelScale;
                img.initCanvas(size[0], size[1], s);
                return img;
            }
        },
        {
            key: "getPixel",
            value: function getPixel(imgData, p) {
                var no = new Pt(0, 0, 0, 0);
                if (p[0] >= imgData.width || p[1] >= imgData.height) return no;
                var i = Math.floor(p[1]) * (imgData.width * 4) + Math.floor(p[0]) * 4;
                var d = imgData.data;
                if (i >= d.length - 4) return no;
                return new Pt(d[i], d[i + 1], d[i + 2], d[i + 3]);
            }
        },
        {
            key: "fromBlob",
            value: function fromBlob(blob) {
                var editable = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false, space = arguments.length > 2 ? arguments[2] : void 0;
                var url = URL.createObjectURL(blob);
                return new Img(editable, space).load(url);
            }
        },
        {
            key: "imageDataToBlob",
            value: function imageDataToBlob(data) {
                return new Promise(function(resolve, reject) {
                    if (!document) {
                        reject("Cannot create html canvas element. document not found.");
                    }
                    var cv = document.createElement("canvas");
                    cv.width = data.width;
                    cv.height = data.height;
                    cv.getContext("2d").putImageData(data, 0, 0);
                    cv.toBlob(function(blob) {
                        resolve(blob);
                        cv.remove();
                    });
                });
            }
        }
    ]);
    return Img1;
}();
// src/Canvas.ts
var CanvasSpace2 = /*#__PURE__*/ function(MultiTouchSpace) {
    "use strict";
    _inherits(CanvasSpace2, MultiTouchSpace);
    var _super = _createSuper(CanvasSpace2);
    function CanvasSpace2(elem, callback) {
        _classCallCheck(this, CanvasSpace2);
        var _this;
        _this = _super.call(this);
        _this._pixelScale = 1;
        _this._autoResize = true;
        _this._bgcolor = "#e1e9f0";
        _this._offscreen = false;
        _this._initialResize = false;
        var _selector = null;
        var _existed = false;
        _this.id = "pt";
        if (_instanceof(elem, Element)) {
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
        setTimeout(_this._ready.bind(_assertThisInitialized(_this), callback), 100);
        _this._ctx = _this._canvas.getContext("2d");
        return _this;
    }
    _createClass(CanvasSpace2, [
        {
            key: "_createElement",
            value: function _createElement() {
                var elem = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "div", id = arguments.length > 1 ? arguments[1] : void 0;
                var d = document.createElement(elem);
                d.setAttribute("id", id);
                return d;
            }
        },
        {
            key: "_ready",
            value: function _ready(callback) {
                if (!this._container) throw new Error("Cannot initiate #".concat(this.id, " element"));
                this._isReady = true;
                this._resizeHandler(null);
                this.clear(this._bgcolor);
                this._canvas.dispatchEvent(new Event("ready"));
                for(var k in this.players){
                    if (this.players.hasOwnProperty(k)) {
                        if (this.players[k].start) this.players[k].start(this.bound.clone(), this);
                    }
                }
                this._pointer = this.center;
                this._initialResize = false;
                if (callback) callback(this.bound, this._canvas);
            }
        },
        {
            key: "setup",
            value: function setup(opt) {
                this._bgcolor = opt.bgcolor ? opt.bgcolor : "transparent";
                this.autoResize = opt.resize != void 0 ? opt.resize : false;
                if (opt.retina !== false) {
                    var r1 = window ? window.devicePixelRatio || 1 : 1;
                    var r2 = this._ctx.webkitBackingStorePixelRatio || this._ctx.mozBackingStorePixelRatio || this._ctx.msBackingStorePixelRatio || this._ctx.oBackingStorePixelRatio || this._ctx.backingStorePixelRatio || 1;
                    this._pixelScale = Math.max(1, r1 / r2);
                }
                if (opt.offscreen) {
                    this._offscreen = true;
                    this._offCanvas = this._createElement("canvas", this.id + "_offscreen");
                    this._offCtx = this._offCanvas.getContext("2d");
                } else {
                    this._offscreen = false;
                }
                if (opt.pixelDensity) {
                    this._pixelScale = opt.pixelDensity;
                }
                return this;
            }
        },
        {
            key: "autoResize",
            get: function get() {
                return this._autoResize;
            },
            set: function set(auto) {
                if (!window) return;
                this._autoResize = auto;
                if (auto) {
                    window.addEventListener("resize", this._resizeHandler.bind(this));
                } else {
                    window.removeEventListener("resize", this._resizeHandler.bind(this));
                }
            }
        },
        {
            key: "resize",
            value: function resize(b, evt) {
                this.bound = b;
                this._canvas.width = Math.ceil(this.bound.size.x) * this._pixelScale;
                this._canvas.height = Math.ceil(this.bound.size.y) * this._pixelScale;
                this._canvas.style.width = Math.ceil(this.bound.size.x) + "px";
                this._canvas.style.height = Math.ceil(this.bound.size.y) + "px";
                if (this._offscreen) {
                    this._offCanvas.width = Math.ceil(this.bound.size.x) * this._pixelScale;
                    this._offCanvas.height = Math.ceil(this.bound.size.y) * this._pixelScale;
                }
                if (this._pixelScale != 1) {
                    this._ctx.scale(this._pixelScale, this._pixelScale);
                    if (this._offscreen) {
                        this._offCtx.scale(this._pixelScale, this._pixelScale);
                    }
                }
                for(var k in this.players){
                    if (this.players.hasOwnProperty(k)) {
                        var p = this.players[k];
                        if (p.resize) p.resize(this.bound, evt);
                    }
                }
                this.render(this._ctx);
                if (evt && !this.isPlaying) this.playOnce(0);
                return this;
            }
        },
        {
            key: "_resizeHandler",
            value: function _resizeHandler(evt) {
                if (!window) return;
                var b = this._autoResize || this._initialResize ? this._container.getBoundingClientRect() : this._canvas.getBoundingClientRect();
                if (b) {
                    var box = Bound.fromBoundingRect(b);
                    box.center = box.center.add(window.pageXOffset, window.pageYOffset);
                    this.resize(box, evt);
                }
            }
        },
        {
            key: "background",
            get: function get() {
                return this._bgcolor;
            },
            set: function set(bg) {
                this._bgcolor = bg;
            }
        },
        {
            key: "pixelScale",
            get: function get() {
                return this._pixelScale;
            }
        },
        {
            key: "hasOffscreen",
            get: function get() {
                return this._offscreen;
            }
        },
        {
            key: "offscreenCtx",
            get: function get() {
                return this._offCtx;
            }
        },
        {
            key: "offscreenCanvas",
            get: function get() {
                return this._offCanvas;
            }
        },
        {
            key: "getForm",
            value: function getForm() {
                return new CanvasForm(this);
            }
        },
        {
            key: "element",
            get: function get() {
                return this._canvas;
            }
        },
        {
            key: "parent",
            get: function get() {
                return this._container;
            }
        },
        {
            key: "ready",
            get: function get() {
                return this._isReady;
            }
        },
        {
            key: "ctx",
            get: function get() {
                return this._ctx;
            }
        },
        {
            key: "clear",
            value: function clear(bg) {
                if (bg) this._bgcolor = bg;
                var lastColor = this._ctx.fillStyle;
                var px = Math.ceil(this.pixelScale);
                if (!this._bgcolor || this._bgcolor === "transparent") {
                    this._ctx.clearRect(-px, -px, this._canvas.width + px, this._canvas.height + px);
                } else {
                    if (this._bgcolor.indexOf("rgba") === 0 || this._bgcolor.length === 9 && this._bgcolor.indexOf("#") === 0) {
                        this._ctx.clearRect(-px, -px, this._canvas.width + px, this._canvas.height + px);
                    }
                    this._ctx.fillStyle = this._bgcolor;
                    this._ctx.fillRect(-px, -px, this._canvas.width + px, this._canvas.height + px);
                }
                this._ctx.fillStyle = lastColor;
                return this;
            }
        },
        {
            key: "clearOffscreen",
            value: function clearOffscreen(bg) {
                if (this._offscreen) {
                    var px = Math.ceil(this.pixelScale);
                    if (bg) {
                        this._offCtx.fillStyle = bg;
                        this._offCtx.fillRect(-px, -px, this._canvas.width + px, this._canvas.height + px);
                    } else {
                        this._offCtx.clearRect(-px, -px, this._offCanvas.width + px, this._offCanvas.height + px);
                    }
                }
                return this;
            }
        },
        {
            key: "playItems",
            value: function playItems(time) {
                if (this._isReady) {
                    this._ctx.save();
                    if (this._offscreen) this._offCtx.save();
                    _get(_getPrototypeOf(CanvasSpace2.prototype), "playItems", this).call(this, time);
                    this._ctx.restore();
                    if (this._offscreen) this._offCtx.restore();
                    this.render(this._ctx);
                }
            }
        },
        {
            key: "dispose",
            value: function dispose() {
                if (!window) return;
                window.removeEventListener("resize", this._resizeHandler.bind(this));
                this.stop();
                this.removeAll();
                return this;
            }
        },
        {
            key: "recorder",
            value: function recorder(downloadOrCallback) {
                var filetype = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "webm", bitrate = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 15e6;
                var stream = this._canvas.captureStream();
                var recorder1 = new MediaRecorder(stream, {
                    mimeType: "video/".concat(filetype),
                    bitsPerSecond: bitrate
                });
                recorder1.ondataavailable = function(d) {
                    var url = URL.createObjectURL(new Blob([
                        d.data
                    ], {
                        type: "video/".concat(filetype)
                    }));
                    if (typeof downloadOrCallback === "function") {
                        downloadOrCallback(url);
                    } else if (downloadOrCallback) {
                        var a = document.createElement("a");
                        a.href = url;
                        a.download = "canvas_video.".concat(filetype);
                        a.click();
                        a.remove();
                    }
                };
                return recorder1;
            }
        }
    ]);
    return CanvasSpace2;
}(MultiTouchSpace);
var CanvasForm = /*#__PURE__*/ function(VisualForm) {
    "use strict";
    _inherits(CanvasForm1, VisualForm);
    var _super = _createSuper(CanvasForm1);
    function CanvasForm1(space) {
        _classCallCheck(this, CanvasForm1);
        var _this;
        _this = _super.call(this);
        _this._style = {
            fillStyle: "#f03",
            strokeStyle: "#fff",
            lineWidth: 1,
            lineJoin: "bevel",
            lineCap: "butt",
            globalAlpha: 1
        };
        if (!space) return _possibleConstructorReturn(_this, _assertThisInitialized(_this));
        var _setup = function(ctx) {
            _this._ctx = ctx;
            _this._ctx.fillStyle = _this._style.fillStyle;
            _this._ctx.strokeStyle = _this._style.strokeStyle;
            _this._ctx.lineJoin = "bevel";
            _this._ctx.font = _this._font.value;
            _this._ready = true;
        };
        if (_instanceof(space, CanvasRenderingContext2D)) {
            _setup(space);
        } else {
            _this._space = space;
            _this._space.add({
                start: function() {
                    _setup(_this._space.ctx);
                }
            });
        }
        return _this;
    }
    _createClass(CanvasForm1, [
        {
            key: "space",
            get: function get() {
                return this._space;
            }
        },
        {
            key: "ctx",
            get: function get() {
                return this._ctx;
            }
        },
        {
            key: "useOffscreen",
            value: function useOffscreen() {
                var off = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : true, clear = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
                if (clear) this._space.clearOffscreen(typeof clear == "string" ? clear : null);
                this._ctx = this._space.hasOffscreen && off ? this._space.offscreenCtx : this._space.ctx;
                return this;
            }
        },
        {
            key: "renderOffscreen",
            value: function renderOffscreen() {
                var offset = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [
                    0,
                    0
                ];
                if (this._space.hasOffscreen) {
                    this._space.ctx.drawImage(this._space.offscreenCanvas, offset[0], offset[1], this._space.width, this._space.height);
                }
            }
        },
        {
            key: "alpha",
            value: function alpha(a) {
                this._ctx.globalAlpha = a;
                this._style.globalAlpha = a;
                return this;
            }
        },
        {
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
        },
        {
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
        },
        {
            key: "applyFillStroke",
            value: function applyFillStroke() {
                var filled = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : true, stroked = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : true, strokeWidth = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 1;
                if (filled) {
                    if (typeof filled === "string") this.fill(filled);
                    this._ctx.fill();
                }
                if (stroked) {
                    if (typeof stroked === "string") this.stroke(stroked, strokeWidth);
                    this._ctx.stroke();
                }
                return this;
            }
        },
        {
            key: "gradient",
            value: function gradient(stops) {
                var _this = this;
                var vals = [];
                if (stops.length < 2) stops.push([
                    0.99,
                    "#000"
                ], [
                    1,
                    "#000"
                ]);
                for(var i = 0, len = stops.length; i < len; i++){
                    var t = typeof stops[i] === "string" ? i * (1 / (stops.length - 1)) : stops[i][0];
                    var v = typeof stops[i] === "string" ? stops[i] : stops[i][1];
                    vals.push([
                        t,
                        v
                    ]);
                }
                return function(area1, area2) {
                    area1 = area1.map(function(a) {
                        return a.abs();
                    });
                    if (area2) area2.map(function(a) {
                        return a.abs();
                    });
                    var grad = area2 ? _this._ctx.createRadialGradient(area1[0][0], area1[0][1], area1[1][0], area2[0][0], area2[0][1], area2[1][0]) : _this._ctx.createLinearGradient(area1[0][0], area1[0][1], area1[1][0], area1[1][1]);
                    for(var i = 0, len = vals.length; i < len; i++){
                        grad.addColorStop(vals[i][0], vals[i][1]);
                    }
                    return grad;
                };
            }
        },
        {
            key: "composite",
            value: function composite() {
                var mode = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "source-over";
                this._ctx.globalCompositeOperation = mode;
                return this;
            }
        },
        {
            key: "clip",
            value: function clip() {
                this._ctx.clip();
                return this;
            }
        },
        {
            key: "dash",
            value: function dash() {
                var segments = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : true, offset = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
                if (!segments) {
                    this._ctx.setLineDash([]);
                    this._ctx.lineDashOffset = 0;
                } else {
                    if (segments === true) {
                        segments = [
                            5,
                            5
                        ];
                    }
                    this._ctx.setLineDash([
                        segments[0],
                        segments[1]
                    ]);
                    this._ctx.lineDashOffset = offset;
                }
                return this;
            }
        },
        {
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
        },
        {
            key: "fontWidthEstimate",
            value: function fontWidthEstimate() {
                var estimate = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : true;
                var _this = this;
                this._estimateTextWidth = estimate ? Typography.textWidthEstimator(function(c) {
                    return _this._ctx.measureText(c).width;
                }) : void 0;
                return this;
            }
        },
        {
            key: "getTextWidth",
            value: function getTextWidth(c) {
                return !this._estimateTextWidth ? this._ctx.measureText(c + " .").width : this._estimateTextWidth(c);
            }
        },
        {
            key: "_textTruncate",
            value: function _textTruncate(str, width) {
                var tail = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "";
                return Typography.truncate(this.getTextWidth.bind(this), str, width, tail);
            }
        },
        {
            key: "_textAlign",
            value: function _textAlign(box, vertical, offset, center) {
                var _box = Util.iterToArray(box);
                if (!Util.arrayCheck(_box)) return;
                if (!center) center = Rectangle.center(_box);
                var px = _box[0][0];
                if (this._ctx.textAlign == "end" || this._ctx.textAlign == "right") {
                    px = _box[1][0];
                } else if (this._ctx.textAlign == "center" || this._ctx.textAlign == "middle") {
                    px = center[0];
                }
                var py = center[1];
                if (vertical == "top" || vertical == "start") {
                    py = _box[0][1];
                } else if (vertical == "end" || vertical == "bottom") {
                    py = _box[1][1];
                }
                return offset ? new Pt(px + offset[0], py + offset[1]) : new Pt(px, py);
            }
        },
        {
            key: "reset",
            value: function reset() {
                for(var k in this._style){
                    if (this._style.hasOwnProperty(k)) {
                        this._ctx[k] = this._style[k];
                    }
                }
                this._font = new Font();
                this._ctx.font = this._font.value;
                return this;
            }
        },
        {
            key: "_paint",
            value: function _paint() {
                if (this._filled) this._ctx.fill();
                if (this._stroked) this._ctx.stroke();
            }
        },
        {
            key: "point",
            value: function point(p) {
                var radius = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 5, shape = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "square";
                CanvasForm.point(this._ctx, p, radius, shape);
                this._paint();
                return this;
            }
        },
        {
            key: "circle",
            value: function circle(pts) {
                var p = Util.iterToArray(pts);
                CanvasForm.circle(this._ctx, p[0], p[1][0]);
                this._paint();
                return this;
            }
        },
        {
            key: "ellipse",
            value: function ellipse(pt, radius) {
                var rotation = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 0, startAngle = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 0, endAngle = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : Const.two_pi, cc = arguments.length > 5 && arguments[5] !== void 0 ? arguments[5] : false;
                CanvasForm.ellipse(this._ctx, pt, radius, rotation, startAngle, endAngle, cc);
                this._paint();
                return this;
            }
        },
        {
            key: "arc",
            value: function arc(pt, radius, startAngle, endAngle, cc) {
                CanvasForm.arc(this._ctx, pt, radius, startAngle, endAngle, cc);
                this._paint();
                return this;
            }
        },
        {
            key: "square",
            value: function square(pt, halfsize) {
                CanvasForm.square(this._ctx, pt, halfsize);
                this._paint();
                return this;
            }
        },
        {
            key: "line",
            value: function line(pts) {
                CanvasForm.line(this._ctx, pts);
                this._paint();
                return this;
            }
        },
        {
            key: "polygon",
            value: function polygon(pts) {
                CanvasForm.polygon(this._ctx, pts);
                this._paint();
                return this;
            }
        },
        {
            key: "rect",
            value: function rect(pts) {
                CanvasForm.rect(this._ctx, pts);
                this._paint();
                return this;
            }
        },
        {
            key: "image",
            value: function image(ptOrRect, img, orig) {
                if (_instanceof(img, Img)) {
                    if (img.loaded) {
                        CanvasForm.image(this._ctx, ptOrRect, img.image, orig);
                    }
                } else {
                    CanvasForm.image(this._ctx, ptOrRect, img, orig);
                }
                return this;
            }
        },
        {
            key: "imageData",
            value: function imageData(ptOrRect, img) {
                CanvasForm.imageData(this._ctx, ptOrRect, img);
                return this;
            }
        },
        {
            key: "text",
            value: function text(pt, txt, maxWidth) {
                CanvasForm.text(this._ctx, pt, txt, maxWidth);
                return this;
            }
        },
        {
            key: "textBox",
            value: function textBox(box, txt) {
                var verticalAlign = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "middle", tail = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : "", overrideBaseline = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : true;
                if (overrideBaseline) this._ctx.textBaseline = verticalAlign;
                var size = Rectangle.size(box);
                var t = this._textTruncate(txt, size[0], tail);
                this.text(this._textAlign(box, verticalAlign), t[0]);
                return this;
            }
        },
        {
            key: "paragraphBox",
            value: function paragraphBox(box, txt) {
                var lineHeight = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 1.2, verticalAlign = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : "top", crop = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : true;
                var _this = this;
                var b = Util.iterToArray(box);
                var size = Rectangle.size(b);
                this._ctx.textBaseline = "top";
                var lstep = this._font.size * lineHeight;
                var nextLine = function(sub) {
                    var buffer = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : [], cc = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 0;
                    if (!sub) return buffer;
                    if (crop && cc * lstep > size[1] - lstep * 2) return buffer;
                    if (cc > 1e4) throw new Error("max recursion reached (10000)");
                    var t = _this._textTruncate(sub, size[0], "");
                    var newln = t[0].indexOf("\n");
                    if (newln >= 0) {
                        buffer.push(t[0].substr(0, newln));
                        return nextLine(sub.substr(newln + 1), buffer, cc + 1);
                    }
                    var dt = t[0].lastIndexOf(" ") + 1;
                    if (dt <= 0 || t[1] === sub.length) dt = void 0;
                    var line = t[0].substr(0, dt);
                    buffer.push(line);
                    return t[1] <= 0 || t[1] === sub.length ? buffer : nextLine(sub.substr(dt || t[1]), buffer, cc + 1);
                };
                var lines = nextLine(txt);
                var lsize = lines.length * lstep;
                var lbox = b;
                if (verticalAlign == "middle" || verticalAlign == "center") {
                    var lpad = (size[1] - lsize) / 2;
                    if (crop) lpad = Math.max(0, lpad);
                    lbox = new Group(b[0].$add(0, lpad), b[1].$subtract(0, lpad));
                } else if (verticalAlign == "bottom") {
                    lbox = new Group(b[0].$add(0, size[1] - lsize), b[1]);
                } else {
                    lbox = new Group(b[0], b[0].$add(size[0], lsize));
                }
                var center = Rectangle.center(lbox);
                for(var i = 0, len = lines.length; i < len; i++){
                    this.text(this._textAlign(lbox, "top", [
                        0,
                        i * lstep
                    ], center), lines[i]);
                }
                return this;
            }
        },
        {
            key: "alignText",
            value: function alignText() {
                var alignment = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "left", baseline = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "alphabetic";
                if (baseline == "center") baseline = "middle";
                if (baseline == "baseline") baseline = "alphabetic";
                this._ctx.textAlign = alignment;
                this._ctx.textBaseline = baseline;
                return this;
            }
        },
        {
            key: "log",
            value: function log(txt) {
                var w = this._ctx.measureText(txt).width + 20;
                this.stroke(false).fill("rgba(0,0,0,.4)").rect([
                    [
                        0,
                        0
                    ],
                    [
                        w,
                        20
                    ]
                ]);
                this.fill("#fff").text([
                    10,
                    14
                ], txt);
                return this;
            }
        }
    ], [
        {
            key: "point",
            value: function point(ctx, p) {
                var radius = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 5, shape = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : "square";
                if (!p) return;
                if (!CanvasForm[shape]) throw new Error("".concat(shape, " is not a static function of CanvasForm"));
                CanvasForm[shape](ctx, p, radius);
            }
        },
        {
            key: "circle",
            value: function circle(ctx, pt) {
                var radius = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 10;
                if (!pt) return;
                ctx.beginPath();
                ctx.arc(pt[0], pt[1], radius, 0, Const.two_pi, false);
                ctx.closePath();
            }
        },
        {
            key: "ellipse",
            value: function ellipse(ctx, pt, radius) {
                var rotation = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 0, startAngle = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : 0, endAngle = arguments.length > 5 && arguments[5] !== void 0 ? arguments[5] : Const.two_pi, cc = arguments.length > 6 && arguments[6] !== void 0 ? arguments[6] : false;
                if (!pt || !radius) return;
                ctx.beginPath();
                ctx.ellipse(pt[0], pt[1], radius[0], radius[1], rotation, startAngle, endAngle, cc);
            }
        },
        {
            key: "arc",
            value: function arc(ctx, pt, radius, startAngle, endAngle, cc) {
                if (!pt) return;
                ctx.beginPath();
                ctx.arc(pt[0], pt[1], radius, startAngle, endAngle, cc);
            }
        },
        {
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
        },
        {
            key: "line",
            value: function line(ctx, pts) {
                if (!Util.arrayCheck(pts)) return;
                var i = 0;
                ctx.beginPath();
                var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
                try {
                    for(var _iterator = pts[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
                        var it = _step.value;
                        if (it) {
                            if (i++ > 0) {
                                ctx.lineTo(it[0], it[1]);
                            } else {
                                ctx.moveTo(it[0], it[1]);
                            }
                        }
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally{
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return != null) {
                            _iterator.return();
                        }
                    } finally{
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
            }
        },
        {
            key: "polygon",
            value: function polygon(ctx, pts) {
                if (!Util.arrayCheck(pts)) return;
                CanvasForm.line(ctx, pts);
                ctx.closePath();
            }
        },
        {
            key: "rect",
            value: function rect(ctx, pts) {
                var p = Util.iterToArray(pts);
                if (!Util.arrayCheck(p)) return;
                ctx.beginPath();
                ctx.moveTo(p[0][0], p[0][1]);
                ctx.lineTo(p[0][0], p[1][1]);
                ctx.lineTo(p[1][0], p[1][1]);
                ctx.lineTo(p[1][0], p[0][1]);
                ctx.closePath();
            }
        },
        {
            key: "image",
            value: function image(ctx, ptOrRect, img, orig) {
                var t = Util.iterToArray(ptOrRect);
                var pos;
                if (typeof t[0] === "number") {
                    pos = t;
                } else {
                    if (orig) {
                        var o = Util.iterToArray(orig);
                        pos = [
                            o[0][0],
                            o[0][1],
                            o[1][0] - o[0][0],
                            o[1][1] - o[0][1],
                            t[0][0],
                            t[0][1],
                            t[1][0] - t[0][0],
                            t[1][1] - t[0][1]
                        ];
                    } else {
                        pos = [
                            t[0][0],
                            t[0][1],
                            t[1][0] - t[0][0],
                            t[1][1] - t[0][1]
                        ];
                    }
                }
                if (_instanceof(img, Img)) {
                    if (img.loaded) {
                        var _ctx;
                        (_ctx = ctx).drawImage.apply(_ctx, [
                            img.image
                        ].concat(_toConsumableArray(pos)));
                    }
                } else {
                    var _ctx1;
                    (_ctx1 = ctx).drawImage.apply(_ctx1, [
                        img
                    ].concat(_toConsumableArray(pos)));
                }
            }
        },
        {
            key: "imageData",
            value: function imageData(ctx, ptOrRect, img) {
                var t = Util.iterToArray(ptOrRect);
                if (typeof t[0] === "number") {
                    ctx.putImageData(img, t[0], t[1]);
                } else {
                    ctx.putImageData(img, t[0][0], t[0][1], t[0][0], t[0][1], t[1][0], t[1][1]);
                }
            }
        },
        {
            key: "text",
            value: function text(ctx, pt, txt, maxWidth) {
                if (!pt) return;
                ctx.fillText(txt, pt[0], pt[1], maxWidth);
            }
        }
    ]);
    return CanvasForm1;
}(VisualForm);
// src/Create.ts
var Create = /*#__PURE__*/ function() {
    "use strict";
    function Create() {
        _classCallCheck(this, Create);
    }
    _createClass(Create, null, [
        {
            key: "distributeRandom",
            value: function distributeRandom(bound, count) {
                var dimensions = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 2;
                var pts = new Group();
                for(var i = 0; i < count; i++){
                    var p = [
                        bound.x + Num.random() * bound.width
                    ];
                    if (dimensions > 1) p.push(bound.y + Num.random() * bound.height);
                    if (dimensions > 2) p.push(bound.z + Num.random() * bound.depth);
                    pts.push(new Pt(p));
                }
                return pts;
            }
        },
        {
            key: "distributeLinear",
            value: function distributeLinear(line, count) {
                var _line = Util.iterToArray(line);
                var ln = Line.subpoints(_line, count - 2);
                ln.unshift(_line[0]);
                ln.push(_line[_line.length - 1]);
                return ln;
            }
        },
        {
            key: "gridPts",
            value: function gridPts(bound, columns, rows) {
                var orientation = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : [
                    0.5,
                    0.5
                ];
                if (columns === 0 || rows === 0) throw new Error("grid columns and rows cannot be 0");
                var unit = bound.size.$subtract(1).$divide(columns, rows);
                var offset = unit.$multiply(orientation);
                var g = new Group();
                for(var r = 0; r < rows; r++){
                    for(var c = 0; c < columns; c++){
                        g.push(bound.topLeft.$add(unit.$multiply(c, r)).add(offset));
                    }
                }
                return g;
            }
        },
        {
            key: "gridCells",
            value: function gridCells(bound, columns, rows) {
                if (columns === 0 || rows === 0) throw new Error("grid columns and rows cannot be 0");
                var unit = bound.size.$subtract(1).divide(columns, rows);
                var g = [];
                for(var r = 0; r < rows; r++){
                    for(var c = 0; c < columns; c++){
                        g.push(new Group(bound.topLeft.$add(unit.$multiply(c, r)), bound.topLeft.$add(unit.$multiply(c, r).add(unit))));
                    }
                }
                return g;
            }
        },
        {
            key: "radialPts",
            value: function radialPts(center, radius, count) {
                var angleOffset = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : -Const.half_pi;
                var g = new Group();
                var a = Const.two_pi / count;
                for(var i = 0; i < count; i++){
                    g.push(new Pt(center).toAngle(a * i + angleOffset, radius, true));
                }
                return g;
            }
        },
        {
            key: "noisePts",
            value: function noisePts(pts) {
                var dx = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0.01, dy = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 0.01, rows = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 0, columns = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : 0;
                var seed = Num.random();
                var g = new Group();
                var i = 0;
                var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
                try {
                    for(var _iterator = pts[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
                        var p = _step.value;
                        var np = new Noise(p);
                        var r = rows && rows > 0 ? Math.floor(i / rows) : i;
                        var c = columns && columns > 0 ? i % columns : i;
                        np.initNoise(dx * c, dy * r);
                        np.seed(seed);
                        g.push(np);
                        i++;
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally{
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return != null) {
                            _iterator.return();
                        }
                    } finally{
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
                return g;
            }
        },
        {
            key: "delaunay",
            value: function delaunay(pts) {
                return Delaunay.from(pts);
            }
        }
    ]);
    return Create;
}();
var __noise_grad3 = [
    [
        1,
        1,
        0
    ],
    [
        -1,
        1,
        0
    ],
    [
        1,
        -1,
        0
    ],
    [
        -1,
        -1,
        0
    ],
    [
        1,
        0,
        1
    ],
    [
        -1,
        0,
        1
    ],
    [
        1,
        0,
        -1
    ],
    [
        -1,
        0,
        -1
    ],
    [
        0,
        1,
        1
    ],
    [
        0,
        -1,
        1
    ],
    [
        0,
        1,
        -1
    ],
    [
        0,
        -1,
        -1
    ]
];
var __noise_permTable = [
    151,
    160,
    137,
    91,
    90,
    15,
    131,
    13,
    201,
    95,
    96,
    53,
    194,
    233,
    7,
    225,
    140,
    36,
    103,
    30,
    69,
    142,
    8,
    99,
    37,
    240,
    21,
    10,
    23,
    190,
    6,
    148,
    247,
    120,
    234,
    75,
    0,
    26,
    197,
    62,
    94,
    252,
    219,
    203,
    117,
    35,
    11,
    32,
    57,
    177,
    33,
    88,
    237,
    149,
    56,
    87,
    174,
    20,
    125,
    136,
    171,
    168,
    68,
    175,
    74,
    165,
    71,
    134,
    139,
    48,
    27,
    166,
    77,
    146,
    158,
    231,
    83,
    111,
    229,
    122,
    60,
    211,
    133,
    230,
    220,
    105,
    92,
    41,
    55,
    46,
    245,
    40,
    244,
    102,
    143,
    54,
    65,
    25,
    63,
    161,
    1,
    216,
    80,
    73,
    209,
    76,
    132,
    187,
    208,
    89,
    18,
    169,
    200,
    196,
    135,
    130,
    116,
    188,
    159,
    86,
    164,
    100,
    109,
    198,
    173,
    186,
    3,
    64,
    52,
    217,
    226,
    250,
    124,
    123,
    5,
    202,
    38,
    147,
    118,
    126,
    255,
    82,
    85,
    212,
    207,
    206,
    59,
    227,
    47,
    16,
    58,
    17,
    182,
    189,
    28,
    42,
    223,
    183,
    170,
    213,
    119,
    248,
    152,
    2,
    44,
    154,
    163,
    70,
    221,
    153,
    101,
    155,
    167,
    43,
    172,
    9,
    129,
    22,
    39,
    253,
    9,
    98,
    108,
    110,
    79,
    113,
    224,
    232,
    178,
    185,
    112,
    104,
    218,
    246,
    97,
    228,
    251,
    34,
    242,
    193,
    238,
    210,
    144,
    12,
    191,
    179,
    162,
    241,
    81,
    51,
    145,
    235,
    249,
    14,
    239,
    107,
    49,
    192,
    214,
    31,
    181,
    199,
    106,
    157,
    184,
    84,
    204,
    176,
    115,
    121,
    50,
    45,
    127,
    4,
    150,
    254,
    138,
    236,
    205,
    93,
    222,
    114,
    67,
    29,
    24,
    72,
    243,
    141,
    128,
    195,
    78,
    66,
    215,
    61,
    156,
    180
];
var Noise = /*#__PURE__*/ function(Pt1) {
    "use strict";
    _inherits(Noise, Pt1);
    var _super = _createSuper(Noise);
    function Noise() {
        for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
            args[_key] = arguments[_key];
        }
        _classCallCheck(this, Noise);
        var _this;
        _this = _super.call.apply(_super, [
            this
        ].concat(_toConsumableArray(args)));
        _this.perm = [];
        _this._n = new Pt(0.01, 0.01);
        _this.perm = __noise_permTable.concat(__noise_permTable);
        return _this;
    }
    _createClass(Noise, [
        {
            key: "initNoise",
            value: function initNoise() {
                for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                    args[_key] = arguments[_key];
                }
                this._n = _construct(Pt, _toConsumableArray(args));
                return this;
            }
        },
        {
            key: "step",
            value: function step() {
                var x = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0, y = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
                this._n.add(x, y);
                return this;
            }
        },
        {
            key: "seed",
            value: function seed(s) {
                if (s > 0 && s < 1) s *= 65536;
                s = Math.floor(s);
                if (s < 256) s |= s << 8;
                for(var i = 0; i < 255; i++){
                    var v = i & 1 ? __noise_permTable[i] ^ s & 255 : __noise_permTable[i] ^ s >> 8 & 255;
                    this.perm[i] = this.perm[i + 256] = v;
                }
                return this;
            }
        },
        {
            key: "noise2D",
            value: function noise2D() {
                var i = Math.max(0, Math.floor(this._n[0])) % 255;
                var j = Math.max(0, Math.floor(this._n[1])) % 255;
                var x = this._n[0] % 255 - i;
                var y = this._n[1] % 255 - j;
                var n00 = Vec.dot(__noise_grad3[(i + this.perm[j]) % 12], [
                    x,
                    y,
                    0
                ]);
                var n01 = Vec.dot(__noise_grad3[(i + this.perm[j + 1]) % 12], [
                    x,
                    y - 1,
                    0
                ]);
                var n10 = Vec.dot(__noise_grad3[(i + 1 + this.perm[j]) % 12], [
                    x - 1,
                    y,
                    0
                ]);
                var n11 = Vec.dot(__noise_grad3[(i + 1 + this.perm[j + 1]) % 12], [
                    x - 1,
                    y - 1,
                    0
                ]);
                var _fade = function(f) {
                    return f * f * f * (f * (f * 6 - 15) + 10);
                };
                var tx = _fade(x);
                return Num.lerp(Num.lerp(n00, n10, tx), Num.lerp(n01, n11, tx), _fade(y));
            }
        }
    ]);
    return Noise;
}(Pt);
var Delaunay = /*#__PURE__*/ function(Group1) {
    "use strict";
    _inherits(Delaunay1, Group1);
    var _super = _createSuper(Delaunay1);
    function Delaunay1() {
        _classCallCheck(this, Delaunay1);
        var _this;
        _this = _super.call.apply(_super, [
            this
        ].concat(Array.prototype.slice.call(arguments)));
        _this._mesh = [];
        return _this;
    }
    _createClass(Delaunay1, [
        {
            key: "delaunay",
            value: function delaunay() {
                var triangleOnly = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : true;
                var _this = this;
                if (this.length < 3) return [];
                this._mesh = [];
                var n = this.length;
                var indices = [];
                for(var i = 0; i < n; i++)indices[i] = i;
                indices.sort(function(i, j) {
                    return _this[j][0] - _this[i][0];
                });
                var pts = this.slice();
                var st = this._superTriangle();
                pts = pts.concat(st);
                var opened = [
                    this._circum(n, n + 1, n + 2, st)
                ];
                var closed = [];
                var tris = [];
                for(var i1 = 0, len = indices.length; i1 < len; i1++){
                    var c = indices[i1];
                    var edges = [];
                    var j = opened.length;
                    if (!this._mesh[c]) this._mesh[c] = {};
                    while(j--){
                        var circum = opened[j];
                        var radius = circum.circle[1][0];
                        var d = pts[c].$subtract(circum.circle[0]);
                        if (d[0] > 0 && d[0] * d[0] > radius * radius) {
                            closed.push(circum);
                            tris.push(circum.triangle);
                            opened.splice(j, 1);
                            continue;
                        }
                        if (d[0] * d[0] + d[1] * d[1] - radius * radius > Const.epsilon) {
                            continue;
                        }
                        edges.push(circum.i, circum.j, circum.j, circum.k, circum.k, circum.i);
                        opened.splice(j, 1);
                    }
                    Delaunay._dedupe(edges);
                    j = edges.length;
                    while(j > 1){
                        opened.push(this._circum(edges[--j], edges[--j], c, false, pts));
                    }
                }
                for(var i2 = 0, len1 = opened.length; i2 < len1; i2++){
                    var o = opened[i2];
                    if (o.i < n && o.j < n && o.k < n) {
                        closed.push(o);
                        tris.push(o.triangle);
                        this._cache(o);
                    }
                }
                return triangleOnly ? tris : closed;
            }
        },
        {
            key: "voronoi",
            value: function voronoi() {
                var vs = [];
                var n = this._mesh;
                for(var i = 0, len = n.length; i < len; i++){
                    vs.push(this.neighborPts(i, true));
                }
                return vs;
            }
        },
        {
            key: "mesh",
            value: function mesh() {
                return this._mesh;
            }
        },
        {
            key: "neighborPts",
            value: function neighborPts(i) {
                var sort = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
                var cs = new Group();
                var n = this._mesh;
                for(var k in n[i]){
                    if (n[i].hasOwnProperty(k)) cs.push(n[i][k].circle[0]);
                }
                return sort ? Geom.sortEdges(cs) : cs;
            }
        },
        {
            key: "neighbors",
            value: function neighbors(i) {
                var cs = [];
                var n = this._mesh;
                for(var k in n[i]){
                    if (n[i].hasOwnProperty(k)) cs.push(n[i][k]);
                }
                return cs;
            }
        },
        {
            key: "_cache",
            value: function _cache(o) {
                this._mesh[o.i]["".concat(Math.min(o.j, o.k), "-").concat(Math.max(o.j, o.k))] = o;
                this._mesh[o.j]["".concat(Math.min(o.i, o.k), "-").concat(Math.max(o.i, o.k))] = o;
                this._mesh[o.k]["".concat(Math.min(o.i, o.j), "-").concat(Math.max(o.i, o.j))] = o;
            }
        },
        {
            key: "_superTriangle",
            value: function _superTriangle() {
                var minPt = this[0];
                var maxPt = this[0];
                for(var i = 1, len = this.length; i < len; i++){
                    minPt = minPt.$min(this[i]);
                    maxPt = maxPt.$max(this[i]);
                }
                var d = maxPt.$subtract(minPt);
                var mid = minPt.$add(maxPt).divide(2);
                var dmax = Math.max(d[0], d[1]);
                return new Group(mid.$subtract(20 * dmax, dmax), mid.$add(0, 20 * dmax), mid.$add(20 * dmax, -dmax));
            }
        },
        {
            key: "_triangle",
            value: function _triangle(i, j, k) {
                var pts = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : this;
                return new Group(pts[i], pts[j], pts[k]);
            }
        },
        {
            key: "_circum",
            value: function _circum(i, j, k, tri) {
                var pts = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : this;
                var t = tri || this._triangle(i, j, k, pts);
                return {
                    i: i,
                    j: j,
                    k: k,
                    triangle: t,
                    circle: Triangle.circumcircle(t)
                };
            }
        }
    ], [
        {
            key: "_dedupe",
            value: function _dedupe(edges) {
                var j = edges.length;
                while(j > 1){
                    var b = edges[--j];
                    var a = edges[--j];
                    var i = j;
                    while(i > 1){
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
        }
    ]);
    return Delaunay1;
}(Group);
// src/Color.ts
var _Color = /*#__PURE__*/ function(Pt) {
    "use strict";
    _inherits(_Color1, Pt);
    var _super = _createSuper(_Color1);
    function _Color1() {
        for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
            args[_key] = arguments[_key];
        }
        _classCallCheck(this, _Color1);
        var _this;
        _this = _super.call.apply(_super, [
            this
        ].concat(_toConsumableArray(args)));
        _this._mode = "rgb";
        _this._isNorm = false;
        return _this;
    }
    _createClass(_Color1, [
        {
            key: "hex",
            get: function get() {
                return this.toString("hex");
            }
        },
        {
            key: "rgb",
            get: function get() {
                return this.toString("rgb");
            }
        },
        {
            key: "rgba",
            get: function get() {
                return this.toString("rgba");
            }
        },
        {
            key: "clone",
            value: function clone() {
                var c = new _Color(this);
                c.toMode(this._mode);
                return c;
            }
        },
        {
            key: "toMode",
            value: function toMode(mode) {
                var convert = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
                if (convert) {
                    var fname = this._mode.toUpperCase() + "to" + mode.toUpperCase();
                    if (_Color[fname]) {
                        this.to(_Color[fname](this, this._isNorm, this._isNorm));
                    } else {
                        throw new Error("Cannot convert color with " + fname);
                    }
                }
                this._mode = mode;
                return this;
            }
        },
        {
            key: "mode",
            get: function get() {
                return this._mode;
            }
        },
        {
            key: "r",
            get: function get() {
                return this[0];
            },
            set: function set(n) {
                this[0] = n;
            }
        },
        {
            key: "g",
            get: function get() {
                return this[1];
            },
            set: function set(n) {
                this[1] = n;
            }
        },
        {
            key: "b",
            get: function get() {
                return this[2];
            },
            set: function set(n) {
                this[2] = n;
            }
        },
        {
            key: "h",
            get: function get() {
                return this._mode == "lch" ? this[2] : this[0];
            },
            set: function set(n) {
                var i = this._mode == "lch" ? 2 : 0;
                this[i] = n;
            }
        },
        {
            key: "s",
            get: function get() {
                return this[1];
            },
            set: function set(n) {
                this[1] = n;
            }
        },
        {
            key: "l",
            get: function get() {
                return this._mode == "hsl" ? this[2] : this[0];
            },
            set: function set(n) {
                var i = this._mode == "hsl" ? 2 : 0;
                this[i] = n;
            }
        },
        {
            key: "a",
            get: function get() {
                return this[1];
            },
            set: function set(n) {
                this[1] = n;
            }
        },
        {
            key: "c",
            get: function get() {
                return this[1];
            },
            set: function set(n) {
                this[1] = n;
            }
        },
        {
            key: "u",
            get: function get() {
                return this[1];
            },
            set: function set(n) {
                this[1] = n;
            }
        },
        {
            key: "v",
            get: function get() {
                return this[2];
            },
            set: function set(n) {
                this[2] = n;
            }
        },
        {
            key: "alpha",
            get: function get() {
                return this.length > 3 ? this[3] : 1;
            },
            set: function set(n) {
                if (this.length > 3) this[3] = n;
            }
        },
        {
            key: "normalized",
            get: function get() {
                return this._isNorm;
            },
            set: function set(b) {
                this._isNorm = b;
            }
        },
        {
            key: "normalize",
            value: function normalize() {
                var toNorm = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : true;
                if (this._isNorm == toNorm) return this;
                var ranges = _Color.ranges[this._mode];
                for(var i = 0; i < 3; i++){
                    this[i] = !toNorm ? Num.mapToRange(this[i], 0, 1, ranges[i][0], ranges[i][1]) : Num.mapToRange(this[i], ranges[i][0], ranges[i][1], 0, 1);
                }
                this._isNorm = toNorm;
                return this;
            }
        },
        {
            key: "$normalize",
            value: function $normalize() {
                var toNorm = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : true;
                return this.clone().normalize(toNorm);
            }
        },
        {
            key: "toString",
            value: function toString() {
                var format = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "mode";
                if (format == "hex") {
                    var _hex = function(n) {
                        var s = Math.floor(n).toString(16);
                        return s.length < 2 ? "0" + s : s;
                    };
                    return "#".concat(_hex(this[0])).concat(_hex(this[1])).concat(_hex(this[2]));
                } else if (format == "rgba") {
                    return "rgba(".concat(Math.floor(this[0]), ",").concat(Math.floor(this[1]), ",").concat(Math.floor(this[2]), ",").concat(this.alpha, ")");
                } else if (format == "rgb") {
                    return "rgb(".concat(Math.floor(this[0]), ",").concat(Math.floor(this[1]), ",").concat(Math.floor(this[2]), ")");
                } else {
                    return "".concat(this._mode, "(").concat(this[0], ",").concat(this[1], ",").concat(this[2], ",").concat(this.alpha, ")");
                }
            }
        }
    ], [
        {
            key: "from",
            value: function from() {
                for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                    args[_key] = arguments[_key];
                }
                var p = [
                    1,
                    1,
                    1,
                    1
                ];
                var c = Util.getArgs(args);
                for(var i = 0, len = p.length; i < len; i++){
                    if (i < c.length) p[i] = c[i];
                }
                return new _Color(p);
            }
        },
        {
            key: "fromHex",
            value: function fromHex(hex) {
                if (hex[0] == "#") hex = hex.substr(1);
                if (hex.length <= 3) {
                    var fn = function(i) {
                        return hex[i] || "F";
                    };
                    hex = "".concat(fn(0)).concat(fn(0)).concat(fn(1)).concat(fn(1)).concat(fn(2)).concat(fn(2));
                }
                var alpha = 1;
                if (hex.length === 8) {
                    alpha = hex.substr(6) && 255 / 255;
                    hex = hex.substring(0, 6);
                }
                var hexVal = parseInt(hex, 16);
                return new _Color(hexVal >> 16, hexVal >> 8 & 255, hexVal & 255, alpha);
            }
        },
        {
            key: "rgb",
            value: function rgb() {
                for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                    args[_key] = arguments[_key];
                }
                var __Color;
                return (__Color = _Color).from.apply(__Color, _toConsumableArray(args)).toMode("rgb");
            }
        },
        {
            key: "hsl",
            value: function hsl() {
                for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                    args[_key] = arguments[_key];
                }
                var __Color;
                return (__Color = _Color).from.apply(__Color, _toConsumableArray(args)).toMode("hsl");
            }
        },
        {
            key: "hsb",
            value: function hsb() {
                for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                    args[_key] = arguments[_key];
                }
                var __Color;
                return (__Color = _Color).from.apply(__Color, _toConsumableArray(args)).toMode("hsb");
            }
        },
        {
            key: "lab",
            value: function lab() {
                for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                    args[_key] = arguments[_key];
                }
                var __Color;
                return (__Color = _Color).from.apply(__Color, _toConsumableArray(args)).toMode("lab");
            }
        },
        {
            key: "lch",
            value: function lch() {
                for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                    args[_key] = arguments[_key];
                }
                var __Color;
                return (__Color = _Color).from.apply(__Color, _toConsumableArray(args)).toMode("lch");
            }
        },
        {
            key: "luv",
            value: function luv() {
                for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                    args[_key] = arguments[_key];
                }
                var __Color;
                return (__Color = _Color).from.apply(__Color, _toConsumableArray(args)).toMode("luv");
            }
        },
        {
            key: "xyz",
            value: function xyz() {
                for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                    args[_key] = arguments[_key];
                }
                var __Color;
                return (__Color = _Color).from.apply(__Color, _toConsumableArray(args)).toMode("xyz");
            }
        },
        {
            key: "maxValues",
            value: function maxValues(mode) {
                return _Color.ranges[mode].zipSlice(1).$take([
                    0,
                    1,
                    2
                ]);
            }
        },
        {
            key: "RGBtoHSL",
            value: function RGBtoHSL(rgb) {
                var normalizedInput = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false, normalizedOutput = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
                var ref = _slicedToArray(!normalizedInput ? rgb.$normalize() : rgb, 3), r = ref[0], g = ref[1], b = ref[2];
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
                return _Color.hsl(normalizedOutput ? h / 60 : h * 60, s, l, rgb.alpha);
            }
        },
        {
            key: "HSLtoRGB",
            value: function HSLtoRGB(hsl) {
                var normalizedInput = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false, normalizedOutput = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
                var _hsl = _slicedToArray(hsl, 3), h = _hsl[0], s = _hsl[1], l = _hsl[2];
                if (!normalizedInput) h = h / 360;
                if (s == 0) return _Color.rgb(l * 255, l * 255, l * 255, hsl.alpha);
                var q = l <= 0.5 ? l * (1 + s) : l + s - l * s;
                var p = 2 * l - q;
                var convert = function(t) {
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
                return _Color.rgb(sc * convert(h + 1 / 3), sc * convert(h), sc * convert(h - 1 / 3), hsl.alpha);
            }
        },
        {
            key: "RGBtoHSB",
            value: function RGBtoHSB(rgb) {
                var normalizedInput = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false, normalizedOutput = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
                var ref = _slicedToArray(!normalizedInput ? rgb.$normalize() : rgb, 3), r = ref[0], g = ref[1], b = ref[2];
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
                return _Color.hsb(normalizedOutput ? h / 60 : h * 60, s, v, rgb.alpha);
            }
        },
        {
            key: "HSBtoRGB",
            value: function HSBtoRGB(hsb) {
                var normalizedInput = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false, normalizedOutput = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
                var _hsb = _slicedToArray(hsb, 3), h = _hsb[0], s = _hsb[1], v = _hsb[2];
                if (!normalizedInput) h = h / 360;
                var i = Math.floor(h * 6);
                var f = h * 6 - i;
                var p = v * (1 - s);
                var q = v * (1 - f * s);
                var t = v * (1 - (1 - f) * s);
                var pick = [
                    [
                        v,
                        t,
                        p
                    ],
                    [
                        q,
                        v,
                        p
                    ],
                    [
                        p,
                        v,
                        t
                    ],
                    [
                        p,
                        q,
                        v
                    ],
                    [
                        t,
                        p,
                        v
                    ],
                    [
                        v,
                        p,
                        q
                    ]
                ];
                var c = pick[i % 6];
                var sc = normalizedOutput ? 1 : 255;
                return _Color.rgb(sc * c[0], sc * c[1], sc * c[2], hsb.alpha);
            }
        },
        {
            key: "RGBtoLAB",
            value: function RGBtoLAB(rgb) {
                var normalizedInput = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false, normalizedOutput = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
                var c = normalizedInput ? rgb.$normalize(false) : rgb;
                return _Color.XYZtoLAB(_Color.RGBtoXYZ(c), false, normalizedOutput);
            }
        },
        {
            key: "LABtoRGB",
            value: function LABtoRGB(lab) {
                var normalizedInput = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false, normalizedOutput = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
                var c = normalizedInput ? lab.$normalize(false) : lab;
                return _Color.XYZtoRGB(_Color.LABtoXYZ(c), false, normalizedOutput);
            }
        },
        {
            key: "RGBtoLCH",
            value: function RGBtoLCH(rgb) {
                var normalizedInput = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false, normalizedOutput = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
                var c = normalizedInput ? rgb.$normalize(false) : rgb;
                return _Color.LABtoLCH(_Color.RGBtoLAB(c), false, normalizedOutput);
            }
        },
        {
            key: "LCHtoRGB",
            value: function LCHtoRGB(lch) {
                var normalizedInput = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false, normalizedOutput = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
                var c = normalizedInput ? lch.$normalize(false) : lch;
                return _Color.LABtoRGB(_Color.LCHtoLAB(c), false, normalizedOutput);
            }
        },
        {
            key: "RGBtoLUV",
            value: function RGBtoLUV(rgb) {
                var normalizedInput = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false, normalizedOutput = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
                var c = normalizedInput ? rgb.$normalize(false) : rgb;
                return _Color.XYZtoLUV(_Color.RGBtoXYZ(c), false, normalizedOutput);
            }
        },
        {
            key: "LUVtoRGB",
            value: function LUVtoRGB(luv) {
                var normalizedInput = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false, normalizedOutput = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
                var c = normalizedInput ? luv.$normalize(false) : luv;
                return _Color.XYZtoRGB(_Color.LUVtoXYZ(c), false, normalizedOutput);
            }
        },
        {
            key: "RGBtoXYZ",
            value: function RGBtoXYZ(rgb) {
                var normalizedInput = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false, normalizedOutput = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
                var c = !normalizedInput ? rgb.$normalize() : rgb.clone();
                for(var i = 0; i < 3; i++){
                    c[i] = c[i] > 0.04045 ? Math.pow((c[i] + 0.055) / 1.055, 2.4) : c[i] / 12.92;
                    if (!normalizedOutput) c[i] = c[i] * 100;
                }
                var cc = _Color.xyz(c[0] * 0.4124564 + c[1] * 0.3575761 + c[2] * 0.1804375, c[0] * 0.2126729 + c[1] * 0.7151522 + c[2] * 0.072175, c[0] * 0.0193339 + c[1] * 0.119192 + c[2] * 0.9503041, rgb.alpha);
                return normalizedOutput ? cc.normalize() : cc;
            }
        },
        {
            key: "XYZtoRGB",
            value: function XYZtoRGB(xyz) {
                var normalizedInput = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false, normalizedOutput = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
                var ref = _slicedToArray(!normalizedInput ? xyz.$normalize() : xyz, 3), x = ref[0], y = ref[1], z = ref[2];
                var rgb = [
                    x * 3.2406254773200533 + y * -1.5372079722103187 + z * -0.4986285986982479,
                    x * -0.9689307147293197 + y * 1.8757560608852415 + z * 0.041517523842953964,
                    x * 0.055710120445510616 + y * -0.2040210505984867 + z * 1.0569959422543882
                ];
                for(var i = 0; i < 3; i++){
                    rgb[i] = rgb[i] > 31308e-7 ? 1.055 * Math.pow(rgb[i], 1 / 2.4) - 0.055 : 12.92 * rgb[i];
                    rgb[i] = Math.max(0, Math.min(1, rgb[i]));
                    if (!normalizedOutput) rgb[i] = Math.round(rgb[i] * 255);
                }
                var cc = _Color.rgb(rgb[0], rgb[1], rgb[2], xyz.alpha);
                return normalizedOutput ? cc.normalize() : cc;
            }
        },
        {
            key: "XYZtoLAB",
            value: function XYZtoLAB(xyz) {
                var normalizedInput = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false, normalizedOutput = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
                var c = normalizedInput ? xyz.$normalize(false) : xyz.clone();
                var eps = 0.00885645167;
                var kap = 903.296296296;
                c.divide(_Color.D65);
                var fn = function(n) {
                    return n > eps ? Math.pow(n, 1 / 3) : (kap * n + 16) / 116;
                };
                var cy = fn(c[1]);
                var cc = _Color.lab(116 * cy - 16, 500 * (fn(c[0]) - cy), 200 * (cy - fn(c[2])), xyz.alpha);
                return normalizedOutput ? cc.normalize() : cc;
            }
        },
        {
            key: "LABtoXYZ",
            value: function LABtoXYZ(lab) {
                var normalizedInput = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false, normalizedOutput = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
                var c = normalizedInput ? lab.$normalize(false) : lab;
                var y = (c[0] + 16) / 116;
                var x = c[1] / 500 + y;
                var z = y - c[2] / 200;
                var eps = 0.00885645167;
                var kap = 903.296296296;
                var d = _Color.D65;
                var xxx = Math.pow(x, 3);
                var zzz = Math.pow(z, 3);
                var cc = _Color.xyz(d[0] * (xxx > eps ? xxx : (116 * x - 16) / kap), d[1] * (c[0] > kap * eps ? Math.pow((c[0] + 16) / 116, 3) : c[0] / kap), d[2] * (zzz > eps ? zzz : (116 * z - 16) / kap), lab.alpha);
                return normalizedOutput ? cc.normalize() : cc;
            }
        },
        {
            key: "XYZtoLUV",
            value: function XYZtoLUV(xyz) {
                var normalizedInput = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false, normalizedOutput = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
                var ref = _slicedToArray(normalizedInput ? xyz.$normalize(false) : xyz, 3), x = ref[0], y = ref[1], z = ref[2];
                var u = 4 * x / (x + 15 * y + 3 * z);
                var v = 9 * y / (x + 15 * y + 3 * z);
                y = y / 100;
                y = y > 8856e-6 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
                var refU = 4 * _Color.D65[0] / (_Color.D65[0] + 15 * _Color.D65[1] + 3 * _Color.D65[2]);
                var refV = 9 * _Color.D65[1] / (_Color.D65[0] + 15 * _Color.D65[1] + 3 * _Color.D65[2]);
                var L = 116 * y - 16;
                return _Color.luv(L, 13 * L * (u - refU), 13 * L * (v - refV), xyz.alpha);
            }
        },
        {
            key: "LUVtoXYZ",
            value: function LUVtoXYZ(luv) {
                var normalizedInput = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false, normalizedOutput = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
                var ref = _slicedToArray(normalizedInput ? luv.$normalize(false) : luv, 3), l = ref[0], u = ref[1], v = ref[2];
                var y = (l + 16) / 116;
                var cubeY = y * y * y;
                y = cubeY > 8856e-6 ? cubeY : (y - 16 / 116) / 7.787;
                var refU = 4 * _Color.D65[0] / (_Color.D65[0] + 15 * _Color.D65[1] + 3 * _Color.D65[2]);
                var refV = 9 * _Color.D65[1] / (_Color.D65[0] + 15 * _Color.D65[1] + 3 * _Color.D65[2]);
                u = u / (13 * l) + refU;
                v = v / (13 * l) + refV;
                y = y * 100;
                var x = -1 * (9 * y * u) / ((u - 4) * v - u * v);
                var z = (9 * y - 15 * v * y - v * x) / (3 * v);
                return _Color.xyz(x, y, z, luv.alpha);
            }
        },
        {
            key: "LABtoLCH",
            value: function LABtoLCH(lab) {
                var normalizedInput = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false, normalizedOutput = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
                var c = normalizedInput ? lab.$normalize(false) : lab;
                var h = Geom.toDegree(Geom.boundRadian(Math.atan2(c[2], c[1])));
                return _Color.lch(c[0], Math.sqrt(c[1] * c[1] + c[2] * c[2]), h, lab.alpha);
            }
        },
        {
            key: "LCHtoLAB",
            value: function LCHtoLAB(lch) {
                var normalizedInput = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false, normalizedOutput = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
                var c = normalizedInput ? lch.$normalize(false) : lch;
                var rad = Geom.toRadian(c[2]);
                return _Color.lab(c[0], Math.cos(rad) * c[1], Math.sin(rad) * c[1], lch.alpha);
            }
        }
    ]);
    return _Color1;
}(Pt);
var Color = _Color;
Color.D65 = new Pt(95.047, 100, 108.883, 1);
Color.ranges = {
    rgb: new Group(new Pt(0, 255), new Pt(0, 255), new Pt(0, 255)),
    hsl: new Group(new Pt(0, 360), new Pt(0, 1), new Pt(0, 1)),
    hsb: new Group(new Pt(0, 360), new Pt(0, 1), new Pt(0, 1)),
    lab: new Group(new Pt(0, 100), new Pt(-128, 127), new Pt(-128, 127)),
    lch: new Group(new Pt(0, 100), new Pt(0, 100), new Pt(0, 360)),
    luv: new Group(new Pt(0, 100), new Pt(-134, 220), new Pt(-140, 122)),
    xyz: new Group(new Pt(0, 100), new Pt(0, 100), new Pt(0, 100))
};
// src/Dom.ts
var DOMSpace = /*#__PURE__*/ function(MultiTouchSpace) {
    "use strict";
    _inherits(DOMSpace1, MultiTouchSpace);
    var _super = _createSuper(DOMSpace1);
    function DOMSpace1(elem, callback) {
        _classCallCheck(this, DOMSpace1);
        var _this;
        _this = _super.call(this);
        _this.id = "domspace";
        _this._autoResize = true;
        _this._bgcolor = "#e1e9f0";
        _this._css = {};
        var _selector = null;
        var _existed = false;
        _this.id = "pts";
        if (_instanceof(elem, Element)) {
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
        setTimeout(_this._ready.bind(_assertThisInitialized(_this), callback), 50);
        return _this;
    }
    _createClass(DOMSpace1, [
        {
            key: "_ready",
            value: function _ready(callback) {
                if (!this._container) throw new Error("Cannot initiate #".concat(this.id, " element"));
                this._isReady = true;
                this._resizeHandler(null);
                this.clear(this._bgcolor);
                this._canvas.dispatchEvent(new Event("ready"));
                for(var k in this.players){
                    if (this.players.hasOwnProperty(k)) {
                        if (this.players[k].start) this.players[k].start(this.bound.clone(), this);
                    }
                }
                this._pointer = this.center;
                this.refresh(false);
                if (callback) callback(this.bound, this._canvas);
            }
        },
        {
            key: "setup",
            value: function setup(opt) {
                if (opt.bgcolor) {
                    this._bgcolor = opt.bgcolor;
                }
                this.autoResize = opt.resize != void 0 ? opt.resize : false;
                return this;
            }
        },
        {
            key: "getForm",
            value: function getForm() {
                return null;
            }
        },
        {
            key: "autoResize",
            get: function get() {
                return this._autoResize;
            },
            set: function set(auto) {
                this._autoResize = auto;
                if (auto) {
                    window.addEventListener("resize", this._resizeHandler.bind(this));
                } else {
                    delete this._css["width"];
                    delete this._css["height"];
                    window.removeEventListener("resize", this._resizeHandler.bind(this));
                }
            }
        },
        {
            key: "resize",
            value: function resize(b, evt) {
                this.bound = b;
                this.styles({
                    width: "".concat(b.width, "px"),
                    height: "".concat(b.height, "px")
                }, true);
                for(var k in this.players){
                    if (this.players.hasOwnProperty(k)) {
                        var p = this.players[k];
                        if (p.resize) p.resize(this.bound, evt);
                    }
                }
                return this;
            }
        },
        {
            key: "_resizeHandler",
            value: function _resizeHandler(evt) {
                var b = Bound.fromBoundingRect(this._container.getBoundingClientRect());
                if (this._autoResize) {
                    this.styles({
                        width: "100%",
                        height: "100%"
                    }, true);
                } else {
                    this.styles({
                        width: "".concat(b.width, "px"),
                        height: "".concat(b.height, "px")
                    }, true);
                }
                this.resize(b, evt);
            }
        },
        {
            key: "element",
            get: function get() {
                return this._canvas;
            }
        },
        {
            key: "parent",
            get: function get() {
                return this._container;
            }
        },
        {
            key: "ready",
            get: function get() {
                return this._isReady;
            }
        },
        {
            key: "clear",
            value: function clear(bg) {
                if (bg) this.background = bg;
                this._canvas.innerHTML = "";
                return this;
            }
        },
        {
            key: "background",
            get: function get() {
                return this._bgcolor;
            },
            set: function set(bg) {
                this._bgcolor = bg;
                this._container.style.backgroundColor = this._bgcolor;
            }
        },
        {
            key: "style",
            value: function style(key, val) {
                var update = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
                this._css[key] = val;
                if (update) this._canvas.style[key] = val;
                return this;
            }
        },
        {
            key: "styles",
            value: function styles(styles1) {
                var update = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
                for(var k in styles1){
                    if (styles1.hasOwnProperty(k)) this.style(k, styles1[k], update);
                }
                return this;
            }
        },
        {
            key: "dispose",
            value: function dispose() {
                window.removeEventListener("resize", this._resizeHandler.bind(this));
                this.stop();
                this.removeAll();
                return this;
            }
        }
    ], [
        {
            key: "createElement",
            value: function createElement() {
                var elem = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "div", id = arguments.length > 1 ? arguments[1] : void 0, appendTo = arguments.length > 2 ? arguments[2] : void 0;
                var d = document.createElement(elem);
                if (id) d.setAttribute("id", id);
                if (appendTo && appendTo.appendChild) appendTo.appendChild(d);
                return d;
            }
        },
        {
            key: "setAttr",
            value: function setAttr(elem, data) {
                for(var k in data){
                    if (data.hasOwnProperty(k)) {
                        elem.setAttribute(k, data[k]);
                    }
                }
                return elem;
            }
        },
        {
            key: "getInlineStyles",
            value: function getInlineStyles(data) {
                var str = "";
                for(var k in data){
                    if (data.hasOwnProperty(k)) {
                        if (data[k]) str += "".concat(k, ": ").concat(data[k], "; ");
                    }
                }
                return str;
            }
        }
    ]);
    return DOMSpace1;
}(MultiTouchSpace);
var HTMLSpace = /*#__PURE__*/ function(DOMSpace) {
    "use strict";
    _inherits(HTMLSpace, DOMSpace);
    var _super = _createSuper(HTMLSpace);
    function HTMLSpace() {
        _classCallCheck(this, HTMLSpace);
        return _super.apply(this, arguments);
    }
    _createClass(HTMLSpace, [
        {
            key: "getForm",
            value: function getForm() {
                return new HTMLForm(this);
            }
        },
        {
            key: "remove",
            value: function remove(player) {
                var temp = this._container.querySelectorAll("." + HTMLForm.scopeID(player));
                temp.forEach(function(el) {
                    el.parentNode.removeChild(el);
                });
                return _get(_getPrototypeOf(HTMLSpace.prototype), "remove", this).call(this, player);
            }
        },
        {
            key: "removeAll",
            value: function removeAll() {
                this._container.innerHTML = "";
                return _get(_getPrototypeOf(HTMLSpace.prototype), "removeAll", this).call(this);
            }
        }
    ], [
        {
            key: "htmlElement",
            value: function htmlElement(parent, name, id) {
                var autoClass = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : true;
                if (!parent || !parent.appendChild) throw new Error("parent is not a valid DOM element");
                var elem = document.querySelector("#".concat(id));
                if (!elem) {
                    elem = document.createElement(name);
                    elem.setAttribute("id", id);
                    if (autoClass) elem.setAttribute("class", id.substring(0, id.indexOf("-")));
                    parent.appendChild(elem);
                }
                return elem;
            }
        }
    ]);
    return HTMLSpace;
}(DOMSpace);
var _HTMLForm = /*#__PURE__*/ function(VisualForm) {
    "use strict";
    _inherits(_HTMLForm1, VisualForm);
    var _super = _createSuper(_HTMLForm1);
    function _HTMLForm1(space) {
        _classCallCheck(this, _HTMLForm1);
        var _this;
        _this = _super.call(this);
        _this._style = {
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
        _this._ctx = {
            group: null,
            groupID: "pts",
            groupCount: 0,
            currentID: "pts0",
            currentClass: "",
            style: {}
        };
        _this._ready = false;
        _this._space = space;
        _this._space.add({
            start: function() {
                _this._ctx.group = _this._space.element;
                _this._ctx.groupID = "pts_dom_" + _HTMLForm.groupID++;
                _this._ctx.style = Object.assign({}, _this._style);
                _this._ready = true;
            }
        });
        return _this;
    }
    _createClass(_HTMLForm1, [
        {
            key: "space",
            get: function get() {
                return this._space;
            }
        },
        {
            key: "styleTo",
            value: function styleTo(k, v) {
                var unit = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "";
                if (this._ctx.style[k] === void 0) throw new Error("".concat(k, " style property doesn't exist"));
                this._ctx.style[k] = "".concat(v).concat(unit);
            }
        },
        {
            key: "alpha",
            value: function alpha(a) {
                this.styleTo("opacity", a);
                return this;
            }
        },
        {
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
        },
        {
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
        },
        {
            key: "fillText",
            value: function fillText(c) {
                this.styleTo("color", c);
                return this;
            }
        },
        {
            key: "cls",
            value: function cls(c) {
                if (typeof c == "boolean") {
                    this._ctx.currentClass = "";
                } else {
                    this._ctx.currentClass = c;
                }
                return this;
            }
        },
        {
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
                this._ctx.style["font"] = this._font.value;
                return this;
            }
        },
        {
            key: "reset",
            value: function reset() {
                this._ctx.style = Object.assign({}, this._style);
                this._font = new Font(10, "sans-serif");
                this._ctx.style["font"] = this._font.value;
                return this;
            }
        },
        {
            key: "updateScope",
            value: function updateScope(group_id, group) {
                this._ctx.group = group;
                this._ctx.groupID = group_id;
                this._ctx.groupCount = 0;
                this.nextID();
                return this._ctx;
            }
        },
        {
            key: "scope",
            value: function scope(item) {
                if (!item || item.animateID == null) throw new Error("item not defined or not yet added to Space");
                return this.updateScope(_HTMLForm.scopeID(item), this.space.element);
            }
        },
        {
            key: "nextID",
            value: function nextID() {
                this._ctx.groupCount++;
                this._ctx.currentID = "".concat(this._ctx.groupID, "-").concat(this._ctx.groupCount);
                return this._ctx.currentID;
            }
        },
        {
            key: "point",
            value: function point(pt) {
                var radius = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 5, shape = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "square";
                this.nextID();
                if (shape == "circle") this.styleTo("border-radius", "100%");
                _HTMLForm.point(this._ctx, pt, radius, shape);
                return this;
            }
        },
        {
            key: "circle",
            value: function circle(pts) {
                this.nextID();
                this.styleTo("border-radius", "100%");
                _HTMLForm.circle(this._ctx, pts[0], pts[1][0]);
                return this;
            }
        },
        {
            key: "square",
            value: function square(pt, halfsize) {
                this.nextID();
                _HTMLForm.square(this._ctx, pt, halfsize);
                return this;
            }
        },
        {
            key: "rect",
            value: function rect(pts) {
                this.nextID();
                this.styleTo("border-radius", "0");
                _HTMLForm.rect(this._ctx, pts);
                return this;
            }
        },
        {
            key: "text",
            value: function text(pt, txt) {
                this.nextID();
                _HTMLForm.text(this._ctx, pt, txt);
                return this;
            }
        },
        {
            key: "log",
            value: function log(txt) {
                this.fill("#000").stroke("#fff", 0.5).text([
                    10,
                    14
                ], txt);
                return this;
            }
        },
        {
            key: "arc",
            value: function arc(pt, radius, startAngle, endAngle, cc) {
                Util.warn("arc is not implemented in HTMLForm");
                return this;
            }
        },
        {
            key: "line",
            value: function line(pts) {
                Util.warn("line is not implemented in HTMLForm");
                return this;
            }
        },
        {
            key: "polygon",
            value: function polygon(pts) {
                Util.warn("polygon is not implemented in HTMLForm");
                return this;
            }
        }
    ], [
        {
            key: "getID",
            value: function getID(ctx) {
                return ctx.currentID || "p-".concat(_HTMLForm.domID++);
            }
        },
        {
            key: "scopeID",
            value: function scopeID(item) {
                return "item-".concat(item.animateID);
            }
        },
        {
            key: "style",
            value: function style(elem, styles) {
                var st = [];
                if (!styles["filled"]) st.push("background: none");
                if (!styles["stroked"]) st.push("border: none");
                for(var k in styles){
                    if (styles.hasOwnProperty(k) && k != "filled" && k != "stroked") {
                        var v = styles[k];
                        if (v) {
                            if (!styles["filled"] && k.indexOf("background") === 0) {
                                continue;
                            } else if (!styles["stroked"] && k.indexOf("border-width") === 0) {
                                continue;
                            } else {
                                st.push("".concat(k, ": ").concat(v));
                            }
                        }
                    }
                }
                return HTMLSpace.setAttr(elem, {
                    style: st.join(";")
                });
            }
        },
        {
            key: "rectStyle",
            value: function rectStyle(ctx, pt, size) {
                ctx.style["left"] = pt[0] + "px";
                ctx.style["top"] = pt[1] + "px";
                ctx.style["width"] = size[0] + "px";
                ctx.style["height"] = size[1] + "px";
                return ctx;
            }
        },
        {
            key: "textStyle",
            value: function textStyle(ctx, pt) {
                ctx.style["left"] = pt[0] + "px";
                ctx.style["top"] = pt[1] + "px";
                return ctx;
            }
        },
        {
            key: "point",
            value: function point(ctx, pt) {
                var radius = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 5, shape = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : "square";
                if (shape === "circle") {
                    return _HTMLForm.circle(ctx, pt, radius);
                } else {
                    return _HTMLForm.square(ctx, pt, radius);
                }
            }
        },
        {
            key: "circle",
            value: function circle(ctx, pt) {
                var radius = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 10;
                var elem = HTMLSpace.htmlElement(ctx.group, "div", _HTMLForm.getID(ctx));
                HTMLSpace.setAttr(elem, {
                    class: "pts-form pts-circle ".concat(ctx.currentClass)
                });
                _HTMLForm.rectStyle(ctx, new Pt(pt).$subtract(radius), new Pt(radius * 2, radius * 2));
                _HTMLForm.style(elem, ctx.style);
                return elem;
            }
        },
        {
            key: "square",
            value: function square(ctx, pt, halfsize) {
                var elem = HTMLSpace.htmlElement(ctx.group, "div", _HTMLForm.getID(ctx));
                HTMLSpace.setAttr(elem, {
                    class: "pts-form pts-square ".concat(ctx.currentClass)
                });
                _HTMLForm.rectStyle(ctx, new Pt(pt).$subtract(halfsize), new Pt(halfsize * 2, halfsize * 2));
                _HTMLForm.style(elem, ctx.style);
                return elem;
            }
        },
        {
            key: "rect",
            value: function rect(ctx, pts) {
                var p = Util.iterToArray(pts);
                if (!Util.arrayCheck(p)) return;
                var elem = HTMLSpace.htmlElement(ctx.group, "div", _HTMLForm.getID(ctx));
                HTMLSpace.setAttr(elem, {
                    class: "pts-form pts-rect ".concat(ctx.currentClass)
                });
                _HTMLForm.rectStyle(ctx, p[0], p[1]);
                _HTMLForm.style(elem, ctx.style);
                return elem;
            }
        },
        {
            key: "text",
            value: function text(ctx, pt, txt) {
                var elem = HTMLSpace.htmlElement(ctx.group, "div", _HTMLForm.getID(ctx));
                HTMLSpace.setAttr(elem, {
                    class: "pts-form pts-text ".concat(ctx.currentClass)
                });
                elem.textContent = txt;
                _HTMLForm.textStyle(ctx, pt);
                _HTMLForm.style(elem, ctx.style);
                return elem;
            }
        }
    ]);
    return _HTMLForm1;
}(VisualForm);
var HTMLForm = _HTMLForm;
HTMLForm.groupID = 0;
HTMLForm.domID = 0;
// src/Svg.ts
var SVGSpace = /*#__PURE__*/ function(DOMSpace) {
    "use strict";
    _inherits(SVGSpace1, DOMSpace);
    var _super = _createSuper(SVGSpace1);
    function SVGSpace1(elem, callback) {
        _classCallCheck(this, SVGSpace1);
        var _this;
        _this = _super.call(this, elem, callback);
        _this._bgcolor = "#999";
        if (_this._canvas.nodeName.toLowerCase() != "svg") {
            var s = SVGSpace.svgElement(_this._canvas, "svg", "".concat(_this.id, "_svg"));
            _this._container = _this._canvas;
            _this._canvas = s;
        }
        return _this;
    }
    _createClass(SVGSpace1, [
        {
            key: "getForm",
            value: function getForm() {
                return new SVGForm(this);
            }
        },
        {
            key: "element",
            get: function get() {
                return this._canvas;
            }
        },
        {
            key: "resize",
            value: function resize(b, evt) {
                _get(_getPrototypeOf(SVGSpace1.prototype), "resize", this).call(this, b, evt);
                SVGSpace.setAttr(this.element, {
                    "viewBox": "0 0 ".concat(this.bound.width, " ").concat(this.bound.height),
                    "width": "".concat(this.bound.width),
                    "height": "".concat(this.bound.height),
                    "xmlns": "http://www.w3.org/2000/svg",
                    "version": "1.1"
                });
                return this;
            }
        },
        {
            key: "remove",
            value: function remove(player) {
                var temp = this._container.querySelectorAll("." + SVGForm.scopeID(player));
                temp.forEach(function(el) {
                    el.parentNode.removeChild(el);
                });
                return _get(_getPrototypeOf(SVGSpace1.prototype), "remove", this).call(this, player);
            }
        },
        {
            key: "removeAll",
            value: function removeAll() {
                this._container.innerHTML = "";
                return _get(_getPrototypeOf(SVGSpace1.prototype), "removeAll", this).call(this);
            }
        }
    ], [
        {
            key: "svgElement",
            value: function svgElement(parent, name, id) {
                if (!parent || !parent.appendChild) throw new Error("parent is not a valid DOM element");
                var elem = document.querySelector("#".concat(id));
                if (!elem) {
                    elem = document.createElementNS("http://www.w3.org/2000/svg", name);
                    elem.setAttribute("id", id);
                    parent.appendChild(elem);
                }
                return elem;
            }
        }
    ]);
    return SVGSpace1;
}(DOMSpace);
var _SVGForm = /*#__PURE__*/ function(VisualForm) {
    "use strict";
    _inherits(_SVGForm1, VisualForm);
    var _super = _createSuper(_SVGForm1);
    function _SVGForm1(space) {
        _classCallCheck(this, _SVGForm1);
        var _this;
        _this = _super.call(this);
        _this._style = {
            "filled": true,
            "stroked": true,
            "fill": "#f03",
            "stroke": "#fff",
            "stroke-width": 1,
            "stroke-linejoin": "bevel",
            "stroke-linecap": "sqaure",
            "opacity": 1
        };
        _this._ctx = {
            group: null,
            groupID: "pts",
            groupCount: 0,
            currentID: "pts0",
            currentClass: "",
            style: {}
        };
        _this._ready = false;
        _this._space = space;
        _this._space.add({
            start: function() {
                _this._ctx.group = _this._space.element;
                _this._ctx.groupID = "pts_svg_" + _SVGForm.groupID++;
                _this._ctx.style = Object.assign({}, _this._style);
                _this._ready = true;
            }
        });
        return _this;
    }
    _createClass(_SVGForm1, [
        {
            key: "space",
            get: function get() {
                return this._space;
            }
        },
        {
            key: "styleTo",
            value: function styleTo(k, v) {
                if (this._ctx.style[k] === void 0) throw new Error("".concat(k, " style property doesn't exist"));
                this._ctx.style[k] = v;
            }
        },
        {
            key: "alpha",
            value: function alpha(a) {
                this.styleTo("opacity", a);
                return this;
            }
        },
        {
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
        },
        {
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
        },
        {
            key: "cls",
            value: function cls(c) {
                if (typeof c == "boolean") {
                    this._ctx.currentClass = "";
                } else {
                    this._ctx.currentClass = c;
                }
                return this;
            }
        },
        {
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
                this._ctx.style["font"] = this._font.value;
                return this;
            }
        },
        {
            key: "reset",
            value: function reset() {
                this._ctx.style = Object.assign({}, this._style);
                this._font = new Font(10, "sans-serif");
                this._ctx.style["font"] = this._font.value;
                return this;
            }
        },
        {
            key: "updateScope",
            value: function updateScope(group_id, group) {
                this._ctx.group = group;
                this._ctx.groupID = group_id;
                this._ctx.groupCount = 0;
                this.nextID();
                return this._ctx;
            }
        },
        {
            key: "scope",
            value: function scope(item) {
                if (!item || item.animateID == null) throw new Error("item not defined or not yet added to Space");
                return this.updateScope(_SVGForm.scopeID(item), this.space.element);
            }
        },
        {
            key: "nextID",
            value: function nextID() {
                this._ctx.groupCount++;
                this._ctx.currentID = "".concat(this._ctx.groupID, "-").concat(this._ctx.groupCount);
                return this._ctx.currentID;
            }
        },
        {
            key: "point",
            value: function point(pt) {
                var radius = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 5, shape = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "square";
                this.nextID();
                _SVGForm.point(this._ctx, pt, radius, shape);
                return this;
            }
        },
        {
            key: "circle",
            value: function circle(pts) {
                this.nextID();
                var p = Util.iterToArray(pts);
                _SVGForm.circle(this._ctx, p[0], p[1][0]);
                return this;
            }
        },
        {
            key: "arc",
            value: function arc(pt, radius, startAngle, endAngle, cc) {
                this.nextID();
                _SVGForm.arc(this._ctx, pt, radius, startAngle, endAngle, cc);
                return this;
            }
        },
        {
            key: "square",
            value: function square(pt, halfsize) {
                this.nextID();
                _SVGForm.square(this._ctx, pt, halfsize);
                return this;
            }
        },
        {
            key: "line",
            value: function line(pts) {
                this.nextID();
                _SVGForm.line(this._ctx, pts);
                return this;
            }
        },
        {
            key: "polygon",
            value: function polygon(pts) {
                this.nextID();
                _SVGForm.polygon(this._ctx, pts);
                return this;
            }
        },
        {
            key: "rect",
            value: function rect(pts) {
                this.nextID();
                _SVGForm.rect(this._ctx, pts);
                return this;
            }
        },
        {
            key: "text",
            value: function text(pt, txt) {
                this.nextID();
                _SVGForm.text(this._ctx, pt, txt);
                return this;
            }
        },
        {
            key: "log",
            value: function log(txt) {
                this.fill("#000").stroke("#fff", 0.5).text([
                    10,
                    14
                ], txt);
                return this;
            }
        }
    ], [
        {
            key: "getID",
            value: function getID(ctx) {
                return ctx.currentID || "p-".concat(_SVGForm.domID++);
            }
        },
        {
            key: "scopeID",
            value: function scopeID(item) {
                return "item-".concat(item.animateID);
            }
        },
        {
            key: "style",
            value: function style(elem, styles) {
                var st = [];
                if (!styles["filled"]) st.push("fill: none");
                if (!styles["stroked"]) st.push("stroke: none");
                for(var k in styles){
                    if (styles.hasOwnProperty(k) && k != "filled" && k != "stroked") {
                        var v = styles[k];
                        if (v) {
                            if (!styles["filled"] && k.indexOf("fill") === 0) {
                                continue;
                            } else if (!styles["stroked"] && k.indexOf("stroke") === 0) {
                                continue;
                            } else {
                                st.push("".concat(k, ": ").concat(v));
                            }
                        }
                    }
                }
                return DOMSpace.setAttr(elem, {
                    style: st.join(";")
                });
            }
        },
        {
            key: "point",
            value: function point(ctx, pt) {
                var radius = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 5, shape = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : "square";
                if (shape === "circle") {
                    return _SVGForm.circle(ctx, pt, radius);
                } else {
                    return _SVGForm.square(ctx, pt, radius);
                }
            }
        },
        {
            key: "circle",
            value: function circle(ctx, pt) {
                var radius = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 10;
                var elem = SVGSpace.svgElement(ctx.group, "circle", _SVGForm.getID(ctx));
                DOMSpace.setAttr(elem, {
                    cx: pt[0],
                    cy: pt[1],
                    r: radius,
                    "class": "pts-svgform pts-circle ".concat(ctx.currentClass)
                });
                _SVGForm.style(elem, ctx.style);
                return elem;
            }
        },
        {
            key: "arc",
            value: function arc(ctx, pt, radius, startAngle, endAngle, cc) {
                var elem = SVGSpace.svgElement(ctx.group, "path", _SVGForm.getID(ctx));
                var start = new Pt(pt).toAngle(startAngle, radius, true);
                var end = new Pt(pt).toAngle(endAngle, radius, true);
                var diff = Geom.boundAngle(endAngle) - Geom.boundAngle(startAngle);
                var largeArc = diff > Const.pi ? true : false;
                if (cc) largeArc = !largeArc;
                var sweep = cc ? "0" : "1";
                var d = "M ".concat(start[0], " ").concat(start[1], " A ").concat(radius, " ").concat(radius, " 0 ").concat(largeArc ? "1" : "0", " ").concat(sweep, " ").concat(end[0], " ").concat(end[1]);
                DOMSpace.setAttr(elem, {
                    d: d,
                    "class": "pts-svgform pts-arc ".concat(ctx.currentClass)
                });
                _SVGForm.style(elem, ctx.style);
                return elem;
            }
        },
        {
            key: "square",
            value: function square(ctx, pt, halfsize) {
                var elem = SVGSpace.svgElement(ctx.group, "rect", _SVGForm.getID(ctx));
                DOMSpace.setAttr(elem, {
                    x: pt[0] - halfsize,
                    y: pt[1] - halfsize,
                    width: halfsize * 2,
                    height: halfsize * 2,
                    "class": "pts-svgform pts-square ".concat(ctx.currentClass)
                });
                _SVGForm.style(elem, ctx.style);
                return elem;
            }
        },
        {
            key: "line",
            value: function line(ctx, pts) {
                var points = _SVGForm.pointsString(pts);
                if (points.count < 2) return;
                if (points.count > 2) return _SVGForm._poly(ctx, points.string, false);
                var elem = SVGSpace.svgElement(ctx.group, "line", _SVGForm.getID(ctx));
                var p = Util.iterToArray(pts);
                DOMSpace.setAttr(elem, {
                    x1: p[0][0],
                    y1: p[0][1],
                    x2: p[1][0],
                    y2: p[1][1],
                    "class": "pts-svgform pts-line ".concat(ctx.currentClass)
                });
                _SVGForm.style(elem, ctx.style);
                return elem;
            }
        },
        {
            key: "_poly",
            value: function _poly(ctx, points) {
                var closePath = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : true;
                var elem = SVGSpace.svgElement(ctx.group, closePath ? "polygon" : "polyline", _SVGForm.getID(ctx));
                DOMSpace.setAttr(elem, {
                    points: points,
                    "class": "pts-svgform pts-polygon ".concat(ctx.currentClass)
                });
                _SVGForm.style(elem, ctx.style);
                return elem;
            }
        },
        {
            key: "pointsString",
            value: function pointsString(pts) {
                var points = "";
                var count = 0;
                var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
                try {
                    for(var _iterator = pts[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
                        var p = _step.value;
                        points += "".concat(p[0], ",").concat(p[1], " ");
                        count++;
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally{
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return != null) {
                            _iterator.return();
                        }
                    } finally{
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
                return {
                    string: points,
                    count: count
                };
            }
        },
        {
            key: "polygon",
            value: function polygon(ctx, pts) {
                var points = _SVGForm.pointsString(pts);
                return _SVGForm._poly(ctx, points.string, true);
            }
        },
        {
            key: "rect",
            value: function rect(ctx, pts) {
                if (!Util.arrayCheck(pts)) return;
                var elem = SVGSpace.svgElement(ctx.group, "rect", _SVGForm.getID(ctx));
                var bound = Group.fromArray(pts).boundingBox();
                var size = Rectangle.size(bound);
                DOMSpace.setAttr(elem, {
                    x: bound[0][0],
                    y: bound[0][1],
                    width: size[0],
                    height: size[1],
                    "class": "pts-svgform pts-rect ".concat(ctx.currentClass)
                });
                _SVGForm.style(elem, ctx.style);
                return elem;
            }
        },
        {
            key: "text",
            value: function text(ctx, pt, txt) {
                var elem = SVGSpace.svgElement(ctx.group, "text", _SVGForm.getID(ctx));
                DOMSpace.setAttr(elem, {
                    "pointer-events": "none",
                    x: pt[0],
                    y: pt[1],
                    dx: 0,
                    dy: 0,
                    "class": "pts-svgform pts-text ".concat(ctx.currentClass)
                });
                elem.textContent = txt;
                _SVGForm.style(elem, ctx.style);
                return elem;
            }
        }
    ]);
    return _SVGForm1;
}(VisualForm);
var SVGForm = _SVGForm;
SVGForm.groupID = 0;
SVGForm.domID = 0;
// src/Physics.ts
var World = /*#__PURE__*/ function() {
    "use strict";
    function World1(bound) {
        var friction = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1, gravity = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 0;
        _classCallCheck(this, World1);
        this._lastTime = null;
        this._gravity = new Pt();
        this._friction = 1;
        this._damping = 0.75;
        this._particles = [];
        this._bodies = [];
        this._pnames = [];
        this._bnames = [];
        this._bound = Bound.fromGroup(bound);
        this._friction = friction;
        this._gravity = typeof gravity === "number" ? new Pt(0, gravity) : new Pt(gravity);
        return this;
    }
    _createClass(World1, [
        {
            key: "bound",
            get: function get() {
                return this._bound;
            },
            set: function set(bound) {
                this._bound = bound;
            }
        },
        {
            key: "gravity",
            get: function get() {
                return this._gravity;
            },
            set: function set(g) {
                this._gravity = g;
            }
        },
        {
            key: "friction",
            get: function get() {
                return this._friction;
            },
            set: function set(f) {
                this._friction = f;
            }
        },
        {
            key: "damping",
            get: function get() {
                return this._damping;
            },
            set: function set(f) {
                this._damping = f;
            }
        },
        {
            key: "bodyCount",
            get: function get() {
                return this._bodies.length;
            }
        },
        {
            key: "particleCount",
            get: function get() {
                return this._particles.length;
            }
        },
        {
            key: "body",
            value: function body(id) {
                var idx = id;
                if (typeof id === "string" && id.length > 0) {
                    idx = this._bnames.indexOf(id);
                }
                if (!(idx >= 0)) return void 0;
                return this._bodies[idx];
            }
        },
        {
            key: "particle",
            value: function particle(id) {
                var idx = id;
                if (typeof id === "string" && id.length > 0) {
                    idx = this._pnames.indexOf(id);
                }
                if (!(idx >= 0)) return void 0;
                return this._particles[idx];
            }
        },
        {
            key: "bodyIndex",
            value: function bodyIndex(name) {
                return this._bnames.indexOf(name);
            }
        },
        {
            key: "particleIndex",
            value: function particleIndex(name) {
                return this._pnames.indexOf(name);
            }
        },
        {
            key: "update",
            value: function update(ms) {
                var dt = ms / 1e3;
                this._updateParticles(dt);
                this._updateBodies(dt);
            }
        },
        {
            key: "drawParticles",
            value: function drawParticles(fn) {
                this._drawParticles = fn;
            }
        },
        {
            key: "drawBodies",
            value: function drawBodies(fn) {
                this._drawBodies = fn;
            }
        },
        {
            key: "add",
            value: function add(p) {
                var name = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
                if (_instanceof(p, Body)) {
                    this._bodies.push(p);
                    this._bnames.push(name);
                } else {
                    this._particles.push(p);
                    this._pnames.push(name);
                }
                return this;
            }
        },
        {
            key: "_index",
            value: function _index(fn, id) {
                var index = 0;
                if (typeof id === "string") {
                    index = fn(id);
                    if (index < 0) throw new Error("Cannot find index of ".concat(id, ". You can use particleIndex() or bodyIndex() function to check existence by name."));
                } else {
                    index = id;
                }
                return index;
            }
        },
        {
            key: "removeBody",
            value: function removeBody(from) {
                var count = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1;
                var index = this._index(this.bodyIndex.bind(this), from);
                var param = index < 0 ? [
                    index * -1 - 1,
                    count
                ] : [
                    index,
                    count
                ];
                this._bodies.splice(param[0], param[1]);
                this._bnames.splice(param[0], param[1]);
                return this;
            }
        },
        {
            key: "removeParticle",
            value: function removeParticle(from) {
                var count = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1;
                var index = this._index(this.particleIndex.bind(this), from);
                var param = index < 0 ? [
                    index * -1 - 1,
                    count
                ] : [
                    index,
                    count
                ];
                this._particles.splice(param[0], param[1]);
                this._pnames.splice(param[0], param[1]);
                return this;
            }
        },
        {
            key: "integrate",
            value: function integrate(p, dt, prevDt) {
                p.addForce(this._gravity);
                p.verlet(dt, this._friction, prevDt);
                return p;
            }
        },
        {
            key: "_updateParticles",
            value: function _updateParticles(dt) {
                for(var i = 0, len = this._particles.length; i < len; i++){
                    var p = this._particles[i];
                    this.integrate(p, dt, this._lastTime);
                    World.boundConstraint(p, this._bound, this._damping);
                    for(var k = i + 1; k < len; k++){
                        if (i !== k) {
                            var p2 = this._particles[k];
                            p.collide(p2, this._damping);
                        }
                    }
                    if (this._drawParticles) this._drawParticles(p, i);
                }
                this._lastTime = dt;
            }
        },
        {
            key: "_updateBodies",
            value: function _updateBodies(dt) {
                for(var i = 0, len = this._bodies.length; i < len; i++){
                    var bds = this._bodies[i];
                    if (bds) {
                        for(var k = 0, klen = bds.length; k < klen; k++){
                            var bk = bds[k];
                            World.boundConstraint(bk, this._bound, this._damping);
                            this.integrate(bk, dt, this._lastTime);
                        }
                        for(var k1 = i + 1; k1 < len; k1++){
                            bds.processBody(this._bodies[k1]);
                        }
                        for(var m = 0, mlen = this._particles.length; m < mlen; m++){
                            bds.processParticle(this._particles[m]);
                        }
                        bds.processEdges();
                        if (this._drawBodies) this._drawBodies(bds, i);
                    }
                }
            }
        }
    ], [
        {
            key: "edgeConstraint",
            value: function edgeConstraint(p1, p2, dist) {
                var stiff = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 1, precise = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : false;
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
        },
        {
            key: "boundConstraint",
            value: function boundConstraint(p, rect) {
                var damping = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 0.75;
                var bound = Geom.boundingBox(rect);
                var np = p.$min(bound[1].subtract(p.radius)).$max(bound[0].add(p.radius));
                if (np[0] === bound[0][0] || np[0] === bound[1][0]) {
                    var c = p.changed.$multiply(damping);
                    p.previous = np.$subtract(new Pt(-c[0], c[1]));
                } else if (np[1] === bound[0][1] || np[1] === bound[1][1]) {
                    var c1 = p.changed.$multiply(damping);
                    p.previous = np.$subtract(new Pt(c1[0], -c1[1]));
                }
                p.to(np);
            }
        }
    ]);
    return World1;
}();
var Particle = /*#__PURE__*/ function(Pt1) {
    "use strict";
    _inherits(Particle, Pt1);
    var _super = _createSuper(Particle);
    function Particle() {
        for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
            args[_key] = arguments[_key];
        }
        _classCallCheck(this, Particle);
        var _this;
        _this = _super.call.apply(_super, [
            this
        ].concat(_toConsumableArray(args)));
        _this._mass = 1;
        _this._radius = 0;
        _this._force = new Pt();
        _this._prev = new Pt();
        _this._lock = false;
        _this._prev = _this.clone();
        return _this;
    }
    _createClass(Particle, [
        {
            key: "mass",
            get: function get() {
                return this._mass;
            },
            set: function set(m) {
                this._mass = m;
            }
        },
        {
            key: "radius",
            get: function get() {
                return this._radius;
            },
            set: function set(f) {
                this._radius = f;
            }
        },
        {
            key: "previous",
            get: function get() {
                return this._prev;
            },
            set: function set(p) {
                this._prev = p;
            }
        },
        {
            key: "force",
            get: function get() {
                return this._force;
            },
            set: function set(g) {
                this._force = g;
            }
        },
        {
            key: "body",
            get: function get() {
                return this._body;
            },
            set: function set(b) {
                this._body = b;
            }
        },
        {
            key: "lock",
            get: function get() {
                return this._lock;
            },
            set: function set(b) {
                this._lock = b;
                this._lockPt = new Pt(this);
            }
        },
        {
            key: "changed",
            get: function get() {
                return this.$subtract(this._prev);
            }
        },
        {
            key: "position",
            set: function set(p) {
                this.previous.to(this);
                if (this._lock) this._lockPt = p;
                this.to(p);
            }
        },
        {
            key: "size",
            value: function size(r) {
                this._mass = r;
                this._radius = r;
                return this;
            }
        },
        {
            key: "addForce",
            value: function addForce() {
                for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                    args[_key] = arguments[_key];
                }
                var __force;
                (__force = this._force).add.apply(__force, _toConsumableArray(args));
                return this._force;
            }
        },
        {
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
                    this._force = new Pt();
                }
                return this;
            }
        },
        {
            key: "hit",
            value: function hit() {
                for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                    args[_key] = arguments[_key];
                }
                this._prev.subtract(_construct(Pt, _toConsumableArray(args)).$divide(Math.sqrt(this._mass)));
                return this;
            }
        },
        {
            key: "collide",
            value: function collide(p2) {
                var damp = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1;
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
                    c1.add(new Pt(f2 * dp[0] - f1 * dp[0], f2 * dp[1] - f1 * dp[1]).$multiply(dm2));
                    c2.add(new Pt(f1 * dp[0] - f2 * dp[0], f1 * dp[1] - f2 * dp[1]).$multiply(dm1));
                    p1.previous = p1.$subtract(c1);
                    p2.previous = p2.$subtract(c2);
                }
            }
        },
        {
            key: "toString",
            value: function toString() {
                return "Particle: ".concat(this[0], " ").concat(this[1], " | previous ").concat(this._prev[0], " ").concat(this._prev[1], " | mass ").concat(this._mass);
            }
        }
    ]);
    return Particle;
}(Pt);
var Body = /*#__PURE__*/ function(Group1) {
    "use strict";
    _inherits(Body1, Group1);
    var _super = _createSuper(Body1);
    function Body1() {
        _classCallCheck(this, Body1);
        var _this;
        _this = _super.call(this);
        _this._cs = [];
        _this._stiff = 1;
        _this._locks = {};
        _this._mass = 1;
        return _this;
    }
    _createClass(Body1, [
        {
            key: "init",
            value: function init(body) {
                var stiff = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1;
                var c = new Pt();
                var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
                try {
                    for(var _iterator = body[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
                        var li = _step.value;
                        var p = new Particle(li);
                        p.body = this;
                        c.add(li);
                        this.push(p);
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally{
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return != null) {
                            _iterator.return();
                        }
                    } finally{
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
                this._stiff = stiff;
                return this;
            }
        },
        {
            key: "mass",
            get: function get() {
                return this._mass;
            },
            set: function set(m) {
                this._mass = m;
                for(var i = 0, len = this.length; i < len; i++){
                    this[i].mass = this._mass;
                }
            }
        },
        {
            key: "autoMass",
            value: function autoMass() {
                this.mass = Math.sqrt(Polygon.area(this)) / 10;
                return this;
            }
        },
        {
            key: "link",
            value: function link(index1, index2, stiff) {
                if (index1 < 0 || index1 >= this.length) throw new Error("index1 is not in the Group's indices");
                if (index2 < 0 || index2 >= this.length) throw new Error("index1 is not in the Group's indices");
                var d = this[index1].$subtract(this[index2]).magnitude();
                this._cs.push([
                    index1,
                    index2,
                    d,
                    stiff || this._stiff
                ]);
                return this;
            }
        },
        {
            key: "linkAll",
            value: function linkAll(stiff) {
                var half = this.length / 2;
                for(var i = 0, len = this.length; i < len; i++){
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
        },
        {
            key: "linksToLines",
            value: function linksToLines() {
                var gs = [];
                for(var i = 0, len = this._cs.length; i < len; i++){
                    var ln = this._cs[i];
                    gs.push(new Group(this[ln[0]], this[ln[1]]));
                }
                return gs;
            }
        },
        {
            key: "processEdges",
            value: function processEdges() {
                for(var i = 0, len = this._cs.length; i < len; i++){
                    var _i = _slicedToArray(this._cs[i], 4), m = _i[0], n = _i[1], d = _i[2], s = _i[3];
                    World.edgeConstraint(this[m], this[n], d, s);
                }
            }
        },
        {
            key: "processBody",
            value: function processBody(b) {
                var b1 = this;
                var b2 = b;
                var hit = Polygon.hasIntersectPolygon(b1, b2);
                if (hit) {
                    var cv = hit.normal.$multiply(hit.dist);
                    var t;
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
        },
        {
            key: "processParticle",
            value: function processParticle(b) {
                var b1 = this;
                var b2 = b;
                var hit = Polygon.hasIntersectCircle(b1, Circle.fromCenter(b, b.radius));
                if (hit) {
                    var cv = hit.normal.$multiply(hit.dist);
                    var t;
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
        }
    ], [
        {
            key: "fromGroup",
            value: function fromGroup(body) {
                var stiff = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1, autoLink = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : true, autoMass = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : true;
                var b = new Body().init(body);
                if (autoLink) b.linkAll(stiff);
                if (autoMass) b.autoMass();
                return b;
            }
        }
    ]);
    return Body1;
}(Group);
// src/Play.ts
var Tempo = /*#__PURE__*/ function() {
    "use strict";
    function Tempo1(bpm) {
        _classCallCheck(this, Tempo1);
        this._listeners = {};
        this._listenerInc = 0;
        this.bpm = bpm;
    }
    _createClass(Tempo1, [
        {
            key: "bpm",
            get: function get() {
                return this._bpm;
            },
            set: function set(n) {
                this._bpm = n;
                this._ms = 6e4 / this._bpm;
            }
        },
        {
            key: "ms",
            get: function get() {
                return this._ms;
            },
            set: function set(n) {
                this._bpm = Math.floor(6e4 / n);
                this._ms = 6e4 / this._bpm;
            }
        },
        {
            key: "_createID",
            value: function _createID(listener) {
                var id = "";
                if (typeof listener === "function") {
                    id = "_b" + this._listenerInc++;
                } else {
                    id = listener.name || "_b" + this._listenerInc++;
                }
                return id;
            }
        },
        {
            key: "every",
            value: function every(beats) {
                var self = this;
                var p = Array.isArray(beats) ? beats[0] : beats;
                return {
                    start: function start(fn) {
                        var offset = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0, name = arguments.length > 2 ? arguments[2] : void 0;
                        var id = name || self._createID(fn);
                        self._listeners[id] = {
                            name: id,
                            beats: beats,
                            period: p,
                            index: 0,
                            offset: offset,
                            duration: -1,
                            continuous: false,
                            fn: fn
                        };
                        return this;
                    },
                    progress: function progress(fn) {
                        var offset = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0, name = arguments.length > 2 ? arguments[2] : void 0;
                        var id = name || self._createID(fn);
                        self._listeners[id] = {
                            name: id,
                            beats: beats,
                            period: p,
                            index: 0,
                            offset: offset,
                            duration: -1,
                            continuous: true,
                            fn: fn
                        };
                        return this;
                    }
                };
            }
        },
        {
            key: "track",
            value: function track(time) {
                for(var k in this._listeners){
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
                        var params = li.continuous ? [
                            count,
                            Num.clamp((_t - li.duration) / ms, 0, 1),
                            _t,
                            isStart
                        ] : [
                            count
                        ];
                        if (li.continuous || isStart) {
                            var done = li.fn.apply(li, params);
                            if (done) delete this._listeners[li.name];
                        }
                    }
                }
            }
        },
        {
            key: "stop",
            value: function stop(name) {
                if (this._listeners[name]) delete this._listeners[name];
            }
        },
        {
            key: "animate",
            value: function animate(time, ftime) {
                this.track(time);
            }
        },
        {
            key: "resize",
            value: function resize(bound, evt) {
                return;
            }
        },
        {
            key: "action",
            value: function action(type, px, py, evt) {
                return;
            }
        }
    ], [
        {
            key: "fromBeat",
            value: function fromBeat(ms) {
                return new Tempo(6e4 / ms);
            }
        }
    ]);
    return Tempo1;
}();
var Sound = /*#__PURE__*/ function() {
    "use strict";
    function Sound1(type) {
        _classCallCheck(this, Sound1);
        this._playing = false;
        this._type = type;
        var _ctx = window.AudioContext || window.webkitAudioContext || false;
        if (!_ctx) throw new Error("Your browser doesn't support Web Audio. (No AudioContext)");
        this._ctx = _ctx ? new _ctx() : void 0;
    }
    _createClass(Sound1, [
        {
            key: "createBuffer",
            value: function createBuffer(buf) {
                var _this = this;
                this._node = this._ctx.createBufferSource();
                if (buf !== void 0) this._buffer = buf;
                this._node.buffer = this._buffer;
                this._node.onended = function() {
                    _this._playing = false;
                };
                return this;
            }
        },
        {
            key: "_gen",
            value: function _gen(type, val) {
                this._node = this._ctx.createOscillator();
                var osc = this._node;
                osc.type = type;
                if (type === "custom") {
                    osc.setPeriodicWave(val);
                } else {
                    osc.frequency.value = val;
                }
                return this;
            }
        },
        {
            key: "ctx",
            get: function get() {
                return this._ctx;
            }
        },
        {
            key: "node",
            get: function get() {
                return this._node;
            }
        },
        {
            key: "outputNode",
            get: function get() {
                return this._outputNode;
            }
        },
        {
            key: "stream",
            get: function get() {
                return this._stream;
            }
        },
        {
            key: "source",
            get: function get() {
                return this._source;
            }
        },
        {
            key: "buffer",
            get: function get() {
                return this._buffer;
            },
            set: function set(b) {
                this._buffer = b;
            }
        },
        {
            key: "type",
            get: function get() {
                return this._type;
            }
        },
        {
            key: "playing",
            get: function get() {
                return this._playing;
            }
        },
        {
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
        },
        {
            key: "playable",
            get: function get() {
                return this._type === "input" ? this._node !== void 0 : !!this._buffer || this._source.readyState === 4;
            }
        },
        {
            key: "binSize",
            get: function get() {
                return this.analyzer.size;
            }
        },
        {
            key: "sampleRate",
            get: function get() {
                return this._ctx.sampleRate;
            }
        },
        {
            key: "frequency",
            get: function get() {
                return this._type === "gen" ? this._node.frequency.value : 0;
            },
            set: function set(f) {
                if (this._type === "gen") this._node.frequency.value = f;
            }
        },
        {
            key: "connect",
            value: function connect(node) {
                this._node.connect(node);
                return this;
            }
        },
        {
            key: "setOutputNode",
            value: function setOutputNode(outputNode) {
                this._outputNode = outputNode;
                return this;
            }
        },
        {
            key: "removeOutputNode",
            value: function removeOutputNode() {
                this._outputNode = null;
                return this;
            }
        },
        {
            key: "analyze",
            value: function analyze() {
                var size = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 256, minDb = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : -100, maxDb = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : -30, smooth = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 0.8;
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
        },
        {
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
        },
        {
            key: "_domainTo",
            value: function _domainTo(time, size) {
                var position = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : [
                    0,
                    0
                ], trim = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : [
                    0,
                    0
                ];
                var data = time ? this.timeDomain() : this.freqDomain();
                var g = new Group();
                for(var i = trim[0], len = data.length - trim[1]; i < len; i++){
                    g.push(new Pt(position[0] + size[0] * i / len, position[1] + size[1] * data[i] / 255));
                }
                return g;
            }
        },
        {
            key: "timeDomain",
            value: function timeDomain() {
                return this._domain(true);
            }
        },
        {
            key: "timeDomainTo",
            value: function timeDomainTo(size) {
                var position = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : [
                    0,
                    0
                ], trim = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : [
                    0,
                    0
                ];
                return this._domainTo(true, size, position, trim);
            }
        },
        {
            key: "freqDomain",
            value: function freqDomain() {
                return this._domain(false);
            }
        },
        {
            key: "freqDomainTo",
            value: function freqDomainTo(size) {
                var position = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : [
                    0,
                    0
                ], trim = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : [
                    0,
                    0
                ];
                return this._domainTo(false, size, position, trim);
            }
        },
        {
            key: "reset",
            value: function reset() {
                this.stop();
                this._node.disconnect();
                return this;
            }
        },
        {
            key: "start",
            value: function start() {
                var timeAt = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0;
                if (this._ctx.state === "suspended") this._ctx.resume();
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
                (this._outputNode || this._node).connect(this._ctx.destination);
                this._playing = true;
                return this;
            }
        },
        {
            key: "stop",
            value: function stop() {
                if (this._playing) (this._outputNode || this._node).disconnect(this._ctx.destination);
                if (this._type === "file") {
                    if (!!this._buffer) {
                        if (this.progress < 1) this._node.stop();
                    } else {
                        this._source.pause();
                    }
                } else if (this._type === "gen") {
                    this._node.stop();
                } else if (this._type === "input") {
                    this._stream.getAudioTracks().forEach(function(track) {
                        return track.stop();
                    });
                }
                this._playing = false;
                return this;
            }
        },
        {
            key: "toggle",
            value: function toggle() {
                if (this._playing) {
                    this.stop();
                } else {
                    this.start();
                }
                return this;
            }
        }
    ], [
        {
            key: "from",
            value: function from(node, ctx) {
                var type = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "gen", stream = arguments.length > 3 ? arguments[3] : void 0;
                var s = new Sound(type);
                s._node = node;
                s._ctx = ctx;
                if (stream) s._stream = stream;
                return s;
            }
        },
        {
            key: "load",
            value: function load(source) {
                var crossOrigin = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "anonymous";
                return new Promise(function(resolve, reject) {
                    var s = new Sound("file");
                    s._source = typeof source === "string" ? new Audio(source) : source;
                    s._source.autoplay = false;
                    s._source.crossOrigin = crossOrigin;
                    s._source.addEventListener("ended", function() {
                        s._playing = false;
                    });
                    s._source.addEventListener("error", function() {
                        reject("Error loading sound");
                    });
                    s._source.addEventListener("canplaythrough", function() {
                        s._node = s._ctx.createMediaElementSource(s._source);
                        resolve(s);
                    });
                });
            }
        },
        {
            key: "loadAsBuffer",
            value: function loadAsBuffer(url) {
                return new Promise(function(resolve, reject) {
                    var request = new XMLHttpRequest();
                    request.open("GET", url, true);
                    request.responseType = "arraybuffer";
                    var s = new Sound("file");
                    request.onload = function() {
                        s._ctx.decodeAudioData(request.response, function(buffer) {
                            s.createBuffer(buffer);
                            resolve(s);
                        }, function(err) {
                            return reject("Error decoding audio");
                        });
                    };
                    request.send();
                });
            }
        },
        {
            key: "generate",
            value: function generate(type, val) {
                var s = new Sound("gen");
                return s._gen(type, val);
            }
        },
        {
            key: "input",
            value: function input(constraint) {
                return _asyncToGenerator(function() {
                    var s, c, e;
                    return __generator(this, function(_state) {
                        switch(_state.label){
                            case 0:
                                _state.trys.push([
                                    0,
                                    2,
                                    ,
                                    3
                                ]);
                                s = new Sound("input");
                                if (!s) return [
                                    2,
                                    void 0
                                ];
                                c = constraint ? constraint : {
                                    audio: true,
                                    video: false
                                };
                                return [
                                    4,
                                    navigator.mediaDevices.getUserMedia(c)
                                ];
                            case 1:
                                s._stream = _state.sent();
                                s._node = s._ctx.createMediaStreamSource(s._stream);
                                return [
                                    2,
                                    s
                                ];
                            case 2:
                                e = _state.sent();
                                console.error("Cannot get audio from input device.");
                                return [
                                    2,
                                    Promise.resolve(null)
                                ];
                            case 3:
                                return [
                                    2
                                ];
                        }
                    });
                })();
            }
        }
    ]);
    return Sound1;
}();
export { Body, Bound, CanvasForm, CanvasSpace2 as CanvasSpace, Circle, Color, Const, Create, Curve, DOMSpace, Delaunay, Font, Form, Geom, Group, HTMLForm, HTMLSpace, Img, Line, Mat, MultiTouchSpace, Noise, Num, Particle, Polygon, Pt, Range, Rectangle, SVGForm, SVGSpace, Shaping, Sound, Space, Tempo, Triangle, Typography, UI, UIButton, UIDragger, UIPointerActions, UIShape, Util, Vec, VisualForm, World }; /*! Pts.js is licensed under Apache License 2.0. Copyright © 2017-current William Ngan and contributors. (https://github.com/williamngan/pts) */ 
