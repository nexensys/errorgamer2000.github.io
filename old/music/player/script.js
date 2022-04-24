var src = 0, files;
window.onload = function() {
  
  var file = document.getElementById("thefile");
  var audio = document.getElementById("audio");
  
  file.onchange = function() {
    files = this.files;
    src = 0
    audio.src = URL.createObjectURL(files[src]);
    audio.load();
    audio.play();
    var context = new AudioContext();
    var src = context.createMediaElementSource(audio);
    var analyser = context.createAnalyser();

    var canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    var ctx = canvas.getContext("2d");

    src.connect(analyser);
    analyser.connect(context.destination);

    analyser.fftSize = 256;

    var bufferLength = analyser.frequencyBinCount;
    console.log(bufferLength);

    var dataArray = new Uint8Array(bufferLength);

    var WIDTH = canvas.width;
    var HEIGHT = canvas.height;

    var barWidth = (WIDTH / bufferLength) * 2.5;
    var barHeight;
    var x = 0;

    function renderFrame() {
      requestAnimationFrame(renderFrame);

      x = 0;

      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      for (var i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i];
        
        var b = barHeight + (10 * (i/bufferLength));
        var g = 255 * (0.3+(i/bufferLength) * 2);
        var r = 255 - barHeight;

        ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
        ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    }

    audio.play();
    renderFrame();
  };
};
audio.addEventListener('ended', loadNext)

function loadNext() {
    src++
    if (src > files.length - 1) {
        src = 0
    }
    audio.src = ''
    audio.src = URL.createObjectURL(files[src]);
    audio.load();
    audio.play();
  };
window.onmousemove = logMouseMove;
var mousePos;
function logMouseMove(e) {
	e = event || window.event;	
	mousePos = { x: e.clientX, y: e.clientY };
	if (Number(mousePos.y) < window.innerHeight - 75) {
	    audio.style.display = "none"
	} else {
	    audio.style.display = "block"
	}
  var inputbar = document.getElementById('inputs')
  if (Number(mousePos.y) > 50) {
	    inputbar.style.display = "none"
	} else {
	    inputbar.style.display = "block"
	}
}
