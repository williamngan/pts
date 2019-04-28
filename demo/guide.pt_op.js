// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "Demo in Pt guide.";

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {
  
  Pts.quickStart( "#pt", "#e2e6ef" );
  let pts = new Group();

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

  //// ----  

  space.bindMouse().bindTouch().play();

})();