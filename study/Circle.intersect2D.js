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
    
    form.stroke("#000", 2);
    let ln = new Group( space.center.$add( 100 ), space.pointer );
    let cc = Circle.fromCenter( space.pointer, 25 );
    form.line( ln );
    form.circle( cc );

    // within circle boundary - red
    let weight = Circle.withinBound( circle1, space.pointer ) ? 10 : 2;
    form.stroke("#f03", weight);
    form.circle( circle1 );

    // intersect ray - orange
    let pts = Circle.intersectRay2D( circle2, ln );
    form.stroke("#f90", 2).points( pts )
    form.circle( circle2 );

    // intersect line - green
    pts = Circle.intersectLine2D( circle2, ln );
    form.stroke("#0c3").points( pts, 8 );
    

    // intersect circle - blue
    pts = Circle.intersectCircle2D( cc, circle3 );
    form.stroke("#09f", 2).circle( circle3 ).points( pts );

    // intersect rectangle - purple
    form.stroke("#90f", 2).rect( rect1 );
    pts = Circle.intersectRect2D( cc, rect1 );
    form.points( pts );


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