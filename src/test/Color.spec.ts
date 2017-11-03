import chai = require('chai');
import mocha = require('mocha');
import {Pt, Group} from '../Pt';
import {Geom, Num} from '../Num';
import {Color} from '../Color';

var {assert} = chai;
var {describe, it} = mocha;

describe('Color: ', function() {

  describe('fromHex: ', function() {
    it('works with explicit hash in input string', function() {
      const actual = Color.fromHex("#FFFF00");
      const expected = [255, 255, 0];
      assert.isTrue( actual.equals(expected));
      // assert.equal( [actual.r,actual.g, actual.b], expected );
    });

    it('works without explicit hash in input string', function() {
      const actual = Color.fromHex("FFFF00");
      const expected = [255, 255, 0];
      assert.isTrue( actual.equals(expected));
    });

    it('works with all character cases', function() {
      const actual = Color.fromHex("FffF00");
      const expected = [255, 255, 0];
      assert.isTrue( actual.equals(expected));
    });

    it('works with short form', function() {
      const actual = Color.fromHex("FF0");
      const expected = [255, 255, 0];
      assert.isTrue( actual.equals(expected));
    });
  });

});