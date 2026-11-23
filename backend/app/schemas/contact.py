from pydantic import EmailStr, Field

from app.schemas.common import ApiModel, text


class ContactMessageInput(ApiModel):
    name: text(1, 150)
    email: EmailStr
    subject: text(1, 200)
    message: text(10, 5000)


class ContactMessageCreated(ApiModel):
    id: str
    message: str = Field(default="Message received")
