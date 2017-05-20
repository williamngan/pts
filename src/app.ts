import {Vector, Matrix} from 'vectorious';
import {Pt} from './Pt';
import {Pts} from './Pts';
import {CanvasSpace} from "./CanvasSpace"; 
import {CanvasForm} from "./CanvasForm"; 

window["Pt"] = Pt;
window["Pts"] = Pts;

var canvas = new CanvasSpace("#pt").setup({retina: true});
var form = canvas.getForm();
var form2 = canvas.getForm();

canvas.add( () => {
  form.reset();
  form.point( {x:50.5, y: 50.5}, 20, "circle");
  form.point( {x:50.5, y: 140.5}, 20, );
    // console.log(time, fps);
  }
) 

canvas.add( {
  animate: (time, fps, context) => {
    form2.reset();
    form2.fill("#fff").stroke("#000").point( {x:150.5, y: 50.5}, 20, "circle");
    form2.fill("#ff0").stroke("#ccc").point( {x:150.5, y: 140.5}, 20, );
    // console.log(time, fps);
  }
}) 

canvas.playOnce(200);


/*
let vec = new Vector( [1000, 2, 3] ).add( new Vector( [2, 3, 4] ) );
console.log(vec.toString());

setInterval( () => vec.add( new Vector( [ 1, 2, 3 ]) ), 500 );

let m1 = Matrix.identity(3);
let m2 = Matrix.identity(3);


console.log( Matrix.add(m1, m2).toString() );

let pts = new Pts();
console.log( pts );
*/

// console.log(pts.toString());
// pts.pt(1,2,3);
// pts.pt(2,3,4);
// console.log(pts.toString());
// console.log( Matrix.augment(m1, m2).toString() );
