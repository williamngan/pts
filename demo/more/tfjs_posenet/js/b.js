// Source code licensed under Apache License 2.0. 
// Copyright © 2018 William Ngan. (https://github.com/williamngan/pts)

// This demo shows how to capture webcam input, run it through tensorflow.js posenet model, and then visualize the result with pts.js


// pts.js
Pts.namespace(this);
var space = new CanvasSpace("#pts").setup({ bgcolor: "transparent", retina: true });
var form = space.getForm();

// tensorflow posenet model
var pose;
posenet.load().then( (net) => pose = net );

// BodyPose instance
var body;
var squareCrop;

// input
var video = document.getElementById('video');

// scene time step
let scene = scenes( [10000, 5000, 3000 ])


function drawBody() {

  form.fillOnly("#000", 3);

  // head and body
  form.circle( body.head(1.2) );
  form.polygon( body.shoulder( 30, 20 ) );
  form.polygon( body.body(30, 10) );
  form.circle( body.joint( "leftShoulder", 30 ) ).circle( body.joint( "rightShoulder", 30 ) );
  
  // legs
  form.polygon( Curve.cardinal( 
    body.dup( body.leg( "left", 10, 10, 3 ), 2),
    10, 0.4) );
  form.polygon( Curve.cardinal( 
    body.dup( body.leg( "right", 10, 10, 3 ), 2), 
    10, 0.4));

  // arms
  form.polygons( body.arm( "left", 30 ) ).polygons( body.arm( "right", 30 ) );
  form.fill("#f06");
  form.circle( body.joint( "leftWrist", 10 ) ).circle( body.joint( "rightWrist", 10 ) );

  // left eye :)
  form.polygon( Triangle.fromCenter( body.at( "leftEye" ), 10) );
}


/**
 * Draw some background graphics that sync with body movements
 */
function drawBg() {
  
  let bg2 = body.take( ["rightKnee", "rightHip", "leftHip", "leftKnee", "rightKnee", "rightHip", "leftHip"] );
  if (bg2.length > 3) {
    bg2.scale( 3, Polygon.centroid( bg2 ) );
    form.fillOnly("#fff").polygon( Curve.bspline( bg2, 15) );
  }

  let bg1 = body.take( ["leftWrist", "rightWrist", "rightElbow", "leftElbow"] );
  if (bg1.length > 3) {
    bg1.scale( new Pt(1.5, 2.5), Polygon.centroid( bg1) );
    form.fillOnly("#fe3").polygon( bg1 );
  }

}


// Add a player to CanvasSpace
space.add({

  start: () => { 
    // start webcam and crop its input into a square frame
    webcam( video );
    body = new BodyPose( space, (d, i) => space.center.add(Math.random(), Math.random()) );
    squareCrop = body.squareBuffer( video );
  },
  
  animate: (time, ftime) => {

    form.useOffscreen( true ); // use offscreen canvas for performance
    let cropped = squareCrop();

    // track time and draw background graphics after some time passes
    let st = scene(time);
    if (st < 2) form.image( cropped, space.innerBound );
    if (st >= 1) form.fillOnly( `rgba(70,0, 220, ${ Math.min(1, st-1) })` ).rect( space.innerBound );
    
    if (pose) {

      const poseScale = 0.6;
      const poseStride = 16;
      const poseFlip = false;

      pose.estimateMultiplePoses(cropped, poseScale, poseFlip, poseStride, 1).then( function (people) {
        if (people.length > 0) { // draw the first person in the scene
          body.update( people[0].keypoints );
          drawBg();
          drawBody(); 
        }
      });
    }

    form.renderOffscreen(); // render offscreen canvas
  }

});

space.play();
