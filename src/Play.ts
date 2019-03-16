import {ISoundAnalyzer, SoundType, PtLike} from "./Types";
import {Pt, Group} from "./Pt";

export class Sound {
  
  private _type:SoundType;

  /** The audio context */
  ctx:AudioContext;

  /** The audio node, which is usually a subclass liked OscillatorNode */
  node:AudioNode;

  /** The audio stream when streaming from input device */
  stream:MediaStream;

  /** Audio src when loading from file */
  source:HTMLMediaElement;

  /** Analyzer if any */
  analyzer:ISoundAnalyzer;
  
  protected _playing:boolean = false;

  /**
   * Construct a `Sound` instance. Usually you'll use one of the static method like `Sound.load` instead of this constructor.
   * @param type 
   */
  constructor( type:SoundType ) {
    this._type = type;
    this.ctx = new AudioContext();
  }


  /**
   * Create a `Sound` given an AudioNode and an AudioContext. See also [this example](../guide/js/examples/tone.html) using tone.js in the [guide](../guide/Sound-0800.html).
   * @param node an AudioNode instance
   * @param ctx an AudioContext instance
   * @param type a string representing a type of input source: either "file", "input", or "gen".
   * @param stream Optionally include a MediaStream, if the type is "input"
   * @returns a `Sound` instance
   */
  static from( node:AudioNode, ctx:AudioContext, type:SoundType="gen", stream?:MediaStream ) {
    let s = new Sound( type );
    s.node = node;
    s.ctx = ctx;
    if (stream) s.stream = stream;
    return s;
  }


  /**
   * Create a `Sound` by loading from a file or an <audio> element.
   * @param source either an url string to load the file, or an <audio> element.
   * @returns a `Sound` instance
   * @example `Sound.load( '/path/to/file.mp3' )`
   */
  static load( source:HTMLMediaElement|string ):Sound {
    let s = new Sound("file");
    s.source = (typeof source === 'string') ? new Audio(source) : source;
    s.source.addEventListener("ended", () => s._playing = false );
    s.node = s.ctx.createMediaElementSource( s.source );
    return s;
  }


  /**
   * Generate a `Sound` by generating a wave
   * @param type a string representing the waveform type: "sine", "square", "sawtooth", "triangle", "custom"
   * @param freq the frequency in Hz to play
   * @returns a `Sound` instance
   * @example `Sound.generate( 'sine', 120 )`
   */
  static generate( type:OscillatorType, freq:number ):Sound {
    return new Sound("gen")._gen( type, freq );
  }


  // Create the oscillator
  protected _gen( type:OscillatorType, freq:number ):Sound {
    this.node = this.ctx.createOscillator();
    let osc = (this.node as OscillatorNode);
    osc.type = type;
    osc.frequency.value = freq;
    return this;
  }


  /**
   * Create a `Sound` by streaming from an input device like microphone. This returns a Promise which resolves to a Sound instance. 
   * @param constraint @param constraint Optional constraints which can be used to select a specific input device. For example, you may use [`enumerateDevices`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices) to find a specific deviceId;
   * @returns a `Sound` instance
   * @example `Sound.input().then( s => sound = s );`
   */
  static async input( constraint?:MediaStreamConstraints ):Promise<Sound> {
    try {
      let s = new Sound("input"); 
      const c = constraint ? constraint : { audio: true, video: false };
      s.stream = await navigator.mediaDevices.getUserMedia( c );
      s.node = s.ctx.createMediaStreamSource( s.stream );
      return s;
    } catch (e) {
      console.error( "Cannot get audio from input device.");
      return Promise.resolve( null );
    }
  }


  /**
   * Get the type of sound input: "file", "input", or "gen"
   */
  get type():SoundType {
    return this._type;
  }


  /**
   * Whether the sound is currently playing
   */
  get playing():boolean {
    return this._playing;
  }


  /**
   * Whether the sound is ready to play. For loading from a file, this corresponds to ["canplaythrough"](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/readyState) event. 
   * You can also use `this.source.addEventListener( 'canplaythrough', ...)` if needed. See [documentation](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/canplaythrough_event).
   */
  get playable():boolean {
    return (this._type === "input") ? this.node !== undefined : this.source.readyState === 4;
  }


  /**
   * Get the number of bins in analyzer
   */
  get binSize():number {
    return this.analyzer.size;
  }


