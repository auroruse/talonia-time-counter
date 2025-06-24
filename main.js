// === Existing variables and URL param loading ===
const pageUrl = new URLSearchParams(location.search);

let daysPerYear = pageUrl.get("daysperyear") ? Number(pageUrl.get("daysperyear")) : 26;
// Backwards compatibility for casing bug
daysPerYear = pageUrl.get("daysperYear") ? Number(pageUrl.get("daysperYear")) : daysPerYear;

let lastDateChange = pageUrl.get("lastdatechange") ? Number(pageUrl.get("lastdatechange")) : 1747087200000;
let lastDateEpoch = pageUrl.get("lastdateepoch") ? Number(pageUrl.get("lastdateepoch")) : -1577930400000;
let fixedYears = pageUrl.get("fixedyears") ? pageUrl.get("fixedyears") === "true" : false;

// Reflect values in HTML
document.getElementById("daysPerYear").value = daysPerYear;
document.getElementById("lastDateChange").value = new Date(lastDateChange).toISOString().split("T")[0];
document.getElementById("lastDateEpoch").value = new Date(lastDateEpoch).toISOString().split("T")[0];
document.getElementById("fixedYears").checked = fixedYears;

// === Dark Mode Toggle Setup ===
const darkModeToggle = document.getElementById('darkModeToggle');

function applyTheme(theme) {
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        darkModeToggle.checked = true;
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
        darkModeToggle.checked = false;
        localStorage.setItem('theme', 'light');
    }
}

// Load stored theme on page load
const storedTheme = localStorage.getItem('theme');
if (storedTheme === 'dark') {
    applyTheme('dark');
} else {
    applyTheme('light');
}

// Toggle event listener
darkModeToggle.addEventListener('change', () => {
    if (darkModeToggle.checked) {
        applyTheme('dark');
    } else {
        applyTheme('light');
    }
});

// === Existing functions ===
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

setSettings(); // Initialize settings

function exportSettings() {
    window.prompt("Copy the following link:", getSettingsUrl());
}

function getTimeOf(irlDate) {
    if (!fixedYears) {
        return new Date(Math.floor((365 / daysPerYear) * (irlDate - lastDateChange) + lastDateEpoch));
    }

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
    singleIRLTime = parseInt(singleIRLTime[0] * 60) + parseInt(singleIRLTime[1]);
    singleIRLTime *= 60000;

    let singleIRLOffset = Number(document.getElementById("singleOffset").value);
    singleIRLOffset *= 3600000;

    singleIRLTime -= singleIRLOffset;

    let singleIRLDate = document.getElementById("singleDate").value;
    singleIRLDate = Number(new Date(singleIRLDate));
    const dateTime = new Date(singleIRLDate + singleIRLTime);

    singleDisplay.innerHTML = getTimeOf(dateTime).toGMTString();
}

setInterval(setTime, 1000);
