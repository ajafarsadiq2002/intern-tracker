from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from jinja2 import Template

from app.config import settings

conf = ConnectionConfig(
    MAIL_USERNAME=settings.SMTP_USER,
    MAIL_PASSWORD=settings.SMTP_PASSWORD,
    MAIL_FROM=settings.EMAIL_FROM,
    MAIL_PORT=settings.SMTP_PORT,
    MAIL_SERVER=settings.SMTP_HOST,
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True,
)


async def send_email(to: str, subject: str, body: str):
    message = MessageSchema(
        subject=subject,
        recipients=[to],
        body=body,
        subtype="html",
    )
    fm = FastMail(conf)
    await fm.send_message(message)


def render_template(template_body: str, template_subject: str, context: dict) -> tuple:
    subject_template = Template(template_subject)
    body_template = Template(template_body)
    return subject_template.render(**context), body_template.render(**context)


DEFAULT_PLACEHOLDERS = [
    "intern_name",
    "intern_email",
    "role",
    "company_name",
    "task_doc_title",
    "task_doc_url",
    "timesheet_title",
    "timesheet_url",
    "phase",
]


def get_default_email_context(intern) -> dict:
    return {
        "intern_name": intern.name,
        "intern_email": intern.email,
        "role": intern.role,
        "company_name": "Constient Global Solutions",
        "task_doc_title": "Internship Task Details",
        "task_doc_url": "https://docs.google.com/document/d/example",
        "timesheet_title": "Daily Task Timesheet",
        "timesheet_url": "https://docs.google.com/spreadsheets/d/example",
        "phase": "Phase 1",
    }


DEFAULT_TEMPLATES = {
    "AI/ML Intern": {
        "subject": "Welcome to the Python & AI Internship Program – Internship Tasks and Guidelines",
        "body": """Dear {{ intern_name }},

I hope this email finds you well.

Welcome to {{ company_name }}! We are excited to have you join our {{ role }} Program. Over the coming weeks, you will work on a series of structured projects designed to strengthen your Python programming, data analysis, and AI fundamentals through hands-on learning.

Please refer to the internship task document below for the project details and learning objectives:

{{ task_doc_title }}
{{ task_doc_url }}

General Guidelines
Git & GitHub are mandatory for this internship. You are expected to become familiar with Git commands and follow proper version control practices throughout the internship.

Create a GitHub repository (or separate repositories if preferred) and commit your work daily using meaningful commit messages that reflect your progress.

Share your GitHub repository link with me once it has been created.

Organize your repository with appropriate folders containing source code, datasets, images, outputs, documentation, and any other relevant files.

Include a well-written README.md for every project explaining the project objective, implementation, setup instructions, and outputs.

Update your progress in the {{ timesheet_title }} at the end of each day (EOD) under your respective name:

{{ timesheet_title }}
{{ timesheet_url }}

Upon completing each project, ensure that all source code, datasets, generated outputs, screenshots, and documentation are committed to your GitHub repository.

Be prepared for periodic technical reviews where you will demonstrate your implementation, explain your approach, and answer technical questions related to your projects.

This internship is designed to provide practical, industry-oriented experience. I encourage you to explore beyond the given tasks, ask questions whenever needed, and focus on writing clean, well-documented, and maintainable code.

If you have any questions or need clarification at any stage, please feel free to reach out.

Wishing you all the very best for your internship. I look forward to seeing your progress and working with you.
""",
    },
    "Data Science Intern": {
        "subject": "Welcome to the Data Science Internship Program – Internship Tasks and Guidelines",
        "body": """Dear {{ intern_name }},

I hope this email finds you well.

Welcome to {{ company_name }}! We are excited to have you join our {{ role }} Program. Over the coming weeks, you will work on a series of structured projects designed to strengthen your Python programming, data analysis, statistics, and machine learning fundamentals through hands-on learning.

Please refer to the internship task document below for the project details and learning objectives:

{{ task_doc_title }}
{{ task_doc_url }}

General Guidelines
Git & GitHub are mandatory for this internship. You are expected to become familiar with Git commands and follow proper version control practices throughout the internship.

Create a GitHub repository (or separate repositories if preferred) and commit your work daily using meaningful commit messages that reflect your progress.

Share your GitHub repository link with me once it has been created.

Organize your repository with appropriate folders containing source code, datasets, images, outputs, documentation, and any other relevant files.

Include a well-written README.md for every project explaining the project objective, implementation, setup instructions, and outputs.

Update your progress in the {{ timesheet_title }} at the end of each day (EOD) under your respective name:

{{ timesheet_title }}
{{ timesheet_url }}

Upon completing each project, ensure that all source code, datasets, generated outputs, screenshots, and documentation are committed to your GitHub repository.

Be prepared for periodic technical reviews where you will demonstrate your implementation, explain your approach, and answer technical questions related to your projects.

This internship is designed to provide practical, industry-oriented experience. I encourage you to explore beyond the given tasks, ask questions whenever needed, and focus on writing clean, well-documented, and maintainable code.

If you have any questions or need clarification at any stage, please feel free to reach out.

Wishing you all the very best for your internship. I look forward to seeing your progress and working with you.
""",
    },
    "Full Stack Intern": {
        "subject": "Welcome to the Full Stack Development Internship Program – Internship Tasks and Guidelines",
        "body": """Dear {{ intern_name }},

I hope this email finds you well.

Welcome to {{ company_name }}! We are excited to have you join our {{ role }} Program. Over the coming weeks, you will work on a series of structured projects designed to strengthen your frontend, backend, database, and full-stack development skills through hands-on learning.

Please refer to the internship task document below for the project details and learning objectives:

{{ task_doc_title }}
{{ task_doc_url }}

General Guidelines
Git & GitHub are mandatory for this internship. You are expected to become familiar with Git commands and follow proper version control practices throughout the internship.

Create a GitHub repository (or separate repositories if preferred) and commit your work daily using meaningful commit messages that reflect your progress.

Share your GitHub repository link with me once it has been created.

Organize your repository with appropriate folders containing source code, datasets, images, outputs, documentation, and any other relevant files.

Include a well-written README.md for every project explaining the project objective, implementation, setup instructions, and outputs.

Update your progress in the {{ timesheet_title }} at the end of each day (EOD) under your respective name:

{{ timesheet_title }}
{{ timesheet_url }}

Upon completing each project, ensure that all source code, datasets, generated outputs, screenshots, and documentation are committed to your GitHub repository.

Be prepared for periodic technical reviews where you will demonstrate your implementation, explain your approach, and answer technical questions related to your projects.

This internship is designed to provide practical, industry-oriented experience. I encourage you to explore beyond the given tasks, ask questions whenever needed, and focus on writing clean, well-documented, and maintainable code.

If you have any questions or need clarification at any stage, please feel free to reach out.

Wishing you all the very best for your internship. I look forward to seeing your progress and working with you.
""",
    },
}
