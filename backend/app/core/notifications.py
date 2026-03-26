from datetime import datetime
from email.message import EmailMessage
from pathlib import Path
import smtplib

from app.core.config import get_settings

OUTBOX_PATH = Path(__file__).resolve().parents[2] / "tmp" / "auth-outbox.log"


def send_auth_email(email: str, subject: str, body: str) -> None:
    settings = get_settings()

    if settings.email_delivery_mode == "smtp":
        if not settings.smtp_host:
            raise RuntimeError("SMTP_HOST가 설정되지 않았습니다.")

        message = EmailMessage()
        message["Subject"] = subject
        message["From"] = f"{settings.email_from_name} <{settings.email_from_address}>"
        message["To"] = email
        message.set_content(body.strip())

        if settings.smtp_use_ssl:
            with smtplib.SMTP_SSL(settings.smtp_host, settings.smtp_port) as smtp:
                if settings.smtp_username:
                    smtp.login(settings.smtp_username, settings.smtp_password)
                smtp.send_message(message)
            return

        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as smtp:
            if settings.smtp_use_tls:
                smtp.starttls()
            if settings.smtp_username:
                smtp.login(settings.smtp_username, settings.smtp_password)
            smtp.send_message(message)
        return

    OUTBOX_PATH.parent.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.utcnow().isoformat()
    with OUTBOX_PATH.open("a", encoding="utf-8") as fp:
        fp.write(f"[{timestamp}] TO: {email}\n")
        fp.write(f"SUBJECT: {subject}\n")
        fp.write(body.strip())
        fp.write("\n---\n")
