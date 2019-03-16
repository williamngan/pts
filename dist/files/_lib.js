"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./Canvas"));
__export(require("./Create"));
__export(require("./Form"));
__export(require("./LinearAlgebra"));
__export(require("./Num"));
__export(require("./Op"));
__export(require("./Pt"));
__export(require("./Space"));
__export(require("./Color"));
__export(require("./Util"));
__export(require("./Dom"));
__export(require("./Svg"));
__export(require("./Typography"));
__export(require("./Physics"));
__export(require("./UI"));
__export(require("./Play"));
const _Canvas = require("./Canvas");
exports.namespace = (scope) => {
    let lib = module.exports;
    for (let k in lib) {
        if (k != "namespace") {
            scope[k] = lib[k];
        }
    }
};
exports.quickStart = (id, bg = "#9ab") => {
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
//# sourceMappingURL=_lib.js.map