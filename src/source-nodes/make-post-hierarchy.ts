import {Node} from 'gatsby';
import path from 'path';
import {FileSystemNode} from 'gatsby-source-filesystem';
import {createPostMasterNode} from './create-nodes';
import {RelativePathMetadata} from './relative-path-metadata';
import {NodeVisitor} from '../visitor';
import {MakePostVisitor} from './make-post';
import {ensureMasterPost} from './create-nodes';

/**
 * MakePostMasterHierarchyVisitor
 */
export class MakePostHierarchyVisitor extends NodeVisitor {
  /**
   * Visits a Node instance and creates post master and clustered posts if
   * necessary.
   * @param {Node} node
   * @return {void}
   */
  visit(node: Node): void {
    if (node.internal.type !== 'File' && node.internal.type !== 'Directory') {
      return;
    }

    const fsNode = node as FileSystemNode;

    const normSourcePath = path.normalize(this.options.sourcePath);
    const normNodePath = path.normalize(fsNode.absolutePath);
    if (!normNodePath.startsWith(normSourcePath)) {
      return;
    }

    const relativePath = path.relative(normSourcePath, normNodePath);
    const metadata = RelativePathMetadata.make(relativePath);
    if (!metadata) {
      return;
    }

    const postMasterNodeID = createPostMasterNode(
      this.args,
      metadata,
      fsNode.id,
    );

    if (!postMasterNodeID) {
      return;
    }

    const {getNodes} = this.args;

    const makePost = new MakePostVisitor(
      this.args,
      this.options,
      postMasterNodeID,
    );
    for (const node of getNodes()) {
      makePost.visit(node);
    }

    ensureMasterPost(this.args, this.options, postMasterNodeID);
  }
}
