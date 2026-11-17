import { hash2019, hashWpw } from './hash.js';
import { getLocaleIdentifierPattern, SUPPORTED_LOCALE_SET } from './locales.js';

let cachedRecognitionPattern: RegExp | null = null;

export interface RelativePathFields {
  name: string;
  year: string;
  month: string;
  day: string;
  createdTimeRaw: string;
  createdTime: Date;
  masterID: string;
  legacyHash2019: string;
  filename: string;
  locale: string | null;
  isIndex: boolean;
  blogSlug: string;
  wmpSlug: string;
}

/**
 * Parses `MyWorks` post directory/file paths (`YYYY-MM-DD[THH_mm_ssZ]-slug/[locale/]index.md(x)`),
 * computing both the 2022 16-bit `masterID` (`wmp.wezzard.com`) and the 2019 `legacyHash2019` (`wezzard.com`).
 */
export class RelativePathMetadata {
  public readonly name: string;
  public readonly year: string;
  public readonly month: string;
  public readonly day: string;
  public readonly createdTimeRaw: string;
  public readonly createdTime: Date;
  public readonly masterID: string;
  public readonly legacyHash2019: string;
  public readonly filename: string;
  public readonly locale: string | null;
  public readonly isIndex: boolean;
  public readonly blogSlug: string;
  public readonly wmpSlug: string;

  private constructor(fields: RelativePathFields) {
    this.name = fields.name;
    this.year = fields.year;
    this.month = fields.month;
    this.day = fields.day;
    this.createdTimeRaw = fields.createdTimeRaw;
    this.createdTime = fields.createdTime;
    this.masterID = fields.masterID;
    this.legacyHash2019 = fields.legacyHash2019;
    this.filename = fields.filename;
    this.locale = fields.locale;
    this.isIndex = fields.isIndex;
    this.blogSlug = fields.blogSlug;
    this.wmpSlug = fields.wmpSlug;
  }

  public get representsPostMaster(): boolean {
    return this.locale === null;
  }

  public get isLocalized(): boolean {
    return this.locale !== null;
  }

  public static getRecognitionPattern(): RegExp {
    if (cachedRecognitionPattern) {
      return cachedRecognitionPattern;
    }

    const date = `(?<year>[0-9]{4})-(?<month>[0-9]{2})-(?<day>[0-9]{2})`;
    const time = `T(?<hr>[0-9]{2})_(?<min>[0-9]{2})_(?<sec>[0-9]{2})`;
    const tzStyle1 = `(?<tz1_hr>[0-9]{2})_(?<tz1_min>[0-9]{2})`;
    const tzStyle2 = `(?<tz2_hr>[0-9]{2})(?<tz2_min>[0-9]{2})`;
    const zuluMark = `(?<zulu_mark>Z)`;
    const tz = `(${zuluMark}|((?<tz_mark>\\+|-)((${tzStyle1})|(${tzStyle2}))))`;
    const indexDoc = `(?<index_doc>index\\.mdx?)?`;
    const l10nIndexDoc = `(?<l10n_index_doc>index\\.mdx?)?`;
    const locales = getLocaleIdentifierPattern();
    const nonDir = `[^/]`;
    const standalone = `((?<name>${nonDir}+)\\.mdx?)`;
    const wrapped = `(?<wrapped_name>${nonDir}+)(/${indexDoc})?`;
    const l10n = `(?<l10n_name>${nonDir}+)/(?<locale>${locales})(/${l10nIndexDoc})?`;
    cachedRecognitionPattern = new RegExp(
      `^` +
        `${date}` +
        `(${time}(${tz})?)?` +
        `((-${l10n})|(-${standalone})|(-${wrapped}))` +
        `$`,
    );

    return cachedRecognitionPattern;
  }

