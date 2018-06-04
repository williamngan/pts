/**
 * A class to help you manage and visualizae a body's estimated pose landmarks.
 */
class BodyPose {

  /**
   * Initiate a body
   * @param {*} space a Pts CanvasSpace instance
   * @param {*} defaultPos a function (key, index) to define the default positions of each key points (before data is ready)
   */
  constructor( space, defaultPos=(k, i) => null ) {
    
    this.size = space.size;
    this.offset = Math.abs( this.size.x - this.size.y ) / 2;
    
    this.keys = ["nose", "leftEye", "rightEye", "leftEar", "rightEar", "leftShoulder", "rightShoulder", "leftElbow", "rightElbow", "leftWrist", "rightWrist", "leftHip", "rightHip", "leftKnee", "rightKnee", "leftAnkle", "rightAnkle"];
    this.parts = this.keys.reduce( (a, b, i) => { a[b] = defaultPos( b, i ); return a; }, {} );
    this.uv = {};

    this.headSize = [10];

  }


  /**
   * Crop a video to square size and draw frame in square canvas
   * @param {*} video 
   */
  squareBuffer( video ) {
    var buffer = document.createElement( "canvas" );
    buffer.width = this.size.x;
    buffer.height = this.size.y;
    var vsize = new Pt( Math.min(video.width, video.height), Math.min(video.width, video.height) );
    var offset = new Pt( video.width, video.height ).$subtract( vsize ).divide( 2 );

    return function() {
      buffer.getContext('2d').drawImage( video, offset.x, offset.y, vsize.x, vsize.y, 0, 0, space.size.x, space.size.y );
      return buffer;
    }
  }


  /**
   * 
   * @param {array} keypoints array of keypoint objects, eg, from tensorflow.js
   * @param {*} minConfidence filter only if confidence value > this
   * @param {*} smooth smoothing frames
   */
  update( keypoints, minConfidence=0.0, smooth=true ) {

    for (let i=0, len=keypoints.length; i<len; i++) {    
      let k = keypoints[i];

      if (k.score > minConfidence) {
        let pos = new Pt(k.position.x, k.position.y, k.score).subtract(0, this.offset);
        if (smooth) {
          let last = this.parts[k.part] || new Pt();
          this.parts[k.part] = last.$add( pos ).divide( 2 );
        } else {
          this.parts[k.part] = pos;
        }
      }
    }

    this._updateDirs();

    return this.parts;
  }


  _updateDirs() {
    let p = this.parts;
    this.dirs = {
      left: {
        upperArm: (p.leftShoulder && p.leftElbow) ? p.leftShoulder.$subtract( p.leftElbow ).unit() : new Pt(),
        lowerArm: (p.leftWrist && p.leftElbow) ? p.leftElbow.$subtract( p.leftWrist ).unit() : new Pt(),
        upperLeg: (p.leftHip && p.leftKnee) ? p.leftHip.$subtract( p.leftKnee ).unit() : new Pt(),
        lowerLeg: (p.leftAnkle && p.leftKnee) ? p.leftKnee.$subtract( p.leftAnkle ).unit() : new Pt()
      },
      right: {
        upperArm: (p.rightShoulder && p.rightElbow) ? p.rightShoulder.$subtract( p.rightElbow ).unit() : new Pt(),
        lowerArm: (p.rightWrist && p.rightElbow) ? p.rightElbow.$subtract( p.rightWrist ).unit()  : new Pt(),
        upperLeg: (p.rightHip && p.rightKnee) ? p.rightHip.$subtract( p.rightKnee ).unit() : new Pt(),
        lowerLeg: (p.rightAnkle && p.rightKnee) ? p.rightKnee.$subtract( p.rightAnkle ).unit() : new Pt()
      },
      // shoulder: p.leftShoulder.$subtract( p.rightShoulder ).unit(),
      // head: p.leftEye.$subtract( p.rightEye ).unit(),
    }
  }


  /**
   * Get a keypoint by id (eg, "leftShoulder")
   * @param {*} id 
   */
  at( id ) {
    return this.parts[id];
  } 


