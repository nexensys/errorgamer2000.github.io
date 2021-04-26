setPercent($(".skillBar#skill-math > div"), 0);
setPercent($(".skillBar#skill-js > div"), 0);
setPercent($(".skillBar#skill-html > div"), 0);
setPercent($(".skillBar#skill-css > div"), 0);
setPercent($(".skillBar#skill-node > div"), 0);
setPercent($(".skillBar#skill-scratch > div"), 0);
setPercent($(".skillBar#skill-gaming > div"), 0);

$("#statContainer").hide();

$("#ghStatContainer").hide();

$(() => {
    console.log("Document ready");

    $(window).scroll(() => {
        $("#navbar").attr("data-shadow", (scrollY >= 350).toString());
    });

    $(window).resize(() => {
        let scrollHandler = (e) => {
            if (e.target.scrollLeft < e.target.scrollWidth - 1 - e.target.clientWidth && e.target.scrollLeft > 0) {
                $(e.target).attr("data-overflow", "both");
            } else if (e.target.scrollLeft > 0) {
                $(e.target).attr("data-overflow", "left");
            } else if (e.target.scrollLeft < e.target.scrollWidth - e.target.clientWidth) {
                $(e.target).attr("data-overflow", "right");
            } else {
                $(e.target).attr("data-overflow", "none");
            }
        };

        setPercent($(".skillBar#skill-math > div"), 95);
        setPercent($(".skillBar#skill-js > div"), 80);
        setPercent($(".skillBar#skill-html > div"), 60);
        setPercent($(".skillBar#skill-css > div"), 70);
        setPercent($(".skillBar#skill-node > div"), 20);
        setPercent($(".skillBar#skill-scratch > div"), 90);
        setPercent($(".skillBar#skill-gaming > div"), 85);

        $("#navbar-main")[0].removeEventListener("scroll", scrollHandler);
        $("#navbar-main")[0].addEventListener("scroll", scrollHandler);

        scrollHandler({ target: $("#navbar-main")[0] });
    });

    $(window).trigger("resize");
    $(window).trigger("scroll");

    setPercent($(".skillBar#skill-math > div"), 95);
    setPercent($(".skillBar#skill-js > div"), 80);
    setPercent($(".skillBar#skill-html > div"), 60);
    setPercent($(".skillBar#skill-css > div"), 70);
    setPercent($(".skillBar#skill-node > div"), 20);
    setPercent($(".skillBar#skill-scratch > div"), 90);
    setPercent($(".skillBar#skill-gaming > div"), 85);
    $("#requestForm").submit((e) => {
        e.preventDefault();
        let n = $("#gdName")[0].value;
        let l = $("#gdLevel")[0].value;
        let msg = $("#reqmsg")[0].value;
        window.open(`mailto:error2000gamer@gmail.com?subject=Level Request for ${l} by ${n}&body=Message from ${n}: ${msg}`, "_blank", "toolbar=0,location=0,menubar=0");
    });
    $("#contactForm").submit((e) => {
        e.preventDefault();
        let n = $("#contactName")[0].value;
        let s = $("#contactSubj")[0].value;
        let msg = $("#contactmsg")[0].value;
        window.open(`mailto:error2000gamer@gmail.com?subject=Message from ${n}: ${s}&body=${msg}`, "_blank", "toolbar=0,location=0,menubar=0");
    });

    let int = {
        up: undefined,
        down: undefined,
    };

    $("#numArrows > .up").mousedown(() => {
        $("#gdLevel")[0].value++;
        int.up = setInterval(() => {
            $("#gdLevel")[0].value++;
        }, 100)
    }).mouseup(() => {
        clearInterval(int.up);
        $("#gdLevel")[0].focus();
    })

    $("#numArrows > .down").mousedown(() => {
        if($("#gdLevel")[0].value > 0) $("#gdLevel")[0].value--;
        else $("#gdLevel")[0].value = 0;
        int.down = setInterval(() => {
            if($("#gdLevel")[0].value > 0) $("#gdLevel")[0].value--;
        }, 100)
    }).mouseup(() => {
        clearInterval(int.down);
        $("#gdLevel")[0].focus();
    })

    getGhStats()
    getScratchStats();
});

