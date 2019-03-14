(function(){
  // Pts.namespace( this ); // add Pts into scope if needed

  var demoID = "sound_visual";
  
  // create Space and Form
  var space = new CanvasSpace("#"+demoID).setup({ retina: true, bgcolor: "#e2e6ef", resize: true });
  var form = space.getForm();
  

  var bins = 256;
  var sound = Sound.load( "/assets/spacetravel.mp3" ).analyze(bins);
  var shouldStop = true;
  var bubbles, radius;

  // Draw play button
  function playButton() {
    form.fillOnly( sound.playing ? "rgba(0,0,0,.2)" : "#f06").rect( [[0,0], [50,50]] );
    if (!sound.playing) {
      form.fillOnly('#fff').polygon( Triangle.fromCenter( [25,25], 10 ).rotate2D( Const.half_pi, [25,25] ) );
    } else {
      form.fillOnly("#fff").rect( [[18, 18], [32,32]] );
    }
  }
  
  
  // animation
  space.add({

    start: (bound) => {
      radius = space.size.minValue().value/3;
      bubbles = Create.radialPts( space.center, radius, 10, -Const.pi-Const.quarter_pi  );
      bubbles.map( p => p.add( 20*(Math.random() - Math.random()) ) );
      
    },

    animate: (time, ftime) => {

      if (sound && sound.playable) {

        let r = radius + radius * (Num.cycle(time%3000/3000) * 0.2);
        let temp = bubbles.clone();

        for (let i=0, len=temp.length; i<len; i++) {
          let bu = bubbles[i];
          let d = bu.$subtract( space.pointer );

          // push out if inside threshold 
          if ( d.magnitudeSq() < r*r ) {
            temp[i].to( space.pointer.$add( d.unit().$multiply( r ) ) );

          // pull in if outside threshold
          } else {
            if ( !bu.equals( temp[i], 0.1) ) {
              temp[i].to( Geom.interpolate( temp[i], bu, 0.02) );
            }
          }
        }

        // close the bspline curve with 3 extra points
        temp.push( temp.p1 );
        temp.push( temp.p2 );
        temp.push( temp.p3 );

        let curve = Curve.bspline( temp, 4 );
        let center = temp.centroid();

        let ps = [];
        for (let i=0; i<bins; i++) {
          ps.push( curve.interpolate( i/bins ) );
        }


        form.fillOnly("#123").polygon( curve );
        // form.fillOnly("#00f").points( ps, 2 );
        form.fill("rgba(255, 255, 255, 0.5)").points( temp, 2, "circle" );
        
      

        // map time domain data to lines drawing two half circles

        let fdata = sound.freqDomainTo( [bins, 1] );

        let lns = [];
        let tris = [];
        let ci = 0;
        let fc = 0;
        for (let i=0, len=fdata.length; i<len; i++) {
          let prev = (i === 0) ? ps[ps.length-1] : ps[i-1];
          let dp = ps[i].$subtract( prev );
          fc += fdata[i].y;

          if (dp.magnitudeSq() < 2) continue;

          if (ci === 0) {
            tris = [ ps[i] ];
          } else if (ci === 1) {
            let pp = Geom.perpendicular( dp );
            tris.push( ps[i].$add( pp[1].$unit().multiply( fdata[i].y * radius ) ) );
          } else if (ci === 2) {
            tris.push( ps[i] );
            lns.push( tris );
          }

          ci = (ci + 1) % 3;
        }

        let df = fc/bins;
        let cs = ["#f06", "#62e", "#fff", "#fe3", "#0c9"];

        for (let i=0, len=lns.length; i<len; i++) {
          form.fillOnly("#123").polygon( lns[i] );
          form.fillOnly( cs[i%cs.length] ).point( lns[i][1], fdata[i].y * 10, "circle" )
        }

        let tdata = sound.timeDomainTo( [radius, 10], [center.x - radius/2, 0] ).map( (t, i) => new Group( [t.x, center.y-t.y * Num.cycle( i/bins ) * (0.5 + 1.5 * df)  ], [t.x, center.y+t.y * Num.cycle( i/bins ) * (0.5 + 10 * df) + 30  ] ) );

        for (let i=0, len=tdata.length; i<len; i++) {
          let t1 = [tdata[i].interpolate( 0 ), tdata[i].interpolate( 0.25 + 0.2*df )];
          let t2 = [tdata[i].interpolate( 0.25 + 0.2*df ), tdata[i].interpolate( 0.5+0.3*df )];
          let t3 = [tdata[i].interpolate( 0.5+0.3*df ), tdata[i].interpolate( 1 )];
          form.strokeOnly( "#f06" ).line( tdata[i] );
          form.strokeOnly( "#123", 2 ).line( t2 );
        }


        // eyes

        
        let eyeRight = center.clone().toAngle( -Const.quarter_pi-0.2, radius/2, true );
        let eyeLeft = center.clone().toAngle( -Const.quarter_pi-Const.half_pi+0.2, radius/2, true );

        // form.fillOnly("#123").points( [eyeLeft, eyeRight], 10, "circle" );
        form.fillOnly("#fff").ellipse( eyeLeft, [8+10*df, 10+8*df], 0-1*df );
        form.fillOnly("#fff").ellipse( eyeRight, [8+10*df, 10+8*df], 0+1*df );
        
        let ang = space.center.$subtract( space.pointer ).angle() + Const.pi;
        let eyeBallRight = eyeRight.clone().toAngle( ang, 5, true );
        let eyeBallLeft = eyeLeft.clone().toAngle( ang, 5, true );

        form.fill("#123").points( [eyeBallLeft, eyeBallRight], 1 + 10*df, "circle" );


        // loop until stopped
        if (!sound.playing && !shouldStop) {
          sound.start();
        }
      }

      playButton();
      

    },

    action: (type, x, y) => {
      if (type === "up") {
        if ( Geom.withinBound( [x,y], [0,0], [50,50] )) {
          sound.toggle();
        }
      }
    }
  });
  
  // start
  // Note that `playOnce(200)` will stop after 200ms. Use `play()` to run the animation loop continuously. 
  space.playOnce(200).bindMouse().bindTouch();
  
  // For use in demo page only
  if (window.registerDemo) window.registerDemo(demoID, space, null, stopFn);
  function stopFn() {
    if (sound && sound.playing) {
      // shouldStop = true;
      // sound.stop();
    }
  }

  
})();
