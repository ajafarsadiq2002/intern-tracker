from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/intern_tracker"
    FRONTEND_URL: str = "http://localhost:5173"

    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAIL_FROM: str = ""

    SECRET_KEY: str = "change-me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"

    SUPER_ADMIN_EMAIL: str = ""
    SUPER_ADMIN_NAME: str = ""
    SUPER_ADMIN_PASSWORD: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
