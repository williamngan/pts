import chai = require('chai');
import mocha = require('mocha');
import {Pt} from '../Pt';
import {Const, Util} from '../Util';
import {Num, Geom} from '../Num';
import {Line} from '../Op';

var {assert} = chai;
var {describe, it} = mocha;


describe('Util: ', function() {

  describe('Const: ', function() {
    it('can convert radian', function() {
      assert.equal( Const.deg_to_rad*30, 30*Math.PI/180 );
    });

    it('can convert angle', function() {
      assert.equal( Const.rad_to_deg*Math.PI/4, 45 );
    });
  });

  describe('Util: ', function() {

    it('can getArgs with list of numbers', function() {
      let c = Util.getArgs( [1,2,3] )
      assert.equal( c[1], 2 );
    });

    it('can getArgs with array', function() {
      let c = Util.getArgs( [[1,2,3,4,5]] );
      assert.equal( c[4], 5 );
    });

    it('can getArgs with Pt like object', function() {
      let c = Util.getArgs( [{x:1, y:2, z:3, w:4}] );
      assert.equal( c[3], 4 );
    });

    let group = [1,2,3,4,5,6,7];
    
    it('can split an array with size only', function() {
      let g = Util.split( group, 2);
      assert.equal( g[2][0], 5 );
    });

    it('can split an array with size and stride 1', function() {
      let g = Util.split( group, 2, 1);
      assert.equal( g[5][1], 7 );
    });

    it('can split an array with size and stride 4', function() {
      let g = Util.split( group, 3, 4);
      assert.equal( g[1][2], 7 );
    });

    it('can create and run a stepper', function() {
      let g = Util.stepper( 50, 0, 3 );
      let c = 0;
      for (let i=0; i<61; i++) {
        c = g();
      }
      assert.equal( c, 33 );
    });

    it('can loop with a range', function() {
      let k = 0;
      let f = (i) => {
        k += i;
        return {id: `id${i}`, value:i*2}
      };
      let g = Util.forRange( f, 100 );
      assert.isTrue( g[12].id == "id12" && k === 4950 );
    })

  });

});