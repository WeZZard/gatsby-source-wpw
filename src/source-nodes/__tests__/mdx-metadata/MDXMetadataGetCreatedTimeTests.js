import {MDXMetadata} from '../../mdx-metadata';

const birthTimeString = `1990-01-01`;
const frontmatterDateString = `1990-01-02`;
const documentDateString = `1990-01-03`;

test('reduceCreatedTime throws when frontMatterDate is not of type Date', () => {
  expect(() => {
    MDXMetadata.reduceCreatedTime(
      new Date(birthTimeString),
      frontmatterDateString,
      new Date(documentDateString),
    );
  }).toThrow();
});

test('reduceCreatedTime does not throw when frontMatterDate is null', () => {
  expect(() => {
    MDXMetadata.reduceCreatedTime(
      new Date(birthTimeString),
      null,
      new Date(documentDateString),
    );
  }).not.toThrow();
});

test('reduceCreatedTime does not throw when frontMatterDate is undefined', () => {
  expect(() => {
    MDXMetadata.reduceCreatedTime(
      new Date(birthTimeString),
      undefined,
      new Date(documentDateString),
    );
  }).not.toThrow();
});

test('reduceCreatedTime throws when documentNameDate is not of type Date', () => {
  expect(() => {
    MDXMetadata.reduceCreatedTime(
      new Date(birthTimeString),
      new Date(frontmatterDateString),
      documentDateString,
    );
  }).toThrow();
});

test('reduceCreatedTime does not when documentNameDate is null', () => {
  expect(() => {
    MDXMetadata.reduceCreatedTime(
      new Date(birthTimeString),
      new Date(frontmatterDateString),
      null,
    );
  }).not.toThrow();
});

test('reduceCreatedTime does not when documentNameDate is undefined', () => {
  expect(() => {
    MDXMetadata.reduceCreatedTime(
      new Date(birthTimeString),
      new Date(frontmatterDateString),
      undefined,
    );
  }).not.toThrow();
});

test('reduceCreatedTime throws when birthTime is not of type Date', () => {
  expect(() => {
    MDXMetadata.reduceCreatedTime(
      birthTimeString,
      new Date(frontmatterDateString),
      new Date(documentDateString),
    );
  }).toThrow();
});

test('reduceCreatedTime throws when birthTime is null', () => {
  expect(() => {
    MDXMetadata.reduceCreatedTime(
      null,
      new Date(frontmatterDateString),
      new Date(documentDateString),
    );
  }).toThrow();
});

test('reduceCreatedTime does not throw when birthTime is undefined', () => {
  expect(() => {
    MDXMetadata.reduceCreatedTime(
      undefined,
      new Date(frontmatterDateString),
      new Date(documentDateString),
    );
  }).toThrow();
});

test('reduceCreatedTime returns frontMatterDate when frontMatterDate is given', () => {
  expect(MDXMetadata.reduceCreatedTime(
    new Date(birthTimeString),
    new Date(frontmatterDateString),
    new Date(documentDateString),
  )).toEqual(new Date(frontmatterDateString));
});

test('reduceCreatedTime returns documentNameDate when documentNameDate is given and frontMatterDate is not given', () => {
  expect(MDXMetadata.reduceCreatedTime(
    new Date(birthTimeString),
    null,
    new Date(documentDateString),
  )).toEqual(new Date(documentDateString));
});

test('reduceCreatedTime returns birthTime when birthTime is given and frontMatterDate and documentNameDate is both not given', () => {
  expect(MDXMetadata.reduceCreatedTime(
    new Date(birthTimeString),
    null,
    null,
  )).toEqual(
    new Date(birthTimeString),
  );
});
