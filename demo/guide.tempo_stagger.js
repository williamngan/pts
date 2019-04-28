// Source code licensed under Apache License 2.0. 
// Copyright © 2019 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "Stagger demo in Tempo guide.";

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {
  
  Pts.quickStart( "#pt", "#e2e6ef" );

  // Create tempo instance
  let tempo = new Tempo(60);
  let everyTwo = tempo.every( 2 );

  // A higher-order function to generate progress callback functions with color options
  let dials = ( c ) => {
    return ( count, t ) => {
      let tt = Shaping.elasticInOut( t ); // shaping
      let dir = (count%2 === 0) ? 1 : -1;
      let s = (count%2 !== 0) ? Const.pi : 0;
      let ln = Line.fromAngle( space.center, s + Const.pi * tt * dir, space.size.y/3 );
      form.strokeOnly( c, 10, "round", "round" ).line( ln );
      form.fillOnly( c ).point( ln.p2, 20, "circle" );
    }
  };

  // chain 3 callbacks together with offset
  everyTwo.progress( dials("#0C9"), -100 ).progress( dials("#F03"), 0 ).progress( dials("#62E"), 100 );
  
  // Add tempo instance as a player to track animation
  space.add( tempo );

  //// ----  

  space.bindMouse().bindTouch().play();

})();