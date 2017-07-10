# Pt

### Calculating values
Pt provides functions for vector arithmetics, which is to say, you can perform calculations on arrays of values like adding or multiplying them. 
```
pt.add( 1, 2 )
pt.divide( 5 ) // divide each value by 5
pt.multiply( {x: 2, y: 1} )
pt.subtract( anotherPt ).multiply( 5 ).add( [1,2,3] )
```
The above functions will update the values of `pt` instance. If you want to get the results as a new Pt, using `$add` etc instead.
```
let p1 = pt.$add( 1,2,3 );
let p2 = pt.$multiply( 5 ).add( 1,2,3 )

```
There are other basic vector operations like `unit` (get a normalized vector), `magnitude` (get its distance from origin), `dot` (find dot product), `$project` (find its projection vector). Check the docs for a full list.

### Angles
Since a Pt can be thought of as an arrow from origin, you can find its angle with `angle` function. You can also find the angle between two `Pt`s with `angleBetween` function. A related function _`toAngle()`_ lets you move a Pt by specifying a target angle.
```
pt.angle()
pt.angle(Const.yz) // get the angle of axis y-z
pt.angleBetween( anotherPt )
pt.toAngle( Math.PI/2 )
```

##### * Note that all angles are specified in radian, where 180 degrees = _π_ radian. You can use `Num.toRadian` and `Num.toDegree` functions to convert between degrees and radian.


### Transformations

If you use Illustrator or other graphics software, you'll probably know operations to rotate or scale a shape. Pt also provides these transformation functions:
```
pt.scale( 0.5 )
pt.rotate2D( Math.PI/3 )
pt.shear2D( [0.3, 1.2] )
pt.reflect2D( [p1, p2] ) 
```

If you want to transform from a specific anchor point instead of at (0,0), provide an anchor as the second parameter:
```
pt.scale( 0.5, anchorPt )
pt.rotate( Math.PI/3, anchorPt )
```

Another common way is to transform a `Pt` is to use `$map(...)` with a custom transform function. This is similar to Array's `map(...)` function. 
```
let np = pt.$map( (d) => d*d )
```

##### * Note that you may still use `map` but it will return a `Float32Array` instead of a `Pt`
```
let np = new Pt( pt.map( (d) => d*d ) // same result as pt.$map(...)
```

![js:pt_angle](./assets/bg.png)
