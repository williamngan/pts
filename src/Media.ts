
export class Sound {
  
  ctx:AudioContext;
  track:AudioNode;
  source:HTMLMediaElement;
  protected _osc:OscillatorNode;
  protected _playing:boolean = false;

  constructor() {
    this.ctx = new AudioContext();
  }

  get playing():boolean {
    return this._playing;
  }

  load( source:HTMLMediaElement|string ):this {
    this.source = (typeof source === 'string') ? new Audio(source) : source;
    this.track = this.ctx.createMediaElementSource( this.source );
    this._osc = undefined;
    return this;
  }

  generate( type:OscillatorType, freq:number ):this {
    if (!this._osc) {
      this._osc = this.ctx.createOscillator();
      this._osc.start();
    }
    this._osc.type = type;
    this._osc.frequency.setValueAtTime( freq, this.ctx.currentTime );
    this.track = this._osc;
    return this;
  }


  to( node:AudioNode ):this {
    this.track.connect( node );
    return this;
  }

  reset():this {
    this.track.disconnect();
    return this;
  }

  play():this {
    if (this.ctx.state === 'suspended') this.ctx.resume();
    this.track.connect( this.ctx.destination );
    if (this.source) this.source.play();
    this._playing = true;
    return this;
  }

  stop():this {
    this.track.disconnect( this.ctx.destination );
    if (this.source) this.source.pause();
    this._playing = false;
    return this;
  }

  toggle():this {
    if (this._playing) {
      this.stop();
    } else {
      this.play();
    }
    return this;
  }

}