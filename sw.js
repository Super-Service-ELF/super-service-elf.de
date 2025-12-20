self.addEventListener("message", (messageEvent) => {
	if (messageEvent.origin != origin) { return; }
	switch (messageEvent.data) {
		case "Activation successful":
			messageEvent.waitUntil(
				self.registration.showNotification(
					"Erinnerungen erfolgreich aktiviert!", {
						body: "Sie haben unsere Erinnerungen erfolgreich aktiviert und können sich nun mehrmals im Monat auf spannende Neuigkeiten und hilfreiche Tipps von uns freuen!",
						icon: "https://super-service-elf.de/images/logo.png",
						requireInteraction: false,
					}
				)
			);
			break;
	}
});

self.addEventListener("push", (pushEvent) => {
	const pushMessageData = pushEvent.data.json();
	pushEvent.waitUntil(
		self.registration.showNotification(
			pushMessageData.title,
			pushMessageData.options
		)
	);
});

self.addEventListener("notificationclick", (notificationEvent) => {
	const notification = notificationEvent.notification;
	if (!notification.data.url) { return; }
	notificationEvent.preventDefault();
	notificationEvent.waitUntil(
		clients.openWindow(notification.data.url)
	);
});
