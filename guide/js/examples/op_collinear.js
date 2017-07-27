(function(){
  // Pts.namespace( this ); // add Pts into scope if needed
  
  var demoID = "op_collinear";
  
  // create Space and Form
  var space = new CanvasSpace("#"+demoID).setup({ retina: true, bgcolor: "#e2e6ef" });
  var form = space.getForm();
  var pts = undefined;

  function nearer( p1, result ) {
    return function( p2 ) {
      let d = p2.$subtract( p1 ).magnitudeSq();
      result = (result.mag > d) ? {mag: d, pt: p2 } : result;
      return result;
    }

  }
  
  // animation
  space.add( (time, ftime) => {
   
    if (!pts) pts = Create.distributeRandom( space.innerBound, 100 );

    let fn = nearer( space.pointer, {mag:Number.MAX_VALUE, pt: new Pt() } );
    let nearest = pts.reduce( (a, b) => fn(b) );

    
    // space.pointer stores the last mouse or touch position
    let a = space.center.clone();
    let b = space.pointer.clone();
    let opA = a.op( Line.collinear );
    let opB = b.op( opA );

    let cols = pts.filter( (p) => {
      // console.log( "--->", p.toString() );
      let b = opB( p );
      // let b = Line.collinear( space.center, space.pointer, p );
      return opB( p )
      // return b;
    });
    cols = cols.map( (p) => new Group( space.center, space.pointer, p ) );
    
    // console.log( cols.length );
    // drawing
    // form.strokeOnly("#123", 5).line( [new Pt( m.x, 0), m, new Pt( 0, m.y)] );
    form.strokeOnly("#f03").lines( cols );
    form.fillOnly("#000").points( pts, 3 );
    form.fillOnly("#f03").points( [space.pointer, space.center], 3 );
    form.fillOnly("#09f").point( nearest.pt, 10 );

    // form.stroke("#fff", 5).fill("#f03").point( m, 10, "circle")
    // form.fill("#123").font(14, "bold").text( m.$add(20, 5), m.toString() );
    
  });
  
  // start
  space.playOnce(200).bindMouse().bindTouch();
  
  // For use in demo page only
  if (window.registerDemo) window.registerDemo(demoID, space);
  
})();