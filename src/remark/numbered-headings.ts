interface HeadingNode {
  type?: string;
  depth?: number;
  data?: {
    hProperties?: Record<string, unknown>;
    [key: string]: unknown;
  };
  children?: unknown[];
}

interface RootNode {
  children?: HeadingNode[];
}

/**
 * Computes hierarchical section numbers (`1`, `1.1`, `2`, ...) on top-level Remark headings,
 * matching `gatsby-wpw-renderer-wmp/plugins/remark-numbered-headings` and exposing the
 * computed number via `data-heading-number` for Rehype rendering.
 */
export function remarkNumberedHeadings() {
  return (root: RootNode) => {
    const children = root.children;
    if (!Array.isArray(children)) return;

    const numbers: number[] = [];
    let prevDepth: number | undefined;
    let level = 0;

    for (const node of children) {
      if (node.type !== 'heading' || typeof node.depth !== 'number') {
        continue;
      }

      if (prevDepth === undefined) {
        numbers.push(1);
      } else if (prevDepth < node.depth) {
        level += 1;
        numbers.push(1);
      } else if (prevDepth === node.depth) {
        numbers[level] += 1;
      } else {
        while (level > 0 && prevDepth > node.depth) {
          level -= 1;
          numbers.pop();
          prevDepth -= 1;
        }
        numbers[level] += 1;
      }

      prevDepth = node.depth;
      const numberStr = numbers.join('.');
      node.data = node.data || {};
      node.data.hProperties = {
        ...(node.data.hProperties || {}),
        'data-heading-number': numberStr,
      };
    }
  };
}

export default remarkNumberedHeadings;
