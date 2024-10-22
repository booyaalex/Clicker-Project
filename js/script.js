const clicker = document.getElementById("clicker");
const scoreboard = document.getElementById("score");
const cpsboard = document.getElementById("cps");
const cpcboard = document.getElementById("cpc");
const clickingContainer = document.getElementById("clickingContainer");
const upgradeContainer = document.getElementById("upgradeContainer");
const minerContainer = document.getElementById("minerContainer");
const tierContainer = document.getElementById("tierContainer");
const savePopup = document.getElementById("savePopup");
const pagePopup = document.getElementById("pagePopup");
const achievementPopup = document.getElementById("achievementPopup");

let score = 0;
let tier = 0;
let cpc = 1;
let cps = 0;
let upgrades = [];
let miners = [];
let minersPurchased = [];
let tiers = [];
let achievements = [];
let textnode,
    minerScrollTop = 0;
let totalClicks = 0;
let achievementLock = false;


let cookieToggle = cookieToggleCheck();
let developerToggle = false;
function cookieToggleCheck() {
    let name = "cookieToggle=";
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return (c.substring(name.length, c.length) == 'true');
        }
    }
    return true;
}

var stop = false;
var frameCount = 0;
var fps, fpsInterval, startTime, now, then, elapsed;

const save = setInterval(cookieSave, 30000);

window.onload = function () {
    setTimeout(loadSave, 300);
    startAnimating(60);
    clicker.addEventListener("click", function () {
        score = score + cpc;
        totalClicks++;
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
        score += gain;

        //Display
        scoreboard.innerHTML = `Crystals: ${abbrNum(Math.trunc(score), 3)}`;
        cpsboard.innerHTML = `CPS: ${abbrNum(Math.trunc(cps), 3)}`;
        
        if(developerToggle) {
            cpcboard.innerHTML = `Cookie: ${document.cookie}`;
        } else {
            cpcboard.innerHTML = `CPC: ${abbrNum(Math.trunc(cpc), 3)}`;
        }

        checkAchievements();
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
            nextTier: JSON[i].nextTier,
            clickerImage: JSON[i].clickerImage
        };
        tiers.push(tier);
    }
    displayTier();
    checkUpgrades();
}
getTiers();

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
    MAIN_DIV.classList.add("fullHeight");
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
    console.log(tiers[tier].clickingBonus);
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
    minerScrollTop = $("#minerScroll").scrollTop();
    console.log(minerScrollTop);
    minerContainer.innerHTML = '<div class="flex center"><div class="containerTitle"><h1>Miners</h1></div></div>';
    const SCROLL_DIV = document.createElement("div");
    SCROLL_DIV.id = "minerScroll";
    SCROLL_DIV.classList.add("scroll");
    SCROLL_DIV.classList.add("fullHeight");
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
    $("#minerScroll").scrollTop(minerScrollTop);
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

function displayTier() {
    tierContainer.innerHTML = '<div class="flex center"><div class="containerTitle"><h1>Tiers</h1></div></div>';
    clicker.style.backgroundImage = `url(${tiers[tier].clickerImage})`;

    const MAIN_DIV = document.createElement("div");
    MAIN_DIV.classList.add("flex");
    MAIN_DIV.classList.add("fullHeight");

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
    if (cookieToggle) {
        //§, α
        //Convert Upgrades Bought into String
        let upgradesBought = "";
        for (let i = 0; i < upgrades.length; i++) {
            if (upgrades[i].bought) {
                upgradesBought += "1";
            } else {
                upgradesBought += "0";
            }
        }
        console.log(upgradesBought);

        //Convert Miners Purchased into String
        const minerArray = [];
        for (let i = 0; i < miners.length; i++) {
            minerArray.push(minersPurchased[i]);
            minerArray.push("-");
        }
        let temp = minerArray.toString();
        temp = temp.replaceAll(",", "");
        console.log(temp);

        //Convert Achievements Unlocked into String
        let achievementUnlocked = "";
        for (let i = 0; i < achievements.length; i++) {
            if (achievements[i].unlocked) {
                achievementUnlocked += "1";
            } else {
                achievementUnlocked += "0";
            }
        }
        console.log(achievementUnlocked);

        //Combine All Stats
        const stats = `${totalClicks}`;

        //Final Save
        const d = new Date();
        d.setTime(d.getTime() + (30 * 24 * 60 * 60 * 1000));
        let expires = "expires=" + d.toUTCString();
        const save = `${Math.trunc(Number(score))}§${upgradesBought}§${temp}§${tier}§${achievementUnlocked}§${stats}`;
        console.log(save);
        document.cookie = `saveFile=${save};${expires};path=/`;
        showSavePopup();
    }
}

