import {NodePluginArgs} from 'gatsby';
import {PluginOptions} from '..';
import {MakePostHierarchyVisitor} from './make-post-hierarchy';
import debug from 'debug';
const log = debug('gatsby-source-wpw:source-nodes')

/**
 * Source the nodes with existed info
 * @param {NodePluginArgs} args
 * @param {PluginOptions} options
 */
export function sourceNodes(
  args: NodePluginArgs,
  options: PluginOptions,
) {
  const {getNodes} = args;
  const makePostHierarchy = new MakePostHierarchyVisitor(args, options);
  for (const node of getNodes()) {
    log(`Sourcing with node of type: ${node.internal.type}`);
    makePostHierarchy.visit(node);
  }
};
