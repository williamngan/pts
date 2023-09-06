// Source code licensed under Apache License 2.0. 
// Copyright © 2019 William Ngan. (https://github.com/williamngan/pts)

(function(){
  // Pts.namespace( this ); // add Pts into scope if needed

  var demoID = "sound_time";
  
  // create Space and Form
  var space = new CanvasSpace("#"+demoID).setup({ retina: true, bgcolor: "#e2e6ef", resize: true });
  var form = space.getForm();
  
  var files = ["/assets/flute.mp3", "/assets/drum.mp3", "/assets/tambourine.mp3"];
  var sounds = [];
  var currFile = 0;
  var bins = 256; 
  var sound;

  function loadSound(i) {
    Sound.loadAsBuffer( files[i] ).then( s => {
      sound = s;
      sounds.push( s );
      if (i < files.length-1) loadSound(i+1);
    }).catch( e => console.error(e) );
  }

  loadSound(0); // load all sounds

  // Draw play button
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
        // if (!sound.playing) space.stop(); // stop animation if not playing

        // map time domain data to lines drawing two half circles
        let tdata = sound.timeDomainTo( [Const.two_pi, 1] ).map( (t, i) => {
          let ln = Line.fromAngle( [ (i>128 ? space.size.x : 0), space.center.y ], t.x-Const.half_pi, space.size.y/0.9 );
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
        if (!sound.playing && sounds.length > 0) {
          currFile = (currFile + 1) % sounds.length;
          sound = sounds[currFile];
          sound.createBuffer().analyze(bins).start(); // reset buffer and analyzer 
          space.replay();
        }
      }
    }
  });
  
  // start
  // Note that `playOnce(200)` will stop after 200ms. Use `play()` to run the animation loop continuously. 
  space.playOnce(200).bindMouse().bindTouch();
  
  // For use in demo page only
  if (window.registerDemo) window.registerDemo(demoID, space, null, stopSound);
  
  function stopSound() {
    if (sound && sound.playing) sound.stop();
  }
  
})();
