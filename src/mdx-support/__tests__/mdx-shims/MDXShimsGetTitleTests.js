const { getTitle } = require('../../mdx-shims');

test('getTitle throws when frontMatterTitle is not of string', () => {
  expect(() => {
    getTitle(``, 0);
  }).toThrow();
});

test('getTitle does not throw when frontMatterTitle is null', () => {
  expect(() => {
    getTitle(``, null);
  }).not.toThrow();
});

test('getTitle does not throw when frontMatterTitle is undefined', () => {
  expect(() => {
    getTitle(``, undefined);
  }).not.toThrow();
});

test('getTitle throws when documentName is not of string', () => {
  expect(() => {
    getTitle(0, ``);
  }).toThrow();
});

test('getTitle throws when documentName is null', () => {
  expect(() => {
    getTitle(null, ``);
  }).toThrow();
});

test('getTitle throws when documentName is undefined', () => {
  expect(() => {
    getTitle(undefined, ``);
  }).toThrow();
});

test('getTitle returns frontMatterTitle when frontMatterTitle is given', () => {
  expect(getTitle(`documentName`, `frontMatterTitle`)).toBe(`frontMatterTitle`);
});

test('getTitle returns the documentName when documentName is given and frontMatterTitle is not given', () => {
  expect(getTitle(`documentName`, null)).toBe(`documentName`);
});
