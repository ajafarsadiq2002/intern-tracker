from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_active_user
from app.database import get_db
from app.models import AssistantConversation, AssistantMessage, User
from app.schemas import (
    AssistantChatResponse,
    AssistantConversationDetailResponse,
    AssistantConversationResponse,
    AssistantMessageCreate,
)
from app.services.assistant_service import generate_title, run_assistant_turn

router = APIRouter(prefix="/api/assistant", tags=["assistant"])


def _get_owned_conversation(db: Session, conversation_id: UUID, user: User) -> AssistantConversation:
    conversation = (
        db.query(AssistantConversation)
        .filter(AssistantConversation.id == conversation_id, AssistantConversation.user_id == user.id)
        .first()
    )
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation


@router.get("/conversations", response_model=list[AssistantConversationResponse])
def list_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return (
        db.query(AssistantConversation)
        .filter(AssistantConversation.user_id == current_user.id)
        .order_by(AssistantConversation.updated_at.desc())
        .all()
    )


@router.post("/conversations", response_model=AssistantConversationResponse)
def create_conversation(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    conversation = AssistantConversation(user_id=current_user.id, title="New Chat")
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return conversation


@router.get("/conversations/{conversation_id}", response_model=AssistantConversationDetailResponse)
def get_conversation(
    conversation_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return _get_owned_conversation(db, conversation_id, current_user)


@router.delete("/conversations/{conversation_id}")
def delete_conversation(
    conversation_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    conversation = _get_owned_conversation(db, conversation_id, current_user)
    db.delete(conversation)
    db.commit()
    return {"message": "Conversation deleted"}


@router.post("/conversations/{conversation_id}/messages", response_model=AssistantChatResponse)
def send_message(
    conversation_id: UUID,
    message_in: AssistantMessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    conversation = _get_owned_conversation(db, conversation_id, current_user)

    history = [{"role": m.role, "content": m.content} for m in conversation.messages]
    is_first_message = len(history) == 0

    user_msg = AssistantMessage(conversation_id=conversation.id, role="user", content=message_in.message)
    db.add(user_msg)
    db.commit()

    try:
        reply_text = run_assistant_turn(db, history, message_in.message)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Assistant request failed: {str(e)}")

    reply_msg = AssistantMessage(conversation_id=conversation.id, role="assistant", content=reply_text)
    db.add(reply_msg)

    if is_first_message:
        try:
            conversation.title = generate_title(message_in.message)
        except Exception:
            conversation.title = message_in.message[:60]

    db.commit()
    db.refresh(conversation)
    db.refresh(reply_msg)

    return AssistantChatResponse(conversation=conversation, reply=reply_msg)
