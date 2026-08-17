import json
from typing import Optional

from groq import BadRequestError, Groq
from sqlalchemy.orm import Session

from app.config import settings
from app.models import Intern, TaskAssignment, TaskLibrary

_client = None


def get_client() -> Groq:
    global _client
    if _client is None:
        _client = Groq(api_key=settings.GROQ_API_KEY)
    return _client


SYSTEM_PROMPT = """You are the internal AI assistant for an Intern Tracker application, helping an internship \
coordinator keep track of interns and draft communications.

You can call tools to read data about interns, their assigned tasks, and the task library. You have NO ability \
to send emails, or create/update/delete anything — you only read data and draft text. When asked to draft an \
email (welcome email, task-assignment email, or an internship-completion request to HR), write the full \
subject and body directly in your reply so the coordinator can copy it into the Compose Email page and send it \
themselves after reviewing it.

Be concise and professional. If a name given to you is ambiguous or matches multiple interns, list the matches \
and ask the user to clarify before proceeding. If a tool call returns no results, say so plainly rather than \
guessing."""


def _tool_list_interns(db: Session, role: Optional[str] = None, status: Optional[str] = None, search: Optional[str] = None):
    query = db.query(Intern)
    if role:
        query = query.filter(Intern.role == role)
    if status:
        query = query.filter(Intern.status == status)
    if search:
        query = query.filter(
            (Intern.name.ilike(f"%{search}%")) | (Intern.email.ilike(f"%{search}%"))
        )
    interns = query.order_by(Intern.created_at.desc()).limit(50).all()
    return [
        {
            "id": str(i.id),
            "name": i.name,
            "email": i.email,
            "role": i.role,
            "status": i.status,
            "start_date": str(i.start_date) if i.start_date else None,
            "end_date": str(i.end_date) if i.end_date else None,
        }
        for i in interns
    ]


def _find_interns_by_name_or_id(db: Session, name_or_id: str):
    query = db.query(Intern)
    try:
        import uuid as uuid_module

        parsed = uuid_module.UUID(name_or_id)
        return query.filter(Intern.id == parsed).all()
    except (ValueError, AttributeError):
        return query.filter(Intern.name.ilike(f"%{name_or_id}%")).all()


def _tool_get_intern_detail(db: Session, name_or_id: str):
    matches = _find_interns_by_name_or_id(db, name_or_id)
    if not matches:
        return {"error": f"No intern found matching '{name_or_id}'"}
    if len(matches) > 1:
        return {
            "ambiguous": True,
            "matches": [{"id": str(i.id), "name": i.name, "email": i.email, "role": i.role} for i in matches],
        }
    intern = matches[0]
    assignments = (
        db.query(TaskAssignment).filter(TaskAssignment.intern_id == intern.id).all()
    )
    return {
        "id": str(intern.id),
        "name": intern.name,
        "email": intern.email,
        "role": intern.role,
        "status": intern.status,
        "start_date": str(intern.start_date) if intern.start_date else None,
        "end_date": str(intern.end_date) if intern.end_date else None,
        "assigned_tasks": [
            {
                "title": a.task.title if a.task else None,
                "doc_url": a.task.doc_url if a.task else None,
                "due_date": str(a.due_date) if a.due_date else None,
                "status": a.status,
            }
            for a in assignments
        ],
    }


def _tool_get_intern_completion_summary(db: Session, name_or_id: str):
    matches = _find_interns_by_name_or_id(db, name_or_id)
    if not matches:
        return {"error": f"No intern found matching '{name_or_id}'"}
    if len(matches) > 1:
        return {
            "ambiguous": True,
            "matches": [{"id": str(i.id), "name": i.name, "email": i.email, "role": i.role} for i in matches],
        }
    intern = matches[0]
    assignments = db.query(TaskAssignment).filter(TaskAssignment.intern_id == intern.id).all()
    completed = [a for a in assignments if a.status == "Completed"]
    return {
        "id": str(intern.id),
        "name": intern.name,
        "email": intern.email,
        "role": intern.role,
        "status": intern.status,
        "start_date": str(intern.start_date) if intern.start_date else None,
        "end_date": str(intern.end_date) if intern.end_date else None,
        "completed_tasks": [
            {
                "title": a.task.title if a.task else None,
                "doc_url": a.task.doc_url if a.task else None,
            }
            for a in completed
        ],
        "total_tasks_assigned": len(assignments),
        "total_tasks_completed": len(completed),
    }


