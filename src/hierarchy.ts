import { isValidLocale } from './locales.js';
import {
  isEntryPublished,
  RelativePathMetadata,
  reduceCreatedTime,
  reduceTitle,
} from './metadata.js';
import { extractPostRelativePath } from './source.js';
import {
  type CategoryRecord,
  type TagRecord,
  TaxonomyRegistry,
} from './taxonomy.js';

export interface WpwRawFrontmatter {
  title?: string;
  subtitle?: string;
  date?: Date;
  lang?: string;
  isPublished?: boolean | string;
  category?: string;
  tags?: string[];
  keywords?: string[];
  license?: string;
  slug?: string;
  lastModifiedTime?: Date;
}

export interface WpwRawEntry<TRef = unknown> {
  id: string;
  filePath?: string;
  body?: string;
  data: WpwRawFrontmatter;
  entry: TRef;
}

export interface WpwPostRecord<TRef = unknown> {
  id: string;
  entry?: TRef;
  body?: string;
  isImaginaryMaster: boolean;
  masterId: string;
  legacyHash2019: string;
  name: string;
  title: string;
  subtitle?: string;
  createdTime: Date;
  lastModifiedTime: Date;
  isPublished: boolean;
  /** Matches `gatsby-source-wpw`'s strict `frontmatter.isPublished === true` flag when needed. */
  isExplicitlyPublished: boolean;
  isLocalized: boolean;
  locale: string | null;
  lang: string;
  blogSlug: string;
  blogFullPath: string;
  wmpSlug: string;
  canPublishOnWMP: boolean;
  category?: CategoryRecord;
  categoryName: string;
  tags: TagRecord[];
  tagNames: string[];
  keywords: string[];
  license?: string;
}

export interface PostMasterRecord<TRef = unknown> {
  name: string;
  masterId: string;
  legacyHash2019: string;
  createdTime: Date;
  canonicalPost: WpwPostRecord<TRef>;
  localizedPosts: Map<string, WpwPostRecord<TRef>>;
  allPosts: WpwPostRecord<TRef>[];
}

export interface WpwHierarchyOptions {
  defaultLang?: string;
  defaultCategory?: string;
  defaultLicense?: string;
}

export interface WpwPostHierarchy<TRef = unknown> {
  masters: PostMasterRecord<TRef>[];
  posts: WpwPostRecord<TRef>[];
  taxonomies: TaxonomyRegistry;
}

/**
 * Builds the complete `PostMaster` -> `Post` domain graph from raw collection entries,
 * clustering canonical and localized posts, synthesizing placeholder masters for localized-only
 * directories (matching `ensureMasterPost`), validating kebab-case taxonomy collisions, and
 * computing tag occurrence counts across all `Post` records.
 */
