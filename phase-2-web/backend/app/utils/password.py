"""
Password hashing and verification utilities.

Uses bcrypt for secure password hashing.
Never stores plain-text passwords - always hash before storing.
"""

import bcrypt


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
    # Convert password to bytes
    password_bytes = password.encode('utf-8')
    # Generate salt and hash password
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    # Return as string
    return hashed.decode('utf-8')


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
        # Convert to bytes
        password_bytes = plain_password.encode('utf-8')
        hashed_bytes = hashed_password.encode('utf-8')
        # Verify password
        return bcrypt.checkpw(password_bytes, hashed_bytes)
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
    # For now, always return False
    # In the future, could check bcrypt cost factor
    return False
