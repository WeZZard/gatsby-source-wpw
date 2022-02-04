import {MDXMetadata} from '../../mdx-metadata';
import {hash as _} from '../../../utilities';

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
      isPublished: true,
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
    isPublished: true,
    createdTime: new Date('2019-01-01'),
    locale: '',
    nameByPath: 'Post-Title',
    createdTimeByPath: new Date('2019-01-01'),
    masterID: `${_('2019-01-01-Post-Title')}`,
    filename: '2019-01-01-Post-Title.md',
  };

  expect(MDXMetadata.make(node, parentNode)).toEqual(result);
});
