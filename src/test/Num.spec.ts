import chai = require('chai');
import mocha = require('mocha');
import {Pt, Group} from '../Pt';
import {Util} from '../Util';
import {Num, Geom, Range} from '../Num';

var {assert} = chai;
var {describe, it} = mocha;

describe('Num: ', function() {

  describe('Num: ', function() {
      
    it('can calculate linear interpolation', function() {
      assert.isTrue( Math.abs(Num.lerp(1, 3, 0.2)-1.4) < 0.0001 );
    });

    it('can bound a value', function() {
      assert.equal( Num.boundValue(105, 11, 100), 16 );
    });

    it('can bound angle', function() {
      assert.equal( Num.boundValue(105, 11, 100), 16 );
    });

    it('can check if a value is within a range set by two values', function() {
      assert.isTrue( Num.within( -3.001, 1, -3.001 ) && !Num.within( 3.1, -100, 3.099 ) );
    });

    it('can normalize a value', function() {
      assert.equal( Num.normalizeValue( 15, 10, 110), 0.05 );
    });
    
    it('can map value to a new range', function() {
      assert.equal( Num.mapToRange( 0.32, 1, 0, 0, 100), 32 );
    });

    it('can sum a list of Pts', function() {
      let p = Num.sum( [new Pt(1,3,5,7), new Pt(2,4,6,8), new Pt(5,10,15,20)] );
      assert.isTrue( p.equals( new Pt(8, 17, 26, 35) ) );
    });

    it('can average a list of Pts', function() {
      let p = Num.average( [new Pt(1,3,5,7), new Pt(2,3,8,8), new Pt(5,10,14,21), new Pt(0, 0, 1, 0)] );
      assert.isTrue( p.equals( new Pt(2, 4, 7, 9) ) );
    });
  });



  describe('Geom: ', function() {
    
    it('can bound angle', function() {
      assert.equal( Geom.boundAngle(-12), 348 );
    });

    it('can bound radian', function() {
      assert.equal( Geom.boundRadian(-Math.PI), Math.PI );
    });

    it('can find a bounding box', function() {
      let g = Group.fromArray( [[-10,100,5], [1,2,3], [-1,50,9]] );
      let b = Geom.boundingBox( g );
      assert.isTrue( b[0].equals( [-10,2,3] ) && b[1].equals([1,100,9]) );
    });
    
    it('can find centroid', function() {
      let g = Group.fromArray( [[5,4,3], [1,2,3], [10,10,5]] );
      let c = Geom.centroid( g );
      assert.isTrue( c.equals( [(5+1+10)/3, (4+2+10)/3, (3+3+5)/3], 0.00001 ) );
    });

    it('can interpolate between 2 points', function() {
      assert.isTrue( Geom.interpolate([10,10], [20,100], 0.3).equals( [13,37] ) );
    });

    it('can find perpendicular pts', function() {
      let ps = Geom.perpendicular( [10, 3] )
      assert.isTrue( Num.equals( ps[0].x, -3) && Num.equals( ps[1].y, -10 ) );
    });

    it('can check if 2 pts are perpendicular to each other', function() {
      assert.isTrue( Geom.isPerpendicular( [-2, 4], [8,4] ) );
    });

    it('can check if a pt is within bound', function() {
      let a = Geom.withinBound( [10, 15], [10,10], [11,15] );
      let b = Geom.withinBound( [10, 15], [10,10], [11,14] );
      assert.isTrue( a && !b );
    });

    it('can scale a group by dimensions', function() {
      let ps = [new Pt(0,0,1), new Pt(3,6,5)];
      Geom.scale( ps, [10,9,8], [0,0,0] );
      assert.isTrue( ps[0].x === 0 && ps[1].y === 54 && ps[0].z === 8 );
    });

    it('can scale a group uniformly', function() {
      let ps = [new Pt(1,10,0), new Pt(3,6,5)];
      Geom.scale( ps, 5, [1,10,0] );
      assert.isTrue( ps[0].x === 1 && ps[1].y === -10 && ps[1].z === 25 );
    });

    it('can rotate a group in 2D', function() {
      let ps = [new Pt(1,2), new Pt(3,6) ];
      let ang = Math.PI/4;
      Geom.rotate2D( ps, ang, [1,1] );
      let s1 = Num.equals( ps[0].x, Math.cos(2.35619449)+1);
      let s2 = Num.equals( ps[1].y, Math.sin(1.97568811)*5.38516480+1 );
      assert.isTrue( s1 && s2 );
    });

    it('can shear a group in 2D', function() {
      let ps = [new Pt(218, 454), new Pt( 218, 404) ];
      let scale = [-0.5154185022026432, 0];
      Geom.shear2D( ps, scale, [268, 454] );
      assert.isTrue( Num.equals( ps[0].x, 218) && Num.equals(ps[0].y, 482.324, 0.001) &&  Num.equals(ps[1].y, 432.324, 0.001) );
    });

    it('can reflect a group in 2D', function() {
      let ps = [new Pt(218, 454), new Pt( 218, 404) ];
      let reflect = Group.fromArray( [[230, 497], [268, 454]] )
      Geom.reflect2D( ps, reflect );
      assert.isTrue( Num.equals(ps[0].x, 274.14938) &&  Num.equals(ps[1].y, 497.4710) );
    });

    it('can reflect a group in 2D', function() {
      let ps = [new Pt(218, 454), new Pt( 218, 404) ];
      let reflect = Group.fromArray( [[230, 497], [268, 454]] )
      Geom.reflect2D( ps, reflect );
      assert.isTrue( Num.equals(ps[0].x, 274.14938) &&  Num.equals(ps[1].y, 497.4710) );
    });

    it('can get a sin table', function() {
      let sin = Geom.sinTable();
      assert.isTrue( Num.equals( sin.sin( Math.PI/17 ), Math.sin( Math.PI/17 ), Math.PI/180) );
    });
    
  });


  describe('Range: ', function() {
    
    it('can calculate min and max of a range', function() {
      let d = [ 
        new Pt(10, 2, 0), new Pt(5,3,5), 
        new Pt(-100, 3, 9), new Pt(-4, -12, -1), 
        new Pt(6, 7, -40), new Pt(9, -5, -1)
      ];
      let r = new Range( d );
      assert.isTrue( r.max.equals( new Pt(10, 7, 9) ) && r.min.equals( new Pt(-100, -12, -40) ) && r.magnitude.equals( new Pt(110, 19, 49) ) );
    });

    it('can normalize to unit', function() {
      let d = [ 
        new Pt(10, 2, 0), new Pt(5,3,5), 
        new Pt(-100, 3, 9), new Pt(-4, -12, -1), 
        new Pt(6, 7, -40), new Pt(9, -5, -1)
      ];
      let r = new Range( d );
      let target = r.mapTo(0, 1);
      assert.isTrue( Num.equals( target[0][0], 1 ) && Num.equals( target[2][1], 15/19) && Num.equals( target[4][2], 0 ) );
    });

    it('can normalize with exclude', function() {
      let d = [ 
        new Pt(10, 2, 0), new Pt(5,3,5), 
        new Pt(-100, 3, 9), new Pt(-4, -12, -1), 
        new Pt(6, 7, -40), new Pt(9, -5, -1)
      ];
      let r = new Range( d )
      let target = r.mapTo(15, 99, [true, false, true]);
      assert.isTrue( Num.equals( target[2][0], -100 ) && Num.equals( target[5][1], 15 + (99-15) * 7/19) && Num.equals( target[3][2], -1 ) );
    });

    it('can append and recalculate', function() {
      let d = [ 
        new Pt(10, 2, 0), new Pt(5,3,5), 
        new Pt(-100, 3, 9), new Pt(-4, -12, -1), 
        new Pt(6, 7, -40), new Pt(9, -5, -1)
      ];
      let r = new Range( d );
      r.append( [new Pt(1000, -20, 3), new Pt(-2, 300, -300)] );
      let target = r.mapTo(0, 1);
      assert.isTrue( Num.equals( target[0][0], 110/1100 ) && Num.equals( target[2][1], 23/320) && Num.equals( target[4][2], 260/309 ) 
       && Num.equals( target[6][0], 1 ) && Num.equals( target[7][2], 0 ) );
    });

    it('can create ticks from min and max range', function() {
      let d = [ 
        new Pt(10, 2, 0), new Pt(5,3,5), 
        new Pt(-100, 3, 9), new Pt(-4, -12, -1), 
        new Pt(6, 7, -40), new Pt(9, -5, -1)
      ];
      let r = new Range( d );
      let t = r.ticks( 10 );
      assert.isTrue( t[0].equals( new Pt(-100, -12, -40 ) ) && t[3].equals( new Pt(-67, -6.30000019, -25.29999923) ) && t[10].equals( new Pt(10, 7, 9 ) ) );
    });

  });

});