function loadSaveFile() {
    let name = "saveFile=";
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}


function loadSave() {
    const saveArray = loadSaveFile().split("§");
    console.log(saveArray);

    //Set Score
    score = Number(saveArray[0]);

    //Set Tier
    if (Number(saveArray[3]) > 0) {
        tier = Number(saveArray[3]);
    } else {
        tier = 0;
    }
    displayTier();

    //Set Upgrades
    for (let i = 0; i < upgrades.length; i++) {
        if (saveArray[1].charAt(i) != null) {
            if (saveArray[1].charAt(i) == 0) {
                upgrades[i].bought = false;
            } else if (saveArray[1].charAt(i) == 1) {
                upgrades[i].bought = true;
            }
        }
    }
    displayUpgrades();

    //Set Miners
    const minerArray = saveArray[2].split("-");
    for (let i = 0; i < miners.length; i++) {
        if (Number(minerArray[i]) != null) {
            minersPurchased[i] = Number(minerArray[i]);
            if (Number(minerArray[i]) != 0) {
                console.log(`${i}: ${miners[i].price}`);
                for (let a = 0; a < Number(minerArray[i]); a++) {
                    miners[i].price = Math.ceil(miners[i].price * 1.15 ^ a + 1);
                }
            }
        }
    }
    displayMiners();
    checkUpgrades();

    //Set Achievements
    console.log(achievements);
    for (let i = 0; i < achievements.length; i++) {
        if (saveArray[4].charAt(i) != null) {
            if (saveArray[4].charAt(i) == 0) {
                achievements[i].unlocked = false;
            } else if (saveArray[4].charAt(i) == 1) {
                achievements[i].unlocked = true;
                achievementUnlock(i);
            }
        }
    }
    achievementLock = true;

    //Set Stats
    const statsArray = saveArray[5].split("-");
    totalClicks = Number(statsArray[0]);
}

function showSavePopup() {
    savePopup.style.display = "flex";
    setTimeout(() => {
        savePopup.style.display = "none";
    }, 5000);
}

function showPopupPage(page) {
    pagePopup.style.display = "block";
    pagePopup.innerHTML = '<i id="close" class="icon fa-solid fa-circle-xmark" onclick="hidePopupPage()"></i>';
    document.body.style.overflowY = "hidden";
    if (page == "settings") {
        settingsPopup();
    } else if (page == "changes") {
        changesPopup();
    } else if (page == "achievements") {
        achievementsPopup();
    }
}

function settingsPopup() {
    pagePopup.innerHTML += '<h1 class="center">Settings</h1><br><br><h2>Saving</h2><br>';
    pagePopup.innerHTML += '<h3>Save to File</h3>';
    pagePopup.innerHTML += '<button type="button" onclick="cookieSave()">Save</button>';

    pagePopup.innerHTML += '<br><br><h3>Save to File</h3>';
    pagePopup.innerHTML += '<button type="button" onclick="downloadSaveFile()">Save To File</button>';
    pagePopup.innerHTML += '<br><br><h3>Load from File</h3>';

    const LOAD_BUTTON = document.createElement("input");
    LOAD_BUTTON.type = "file";
    LOAD_BUTTON.id = "loadSave";
    LOAD_BUTTON.setAttribute("onChange", 'const file = this.files[0]; readSaveFile(file);');
    pagePopup.appendChild(LOAD_BUTTON);

    pagePopup.innerHTML += '<br><br>';
    pagePopup.innerHTML += '<h3>Reset Save File</h3>';


    pagePopup.innerHTML += '<button type="button" onclick="resetSave()">Reset Save</button>';

    pagePopup.innerHTML += '<br><br><h3>Disable Cookies</h3><h4>This will also disable autosaving, and delete your current autosave.</h4>';
    if (cookieToggle) {
        pagePopup.innerHTML += '<input id="toggleCookies" onchange="cookieToggler()" type="checkbox">';
    } else if (!cookieToggle) {
        pagePopup.innerHTML += '<input id="toggleCookies" type="checkbox" onchange="cookieToggler()" checked>';
    }

    pagePopup.innerHTML += '<br><br><h3>Developer Stuff</h3><h4>DW about this.</h4>';
    if (developerToggle) {
        pagePopup.innerHTML += '<input id="toggleDeveloper" type="checkbox" onchange="devToggle()" checked>';
    } else if (!developerToggle) {
        pagePopup.innerHTML += '<input id="toggleDeveloper" type="checkbox" onchange="devToggle()">';
    } 

    
    pagePopup.innerHTML += '<br><br><h3>Privacy Policy</h3><a href="privacyPolicy.html" target="_blank">Privacy Policy</a>';
}

