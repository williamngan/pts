(function(){
  // Pts.namespace( this ); // add Pts into scope if needed
  
  var demoID = "op_closest_2";
  
  // create Space and Form
  var space = new CanvasSpace("#"+demoID).setup({ retina: true, bgcolor: "#e2e6ef", resize: true });
  var form = space.getForm();
  var pts = undefined;

  // animation
  space.add( (time, ftime) => {

    // would be better to init this in player's `start` function, but we are lazy here.
    if (!pts) pts = Create.distributeRandom( space.innerBound, 100 );

    let t = space.pointer;
    pts.sort( (a,b) => a.$subtract(t).magnitudeSq() - b.$subtract(t).magnitudeSq() );
    
    form.fillOnly("#123", 1);
    pts.forEach( (p, i) => form.point( p, 20 - 20*i/pts.length, "circle" ) )

    form.fillOnly("#fff").points( pts, 2, "circle" );

    let three = pts.slice(0, 3);
    let threeLines = three.map( (p) => [p, space.pointer] );
    form.strokeOnly("#f05", 2).lines( threeLines );
    form.fillOnly("#f05").points( three, 3, "circle" );
  });
  
  // start
  // Note that `playOnce(200)` will stop after 200ms. Use `play()` to run the animation loop continuously. 
  space.playOnce(200).bindMouse().bindTouch();
  
  // For use in demo page only
  if (window.registerDemo) window.registerDemo(demoID, space);
  
})();