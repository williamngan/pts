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
      world = new World( space.innerBound, 0.99, new Pt(0, 500) );

      let pts = Create.distributeRandom( space.innerBound, 50 );
      
      
      for (let i=0, len=pts.length; i<len; i++) {
        let p = new Particle( pts[i] );
        p.mass = 5 + Math.random()*20;
        p.radius = p.mass;
        p.hit( Num.randomRange(-120,120), Num.randomRange(-80, 0) );
        world.add( p );
      }


      world.particle(0).hit( new Pt(200, -50));


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

      world.processParticles( (p) => form.fillOnly("#f00").point( p, p.radius, "circle" ) );

      world.integrateAll( ftime/1000 );

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