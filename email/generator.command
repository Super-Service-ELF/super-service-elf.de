#!/usr/bin/env python3.13


from os.path import dirname
from os import listdir
from base64 import b64encode
from re import sub

from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText


directory = dirname(__file__)

with open(f"{directory}/config.py") as f:
	config = eval(f.read())


plain = f"""\
Ihr E‑Mail-Programm stellt formatierte E‑Mails leider nicht dar. Bitte lesen Sie unseren ELF-Newsletter im Browser:
{config["link"]}

Ihr Super‑Service‑ELF‑Team\
"""

with open(f"{directory}/template.html") as f:
	html = f.read()

for font in listdir(f"{directory}/../fonts/"):
	if font.startswith("."): continue
	with open(f"{directory}/../fonts/{font}", "rb") as f:
		html = html.replace(f"{font}Placeholder", b64encode(f.read()).decode())

with open(f"{directory}/..{config["message"]}") as f:
	message = f.read().replace("href=\"/", "href=\"https://super-service-elf.de/")
html = html.replace("messagePlaceholder", sub(r"<h\d>.*?</h\d>", "", message))

html = html.replace("linkPlaceholder", config["link"])


email = MIMEMultipart(
	_subtype="alternative",
	_subparts=[
		MIMEText(_text=plain, _subtype="plain"),
		MIMEText(_text=html, _subtype="html", _charset="utf-8")
	]
)

email["From"] = "Super-Service-ELF <mail@super-service-elf.de>"
email["Subject"] = config["subject"]

with open(f"{directory}/email.eml", "w") as f:
	f.write(email.as_string())
