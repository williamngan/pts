# Changelog

## Pts reaches v1.0

<small>Sep 24, 2026</small>

Pts was released 9 years ago in 2017. I wanted to build a graphics library from scratch, because it's challenging and fun.

Do you know what's more challenging and fun? Being a new parent. That's why Pts didn't get an update for a long while.

Now my child is 6yo, and AI writes better code than I can, it's time to clear years of backlog.

V1.0 is a full modernization of Pts. The build system gets an upgrade, and tests and benchmarks have full coverage. The library is optimized and it's now very fast.

We are now in 2026. A crazy timeline is unfolding. I hope Pts is still fun and relevant for humans, even in the age of AI.

Let's go through the new features.

### SVG, Canvas, React, CLI, AI

**A new SVG renderer.** Swap `CanvasForm` with `SVGForm`, and render svg directly without additional code changes. [Demo](../demo?name=svgspace.getForm)

**New CLI support.** Generate png or svg directly in the command line. Learn more at [cli.ptsjs.org](https://cli.ptsjs.org) (or point your AI agent to it)

**React compoent.** [react-pts-canvas](https://react.ptsjs.org) also gets an update with bug fixes and performance improvements.

**AI ready.** Markdown formatted [documentations](https://ptsjs.org/docs.md) and [guide](https://ptsjs.org/guide.md) and [skill](https://ptsjs.org/SKILL.md). Just point your AI agent to [ptsjs.org](https://ptsjs.org) to get started.

### New features

**Path operations.** The new `Path` class unites, intersects, subtracts and crops polygons, and `form.compound` draws compound path. [Demo](../demo?name=path.crop)

**Curve conversions.** Convert back and forth between cardinal, b-spline and bezier curves via convenient functions like `Curve.cardinalToBezier` and `Curve.bezierToCardinal`. [Demo](../demo?name=curve.cardinal)

**Sampling.** `Create.sampling` uses Poisson-disc technique to sample uniformly distributed points in an area. [Demo](../demo?name=create.sampling)

**Flocking.** `Create.flock` runs a flocking simulation based on Craig Reynolds' Boids algorithm. [Demo](../demo?name=create.flock)

**OKLab color space.** `Color` now supports Oklab and Oklch, alongside corrected conversions for RGB, HSL, HSB, XYZ, LAB, LCH, and LUV.

### Fixes

**Big performance gains.** Physcis engine is now 31x faster, delaunay/voronoi tessellation 268x faster, and polygon collison 100x faster. See more results [here](https://github.com/williamngan/pts/blob/master/CHANGELOG.md#performance)

**Under-the-hood optimizations.** Improved image and sound handling in `Img` and `Sound`. Simplified API for managing `UI` interactions. Many bug fixes to improve stability.

**Modernized build system.** The codebase is updated to TypeScript 6 in strict mode. Build scripts now use pnpm and tsdown. Packages include explicit ESM and CommonJS entry points, matching type declarations and source maps.

**New demo editor.** The live editor was rebuilt and can export a self-contained html demo. [Try it](demo/edit/?name=circle.withinBound).
