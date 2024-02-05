window.onpageshow = function(event) { if (event.persisted) window.location.reload(); }

var colorScheme;
var deviceColorScheme;
var observer;
var eventListenerAdded = false;

function loadWindow(targetIDs) {
	if (document.getElementById("404") != null) redirectFrom404();
	detectAndUpdateDeviceColorScheme();
	for (let targetID of targetIDs) loadContent(targetID);
	updateLogo();
	if (document.getElementById("sslcontactholder") != null) updateForm();
	addYear();
	for (let i = 0; i < 10; i++) {
		setTimeout(scrollToAnchor, 10)
	}
	if (document.getElementById("404") != null) addURLTo404Link();
	setTimeout(markAsLoaded, 100)
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
			if ("/" + redirectPages[page]["aliases"][alias] + "/" == window.location.pathname || "/" + redirectPages[page]["aliases"][alias] == window.location.pathname) {
				window.location.pathname = redirectPages[page]["right"];
			}
		}
	}
}

function detectAndUpdateDeviceColorScheme() {
	if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) deviceColorScheme = "dark";
	else deviceColorScheme = "light";
	if (localStorage.getItem("colorScheme") == deviceColorScheme) localStorage.removeItem("colorScheme");
	updateColorScheme();
	if (window.matchMedia && !eventListenerAdded) {
		window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", detectAndUpdateDeviceColorScheme);
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

function loadContent(targetID) {
	var target = document.getElementById(targetID);
	var url = "/content/" + targetID + ".html";
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) target.innerHTML = xhr.responseText;
	}
	xhr.open("GET", url, true);
	xhr.send();
}

function updateLogo() {
	try {
		document.getElementById("logo").src = "/images/logo-" + colorScheme + ".svg";
	}
	catch { setTimeout(updateLogo, 0) }
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
	catch { setTimeout(cleanFormStyles, 0) }
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
	catch { setTimeout(replaceFormLabels, 0) }
}

function observeForm() {
	try {
		var form = document.getElementById("sslcontactholder");
		if (form == null) throw "";
		observer = new MutationObserver(updateForm);
		observer.observe(form, {childList: true});
	}
	catch { setTimeout(observeForm, 0) }
}

function addYear() {
	try {
		document.getElementById("year").innerHTML = new Date().getFullYear();
	}
	catch { setTimeout(addYear, 0) }
}

function scrollToAnchor() {
	var anchor = window.location.hash;
	if (anchor) {
		var element = document.querySelector(anchor);
		if (element) {
			element.scrollIntoView();
		}
	}
}

function addURLTo404Link() {
	try {
		var target = document.getElementById("404Link");
		var oldLink = target.href;
		var site = window.location.href;
		var newLink = oldLink.replace("URL", site);
		target.href = newLink;
	}
	catch { setTimeout(addURLTo404Link, 0) }
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
	updateLogo();
}
