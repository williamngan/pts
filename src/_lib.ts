import * as _Bound from "./Bound";
import * as _CanvasForm from "./CanvasForm";
import * as _CanvasSpace from "./CanvasSpace";
import * as _Create from "./Create";
import * as _Form from "./Form";
import * as _LinearAlgebra from "./LinearAlgebra";
import * as _Op from "./Op";
import * as _Pt from "./Pt";
import * as _Space from "./Space";
import * as _Util from "./Util";

// A function to switch scope for Pts library. eg, Pts.scope( Pts, window );
let scope = ( lib:object, sc:object ) => {
  for (let k in lib) {    
    if (k!="scope") {
      sc[k] = lib[k];
    }
  }
}

module.exports = {
  scope,
  ..._Bound,
  ..._CanvasForm,
  ..._CanvasSpace,
  ..._Create,
  ..._Form,
  ..._LinearAlgebra,
  ..._Op,
  ..._Pt,
  ..._Space,
  ..._Util,
}