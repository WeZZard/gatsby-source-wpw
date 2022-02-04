import assert from 'assert';
import {FileSystemNode} from 'gatsby-source-filesystem';
import {RelativePathMetadata} from './relative-path-metadata';
import {MDXNode} from '../data';
import {log} from '../utilities';

/**
 * Metadata about an MDX document.
 */
export class MDXMetadata {
  public readonly filename: string;
  public readonly title: string;
  public readonly isPublished: boolean;
  public readonly createdTime: Date;
  public readonly masterID: string;
  public readonly locale: string;
  public readonly nameByPath: string;
  public readonly createdTimeByPath: Date;

  /**
   * Constructs an MDXMetadata instance.
   * @param {string} filename
   * @param {string} title
   * @param {boolean} isPublished
   * @param {Date} createdTime
   * @param {string} masterID Identifier for post master.
   * @param {string} locale
   * @param {string} nameByPath
   * @param {Date} createdTimeByPath
   */
  public constructor(
    filename: string,
    title: string,
    isPublished: boolean,
    createdTime: Date,
    masterID: string,
    locale: string,
    nameByPath: string,
    createdTimeByPath: Date,
  ) {
    this.filename = filename;
    this.title = title;
    this.isPublished = isPublished;
    this.createdTime = createdTime;
    this.locale = locale;
    this.masterID = masterID;
    this.nameByPath = nameByPath;
    this.createdTimeByPath = createdTimeByPath;
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

    const fontmatterDate = node.frontmatter?.date ?
      new Date(node.frontmatter?.date) :
      undefined;

    const relativePathMetadata = RelativePathMetadata.make(
      fileNode.relativePath,
    );

    if (!relativePathMetadata) {
      log(
        `Cannot make MDXMetadata due to failure of` +
        ` parsing relative path ${fileNode.relativePath}.`,
      );
      return null;
    }

    const nameByPath = relativePathMetadata.name;

    const masterID = relativePathMetadata.masterID;

    const createdTimeByPath = relativePathMetadata.createdTime;

    const title = this.reduceTitle(
      relativePathMetadata.name,
      node.frontmatter?.title,
    );

    const lang = relativePathMetadata.locale || node.frontmatter?.lang || '';

    const isPublished =
      node.frontmatter?.isPublished === undefined ||
      node.frontmatter?.isPublished === true;

    const createdTime = this.reduceCreatedTime(
      birthTime,
      fontmatterDate,
      relativePathMetadata.createdTime,
    );

    const filename = relativePathMetadata.filename;

    return new MDXMetadata(
      filename,
      title,
      isPublished,
      createdTime,
      masterID,
      lang,
      nameByPath,
      createdTimeByPath,
    );
  }

  /**
   * Reduce a title from document name and the title field of frontmatter.
   * @param {string} documentName
   * @param {string | undefined} frontMatterTitle
   * @return {string}
   */
  public static reduceTitle(
    documentName: string,
    frontMatterTitle?: string,
  ): string {
    assert(
      frontMatterTitle === undefined ||
      frontMatterTitle === null ||
      typeof frontMatterTitle === 'string',
      `frontMatterTitle is ${frontMatterTitle}`,
    );
    assert(
      documentName !== undefined &&
      documentName !== null &&
      typeof documentName === 'string',
      `documentName is ${documentName}`,
    );
    if (frontMatterTitle) {
      return frontMatterTitle;
    }
    return documentName;
  }

  /**
   * Reduce a created time from file birth time, the date field of frontmatter
   * and the date extracted from the docuemnt name.
   * @param {Date | undefined} birthTime
   * @param {Date | undefined} frontMatterDate
   * @param {Date | undefined} documentNameDate
   * @return {Date}
   */
  public static reduceCreatedTime(
    birthTime: Date,
    frontMatterDate?: Date,
    documentNameDate?: Date,
  ): Date {
    assert(
      frontMatterDate === undefined ||
      frontMatterDate === null ||
      frontMatterDate instanceof Date,
      `frontMatterDate is ${frontMatterDate}`,
    );
    assert(
      documentNameDate === undefined ||
      documentNameDate === null ||
      documentNameDate instanceof Date,
      `documentNameDate is ${documentNameDate}`,
    );
    assert(
      birthTime != undefined && birthTime != null && birthTime instanceof Date,
    );
    if (frontMatterDate) {
      return frontMatterDate;
    }
    if (documentNameDate) {
      return documentNameDate;
    }
    return birthTime;
  }
}
