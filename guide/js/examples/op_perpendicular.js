(function(){
  // Pts.namespace( this ); // add Pts into scope if needed
  
  var demoID = "op_perpendicular";
  
  // create Space and Form
  var space = new CanvasSpace("#"+demoID).setup({ retina: true, bgcolor: "#e2e6ef", resize: true });
  var form = space.getForm();
  var pts = undefined;

  // animation
  space.add( (time, ftime) => {

    // would be better to init this in player's `start` function, but we are lazy here.
    if (!pts) pts = Create.distributeRandom( space.innerBound, 100 );

    let path = [new Pt(), space.pointer];    
    let perpends = pts.map( (p) => [p, Line.perpendicularFromPt( path, p )] );

    
    form.strokeOnly("#42e", 5).line( path );
    form.strokeOnly("#123", 1).lines( perpends );
    form.fillOnly("#123").points( pts, 2, "circle" );


  });
  
  // start
  // Note that `playOnce(200)` will stop after 200ms. Use `play()` to run the animation loop continuously. 
  space.playOnce(200).bindMouse().bindTouch();
  
  // For use in demo page only
  if (window.registerDemo) window.registerDemo(demoID, space);
  
})();