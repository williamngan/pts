// Source code licensed under Apache License 2.0. 
// Copyright © 2019 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "Basic example of loading sound and visualizing frequencies. Music from 'Space Travel Clichés' by MrGreenH.";

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {

  Pts.quickStart( "#pt", "#eae6ef" );

  /*
   * Note: If you don't need Safari/iOS compatibility right away (as of Apr 2019)
   * A simpler method to use would be Sound.load(...) instead of Sound.loadAsBuffer(...)
   * See this demo: http://ptsjs.org/demo/edit/?name=guide.sound_simple
   */

  var bins = 256; 
  var sound;
  var colors = ["#f06", "#62e", "#fff", "#fe3", "#0c9"];
  var bufferLoaded = false;
  Sound.loadAsBuffer( "/assets/spacetravel.mp3" ).then( s => {
    sound = s;
    bufferLoaded = true;
  }).catch( e => console.error(e) );

  function toggle() {
    if (sound.playing || !bufferLoaded) {
      sound.stop();
    } else {
      sound.createBuffer().analyze(bins); // recreate buffer again
      sound.start();
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
      if (sound && sound.playing) {
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
  
  //// ----
  
  space.bindMouse().bindTouch().play();

})();