import { Pt, Group, type Bound } from "./Pt";
import { Num } from "./Num";
import {
  type ITempoListener,
  type ITempoStartFn,
  type ITempoProgressFn,
  type ITempoResponses,
} from "./Types";
import {
  type ISoundAnalyzer,
  type SoundType,
  type PtLike,
  type IPlayer,
} from "./Types";

/**
 * Tempo helps you create synchronized and rhythmic animations.
 */
export class Tempo implements IPlayer {
  protected _bpm!: number; // beat per minute
  protected _ms!: number; // millis per beat

  protected _listeners: { [key: string]: ITempoListener } = {};
  protected _listenerInc: number = 0;
  public animateID!: string;

  /**
   * Construct a new Tempo instance by beats-per-minute. Alternatively, you can use [`Tempo.fromBeat`](#link) to create from milliseconds.
   * @param bpm beats per minute. Must be greater than 0.
   */
  constructor(bpm: number) {
    this.bpm = bpm;
  }

  /**
   * Create a new Tempo instance by specifying milliseconds-per-beat.
   * @param ms milliseconds per beat. Must be greater than 0.
   */
  static fromBeat(ms: number): Tempo {
    return new Tempo(60000 / ms);
  }

  /**
   * Beats-per-minute value. Must be greater than 0.
   */
  get bpm(): number {
    return this._bpm;
  }
  set bpm(n: number) {
    this._bpm = n;
    this._ms = 60000 / this._bpm;
  }

  /**
   * Milliseconds per beat (Note that this is derived from the bpm value).
   */
  get ms(): number {
    return this._ms;
  }
  set ms(n: number) {
    this._bpm = 60000 / n;
    this._ms = n;
  }

  // Get a listener unique id
  protected _createID(): string {
    return "_b" + this._listenerInc++;
  }

  /**
   * This is a core function that let you specify a rhythm and then define responses by calling the `start` and `progress` functions from the returned object. See [Animation guide](../guide/Animation-0700.html) for more details.
   * The `start` function lets you set a callback on every start. It takes a function ([`ITempoStartFn`](#link)).
   * The `progress` function lets you set a callback during progress. It takes a function ([`ITempoProgressFn`](#link)). Both functions let you optionally specify a time offset and a custom name.
   * A positive offset shifts the beat earlier (fires sooner), a negative offset shifts it later.
   * @param beats a rhythm in beats as a number or an array of numbers
   * @example `tempo.every(2).start( (count) => ... )`, `tempo.every([2,4,6]).progress( (count, t) => ... )`
   * @returns an object with chainable functions
   */
  every(beats: number | number[]): ITempoResponses {
    const self = this;
    const p = Array.isArray(beats) ? beats[0] : beats;

    return {
      start: function (
        fn: ITempoStartFn,
        offset: number = 0,
        name?: string,
      ): ITempoResponses {
        const id = name || self._createID();
        self._listeners[id] = {
          name: id,
          beats: beats,
          period: p,
          index: 0,
          offset: offset,
          duration: -1,
          count: 0,
          continuous: false,
          fn: fn,
        };
        return this;
      },

      progress: function (
        fn: ITempoProgressFn,
        offset: number = 0,
        name?: string,
      ): ITempoResponses {
        const id = name || self._createID();
        self._listeners[id] = {
          name: id,
          beats: beats,
          period: p,
          index: 0,
          offset: offset,
          duration: -1,
          count: 0,
          continuous: true,
          fn: fn,
        };
        return this;
      },
    };
  }

