Pts.namespace( window );

var space = new CanvasSpace("#pt").setup({retina: true});
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
  
space.bindMouse();
space.play();
// space.playOnce(5000);