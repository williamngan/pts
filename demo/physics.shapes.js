// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "Physics simulation with various polygons and circles. Move pointer to control the triangle.";

Pts.quickStart( "#pt", "#30a" );

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {

  var world;

  space.add( {

    start: (bound, space) => {
      world = new World( space.innerBound, 0.99, new Pt(0, 500) );

      let unit = (space.size.x+space.size.y) / 150;
      
      // Create bodies and particles
      let hexagon = Body.fromGroup( Polygon.fromCenter( space.center.add(100, -100), unit*10, 6 ), 0.5 );
      let square = Body.fromGroup( Polygon.fromCenter( space.center.subtract(100,50), unit*8, 4 ), 1 );
      let triangle = Body.fromGroup( Polygon.fromCenter( space.center, unit*6, 3 ) );
      let p1 = new Particle( new Pt( space.center.x, 100 ) ).size( unit*4 );
      let p2 = new Particle( new Pt( space.center.x, 100 ) ).size( unit*2 );

      // add to world
      world.add( hexagon ).add( square ).add( triangle, "triangle" );
      world.add( p1 ).add( p2 );

      // hit them with impulse
      p1.hit( 200, -20 );
      p2.hit( 100, -50 );
      hexagon[0].hit( 120, -40 );
      square[0].hit( -300, -20 );

      // lock triangle's first vertice so we can control it by pointer
      triangle[0].lock = true;
    },


    animate: (time, ftime) => {
      world.drawParticles( (p, i) => form.fillOnly("#09f").point( p, p.radius, "circle" ) );

      world.drawBodies( (b, i) => { 
        form.fillOnly(["#0c9","#f03","#fe6"][i%3]).polygon( b ); 
        form.strokeOnly("rgba(0,0,0,0.1");
        b.linksToLines().forEach( (l) => form.line(l) ); // visualize the edge constraints
      });
      
      world.update( ftime );
    },


    action:( type, px, py) => {
      world.body("triangle")[0].position = new Pt(px, py);
    }
    
  });
  
  space.bindMouse().bindTouch();
  space.play();

})();