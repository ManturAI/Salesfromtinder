import { Router } from 'express';
import { prisma } from '../lib/db.js';
import { validateTelegramInitData, parseTelegramUser } from '../lib/telegram.js';
import { setAuthCookie } from '../lib/jwt.js';

const router = Router();

router.post('/telegram', async (req, res) => {
  const { initDataRaw } = req.body || {};
  if (!initDataRaw) return res.status(400).json({ error: 'Missing initDataRaw' });
  const ok = validateTelegramInitData(initDataRaw, process.env.BOT_TOKEN);
  if (!ok) return res.status(401).json({ error: 'Invalid signature' });

  const parsed = parseTelegramUser(initDataRaw);
  if (!parsed) return res.status(400).json({ error: 'Invalid user data' });

  let user = await prisma.user.findUnique({ where: { telegramId: parsed.telegramId } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        telegramId: parsed.telegramId,
        username: parsed.username,
        firstName: parsed.firstName,
        lastName: parsed.lastName,
      },
    });
  }

  setAuthCookie(res, { id: user.id, role: user.role });
  res.json({ user });
});

export default router;