  /**
   * Given a list of ids, get an array of keypoints
   * @param {*} ids 
   */
  take( ids ) {
    let g = new Group();
    for (let i=0, len=ids.length; i<len; i++) {
      let p = this.parts[ ids[i] ];
      if (p) g.push( p.clone() );
    }
    return g;
  }


  /**
   * Get an array of points for drawing a body torso
   * @param {*} shoulderScale scale for the shoulders
   * @param {*} hipScale scale for the hips
   */
  body( shoulderScale=20, hipScale=20 ) {
    let la = Geom.perpendicular( this.dirs.left.upperArm );
    let ra = Geom.perpendicular( this.dirs.right.upperArm );
    let lb = Geom.perpendicular( this.dirs.left.upperLeg );
    let rb = Geom.perpendicular( this.dirs.right.upperLeg );

    return new Group(
      this.parts.leftShoulder.$add( la[0].$multiply( shoulderScale ) ),
      this.parts.leftShoulder,
      this.parts.leftHip.$add( lb[0].$multiply( hipScale ) ),
      this.parts.rightHip.$add( rb[1].$multiply( hipScale ) ),
      this.parts.rightShoulder,
      this.parts.rightShoulder.$add( ra[1].$multiply( shoulderScale ) ),
    );
  }


  /**
   * Get a circle to draw the head
   * @param {*} headRatio scale of the head
   * @param {*} smoothStep Optional, if the head position jitters too much, use this to smooth it by averaging n steps. Default is 5.
   */
  head( headRatio=1.2, smoothStep=5 ) {
    let d = this.parts.leftEye.$subtract( this.parts.rightEye );
    let size = Math.max( d.magnitude()*headRatio, 10 );
    
    if (smoothStep > 1) {
      this.headSize.push( size );
      if (this.headSize.length > smoothStep) this.headSize.shift();
      size = this.headSize.reduce( (a, b) => a + b, 0 ) / smoothStep;
    }

    return Circle.fromCenter( this.parts.nose, size );
  }


  /**
   * Get a circle with fixed size to draw the head
   * @param {*} size 
   */
  headFixed( size=30 ) {
    return Circle.fromCenter( this.parts.nose, size );
  }


  /**
   * Get an array of points for drawing shoulder/neck
   * @param {*} shoulderScale scale for the shoulders
   * @param {*} headScale scale for the head
   */
  shoulder( shoulderScale=20, headScale=30 ) {
    let la = Geom.perpendicular( this.dirs.left.upperArm );
    let ra = Geom.perpendicular( this.dirs.right.upperArm );

    return new Group(
      this.parts.nose.$add( 0, headScale ),
      this.parts.leftShoulder.$add( la[0].$multiply( shoulderScale ) ),
      // this.parts.leftShoulder.$add( la[1].$multiply( shoulderScale ) ),
      this.parts.rightShoulder.$add( ra[1].$multiply( shoulderScale ) ),
      // this.parts.rightShoulder.$add( ra[1].$multiply( shoulderScale ) )
    );
  }


