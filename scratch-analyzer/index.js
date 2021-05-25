(function() {
const toBoolean = (e) =>
  typeof e === "boolean"
    ? e
    : typeof e === "string"
    ? e.toLowerCase() === "true"
      ? true
      : e.toLowerCase() === "false"
      ? false
      : Boolean(e)
    : typeof e === "object"
    ? Array.isArray(e)
      ? e.length > 0
      : Object.keys(e).length > 0
    : Boolean(e);

let lastFiles;
let counter = 0;
let canvas = document.querySelector("canvas");
let ctx = canvas.getContext("2d");
let frame = 0;
let stop = false;
let aData = [];
let analyzer;
const player = document.querySelector("audio");
let download;
Object.defineProperty(window, "volume", {
  get: () => player.volume,
  set: (v) => player.volume = v
})

const _addEventListener = Element.prototype.addEventListener;
const _removeEventListener = Element.prototype.removeEventListener;

Element.prototype.addEventListener = function (listeners, ...rest) {
  for (const listener of listeners.split(" ")) {
    _addEventListener.bind(this)(listener, ...rest);
  }
}

Element.prototype.removeEventListener = function (listeners, ...rest) {
  for (const listener of listeners.split(" ")) {
    _removeEventListener.bind(this)(listener, ...rest);
  }
}

scaleCanvas(canvas, ctx, 2);

ctx.fillStyle = "#ff9800";

document.querySelector("#uploadbtn").onclick = () => document.querySelector('input[type="file"]').click();

window.addEventListener("dragenter", (e) => {
  e.preventDefault();
  document.querySelector("#upload").classList.add("dropHover");
  counter++;
});
document.addEventListener("dragover", (e) => {
  e.preventDefault();
});
document.querySelector("#upload").addEventListener("drop", dropHandler, true);
window.addEventListener("dragleave", (e) => {
  if (--counter === 0) {
    e.preventDefault();
    document.querySelector("#upload").classList.remove("dropHover");
  }
});

function dropHandler(e) {
  e.preventDefault();
  document.querySelector("#upload").classList.remove("dropHover");
  if (e.dataTransfer.items) {
    fileChange({ data: e.dataTransfer.items[0].getAsFile() });
  } else {
    fileChange({ data: e.dataTransfer.files[0] });
  }
}

const fileInput = document.querySelector("input");
fileInput.addEventListener("change", fileChange.bind(fileInput));

async function fileChange({ data }) {
  if (data) {
    lastFiles = [data];
  } else {
    lastFiles = this.files;
  }
  let v = volume;
  volume = 0;
  player.pause();
  document.querySelector("#overlay").dataset.hidden = "false";
  (document.body || document.documentElement).classList.add("overlayed");
  player.dataset.hidden = "true";
  player.src = URL.createObjectURL(lastFiles[0]);
  player.load();
  const buffer = await lastFiles[0].arrayBuffer();
  analyzer = new Analyzer(AudioContext, buffer);
  await analyzer.init();
  analyzer.analyze();
  download = new Download(lastFiles[0].name.replace(/(.*)\..*/g, "$1[Scratch Audio Analyzer].txt"), analyzer.exportText);
  document.querySelector("#overlay").dataset.hidden = "true";
  (document.body || document.documentElement).classList.remove("overlayed");
  player.dataset.hidden = "false";
  let lnk = document.createElement("a");
  lnk.href = "#step2";
  (document.body || document.documentElement).append(lnk);
  lnk.click();
  (document.body || document.documentElement).removeChild(lnk);
  await player.play();
  volume = v;
  document.querySelector("#duration").innerText = `${m.ro((player.duration - m.ro(player.duration % 60)) / 60)}:${m.ro(player.duration % 60) < 10 ? `0${m.ro(player.duration % 60)}` : m.ro(player.duration % 60)}`;
  onResize();
  setButton(true);
  aData = [];
  for (let i = 0; i < m.f(canvas.clientWidth / 35) + 1; i++) {
    aData.push([35 * i + 2.5, 15]);
  }
  stop = true;
  render() && render();
  document.querySelector("#downloadbtn").onclick = () => download.init();
  player.addEventListener("ended", () => {
  	frame = 0;
    let lnk = document.createElement("a");
    lnk.href = "#step3";
    (document.body || document.documentElement).append(lnk);
    lnk.click();
    (document.body || document.documentElement).removeChild(lnk);
  });
}

function setButton(playing = false) {
  if (playing) {
    document.querySelector('[data-func]:not([disabled])').innerHTML = '<span class="iconify" data-icon="bx:bx-pause-circle" data-inline="true"></span>';
    document.querySelector('[data-func]:not([disabled])').dataset.func = "pause";
  } else {
    document.querySelector('[data-func]:not([disabled])').innerHTML = '<span class="iconify" data-icon="bx:bx-play-circle" data-inline="true"></span>';
    document.querySelector('[data-func]:not([disabled])').dataset.func = "play";
  }
}

function scaleCanvas(canv, cx, scale) {
  if (!(canv instanceof Element)) return false;
  let { width, height } = canv.getBoundingClientRect();
  canv.style.height = `${height}px`;
  canv.style.width = `${width}px`;
  canv.height = height * scale;
  canv.width = width * scale;
  cx = canv.getContext("2d");
  cx.scale(scale, scale);
}

function render() {
  if (stop) {
    stop = false;
    frame = 0;
    return true;
  }
  requestAnimationFrame(render);
  if (player.paused) return;
  frame += 0.5;
  let currentFrame = m.f(frame);
  let realFrame = m.f((player.currentTime / player.duration) * analyzer.normalized.length);
  if (currentFrame !== frame) return;
  ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  aData.forEach((bar) => {
    bar[1] += (canvas.clientHeight * 0.5 * (analyzer.normalized[realFrame] || 0) + random(50, 100 + 50 * analyzer.normalized[realFrame]) - bar[1]) / 6;
    ctx.fillRect(bar[0], 0, 30, bar[1]);
  });
}

function random(min, max, round = 0) {
  let mul = 1;
  for (let i = 0; i < round; i++) {
    mul *= 10;
  }
  return m.ro(mul * (m.r() * (max - min) + min)) / mul;
}

let playerControls = document.querySelector("#audioController");

function getWidth() {
  let list = playerControls.querySelector("ul");

  let width = 0;

  for (let child of list.children) {
    if (child.id === "playBar") {
      continue;
    }

    width += child.clientWidth;
  }

 return document.querySelector("#audioController").clientWidth - (width + 10);
}

let barWidth;

let percent = 0;

function onResize() {
  barWidth = getWidth();
  updatePercent(percent);
  document.querySelector("#playBar").querySelector("div").style.width = `${barWidth}px`;
}

function updatePercent(p, s = false) {
  document.querySelector("#barFill").style.width = `${barWidth * p}px`;
  document.querySelector("#barHandle").style.left = `${barWidth * p}px`;
  if(s) {
    player.currentTime = player.duration * p;
  }
}

let mousedown = false;

let mouseX = 0, mouseY = 0;

function onplayerbarclick(e) {
  if (e.type === "mousedown" && e.target.closest("#playBar > div")) {
    mousedown = true;
    document.querySelector("#barHandle").classList.add("focus");
    player.pause();
  } else {
    document.querySelector("#barHandle").classList.remove("focus");
    mousedown = false;
    player.play();
  }
  mousemove(e);
}

document.addEventListener("mousemove", mousemove);

function mousemove(ev) {
  if (!mousedown) return;
  const { clientX, clientY } = ev;
  mouseX = clientX;
  mouseY = clientY;
  const { left, right, width } = document.querySelector("#playBar > div").getBoundingClientRect();
  let percent = (clientX - left) / width;
  if (percent < 0) {
    percent = 0;
  } else if (percent > 1) {
    percent = 1;
  }

  updatePercent(percent, true);
}

playerControls.addEventListener("mousedown mouseup", onplayerbarclick);

window.addEventListener("resize", onResize);

setTimeout(onResize, 0);

player.addEventListener("timeupdate", (e) => {
  document.querySelector("#currentTime").innerText = `${m.ro((player.currentTime - m.ro(player.currentTime % 60)) / 60)}:${m.ro(player.currentTime % 60) < 10 ? `0${m.ro(player.currentTime % 60)}` : m.ro(player.currentTime % 60)}`;
  onResize();
  updatePercent(player.currentTime / player.duration);
})

playerControls.querySelector("[data-func]:not([disabled])").addEventListener("click", (e) => {
  if (!player.paused) {
    player.pause();
    setButton();
  } else {
    player.play();
    setButton(true);
  }
});

let open = false;

let volController = playerControls.querySelector("ul > li > button:not([data-func])");

volController.addEventListener("click", function() {
  document.querySelector("#volSlider").dataset.hidden = open.toString();
  open = !open;
})

let mousedown2 = false;

function onvolbarclick(e) {
  if (e.type === "mousedown" && e.target.closest("#volSlider > div > div")) {
    mousedown2 = true;
    document.querySelector("#volSlider > div > div > div").classList.add("focus");
  } else {
    document.querySelector("#volSlider > div > div > div").classList.remove("focus");
    mousedown2 = false;
  }
  mousemove2(e);
}

function mousemove2(ev) {
  if (!mousedown2) return;
  const { clientX, clientY } = ev;
  const { bottom, top, height } = document.querySelector("#volSlider > div").getBoundingClientRect();
  let percent = (height - (clientY - top)) / height;
  if (percent < 0) {
    percent = 0;
  } else if (percent > 1) {
    percent = 1;
  }

  volume = percent;

  document.querySelector("#volSlider > div > div").style.height = `${percent * height}px`
}

document.querySelector("#volSlider > div > div").style.height = `100px`

document.addEventListener("mousemove", mousemove2);

playerControls.addEventListener("mousedown mouseup", onvolbarclick);
})();
