// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "This sketch is rendered as SVG. Using your browser's inspector, you can take a look at the svg element and copy it into a svg file too.";

// Create SVG space and form
Pts.namespace( this );
var space = new SVGSpace("#pt").setup({bgcolor: "#90f", resize: true });
var form = space.getForm();


//// Demo code starts (anonymous function wrapper is optional) ---

(function() {
  
  let pts = new Group();

  space.add( {
    start: function (bound) {
      pts = Create.gridCells( space.innerBound, 4, 1 );
    },

    // For SVG, don't use arrow function so that `this` here will refer to this player
    animate: function (time, ftime) {
        
      // SVG scope starts
      form.scope( this );

      // "L" is for the way you look at me
      let l = Rectangle.corners( Rectangle.toSquare( pts[0] ) );
      l.remove(1, 1);
      form.fillOnly("#f03").polygon( l );

      // "O" is for the only one I see
      let o = Rectangle.toCircle( pts[1] );
      let ang1 = (time%6000 / 6000) * Const.two_pi;
      let ang2 = Geom.boundRadian( space.pointer.subtract( o[0] ).angle() );
      form.fillOnly("#0c9").arc( o[0].subtract(20, 0), o[1][0], Math.min(ang1, ang2), Math.max(ang1, ang2) );
        
      // "V" is very, very extraordinary
      let v = Rectangle.corners( Rectangle.toSquare( pts[2] ) );
      v.subtract(20, 0);
      form.strokeOnly("#fff", 2).line( new Group( v[0], Geom.interpolate(v[2], v[3], 0.5), v[1] ) );

      // "E" is even more than anyone that you adore
      let e = Create.gridCells( Bound.fromGroup( Rectangle.toSquare( pts[3] ) ), 1, 10 );
      for (let i=0, len=e.length; i<len; i++) {
        if ( Math.abs(Math.floor(time % 5000 / 500) - i) % 4 === 0 ) {
          form.fillOnly("#fe3").rect( e[i] );
        }
      }    
    },

    resize: function( bound ) {
      pts = Create.gridCells( space.innerBound, 4, 1 );
    }
  });


  // Add another player for testing. Again don't use arrow function => so as to bind the scope of "this" correctly.
  space.add( function(time, ftime) {

    // SVG scope starts
    form.scope(this);
    form.fillOnly("#f0f").point( space.pointer, 10, "circle" );
  });

  
  //// ----
  space.bindMouse().bindTouch().play();
  
})();