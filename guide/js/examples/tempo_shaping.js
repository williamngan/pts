(function(){
  // Pts.namespace( this ); // add Pts into scope if needed, you 
  
  let demoID = "tempo_shaping";
  
  // Create Space and Form - you can also use Pts.quickStart(...) shorthand for less code
  let space = new CanvasSpace("#"+demoID).setup({ retina: true, bgcolor: "#e2e6ef", resize: true });
  let form = space.getForm();

  // Create tempo instance
  let tempo = new Tempo(60);
  let colors = ["#62E", "#FFF", "#123"];

  // for every 1 beat, change the center circle's count
  tempo.every(1).start( (count) => {
    form.fillOnly( colors[ count%colors.length ] ).point( space.center, 20 );
  })
  
  // for every 2 beat, rotate the line around once and change the color of the other circle
  tempo.every( 2 ).progress( (count, t) => {
    let tt = Shaping.elasticOut( t ); // shaping
    let ln = Line.fromAngle( space.center, Const.two_pi*tt - Const.half_pi, space.size.y/3 );
    let c = colors[ count%colors.length ];
    form.strokeOnly( c, 10, "round", "round").line( ln );
    form.fillOnly( c ).point( ln.p2, 20, "circle" );
  });
  
  // track tempo animation
  space.add( tempo );
  
  // start
  // Note that `playOnce(200)` will stop after 200ms. Use `play()` to run the animation loop continuously. 
  space.playOnce(200).bindMouse().bindTouch();
  
  // For use in demo page only
  if (window.registerDemo) window.registerDemo(demoID, space);
  
})();