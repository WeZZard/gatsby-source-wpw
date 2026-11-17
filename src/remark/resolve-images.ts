import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

export interface RemarkResolveImagesOptions {
  maxWidth?: number;
  allowsMultiSource?: boolean;
}

interface MdastNode {
  type?: string;
  url?: string;
  title?: string;
  meta?: string;
  lang?: string;
  data?: {
    hProperties?: Record<string, unknown>;
    [key: string]: unknown;
  };
  children?: MdastNode[];
}

interface VFileLike {
  history?: string[];
}

function collectNodes(node: MdastNode, out: MdastNode[] = []): MdastNode[] {
  out.push(node);
  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      collectNodes(child, out);
    }
  }
  return out;
}

async function resolveImageInfo(
  baseDir: string,
  relUrl: string,
  maxWidth: number,
  _allowsMultiSource: boolean,
): Promise<{
  resolvedUrl: string;
  presWidth: number;
  isMultiScale: boolean;
} | null> {
  const cleanUrl = relUrl.replace(/^\.\//, '');
  const ext = path.extname(cleanUrl);
  const stem = ext ? cleanUrl.slice(0, -ext.length) : cleanUrl;
  const searchDirs = [baseDir, path.dirname(baseDir)];

  for (const dir of searchDirs) {
    const p1x = path.resolve(dir, cleanUrl);
    const p2x = ext ? path.resolve(dir, `${stem}@2x${ext}`) : null;
    const p3x = ext ? path.resolve(dir, `${stem}@3x${ext}`) : null;

    const has1x = fs.existsSync(p1x);
    const has2x = p2x ? fs.existsSync(p2x) : false;
    const has3x = p3x ? fs.existsSync(p3x) : false;

    if (!has1x && !has2x && !has3x) continue;

    const bestPath = (has3x ? p3x : has2x ? p2x : p1x)!;
    const rel = path.relative(baseDir, bestPath).split(path.sep).join('/');
    const resolvedUrl = rel.startsWith('.') ? rel : `./${rel}`;

    let presWidth = maxWidth;
    try {
      if (has1x) {
        const meta1x = await sharp(p1x, { limitInputPixels: false }).metadata();
        if (meta1x.width) {
          presWidth = Math.min(meta1x.width, maxWidth);
        }
      } else {
        const metaBest = await sharp(bestPath, {
          limitInputPixels: false,
        }).metadata();
        if (metaBest.width) {
          presWidth = Math.min(metaBest.width, maxWidth);
        }
      }
    } catch {
      // Fall back to maxWidth for SVG or unrecognized metadata
    }

    return {
      resolvedUrl,
      presWidth,
      isMultiScale: (has1x && (has2x || has3x)) || (has2x && has3x),
    };
  }

  return null;
}

export function createRemarkResolveImages(
  options: RemarkResolveImagesOptions = {},
) {
  const maxWidth = options.maxWidth ?? 712;
  const allowsMultiSource = options.allowsMultiSource ?? true;

  return function remarkResolveImagesPlugin() {
    return async (tree: MdastNode, file: VFileLike) => {
      const filePath = file.history?.[0];
      const baseDir = filePath ? path.dirname(filePath) : null;
      const nodes = collectNodes(tree);

      for (const node of nodes) {
        if (node.type === 'code') {
          node.data = node.data || {};
          node.data.hProperties = {
            ...(node.data.hProperties || {}),
            ...(node.meta ? { 'data-meta': node.meta } : {}),
            ...(node.lang ? { 'data-lang': node.lang } : {}),
          };
        }

        if (baseDir && node.type === 'image' && typeof node.url === 'string') {
          const url = node.url.trim();
          if (
            !url ||
            url.startsWith('http://') ||
            url.startsWith('https://') ||
            url.startsWith('/') ||
            url.startsWith('#') ||
            url.startsWith('data:')
          ) {
            continue;
          }
          const info = await resolveImageInfo(
            baseDir,
            url,
            maxWidth,
            allowsMultiSource,
          );
          if (info) {
            node.url = info.resolvedUrl;
            node.data = node.data || {};
            node.data.hProperties = {
              ...(node.data.hProperties || {}),
              'data-pres-width': String(info.presWidth),
              'data-multi-scale': info.isMultiScale ? '1' : '0',
              ...(node.title ? { 'data-caption': node.title } : {}),
            };
          }
        }
      }
    };
  };
}

export const remarkResolveImages = createRemarkResolveImages();
export default remarkResolveImages;
