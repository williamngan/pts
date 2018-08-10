(function(){
  // Pts.namespace( this ); // add Pts into scope if needed
  
  var demoID = "space_form";
  
  // create Space and Form
  var space = new CanvasSpace("#"+demoID).setup({ retina: true, bgcolor: "#e2e6ef", resize: true });
  var form = space.getForm();
  
  // animation
  space.add( (time, ftime) => {
    
    let cycle = (off) => space.center.y * ( Num.cycle( (time+off)%2000/2000 ) - 0.5 );

    let circle = Circle.fromCenter( space.center.$add( 0, cycle(0) ), 30 );
    let rect = Rectangle.fromCenter( space.center.$add( cycle(1000), 0 ), 50 );
    let triangle = Triangle.fromCenter( space.center.$add( cycle(0)/2, cycle(500) ), 30 );
    let curve = new Group( space.pointer, circle.p1, rect.p1, triangle.p1, space.pointer );

    form.stroke("#fff", 3)
    form.fill("#ff6").circle( circle );
    form.fill("#09f").rect( rect );
    form.fill("#f03").polygon( triangle );
    form.strokeOnly("#123", 5).polygon( Curve.cardinal( curve ) );
    form.fillOnly("#124").point( space.pointer, 10, "circle" );
  });
  
  // start
  // Note that `playOnce(200)` will stop after 200ms. Use `play()` to run the animation loop continuously. 
  space.playOnce(200).bindMouse().bindTouch();
  
  // For use in demo page only
  if (window.registerDemo) window.registerDemo(demoID, space);
  
})();
