# Extensions

Pts.js works well with common web frameworks and can also be used in other environments. You can apply all or a part of Pts in your own project frictionlessly. The following is a list of libraries that extends Pts. Give them a try!

### Starter Kit
[`pts-starter-kit`](https://github.com/williamngan/pts-starter-kit) provides a convenient way to build your next Pts project, with support for both javascript and typescript. 

Behind the scene it uses [esbuild](https://esbuild.github.io/) so it's super fast and optimized. When minified and gzipped, the repo demo is only ~26kb in size.

### React
[`react-pts-canvas`](https://github.com/williamngan/react-pts-canvas) wraps Pts in a React component. It provides a functional component as well as a class component for backward compatibility.

Using this component, you can create an animation as easy as:

```
<PtsCanvas
  background="#9ab"
  onAnimate={ (space, form, time, ftime) => {...} }
/>
```

For other examples using this React component, take a look at [this repo](https://github.com/williamngan/react-pts-canvas-examples).

### Svelte 
**[experimental]** [`svelte-pts-canvas`](https://github.com/williamngan/svelte-pts-canvas) provides an experimental Pts component for Svelte. Please give it a try and make it better via feedback and PRs.

### Node Canvas 
**[experimental]**
 [`node-pts-canvas`](https://github.com/williamngan/node-pts-canvas) makes Pts work on [node-canvas](https://github.com/Automattic/node-canvas), a Cairo-backed Canvas implementation for Node.js. This means you can output higher resolution images and SVG without using browsers.

Only basic features of Pts are implemented at this point. Please file an issue for bugs and feedback. 

### fxhash Starter Kit 
**[experimental]** [`pts-fxhash-starter-kit`](https://github.com/williamngan/pts-fxhash-starter-kit) forked from the fxhash boilerplate, providing a convenient way to make generative NFTs with Pts. 

[fxhash](https://www.fxhash.xyz/) is a generative NFT platform on Tezos blockchain. [My fxhash account](https://www.fxhash.xyz/u/William%20Ngan) displays some NFT examples created with this repo.

Please understand that this repo may not always be kept up-to-date with the latest fxhash requirements and features. Please refer to fxhash documentations, revise as needed, and fully test your code. 

### Your Contribution
Have you created a new library or project based on Pts? We would love to learn more and potentially feature it here. 

Please let us know by [filing an issue](https://github.com/williamngan/pts/issues) or message [@williamngan](https://twitter.com/williamngan) on Twitter.
