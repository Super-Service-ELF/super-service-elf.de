#!/usr/bin/env python3.13


import config
from getpass import getpass
import json
import os
from pywebpush import webpush
import subscribers


os.chdir(os.path.dirname(__file__))

config = config.config[input("Reminder ID to send: ")]

print(f'Sending reminder with title "{config["title"]}" and body "{config["options"]["body"]}"...')

config["options"].setdefault("icon", "https://super-service-elf.de/images/logo.png")
config["options"].setdefault("requireInteraction", True)

vapid_private_key = getpass("VAPID private key: ")

for subscriber in subscribers.subscribers:
	print(f"Sending to {subscriber}...")
	webpush(
		subscription_info=subscriber,
		data=json.dumps(config),
		vapid_private_key=vapid_private_key,
		vapid_claims={
			"sub": "mailto:mail@super-service-elf.de",
		},
	)


print("Done!")
