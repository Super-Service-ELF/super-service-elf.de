#!/usr/bin/env python3.13


import os
import email
from smtplib import SMTP_SSL
from getpass import getpass
import urllib.parse


os.chdir(os.path.dirname(__file__))

with open("recipients.py") as f:
	recipients = eval(f.read())


with open("email.eml") as f:
	message = email.message_from_file(f)

message["Date"] = email.utils.formatdate(localtime=True)


with SMTP_SSL(host="smtp.mailbox.org", port=465) as server:
	server.login(
		user="mail@super-service-elf.de",
		password=getpass("SMTP server password for mail@super-service-elf.de: "),
	)
	for recipient in recipients + ["sent@super-service-elf.de"]:
		print(f"Sending to {recipient if recipient != "sent@super-service-elf.de" else "Sent mailbox"}...")
		del message["Message-ID"]
		del message["To"]
		message["Message-ID"] = email.utils.make_msgid(domain="super-service-elf.de")
		message["To"] = recipient
		message["List-Unsubscribe"] = f"<mailto:mail@super-service-elf.de?subject={urllib.parse.quote(f"Unsubscribe {recipient}")}>"
		server.send_message(message)


print("Done!")
