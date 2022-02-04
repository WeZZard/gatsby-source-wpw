import assert from 'assert';
import {getLocaleIdentifierPattern, makeDisambiguator} from '../utilities';

let recognitionPattern: RegExp | null = null;

/**
 * Metadata extracted from relative path
 */
export class RelativePathMetadata {
  public readonly name: string;

  public readonly createdTime: Date;

  public readonly disambiguator: string;

  public readonly filename: string;

  public readonly locale?: string;

  /**
   * Returns `true` if the metadata represents a post master.
   */
  public get representsPostMaster(): boolean {
    assert(this.locale !== undefined || typeof this.locale === 'string');
    return this.locale === null;
  }

  /**
   * Returns `true` is the relative path does not refer to a localized document.
   * @return {boolean}
   */
  public get isLocalized(): boolean {
    assert(this.locale !== undefined || typeof this.locale === 'string');
    return this.locale !== null;
  }

  /**
   * Constructs an RelativePathMetadata instance
   * @param {string} name
   * @param {Date} createdTime
   * @param {string} disambiguator
   * @param {string} filename
   * @param {string | undefined} locale
   */
  private constructor(
    name: string,
    createdTime: Date,
    disambiguator: string,
    filename: string,
    locale?: string,
  ) {
    assert(locale !== undefined || typeof locale === 'string');
    this.name = name;
    this.createdTime = createdTime;
    this.disambiguator = disambiguator;
    this.filename = filename;
    this.locale = locale;
  }

  /**
   * Gets relative-path recognition pattern.
   * @return {RegExp}
   */
  public static getRecognitionPattern(): RegExp {
    if (recognitionPattern) {
      return recognitionPattern;
    }

    const date = `(?<year>[0-9]{4})-(?<month>[0-9]{2})-(?<day>[0-9]{2})`;
    const time = `T(?<hr>[0-9]{2})_(?<min>[0-9]{2})_(?<sec>[0-9]{2})`;
    const tzStyle1 = `(?<tz1_hr>[0-9]{2})_(?<tz1_min>[0-9]{2})`;
    const tzStyle2 = `(?<tz2_hr>[0-9]{2})(?<tz2_min>[0-9]{2})`;
    const zuluMark = `(?<zulu_mark>Z)`;
    const tz = `(${zuluMark}|((?<tz_mark>\\+|-)((${tzStyle1})|(${tzStyle2}))))`;
    const indexDoc = `(index.mdx?)?`;
    const locales = getLocaleIdentifierPattern();
    const nonDir = `[^/]`;
    const standalone = `((?<name>${nonDir}+)\\.mdx?)?`;
    const wrapped = `(?<wrapped_name>${nonDir}+)/?${indexDoc}`;
    const l10n = `(?<l10n_name>${nonDir}+)/(?<locale>${locales})/?${indexDoc}`;
    const pattern = new RegExp(
      `^` +
      /* Year-Month-Day (required) */
      `${date}` +
      /* Hour::Minute::Second and Time Zone Offset (optional) */
      `(${time}(${tz})?)?` +
      `((-${l10n})|(-${standalone})|(-${wrapped}))` +
      `$`,
    );

    recognitionPattern = pattern;

    return pattern;
  }

  /**
   * Creates RelativePathMetadata with a relative path.
   * @param {string} relativePath
   * @return {RelativePathMetadata | null}
   */
  public static make(relativePath: string): RelativePathMetadata | null {
    assert(
      relativePath !== null &&
      relativePath !== undefined &&
      typeof relativePath === 'string',
    );

    const matches = this.getRecognitionPattern().exec(relativePath);

    if (!matches) {
      return null;
    }

    const groups = matches.groups;

    if (!groups) {
      return null;
    }

    const name = groups['name'] ||
      groups['wrapped_name'] ||
      groups['l10n_name'];
    const locale = groups['locale'] ?? null;
    const year = groups['year'];
    const month = groups['month'];
    const day = groups['day'];
    const hour = groups['hr'];
    const minute = groups['min'];
    const second = groups['sec'];
    const zuluMark = groups['zulu_mark'];
    const tzMark = groups['tz_mark'];
    const tz1Hour = groups['tz1_hr'];
    const tz1Minute = groups['tz1_min'];
    const tz2Hour = groups['tz2_hr'];
    const tz2Minute = groups['tz2_min'];

    let createdTime = `${year}-${month}-${day}`;

    if (hour && minute && second) {
      createdTime += `T${hour}:${minute}:${second}`;
    }

    if (tzMark && tz1Hour && tz1Minute) {
      createdTime += `${tzMark}${tz1Hour}:${tz1Minute}`;
    }

    if (tzMark && tz2Hour && tz2Minute) {
      createdTime += `${tzMark}${tz2Hour}${tz2Minute}`;
    }

    if (zuluMark === `Z`) {
      createdTime += `Z`;
    }

    const disambiguatorBase = createdTime + '-' + name;

    const disambiguator = `${makeDisambiguator(disambiguatorBase)}`;

    const filename = relativePath.split('/').pop()!;

    return new RelativePathMetadata(
      name,
      new Date(createdTime),
      disambiguator,
      filename,
      locale,
    );
  }
}
