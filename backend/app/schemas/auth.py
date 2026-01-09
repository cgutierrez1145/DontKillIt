from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional


class UserRegister(BaseModel):
    """Schema for user registration."""
    email: EmailStr
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters")


class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str


class Token(BaseModel):
    """Schema for JWT token response."""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Schema for token payload data."""
    email: Optional[str] = None


class UserResponse(BaseModel):
    """Schema for user response (without password)."""
    id: int
    email: str
    created_at: datetime

    class Config:
        from_attributes = True


class UserWithToken(BaseModel):
    """Schema for user response with token."""
    user: UserResponse
    access_token: str
    token_type: str = "bearer"


class ForgotPasswordRequest(BaseModel):
    """Schema for forgot password request."""
    email: EmailStr


class ForgotPasswordResponse(BaseModel):
    """Schema for forgot password response."""
    message: str


class ResetPasswordRequest(BaseModel):
    """Schema for reset password request."""
    token: str
    new_password: str = Field(..., min_length=8, description="Password must be at least 8 characters")


class ResetPasswordResponse(BaseModel):
    """Schema for reset password response."""
    message: str
