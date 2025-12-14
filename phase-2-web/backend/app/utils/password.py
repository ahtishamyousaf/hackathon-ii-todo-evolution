"""
Password hashing and verification utilities.

Uses passlib with bcrypt for secure password hashing.
Never stores plain-text passwords - always hash before storing.
"""

from passlib.context import CryptContext

# Create password hashing context with bcrypt
# Bcrypt is a slow hashing algorithm designed for passwords
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """
    Hash a plain-text password using bcrypt.

    Args:
        password: Plain-text password to hash

    Returns:
        str: Hashed password (safe to store in database)

    Example:
        password_hash = hash_password("SecurePass123")
        user.password_hash = password_hash
        session.add(user)
        session.commit()

    Note:
        - Bcrypt automatically generates a salt
        - Hash is different each time even for same password
        - This is intentional and secure
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain-text password against a hashed password.

    Args:
        plain_password: Plain-text password from login attempt
        hashed_password: Hashed password from database

    Returns:
        bool: True if password matches, False otherwise

    Example:
        # During login
        user = session.get(User, user_id)
        if verify_password(login_password, user.password_hash):
            # Password correct - authenticate user
            return create_token(user)
        else:
            # Password incorrect
            raise HTTPException(401, "Invalid credentials")

    Security Note:
        - Takes constant time to prevent timing attacks
        - Returns False for invalid inputs (never raises exception)
    """
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        # Return False for any verification errors
        # Don't expose error details to prevent information leakage
        return False


def needs_rehash(hashed_password: str) -> bool:
    """
    Check if a password hash needs to be updated.

    This happens when:
    - Bcrypt rounds have been increased
    - A deprecated hashing scheme was used
    - Security settings have changed

    Args:
        hashed_password: Hashed password from database

    Returns:
        bool: True if hash should be updated

    Example:
        # During successful login
        if verify_password(password, user.password_hash):
            if needs_rehash(user.password_hash):
                # Update to stronger hash
                user.password_hash = hash_password(password)
                session.add(user)
                session.commit()
            return create_token(user)

    Note:
        This allows graceful migration to stronger hashing
        without forcing password resets.
    """
    return pwd_context.needs_update(hashed_password)
