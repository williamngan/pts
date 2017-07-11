# Pt calculations

### Vector math
Pt provides basic functions for calculating vectors and matrices. But don't worry if you are not familiar wtih linear algrebra. To start, think of it as methods to perform calculations on arrays of values like adding or multiplying them. 
```
let pt = new Pt( 10, 10 )
pt.add( 1, 2 ) // pt is now (11, 12)
pt.divide( 2 ) // divide each value by 2
pt.multiply( {x: 2, y: 1} )
pt.subtract( anotherPt ).multiply( 5 ).add( [1,2,3] )
```
The above functions like [`add`](#pt) will update the values of `pt` instance. If you want to get the results as a new Pt, using [`$add`](#pt) etc instead.
```
let p1 = pt.$add( 1,2,3 );
let p2 = pt.$multiply( 5 ).add( 1,2,3 )

```
There are other basic vector operations like [`unit`](#pt) (get a normalized vector), [`magnitude`](#pt) (get its distance from origin), [`dot`](#pt) (find dot product), [`$project`](#pt) (find its projection vector). Check the docs on [`Pt`](#pt) for a full list.

### Angles
Since a Pt can be thought of as an arrow from origin, you can find its angle with [`angle`](#pt) function. You can also find the angle between two Pts with [`angleBetween`](#pt) function. A related function [`toAngle()`](#pt) lets you move a Pt by specifying a target angle.
```
pt.angle()
pt.angle(Const.yz) // get the angle of axis y-z
pt.angleBetween( anotherPt )
pt.toAngle( Math.PI/2 )
```

##### * Note that all angles are specified in radian, where 180 degrees = _π_ radian. (Imagine half-circle is like 180 degrees.) You can use `Geom.toRadian` and `Geom.toDegree` functions to convert between degrees and radian.

![js:pt_angle](./assets/bg.png)

##### The above demo is put together with some basic vector operations and angle functions.

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

Take a look at the [`Geom`](#op) class which also provides many functions to help with geometry and transformations.

![js:pt_reflect](./assets/bg.png)

##### A demo of scale and reflect transformation. The red line's length changes the scale, while its angle specifies the reflection. Take a look at the source code to see how easy this it :)

### Roll your own

Other common ways to perform calculations include `reduce` and `map`, which let you operate on an array of numbers. You may use all of Float32Array's functions with Pt, and some additional ones in Pt like `$map` and `op`. (See advanced topics for details)
```
let p1 = pt.$map( (d) => d*d )

// same as pt.$map(...)
let p2 = new Pt( pt.map( (d) => d*d ) 
```
##### * Note that you may still use `map` but it will return a `Float32Array` instead of a `Pt`