  /**
   * Usually you can add a tempo instance to a space via [`Space.add`](#link) and it will track time automatically.
   * But if necessary, you can track time manually via this function.
   * @param time current time in milliseconds
   */
  track(time: number) {
    for (const k in this._listeners) {
      if (this._listeners.hasOwnProperty(k)) {
        const li = this._listeners[k];
        const _t = li.offset ? time + li.offset : time;
        const ms = li.period! * this._ms; // time per period
        let isStart = false;

        if (li.duration! < 0) {
          // first tick is the start of the first period
          li.duration = _t - (_t % this._ms);
          li.count = li.count || 0; // a hand-built listener may omit count
          isStart = true;
        } else if (_t > li.duration! + ms) {
          li.duration = _t - (_t % this._ms); // update
          if (Array.isArray(li.beats)) {
            // find next period from array
            li.index = (li.index! + 1) % li.beats.length;
            li.period = li.beats[li.index];
          }
          li.count = (li.count || 0) + 1;
          isStart = true;
        }

        let done: void | boolean | undefined;
        if (li.continuous) {
          const t = Num.clamp((_t - li.duration!) / ms, 0, 1);
          done = (li.fn as ITempoProgressFn).call(
            li,
            li.count!,
            t,
            _t,
            isStart,
          );
        } else if (isStart) {
          done = (li.fn as ITempoStartFn).call(li, li.count!);
        }
        if (done) delete this._listeners[li.name!];
      }
    }
  }

  /**
   * Remove a `start` or `progress` callback function from the list of callbacks. See [`Tempo.every`](#link) for details
   * @param name a name string specified when creating the callback function.
   */
  stop(name: string): void {
    if (this._listeners[name]) delete this._listeners[name];
  }

  /**
   * IPlayer interface. Internal implementation that calls `track( time )`.
   */
  animate(time: number, ftime: number) {
    this.track(time);
  }

  /**
   * IPlayer interface. Not implemented.
   */
  resize(bound: Bound, evt?: Event) {
    return; // not implemented in IPlayer
  }

  /**
   * IPlayer interface. Not implemented.
   */
  action(type: string, px: number, py: number, evt: Event) {
    return;
  }
}

/**
 * Sound class simplifies common tasks like audio inputs and visualizations using a subset of Web Audio API. It can be used with other audio libraries like tone.js, and extended to support additional web audio functions. See [the guide](../guide/Sound-0800.html) to get started.
 */
export class Sound {
  private _type: SoundType;

  /** The audio context */
  _ctx: AudioContext;

  /** The audio node, which is usually a subclass liked OscillatorNode */
  _node!: AudioNode;

  /**
   * The audio node to be connected to AudioContext when playing, if different than _node
   * This is useful when using the connect() function to filter, as typically the output would
   * come from the filtering nodes
   */
  _outputNode!: AudioNode;

  /** The audio stream when streaming from input device */
  _stream!: MediaStream;

  /** Audio src when loading from file */
  _source!: HTMLMediaElement;

  /* Audio buffer when using AudioBufferSourceNode */
  _buffer!: AudioBuffer;

  /** Analyzer if any */
  analyzer!: ISoundAnalyzer;

  protected _playing: boolean = false;

  protected _timestamp!: number; // Tracking play time against ctx.currentTime

  protected _wave!: PeriodicWave; // Wave when generating a "custom" oscillator

  protected _gain!: GainNode; // Gain node for volume control, created on first start

  protected _volume: number = 1;

  protected _connected: AudioNode[] = []; // Nodes added via connect(), re-applied on gen restart

  protected _bufferPlayed: boolean = false; // An AudioBufferSourceNode can only start once

  protected _generated: boolean = false; // Whether _node is an oscillator created by _gen

  // A single AudioContext shared by all Sound instances that don't provide their own
  protected static _sharedContext: AudioContext;

  /**
   * Construct a `Sound` instance. Usually, it's more convenient to use one of the static methods like [`Sound.load`](#function_load) or [`Sound.from`](#function_from).
   * By default, all instances share a single `AudioContext` (browsers limit how many can be live at once).
   * @param type a `SoundType` string: "file", "input", or "gen"
   * @param ctx Optionally provide your own AudioContext instead of the shared one
   */
  constructor(type: SoundType, ctx?: AudioContext) {
    this._type = type;
    this._ctx = ctx || Sound._getContext();
  }

