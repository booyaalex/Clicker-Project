const clicker = document.getElementById("clicker");
const scoreboard = document.getElementById("score");
const cpsboard = document.getElementById("cps");

let score = 0;
let cpc = 1;
let cps = 5;

var stop = false;
var frameCount = 0;
var fps, fpsInterval, startTime, now, then, elapsed;

window.onload = function () {
    startAnimating(60);
    clicker.addEventListener("click", function() {
        score = score + cpc;
        scoreboard.innerHTML = Math.trunc(score);
    });
}

function startAnimating(fps) {
    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;
    console.log(startTime);
    animate();
}

function animate() {
    if (stop) {
        return;
    }
    requestAnimationFrame(animate);
    now = Date.now();
    elapsed = now - then;
    if (elapsed > fpsInterval) {
        then = now - (elapsed % fpsInterval);
        var sinceStart = now - startTime;
        var currentFps = Math.round(1000 / (sinceStart / ++frameCount) * 100) / 100;

        //Gains
        let gain = cps / currentFps;
        score = score + gain;

        //Display
        scoreboard.innerHTML = `Crystals: ${Math.trunc(score)}`;
        cpsboard.innerHTML = `CPS: ${Math.trunc(cps)}`;
    }
}