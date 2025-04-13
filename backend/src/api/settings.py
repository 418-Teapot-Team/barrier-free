from dotenv import find_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120
    OPENAI_API_KEY: str

    model_config = SettingsConfigDict(
        env_file=find_dotenv(".env", usecwd=True),
        extra="ignore",
    )


try:
    settings = Settings()  # pyright: ignore[reportCallIssue]
except Exception as e:
    print(f"Exception when initializing settings: {e!r}")
    exit(1)
