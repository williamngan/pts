"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _Bound = require("./Bound");
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
let namespace = (sc) => {
    let lib = module.exports;
    for (let k in lib) {
        if (k != "namespace") {
            sc[k] = lib[k];
        }
    }
};
module.exports = Object.assign({ namespace }, _Bound, _Canvas, _Create, _Form, _LinearAlgebra, _Op, _Num, _Pt, _Space, _Util, _Color, _Dom, _Svg, _Typography, _Physics);
//# sourceMappingURL=_lib.js.map