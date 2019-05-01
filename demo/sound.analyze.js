// Source code licensed under Apache License 2.0. 
// Copyright © 2019 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "Basic example of loading sound and visualizing frequencies. Music from 'Space Travel Clichés' by MrGreenH.";

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {

  Pts.quickStart( "#pt", "#eae6ef" );

  // Note: use Sound.loadAsBuffer instead if you need support for Safari browser. (as of Apr 2019)
  // See this example: https://github.com/williamngan/pts/blob/master/guide/js/examples/sound_simple.js
  
  var sound;
  var bins = 256;
  var colors = ["#f06", "#62e", "#fff", "#fe3", "#0c9"];

  // Load sound
  Sound.load( "/assets/spacetravel.mp3" ).then( s => {
    sound = s.analyze(bins);
  }).catch( e => console.error(e) );


  // Draw play button
  function playButton() {
    form.fillOnly("#f06").rect( [[0,0], [50,50]] );
    if (!sound || !sound.playing) {
      form.fillOnly('#fff').polygon( Triangle.fromCenter( [25,25], 10 ).rotate2D( Const.half_pi, [25,25] ) );
    } else {
      form.fillOnly("#fff").rect( [[18, 18], [32,32]] );
    }
  }


  // animation
  space.add({
    animate: (time, ftime) => {
      if (sound && sound.playable) {
        sound.freqDomainTo(space.size).forEach( (t, i) => {
          form.fillOnly( colors[i%5] ).point( t, 50+20 * t.y/space.size.y );
        });
      }
      playButton();
    },

    action: (type, x, y) => {
      if (type === "up" &&  Geom.withinBound( [x,y], [0,0], [50,50] )) { // clicked button
        sound.toggle();
      }
    }
  });
  
  //// ----
  
  space.bindMouse().bindTouch().play();

})();