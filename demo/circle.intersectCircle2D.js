// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "A circle and a donut meets. Indicate their points of intersections.";

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {

  // Pts quick start mode.
  var run = Pts.quickStart( "#pt", "#fe3" ); 

  run( (time, ftime) => {
    
    let c1 = Circle.fromCenter( space.pointer, space.size.y/4 );
    let c2 = Circle.fromCenter( space.pointer, space.size.y/8 );
    let ct = Circle.fromCenter( space.center, space.size.y/4 );

    let ins1 = Circle.intersectCircle2D( c1, ct );
    let ins2 = Circle.intersectCircle2D( c2, ct );

    form.fillOnly( "#0c6" ).circle( c1 );
    form.fill( "#fe3" ).circle( c2 );
    form.fill( "rgba(70,30,240,.2)" ).circle( ct );
    form.fill( "rgba(70,30,240, .3)" ).points( ins1, 10, "circle" );
    form.fill( "#f06" ).points( ins2, 5, "circle" );

  });

})();