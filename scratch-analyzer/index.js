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
fileInput.addEventListener("change", fileChange);

async function fileChange({ data }) {
  if (data) {
    lastFiles = [data];
  } else {
    if (!toBoolean(this.files)) {
      if (lastFiles) this.files = lastFiles;
      return;
    }
    lastFiles = this.files;
  }
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
  ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  aData.forEach((bar) => {
    if (currentFrame === frame) bar[1] += (canvas.clientHeight * 0.5 * (analyzer.normalized[realFrame] || 0) + random(50, 100 + 50 * analyzer.normalized[realFrame]) - bar[1]) / 6;
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
