// Source code licensed under Apache License 2.0.
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "Path.divide splits the shapes at every crossing into separate faces, each drawn in its own color. The star alone has six faces, since its center is enclosed twice.";

Pts.namespace( window );

var space = new CanvasSpace("#pt").setup({retina: true, resize: true});
var form = space.getForm();

var ang = 0;
var colors = ["#f03", "#0c9", "#36f", "#fc0", "#c3f", "#0cf", "#f90", "#6c0", "#f36", "#09f", "#9c3", "#63f"];

// a pentagram: a self-intersecting ring whose center is filled by the nonzero rule
function star( center, radius ) {
  let p = Polygon.fromCenter( center, radius, 5 );
  return new Group( p[0], p[2], p[4], p[1], p[3] );
}

// the shapes in stacking order: a star at the back, a slowly turning rectangle, and a disc under the pointer in front
function shapes() {
  let c = space.center;
  let unit = Math.min( space.size.x, space.size.y );
  let s = star( c.$subtract( unit/6, 0 ), unit/3 );
  let rc = c.$add( unit/6, unit/8 );
  let r = Polygon.rectangle( rc, unit/2.5, unit/4 ).rotate2D( Geom.toRadian( ang ), rc );
  let d = Polygon.fromCenter( space.pointer, unit/5, 40 );
  return [s, r, d];
}

function countPoints( rings ) {
  return rings.reduce( (n, r) => n + r.length, 0 );
}

space.add( (time, ftime) => {
  ang += 0.1;
  let sh = shapes();

  // Begin Test Code --

  let faces = Path.divide( sh );
  for (let i=0, len=faces.length; i<len; i++) {
    form.fillOnly( colors[i % colors.length] ).alpha(0.7).compound( faces[i] );
  }
  form.alpha(1).fillOnly("#123").font(14).text( [20, 30], faces.length + " faces, " + countPoints( faces.flat() ) + " points" );

  // End

  form.strokeOnly("#8ad", 1).polygons( sh );
});

space.bindMouse().bindTouch();
space.play();
