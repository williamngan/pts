# Pt basics

A [`Pt`](#pt-pt) represents a point in space, or more technically, an _n_-dimensional vector. You may also think of a `Pt` as an array of numeric values, a set of weights, or like an arrow coming from the origin point (0,0,0...). 

### Creating a Pt

You can create a [`Pt`](#pt-pt) in many different ways:
```
// defaults to (0,0)
new Pt() 

// from a series of parameters, array, or object
new Pt( 1, 2, 3, 4 )  
new Pt( [1,2,3] ) 
new Pt( {x:0, y:1, z:2, w:3} )
new Pt( anotherPt ) 

Pt.make( 5, 0 ) // same as new Pt(0,0,0,0,0)
```

Here's a simple demo visualizing a Pt, which moves with your mouse/touch. 

![js:pt_create](./assets/bg.png)

##### Here the red dot is the last position of your mouse/touch as a Pt. The black lines are the distances from the origin (top-left corner), which is equivalent to the Pt's position. The red line represents another way to think of this Pt -- as a vector, as an arrow from the origin of this space.

### Float32Array

Since [`Pt`](#pt-pt) is a subclass of javascript's [`Float32Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float32Array), it means you may use all the `Float32Array` features on a `Pt` too. For example:
```
p[0]
p.fill( 0, 1, 2 )
p.reduce( (a,b) => Math.max(a,b), 0 );
```

Note that some `Float32Array` functions return a new `Float32Array`. You may cast it back to `Pt` by a simple wrapping:
```
new Pt( p.slice(1,3) )
p.$slice(1,3) // or alternatively, use $slice
``` 

### Updating values

You can update a Pt's values by using [`to`](#pt-pt) function, or accessing the [`x`](#pt-pt), [`y`](#pt-pt), [`z`](#pt-pt), [`w`](#pt-pt) properties.
```
p.to(1,2,3)
p.to( anotherPt )
p.w = p.x + p.z
```

See the next section on [Pt calculations](./Pt-calculations-0020.html) for more ways to calculate and update a Pt.
