// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)


Pts.namespace( window );

var space = new CanvasSpace("#pt").setup({retina: true, resize: true});
var form = space.getForm();

space.add( {

  start: (bound, space) => {

  },

  animate: (time, fps) => {

  },

  action:( type, px, py) => {
    
  },
  
  resize:( bound, evt) => {
    
  }
});
  
space.bindMouse().bindTouch().play();


// -------

// Optional: Pts quick start mode
var run = Pts.quickStart( "#pt", "#fe3" ); 

run( (time, ftime) => {

});