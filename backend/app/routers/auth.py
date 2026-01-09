from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import secrets
from app.database import get_db
from app.models.user import User
from app.models.password_reset import PasswordResetToken
from app.schemas.auth import (
    UserRegister, UserLogin, UserWithToken, UserResponse,
    ForgotPasswordRequest, ForgotPasswordResponse,
    ResetPasswordRequest, ResetPasswordResponse
)
from app.utils.auth import get_password_hash, verify_password, create_access_token, get_current_user
from app.services.email_service import email_service

router = APIRouter()


@router.post("/register", response_model=UserWithToken, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """
    Register a new user.

    Creates a new user account with email and password.
    Returns the user information and JWT access token.
    """
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create new user
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        password_hash=hashed_password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Generate access token
    access_token = create_access_token(data={"sub": new_user.email})

    return {
        "user": UserResponse.from_orm(new_user),
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.post("/login", response_model=UserWithToken)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """
    Login with email and password.

    Authenticates user credentials and returns JWT access token.
    """
    # Get user by email
    user = db.query(User).filter(User.email == user_data.email).first()

    # Verify user exists and password is correct
    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Generate access token
    access_token = create_access_token(data={"sub": user.email})

    return {
        "user": UserResponse.from_orm(user),
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    Get current authenticated user information.

    Requires valid JWT token in Authorization header.
    """
    return UserResponse.from_orm(current_user)


@router.post("/logout")
async def logout():
    """
    Logout endpoint (client-side token deletion).

    In JWT authentication, logout is handled client-side by removing the token.
    This endpoint is provided for API consistency.
    """
    return {"message": "Successfully logged out. Please remove the token from client."}


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
async def forgot_password(
    request: ForgotPasswordRequest,
    http_request: Request,
    db: Session = Depends(get_db)
):
    """
    Request a password reset.

    Generates a password reset token and sends an email with the reset link.
    """
    # Find user by email
    user = db.query(User).filter(User.email == request.email).first()

    # Always return success to prevent email enumeration
    if not user:
        return ForgotPasswordResponse(
            message="If an account exists with this email, you will receive a password reset link."
        )

    # Invalidate any existing reset tokens for this user
    db.query(PasswordResetToken).filter(
        PasswordResetToken.user_id == user.id,
        PasswordResetToken.used == False
    ).update({"used": True})

    # Generate new reset token
    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=1)

    reset_token = PasswordResetToken(
        user_id=user.id,
        token=token,
        expires_at=expires_at
    )

    db.add(reset_token)
    db.commit()

    # Determine the frontend URL for the reset link
    # Try to get from referer or use default
    referer = http_request.headers.get("referer", "")
    if referer:
        # Extract base URL from referer (e.g., http://localhost:5173/forgot-password -> http://localhost:5173)
        from urllib.parse import urlparse
        parsed = urlparse(referer)
        reset_url = f"{parsed.scheme}://{parsed.netloc}/reset-password"
    else:
        reset_url = "http://localhost:5173/reset-password"

    # Send password reset email
    email_service.send_password_reset_email(
        to_email=user.email,
        reset_token=token,
        reset_url=reset_url
    )

    return ForgotPasswordResponse(
        message="If an account exists with this email, you will receive a password reset link."
    )


@router.post("/reset-password", response_model=ResetPasswordResponse)
async def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    """
    Reset password using a reset token.

    Validates the token and updates the user's password.
    """
    # Find the reset token
    reset_token = db.query(PasswordResetToken).filter(
        PasswordResetToken.token == request.token,
        PasswordResetToken.used == False
    ).first()

    if not reset_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )

    # Check if token is expired
    if reset_token.expires_at < datetime.utcnow():
        reset_token.used = True
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset token has expired. Please request a new one."
        )

    # Get the user
    user = db.query(User).filter(User.id == reset_token.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User not found"
        )

    # Update password
    user.password_hash = get_password_hash(request.new_password)

    # Mark token as used
    reset_token.used = True

    db.commit()

    return ResetPasswordResponse(message="Password has been reset successfully. You can now login with your new password.")
