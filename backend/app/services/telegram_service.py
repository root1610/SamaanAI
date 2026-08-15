import os
import logging
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)

class TelegramService:
    @staticmethod
    def send_message(bot_token: str, chat_id: str, text: str) -> bool:
        """Sends a Markdown-formatted Telegram message via Bot API."""
        if not bot_token or not chat_id:
            logger.warning("Telegram bot_token or chat_id missing.")
            return False

        url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
        payload = {
            "chat_id": chat_id,
            "text": text,
            "parse_mode": "Markdown",
            "disable_web_page_preview": False
        }

        try:
            with httpx.Client(timeout=5.0) as client:
                res = client.post(url, json=payload)
                if res.status_code == 200:
                    logger.info(f"Telegram alert sent successfully to Chat ID: {chat_id}")
                    return True
                else:
                    logger.error(f"Telegram API error {res.status_code}: {res.text}")
                    return False
        except Exception as e:
            logger.error(f"Telegram request failed: {e}")
            return False

    @classmethod
    def send_expiry_alert(
        cls,
        user_name: str,
        chat_id: str,
        expired_items: list[dict],
        expiring_soon_items: list[dict],
        bot_token: str | None = None
    ) -> bool:
        """Constructs and dispatches Telegram notification for expired & expiring products."""
        token = bot_token or getattr(settings, "TELEGRAM_BOT_TOKEN", None) or os.getenv("TELEGRAM_BOT_TOKEN")

        lines = [f"📦 *SAAMAN PANTRY EXPIRY ALERT*", f"Hello *{user_name}*, here is your pantry status:\n"]

        if expired_items:
            lines.append("❌ *EXPIRED ITEMS:*")
            for item in expired_items:
                brand_str = f" ({item['brand']})" if item.get('brand') else ""
                lines.append(f"• *{item['name']}*{brand_str} — Expired `{item['expiry_date']}`")
            lines.append("")

        if expiring_soon_items:
            lines.append("⚠️ *EXPIRING SOON (within 3 days):*")
            for item in expiring_soon_items:
                brand_str = f" ({item['brand']})" if item.get('brand') else ""
                days = item['days_until_expiry']
                days_str = "today!" if days == 0 else f"in {days} days"
                lines.append(f"• *{item['name']}*{brand_str} — Expires `{item['expiry_date']}` ({days_str})")
            lines.append("")

        lines.append("[Open Saaman Pantry Dashboard](http://localhost:3000/dashboard)")
        message_text = "\n".join(lines)

        if token and chat_id:
            return cls.send_message(token, chat_id, message_text)
        else:
            logger.info(f"📌 [DEV MODE TELEGRAM PREVIEW] Chat ID: {chat_id or 'NOT_SET'}\n{message_text}")
            return True
