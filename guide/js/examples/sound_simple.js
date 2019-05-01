// Source code licensed under Apache License 2.0. 
// Copyright © 2019 William Ngan. (https://github.com/williamngan/pts)

(function(){
  // Pts.namespace( this ); // add Pts into scope if needed

  var demoID = "sound_simple";
  
  // create Space and Form
  var space = new CanvasSpace("#"+demoID).setup({ retina: true, bgcolor: "#e2e6ef", resize: true });
  var form = space.getForm();
  
  var bins = 256; 
  var sound;
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
    if (!bufferLoaded) {
      form.fillOnly("#9ab").text( [20,30], "Loading..." );
      return;
    }
    if (!sound || !sound.playing) {
      form.fillOnly("#f06").rect( [[0,0], [50,50]] );
      form.fillOnly('#fff').polygon( Triangle.fromCenter( [25,25], 10 ).rotate2D( Const.half_pi, [25,25] ) );
    } else {
      form.fillOnly("rgba(0,0,0,.2)").rect( [[0,0], [50,50]] );
      form.fillOnly("#fff").rect( [[18, 18], [32,32]] );
    }
  }
  

  // animation
  space.add({

    animate: (time, ftime) => {
      if (sound && sound.playable) {
        if (!sound.playing) space.stop(); // stop animation if not playing
        sound.freqDomainTo(space.size).map( (t, i) => {
          form.fillOnly( colors[i%5] ).point( t, 30 );
        });
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
  if (window.registerDemo) window.registerDemo(demoID, space, null, null, true);
  
  
})();
