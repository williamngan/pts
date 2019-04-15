// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "Play snippets of drum, tambourine, and flute. Visualize their waveforms in radial lines.";

Pts.quickStart( "#pt", "#eae6ef" );

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {
  
  var files = ["/assets/flute.mp3", "/assets/drum.mp3", "/assets/tambourine.mp3"];
  var currFile = 0;
  var bins = 512;
  var sound;

  // Load next sound file
  function nextSound( play=true ) {
    Sound.load( files[currFile] ).then( s => {
      sound = s.analyze( bins ).start();
      currFile = (currFile + 1) % files.length;
    }).catch( e => console.error(e) );
  }

  // Draw play button
  function playButton( size ) {
    if (!sound || !sound.playing) {
      form.fillOnly('rgba(0,0,0,.2)').circle( Circle.fromCenter( space.center, size ) );
      form.fillOnly('#fff').polygon( Triangle.fromCenter( space.center, size/2 ).rotate2D( Const.half_pi, space.center ) );
    }
  }

  space.add({ 
    animate: (time, ftime) => {
      if (sound && sound.playable) {

        // map time domain data to lines drawing two half circles
        let r = Math.min( space.size.x, space.size.y/0.9 );
        let tdata = sound.timeDomainTo( [Const.two_pi, 1] ).map( (t, i) => {
          let ln = Line.fromAngle( [ (i>bins/2 ? space.size.x : 0), space.center.y ], t.x-Const.half_pi, r );
          return [ ln.p1, ln.interpolate( t.y ) ]
        });

        for (let i=0, len=tdata.length; i<len; i++) {
          let c = Math.floor( Num.cycle( i/tdata.length ) * 200 );
          form.stroke( `rgba( ${255-c}, 20, ${c}, .7 )`, 1 ).line( tdata[i] );
        }
      }

      playButton( Math.max( space.size.y/20, 30 ) );
    },

    action: (type, x, y) => {
      if (type === "up") {
        if (!sound || !sound.playing) nextSound();
      }
    }
  });
  
  //// ----
  

  space.bindMouse().bindTouch().play();

})();