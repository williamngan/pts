// Source code licensed under Apache License 2.0.
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "Play a generated tone, and control its frequency by pointer position.";

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {

  // Pts quick start mode.
  Pts.quickStart( "#pt", "#123" );

  let sound;

  space.add({
    start:( bound ) => {
      sound = Sound.generate( "sine", 120 );
    },

    animate: (time, ftime) => {
      form.fillOnly("#fff").text( [20, 30], sound.playing ? "Playing at "+Math.round(sound.frequency)+"hz — click to stop" : "Click to play" );
    },

    action: (type, x, y, evt) => {
      if (type === "up") {
        sound.toggle();
      }

      if (sound.playing) sound.frequency = 100 + Math.floor(300 * space.pointer.x/space.size.x);
    }
  });

  space.bindMouse().play();

})();