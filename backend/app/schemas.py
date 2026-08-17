from datetime import date, datetime
from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


# User schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "viewer"
    allowed_pages: List[str] = []


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class UserResponse(UserBase):
    id: UUID
    is_active: str
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
    allowed_pages: Optional[List[str]] = None
    is_active: Optional[str] = None
    password: Optional[str] = None


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


# Intern schemas
class InternBase(BaseModel):
    name: str
    email: EmailStr
    role: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: str = "Onboarding"


class InternCreate(InternBase):
    pass


class InternUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[str] = None


class InternResponse(InternBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    assignments: List["TaskAssignmentResponse"] = []

    class Config:
        from_attributes = True


class InternShortResponse(BaseModel):
    id: UUID
    name: str
    email: EmailStr
    role: str
    status: str

    class Config:
        from_attributes = True


# Task library schemas (master task/document definitions)
class TaskLibraryBase(BaseModel):
    title: str
    description: Optional[str] = None
    doc_url: Optional[str] = None
    role: Optional[str] = None


class TaskLibraryCreate(TaskLibraryBase):
    pass


class TaskLibraryUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    doc_url: Optional[str] = None
    role: Optional[str] = None


class TaskLibraryResponse(TaskLibraryBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Task assignment schemas (intern <-> task library link)
class TaskAssignmentBase(BaseModel):
    due_date: Optional[date] = None
    status: str = "Not Started"


class TaskAssignmentCreate(TaskAssignmentBase):
    task_id: UUID
    intern_id: UUID


class TaskAssignmentUpdate(BaseModel):
    due_date: Optional[date] = None
    status: Optional[str] = None


class TaskAssignmentResponse(TaskAssignmentBase):
    id: UUID
    task_id: UUID
    intern_id: UUID
    assigned_at: datetime
    created_at: datetime
    updated_at: datetime
    task: Optional["TaskLibraryResponse"] = None
    intern: Optional["InternShortResponse"] = None

    class Config:
        from_attributes = True


# Email template schemas
class EmailTemplateBase(BaseModel):
    role: str
    subject: str
    body: str
    placeholders: List[str] = []


class EmailTemplateCreate(EmailTemplateBase):
    pass


class EmailTemplateUpdate(BaseModel):
    subject: Optional[str] = None
    body: Optional[str] = None
    placeholders: Optional[List[str]] = None


class EmailTemplateResponse(EmailTemplateBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Email send schemas
class EmailPreviewRequest(BaseModel):
    subject: Optional[str] = None
    body: Optional[str] = None


class EmailPreviewResponse(BaseModel):
    to: str
    subject: str
    body: str


class EmailSendRequest(BaseModel):
    subject: str
    body: str


class EmailSendResponse(BaseModel):
    message: str


# Assistant schemas
class AssistantMessageResponse(BaseModel):
    id: UUID
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class AssistantConversationResponse(BaseModel):
    id: UUID
    title: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AssistantConversationDetailResponse(AssistantConversationResponse):
    messages: List[AssistantMessageResponse] = []


class AssistantMessageCreate(BaseModel):
    message: str = Field(..., min_length=1)


class AssistantChatResponse(BaseModel):
    conversation: AssistantConversationResponse
    reply: AssistantMessageResponse


# Resolve forward references
InternResponse.model_rebuild()
TaskAssignmentResponse.model_rebuild()
