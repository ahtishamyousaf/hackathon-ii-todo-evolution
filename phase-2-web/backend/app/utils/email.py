"""
Email utility functions for sending emails.

For development, emails are logged to console.
For production, configure SMTP settings in environment variables.
"""

import os
from typing import Optional
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


# Email configuration from environment
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", "noreply@todoapp.com")
SMTP_FROM_NAME = os.getenv("SMTP_FROM_NAME", "Todo App")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# Development mode - just log emails instead of sending
DEV_MODE = os.getenv("ENVIRONMENT", "development") == "development"


def send_email(
    to_email: str,
    subject: str,
    html_content: str,
    text_content: Optional[str] = None
) -> bool:
    """
    Send an email.

    In development mode, emails are logged to console.
    In production, emails are sent via SMTP.

    Args:
        to_email: Recipient email address
        subject: Email subject
        html_content: HTML email body
        text_content: Plain text fallback (optional)

    Returns:
        bool: True if email sent successfully, False otherwise
    """

    if DEV_MODE:
        # Development mode - just log the email
        print("\n" + "="*80)
        print("📧 EMAIL (Development Mode - Not Actually Sent)")
        print("="*80)
        print(f"To: {to_email}")
        print(f"Subject: {subject}")
        print(f"From: {SMTP_FROM_NAME} <{SMTP_FROM_EMAIL}>")
        print("-"*80)
        print(text_content if text_content else html_content)
        print("="*80 + "\n")
        return True

    # Production mode - send actual email
    try:
        # Create message
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = f"{SMTP_FROM_NAME} <{SMTP_FROM_EMAIL}>"
        message["To"] = to_email

        # Add text and HTML parts
        if text_content:
            part1 = MIMEText(text_content, "plain")
            message.attach(part1)

        part2 = MIMEText(html_content, "html")
        message.attach(part2)

        # Send email
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            if SMTP_USER and SMTP_PASSWORD:
                server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_FROM_EMAIL, to_email, message.as_string())

        print(f"✅ Email sent successfully to {to_email}")
        return True

    except Exception as e:
        print(f"❌ Failed to send email to {to_email}: {str(e)}")
        return False


def send_password_reset_email(to_email: str, reset_token: str) -> bool:
    """
    Send a password reset email with reset link.

    Args:
        to_email: User's email address
        reset_token: Password reset token

    Returns:
        bool: True if email sent successfully
    """

    reset_url = f"{FRONTEND_URL}/reset-password?token={reset_token}"

    subject = "Reset Your Password - Todo App"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
            }}
            .container {{
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .button {{
                display: inline-block;
                padding: 12px 24px;
                background-color: #3B82F6;
                color: white;
                text-decoration: none;
                border-radius: 6px;
                margin: 20px 0;
            }}
            .footer {{
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                font-size: 12px;
                color: #666;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Reset Your Password</h2>
            <p>You requested to reset your password for your Todo App account.</p>
            <p>Click the button below to reset your password:</p>
            <a href="{reset_url}" class="button">Reset Password</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #3B82F6;">{reset_url}</p>
            <p><strong>This link will expire in 1 hour.</strong></p>
            <p>If you didn't request a password reset, you can safely ignore this email.</p>
            <div class="footer">
                <p>This is an automated email from Todo App. Please do not reply.</p>
            </div>
        </div>
    </body>
    </html>
    """

    text_content = f"""
    Reset Your Password

    You requested to reset your password for your Todo App account.

    Click the link below to reset your password:
    {reset_url}

    This link will expire in 1 hour.

    If you didn't request a password reset, you can safely ignore this email.

    ---
    This is an automated email from Todo App. Please do not reply.
    """

    return send_email(to_email, subject, html_content, text_content)
