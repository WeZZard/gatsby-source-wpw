import {MDXMetadata} from '../../mdx-metadata';
import {hash as _} from '../../../utilities';
import {FileSystemNode} from 'gatsby-source-filesystem';
import {MDXNode} from 'data';

test('MDXMetadata.make creates metadata whose createdTime can fallback ' +
'to time on relative path', () => {
  const parentNode: any | FileSystemNode = {
    internal: {
      type: 'File',
    },
    relativePath: '2019-01-01-Post-Title.md',
    birthTime: '2019-01-02',
  };

  const node: any | MDXNode = {
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
    masterID: `${_('2019-01-01-Post-Title')}`,
    filename: '2019-01-01-Post-Title.md',
  };

  expect(MDXMetadata.make(node, parentNode)).toEqual(result);
});
