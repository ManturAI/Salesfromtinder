import { Router } from 'express';
import { prisma } from '../lib/db.js';
import { slugify, ensureUniqueSlug } from '../lib/slugify.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  const { topicId, topicSlug, subtopicId, subtopicSlug, section } = req.query;
  const where = {};
  if (topicId) where.topicId = Number(topicId);
  if (topicSlug && !topicId) {
    const t = await prisma.topic.findUnique({ where: { slug: String(topicSlug) } });
    where.topicId = t?.id ?? null;
  }
  if (subtopicId) where.subtopicId = Number(subtopicId);
  if (subtopicSlug && !subtopicId) {
    const s = await prisma.subtopic.findUnique({ where: { slug: String(subtopicSlug) } });
    where.subtopicId = s?.id ?? null;
  }
  if (section) {
    const val = String(section).toUpperCase();
    if (['SPRINT','ARCHIVE'].includes(val)) where.section = val;
  }
  const lessons = await prisma.lesson.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
  res.json({ lessons });
});

router.post('/', requireAdmin, async (req, res) => {
  const { title, description, icon, topicId, subtopicId, section, slug: slugInput } = req.body || {};
  if (!title) return res.status(400).json({ error: 'Title required' });
  const base = slugInput ?? title;
  const slug = slugify(base);
  if (!slug) return res.status(400).json({ error: 'Slug required' });
  const lesson = await prisma.lesson.upsert({
    where: { slug },
    update: {
      title,
      description,
      icon,
      topicId: topicId ? Number(topicId) : null,
      subtopicId: subtopicId ? Number(subtopicId) : null,
      section: section ? String(section).toUpperCase() : null,
    },
    create: {
      title,
      slug,
      description,
      icon,
      topicId: topicId ? Number(topicId) : null,
      subtopicId: subtopicId ? Number(subtopicId) : null,
      section: section ? String(section).toUpperCase() : null,
    },
  });
  res.status(201).json({ lesson });
});

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const lesson = await prisma.lesson.findUnique({ where: { id } });
  if (!lesson) return res.status(404).json({ error: 'Not found' });
  res.json({ lesson });
});

router.get('/slug/:slug', async (req, res) => {
  const { slug } = req.params;
  const lesson = await prisma.lesson.findUnique({ where: { slug } });
  if (!lesson) return res.status(404).json({ error: 'Not found' });
  res.json({ lesson });
});

router.patch('/:id', requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const data = {};
  ['title','description','icon','topicId','subtopicId','section'].forEach(k => {
    if (req.body?.[k] !== undefined) data[k] = req.body[k];
  });
  if (data.topicId !== undefined) data.topicId = data.topicId ? Number(data.topicId) : null;
  if (data.subtopicId !== undefined) data.subtopicId = data.subtopicId ? Number(data.subtopicId) : null;
  if (data.section !== undefined) data.section = data.section ? String(data.section).toUpperCase() : null;
  if (req.body?.slug !== undefined) {
    const base = req.body.slug || (data.title ? slugify(data.title) : undefined);
    if (!base) return res.status(400).json({ error: 'Slug required' });
    data.slug = await ensureUniqueSlug(
      (s) => prisma.lesson.findUnique({ where: { slug: s } }),
      base
    );
  }
  const lesson = await prisma.lesson.update({ where: { id }, data });
  res.json({ lesson });
});

router.delete('/:id', requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  await prisma.lesson.delete({ where: { id } });
  res.status(204).end();
});

export default router;