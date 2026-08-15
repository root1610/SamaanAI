import os
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

logger = logging.getLogger(__name__)

class EmailService:
    @staticmethod
    def send_expiry_alert_email(
        to_email: str,
        user_name: str,
        expired_items: list[dict],
        expiring_soon_items: list[dict]
    ) -> bool:
        """
        Sends a responsive HTML email alert for expired and expiring pantry products.
        If SMTP server credentials are not configured, logs a formatted email preview safely.
        """
        subject = "🚨 Saaman Expiry Alert: Action Required for Pantry Products"
        
        # Construct HTML Body
        expired_rows = "".join([
            f"""
            <tr style="border-bottom: 1px solid #fee2e2;">
                <td style="padding: 10px; font-weight: bold; color: #dc2626;">{item['name']}</td>
                <td style="padding: 10px; color: #475569;">{item.get('brand') or 'N/A'}</td>
                <td style="padding: 10px; font-family: monospace; color: #dc2626; font-weight: bold;">{item['expiry_date']}</td>
                <td style="padding: 10px; font-weight: bold; color: #dc2626;">Expired ({abs(item['days_until_expiry'])} days ago)</td>
            </tr>
            """
            for item in expired_items
        ])

        expiring_rows = "".join([
            f"""
            <tr style="border-bottom: 1px solid #fef3c7;">
                <td style="padding: 10px; font-weight: bold; color: #d97706;">{item['name']}</td>
                <td style="padding: 10px; color: #475569;">{item.get('brand') or 'N/A'}</td>
                <td style="padding: 10px; font-family: monospace; color: #d97706; font-weight: bold;">{item['expiry_date']}</td>
                <td style="padding: 10px; font-weight: bold; color: #d97706;">Expires in {item['days_until_expiry']} days</td>
            </tr>
            """
            for item in expiring_soon_items
        ])

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0;">
                
                <div style="background-color: #2563eb; color: #ffffff; padding: 16px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
                    <h1 style="margin: 0; font-size: 20px; font-weight: bold;">📦 Saaman Pantry Expiry Alert</h1>
                </div>

                <p style="color: #334155; font-size: 14px;">Hello <strong>{user_name}</strong>,</p>
                <p style="color: #475569; font-size: 14px;">The following items in your pantry require attention:</p>

                {"<h3 style='color: #dc2626; font-size: 14px; margin-top: 20px;'>❌ Expired Products</h3><table style='width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;'>" + expired_rows + "</table>" if expired_items else ""}

                {"<h3 style='color: #d97706; font-size: 14px; margin-top: 20px;'>⚠️ Expiring Soon</h3><table style='width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;'>" + expiring_rows + "</table>" if expiring_soon_items else ""}

                <div style="text-align: center; margin-top: 30px;">
                    <a href="http://localhost:3000/inventory" style="background-color: #2563eb; color: #ffffff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 14px;">View Full Pantry Inventory</a>
                </div>

                <hr style="border: none; border-top: 1px solid #e2e8f0; margin-top: 30px;" />
                <p style="font-size: 11px; color: #94a3b8; text-align: center;">Saaman Automated Household Inventory System</p>
            </div>
        </body>
        </html>
        """

        # Check SMTP configuration
        smtp_host = getattr(settings, "SMTP_HOST", None) or os.getenv("SMTP_HOST")
        smtp_port = int(getattr(settings, "SMTP_PORT", None) or os.getenv("SMTP_PORT", 587))
        smtp_user = getattr(settings, "SMTP_USER", None) or os.getenv("SMTP_USER")
        smtp_pass = getattr(settings, "SMTP_PASSWORD", None) or os.getenv("SMTP_PASSWORD")

        if smtp_host and smtp_user and smtp_pass:
            try:
                msg = MIMEMultipart("alternative")
                msg["Subject"] = subject
                msg["From"] = f"Saaman Alerts <{smtp_user}>"
                msg["To"] = to_email
                msg.attach(MIMEText(html_content, "html"))

                with smtplib.SMTP(smtp_host, smtp_port) as server:
                    server.starttls()
                    server.login(smtp_user, smtp_pass)
                    server.sendmail(smtp_user, to_email, msg.as_string())
                
                logger.info(f"Expiry alert email sent successfully to {to_email}")
                return True
            except Exception as e:
                logger.error(f"Failed to send email via SMTP: {e}")
                return False
        else:
            logger.info(f"📌 [DEV MODE EMAIL PREVIEW] Alert for {to_email}:\nExpired ({len(expired_items)}), Expiring ({len(expiring_soon_items)})")
            return True
