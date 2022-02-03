const assert = require('assert');
const locales = require('i18n-locales');

const getTitle = (frontMatterTitle, documentName) => {
  assert(
    frontMatterTitle === null ||
      frontMatterTitle === undefined ||
      typeof frontMatterTitle === 'string',
  );
  assert(
    documentName === null ||
      documentName === undefined ||
      typeof documentName === 'string',
  );

  const titles = [frontMatterTitle, documentName].filter(_ => _);
  return titles.reverse().pop() || '';
};

const getCreatedTime = (frontMatterDate, documentNameDate, birthTime) => {
  assert(
    frontMatterDate === null ||
      frontMatterDate === undefined ||
      frontMatterDate instanceof Date,
  );
  assert(
    documentNameDate === null ||
      documentNameDate === undefined ||
      documentNameDate instanceof Date,
  );
  assert(
    birthTime === null || birthTime === undefined || birthTime instanceof Date,
  );

  const createdTimes = [frontMatterDate, documentNameDate, birthTime].filter(
    _ => _,
  );
  return createdTimes.reverse().pop();
};

const makeDisambiguator = (string, seed) => {
  let comp = seed === undefined ? 0x85ba : seed;

  for (let i = 0; i < string.length; i++) {
    comp ^= string.charCodeAt(i);
    comp +=
      (comp << 1) + (comp << 4) + (comp << 7) + (comp << 8) + (comp << 24);
  }

  return ('000' + comp.toString(16)).substr(-4);
};

let _isLocaleIdentifierPatternInitialized = false;
let _localeIdentifierPattern_;

const localeIdentifierPattern = () => {
  if (!_isLocaleIdentifierPatternInitialized) {
    var completedLocales = locales;
    completedLocales.push('zh-Hant')
    completedLocales.push('zh-Hans')
    _localeIdentifierPattern_ = completedLocales.join('|');
  }
  assert(typeof _localeIdentifierPattern_ === 'string');
  assert(_localeIdentifierPattern_ !== '');
  return _localeIdentifierPattern_;
};

module.exports = {
  getTitle,
  getCreatedTime,
  makeDisambiguator,
  localeIdentifierPattern,
};
