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

    let rectB = Rectangle.fromCenter( [250, 100], 100, 100 );
    form.stroke("#0f0").lines( Rectangle.polygon( rectB ) );

    let rect = Rectangle.fromCenter( mouse, 50, 50 );
    let sides = Rectangle.sides( rect );
    form.stroke("#333").line( sides[0] );
    form.stroke("#666").line( sides[1] );
    form.stroke("#999").line( sides[2] );
    form.stroke("#ccc").line( sides[3] );

    let quads = Rectangle.quadrants( rect ).map( (qs) => Rectangle.polygon( qs ) );
    quads.forEach( (q) => {
      form.stroke("rgba(0,0,255,.3)").line( q );
    });


    let intersects = Rectangle.intersect2D( rectB, sides );
    form.fill("#0ff").points( Util.flatten( intersects ) )

    // let ps = sides.op( Line.intersectPath2D )( [ln] );

    // let fn = (g1, g2) => [g1[0], g2[0]];
    // console.log("!!", sides[0].op( fn )( [new Pt(2,3)] ));


    // form.fill("#ff0").points( ps, 10 );

    

    sides.forEach( (s) => {

      // convert each side to a list of intersection operations
      let ops = s.ops( [Line.intersectLineWithPath2D, Line.intersectLine2D, Line.intersectPath2D] );

      // operate side each with "ln" and draw the results
      let results = ops.map( (_op) => _op(ln) ).map( (r, i) => {
        if (r) form.fill(["#0f0", "#f00", "#999"][i]).point( r, [7,5,2][i], "circle" )
      });

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


