import {Pt, Group} from "./Pt";
import {Num} from "./Num";
import {ITempoListener, ITempoStartFn, ITempoProgressFn, ITempoResponses} from "./Types";
import {ISoundAnalyzer, SoundType, PtLike} from "./Types";

/**
 * Tempo helps you create synchronized and rhythmic animations.
 */
export class Tempo {

  protected _bpm: number; // beat per minute
  protected _ms: number; // millis per beat

  protected _listeners:{ [key:string]:ITempoListener } = {};
  protected _listenerInc:number = 0;

  /**
   * Construct a new Tempo instance by beats-per-minute. Alternatively, you can use [`Tempo.fromBeat`](#link) to create from milliseconds.
   * @param bpm beats per minute
   */
  constructor( bpm:number ) {
    this.bpm = bpm;
  }

  /**
   * Create a new Tempo instance by specifying milliseconds-per-beat.
   * @param ms milliseconds per beat
   */
  static fromBeat( ms:number ):Tempo {
    return new Tempo( 60000 / ms );
  }

  /**
   * Beats-per-minute value
   */
  get bpm():number { return this._bpm; }
  set bpm( n:number ) {
    this._bpm = n;
    this._ms = 60000 / this._bpm;
  }

  /**
   * Milliseconds per beat (Note that this is derived from the bpm value).
   */
  get ms():number { return this._ms; }
  set ms( n:number ) {
    this._bpm = Math.floor( 60000/n );
    this._ms = 60000 / this._bpm;
  }

  
  // Get a listener unique id
  protected _createID( listener:ITempoListener|Function ):string {
    let id:string = '';
    if (typeof listener === 'function') {
      id = '_b'+(this._listenerInc++);
    } else {
      id = listener.name || '_b'+(this._listenerInc++);
    }
    return id;
  }


  /**
   * This is a core function that let you specify a rhythm and then define responses by calling the `start` and `progress` functions from the returned object. See [Animation guide](../guide/Animation-0700.html) for more details.
   * The `start` function lets you set a callback on every start. It takes a function ([`ITempoStartFn`](#link)).
   * The `progress` function lets you set a callback during progress. It takes a function ([`ITempoProgressFn`](#link)). Both functions let you optionally specify a time offset and a custom name.
   * See [Animation guide](../guide/animation-0700.html) for more details.
   * @param beats a rhythm in beats as a number or an array of numbers
   * @example `tempo.every(2).start( (count) => ... )`, `tempo.every([2,4,6]).progress( (count, t) => ... )`
   * @returns an object with chainable functions 
   */
  every( beats:number|number[] ):ITempoResponses {
    let self = this;
    let p = Array.isArray(beats) ? beats[0] : beats;

    return {
      start: function (fn:ITempoStartFn, offset:number=0, name?:string): string {
        let id = name || self._createID( fn );        
        self._listeners[id] = { name: id, beats: beats, period: p, index: 0, offset: offset, duration: -1, smooth: false, fn: fn };
        return this;
      },

      progress: function (fn:ITempoProgressFn, offset:number=0, name?:string ): string {
        let id = name || self._createID( fn ); 
        self._listeners[id] = { name: id, beats: beats, period: p, index: 0, offset: offset, duration: -1, smooth: true, fn: fn };
        return this;
      }
    };
  }


  /**
   * Usually you can add a tempo instance to a space via [`Space.add`](#link) and it will track time automatically. 
   * But if necessary, you can track time manually via this function.
   * @param time current time in milliseconds
   */
  track( time ) {
    for (let k in this._listeners) {
      if (this._listeners.hasOwnProperty(k)) {

        let li = this._listeners[k];
        let _t = (li.offset) ? time + li.offset : time; 
        let ms = li.period * this._ms; // time per period
        let isStart = false;

        if (_t > li.duration + ms) {
          li.duration = _t - (_t % this._ms); // update 
          if (Array.isArray( li.beats )) { // find next period from array
            li.index = (li.index + 1) % li.beats.length;
            li.period = li.beats[ li.index ];
          }
          isStart = true;
        }

        let count = Math.max(0, Math.ceil( Math.floor(li.duration / this._ms)/li.period ) );
        let params = (li.smooth) ? [count, Num.clamp( (_t - li.duration)/ms, 0, 1), _t, isStart] : [count]; 
        let done = li.fn.apply( li, params );
        if (done) delete this._listeners[ li.name ];
      }
    }
  }


