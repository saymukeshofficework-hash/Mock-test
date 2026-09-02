import rss from '@astrojs/rss';
import { getAllPosts } from '../lib/posts';
import { siteConfig } from '../config/site';
import { absoluteUrl } from '../lib/url';

export async function GET() {
  const posts = await getAllPosts();
  return rss({
    title: siteConfig.BLOG_NAME,
    description: siteConfig.BLOG_DESCRIPTION,
    // Pass a fully absolute URL (via our own absoluteUrl helper) rather
    // than relying on @astrojs/rss's `site` + relative-link resolution —
    // see the comment on absoluteUrl() for why that path is unreliable
    // once BLOG_DOMAIN itself has a path segment (e.g. "/Mock-test").
    site: absoluteUrl('/'),
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: absoluteUrl(`/posts/${post.slug}/`),
      categories: [post.data.category, ...post.data.tags],
    })),
    customData: '<language>en-us</language>',
  });
}
