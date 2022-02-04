import {Node} from 'gatsby';

export interface Frontmatter {
  title?: string;
  subtitle?: string;
  category?: any;
  tags?: any[];
  lang?: string;
  lastModifiedTime?: Date;
  isPublished?: boolean;
  license?: string;
}

export interface MDXNode extends Node {
  frontmatter?: Frontmatter
  rawBody: string
}
