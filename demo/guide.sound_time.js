// Source code licensed under Apache License 2.0. 
// Copyright © 2019 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "Demo in Sound guide.";

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {
  
  Pts.quickStart( "#pt", "#e2e6ef" );

  var files = ["/assets/flute.mp3", "/assets/drum.mp3", "/assets/tambourine.mp3"];
  var currFile = 0;
  var bins = 256; // try change this (must be a power of 2^)
  var sound;

  // Note: use Sound.loadAsBuffer instead if you need support for Safari/iOS browser. (as of Apr 2019)
  // See this example: http://ptsjs.org/demo/edit/?name=sound.timeDomain
  function loadSound() {
    Sound.load( files[currFile] ).then( s => {
      sound = s.analyze(bins).start();
      currFile = (currFile + 1) % files.length;
    }).catch( e => console.error(e) );
  }

  function playButton() {
    if (!sound || !sound.playing) {
      form.fillOnly('rgba(0,0,0,.2)').circle( Circle.fromCenter( space.center, 30 ) );
      form.fillOnly('#fff').polygon( Triangle.fromCenter( space.center, 15 ).rotate2D( Const.half_pi, space.center ) );
    }
  }

  // animation
  space.add({

    animate: (time, ftime) => {
      if (sound && sound.playable) {
        // map time domain data to lines drawing two half circles
        let tdata = sound.timeDomainTo( [Const.two_pi, 1] ).map( (t, i) => {
          let ln = Line.fromAngle( [ (i>bins/2 ? space.size.x : 0), space.center.y ], t.x-Const.half_pi, space.size.y/0.9 );
          return [ ln.p1, ln.interpolate( t.y ) ]
        });

        for (let i=0, len=tdata.length; i<len; i++) {
          let c = Math.floor( Num.cycle( i/tdata.length ) * 200 );
          form.stroke( `rgba( ${255-c}, 20, ${c}, .7 )`, 1 ).line( tdata[i] );
        }
      }
      playButton();
    },

    action: (type, x, y) => {
      if (type === "up" && Geom.withinBound( [x,y], space.center.$subtract( 25 ), space.center.$add( 25 ) )) {
        if (!sound || !sound.playing) loadSound();
      }
    }
  });
  

  //// ----  

  space.bindMouse().bindTouch().play();

})();