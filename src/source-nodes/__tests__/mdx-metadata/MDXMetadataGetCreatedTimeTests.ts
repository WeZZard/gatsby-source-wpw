import {MDXMetadata} from '../../mdx-metadata';

const birthTimeString = `1990-01-01`;
const frontmatterDateString = `1990-01-02`;
const documentDateString = `1990-01-03`;

test('MDXMetadata.reduceCreatedTime does not throw when frontmatterDate is ' +
'undefined', () => {
  expect(() => {
    MDXMetadata.reduceCreatedTime(
      new Date(birthTimeString),
      undefined,
      new Date(documentDateString),
    );
  }).not.toThrow();
});

test('MDXMetadata.reduceCreatedTime does not throw when documentNameDate is ' +
'undefined', () => {
  expect(() => {
    MDXMetadata.reduceCreatedTime(
      new Date(birthTimeString),
      new Date(frontmatterDateString),
      undefined,
    );
  }).not.toThrow();
});

test('MDXMetadata.reduceCreatedTime returns frontmatterDate when '+
'frontmatterDate is given', () => {
  expect(MDXMetadata.reduceCreatedTime(
    new Date(birthTimeString),
    new Date(frontmatterDateString),
    new Date(documentDateString),
  )).toEqual(new Date(frontmatterDateString));
});

test('MDXMetadata.reduceCreatedTime returns documentDate when '+
'documentDate is given and frontmatterDate is not given', () => {
  expect(MDXMetadata.reduceCreatedTime(
    new Date(birthTimeString),
    undefined,
    new Date(documentDateString),
  )).toEqual(new Date(documentDateString));
});

test('MDXMetadata.reduceCreatedTime returns birthTime when '+
'documentDate and frontmatterDate is not given', () => {
  expect(MDXMetadata.reduceCreatedTime(
    new Date(birthTimeString),
    undefined,
    undefined,
  )).toEqual(new Date(birthTimeString));
});
