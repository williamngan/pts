// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "Create a subdivided grid colored with HSL color space. The pointer position updates the hue.";

Pts.quickStart( "#pt", "#fe3" );

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {
  
  // to interpolate color
  var t = 0;
  
  // hsl max value range (360,1,1,1)
  let cu = Color.hsl( Color.maxValues("hsl") );
  
  // recursively subdivide a rectangle
  function subdivide( color, rect, depth, index, center ) {
    if (depth > 5) return;
    let qs = Rectangle.quadrants( rect, center );
    qs.map( (r) => r[1].ceil() ); // fix the floating-point stroke problem
    
    form.fill( color( rect.interpolate( t ) ) ).rects( qs );
    
    if (index < 0) {
      for (let i=0, len=qs.length; i<len; i++) {
        subdivide(color, qs[i], depth+1, i );
      }
    } else {
      let i = Num.boundValue( index+2, 0, 4 );
      subdivide(color, qs[i], depth+1, index );
    }
  }
  
  
  space.add( (time, ftime) => {
    
    t = Num.cycle( time%3000/3000 );
    
    // get HSL color string, given a point position
    let color = (p) => {
      let p1 = p.$divide(space.size);
      let p2 = space.pointer.$divide(space.size);
      let c = cu.$multiply( Pt.make( 4, 1 ).to( p2.x, p2.y/2 + p1.x/2, p1.y ) );
      return Color.HSLtoRGB( c ).toString("rgb");
    }
    
    form.stroke(false);
    subdivide( color, space.innerBound, 0, -1, space.pointer );
    
  });
  
  //// ----
  
  
  space.bindMouse().bindTouch().play();
  
})();