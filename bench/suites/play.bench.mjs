/**
 * `Tempo` and `Sound`.
 *
 * `Tempo.track` runs once per animation frame for the whole listener map, so
 * it is measured as a frame tick over a realistic mix of listeners. `Sound`'s
 * domain-mapping helpers are the per-frame hot path of every audio
 * visualization; Node has no Web Audio, so they run against a stub graph whose
 * analyser fills the byte array with a plain loop. The stub cost is identical
 * across runs, and the raw `freqDomain` case measures that floor so the
 * `*DomainTo` cases can be read net of it — what remains is the Group/Pt
 * mapping loop this suite exists to watch.
 */

import { SIZES } from "../lib/fixtures.mjs";
import { sink } from "../lib/sink.mjs";
import { defineSuite } from "../lib/suite.mjs";

const LISTENERS = SIZES.S;
const BINS = 256;
const FRAME = 1000 / 60;

class FakeAnalyser {
  constructor() {
    this.fftSize = 0;
    this.minDecibels = 0;
    this.maxDecibels = 0;
    this.smoothingTimeConstant = 0;
  }

  get frequencyBinCount() {
    return this.fftSize / 2;
  }

  connect() {}

  getByteTimeDomainData(data) {
    for (let i = 0; i < data.length; i++) data[i] = (i * 7) & 255;
  }

  getByteFrequencyData(data) {
    for (let i = 0; i < data.length; i++) data[i] = (i * 13) & 255;
  }
}

class FakeOscillator {
  constructor() {
    this.type = "sine";
    this.frequency = { value: 0 };
  }

  connect() {}
  start() {}
  stop() {}
  setPeriodicWave() {}
}

class FakeAudioContext {
  constructor() {
    this.state = "running";
    this.currentTime = 0;
    this.sampleRate = 48000;
    this.destination = {};
  }

  createOscillator() {
    return new FakeOscillator();
  }

  createAnalyser() {
    return new FakeAnalyser();
  }
}

/** Build a generated + analyzed Sound against the stub Web Audio graph. */
function stubbedSound(Sound, bins) {
  const hadWindow = typeof globalThis.window !== "undefined";
  if (!hadWindow) globalThis.window = {};
  const previous = globalThis.window.AudioContext;
  globalThis.window.AudioContext = FakeAudioContext;
  try {
    return Sound.generate("sine", 440).analyze(bins);
  } finally {
    // The constructor is only read at construction time; restore immediately
    // so nothing else in the process sees the stub.
    globalThis.window.AudioContext = previous;
    if (!hadWindow) delete globalThis.window;
  }
}

export default defineSuite("play", (b, { Pts }) => {
  const { Tempo, Sound } = Pts;

  // ----------------------------------------------------------------- Tempo

  b.case("Tempo.track single progress listener", {
    batch: 1,
    setupOnce: () => {
      const tempo = new Tempo(120);
      const state = { time: 0, acc: 0 };
      tempo.every(2).progress((count, t) => {
        state.acc += count + t;
      });
      return { tempo, state };
    },
    run: (s) => {
      s.state.acc = 0;
      s.tempo.track((s.state.time += FRAME));
      sink(s.state.acc);
    },
  });

  b.case(`Tempo.track mixed listeners x${LISTENERS}`, {
    batch: LISTENERS,
    setupOnce: () => {
      const tempo = new Tempo(120);
      const state = { time: 0, acc: 0 };
      const onStart = (count) => {
        state.acc += count;
      };
      const onProgress = (count, t) => {
        state.acc += count + t;
      };
      // A third each of start listeners, fixed-period progress listeners and
      // rhythm-array progress listeners, staggered so periods do not align.
      for (let i = 0; i < LISTENERS; i++) {
        const offset = (i % 8) * 10;
        if (i % 3 === 0) {
          tempo.every(1 + (i % 4)).start(onStart, offset, `s${i}`);
        } else if (i % 3 === 1) {
          tempo.every(2 + (i % 4)).progress(onProgress, offset, `p${i}`);
        } else {
          tempo.every([1, 2, 3]).progress(onProgress, offset, `r${i}`);
        }
      }
      return { tempo, state };
    },
    run: (s) => {
      s.state.acc = 0;
      s.tempo.track((s.state.time += FRAME));
      sink(s.state.acc);
    },
  });

  // ----------------------------------------------------------------- Sound

  b.case(`Sound.freqDomain ${BINS} bins (stub floor)`, {
    batch: BINS,
    setupOnce: () => ({ sound: stubbedSound(Sound, BINS) }),
    run: (s) => {
      const data = s.sound.freqDomain();
      sink(data[0] + data[data.length - 1]);
    },
  });

  b.case(`Sound.freqDomainTo ${BINS} bins`, {
    batch: BINS,
    setupOnce: () => ({ sound: stubbedSound(Sound, BINS) }),
    run: (s) => {
      const g = s.sound.freqDomainTo([800, 400], [10, 10]);
      sink(g.length + g[g.length - 1][0]);
    },
  });

  b.case(`Sound.timeDomainTo ${BINS} bins`, {
    batch: BINS,
    setupOnce: () => ({ sound: stubbedSound(Sound, BINS) }),
    run: (s) => {
      const g = s.sound.timeDomainTo([800, 400], [10, 10]);
      sink(g.length + g[g.length - 1][1]);
    },
  });

  b.case(`Sound.freqDomainTo ${BINS} bins (reuse)`, {
    batch: BINS,
    setupOnce: () => {
      const sound = stubbedSound(Sound, BINS);
      return { sound, out: sound.freqDomainTo([800, 400], [10, 10]) };
    },
    run: (s) => {
      const g = s.sound.freqDomainTo([800, 400], [10, 10], [0, 0], s.out);
      sink(g.length + g[g.length - 1][0]);
    },
  });
});
