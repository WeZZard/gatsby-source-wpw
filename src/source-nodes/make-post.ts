import {Node, NodePluginArgs} from 'gatsby';
import {FileSystemNode} from 'gatsby-source-filesystem';
import {PluginOptions} from '..';
import {log, getSourceInstanceName} from '../utilities';
import {NodeVisitor} from '../visitor';
import {MDXMetadata, MDXNode, PostMasterNode} from '../data';
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
    const {
      getNode,
    } = this.args;
    const mdxNode = node as MDXNode;
    if (!mdxNode.parent) {
      log(`No parent for mdx node: ${JSON.stringify(mdxNode)}.`);
      return;
    }
    const fsNode = getNode(mdxNode.parent) as FileSystemNode;
    const masterPostNode = getNode(this.postMasterNodeID) as PostMasterNode;
    const metadata = MDXMetadata.make(mdxNode, fsNode);

    if (!metadata) {
      log(`Cannot parse metadata from mdx node: ${JSON.stringify(mdxNode)}.`);
      return;
    }

    if (metadata.masterName !== masterPostNode.name ) {
      return;
    }

    const tags = mdxNode.frontmatter?.tags ?? [];

    const tagNodeIds = [];
    for (const tag of tags) {
      const tagNodeId = createTagNode(this.args, tag);
      tagNodeIds.push(tagNodeId);
    }

    const category = mdxNode.frontmatter?.category;

    let categoryNodeId = null;
    if (category) {
      categoryNodeId = createCategoryNode(this.args, category);
    }

    let localeNodeId = null;
    if (metadata.lang) {
      const locale = metadata.lang;
      localeNodeId = createLocaleNode(this.args, locale);
    }

    const sourceInstanceName = getSourceInstanceName(
      this.options.sourceInstanceName,
    );

    const nodeData: PostNodeData = {
      identifier: fsNode.absolutePath,
      contents: mdxNode.rawBody,
      directMembers: {
        sourceInstanceName: sourceInstanceName,
        title: metadata.title,
        subtitle: mdxNode.frontmatter?.subtitle ?? '',
        createdTime: metadata.createdTime,
        lastModifiedTime: mdxNode.frontmatter?.lastModifiedTime ??
          metadata.createdTime,
        isPublished: mdxNode.frontmatter?.isPublished === true,
        license: mdxNode.frontmatter?.license ?? '',
      },
      tagNodeIds: tagNodeIds,
      categoryNodeId: categoryNodeId,
      localeNodeId: localeNodeId,
    };

    createPostNode(this.args, this.postMasterNodeID, nodeData);
  }
}
