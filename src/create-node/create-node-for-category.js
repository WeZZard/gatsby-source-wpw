const _ = require('lodash');
import { log } from '../utilities';

module.exports = function(args) {
  const {
    category,
    getNodesByType,
    createNode,
    createNodeId,
    createContentDigest,
  } = args;

  const kebabCategory = _.kebabCase(category);
  const categoryData = { name: category, kebabName: `${kebabCategory}` };
  const existedNodes = getNodesByType(`Category`).filter(
    node => node.kebabName === categoryData.kebabName,
  );
  if (existedNodes.length === 1) {
    const node = existedNodes[0];
    if (node.name !== categoryData.name) {
      throw `Category "${node.name}" and "${
        categoryData.name
      }" shares the same kebabName: ${node.kebabName}, which is not allowed.`;
    }
    log(`Returns the data of existed category node: ${JSON.stringify(node)}`);
    return node.id;
  } else if (existedNodes.length === 0) {
    const nodeId = createNodeId(`category-${kebabCategory}`);
    const nodeData = Object.assign({}, categoryData, {
      id: nodeId,
      parent: null,
      children: [],
      internal: {
        type: `Category`,
        content: category,
        contentDigest: createContentDigest(categoryData.kebabName),
      },
    });
    log(`Create category node: ${JSON.stringify(category)}`);
    createNode(nodeData);
    return nodeId;
  } else {
    throw `Multiple category nodes was found. ${existedNodes}`;
  }
};
