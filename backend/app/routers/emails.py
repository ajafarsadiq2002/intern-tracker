from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_active_user
from app.database import get_db
from app.models import EmailTemplate, Intern, User
from app.schemas import EmailPreviewResponse, EmailPreviewRequest, EmailSendRequest, EmailSendResponse
from app.services.email_service import render_template, send_email, get_default_email_context

router = APIRouter(prefix="/api/emails", tags=["emails"])


@router.post("/preview/{intern_id}", response_model=EmailPreviewResponse)
def preview_email(
    intern_id: UUID,
    preview_in: EmailPreviewRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    intern = db.query(Intern).filter(Intern.id == intern_id).first()
    if not intern:
        raise HTTPException(status_code=404, detail="Intern not found")

    template = db.query(EmailTemplate).filter(EmailTemplate.role == intern.role).first()
    if not template:
        raise HTTPException(status_code=404, detail="Email template not found for this role")

    context = get_default_email_context(intern)
    subject_template = preview_in.subject if preview_in.subject else template.subject
    body_template = preview_in.body if preview_in.body else template.body

    subject, body = render_template(body_template, subject_template, context)

    return EmailPreviewResponse(to=intern.email, subject=subject, body=body)


@router.post("/send/{intern_id}", response_model=EmailSendResponse)
async def send_email_to_intern(
    intern_id: UUID,
    send_in: EmailSendRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    intern = db.query(Intern).filter(Intern.id == intern_id).first()
    if not intern:
        raise HTTPException(status_code=404, detail="Intern not found")

    try:
        await send_email(to=intern.email, subject=send_in.subject, body=send_in.body)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")

    return EmailSendResponse(message=f"Welcome email sent successfully to {intern.email}")