  /**
   * Get the shared AudioContext instance, creating it on first use. This is called internally only.
   */
  protected static _getContext(): AudioContext {
    if (!Sound._sharedContext) {
      const _ctx =
        typeof window !== "undefined" ? window.AudioContext : undefined;
      if (!_ctx)
        throw new Error(
          "Your browser doesn't support Web Audio. (No AudioContext)",
        );
      Sound._sharedContext = new _ctx();
    }
    return Sound._sharedContext;
  }

  /**
   * Create a `Sound` given an [AudioNode](https://developer.mozilla.org/en-US/docs/Web/API/AudioNode) and an [AudioContext](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext) from Web Audio API. See also [this example](../guide/js/examples/tone.html) using tone.js in the [guide](../guide/Sound-0800.html).
   * @param node an AudioNode instance
   * @param ctx an AudioContext instance
   * @param type a string representing a type of input source: either "file", "input", or "gen".
   * @param stream Optionally include a MediaStream, if the type is "input"
   * @returns a `Sound` instance
   */
  static from(
    node: AudioNode,
    ctx: AudioContext,
    type: SoundType = "gen",
    stream?: MediaStream,
  ) {
    const s = new Sound(type, ctx);
    s._node = node;
    if (stream) s._stream = stream;
    return s;
  }

  /**
   * Create a `Sound` by loading from a sound file or an audio element.
   * @param source either an url string to load a sound file, or an audio element.
   * @param crossOrigin whether to support loading cross-origin. Default is "anonymous". When passing an audio element, set the attribute in markup before the element loads for it to take effect.
   * @returns a `Sound` instance
   * @example `Sound.load( '/path/to/file.mp3' )`
   */
  static load(
    source: HTMLMediaElement | string,
    crossOrigin: string = "anonymous",
  ): Promise<Sound> {
    return new Promise((resolve, reject) => {
      const s = new Sound("file");
      if (typeof source === "string") {
        // crossOrigin must be set before src, or the initial request is made without CORS
        s._source = new Audio();
        s._source.crossOrigin = crossOrigin;
        s._source.src = source;
      } else {
        s._source = source;
        s._source.crossOrigin = crossOrigin;
      }
      s._source.autoplay = false;

      const onError = () => {
        s._source.removeEventListener("canplaythrough", ready);
        reject(
          new Error(`Error loading sound: ${s._source.src || "media element"}`),
        );
      };

      const ready = () => {
        // runs once: either immediately below, or via the once-only listener
        s._source.removeEventListener("error", onError);
        s._source.addEventListener("ended", function () {
          s._playing = false;
        });
        s._node = s._ctx.createMediaElementSource(s._source);
        resolve(s);
      };

      if (s._source.readyState >= 4) {
        // already buffered enough (eg, a previously loaded element)
        ready();
      } else {
        s._source.addEventListener("error", onError, { once: true });
        s._source.addEventListener("canplaythrough", ready, { once: true });
        if (s._source.readyState === 0) s._source.load(); // eg, preload="none"
      }
    });
  }

  /**
   * Create a `Sound` by loading and decoding a sound file URL as an `AudioBufferSourceNode`.
   * Unlike [`Sound.load`](#link), this loads the complete file instead of streaming it, which can provide more consistent analysis and replay behavior across browsers.
   * @param url an url to the sound file
   */
  static async loadAsBuffer(url: string): Promise<Sound> {
    const s = new Sound("file");
    const res = await fetch(url);
    if (!res.ok)
      throw new Error(`Error loading sound: ${url} (status ${res.status})`);
    try {
      s.createBuffer(await s._ctx.decodeAudioData(await res.arrayBuffer()));
    } catch (err) {
      // ErrorOptions isn't in this project's TS lib target; attach cause manually
      throw Object.assign(new Error("Error decoding audio"), { cause: err });
    }
    return s;
  }