  /**
   * Remove a `start` or `progress` callback function from the list of callbacks. See [`Tempo.every`](#link) for details
   * @param name a name string specified when creating the callback function.
   */
  stop( name:string ):void {
    if (this._listeners[name]) delete this._listeners[name];
  }


  /**
   * Internal implementation for use when adding into Space
   */
  protected animate( time, ftime ) {
    this.track( time );
  }

}



/**
 * Sound class simplifies common tasks like audio inputs and visualizations using a subset of Web Audio API. It can be used with other audio libraries like tone.js, and extended to support additional web audio functions. See [the guide](../guide/Sound-0800.html) to get started.
 */
export class Sound {
  
  private _type:SoundType;

  /** The audio context */
  _ctx:AudioContext;

  /** The audio node, which is usually a subclass liked OscillatorNode */
  _node:AudioNode;

  /** The audio stream when streaming from input device */
  _stream:MediaStream;

  /** Audio src when loading from file */
  _source:HTMLMediaElement;

  /* Audio buffer when using AudioBufferSourceNode */
  _buffer:AudioBuffer;

  /** Analyzer if any */
  analyzer:ISoundAnalyzer;

  protected _playing:boolean = false;

  protected _timestamp:number; // Tracking play time against ctx.currentTime

  /**
   * Construct a `Sound` instance. Usually, it's more convenient to use one of the static methods like [`Sound.load`](#function_load) or [`Sound.from`](#function_from). 
   * @param type a `SoundType` string: "file", "input", or "gen"
   */
  constructor( type:SoundType ) {
    this._type = type;
    // @ts-ignore
    let _ctx = window.AudioContext || window.webkitAudioContext || false; 
    if (!_ctx) throw( new Error("Your browser doesn't support Web Audio. (No AudioContext)") );
    this._ctx = (_ctx) ? new _ctx() : undefined;
  }


  /**
   * Create a `Sound` given an [AudioNode](https://developer.mozilla.org/en-US/docs/Web/API/AudioNode) and an [AudioContext](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext) from Web Audio API. See also [this example](../guide/js/examples/tone.html) using tone.js in the [guide](../guide/Sound-0800.html).
   * @param node an AudioNode instance
   * @param ctx an AudioContext instance
   * @param type a string representing a type of input source: either "file", "input", or "gen".
   * @param stream Optionally include a MediaStream, if the type is "input"
   * @returns a `Sound` instance
   */
  static from( node:AudioNode, ctx:AudioContext, type:SoundType="gen", stream?:MediaStream ) {
    let s = new Sound( type );
    s._node = node;
    s._ctx = ctx;
    if (stream) s._stream = stream;
    return s;
  }


  /**
   * Create a `Sound` by loading from a sound file or an audio element.
   * @param source either an url string to load a sound file, or an audio element.
   * @param crossOrigin whether to support loading cross-origin. Default is "anonymous".
   * @returns a `Sound` instance
   * @example `Sound.load( '/path/to/file.mp3' )`
   */
  static load( source:HTMLMediaElement|string, crossOrigin:string="anonymous" ):Promise<Sound> {
    return new Promise( (resolve, reject) => {
      let s = new Sound("file");
      s._source = (typeof source === 'string') ? new Audio(source) : source;
      s._source.autoplay = false;
      (s._source as HTMLMediaElement).crossOrigin = crossOrigin;
      s._source.addEventListener("ended", function () { s._playing = false; } );
      s._source.addEventListener('error', function () { reject("Error loading sound"); });
      s._source.addEventListener('canplaythrough', function () {
        s._node = s._ctx.createMediaElementSource( s._source );
        resolve( s );
      });
    });

  }


