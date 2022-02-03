const MDXRelativePathMetadata = require('../../mdx-relative-path-metadata');
const { makeDisambiguator: _ } = require('../../mdx-shims');

test('MDXRelativePathMetadata creates metadata for standalone Post relative path of valid date', () => {
  expect(MDXRelativePathMetadata(`1990-01-02-post-name.md`)).toEqual({
    masterName: `post-name`,
    isIndex: false,
    masterCreatedTime: new Date(`1990-01-02`),
    masterDisambiguator: `${_(`1990-01-02-post-name`)}`,
    relativePath: '1990-01-02-post-name.md',
    isLocalized: false,
  });
});

test('MDXRelativePathMetadata creates metadata for standalone Post relative path of valid date-time', () => {
  expect(
    MDXRelativePathMetadata(`1990-01-02T04_03_02-post-name.md`),
  ).toEqual({
    masterName: `post-name`,
    isIndex: false,
    masterCreatedTime: new Date(`1990-01-02T04:03:02`),
    masterDisambiguator: `${_(`1990-01-02T04:03:02-post-name`)}`,
    relativePath: '1990-01-02T04_03_02-post-name.md',
    isLocalized: false,
  });
});

test('MDXRelativePathMetadata does not create metadata for standalone Post relative path of invalid year', () => {
  expect(MDXRelativePathMetadata(`19-01-02-post-name.md`)).toEqual({});
});

test('MDXRelativePathMetadata does not create metadata for standalone Post relative path of invalid month', () => {
  expect(MDXRelativePathMetadata(`1990-1-02-post-name.md`)).toEqual({});
});

test('MDXRelativePathMetadata creates metadata for language localized wrapped Post relative path of valid date', () => {
  expect(
    MDXRelativePathMetadata(`1990-01-02-post-name/zh/index.md`),
  ).toEqual({
    masterName: `post-name`,
    isIndex: true,
    masterCreatedTime: new Date(`1990-01-02`),
    masterDisambiguator: `${_(`1990-01-02-post-name`)}`,
    relativePath: 'index.md',
    isLocalized: true,
    lang: `zh`,
  });
});

test('MDXRelativePathMetadata creates metadata for language and script localized wrapped Post relative path of valid date', () => {
  expect(
    MDXRelativePathMetadata(`1990-01-02-post-name/zh-Hant/index.md`),
  ).toEqual({
    masterName: `post-name`,
    isIndex: true,
    masterCreatedTime: new Date(`1990-01-02`),
    masterDisambiguator: `${_(`1990-01-02-post-name`)}`,
    relativePath: 'index.md',
    isLocalized: true,
    lang: `zh-Hant`,
  });
});

test('MDXRelativePathMetadata creates metadata for wrapped Post relative path of valid date', () => {
  expect(
    MDXRelativePathMetadata(`1990-01-02-post-name/index.md`),
  ).toEqual({
    masterName: `post-name`,
    isIndex: true,
    masterCreatedTime: new Date(`1990-01-02`),
    masterDisambiguator: `${_(`1990-01-02-post-name`)}`,
    relativePath: 'index.md',
    isLocalized: false,
  });
});

test('MDXRelativePathMetadata creates metadata for wrapped Post relative path of valid date-time', () => {
  expect(
    MDXRelativePathMetadata(`1990-01-02T04_03_02-post-name/index.md`),
  ).toEqual({
    masterName: `post-name`,
    isIndex: true,
    masterCreatedTime: new Date(`1990-01-02T04:03:02`),
    masterDisambiguator: `${_(`1990-01-02T04:03:02-post-name`)}`,
    relativePath: 'index.md',
    isLocalized: false,
  });
});

test('MDXRelativePathMetadata creates metadata for wrapped Post relative path of valid timezone offset of hour and minute', () => {
  expect(
    MDXRelativePathMetadata(`1990-01-02T04_03_02+08_00-post-name/index.md`),
  ).toEqual({
    masterName: `post-name`,
    isIndex: true,
    masterCreatedTime: new Date(`1990-01-02T04:03:02+08:00`),
    masterDisambiguator: `${_(`1990-01-02T04:03:02+08:00-post-name`)}`,
    relativePath: 'index.md',
    isLocalized: false,
  });
});

