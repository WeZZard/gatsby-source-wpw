import {MDXMetadata} from '../../mdx-metadata';

test('reduceTitle does not throw when frontmatterTitle is undefined', () => {
  expect(() => {
    MDXMetadata.reduceTitle(``, undefined);
  }).not.toThrow();
});

test('reduceTitle returns frontmatterTitle when frontmatterTitle is ' +
'given', () => {
  expect(MDXMetadata.reduceTitle(
    `documentName`,
    `frontmatterTitle`,
  )).toBe(`frontmatterTitle`);
});

test('reduceTitle returns the documentName when documentName is given and ' +
'frontmatterTitle is not given', () => {
  expect(MDXMetadata.reduceTitle(`documentName`, undefined))
    .toBe(`documentName`);
});
