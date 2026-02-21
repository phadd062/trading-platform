from datetime import datetime, timezone

import jwt


def create_token(subject, token_type, expires_delta, secret_key, algorithm):
    now = datetime.now(timezone.utc)
    payload = {
        "sub": subject,
        "type": token_type,
        "iat": now,
        "exp": now + expires_delta,
    }
    return jwt.encode(payload, secret_key, algorithm=algorithm)


def generate_secret_key(length=100):
    import secrets

    allowed_chars = "abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*(-_=+)"
    return "".join(secrets.choice(allowed_chars) for _ in range(length))


if __name__ == "__main__":
    print(generate_secret_key())
