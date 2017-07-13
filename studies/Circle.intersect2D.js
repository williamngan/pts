Pts.namespace( window );

var space = new CanvasSpace("#pt").setup({retina: true});
var form = space.getForm();

let gp = new Group();
let line1, line2, line3, line4;
let rect1, rect2, rect3;
let poly1;
let circle1, circle2;


space.add( {

  start: (bound, space) => {
    let ux = space.width/20;
    let uy = space.height/20;

    // vertical and horizontal line
    line1 = Group.fromArray( [[-ux, -space.height/3], [ux, space.height/3]] ); 
    line2 = Group.fromArray( [[0, -space.height/2], [0, space.height/2]] ); 
    line3 = Group.fromArray( [[-space.width/3, -uy], [space.width/3, uy]] ); 
    line4 = Group.fromArray( [[-space.width/2, 0], [space.width/2, 0]] ); 
    gp.push( line1, line2, line3, line4 );

    // bounds
    rect1 = Group.fromArray( [[-ux*3, -uy*3], [ux, uy]] ); 
    rect2 = Group.fromArray( [[-ux, -ux], [ux*4, ux*4]] ); 
    gp.push( rect1, rect2 );

    // shapes
    poly1 = Group.fromArray( [[-ux*2, -uy*2], [ux, uy*3], [ux*4, 0], [ux*6, uy*5]] ); 
    gp.push( poly1 );

    for (let i=0, len=gp.length; i<len; i++) {
      gp[i].anchorFrom( space.center );
    }

    circle1 = Circle.fromRect( rect1 );
    circle2 = Circle.fromRect( rect1, true );
    circle3 = Circle.fromRect( rect2, true );
    rect3 = Rectangle.union( [rect1, rect2] );
  },

  animate: (time, fps) => {
    form.stroke("#c1c5ca", 1).fill(false).line( line1 );
    form.line( line2 );
    form.line( line3 );
    form.line( line4 );

    form.rect( rect1 );
    form.rect( rect2 );
    form.line( poly1 );

    form.circle( circle1 );
    form.circle( circle2 );
    form.circle( circle3 );
    form.rect( rect3 );
    
    // Begin Test Code --
    
    form.stroke("#000", 2);
    let ln = new Group( space.center.$add( 100 ), space.pointer );
    let cc = Circle.fromPt( space.pointer, 25 );
    form.line( ln );
    form.circle( cc );

    // within circle boundary - red
    let weight = Circle.withinBound( circle1, space.pointer ) ? 10 : 2;
    form.stroke("#f00", weight);
    form.circle( circle1 );

    // intersect ray - orange
    let pts = Circle.intersectRay2D( circle2, ln );
    form.stroke("#f90", 2).points( pts )

    // intersect line - orange
    pts = Circle.intersectLine2D( circle2, ln );
    form.points( pts, 8 );
    form.circle( circle2 );

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
  
space.bindMouse();
space.play();
// space.playOnce(5000);