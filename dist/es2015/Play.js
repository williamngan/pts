var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Pt, Group } from "./Pt";
export class Sound {
    constructor(type) {
        this._playing = false;
        this._type = type;
        this.ctx = new AudioContext();
    }
    static from(node, ctx, type = "gen", stream) {
        let s = new Sound(type);
        s.node = node;
        s.ctx = ctx;
        if (stream)
            s.stream = stream;
        return s;
    }
    static load(source) {
        let s = new Sound("file");
        s.source = (typeof source === 'string') ? new Audio(source) : source;
        s.source.addEventListener("ended", () => s._playing = false);
        s.node = s.ctx.createMediaElementSource(s.source);
        return s;
    }
    static generate(type, val) {
        return new Sound("gen")._gen(type, val);
    }
    _gen(type, val) {
        this.node = this.ctx.createOscillator();
        let osc = this.node;
        osc.type = type;
        if (type === 'custom') {
            osc.setPeriodicWave(val);
        }
        else {
            osc.frequency.value = val;
        }
        return this;
    }
    static input(constraint) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let s = new Sound("input");
                const c = constraint ? constraint : { audio: true, video: false };
                s.stream = yield navigator.mediaDevices.getUserMedia(c);
                s.node = s.ctx.createMediaStreamSource(s.stream);
                return s;
            }
            catch (e) {
                console.error("Cannot get audio from input device.");
                return Promise.resolve(null);
            }
        });
    }
    get type() {
        return this._type;
    }
    get playing() {
        return this._playing;
    }
    get playable() {
        return (this._type === "input") ? this.node !== undefined : this.source.readyState === 4;
    }
    get binSize() {
        return this.analyzer.size;
    }
    get sampleRate() {
        return this.ctx.sampleRate;
    }
    get frequency() {
        return (this._type === "gen") ? this.node.frequency.value : 0;
    }
    set frequency(f) {
        if (this._type === "gen")
            this.node.frequency.value = f;
    }
    connect(node) {
        this.node.connect(node);
        return this;
    }
    analyze(size = 256, minDb = -100, maxDb = -30, smooth = 0.8) {
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
        this.node.connect(this.analyzer.node);
        return this;
    }
    _domain(time) {
        if (this.analyzer) {
            if (time) {
                this.analyzer.node.getByteTimeDomainData(this.analyzer.data);
            }
            else {
                this.analyzer.node.getByteFrequencyData(this.analyzer.data);
            }
            return this.analyzer.data;
        }
        return new Uint8Array(0);
    }
    _domainTo(time, size, position = [0, 0], trim = [0, 0]) {
        let data = (time) ? this.timeDomain() : this.freqDomain();
        let g = new Group();
        for (let i = trim[0], len = data.length - trim[1]; i < len; i++) {
            g.push(new Pt(position[0] + size[0] * i / len, position[1] + size[1] * data[i] / 255));
        }
        return g;
    }
    timeDomain() {
        return this._domain(true);
    }
    timeDomainTo(size, position = [0, 0], trim = [0, 0]) {
        return this._domainTo(true, size, position, trim);
    }
    freqDomain() {
        return this._domain(false);
    }
    freqDomainTo(size, position = [0, 0], trim = [0, 0]) {
        return this._domainTo(false, size, position, trim);
    }
    reset() {
        this.stop();
        this.node.disconnect();
        return this;
    }
    start() {
        if (this.ctx.state === 'suspended')
            this.ctx.resume();
        if (this._type === "file") {
            this.source.play();
        }
        else if (this._type === "gen") {
            this._gen(this.node.type, this.node.frequency.value);
            this.node.start();
            if (this.analyzer)
                this.node.connect(this.analyzer.node);
        }
        this.node.connect(this.ctx.destination);
        this._playing = true;
        return this;
    }
    stop() {
        if (this._playing)
            this.node.disconnect(this.ctx.destination);
        if (this._type === "file") {
            this.source.pause();
        }
        else if (this._type === "gen") {
            this.node.stop();
        }
        else if (this._type === "input") {
            this.stream.getAudioTracks().forEach(track => track.stop());
        }
        this._playing = false;
        return this;
    }
    toggle() {
        if (this._playing) {
            this.stop();
        }
        else {
            this.start();
        }
        return this;
    }
}
//# sourceMappingURL=Play.js.map