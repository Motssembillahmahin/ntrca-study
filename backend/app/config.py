from pydantic_settings import BaseSettings, SettingsConfigDict


class Config(BaseSettings):
    anthropic_api_key: str
    database_url: str = "sqlite:///./data/study.db"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


config = Config()
