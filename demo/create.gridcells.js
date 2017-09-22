window.demoDescription = "A retro-style dazzling effect created by a grid whose cells change color and size based on their distances to the pointer.";

(function() {

  Pts.namespace( this );
  var space = new CanvasSpace("#pt").setup({bgcolor: "#123", resize: true, retina: true});
  var form = space.getForm();


  //// Demo code ---

  var pts = [];
  var follower = new Pt(); // follows the pointer

  space.add({ 
    start: (bound) => {
      pts = Create.gridCells( space.innerBound, 40, 20 );
      follower = space.center;
    },

    animate: (time, ftime) => {
      follower = follower.add( space.pointer.$subtract( follower ).divide(20) );

      form.stroke("#123");

      // calculate the size and color of each cell based on its distance to the pointer
      let rects = pts.map( (p) => {
        let mag = follower.$subtract( Rectangle.center( p ) ).magnitude()
        let scale = Math.min( 1, Math.abs( 1 - ( 0.7 * mag / space.center.y ) ) );
        let r = Rectangle.fromCenter( Rectangle.center(p), Rectangle.size(p).multiply( scale ) );
        form.fill( Color.HSLtoRGB( Color.hsl( scale*270, 1, 0.5 ) ).hex ).rect( r );
      })
  
      form.fillOnly("#fff").point( space.pointer, 10, "circle" );
    }

  });
  
  //// ----
  

  space.bindMouse().bindTouch().play();

})();