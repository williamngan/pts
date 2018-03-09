// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)


Pts.namespace( window );

var space = new CanvasSpace("#pt").setup({retina: true, resize: true});
var form = space.getForm();


space.add( {

  start: init,

  animate: (time, ftime) => {
    guidelines();
    
    // Begin Test Code --

    form.stroke("#000", 3);
    let ln1 = new Group( space.center.$add(50), space.pointer.clone() );
    form.line( ln1 );

    // bounding box
    let r1 = Line.toRect( ln1 );
    form.stroke("#fff", 1).rect( r1 );

    // ray
    let t1 = Line.intersectRay2D( ln1, line2 );
    form.stroke("#09f", 2).line( line2 ).point( t1 );

    // line
    let t2 = Line.intersectLine2D( ln1, line1 );
    form.stroke("#f90").line( line1 ).point( t2 );

    // line to ray
    let t3 = Line.intersectLineWithRay2D( ln1, line3 );
    form.stroke("#90f").line( line3 ).point( t3 );

    // polygon
    let tp = Line.intersectPolygon2D( ln1, poly1.lines() );
    form.stroke("#f00").line( poly1 ).points( tp );

    // grid
    let t4 = Line.intersectGridWithRay2D( ln1, rect1[0] );
    let t5 = Line.intersectGridWithLine2D( ln1, rect1[0] );
    form.stroke("#090").point( rect1.p1, 5, "circle" ).points( t4, 3, "circle" );
    form.fill("#0f0").stroke(false).point( rect1.p1, 5, "circle" ).points( t5, 2 );

    // End
  },

  action:( type, px, py) => {

  },
  
  resize:( bound, evt) => {
    
  }
  
});
  

// Template: Predefined shapes for testing ---

let gp = new Group();
let line1, line2, line3, line4;
let rect1, rect2, rect3;
let poly1;
let circle1, circle2;

function init(bound, space) {
  let ux = space.width / 20;
  let uy = space.height / 20;

  // vertical and horizontal line
  line1 = Group.fromArray([[-ux, -space.height / 3], [ux, space.height / 3]]);
  line2 = Group.fromArray([[0, -space.height / 2], [0, space.height / 2]]);
  line3 = Group.fromArray([[-space.width / 3, -uy], [space.width / 3, uy]]);
  line4 = Group.fromArray([[-space.width / 2, 0], [space.width / 2, 0]]);
  gp.push(line1, line2, line3, line4);

  // bounds
  rect1 = Group.fromArray([[-ux * 3, -uy * 3], [ux, uy]]);
  rect2 = Group.fromArray([[-ux, -ux], [ux * 4, ux * 4]]);
  gp.push(rect1, rect2);

  // shapes
  poly1 = Group.fromArray([[-ux * 2, -uy * 2], [ux, uy * 3], [ux * 4, 0], [ux * 6, uy * 5]]);
  gp.push(poly1);

  for (let i = 0, len = gp.length; i < len; i++) {
    gp[i].anchorFrom(space.center);
  }

  circle1 = Circle.fromRect(rect1);
  circle2 = Circle.fromRect(rect1, true);
  circle3 = Circle.fromRect(rect2, true);
  rect3 = Rectangle.boundingBox([rect1, rect2]);
};

function guidelines() {
  form.stroke("#c1c5ca", 1).fill(false);
  form.lines( [line1, line2, line3, line4, poly1] );
  form.rects( [rect1, rect2, rect3] );
  form.circles( [circle1, circle2, circle3] );
}



space.bindMouse().bindTouch();
space.play();
// space.playOnce(5000);