export function buildPostHierarchy<TRef = unknown>(
  rawEntries: WpwRawEntry<TRef>[],
  options: WpwHierarchyOptions = {},
): WpwPostHierarchy<TRef> {
  const defaultLang = options.defaultLang ?? 'en-US';
  const defaultCategory = options.defaultCategory ?? 'Uncategorized';
  const taxonomies = new TaxonomyRegistry();
  const mastersById = new Map<string, PostMasterRecord<TRef>>();

  for (const raw of rawEntries) {
    const relPath = extractPostRelativePath(raw.filePath || raw.id);
    const pathMeta = RelativePathMetadata.make(relPath);
    if (!pathMeta) {
      // Ignore non-post Markdown files such as `index_raw.md` or root docs.
      continue;
    }

    if (pathMeta.locale && !isValidLocale(pathMeta.locale)) {
      throw new Error(`Invalid locale: "${pathMeta.locale}".`);
    }

    let master = mastersById.get(pathMeta.masterID);
    if (!master) {
      // Temporary placeholder canonical post until seen or finalized by `ensureMasterPost`
      const placeholderCanonical: WpwPostRecord<TRef> = {
        id: `${pathMeta.name}-imaginary-master-post`,
        isImaginaryMaster: true,
        masterId: pathMeta.masterID,
        legacyHash2019: pathMeta.legacyHash2019,
        name: pathMeta.name,
        title: pathMeta.name,
        createdTime: pathMeta.createdTime,
        lastModifiedTime: pathMeta.createdTime,
        isPublished: false,
        isExplicitlyPublished: false,
        isLocalized: false,
        locale: null,
        lang: defaultLang,
        blogSlug: pathMeta.blogSlug,
        blogFullPath: pathMeta.blogSlug,
        wmpSlug: `${pathMeta.name}-${pathMeta.masterID}`,
        canPublishOnWMP: false,
        categoryName: defaultCategory,
        tags: [],
        tagNames: [],
        keywords: [],
        license: options.defaultLicense,
      };

      master = {
        name: pathMeta.name,
        masterId: pathMeta.masterID,
        legacyHash2019: pathMeta.legacyHash2019,
        createdTime: pathMeta.createdTime,
        canonicalPost: placeholderCanonical,
        localizedPosts: new Map(),
        allPosts: [],
      };
      mastersById.set(pathMeta.masterID, master);
    }

    const createdTime = reduceCreatedTime(
      pathMeta.createdTime,
      raw.data.date,
      pathMeta.createdTime,
    );
    const lastModifiedTime = raw.data.lastModifiedTime ?? createdTime;
    const isPublished = isEntryPublished(raw.data.isPublished);
    const isExplicitlyPublished =
      raw.data.isPublished === true || raw.data.isPublished === 'true';
    const locale = pathMeta.locale;
    const lang = locale || raw.data.lang || defaultLang;
    const blogSlug = raw.data.slug || pathMeta.blogSlug;
    const blogFullPath = pathMeta.isLocalized ? `/${lang}${blogSlug}` : blogSlug;

    const tagRecords: TagRecord[] = [];
    const rawTags = raw.data.tags ?? [];
    for (const rawTag of rawTags) {
      tagRecords.push(taxonomies.registerTag(rawTag, true));
    }

    let categoryRecord: CategoryRecord | undefined;
    if (raw.data.category) {
      categoryRecord = taxonomies.registerCategory(raw.data.category, true);
    }

    const postRecord: WpwPostRecord<TRef> = {
      id: raw.id,
      entry: raw.entry,
      body: raw.body,
      isImaginaryMaster: false,
      masterId: pathMeta.masterID,
      legacyHash2019: pathMeta.legacyHash2019,
      name: pathMeta.name,
      title: reduceTitle(pathMeta.name, raw.data.title),
      subtitle: raw.data.subtitle,
      createdTime,
      lastModifiedTime,
      isPublished,
      isExplicitlyPublished,
      isLocalized: pathMeta.isLocalized,
      locale,
      lang,
      blogSlug,
      blogFullPath,
      wmpSlug: pathMeta.wmpSlug,
      canPublishOnWMP: locale === 'zh-Hans',
      category: categoryRecord,
      categoryName: raw.data.category || defaultCategory,
      tags: tagRecords,
      tagNames: tagRecords.map(t => t.name),
      keywords: raw.data.keywords ?? [],
      license: raw.data.license ?? options.defaultLicense,
    };

    if (locale === null) {
      master.canonicalPost = postRecord;
    } else {
      master.localizedPosts.set(locale, postRecord);
    }
    master.allPosts.push(postRecord);
  }

  // Finalize `ensureMasterPost`: if a PostMaster only had localized variants, include its imaginary master post in `allPosts`.
  const allPosts: WpwPostRecord<TRef>[] = [];
  for (const master of mastersById.values()) {
    if (master.canonicalPost.isImaginaryMaster) {
      master.allPosts.unshift(master.canonicalPost);
    }
    for (const post of master.allPosts) {
      allPosts.push(post);
    }
  }

  const masters = Array.from(mastersById.values()).sort(
    (a, b) => b.createdTime.getTime() - a.createdTime.getTime(),
  );

  return {
    masters,
    posts: allPosts,
    taxonomies,
  };
}
