(function(){
  // Pts.namespace( this ); // add Pts into scope if needed

  var demoID = "sound_visual";
  
  // create Space and Form
  var space = new CanvasSpace("#"+demoID).setup({ retina: true, bgcolor: "#e2e6ef", resize: true });
  var form = space.getForm();
  
  var sound;
  var bins = 256;
  var ctrls, radius;
  var colors = ["#f06", "#62e", "#fff", "#fe3", "#0c9"];
  var bufferLoaded = false;

  
  // Method 1: Streaming play - simpler but time/freq domain doesn't work in Safari and iOS (as of 4/2019)
  // Sound.load( "/assets/spacetravel.mp3" ).then( s => {
  //   sound = s.analyze( bins );
  // });

  // If using Method 1: Sound.load(...)
  // function toggle() {
  //    sound.toggle();
  // }


  // Method 2 --------------------------------
  // Buffer and play - work across all browsers but no streaming and more code
  Sound.loadAsBuffer( "/assets/spacetravel.mp3" ).then( s => {
    sound = s;
    space.playOnce(50); // render for noce
    bufferLoaded = true;
  }).catch( e => console.error(e) );

  // If using Method 2: Sound.loadAsBuffer(...)
  function toggle() {
    if (sound.playing || !bufferLoaded) {
      sound.stop();
    } else {
      sound.createBuffer().analyze(bins); // recreate buffer again
      sound.start();
      space.replay();
    }
  }


  // Draw play button
  function playButton() {
    if (!sound || !sound.playing) {
      form.fillOnly("#f06").rect( [[0,0], [50,50]] );
      form.fillOnly('#fff').polygon( Triangle.fromCenter( [25,25], 10 ).rotate2D( Const.half_pi, [25,25] ) );
    } else {
      form.fillOnly("rgba(0,0,0,.2)").rect( [[0,0], [50,50]] );
      form.fillOnly("#fff").rect( [[18, 18], [32,32]] );
    }
  }
  

  function getCtrlPoints( t ) {
    let r = radius + radius * ( Num.cycle( t%3000/3000 ) * 0.2);
    let temp = ctrls.clone();

    for (let i=0, len=temp.length; i<len; i++) {
      let d = ctrls[i].$subtract( space.pointer );

      if ( d.magnitudeSq() < r*r ) { // push out if inside threshold 
        temp[i].to( space.pointer.$add( d.unit().$multiply( r ) ) );
      
      } else if ( !ctrls[i].equals( temp[i], 0.1) ) { // pull in if outside threshold
        temp[i].to( Geom.interpolate( temp[i], ctrls[i], 0.02) );
      }
    }

    // close the bspline curve with 3 extra points
    temp.push( temp.p1, temp.p2, temp.p3 );
    return temp;
  }
  
  // animation
  space.add({

    start: (bound) => {
      radius = space.size.minValue().value/3;
      ctrls = Create.radialPts( space.center, radius, 10, -Const.pi-Const.quarter_pi  );
    },

    animate: (time, ftime) => {

      if (sound && sound.playable) {
        if (!sound.playing) space.stop(); // stop animation if not playing

        // get b-spline curve and draw face shape
        let anchors = getCtrlPoints(time); 
        let curve = Curve.bspline( anchors, 4 );
        let center = anchors.centroid();
        form.fillOnly("#123").polygon( curve );
        
        // initiate spikes array, evenly distributed spikes aroundthe face
        let spikes = [];
        for (let i=0; i<bins; i++) {
          spikes.push( curve.interpolate( i/bins ) );
        }
      
        // calculate spike shapes based on freqs
        let freqs = sound.freqDomainTo( [bins, 1] );
        let tris = [];
        let tindex = 0;
        let f_acc = 0;

        let temp;
        for (let i=0, len=freqs.length; i<len; i++) {
          let prev = spikes[ (i === 0) ? spikes.length-1 : i-1 ];
          let dp = spikes[i].$subtract( prev );
          f_acc += freqs[i].y;

          if (dp.magnitudeSq() < 2) continue;

          if (tindex === 0) {
            temp = [ spikes[i] ];
          } else if (tindex === 1) {
            let pp = Geom.perpendicular( dp );
            temp.push( spikes[i].$add( pp[1].$unit().multiply( freqs[i].y * radius ) ) );
          } else if (tindex === 2) {
            temp.push( spikes[i] );
            tris.push( temp );
          }

          tindex = (i+1) % 3;
        }


        // draw spikes
        let f_scale = f_acc/bins;
        for (let i=0, len=tris.length; i<len; i++) {
          form.fillOnly("#123").polygon( tris[i] );
          form.fillOnly( colors[ i%colors.length ] ).point( tris[i][1], freqs[i].y * 10, "circle" )
        }

        // draw "lips" based on time domain data
        let tdata = sound.timeDomainTo( [radius, 10], [center.x - radius/2, 0] ).map( (t, i) => 
          new Group(  [ t.x, center.y-t.y * Num.cycle( i/bins ) * (0.5 + 1.5 * f_scale) ], 
                      [ t.x, center.y+t.y * Num.cycle( i/bins ) * (0.5 + 10 * f_scale) + 30 ] ) 
        );

        for (let i=0, len=tdata.length; i<len; i++) {
          let t2 = [tdata[i].interpolate( 0.25 + 0.2*f_scale ), tdata[i].interpolate( 0.5 + 0.3*f_scale )];
          form.strokeOnly( "#f06" ).line( tdata[i] );
          form.strokeOnly( "#123", 2 ).line( t2 );
        }


        // draw eyes        
        let eyeRight = center.clone().toAngle( -Const.quarter_pi-0.2, radius/2, true );
        let eyeLeft = center.clone().toAngle( -Const.quarter_pi-Const.half_pi+0.2, radius/2, true );
        form.fillOnly("#fff").ellipse( eyeLeft, [8+10*f_scale, 10+8*f_scale], 0-1*f_scale );
        form.fillOnly("#fff").ellipse( eyeRight, [8+10*f_scale, 10+8*f_scale], 0+1*f_scale );
        
        let eyeBallRight = eyeRight.clone().toAngle( eyeRight.$subtract( space.pointer ).angle(), -5, true );
        let eyeBallLeft = eyeLeft.clone().toAngle( eyeLeft.$subtract( space.pointer ).angle(), -5, true );
        form.fill("#123").points( [eyeBallLeft, eyeBallRight], 2 + 10*f_scale, "circle" );
      }
      playButton();
    },

    action: (type, x, y) => {
      if (type === "up" && Geom.withinBound( [x,y], [0,0], [50,50] )) {
        toggle();
      }
    }
  });
  

  // start
  // Note that `playOnce(200)` will stop after 200ms. Use `play()` to run the animation loop continuously. 
  space.playOnce(200).bindMouse().bindTouch();
  
  // For use in demo page only
  if (window.registerDemo) window.registerDemo(demoID, space, startFn, null, true);
  function startFn() {
    if (sound && !sound.playing) space.replay();
  }
  
})();
