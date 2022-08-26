from typing import NamedTuple, Optional

import jwt
from django.conf import settings

ALGORITHM = "HS256"


class RecordToken(NamedTuple):
    uri: str
    created: float


def create_record_token(payload: RecordToken) -> str:
    return jwt.encode({"p": payload}, settings.SECRET_KEY, algorithm=ALGORITHM)


def validate_record_token(token_str: str) -> Optional[RecordToken]:
    try:
        payload = jwt.decode(token_str, settings.SECRET_KEY, algorithms=[ALGORITHM])
        return RecordToken(*payload["p"])
    except jwt.InvalidTokenError:
        return None
