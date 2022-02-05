import {default as _} from 'lodash';
import {NodePluginArgs} from 'gatsby';
import {log, getLocaleIdentifierPattern} from '../utilities';
import {RelativePathMetadata} from './relative-path-metadata';
import {getSourceInstanceName} from '../utilities';
import {PostMasterNode, PostNode} from '../data';
import {PluginOptions} from '..';

/**
 * Creates PostMaster node with relative-path metadata.
 * @param {NodePluginArgs} args
 * @param {RelativePathMetadata} metadata
 * @param {string} fileNodeID
 * @return {string}
 */
export function createPostMasterNode(
  args: NodePluginArgs,
  metadata: RelativePathMetadata,
  fileNodeID: string,
): string | undefined {
  if (!metadata.representsPostMaster) {
    return undefined;
  }

  const {
    getNode,
    createNodeId,
    createContentDigest,
    actions: {
      createNode,
    },
  } = args;

  const {
    name,
    masterID,
    createdTime,
  } = metadata;

  const data = {
    name: name,
    masterID: masterID,
    createdTime: createdTime,
  };

  const rawNodeID = `post-master-${masterID}`;

  const existedNode = getNode(rawNodeID);

  if (existedNode) {
    log(`Returns id existed post master node: ${JSON.stringify(existedNode)}`);
    return rawNodeID;
  }

  const nodeId = createNodeId(rawNodeID);
  const nodeData = Object.assign({}, data, {
    id: nodeId,
    parent: fileNodeID,
    internal: {
      type: `PostMaster`,
      content: `${name}-${masterID}`,
      contentDigest: createContentDigest(`${name}-${masterID}`),
    },
  });

  log(`Create post master node: ${JSON.stringify(data)}`);
  createNode(nodeData);

  return nodeId;
}

export interface PostNodeData {
  identifier: string;
  contents: string;
  directMembers: {
    sourceInstanceName: string,
    title: string,
    subtitle: string;
    createdTime: Date;
    lastModifiedTime: Date;
    isPublished: boolean;
    license: string;
  };
  tagNodeIds: string[];
  categoryNodeId: string | null;
  localeNodeId: string | null;
}

/**
 * Create Post node
 * @param {NodePluginArgs} args
 * @param {string} postMasterNodeID
 * @param {PostNodeData} data
 * @return {string}
 */
export function createPostNode(
  args: NodePluginArgs,
  postMasterNodeID: string,
  data: PostNodeData,
):string {
  const {
    directMembers,
    identifier,
    contents,
    tagNodeIds,
    categoryNodeId,
    localeNodeId,
  } = data;
  const {
    getNode,
    createNodeId,
    createContentDigest,
    actions: {
      createNode,
      createParentChildLink,
    },
  } = args;

  const postNodeId = `post-${identifier}`;

  const existedNode = getNode(postNodeId);

  if (existedNode) {
    log(`Returns id of existed post node: ${JSON.stringify(existedNode)}`);
    return postNodeId;
  }

  const nodeId = createNodeId(postNodeId);
  const nodeData = Object.assign(
    {},
    {
      tags___NODE: tagNodeIds,
      category___NODE: categoryNodeId,
      locale___NODE: localeNodeId,
      ...directMembers,
    },
    {
      id: nodeId,
      parent: postMasterNodeID,
      internal: {
        type: `Post`,
        content: contents,
        contentDigest: createContentDigest(contents),
      },
    },
  );

  log(`Create post node: ${JSON.stringify(directMembers)}`);
  createNode(nodeData);

  createParentChildLink({
    parent: getNode(postMasterNodeID),
    child: getNode(nodeId),
  });

  return nodeId;
};

/**
 * Create a tag node.
 * @param {NodePluginArgs} args
 * @param {any} tag
 * @return {string}
 */