  /**
   * Create or re-use an AudioBuffer. Only needed if you are using `Sound.loadAsBuffer` and want to prepare a replay manually — [`start`](#link) re-creates a used buffer automatically.
   * @param buf an AudioBuffer. Optionally, you can call this without parameters to re-use existing buffer.
   */
  createBuffer(buf?: AudioBuffer): this {
    if (this._node) {
      // the replaced node's late "ended" event must not clobber the new playback state
      (this._node as AudioBufferSourceNode).onended = null;
      this._node.disconnect();
    }
    this._node = this._ctx.createBufferSource();
    if (buf !== undefined) this._buffer = buf;

    (this._node as AudioBufferSourceNode).buffer = this._buffer; // apply or re-use buffer
    (this._node as AudioBufferSourceNode).onended = () => {
      this._playing = false;
    };
    this._bufferPlayed = false;
    if (this.analyzer) this._node.connect(this.analyzer.node);
    for (const n of this._connected) this._node.connect(n);
    return this;
  }

  /**
   * Create a `Sound` by generating a waveform using [OscillatorNode](https://developer.mozilla.org/en-US/docs/Web/API/OscillatorNode).
   * @param type a string representing the waveform type: "sine", "square", "sawtooth", "triangle", "custom"
   * @param val the frequency value in Hz to play, or a PeriodicWave instance if type is "custom".
   * @returns a `Sound` instance
   * @example `Sound.generate( 'sine', 120 )`
   */
  static generate(type: OscillatorType, val: number | PeriodicWave): Sound {
    const s = new Sound("gen");
    return s._gen(type, val);
  }

  // Create the oscillator
  protected _gen(type: OscillatorType, val: number | PeriodicWave): Sound {
    if (this._node) this._node.disconnect(); // tidy the replaced node's edges
    this._node = this._ctx.createOscillator();
    this._generated = true;
    const osc = this._node as OscillatorNode;
    osc.type = type;
    if (type === "custom") {
      this._wave = val as PeriodicWave;
      osc.setPeriodicWave(this._wave);
    } else {
      osc.frequency.value = val as number;
    }
    return this;
  }

  /**
   * Create a `Sound` by streaming from an input device like microphone. Note that this function returns a Promise which resolves to a Sound instance, and rejects if the input device is unavailable or permission is denied.
   * @param constraint Optional constraints which can be used to select a specific input device. For example, you may use [`enumerateDevices`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices) to find a specific deviceId;
   * @returns a `Promise` which resolves to `Sound` instance
   * @example `Sound.input().then( s => sound = s ).catch( err => ... );`
   */
  static async input(constraint?: MediaStreamConstraints): Promise<Sound> {
    const s = new Sound("input");
    const c = constraint ? constraint : { audio: true, video: false };
    s._stream = await navigator.mediaDevices.getUserMedia(c);
    s._node = s._ctx.createMediaStreamSource(s._stream);
    return s;
  }

  /**
   * Get this Sound's AudioContext instance for advanced use-cases.
   */
  get ctx(): AudioContext {
    return this._ctx;
  }

  /**
   * Get this Sound's AudioNode subclass instance for advanced use-cases.
   */
  get node(): AudioNode {
    return this._node;
  }

  /**
   * Get this Sound's Output node AudioNode instance for advanced use-cases.
   */
  get outputNode(): AudioNode {
    return this._outputNode;
  }

  /**
   * Get this Sound's MediaStream (eg, from microphone, if in use) instance for advanced use-cases. See [`Sound.input`](#link)
   */
  get stream(): MediaStream {
    return this._stream;
  }

  /**
   * Get this Sound's Audio element (if used) instance for advanced use-cases. See [`Sound.load`](#link).
   */
  get source(): HTMLMediaElement {
    return this._source;
  }

  /**
   * Get this Sound's AudioBuffer (if any) instance for advanced use-cases. See [`Sound.loadAsBuffer`](#link).
   */
  get buffer(): AudioBuffer {
    return this._buffer;
  }
  set buffer(b: AudioBuffer) {
    this._buffer = b;
  }

  /**
   * Get the type of input for this Sound instance. Either "file", "input", or "gen"
   */
  get type(): SoundType {
    return this._type;
  }

  /**
   * Indicate whether the sound is currently playing.
   */
  get playing(): boolean {
    return this._playing;
  }

