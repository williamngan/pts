// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "Demo in Group guide.";

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {
  
  Pts.quickStart( "#pt", "#e2e6ef" );
  
  space.add({

    start: (bound) => {
      let c = space.center;
      group = new Group( c.$subtract( 20, 0 ), c.clone(), c.$add( 20, 0 ) );
    },

    animate: (time, ftime)  => {
      let lastPt = group[group.length-1];

      // record last 50 pointer positions
      if ( !lastPt.equals( space.pointer ) ) {
        group.push( space.pointer.clone() );
        if (group.length > 50 ) group.shift();
      }
      
      // drawing
      if (group.length >= 3 ) {
        
        // get segments from the group to generate circle position and size
        let cs = group.segments(2, 5).map( 
          (g) => Circle.fromCenter( g[0], Math.min( 50, g[1].$subtract(g[0]).magnitude()) ) 
        );  
        form.strokeOnly("#123", 10, "round");
        form.line( group );
        form.fill("#fff").circles( cs );
        form.fillOnly("#f05").point( lastPt, 10, "circle" );
      }
    }
  });

  //// ----  

  space.bindMouse().bindTouch().play();

})();