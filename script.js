window.onpageshow = function(event) { if (event.persisted) window.location.reload() }

var colorScheme;
var deviceColorScheme;
var observer;
var eventListenerAdded = false;

function loadWindow() {
	if (document.getElementById("404") != null) redirectFrom404();
	detectAndUpdateDeviceColorScheme();
	loadContents();
	updateImages();
	if (document.getElementById("app-button") != null) updateAppButton();
	if (document.getElementById("app-instructions") != null) updateAppInstructions();
	if (document.getElementsByClassName("form").length > 0) updateForm();
	addYear();
	scrollToAnchor();
	if (document.getElementById("404") != null) addURLTo404Link();
	markAsLoaded();
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
			if (window.location.pathname == "/" + redirectPages[page]["aliases"][alias] + "/" || window.location.pathname == "/" + redirectPages[page]["aliases"][alias]) {
				window.location.pathname = redirectPages[page]["right"];
			}
		}
	}
}

function detectAndUpdateDeviceColorScheme() {
	if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) deviceColorScheme = "dark";
	else deviceColorScheme = "light";
	if (deviceColorScheme == localStorage.getItem("colorScheme")) localStorage.removeItem("colorScheme");
	updateColorScheme();
	if (window.matchMedia && !eventListenerAdded) {
		window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function() {
			detectAndUpdateDeviceColorScheme();
			updateImages();
		});
		eventListenerAdded = true;
	}
}

function updateColorScheme() {
	if (!["light", "dark"].includes(localStorage.getItem("colorScheme"))) colorScheme = deviceColorScheme;
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
	if (document.getElementById("app-instructions") != null) {
		for (let className of ["add", "chrome", "dock", "edge", "share"]) {
			for (let icon of document.getElementsByClassName(className)) {
				icon.src = "/images/app-instructions/" + className + "-" + colorScheme + ".png";
			}
		}
	}

}

function updateAppButton() {
	window.addEventListener("beforeinstallprompt", (event) => {
		event.preventDefault();
		document.getElementById("app-button").hidden = false;
		document.getElementById("app-instructions").hidden = true;
		installPrompt = event;
	});
	document.getElementById("installButton").addEventListener("click", async () => {
		await installPrompt.prompt();
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
	var OS = "Unknown";
	for (let testOS in OSs) {
		if (userAgent.includes(testOS)) {
			OS = OSs[testOS];
			break;
		}
	}
	if (OS == "Unknown") ID = "Unknown";
	else {
		if (OS == "macOS" && navigator.maxTouchPoints) OS = "iPadOS";
		exactOS = OS
		OS = OS.replace(/ChromeOS|Linux|Windows/, "Computer");
		OS = OS.replace("iPadOS", "iOS");
		const browsers = {
			"Edg": "Edge",
			"EdgiOS": "Edge",
			"CriOS": "Chrome",
			"Chrome": "Chrome",
			"Firefox": "Firefox",
			"FxiOS": "Firefox",
			"Safari": "Safari",
		};
		var browser = "Unknown";
		for (let testBrowser in browsers) {
			if (userAgent.includes(testBrowser)) {
				browser = browsers[testBrowser];
				break;
			}
		}
		exactBrowser = browser
		if (["Android", "Computer"].includes(OS)) browser = browser.replace("Safari", "Unknown");
		if (["Chrome", "Edge"].includes(browser)) OS = OS.replace("macOS", "Computer");
		if (["Computer", "macOS"].includes(OS)) browser = browser.replace("Firefox", "Unsupported");
		if (OS == "iOS") {
			var safariVersion = userAgent.match(/Version\/(\d+\.\d+)/);
			if (safariVersion != null) {
				safariVersion = parseFloat(safariVersion[1]);
				if (safariVersion < 16.4 && browser != "Safari") browser = "Unsupported";
				if (safariVersion >= 17.4 && exactOS == "iOS") browser = "Profile";
			}
			browser = browser.replace(/Safari|Chrome/, "Standard");
			browser = browser.replace("Edge", "Unsupported");
		}
		if (browser == "Unsupported") OS = OS.replace(/iOS|macOS/, "Apple");
		ID = OS + "-" + browser;
		if (ID == "macOS-Safari") {
			var safariVersion = userAgent.match(/Version\/(\d+)/);
			if (safariVersion != null) {
				safariVersion = parseInt(safariVersion[1]);
				if (safariVersion < 17 || !document.createElement("audio").canPlayType("audio/wav; codecs=\"1\"")) ID = "Computer-Unsupported";
			}
		}
	}
	document.getElementById(ID).hidden = false;
	browserText = (typeof exactBrowser !== "undefined" && exactBrowser != "Unknown") ? " in " + exactBrowser : "";
	if (typeof exactOS == "undefined") exactOS = " einem unbekannten Betriebssystem";
	document.getElementById("instructions").innerHTML = "Installation unserer App" + browserText + " unter " + exactOS + ":";
}

function updateForm() {
	if (observer != undefined) observer.disconnect();
	cleanFormStyles();
	replaceFormLabels();
	observeForm();
}

function cleanFormStyles() {
	try {
		var elements = document.querySelectorAll(".sslcontact *");
		if (elements.length == 0) throw "";
		for (let element of elements) element.removeAttribute("style");
	}
	catch { setTimeout(cleanFormStyles) }
}

function replaceFormLabels() {
	try {
		var name = document.querySelector("label[for='firstname']");
		var email = document.querySelector("label[for='email']");
		var subject = document.querySelector("label[for='subject']");
		var message = document.querySelector("label[for='message']");
		if (message == null) throw "";
		if (name != null) name.innerHTML = "Name";
		if (email != null) email.innerHTML = "E-Mail-Adresse";
		if (subject != null) {
			if (subject.closest(".auftrag")) subject.innerHTML = "Auftragsbetreff";
			if (subject.closest(".feedback")) subject.innerHTML = "Feedbacksbetreff";
		}
		if (message != null) {
			if (message.closest(".auftrag")) message.innerHTML = "Auftrag";
			if (message.closest(".feedback")) message.innerHTML = "Feedback";
			if (message.closest(".newsletter")) message.innerHTML = "E-Mail-Adresse";
		}
	}
	catch { setTimeout(replaceFormLabels) }
}

function observeForm() {
	var form = document.getElementById("sslcontactholder");
	observer = new MutationObserver(updateForm);
	observer.observe(form, {childList: true});
}

function addYear() {
	document.getElementById("year").innerHTML = new Date().getFullYear();
}

function scrollToAnchor() {
	var anchor = window.location.hash;
	if (anchor) {
		var element = document.querySelector(anchor);
		if (element) element.scrollIntoView({ block: "center" });
	}
}

function addURLTo404Link() {
	var element = document.getElementById("404Link");
	var oldLink = element.href;
	var site = window.location.href;
	var newLink = oldLink.replace("URL", site);
	element.href = newLink;
}

function markAsLoaded() {
	document.body.classList.add("loaded");
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
