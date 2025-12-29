from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Telehealth Platform"
    API_V1_STR: str = "/api/v1"
    
    # CORS - Allow all for dev simplicity, restrict in prod
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000"]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # Database
    DATABASE_URL: str = "duckdb:///./local_dev.db"  # DuckDB for local dev
    
    # Security
    SECRET_KEY: str = "should-be-changed-in-production-env"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # HeyGen
    HEYGEN_API_KEY: str = ""

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
