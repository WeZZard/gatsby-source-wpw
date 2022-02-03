const MDXMetadata = require('../../mdx-metadata');
const { makeDisambiguator: _ } = require('../../mdx-shims');

test('MDXMetadata returns null when node.internal.type is not Mdx', () => {
  const args = {
    node: {
      internal: {
        type: 'File',
      },
    },
  };

  expect(MDXMetadata(args)).toBeNull();
});

test('MDXMetadata creates metadata of Post', () => {
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
      isPublished: 'true',
      tags: ['Tag1', 'Tag2', 'Tag3'],
      category: 'Category1',
      date: '2019-01-02',
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
    createdTime: new Date('2019-01-02T00:00:00.000Z'),
    title: 'Post Title',
    isIndex: false,
    isPublished: true,
    lang: '',
    isLocalized: false,
    isMasterPost: true,
    masterName: 'Post-Title',
    masterCreatedTime: new Date('2019-01-01T00:00:00.000Z'),
    masterDisambiguator: `${_('2019-01-01-Post-Title')}`,
    relativePath: '2019-01-01-Post-Title.md',
  };

  expect(MDXMetadata(args)).toEqual(result);
});

test('MDXMetadata creates metadata of localized Post', () => {
  const parentNode = {
    internal: {
      type: 'File',
    },
    relativePath: '2019-01-01-Post-Title/en-US/index.md',
    birthTime: '2019-01-01',
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
    isIndex: true,
    isPublished: true,
    createdTime: new Date('2019-01-01'),
    lang: 'en-US',
    isLocalized: true,
    isMasterPost: false,
    masterName: 'Post-Title',
    masterCreatedTime: new Date('2019-01-01'),
    masterDisambiguator: `${_('2019-01-01-Post-Title')}`,
    relativePath: 'index.md',
  };

  expect(MDXMetadata(args)).toEqual(result);
});