  /**
   * A value between 0 to 1 to indicate playback progress. Returns 0 if the sound has no duration (eg, generated or input sounds).
   */
  get progress(): number {
    let dur = 0;
    let curr = 0;
    if (this._buffer) {
      dur = this._buffer.duration;
      // a timestamp of exactly 0 is valid (started when currentTime === timeAt)
      curr =
        this._timestamp !== undefined
          ? this._ctx.currentTime - this._timestamp
          : 0;
    } else if (this._source) {
      dur = this._source.duration;
      curr = this._source.currentTime;
    }
    return dur > 0 ? Num.clamp(curr / dur, 0, 1) : 0;
  }

  /**
   * Indicate whether the sound is ready to play. When loading from a file, this corresponds to a ["canplaythrough"](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/readyState) event.
   * You can also use `this.source.addEventListener( 'canplaythrough', ...)` if needed. See also [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/canplaythrough_event).
   */
  get playable(): boolean {
    if (this._type === "input" || this._type === "gen")
      return this._node !== undefined;
    return (
      !!this._buffer ||
      (this._source !== undefined && this._source.readyState === 4)
    );
  }

  /**
   * If an analyzer is added (see [`analyze`](#function_analyze) function), get the number of frequency bins in the analyzer. Returns 0 if no analyzer is added.
   */
  get binSize(): number {
    return this.analyzer ? this.analyzer.size : 0;
  }

  /**
   * Get the sample rate of the audio, for example, at 44100 hz.
   */
  get sampleRate(): number {
    return this._ctx.sampleRate;
  }

  /**
   * If the sound is generated, this sets and gets the frequency of the tone.
   */
  get frequency(): number {
    const osc = this._node as OscillatorNode;
    return this._type === "gen" && osc && osc.frequency
      ? osc.frequency.value
      : 0;
  }
  set frequency(f: number) {
    const osc = this._node as OscillatorNode;
    if (this._type === "gen" && osc && osc.frequency) osc.frequency.value = f;
  }

  /**
   * Get and set the volume of this sound. Default is 1. Values above 1 amplify the sound. Can be set before or during playback.
   */
  get volume(): number {
    return this._volume;
  }
  set volume(v: number) {
    this._volume = Math.max(0, v || 0); // `|| 0` also converts NaN
    if (this._gain) this._gain.gain.value = this._volume;
  }

  /**
   * Connect another AudioNode to this `Sound` instance's AudioNode. Using this function, you can extend the capabilities of this `Sound` instance for advanced use cases such as filtering. The connection is restored if a generated sound is restarted.
   * @param node another AudioNode
   */
  connect(node: AudioNode): this {
    this._connected.push(node);
    this._node.connect(node);
    return this;
  }

  /**
   * Sets the 'output' node for this Sound
   * This would typically be used after Sound.connect, if you are adding nodes
   * in your chain for filtering purposes.
   * @param  outputNode The AudioNode that should connect to the AudioContext
   */
  setOutputNode(outputNode: AudioNode): this {
    this._outputNode = outputNode;
    return this;
  }

  /**
   * Removes the 'output' node added from setOutputNode
   * Note: if you start the Sound after calling this, it will play via the default node
   */
  removeOutputNode(): this {
    this._outputNode = null!;
    return this;
  }

  /**
   * Add an analyzer to this `Sound`. Calling it again replaces the existing analyzer.
   * @param size the number of frequency bins. Should be a power of 2.
   * @param minDb Optional minimum decibels (corresponds to `AnalyserNode.minDecibels`)
   * @param maxDb Optional maximum decibels (corresponds to `AnalyserNode.maxDecibels`)
   * @param smooth Optional smoothing value (corresponds to `AnalyserNode.smoothingTimeConstant`)
   */
  analyze(
    size: number = 256,
    minDb: number = -100,
    maxDb: number = -30,
    smooth: number = 0.8,
  ): this {
    if (this.analyzer && this._node) {
      try {
        this._node.disconnect(this.analyzer.node);
      } catch {
        // the previous analyzer node was not connected
      }
    }
    const a = this._ctx.createAnalyser();
    a.fftSize = size * 2;
    a.minDecibels = minDb;
    a.maxDecibels = maxDb;
    a.smoothingTimeConstant = smooth;
    this.analyzer = {
      node: a,
      size: a.frequencyBinCount,
      data: new Uint8Array(a.frequencyBinCount),
    };
    this._node.connect(this.analyzer.node);
    return this;
  }

