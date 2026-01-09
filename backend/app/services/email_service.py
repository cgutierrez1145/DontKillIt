import resend
from app.config import settings


class EmailService:
    """Service for sending emails using Resend."""

    def __init__(self):
        resend.api_key = settings.RESEND_API_KEY
        self.from_email = settings.FROM_EMAIL

    def send_password_reset_email(self, to_email: str, reset_token: str, reset_url: str = None) -> bool:
        """
        Send a password reset email.

        Args:
            to_email: Recipient email address
            reset_token: The password reset token
            reset_url: Optional base URL for reset link (defaults to localhost)

        Returns:
            True if email sent successfully, False otherwise
        """
        if not settings.RESEND_API_KEY:
            print(f"[EMAIL SERVICE] No RESEND_API_KEY configured. Reset token for {to_email}: {reset_token}")
            return False

        if not reset_url:
            reset_url = "http://localhost:5173/reset-password"

        reset_link = f"{reset_url}?token={reset_token}"

        try:
            params = {
                "from": f"DontKillIt <{self.from_email}>",
                "to": [to_email],
                "subject": "Reset Your Password - DontKillIt",
                "html": f"""
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="text-align: center; padding: 20px;">
                            <h1 style="color: #4caf50;">DontKillIt</h1>
                        </div>

                        <div style="padding: 20px; background-color: #f5f5f5; border-radius: 8px;">
                            <h2 style="color: #333;">Password Reset Request</h2>

                            <p style="color: #666; font-size: 16px;">
                                We received a request to reset your password. Click the button below to create a new password:
                            </p>

                            <div style="text-align: center; margin: 30px 0;">
                                <a href="{reset_link}"
                                   style="background-color: #4caf50; color: white; padding: 14px 28px;
                                          text-decoration: none; border-radius: 8px; font-size: 16px;
                                          display: inline-block;">
                                    Reset Password
                                </a>
                            </div>

                            <p style="color: #666; font-size: 14px;">
                                This link will expire in 1 hour for security reasons.
                            </p>

                            <p style="color: #666; font-size: 14px;">
                                If you didn't request a password reset, you can safely ignore this email.
                            </p>

                            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">

                            <p style="color: #999; font-size: 12px;">
                                If the button doesn't work, copy and paste this link into your browser:
                                <br>
                                <a href="{reset_link}" style="color: #4caf50; word-break: break-all;">{reset_link}</a>
                            </p>
                        </div>

                        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
                            <p>DontKillIt - Your Plant Care Companion</p>
                        </div>
                    </div>
                """,
                "text": f"""
                    DontKillIt - Password Reset

                    We received a request to reset your password.

                    Click here to reset your password: {reset_link}

                    This link will expire in 1 hour.

                    If you didn't request this, you can safely ignore this email.
                """
            }

            response = resend.Emails.send(params)
            print(f"[EMAIL SERVICE] Password reset email sent to {to_email}. ID: {response.get('id', 'unknown')}")
            return True

        except Exception as e:
            print(f"[EMAIL SERVICE] Failed to send email to {to_email}: {str(e)}")
            return False


# Singleton instance
email_service = EmailService()
