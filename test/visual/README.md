# Visual regression baselines

PNG snapshots that pin down what Pts renders, so a code change that alters
pixels has to be an explicit decision.

- `baselines/` — committed reference images. Treat a change here like a diff:
  open the before/after and confirm the new pixels are what you wanted.
- `output/` — written only when a test fails (git-ignored): the rendered image
  plus a `.diff.png` mask with differing pixels in red over a dimmed baseline.

## Running

```sh
pnpm test:visual          # compare against baselines
pnpm test:visual:update   # re-record baselines after an intended change
```

Visual specs live in `test/visual/` and run as part of `pnpm test` too.

A missing baseline is recorded automatically on a local run (with a warning) but
fails when `CI` is set, so an unreviewed snapshot can never sneak through CI.

A comparison fails if **any** pixel differs by more than 1 per channel, or if
more than 1% of pixels differ at all. The first catches real changes; the second
catches a change that only nudges the whole image by a single level, while still
tolerating scattered last-bit float noise between machines. Both are adjustable
per call via `matchBaseline`'s options.

## What is covered

### Color spaces (`Color.visual.spec.ts`)

Each color space is plotted as a 300×300 image: two of its axes span the image
(x to the right, y upwards, both across the space's full range) while the third
is held at 10%, 35%, 60% and 85% of its range — one image per slice, named
`color-<mode>-<axis><pct>.png`.

The sliced axis is lightness wherever the space has one (`hsl`, `hsb`, `lab`,
`lch`, `luv`, `oklab`, `oklch`), Y for `xyz`, and blue for `rgb`.

Colors outside the sRGB gamut come back clipped per channel, exactly as Pts
returns them: the plots record what the library does, artifacts included. That
is why a low-lightness `lab`/`lch`/`luv`/`xyz` slice looks brighter and more
colorful than its lightness implies — at LCH L=10 only a quarter of the plotted
plane is displayable, and clipping Lab(10, 0, -100) yields `rgb(0,47,176)`.
Those regions are flat, so the sensitive part of such a plot is the gamut
boundary, which moves as soon as conversion math changes.
