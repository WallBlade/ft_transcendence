from django.http import HttpResponse
from io import BytesIO

from ..models import User

import qrcode
import pyotp
import time
import io
import os
from cryptography.fernet import Fernet


key = os.getenv('2FA_SECRET_KEY')
cipher_suite = Fernet(key.encode()) 

class TwoFactorQRSetupSerializer:
    def __init__(self, user_id=None, token=None):
        self.user_id = user_id
        self.user = None
        self.secret = ""
        self.image_bytes = None

    class SerializerError(Exception):
        pass

    def generate_qr_code(self):
        self.secret = pyotp.random_base32()
        totp = pyotp.TOTP(self.secret)
        totp.time = time.time()
        otpauth_url = totp.provisioning_uri(name=self.user.username, issuer_name="Transcendence")

        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=5,
            border=0,
        )
        qr.add_data(otpauth_url)
        qr.make(fit=True)
        img = qr.make_image(fill_color="#F1E1CA", back_color="#232324")

        self.image_bytes = io.BytesIO()
        img.save(self.image_bytes, format='PNG')
        self.image_bytes.seek(0)

        # NEED TO ENCRYPT
        self.user.secret_2fa = cipher_suite.encrypt(self.secret.encode()).decode()
        self.user.save()

    def validate(self):
        try:
            self.user = User.objects.get(id=self.user_id)

            if self.user.is_2fa:
                raise self.SerializerError("2FA Already activated")
            
        except User.DoesNotExist:
            raise self.SerializerError("User not found")

class TwoFactorAuthSerializer:
    def __init__(self, request=None, user_id=None):
        self.request = request
        self.user_id = user_id
        self.user = None

    class SerializerError(Exception):
        pass

    def check_auth(self):
        if not self.user_id:
            raise self.SerializerError("User wasn't authenticated")

    def validate(self):
        try:
            self.user = User.objects.get(id=self.user_id)
            if not "token" in self.request:
                raise self.SerializerError("Token field is missing")

            token_to_verify = self.request["token"]

            if not self.user.secret_2fa:
                raise self.SerializerError("User secret key is missing")
            
            #Decrypt secret
            secret = cipher_suite.decrypt(self.user.secret_2fa.encode())
            secret = secret.decode()
            totp = pyotp.TOTP(secret)
            is_valid = totp.verify(token_to_verify)
            
            if not is_valid:
                raise self.SerializerError("Code is invalid")
        except User.DoesNotExist:
            raise self.SerializerError("User not found")