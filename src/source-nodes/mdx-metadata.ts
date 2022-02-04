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

    if (mdxNode.internal.type !== 'Mdx') {
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

    const fontmatterDate = mdxNode.frontmatter?.date ?
      new Date(mdxNode.frontmatter?.date) :
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
      mdxNode.frontmatter?.title,
    );

    const lang = relativePathMetadata.locale || mdxNode.frontmatter?.lang || '';

    const isPublished =
      mdxNode.frontmatter?.isPublished === undefined ||
      mdxNode.frontmatter?.isPublished === true;

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
   * @param {string | undefined} frontmatterTitle
   * @return {string}
   */
  public static reduceTitle(
    documentName: string,
    frontmatterTitle?: string,
  ): string {
    assert(
      frontmatterTitle === undefined ||
      frontmatterTitle === null ||
      typeof frontmatterTitle === 'string',
      `frontmatterTitle is ${frontmatterTitle}`,
    );
    assert(
      documentName !== undefined &&
      documentName !== null &&
      typeof documentName === 'string',
      `documentName is ${documentName}`,
    );
    if (frontmatterTitle) {
      return frontmatterTitle;
    }
    return documentName;
  }

  /**
   * Reduce a created time from file birth time, the date field of frontmatter
   * and the date extracted from the docuemnt name.
   * @param {Date | undefined} birthTime
   * @param {Date | undefined} frontmatterDate
   * @param {Date | undefined} documentNameDate
   * @return {Date}
   */
  public static reduceCreatedTime(
    birthTime: Date,
    frontmatterDate?: Date,
    documentNameDate?: Date,
  ): Date {
    assert(
      frontmatterDate === undefined ||
      frontmatterDate === null ||
      frontmatterDate instanceof Date,
      `frontmatterDate is ${frontmatterDate}`,
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
    if (frontmatterDate) {
      return frontmatterDate;
    }
    if (documentNameDate) {
      return documentNameDate;
    }
    return birthTime;
  }
}
