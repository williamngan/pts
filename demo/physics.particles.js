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
      world = new World().setup( space.innerBound, 0.995, new Pt(0, 1000) );

      let pts = Create.distributeRandom( space.innerBound, 20 );
      
      for (let i=0, len=pts.length; i<len; i++) {
        let p = new Particle( pts[i] );
        p.mass = Math.random()*20 + 2;
        p.impulse( Num.randomRange(-300,300), Num.randomRange(-100, 100) );
        world.push( p );
      }

      world[0].impulse( new Pt(300, -50));


    },

    animate: (time, ftime) => {

      for (let i=0, len=world.length; i<len; i++) {
        form.fillOnly("#f00").point( world[i], world[i].mass, "circle" );
        Physics.constraintBound( world[i], space.innerBound, world[i].mass );
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