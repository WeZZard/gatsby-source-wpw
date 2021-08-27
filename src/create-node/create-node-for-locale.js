const debug = require('debug');
const { localeIdentifierPattern } = require('../mdx-support/mdx-shims.js');

module.exports = function(args) {
  const {
    locale,
    getNodesByType,
    createNode,
    createNodeId,
    createContentDigest,
  } = args;

  const pattern = new RegExp(localeIdentifierPattern());

  if (!pattern.exec(locale)) {
    throw `Invalid locale: "${locale}".`;
  }

  const localeData = { identifier: locale };

  const existedNodes = getNodesByType(`Locale`).filter(
    node => node.identifier === localeData.identifier,
  );
  if (existedNodes.length === 1) {
    const node = existedNodes[0];
    if (node.identifier !== localeData.identifier) {
      throw `Duplicate locale "${node.identifier}".`;
    }
    debug(`Returns the data of existed locale node: ${node}`);
    return node.id;
  } else if (existedNodes.length === 0) {
    const nodeId = createNodeId(`locale-${locale}`);
    const nodeData = Object.assign({}, localeData, {
      id: nodeId,
      parent: null,
      children: [],
      internal: {
        type: `Locale`,
        content: locale,
        contentDigest: createContentDigest(localeData.identifier),
      },
    });
    debug(`Create locale node: ${locale}`);
    createNode(nodeData);
    return nodeId;
  } else {
    throw `Multiple locale nodes was found. ${existedNodes}`;
  }
};
