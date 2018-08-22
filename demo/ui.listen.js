// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

Pts.quickStart( "#pt", "#fe3" ); 

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {

  var btn1, btn2, dragger;
  var handles;

  space.add( {

    start: (bound, space) => {
      let hs = Line.subpoints( [space.center.$multiply(0.25), space.center.$add( space.center.$multiply(0.75) )], 5 );
      handles = hs.map( h => {
        let ud = UIDragger.fromCircle( [h, [20,20]] );
        ud.onDrag( (ui, pt) => {
          ui.group[0].to( space.pointer.$subtract( ui.state('offset') ) ) 
        });
        ud.onHover( 
          (ui) => ui.group[1].scale(1.2),
          (ui) => ui.group[1].scale(1/1.2),
        )
        return ud;
      });

      btn1 = UIButton.fromRectangle( [[120,120], [50,50]] );
      btn2 = UIButton.fromCircle( [[220,220], [50,50]] );
      dragger = UIDragger.fromCircle( [[320,320], [30,30]] );

      btn1.onClick( (ui, pt) => ui.group.scale( 1.1, pt ) );
      btn2.onClick( (ui, pt) => ui.group.moveBy( [0,20], pt ) );
      btn2.onHover( 
        (ui) => ui.group[1].scale( 1.2 ),
        (ui) => ui.group[1].scale( 1/1.2 )
      );

      dragger.onDrag( (ui, pt) => {
        ui.group[0].to( space.pointer.$subtract( ui.state('offset') ) );
      });
    },   

    animate: (time, fps) => {
      
      btn1.render( (g, s) => form.fillOnly("#f03").rect( g ) );
      btn2.render( (g, s) => form.fillOnly( s.hover ? "#f03" : "#00c").circle( g ) );
      dragger.render( (g, s) => form.fillOnly("#0c6").circle( g ) );
      form.log( btn1.clicks+" - "+btn2.clicks );

      handles.forEach( (h) => {
        
        h.render( (g, s) => form.fillOnly("#f03").circle( g ) );
        
      });
      
    },

    action:( type, px, py) => {
      
      UI.track( [btn1, btn2, dragger], type, new Pt(px, py) );
      UI.track( handles, type, new Pt(px, py) );
      
    },
    
    resize:( bound, evt) => {
      
    }
  });
    
  //// ----
  space.bindMouse().bindTouch().play();

})();