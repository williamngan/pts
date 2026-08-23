// Source code licensed under Apache License 2.0. 
// Copyright © 2019 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "Microphone demo in Sound guide.";

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {
  
  Pts.quickStart( "#pt", "#e2e6ef" );

  var sound;
  var recording = false;
  var pending = false;
  var status = "";
  var rainbow = ["#f03", "#f90", "#fe6", "#3c0", "#0f6", "#03f", "#60f"];

  // Draw button
  function recordButton() {
    form.fillOnly( recording ? "rgba(0,0,0,.2)" : "#f06").rect( [[0,0], [50,50]] );
    if (!recording || !sound) {
      form.fillOnly('#fff').circle( Circle.fromCenter( [25,25], 8 ) );
    } else {
      form.fillOnly("#fff").rect( [[18, 18], [32,32]] );
    }
    if (status) form.fillOnly("#789").text( [60, 30], status );
  }

  function toggleRecord() {
    if ( Geom.withinBound( space.pointer, [0,0], [50,50] ) ) {
      if (!recording && !pending) {
        pending = true;
        status = "Requesting microphone...";
        Sound.input().then( s => {
          sound = s.analyze( 128 );
          recording = true;
          status = "";
        }).catch( e => {
          status = "Microphone unavailable.";
          console.error( e );
        }).finally( () => {
          pending = false;
        });
      } else if (recording && sound) {
        recording = false;
        sound.stop();
        sound = undefined;
        status = "";
      }
    }
  }
  
  // animation
  space.add({

    animate: (time, ftime) => {
      if (sound && sound.playable) {
        let td = sound.timeDomainTo( space.size );
        let band = space.size.y/40;
        rainbow.forEach( (r, i) => {
          form.strokeOnly( r, band*rainbow.length - i*band ).line(td);  
        });
      }
      recordButton();
    },

    action: (type, x, y) => {
      if (type === "up") {
        toggleRecord();
      }
    }
  });

  //// ----  

  space.bindMouse().bindTouch().play();

})();