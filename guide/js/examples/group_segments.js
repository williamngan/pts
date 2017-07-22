(function(){
  var demoID = "group_segments";
  
  // create Space and Form
  var space = new CanvasSpace("#"+demoID).setup({ retina: true, bgcolor: "#e2e6ef" });
  var form = space.getForm();
  
  var group = new Group();
  
  // animation
  space.add({
    start: (bound) => {
      group = new Group( new Pt(space.center.$subtract( 20, 0 )), new Pt(space.center), new Pt(space.center.$add( 20, 0 )) );
    },
    
    animate: (time, ftime) => {
      
      let lastPt = group[group.length-1];

      // record last 50 pointer positions
      if ( !lastPt.equals( space.pointer ) ) {
        group.push( space.pointer.clone() );
        if (group.length > 50 ) group.shift();
      }
      
      
      // drawing
      if (group.length >= 3 ) {
        
        // get segments from the group to generate circle position and size
        let cs = group.segments(2, 5).map( 
          (g) => Circle.fromPt( g[0], Math.min( 50, g[1].$subtract(g[0]).magnitude()) ) 
        );
        
        form.stroke("#123", 10, "round").fill(false)
        form.line( group );
        form.fill("#fff").circles( cs );
        form.fill("#f03").stroke(false).point( lastPt, 10, "circle" );
        
      }
    }
  });
  
  // start
  space.playOnce(200).bindMouse().bindTouch();
  
  // For use in demo page only
  if (window.registerDemo) window.registerDemo(demoID, space);
  
})();