  /**
   * Get the sample rate of the audio. Usually 44100 hz.
   */
  get sampleRate():number {
    return this.ctx.sampleRate;
  }


  /**
   * If the sound is generated, this sets and gets the frequency of the tone.
   */
  get frequency():number {
    return (this._type === "gen") ? (this.node as OscillatorNode).frequency.value : 0;
  }
  set frequency( f:number ) {
    if (this._type === "gen") (this.node as OscillatorNode).frequency.value = f;
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
   * Get the raw time-domain data from analyzer as unsigned 8-bit integers.
   */
  timeDomain():Uint8Array {
    return this._domain( true );
  }


  /**
   * Map the time-domain data from analyzer to a range.
   * @param size map each data [index, value] to [width, height]
   * @param position Optionally, set a starting [x, y] position. Default is [0, 0]
   * @param trim Optionally, trim the start and end values by [startTrim, data.length-endTrim]
   * @returns a Group containing the mapped values
   * @example form.point( s.timeDomainTo( space.size ) )
   */
  timeDomainTo( size:PtLike, position:PtLike=[0,0], trim=[0,0] ):Group {
    return this._domainTo( true, size, position, trim );
  }
  

  /**
   * Get the raw frequency-domain data from analyzer as unsigned 8-bit integers.
   */
  freqDomain():Uint8Array {
    return this._domain( false );
  }


  /**
   * Map the frequency-domain data from analyzer to a range.
   * @param size map each data [index, value] to [width, height]
   * @param position Optionally, set a starting [x, y] position. Default is [0, 0]
   * @param trim Optionally, trim the start and end values by [startTrim, data.length-endTrim]
   * @returns a Group containing the mapped values
   * @example form.point( s.freqDomainTo( space.size ) )
   */
  freqDomainTo( size:PtLike, position:PtLike=[0,0], trim=[0,0] ):Group {
    return this._domainTo( false, size, position, trim );
  }
  

  /**
   * Connect another AudioNode to this `Sound` instance's AudioNode
   * @param node another AudioNode
   */
  connect( node:AudioNode ):this {
    this.node.connect( node );
    return this;
  }


  /**
   * Add an analyzer to this `Sound`. Call this once only.
   * @param size the number of frequency bins
   * @param minDb Optional minimum decibels (corresponds to AnalyserNode.minDecibels)
   * @param maxDb Optional maximum decibels (corresponds to AnalyserNode.maxDecibels)
   * @param smooth Optional smoothing value (corresponds to smoothingTimeConstant)
   */
  analyze( size:number=256, minDb:number=-100, maxDb:number=-30, smooth:number=0.8  ) {
    let a = this.ctx.createAnalyser();
    a.fftSize = size * 2;
    a.minDecibels = minDb;
    a.maxDecibels = maxDb;
    a.smoothingTimeConstant = smooth;
    this.analyzer = {
      node: a,
      size: a.frequencyBinCount,
      data: new Uint8Array(a.frequencyBinCount)
    };
    this.node.connect( this.analyzer.node );
    return this;
  }


  /**
   * Stop playing and disconnect the AudioNode
   */
  reset():this {
    this.stop();
    this.node.disconnect();
    return this;
  }


  /**
   * Start playing. Internally this connects the `AudioNode` to `AudioContext`'s destination.
   */
  start():this {
    if (this.ctx.state === 'suspended') this.ctx.resume();
    
    if (this._type === "file") {
      this.source.play();

    } else if (this._type === "gen") {
      this._gen( (this.node as OscillatorNode).type, (this.node as OscillatorNode).frequency.value );
      (this.node as OscillatorNode).start();
      if (this.analyzer) this.node.connect( this.analyzer.node );
    }

    this.node.connect( this.ctx.destination );
    this._playing = true;
    return this;
  }


  /**
   * Stop playing. Internally this also disconnects the `AudioNode` from `AudioContext`'s destination.
   */
  stop():this {
    
    if (this._playing) this.node.disconnect( this.ctx.destination );
    
    if (this._type === "file") {
      this.source.pause();

    } else if (this._type === "gen") {
      (this.node as OscillatorNode).stop();

    } else if (this._type === "input") {
      this.stream.getAudioTracks().forEach( track => track.stop() );
    }
    
    this._playing = false;
    return this;
  }


  /**
   * Toggle between `start` and `stop`
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