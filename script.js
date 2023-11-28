var colorScheme;
var deviceColorScheme;
var observer;
var eventListenerAdded = false;

function loadWindow(targetIDs) {
	for (let targetID of targetIDs) loadContent(targetID);
	updateWindow();
	detectAndUpdateDeviceColorScheme();
	if (document.getElementById("sslcontactholder") != null) updateForm();
	for (let i = 0; i < 10; i++) {
		setTimeout(scrollToAnchor, 10)
	}
}

function loadContent(targetID) {
	var target = document.getElementById(targetID);
	var url = "/content/" + targetID + ".html";
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function () {
		if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) target.innerHTML = xhr.responseText;
	}
	xhr.open("GET", url, true);
	xhr.send();
}

function updateWindow() {
	try {
		if (window.innerWidth > 834) {
			document.getElementById("button").innerHTML = "Auftrag aufgeben";
			document.getElementById("mobileMenuButton").style.animation = "rotate0 0s ease-out";
		} else {
			document.getElementById("button").innerHTML = "Auftrag";
		}
	}
	catch { setTimeout(updateWindow, 1) }
	window.onresize = updateWindow;
}

function detectAndUpdateDeviceColorScheme() {
	if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) deviceColorScheme = "Dark";
	else deviceColorScheme = "Light";
	if (localStorage.getItem("colorScheme") == deviceColorScheme) localStorage.removeItem("colorScheme");
	updateColorScheme();
	if (window.matchMedia && !eventListenerAdded) {
		window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", detectAndUpdateDeviceColorScheme);
		eventListenerAdded = true;
	}
}

function updateColorScheme() {
	if (localStorage.getItem("colorScheme") == null) colorScheme = deviceColorScheme;
	else colorScheme = localStorage.getItem("colorScheme");
	switch (colorScheme) {
		case "Light":
			document.querySelector(":root").style.setProperty("--primaryColor", "#80CEFF");
			document.querySelector(":root").style.setProperty("--secondaryColor", "#004F80");
			document.querySelector(":root").style.setProperty("--primaryText", "#000000");
			document.querySelector(":root").style.setProperty("--secondaryText", "#FFFFFF");
			break;
		case "Dark":
			document.querySelector(":root").style.setProperty("--primaryColor", "#004F80");
			document.querySelector(":root").style.setProperty("--secondaryColor", "#80CEFF");
			document.querySelector(":root").style.setProperty("--primaryText", "#FFFFFF");
			document.querySelector(":root").style.setProperty("--secondaryText", "#000000");
			break;
	}
	function updateLogo() {
		try {
			var logo = document.getElementById("logo").contentDocument;
			var primaryTexts = logo.getElementsByClassName("primaryText");
			var primaryColor = logo.getElementById("primaryColor");
			if (primaryTexts.length == 0 || primaryColor == null) throw "";
			for (let primaryText of primaryTexts) primaryText.style.fill = getComputedStyle(document.documentElement).getPropertyValue("--primaryText");
			primaryColor.style.fill = getComputedStyle(document.documentElement).getPropertyValue("--primaryColor");
		}
		catch { setTimeout(updateLogo, 1) }
	}
	updateLogo();
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
	catch { setTimeout(cleanFormStyles, 1) }
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
	catch { setTimeout(replaceFormLabels, 1) }
}

function observeForm() {
	try {
		var form = document.getElementById("sslcontactholder");
		if (form == null) throw "";
		observer = new MutationObserver(updateForm);
		observer.observe(form, {childList: true});
	}
	catch { setTimeout(observeForm, 1) }
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

function toggleColorScheme() {
	switch (colorScheme) {
		case "Light":
			colorScheme = "Dark";
			break;
		case "Dark":
			colorScheme = "Light";
			break;
	}
	if (colorScheme == deviceColorScheme) localStorage.removeItem("colorScheme");
	else localStorage.setItem("colorScheme", colorScheme);
	updateColorScheme();
}

function addURLTo404Link() {
	try {
		var target = document.getElementById("404Link");
		var oldLink = target.href;
		var site = window.location.href;
		var newLink = oldLink.replace("URL", site);
		target.href = newLink;
	}
	catch { setTimeout(addURLTo404Link, 1) }
}

function redirectFrom404() {
	const redirectPages = [{right: "über", aliases: ["ueber", "uber", "about"]}, {right: "", aliases: ["start", "home", "super"]}, {right: "newsletter-archiv", aliases: ["archiv", "newsletterarchiv", "elf-newsletter-archiv", "elfnewsletterarchiv"]}, {right: "newsletter", aliases: ["elf-newsletter", "elfnewsletter"]}, {right: "feedback", aliases: ["bewerten", "bewertung"]}];
	for (let page in redirectPages) {
		for (let alias in redirectPages[page]["aliases"]) {
			if ("/"+redirectPages[page]["aliases"][alias]+"/" == window.location.pathname || "/"+redirectPages[page]["aliases"][alias] == window.location.pathname) {
				window.location.pathname = redirectPages[page]["right"];
			}
		}
	}
}

function toggleMenu() {
	if (navigationBar.style.height == "") {
		document.getElementById("navigationBar").style.height = "225px";
		document.getElementById("mobileMenuButton").style.animation = "rotate90 0.3s ease-out forwards";
	} else {
		document.getElementById("navigationBar").style.height = "";
		document.getElementById("mobileMenuButton").style.animation = "rotate0 0.3s ease-out";
	}
}