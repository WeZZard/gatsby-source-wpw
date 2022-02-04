import {MDXMetadata} from '../../mdx-metadata';

test('reduceTitle throws when frontMatterTitle is not of string', () => {
  expect(() => {
    MDXMetadata.reduceTitle(``, 0);
  }).toThrow();
});

test('reduceTitle does not throw when frontMatterTitle is null', () => {
  expect(() => {
    MDXMetadata.reduceTitle(``, null);
  }).not.toThrow();
});

test('reduceTitle does not throw when frontMatterTitle is undefined', () => {
  expect(() => {
    MDXMetadata.reduceTitle(``, undefined);
  }).not.toThrow();
});

test('reduceTitle throws when documentName is not of string', () => {
  expect(() => {
    MDXMetadata.reduceTitle(0, ``);
  }).toThrow();
});

test('reduceTitle throws when documentName is null', () => {
  expect(() => {
    MDXMetadata.reduceTitle(null, ``);
  }).toThrow();
});

test('reduceTitle throws when documentName is undefined', () => {
  expect(() => {
    MDXMetadata.reduceTitle(undefined, ``);
  }).toThrow();
});

test('reduceTitle returns frontMatterTitle when frontMatterTitle is given', () => {
  expect(MDXMetadata.reduceTitle(
    `documentName`,
    `frontMatterTitle`,
  )).toBe(`frontMatterTitle`);
});

test('reduceTitle returns the documentName when documentName is given and frontMatterTitle is not given', () => {
  expect(MDXMetadata.reduceTitle(`documentName`, null)).toBe(`documentName`);
});
