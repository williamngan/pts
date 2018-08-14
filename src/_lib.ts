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
export * from "./Types";

// import again for use in quickStart
import * as _Canvas from './Canvas';

// A function to switch scope for Pts library. eg, Pts.namespace( window );
export let namespace = ( scope:any ) => {
  let lib = module.exports;
  for (let k in lib) {
    if (k!="namespace") {
      scope[k] = lib[k];
    }
  }
};

export let quickStart = ( id:string, bg:string="#9ab" ) => {
  let s:any = window;
  namespace( s );
  
  s.space = new _Canvas.CanvasSpace( id ).setup({bgcolor: bg, resize: true, retina: true});
  s.form = s.space.getForm();

  return function( animate=null, start=null, action=null, resize=null ) {
    s.space.add({
      start: start,
      animate: animate,
      resize: resize,
      action: action,
    });

    s.space.bindMouse().bindTouch().play();
  };

};