#!/usr/bin/env python3.13


from os.path import dirname
from email import message_from_file
from email.utils import formatdate

from smtplib import SMTP_SSL
from getpass import getpass
from email.utils import make_msgid


directory = dirname(__file__)

with open(f"{directory}/config.py") as f:
	config = eval(f.read())


with open(f"{directory}/email.eml") as f:
	message = message_from_file(f)

message["Date"] = formatdate(localtime=True)


with SMTP_SSL(host="smtp.mailbox.org", port=465) as server:
	server.login(user="mail@super-service-elf.de", password=getpass())
	for recipient in config["recipients"] + ["sent@super-service-elf.de"]:
		print(f"Sending to {"Sent mailbox" if recipient == "sent@super-service-elf.de" else recipient}...")
		del message["Message-ID"]
		del message["To"]
		message["Message-ID"] = make_msgid(domain="super-service-elf.de")
		message["To"] = recipient
		server.send_message(message)


print("Done!")
