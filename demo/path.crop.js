// Source code licensed under Apache License 2.0.
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "Nested squares are cropped by a shape that follows the pointer. Click to switch the cropping shape.";

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {

  var kinds = ["circle", "ellipse", "donut", "triangle", "octagon"];
  var kind = 0;
  var moved = false;

  // interpolate every 2 corners repeatedly to get nested, turning squares
  var nest = (pts, t, depth) => {
    let squares = [pts];
    for (let d = 0; d < depth; d++) {
      let prev = squares[d];
      let s = Num.boundValue( t + d * 0.02, 0, 1 );
      let g = new Group();
      for (let i = 1, len = prev.length; i < len; i++) {
        g.push( Geom.interpolate( prev[i-1], prev[i], s ) );
      }
      g.push( Geom.interpolate( prev[prev.length-1], prev[0], s ) );
      squares.push( g );
    }
    return squares;
  };

  // the shape under the pointer, as a list of rings: two for the donut, with the inner one reversed so it becomes a hole
  var shape = (center, r) => {
    switch (kinds[kind]) {
      case "ellipse": return [ Polygon.fromCenter( center, r, 48 ).scale( [1.5, 0.7], center ) ];
      case "donut": return [ Polygon.fromCenter( center, r, 48 ), Polygon.fromCenter( center, r/2, 36 ).reverse() ];
      case "triangle": return [ Polygon.fromCenter( center, r*1.25, 3 ) ];
      case "octagon": return [ Polygon.fromCenter( center, r, 8 ) ];
      default: return [ Polygon.fromCenter( center, r, 48 ) ];
    }
  };

  // how many squares contain a point just inside a face's first edge
  var depthOf = (face, squares) => {
    let a = face[0][0];
    let b = face[0][1];
    let dx = b[0] - a[0];
    let dy = b[1] - a[1];
    let m = Math.sqrt( dx*dx + dy*dy ) || 1;
    let p = new Pt( (a[0] + b[0]) / 2 - dy / m, (a[1] + b[1]) / 2 + dx / m );
    let depth = 0;
    for (let k = 0, len = squares.length; k < len; k++) {
      if ( Polygon.hasIntersectPoint( squares[k], p ) ) depth = k + 1;
    }
    return depth;
  };

  var run = Pts.quickStart( "#pt", "#000" );
  run( (time, ftime) => {

    let size = space.size.$multiply( 0.5 ).minValue().value;
    let rect = Rectangle.corners( [space.center.$subtract( size ), space.center.$add( size )] );
    let t = (space.pointer.x / space.size.x) + (time%10000/10000);
    let squares = nest( rect, t, 8 );

    // the squares as they are
    for (let i = 0, len = squares.length; i < len; i++) {
      form.fillOnly( (i%2===0) ? "#fff" : "#123" ).polygon( squares[i] );
    }

    // and under the pointer, the faces of the squares cropped by the shape
    let mask = shape( moved ? space.pointer : space.center, size * 0.8 );
    let faces = Path.crop( [...squares, mask] );
    for (let i = 0, len = faces.length; i < len; i++) {
      let hue = (190 + 190 * depthOf( faces[i], squares ) / squares.length) % 360; // blues to reds, clear of the background
      form.fillOnly( Color.HSLtoRGB( Color.hsl( hue, 0.85, 0.55 ) ).hex ).compound( faces[i] );
    }
    form.strokeOnly( "#fff", 2 ).compound( mask );

  }, null, (type) => {
    if (type === "move" || type === "drag") moved = true;
    if (type === "up") kind = (kind + 1) % kinds.length;
  });

})();
