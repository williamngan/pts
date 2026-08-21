// Source code licensed under Apache License 2.0. 
// Copyright © 2017 William Ngan. (https://github.com/williamngan/pts)

window.demoDescription = "In a field of bouncing particles, rotate a centered path that nudges points as it sweeps past.";

(function() {

  Pts.namespace( this );
  var space = new CanvasSpace("#pt").setup({bgcolor: "#123", resize: true, retina: true});
  var form = space.getForm();


  //// Demo code ---

  var particles = new Group();
  var world = null;
  var pointerParticle = null;
  var pointerActive = false;
  var pointerPosition = new Pt();
  var pointerDirection = new Pt();
  var center = new Pt();
  var dividerDirection = new Pt();
  var previousDividerDirection = new Pt();
  var nextDividerDirection = new Pt();
  var particleOffset = new Pt();
  var dividerImpulse = new Pt();
  var canvasOffset = new Pt();
  var resizeTimeoutId = -1;
  var header = null;
  var headerOffset = null;
  var connectorFadeDistance = 1;
  var collisionRadius = 20;
  var pointerRadius = 30;
  var initialDividerRotation = 30 * Const.one_degree;
  var flashDuration = 500;
  var flashDebounceDuration = 30;
  var flashMinRadius = 4;
  var flashMaxRadius = 6;
  var particleMaxOpacity = 0.6;
  var dividerHitStrength = 0.25;
  var dividerMaxImpulse = 6;
  var dividerRotationThreshold = 0.0005;
  var baseMaxParticles = 200;
  var particleCountMultiplier = 1.3;
  var particleColors = ["#f03", "#09f", "#0c6"];
  var particleColorGroups = particleColors.map( () => new Group() );
  var flashingParticles = new Group();
  var connectorLine = new Group( new Pt(), new Pt() );
  var animationTime = 0;

  class FlashParticle extends Particle {
    constructor( point ) {
      super( point );
      this.flashUntil = 0;
      this.flashLastHitAt = -Infinity;
      this.flashRadius = flashMinRadius;
    }

    triggerFlash() {
      if (this === pointerParticle) return;

      var timeSinceLastHit = animationTime - this.flashLastHitAt;
      this.flashLastHitAt = animationTime;
      if (
        this.flashUntil > animationTime ||
        timeSinceLastHit < flashDebounceDuration
      ) return;

      this.flashRadius = Num.randomRange( flashMinRadius, flashMaxRadius );
      this.flashUntil = animationTime + flashDuration;
    }

    collide( other, damping ) {
      if (
        !pointerActive &&
        (this === pointerParticle || other === pointerParticle)
      ) return;

      var dx = this[0] - other[0];
      var dy = this[1] - other[1];
      var collisionDistance = this.radius + other.radius;
      if (dx * dx + dy * dy >= collisionDistance * collisionDistance) return;

      this.triggerFlash();
      other.triggerFlash();
      super.collide( other, damping );
    }
  }

  var hitParticlesWithDivider = (rotation) => {
    if (!world || Math.abs(rotation) < dividerRotationThreshold) return;

    for (var i = 1, len = particles.length; i < len; i++) {
      var particle = particles[i];
      var offset = particleOffset.to( particle ).subtract( center );
      var previousDistance = offset.$cross2D( previousDividerDirection );
      var distance = offset.$cross2D( dividerDirection );
      var crossedDivider = previousDistance * distance <= 0;
      var withinCollisionRadius = Math.min(
        Math.abs(previousDistance),
        Math.abs(distance)
      ) <= particle.radius;

      if (crossedDivider || withinCollisionRadius) {
        var impulse = Num.clamp(
          offset.dot( dividerDirection ) * rotation * dividerHitStrength,
          -dividerMaxImpulse,
          dividerMaxImpulse
        );
        if (Math.abs(impulse) <= 0.01) continue;

        dividerImpulse.to( -dividerDirection.y, dividerDirection.x ).multiply( impulse );
        particle.hit( dividerImpulse );
        particle.triggerFlash();
      }
    }
  };

  var updateDivider = (hitParticles = false) => {
    var hasPreviousDirection = dividerDirection.magnitudeSq() > 0;
    if (hasPreviousDirection) previousDividerDirection.to( dividerDirection );

    var direction = pointerDirection.to( pointerPosition ).subtract( center );
    var pointerDistanceSq = direction.magnitudeSq();
    if (pointerDistanceSq < Const.epsilon) {
      // The pointer angle is undefined at center. Keep the current divider
      // there, using 30° only for its initial orientation.
      if (hasPreviousDirection) {
        nextDividerDirection.to( dividerDirection );
      } else {
        nextDividerDirection.toAngle( initialDividerRotation, 1 );
      }
    } else {
      nextDividerDirection
        .to( -direction.y, direction.x )
        .unit( Math.sqrt(pointerDistanceSq) );
    }

    var rotation = 0;
    if (hasPreviousDirection) {
      if (previousDividerDirection.dot( nextDividerDirection ) < 0) {
        nextDividerDirection.multiply( -1 );
      }
      rotation = Math.atan2(
        previousDividerDirection.$cross2D( nextDividerDirection ),
        previousDividerDirection.dot( nextDividerDirection )
      );
    }

    dividerDirection.to( nextDividerDirection );
    if (hitParticles) hitParticlesWithDivider( rotation );
  };

  var movePointer = (px, py) => {
    pointerPosition.to( px, py );
    updateDivider( true );
    pointerActive = true;
    if (pointerParticle) pointerParticle.position = pointerPosition;
  };

  var deactivatePointer = () => {
    pointerActive = false;
  };

  var movePointerOverHeader = (event) => {
    // A fixed overlay can receive a zero-delta move when it mounts beneath a
    // stationary cursor. Preserve the 30° startup state until the cursor moves.
    if (!pointerActive && event.movementX === 0 && event.movementY === 0) return;

    var px = event.pageX - canvasOffset.x;
    var py = event.pageY - canvasOffset.y;
    if (
      !Num.within(px, 0, space.width) ||
      !Num.within(py, 0, space.height)
    ) return;
    movePointer( px, py );
  };

  var updateHeaderPosition = () => {
    if (!header) return;

    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var nextHeaderOffset = Math.min( 0, space.height - 150 - scrollTop );
    if (nextHeaderOffset !== headerOffset) {
      header.style.transform = `translateY(${nextHeaderOffset}px)`;
      headerOffset = nextHeaderOffset;
    }
  };

  var updateCanvasGeometry = (bound) => {
    canvasOffset.to( bound[0] );
    center = space.center;
    connectorFadeDistance = Math.max( center.x, 1 );
  };

  var calculateParticleCount = () => {
    var collisionDiameter = collisionRadius * 2;
    var baseParticleCount = Num.clamp(
      Math.floor( space.width * space.height / (collisionDiameter * collisionDiameter * 3) ),
      32,
      baseMaxParticles
    );
    return Math.round( baseParticleCount * particleCountMultiplier );
  };

  var addParticle = (particle) => {
    var colorIndex = particles.length % particleColors.length;
    particleColorGroups[colorIndex].push( particle );
    particles.push( particle );
    world.add( particle );
  };

  var createWorld = () => {
    var bound = space.innerBound;
    world = new World( bound, 1, 0 );
    world.damping = 1;

    var particleCount = calculateParticleCount();
    var points = Create.distributeRandom( bound, particleCount - 1 );
    var initialImpulse = new Pt();
    particles.length = 0;
    flashingParticles.length = 0;
    for (var colorIndex = 0; colorIndex < particleColorGroups.length; colorIndex++) {
      particleColorGroups[colorIndex].length = 0;
    }

    pointerParticle = new FlashParticle( pointerPosition ).size( pointerRadius );
    pointerParticle.lock = true;
    addParticle( pointerParticle );

    for (var i = 0, len = points.length; i < len; i++) {
      var angle = Num.randomRange( 0, Const.two_pi );
      var speed = Num.randomRange( 2.5, 5 );
      var particle = new FlashParticle( points[i] ).size( collisionRadius );
      particle.hit( initialImpulse.toAngle(angle, speed) );
      addParticle( particle );
    }
  };


  space.add({ 

    start:(bound) => {
      updateCanvasGeometry( bound );
      pointerPosition.to( center );
      updateDivider();
      createWorld();
      header = document.getElementById("header");
      if (header) {
        space.bindCanvas( "pointermove", movePointerOverHeader, {}, header );
        space.bindCanvas( "pointerleave", deactivatePointer, {}, header );
        space.bindDoc( "scroll", updateHeaderPosition, {passive: true} );
        updateHeaderPosition();
      }
    }, 

    animate: (time, ftime) => {
      animationTime = time;
      world.update( ftime );
      // A locked particle can be displaced by the final collision substep. Draw it at
      // the actual pointer position while preserving the collision response on others.
      pointerParticle.to( pointerPosition );

      // Anchor the divider at center and keep it perpendicular to the pointer angle.
      // Reuse a Pt as the offset/projection buffer to keep this per-frame loop allocation-free.
      flashingParticles.length = 0;

      form.strokeOnly( "#fff" );
      for (var i = 0, len = particles.length; i < len; i++) {
        var p = particles[i];
        var offset = particleOffset.to( p ).subtract( center );
        var distance = Math.abs( offset.$cross2D( dividerDirection ) );
        var ratio = Num.clamp( 1 - distance / connectorFadeDistance, 0, 1 );

        if (ratio > 0) {
          var projectionLength = offset.dot( dividerDirection );
          connectorLine[0] = p;
          connectorLine[1]
            .to( dividerDirection )
            .multiply( projectionLength )
            .add( center );
          form.alpha( ratio ).stroke( "#fff", ratio * 2 ).line( connectorLine );
        }

        if (p.flashUntil > time) flashingParticles.push( p );
      }

      form.alpha( particleMaxOpacity );
      for (var colorIndex = 0; colorIndex < particleColorGroups.length; colorIndex++) {
        form.fillOnly( particleColors[colorIndex] ).points( particleColorGroups[colorIndex], 1.5, "circle" );
      }

      // Draw flashes last so they sit above the color dots, then shrink them
      // concentrically as they fade.
      form.fillOnly( "#fff" );
      for (var flashIndex = 0; flashIndex < flashingParticles.length; flashIndex++) {
        var flashingParticle = flashingParticles[flashIndex];
        var flashProgress = Num.clamp(
          1 - (flashingParticle.flashUntil - time) / flashDuration,
          0,
          1
        );
        var flashLife = 1 - Shaping.quadraticIn( flashProgress );
        form.alpha( particleMaxOpacity * flashLife ).point(
          flashingParticle,
          flashingParticle.flashRadius * flashLife,
          "circle"
        );
      }
      form.alpha( 1 );

    },

    action: (type, px, py, event) => {
      // A mouse remains over the canvas after a drag ends. Touch and pen input
      // do not, so their drop should remove the collider until the next contact.
      if (
        type === "out" ||
        (type === "drop" && event && event.pointerType !== "mouse")
      ) {
        deactivatePointer();
      } else if (type === "move" || type === "drag" || type === "down" || type === "over") {
        movePointer( px, py );
      }
    },

    resize: (bound) => {
      if (!world) return;
      updateCanvasGeometry( bound );
      world.bound = space.innerBound;
      if (!pointerActive && pointerParticle) {
        pointerPosition.to( center );
        pointerParticle.position = pointerPosition;
      }
      updateDivider();
      updateHeaderPosition();
      clearTimeout( resizeTimeoutId );
      resizeTimeoutId = setTimeout( () => {
        if (world.particleCount !== calculateParticleCount()) createWorld();
      }, 500 );
    }

  });
  
  //// ----
  

  space.bindMouse().bindTouch().play();

})();
