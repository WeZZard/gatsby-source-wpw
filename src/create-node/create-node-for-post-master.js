const debug = require('debug');

module.exports = function(args) {
  const {
    name,
    disambiguator,
    createdTime,
    getNodesByType,
    createNode,
    createNodeId,
    createContentDigest,
  } = args;

  const data = {
    name,
    disambiguator,
    createdTime,
  };

  const existedNodes = getNodesByType(`PostMaster`).filter(
    node => node.name === data.name && node.disambiguator === data.disambiguator,
  );
  if (existedNodes.length === 1) {
    const node = existedNodes[0];
    debug(`Returns the data of existed post master node: ${node}`);
    return node.id;
  } else if (existedNodes.length === 0) {
    const nodeId = createNodeId(`post-master-${name}-${disambiguator}`);
    const nodeData = Object.assign({}, data, {
      id: nodeId,
      internal: {
        type: `PostMaster`,
        content: `${name}-${disambiguator}`,
        contentDigest: createContentDigest(`${name}-${disambiguator}`),
      },
    });
  
    debug(`Create post master node: ${data}`);
    createNode(nodeData);
  
    return nodeId;
  } else {
    throw `Multiple post master nodes were found for an identical name and disambiguator. ${existedNodes}`;
  }
};
