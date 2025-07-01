function runFunctionSafe(functionToRun) {
	try {
		return functionToRun();
	} catch (exception) {
		return "Fehler: " + exception;
	}
}

addEventListener("error", (errorEvent) => {
	sendError(
		"Skript: " + errorEvent.filename + "\n" +
		"Zeile: " + errorEvent.lineno + "\n" +
		"Spalte: " + errorEvent.colno + "\n" +
		"Fehler:\n" + errorEvent.error + "\n" +
		"Fehlermeldung:\n" + errorEvent.message
	);
});

addEventListener("unhandledrejection", (promiseRejectionEvent) => {
	sendError(
		"Fehler: Unhandled Promise Rejection\n" +
		"Grund: " + promiseRejectionEvent.reason
	);
});

let localStorageAvailable;
let colorScheme;
let deviceColorScheme;
let observer;
let os;
let exactOS;
let browser;
let exactBrowser;

addEventListener("DOMContentLoaded", () => {
	try {
		localStorageAvailable = Boolean(localStorage);
	} catch {
		localStorageAvailable = false;
	}
	detectAndUpdateDeviceColorScheme();
	loadContents();
	updateImages();
	if (navigator.standalone) {
		for (const element of document.getElementsByClassName("hideInApp")) {
			element.style.display = "none";
		}
	}
	if (location.pathname == "/auftrag") { document.getElementById("auftragButton").classList.add("redundant"); }
	if (document.getElementById("erinnerungen-aktivierung")) { updateRemindersInstructions(); }
	if (document.getElementById("app-installation")) {
		updateAppButton();
		updateAppInstructions();
	}
	if (document.getElementsByClassName("form").length) { updateForm(); }
	document.getElementById("colorSchemeToggle").hidden = !localStorageAvailable;
	document.body.classList.add("loaded");
	if (document.getElementById("404")) { sendData("Seite nicht gefunden: " + location.pathname); }
	if (document.getElementById("video")) { document.getElementsByTagName("video")[0].load(); }
	dispatchEvent(new Event("resize"));
});

addEventListener("resize", updateScrollMargin);

function redirectFrom404() {
	const decodedPathname = decodeURIComponent(location.pathname);
	const lowercasedPathname = decodedPathname.toLowerCase();
	if (decodedPathname != lowercasedPathname) { location.replace(lowercasedPathname); }
	const redirectPages = [
		{ right: "", aliases: ["start", "super", "home"] },
		{ right: "über", aliases: ["ueber", "uber", "about"] },
		{ right: "feedback", aliases: ["bewerten", "bewertung"] },
		{ right: "newsletter", aliases: ["elf-newsletter", "elfnewsletter"] },
		{ right: "newsletter#newsletter-archiv", aliases: ["newsletter-archiv", "newsletterarchiv", "elf-newsletter-archiv", "elfnewsletterarchiv", "archiv"] },
	];
	for (const page in redirectPages) {
		if (redirectPages[page].aliases.includes(location.pathname.slice(1))) {
			location.href = "/" + redirectPages[page].right;
			break;
		}
	}
	if (location.pathname.slice(-1) == "/") {
		location.pathname = location.pathname.replaceAll("/", "");
	}
}

function detectAndUpdateDeviceColorScheme() {
	if (matchMedia && matchMedia("(prefers-color-scheme: dark)").matches) {
		deviceColorScheme = "dark";
	} else {
		deviceColorScheme = "light";
	}
	if (localStorageAvailable && deviceColorScheme == localStorage.getItem("colorScheme")) {
		localStorage.removeItem("colorScheme");
	}
	updateColorScheme();
	if (matchMedia) {
		matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
			detectAndUpdateDeviceColorScheme();
			updateImages();
		}, { once: true });
	}
}

function updateColorScheme() {
	if (!(localStorageAvailable && ["light", "dark"].includes(localStorage.getItem("colorScheme")))) {
		colorScheme = deviceColorScheme;
	} else {
		colorScheme = localStorage.getItem("colorScheme");
	}
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
	const elements = document.body.querySelectorAll("header, div, footer");
	for (const element of elements) {
		const url = "/contents/" + element.id + ".html";
		const xhr = new XMLHttpRequest();
		xhr.onreadystatechange = () => {
			if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
				element.innerHTML = xhr.responseText;
			}
		};
		xhr.open("GET", url, false);
		xhr.send();
	}
}

function updateImages() {
	document.getElementById("logo").src = "/images/logo-" + colorScheme + ".svg";
	if (document.getElementById("app-installation")) {
		for (const className of ["add", "chrome", "dock", "edge", "share"]) {
			for (const icon of document.getElementsByClassName(className)) {
				icon.src = "/images/app-instructions/" + className + "-" + colorScheme + ".png";
			}
		}
	}
}

