export * from "./Canvas";
export * from "./Create";
export * from "./Form";
export * from "./LinearAlgebra";
export * from "./Num";
export * from "./Op";
export * from "./Pt";
export * from "./Space";
export * from "./Color";
export * from "./Util";
export * from "./Dom";
export * from "./Svg";
export * from "./Typography";
export * from "./Physics";
export * from "./UI";
export * from "./Play";
import * as _Canvas from './Canvas';
export let namespace = (scope) => {
    let lib = module.exports;
    for (let k in lib) {
        if (k != "namespace") {
            scope[k] = lib[k];
        }
    }
};
export let quickStart = (id, bg = "#9ab") => {
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
//# sourceMappingURL=_lib.js.map