Pts.namespace( window );

var space = new CanvasSpace("#pt").setup({retina: true});
var form = space.getForm();

let gp = [];


space.add( {

  start: (bound, space) => {
    let ux = space.width/20;
    let uy = space.height/20;

    // vertical and horizontal line
    gp.push( Group.fromArray( [[-ux, -space.height/2], [ux, space.height/2]] ) ); 
    gp.push( Group.fromArray( [[-space.width/2, -uy], [space.width/2, uy]] ) ); 

    // bounds
    gp.push( Group.fromArray( [[-ux*3, -uy*3], [ux, uy]] ) ); 
    gp.push( Group.fromArray( [[-ux, -ux], [ux*4, ux*4]] ) ); 

    // shapes
    gp.push( Group.fromArray( [[-ux*2, -uy*2], [ux, uy*3], [ux*4, 0]] ) ); 

    for (let i=0, len=gp.length; i<len; i++) {
      gp[i].anchorFrom( space.center );
    }
  },

  animate: (time, fps) => {
    form.stroke("#aaa").fill(false).line( gp[0] );
    form.line( gp[1] );

    form.rect( gp[2] );
    form.rect( gp[3] );

    // let gc = gp[2].clone().relativeTo(0);
    // console.log( gp[2] );
    // form.point( gp[2], gc.x );

    form.line( gp[4] )
  },

  action:( type, px, py) => {

  },
  
  resize:( bound, evt) => {
    
  }
  
});
  
space.bindMouse();
// space.play();
space.playOnce(5000);