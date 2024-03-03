import * as Canvas from "./Canvas";
import * as Create from "./Create";
import * as Form from "./Form";
import * as LinearAlgebra from "./LinearAlgebra";
import * as Num from "./Num";
import * as Op from "./Op";
import * as Pt from "./Pt";
import * as Space from "./Space";
import * as Color from "./Color";
import * as Util from "./Util";
import * as Dom from "./Dom";
import * as Svg from "./Svg";
import * as Typography from "./Typography";
import * as Physics from "./Physics";
import * as UI from "./UI";
import * as Play from "./Play";
import * as Image from "./Image";
import * as Types from "./Types";

globalThis.Pts = {
  ...Canvas, ...Create, ...Form,
  ...LinearAlgebra, ...Num, ...Op,
  ...Pt, ...Space, ...Color,
  ...Util, ...Dom, ...Svg,
  ...Typography, ...Physics, ...UI,
  ...Play, ...Image
};

// A function to switch scope for Pts library. eg, Pts.namespace( window );
globalThis.Pts.namespace = ( scope:any ) => {
  let lib = globalThis.Pts;
  for ( let k in lib ) {
    if ( k != "namespace" ) {
      scope[k] = lib[k];
    }
  }
};

globalThis.Pts.quickStart = ( id:string, bg:string = "#9ab" ) => {
  if ( !window ) return;
  
  let s:any = globalThis;
  globalThis.Pts.namespace( s );
  
  s.space = new Canvas.CanvasSpace( id ).setup( {bgcolor: bg, resize: true, retina: true} );
  s.form = s.space.getForm();

  return function( animate = null, start = null, action = null, resize = null ) {
    s.space.add( {
      start: start,
      animate: animate,
      resize: resize,
      action: action,
    } );

    s.space.bindMouse().bindTouch().play();
  };

};