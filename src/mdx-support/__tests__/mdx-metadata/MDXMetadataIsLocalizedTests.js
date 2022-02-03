const MDXMetadata = require('../../mdx-metadata');
const { makeDisambiguator: _ } = require('../../mdx-shims');

test('MDXMetadata creates metadata whose isLocalized can fallback to false', () => {
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
      title: 'Post Title',
      subtitle: 'Post Subtitle',
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
    title: 'Post Title',
    isIndex: false,
    isPublished: true,
    createdTime: new Date('2019-01-01'),
    lang: '',
    isLocalized: false,
    isMasterPost: true,
    masterName: 'Post-Title',
    masterCreatedTime: new Date('2019-01-01'),
    masterDisambiguator: `${_('2019-01-01-Post-Title')}`,
    relativePath: '2019-01-01-Post-Title.md',
  };

  expect(MDXMetadata(args)).toEqual(result);
});