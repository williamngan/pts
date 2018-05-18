
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


class BodyPose {
  constructor( space, defaultPos=(k, i) => null ) {
    
    this.size = space.size;
    this.offset = Math.abs( this.size.x - this.size.y ) / 2;
    
    this.keys = ["nose", "leftEye", "rightEye", "leftEar", "rightEar", "leftShoulder", "rightShoulder", "leftElbow", "rightElbow", "leftWrist", "rightWrist", "leftHip", "rightHip", "leftKnee", "rightKnee", "leftAnkle", "rightAnkle"];
    this.parts = this.keys.reduce( (a, b, i) => { a[b] = defaultPos( b, i ); return a; }, {} );
    this.uv = {};

    this.headSize = [10];

  }

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

  update( keypoints, minConfid=0.1, smooth=true ) {

    for (let i=0, len=keypoints.length; i<len; i++) {    
      let k = keypoints[i];

      if (k.score > minConfid) {
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

  at( id ) {
    return this.parts[id];
  } 

  take( ids ) {
    let g = new Group();
    for (let i=0, len=ids.length; i<len; i++) {
      let p = this.parts[ ids[i] ];
      if (p) g.push( p.clone() );
    }
    return g;
  }


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

  head( headRatio=1.2, smooth=true ) {
    let d = this.parts.leftEye.$subtract( this.parts.rightEye );
    let size = Math.max( d.magnitude()*headRatio, 10 );
    
    if (smooth) {
      this.headSize.push( size );
      if (this.headSize.length > 5) this.headSize.shift();
      size = this.headSize.reduce( (a, b) => a + b, 0 ) / 5;
    }

    return Circle.fromCenter( this.parts.nose, size );
  }

  headFixed( size=30 ) {
    return Circle.fromCenter( this.parts.nose, size );
  }

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


  dup( part, count=2 ) {
    for (let i=0; i<count; i++) {
      part.push( part[i] );
    }
    return part;
  }

  joint( id, scale ) {
    return this.parts[id] ? Circle.fromCenter( this.parts[id], scale ) : [];
  }

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