// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "Particles colliding with each other in space. Move the pointer to hit them like billiard balls.";

Pts.quickStart( "#pt", "#123" );

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {

  var world;

  space.add( {

    start: (bound, space) => {

      // Create world and 100 random points
      world = new World( space.innerBound, 1, 0 );
      let pts = Create.distributeRandom( space.innerBound, 100 );
      
      // Create particles and hit them with a random impulse
      for (let i=0, len=pts.length; i<len; i++) {
        let p = new Particle( pts[i] ).size( (i===0) ? 30 : 3+Math.random()*space.size.x/50 );
        p.hit( Num.randomRange(-50,50), Num.randomRange(-25, 25) );
        world.add( p );
      }

      world.particle( 0 ).lock = true; // lock it to move it by pointer later on

    },


    animate: (time, ftime) => {
      world.drawParticles( (p, i) => {
        let color = (i===0) ? "#fff" : ["#ff2d5d", "#42dc8e", "#2e43eb", "#ffe359"][i%4];
        form.fillOnly( color ).point( p, p.radius, "circle" ) 
      });

      world.update( ftime );
    },


    action:( type, px, py) => {
      if (type == "move") {
        world.particle( 0 ).position = new Pt(px, py);
      }
    
    }
  });
  
  space.bindMouse().bindTouch();
  space.play();

})();