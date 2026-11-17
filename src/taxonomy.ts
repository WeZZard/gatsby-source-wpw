export interface TagRecord {
  name: string;
  kebabName: string;
  slug: string;
  counts: number;
}

export interface CategoryRecord {
  name: string;
  kebabName: string;
  slug: string;
  counts: number;
}

/**
 * Matches `lodash.kebabCase` behavior across ASCII, camelCase, acronyms, numbers, and Unicode letters.
 */
export function toKebabCase(input: string): string {
  const kebab = input
    .replace(/['\u2019]/g, '')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([a-zA-Z])([0-9])/g, '$1-$2')
    .replace(/([0-9])([a-zA-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .replace(/[^\p{L}\p{N}-]/gu, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
  return kebab || encodeURIComponent(input.toLowerCase());
}

export class TaxonomyRegistry {
  private readonly tagsByKebab = new Map<string, TagRecord>();
  private readonly categoriesByKebab = new Map<string, CategoryRecord>();

  public registerTag(rawTag: string, incrementCount = true): TagRecord {
    const tagString = String(rawTag);
    const kebabName = toKebabCase(tagString);
    const existing = this.tagsByKebab.get(kebabName);
    if (existing) {
      if (existing.name !== tagString) {
        throw new Error(
          `Tag "${existing.name}" and "${tagString}" share the same kebab name: ${kebabName}, which is not allowed.`,
        );
      }
      if (incrementCount) {
        existing.counts += 1;
      }
      return existing;
    }

    const record: TagRecord = {
      name: tagString,
      kebabName,
      slug: `/tag/${kebabName}`,
      counts: incrementCount ? 1 : 0,
    };
    this.tagsByKebab.set(kebabName, record);
    return record;
  }

  public registerCategory(
    rawCategory: string,
    incrementCount = true,
  ): CategoryRecord {
    const categoryString = String(rawCategory);
    const kebabName = toKebabCase(categoryString);
    const existing = this.categoriesByKebab.get(kebabName);
    if (existing) {
      if (existing.name !== categoryString) {
        throw new Error(
          `Category "${existing.name}" and "${categoryString}" share the same kebabName: ${kebabName}, which is not allowed.`,
        );
      }
      if (incrementCount) {
        existing.counts += 1;
      }
      return existing;
    }

    const record: CategoryRecord = {
      name: categoryString,
      kebabName,
      slug: `/category/${kebabName}`,
      counts: incrementCount ? 1 : 0,
    };
    this.categoriesByKebab.set(kebabName, record);
    return record;
  }

  public getTag(rawOrKebab: string): TagRecord | undefined {
    return this.tagsByKebab.get(toKebabCase(rawOrKebab));
  }

  public getCategory(rawOrKebab: string): CategoryRecord | undefined {
    return this.categoriesByKebab.get(toKebabCase(rawOrKebab));
  }

  public getAllTags(): TagRecord[] {
    return Array.from(this.tagsByKebab.values()).sort((a, b) =>
      a.name < b.name ? -1 : a.name > b.name ? 1 : 0,
    );
  }

  public getAllCategories(): CategoryRecord[] {
    return Array.from(this.categoriesByKebab.values()).sort((a, b) =>
      a.name < b.name ? -1 : a.name > b.name ? 1 : 0,
    );
  }
}