function setPercent(bar, percent) {
    let p = bar.parent()[0];
    let px = p.clientWidth * (percent / 100);
    bar.css({
        width: `${px}px`,
    });
    bar.html(`${percent}%`);
}

function create(html) {
    return typeof html === "string" ? $(html) : Array.isArray(html) ? $(html.join("")) : null;
}

async function getScratchStats() {
    let data = {};

    async function get(t = "followers") {
        let r = await fetch(`https://scratch.mit.edu/users/errorgamer2000/${t}/`);
        let txt = await r.text();
        let find = txt.search("<h2>");
        let n = txt.substring(find, find + 200).match(/\(([^)]+)\)/)[1];
        data[t] = n;
    }

    async function getOtherStuff() {
      let r = await fetch("https://scratch.mit.edu/users/errorgamer2000/");
      let txt = await r.text();
      let id = txt.match(/\<a href="\/projects\/([0-9]*)\/" id="featured-project"\>[^]*\<\/a\>/)[1];
      let src = `https://cdn2.scratch.mit.edu/get_image/project/${id}_480x360.png`;

      if(!localStorage.getItem("eg2000hp")) localStorage.setItem("eg2000hp", "{}");

      let stored = JSON.parse(localStorage.getItem("eg2000hp"));
      let oldSrc = stored.sbanner;
      if (oldSrc === src) {
          data.img = $(`<div id="banner" style="position: absolute; top: 0px; background-image: url('${"data:image/png;base64," + LZString.decompress(stored.banner64)}'); height: 100%; width: 100%;;"></div>`)[0];
      } else {
          data.img = $(`<div id="banner" style="position: absolute; top: 0px; background-image: url('${src}'); height: 100%; width: 100%;;"></div>`)[0];
          $("#save-img")[0].src = src;
          $("#save-img")[0].onload = () => {
              let b64 = getBase64Image( $("#save-img")[0]);
              stored.banner64 = LZString.compress(b64);
              stored.sbanner = src;
              localStorage.setItem("eg2000hp", JSON.stringify(stored));
          };
      }

      data.joinDate = "Joined " + txt.match(/Joined <span title=".*">(.*)<\/span>/)[1] + " ago";
      
    }

    await get("followers");
    await get("following");
    await get("projects");
    await get("studios");

    console.log(data);

    await getOtherStuff();

    $("#bannerContainer")[0].appendChild(data.img);
    $("#profileData").html(`<p class="statIcon"><span class="iconify" data-icon="simple-icons:scratch" data-inline="true"></span></p>ErrorGamer2000 <span>${data.joinDate}</span>`);
    $("#followers").html(`<p><span>${data.followers}</span><br />Followers</p>`);
    $("#following").html(`<p><span>${data.following}</span><br />Following</p>`);
    $("#projects").html(`<p><span>${data.projects}</span><br />Projects</p>`);
    $("#studios").html(`<p><span>${data.studios}</span><br />Studios</p>`);
    $("#scratchLoader").hide();
    $("#statContainer").show();
}

async function getGhStats() {
    let r = await fetch("https://api.github.com/users/ErrorGamer2000");
    let data = await r.json();
    let join = new Date(data.created_at)
    let t = monthDiff(join, new Date());
    $("#ghProfileData").html(`<p class="statIcon"><span class="iconify" data-icon="uil:github" data-inline="true"></span></p>ErrorGamer2000 <span>Joined ${t} months ago</span>`);
    $("#ghfollowers").html(`<p><span>${data.followers}</span><br />Followers</p>`);
    $("#ghfollowing").html(`<p><span>${data.following}</span><br />Following</p>`);
    $("#ghrepos").html(`<p><span>${data.public_repos}</span><br />Repositories</p>`);
    $("#ghgists").html(`<p><span>${data.public_gists}</span><br />Gists</p>`);
    $("#ghLoader").hide();
    $("#ghStatContainer").show();
}

function getBase64Image(img) {
    let canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    let ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    let dataURL = canvas.toDataURL("image/png");

    return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
}

function monthDiff(d1, d2) {
    let months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth();
    months += d2.getMonth();
    return months <= 0 ? 0 : months;
}
