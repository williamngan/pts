// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "Draw shapes based on the size of space. Resize the window and the drawing will update.";

Pts.quickStart( "#pt", "#96bfed" );

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {

  var currBound = new Bound();

  space.add({ 
    animate: (time, ftime) => {
      // create a circles in each quarter
      let quads = Rectangle.quadrants( [new Pt(), currBound.size] );
      let circles = quads.map( (q) => Rectangle.toCircle( q ) );
      
      form.fillOnly("#09f").circles( circles );
      form.strokeOnly( "#fff", 2).lines( quads );
      form.fill("#f03").point( space.center, 10, "circle" );
      form.log( "Size: "+currBound.size.toString() );
    },

    resize: (bound, evt) => { currBound = bound; }
    
  });

  //// ----
  

  space.bindMouse().bindTouch().play();

})();