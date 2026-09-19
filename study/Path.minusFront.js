// Source code licensed under Apache License 2.0.
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "Path.minusFront subtracts the shapes in front from the backmost one: here the turning rectangle and the disc are cut out of the star. Drag the disc inside the star to punch a hole.";

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

  let rings = Path.minusFront( sh );
  form.fillOnly("rgba(255, 0, 60, 0.6)").compound( rings );
  form.fillOnly("#123").font(14).text( [20, 30], rings.length + " rings, " + countPoints( rings ) + " points" );

  // End

  form.strokeOnly("#8ad", 1).polygons( sh );
});

space.bindMouse().bindTouch();
space.play();
