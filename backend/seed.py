from app.config import settings
from app.database import SessionLocal
from app.models import EmailTemplate, TaskLibrary, User
from app.services.email_service import DEFAULT_TEMPLATES, DEFAULT_PLACEHOLDERS
from app.auth import hash_password

DEFAULT_TASK_LIBRARY = {
    "AI/ML Intern": {
        "title": "AI/ML Internship Tasks",
        "description": "Structured project tasks and learning objectives for the AI/ML internship track.",
        "doc_url": "https://docs.google.com/document/d/REPLACE_WITH_AIML_DOC_ID",
    },
    "Data Science Intern": {
        "title": "Data Science Internship Tasks",
        "description": "Structured project tasks and learning objectives for the Data Science internship track.",
        "doc_url": "https://docs.google.com/document/d/REPLACE_WITH_DATA_SCIENCE_DOC_ID",
    },
    "Full Stack Intern": {
        "title": "Full Stack Internship Tasks",
        "description": "Structured project tasks and learning objectives for the Full Stack internship track.",
        "doc_url": "https://docs.google.com/document/d/REPLACE_WITH_FULL_STACK_DOC_ID",
    },
}


def seed_email_templates():
    db = SessionLocal()
    try:
        existing_roles = {t.role for t in db.query(EmailTemplate.role).all()}
        for role, data in DEFAULT_TEMPLATES.items():
            if role in existing_roles:
                continue
            template = EmailTemplate(
                role=role,
                subject=data["subject"],
                body=data["body"],
                placeholders=DEFAULT_PLACEHOLDERS,
            )
            db.add(template)
        db.commit()
        print("Email templates seeded successfully.")
    finally:
        db.close()


def seed_super_admin():
    if not settings.SUPER_ADMIN_EMAIL or not settings.SUPER_ADMIN_PASSWORD:
        print("Skipping super admin seed: SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD not set in .env")
        return

    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == settings.SUPER_ADMIN_EMAIL).first()
        if existing:
            print("Super admin already exists.")
            return
        admin = User(
            email=settings.SUPER_ADMIN_EMAIL,
            full_name=settings.SUPER_ADMIN_NAME or settings.SUPER_ADMIN_EMAIL,
            role="super_admin",
            allowed_pages=["dashboard", "interns", "tasks", "email_templates", "admin_users", "assistant"],
            hashed_password=hash_password(settings.SUPER_ADMIN_PASSWORD),
            is_active="active",
        )
        db.add(admin)
        db.commit()
        print("Super admin seeded successfully.")
    finally:
        db.close()


def seed_task_library():
    db = SessionLocal()
    try:
        existing_roles = {t.role for t in db.query(TaskLibrary.role).filter(TaskLibrary.role.isnot(None))}
        for role, data in DEFAULT_TASK_LIBRARY.items():
            if role in existing_roles:
                continue
            db.add(TaskLibrary(role=role, **data))
        db.commit()
        print("Task library seeded successfully.")
    finally:
        db.close()


if __name__ == "__main__":
    seed_email_templates()
    seed_super_admin()
    seed_task_library()
