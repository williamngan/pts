import chai = require('chai');
import mocha = require('mocha');
import {Pt, Group} from '../Pt';
import {Util} from '../Util';
import {Vec, Mat} from '../LinearAlgebra';
import {Num, Geom} from '../Num';

var {assert} = chai;
var {describe, it} = mocha;


describe('Linear Algebra: ', function() {

  describe('Vector operations: ', function() {

    it('can add vector with a scalar', function() {
      let p = [5,4,3,2,1];
      Vec.add( p, 5 );;
      assert.isTrue( p[0] === 10 && p[4] === 6 );
    });

    it('can add vector with a vector', function() {
      let p = [5,4,3,2,1];
      Vec.add( p, [2,3,4] );
      assert.isTrue( p[0] === 7 && p[2] === 7 && p[4] === 1 );
    });

    it('can subtract vector with a scalar', function() {
      let p = [5,4,3,2,1];
      Vec.subtract( p, 2 );
      assert.isTrue( p[0] === 3 && p[4] === -1 );
    });
    
    it('can subtract vector with a vector', function() {
      let p = [5,4,3,2,1];
      Vec.subtract( p, [2,3,4] );
      assert.isTrue( p[0] === 3 && p[2] === -1 && p[4] === 1 );
    });

    it('can multiply vector with a scalar', function() {
      let p = [5,4,3,2,1];
      Vec.multiply( p, 5 );;
      assert.isTrue( p[0] === 25 && p[4] === 5 );
    });

    it('can multiply vector with a vector', function() {
      let p = [5,4,3,2,1];
      Vec.multiply( p, [2,3,4,1,1] );
      assert.isTrue( p[0] === 10 && p[2] === 12 && p[4] === 1 );
    });

    it('can divide vector with a scalar', function() {
      let p = [5,4,3,2,1];
      Vec.divide( p, 5 );;
      assert.isTrue( p[0] === 1 && p[4] === 0.2 );
    });

    it('can divide vector with a vector', function() {
      let p = [5,4,3,2,5];
      Vec.divide( p, [5,2,4,1,1] );
      assert.isTrue( p[0] === 1 && p[1] === 2 && p[4] === 5 );
    });

    it('can calculate dot product', function() {
      assert.equal( Vec.dot( [5,4,3,2], [1,2,3,4] ), 30 );
    });

    it('can calculate cross product', function() {
      let c = Vec.cross( [3,-3,1], [4,9,2] );
      assert.isTrue( c[0] === -15 && c[1] === -2 && c[2] === 39 );
    });

    it('can calculate magnitude', function() {
      assert.isTrue( Num.equals( Vec.magnitude( [2,3,4] ), 5.3851648 ) );
    });

    it('can calculate unit vector', function() {
      let c = Vec.magnitude( Vec.unit( [3,4,1,2]) );
      assert.isTrue( Num.equals(c, 1) );
    });

    it('can convert to absolute values', function() {
      let c = Vec.abs( [-1, -999, 2] );
      assert.isTrue( new Pt(1,999,2).equals( c ) );
    });

    it('can convert to floor values', function() {
      let c = Vec.floor( [1.01, 55.91] );
      assert.isTrue( new Pt(1,55).equals( c ) );
    });

    it('can convert to ceil values', function() {
      let c = Vec.ceil( [1.01, 55.91] );
      assert.isTrue( new Pt(2,56).equals( c ) );
    });

    it('can convert to round values', function() {
      let c = Vec.round( [1.01, 55.91] );
      assert.isTrue( new Pt(1,56).equals( c ) );
    });

    it('can find max value in dimensions', function() {
      let c = Vec.max( [5,7,-1,3,7] );
      assert.isTrue( c.value === 7 && c.index === 4 );
    });
    
    it('can find min value in dimensions', function() {
      let c = Vec.min( [5,7,-1,3,7] );
      assert.isTrue( c.value === -1 && c.index === 2 );
    });

    it('can sum all dimensional values', function() {
      let c = Vec.sum( [5,7,-1,3,7] );
      assert.equal( c, 21 );
    });

    it('can map a custom function', function() {
      let c = Vec.map( [5,7,-1,3,7], (n, i) => n*(i+1) );
      assert.isTrue( c[0] === 5 && c[1] === 14 && c[4] === 35 );
    });

  });


  describe('Transform matrices: ', function() {

    it(`can multiply matrix with a scalar`, function() {
      let m = Mat.multiply( [ new Pt(1,2,3), new Pt(20,2,1) ], 10 );
      assert.isTrue( m[0].equals( [10, 20, 30] ), m[1].equals( [200, 20, 10] ) );
    }); 

    it(`can multiply matrices element-wise`, function() {
      let m = Mat.multiply( [ new Pt(1,2,3), new Pt(20,2,1) ], [ new Pt(3,2,10), new Pt(1,2,2) ], false, true );
      assert.isTrue( m[0].equals( [3, 4, 30] ), m[1].equals( [ 20, 4, 2] ) );
    }); 

    it('can calculate a 2D transform', function() {
      let m = Mat.transform2D( [1,2], [[1,0,0],[2,2,0],[10,10,1]] );
      assert.isTrue( m.equals( [ 15, 14 ], 0.0001 ) );
    });


    it('can get a scale2D matrix', function() {
      let m = Num.sum( Mat.scale2DMatrix( 0.5, 2 ) );
      assert.isTrue( m.equals( [0.5,2,1], 0.00001) );
    });

    it('can get a rotate2D matrix', function() {
      let cos =  Math.cos( Math.PI/3 );
      let sin = Math.sin( Math.PI/3 );
      let m = Num.sum( Mat.rotate2DMatrix( cos, sin ) );
      assert.isTrue( m.equals( [cos-sin, sin+cos, 1], 0.00001 ) );
    });

    it('can get a shear2D matrix', function() {
      let m = Num.sum( Mat.shear2DMatrix( 0.1, 0.3 ) );
      assert.isTrue( m.equals( [1.3, 1.1, 1], 0.0001 ) );
    });

    it('can get a translate2D matrix', function() {
      let m = Num.sum( Mat.translate2DMatrix( 10, 11 ) );
      assert.isTrue( m.equals( [11,12,1], 0.0001 ) );
    });

    it('can get a scale2D matrix from anchor', function() {
      let m = Num.sum( Mat.scaleAt2DMatrix( 0.5, 2, [10,9] ) );
      assert.isTrue( m.equals( [5.5,-7,1], 0.00001) );
    });

    it('can get a rotate2D matrix from anchor', function() {
      let cos =  Math.cos( Math.PI/3 );
      let sin = Math.sin( Math.PI/3 );
      let m = Num.sum( Mat.rotateAt2DMatrix( cos, sin, [10,9] ) );
      let result = [
        4.999999999999999 + 7.794228634059947 + cos - sin,
        4.4999999999999999 - 8.660254037844386 + sin + cos,
        1
      ];
      assert.isTrue( m.equals( result, 0.00001) );
    });

    it('can get a shear2D matrix from anchor', function() {
      let m = Num.sum( Mat.shearAt2DMatrix( 0.1, 0.3, [10, 9] ) );
      assert.isTrue( m.equals( [1.3 - 2.7, 1.1 - 1, 1], 0.0001 ) );
    });

    it('can reflect a group in 2D', function() {
      let ps = [new Pt(218, 454), new Pt( 218, 404) ];
      let reflect = Group.fromArray( [[230, 497], [268, 454]] )
      Geom.reflect2D( ps, reflect );
      assert.isTrue( Num.equals(ps[0].x, 274.14938) &&  Num.equals(ps[1].y, 497.4710) );
    });

    it('can reflect a group in 2D when there is no y-intercept', function() {
      let ps = [new Pt(218, 454), new Pt( 250, 404) ];
      let reflect = Group.fromArray( [[230, 497], [230, 454]] )
      Geom.reflect2D( ps, reflect );
      assert.isTrue( Num.equals(ps[0].x, 242) &&  Num.equals(ps[1].x, 210) );
    });

    

  });

});