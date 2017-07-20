# Group

A [`Group`](#pt-group) represents an array of [`Pt`](#pt-pt). It is an abstraction that can fit many contexts. For example, you may use it to define a matrix, store a polygon, or interpolate a curve where each Pt is an anchor point.

In fact, a wide range of complex forms and ideas can be represented as one of these simple structures:
- a Pt which is an array of numbers
- a Group which is an array of Pts
- an array of Groups

The goal of `pts.js` is to help you see and express these structures in creative ways.

### Creating a Group

Similar to making an Array, you can create a Group like these:

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

Remember that a Group must only contain Pts. This is different from Array which can contain different data types like strings and objects.

```
let notOk = new Group( [1,2,3], "hello" ); // Don't do this
```

### Array functions
Since a [`Group`](#pt-group) is a subclass of [`Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array), you can use all the Array functions in a Group. 

```
let g = Group.fromArray( [[1,2], [3,4]] );
g.unshift( new Pt(5, 6) );
g.pop();
let g2 = g.slice(); // Array's slice method returns an Array
g2 = Group.fromGroup( g2 ); // If needed, cast the Array back to Group
```

##### For typescript user: if the Array function returns an Array, you may need to cast it back to Group. For example: `let gg = group.map( (p) => p.unit() ) as Group`;

