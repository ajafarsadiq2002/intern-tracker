from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_active_user
from app.database import get_db
from app.models import EmailTemplate, Intern, User
from app.schemas import EmailTemplateUpdate, EmailTemplateResponse, EmailPreviewResponse, EmailSendRequest, EmailSendResponse
from app.services.email_service import (
    render_template,
    send_email,
    get_default_email_context,
)

router = APIRouter(prefix="/api/email-templates", tags=["email-templates"])


@router.get("", response_model=list[EmailTemplateResponse])
def list_templates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return db.query(EmailTemplate).all()


@router.get("/{role:path}", response_model=EmailTemplateResponse)
def get_template(
    role: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    template = db.query(EmailTemplate).filter(EmailTemplate.role == role).first()
    if not template:
        raise HTTPException(status_code=404, detail="Email template not found")
    return template


@router.put("/{role:path}", response_model=EmailTemplateResponse)
def update_template(
    role: str,
    template_in: EmailTemplateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    template = db.query(EmailTemplate).filter(EmailTemplate.role == role).first()
    if not template:
        raise HTTPException(status_code=404, detail="Email template not found")

    update_data = template_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(template, key, value)

    db.commit()
    db.refresh(template)
    return template
