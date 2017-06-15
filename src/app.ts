import {Pt, IPt} from './Pt';
import {Pts} from './Pts';
import {Bound} from './Bound';
import {Create} from './Create';
import {CanvasSpace} from "./CanvasSpace"; 
import {CanvasForm} from "./CanvasForm"; 

window["Pt"] = Pt;
window["Pts"] = Pts;

var p = new Pt([1,2,3]);
console.log( p, p.x );

p.add(10,20);
console.log( p, p.x );

p.add( 1 );
console.log( p, p.x );

var p2 = p.clone();
p2.add(10,20);
var p3 = p2.$add(100);
console.log(  p, p2, p3 );

var p4 = p3.$map( (n, i) => n*i*10 );
console.log( p3, p4 );

console.log( new Pt([1,2,3]).$slice(0,2).toString() );

/*
console.log( new Pt(32,43).unit().magnitude() );

// console.log( Pts.zipOne( [new Pt(1,3), new Pt(2,4), new Pt(5,10)], 1, 0 ).toString() );
// console.log( new Pt(1,2,3,4,5,6).slice(2,5).toString() );
// console.log( Pts.toString( Pts.zip( [new Pt(1,2), new Pt(3,4), new Pt(5,6)] ) ) );
// console.log( Pts.toString( Pts.zip( Pts.zip( [new Pt(1,2), new Pt(3,4), new Pt(5,6)] ) ) ) );

console.log( Pts.split( [1,2,3,4,5,6,7,8,9,10,11,12,13], 5 ) );

let cs = [];
for (let i=0; i<500; i++) {
  let c = new Pt( Math.random()*200, Math.random()*200 );
  cs.push( c );
}

var canvas = new CanvasSpace("#pt", ready).setup({retina: true});
var form = canvas.getForm();
var form2 = canvas.getForm();

var pt = new Pt(50, 50);
var pto = pt.to([
  (p:Pt) => p.$add( 10, 10 ),
  (p:Pt) => p.$add( 20, 25 )
]);

var pto2 = pt.to({
  "a": (p:Pt) => p.$add( 10, 10 ),
  "b": (p:Pt) => p.$add( 20, 25 )
});


for (var i in pto2) {
  console.log( "==>", pto2[i].toString() );
}

console.log( pto.reduce( (a,b) => a+" | "+b.toString(), "" ) );
console.log( pt.toString() );

var ps = [];

let fs = {
  "size": (p:Pt) => {
    let dist = p.$subtract( canvas.size.$divide(2) ).magnitude();
    return new Pt( dist/8, dist/(Math.max(canvas.width, canvas.height)/2) );
  },
}

function ready( bound, space) {
  ps = Create.distributeRandom( new Bound(canvas.size), 200 );
}

canvas.add( {
 animate: (time, fps, space) => {
    form.reset();
    form.stroke( false );
    ps.forEach( (p) => {
      let attrs = p.to( fs );
      form.fill(`rgba(255,0,0,${1.2-attrs.size.y}`);
      form.point( p, attrs.size.x, "circle" );
    })
    // form.point( {x:50.5, y: 50.5}, 20, "circle");
    // form.point( {x:50.5, y: 140.5}, 20, );
      // console.log(time, fps);

      // form.point( {x:50, y:50}, 100);    
  },

  onMouseAction: (type, px, py) => {
    if (type=="move") {
      let d = canvas.boundingBox.center.$subtract( px, py);
      let p1 = canvas.boundingBox.center.$subtract(d);

      let bound = new Bound( p1, p1.$add( d.$abs().multiply(2) ) )
      ps = Create.distributeRandom( bound, 200 );
    }
  }
}); 

canvas.bindMouse();
*/



/*
canvas.add( {
  animate: (time, fps, space) => {
    form2.reset();
    form2.fill("#fff").stroke("#000").point( {x:150.5, y: 50.5}, 20, "circle");
    form2.fill("#ff0").stroke("#ccc").point( {x:150.5, y: 140.5}, 20, );
    // console.log(time, fps);
  }
})
*/ 

//canvas.playOnce(5000);


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
