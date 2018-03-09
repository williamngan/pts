// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

Pts.namespace( window );

var space = new CanvasSpace("#pt").setup({retina: true, resize: true});
var form = space.getForm();
var mouse = new Pt();

space.add( {

  start: (bound, space) => {

  },

  animate: (time, fps) => {

  },

  action:( type, px, py) => {
    if (type=="move") {
      mouse.to(px, py);
    }
  },
  
  resize:( bound, evt) => {
    
  }
  
});
  
space.bindMouse().bindTouch();
space.play();
// space.playOnce(5000);