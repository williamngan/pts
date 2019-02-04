(function(){
  // Pts.namespace( this ); // add Pts into scope if needed, you 
  
  let demoID = "tempo_stagger";
  
  // Create Space and Form - you can also use Pts.quickStart(...) shorthand for less code
  let space = new CanvasSpace("#"+demoID).setup({ retina: true, bgcolor: "#e2e6ef", resize: true });
  let form = space.getForm();

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
      form.strokeOnly( c, 10, "round", "round").line( ln );
      form.fillOnly( c ).point( ln.p2, 20, "circle" );
    }
  };

  // chain 3 callbacks together with offset
  everyTwo.progress( dials("#0C9"), -100 ).progress( dials("#F03"), 0 ).progress( dials("#62E"), 100 );
  
  // track tempo animation
  space.add( tempo );
  
  // start
  // Note that `playOnce(200)` will stop after 200ms. Use `play()` to run the animation loop continuously. 
  space.playOnce(200).bindMouse().bindTouch();
  
  // For use in demo page only
  if (window.registerDemo) window.registerDemo(demoID, space);
  
})();