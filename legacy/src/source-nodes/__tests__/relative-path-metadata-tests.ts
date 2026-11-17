import {RelativePathMetadata} from '../relative-path-metadata';
import {hash as _} from '../../utilities';

test('RelativePathMetadata.make creates metadata for standalone file ' +
'relative path with valid date', () => {
  expect(RelativePathMetadata.make(`1990-01-02-post-name.md`)).toEqual({
    name: `post-name`,
    createdTime: new Date(`1990-01-02`),
    masterID: `${_(`1990-01-02-post-name`)}`,
    filename: '1990-01-02-post-name.md',
    locale: null,
  });
});

test('RelativePathMetadata.make creates metadata for standalone file ' +
'relative path with valid date-time', () => {
  expect(
    RelativePathMetadata.make(`1990-01-02T04_03_02-post-name.md`),
  ).toEqual({
    name: `post-name`,
    createdTime: new Date(`1990-01-02T04:03:02`),
    masterID: `${_(`1990-01-02T04:03:02-post-name`)}`,
    filename: '1990-01-02T04_03_02-post-name.md',
    locale: null,
  });
});

test('RelativePathMetadata.make does not create metadata for standalone file ' +
'relative path with invalid year', () => {
  expect(RelativePathMetadata.make(`19-01-02-post-name.md`)).toBeNull();
});

test('RelativePathMetadata.make does not create metadata for standalone file ' +
'relative path with invalid month', () => {
  expect(RelativePathMetadata.make(`1990-1-02-post-name.md`)).toBeNull();
});

test('RelativePathMetadata.make creates metadata for language code wrapped ' +
'file relative path with valid date', () => {
  expect(
    RelativePathMetadata.make(`1990-01-02-post-name/zh/index.md`),
  ).toEqual({
    name: `post-name`,
    createdTime: new Date(`1990-01-02`),
    masterID: `${_(`1990-01-02-post-name`)}`,
    filename: 'index.md',
    locale: `zh`,
  });
});

test('RelativePathMetadata.make creates metadata scripted language code ' +
'wrapped file relative path with valid date', () => {
  expect(
    RelativePathMetadata.make(`1990-01-02-post-name/zh-Hant/index.md`),
  ).toEqual({
    name: `post-name`,
    createdTime: new Date(`1990-01-02`),
    masterID: `${_(`1990-01-02-post-name`)}`,
    filename: 'index.md',
    locale: `zh-Hant`,
  });
});

test('RelativePathMetadata.make creates metadata for wrapped file relative ' +
'path with valid date', () => {
  expect(
    RelativePathMetadata.make(`1990-01-02-post-name/index.md`),
  ).toEqual({
    name: `post-name`,
    createdTime: new Date(`1990-01-02`),
    masterID: `${_(`1990-01-02-post-name`)}`,
    filename: 'index.md',
    locale: null,
  });
});

test('RelativePathMetadata.make creates metadata for wrapped file relative ' +
'path with valid date-time', () => {
  expect(
    RelativePathMetadata.make(`1990-01-02T04_03_02-post-name/index.md`),
  ).toEqual({
    name: `post-name`,
    createdTime: new Date(`1990-01-02T04:03:02`),
    masterID: `${_(`1990-01-02T04:03:02-post-name`)}`,
    filename: 'index.md',
    locale: null,
  });
});

test('RelativePathMetadata.make creates metadata for wrapped file relative ' +
'path with valid timezone offset of hour and minute', () => {
  expect(
    RelativePathMetadata.make(`1990-01-02T04_03_02+08_00-post-name/index.md`),
  ).toEqual({
    name: `post-name`,
    createdTime: new Date(`1990-01-02T04:03:02+08:00`),
    masterID: `${_(`1990-01-02T04:03:02+08:00-post-name`)}`,
    filename: 'index.md',
    locale: null,
  });
});

test('RelativePathMetadata.make creates metadata for wrapped file relative ' +
'path with valid timezone offset of four digits hour and minute', () => {
  expect(
    RelativePathMetadata.make(`1990-01-02T04_03_02+0800-post-name/index.md`),
  ).toEqual({
    name: `post-name`,
    createdTime: new Date(`1990-01-02T04:03:02+0800`),
    masterID: `${_(`1990-01-02T04:03:02+0800-post-name`)}`,
    filename: 'index.md',
    locale: null,
  });
});

test('RelativePathMetadata.make does not create metadata for wrapped file ' +
'relative path with invalid day', () => {
  expect(
    RelativePathMetadata.make(`1990-01-2-post-name/index.md`),
  ).toBeNull();
});

test('RelativePathMetadata.make does not create metadata for wrapped file ' +
'relative path with invalid hour', () => {
  expect(
    RelativePathMetadata.make(`1990-01-02T4_33_22-post-name/index.md`),
  ).toBeNull();
});

test('RelativePathMetadata.make does not create metadata for wrapped file ' +
'relative path with invalid minute', () => {
  expect(
    RelativePathMetadata.make(`1990-01-02T04_3_22-post-name/index.md`),
  ).toBeNull();
});

test('RelativePathMetadata.make does not create metadata for wrapped file ' +
'relative path with invalid second', () => {
  expect(
    RelativePathMetadata.make(`1990-01-02T04_03_2-post-name/index.md`),
  ).toBeNull();
});

test('RelativePathMetadata.make does not create metadata for wrapped file ' +
'relative path with invalid hour offset of hour-minute timezone', () => {
  expect(
    RelativePathMetadata.make(`1990-01-02T04_03_0+4_00-post-name/index.md`),
  ).toBeNull();
});

test('RelativePathMetadata.make does not create metadata for wrapped file ' +
'relative path with invalid minute offset of hour-minute timezone', () => {
  expect(
    RelativePathMetadata.make(`1990-01-02T04_03_0+04_0-post-name/index.md`),
  ).toBeNull();
});

test('RelativePathMetadata.make does not create metadata for wrapped file ' +
'relative path with invalid hour timezone offset', () => {
  expect(
    RelativePathMetadata.make(`1990-01-02T04_03_0+08-post-name/index.md`),
  ).toBeNull();
});

test('RelativePathMetadata.make does not create metadata for wrapped file ' +
'relative path with invalid hour timezone offset', () => {
  expect(
    RelativePathMetadata.make(`1990-01-02+4-post-name/index.md`),
  ).toBeNull();
});

test('RelativePathMetadata.make does not create metadata for wrapped file ' +
'relative path with invalid one digit timezone offset', () => {
  expect(
    RelativePathMetadata.make(`1990-01-02+4-post-name/index.md`),
  ).toBeNull();
});

test('RelativePathMetadata.make does not create metadata for wrapped file ' +
'relative path with invalid three digits timezone offset', () => {
  expect(
    RelativePathMetadata.make(`1990-01-02+444-post-name/index.md`),
  ).toBeNull();
});

test('RelativePathMetadata.make does not create metadata for wrapped file ' +
'relative path with valid date and timezone offset', () => {
  expect(
    RelativePathMetadata.make(`1990-01-02+0800-post-name/index.md`),
  ).toBeNull();
});

test('RelativePathMetadata.make does not create metadata for wrapped file ' +
'relative path with valid date and timezone offset', () => {
  expect(
    RelativePathMetadata.make(`1990-01-02+08_00-post-name/index.md`),
  ).toBeNull();
});

test('RelativePathMetadata.make does not create metadata for wrapped file ' +
'relative path with valid date and timezone offset', () => {
  expect(
    RelativePathMetadata.make(`1990-01-02+08-post-name/index.md`),
  ).toBeNull();
});
