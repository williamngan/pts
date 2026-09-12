// Source code licensed under Apache License 2.0. 
// Copyright © 2019 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = " Sound play and analyze. Music snippet taken from Space Travel Clichés composed by MrGreenH";

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {

  Pts.quickStart( "#pt", "#e2e6ef" );

  var sound;
  var bins = 256;
  var colors = ["#f06", "#62e", "#fff", "#fe3", "#0c9"];
  var status = "Loading...";

  // Load sound
  Sound.load( "/assets/spacetravel.mp3" ).then( s => {
    sound = s.analyze(bins);
    status = "";
  }).catch( e => {
    status = "Could not load sound.";
    console.error(e);
  });


  // Draw play button
  function playButton() {
    if (!sound) {
      form.fillOnly("#9ab").text( [20,30], status );
      return;
    }
    if (!sound.playing) {
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
        sound.freqDomainTo(space.size).forEach( (t, i) => {
          form.fillOnly( colors[i%5] ).point( t, 30 );
        });
      }
      playButton();
    },

    action: (type, x, y) => {
      if (type === "up" &&  Geom.withinBound( [x,y], [0,0], [50,50] )) { // clicked button
        if (sound) sound.toggle();
      }
    }
  });
  
  //// ----
  
  space.bindMouse().bindTouch().play();

})();