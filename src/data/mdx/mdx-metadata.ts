import {assert} from 'console';
import {FileSystemNode} from 'gatsby-source-filesystem';
import {reduceTitle, reduceCreatedTime} from './mdx-shims';
import {MDXRelativePathMetadata} from './mdx-relative-path-metadata';
import {MDXNode} from './mdx-node';
import {log} from '../../utilities';

/**
 * Metadata about an MDX document.
 */
export class MDXMetadata {
  public readonly filename: string;
  public readonly title: string;
  public readonly isIndex: boolean;
  public readonly isPublished: boolean;
  public readonly createdTime: Date;
  public readonly disambiguator: string;
  public readonly lang: string;
  public readonly masterName: string;
  public readonly masterCreatedTime: Date;

  /**
   * Constructs an MDXMetadata instance.
   * @param {string} filename
   * @param {string} title
   * @param {boolean} isIndex
   * @param {boolean} isPublished
   * @param {Date} createdTime
   * @param {string} disambiguator
   * @param {string} lang
   * @param {string} masterName
   * @param {Date} masterCreatedTime
   */
  public constructor(
    filename: string,
    title: string,
    isIndex: boolean,
    isPublished: boolean,
    createdTime: Date,
    disambiguator: string,
    lang: string,
    masterName: string,
    masterCreatedTime: Date,
  ) {
    this.filename = filename;
    this.title = title;
    this.isIndex = isIndex;
    this.isPublished = isPublished;
    this.createdTime = createdTime;
    this.lang = lang;
    this.disambiguator = disambiguator;
    this.masterName = masterName;
    this.masterCreatedTime = masterCreatedTime;
  }

  /**
   * Creates an MDXMetadata from gatsby source node args.
   * @param {MDXNode} mdxNode The `mdxNode`.
   * @param {FileSystemNode} fileNode The file node. Typically the parent of
   * `mdxNode`.
   * @return {MDXMetadata | null}
   */
  public static make(
    mdxNode: MDXNode,
    fileNode: FileSystemNode,
  ): MDXMetadata | null {
    assert(mdxNode !== null && mdxNode !== undefined, `mdxNode: ${mdxNode}`);
    assert(
      fileNode !== null && fileNode !== undefined,
      `fileNode: ${fileNode}`,
    );

    const node = mdxNode;

    if (node.internal.type !== 'Mdx') {
      log(`Cannot make MDXMetadata with node which is not of type of MDX.`);
      return null;
    }

    const birthTime = fileNode.birthTime ?
      new Date(fileNode.birthTime) :
      undefined;

    if (!birthTime) {
      log(`Cannot make MDXMetadata with node which has no birthTime.`);
      return null;
    }

    const fontmatterDate = node.frontmatter?.lastModifiedTime ?
      new Date(node.frontmatter?.lastModifiedTime) :
      undefined;

    const relativePathMetadata = MDXRelativePathMetadata.make(
      fileNode.relativePath,
    );

    if (!relativePathMetadata) {
      log(
        `Cannot make MDXMetadata due to failure of` +
        ` parsing relative path ${fileNode.relativePath}.`,
      );
      return null;
    }

    const masterName = relativePathMetadata.name;

    const disambiguator = relativePathMetadata.disambiguator;

    const masterCreatedTime = relativePathMetadata.createdTime;

    const title = reduceTitle(
      relativePathMetadata.name,
      node.frontmatter?.title,
    );

    const lang = relativePathMetadata.lang || node.frontmatter?.lang || '';

    const isIndex = relativePathMetadata.isIndex;

    const isPublished =
      node.frontmatter?.isPublished === undefined ||
      node.frontmatter?.isPublished === true;

    const createdTime = reduceCreatedTime(
      birthTime,
      fontmatterDate,
      relativePathMetadata.createdTime,
    );

    const filename = relativePathMetadata.filename;

    return new MDXMetadata(
      filename,
      title,
      isIndex,
      isPublished,
      createdTime,
      disambiguator,
      lang,
      masterName,
      masterCreatedTime,
    );
  }
}
