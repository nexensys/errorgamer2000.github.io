class Analyzer {
  constructor(ac, b) {
    this.context = new ac();
    this.bufferarray = b;
    this.initiated = false;
  }
  analyze() {
    if (!this.initiated) throw new Error("Analyzer needs initiation. To initiate call <analyzer>.init().then(<analyzer>.analyze).");
    c.l("Analyzing");
    this.filter();
    this.normalize();
    this.exportText = this.normalized.join("\n");
    c.l(this.exportText);
  }
  filter() {
    if (!this.initiated) return false;
    let raw = this.audiobuffer.getChannelData(0);
    let blockSize = m.f(1 / (30 / this.audiobuffer.sampleRate));
    let samples = m.f((1 / blockSize) * raw.length);
    let filtered = [];
    for (let i = 0; i < samples; i++) {
      let start = blockSize * i;
      let sum = 0;
      for (let ii = 0; ii < blockSize; ii++) {
        sum += m.a(raw[start + ii]);
      }
      filtered.push(sum / blockSize);
    }
    this.filtered = filtered;
  }
  normalize() {
    let mul = m.p(m.m(...this.filtered), -1);
    this.normalized = this.filtered.map((block) => block * mul);
  }
}

Object.defineProperty(Analyzer.prototype, "init", {
  value: async function () {
    this.audiobuffer = await this.context.decodeAudioData(this.bufferarray);
    delete this.bufferarray;
    this.initiated = true;
  },
  enumerable: false,
});
