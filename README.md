# Pts

![image](./assets/pts-gif-10.gif)   

Pts is a new typescript/es6 library that enables you to compose and visualize points in spaces.

**Get started at [ptsjs.org](https://ptsjs.org)**

This library is currently in beta. Please give it a try, [file issues](https://github.com/williamngan/pts/issues), and send feedbacks to [@williamngan](https://twitter.com/williamngan). Thank you!

---    

### Usage

**Option 1**   
Get the latest `pts.js` or `pts.min.js` (in [dist](https://github.com/williamngan/pts/tree/master/dist) folder). Alternatively use a CDN service like [jsdelivr](https://cdn.jsdelivr.net/gh/williamngan/pts/dist/pts.min.js) or [unpkg](https://unpkg.com/pts/dist/pts.min.js). Then add it to your html page like this:
```
<script type="text/javascript" src="path/to/pts.js"></script>
```
Pts is pretty lightweight. Currently at ~90kb minified and 26kb gzipped.


**Option 2:**   
Install via `npm install pts`. Then you can choose to import some parts of Pts into your project as needed. 
```
import {CanvasSpace, Pt, Group, Line} from 'pts';
```

To quickly get started, try download or clone these repos:
- [pts-starter-kit](https://github.com/williamngan/pts-starter-kit): Get started with a sample app using npm and webpack
- [pts-react-example](https://github.com/williamngan/pts-react-example): Try an example of using Pts with React. (Note that you'll need to custom your own production/minified builds.)

**Get Started**   
Read the [guides](https://ptsjs.org/guide/get-started-0100) and take a look at the [demos](https://ptsjs.org/demo/?name=circle.intersectCircle2D) and their source code.    
If you need help, please don't hesitate to [file an issue](https://github.com/williamngan/pts/issues).

---    

### For development

Pts is written in typescript. You can clone or fork this project and build it as follows:

#### Build and test

Clone this repo and install dependencies via `npm install`.

```
npm start
npm run build
npm test
```

#### Generate documentations
```
typedoc --readme none --out docs src --name Pts
```

#### Generate typescript declaration files and minify
```
npm run typings
npm run minify
```

---    

### License
Apache License 2.0. See LICENSE file for details.   
Copyright © 2017-2018 by William Ngan and contributors.

