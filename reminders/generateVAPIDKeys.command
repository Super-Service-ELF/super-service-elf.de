#!/usr/bin/env python3.13


from py_vapid import Vapid
from base64 import urlsafe_b64encode
from cryptography.hazmat.primitives import serialization


vapid_keys = Vapid()
vapid_keys.generate_keys()

print(
	"Public Key:",
	urlsafe_b64encode(
		vapid_keys.public_key.public_bytes(
			encoding=serialization.Encoding.X962,
			format=serialization.PublicFormat.UncompressedPoint,
		)
	).decode(),
)
print(
	"Private Key:",
	urlsafe_b64encode(
		vapid_keys.private_key.private_bytes(
			encoding=serialization.Encoding.DER,
			format=serialization.PrivateFormat.PKCS8,
			encryption_algorithm=serialization.NoEncryption(),
		)
	).decode(),
)