export function createTagNode(args: NodePluginArgs, tag: any): string {
  const {
    getNodesByType,
    createNodeId,
    createContentDigest,
    actions: {
      createNode,
    },
  } = args;

  const tagString = tag.toString();

  const kebabTag = _.kebabCase(tagString);
  const tagData = {name: tagString, kebabName: `${kebabTag}`};
  const existedNodes = getNodesByType(`Tag`).filter(
    (node) => node.kebabName === tagData.kebabName,
  );
  if (existedNodes.length === 1) {
    const node = existedNodes[0];
    if (node.name !== tagData.name) {
      throw new Error(`Tag "${node.name}" and "${tagData.name}" shares the ` +
      `same kebab name: ${node.kebabName}, which is not allowed.`);
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
        content: tagString,
      },
    });
    log(`Create tag node: ${JSON.stringify(tagString)}`);
    log(nodeData);
    createNode(nodeData);
    return nodeId;
  } else {
    throw new Error(`Multiple tag nodes were found for an identical kebab ` +
    `name: ${existedNodes}`);
  }
};

/**
 * Create a category node.
 * @param {NodePluginArgs} args
 * @param {any} category
 * @return {string}
 */
export function createCategoryNode(
  args: NodePluginArgs,
  category: any,
): string {
  const {
    getNodesByType,
    createNodeId,
    createContentDigest,
    actions: {
      createNode,
    },
  } = args;

  const categoryString = category.toString();
  const kebabCategory = _.kebabCase(categoryString);
  const categoryData = {name: categoryString, kebabName: `${kebabCategory}`};
  const existedNodes = getNodesByType(`Category`).filter(
    (node) => node.kebabName === categoryData.kebabName,
  );
  if (existedNodes.length === 1) {
    const node = existedNodes[0];
    if (node.name !== categoryData.name) {
      throw new Error(`Category "${node.name}" and "${categoryData.name}" ` +
      `shares the same kebabName: ${node.kebabName}, which is not allowed.`);
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
        content: categoryString,
        contentDigest: createContentDigest(categoryData.kebabName),
      },
    });
    log(`Create category node: ${JSON.stringify(categoryString)}`);
    createNode(nodeData);
    return nodeId;
  } else {
    throw new Error(`Multiple category nodes was found. ${existedNodes}`);
  }
};

/**
 * Create a locale node.
 * @param {NodePluginArgs} args
 * @param {string} locale
 * @return {string}
 */
export function createLocaleNode(args: NodePluginArgs, locale: string): string {
  const {
    getNodesByType,
    createNodeId,
    createContentDigest,
    actions: {
      createNode,
    },
  } = args;

  const pattern = new RegExp(getLocaleIdentifierPattern());

  if (!pattern.exec(locale)) {
    throw new Error(`Invalid locale: "${locale}".`);
  }

  const localeData = {identifier: locale};

  const existedNodes = getNodesByType(`Locale`).filter(
    (node) => node.identifier === localeData.identifier,
  );
  if (existedNodes.length === 1) {
    const node = existedNodes[0];
    if (node.identifier !== localeData.identifier) {
      throw new Error(`Duplicate locale "${node.identifier}".`);
    }
    log(`Returns the data of existed locale node: ${JSON.stringify(node)}`);
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
    log(`Create locale node: ${JSON.stringify(locale)}`);
    createNode(nodeData);
    return nodeId;
  } else {
    throw new Error(`Multiple locale nodes was found. ${existedNodes}`);
  }
};


/**
 * Creates an empty master post for post master
 * @param {NodePluginArgs} args
 * @param {PluginOptions} options
 * @param {string} postMasterNodeID
 */
export function ensureMasterPost(
  args: NodePluginArgs,
  options: PluginOptions,
  postMasterNodeID: string,
) {
  const {getNode} = args;
  const postMasterNode = getNode(postMasterNodeID) as PostMasterNode;

  const noMasterPost = postMasterNode.children.reduce((partial, val)=> {
    const childNode = getNode(val) as PostNode;
    return partial && childNode.locale___NODE !== null;
  }, true);

  if (!noMasterPost) {
    return;
  }

  const sourceInstanceName = getSourceInstanceName(
    options.sourceInstanceName,
  );

  const nodeData: PostNodeData = {
    identifier: `${postMasterNode.name}-imaginary-master-post`,
    contents: '',
    directMembers: {
      sourceInstanceName: sourceInstanceName,
      title: postMasterNode.name,
      subtitle: '',
      createdTime: postMasterNode.createdTime,
      lastModifiedTime: postMasterNode.createdTime,
      isPublished: false,
      license: '',
    },
    tagNodeIds: [],
    categoryNodeId: null,
    localeNodeId: null,
  };

  createPostNode(args, postMasterNodeID, nodeData);
}
