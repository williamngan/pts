// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "An example of using quickStart function to create this in 5 lines of code";

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {

  // Pts.quickStart instantiates a CanvasSapce and CanvasForm and put the respective "space" and "form" variables into global scope and bind mouse and touch events.
  // It returns a function where you can init with callback functions ( animateFn, startFn, actionFn, resizeFn )
  // See guides for more details: https://ptsjs.org/guide/Get-started-0100.html
  var run = Pts.quickStart( "pt", "#f03" ); 

  // Pass an animate callback function to run
  run( ( time, ftime ) => { 
    let subs = space.innerBound.map( (p) => Line.subpoints( [p, space.pointer], 30 ) );
    let rects = Util.zip( subs ).map( (r,i) => Rectangle.corners( r ).rotate2D( i*Math.PI/60, space.pointer ) );
    form.strokeOnly("#FDC", 2).polygons( rects );
  });

})();

