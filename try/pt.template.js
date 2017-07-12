Pts.namespace( window );

var space = new CanvasSpace("#pt").setup({retina: true});
var form = space.getForm();

let gp = new Group();
let line1, line2;
let rect1, rect2, rect3;
let poly1;
let circle1, circle2;


space.add( {

  start: (bound, space) => {
    let ux = space.width/20;
    let uy = space.height/20;

    // vertical and horizontal line
    line1 = Group.fromArray( [[-ux, -space.height/2], [ux, space.height/2]] ); 
    line2 = Group.fromArray( [[-space.width/2, -uy], [space.width/2, uy]] ); 
    gp.push( line1, line2 );

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
    form.stroke("#c1c5ca").fill(false).line( line1 );
    form.line( line2 );

    form.rect( rect1 );
    form.rect( rect2 );
    form.line( poly1 );

    form.circle( circle1 );
    form.circle( circle2 );
    form.circle( circle3 );
    form.rect( rect3 );
    
  
    
  },

  action:( type, px, py) => {

  },
  
  resize:( bound, evt) => {
    
  }
  
});
  
space.bindMouse();
// space.play();
space.playOnce(5000);