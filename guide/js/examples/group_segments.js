(function(){
  var demoID = "group_segments";
  
  // create Space and Form
  var space = new CanvasSpace("#"+demoID).setup({ retina: true, bgcolor: "#e2e6ef" });
  var form = space.getForm();
  
  var group = new Group();
  
  // animation
  space.add({
    start: (bound) => {
      group = new Group( new Pt(space.center.$subtract( 100, 0 )), new Pt(space.center), new Pt(space.center.$add( 100, 0 )) );
    },
    
    animate: (time, ftime) => {
      
      // record last 10 pointer positions
      group.push( space.pointer.clone() );
      if (group.length > 10 ) group.shift();
      
      // drawing
      if (group.length >= 3 ) {

        // get segments from the group to generate circle position and size
        let cs = group.segments().map( (g) => Circle.fromPt( g[1], g[1].$subtract(g[0]).magnitude()*2 + 20 ) );

        form.stroke("rgba(255,255,255,.3)", 5).fill(false).circles( cs );
        form.stroke("#1E252C", 10).line( group );
        form.fill("#f03").stroke(false).point( group[group.length-1], 5, "circle" );

      }
    }
  });
  
  // start
  space.playOnce(200).bindMouse().bindTouch();
  
  // For use in demo page only
  if (window.registerDemo) window.registerDemo(demoID, space);
  
})();