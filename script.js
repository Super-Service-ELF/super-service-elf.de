function loadWindow(targetIDs) {
	for (let targetID of targetIDs) {
		loadContent(targetID);
	}
	tryUpdateWindow();
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
window.onresize = tryUpdateWindow;
function tryUpdateWindow() {
	try {
		updateWindow();
	}
	catch {
		setTimeout(tryUpdateWindow, 1);
	}
}
function updateWindow() {
	if (window.innerWidth > 834) {
		document.getElementById("button").innerHTML = "Auftrag aufgeben";
		document.getElementById("mobileMenuButton").style.animation="rotate0 0s ease-out";
	}
	else {
		document.getElementById("button").innerHTML = "Auftrag";
	}
}
function tryAddURLToLink() {
	try {
		addURLToLink();
	}
	catch {
		setTimeout(tryAddURLToLink, 1);
	}
}
function addURLToLink() {
	var targetID = "404Link";
	var target = document.getElementById(targetID);
	var site = window.location.href;
	var oldLink = target.href;
	var newLink = oldLink.replace("URL", site);
	target.href = newLink;
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