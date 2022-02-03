const MDXMetadata = require('../../mdx-metadata');
const { makeDisambiguator: _ } = require('../../mdx-shims');

test('MDXMetadata creates metadata of Post whose createdTime can fallback to time on relative path', () => {
  const parentNode = {
    internal: {
      type: 'File',
    },
    relativePath: '2019-01-01-Post-Title.md',
    birthTime: '2019-01-02',
  };

  const node = {
    internal: {
      type: 'Mdx',
    },
    frontmatter: {
      title: 'Post Title',
      subtitle: 'Post Subtitle',
      isPublished: 'true',
      tags: ['Tag1', 'Tag2', 'Tag3'],
      category: 'Category1',
      lastModifiedTime: '2019-01-03',
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
