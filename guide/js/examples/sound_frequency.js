(function(){
  // Pts.namespace( this ); // add Pts into scope if needed

  var demoID = "sound_frequency";
  
  // create Space and Form
  var space = new CanvasSpace("#"+demoID).setup({ retina: true, bgcolor: "#e2e6ef", resize: true });
  var form = space.getForm();
  
  var files = ["/assets/flute.mp3", "/assets/drum.mp3", "/assets/tambourine.mp3"];
  var currFile = 0;
  var sound;
  
  // Load next sound file
  function nextSound() {
    sound = Sound.load( files[currFile] ).analyze(32); 
    currFile = (currFile + 1) % files.length;
  }

  // Draw play button
  function playButton() {
    if (!sound.playing) {
      form.fillOnly('rgba(0,0,0,.2)').circle( Circle.fromCenter( space.center, 30 ) );
      form.fillOnly('#fff').polygon( Triangle.fromCenter( space.center, 15 ).rotate2D( Const.half_pi, space.center ) );
    }
  }

  nextSound();
  
  // animation
  space.add({

    animate: (time, ftime) => {
      if (sound && sound.playable) {
        let fd = sound.freqDomainTo( [space.size.y, space.size.x/2] );
        let h = space.size.y / fd.length;
        form.font(9, "bold");

        for (let i=0, len=fd.length; i<len; i++) {
          let f = fd[i];
          let hz = Math.floor( i*sound.sampleRate / (sound.binSize*2) ); // bin size is fftSize/2
          let color = ["#f03", "#0c9", "#62e"][i%3];
          form.fillOnly( color ).polygon( [[space.center.x, f.x], [space.center.x, f.x+h], [f.y+space.center.x, f.x+h/2]] );
          form.fillOnly( color ).point( [space.center.x-f.y, f.x+h/2], h/2 + 30 * f.y/space.size.x, "circle");
          if (sound.playing && f.y > 0) form.fillOnly("#fff").text( [space.center.x+2, f.x+h-4], hz+"hz" );          
        }
      }
      playButton();
    },

    action: (type, x, y) => {
      if (type === "up") {
        if (!sound.playing) nextSound();
        sound.toggle();
      }
    }
  });
  
  // start
  // Note that `playOnce(200)` will stop after 200ms. Use `play()` to run the animation loop continuously. 
  space.playOnce(200).bindMouse().bindTouch();
  
  // For use in demo page only
  if (window.registerDemo) window.registerDemo(demoID, space, null, stopFn);
  function stopFn() {
    if (sound && sound.playing) sound.stop();
  }

  
})();
