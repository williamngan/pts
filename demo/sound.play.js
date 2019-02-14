// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "Play sound";

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {

  // Pts quick start mode.
  Pts.quickStart( "#pt", "#123" ); 

  let sound;

  space.add({
    start:( bound ) => {
      console.log( "started" );
      // sound = new Sound().load("/assets/nasa-magnetic-drum.mp3");
      sound = new Sound().generate( "sine", 120 );
      console.log( sound );
    },

    animate: (time, ftime) => {

    },

    action: (type, x, y, evt) => {
      console.log( type );
      if (type === "up") {
        sound.toggle();
      } 

      if (sound.playing) sound.generate( "sine", 100 + Math.floor(300 * space.pointer.x/space.size.x) );
    }
  });

  space.bindMouse().play();

})();