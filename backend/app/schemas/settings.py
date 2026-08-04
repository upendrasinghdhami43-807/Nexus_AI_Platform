import uuid
from pydantic import BaseModel
from typing import Optional
from app.models.user_settings import ThemeMode

class UserSettingsRead(BaseModel):
    user_id: uuid.UUID
    default_model: str
    theme: ThemeMode
    send_on_enter: bool
    show_token_count: bool
    has_openai_key: bool = False
    has_anthropic_key: bool = False
    has_groq_key: bool = False
    ollama_base_url: Optional[str] = None

    class Config:
        from_attributes = True

class UserSettingsUpdate(BaseModel):
    default_model: Optional[str] = None
    theme: Optional[ThemeMode] = None
    openai_api_key: Optional[str] = None
    anthropic_api_key: Optional[str] = None
    groq_api_key: Optional[str] = None
    ollama_base_url: Optional[str] = None
    send_on_enter: Optional[bool] = None
    show_token_count: Optional[bool] = None
