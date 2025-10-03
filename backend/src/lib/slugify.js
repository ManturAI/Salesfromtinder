export function slugify(input) {
  const s = (input ?? '').toString().trim().toLowerCase().normalize('NFKC');
  return s
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function ensureUniqueSlug(getBySlug, base) {
  let slug = slugify(base);
  if (!slug) slug = 'item';
  let i = 1;
  while (true) {
    const exists = await getBySlug(slug);
    if (!exists) return slug;
    i += 1;
    slug = `${slug}-${i}`;
  }
}