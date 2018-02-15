import chai = require('chai');
import mocha = require('mocha');
import {Pt, Group} from '../Pt';
import {Util} from '../Util';
import {Num, Geom} from '../Num';
import {Line, Polygon} from '../Op';

var {assert} = chai;
var {describe, it} = mocha;


describe('Op: ', function() {

  describe('Line: ', function() {

    it('find slope', function() {
      assert.isTrue( Num.equals( Line.slope([3,-2], [9,2]), 2/3 ) );
    });

    it('find x-intercept', function() {
      let intercept = Line.intercept([7,3], [3,-4]);
      assert.isTrue( Num.equals( intercept.xi, 37/7 ) );
    });

    it('find y-intercept', function() {
      let intercept = Line.intercept([6,4], [2,2]);
      assert.isTrue( Num.equals( intercept.yi, 1 ) );
    });

    it('can check collinearity up to 3D', function() {
      assert.isTrue( Line.collinear( [2,4,0], [4,6,2], [6,8,4] ) );
    });

    it('can find Pt on a line that is perpendicular to a target Pt', function() {
      let ln = Group.fromArray([[368,654], [418,514]]);
      let p = Line.perpendicularFromPt( ln, [358, 474] );
      assert.isTrue( Num.equals( p.x, 423.8823547363281 ) );
    });

    it('can find Pt on a line that is perpendicular to a target Pt', function() {
      let ln = Group.fromArray([[368,654], [418,514]]);
      assert.isTrue( Num.equals( Line.distanceFromPt( ln, [392, 446] ), 47.356164440736634 ) );
    });

    it('can check 2D ray intersection', function() {
      let r1 = Group.fromArray([[5, 4.5], [10, 2]]);
      let r2 = Group.fromArray([[0, 3], [-4, -5]]);
      assert.isTrue( Line.intersectRay2D(r1, r2).equals([1.6, 6.2]) );
    });

    it('can check 2D ray intersection with line segment', function() {
      let r1 = Group.fromArray([[5, 4.5], [10, 2]]);
      let r2 = Group.fromArray([[0, 3], [-4, -5]]);
      assert.isTrue( !Line.intersectLineWithRay2D(r1, r2) );
    });

    it('can check 2D line segment intersection', function() {
      let r1 = Group.fromArray([[0, 0], [60, 160]]);
      let r2 = Group.fromArray([[0, 80], [80, 0]]);
      assert.isTrue( Line.intersectLine2D(r1, r2).equals([21.81818181, 58.1818199], 0.00001) );
    });

    it('can check 2D grid intersection with ray', function() {
      let g = Group.fromArray([[368, 654], [296, 579]]);
      let d = Line.intersectGridWithRay2D( g, [268, 454] );
      assert.isTrue( Num.equals( d[0].x, 176) && Num.equals( d[1].y, 549.83331) );
    });

    it('can check 2D grid intersection with line', function() {
      let g = Group.fromArray([[368, 654], [221, 533]]);
      let d = Line.intersectGridWithLine2D( g, [268, 454] );
      assert.isTrue( d.length === 1 && Num.equals( d[0].y, 571.6870727) );
    });

    it('can interpolate sub-points on a line', function() {
      let g = Line.subpoints( [[10, 10], [100, 100]], 8 );
      assert.isTrue( g.length === 8 && g[1].y === 30 && g[3].x === 50 );
    });

  });

  describe('Polygon: ', function() {
    it('can calculate area of a convex polygon', function() {
      let g = Group.fromArray([ [2.66, 4.71], [5, 3.5], [3.63, 2.52], [4, 1.6], [1.9, 1], [0.72, 2.28] ]);
      assert.isTrue( Num.equals( Polygon.area( g ), 8.3593, 0.0001 ) );
    });

    it('can calculate perimeter of a polygon', function() {
      let g = Group.fromArray([ [-3, 0], [2, 4], [3, 1], [-4, -3] ]);
      assert.isTrue( Num.equals( Polygon.perimeter( g, true ).total, 20.789, 0.001 ) );
    });


  });
});
