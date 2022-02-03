import { MDXMetadata } from '../../mdx-metadata';
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

  const result = {
    title: 'Post Title',
    isIndex: false,
    isPublished: true,
    createdTime: new Date('2019-01-01'),
    lang: '',
    masterName: 'Post-Title',
    masterCreatedTime: new Date('2019-01-01'),
    disambiguator: `${_('2019-01-01-Post-Title')}`,
    filename: '2019-01-01-Post-Title.md',
  };

  expect(MDXMetadata.make(node, parentNode)).toEqual(result);
});
