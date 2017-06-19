Pts.scope( Pts, window );

var space = new CanvasSpace("#pt").setup({retina: true});
var form = space.getForm();

space.add( (time, fps) => {

});

space.add( {

  animate: (time, fps) => {

  },

  action:( type, px, py) => {

  },
  
  resize:( bound, evt) => {
    
  }
  
});
  
space.bindMouse();
space.play();