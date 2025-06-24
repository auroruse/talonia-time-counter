// --- Existing RP time calculator code ---

// Set values from URL or defaults
const pageUrl = new URLSearchParams(location.search);

let daysPerYear = pageUrl.get("daysperyear") ? Number(pageUrl.get("daysperyear")) : 26;
// Backwards compatibility with casing bug
daysPerYear = pageUrl.get("daysPerYear") ? Number(pageUrl.get("daysPerYear")) : daysPerYear;

let lastDateChange = pageUrl.get("lastdatechange") ? Number(pageUrl.get("lastdatechange")) : 1747087200000; // default
let lastDateEpoch = pageUrl.get("lastdateepoch") ? Number(pageUrl.get("lastdateepoch")) : -1577930400000;
let fixedYears = pageUrl.get("fixedyears") === "true" ? true : false;

// Initialize HTML input values
document.getElementById("daysPerYear").value = daysPerYear;
document.getElementById("lastDateChange").value = new Date(lastDateChange).toISOString().split("T")[0];
document.getElementById("lastDateEpoch").value = new Date(lastDateEpoch).toISOString().split("T")[0];
document.getElementById("fixedYears").checked = fixedYears;

function getSettingsUrl() {
    const parameters = `?daysperyear=${daysPerYear}&lastdatechange=${lastDateChange}&lastdateepoch=${lastDateEpoch}&fixedyears=${fixedYears}`;
    const link = `${location.protocol}//${location.host}${location.pathname}`;
    return link + parameters;
}

function setSettings() {
    daysPerYear = Number(document.getElementById("daysPerYear").value);
    lastDateChange = Number(new Date(document.getElementById("lastDateChange").value));
    lastDateEpoch = Number(new Date(document.getElementById("lastDateEpoch").value));
    fixedYears = document.getElementById("fixedYears").checked;
    window.history.replaceState(null, "", getSettingsUrl());
}

setSettings(); // initialize

function exportSettings(){
    window.prompt("Copy the following link:", getSettingsUrl());
}

function getTimeOf(irlDate) {
    if (!fixedYears) {
        return new Date(Math.floor((365 / daysPerYear) * (irlDate - lastDateChange) + lastDateEpoch));
    }

    const day = 86400000; // milliseconds per day
    const timeDifference = irlDate - lastDateChange;
    const years = timeDifference / (day * daysPerYear);
    const yearCount = Math.floor(years);

    const lastDate = new Date(lastDateEpoch);
    const earlyDate = new Date(lastDate);
    earlyDate.setFullYear(lastDate.getFullYear() + yearCount);

    const latestDate = new Date(earlyDate);
    latestDate.setFullYear(earlyDate.getFullYear() + 1);

    const yearLength = latestDate - earlyDate;
    const rest = (years - yearCount) * yearLength;

    return new Date(earlyDate.getTime() + rest);
}

function setTime() {
    const display = document.getElementById("timeDisplay");
    const rpJSTime = getTimeOf(Date.now());
    display.innerHTML = "The RP date and time is<br>" + rpJSTime.toGMTString();
}

function getSingleRPTime() {
    const singleDisplay = document.getElementById("singleRPTimeDisplay");
    let singleIRLTime = document.getElementById("singleTime").value.split(":");
    singleIRLTime = parseInt(singleIRLTime[0], 10) * 60 + parseInt(singleIRLTime[1], 10);
    singleIRLTime *= 60000; // milliseconds
    let singleIRLOffset = Number(document.getElementById("singleOffset").value);
    singleIRLOffset *= 3600000; // milliseconds
    singleIRLTime -= singleIRLOffset;

    let singleIRLDate = document.getElementById("singleDate").value;
    singleIRLDate = Number(new Date(singleIRLDate));
    const dateTime = new Date(singleIRLDate + singleIRLTime);

    singleDisplay.innerHTML = getTimeOf(dateTime.getTime()).toGMTString();
}

// Update RP time every 10 ms for smooth updates
setInterval(setTime, 10);

// --- Dark Mode Toggle Logic ---

const themeToggle = document.getElementById("themeToggle");
const htmlEl = document.documentElement;

// Initialize toggle state from localStorage or default light mode
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
    htmlEl.setAttribute("data-theme", "dark");
    themeToggle.checked = true;
} else {
    htmlEl.setAttribute("data-theme", "light");
    themeToggle.checked = false;
}

themeToggle.addEventListener("change", () => {
    if (themeToggle.checked) {
        htmlEl.setAttribute("data-theme", "dark");
        localStorage.setItem("theme", "dark");
    } else {
        htmlEl.setAttribute("data-theme", "light");
        localStorage.setItem("theme", "light");
    }
});