function updateAppButton() {
	addEventListener("beforeinstallprompt", (beforeInstallPromptEvent) => {
		beforeInstallPromptEvent.preventDefault();
		document.getElementById("installationButton").hidden = false;
		document.getElementById("installationNote").hidden = false;
		document.getElementById("installationButton").addEventListener("click", () => {
			beforeInstallPromptEvent.prompt();
		}, { once: true });
	});
}

function audioSupported() {
	return Boolean(document.createElement("audio").canPlayType('audio/wav; codecs="1"'));
}

function webGLSupported() {
	return typeof OffscreenCanvas !== "undefined" && Boolean(new OffscreenCanvas(0, 0).getContext("webgl"));
}

function updateAppInstructions() {
	const id = (() => {
		const userAgent = navigator.userAgent;
		os = (() => {
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
			for (const testOS in oses) {
				if (userAgent.includes(testOS)) {
					return oses[testOS];
				}
			}
			return "Unknown";
		})();
		if (os == "Unknown") { return "Unknown"; }
		const claimedOS = os;
		if (os == "macOS" && navigator.maxTouchPoints) { os = "iPadOS"; }
		exactOS = os;
		if (["ChromeOS", "Linux", "Windows"].includes(os)) { os = "Computer"; }
		if (os == "iPadOS") { os = "iOS"; }
		browser = (() => {
			const browsers = {
				"Edg": "Edge",
				"Chr": "Chrome",
				"Firefox": "Firefox",
				"FxiOS": "Firefox",
				"Safari": "Safari",
			};
			for (const testBrowser in browsers) {
				if (userAgent.includes(testBrowser)) {
					return browsers[testBrowser];
				}
			}
			return "Unknown";
		})();
		exactBrowser = browser;
		if (navigator.standalone) { return "already-installed" }
		if (browser == "Safari" && ["Android", "Computer"].includes(os)) { browser = "Unknown"; }
		if (os == "macOS") {
			if (browser == "Safari") {
				if (!audioSupported()) {
					os = "Computer";
					browser = "Unsupported";
				}
			} else if (["Chrome", "Edge"].includes(browser) || !webGLSupported()) {
				os = "Computer";
			} else {
				const macOSVersion = userAgent.replace("_", ".").match(/Mac OS X (\d+\.\d+)/);
				if (macOSVersion && macOSVersion[1] != "10.15") {
					os = "Computer";
				}
			}
		}
		if (browser == "Firefox" && ["Computer", "macOS"].includes(os)) { browser = "Unsupported"; }
		if (os == "iOS") {
			if (browser != "Safari" && claimedOS != "macOS") {
				const iOSVersion = userAgent.replace("_", ".").match(/OS (\d+\.\d+)/);
				if (iOSVersion && parseFloat(iOSVersion[1]) < 16.4) { browser = "Unsupported"; }
			}
			if (["Safari", "Chrome"].includes(browser)) { browser = "Standard"; }
			if (browser == "Edge") { browser = "Unsupported"; }
		}
		return os + "-" + browser;
	})();
	document.getElementById(id).hidden = false;
	const browserText = typeof exactBrowser !== "undefined" && exactBrowser != "Unknown" ? " in " + exactBrowser : "";
	const osText = typeof exactOS !== "undefined" ? exactOS : " einem unbekannten Betriebssystem";
	document.getElementById("instructions").innerHTML = "Installation unserer App" + browserText + " unter " + osText + ":";
}

function updateForm() {
	if (!document.getElementById("sslcontact_form")) {
		setTimeout(updateForm);
	} else {
		if (observer != undefined) { observer.disconnect(); }
		for (const element of document.querySelectorAll(".sslcontact *")) {
			element.removeAttribute("style");
		}
		replaceFormLabels();
		solveCaptcha();
		if (!document.getElementsByClassName("newsletter")) {
			document.getElementsByTagName("textarea")[0].addEventListener("input", () => {
				this.style.height = this.scrollHeight - 16 + "px";
			});
			document.getElementsByTagName("textarea")[0].dispatchEvent(new Event("input"));
		}
		new MutationObserver(updateForm).observe(document.getElementById("sslcontactholder"), { childList: true });
	}
}

