// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "...";

(function() {

  Pts.namespace( this );

  var space = new CanvasSpace("#pt").setup({bgcolor: "#96bfed", resize: true, retina: true});
  var form = space.getForm();


  var world;
  var preserve = false;

  space.add( {

    start: (bound, space) => {
      world = new World( space.innerBound, 1, new Pt(0, 400) );

      let pts = Create.distributeRandom( space.innerBound, 2 );
      
      
      for (let i=0, len=pts.length; i<len; i++) {
        let p = new Particle( pts[i] );
        p.mass = 10 + Math.random()*10;
        p.radius = p.mass;
        p.hit( Num.randomRange(-50,50), Num.randomRange(-80, 80) );
        world.add( p );
      }

    },

    animate: (time, ftime) => {

      // console.log( "---", space.size.toString(), world.particle(0).radius );

      // preserve = !preserve; 

      // for (let i=0, len=world.particleCount; i<len; i++) {
      //   form.fillOnly("#f00").point( world.particle(i), world.particle(i).radius, "circle" );

      //   for (let k=i+1, klen=world.particleCount; k<len; k++) {
      //     if (i!==k) {
      //       World.collideParticle( world.particle(i), world.particle(k), 1, preserve );
      //     }
      //   }

      //   World.constraintBound( world.particle(i), space.innerBound, 1, preserve );
      // }

      world.drawParticles( (p, i) => form.fillOnly("#f00").point( p, p.radius, "circle" ) );

      world.update( ftime );

    },

    action:( type, px, py) => {
      
    },
    
    resize:( bound, evt) => {
      
    }
    
  });
  
  space.bindMouse().bindTouch();
  space.play();
  // space.playOnce(10000);

})();