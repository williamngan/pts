# Pts

![image](./assets/pts-gif-10.gif)   

Pts is a new typescript/es6 library that enables you to compose and visualize points in spaces.

**Get started at [ptsjs.org](https://ptsjs.org)**

This library is currently in beta. Please give it a try, [file issues](https://github.com/williamngan/pts/issues), and send feedbacks to [@williamngan](https://twitter.com/williamngan). Thank you!

---    

### Usage

**Option 1:** Download the [latest release](https://github.com/williamngan/pts/releases) and get `pts.js` or `pts.min.js` (under "dist" folder). 
```
<script type="text/javascript" src="pts.js"></script>
```
Pts is pretty lightweight. Currently at 80kb minified and 23kb gzipped.


**Option 2:** Install via `npm install pts`. Then you can choose to import some parts of Pts into your project as needed. 
```
import {CanvasSpace, Pt, Group, Line} from 'pts';
```

To quickly get started, try download or clone these repos:
- [pts-starter-kit](https://github.com/williamngan/pts-starter-kit): Get started with a sample app using npm and webpack
- [pts-react-example]((https://github.com/williamngan/pts-react-example)): Try an example of using Pts with React. (Note that you'll need to custom your own production/minified builds.)


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
Copyright © 2017 by William Ngan and contributors.

