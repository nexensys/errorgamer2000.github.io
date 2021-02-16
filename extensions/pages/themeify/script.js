const storage = window.localStorage
const browserdata = detect.parse(navigator.userAgent)
const canHave = browserdata.browser.family == 'Chrome' || browserdata.browser.family == 'Firefox'
const newLine = `
`
var has = false,
    by = -50,
    frame = 0,
    ctrl = false,
    save = document.getElementById('save'),
    upload_btn = document.getElementById('load'),
    upload_picker = document.getElementById('uploader')

if (storage.getItem('errorgamer2000.github.io/extensions/pages/theme-o-matic')) {
	var data = JSON.parse(storage.getItem('errorgamer2000.github.io/extensions/pages/theme-o-matic'))
	document.getElementById('site').value = data.site
	csseditor.session.setValue(data.css)
	jseditor.session.setValue(data.js)
}

function hext() {
    has = true
    console.log("User has extension")
}
document.getElementById('ext-eg2000-Themeify').addEventListener('change', hext)

function tick() {
    frame++
    requestAnimationFrame(tick)
    if (document.getElementById('ext-eg2000-Themeify').innerText == 'true' && !has) {
        hext()
    }
    var circles = document.getElementsByClassName('circle')
    for (var i = 0; i < circles.length; i++) {
        circles[i].style.height = circles[i].clientWidth + 'px'
    }
    var y = window.scrollY
    if (y > 72) {
        by += (0 - by) / 10
        if (Math.abs(by) < 0.00001) by = 0
    } else {
        by += (-50 - by) / 10
    }
    var titlebar = document.getElementById('titlebar')
    var banner = document.getElementById('banner')
    titlebar.style.top = by + 'px'
}

csseditor.setTheme("ace/theme/tomorrow_night_eighties")

jseditor.setTheme("ace/theme/tomorrow_night_eighties")

window.onbeforeunload = function () {
    storage.setItem('errorgamer2000.github.io/extensions/pages/theme-o-matic', JSON.stringify({
    	site: document.getElementById('site').value,
    	css: csseditor.getValue(),
    	js: jseditor.getValue(),
    }));
};

tick()

document.addEventListener('keydown', function(event) {
	if (event.key == 'Control' || event.key == 'Command') ctrl = true
	if (ctrl && (event.key == 's' || event.key == 'S')) {
	    event.preventDefault();
	    save.click()
    }
})

document.addEventListener('keyup', function(event) {
	if (event.key == 'Control' || event.key == 'Command') ctrl = false
})

save.onclick = function() {
	var dataobj = {
		css: csseditor.getValue(),
		js: jseditor.getValue(),
		for: document.getElementById('site').value
	}
	download(`${document.getElementById('site').value}.themeify`, JSON.stringify(dataobj))
}


function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function readTheme(fileobj) {
    if (fileobj.length === 0) {
        console.log('No file is selected');
        return;
    }

    var reader = new FileReader();
    reader.onload = function(event) {
        var data = JSON.parse(event.target.result);
        csseditor.session.setValue(data.css)
        jseditor.session.setValue(data.js)
        document.getElementById('site').value = data.for
    };
    reader.readAsText(fileobj);
}

document.getElementById('uploader').onchange = function() {
	var upload = this.files[0]
	readTheme(upload)
}

upload_btn.onclick = function() {
    upload_picker.click()
}

upload_picker.onchange = function() {
	readTheme(this.files[0])
}
