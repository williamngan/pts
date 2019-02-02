(function(){
  // Pts.namespace( this ); // add Pts into scope if needed, you 
  
  let demoID = "tempo_control";
  
  // Create Space and Form - you can also use Pts.quickStart(...) shorthand for less code
  let space = new CanvasSpace("#"+demoID).setup({ retina: true, bgcolor: "#e2e6ef", resize: true });
  let form = space.getForm();

  // Create tempo instance
  let tempo = new Tempo(120);
  
  // A higher-order function to generate progress callback functions with color options
  let lns = [];
  let dials = ( i, c, s ) => {
    return ( count, t ) => {
      let tt = Shaping.quadraticInOut( t ); // shaping
      lns[i] = Line.fromAngle( (i===0) ? space.center : lns[i-1].p2, Const.two_pi * tt, space.size.y/s );
      form.strokeOnly( c, 10, "round", "round").line( lns[i] );
      form.fillOnly( c ).point( lns[i].p2, 20, "circle" );
    }
  };


  tempo.every( 6 ).progress( dials( 0, "#FFF", 4 ) )
  tempo.every( 4 ).progress( dials( 1, "#123", 6 ) )
  tempo.every( 2 ).progress( dials( 2, "#62E", 8 ) );
  
  // track tempo animation
  space.add( tempo );
  space.add( (time, ftime) => {
    let b = Num.clamp( (space.pointer.x - space.center.x)/5, -50, 50 );
    tempo.bpm = 100 + Math.floor(b);
    form.fillOnly("#123").text( [20, 32], `BPM is ${tempo.bpm}`);
  });


  
  // start
  // Note that `playOnce(200)` will stop after 200ms. Use `play()` to run the animation loop continuously. 
  space.playOnce(200).bindMouse().bindTouch();
  
  // For use in demo page only
  if (window.registerDemo) window.registerDemo(demoID, space);
  
})();