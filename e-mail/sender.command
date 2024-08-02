#!/usr/bin/env python3.12


from os.path import dirname
from email import message_from_file
from email.utils import formatdate

from smtplib import SMTP_SSL
from getpass import getpass
from copy import deepcopy


directory = dirname(__file__)

with open(f"{directory}/config.py") as f:
	config = eval(f.read())


with open(f"{directory}/e-mail.eml") as f:
	email = message_from_file(f)

email["Date"] = formatdate(localtime=True)


with SMTP_SSL(host="smtp.mailbox.org", port=465) as server:
	server.login(user="mail@super-service-elf.de", password=getpass())
	for recipient in config["recipients"]:
		emailCopy = deepcopy(email)
		emailCopy["To"] = recipient
		server.send_message(emailCopy)
