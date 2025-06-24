window.addEventListener("DOMContentLoaded", () => {
    // URL parameters and defaults
    const pageUrl = new URLSearchParams(location.search);

    let daysPerYear = pageUrl.get("daysperyear") ? Number(pageUrl.get("daysperyear")) : 26;
    daysPerYear = pageUrl.get("daysPerYear") ? Number(pageUrl.get("daysPerYear")) : daysPerYear;

    let lastDateChange = pageUrl.get("lastdatechange") ? Number(pageUrl.get("lastdatechange")) : 1747087200000;
    let lastDateEpoch = pageUrl.get("lastdateepoch") ? Number(pageUrl.get("lastdateepoch")) : -1577930400000;
    let fixedYears = pageUrl.get("fixedyears") === "true" ? true : false;

    // DOM elements
    const daysInput = document.getElementById("daysPerYear");
    const lastDateChangeInput = document.getElementById("lastDateChange");
    const lastDateEpochInput = document.getElementById("lastDateEpoch");
    const fixedYearsInput = document.getElementById("fixedYears");

    const singleDateInput = document.getElementById("singleDate");
    const singleTimeInput = document.getElementById("singleTime");
    const singleOffsetInput = document.getElementById("singleOffset");
    const singleRPDisplay = document.getElementById("singleRPTimeDisplay");

    const timeDisplay = document.getElementById("timeDisplay");

    const setSettingsBtn = document.getElementById("setSettingsBtn");
    const exportSettingsBtn = document.getElementById("exportSettingsBtn");
    const getSingleRPTimeBtn = document.getElementById("getSingleRPTimeBtn");

    const themeToggle = document.getElementById("themeToggle");
    const htmlEl = document.documentElement;

    // Initialize inputs from parameters or defaults
    daysInput.value = daysPerYear;
    lastDateChangeInput.value = new Date(lastDateChange).toISOString().split("T")[0];
    lastDateEpochInput.value = new Date(lastDateEpoch).toISOString().split("T")[0];
    fixedYearsInput.checked = fixedYears;

    // Helper to generate URL with current settings
    function getSettingsUrl() {
        const params = `?daysperyear=${daysPerYear}&lastdatechange=${lastDateChange}&lastdateepoch=${lastDateEpoch}&fixedyears=${fixedYears}`;
        return location.origin + location.pathname + params;
    }

    // Update global settings from inputs and update URL
    function setSettings() {
        daysPerYear = Number(daysInput.value);
        lastDateChange = Number(new Date(lastDateChangeInput.value));
        lastDateEpoch = Number(new Date(lastDateEpochInput.value));
        fixedYears = fixedYearsInput.checked;

        window.history.replaceState(null, "", getSettingsUrl());
    }

    // Export current settings URL for sharing
    function exportSettings() {
        window.prompt("Copy the following link:", getSettingsUrl());
    }

    // Calculate RP time given IRL timestamp
    function getTimeOf(irlDate) {
        if (!fixedYears) {
            return new Date(Math.floor((365 / daysPerYear) * (irlDate - lastDateChange) + lastDateEpoch));
        }

        const day = 86400000;
        const timeDiff = irlDate - lastDateChange;
        const years = timeDiff / (day * daysPerYear);
        const yearCount = Math.floor(years);

        const lastDate = new Date(lastDateEpoch);
        const earlyDate = new Date(lastDate);
        earlyDate.setFullYear(lastDate.getFullYear() + yearCount);

        const nextDate = new Date(earlyDate);
        nextDate.setFullYear(earlyDate.getFullYear() + 1);

        const yearLength = nextDate - earlyDate;
        const rest = (years - yearCount) * yearLength;

        return new Date(earlyDate.getTime() + rest);
    }

    // Continuously update main RP time display every 100ms
    function updateRPTime() {
        const rpTime = getTimeOf(Date.now());
        timeDisplay.innerHTML = `The RP date and time is<br>${rpTime.toGMTString()}`;
    }

    // Calculate RP time for single user input
    function getSingleRPTime() {
        let irlTimeParts = singleTimeInput.value.split(":");
        if (irlTimeParts.length !== 2) {
            singleRPDisplay.textContent = "Invalid time format";
            return;
        }

        let irlMinutes = parseInt(irlTimeParts[0], 10) * 60 + parseInt(irlTimeParts[1], 10);
        let irlMilliseconds = irlMinutes * 60000;

        let offsetMs = Number(singleOffsetInput.value) * 3600000;

        let irlDateNum = Number(new Date(singleDateInput.value));
        if (isNaN(irlDateNum)) {
            singleRPDisplay.textContent = "Invalid date";
            return;
        }

        let irlTimestamp = irlDateNum + irlMilliseconds - offsetMs;

        let rpDate = getTimeOf(irlTimestamp);
        singleRPDisplay.textContent = rpDate.toGMTString();
    }

    // Dark mode toggle initialization and event
    function initTheme() {
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
    }

    // Event listeners for buttons
    setSettingsBtn.addEventListener("click", () => {
        setSettings();
        updateRPTime(); // Immediately update display on settings change
    });

    exportSettingsBtn.addEventListener("click", exportSettings);

    getSingleRPTimeBtn.addEventListener("click", getSingleRPTime);

    // Initialize theme
    initTheme();

    // Initial set of settings and start RP time update loop
    setSettings();
    updateRPTime();
    setInterval(updateRPTime, 100);
});
