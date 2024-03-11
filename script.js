onerror = function(event, source, lineno, colno, error) {
	if (error != null) {
		sendData(
			"Fehler im Skript:\n" +
			"User Agent: " + navigator.userAgent + "\n" +
			"Web App: " + Boolean(navigator.standalone) + "\n" +
			"Touchscreen: " + Boolean(navigator.maxTouchPoints) + "\n" +
			"Audio-Test: " + Boolean(document.createElement("audio").canPlayType("audio/wav; codecs=\"1\"")) + "\n" +
			"WebGL-Test: " + Boolean(new OffscreenCanvas(0, 0).getContext("webgl")) + "\n" +
			"Seite: " + decodeURI(location.pathname + location.hash) + "\n" +
			"Skript: " + source + "\n" +
			"Zeile: " + lineno + "\n" +
			"Spalte: " + colno + "\n" +
			"Fehlermeldung:\n" + error
		);
	}
}

var colorScheme;
var deviceColorScheme;
var observer;
var eventListenerAdded = false;
var OS;
var exactOS;
var browser;
var exactBrowser;

function loadWindow() {
	if (document.getElementById("404") != null) redirectFrom404();
	try { localStorageAvailable = Boolean(localStorage); }
	catch { localStorageAvailable = false; }
	detectAndUpdateDeviceColorScheme();
	loadContents();
	updateImages();
	if (navigator.standalone) document.getElementById("appMenuItem").style.display = "none";
	if (location.pathname.includes("auftrag")) document.getElementById("auftragButton").classList.add("redundant");
	if (document.getElementById("app-installation") != null) {
		updateAppButton();
		updateAppInstructions();
	}
	if (document.getElementsByClassName("form").length > 0) updateForm();
	document.getElementById("colorSchemeToggle").hidden = !localStorageAvailable;
	document.getElementById("year").innerHTML = new Date().getFullYear();
	scrollToAnchor();
	document.body.classList.add("loaded");
	if (document.getElementById("404") != null) sendData("Seite nicht gefunden: " + location.pathname);
	else if (document.getElementById("app-installation") != null) sendAppInstallationStatistic();
	else if (document.getElementById("sslcontactholder") == null) sendStatistic();
}

function redirectFrom404() {
	const redirectPages = [
		{right: "", aliases: ["start", "super", "home"]},
		{right: "über", aliases: ["ueber", "uber", "about"]},
		{right: "feedback", aliases: ["bewerten", "bewertung"]},
		{right: "newsletter", aliases: ["elf-newsletter", "elfnewsletter"]},
		{right: "newsletter-archiv", aliases: ["newsletterarchiv", "elf-newsletter-archiv", "elfnewsletterarchiv", "archiv"]},
	];
	for (let page in redirectPages) {
		for (let alias in redirectPages[page]["aliases"]) {
			if (location.pathname == "/" + redirectPages[page]["aliases"][alias] + "/" || location.pathname == "/" + redirectPages[page]["aliases"][alias]) {
				location.pathname = redirectPages[page]["right"];
			}
		}
	}
}

function detectAndUpdateDeviceColorScheme() {
	if (matchMedia && matchMedia("(prefers-color-scheme: dark)").matches) deviceColorScheme = "dark";
	else deviceColorScheme = "light";
	if (localStorageAvailable && deviceColorScheme == localStorage.getItem("colorScheme")) localStorage.removeItem("colorScheme");
	updateColorScheme();
	if (matchMedia && !eventListenerAdded) {
		matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function() {
			detectAndUpdateDeviceColorScheme();
			updateImages();
		});
		eventListenerAdded = true;
	}
}

function updateColorScheme() {
	if (!(localStorageAvailable && ["light", "dark"].includes(localStorage.getItem("colorScheme")))) colorScheme = deviceColorScheme;
	else colorScheme = localStorage.getItem("colorScheme");
	switch (colorScheme) {
		case "light":
			document.querySelector(":root").style.setProperty("--primaryColor", "#80CEFF");
			document.querySelector(":root").style.setProperty("--secondaryColor", "#004F80");
			document.querySelector(":root").style.setProperty("--primaryText", "#000000");
			document.querySelector(":root").style.setProperty("--secondaryText", "#FFFFFF");
			break;
		case "dark":
			document.querySelector(":root").style.setProperty("--primaryColor", "#004F80");
			document.querySelector(":root").style.setProperty("--secondaryColor", "#80CEFF");
			document.querySelector(":root").style.setProperty("--primaryText", "#FFFFFF");
			document.querySelector(":root").style.setProperty("--secondaryText", "#000000");
			break;
	}
}

