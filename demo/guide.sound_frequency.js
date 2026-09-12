// Source code licensed under Apache License 2.0. 
// Copyright © 2019 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "Frequency domain demo in Sound guide.";

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {
  
  Pts.quickStart( "#pt", "#e2e6ef" );

  var files = ["/assets/flute.mp3", "/assets/drum.mp3", "/assets/tambourine.mp3"];
  var currFile = 0;
  var bins = 32;
  var sound;
  var loading = false;
  var status = "";

  function loadSound() {
    if (loading) return;
    loading = true;
    status = "Loading...";
    Sound.load( files[currFile] ).then( s => {
      sound = s.analyze(bins).start();
      currFile = (currFile + 1) % files.length;
      status = "";
    }).catch( e => {
      status = "Could not load sound.";
      console.error(e);
    }).finally( () => {
      loading = false;
    });
  }


  function playButton() {
    if (status) {
      form.fillOnly("#789").text( space.center.$subtract( 55, 0 ), status );
    }
    if (!sound || !sound.playing) {
      form.fillOnly('rgba(0,0,0,.2)').circle( Circle.fromCenter( space.center, 30 ) );
      form.fillOnly('#fff').polygon( Triangle.fromCenter( space.center, 15 ).rotate2D( Const.half_pi, space.center ) );
    }
  }
  
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

          // draw spikes
          form.fillOnly( color ).polygon( [[space.center.x, f.x], [space.center.x, f.x+h], [f.y+space.center.x, f.x+h/2]] );
          // draw circle
          form.fillOnly( color ).point( [space.center.x-f.y, f.x+h/2], h/2 + 30 * f.y/space.size.x, "circle");
          // draw text
          if (sound.playing && f.y > 0) form.fillOnly("#fff").text( [space.center.x+2, f.x+h-h/2+4], hz+"hz" );          
        }
      }
      playButton();
    },

    action: (type, x, y) => {
      if (type === "up" && Geom.withinBound( [x,y], space.center.$subtract( 25 ), space.center.$add( 25 ) )) {
        if (!loading && (!sound || !sound.playing)) loadSound();
      }
    }
  });

  //// ----  

  space.bindMouse().bindTouch().play();

})();