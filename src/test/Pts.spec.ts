import chai = require('chai');
import mocha = require('mocha');
import {Pt} from '../Pt';
import {Util} from '../Util';

var {assert} = chai;
var {describe, it} = mocha;


describe('Pt collections: ', function() {

  describe('Zipping: ', function() {
    
    it('can split an array into chunks', function() {
      let ps = Util.split([1,2,3,4,5,6,7,8,9,10], 3);
      assert.isTrue( ps[2][2] === 9 && ps[2].length == 3 ) && ps.length == 4;
    });

  });

});
