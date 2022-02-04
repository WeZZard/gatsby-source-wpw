import {Node} from 'gatsby';

export interface Frontmatter {
  title?: string;
  subtitle?: string;
  category?: any;
  tags?: any[];
  lang?: string;
  /**
   * Created time
   */
  date?: Date;
  lastModifiedTime?: Date;
  isPublished?: any;
  license?: string;
}

export interface MDXNode extends Node {
  frontmatter?: Frontmatter
  rawBody: string
}
