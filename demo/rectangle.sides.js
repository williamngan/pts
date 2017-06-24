Pts.namespace( window );

var space = new CanvasSpace("#pt").setup({retina: true});
var form = space.getForm();
var mouse = new Pt();

space.add( {

  start: (bound, space) => {

  },

  animate: (time, fps) => {

    let ln = Rectangle.fromCenter( space.center, 100, 50 );
    form.stroke("#f00").line( ln );

    let rect = Rectangle.fromCenter( mouse, 50, 50 );
    let sides = Rectangle.sides( rect );
    form.stroke("#333").line( sides[0] );
    form.stroke("#666").line( sides[1] );
    form.stroke("#999").line( sides[2] );
    form.stroke("#ccc").line( sides[3] );

    let ps = Util.mapGroups( sides, [ln], Line.intersectPath2D );

    form.fill("#ff0").points( ps, 10 );

    sides.forEach( (s) => {
      let intc = Line.intersectLineWithPath2D( s, ln );
      if (intc) form.fill("#0f0").stroke(false).point( intc, 7, "circle" );

      let intb = Line.intersectLine2D( ln, s );
      if (intb) form.fill("#f00").stroke(false).point( intb, 5, "circle" );

      // let inta = Line.intersectPath2D( ln, s );
      // form.fill("#666").stroke(false).point( inta, 2 );
      
    });
  },

  action:( type, px, py) => {
    if (type=="move") {
      mouse.to(px, py);
    }
  },
  
  resize:( bound, evt) => {
    
  }
  
});
  
space.bindMouse();
// space.play();
space.playOnce(5000);


