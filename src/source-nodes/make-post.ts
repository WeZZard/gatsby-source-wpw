import {Node, NodePluginArgs} from 'gatsby';
import {FileSystemNode} from 'gatsby-source-filesystem';
import {PluginOptions} from '..';
import {log, getSourceInstanceName} from '../utilities';
import {NodeVisitor} from '../visitor';
import {MDXNode, PostMasterNode} from '../data';
import {MDXMetadata} from './mdx-metadata';
import {
  createPostNode,
  createCategoryNode,
  createTagNode,
  createLocaleNode,
  PostNodeData,
} from './create-nodes';

/**
 * MakePostVisitor
 */
export class MakePostVisitor extends NodeVisitor {
  postMasterNodeID: string;

  /**
   * Constructs MakePostVisitor.
   * @param {NodePluginArgs} args
   * @param {PluginOptions} options
   * @param {string} postMasterNodeID
   */
  constructor(
    args: NodePluginArgs,
    options: PluginOptions,
    postMasterNodeID: string,
  ) {
    super(args, options);
    this.postMasterNodeID = postMasterNodeID;
  }

  /**
   * Visits Node and creates post master if necessary
   * @param {Node} node
   * @return {void}
   */
  visit(node: Node): void {
    if (node.internal.type !== 'Mdx') {
      return;
    }
    const {getNode} = this.args;

    const mdxNode = node as MDXNode;
    if (!mdxNode.parent) {
      log(`No parent for mdx node: ${JSON.stringify(mdxNode)}.`);
      return;
    }

    const fsNode = getNode(mdxNode.parent) as FileSystemNode;
    const metadata = MDXMetadata.make(mdxNode, fsNode);

    if (!metadata) {
      log(`Cannot parse metadata from mdx node: ${JSON.stringify(mdxNode)}.`);
      return;
    }

    const masterPostNode = getNode(this.postMasterNodeID) as PostMasterNode;

    if (metadata.masterID !== masterPostNode.masterID) {
      return;
    }

    const rawTags = mdxNode.frontmatter?.tags ?? [];

    const tags: string[] = [];
    for (const rawTag of rawTags) {
      const tagNodeId = createTagNode(this.args, rawTag);
      tags.push(tagNodeId);
    }

    const rawCategory = mdxNode.frontmatter?.category;

    let category: string | undefined = undefined;
    if (rawCategory) {
      category = createCategoryNode(this.args, rawCategory);
    }

    let locale: string | undefined = undefined;
    if (metadata.locale) {
      locale = createLocaleNode(this.args, metadata.locale);
    }

    const sourceInstanceName = getSourceInstanceName(
      this.options.sourceInstanceName,
    );

    const nodeData: PostNodeData = {
      identifier: fsNode.absolutePath,
      contents: mdxNode.rawBody,
      payload: {
        sourceInstanceName: sourceInstanceName,
        title: mdxNode.frontmatter?.title ?? metadata.title,
        subtitle: mdxNode.frontmatter?.subtitle,
        createdTime: metadata.createdTime,
        lastModifiedTime: mdxNode.frontmatter?.lastModifiedTime ??
          metadata.createdTime,
        isPublished: mdxNode.frontmatter?.isPublished === true,
        license: mdxNode.frontmatter?.license,
        tags,
        category,
        locale,
        mdx: mdxNode.id,
      },
    };

    createPostNode(this.args, this.postMasterNodeID, nodeData);
  }
}
