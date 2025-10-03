import { Router } from 'express';
import { prisma } from '../lib/db.js';
import { slugify, ensureUniqueSlug } from '../lib/slugify.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  const topics = await prisma.topic.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ topics });
});

router.post('/', requireAdmin, async (req, res) => {
  const { title, description, icon, slug: slugInput } = req.body || {};
  if (!title) return res.status(400).json({ error: 'Title required' });
  const base = slugInput ?? title;
  const slug = slugify(base);
  if (!slug) return res.status(400).json({ error: 'Slug required' });
  const topic = await prisma.topic.upsert({
    where: { slug },
    update: { title, description, icon },
    create: { title, slug, description, icon },
  });
  res.status(201).json({ topic });
});

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const topic = await prisma.topic.findUnique({ where: { id }, include: { lessons: true } });
  if (!topic) return res.status(404).json({ error: 'Not found' });
  res.json({ topic });
});

router.get('/slug/:slug', async (req, res) => {
  const { slug } = req.params;
  const topic = await prisma.topic.findUnique({ where: { slug }, include: { lessons: true } });
  if (!topic) return res.status(404).json({ error: 'Not found' });
  res.json({ topic });
});

router.patch('/:id', requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const data = {};
  ['title','description','icon'].forEach(k => {
    if (req.body?.[k] !== undefined) data[k] = req.body[k];
  });
  if (req.body?.slug !== undefined) {
    const base = req.body.slug || (data.title ? slugify(data.title) : undefined);
    if (!base) return res.status(400).json({ error: 'Slug required' });
    data.slug = await ensureUniqueSlug(
      (s) => prisma.topic.findUnique({ where: { slug: s } }),
      base
    );
  }
  const topic = await prisma.topic.update({ where: { id }, data });
  res.json({ topic });
});

router.delete('/:id', requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  await prisma.topic.delete({ where: { id } });
  res.status(204).end();
});

export default router;