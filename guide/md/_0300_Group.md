# Group

A [`Group`](#pt-group) represents an array of [`Pt`](#pt-pt). It is an abstraction that can fit many contexts. For example, you may use it to define a matrix, store a polygon, or interpolate a curve where each Pt is an anchor point.

In fact, a wide range of complex forms and ideas can be represented as one of these simple structures:
- a Pt which is an array of numbers
- a Group which is an array of Pts
- an array of Groups

The goal of `pts.js` is to help you see and express these structures in creative ways.

### Creating a Group

[`Group`](#pt-group) is a subclass of javascript [`Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array). Therefore, similar to creating an Array, you can create a Group like these:

```
// Like Array constructor
let g1 = new Group( p1, p2, p3 );

// wrap an array of Pt into a group
let g2 = Group.fromGroup( [ p1, p2, p3 ] ); 

// Use it just like array too
g1[2] = new Pt(1,2,3);
```

You can also easily convert an array of number arrays into a Group of Pts:
```
let g3 = Group.fromArray( [ [1,2], [3,4], [5,6] ] );
g3[0]; // returns Pt(1,2)
g3.p2; // returns Pt(3,4)
```

Remember that a Group must only contain Pt. This is different from Array which can contain different data types like strings and objects.

```
let notOk = new Group( [1,2,3], "hello" ); // Don't do this
```

### Array functions
You can use all the javascript's Array functions in a Group. No need to learn a new API.

```
g.unshift( new Pt(5, 6) );
g.pop();
let mags = g.map( (p) => p.magnitude() );
```

##### Note on typescript: you may need to cast Array function result back to `Group` because the typescript compiler cannot figure it out yet (as of v2.4). For example: `let gg = group.map( (p) => p.unit() ) as Group`;

It's common to apply a Pt function to all the Pts in a Group. You can use [`forEachPt`](#pt-group) to do this easily, as long as the Pt function will return a Pt.

```
let g = new Group( new Pt(1.1, 2.2), new Pt(3.3, 4.4) );
g.forEachPt( "floor" ); // g is now [ Pt(1,2), Pt(3,4) ]
g.forEachPt( "$min", 2, 2 ); // g is now [ Pt(1, 2), Pt(2, 2) ]
g.forEachPt( "dot", new Pt(1,2) ); // Error, dot() doesn't return Pt
```

There are also a couple additional functions in Group that let you work with array more effectively. Take a look at [`insert`](#pt-group), [`remove`](#pt-group), [`segments`](#pt-group) and others.

![js:group_segments](./assets/bg.png)

##### In this demo, we keep track of the last 50 positions of the pointer in a Group, and draw one circle for every 5 segments. Take a look at the source code and note the use of common Array functions like `push` and `map` along with Group functions like `segments`.

### Transformations
Similar to transformations in Pt, you can use [`scale`](#pt-group), [`rotate2D`](#pt-group) etc to transform a Group ot Pts. There are also [`moveBy`](#pt-group) and [`moveTo`](#pt-group) to translate its positions. Basic arithmetics like [`add`](#pt-group) and [`multiply`](#pt-group) are also included. 

Furthermore, you may use [`$matrixAdd`](#pt-group) and [`$matrixMultiply`](#pt-group) to do advanced matrix calculations. 

### Cheat sheet
Creating and cloning
```
new Group( new Pt(1,2), new Pt(3,4) )
Group.fromArray( [ [1,2], [3,4] ])
Group.fromPtArray( [new Pt(1,2), new Pt(3,4) )
g.clone()
```

Getting and setting Pts 
```
g[0]
g.p1
g[1] = new Pt()
g.id = "g01"
```

Working with array
```
g.map( (p) => p.unit() ) // support all Array functions
g.insert( [p1, p2], 0 )
g.remove( 3, 2 )
g.segments( 2, 2 )
g.zipSlice(2)
g.$zip()
```

Positions and bounds
```
g.boundingBox()
g.anchorFrom( 3 ) // relative to absolute position
g.anchorTo( pt ) // absolute to relative position
g.centroid()
g.interpolate( 0.5 )
g.sortByDimension(1, true)
```

Calculate
```
g.add( 10 )
g.multiply( 0.5 )
g.$matrixAdd( g2 )
g.$matrixMultiply( g2, true )
g.forEachPt( "floor" )
```

Transform
```
g.moveTo( 100, 100 )
g.moveBy( 10, 1 )
g.scale( 0.5 ).rotate2D( Const.half_pi )
g.shear2D( 0.2 ).reflect2D( line )
```

Check out the [full documentation](../docs/) too.