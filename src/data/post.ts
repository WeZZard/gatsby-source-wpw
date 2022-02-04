import {Node} from 'gatsby';

export interface Tag extends Node {
  name: string;
  kebabName: string;
}

export interface Category extends Node {
  name: string;
  kebabName: string;
}

export interface Locale extends Node {
  identifier: string;
}

export interface PostNode extends Node {
  sourceInstanceName: string,
  title: string,
  subtitle: string;
  createdTime: Date;
  lastModifiedTime: Date;
  isPublished: boolean;
  license: string;
  tags: Tag[];
  category: Category;
  locale: Locale;
}