test('MDXRelativePathMetadata creates metadata for wrapped Post relative path of valid timezone offset of four digits hour and minute', () => {
  expect(
    MDXRelativePathMetadata(`1990-01-02T04_03_02+0800-post-name/index.md`),
  ).toEqual({
    masterName: `post-name`,
    isIndex: true,
    masterCreatedTime: new Date(`1990-01-02T04:03:02+0800`),
    masterDisambiguator: `${_(`1990-01-02T04:03:02+0800-post-name`)}`,
    relativePath: 'index.md',
    isLocalized: false,
  });
});

test('MDXRelativePathMetadata does not create metadata for wrapped Post relative path of invalid day', () => {
  expect(
    MDXRelativePathMetadata(`1990-01-2-post-name/index.md`),
  ).toEqual({});
});

test('MDXRelativePathMetadata does not create metadata for wrapped Post relative path of invalid hour', () => {
  expect(
    MDXRelativePathMetadata(`1990-01-02T4_33_22-post-name/index.md`),
  ).toEqual({});
});

test('MDXRelativePathMetadata does not create metadata for wrapped Post relative path of invalid minute', () => {
  expect(
    MDXRelativePathMetadata(`1990-01-02T04_3_22-post-name/index.md`),
  ).toEqual({});
});

test('MDXRelativePathMetadata does not create metadata for wrapped Post relative path of invalid second', () => {
  expect(
    MDXRelativePathMetadata(`1990-01-02T04_03_2-post-name/index.md`),
  ).toEqual({});
});

test('MDXRelativePathMetadata does not create metadata for wrapped Post relative path of invalid hour offset of hour-minute timezone', () => {
  expect(
    MDXRelativePathMetadata(`1990-01-02T04_03_0+4_00-post-name/index.md`),
  ).toEqual({});
});

test('MDXRelativePathMetadata does not create metadata for wrapped Post relative path of invalid minute offset of hour-minute timezone', () => {
  expect(
    MDXRelativePathMetadata(`1990-01-02T04_03_0+04_0-post-name/index.md`),
  ).toEqual({});
});

test('MDXRelativePathMetadata does not create metadata for wrapped Post relative path of invalid hour timezone offset', () => {
  expect(
    MDXRelativePathMetadata(`1990-01-02T04_03_0+08-post-name/index.md`),
  ).toEqual({});
});

test('MDXRelativePathMetadata does not create metadata for wrapped Post relative path of invalid hour timezone offset', () => {
  expect(
    MDXRelativePathMetadata(`1990-01-02+4-post-name/index.md`),
  ).toEqual({});
});

test('MDXRelativePathMetadata does not create metadata for wrapped Post relative path of invalid one digit timezone offset', () => {
  expect(
    MDXRelativePathMetadata(`1990-01-02+4-post-name/index.md`),
  ).toEqual({});
});

test('MDXRelativePathMetadata does not create metadata for wrapped Post relative path of invalid three digits timezone offset', () => {
  expect(
    MDXRelativePathMetadata(`1990-01-02+444-post-name/index.md`),
  ).toEqual({});
});

test('MDXRelativePathMetadata does not create metadata for wrapped Post relative path of valid date and timezone offset', () => {
  expect(
    MDXRelativePathMetadata(`1990-01-02+0800-post-name/index.md`),
  ).toEqual({});
});

test('MDXRelativePathMetadata does not create metadata for wrapped Post relative path of valid date and timezone offset', () => {
  expect(
    MDXRelativePathMetadata(`1990-01-02+08_00-post-name/index.md`),
  ).toEqual({});
});

test('MDXRelativePathMetadata does not create metadata for wrapped Post relative path of valid date and timezone offset', () => {
  expect(
    MDXRelativePathMetadata(`1990-01-02+08-post-name/index.md`),
  ).toEqual({});
});
