window.demoDescription = "This sketch is rendered in HTML elements. Take a look using your browser's DOM inspector.";

(function() {
  
  Pts.namespace( this );
  var space = new HTMLSpace("#pt").setup({bgcolor: "#90f", resize: true });
  var form = space.getForm();
  
  
  //// Demo code ---
  
  let pts = new Group();

  space.add( {
    start: function (bound) {
      pts = Create.gridCells( space.innerBound, 4, 1 );
    },

    // For DOM, don't use arrow function so that `this` here will refer to this player
    animate: function (time, ftime) {
        
      // DOM scope starts
      form.scope( this );

      form.fill("#f0f").cls("rect1").rect( pts[0] );
      form.cls("rect2").rect( pts[1] );
      form.cls(false).rect( pts[2] );
      form.rect( pts[3] );
    },

    resize: function( bound ) {
      pts = Create.gridCells( space.innerBound, 4, 1 );
    }
  });


  // Add another player for testing. Again don't use arrow function => so as to bind the scope of "this" correctly.
  space.add( function(time, ftime) {

    // SVG scope starts
    form.scope(this);
    form.fillOnly("#fff").point( space.pointer, 10, "circle" );
  });

  
  //// ----
  space.bindMouse().bindTouch().play(5000);
  
})();