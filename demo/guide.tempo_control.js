// Source code licensed under Apache License 2.0. 
// Copyright © 2019 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "Demo in Tempo guide.";

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {
  
  Pts.quickStart( "#pt", "#e2e6ef" );

  // Create tempo instance
  let tempo = new Tempo(120);
  
  // A higher-order function to generate progress callback functions with color options
  let lns = [];
  let dials = ( i, c, s ) => {
    return ( count, t ) => {
      let tt = Shaping.quadraticInOut( t ); // shaping
      lns[i] = Line.fromAngle( (i===0) ? space.center : lns[i-1].p2, Const.two_pi * tt, space.size.y/s );
      form.strokeOnly( c, 10, "round", "round" ).line( lns[i] );
      form.fillOnly( c ).point( lns[i].p2, 20, "circle" );
    }
  };

  tempo.every( 6 ).progress( dials( 0, "#FFF", 4 ) )
  tempo.every( 4 ).progress( dials( 1, "#123", 6 ) )
  tempo.every( 2 ).progress( dials( 2, "#62E", 8 ) );
  
  // Add tempo instance as a player to track animation
  space.add( tempo );
  
  // Add another player
  space.add( (time, ftime) => {
    let b = Num.clamp( (space.pointer.x - space.center.x)/5, -50, 50 );
    tempo.bpm = 100 + Math.floor(b);
    form.fillOnly("#123").text( [20, 32], `BPM is ${tempo.bpm}`);
  });

  //// ----  

  space.bindMouse().bindTouch().play();

})();