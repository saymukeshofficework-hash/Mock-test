import categoriesData from './categories.json';

/**
 * The site's category list. The data itself lives in categories.json (so
 * the plain-Node content validator can read it too, without a TS loader) —
 * this file is just the typed export every Astro page/component imports.
 * Add, rename, or remove entries in the JSON file; nothing else needs to change.
 */
export interface Category {
  slug: string;
  name: string;
  description: string;
}

export const categories: Category[] = categoriesData;

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getCategoryByName(name: string): Category | undefined {
  return categories.find((c) => c.name.toLowerCase() === name.toLowerCase());
}
