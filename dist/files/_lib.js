"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.quickStart = exports.namespace = void 0;
__exportStar(require("./Canvas"), exports);
__exportStar(require("./Create"), exports);
__exportStar(require("./Form"), exports);
__exportStar(require("./LinearAlgebra"), exports);
__exportStar(require("./Num"), exports);
__exportStar(require("./Op"), exports);
__exportStar(require("./Pt"), exports);
__exportStar(require("./Space"), exports);
__exportStar(require("./Color"), exports);
__exportStar(require("./Util"), exports);
__exportStar(require("./Dom"), exports);
__exportStar(require("./Svg"), exports);
__exportStar(require("./Typography"), exports);
__exportStar(require("./Physics"), exports);
__exportStar(require("./UI"), exports);
__exportStar(require("./Play"), exports);
__exportStar(require("./Image"), exports);
__exportStar(require("./Types"), exports);
const _Canvas = require("./Canvas");
let namespace = (scope) => {
    let lib = module.exports;
    for (let k in lib) {
        if (k != "namespace") {
            scope[k] = lib[k];
        }
    }
};
exports.namespace = namespace;
let quickStart = (id, bg = "#9ab") => {
    if (!window)
        return;
    let s = window;
    exports.namespace(s);
    s.space = new _Canvas.CanvasSpace(id).setup({ bgcolor: bg, resize: true, retina: true });
    s.form = s.space.getForm();
    return function (animate = null, start = null, action = null, resize = null) {
        s.space.add({
            start: start,
            animate: animate,
            resize: resize,
            action: action,
        });
        s.space.bindMouse().bindTouch().play();
    };
};
exports.quickStart = quickStart;
//# sourceMappingURL=_lib.js.map