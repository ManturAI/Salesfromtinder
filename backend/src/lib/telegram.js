import crypto from 'crypto';

export function validateTelegramInitData(initDataRaw, botToken) {
  if (!botToken) return false;
  const params = new URLSearchParams(initDataRaw);
  const hash = params.get('hash');
  if (!hash) return false;
  params.delete('hash');
  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const hmac = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
  return hmac === hash;
}

export function parseTelegramUser(initDataRaw) {
  const params = new URLSearchParams(initDataRaw);
  const userJson = params.get('user');
  if (!userJson) return null;
  try {
    const user = JSON.parse(userJson);
    return {
      telegramId: String(user.id),
      username: user.username || null,
      firstName: user.first_name || null,
      lastName: user.last_name || null,
    };
  } catch {
    return null;
  }
}