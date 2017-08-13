window.demoDescription = "Interpolate every 2 corners of a rectangle to draw inner rectangles recursively.";

(function() {
  
  Pts.namespace( this );
  var space = new CanvasSpace("#pt").setup({bgcolor: "#fe3", resize: true, retina: true});
  var form = space.getForm();
  
  
  //// Demo code ---
  
  // Recusively draw interpolated squares up to max depth
  var interpolate = (pts, _t, depth, max) => {
    if (depth > max) return;
    let g = new Group();
    let t = Num.boundValue( _t, 0, 1 );

    for (let i=1, len=pts.length; i<len; i++) {
      g.push( Geom.interpolate( pts[i-1], pts[i], t ) );
    }
    g.push( Geom.interpolate( pts[pts.length-1], pts[0], t ) );
    
    form.fillOnly( (depth%2===0) ? "#fff" : "#123" ).polygon( g );
    interpolate( g, t+0.02, depth+1, max );
  }
  
  space.add( (time, ftime) => {
    
    let size = space.size.$multiply( 0.5).minValue().value;
    let rect = Rectangle.corners( [space.center.$subtract( size ), space.center.$add( size )] );    
    let t = (space.pointer.x / space.size.x) + (time%10000/10000);
    
    interpolate( rect, t, 0, 20 );
    
  });
  
  //// ----
  
  
  space.bindMouse().bindTouch().play();
  
})();