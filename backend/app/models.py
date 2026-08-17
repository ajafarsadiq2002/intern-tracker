import uuid
from datetime import datetime

from sqlalchemy import Column, String, Date, DateTime, Text, ForeignKey, JSON, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="viewer")  # super_admin / admin / hr / manager / viewer
    allowed_pages = Column(JSON, default=list)  # ["dashboard", "interns", "tasks", "email_templates"]
    is_active = Column(String(50), default="active")  # active / inactive
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Intern(Base):
    __tablename__ = "interns"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    role = Column(String(50), nullable=False)  # AI/ML, Data Science, Full Stack
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    status = Column(String(50), default="Onboarding")  # Onboarding / Active / Completed / Dropped
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    assignments = relationship("TaskAssignment", back_populates="intern", cascade="all, delete-orphan")


class TaskLibrary(Base):
    __tablename__ = "task_library"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    doc_url = Column(String(1000), nullable=True)
    role = Column(String(50), nullable=True)  # AI/ML Intern, Data Science Intern, Full Stack Intern
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    assignments = relationship("TaskAssignment", back_populates="task", cascade="all, delete-orphan")


class TaskAssignment(Base):
    __tablename__ = "task_assignments"
    __table_args__ = (UniqueConstraint("task_id", "intern_id", name="uq_task_intern_assignment"),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    task_id = Column(UUID(as_uuid=True), ForeignKey("task_library.id", ondelete="CASCADE"), nullable=False)
    intern_id = Column(UUID(as_uuid=True), ForeignKey("interns.id", ondelete="CASCADE"), nullable=False)
    due_date = Column(Date, nullable=True)
    status = Column(String(50), default="Not Started")  # Not Started / In Progress / Completed
    assigned_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    task = relationship("TaskLibrary", back_populates="assignments")
    intern = relationship("Intern", back_populates="assignments")


class EmailTemplate(Base):
    __tablename__ = "email_templates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    role = Column(String(50), unique=True, nullable=False)
    subject = Column(String(500), nullable=False)
    body = Column(Text, nullable=False)
    placeholders = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class AssistantConversation(Base):
    __tablename__ = "assistant_conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False, default="New Chat")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    messages = relationship(
        "AssistantMessage",
        back_populates="conversation",
        cascade="all, delete-orphan",
        order_by="AssistantMessage.created_at",
    )


class AssistantMessage(Base):
    __tablename__ = "assistant_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(
        UUID(as_uuid=True), ForeignKey("assistant_conversations.id", ondelete="CASCADE"), nullable=False
    )
    role = Column(String(20), nullable=False)  # user / assistant
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    conversation = relationship("AssistantConversation", back_populates="messages")
