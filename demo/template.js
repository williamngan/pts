// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

// Quick Start mode

var run = Pts.quickStart( "#pt", "#fe3" ); 

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {
  run( (time, ftime) => {

  });
});


// -------

// Advanced mode


//// Demo code starts (anonymous function wrapper is optional) ---

(function() {

  Pts.namespace( window );
  var space = new CanvasSpace("#pt").setup({retina: true, resize: true});
  var form = space.getForm();

  space.add( {

    start: (bound, space) => {

    },

    animate: (time, ftime) => {

    },

    action:( type, px, py) => {
      
    },
    
    resize:( bound, evt) => {
      
    }
  });
    
  //// ----
  space.bindMouse().bindTouch().play();

})();

