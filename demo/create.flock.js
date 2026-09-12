// Source code licensed under Apache License 2.0.
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "A flock of agents steering by three local rules: separation, alignment, and cohesion. Move the pointer to scatter them, and watch the flock re-form.";

Pts.quickStart( "#pt", "#123" );

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {

  var flock;
  var pointer = new Pt();
  var pointerActive = false;

  // How far the pointer pushes agents away, and how hard
  var scatterRadius = 120;
  var scatterForce = 900;

  var palette = ["#ff2d5d", "#42dc8e", "#2e43eb", "#ffe359"];

  space.add( {

    start: (bound, space) => {

      // One agent per ~9000 square units, so the density stays the same on any screen
      let count = Num.clamp( Math.round( space.size.x * space.size.y / 9000 ), 80, 800 );

      flock = Create.flock( Create.distributeRandom( space.innerBound, count ), {
        bound: space.innerBound,
        boundary: "steer",   // turn back at the edges instead of teleporting across them
        margin: Math.min( space.size.x, space.size.y ) / 5,
        perception: 45,      // how far an agent sees its neighbors
        separation: 22,      // how close is too close
        cohesionWeight: 1,
        alignWeight: 1.2,
        separateWeight: 1.6,
        maxSpeed: 130,
        minSpeed: 45,        // never stall, so every agent keeps a heading to draw
        maxForce: 260
      } );
    },


    animate: (time, ftime) => {

      // Push agents away from the pointer. A Flock only knows about its own rules,
      // so an external force is just a nudge to each agent's velocity.
      if (pointerActive) {
        let r2 = scatterRadius * scatterRadius;
        let dt = Math.min( ftime, flock.maxTimeStep ) / 1000;
        flock.forEach( (b) => {
          let dx = b[0] - pointer[0];
          let dy = b[1] - pointer[1];
          let d2 = dx*dx + dy*dy;
          if (d2 > 0 && d2 < r2) {
            let falloff = (1 - Math.sqrt( d2 ) / scatterRadius) / Math.sqrt( d2 );
            b.velocity.add( dx * falloff * scatterForce * dt, dy * falloff * scatterForce * dt );
          }
        } );
      }

      flock.step( ftime );

      // Draw each agent as a small arrowhead pointing along its heading
      flock.forEach( (b, i) => {
        let a = b.heading;
        let cos = Math.cos( a );
        let sin = Math.sin( a );
        form.fillOnly( palette[i % palette.length] ).polygon( [
          new Pt( b[0] + cos * 7, b[1] + sin * 7 ),
          new Pt( b[0] - cos * 4 - sin * 3, b[1] - sin * 4 + cos * 3 ),
          new Pt( b[0] - cos * 4 + sin * 3, b[1] - sin * 4 - cos * 3 )
        ] );
      } );

      if (pointerActive) {
        form.strokeOnly( "rgba(255,255,255,0.25)", 1 ).circle( Circle.fromCenter( pointer, scatterRadius ) );
      }
    },


    action: (type, px, py) => {
      if (type === "move") {
        pointer.to( px, py );
        pointerActive = true;
      } else if (type === "up" || type === "drop") {
        pointerActive = false;
      }
    },


    resize: (bound, evt) => {
      if (flock) {
        flock.bound = space.innerBound;
        flock.margin = Math.min( space.size.x, space.size.y ) / 5;
      }
    }
  } );

  space.bindMouse().bindTouch();
  space.play();

})();
