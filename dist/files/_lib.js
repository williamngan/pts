"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _Canvas = require("./Canvas");
const _Create = require("./Create");
const _Form = require("./Form");
const _LinearAlgebra = require("./LinearAlgebra");
const _Num = require("./Num");
const _Op = require("./Op");
const _Pt = require("./Pt");
const _Space = require("./Space");
const _Color = require("./Color");
const _Util = require("./Util");
const _Dom = require("./Dom");
const _Svg = require("./Svg");
const _Typography = require("./Typography");
const _Physics = require("./Physics");
const _types = require("./Types");
let namespace = (scope) => {
    let lib = module.exports;
    for (let k in lib) {
        if (k != "namespace") {
            scope[k] = lib[k];
        }
    }
};
let quickStart = (id, bg = "#9ab") => {
    let s = window;
    namespace(s);
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
module.exports = Object.assign({ namespace,
    quickStart }, _types, _Canvas, _Create, _Form, _LinearAlgebra, _Op, _Num, _Pt, _Space, _Util, _Color, _Dom, _Svg, _Typography, _Physics);
//# sourceMappingURL=_lib.js.map