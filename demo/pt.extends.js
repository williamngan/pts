// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "Move the pointer to creates confetti. A simple example to show how to extend Pt class.";

Pts.quickStart( "#pt", "#fe3" );

//// Demo code starts (anonymous function wrapper is optional) ---

(function() {

  let pts = new Group();

  // Confetti extends Pt to implement custom logic and rendering
  class Confetti extends Pt {
    constructor( ...args ) {
      super( ...args );
      this.color = ["#f03", "#09f", "#0c6", "#fff"][ Util.randomInt(4) ];
      this.size = Math.random()*7+2;
      this.angle = Math.random() * Const.two_pi;
      this.dir = (Math.random() > 0.5) ? 1 : -1;
      this.shape = ["rect", "circle", "tri"][ Util.randomInt(3) ];
    }

    render( form ) {
      if (this.y < space.size.y) {
        this.y += 2/this.size + Math.random();
        this.x += Math.random() - Math.random();
        this.angle += this.dir * (Math.random()*Const.one_degree + Const.one_degree);
        
        if (this.shape == "tri" || this.shape == "rect") {
          let shape = (this.shape == "tri") ? Triangle.fromCenter(this, this.size) : Rectangle.corners(Rectangle.fromCenter(this, this.size*2));
          shape.rotate2D( this.angle, this );
          form.fillOnly(this.color).polygon( shape );
        } else {
          form.fillOnly(this.color).point( this, this.size, "circle" );
        }
      }
    }
  }


  space.add({ 
    animate: (time, ftime) => {
      // remove confetti if reaching the bottom or too many
      if (pts.length > 1000 || (pts.length > 0 && pts[0].y > space.size.y)) pts.shift();

      // add a confetti every second
      if ( Math.floor(time%1000) > 980 ) pts.push( new Confetti(space.pointer) );
      
      // render the confetti
      pts.forEach( p => p.render(form) );
    },

    action:( type, px, py ) => {

      // add a point to the line when mouse moves
      if (type == "move") pts.push( new Confetti(px, py) );  
    } 
  });
  
  //// ----
  

  space.bindMouse().bindTouch().play();

})();