// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "...";

(function() {

  Pts.namespace( this );

  var space = new CanvasSpace("#pt").setup({bgcolor: "#96bfed", resize: true, retina: true});
  var form = space.getForm();


  var world;

  space.add( {

    start: (bound, space) => {
      world = new Physics();
      world.gravity = new Pt(0, 10);
      
      
      let ps = Create.distributeRandom( space.innerBound, 4 );
      for (let i=0, len=ps.length; i<len; i++) {
        let p = new Particle( ps[i] );
        p.mass = (i+1)*2;
        // p.impulse( new Pt( 30, 15 ) );
        world.push( p );
      }

    },

    animate: (time, ftime) => {
      world.integrateAll( ftime/1000 );
      // console.log( world[0].toString() );
      for (let i=0, len=world.length; i<len; i++) {
        form.point( world[i], world[i].mass, "circle" );
        for (let k=0; k<len; k++) {
          if (i!==k) {
            // Physics.constraintSpring( world[i], world[k], 0.5, 0.1 );
          }
        }
      }
      
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