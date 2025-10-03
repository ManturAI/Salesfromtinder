import { Router } from 'express';
import { prisma } from '../lib/db.js';
import { slugify, ensureUniqueSlug } from '../lib/slugify.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// List subtopics, with optional filters by topicId or topicSlug
router.get('/', async (req, res) => {
  const { topicId, topicSlug } = req.query;
  const where = {};
  if (topicId) where.topicId = Number(topicId);
  if (topicSlug && !topicId) {
    const t = await prisma.topic.findUnique({ where: { slug: String(topicSlug) } });
    where.topicId = t?.id ?? null;
  }
  const subtopics = await prisma.subtopic.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
  res.json({ subtopics });
});

// Create subtopic
router.post('/', requireAdmin, async (req, res) => {
  const { title, description, icon, topicId, slug: slugInput } = req.body || {};
  if (!title) return res.status(400).json({ error: 'Title required' });
  if (!topicId) return res.status(400).json({ error: 'topicId required' });
  const base = slugInput ?? title;
  const slug = slugify(base);
  if (!slug) return res.status(400).json({ error: 'Slug required' });
  const subtopic = await prisma.subtopic.upsert({
    where: { slug },
    update: { title, description, icon, topicId: Number(topicId) },
    create: { title, slug, description, icon, topicId: Number(topicId) },
  });
  res.status(201).json({ subtopic });
});

// Get by id
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const subtopic = await prisma.subtopic.findUnique({ where: { id }, include: { lessons: true, topic: true } });
  if (!subtopic) return res.status(404).json({ error: 'Not found' });
  res.json({ subtopic });
});

// Get by slug
router.get('/slug/:slug', async (req, res) => {
  const { slug } = req.params;
  const subtopic = await prisma.subtopic.findUnique({ where: { slug }, include: { lessons: true, topic: true } });
  if (!subtopic) return res.status(404).json({ error: 'Not found' });
  res.json({ subtopic });
});

// Update
router.patch('/:id', requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const data = {};
  ['title','description','icon','topicId'].forEach(k => {
    if (req.body?.[k] !== undefined) data[k] = req.body[k];
  });
  if (data.topicId !== undefined) data.topicId = Number(data.topicId);
  if (req.body?.slug !== undefined) {
    const base = req.body.slug || (data.title ? slugify(data.title) : undefined);
    if (!base) return res.status(400).json({ error: 'Slug required' });
    data.slug = await ensureUniqueSlug(
      (s) => prisma.subtopic.findUnique({ where: { slug: s } }),
      base
    );
  }
  const subtopic = await prisma.subtopic.update({ where: { id }, data });
  res.json({ subtopic });
});

// Delete
router.delete('/:id', requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  await prisma.subtopic.delete({ where: { id } });
  res.status(204).end();
});

export default router;