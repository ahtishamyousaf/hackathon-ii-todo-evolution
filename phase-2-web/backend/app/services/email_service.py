"""
Email Service

Handles sending email notifications to users.
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List
from app.config import settings


class EmailService:
    """Service for sending emails."""

    def __init__(self):
        self.smtp_host = getattr(settings, 'smtp_host', 'smtp.gmail.com')
        self.smtp_port = getattr(settings, 'smtp_port', 587)
        self.smtp_user = getattr(settings, 'smtp_user', None)
        self.smtp_password = getattr(settings, 'smtp_password', None)
        self.from_email = getattr(settings, 'from_email', 'noreply@taskflow.com')

    def send_email(
        self,
        to_email: str,
        subject: str,
        body_text: str,
        body_html: str = None
    ) -> bool:
        """
        Send an email.

        Args:
            to_email: Recipient email address
            subject: Email subject
            body_text: Plain text body
            body_html: HTML body (optional)

        Returns:
            True if sent successfully, False otherwise
        """
        if not self.smtp_user or not self.smtp_password:
            print("Email not configured. Skipping email send.")
            return False

        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['From'] = self.from_email
            msg['To'] = to_email
            msg['Subject'] = subject

            # Attach text and HTML parts
            msg.attach(MIMEText(body_text, 'plain'))
            if body_html:
                msg.attach(MIMEText(body_html, 'html'))

            # Send email
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)

            return True

        except Exception as e:
            print(f"Failed to send email: {e}")
            return False

    def send_task_due_reminder(self, to_email: str, task_title: str, due_date: str):
        """Send a task due date reminder."""
        subject = f"Reminder: Task '{task_title}' is due soon"
        body_text = f"""
Hello,

This is a reminder that your task "{task_title}" is due on {due_date}.

Please make sure to complete it on time.

Best regards,
TaskFlow Team
        """
        body_html = f"""
<html>
  <body>
    <p>Hello,</p>
    <p>This is a reminder that your task <strong>"{task_title}"</strong> is due on <strong>{due_date}</strong>.</p>
    <p>Please make sure to complete it on time.</p>
    <p>Best regards,<br>TaskFlow Team</p>
  </body>
</html>
        """
        return self.send_email(to_email, subject, body_text, body_html)

    def send_task_assigned(self, to_email: str, task_title: str, assigned_by: str):
        """Send notification when a task is assigned."""
        subject = f"Task Assigned: {task_title}"
        body_text = f"""
Hello,

{assigned_by} has assigned you a new task: "{task_title}".

Log in to TaskFlow to view the details.

Best regards,
TaskFlow Team
        """
        body_html = f"""
<html>
  <body>
    <p>Hello,</p>
    <p><strong>{assigned_by}</strong> has assigned you a new task: <strong>"{task_title}"</strong>.</p>
    <p>Log in to TaskFlow to view the details.</p>
    <p>Best regards,<br>TaskFlow Team</p>
  </body>
</html>
        """
        return self.send_email(to_email, subject, body_text, body_html)

    def send_comment_notification(self, to_email: str, task_title: str, commenter: str, comment: str):
        """Send notification when someone comments on a task."""
        subject = f"New Comment on: {task_title}"
        body_text = f"""
Hello,

{commenter} commented on the task "{task_title}":

"{comment}"

Log in to TaskFlow to reply.

Best regards,
TaskFlow Team
        """
        body_html = f"""
<html>
  <body>
    <p>Hello,</p>
    <p><strong>{commenter}</strong> commented on the task <strong>"{task_title}"</strong>:</p>
    <blockquote>"{comment}"</blockquote>
    <p>Log in to TaskFlow to reply.</p>
    <p>Best regards,<br>TaskFlow Team</p>
  </body>
</html>
        """
        return self.send_email(to_email, subject, body_text, body_html)


# Singleton instance
email_service = EmailService()
