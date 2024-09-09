const clicker = document.getElementById("clicker");
const scoreboard = document.getElementById("score");
const cpsboard = document.getElementById("cps");
const cpcboard = document.getElementById("cpc");
const upgradeContainer = document.getElementById("upgradeContainer");
const minerContainer = document.getElementById("minerContainer");
const tierContainer = document.getElementById("tierContainer");

let score = 0;
let tier = 0;
let cpc = 1;
let cps = 0;
let upgrades = [];
let miners = [];
let minersPurchased = [];
let tiers = [];
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
    window.addEventListener("keydown", function (e) {
        if (e.keyCode == "40") {
            score = score + cpc;
            scoreboard.innerHTML = Math.trunc(score);
        }
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
        scoreboard.innerHTML = `Crystals: ${abbrNum(Math.trunc(score), 3)}`;
        cpsboard.innerHTML = `CPS: ${abbrNum(Math.trunc(cps), 3)}`;
        cpcboard.innerHTML = `CPC: ${abbrNum(Math.trunc(cpc), 3)}`;
    }
}

async function getUpgrades() {
    const response = await fetch("json/upgrades.json");
    const JSON = await response.json();
    console.log(JSON);
    upgrades = [];
    for (let i = 0; i < JSON.length; i++) {
        const upgrade = {
            name: JSON[i].name,
            type: JSON[i].type,
            altType: JSON[i].altType,
            amount: JSON[i].amount,
            desc: JSON[i].desc,
            img: JSON[i].img,
            price: JSON[i].price,
            bought: JSON[i].bought,
            tier: JSON[i].tier
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
        if (!upgrades[i].bought) {
            if (tier >= upgrades[i].tier) {
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

                const PRICE = document.createElement("h3");
                PRICE.classList.add("upgradePrice");
                textnode = document.createTextNode(`$${abbrNum(upgrades[i].price, 3)}`);
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
    }
    checkUpgrades();
}

function buyUpgrade(a) {
    const upgrade = upgrades[a];
    if (score >= upgrade.price) {
        score = score - upgrade.price;
        upgrades[a].bought = true;
        displayUpgrades();
    }
}

function checkUpgrades() {
    let temp_cpc = 1;
    let temp_cps = 0;

    for (let i = 0; i < miners.length; i++) {
        temp_cps += (minersPurchased[i] * miners[i].amount);
    }
    for (let i = 0; i < upgrades.length; i++) {
        if (upgrades[i].bought) {
            if (upgrades[i].type == "cpc") {
                temp_cpc *= upgrades[i].amount;
            } else if (upgrades[i].type == "cps") {
                if (upgrades[i].altType == 0) {
                    temp_cps += upgrades[i].amount;
                } else if (upgrades[i].altType == 1) {
                    temp_cps *= upgrades[i].amount;
                }
            }
        }
    }
    temp_cpc += tiers[tier].clickingBonus;
    temp_cps *= tiers[tier].multiplier;
    cpc = temp_cpc;
    cps = temp_cps;
}

async function getMiners() {
    const response = await fetch("json/miners.json");
    const JSON = await response.json();
    console.log(JSON);
    miners = [];
    minersPurchased = [];
    for (let i = 0; i < JSON.length; i++) {
        const miner = {
            name: JSON[i].name,
            price: JSON[i].startingCost,
            amount: JSON[i].amount,
            desc: JSON[i].desc,
            img: JSON[i].img,
            tier: JSON[i].tier
        };
        miners.push(miner);
        minersPurchased.push(0);
    }
    displayMiners();
    console.log(miners);
}
getMiners();

function displayMiners() {
    minerContainer.innerHTML = "";
    for (let i = 0; i < miners.length; i++) {
        if (tier >= miners[i].tier) {
            const MAIN_DIV = document.createElement("div");
            MAIN_DIV.id = i;
            MAIN_DIV.setAttribute("onclick", "buyMiner(this.id)");

            const COUNT = document.createElement("h2");
            textnode = document.createTextNode(minersPurchased[i]);
            COUNT.appendChild(textnode);
            MAIN_DIV.appendChild(COUNT);

            const DIV = document.createElement("div");
            DIV.classList.add("miner");
            DIV.classList.add("flex");
            DIV.classList.add("vertical-align");

            const TOP_DIV = document.createElement("div");
            TOP_DIV.classList.add("flex");
            TOP_DIV.classList.add("vertical-center");
            TOP_DIV.classList.add("between");

            const TITLE_DIV = document.createElement("div");
            TITLE_DIV.classList.add("flex");
            TITLE_DIV.classList.add("vertical-center");

            const IMG = document.createElement("img");
            IMG.src = miners[i].img;
            IMG.alt = miners[i].name;
            IMG.classList.add("minerImage");
            TITLE_DIV.appendChild(IMG);

            const TITLE = document.createElement("h3");
            TITLE.classList.add("minerTitle");
            textnode = document.createTextNode(miners[i].name.replace(/_/g, " "));
            TITLE.appendChild(textnode);
            TITLE_DIV.appendChild(TITLE);

            TOP_DIV.appendChild(TITLE_DIV);

            const PRICE = document.createElement("h3");
            PRICE.classList.add("minerPrice");
            textnode = document.createTextNode(`$${abbrNum(miners[i].price, 3)}`);
            PRICE.appendChild(textnode);
            TOP_DIV.appendChild(PRICE);

            const BOTTOM_DIV = document.createElement("div");
            BOTTOM_DIV.classList.add("flex");

            const DESC = document.createElement("p");
            DESC.classList.add("minerDesc");
            textnode = document.createTextNode(miners[i].desc);
            DESC.appendChild(textnode);
            BOTTOM_DIV.appendChild(DESC);

            DIV.appendChild(TOP_DIV);
            DIV.appendChild(BOTTOM_DIV);
            MAIN_DIV.appendChild(DIV);
            minerContainer.appendChild(MAIN_DIV);
        }
    }
}

function buyMiner(a) {
    const miner = miners[a];
    if (score >= miner.price) {
        score = score - miner.price;
        minersPurchased[a]++;
        miners[a].price = Math.ceil(miners[a].price * 1.15 ^ minersPurchased[a]);
        displayMiners();
        checkUpgrades();
    }
}

async function getTiers() {
    const response = await fetch("json/tiers.json");
    const JSON = await response.json();
    console.log(JSON);
    tiers = [];
    for (let i = 0; i < JSON.length; i++) {
        const tier = {
            name: JSON[i].name,
            desc: JSON[i].desc,
            multiplier: JSON[i].multiplier,
            clickingBonus: JSON[i].clickingBonus,
            color: JSON[i].color,
            altColor: JSON[i].altColor,
            nextTier: JSON[i].nextTier
        };
        tiers.push(tier);
    }
    displayTier();
    checkUpgrades();
}
getTiers();

function displayTier() {
    tierContainer.innerHTML = "";

    const CURRENT_TIER = document.createElement("h2");
    console.log(tiers[tier].name);
    textnode = document.createTextNode(`Current Tier: ${tiers[tier].name}`);
    CURRENT_TIER.appendChild(textnode);
    tierContainer.appendChild(CURRENT_TIER);

    const NEXT_TIER = document.createElement("h2");
    textnode = document.createTextNode(`Next Tier: ${tiers[tier + 1].name}`);
    NEXT_TIER.appendChild(textnode);
    tierContainer.appendChild(NEXT_TIER);

    const UPGRADE_DIV = document.createElement("div");
    UPGRADE_DIV.classList.add("tier");
    UPGRADE_DIV.setAttribute("onclick", "upgradeTier()");

    const UPGRADE_TEXT = document.createElement("h3");
    textnode = document.createTextNode("Upgrade");
    UPGRADE_TEXT.appendChild(textnode);
    UPGRADE_DIV.appendChild(UPGRADE_TEXT);

    const UPGRADE_COST = document.createElement("p");
    textnode = document.createTextNode(`$${abbrNum(tiers[tier].nextTier, 3)}`);
    UPGRADE_COST.appendChild(textnode);
    UPGRADE_DIV.appendChild(UPGRADE_COST);

    tierContainer.appendChild(UPGRADE_DIV);
}

function upgradeTier() {
    console.log(tiers[tier].nextTier);
    if (score >= tiers[tier].nextTier) {
        tier++;
        score = 0;
        upgrades = [];
        miners = [];
        minersPurchased = [];
        cpc = 1;
        cps = 0;
        getUpgrades();
        getMiners();
        displayTier();
    }
}

const abbrNum = (number, decPlaces) => {
    decPlaces = Math.pow(10, decPlaces);
    let abbrev = ['K', 'M', 'B', 'T', 'Q', 'Qi'];
    for (let i = abbrev.length - 1; i >= 0; i--) {
      let size = Math.pow(10, (i + 1) * 3);
      if (size <= number) {
        number = Math.round((number * decPlaces) / size) / decPlaces;
        if (number == 1000 && i < abbrev.length - 1) {
          number = 1;
          i++;
        }
        number += abbrev[i];
        break;
      }
    }
  
    return number;
  }