  // Get either time-domain or frequency domain
  protected _domain(time: boolean): Uint8Array {
    if (this.analyzer) {
      if (time) {
        this.analyzer.node.getByteTimeDomainData(
          this.analyzer.data as Parameters<
            AnalyserNode["getByteTimeDomainData"]
          >[0],
        );
      } else {
        this.analyzer.node.getByteFrequencyData(
          this.analyzer.data as Parameters<
            AnalyserNode["getByteFrequencyData"]
          >[0],
        );
      }
      return this.analyzer.data;
    }
    return new Uint8Array(0);
  }

  // Map domain data to another range, reusing the Pts in `out` when provided
  protected _domainTo(
    time: boolean,
    size: PtLike,
    position: PtLike = [0, 0],
    trim = [0, 0],
    out?: Group,
  ): Group {
    const data = time ? this.timeDomain() : this.freqDomain();
    const g = out || new Group();
    const len = data.length - trim[1];
    const count = Math.max(0, len - trim[0]);
    if (g.length > count) g.length = count;
    for (let i = trim[0], j = 0; i < len; i++, j++) {
      const x = position[0] + (size[0] * i) / len;
      const y = position[1] + (size[1] * data[i]) / 255;
      const p = g[j];
      if (p && p.length >= 2) {
        p[0] = x;
        p[1] = y;
      } else {
        g[j] = new Pt(x, y);
      }
    }
    return g;
  }

  /**
   * Get the raw time-domain data from analyzer as unsigned 8-bit integers. An analyzer must be added before calling this function (See [analyze](#function_analyze) function).
   */
  timeDomain(): Uint8Array {
    return this._domain(true);
  }

  /**
   * Map the time-domain data from analyzer to a range. An analyzer must be added before calling this function (See [analyze](#function_analyze) function).
   * @param size map each data point `[index, value]` to `[width, height]`
   * @param position Optionally, set a starting `[x, y]` position. Default is `[0, 0]`
   * @param trim Optionally, trim the start and end values by `[startTrim, data.length-endTrim]`
   * @param out Optionally, provide a `Group` (usually one returned by a previous call) whose Pts will be reused instead of allocating new ones — recommended when calling once per frame
   * @returns a Group containing the mapped values
   * @example form.point( s.timeDomainTo( space.size ) )
   */
  timeDomainTo(
    size: PtLike,
    position: PtLike = [0, 0],
    trim = [0, 0],
    out?: Group,
  ): Group {
    return this._domainTo(true, size, position, trim, out);
  }

  /**
   * Get the raw frequency-domain data from analyzer as unsigned 8-bit integers. An analyzer must be added before calling this function (See [analyze](#function_analyze) function).
   */
  freqDomain(): Uint8Array {
    return this._domain(false);
  }

  /**
   * Map the frequency-domain data from analyzer to a range. An analyzer must be added before calling this function (See [analyze](#function_analyze) function).
   * @param size map each data point `[index, value]` to `[width, height]`
   * @param position Optionally, set a starting `[x, y]` position. Default is `[0, 0]`
   * @param trim Optionally, trim the start and end values by `[startTrim, data.length-endTrim]`
   * @param out Optionally, provide a `Group` (usually one returned by a previous call) whose Pts will be reused instead of allocating new ones — recommended when calling once per frame
   * @returns a Group containing the mapped values
   * @example `form.point( s.freqDomainTo( space.size ) )`
   */
  freqDomainTo(
    size: PtLike,
    position: PtLike = [0, 0],
    trim = [0, 0],
    out?: Group,
  ): Group {
    return this._domainTo(false, size, position, trim, out);
  }

