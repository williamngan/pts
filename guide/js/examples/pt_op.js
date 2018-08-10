(function(){
  // Pts.namespace( this ); // add Pts into scope if needed
  
  var demoID = "pt_op";
  
  // create Space and Form
  var space = new CanvasSpace("#"+demoID).setup({ retina: true, bgcolor: "#e2e6ef", resize: true });
  var form = space.getForm();
  var pts = new Group();
  
  
  // animation
  space.add( {
    start: (bound) => {
      // get 100 random points
      pts = Create.distributeRandom( space.innerBound, 100 ); 
    },

    animate: (time, ftime) => {
      
      // interpolate op using space.pointer
      let op = space.pointer.op( Geom.interpolate );

      // cycle
      let t = Num.cycle( (time % 2000)/2000 );
      
      // draw
      pts.forEach( (p) => {
        form.strokeOnly("#fff", 2 ).line( [p, space.pointer] );
        form.fillOnly("#f03").point( op( p, t*t*t*t ), t*4+1 );
        form.fill("#123").point( op( p, t*t ), t*2+1 ); 
      });  
    }
  });
  
  // start
  // Note that `playOnce(200)` will stop after 200ms. Use `play()` to run the animation loop continuously. 
  space.playOnce(200).bindMouse().bindTouch();
  
  // For use in demo page only
  if (window.registerDemo) window.registerDemo(demoID, space);
  
})();