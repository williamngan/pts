// Source code licensed under Apache License 2.0. 
// Copyright © 2019 William Ngan. (https://github.com/williamngan/pts)

(function(){
  // Pts.namespace( this ); // add Pts into scope if needed

  var demoID = "sound_frequency";
  
  // create Space and Form
  var space = new CanvasSpace("#"+demoID).setup({ retina: true, bgcolor: "#e2e6ef", resize: true });
  var form = space.getForm();
  
  var files = ["/assets/flute.mp3", "/assets/drum.mp3", "/assets/tambourine.mp3"];
  var sounds = [];
  var currFile = 0;
  var bins = 32; 
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
