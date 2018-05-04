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
      world = new World( space.innerBound, 0.99, new Pt(0, 500) );
      
      // let body1 = Body.rectangle( Rectangle.fromCenter( space.center, 50 ) );
      let body1 = Body.fromGroup( Polygon.fromCenter( space.center, 70, 6, 0.4 ), 0.5 );
      let body2 = Body.fromGroup( Polygon.fromCenter( space.center.subtract(100,50), 40, 4 ), 1 );
      let body3 = Body.fromGroup( Polygon.fromCenter( space.center.subtract(50,-150), 50, 3 ) );

      // body2.mass = 1;
      // body2[3].lock = true;

      // let body2 = Body.rectangle( Rectangle.fromCenter( space.center.subtract(100,50), 100 ) );
      // let body3 = Body.rectangle( Rectangle.fromCenter( space.center.subtract(50,-150), 80 ) );
      world.add( body1 ).add( body2 ).add( body3 );

      let pk1 = new Particle( new Pt( space.center.x, 100 ) ).size( 30 );
      world.add( pk1 );
      pk1.hit( [-200, -50] );

      // for (let i=0, len=rect.length; i<len; i++) {
      //   let p = new Particle( rect[i] );
      //   p.mass = 5;
      //   world.push( p );
      // }

      body1[0].hit( new Pt(120, -40));
      body2[0].hit( new Pt(-300, -20));
      body3[0].hit( new Pt(30, -30));

    },

    animate: (time, ftime) => {

      world.drawParticles( (p, i) => form.fillOnly("#f00").point( p, p.radius, "circle" ) );
      world.drawBodies( (b, i) => {
        form.fillOnly("#0ab").polygon( b );
        let lns = b.linksToLines();
        form.strokeOnly("#fff");
        lns.forEach( (l) => form.line(l) );
        form.fillOnly("#9ff").point( b[0], 3 );
      });
      
      world.update( ftime );


      // let diagonal = Math.sqrt( 20000 );
      // Physics.constraintEdge( world[1], world[3], diagonal );
      // Physics.constraintEdge( world[0], world[2], diagonal );

      // let pk1 = world.particle(0);

      // for (let i=0, len=world.bodyCount; i<len; i++) {
      //   let b = world.body(i);  
        
      //   form.fillOnly("#0ab").polygon( b );
      //   // form.strokeOnly("#fff").line( [b[1], b[3]] );
      //   // form.strokeOnly("#fff").line( [b[0], b[2]] );


      //   let lns = b.linksToLines();
      //   form.strokeOnly("#fff");
      //   lns.forEach( (l) => form.line(l) );
        
      //   form.fillOnly("#9ff").point( b[0], 3 );

      //   for (let k=i+1, klen=world.bodyCount; k<len; k++) {
      //     b.processBody( world.body(k) );
      //   }

      //   b.processParticle( pk1 );
      //   form.fillOnly("#f00").point( pk1, pk1.radius, "circle" );
      // }

      // world.body(0).process( world.body(1) );
      // world.body(1).process( world.body(0) );
      
      

      // for (let i=0, len=world.length; i<len; i++) {
      //   form.fillOnly("#f00").point( world[i], world[i].mass, "circle" );
        
      //   // let k = (i<len-1) ? i+1 : 0;
      //   // Physics.constraintEdge( world[i], world[k], 100 );
      //   // Physics.constraintBound( world[i], space.innerBound );

      //   form.strokeOnly("#9ab").lines( b );
      // }

      // world.constrainAll();
      // world.integrateAll( ftime/1000 );

      
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