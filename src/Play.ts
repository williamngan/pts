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

  constructor( type:SoundType ) {
    this._type = type;
    this.ctx = new AudioContext();
  }


  static load( source:HTMLMediaElement|string ):Sound {
    let s = new Sound("file");
    s.source = (typeof source === 'string') ? new Audio(source) : source;
    s.source.addEventListener("ended", () => s._playing = false );
    s.node = s.ctx.createMediaElementSource( s.source );
    return s;
  }

  static generate( type:OscillatorType, freq:number ):Sound {
    return new Sound("gen")._gen( type, freq );
  }

  protected _gen( type:OscillatorType, freq:number ):Sound {
    this.node = this.ctx.createOscillator();
    let osc = (this.node as OscillatorNode);
    osc.type = type;
    osc.frequency.value = freq;
    return this;
  }


  /**
   * Get sound stream from an input device like microphone. This returns a Promise which resolves to a Sound instance.
   * @param constraint @param constraint Optional constraints which can be used to select a specific input device. For example, you may use [`enumerateDevices`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices) to find a specific deviceId;
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



  get type():SoundType {
    return this._type;
  }

  get playing():boolean {
    return this._playing;
  }

  // Can also use this.source.addEventListener( 'canplaythrough') https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/canplaythrough_event 
  // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/readyState
  get playable():boolean {
    return (this._type === "input") ? this.node !== undefined : this.source.readyState === 4;
  }

  get binSize():number {
    return this.analyzer.size;
  }

  get sampleRate():number {
    return this.ctx.sampleRate;
  }

  get frequency():number {
    return (this._type === "gen") ? (this.node as OscillatorNode).frequency.value : 0;
  }
  set frequency( f:number ) {
    if (this._type === "gen") (this.node as OscillatorNode).frequency.value = f;
  }


 
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

  protected _domainTo( time:boolean, size:PtLike, position:PtLike=[0,0], trim=[0,0] ):Group {
    let data = (time) ? this.timeDomain() : this.freqDomain() ;
    let g = new Group();
    for (let i=trim[0], len=data.length-trim[1]; i<len; i++) {
      g.push( new Pt( position[0] + size[0] * i/len, position[1] + size[1] * data[i]/255 ) );
    }
    return g;
  }

  timeDomain():Uint8Array {
    return this._domain( true );
  }

  timeDomainTo( size:PtLike, position:PtLike=[0,0], trim=[0,0] ):Group {
    return this._domainTo( true, size, position );
  }
  
  freqDomain():Uint8Array {
    return this._domain( false );
  }

  freqDomainTo( size:PtLike, position:PtLike=[0,0], trim=[0,0] ):Group {
    return this._domainTo( false, size, position, trim );
  }
  

  connect( node:AudioNode ):this {
    this.node.connect( node );
    return this;
  }


  /**
   * 
   * @param size 
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

  reset():this {
    this.stop();
    this.node.disconnect();
    return this;
  }

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

  toggle():this {
    if (this._playing) {
      this.stop();
    } else {
      this.start();
    }
    return this;
  }


}