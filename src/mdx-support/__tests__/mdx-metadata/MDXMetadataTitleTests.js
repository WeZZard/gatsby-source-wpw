const MDXMetadata = require('../../mdx-metadata');
const { makeDisambiguator: _ } = require('../../mdx-shims');

test('MDXMetadata creates metadata of Post whose title can fallback to its document name', () => {
  const parentNode = {
    internal: {
      type: 'File',
    },
    relativePath: '2019-01-01-Post-Title.md',
    birthTime: '2019-01-01',
  };

  const node = {
    internal: {
      type: 'Mdx',
    },
    frontmatter: {
      subtitle: 'Post Subtitle',
      isPublished: 'true',
      tags: ['Tag1', 'Tag2', 'Tag3'],
      category: 'Category1',
      lastModifiedTime: '2019-01-02',
    },
    parent: {
      id: 'parentNode',
    },
    rawBody: '',
  };

  const args = {
    node: node,
    getNode: node => {
      return node.id === 'parentNode' ? parentNode : null;
    },
  };

  const result = {
    documentType: 'Post',
    title: 'Post-Title',
    isIndex: false,
    isPublished: true,
    createdTime: new Date('2019-01-01'),
    lang: '',
    isLocalized: false,
    masterDisambiguator: `${_('2019-01-01-Post-Title')}`,
    relativePath: '2019-01-01-Post-Title.md',
  };

  expect(MDXMetadata(args)).toEqual(result);
});
