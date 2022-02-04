import assert from 'assert';
import locales from 'i18n-locales';

/**
 * Reduce a title from document name and the title field of frontmatter.
 * @param {string} documentName
 * @param {string | undefined} frontMatterTitle
 * @return {string}
 */
export function reduceTitle(
  documentName: string,
  frontMatterTitle?: string,
): string {
  assert(
    frontMatterTitle === undefined ||
    frontMatterTitle === null ||
    typeof frontMatterTitle == 'string',
    `frontMatterTitle is ${frontMatterTitle}`,
  );
  assert(
    documentName !== undefined &&
    documentName !== null &&
    typeof documentName == 'string',
    `documentName is ${documentName}`,
  );
  if (frontMatterTitle) {
    return frontMatterTitle;
  }
  return documentName;
}

/**
 * Reduce a created time from file birth time, the date field of frontmatter
 * and the date extracted from the docuemnt name.
 * @param {Date | undefined} birthTime
 * @param {Date | undefined} frontMatterDate
 * @param {Date | undefined} documentNameDate
 * @return {Date}
 */
export function reduceCreatedTime(
  birthTime: Date,
  frontMatterDate?: Date,
  documentNameDate?: Date,
): Date {
  assert(
    frontMatterDate === undefined ||
    frontMatterDate === null ||
    frontMatterDate instanceof Date,
    `frontMatterDate is ${frontMatterDate}`,
  );
  assert(
    documentNameDate === undefined ||
    documentNameDate === null ||
    documentNameDate instanceof Date,
    `documentNameDate is ${documentNameDate}`,
  );
  assert(
    birthTime != undefined && birthTime != null && birthTime instanceof Date,
  );
  if (frontMatterDate) {
    return frontMatterDate;
  }
  if (documentNameDate) {
    return documentNameDate;
  }
  return birthTime;
}

/**
 * Creates a disambiguator string from a given string and seed.
 * @param {string} string
 * @param {number} seed
 * @return {string}
 */
export function makeDisambiguator(string: string, seed?: number): string {
  const hasNoSeed = seed === undefined || seed === null;
  // Hash code
  let c = hasNoSeed ? 0x85ba : seed;

  for (let i = 0; i < string.length; i++) {
    c ^= string.charCodeAt(i);
    c += (c << 1) + (c << 4) + (c << 7) + (c << 8) + (c << 24);
  }

  return ('000' + c.toString(16)).substring(-4);
}

let localeIdentifierPatterns: string | null = null;

/**
 * Get regex pattern for locale identifiers.
 * @return {string}
 */
export function getLocaleIdentifierPattern(): string {
  if (localeIdentifierPatterns === null) {
    const adjustedLocales = locales;
    // i18-locales does not contain zh-Hant & zh-Hans, complete it here.
    // TODO: Support arbitrary combinations of language code and country code.
    adjustedLocales.push('zh-Hant');
    adjustedLocales.push('zh-Hans');
    localeIdentifierPatterns = adjustedLocales.join('|');
  }
  if (localeIdentifierPatterns === null) {
    return '';
  }
  assert(typeof localeIdentifierPatterns === 'string');
  assert(localeIdentifierPatterns !== '');
  return localeIdentifierPatterns;
}
