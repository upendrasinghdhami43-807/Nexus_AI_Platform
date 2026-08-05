from pydantic import BaseModel, Field
from typing import Optional

class UserRegister(BaseModel):
    email: str = Field(..., description="User login email address")
    password: str = Field(..., min_length=6, description="Password min 6 characters")
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    sub: Optional[str] = None
