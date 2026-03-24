from datetime import datetime
from pathlib import Path


OUTBOX_PATH = Path(__file__).resolve().parents[2] / "tmp" / "auth-outbox.log"


def send_auth_email(email: str, subject: str, body: str) -> None:
    OUTBOX_PATH.parent.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.utcnow().isoformat()
    with OUTBOX_PATH.open("a", encoding="utf-8") as fp:
        fp.write(f"[{timestamp}] TO: {email}\n")
        fp.write(f"SUBJECT: {subject}\n")
        fp.write(body.strip())
        fp.write("\n---\n")