  /**
   * Create a `Sound` by loading from a sound file url as `AudioBufferSourceNode`. This method is cumbersome since it can only be played once. 
   * Use this method for now if you need to visualize sound in Safari and iOS. Once Apple has full support for FFT with streaming `HTMLMediaElement`, this method will likely be deprecated.
   * @param url an url to the sound file
   */
  static loadAsBuffer( url:string ):Promise<Sound> {
    return new Promise( (resolve, reject) => {
      let request = new XMLHttpRequest();
      request.open('GET', url, true);
      request.responseType = 'arraybuffer';

      let s = new Sound("file");
      request.onload = function() {
        s._ctx.decodeAudioData(request.response, function(buffer) { // Decode asynchronously
          s.createBuffer( buffer );
          resolve( s );
        }, (err) => reject("Error decoding audio") );
      };
      request.send();
    });
  }


  /**
   * Create or re-use an AudioBuffer. Only needed if you are using `Sound.loadAsBuffer`.
   * @param buf an AudioBuffer. Optionally, you can call this without parameters to re-use existing buffer.
   */
  protected createBuffer( buf:AudioBuffer ):this {
    this._node = this._ctx.createBufferSource();
    if (buf !== undefined) this._buffer = buf;
    
    (this._node as AudioBufferSourceNode).buffer = this._buffer; // apply or re-use buffer
    (this._node as AudioBufferSourceNode).onended = () => { this._playing = false; };
    return this;
  }


  /**
   * Create a `Sound` by generating a waveform using [OscillatorNode](https://developer.mozilla.org/en-US/docs/Web/API/OscillatorNode).
   * @param type a string representing the waveform type: "sine", "square", "sawtooth", "triangle", "custom"
   * @param val the frequency value in Hz to play, or a PeriodicWave instance if type is "custom".
   * @returns a `Sound` instance
   * @example `Sound.generate( 'sine', 120 )`
   */
  static generate( type:OscillatorType, val:number|PeriodicWave ):Sound {
    let s = new Sound("gen");
    return s._gen( type, val );
  }


  // Create the oscillator
  protected _gen( type:OscillatorType, val:number|PeriodicWave ):Sound {
    this._node = this._ctx.createOscillator();
    let osc = (this._node as OscillatorNode);
    osc.type = type;
    if (type === 'custom') {
      osc.setPeriodicWave( val as PeriodicWave );
    } else {
      osc.frequency.value = val as number;
    }
    return this;
  }


  /**
   * Create a `Sound` by streaming from an input device like microphone. Note that this function returns a Promise which resolves to a Sound instance. 
   * @param constraint @param constraint Optional constraints which can be used to select a specific input device. For example, you may use [`enumerateDevices`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices) to find a specific deviceId;
   * @returns a `Promise` which resolves to `Sound` instance
   * @example `Sound.input().then( s => sound = s );`
   */
  static async input( constraint?:MediaStreamConstraints ):Promise<Sound> {
    try {
      let s = new Sound("input"); 
      if (!s) return undefined;
      const c = constraint ? constraint : { audio: true, video: false };
      s._stream = await navigator.mediaDevices.getUserMedia( c );
      s._node = s._ctx.createMediaStreamSource( s._stream );
      return s;
    } catch (e) {
      console.error( "Cannot get audio from input device.");
      return Promise.resolve( null );
    }
  }


  /**
   * Get this Sound's AudioContext instance for advanced use-cases.
   */
  get ctx():AudioContext { return this._ctx; }


  /**
   * Get this Sound's AudioNode subclass instance for advanced use-cases.
   */
  get node():AudioNode { return this._node; }


  /**
   * Get this Sound's MediaStream (eg, from microphone, if in use) instance for advanced use-cases. See [`Sound.input`](#link)
   */
  get stream():MediaStream { return this._stream; }


  /**
   * Get this Sound's Audio element (if used) instance for advanced use-cases. See [`Sound.load`](#link).
   */
  get source():HTMLMediaElement { return this._source; }


