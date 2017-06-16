import chai = require('chai');
import mocha = require('mocha');
import {Pt} from '../Pt';

var {assert} = chai;
var {describe, it} = mocha;


describe('Pt: ', () => {

  describe('Constructor: ', () => {
    it('can init multi-dimensions', () => {
      assert.equal( 6, new Pt(1,2,3,4,5,6).length )
    });

    it('can init in 1 dimensions', () => {
      assert.equal( 1, new Pt(10).length )
    });

    it('should init with positional arguments', () => {
      let p1 = new Pt(10,100,1000,10000);
      let p2 = new Pt(11,111,1111);
      let p3 = new Pt(22,222);
      let p4 = new Pt(3);
      assert.equal(11346, p1[0] + p1[3] + p2[2] + p3[1] + p4[0]);
    });

    it('should init with IPt-like object', () => {
      let p1 = new Pt({x:10,y:100,z:1000,w:10000});
      let p2 = new Pt({x:11,y:111,z:1111});
      let p3 = new Pt({x:22,y:222});
      let p4 = new Pt({x:3});
      assert.equal(11346, p1[0] + p1[3] + p2[2] + p3[1] + p4[0]);
    });

    it('should init with Pt object', () => {
      let p = new Pt( new Pt(1,2,3,4,5,6) );
      assert.equal( 15, p[0]+p[1]+p[2]+p[3]+p[4] );
    });

  
    it('should init with Array of numbers', () => {
      let p1 = new Pt([10,100,1000,10000]);
      let p2 = new Pt([11,111,1111]);
      let p3 = new Pt([22,222]);
      let p4 = new Pt([3]);
      assert.equal(11346, p1[0] + p1[3] + p2[2] + p3[1] + p4[0]);
    });

  });

  describe('Functions: ', () => {

    it('can check size of vector', () => {
      let p = new Pt([1,2,3,4,5,6]);
      assert.equal( 6, p.length );
    });

    it('can add with different args', () => {
      let p = new Pt({x:1,y:2,z:3}).add([1,1,1]).add(2,2,2).add(new Pt(3,4,5));
      assert.isTrue( p.$add(1,2,3).$add([2, 4, 0]).equals( new Pt(10, 15, 14) ) );
    });

    it('can subtract with different args', () => {
      let p = new Pt({x:19,y:18,z:7}).subtract([5,4,3]).subtract(2,2,2).subtract(new Pt(1,1,1));
      assert.isTrue( p.$subtract(1,-1,1).$subtract([5, 7, 0]).equals( new Pt(5, 5, 0) ) );
    });

    it('can support for-of loop', () => {
      let p = new Pt([1,2,3,4,5,6]);
      let d = 0;
      for (let k of p) {
        d += k
      }
      assert.equal( d, 21 );
    });


    it('can concat with another Pt or array', () => {
      let p = new Pt(1,2,3).$concat([2,3]).$concat(new Pt(10, 20, 30, 40));
      assert.equal( p.length, 9 );
    })

    it('can get a slice of values', () => {
      let p = new Pt(1,2,3,4,5,6);
      assert.isTrue( p.$slice(2,5).equals( new Pt(3,4,5) ) );
      assert.isTrue( true );
    })

    it('can get a unit vector', () => {
      let p = new Pt(123,3453,293);
      assert.equal( p.unit().magnitude(), 1 );
    })

  });

});
