import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

export function estimateReadingTime(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/**
 * All non-draft posts, newest first, with readingTime auto-filled from the
 * body when an article doesn't set it explicitly. This is the single place
 * that happens, so every page (home, category, article) sees a consistent
 * value without recomputing it.
 */
export async function getAllPosts(): Promise<Post[]> {
  const posts = await getCollection('posts', ({ data }) => import.meta.env.DEV || !data.draft);
  for (const post of posts) {
    if (!post.data.readingTime) {
      post.data.readingTime = estimateReadingTime(post.body);
    }
  }
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/**
 * Related posts by shared category (weighted higher) and shared tags,
 * newest first, excluding the current post. Returns [] when nothing
 * meaningfully relates — callers must hide the section in that case.
 */
export async function getRelatedPosts(current: Post, limit = 3): Promise<Post[]> {
  const all = await getAllPosts();
  const scored = all
    .filter((p) => p.slug !== current.slug)
    .map((p) => {
      let score = 0;
      if (p.data.category === current.data.category) score += 2;
      const sharedTags = p.data.tags.filter((t) => current.data.tags.includes(t));
      score += sharedTags.length;
      return { post: p, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || b.post.data.date.valueOf() - a.post.data.date.valueOf());

  return scored.slice(0, limit).map((entry) => entry.post);
}

export async function getAdjacentPosts(current: Post): Promise<{ prev: Post | null; next: Post | null }> {
  const all = await getAllPosts();
  const index = all.findIndex((p) => p.slug === current.slug);
  if (index === -1) return { prev: null, next: null };
  return {
    prev: index < all.length - 1 ? all[index + 1] : null, // older
    next: index > 0 ? all[index - 1] : null, // newer
  };
}

export async function getPostsByCategory(categoryName: string): Promise<Post[]> {
  const all = await getAllPosts();
  return all.filter((p) => p.data.category.toLowerCase() === categoryName.toLowerCase());
}
