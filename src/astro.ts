import { glob, type Loader } from 'astro/loaders';
import { z } from 'astro/zod';
import { resolveWpwPostsDir } from './source.js';

export const wpwCommonSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  date: z.coerce.date().optional(),
  lang: z.string().optional(),
  isPublished: z.union([z.boolean(), z.string()]).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
  license: z.string().optional(),
  slug: z.string().optional(),
  lastModifiedTime: z.coerce.date().optional(),
});

export type WpwCommonFrontmatter = z.infer<typeof wpwCommonSchema>;

export interface WpwPostsLoaderOptions {
  base?: string;
  cwd?: string;
  pattern?: string | string[];
}

export const DEFAULT_WPW_POST_PATTERNS = [
  '**/*.{md,mdx}',
  '!**/README.md',
  '!**/CLAUDE.md',
  '!**/AGENTS.md',
  '!profile/**',
  '!.pi/**',
  '!.cursor/**',
];

/**
 * Astro 5 Content Layer loader for `MyWorks` posts, preserving full `.md` and `.mdx`
 * compilation via `glob()` while using path-preserving entry IDs.
 */
export function createWpwPostsLoader(
  options: WpwPostsLoaderOptions = {},
): Loader {
  const base = options.base ?? resolveWpwPostsDir(options.cwd);
  const pattern = options.pattern ?? DEFAULT_WPW_POST_PATTERNS;

  return glob({
    pattern,
    base,
    generateId: ({ entry }) => entry,
  });
}

export interface WpwPagesLoaderOptions {
  base?: string;
  pattern?: string | string[];
}

/**
 * Astro 5 Content Layer loader for standalone site pages (such as `./content/profile`).
 */
export function createWpwPagesLoader(
  options: WpwPagesLoaderOptions = {},
): Loader {
  const base = options.base ?? './content';
  const pattern = options.pattern ?? ['**/*.{md,mdx}', '!_posts/**'];

  return glob({
    pattern,
    base,
    generateId: ({ entry }) => entry,
  });
}
