import {Pt, IPt} from './Pt';
import {Util} from './Util';
import {Bound} from './Bound';
import {Create} from './Create';
import {CanvasSpace} from "./CanvasSpace"; 
import {CanvasForm} from "./CanvasForm"; 

window["Pt"] = Pt;


console.log( new Pt(32,43).unit().magnitude() );

// console.log( Pts.zipOne( [new Pt(1,3), new Pt(2,4), new Pt(5,10)], 1, 0 ).toString() );
// console.log( new Pt(1,2,3,4,5,6).slice(2,5).toString() );
// console.log( Pts.toString( Pts.zip( [new Pt(1,2), new Pt(3,4), new Pt(5,6)] ) ) );
// console.log( Pts.toString( Pts.zip( Pts.zip( [new Pt(1,2), new Pt(3,4), new Pt(5,6)] ) ) ) );

console.log( Util.split( [1,2,3,4,5,6,7,8,9,10,11,12,13], 5 ) );

let cs = [];
for (let i=0; i<500; i++) {
  let c = new Pt( Math.random()*200, Math.random()*200 );
  cs.push( c );
}

var canvas = new CanvasSpace("#pt", ready).setup({retina: true});
var form = canvas.getForm();
var form2 = canvas.getForm();

var pt = new Pt(50, 50);
var pto = pt.op([
  (p:Pt) => p.$add( 10, 10 ),
  (p:Pt) => p.$add( 20, 25 )
]);

var pto2 = pt.op({
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
  ps = Create.distributeRandom( new Bound(canvas.size), 50 );
}


canvas.add( {
 animate: (time, ftime, space) => {
    let framerate = 1000/ftime;
    form.fill("#999").text( new Pt(20, 20), framerate+" fps" );

    form.reset();
    form.stroke( false );

    ps.forEach( (p) => {
      let attrs = p.op( fs );
      form.fill(`rgba(255,0,0,${1.2-attrs.size.y}`);
      form.point( p, attrs.size.x, "circle" );
    })
    // form.point( {x:50.5, y: 50.5}, 20, "circle");
    // form.point( {x:50.5, y: 140.5}, 20, );
      // console.log(time, fps);

      // form.point( {x:50, y:50}, 100);    
  },

  action: (type, px, py) => {
    if (type=="move") {
      let d = canvas.boundingBox.center.$subtract( px, py);
      let p1 = canvas.boundingBox.center.$subtract(d);

      let bound = new Bound( p1, p1.$add( d.$abs().multiply(2) ) )
      ps = Create.distributeRandom( bound, 200 );
    }
  }
}); 

canvas.bindMouse();
canvas.playOnce(3000);




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