function loadContents() {
	var elements = document.body.querySelectorAll("header, div, footer");
	for (let element of elements) {
		var elementID = element.id;
		var url = "/contents/" + elementID + ".html";
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) element.innerHTML = xhr.responseText;
		}
		xhr.open("GET", url, false);
		xhr.send();
	}
}

function updateImages() {
	document.getElementById("logo").src = "/images/logo-" + colorScheme + ".svg";
	if (document.getElementById("app-installation") != null) {
		for (let className of ["add", "chrome", "dock", "edge", "share"]) {
			for (let icon of document.getElementsByClassName(className)) {
				icon.src = "/images/app-instructions/" + className + "-" + colorScheme + ".png";
			}
		}
	}

}

function updateAppButton() {
	addEventListener("beforeinstallprompt", (event) => {
		event.preventDefault();
		installationPrompt = event;
		document.getElementById("installationButton").hidden = false;
		document.getElementById("installationNote").hidden = false;
	});
	document.getElementById("installationButton").addEventListener("click", async () => {
		await installationPrompt.prompt();
	});
}

function updateAppInstructions() {
	var userAgent = navigator.userAgent;
	const OSs = {
		"Android": "Android",
		"CrOS": "ChromeOS",
		"iPad": "iPadOS",
		"iPhone": "iOS",
		"iPod": "iOS",
		"Linux": "Linux",
		"Mac OS X": "macOS",
		"Windows": "Windows",
	};
	OS = "Unknown";
	for (let testOS in OSs) {
		if (userAgent.includes(testOS)) {
			OS = OSs[testOS];
			break;
		}
	}
	if (OS == "Unknown") ID = "Unknown";
	else {
		claimedOS = OS;
		if (OS == "macOS" && navigator.maxTouchPoints) OS = "iPadOS";
		exactOS = OS;
		if (["ChromeOS", "Linux", "Windows"].includes(OS)) OS = "Computer";
		if (OS == "iPadOS") OS = "iOS";
		const browsers = {
			"Edg": "Edge",
			"EdgiOS": "Edge",
			"CriOS": "Chrome",
			"Chrome": "Chrome",
			"Firefox": "Firefox",
			"FxiOS": "Firefox",
			"Safari": "Safari",
		};
		browser = "Unknown";
		for (let testBrowser in browsers) {
			if (userAgent.includes(testBrowser)) {
				browser = browsers[testBrowser];
				break;
			}
		}
		exactBrowser = browser;
		if (browser == "Safari" && ["Android", "Computer"].includes(OS)) browser = "Unknown";
		if (OS == "macOS" && browser != "Safari") {
			if (["Chrome", "Edge"].includes(browser) || !new OffscreenCanvas(0, 0).getContext("webgl")) OS = "Computer";
			else {
				var macOSVersion = userAgent.replace("_", ".").match(/Mac OS X (\d+\.\d+)/);
				if (macOSVersion == null || parseFloat(macOSVersion[1]) != 10.15) OS = "Computer";
			}
		}
		if (browser == "Firefox" && ["Computer", "macOS"].includes(OS)) browser = "Unsupported";
		if (OS == "iOS") {
			if (!(claimedOS == "macOS")) var iOSVersion = userAgent.replace("_", ".").match(/OS (\d+\.\d+)/);
			else if (browser == "Safari") var iOSVersion = userAgent.match(/Version\/(\d+\.\d+)/);
			if (iOSVersion != null && browser != "Safari" && parseFloat(iOSVersion[1]) < 16.4) browser = "Unsupported";
			if (["Safari", "Chrome"].includes(browser)) browser = "Standard";
			if (browser == "Edge") browser = "Unsupported";
		}
		ID = OS + "-" + browser;
		if (ID == "macOS-Safari" && !document.createElement("audio").canPlayType("audio/wav; codecs=\"1\"")) ID = "Computer-Unsupported";
	}
	document.getElementById(ID).hidden = false;
	browserText = (typeof exactBrowser !== "undefined" && exactBrowser != "Unknown") ? " in " + exactBrowser : "";
	if (typeof exactOS == "undefined") exactOS = " einem unbekannten Betriebssystem";
	document.getElementById("instructions").innerHTML = "Installation unserer App" + browserText + " unter " + exactOS + ":";
}

function updateForm() {
	if (document.getElementById("sslcontact_form") == null) setTimeout(updateForm);
	else {
		if (observer != undefined) observer.disconnect();
		for (let element of document.querySelectorAll(".sslcontact *")) element.removeAttribute("style");
		replaceFormLabels();
		solveCaptcha();
		if (document.getElementsByClassName("newsletter").length == 0) {
			document.getElementsByTagName("textarea")[0].addEventListener("input", function() { this.style.height = this.scrollHeight + "px"; });
			document.getElementsByTagName("textarea")[0].dispatchEvent(new Event("input"));
		}
		new MutationObserver(updateForm).observe(document.getElementById("sslcontactholder"), {childList: true});	}
}

