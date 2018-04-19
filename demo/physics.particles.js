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
      world = new World().setup( space.innerBound, 0.99, new Pt(0, 500) );

      let pts = Create.distributeRandom( space.innerBound, 100 );
      
      for (let i=0, len=pts.length; i<len; i++) {
        let p = new Particle( pts[i] );
        p.mass = 15 + Math.random()*10;
        p.radius = p.mass;
        p.impulse( Num.randomRange(-400,400), Num.randomRange(-100, 100) );
        world.addParticle( p );
      }

      world[0].impulse( new Pt(300, -50));


    },

    animate: (time, ftime) => {

      preserve = !preserve; 

      for (let i=0, len=world.length; i<len; i++) {
        form.fillOnly("#f00").point( world[i], world[i].radius, "circle" );

        for (let k=0, klen=world.length; k<len; k++) {
          if (i!==k) {
            Physics.collideParticle( world[i], world[k], 0.99, preserve );
          }
        }

        Physics.constraintBound( world[i], space.innerBound, 0.99, preserve );
      }

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