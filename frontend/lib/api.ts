export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

async function handleJson(res: Response) {
  const text = await res.text();
  try { return text ? JSON.parse(text) : null; } catch { return text; }
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    const body = await handleJson(res);
    throw new Error(typeof body === 'string' ? body : body?.error || `HTTP ${res.status}`);
  }
  return handleJson(res);
}

export async function fetchMe() {
  try { return await apiFetch('/me'); } catch { return null; }
}

export async function ensureAuthDev() {
  const me = await fetchMe();
  if (me) return me;
  await apiFetch('/dev/login', { method: 'POST' });
  return fetchMe();
}

// Topics
export async function getTopics() { const d = await apiFetch('/topics'); return d?.topics ?? []; }
export async function getTopicBySlug(slug: string) { const d = await apiFetch(`/topics/slug/${slug}`); return d?.topic ?? null; }
export async function createTopic(data: { title: string; description?: string; icon?: string; }) {
  const d = await apiFetch('/topics', { method: 'POST', body: JSON.stringify(data) });
  return d?.topic;
}
export async function updateTopic(id: number, data: { title?: string; description?: string; icon?: string; }) {
  const d = await apiFetch(`/topics/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  return d?.topic;
}
export async function deleteTopic(id: number) { return apiFetch(`/topics/${id}`, { method: 'DELETE' }); }

// Lessons
export async function getLessons(params?: { topicId?: number; topicSlug?: string; subtopicId?: number; subtopicSlug?: string; section?: 'SPRINT' | 'ARCHIVE' }) {
  const qp = new URLSearchParams();
  if (params?.topicId) qp.set('topicId', String(params.topicId));
  if (params?.topicSlug) qp.set('topicSlug', params.topicSlug);
  if (params?.subtopicId) qp.set('subtopicId', String(params.subtopicId));
  if (params?.subtopicSlug) qp.set('subtopicSlug', params.subtopicSlug);
  if (params?.section) qp.set('section', params.section);
  const d = await apiFetch(`/lessons${qp.toString() ? `?${qp.toString()}` : ''}`);
  return d?.lessons ?? [];
}
export async function createLesson(data: { title: string; description?: string; icon?: string; topicId?: number | null; }) {
  const d = await apiFetch('/lessons', { method: 'POST', body: JSON.stringify(data) });
  return d?.lesson;
}
export async function updateLesson(id: number, data: { title?: string; description?: string; icon?: string; topicId?: number | null; }) {
  const d = await apiFetch(`/lessons/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  return d?.lesson;
}
export async function deleteLesson(id: number) { return apiFetch(`/lessons/${id}`, { method: 'DELETE' }); }
export async function getLessonBySlug(slug: string) { const d = await apiFetch(`/lessons/slug/${slug}`); return d?.lesson ?? null; }

// Subtopics
export async function getSubtopics(params?: { topicId?: number; topicSlug?: string }) {
  const qp = new URLSearchParams();
  if (params?.topicId) qp.set('topicId', String(params.topicId));
  if (params?.topicSlug) qp.set('topicSlug', params.topicSlug);
  const d = await apiFetch(`/subtopics${qp.toString() ? `?${qp.toString()}` : ''}`);
  return d?.subtopics ?? [];
}