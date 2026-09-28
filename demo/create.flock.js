// Source code licensed under Apache License 2.0.
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "A flock roams freely, each agent trailing a line colored by its heading. Move the pointer to scatter the flock and light up their heads, or hold it down to stir a vortex.";

Pts.quickStart( "#pt", "#090d11" );

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {

  var flock;
  var agents = [];      // each agent's trail and glow, in the same order as the flock
  var trailLength = 90;
  var active = false;   // a mouse is over the canvas, or a finger is on it
  var held = false;     // the pointer is pressed

  // a color at an even lightness (oklch), as a hex string
  var tint = (lightness, chroma, hue) => Color.oklch( lightness, chroma, hue ).toMode( "rgb", true ).hex;

  space.add( {

    start: () => {
      let count = Num.clamp( Math.round( space.size.x * space.size.y / 2500 ), 150, 400 );
      flock = Create.flock( Create.distributeRandom( space.innerBound, count ), {
        bound: space.innerBound,
        boundary: "steer",   // turn back before reaching the edges
        margin: space.size.minValue().value / 5,
        perception: 40,
        separation: 20,
        alignWeight: 0.65,
        cohesionWeight: 0.35,
        separateWeight: 1.8,
        maxSpeed: 150,       // room to burst away from the pointer; the flock cruises at about half of it
        minSpeed: 22,
        maxForce: 300
      } );
      agents = Array.from( flock, () => ( { trail: new Group(), glow: 0 } ) );
    },

    animate: (time, ftime) => {
      flock.step( ftime );

      let dt = Math.min( ftime, flock.maxTimeStep ) / 1000;
      let reach = space.size.minValue().value * 0.3;   // how far the pointer's push or swirl reaches

      form.composite( "lighter" );   // overlapping trails add up
      flock.forEach( (b, i) => {
        let agent = agents[i];

        // Within reach, push the agent away from the pointer, or swirl it around while pressed. A Flock only
        // follows its own rules, so this is a nudge to the agent's velocity, which the next step carries on.
        // The push fades out near the edges, so the flock's own edge steering always wins there.
        let near = 0;
        if (active) {
          let p = b.$subtract( space.pointer );
          let pm = p.magnitude() || 1;
          let edge = Num.clamp( Math.min( b.x, b.y, space.size.x - b.x, space.size.y - b.y ) / flock.margin, 0, 1 );
          near = Math.max( 0, 1 - pm / reach );
          let f = near * edge * 800 * dt / pm;
          b.velocity.add( held ? Geom.perpendicular( p )[0].subtract( p.$multiply( 0.4 ) ).multiply( f ) : p.multiply( f ) );
        }
        agent.glow = Math.max( near, agent.glow - dt );   // glow by how close the pointer is, and fade out over a second

        // a trail colored by the agent's heading, and a faint head that turns white and glows
        agent.trail.push( b.clone() );
        if (agent.trail.length > trailLength) agent.trail.shift();

        let g = agent.glow;
        let hue = Geom.toDegree( b.heading );
        let color = tint( 0.75, 0.12, hue );
        form.alpha( 0.45 ).strokeOnly( color, 1.5 ).line( agent.trail );
        if (g > 0) {
          form.alpha( g * 0.12 ).fillOnly( color ).point( b, 2.2 + g * 4.8, "circle" );
          form.alpha( g * 0.25 ).fillOnly( color ).point( b, 2.2 + g * 1.3, "circle" );
        }
        form.alpha( 0.35 + g * 0.65 ).fillOnly( tint( 0.8 + g * 0.2, 0.12 * (1 - g), hue ) ).point( b, 2.2, "circle" );
      } );
      form.composite().alpha( 1 );

      // the pointer, and a subtle outline of how far it reaches
      if (active) {
        form.strokeOnly( "rgba(255,255,255,.4)", 1 ).circle( Circle.fromCenter( space.pointer, held ? 16 : 6 ) );
        form.strokeOnly( "rgba(255,255,255,.12)", 1 ).circle( Circle.fromCenter( space.pointer, reach ) );
      }
    },

    action: (type, px, py, evt) => {
      if (type === "down" || type === "move" || type === "drag" || type === "over") active = true;
      if (type === "down") held = true;
      if (type === "up" || type === "drop" || type === "out") {
        held = false;
        active = type !== "out" && evt.pointerType === "mouse";   // a mouse still hovers after a click, but a lifted finger stops
      }
    },

    resize: () => {
      if (flock) {
        flock.bound = space.innerBound;
        flock.margin = space.size.minValue().value / 5;
      }
    }
  } );

  //// ----


  space.bindMouse().bindTouch().play();

})();
