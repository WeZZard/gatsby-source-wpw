import { log } from '../utilities';
const _ = require('lodash');

module.exports = function(args) {
  const {
    tag,
    getNodesByType,
    createNode,
    createNodeId,
    createContentDigest,
  } = args;

  const tagContent = tag.toString()

  const kebabTag = _.kebabCase(tagContent);
  const tagData = { name: tagContent, kebabName: `${kebabTag}` };
  const existedNodes = getNodesByType(`Tag`).filter(
    node => node.kebabName === tagData.kebabName,
  );
  if (existedNodes.length === 1) {
    const node = existedNodes[0];
    if (node.name !== tagData.name) {
      throw `Tag "${node.name}" and "${tagData.name}" shares the same kebab name: ${
        node.kebabName
      }, which is not allowed.`;
    }
    log(`Returns the data of existed tag node: ${JSON.stringify(node)}`);
    return node.id;
  } else if (existedNodes.length === 0) {
    const nodeId = createNodeId(`tag-${kebabTag}`);
    const nodeData = Object.assign({}, tagData, {
      id: nodeId,
      parent: null,
      children: [],
      internal: {
        type: `Tag`,
        contentDigest: createContentDigest(tagData.kebabName),
        content: tagContent,
      },
    });
    log(`Create tag node: ${JSON.stringify(tagContent)}`);
    log(nodeData);
    createNode(nodeData);
    return nodeId;
  } else {
    throw `Multiple tag nodes were found for an identical kebab name. ${existedNodes}`;
  }
};
