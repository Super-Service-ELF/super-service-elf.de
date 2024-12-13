onerror = function(event, source, lineno, colno, error) {
	if (error) {
		sendData(
			"Fehler im Skript:\n" +
			"User Agent: " + navigator.userAgent + "\n" +
			"App: " + Boolean(navigator.standalone) + "\n" +
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

let colorScheme;
let deviceColorScheme;
let observer;
let eventListenerAdded = false;
let os;
let exactOS;
let browser;
let exactBrowser;

addEventListener("DOMContentLoaded", function() {
	try { localStorageAvailable = Boolean(localStorage); }
	catch { localStorageAvailable = false; }
	detectAndUpdateDeviceColorScheme();
	loadContents();
	updateImages();
	if (navigator.standalone) document.getElementById("appMenuItem").style.display = "none";
	if (location.pathname == ("/auftrag")) document.getElementById("auftragButton").classList.add("redundant");
	if (document.getElementById("app-installation")) {
		updateAppButton();
		updateAppInstructions();
	}
	if (document.getElementsByClassName("form").length) updateForm();
	document.getElementById("colorSchemeToggle").hidden = !localStorageAvailable;
	scrollToAnchor();
	document.body.classList.add("loaded");
	if (document.getElementById("404")) sendData("Seite nicht gefunden: " + location.pathname);
	if (localStorageAvailable && localStorage.getItem("isInternal")) document.getElementById("auftragButton").style.color = "red";
	if (document.getElementById("video")) document.getElementsByTagName("video")[0].load();
});

function redirectFrom404() {
	switch (location.pathname) {
		case "/i": localStorage.setItem("isInternal", true); break;
		case "/u": localStorage.removeItem("isInternal"); break;
	}
	const decodedPathname = decodeURIComponent(location.pathname);
	const lowercasedPathname = decodedPathname.toLowerCase();
	if (decodedPathname != lowercasedPathname) location.replace(lowercasedPathname);
	const redirectPages = [
		{ right: "", aliases: ["start", "super", "home", "i", "u"] },
		{ right: "über", aliases: ["ueber", "uber", "about"] },
		{ right: "feedback", aliases: ["bewerten", "bewertung"] },
		{ right: "newsletter", aliases: ["elf-newsletter", "elfnewsletter"] },
		{ right: "newsletter#newsletter-archiv", aliases: ["newsletter-archiv", "newsletterarchiv", "elf-newsletter-archiv", "elfnewsletterarchiv", "archiv"] },
	];
	for (let page in redirectPages) {
		if (redirectPages[page].aliases.includes(location.pathname.slice(1))) {
			location.href = "/" + redirectPages[page].right;
			break;
		}
	}
	if (location.pathname.slice(-1) == "/") location.pathname = location.pathname.replaceAll("/", "");
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
	let elements = document.body.querySelectorAll("header, div, footer");
	for (let element of elements) {
		let elementID = element.id;
		if (elementID == "webmail") {
			let message = new URLSearchParams(location.search).get("message");
			if (message) {
				element.innerHTML = message;
				continue;
			}
		}
		let url = "/contents/" + elementID + ".html";
		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) element.innerHTML = xhr.responseText;
		}
		xhr.open("GET", url, false);
		xhr.send();
	}
}

function updateImages() {
	document.getElementById("logo").src = "/images/logo-" + colorScheme + ".svg";
	if (document.getElementById("app-installation")) {
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
	let userAgent = navigator.userAgent;
	id = (function() {
		os = (function() {
			const oses = {
				"Android": "Android",
				"CrOS": "ChromeOS",
				"iPad": "iPadOS",
				"iPhone": "iOS",
				"iPod": "iOS",
				"Linux": "Linux",
				"Mac OS X": "macOS",
				"Windows": "Windows",
			};
			for (let testOS in oses) {
				if (userAgent.includes(testOS)) return oses[testOS];
			}
			return "Unknown";
		})();
		if (os == "Unknown") return "Unknown";
		let claimedOS = os;
		if (os == "macOS" && navigator.maxTouchPoints) os = "iPadOS";
		exactOS = os;
		if (["ChromeOS", "Linux", "Windows"].includes(os)) os = "Computer";
		if (os == "iPadOS") os = "iOS";
		browser = (function() {
			const browsers = {
				"Edg": "Edge",
				"Chr": "Chrome",
				"Firefox": "Firefox",
				"FxiOS": "Firefox",
				"Safari": "Safari",
			};
			for (let testBrowser in browsers) {
				if (userAgent.includes(testBrowser)) return browsers[testBrowser];
			}
			return "Unknown";
		})();
		exactBrowser = browser;
		if (browser == "Safari" && ["Android", "Computer"].includes(os)) browser = "Unknown";
		if (os == "macOS") {
			if (browser == "Safari") {
				if (!document.createElement("audio").canPlayType("audio/wav; codecs=\"1\"")) { os = "Computer"; browser = "Unsupported"; }
			} else if (["Chrome", "Edge"].includes(browser) || !new OffscreenCanvas(0, 0).getContext("webgl")) os = "Computer";
			else {
				let macOSVersion = userAgent.replace("_", ".").match(/Mac OS X (\d+\.\d+)/);
				if (macOSVersion && parseFloat(macOSVersion[1]) != 10.15) os = "Computer";
			}
		}
		if (browser == "Firefox" && ["Computer", "macOS"].includes(os)) browser = "Unsupported";
		if (os == "iOS") {
			if (browser != "Safari" && claimedOS != "macOS") {
				let iOSVersion = userAgent.replace("_", ".").match(/OS (\d+\.\d+)/);
				if (iOSVersion && parseFloat(iOSVersion[1]) < 16.4) browser = "Unsupported";
			}
			if (["Safari", "Chrome"].includes(browser)) browser = "Standard";
			if (browser == "Edge") browser = "Unsupported";
		}
		return os + "-" + browser;
	})();
	document.getElementById(id).hidden = false;
	browserText = (typeof exactBrowser !== "undefined" && exactBrowser != "Unknown") ? " in " + exactBrowser : "";
	osText = (typeof exactOS !== "undefined") ? exactOS : " einem unbekannten Betriebssystem";
	document.getElementById("instructions").innerHTML = "Installation unserer App" + browserText + " unter " + osText + ":";
}

function updateForm() {
	if (!document.getElementById("sslcontact_form")) setTimeout(updateForm);
	else {
		if (observer != undefined) observer.disconnect();
		for (let element of document.querySelectorAll(".sslcontact *")) element.removeAttribute("style");
		replaceFormLabels();
		solveCaptcha();
		if (!document.getElementsByClassName("newsletter")) {
			document.getElementsByTagName("textarea")[0].addEventListener("input", function() { this.style.height = (this.scrollHeight - 16) + "px"; });
			document.getElementsByTagName("textarea")[0].dispatchEvent(new Event("input"));
		}
		new MutationObserver(updateForm).observe(document.getElementById("sslcontactholder"), { childList: true });
	}
}

function replaceFormLabels() {
	let name = document.querySelector("[for=\"firstname\"]");
	let email = document.querySelector("[for=\"email\"]");
	let subject = document.querySelector("[for=\"subject\"]");
	let message = document.querySelector("[for=\"message\"]");
	if (name) name.innerHTML = "Name";
	if (email) email.innerHTML = "E-Mail-Adresse";
	if (subject) {
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
	let anchor = decodeURI(location.hash);
	if (anchor) {
		let element = document.querySelector(anchor);
		if (element) element.scrollIntoView({ block: "center" });
	}
}

function sendData(data) {
	if (!document.getElementsByClassName("form").length) {
		data = data.replaceAll("false", "Nein").replaceAll("true", "Ja");
		if (!document.getElementById("sslcontactholder")) {
			let form = document.createElement("div");
			form.id = "sslcontactholder";
			form.hidden = true;
			document.body.appendChild(form);
			let script = document.createElement("script");
			script.src = "https://extern.ssl-contact.de/ujs/11111hGDbjs0UFVa0IGqSi489htGYteCJbKIx/sslcontactscript.js";
			document.head.appendChild(script);
		}
		submitData(data);
	}
}

function submitData(data) {
	if (!document.getElementById("sslcontact_form")) setTimeout(submitData, 0, data);
	else {
		solveCaptcha();
		document.getElementById("message").value = data;
		if (!(localStorageAvailable && localStorage.getItem("isInternal"))) document.getElementsByName("send")[0].click();
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

function toggleInternalMode() {
	if (localStorage.getItem("isInternal")) localStorage.removeItem("isInternal");
	else localStorage.setItem("isInternal", true);
	location.reload();
}
