import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const topicsData = [
    { slug: 'objections', title: 'Возражения', description: 'Выберите подтему для просмотра видео', icon: 'objections.svg' },
    { slug: 'closing', title: 'Закрытие сделки', description: 'Выберите подтему для просмотра видео', icon: 'closing.svg' },
    { slug: 'postmeet', title: 'После встречи', description: 'Выберите подтему для просмотра видео', icon: 'postmeet.svg' },
    { slug: 'needs', title: 'Выявление потребностей', description: 'Выберите подтему для просмотра видео', icon: 'needs.svg' },
  ];

  const topicIdBySlug = {};
  for (const t of topicsData) {
    const topic = await prisma.topic.upsert({
      where: { slug: t.slug },
      update: { title: t.title, description: t.description, icon: t.icon },
      create: { slug: t.slug, title: t.title, description: t.description, icon: t.icon },
    });
    topicIdBySlug[t.slug] = topic.id;
  }

  // Подтемы: строго 2 на каждую тему, в точности как на фронтенде
  const subtopicsData = [
    { slug: 'objections-basics', title: 'Основы', description: 'Базовые принципы работы с возражениями', icon: 'objections.svg', topicSlug: 'objections' },
    { slug: 'objections-qualification', title: 'Квалификация клиента', description: 'Оценка соответствия клиента продукту', icon: 'objections.svg', topicSlug: 'objections' },

    { slug: 'closing-basics', title: 'Основы', description: 'Ключевые приёмы закрытия сделки', icon: 'closing.svg', topicSlug: 'closing' },
    { slug: 'closing-qualification', title: 'Квалификация клиента', description: 'Оценка соответствия клиента продукту', icon: 'closing.svg', topicSlug: 'closing' },

    { slug: 'postmeet-basics', title: 'Основы', description: 'Основные шаги после встречи', icon: 'postmeet.svg', topicSlug: 'postmeet' },
    { slug: 'postmeet-qualification', title: 'Квалификация клиента', description: 'Оценка соответствия клиента продукту', icon: 'postmeet.svg', topicSlug: 'postmeet' },

    { slug: 'needs-basics', title: 'Основы', description: 'Базовые принципы выявления потребностей', icon: 'needs.svg', topicSlug: 'needs' },
    { slug: 'needs-qualification', title: 'Квалификация клиента', description: 'Оценка соответствия клиента продукту', icon: 'needs.svg', topicSlug: 'needs' },
  ];

  // Удаляем все лишние подтемы, которых нет на фронтенде
  const allowedSubtopicSlugs = subtopicsData.map((s) => s.slug);
  await prisma.subtopic.deleteMany({
    where: {
      slug: { notIn: allowedSubtopicSlugs },
    },
  });

  const subtopicIdBySlug = {};
  for (const s of subtopicsData) {
    const topicId = topicIdBySlug[s.topicSlug];
    const subtopic = await prisma.subtopic.upsert({
      where: { slug: s.slug },
      update: { title: s.title, description: s.description, icon: s.icon, topicId },
      create: { slug: s.slug, title: s.title, description: s.description, icon: s.icon, topicId },
    });
    subtopicIdBySlug[s.slug] = subtopic.id;
  }

  // После удаления лишних подтем удаляем все лишние темы (без конфликтов FK)
  const allowedTopicSlugs = topicsData.map((t) => t.slug);
  await prisma.topic.deleteMany({
    where: {
      slug: { notIn: allowedTopicSlugs },
    },
  });

  // Уроки: строго по одному на каждую подтему, названия 1 в 1 как на фронтенде
  const lessonsData = [
    { slug: 'objections-basics-video', title: 'Основы', description: 'Базовые принципы работы с возражениями', icon: 'objections.svg', topicSlug: 'objections', subtopicSlug: 'objections-basics', section: 'SPRINT' },
    { slug: 'objections-qualification-video', title: 'Квалификация клиента', description: 'Оценка соответствия клиента продукту', icon: 'objections.svg', topicSlug: 'objections', subtopicSlug: 'objections-qualification', section: 'SPRINT' },

    { slug: 'closing-basics-video', title: 'Основы', description: 'Ключевые приёмы закрытия сделки', icon: 'closing.svg', topicSlug: 'closing', subtopicSlug: 'closing-basics', section: 'SPRINT' },
    { slug: 'closing-qualification-video', title: 'Квалификация клиента', description: 'Оценка соответствия клиента продукту', icon: 'closing.svg', topicSlug: 'closing', subtopicSlug: 'closing-qualification', section: 'SPRINT' },

    { slug: 'postmeet-basics-video', title: 'Основы', description: 'Основные шаги после встречи', icon: 'postmeet.svg', topicSlug: 'postmeet', subtopicSlug: 'postmeet-basics', section: 'SPRINT' },
    { slug: 'postmeet-qualification-video', title: 'Квалификация клиента', description: 'Оценка соответствия клиента продукту', icon: 'postmeet.svg', topicSlug: 'postmeet', subtopicSlug: 'postmeet-qualification', section: 'SPRINT' },

    { slug: 'needs-basics-video', title: 'Основы', description: 'Базовые принципы выявления потребностей', icon: 'needs.svg', topicSlug: 'needs', subtopicSlug: 'needs-basics', section: 'SPRINT' },
    { slug: 'needs-qualification-video', title: 'Квалификация клиента', description: 'Оценка соответствия клиента продукту', icon: 'needs.svg', topicSlug: 'needs', subtopicSlug: 'needs-qualification', section: 'SPRINT' },
  ];

  // Удаляем все лишние уроки, которых нет на фронтенде
  const allowedLessonSlugs = lessonsData.map((l) => l.slug);
  await prisma.lesson.deleteMany({
    where: {
      slug: { notIn: allowedLessonSlugs },
    },
  });

  for (const l of lessonsData) {
    const topicId = topicIdBySlug[l.topicSlug] ?? null;
    const subtopicId = subtopicIdBySlug[l.subtopicSlug] ?? null;
    await prisma.lesson.upsert({
      where: { slug: l.slug },
      update: { title: l.title, description: l.description, icon: l.icon, topicId, subtopicId, section: l.section },
      create: { slug: l.slug, title: l.title, description: l.description, icon: l.icon, topicId, subtopicId, section: l.section },
    });
  }

  console.log('Seeding completed (frontend-aligned):', {
    topics: topicsData.length,
    subtopics: subtopicsData.length,
    lessons: lessonsData.length,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });