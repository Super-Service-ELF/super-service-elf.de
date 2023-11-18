function loadWindow(targetIDs) {
	for (let targetID of targetIDs) {
		loadContent(targetID);
	}
	updateWindow();
	updateLogo();
}

function loadContent(targetID) {
	var target = document.getElementById(targetID);
	var url = "/content/" + targetID + ".html";
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function () {
		if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
			target.innerHTML = xhr.responseText;
		}
	}
	xhr.open("GET", url, true);
	xhr.send();
}

window.onresize = updateWindow;
function updateWindow() {
	try {
		if (window.innerWidth > 834) {
			document.getElementById("button").innerHTML = "Auftrag aufgeben";
			document.getElementById("mobileMenuButton").style.animation="rotate0 0s ease-out";
		}
		else {
			document.getElementById("button").innerHTML = "Auftrag";
		}
	}
	catch {
		setTimeout(updateWindow, 1);
	}
}

function updateLogo() {
	try {
		var logo = document.getElementById("logo").contentDocument;
		var SecondaryTexts = logo.getElementsByClassName("SecondaryText");
		var SecondaryColors = logo.getElementsByClassName("SecondaryColor");
		if (SecondaryTexts.length == 0 || SecondaryColors.length == 0) {
			throw "";
		}
		for (let SecondaryText of SecondaryTexts) {
			SecondaryText.style.fill = getComputedStyle(document.documentElement).getPropertyValue("--SecondaryText");
			
		}
		for (let SecondaryColor of SecondaryColors) {
			SecondaryColor.style.fill = getComputedStyle(document.documentElement).getPropertyValue("--SecondaryColor");
		}
	}
	catch {
		setTimeout(updateLogo, 1);
	}
}

var ColorScheme = "Light";
function toggleColorScheme() {
	switch (ColorScheme) {
		case "Dark":
			ColorScheme = "Light";
			document.querySelector(":root").style.setProperty("--PrimaryColor", "#80CEFF");
			document.querySelector(":root").style.setProperty("--SecondaryColor", "#004F80");
			document.querySelector(":root").style.setProperty("--PrimaryText", "#000000");
			document.querySelector(":root").style.setProperty("--SecondaryText", "#FFFFFF");
			break;
		case "Light":
			ColorScheme = "Dark";
			document.querySelector(":root").style.setProperty("--PrimaryColor", "#004F80");
			document.querySelector(":root").style.setProperty("--SecondaryColor", "#80CEFF");
			document.querySelector(":root").style.setProperty("--PrimaryText", "#FFFFFF");
			document.querySelector(":root").style.setProperty("--SecondaryText", "#000000");
			break;
	}
	updateLogo();
}

function addURLToLink() {
	var targetID = "404Link";
	try {
		var target = document.getElementById(targetID);
		var site = window.location.href;
		var oldLink = target.href;
		var newLink = oldLink.replace("URL", site);
		target.href = newLink;
	}
	catch {
		addURLToLink();
	}

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
		document.getElementById("navigationBar").style.height="225px";
		document.getElementById("mobileMenuButton").style.animation="rotate90 0.3s ease-out forwards";
	}
	else {
		document.getElementById("navigationBar").style.height="";
		document.getElementById("mobileMenuButton").style.animation="rotate0 0.3s ease-out";
	}
}