from sqlalchemy.orm import Session

from app.core.rate_limit import contact_limiter
from app.models import ContactMessage
from app.schemas.contact import ContactMessageCreated, ContactMessageInput


def create_message(db: Session, data: ContactMessageInput, client_ip: str) -> ContactMessageCreated:
    contact_limiter.raise_if_blocked(client_ip, "Too many messages. Please try again later.")
    row = ContactMessage(
        name=data.name, email=str(data.email).lower(), subject=data.subject, message=data.message
    )
    db.add(row)
    db.commit()
    contact_limiter.record(client_ip)
    return ContactMessageCreated(id=str(row.id), message="Message received")