function replaceFormLabels() {
	const name = document.querySelector("[for=firstname]");
	const email = document.querySelector("[for=email]");
	const subject = document.querySelector("[for=subject]");
	const message = document.querySelector("[for=message]");
	const submit = document.querySelector("[type=submit]");
	if (name) { name.innerHTML = "Name"; }
	if (email) {
		if (email.closest(".auftrag")) { email.innerHTML = "E-Mail-Adresse<p class=noPadding>(zur Auftragsbeantwortung)</p>"; }
		if (email.closest(".feedback")) { email.innerHTML = "E-Mail-Adresse<p class=noPadding>(für Rückfragen)</p>"; }
	}
	if (subject) {
		if (subject.closest(".auftrag")) { subject.innerHTML = "Auftragsbetreff"; }
		if (subject.closest(".feedback")) { subject.innerHTML = "Feedbacksbetreff"; }
	}
	if (message.closest(".auftrag")) { message.innerHTML = "Auftrag"; }
	if (message.closest(".feedback")) { message.innerHTML = "Feedback"; }
	if (message.closest(".newsletter")) {
		message.innerHTML = "E-Mail-Adresse";
		document.getElementById("message").style.minHeight = "32px";
		document.getElementById("message").style.fontSize = "24px";
	}
	submit.parentElement.insertAdjacentHTML("afterbegin", '<label><p class=noPadding>Indem Sie auf „Absenden“ klicken, erklären Sie sich unwiderruflich mit unseren <a href="/nutzungsbedingungen">Nutzungsbedingungen</a> einverstanden.</p></label>');
}

function solveCaptcha() {
	document.getElementById("captcha").value = eval(document.querySelectorAll('[for="captcha"]')[1].innerHTML.replace("=", ""));
}

function updateScrollMargin() {
	const header = document.querySelector("header");
	document.querySelectorAll("*").forEach((element) => {
		element.style.scrollMarginTop = getComputedStyle(header).position == "sticky" ? header.offsetHeight + "px" : "";
	});
}

function sendError(errorDescription) {
	sendData(
		"Fehler im Skript:\n" +
		"User Agent: " + runFunctionSafe(() => navigator.userAgent) + "\n" +
		"App: " + runFunctionSafe(() => Boolean(navigator.standalone)) + "\n" +
		"Touchscreen: " + runFunctionSafe(() => Boolean(navigator.maxTouchPoints)) + "\n" +
		"Audio-Test: " + runFunctionSafe(audioSupported) + "\n" +
		"WebGL-Test: " + runFunctionSafe(webGLSupported) + "\n" +
		"Seite: " + runFunctionSafe(() => decodeURI(location.pathname + location.hash)) + "\n" +
		errorDescription
	);
}

function sendData(data) {
	if (!document.getElementsByClassName("form").length) {
		data = data.replaceAll("false", "Nein").replaceAll("true", "Ja");
		if (!document.getElementById("sslcontactholder")) {
			const form = document.createElement("div");
			form.id = "sslcontactholder";
			form.hidden = true;
			document.body.appendChild(form);
			const script = document.createElement("script");
			script.src = "https://extern.ssl-contact.de/ujs/11111hGDbjs0UFVa0IGqSi489htGYteCJbKIx/sslcontactscript.js";
			document.head.appendChild(script);
		}
		submitData(data);
	}
}

function submitData(data) {
	if (!document.getElementById("sslcontact_form")) {
		setTimeout(submitData, 0, data);
	} else {
		solveCaptcha();
		document.getElementById("message").value = data;
		document.getElementsByName("send")[0].click();
	}
}

function updateRemindersInstructions() {
	const remindersSupported = typeof navigator.serviceWorker !== "undefined" && typeof Notification !== "undefined";
	if (remindersSupported) {
		if (!navigator.standalone) {
			document.getElementById("appRecommendation").hidden = false;
		}
		document.getElementById("remindersInstructions").hidden = false;
		document.getElementById("activateReminders").hidden = false;
		document.getElementById("deactivateReminders").hidden = false;	
	} else {
		if (navigator.standalone) {
			document.getElementById("unsupportedApp").hidden = false;
		} else {
			document.getElementById("unsupported").hidden = false;
		}
	}
}

function activateReminders() {
	document.getElementById("failure").hidden = true;
	(async () => {
		const registration = await navigator.serviceWorker.register("/sw.js");
		const permission = await Notification.requestPermission();
		if (permission !== "granted") {
			document.getElementById("permissionDenied").hidden = false;
			return;
		} else {
			document.getElementById("permissionDenied").hidden = true;
		}
		const subscription = await registration.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: "BOOXRPBndtdIJ3ophhkE4KT2lDzwmSQsCLfi5IRRlN4TB6olhN-Tb2rBZv4ZyTwOK9AVxp7Qs6SnByWqx7c_CAc",
		});
		const jsonSubscription = subscription.toJSON();
		if (!(
			jsonSubscription.endpoint &&
			jsonSubscription.keys.auth &&
			jsonSubscription.keys.p256dh
		)) {
			throw new Error("Invalid subscription properties:\n" + JSON.stringify(jsonSubscription));
		}
		sendData("Neues Erinnerungen-Abonnement:\n" + JSON.stringify(jsonSubscription));
		registration.active.postMessage("Activation successful");
	})().catch((reason) => {
		document.getElementById("failure").hidden = false;
		return Promise.reject(reason);
	});
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
	if (colorScheme == deviceColorScheme) {
		localStorage.removeItem("colorScheme");
	} else {
		localStorage.setItem("colorScheme", colorScheme);
	}
	updateColorScheme();
	updateImages();
}