  /**
   * Get this Sound's AudioBuffer (if any) instance for advanced use-cases. See [`Sound.loadAsBuffer`](#link).
   */
  get buffer():AudioBuffer { return this._buffer; }
  set buffer( b:AudioBuffer ) { this._buffer = b; }


  /**
   * Get the type of input for this Sound instance. Either "file", "input", or "gen"
   */
  get type():SoundType { return this._type; }


  /**
   * Indicate whether the sound is currently playing.
   */
  get playing():boolean { return this._playing; }


  /**
   * A value between 0 to 1 to indicate playback progress.
   */
  get progress():number {
    let dur = 0;
    let curr = 0;
    if (!!this._buffer) {
      dur = this._buffer.duration;
      curr = (this._timestamp) ? this._ctx.currentTime - this._timestamp : 0;
    } else { 
      dur = this._source.duration;
      curr = this._source.currentTime;
    }
    return curr / dur;
  }


  /**
   * Indicate whether the sound is ready to play. When loading from a file, this corresponds to a ["canplaythrough"](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/readyState) event. 
   * You can also use `this.source.addEventListener( 'canplaythrough', ...)` if needed. See also [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/canplaythrough_event).
   */
  get playable():boolean {
    return (this._type === "input") ? this._node !== undefined : (!!this._buffer || this._source.readyState === 4);
  }


  /**
   * If an analyzer is added (see [`analyze`](##unction_analyze) function), get the number of frequency bins in the analyzer.
   */
  get binSize():number {
    return this.analyzer.size;
  }


  /**
   * Get the sample rate of the audio, for example, at 44100 hz.
   */
  get sampleRate():number {
    return this._ctx.sampleRate;
  }


  /**
   * If the sound is generated, this sets and gets the frequency of the tone.
   */
  get frequency():number {
    return (this._type === "gen") ? (this._node as OscillatorNode).frequency.value : 0;
  }
  set frequency( f:number ) {
    if (this._type === "gen") (this._node as OscillatorNode).frequency.value = f;
  }


  /**
   * Connect another AudioNode to this `Sound` instance's AudioNode. Using this function, you can extend the capabilities of this `Sound` instance for advanced use cases such as filtering.
   * @param node another AudioNode
   */
  connect( node:AudioNode ):this {
    this._node.connect( node );
    return this;
  }


  /**
   * Add an analyzer to this `Sound`. Call this once only.
   * @param size the number of frequency bins
   * @param minDb Optional minimum decibels (corresponds to `AnalyserNode.minDecibels`)
   * @param maxDb Optional maximum decibels (corresponds to `AnalyserNode.maxDecibels`)
   * @param smooth Optional smoothing value (corresponds to `AnalyserNode.smoothingTimeConstant`)
   */
  analyze( size:number=256, minDb:number=-100, maxDb:number=-30, smooth:number=0.8  ) {
    let a = this._ctx.createAnalyser();
    a.fftSize = size * 2;
    a.minDecibels = minDb;
    a.maxDecibels = maxDb;
    a.smoothingTimeConstant = smooth;
    this.analyzer = {
      node: a,
      size: a.frequencyBinCount,
      data: new Uint8Array(a.frequencyBinCount)
    };
    this._node.connect( this.analyzer.node );
    return this;
  }


  // Get either time-domain or frequency domain
  protected _domain( time:boolean ):Uint8Array {
    if (this.analyzer) {
      if (time) {
        this.analyzer.node.getByteTimeDomainData( this.analyzer.data );
      } else {
        this.analyzer.node.getByteFrequencyData( this.analyzer.data );
      }
      return this.analyzer.data;
    }
    return new Uint8Array(0);
  }


  // Map domain data to another range
  protected _domainTo( time:boolean, size:PtLike, position:PtLike=[0,0], trim=[0,0] ):Group {
    let data = (time) ? this.timeDomain() : this.freqDomain() ;
    let g = new Group();
    for (let i=trim[0], len=data.length-trim[1]; i<len; i++) {
      g.push( new Pt( position[0] + size[0] * i/len, position[1] + size[1] * data[i]/255 ) );
    }
    return g;
  }


