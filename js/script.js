const clicker = document.getElementById("clicker");
const scoreboard = document.getElementById("score");
const cpsboard = document.getElementById("cps");
const cpcboard = document.getElementById("cpc");
const clickingContainer = document.getElementById("clickingContainer");
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

const save = setInterval(cookieSave, 60000);

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
    upgradeContainer.innerHTML = '<div class="flex center"><div class="containerTitle"><h1>Upgrades</h1></div></div>';
    const MAIN_DIV = document.createElement("div");
    MAIN_DIV.classList.add("scroll");
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
                MAIN_DIV.appendChild(DIV);
            }
        }
    }
    upgradeContainer.appendChild(MAIN_DIV);
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
    minerContainer.innerHTML = '<div class="flex center"><div class="containerTitle"><h1>Miners</h1></div></div>';
    const SCROLL_DIV = document.createElement("div");
    SCROLL_DIV.classList.add("scroll");
    for (let i = 0; i < miners.length; i++) {
        if (tier >= miners[i].tier) {
            const MAIN_DIV = document.createElement("div");
            MAIN_DIV.id = i;
            MAIN_DIV.classList.add("flex");
            MAIN_DIV.classList.add("nowrap");
            MAIN_DIV.classList.add("vertical-center");
            MAIN_DIV.setAttribute("onclick", "buyMiner(this.id)");

            const COUNT = document.createElement("h2");
            textnode = document.createTextNode(minersPurchased[i]);
            COUNT.appendChild(textnode);
            MAIN_DIV.appendChild(COUNT);

            const DIV = document.createElement("div");
            DIV.classList.add("miner");

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
            SCROLL_DIV.appendChild(MAIN_DIV);
        }
    }
    minerContainer.appendChild(SCROLL_DIV);
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
    tierContainer.innerHTML = '<div class="flex center"><div class="containerTitle"><h1>Tiers</h1></div></div>';

    const MAIN_DIV = document.createElement("div");
    MAIN_DIV.classList.add("flex");
    MAIN_DIV.classList.add("scroll");

    const DIV1 = document.createElement("div");
    DIV1.classList.add("split");
    DIV1.classList.add("flex");
    DIV1.classList.add("column");
    DIV1.classList.add("center");

    const TITLE_DIV = document.createElement("div");

    const CURRENT_TIER = document.createElement("h2");
    console.log(tiers[tier].name);
    textnode = document.createTextNode(`Current Tier: ${tiers[tier].name}`);
    CURRENT_TIER.appendChild(textnode);
    TITLE_DIV.appendChild(CURRENT_TIER);

    const NEXT_TIER = document.createElement("h2");
    textnode = document.createTextNode(`Next Tier: ${tiers[tier + 1].name}`);
    NEXT_TIER.appendChild(textnode);
    TITLE_DIV.appendChild(NEXT_TIER);

    DIV1.appendChild(TITLE_DIV);

    const IMAGE_DIV = document.createElement("div");
    IMAGE_DIV.classList.add("flex");
    IMAGE_DIV.classList.add("center");

    const IMAGE1 = document.createElement("img");
    IMAGE1.classList.add("tierImage");
    IMAGE1.src = tiers[tier].clickerImage;
    IMAGE1.alt = tiers[tier].name;
    IMAGE_DIV.appendChild(IMAGE1);
    
    const ARROW = document.createElement("i");
    ARROW.classList.add("fa-solid");
    ARROW.classList.add("fa-arrow-right");
    IMAGE_DIV.appendChild(ARROW);

    const IMAGE2 = document.createElement("img");
    IMAGE2.classList.add("tierImage");
    IMAGE2.src = tiers[tier + 1].clickerImage;
    IMAGE2.alt = tiers[tier + 1].name;
    IMAGE_DIV.appendChild(IMAGE2);

    DIV1.appendChild(IMAGE_DIV);

    const DIV2 = document.createElement("div");
    DIV2.classList.add("split");

    const UPGRADE_DIV = document.createElement("div");
    UPGRADE_DIV.classList.add("tier");
    UPGRADE_DIV.classList.add("flex");
    UPGRADE_DIV.classList.add("column");
    UPGRADE_DIV.classList.add("center");
    UPGRADE_DIV.setAttribute("onclick", "upgradeTier()");

    const UPGRADE_TEXT = document.createElement("h3");
    textnode = document.createTextNode("Upgrade");
    UPGRADE_TEXT.appendChild(textnode);
    UPGRADE_DIV.appendChild(UPGRADE_TEXT);

    const UPGRADE_COST = document.createElement("h1");
    textnode = document.createTextNode(`$${abbrNum(tiers[tier].nextTier, 3)}`);
    UPGRADE_COST.appendChild(textnode);
    UPGRADE_DIV.appendChild(UPGRADE_COST);

    DIV2.appendChild(UPGRADE_DIV);

    MAIN_DIV.appendChild(DIV1);
    MAIN_DIV.appendChild(DIV2);
    tierContainer.appendChild(MAIN_DIV); 
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

function cookieSave() {
    //Convert Upgrades Bought into String
    let upgradesBought;
    for(let i = 0; i < upgrades.length; i++) {
        if(upgrades[i].bought) {
            upgradesBought += "1";
        } else {
            upgradesBought += "0";
        }
    }
    console.log(upgradesBought);
}