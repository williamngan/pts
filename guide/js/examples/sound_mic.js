(function(){
  // Pts.namespace( this ); // add Pts into scope if needed

  var demoID = "sound_mic";
  
  // create Space and Form
  var space = new CanvasSpace("#"+demoID).setup({ retina: true, bgcolor: "#e2e6ef", resize: true });
  var form = space.getForm();
  
  var sound;
  var recording = false;


  // Draw button
  function recordButton() {
    form.fillOnly( recording ? "rgba(0,0,0,.2)" : "#f06").rect( [[0,0], [50,50]] );
    if (!recording) {
      form.fillOnly('#fff').circle( Circle.fromCenter( [25,25], 8 ) );
    } else {
      form.fillOnly("#fff").rect( [[18, 18], [32,32]] );
    }
  }

  function toggleRecord() {
    if ( Geom.withinBound( space.pointer, [0,0], [50,50] ) ) {
      if (!recording) {
        Sound.input().then( s => {
          sound = s;
          sound.analyze( 128 );
        });
      } else {
        sound.stop();
        sound = undefined;
      }
      recording = !recording;
    }
  }
  
  // animation
  space.add({

    animate: (time, ftime) => {
      if (sound && sound.playable) {
        let td = sound.timeDomainTo( space.size );
        form.strokeOnly("#62e", 15).line( td ); 
        form.strokeOnly("#0c9", 3).line( td ); 
      }

      recordButton();
    },

    action: (type, x, y) => {
      if (type === "up") {
        toggleRecord();
      }
    }
  });
  
  // start
  // Note that `playOnce(200)` will stop after 200ms. Use `play()` to run the animation loop continuously. 
  space.playOnce(200).bindMouse().bindTouch();
  
  // For use in demo page only
  if (window.registerDemo) window.registerDemo(demoID, space, null, stopFn);
  function stopFn() {
    
  }

  
})();