function replaceFormLabels() {
	var name = document.querySelector("[for=\"firstname\"]");
	var email = document.querySelector("[for=\"email\"]");
	var subject = document.querySelector("[for=\"subject\"]");
	var message = document.querySelector("[for=\"message\"]");
	if (name != null) name.innerHTML = "Name";
	if (email != null) email.innerHTML = "E-Mail-Adresse";
	if (subject != null) {
		if (subject.closest(".auftrag")) subject.innerHTML = "Auftragsbetreff";
		if (subject.closest(".feedback")) subject.innerHTML = "Feedbacksbetreff";
	}
	if (message.closest(".auftrag")) message.innerHTML = "Auftrag";
	if (message.closest(".feedback")) message.innerHTML = "Feedback";
	if (message.closest(".newsletter")) {
		message.innerHTML = "E-Mail-Adresse";
		document.getElementById("message").style.minHeight = "32px";
		document.getElementById("message").style.fontSize = "24px";
	};
}

function solveCaptcha() {
	document.getElementById("captcha").value = eval(document.querySelectorAll("[for=\"captcha\"]")[1].innerHTML.replace("=", ""));
}

function scrollToAnchor() {
	var anchor = decodeURI(location.hash);
	if (anchor) {
		var element = document.querySelector(anchor);
		if (element) element.scrollIntoView({ block: "center" });
	}
}

function sendAppInstallationStatistic() {
	time = new Date().getTime();
	if (!(localStorageAvailable && time <= parseInt(localStorage.getItem("mostRecentAppInstallationVisit")) + 900000)) {
		sendData(
			"Web App Installation:\n" +
			"User Agent: " + navigator.userAgent + "\n" +
			"Touchscreen: " + Boolean(navigator.maxTouchPoints) + "\n" +
			"Audio-Test: " + Boolean(document.createElement("audio").canPlayType("audio/wav; codecs=\"1\"")) + "\n" +
			"WebGL-Test: " + Boolean(new OffscreenCanvas(0, 0).getContext("webgl")) + "\n" +
			"Betriebssystem: " + exactOS + " → " + OS + "\n" +
			"Browser: " + exactBrowser + " → " + browser
		);
	}
	if (localStorageAvailable) localStorage.setItem("mostRecentAppInstallationVisit", time);
}

function sendStatistic() {
	time = new Date().getTime();
	if (!(localStorageAvailable && time <= parseInt(localStorage.getItem("mostRecentWebsiteVisit")) + 900000)) {
		sendData(
			"Webseitenaufruf:\n" +
			"Seite: " + decodeURI(location.pathname + location.hash) + "\n" +
			"User Agent: " + navigator.userAgent + "\n" +
			"Web App: " + Boolean(navigator.standalone) + "\n" +
			"Touchscreen: " + Boolean(navigator.maxTouchPoints) + "\n" +
			"Audio-Test: " + Boolean(document.createElement("audio").canPlayType("audio/wav; codecs=\"1\"")) + "\n" +
			"WebGL-Test: " + Boolean(new OffscreenCanvas(0, 0).getContext("webgl"))
		);
	}
	if (localStorageAvailable) localStorage.setItem("mostRecentWebsiteVisit", time);
}

function sendData(data) {
	if (document.getElementsByClassName("form").length == 0) {
		data = data.replaceAll("false", "Nein").replaceAll("true", "Ja")
		if (document.getElementById("sslcontactholder") == null) {
			var form = document.createElement("div");
			form.id = "sslcontactholder";
			form.hidden = true;
			document.body.appendChild(form);
			var script = document.createElement("script");
			script.src = "https://extern.ssl-contact.de/ujs/11111hGDbjs0UFVa0IGqSi489htGYteCJbKIx/sslcontactscript.js";
			document.head.appendChild(script);
		}
		submitData(data);
	}
}
function submitData(data) {
	if (document.getElementById("sslcontact_form") == null) setTimeout(submitData, 0, data);
	else {
		solveCaptcha();
		document.getElementById("message").value = data;
		document.getElementsByName("send")[0].click();
	}
}

function toggleColorScheme() {
	switch (colorScheme) {
		case "light":
			colorScheme = "dark";
			break;
		case "dark":
			colorScheme = "light";
			break;
	}
	if (colorScheme == deviceColorScheme) localStorage.removeItem("colorScheme");
	else localStorage.setItem("colorScheme", colorScheme);
	updateColorScheme();
	updateImages();
}
