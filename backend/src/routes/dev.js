import express from 'express';
import { prisma } from '../lib/db.js';
import { setAuthCookie } from '../lib/jwt.js';

const router = express.Router();

// Local development login: issues an admin cookie when DEV_ADMIN=true
router.post('/login', async (req, res) => {
  try {
    if (process.env.DEV_ADMIN !== 'true') {
      return res.status(403).json({ error: 'Dev admin login disabled' });
    }

    const telegramId = 'dev_admin';
    const user = await prisma.user.upsert({
      where: { telegramId },
      update: { role: 'ADMIN' },
      create: { telegramId, role: 'ADMIN', username: 'dev', firstName: 'Dev', lastName: 'Admin' },
    });

    setAuthCookie(res, { id: user.id, role: user.role });
    return res.json({ ok: true, user });
  } catch (err) {
    console.error('[DEV LOGIN] Error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;