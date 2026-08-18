/**
 * `Sound` against real Web Audio.
 *
 * The Node `play` suite measures the mapping loops against a stub graph; this
 * one runs the same per-frame calls through Chromium's actual `AnalyserNode`,
 * which is where a sketch pays for `getByteFrequencyData`. The oscillator is
 * never started — headless Chromium's autoplay policy keeps the context
 * suspended — but the analyser read and the mapping cost are the same over
 * silence, and silence is deterministic.
 */

import { sink } from "../lib/sink.mjs";
import { defineSuite } from "../lib/suite.mjs";

const BINS = 256;

export default defineSuite("sound", (b, { Pts }) => {
  const { Sound } = Pts;

  const make = () => ({ sound: Sound.generate("sine", 440).analyze(BINS) });
  // dispose() disconnects but never closes the context — Sound instances share
  // one AudioContext, and closing it would break every case after the first
  const close = (state) => state?.sound?.dispose();

  b.case(`Sound.freqDomain ${BINS} bins`, {
    batch: BINS,
    setupOnce: make,
    teardown: close,
    run: (s) => {
      const data = s.sound.freqDomain();
      sink(data.length + data[0]);
    },
  });

  b.case(`Sound.freqDomainTo ${BINS} bins`, {
    batch: BINS,
    setupOnce: make,
    teardown: close,
    run: (s) => {
      const g = s.sound.freqDomainTo([800, 400], [10, 10]);
      sink(g.length + g[g.length - 1][0]);
    },
  });

  b.case(`Sound.timeDomainTo ${BINS} bins`, {
    batch: BINS,
    setupOnce: make,
    teardown: close,
    run: (s) => {
      const g = s.sound.timeDomainTo([800, 400], [10, 10]);
      sink(g.length + g[g.length - 1][1]);
    },
  });

  b.case(`Sound.freqDomainTo ${BINS} bins (reuse)`, {
    batch: BINS,
    setupOnce: () => {
      const state = make();
      state.out = state.sound.freqDomainTo([800, 400], [10, 10]);
      return state;
    },
    teardown: close,
    run: (s) => {
      const g = s.sound.freqDomainTo([800, 400], [10, 10], [0, 0], s.out);
      sink(g.length + g[g.length - 1][0]);
    },
  });
});
