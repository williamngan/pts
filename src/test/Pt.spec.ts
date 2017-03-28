import chai = require('chai');
import mocha = require('mocha');
import Pt from '../Pt';

var {assert} = chai;
var {describe, it} = mocha;


describe('Pt', function() {
  describe('#constructor()', function() {
    it('can init as empty vector', function() {
      assert.equal( 0, new Pt().dims )
    });

    it('should init with positional arguments', function() {
      let p1 = new Pt(10,100,1000,10000);
      let p2 = new Pt(11,111,1111);
      let p3 = new Pt(22,222);
      let p4 = new Pt(3);
      assert.equal(11346, p1.get(0) + p1.get(3) + p2.get(2) + p3.get(1) + p4.get(0));
    });

    it('should init with IPt-like object', function() {
      let p1 = new Pt({x:10,y:100,z:1000,w:10000});
      let p2 = new Pt({x:11,y:111,z:1111});
      let p3 = new Pt({x:22,y:222});
      let p4 = new Pt({x:3});
      assert.equal(11346, p1.get(0) + p1.get(3) + p2.get(2) + p3.get(1) + p4.get(0));
    });

    it('should init with Array of numbers', function() {
      let p1 = new Pt([10,100,1000,10000]);
      let p2 = new Pt([11,111,1111]);
      let p3 = new Pt([22,222]);
      let p4 = new Pt([3]);
      assert.equal(11346, p1.get(0) + p1.get(3) + p2.get(2) + p3.get(1) + p4.get(0));
    });

    it('can init with default values when using data object or array', function() {
      let p1 = new Pt([], 3);
      let p2 = new Pt({y:10}, 100);
      assert.equal(116, p1.get(0) + p1.get(3) + p2.get(2) + p2.get(1));
    });


  });
});