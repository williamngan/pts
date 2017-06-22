Pts.namespace( window );

var space = new CanvasSpace("#pt").setup({retina: true});
var form = space.getForm();

let a = new Pt(100, 200);
let b = new Pt(150, 60);
let c = new Pt(90, 20);

space.add( {

  start: ( bound ) => {
    a.add( bound.center );
    b.add( bound.center );
    c.add( bound.center );
  },

  animate: (time, fps) => {
    form.stroke("#999").line([a, b]);
    form.stroke(false).fill("#f00").point( c, 5, "circle" );
    
    let p = Line.perpendicularFromPt( c, [a,b] );
    form.fill("#0f0").point( p, 3 );
    form.stroke("#f00").line( [c, p] );

    let dist = Line.distanceFromPt( c, [a,b] );
    form.log( "distance: "+dist );
  },

  action:( type, px, py) => {
    if (type=="move") {
      c.x = px;
    }
  },
  
  resize:( bound, evt) => {
    
  }
  
});
  
space.bindMouse();
space.playOnce(5000);