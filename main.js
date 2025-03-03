//set values according to the URL parameters if it exists, using defaults if they don't
const pageUrl = new URLSearchParams(location.search);
let daysPerYear = pageUrl.get("daysperyear") ? pageUrl.get("daysperyear")/1 : 6;
let lastDateChange = pageUrl.get("lastdatechange") ? pageUrl.get("lastdatechange")/1 : 1740780000000; //JS time adds three zeroes to UNIX time
let lastDateEpoch = pageUrl.get("lastdateepoch") ? pageUrl.get("lastdateepoch")/1 : -17514150720000;
let fixedYears = pageUrl.get("fixedyears") ? pageUrl.get("fixedyears") === "true" : false;

//change the HTML elements to reflect the values
document.getElementById("daysPerYear").value = daysPerYear;
document.getElementById("lastDateChange").value = new Date(lastDateChange).toISOString().split("T")[0];
document.getElementById("lastDateEpoch").value = new Date(lastDateEpoch).toISOString().split("T")[0];
document.getElementById("fixedYears").checked = fixedYears;

function getSettingsUrl() {
    const parameters = `?daysperYear=${daysPerYear}&lastdatechange=${lastDateChange}&lastdateepoch=${lastDateEpoch}&fixedyears=${fixedYears}`;
    const link = `${location.protocol}//${location.host}${location.pathname}`;
    return link + parameters;
}

function setSettings() {
    daysPerYear = document.getElementById("daysPerYear").value;
    lastDateChange = new Date(document.getElementById("lastDateChange").value)/1; //the /1 turns it into a number
    lastDateEpoch = new Date(document.getElementById("lastDateEpoch").value)/1;
    fixedYears = document.getElementById("fixedYears").checked;
    const parameters = 
    `?daysperYear=${daysPerYear}&lastdatechange=${lastDateChange}&lastdateepoch=${lastDateEpoch}&fixedyears=${fixedYears}`;
    const link = `${location.protocol}//${location.host}${location.pathname}`;
    window.history.replaceState(null, "", getSettingsUrl());
}

setSettings();//Stops the date from flashing

function exportSettings(){
    window.prompt("Copy the following link:", getSettingsUrl());
}

function getTimeOf(irlDate) {
    if (!fixedYears) 
        return new Date(Math.floor((365/daysPerYear)*((irlDate)-lastDateChange)+lastDateEpoch));

    const day = 86400000; //The length of the day

    const timeDifference = irlDate-lastDateChange;
    
    const years = timeDifference/(day*daysPerYear);
    const yearCount = Math.floor(years);

    const lastDate = new Date(lastDateEpoch);

    const earlyDate = lastDate.setFullYear(lastDate.getFullYear() + yearCount);
    const latestDate = lastDate.setFullYear(lastDate.getFullYear() + 1);
    const yearLength = latestDate - earlyDate;

    const rest = (years - yearCount)*yearLength; //Portion of the year

    return new Date(earlyDate + rest);
}

function setTime(){
    const display = document.getElementById("timeDisplay");
    const rpJSTime = getTimeOf(Date.now());
    display.innerHTML = "The RP date and time is<br>" + rpJSTime.toGMTString();
}

function getSingleRPTime(){
    const singleDisplay = document.getElementById("singleRPTimeDisplay");
    let singleIRLTime = document.getElementById("singleTime").value.split(":");
    singleIRLTime = parseInt(singleIRLTime[0]*60) + parseInt(singleIRLTime[1]); //get selected IRL time in minutes
    singleIRLTime *= 60000; //make it milliseconds
    let singleIRLOffset = document.getElementById("singleOffset").value; //get selected IRL timezone in hours
    singleIRLOffset *= 3600000; //make it milliseconds
    singleIRLTime -= singleIRLOffset; //subtract the offset from the time to make it UTC

    let singleIRLDate = document.getElementById("singleDate").value; //get the value of the date picker
    singleIRLDate = new Date(singleIRLDate)/1; //turn it into js time (milliseconds)
    const dateTime = new Date(singleIRLDate + singleIRLTime)/1;

    singleDisplay.innerHTML = getTimeOf(dateTime).toGMTString();
}

setInterval(function(){setTime()}, 1);
