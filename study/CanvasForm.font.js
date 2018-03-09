// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)


Pts.namespace( window );

var space = new CanvasSpace("#pt").setup({retina: true, resize: true});
var form = space.getForm();

let sample1 = "Once upon a time";
let sample2 = "Once upon a time and a very good time it was";
let sample3 = "Once upon a time and a very good time it was there was a moocow coming down along the road and this moocow that was coming down along the road met a nicens little boy named baby tuckoo... \n\nHis father told him that story: his father looked at him through a glass: he had a hairy face. \n\nHe was baby tuckoo. The moocow came down the road where Betty Byrne lived: she sold lemon platt. \n\nO, the wild rose blossoms\nOn the little green place.";


space.add( {

  start: init,

  animate: (time, ftime) => {
    guidelines();
    
    // Begin Test Code --
    
    form.strokeOnly("#abc", 1).rects( cells );

    form.fill("#345").font( 18 ).fontWidthEstimate( false );
    form.alignText("left", "middle").textBox( cells[0], sample1, "top", "..." );
    form.alignText("left", "middle").textBox( cells[0], sample1, "middle", "..." );
    form.alignText("left", "top").textBox( cells[0], sample1, "bottom", "..." );

    form.alignText("center", "top").textBox( cells[1], sample1, "top", "..." );
    form.alignText("center", "middle").textBox( cells[1], sample1, "middle", "..." );
    form.alignText("center", "bottom").textBox( cells[1], sample1, "bottom", "..." );

    form.alignText("right", "top").textBox( cells[2], sample1, "top", "..." );
    form.alignText("right", "middle").textBox( cells[2], sample1, "middle", "..." );
    form.alignText("right", "bottom").textBox( cells[2], sample1, "bottom", "..." );

    form.alignText("left").paragraphBox( cells[3], sample2, 1.2, "top" );
    form.alignText("left").paragraphBox( cells[3], sample2, 1.2, "middle" );
    form.alignText("left").paragraphBox( cells[3], sample2, 1.2, "bottom" );

    form.alignText("center").paragraphBox( cells[4], sample2, 1.8, "top" );
    form.alignText("center").paragraphBox( cells[4], sample2, 1.8, "middle" );
    form.alignText("center").paragraphBox( cells[4], sample2, 1.8, "bottom" );

    form.alignText("right").paragraphBox( cells[5], sample2, 1, "top" );
    form.alignText("right").paragraphBox( cells[5], sample2, 1, "middle" );
    form.alignText("right").paragraphBox( cells[5], sample2, 1, "bottom" );

    form.font(14).alignText("center").paragraphBox( cells[6], sample3, 1.2, "middle");
    form.font(26).alignText("center", "middle").textBox( cells[7], sample3, "...", "middle");


    // End
  },

  action:( type, px, py) => {
    
  },
  
  resize:( bound, evt) => {
    cells = Create.gridCells( space.innerBound, 4, 2 );
  }
  
});

// Template: Predefined shapes for testing ---

let cells = new Group();

function init(bound, space) {
  cells = Create.gridCells( space.innerBound, 4, 2 );
};

function guidelines() {

}


  
space.bindMouse().bindTouch();
space.play();
// space.playOnce(5000);