def _tool_list_task_library(db: Session, role: Optional[str] = None):
    query = db.query(TaskLibrary)
    if role:
        query = query.filter(TaskLibrary.role == role)
    items = query.order_by(TaskLibrary.created_at.desc()).all()
    return [
        {"id": str(t.id), "title": t.title, "role": t.role, "doc_url": t.doc_url, "description": t.description}
        for t in items
    ]


TOOL_IMPLEMENTATIONS = {
    "list_interns": _tool_list_interns,
    "get_intern_detail": _tool_get_intern_detail,
    "get_intern_completion_summary": _tool_get_intern_completion_summary,
    "list_task_library": _tool_list_task_library,
}

TOOL_SCHEMAS = [
    {
        "type": "function",
        "function": {
            "name": "list_interns",
            "description": "List interns, optionally filtered by role, status, or a name/email search term.",
            "parameters": {
                "type": "object",
                "properties": {
                    "role": {"type": "string", "description": "e.g. 'AI/ML Intern', 'Data Science Intern', 'Full Stack Intern'"},
                    "status": {"type": "string", "description": "e.g. 'Onboarding', 'Active', 'Completed', 'Dropped'"},
                    "search": {"type": "string", "description": "Partial name or email to search for"},
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_intern_detail",
            "description": "Get one intern's full record and their assigned tasks, by name or UUID.",
            "parameters": {
                "type": "object",
                "properties": {"name_or_id": {"type": "string"}},
                "required": ["name_or_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_intern_completion_summary",
            "description": (
                "Get an intern's completed tasks and completion stats, by name or UUID. "
                "Use this before drafting an internship-completion request to HR."
            ),
            "parameters": {
                "type": "object",
                "properties": {"name_or_id": {"type": "string"}},
                "required": ["name_or_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "list_task_library",
            "description": "List available task/document links in the task library, optionally filtered by role.",
            "parameters": {
                "type": "object",
                "properties": {"role": {"type": "string"}},
            },
        },
    },
]


def run_assistant_turn(db: Session, history: list[dict], user_message: str) -> str:
    client = get_client()

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages.extend(history)
    messages.append({"role": "user", "content": user_message})

    for _ in range(5):
        try:
            response = client.chat.completions.create(
                model=settings.GROQ_MODEL,
                messages=messages,
                tools=TOOL_SCHEMAS,
                tool_choice="auto",
            )
        except BadRequestError:
            # The model occasionally emits a malformed tool call (e.g. on a follow-up
            # question that doesn't actually need a fresh tool call). Retry once forcing
            # a plain-text answer instead of failing the whole turn.
            response = client.chat.completions.create(
                model=settings.GROQ_MODEL,
                messages=messages,
                tools=TOOL_SCHEMAS,
                tool_choice="none",
            )
        choice = response.choices[0]
        tool_calls = choice.message.tool_calls

        if not tool_calls:
            return choice.message.content or ""

        messages.append(
            {
                "role": "assistant",
                "content": choice.message.content or "",
                "tool_calls": [
                    {
                        "id": tc.id,
                        "type": "function",
                        "function": {"name": tc.function.name, "arguments": tc.function.arguments},
                    }
                    for tc in tool_calls
                ],
            }
        )

        for tc in tool_calls:
            fn = TOOL_IMPLEMENTATIONS.get(tc.function.name)
            try:
                args = json.loads(tc.function.arguments) if tc.function.arguments else {}
            except json.JSONDecodeError:
                args = {}
            result = fn(db, **args) if fn else {"error": f"Unknown tool {tc.function.name}"}
            messages.append(
                {
                    "role": "tool",
                    "tool_call_id": tc.id,
                    "content": json.dumps(result, default=str),
                }
            )

    return "I wasn't able to finish that request after several tool calls — please try rephrasing or narrowing it down."


def generate_title(first_message: str) -> str:
    client = get_client()
    response = client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[
            {
                "role": "system",
                "content": "Generate a short 3-6 word title summarizing this chat message. Reply with only the title, no quotes or punctuation at the end.",
            },
            {"role": "user", "content": first_message},
        ],
        max_tokens=20,
    )
    title = (response.choices[0].message.content or "New Chat").strip().strip('"')
    return title[:255] or "New Chat"
