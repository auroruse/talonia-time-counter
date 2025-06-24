// --- Theme Toggle Logic ---
const toggle = document.getElementById("darkModeToggle");

// Initialize from localStorage
const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
    document.documentElement.setAttribute("data-theme", savedTheme);
} else {
    document.documentElement.setAttribute("data-theme", "light");
}

// Toggle theme on click
if (toggle) {
    toggle.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
    });
}

// --- Existing Logic ---
const pageUrl = new URLSearchParams(location.search);

let daysPerYear = pageUrl.get("daysperyear") ? pageUrl.get("daysperyear")/1 : 26;
daysPerYear = pageUrl.get("daysperYear") ? pageUrl.get("daysperYear")/1 : daysPerYear;

let lastDateChange = pageUrl.get("lastdatechange") ? pageUrl.get("lastdatechange")/1 : 1747087200000;
let lastDateEpoch = pageUrl.get("lastdateepoch") ? pageUrl.get("lastdateepoch")/1 : -1577930400000;
let fixedYears = pageUrl.get("fixedyears") ? pageUrl.get("fixedyears") === "true" : false;

document.getElementById("daysPerYear").value = daysPerYear;
document.getElementById("lastDateChange").value = new Date(lastDateChange).toISOString().split("T")[0];
document.getElementById("lastDateEpoch").value = new Date(lastDateEpoch).toISOString().split("T")[0];
document.getElementById("fixedYears").checked = fixedYears;

function getSettingsUrl() {
    const parameters = `?daysperyear=${daysPerYear}&lastdatechange=${lastDateChange}&lastdateepoch=${lastDateEpoch}&fixedyears=${fixedYears}`;
    return `${location.protocol}//${location.host}${location.pathname}` + parameters;
}

function setSettings() {
    daysPerYear = document.getElementById("daysPerYear").value;
    lastDateChange = new Date(document.getElementById("lastDateChange").value)/1;
    lastDateEpoch = new Date(document.getElementById("lastDateEpoch").value)/1;
    fixedYears = document.getElementById("fixedYears").checked;
    window.history.replaceState(null, "", getSettingsUrl());
}

setSettings();

function exportSettings() {
    window.prompt("Copy the following link:", getSettingsUrl());
}

function getTimeOf(irlDate) {
    if (!fixedYears)
        return new Date(Math.floor((365/daysPerYear)*((irlDate)-lastDateChange)+lastDateEpoch));

    const day = 86400000;
    const timeDifference = irlDate - lastDateChange;
    const years = timeDifference / (day * daysPerYear);
    const yearCount = Math.floor(years);

    const lastDate = new Date(lastDateEpoch);
    const earlyDate = lastDate.setFullYear(lastDate.getFullYear() + yearCount);
    const latestDate = lastDate.setFullYear(lastDate.getFullYear() + 1);
    const yearLength = latestDate - earlyDate;
    const rest = (years - yearCount) * yearLength;

    return new Date(earlyDate + rest);
}

function setTime() {
    const display = document.getElementById("timeDisplay");
    const rpJSTime = getTimeOf(Date.now());
    display.innerHTML = "The RP date and time is<br>" + rpJSTime.toGMTString();
}

function getSingleRPTime() {
    const singleDisplay = document.getElementById("singleRPTimeDisplay");
    let singleIRLTime = document.getElementById("singleTime").value.split(":");
    singleIRLTime = parseInt(singleIRLTime[0]*60) + parseInt(singleIRLTime[1]);
    singleIRLTime *= 60000;
    let singleIRLOffset = document.getElementById("singleOffset").value;
    singleIRLOffset *= 3600000;
    singleIRLTime -= singleIRLOffset;

    let singleIRLDate = document.getElementById("singleDate").value;
    singleIRLDate = new Date(singleIRLDate)/1;
    const dateTime = new Date(singleIRLDate + singleIRLTime)/1;

    singleDisplay.innerHTML = getTimeOf(dateTime).toGMTString();
}

setInterval(setTime, 1);
