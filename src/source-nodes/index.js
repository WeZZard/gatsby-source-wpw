const sourceNodesWithMdxNode = require('./source-nodes-with-mdx-node');

module.exports = (api, pluginOptions) => {

  // create post-master by scanning directories under specified wpw url
  // create posts by scanning mdx nodes under specified wpw url

  // TODO: Make 'Default' unique each time the program was ran.
  const defaultSourceInstanceName = `Default`

  let sourceInstanceName

  if (pluginOptions) {
    sourceInstanceName = pluginOptions.sourceInstanceName ?? defaultSourceInstanceName
  } else {
    sourceInstanceName = defaultSourceInstanceName
  }

  const {
    actions,
    getNode,
    getNodesByType,
    createNodeId,
    createContentDigest
  } = api;

  const { createNode, createParentChildLink } = actions;

  for (const mdxNode of getNodesByType(`Mdx`)) {
    sourceNodesWithMdxNode(
      {
        mdxNode,
        getNode,
        getNodesByType,
        createNodeId,
        createContentDigest,
        createNode,
        createParentChildLink,
        sourceInstanceName
      }
    );
  }

  // Adopts category and tags from master post to non-master posts.
  for (const postMasterNode of getNodesByType(`PostMaster`)) {
    const childNodes = postMasterNode.children.map(eachNodeId => getNode(eachNodeId));
    const masterPostNode = childNodes.filter(eachNode => eachNode.isMasterPost)[0]

    if (!masterPostNode) {
      // Some posts only has a localized version and no master version.
      continue;
    }

    for (eachNonMasterPostNode of childNodes.filter(eachNode => !eachNode.isMasterPost)) {
      if (!eachNonMasterPostNode.category___NODE && masterPostNode.category___NODE) {
        eachNonMasterPostNode.category___NODE = masterPostNode.category___NODE
      }

      const noTags = !eachNonMasterPostNode.tags___NODE
       || (eachNonMasterPostNode.tags___NODE && eachNonMasterPostNode.tags___NODE.length == 0);

      if (noTags && masterPostNode.tags___NODE) {
        eachNonMasterPostNode.tags___NODE = masterPostNode.tags___NODE
      }
    }
  }

}
