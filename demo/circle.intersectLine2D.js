// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "A circle moves in a field of line segments. Check intersections on both line paths and line segments, and highlight the intersection points and paths.";

Pts.quickStart( "#pt", "#123" );

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {

  var lines = [];

  // function to create random lines
  var createLines = () => {
    lines = [];
    var ps = Create.distributeRandom( space.innerBound, 50 );
    for (let i=0, len=ps.length; i<len; i++) {
      lines.push( new Group( ps[i], ps[i].clone().toAngle( Math.random()*Const.pi, Math.random()*space.size.y/2+20, true) ) );
    }
  };
  
  space.add( { 
    start: (bound) => { createLines(); },
    resize: (bound) => { createLines(); },
    
    animate: (time, ftime) => {
      
      // define a range from the pointer
      let range = Circle.fromCenter( space.pointer, 100 );
      form.stroke( "#fff" ).lines( lines );
      
      for (let i=0, len=lines.length; i<len; i++) {

        // check rays and lines intersection with pointer's range
        let inPath = Circle.intersectRay2D( range, lines[i] );
        let inLine = Circle.intersectLine2D( range, lines[i] );

        if (inPath.length > 1) {
          form.stroke("rgba(255,255,255,.15)").line( lines[i].concat(inPath[0], inPath[1]) );
          form.stroke("#fe6").line( lines[i] );
          form.fillOnly("#fff").points( inPath, 1, "circle" );
        }

        if (inLine.length > 0) {
          form.stroke("#f03").line( lines[i] );
          form.fillOnly("#f03").points( inLine, 3, "circle" );
        }
      }
    }

  });
  
  //// ----
  
  
  space.bindMouse().bindTouch().play();
  
})();