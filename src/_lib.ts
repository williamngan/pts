import * as _Bound from "./Bound";
import * as _Canvas from "./Canvas";
import * as _Create from "./Create";
import * as _Form from "./Form";
import * as _LinearAlgebra from "./LinearAlgebra";
import * as _Num from "./Num";
import * as _Op from "./Op";
import * as _Pt from "./Pt";
import * as _Space from "./Space";
import * as _Color from "./Color";
import * as _Util from "./Util";
import * as _Dom from "./Dom";
import * as _Svg from "./Svg";
import * as _Typography from "./Typography";
import * as _Physics from "./Physics";

// A function to switch scope for Pts library. eg, Pts.scope( Pts, window );
let namespace = ( sc:object ) => {
  let lib = module.exports;
  for (let k in lib) {
    if (k!="namespace") {
      sc[k] = lib[k];
    }
  }
};

module.exports = {
  namespace,
  ..._Bound,
  ..._Canvas,
  ..._Create,
  ..._Form,
  ..._LinearAlgebra,
  ..._Op,
  ..._Num,
  ..._Pt,
  ..._Space,
  ..._Util,
  ..._Color,
  ..._Dom,
  ..._Svg,
  ..._Typography,
  ..._Physics,
};