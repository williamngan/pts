# Technical notes

### Working with React and other libraries

When using Pts as a [npm package](https://www.npmjs.com/package/pts), you can choose to import only a small part of Pts in your own project. Perhaps just a couple of Line functions are all you need:

```
import {Pt, Line} from "pts"
```

Also take a look at [this example repo](https://github.com/williamngan/pts-react-example) which uses Pts to create a charting component in React. 


### Cloning Pt with `clone()` or `$...`
Pt is a subclass of Float32Array, and Group is a subclass of Array that should only contain Pt in it. 

Since objects and arrays in javascript are passed by reference, remember to clone them if you are going to change their values. Functions starting with `$` such as `$add` means it will return a new Pt and keeping the original unchanged.

```
myGroup.push( space.center.clone() ); 
pt.$subtract( 10 ); // use $fn to get a new Pt
```

### Typescript notes
While [`Pt`](#pt-pt) extends `Float32Array` and [`Group`](#pt-group) extends Array, typescript compiler at the moment (2.4.2) isn't smart enough to auto-cast the return type when you use an Array or Float32Array function. That means if you use typescript, you may need to recast some native Array functions such as `map` or `slice`.

```
let p:Pt = new Pt(1,2,3);
let p2 = p.map( (d) => d+1 ); // typescript thinks p2 is Float32Array
let p3 = p.map( (d) => d+1 ) as Pt; // type is now cast back to Pt
```

### Javascript ecosystem
The javascript ecosystem is moving so fast it's difficult to keep up. Pts is intended for modern browsers supporting es6+. Therefore, if you need to target es5 or older browsers, you'll need to configure your build tools accordingly. Some pointers:

- UglifyJS doesn't seem to support minifying es6 so the code is transformed to es5 first. Alternatively, consider other minify tool such as [babel-minify](https://github.com/babel/minify) or [uglify-es](https://github.com/mishoo/UglifyJS2/tree/harmony). 

- If you're compiling to es5 with babel, you may need the [builtin-extend](https://github.com/loganfsmyth/babel-plugin-transform-builtin-extend) and/or [transform-classes](https://babeljs.io/docs/en/next/babel-plugin-transform-classes.html) plugins, because Pts extends built-in types like Array and Float32Array. This may not be needed in future as build tools get better.

- Pts is a new library in beta so we don't recommend using it in high-priority production system yet.


### Remember to file issues and feedbacks

Support this open-source project by filing bugs and pull requests on [github](https://github.com/williamngan/pts). If you have other feedbacks, please ping [@williamngan](https://twitter.com/williamngan). Show us what you have made with Pts too!