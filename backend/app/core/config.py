from typing import List, Union
from pydantic import AnyHttpUrl, field_validator, ConfigDict
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    model_config = ConfigDict(case_sensitive=True, env_file=".env", env_ignore_empty=True, env_prefix="")
    
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Grammar Anatomy API"
    
    # CORS - hardcoded to avoid environment variable issues
    def get_cors_origins(self) -> List[str]:
        return [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:3002",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:3001", 
            "http://127.0.0.1:3002",
        ]
    
    @property
    def BACKEND_CORS_ORIGINS(self) -> List[str]:
        return self.get_cors_origins()


    # Database
    DATABASE_URL: str = "sqlite:///./grammar_anatomy.db"
    
    # Security
    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True


settings = Settings() 