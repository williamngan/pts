# Ecosystem

Pts can be used on its own or alongside tools made for different workflows. The ecosystem currently starts with these two projects.

### React component

[`react-pts-canvas`](https://github.com/williamngan/react-pts-canvas) is a React component for creating Pts canvases inside a React application. It connects a component's lifecycle to a Pts space and provides callbacks for setup, animation, actions, and resizing.

```
<PtsCanvas
  background="#9ab"
  onAnimate={ (space, form, time, ftime) => {...} }
/>
```

Learn more at [react.ptsjs.org](https://react.ptsjs.org) and install it from [npm](https://www.npmjs.com/package/react-pts-canvas).

### Render Pts.js in the command line

`pts-render` is a CLI tool for Pts.js. Use it to work directly from the terminal without a browser. 

Learn more at [cli.ptsjs.org](https://cli.ptsjs.org) and install it from [npm](https://www.npmjs.com/package/pts-render).

### Your contribution

Have you created a library, tool or project based on Pts? Please let us know by [filing an issue](https://github.com/williamngan/pts/issues).
