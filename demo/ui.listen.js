// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

Pts.quickStart( "#pt", "#fe3" ); 

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {

  var btn1;
  var dragger;

  space.add( {

    start: (bound, space) => {
      btn1 = UIButton.fromRectangle( [[120,120], [50,50]] );
      dragger = UIButton.fromCircle( [[220,220], [50,50]] );

      btn1.onClick( (pt, ui) => ui.group.scale( 1.1, pt ) );
      dragger.onClick( (pt, ui) => ui.group.moveBy( [0,20], pt ) );
      dragger.onHover();
    },   

    animate: (time, fps) => {
      btn1.render( (g, s) => form.fillOnly("#f03").rect( g ) );
      dragger.render( (g, s) => form.fillOnly( s.hover ? "#f03" : "#00c").circle( g ) );
      form.log( btn1.clicks+" - "+dragger.clicks );
    },

    action:( type, px, py) => {
      UI.listen( [btn1, dragger], type, new Pt(px, py) );
      
    },
    
    resize:( bound, evt) => {
      
    }
  });
    
  //// ----
  space.bindMouse().bindTouch().play();

})();