# Technical notes

### Typescript notes
While [`Pt`](#pt_pt) extends `Float32Array` and [`Group`](#pt_group) extends Array, typescript compiler at the moment (2.4.2) isn't smart enough to auto-cast the return type when you use an Array or Float32Array function. That means if you use typescript, you may need to recast some native Array functions such as `map` or `slice`.

```
let p:Pt = new Pt(1,2,3);
let p2 = p.map( (d) => d+1 ); // typescript thinks p2 is Float32Array
let p3 = p.map( (d) => d+1 ) as Pt; // type is now cast back to Pt
```

### Cloning Pt with `clone()` or `$...`
Pt is a subclass of Float32Array, and Group is a subclass of Array that should only contain Pt in it. 

Since objects and arrays in javascript are passed by reference, remember to clone them if you are going to change their values. Functions starting with `$` such as `$add` means it will return a new Pt and keeping the original unchanged.

```
myGroup.push( space.center.clone() ); 
pt.$subtract( 10 ); // use $fn to get a new Pt
```

### Javascript ecosystem
The javascript ecosystem is moving so fast it's difficult to keep up. Pts is intended for modern browsers supporting es6+. Therefore, if you need to target es5 or older browsers, you'll need to configure your build tools accordingly. Some pointers:

- If you're using babel, you may need the [builtin-extend plugin](https://github.com/loganfsmyth/babel-plugin-transform-builtin-extend) because Pts extends built-in types like Array and Float32Array.

- UglifyJS doesn't seem to support extending built-in types unless the code is transformed to es5 first. Alternatively, consider other minify tool such as [babili](https://github.com/babel/minify)