  /**
   * Get the raw time-domain data from analyzer as unsigned 8-bit integers. An analyzer must be added before calling this function (See [analyze](#function_analyze) function).
   */
  timeDomain():Uint8Array {
    return this._domain( true );
  }


  /**
   * Map the time-domain data from analyzer to a range. An analyzer must be added before calling this function (See [analyze](#function_analyze) function).
   * @param size map each data point `[index, value]` to `[width, height]`
   * @param position Optionally, set a starting `[x, y]` position. Default is `[0, 0]`
   * @param trim Optionally, trim the start and end values by `[startTrim, data.length-endTrim]`
   * @returns a Group containing the mapped values
   * @example form.point( s.timeDomainTo( space.size ) )
   */
  timeDomainTo( size:PtLike, position:PtLike=[0,0], trim=[0,0] ):Group {
    return this._domainTo( true, size, position, trim );
  }
  

  /**
   * Get the raw frequency-domain data from analyzer as unsigned 8-bit integers. An analyzer must be added before calling this function (See [analyze](#function_analyze) function).
   */
  freqDomain():Uint8Array {
    return this._domain( false );
  }


  /**
   * Map the frequency-domain data from analyzer to a range. An analyzer must be added before calling this function (See [analyze](#function_analyze) function).
   * @param size map each data point `[index, value]` to `[width, height]`
   * @param position Optionally, set a starting `[x, y]` position. Default is `[0, 0]`
   * @param trim Optionally, trim the start and end values by `[startTrim, data.length-endTrim]`
   * @returns a Group containing the mapped values
   * @example `form.point( s.freqDomainTo( space.size ) )`
   */
  freqDomainTo( size:PtLike, position:PtLike=[0,0], trim=[0,0] ):Group {
    return this._domainTo( false, size, position, trim );
  }


  /**
   * Stop playing and disconnect the AudioNode.
   */
  reset():this {
    this.stop();
    this._node.disconnect();
    return this;
  }


  /**
   * Start playing. Internally this connects the `AudioNode` to `AudioContext`'s destination.
   * @param timeAt optional parameter to play from a specific time
   */
  start( timeAt:number=0 ):this {
    if (this._ctx.state === 'suspended') this._ctx.resume();
    
    if (this._type === "file") {
      if (!!this._buffer) {
        (this._node as AudioBufferSourceNode).start(timeAt);
        this._timestamp = this._ctx.currentTime + timeAt;
      } else { 
        this._source.play();
        if (timeAt > 0) this._source.currentTime = timeAt;
      }
    } else if (this._type === "gen") {
      this._gen( (this._node as OscillatorNode).type, (this._node as OscillatorNode).frequency.value );
      (this._node as OscillatorNode).start();
      if (this.analyzer) this._node.connect( this.analyzer.node );
    }

    this._node.connect( this._ctx.destination );
    this._playing = true;
    return this;
  }


  /**
   * Stop playing. Internally this also disconnects the `AudioNode` from `AudioContext`'s destination.
   */
  stop():this {
    
    if (this._playing) this._node.disconnect( this._ctx.destination );
    
    if (this._type === "file") {
      if (!!this._buffer) {
        // Safari throws InvalidState error if stop() is called after finished playing
        if (this.progress < 1) (this._node as AudioBufferSourceNode).stop(); 
      } else {
        this._source.pause();
      }

    } else if (this._type === "gen") {
      (this._node as OscillatorNode).stop();

    } else if (this._type === "input") {
      this._stream.getAudioTracks().forEach( track => track.stop() );
    }
    
    this._playing = false;
    return this;
  }


  /**
   * Toggle between `start` and `stop`. This won't work if using [`Sound.loadAsBuffer`](#link), since `AudioBuffer` can only be played once. (See [`Sound.createBuffer`](#link) to reset buffer for replay).
   */
  toggle():this {
    if (this._playing) {
      this.stop();
    } else {
      this.start();
    }
    return this;
  }


}