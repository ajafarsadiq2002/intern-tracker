# Intern Tracker

A web-based intern management system built with **React + FastAPI + PostgreSQL**.

## Features

- Multi-user authentication (register/login)
- Manage interns (AI/ML, Data Science, Full Stack)
- Track intern status (Onboarding / Active / Completed / Dropped)
- Assign and track tasks
- Role-based welcome email templates
- Send editable welcome emails via Gmail SMTP
- Dashboard with summary stats

## Tech Stack

- **Frontend:** React + Vite
- **Backend:** FastAPI + SQLAlchemy + Alembic
- **Database:** PostgreSQL
- **Email:** Gmail SMTP (FastAPI-Mail)
- **Auth:** JWT (python-jose + passlib)

## Project Structure

```
intern-tracker/
├── backend/          # FastAPI app
│   ├── app/
│   ├── alembic/      # Migrations
│   ├── .env
│   └── requirements.txt
├── frontend/         # React app
│   ├── src/
│   └── package.json
└── README.md
```

## Setup

### 1. Clone / Open Project

```bash
cd intern-tracker
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Configure Environment Variables

Edit `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:your password@37.27.194.66:5430/intern_tracker

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
EMAIL_FROM=your-email@gmail.com

FRONTEND_URL=http://localhost:5173

SECRET_KEY=change-this-to-a-secure-random-key
```

For Gmail, you must use an **App Password**, not your regular password.

### 4. Run Migrations and Seed Templates

```bash
cd backend
alembic upgrade head
python seed.py
```

### 5. Start Backend

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 6. Frontend Setup

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Open browser: http://localhost:5173

### 7. First User

Go to `/register` and create your account.

## API Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/interns`
- `POST /api/interns`
- `GET /api/interns/{id}`
- `PUT /api/interns/{id}`
- `DELETE /api/interns/{id}`
- `GET /api/tasks`
- `POST /api/tasks`
- `GET /api/tasks/{id}`
- `PUT /api/tasks/{id}`
- `DELETE /api/tasks/{id}`
- `GET /api/email-templates`
- `GET /api/email-templates/{role}`
- `PUT /api/email-templates/{role}`
- `POST /api/emails/preview/{intern_id}`
- `POST /api/emails/send/{intern_id}`

## Email Template Placeholders

Use these placeholders in templates:

- `{{ intern_name }}`
- `{{ intern_email }}`
- `{{ role }}`
- `{{ company_name }}`
- `{{ task_doc_title }}`
- `{{ task_doc_url }}`
- `{{ timesheet_title }}`
- `{{ timesheet_url }}`
- `{{ phase }}`

## Production Deployment (Linux Server)

Build frontend:

```bash
cd frontend
npm run build
```

This creates `backend/frontend/dist`.

Start FastAPI production:

```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

FastAPI will serve the React build at `/`.

For a more robust setup, use `gunicorn` with `uvicorn.workers.UvicornWorker` and `nginx`.

## Future Features

- LLM-generated emails
- Bulk email to multiple interns
- File uploads (resumes, certificates)
- Advanced reports / Excel export

---

Built for managing interns end-to-end.