  public static make(relativePath: string): RelativePathMetadata | null {
    if (typeof relativePath !== 'string' || !relativePath) {
      return null;
    }

    const matches = this.getRecognitionPattern().exec(relativePath);
    if (!matches || !matches.groups) {
      return null;
    }

    const groups = matches.groups;
    const name =
      groups['name'] || groups['wrapped_name'] || groups['l10n_name'];
    if (!name) {
      return null;
    }

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

    let createdTimeRaw = `${year}-${month}-${day}`;
    if (hour && minute && second) {
      createdTimeRaw += `T${hour}:${minute}:${second}`;
    }
    if (tzMark && tz1Hour && tz1Minute) {
      createdTimeRaw += `${tzMark}${tz1Hour}:${tz1Minute}`;
    }
    if (tzMark && tz2Hour && tz2Minute) {
      createdTimeRaw += `${tzMark}${tz2Hour}${tz2Minute}`;
    }
    if (zuluMark === 'Z') {
      createdTimeRaw += 'Z';
    }

    const disambiguatorBase = `${createdTimeRaw}-${name}`;
    const masterID = hashWpw(disambiguatorBase);
    const legacyHash2019 = hash2019(disambiguatorBase);
    const filename = relativePath.split('/').pop() || relativePath;
    const isIndex = /^index\.mdx?$/i.test(filename);
    const blogSlug = `/post/${year}/${month}/${name}-${legacyHash2019}`.toLowerCase();
    const wmpSlug = locale
      ? `${name}-${masterID}/${locale}`
      : `${name}-${masterID}`;

    return new RelativePathMetadata({
      name,
      year,
      month,
      day,
      createdTimeRaw,
      createdTime: new Date(createdTimeRaw),
      masterID,
      legacyHash2019,
      filename,
      locale,
      isIndex,
      blogSlug,
      wmpSlug,
    });
  }
}

export interface ParsedPostPath {
  name: string;
  relativePath: string;
  isIndex: boolean;
  lang?: string;
  isLocalized: boolean;
  createdTime?: Date;
  createdTimeRaw?: string;
  year?: string;
  month?: string;
  day?: string;
  legacyHash2019?: string;
  wpwMasterId?: string;
  slug: string;
  wmpSlug: string;
  isRecognizedPost: boolean;
}

export function parsePostRelativePath(relativePath: string): ParsedPostPath {
  const meta = RelativePathMetadata.make(relativePath);
  if (!meta) {
    const baseName =
      relativePath.replace(/\.mdx?$/, '').split('/').pop() || 'post';
    return {
      name: baseName,
      relativePath: relativePath.split('/').pop() || relativePath,
      isIndex: false,
      isLocalized: false,
      slug: `/post/${baseName.toLowerCase()}`,
      wmpSlug: baseName,
      isRecognizedPost: false,
    };
  }

  return {
    name: meta.name,
    relativePath: meta.filename,
    isIndex: meta.isIndex,
    lang: meta.locale ?? undefined,
    isLocalized: meta.isLocalized,
    createdTime: meta.createdTime,
    createdTimeRaw: meta.createdTimeRaw,
    year: meta.year,
    month: meta.month,
    day: meta.day,
    legacyHash2019: meta.legacyHash2019,
    wpwMasterId: meta.masterID,
    slug: meta.blogSlug,
    wmpSlug: meta.wmpSlug,
    isRecognizedPost: true,
  };
}

export interface ParsedPagePath {
  name: string;
  relativePath: string;
  isIndex: boolean;
  lang?: string;
  isLocalized: boolean;
  slug: string;
}

export function parsePageRelativePath(relativePath: string): ParsedPagePath {
  const parts = relativePath.split('/');
  const fileName = parts[parts.length - 1] || '';
  const isIndex = /^index\.mdx?$/i.test(fileName);

  let lang: string | undefined;
  let isLocalized = false;
  let name: string;

  if (parts.length >= 2 && SUPPORTED_LOCALE_SET.has(parts[parts.length - 2])) {
    lang = parts[parts.length - 2];
    isLocalized = true;
    name = isIndex
      ? parts[parts.length - 3] || 'index'
      : fileName.replace(/\.mdx?$/i, '');
  } else if (isIndex && parts.length >= 2) {
    name = parts[parts.length - 2];
  } else {
    name = fileName.replace(/\.mdx?$/i, '');
  }

  return {
    name,
    relativePath: fileName,
    isIndex,
    lang,
    isLocalized,
    slug: `/${name.toLowerCase()}`,
  };
}

export function isEntryPublished(value: boolean | string | undefined): boolean {
  if (value === undefined) return true;
  if (typeof value === 'boolean') return value;
  return value === 'true';
}

export function reduceTitle(
  documentName: string,
  frontmatterTitle?: string,
): string {
  return frontmatterTitle || documentName;
}

export function reduceCreatedTime(
  fallbackTime: Date,
  frontmatterDate?: Date,
  documentNameDate?: Date,
): Date {
  if (frontmatterDate) return frontmatterDate;
  if (documentNameDate) return documentNameDate;
  return fallbackTime;
}
