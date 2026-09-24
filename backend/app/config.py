"""App settings, read from environment variables (or a .env file)."""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Each field is filled from the env variable with the same name (case-insensitive).
    # The value after "=" is the default when the variable is missing.
    tmdb_api_key: str = ""
    database_url: str = "mysql+pymysql://movie:movie@localhost:3306/movieuniverse"

    # Also look for a .env file one folder up (project root) when running locally
    model_config = SettingsConfigDict(env_file=("../.env", ".env"), extra="ignore")


settings = Settings()
