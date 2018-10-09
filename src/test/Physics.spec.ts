import chai = require('chai');
import mocha = require('mocha');
import {World, Particle, Body} from '../Physics';
import {Polygon} from '../Op';
import {Pt, Group, Bound} from '../Pt';
import {Geom, Num} from '../Num';
import {Util} from '../Util';


var {assert} = chai;
var {describe, it} = mocha;


describe('World: ', () => {

  describe('Bodies: ', () => {
    
    it('can add body', () => {
      let world = new World( Bound.fromGroup( [ new Pt(0,0), new Pt(100,100) ] ), 0.99  );
      let square = Body.fromGroup( Polygon.fromCenter( new Pt(), 10, 4 ) );
      let tri = Body.fromGroup( Polygon.fromCenter( new Pt(), 10, 3 ) );
      world.add( square );
      world.add( tri );
      assert.isTrue( world.particleCount === 0 && world.bodyCount === 2 );
    });


    it('can remove body by index', () => {
      let world = new World( Bound.fromGroup( [ new Pt(0,0), new Pt(100,100) ] ), 0.99  );
      let square = Body.fromGroup( Polygon.fromCenter( new Pt(), 10, 4 ) );
      let tri = Body.fromGroup( Polygon.fromCenter( new Pt(), 10, 3 ) );
      let tri2 = Body.fromGroup( Polygon.fromCenter( new Pt(), 10, 3 ) );

      square.mass = 10;
      tri.mass = 1;
      tri2.mass = 2;

      world.add( square );
      world.add( tri );
      world.add( tri2 );
      world.removeBody( 1 );

      assert.isTrue( world.bodyCount === 2 && world.body(1).mass === 2 );
    });


    it('can remove body by name', () => {
      let world = new World( Bound.fromGroup( [ new Pt(0,0), new Pt(100,100) ] ), 0.99  );
      let square = Body.fromGroup( Polygon.fromCenter( new Pt(), 10, 4 ) );
      let tri = Body.fromGroup( Polygon.fromCenter( new Pt(), 10, 3 ) );
      let tri2 = Body.fromGroup( Polygon.fromCenter( new Pt(), 10, 3 ) );
      square.mass = 10;
      tri.mass = 1;
      tri2.mass = 2;

      world.add( square, "a" );
      world.add( tri, "b" );
      world.add( tri2, "c" );
      world.removeBody( "a" );
      
      let tri3 = Body.fromGroup( Polygon.fromCenter( new Pt(), 10, 3 ) );
      tri3.mass = 3;
      world.add( tri3 );
      
      assert.isTrue( world.bodyCount === 3 && world.body(0).mass === 1 );
    });
  });


  describe('Particles: ', () => {

    it('can add particles', () => {
      let world = new World( Bound.fromGroup( [ new Pt(0,0), new Pt(100,100) ] ), 0.99  );
      for (let i=0; i<10; i++) {
        world.add( new Particle( new Pt() ).size( i ) );
      }
      assert.isTrue( world.particleCount === 10 && world.bodyCount === 0 );
    });

    
    it('can remove particles by index', () => {
      let world = new World( Bound.fromGroup( [ new Pt(0,0), new Pt(100,100) ] ), 0.99  );
      for (let i=0; i<10; i++) {
        world.add( new Particle( new Pt() ).size( i ) );
      }
      world.removeParticle(4);

      let acc = 0; 
      for (let i=0, len=world.particleCount; i<len; i++) {
        acc += world.particle(i).radius;
      }

      assert.isTrue( world.particleCount === 9 && acc === 41 );
    });


    it('can remove particles by name', () => {
      let world = new World( Bound.fromGroup( [ new Pt(0,0), new Pt(100,100) ] ), 0.99  );
      for (let i=0; i<10; i++) {
        world.add( new Particle( new Pt() ).size( i ), "pa"+i );
      }
      world.removeParticle( "pa6");
      world.removeParticle( "pa2");
      world.removeParticle( "pa9");
      world.add( new Particle( new Pt() ).size( 100 ) );

      let acc = 0; 
      for (let i=0, len=world.particleCount; i<len; i++) {
        acc += world.particle(i).radius;
      }

      assert.isTrue( world.particleCount === 8 && acc === 128 );
    });
  });

});