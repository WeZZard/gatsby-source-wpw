import assert from 'assert';
import {getLocaleIdentifierPattern, makeDisambiguator} from './mdx-shims';

let recognitionPattern: RegExp | null = null;

/**
 * Metadata extracted from relative path
 */
export class MDXRelativePathMetadata {
  public readonly name: string;

  public readonly isIndex: boolean;

  public readonly createdTime: Date;

  public readonly disambiguator: string;

  public readonly filename: string;

  public readonly lang?: string;

  /**
   * Returns `true` is the relative path does not refer to a localized document.
   * @return {boolean}
   */
  public get isLocalized(): boolean {
    assert(this.lang !== undefined || typeof this.lang === 'string');
    return this.lang !== null;
  }

  /**
   * Constructs an MDXRelativePathMetadata instance
   * @param {string} name
   * @param {boolean} isIndex
   * @param {Date} createdTime
   * @param {string} disambiguator
   * @param {string} filename
   * @param {string | undefined} lang
   */
  private constructor(
    name: string,
    isIndex: boolean,
    createdTime: Date,
    disambiguator: string,
    filename: string,
    lang?: string,
  ) {
    assert(lang !== undefined || typeof lang === 'string');
    this.name = name;
    this.isIndex = isIndex;
    this.createdTime = createdTime;
    this.disambiguator = disambiguator;
    this.filename = filename;
    this.lang = lang;
  }

  /**
   * Gets relative-path recognition pattern.
   * @return {RegExp}
   */
  public static getRecognitionPattern(): RegExp {
    if (recognitionPattern) {
      return recognitionPattern;
    }

    // groupping: 2, 3, 4
    const date = `([0-9]{4})-([0-9]{2})-([0-9]{2})`;
    // groupping: 7, 8, 9
    const time = `T([0-9]{2})_([0-9]{2})_([0-9]{2})`;
    const tz1 = `([0-9]{2})_([0-9]{2})`;
    const tz3 = `([0-9]{2})([0-9]{2})`;
    const tz = `Z|((\\+|-)((${tz1})|(${tz3})))`;
    const indexDoc = `(index).mdx?`;
    const locales = getLocaleIdentifierPattern();

    const standalone = `(.+).mdx?`;
    const wrapped = `(.+)/${indexDoc}`;
    const l10nWrapped = `(.+)/(${locales})/${indexDoc}`;
    const pattern = new RegExp(
      `^` +
      /* Year-Month-Day (required) */
      `(${date})` +
      /* Hour::Minute::Second and Time Zone Offset (optional) */
      `((${time})(${tz})?)?` +
      `((-${l10nWrapped})|(-${wrapped})|(-${standalone}))` +
      `$`,
    );

    recognitionPattern = pattern;

    return pattern;
  }

  /**
   * Creates MDXRelativePathMetadata with a relative path.
   * @param {string} relativePath
   * @return {RelativePathMetadata | null}
   */
  public static make(relativePath: string): MDXRelativePathMetadata | null {
    assert(
      relativePath !== null &&
      relativePath !== undefined &&
      typeof relativePath === 'string',
    );

    const matches = this.getRecognitionPattern().exec(relativePath);

    if (!matches) {
      return null;
    }

    const name = matches[22] || matches[26] || matches[29];
    const isIndex = matches[24] === `index` || matches[27] === `index`;
    const lang = matches[23] ?? null;

    const year = matches[2];
    const month = matches[3];
    const day = matches[4];
    const hour = matches[7];
    const minute = matches[8];
    const second = matches[9];
    const zuluTime = matches[10];
    const tz = matches[12];
    const tzHour = matches[15];
    const tzMinute = matches[16];

    const concatTzHour = matches[18];
    const concatTzMinute = matches[19];

    let createdTime = `${year}-${month}-${day}`;

    if (hour && minute && second) {
      createdTime += `T${hour}:${minute}:${second}`;
    }

    if (tz && tzHour && tzMinute) {
      createdTime += `${tz}${tzHour}:${tzMinute}`;
    }

    if (tz && concatTzHour && concatTzMinute) {
      createdTime += `${tz}${concatTzHour}${concatTzMinute}`;
    }

    if (zuluTime === `Z`) {
      createdTime += `Z`;
    }

    const disambiguatorBase = createdTime + '-' + name;

    const disambiguator = `${makeDisambiguator(disambiguatorBase)}`;

    const filename = relativePath.split('/').pop()!;

    return new MDXRelativePathMetadata(
      name,
      isIndex,
      new Date(createdTime),
      disambiguator,
      filename,
      lang,
    );
  }
}
