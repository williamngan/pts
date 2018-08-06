// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "Lines rotating in a grid. Intersections between lines are marked with circles. Move the pointer to change the rotation speed.";

Pts.quickStart( "#pt", "#123" );

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {

  var pts, lines;

  // check intersect of a line with other lines
  var intersect = (ln, k) => {
    let ps = new Group();
    for (let i=0, len=lines.length; i<len; i++) { // this loop can be optimized
      if (i!==k) { 
        let ip = Line.intersectLine2D( lines[i], ln );
        if (ip) ps.push( ip );
      }
    }
    return ps;
  };

  space.add({ 

    // create a grid of lines
    start: (bound) => {  
      pts = Create.gridPts( space.innerBound, 10, 10 );
      lines = pts.map( (p, i) => Line.fromAngle( p, i*Const.one_degree*10, Math.random()*space.size.x/5 + 20) );
    },

    animate: (time, ftime) => {

      let speed = (space.pointer.x - space.center.x) / space.center.x;
      
      // rotate each line, then check and draw intersections
      lines.forEach( (ln, i) => {
        ln[1].rotate2D(0.02 * speed, ln[0]);
        let ips = intersect( ln, i );
        
        form.stroke( (ips.length > 0) ? "#fff" : "rgba(255,255,255,.3)", 2).line( ln );
        form.strokeOnly("#f03",2).points( ips, 5, "circle" );
      });
      
    }
    
  });

  //// ----
  

  space.bindMouse().bindTouch().play();

})();