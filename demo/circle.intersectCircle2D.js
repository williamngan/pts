window.demoDescription = "A circle and a donut meets. Indicate their points of intersections.";

(function() {

  Pts.namespace( this );
  var space = new CanvasSpace("#pt").setup({bgcolor: "#fe3", resize: true, retina: true});
  var form = space.getForm();


  //// Demo code ---

  space.add( (time, ftime) => {
    
    let c1 = Circle.fromCenter( space.pointer, space.size.y/4 );
    let c2 = Circle.fromCenter( space.pointer, space.size.y/8 );
    let ct = Circle.fromCenter( space.center, space.size.y/5 );

    let ins1 = Circle.intersectCircle2D( c1, ct );
    let ins2 = Circle.intersectCircle2D( c2, ct );

    form.fillOnly( "#42dc8e" ).circle( c1 );
    form.fill( "#fe3" ).circle( c2 );
    form.fill( "rgba(50,50,50,.25)" ).circle( ct );
    form.fill( "#fff" ).points( ins1, 5, "circle" );
    form.fill( "#f03" ).points( ins2, 5, "circle" );

  });
  
  //// ----
  

  space.bindMouse().bindTouch().play();

})();