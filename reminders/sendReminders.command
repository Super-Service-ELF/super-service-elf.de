#!/usr/bin/env python3.13


import os
import json
from pywebpush import webpush


directory = os.path.dirname(__file__)

with open(f"{directory}/config.py") as f:
	config = eval(f.read())

config["data"]["options"].setdefault("icon", "https://super-service-elf.de/images/logo.png")
config["data"]["options"].setdefault("requireInteraction", True)


for subscriber in config["subscribers"]:
	print(f"Sending to {subscriber}...")
	webpush(
		subscription_info=subscriber,
		data=json.dumps(config["data"]),
		vapid_private_key=config["vapid_private_key"],
		vapid_claims={
			"sub": "mailto:mail@super-service-elf.de",
		},
	)


print("Done!")
