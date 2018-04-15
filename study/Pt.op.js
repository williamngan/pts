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

    form.stroke("#000", 5);
    form.line( poly1 );
    form.stroke("#f09", 3).line( line1 );
    form.stroke("#f3f", 3).line( [line1[0], space.pointer] );

    let proj = line1[1].$subtract( line1[0] ).$project( space.pointer.$subtract( line1[0] ) );
    form.stroke( "rgba(0,0,0,.5", 5).line( [line1[0], proj.$add(line1[0])] )

    let np = poly1[ Polygon.nearestPt( poly1, space.pointer ) ];
    let animTimer = (time % 1000)/1000;

    // op: interpolate a pt with pointer
    let getMiddle = space.pointer.op( Geom.interpolate );


    // Apply op: with resulting Pt from first pt
    let ip = getMiddle( np, animTimer )

    // draw results
    if (np) {
      form.stroke("#f03", 2).point( np, 10, "circle" );
      form.stroke("#0c3").point( ip, 5, "circle" );
      form.line( [space.pointer, np] );
    }

    // first group op: get perpendicular points with a line from pointer to np
    let g1 = new Group( space.pointer, np );
    let perpend = g1.op( getPerpend );

    // custom op function
    function getPerpend(g, anchor, tip) {
      let gp = Geom.perpendicular(g[1].$subtract(g[0])).map((gg) => gg.$add(anchor));
      gp.push(tip);
      return gp;
    }

    // Apply first group op
    let tri1 = perpend( space.pointer, ip );
    let tri2 = perpend( np, ip );

    form.polygon( tri1 );
    form.polygon( tri2 );

    // get a set of ops to find circles in a triangle
    form.stroke("#90f");
    let triCircles = tri1.ops( [Triangle.incircle, Triangle.circumcircle] );
    let circles = triCircles.map( (t) => {
      let c = t();
      form.circle( c )
      return c;
    });

    // get a set of ops to transform a line
    let g2 = new Group( circles[0].p1, circles[1].p1 );
    let trans = g2.ops( [Geom.rotate2D, Geom.shear2D, Geom.scale] );
    trans.map( (t, i) => t( [animTimer*Math.PI, animTimer, animTimer*2][i], space.pointer )  );
    form.stroke("#09f", 5).line( g2 );
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