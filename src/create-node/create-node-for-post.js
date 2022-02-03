import { log } from '../utilities';

module.exports = function (args) {
  const {
    post: data,
    masterNodeId,
    tagNodeIds,
    categoryNodeId,
    localeNodeId,
    nodeIdBase,
    nodeContent,
    getNode,
    createNode,
    createNodeId,
    createContentDigest,
    createParentChildLink,
  } = args;

  const nodeId = createNodeId(`post-${nodeIdBase}`);
  const nodeData = Object.assign(
    {},
    {
      tags___NODE: tagNodeIds,
      category___NODE: categoryNodeId,
      locale___NODE: localeNodeId,
      ...data,
    },
    {
      id: nodeId,
      parent: masterNodeId,
      internal: {
        type: `Post`,
        content: nodeContent,
        contentDigest: createContentDigest(nodeContent),
      },
    }
  );

  log(`Create post node: ${JSON.stringify(data)}`);
  createNode(nodeData);

  createParentChildLink({ parent: getNode(masterNodeId), child: getNode(nodeId) });

  return nodeId;
};
