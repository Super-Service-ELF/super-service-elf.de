#!/usr/bin/env python3.13


import os
from getpass import getpass
from pywebpush import webpush
import json


directory = os.path.dirname(__file__)

with open(f"{directory}/config.py") as f:
	config = eval(f.read())[input("Reminder ID to send: ")]

print(f'Sending reminder with title "{config["title"]}" ...')

config["options"].setdefault("icon", "https://super-service-elf.de/images/logo.png")
config["options"].setdefault("requireInteraction", True)

with open(f"{directory}/subscribers.py") as f:
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
