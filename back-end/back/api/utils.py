from jwt.exceptions import ExpiredSignatureError, InvalidTokenError

import datetime
import jwt
import os

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = os.getenv("HASH_ALGORITHM")

def generate_2fa_jwt_token(user_id):
    payload = {
        "2fa_user_id": user_id,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=1)
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token

def generate_jwt_token(user_id):
    payload = {
        "user_id": user_id,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)  # Expiry time 1 hour from now
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token

class JWTCookieValidator:
    def __init__(self, token=None):
        self.decoded_token = None
        self.token = token

    class AuthorizationError(Exception):
        pass

    def validate(self):
        if self.token is None:
            raise self.AuthorizationError("Authorization cookie not found")
        try:
            self.decoded_token = jwt.decode(self.token, SECRET_KEY, algorithms=ALGORITHM)
        except ExpiredSignatureError:
            raise self.AuthorizationError("JWT is expired")
        except InvalidTokenError:
            raise self.AuthorizationError("JWT is not valid")

    def get_user_id(self):
        return self.decoded_token["user_id"]

