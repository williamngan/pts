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

    let tri = new Group( line3.p1, line1.p2, space.pointer );
    let tri2 = Triangle.fromRect( rect1 );
    

    form.stroke("#000", 2);
    form.polygon( tri );
    form.polygon( tri2 );
    
    
    form.stroke("#f03", 2);
    let alt = Triangle.altitude( tri, 2 );
    form.line( alt ); 

    alt = Triangle.altitude( tri, 1 );
    form.line( alt ); 

    alt = Triangle.altitude( tri, 0 );
    form.line( alt ); 


    let ortho = Triangle.orthocenter( tri );
    form.point( ortho, 10, "circle" );

    form.stroke("#09f", 2);
    let ln1 = Polygon.bisector( tri, 0 ).multiply(100).add(tri[0]);
    let ln2 = Polygon.bisector( tri, 1 ).multiply(100).add( tri[1] );
    let ln3 = Polygon.bisector( tri, 2 ).multiply(100).add( tri[2] );
    form.lines( [[tri[0], ln1], [tri[1], ln2], [tri[2], ln3]] );
    let incenter = Triangle.incenter( tri );
    form.point( incenter, 5, "circle" ); 

    let incircle = Triangle.incircle( tri );
    form.circle( incircle );

    form.stroke("#0c3", 2);
    let circumcenter = Triangle.circumcenter( tri );
    form.point( circumcenter, 5, "circle" );
    
    let circumcircle = Triangle.circumcircle( tri, circumcenter );
    form.circle( circumcircle );

    let tri3 = Triangle.fromCircle( incircle );
    form.polygon( tri3 );

    form.stroke("#f90");
    form.point( Polygon.centroid( tri ), 5 );

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
// space.playOnce(500);