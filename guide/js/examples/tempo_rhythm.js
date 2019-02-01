(function(){
  // Pts.namespace( this ); // add Pts into scope if needed, you 
  
  let demoID = "tempo_rhythm";
  
  // Create Space and Form - you can also use Pts.quickStart(...) shorthand for less code
  let space = new CanvasSpace("#"+demoID).setup({ retina: true, bgcolor: "#e2e6ef", resize: true });
  let form = space.getForm();

  // Create tempo instance
  let tempo = new Tempo(120);
  let counter = 0;

  // Rhythm is Taaa, Taaa, ta-ta
  tempo.every( [2, 2, 1, 1] ).progress( (count, t, time, start) => {
    let tt = Num.cycle( Shaping.cubicInOut( t ) ); // shaping
    let right = Line.fromAngle( space.center, -tt * Const.half_pi - Const.half_pi, space.size.y/3 );
    let left = Line.fromAngle( space.center, Const.pi+Const.half_pi + tt*Const.half_pi, space.size.y/3 );
    form.strokeOnly( "#123", 10, "round", "round").lines( [left, right] );
    
    if (start) counter++;
    let c = (counter % 4 < 2) ? "#62E" : "#F03"
    form.fillOnly( c ).point( left.p2, 20, "circle" ).point( right.p2, 20, "circle" );
  });
  
  // track tempo animation
  space.add( tempo );
  
  // start
  // Note that `playOnce(200)` will stop after 200ms. Use `play()` to run the animation loop continuously. 
  space.playOnce(200).bindMouse().bindTouch();
  
  // For use in demo page only
  if (window.registerDemo) window.registerDemo(demoID, space);
  
})();