from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    APP_NAME: str
    APP_VERSION: str
    SECRET_KEY: str
    DATABASE_URL: str
    STATUS: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    AI_PROVIDER: str
    OLLAMA_BASE_URL: str
    OLLAMA_MODEL: str

    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env"
    )


settings = Settings()