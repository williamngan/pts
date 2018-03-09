// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)


Pts.namespace( window );

var space = new CanvasSpace("#pt").setup({retina: true, offscreen: true, resize: true});
var form = space.getForm();

var pts = new Group();
var pts2 = new Group();

var _useOff = true;



space.add( {

  start: (bound, space) => {
    init( bound, space );
    for (let i = 0; i < 10000; i++) {
      pts.push(new Pt( Math.random()*space.width, Math.random()*space.height ) );
    }
    pts2 = pts.clone();

    // Create offscreen --
    form.useOffscreen( true, true );
    form.stroke(false).fill("rgba(0,0,0,.5)");
    form.points( pts2, 2, "circle" );
    form.useOffscreen( false );
  },

  animate: (time, ftime) => {
    guidelines();
    
    // Begin Test Code --
    
    // Click to toggle offscreen or not
    if (_useOff) {
      form.renderOffscreen(); // just render offscreen
    } else {
      form.stroke(false).fill("rgba(0,0,0,.5)"); // re-render pts2
      form.points( pts2, 2, "circle" );
    }

    // render from normal ctx canvas
    form.stroke(false).fill("rgba(255,0,0,.5)");

    for (let i=pts.length/2, len=pts.length; i<len; i++) {
      pts[i].add( Math.random()-Math.random(), Math.random()-Math.random() );
      form.point( pts[i], 2, "circle" );
    }

    form.fill("#f00").log( "Using offscreen: "+_useOff+" -- FPS:" + Math.floor(1000/ftime) );

    

    // End
  },

  action:( type, px, py) => {
    if (type=="up") {
      _useOff = !_useOff
    }

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