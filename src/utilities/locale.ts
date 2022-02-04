import assert from 'assert';
import locales from 'i18n-locales';

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
