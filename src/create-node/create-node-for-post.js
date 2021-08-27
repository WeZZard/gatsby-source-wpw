const debug = require('debug');

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

  debug(`Create post node: ${data}`);
  createNode(nodeData);

  createParentChildLink({ parent: getNode(masterNodeId), child: getNode(nodeId) });

  return nodeId;
};
