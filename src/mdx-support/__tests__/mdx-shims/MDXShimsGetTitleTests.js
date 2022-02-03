import {reduceTitle} from '../../mdx-shims';

test('reduceTitle throws when frontMatterTitle is not of string', () => {
  expect(() => {
    reduceTitle(``, 0);
  }).toThrow();
});

test('reduceTitle does not throw when frontMatterTitle is null', () => {
  expect(() => {
    reduceTitle(``, null);
  }).not.toThrow();
});

test('reduceTitle does not throw when frontMatterTitle is undefined', () => {
  expect(() => {
    reduceTitle(``, undefined);
  }).not.toThrow();
});

test('reduceTitle throws when documentName is not of string', () => {
  expect(() => {
    reduceTitle(0, ``);
  }).toThrow();
});

test('reduceTitle throws when documentName is null', () => {
  expect(() => {
    reduceTitle(null, ``);
  }).toThrow();
});

test('reduceTitle throws when documentName is undefined', () => {
  expect(() => {
    reduceTitle(undefined, ``);
  }).toThrow();
});

test('reduceTitle returns frontMatterTitle when frontMatterTitle is given', () => {
  expect(reduceTitle(`documentName`, `frontMatterTitle`)).toBe(`frontMatterTitle`);
});

test('reduceTitle returns the documentName when documentName is given and frontMatterTitle is not given', () => {
  expect(reduceTitle(`documentName`, null)).toBe(`documentName`);
});
