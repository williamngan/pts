import chai = require('chai');
import mocha = require('mocha');
import Pt from '../Pt';

var {assert} = chai;
var {describe, it} = mocha;
var p = new Pt(10,22,3);

console.log("----",p, p.get(1));

describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal(22, p.get(1));
    });
  });
});