# Ecosystem

Pts can be used on its own or alongside tools made for different workflows. The ecosystem currently starts with these two projects.

### react-pts-canvas

[`react-pts-canvas`](https://github.com/williamngan/react-pts-canvas) is a React component for creating Pts canvases inside a React application. It connects a component's lifecycle to a Pts space and provides callbacks for setup, animation, actions, and resizing.

```
<PtsCanvas
  background="#9ab"
  onAnimate={ (space, form, time, ftime) => {...} }
/>
```

Install it from [npm](https://www.npmjs.com/package/react-pts-canvas).

### pts-cli

`pts-cli` is a command-line version of Pts for working with Pts projects from the terminal. Installation and usage details will be added here with its public release.

### Your contribution

Have you created a library or project based on Pts? We would love to learn more and potentially feature it here. Please let us know by [filing an issue](https://github.com/williamngan/pts/issues).
