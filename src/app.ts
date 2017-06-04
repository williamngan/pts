import {Vector, Matrix} from 'vectorious';
import {Pt, IPt} from './Pt';
import {Pts} from './Pts';
import {CanvasSpace} from "./CanvasSpace"; 
import {CanvasForm} from "./CanvasForm"; 

window["Pt"] = Pt;
window["Pts"] = Pts;

// console.log( Pts.zipOne( [new Pt(1,3,5,7), new Pt(2,4,6,8), new Pt(5,10,15,20)], 5, 0 ) );
// console.log( new Pt(1,2,3,4,5,6).slice(2,5).toString() );
// console.log( Pts.toString( Pts.zip( [new Pt(1,2,3), new Pt(3,4), new Pt(5,6,7,8,9)], 0 ) ) );
// console.log( Pts.toString( Pts.zip( Pts.zip( [new Pt(1,2), new Pt(3,4), new Pt(5,6)] ) ) ) );

console.log( Pts.split( [1,2,3,4,5,6,7,8,9,10,11,12,13], 5 ) );

let cs = [];
for (let i=0; i<500; i++) {
  let c = new Pt( Math.random()*200, Math.random()*200 );
  cs.push( c );
}


var canvas = new CanvasSpace("#pt").setup({retina: true});
var form = canvas.getForm();
var form2 = canvas.getForm();

var pt = new Pt(50, 50);
var pto = pt.to([
  (p:Pt) => p.$add( new Pt(10) ),
  (p:Pt) => p.$add( new Pt(20) ),

]);

canvas.add( (time, fps, space) => {
  form.reset();
  // form.point( {x:50.5, y: 50.5}, 20, "circle");
  // form.point( {x:50.5, y: 140.5}, 20, );
    // console.log(time, fps);

    form.point( {x:50, y:50}, 100);    
}) 

canvas.add( {
  animate: (time, fps, space) => {
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
