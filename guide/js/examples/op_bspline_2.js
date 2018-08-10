(function(){
  // Pts.namespace( this ); // add Pts into scope if needed
  
  var demoID = "op_bspline_2";
  
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
    
    let ten = pts.slice(0, 10);
    let curve = Polygon.convexHull( ten );
    curve.insert( curve.slice(0, 3), curve.length );
    

    form.fillOnly("#123").points( pts, 2, "circle" );
    form.strokeOnly("#fff",3).line( curve );
    form.stroke("#123").polygon( Curve.bspline( curve ) );
    
    let pp = ten.map( (p) => [space.pointer, p] );
    form.strokeOnly("#f05", 2).lines( pp );

  });
  
  // start
  // Note that `playOnce(200)` will stop after 200ms. Use `play()` to run the animation loop continuously. 
  space.playOnce(200).bindMouse().bindTouch();
  
  // For use in demo page only
  if (window.registerDemo) window.registerDemo(demoID, space);
  
})();