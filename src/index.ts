export type {MDXNode, Frontmatter} from './data';
export type {PostMasterNode} from './data';
export type {PostNode, Category, Tag, Locale} from './data';
export type {Source, SourceKind} from './source';
export type {ResolvablePlugin, ConfigurablePlugin} from './source';
export {source} from './source';

/**
 * Options for this plugin.
 */
export interface PluginOptions {
  sourcePath: string;
  sourceInstanceName?: string;
}
