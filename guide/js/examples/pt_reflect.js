(function(){
  // Pts.namespace( this ); // add Pts into scope if needed
  
  var demoID = "pt_reflect";
  
  // create Space and Form
  var space = new CanvasSpace("#"+demoID).setup({ retina: true, bgcolor: "#e2e6ef", resize: true });
  var form = space.getForm();
  
  // animation
  space.add( (time, ftime) => {
    
    let c = space.center;
    let m = space.pointer;
    let reflectLine = [ m, c ];
    
    // a group of points
    let g1 = new Group( c.$add(0, -50), c.$add(50, -50), c.$add(50, 0), c.$add(50, 50), c.$add(0, 50) );
    
    // scale each one using Pt's scale functions
    let s = 0.75 + m.$subtract(c).magnitude() / space.width;
    let g2 = g1.map( (p) => p.scale(s)  );
    
    // Alternatively, just use the Geom.reflect2D to reflect a group of Pt
    let g3 = g2.clone();
    Geom.reflect2D( g3, reflectLine );
    
    form.strokeOnly("#fff", 20, "miter").line(g1).stroke("#123").line(g3);
    form.stroke("#42e", 10).line( reflectLine );
    
  });
  
  // start
  // Note that `playOnce(200)` will stop after 200ms. Use `play()` to run the animation loop continuously. 
  space.playOnce(200).bindMouse().bindTouch();
  
  // For use in demo page only
  if (window.registerDemo) window.registerDemo(demoID, space);
  
})();
