(function(){
  // Pts.namespace( this ); // add Pts into scope if needed
  
  var demoID = "group_segments";
  
  // create Space and Form
  var space = new CanvasSpace("#"+demoID).setup({ retina: true, bgcolor: "#e2e6ef", resize: true });
  var form = space.getForm();
  
  var group = new Group();
  
  // animation
  space.add({
    start: (bound) => {
      let c = space.center;
      group = new Group( c.$subtract( 20, 0 ), c.clone(), c.$add( 20, 0 ) );
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
          (g) => Circle.fromCenter( g[0], Math.min( 50, g[1].$subtract(g[0]).magnitude()) ) 
        );
        
        form.strokeOnly("#123", 10, "round");
        form.line( group );
        form.fill("#fff").circles( cs );
        form.fillOnly("#f05").point( lastPt, 10, "circle" );
        
      }
    }
  });
  
  // start
  // Note that `playOnce(200)` will stop after 200ms. Use `play()` to run the animation loop continuously. 
  space.playOnce(200).bindMouse().bindTouch();
  
  // For use in demo page only
  if (window.registerDemo) window.registerDemo(demoID, space);
  
})();