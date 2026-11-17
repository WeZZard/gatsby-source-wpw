interface MdastNode {
  type: string;
  url?: string;
  value?: string;
  children?: MdastNode[];
  data?: {
    hName?: string;
    hProperties?: Record<string, unknown>;
    [key: string]: unknown;
  };
}

function countFootnoteDefinitions(node: MdastNode): number {
  let count = node.type === 'footnoteDefinition' ? 1 : 0;
  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      count += countFootnoteDefinitions(child);
    }
  }
  return count;
}

function isQualifyingLink(node: MdastNode): boolean {
  const url = node.url || '';
  if (!url || url.startsWith('#') || url.startsWith('/')) {
    return false;
  }
  const children = node.children || [];
  if (children.length === 1 && children[0].type === 'image') {
    return false;
  }
  if (
    children.length === 1 &&
    children[0].type === 'text' &&
    children[0].value === url
  ) {
    return false;
  }
  return true;
}

function transformChildren(
  parent: MdastNode,
  urlToNumber: Map<string, number>,
  footnotes: Array<{ number: number; url: string }>,
  getNextNumber: () => number,
): void {
  if (!Array.isArray(parent.children)) return;

  for (let i = 0; i < parent.children.length; i++) {
    const child = parent.children[i];
    if (child.type === 'link' && isQualifyingLink(child)) {
      const url = child.url!;
      let fnNumber = urlToNumber.get(url);
      if (fnNumber === undefined) {
        fnNumber = getNextNumber();
        urlToNumber.set(url, fnNumber);
        footnotes.push({ number: fnNumber, url });
      }

      const supNode: MdastNode = {
        type: 'wmpFootnoteSup',
        data: { hName: 'sup' },
        children: [{ type: 'text', value: `[${fnNumber}]` }],
      };

      const linkChildren = child.children || [];
      parent.children.splice(i, 1, ...linkChildren, supNode);
      i += linkChildren.length;
      continue;
    }

    transformChildren(child, urlToNumber, footnotes, getNextNumber);
  }
}

/**
 * Converts external inline links into superscript references (`<sup>[n]</sup>`) and appends
 * a `.footnotes` ordered list at the bottom of the document for WeChat Official Account paste compatibility.
 */
export function remarkLinksToFootnotes() {
  return (root: MdastNode) => {
    const footnoteOffset = countFootnoteDefinitions(root);
    let counter = footnoteOffset;
    const urlToNumber = new Map<string, number>();
    const footnotes: Array<{ number: number; url: string }> = [];

    transformChildren(root, urlToNumber, footnotes, () => {
      counter += 1;
      return counter;
    });

    if (footnotes.length > 0) {
      root.children = root.children || [];
      root.children.push({
        type: 'wmpFootnotesBlock',
        data: {
          hName: 'div',
          hProperties: { className: ['footnotes'], 'data-wmp-link-footnotes': '1' },
        },
        children: [
          {
            type: 'thematicBreak',
          },
          {
            type: 'list',
            data: { hName: 'ol' },
            children: footnotes.map(fn => ({
              type: 'listItem',
              data: {
                hName: 'li',
                hProperties: { id: `fn-${fn.number}` },
              },
              children: [
                {
                  type: 'paragraph',
                  children: [{ type: 'text', value: fn.url }],
                },
              ],
            })),
          },
        ],
      });
    }
  };
}

export default remarkLinksToFootnotes;
