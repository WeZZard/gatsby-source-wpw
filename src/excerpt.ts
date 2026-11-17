import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import { unified } from 'unified';

const excerptProcessor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath);

interface MdastLikeNode {
  type?: string;
  value?: string;
  children?: MdastLikeNode[];
}

function collectExcerptTextNodes(node: MdastLikeNode, out: string[]): void {
  if (!node || typeof node !== 'object') return;
  if (
    node.type === 'yaml' ||
    node.type === 'toml' ||
    node.type === 'footnoteDefinition' ||
    node.type === 'html'
  ) {
    return;
  }
  if (
    (node.type === 'text' || node.type === 'inlineCode') &&
    typeof node.value === 'string'
  ) {
    out.push(node.value);
    return;
  }
  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      collectExcerptTextNodes(child, out);
    }
  }
}

/**
 * Word-boundary string truncation matching `underscore.string`'s `prune(str, length, pruneStr)`.
 */
export function pruneUnderscoreString(
  str: string,
  length: number,
  pruneStr = '…',
): string {
  if (str.length <= length) return str;
  const tmpl = (c: string) => (c.toUpperCase() !== c.toLowerCase() ? 'A' : ' ');
  let template = str.slice(0, length + 1).replace(/.(?=\W*\w*$)/g, tmpl);
  if (/\w\w/.test(template.slice(template.length - 2))) {
    template = template.replace(/\s*\S+$/, '');
  } else {
    template = template.slice(0, template.length - 1).trimEnd();
  }
  return (template + pruneStr).length > str.length
    ? str
    : str.slice(0, template.length) + pruneStr;
}

/**
 * Extracts plain-text post excerpts from raw Markdown/MDX bodies, matching `gatsby-mdx`.
 */
export function extractExcerpt(
  body: string | undefined,
  maxLength: number,
): string {
  if (!body) return '';
  const cleaned = body
    .replace(/^---[\s\S]*?---/, '')
    .replace(/^\s*import\s+.*?from\s+['"].*?['"];?\s*$/gm, '')
    .replace(/^\s*export\s+.*?;?\s*$/gm, '');
  const tree = excerptProcessor.parse(cleaned) as MdastLikeNode;
  const nodes: string[] = [];
  collectExcerptTextNodes(tree, nodes);
  return pruneUnderscoreString(nodes.join(' '), maxLength, '…');
}