function cookieToggler() {
    if (document.getElementById("toggleCookies").checked) {
        cookieToggle = false;

        document.cookie = "saveFile=blank;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        const d = new Date();
        d.setTime(d.getTime() + (60 * 24 * 60 * 60 * 1000));
        let expires = "expires=" + d.toUTCString();
        document.cookie = `cookieToggle=${cookieToggle};${expires};path=/`;
    } else if (!document.getElementById("toggleCookies").checked) {
        cookieToggle = true;

        const d = new Date();
        d.setTime(d.getTime() + (60 * 24 * 60 * 60 * 1000));
        let expires = "expires=" + d.toUTCString();
        document.cookie = `cookieToggle=${cookieToggle};${expires};path=/`;
    }
}
function devToggle() {
    if (document.getElementById("toggleDeveloper").checked) {
        developerToggle = true;
    } else if (!document.getElementById("toggleDeveloper").checked) {
        developerToggle = false;
    }
}

function downloadSaveFile() {
    let upgradesBought = "";
    for (let i = 0; i < upgrades.length; i++) {
        if (upgrades[i].bought) {
            upgradesBought += "1";
        } else {
            upgradesBought += "0";
        }
    }
    console.log(upgradesBought);

    //Convert Miners Purchased into String
    const minerArray = [];
    for (let i = 0; i < miners.length; i++) {
        minerArray.push(minersPurchased[i]);
        minerArray.push("-");
    }
    let temp = minerArray.toString();
    temp = temp.replaceAll(",", "");
    console.log(temp);

    let achievementUnlocked = "";
    for (let i = 0; i < achievements.length; i++) {
        if (achievements[i].unlocked) {
            achievementUnlocked += "1";
        } else {
            achievementUnlocked += "0";
        }
    }
    console.log(achievementUnlocked);

    //Combine All Stats
    const stats = `${totalClicks}`;

    //Final Save
    const save = `${Math.trunc(score)}§${upgradesBought}§${temp}§${tier}§${achievementUnlocked}§${stats}`;
    console.log(save);
    const file = new File([save], 'crystal_save.txt', {
        type: 'text/plain',
    });
    const link = document.createElement('a');
    const url = URL.createObjectURL(file);

    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

function readSaveFile(file) {
    const reader = new FileReader();
    reader.onload = (evt) => {
        const d = new Date();
        d.setTime(d.getTime() + (30 * 24 * 60 * 60 * 1000));
        let expires = "expires=" + d.toUTCString();
        document.cookie = `saveFile=${evt.target.result};${expires};path=/`;
        window.location.reload(true);
    };
    reader.readAsText(file);
}

function resetSave() {
    if (confirm("This will reset all of your progress, do you want to continue?")) {
        document.cookie = `saveFile=blank;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        window.location.reload(true);
    }
}

async function changesPopup() {
    const response = await fetch("json/changes.json");
    const JSON = await response.json();
    console.log(JSON);

    pagePopup.innerHTML += '<h1 class="center">Change Log</h1><br><br>';
    console.log(JSON.length);
    for (let i = JSON.length - 1; i > -1; i--) {
        const DATE = document.createElement("h2");
        textnode = document.createTextNode(JSON[i].date);
        DATE.appendChild(textnode);
        pagePopup.appendChild(DATE);

        const TITLE = document.createElement("h3");
        textnode = document.createTextNode(JSON[i].title);
        TITLE.appendChild(textnode);
        pagePopup.appendChild(TITLE);

        const LIST = document.createElement("ul");
        for (let j = 0; j < JSON[i].bullets.length; j++) {
            const BULLET = document.createElement("li");
            textnode = document.createTextNode(JSON[i].bullets[j]);
            BULLET.appendChild(textnode);
            LIST.appendChild(BULLET);
        }
        pagePopup.appendChild(LIST);

        pagePopup.innerHTML += '<br><br>';
    }
}

async function getAchievements() {
    const response = await fetch("json/achievements.json");
    const JSON = await response.json();
    console.log(JSON);
    achievements = [];
    for (let i = 0; i < JSON.length; i++) {
        const achievement = {
            name: JSON[i].name,
            desc: JSON[i].desc,
            type: JSON[i].type,
            requirement: JSON[i].requirement,
            img: JSON[i].img,
            unlocked: JSON[i].unlocked
        };
        achievements.push(achievement);
    }
}
getAchievements();

function achievementsPopup() {

    pagePopup.innerHTML += '<h1 class="center">Achievements</h1><br><br>';

    const MAIN_DIV = document.createElement("div");
    MAIN_DIV.classList.add("flex");
    MAIN_DIV.classList.add("column");
    MAIN_DIV.classList.add("fullHeight");


    const LIST = document.createElement("div");
    LIST.classList.add("flex");
    LIST.classList.add("bigSec");

    const CONTAINER = document.createElement("div");
    CONTAINER.id = "achievementContainer";
    CONTAINER.classList.add("fullHeight");

    for (let i = 0; i < achievements.length; i++) {
        const DIV = document.createElement("div");
        DIV.id = i;
        DIV.classList.add("achievement");
        DIV.classList.add("flex");
        DIV.classList.add("vertical-center");
        DIV.classList.add("center");
        if (!achievements[i].unlocked) {
            DIV.classList.add("locked");
            const LOCK = document.createElement("i");
            LOCK.classList.add("fa-lock");
            LOCK.classList.add("fa-solid");

            DIV.appendChild(LOCK);
        } else if (achievements[i].unlocked) {
            DIV.setAttribute("onclick", "updateAchievementInfo(this.id)");
            const IMG = document.createElement("img");
            IMG.src = achievements[i].img;
            IMG.alt = achievements[i].name;
            DIV.appendChild(IMG);
        }
        CONTAINER.appendChild(DIV);
    }
    LIST.appendChild(CONTAINER);
    MAIN_DIV.appendChild(LIST);

    const INFO = document.createElement("div");
    INFO.id = "achievementInfo";
    INFO.classList.add("flex");
    INFO.classList.add("smallSec");
    INFO.classList.add("column");
    MAIN_DIV.appendChild(INFO);

    pagePopup.appendChild(MAIN_DIV);
}

function updateAchievementInfo(id) {
    const MAIN_DIV = document.getElementById("achievementInfo");
    MAIN_DIV.innerHTML = "";
    const TOP_DIV = document.createElement("div");
    TOP_DIV.classList.add("flex");
    TOP_DIV.classList.add("vertical-center");

    const IMG = document.createElement("img");
    IMG.src = achievements[id].img;
    IMG.alt = achievements[id].name;
    TOP_DIV.appendChild(IMG);

    const H1 = document.createElement("h1");
    let temp = document.createTextNode(achievements[id].name);
    H1.appendChild(temp);
    TOP_DIV.appendChild(H1);

    const BOTTOM_DIV = document.createElement("div");
    const H2 = document.createElement("h2");
    temp = document.createTextNode(achievements[id].desc);
    H2.appendChild(temp);
    BOTTOM_DIV.appendChild(H2);

    MAIN_DIV.appendChild(TOP_DIV);
    MAIN_DIV.appendChild(BOTTOM_DIV);
}

function checkAchievements() {
    for (let i = 0; i < achievements.length; i++) {
        const a = achievements[i];
        if (!a.unlocked) {
            if (a.type == 0) {
                if (a.requirement <= score) {
                    achievementUnlock(i);
                }
            } else if (a.type == 1) {
                if (a.requirement <= cps) {
                    achievementUnlock(i);
                }
            } else if (a.type == 2) {
                if (a.requirement <= totalClicks) {
                    achievementUnlock(i);
                }
            } else if (a.type == 3) {
                if (a.requirement <= tier) {
                    achievementUnlock(i);
                }
            }
        }
    }
    
}

function achievementUnlock(i) {
    if (achievementLock) {
        const a = achievements[i];
        a.unlocked = true;

        achievementPopup.style.display = "flex";
        achievementPopup.innerHTML = "<h2>Achievement Unlocked!</h2>";
        achievementPopup.innerHTML += `<h2 id="achieveName">${achievements[i].name}</h2>`
        setTimeout(() => {
            achievementPopup.style.display = "none";
            achievementPopup.removeChild(document.getElementById("achieveName"));
        }, 5000);
    }
}

function hidePopupPage() {
    pagePopup.style.display = "none";
    pagePopup.innerHTML = "";
}