  /**
   * Stop playing and disconnect the AudioNode.
   */
  reset(): this {
    this.stop();
    if (this._node) this._node.disconnect();
    if (this._outputNode) this._outputNode.disconnect();
    return this;
  }

  // Get the gain node for volume control, creating and connecting it on first use
  protected _getGain(): GainNode {
    if (!this._gain) {
      this._gain = this._ctx.createGain();
      this._gain.gain.value = this._volume;
      this._gain.connect(this._ctx.destination);
    }
    return this._gain;
  }

  /**
   * Start playing. Internally this connects the `AudioNode` to `AudioContext`'s destination.
   * Calling `start( timeAt )` while a file or buffer sound is playing seeks to that time; a generated sound that is already playing is unaffected.
   * @param timeAt optional parameter to play from a specific time, in seconds
   */
  start(timeAt: number = 0): this {
    if (this._ctx.state === "suspended") this._ctx.resume();

    if (this._type === "file") {
      if (this._buffer) {
        // An AudioBufferSourceNode can only start once; re-create it for
        // replay, seek-while-playing, or when only the buffer was assigned
        if (this._playing || this._bufferPlayed || !this._node) {
          if (this._playing && this.progress < 1) {
            (this._node as AudioBufferSourceNode).stop();
          }
          this.createBuffer();
        }
        (this._node as AudioBufferSourceNode).start(0, timeAt);
        this._bufferPlayed = true;
        this._timestamp = this._ctx.currentTime - timeAt;
      } else {
        if (timeAt > 0) this._source.currentTime = timeAt;
        const played = this._source.play();
        if (played && played.catch) {
          played.catch(() => {
            // eg, autoplay was blocked — but only if a later start hasn't succeeded
            if (this._source.paused) this._playing = false;
          });
        }
      }
    } else if (this._type === "gen" && this._generated) {
      // restarting while playing would orphan the old oscillator, which keeps sounding
      if (this._playing) return this;
      const osc = this._node as OscillatorNode;
      this._gen(
        osc.type,
        osc.type === "custom" ? this._wave : osc.frequency.value,
      );
      (this._node as OscillatorNode).start();
    }

    // restore analysis and filter chains; duplicate connects are no-ops
    if (this.analyzer) this._node.connect(this.analyzer.node);
    for (const n of this._connected) this._node.connect(n);

    (this._outputNode || this._node).connect(this._getGain());
    this._playing = true;
    return this;
  }

  /**
   * Stop playing. Internally this also disconnects the `AudioNode` from `AudioContext`'s destination. Calling `stop` when the sound is not playing has no effect.
   */
  stop(): this {
    if (!this._playing) return this;
    (this._outputNode || this._node).disconnect(this._gain);

    if (this._type === "file") {
      if (this._buffer) {
        // Safari throws InvalidState error if stop() is called after finished playing
        if (this.progress < 1) (this._node as AudioBufferSourceNode).stop();
      } else {
        this._source.pause();
      }
    } else if (this._type === "gen") {
      if (this._generated) (this._node as OscillatorNode).stop();
    } else if (this._type === "input") {
      this._stream.getAudioTracks().forEach((track) => track.stop());
    }

    this._playing = false;
    return this;
  }

  /**
   * Toggle between `start` and `stop`.
   */
  toggle(): this {
    if (this._playing) {
      this.stop();
    } else {
      this.start();
    }
    return this;
  }

  /**
   * Stop playing and disconnect all nodes (including analyzer and volume), and release stream, source, and buffer references.
   * The instance should not be used after calling this. Note that this never closes an `AudioContext`: the shared context lives for the page, and a context you provided is yours to close.
   */
  dispose(): this {
    this.reset();
    if (this.analyzer) {
      this.analyzer.node.disconnect();
      this.analyzer = undefined!;
    }
    if (this._gain) {
      this._gain.disconnect();
      this._gain = undefined!;
    }
    this._connected = [];
    this._stream = undefined!;
    this._source = undefined!;
    this._buffer = undefined!;
    return this;
  }
}
