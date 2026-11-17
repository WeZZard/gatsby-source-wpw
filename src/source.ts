import fs from 'node:fs';
import path from 'node:path';

/**
 * Resolves the `MyWorks` posts base directory for an Astro project (`cwd`),
 * supporting explicit `WPW_SOURCE_URL` / `GATSBY_WPW_SOURCE_URL` env overrides,
 * a populated `./content/_posts` submodule, or a sibling `../MyWorks` checkout.
 */
export function resolveWpwPostsDir(cwd: string = process.cwd()): string {
  const envSource =
    process.env.WPW_SOURCE_URL || process.env.GATSBY_WPW_SOURCE_URL;
  if (envSource) {
    const cleaned = envSource.startsWith('file://')
      ? envSource.slice('file://'.length)
      : envSource;
    const resolved = path.resolve(cwd, cleaned);
    if (fs.existsSync(resolved)) {
      return path.relative(cwd, resolved) || '.';
    }
  }

  const submoduleDir = path.resolve(cwd, 'content/_posts');
  if (fs.existsSync(submoduleDir)) {
    const entries = fs
      .readdirSync(submoduleDir)
      .filter(entry => !entry.startsWith('.'));
    if (entries.length > 0) {
      return './content/_posts';
    }
  }

  const siblingMyWorks = path.resolve(cwd, '../MyWorks');
  if (fs.existsSync(siblingMyWorks)) {
    return '../MyWorks';
  }

  const ciMyWorks = path.resolve(cwd, '../MyWorks.wpw');
  if (fs.existsSync(ciMyWorks)) {
    return '../MyWorks.wpw';
  }

  return './content/_posts';
}

/**
 * Extracts the `MyWorks`-relative path (`YYYY-MM-DD-slug/...`) from an Astro entry's `filePath` or `id`.
 */
export function extractPostRelativePath(filePathOrId: string): string {
  const normalized = filePathOrId.split(path.sep).join('/');
  const markers = ['content/_posts/', 'MyWorks.wpw/', 'MyWorks/'];
  for (const marker of markers) {
    const idx = normalized.indexOf(marker);
    if (idx !== -1) {
      return normalized.slice(idx + marker.length);
    }
  }
  return normalized;
}

export function isPreviewEnabled(): boolean {
  if (
    process.env.WPW_PREVIEW === '1' ||
    process.env.WPW_PREVIEW === 'true' ||
    Boolean(process.env.GATSBY_IS_PREVIEW_ENABLED)
  ) {
    return true;
  }
  return process.env.NODE_ENV === 'development';
}
