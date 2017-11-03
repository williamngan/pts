import 'mocha';
import { assert } from 'chai';
import { Color } from '../Color';

describe('Color: ', function() {

  describe('fromHex: ', function() {
    it('works with explicit hash in input string', function() {
      const actual = Color.fromHex("#FFFF00");
      const expected = [255, 255, 0];
      assert.isTrue( actual.equals(expected));
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