import {MDXMetadata} from '../../mdx-metadata';
import {hash as _} from '../../../utilities';
import {MDXNode} from 'data';
import {FileSystemNode} from 'gatsby-source-filesystem';

test(`MDXMetadata.make creates metadata whose title fallbacks to document ` +
`name`, () => {
  const parentNode: any | FileSystemNode = {
    internal: {
      type: 'File',
    },
    relativePath: '2019-01-01-Post-Title.md',
    birthTime: new Date('2019-01-01'),
  };

  const node: any | MDXNode = {
    internal: {
      type: 'Mdx',
    },
    frontmatter: {
      subtitle: 'Post Subtitle',
      isPublished: true,
      tags: ['Tag1', 'Tag2', 'Tag3'],
      category: 'Category1',
      lastModifiedTime: new Date('2019-01-02'),
    },
    rawBody: '',
  };

  const result = {
    filename: '2019-01-01-Post-Title.md',
    title: 'Post-Title',
    isPublished: true,
    createdTime: new Date('2019-01-01'),
    masterID: `${_('2019-01-01-Post-Title')}`,
    locale: '',
  };

  expect(MDXMetadata.make(node, parentNode)).toEqual(result);
});
