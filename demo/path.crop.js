// Source code licensed under Apache License 2.0.
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "Shapes scattered by Poisson-disk sampling, some merged from bubbles and some with holes, are cropped by a donut that follows the pointer. The cropped areas are filled in each shape's own color. Click to switch the cropping shape.";

Pts.quickStart( "#pt", "#123" );

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {

  var shapes = [];     // each shape is { rings, center, radius, color }: an outer ring followed by its holes, within a radius of its center
  var spacing = 100;   // minimum distance between shape centers
  var kind = 0;

  var angle = () => Num.randomRange( Const.two_pi );

  // a star with n points: every other corner of a 2n-gon, pulled in toward the center
  var star = (c, r, n, rotation) => Polygon.fromCenter( c, r, n * 2 ).rotate2D( rotation, c ).map( (p, i) => (i % 2) ? p.scale( 0.45, c ) : p );

  // functions that make a shape within a radius r of a center c, as a list of rings
  var makers = [
    (c, r) => [ Polygon.fromCenter( c, r, 3 ).rotate2D( angle(), c ) ],
    (c, r) => [ Polygon.fromCenter( c, r, 6 ).rotate2D( angle(), c ) ],
    (c, r) => [ star( c, r, Math.floor( Num.randomRange( 5, 9 ) ), angle() ) ],

    // bubbles: a few discs that reach the edge at random angles, merged with a central one
    (c, r) => {
      let discs = [ Polygon.fromCenter( c, r * 0.55, 36 ) ];
      for (let i = 0; i < 4; i++) {
        let br = r * Num.randomRange( 0.25, 0.45 );
        discs.push( Polygon.fromCenter( c.clone().toAngle( angle(), r - br, true ), br, 36 ) );
      }
      return Path.unite( discs );
    },

    // a wreath: discs on the corners of a polygon overlap into a ring, which merges into an outline with a hole in the middle
    (c, r) => Path.unite( Polygon.fromCenter( c, r * 0.62, Math.floor( Num.randomRange( 6, 9 ) ) ).map( (p) => Polygon.fromCenter( p, r * 0.38, 36 ) ) ),

    // cheese: a square with holes cut out at random points, some biting into its edges
    (c, r) => {
      let rect = Rectangle.fromCenter( c, r * 1.4 );
      let holes = Create.distributeRandom( Bound.fromGroup( rect ), 5 ).map( (p) => Polygon.fromCenter( p, r * Num.randomRange( 0.1, 0.25 ), 24 ) );
      let rotation = angle();
      return Path.minusFront( [Rectangle.corners( rect ), ...holes] ).map( (ring) => ring.rotate2D( rotation, c ) );
    }
  ];

  // the shapes that follow the pointer, as lists of rings: the donut's inner ring is reversed so it becomes a hole
  var masks = [
    (c, r) => [ Polygon.fromCenter( c, r, 48 ), Polygon.fromCenter( c, r / 2, 36 ).reverse() ],
    (c, r) => [ Polygon.fromCenter( c, r, 48 ) ],
    (c, r, rotation) => [ star( c, r * 1.2, 5, rotation ) ],
    (c, r, rotation) => [ Polygon.fromCenter( c, r, 6 ).rotate2D( rotation, c ) ]
  ];

  // scatter the centers, then size each shape at random but small enough to clear the shapes already placed.
  // Each shape gets its own color at an even lightness (oklch), with hues a golden angle apart so that shapes placed one after another differ.
  var scatter = () => {
    spacing = Math.max( 50, space.size.minValue().value / 6 );
    shapes = [];
    for (let c of Create.sampling( space.innerBound, spacing )) {
      let radius = spacing * Num.randomRange( 0.35, 0.8 );
      for (let s of shapes) radius = Math.min( radius, c.$subtract( s.center ).magnitude() - s.radius - spacing * 0.1 );
      if (radius < spacing * 0.2) continue;
      let make = makers[ Math.floor( Num.randomRange( makers.length ) ) ];
      let color = Color.oklch( 0.72, 0.16, (shapes.length * 137.5) % 360 ).toMode( "rgb", true ).hex;
      shapes.push( { rings: make( c, radius ), center: c, radius: radius, color: color } );
    }
  };

  space.add( {
    start: scatter,
    resize: scatter,

    animate: (time, ftime) => {
      let r = spacing * 1.2;
      let mask = masks[kind]( space.pointer, r, time / 4000 );

      for (let s of shapes) {
        // crop the shapes within reach of the mask (the star reaches 1.2r), and fill the faces inside it in the shape's color
        let near = s.center.$subtract( space.pointer ).magnitude() < s.radius + r * 1.2;
        let faces = near ? Path.crop( [s.rings, mask] ) : [];
        faces.forEach( (face) => form.fillOnly( s.color ).compound( face ) );
        form.strokeOnly( faces.length ? s.color : "#fff", 1 ).compound( s.rings );
      }

      form.strokeOnly( "rgba(255,255,255,.3)", 1 ).compound( mask );
    },

    action: (type) => {
      if (type === "up") kind = (kind + 1) % masks.length;
    }
  });

  //// ----


  space.bindMouse().bindTouch().play();

})();
