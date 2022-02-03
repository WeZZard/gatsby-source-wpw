import {MDXMetadata} from '../../mdx-metadata';
import {makeDisambiguator as _} from '../../mdx-shims';

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

  const result = {
    filename: '2019-01-01-Post-Title.md',
    title: 'Post-Title',
    isIndex: false,
    isPublished: true,
    createdTime: new Date('2019-01-01'),
    disambiguator: `${_('2019-01-01-Post-Title')}`,
    lang: '',
    masterName: 'Post-Title',
    masterCreatedTime: new Date('2019-01-01'),
  };

  expect(MDXMetadata.make(node, parentNode)).toEqual(result);
});
