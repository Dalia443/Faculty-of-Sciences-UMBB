from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.contact import ContactMessageCreated, ContactMessageInput
from app.services import contact_service

router = APIRouter(prefix="/contact", tags=["Contact"])


@router.post("", response_model=ContactMessageCreated, status_code=201)
def send_message(data: ContactMessageInput, request: Request, db: Session = Depends(get_db)):
    """Formulaire de contact public (limité à 5 messages par heure et par adresse IP)."""
    client_ip = request.client.host if request.client else "unknown"
    return contact_service.create_message(db, data, client_ip)
