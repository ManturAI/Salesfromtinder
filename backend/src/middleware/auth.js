import { getAuthFromReq } from '../lib/jwt.js';

export function requireAuth(req, res, next) {
  const auth = getAuthFromReq(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });
  req.user = auth;
  next();
}

export function requireAdmin(req, res, next) {
  const auth = getAuthFromReq(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });
  if (auth.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
  req.user = auth;
  next();
}