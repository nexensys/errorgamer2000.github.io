window.AudioContext = window.AudioContext || window.webkitAudioContext; //Set Up AudioContext

//Shorthand

const ShortHand = class {
  constructor(o) {
    for (let f of Object.getOwnPropertyNames(o)) {
      let n = f[0];
      while (n in this) {
        n += f[n.length];
      }
      this[n] = o[f];
    }
  }
};

const Download = class {
  constructor(n, t) {
    this.n = n;
    this.t = t;
  }
  init() {
    let e = document.createElement("a");
    e.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(this.t));
    e.setAttribute("download", this.n);
    e.style.display = "none";
    document.body.appendChild(e);
    e.click();
    document.body.removeChild(e);
  }
};

const c = new ShortHand(console);

const m = new ShortHand(Math);

scratchblocks.renderMatching("code.block", {
  style:     'scratch3',
  inline: true,
});

scratchblocks.renderMatching("pre.blocks", {
  style:     'scratch3',
});
