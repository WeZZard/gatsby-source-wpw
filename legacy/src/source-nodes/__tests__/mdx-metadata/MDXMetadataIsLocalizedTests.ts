import {MDXMetadata} from '../../mdx-metadata';
import {hash as _} from '../../../utilities';
import {MDXNode} from '../../../data';
import {FileSystemNode} from 'gatsby-source-filesystem';

test('MDXMetadata.make creates metadata whose locale can fallback to empty ' +
'string when no locale is given in file path and frontmatters', () => {
  const parentNode: any | FileSystemNode = {
    internal: {
      type: 'File',
    },
    relativePath: '2019-01-01-Post-Title.md',
    birthTime: '2019-01-01',
  };

  const node: any | MDXNode = {
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