  /**
   * Get an array of points for drawing an arm
   * @param {*} key "left" or "right"
   * @param {*} shoulderScale scale for the shoulder
   * @param {*} elbowScale scale for the elbow
   * @param {*} wristScale scale for the wrist
   */
  arm( key="left", shoulderScale=20, elbowScale=10, wristScale=5 ) {

    let elbow = this.parts[`${key}Elbow`];
    let wrist = this.parts[`${key}Wrist`];
    let shoulder = this.parts[`${key}Shoulder`];

    let na = Geom.perpendicular( this.dirs[key].lowerArm );
    let nb = Geom.perpendicular( this.dirs[key].upperArm );

    let part_shoulder = new Group(
      shoulder.$add( nb[0].$multiply( shoulderScale ) ),
      shoulder.$add( nb[1].$multiply( shoulderScale ) ),
      elbow.$add( na[1].$multiply( elbowScale ) ),
      elbow.$add( na[0].$multiply( elbowScale ) ) 
    );

    let part_elbow = new Group(
      elbow.$add( na[0].$multiply( elbowScale ) ),
      elbow.$add( na[1].$multiply( elbowScale ) ),
      wrist.$add( na[1].$multiply( wristScale ) ), 
      wrist.$add( na[0].$multiply( wristScale ) ) 
    );


    return [part_shoulder, part_elbow];
  }

  
  /**
   * Get an array of points for drawing a leg
   * @param {*} key "left" or "right"
   * @param {*} hipScale scale for the hip
   * @param {*} kneeScale scale for the knee
   * @param {*} ankleScale scale for the ankle
   * @param {*} merge if true, merged the parts into one polygon, otherwise return an array of two parts. Default is true.
   */
  leg( key="left", hipScale=20, kneeScale=15, ankleScale=5, merge=true ) {

    let knee = this.parts[`${key}Knee`];
    let ankle = this.parts[`${key}Ankle`];

    let na = Geom.perpendicular( this.dirs[key].lowerLeg );
    let nb = Geom.perpendicular( this.dirs[key].upperLeg );

    let part_hip = new Group(
      this.parts.leftHip.$add( nb[0].$multiply( hipScale ) ),
      this.parts.rightHip.$add( nb[1].$multiply( hipScale ) ),
      knee.$add( na[1].$multiply( kneeScale ) ),
      knee.$add( na[0].$multiply( kneeScale ) ) 
    );

    let part_knee = new Group(
      knee.$add( na[0].$multiply( kneeScale ) ),
      knee.$add( na[1].$multiply( kneeScale ) ),
      ankle.$add( na[1].$multiply( ankleScale ) ), 
      ankle.$add( na[0].$multiply( ankleScale ) ) 
    );

    if (merge) {
      part_hip.pop();
      part_hip.push( part_knee[2], part_knee[3], part_knee[0] );
      return part_hip;
    }

    return [part_hip, part_knee];
  }


  /**
   * Duplicate a series of points in a part
   * @param {*} part 
   * @param {*} count 
   */
  dup( part, count=2 ) {
    for (let i=0; i<count; i++) {
      part.push( part[i] );
    }
    return part;
  }


  /**
   * Get a circle to draw a joint
   * @param {*} id part id
   * @param {*} scale size of the circle
   */
  joint( id, scale ) {
    return this.parts[id] ? Circle.fromCenter( this.parts[id], scale ) : [];
  }


  /**
   * Get an array of body parts to draw a wireframe of the body.
   */
  wireframe() {
    let p = this.parts;
    return [
      new Group( p.leftShoulder, p.rightShoulder, p.rightHip, p.leftHip, p.leftShoulder ),
      new Group( p.leftWrist, p.leftElbow, p.leftShoulder ),
      new Group( p.rightWrist, p.rightElbow, p.rightShoulder ),
      new Group( p.leftHip, p.leftKnee, p.leftAnkle ),
      new Group( p.rightHip, p.rightKnee, p.rightAnkle )
    ]
  }

  
}



/**
 * Given a <video> element, initiate webcam input
 * @param {*} videoElem 
 */
function webcam( videoElem ) {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true }).then(function (stream) {
      try {
        videoElem.srcObject = stream;
        raw = stream;
      } catch (error) {
        videoElem.src = URL.createObjectURL(stream);
      }
      videoElem.play();
    });
  }
}


/**
 * Given a list of time steps, return a function that will return the current scene number
 * @param {array} timesteps a list of time in milliseconds
 */
function scenes( timesteps ) {
  var steps = Array.isArray( timesteps )
    ? timesteps.reduce( (a,b,i) => {a.push( i===0 ? b : a[a.length-1]+b ); return a;}, [] ) 
    : [];

  var total = steps.length;
  var last = 0;
  return function( time ) {
    if (steps.length > 0 && time > steps[0]) last = steps.shift();
    return (steps.length > 0) ? total-steps.length + (time-last)/(steps[0]-last) : total;
  }
}