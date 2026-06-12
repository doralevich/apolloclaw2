const TG_TOKEN =
  process.env.TELEGRAM_BOT_TOKEN ||
  "8692068004:AAEZs_bvpAIfKFK3Drfi79jVeJgQCOHyYBM";
const TG_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "8399414503";

export async function sendTelegram(text: string) {
  await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: TG_CHAT_ID, text, parse_mode: "HTML" }),
  }).catch((err) => console.error("Telegram failed:", err));
}
