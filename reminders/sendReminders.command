#!/usr/bin/env python3.13


from getpass import getpass
import json
import os
from pywebpush import webpush


os.chdir(os.path.dirname(__file__))

with open("config.py") as f:
	config = eval(f.read())[input("Reminder ID to send: ")]

print(f'Sending reminder with title "{config["title"]}" and body "{config["options"]["body"]}"...')

config["options"].setdefault("icon", "https://super-service-elf.de/images/logo.png")
config["options"].setdefault("requireInteraction", True)

with open("subscribers.py") as f:
	subscribers = eval(f.read())

vapid_private_key = getpass("VAPID private key: ")

for subscriber in subscribers:
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
