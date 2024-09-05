const clicker = document.getElementById("clicker");
const scoreboard = document.getElementById("score");
const cpsboard = document.getElementById("cps");
const upgradeContainer = document.getElementById("upgradeContainer");

let score = 0;
let cpc = 1;
let cps = 0;
let upgrades = [];
let currentUpgrades = [];
let textnode;

var stop = false;
var frameCount = 0;
var fps, fpsInterval, startTime, now, then, elapsed;

window.onload = function () {
    startAnimating(60);
    clicker.addEventListener("click", function () {
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

async function getUpgrades() {
    const response = await fetch("json/upgrades.json");
    const JSON = await response.json();
    console.log(JSON);
    for (let i = 0; i < JSON.length; i++) {
        const upgrade = {
            name: JSON[i].name,
            type: JSON[i].type,
            amount: JSON[i].amount,
            desc: JSON[i].desc,
            img: JSON[i].img,
            price: JSON[i].price,
            bought: JSON[i].bought
        };
        upgrades.push(upgrade);
    }
    displayUpgrades();
    console.log(upgrades);
}
getUpgrades();

function displayUpgrades() {
    upgradeContainer.innerHTML = "";
    for (let i = 0; i < upgrades.length; i++) {
        console.log(upgrades[i].bought);
        if (!upgrades[i].bought) {
            const DIV = document.createElement("div");
            DIV.id = i;
            DIV.classList.add("upgrade");
            DIV.setAttribute("onclick", "buyUpgrade(this.id)");

            const TOP_DIV = document.createElement("div");
            TOP_DIV.classList.add("flex");
            TOP_DIV.classList.add("vertical-center");
            TOP_DIV.classList.add("between");

            const TITLE_DIV = document.createElement("div");
            TITLE_DIV.classList.add("flex");
            TITLE_DIV.classList.add("vertical-center");

            const IMG = document.createElement("img");
            IMG.src = upgrades[i].img;
            IMG.alt = upgrades[i].name;
            IMG.classList.add("upgradeImage");
            TITLE_DIV.appendChild(IMG);

            const TITLE = document.createElement("h3");
            TITLE.classList.add("upgradeTitle");
            textnode = document.createTextNode(upgrades[i].name.replace(/_/g, " "));
            TITLE.appendChild(textnode);
            TITLE_DIV.appendChild(TITLE);

            TOP_DIV.appendChild(TITLE_DIV);

            const PRICE = document.createElement("h4");
            PRICE.classList.add("upgradeTitle");
            textnode = document.createTextNode(`$${upgrades[i].price}`);
            PRICE.appendChild(textnode);
            TOP_DIV.appendChild(PRICE);

            const BOTTOM_DIV = document.createElement("div");

            const DESC = document.createElement("p");
            DESC.classList.add("upgradeDesc");
            textnode = document.createTextNode(upgrades[i].desc);
            DESC.appendChild(textnode);
            BOTTOM_DIV.appendChild(DESC);

            DIV.appendChild(TOP_DIV);
            DIV.appendChild(BOTTOM_DIV);
            upgradeContainer.appendChild(DIV);
        }
    }
    checkUpgrades();
}

function buyUpgrade(a) {
    const upgrade = upgrades[a];
    console.log(upgrade);
    if (score >= upgrade.price) {
        score = score - upgrade.price;
        upgrades[a].bought = true;
        displayUpgrades();
    }
}

function checkUpgrades() {
    let temp_cpc = 1;
    let temp_cps = 0;
    for(let i = 0; i < upgrades.length; i++) {
        if(upgrades[i].bought) {
            if(upgrades[i].type == "cpc") {
                temp_cpc = temp_cpc * upgrades[i].amount;
            } else if(upgrades[i].type == "cps") {

            }
        }
    }
    cpc = temp_cpc;
    cps = temp_cps;
}