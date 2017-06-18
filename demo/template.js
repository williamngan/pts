Pts.scope( Pts, window );

var space = new CanvasSpace("#pt").setup({retina: true});
var form = space.getForm();

space.add( (time, fps) => {

});

space.add( {
  animate: (time, fps) => {

  },
  onMouseAction:( type, px, py) => {

  }
});
  
space.bindMouse();
space.play();