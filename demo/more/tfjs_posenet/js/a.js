// Source code licensed under Apache License 2.0. 
// Copyright © 2018 William Ngan. (https://github.com/williamngan/pts)

// This is a simple demo that runs posenet model to a static image and draw a body.


// pts.js
Pts.namespace(this);
var space = new CanvasSpace("#pts").setup({ bgcolor: "transparent", retina: true });
var form = space.getForm();

// tensorflow.js posenet model
var pose;
posenet.load().then( (net) => pose = net );

// BodyPose instance
var body;

// input
var video = document.getElementById('video');

// a function to draw the whole body
function drawBody() {

  form.strokeOnly("#0cf", 3);  
  form.circle( body.headFixed(20) );
  form.polygon( body.shoulder() );
  form.polygon( body.body() );
  form.polygons( body.arm( "left" ) ).polygons( body.arm( "right" ) );
  form.polygon( body.leg( "left" ) ).polygon( body.leg( "right" ) );

  form.strokeOnly("#f06", 2);
  form.lines( body.wireframe() );
}

// Add a player to CanvasSpace
space.add({

  start: () => {
    body = new BodyPose( space, (k,i) => space.center );
  },
  
  animate: (time, ftime) => {
    
    form.image( video, space.innerBound );
    
    if (pose) {

      const poseScale = 0.6;
      const poseStride = 16;
      const poseFlip = false;

      pose.estimateMultiplePoses(video, poseScale, poseFlip, poseStride, 1).then( function (people) {
        if (people.length > 0) {
          body.update( people[0].keypoints );
          drawBody(); 
        }
      });
    }
  }

});

// play
space.play();
