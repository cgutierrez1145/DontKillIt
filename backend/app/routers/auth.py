from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.auth import UserRegister, UserLogin, UserWithToken, UserResponse
from app.utils.auth import get_password_hash, verify_password, create_access_token, get_current_user

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
