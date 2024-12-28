self.addEventListener("push", (pushEvent) => {
	console.log("Pushed");
	const pushMessageData = pushEvent.data.json();
	console.log(pushMessageData);
	pushEvent.waitUntil(
		self.registration.showNotification(
			"53" /* pushMessageData.title */,
			pushMessageData.options
		)
	);
});

self.addEventListener("notificationclick", (notificationEvent) => {
	console.log("Clicked");
	notificationEvent.preventDefault();
	const notification = notificationEvent.notification;
	notification.close();
	notificationEvent.waitUntil(
		clients.openWindow(notification.data.url)
	);
});
