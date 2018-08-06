// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "A set of lines revolves around a center point. Each line's color depends on whether the pointer lies on its left or right side, and if it's collinear with the pointer.";

Pts.quickStart( "#pt", "#123" );

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {
  
  var pairs = [];

  space.add({ 

    start:( bound ) => {
      let r = space.size.minValue().value/2;

      // create 200 lines
      for (let i=0; i<200; i++) {
        let ln = new Group( Pt.make(2, r, true), Pt.make(2, -r, true) );
        ln.moveBy( space.center ).rotate2D( i*Math.PI/200, space.center );
        pairs.push(ln );
      }
    }, 

    animate: (time, ftime) => {

      for (let i=0, len=pairs.length; i<len; i++) {

        // rotate each line by 0.1 degree and check collinearity with pointer
        let ln = pairs[i];
        ln.rotate2D( Const.one_degree/10, space.center );
        let collinear = Line.collinear( ln[0], ln[1], space.pointer, 0.1);

        if (collinear) {
          form.stroke("#fff").line(ln);

        } else {
          // if not collinear, color the line based on whether the pointer is on left or right side
          let side = Line.sideOfPt2D( ln, space.pointer );
          form.stroke( (side<0) ? "rgba(255,255,0,.1)" : "rgba(0,255,255,.1)" ).line( ln );
        }
        form.fillOnly("rgba(255,255,255,0.8").points( ln, 0.5);
      }

      form.fillOnly("#f03").point( space.pointer, 3, "circle");
      
    }

  });
  
  //// ----
  

  space.bindMouse().bindTouch().play();

})();