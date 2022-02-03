const { getCreatedTime } = require('../../mdx-shims');

const birthTimeString = `1990-01-01`;
const frontmatterDateString = `1990-01-02`;
const documentDateString = `1990-01-03`;

test('getCreatedTime throws when frontMatterDate is not of type Date', () => {
  expect(() => {
    getCreatedTime(
      new Date(birthTimeString),
      frontmatterDateString,
      new Date(documentDateString),
    );
  }).toThrow();
});

test('getCreatedTime does not throw when frontMatterDate is null', () => {
  expect(() => {
    getCreatedTime(
      new Date(birthTimeString),
      null,
      new Date(documentDateString),
    );
  }).not.toThrow();
});

test('getCreatedTime does not throw when frontMatterDate is undefined', () => {
  expect(() => {
    getCreatedTime(
      new Date(birthTimeString),
      undefined,
      new Date(documentDateString),
    );
  }).not.toThrow();
});

test('getCreatedTime throws when documentNameDate is not of type Date', () => {
  expect(() => {
    getCreatedTime(
      new Date(birthTimeString),
      new Date(frontmatterDateString),
      documentDateString,
    );
  }).toThrow();
});

test('getCreatedTime does not when documentNameDate is null', () => {
  expect(() => {
    getCreatedTime(
      new Date(birthTimeString),
      new Date(frontmatterDateString),
      null,
    );
  }).not.toThrow();
});

test('getCreatedTime does not when documentNameDate is undefined', () => {
  expect(() => {
    getCreatedTime(
      new Date(birthTimeString),
      new Date(frontmatterDateString),
      undefined,
    );
  }).not.toThrow();
});

test('getCreatedTime throws when birthTime is not of type Date', () => {
  expect(() => {
    getCreatedTime(
      birthTimeString,
      new Date(frontmatterDateString),
      new Date(documentDateString),
    );
  }).toThrow();
});

test('getCreatedTime throws when birthTime is null', () => {
  expect(() => {
    getCreatedTime(
      null,
      new Date(frontmatterDateString),
      new Date(documentDateString),
    );
  }).toThrow();
});

test('getCreatedTime does not throw when birthTime is undefined', () => {
  expect(() => {
    getCreatedTime(
      undefined,
      new Date(frontmatterDateString),
      new Date(documentDateString),
    );
  }).toThrow();
});

test('getCreatedTime returns frontMatterDate when frontMatterDate is given', () => {
  expect(getCreatedTime(
    new Date(birthTimeString),
    new Date(frontmatterDateString),
    new Date(documentDateString),
  )).toEqual(new Date(frontmatterDateString));
});

test('getCreatedTime returns documentNameDate when documentNameDate is given and frontMatterDate is not given', () => {
  expect(getCreatedTime(
    new Date(birthTimeString),
    null,
    new Date(documentDateString),
  )).toEqual(new Date(documentDateString));
});

test('getCreatedTime returns birthTime when birthTime is given and frontMatterDate and documentNameDate is both not given', () => {
  expect(getCreatedTime(
    new Date(birthTimeString),
    null,
    null,
  )).toEqual(
    new Date(birthTimeString),
  );
});
