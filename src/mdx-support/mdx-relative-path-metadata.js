const assert = require('assert');
const {
  localeIdentifierPattern,
  makeDisambiguator,
} = require('./mdx-shims');

const _parseMetadataForRelativePathOfPost = relativePath => {
  /*
  {
      masterName: string,
      relativePath: string,
      isIndex: bool,
      lang: string?
      isLocalized: bool
      masterCreatedTime: Date?
      masterDisambiguator: string
  }
    */
  const datePattern = `([0-9]{4})-([0-9]{2})-([0-9]{2})`;
  const timePattern = `T([0-9]{2})_([0-9]{2})_([0-9]{2})`;
  const timezoneOffsetPattern1 = `([0-9]{2})_([0-9]{2})`;
  const timezoneOffsetPattern3 = `([0-9]{2})([0-9]{2})`;
  const timezonePattern = `Z|((\\+|-)((${timezoneOffsetPattern1})|(${timezoneOffsetPattern3})))`;
  const indexDocumentPattern = `(index).mdx?`;

  const standalonePostNamePattern = `(.+).mdx?`;
  const wrappedPostNamePattern = `(.+)/${indexDocumentPattern}`;
  const localizedWrappedPostNamePattern = `(.+)/(${localeIdentifierPattern()})/${indexDocumentPattern}`;
  const pattern = new RegExp(
    `^` +
    `(${datePattern})` /* Year-Month-Day (required) */ +
    `((${timePattern})(${timezonePattern})?)?` /* Hour::Minute::Second and Time Zone Offset (optional) */ +
      `((-${localizedWrappedPostNamePattern})|(-${wrappedPostNamePattern})|(-${standalonePostNamePattern}))` +
      `$`,
  );

  const match = pattern.exec(relativePath);

  let metadata = {};

  if (match) {
    metadata.masterName = match[22] || match[26] || match[29];
    metadata.isIndex = match[24] === `index` || match[27] === `index`;
    if (match[23]) {
      metadata.lang = match[23];
      metadata.isLocalized = true;
    } else {
      metadata.isLocalized = false;
    }

    const year = match[2];
    const month = match[3];
    const day = match[4];
    const hour = match[7];
    const minute = match[8];
    const second = match[9];
    const zuluTime = match[10];
    const timezoneOffset = match[12];
    const timezoneHourOffset = match[15];
    const timezoneMinuteOffset = match[16];

    const concatenatedTimezoneHourOffset = match[18];
    const concatenatedTimezoneMinuteOffset = match[19];

    let createdTime = `${year}-${month}-${day}`;

    if (hour && minute && second) {
      createdTime += `T${hour}:${minute}:${second}`;
    }

    if (timezoneOffset && timezoneHourOffset && timezoneMinuteOffset) {
      createdTime += `${timezoneOffset}${timezoneHourOffset}:${timezoneMinuteOffset}`;
    }

    if (
      timezoneOffset &&
      concatenatedTimezoneHourOffset &&
      concatenatedTimezoneMinuteOffset
    ) {
      createdTime += `${timezoneOffset}${concatenatedTimezoneHourOffset}${concatenatedTimezoneMinuteOffset}`;
    }

    if (zuluTime === `Z`) {
      createdTime += `Z`;
    }

    metadata.masterCreatedTime = new Date(createdTime);

    const documentIdentifier = createdTime + '-' + metadata.masterName;

    const masterDisambiguator = makeDisambiguator(documentIdentifier);

    metadata.masterDisambiguator = `${masterDisambiguator}`

    metadata.relativePath = relativePath.split('/').pop();
  }

  return metadata;
};

module.exports = function(relativePath) {
  assert(typeof relativePath === 'string');

  return _parseMetadataForRelativePathOfPost(relativePath);
};
