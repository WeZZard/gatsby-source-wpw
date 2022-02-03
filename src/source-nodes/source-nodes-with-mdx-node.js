const MDXMetadata = require('../mdx-support/mdx-metadata');
const {
  createNodeForPostMaster,
  createNodeForPost,
  createNodeForTag,
  createNodeForCategory,
  createNodeForLocale,
} = require('../create-node');

import { isPreviewEnabled } from '../utilities'

module.exports = (args) => {
  const {
    mdxNode,
    getNode,
    getNodesByType,
    createNodeId,
    createContentDigest,
    createNode,
    createParentChildLink,
    sourceInstanceName
  } = args;

  const isInPreview = isPreviewEnabled();

  const metadata = new MDXMetadata({ node: mdxNode, getNode });

  const fileNode = getNode(mdxNode.parent);

  const absolutePath = fileNode.absolutePath;

  if (isInPreview || (!isInPreview && metadata.isPublished)) {

    const postMasterNodeId = createNodeForPostMaster(
      {
        name: metadata.masterName,
        disambiguator: metadata.masterDisambiguator,
        createdTime: metadata.masterCreatedTime,
        getNodesByType,
        createNode,
        createNodeId,
        createContentDigest,
      }
    )

    let tags
    if (mdxNode.frontmatter.tags) {
      tags = mdxNode.frontmatter.tags;
    } else {
      tags = [];
    }

    let tagNodeIds = []
    for (const tag of tags) {
      let tagNodeId = createNodeForTag(
        {
          tag,
          getNodesByType,
          createNode,
          createNodeId,
          createContentDigest,
        }
      )
      tagNodeIds.push(tagNodeId)
    }

    let categoryNodeId = null
    if (mdxNode.frontmatter.category) {
      const category = mdxNode.frontmatter.category;
      categoryNodeId = createNodeForCategory(
        {
          category,
          getNodesByType,
          createNode,
          createNodeId,
          createContentDigest,
        }
      )
    }

    let localeNodeId = null
    if (metadata.lang) {
      let locale = metadata.lang

      localeNodeId = createNodeForLocale(
        {
          locale: locale,
          getNodesByType: getNodesByType,
          createNode: createNode,
          createNodeId: createNodeId,
          createContentDigest: createContentDigest,
        }
      )
    }

    createNodeForPost(
      {
        post: {
          sourceInstanceName: sourceInstanceName,
          title: metadata.title,
          subtitle: mdxNode.frontmatter.subtitle ?? '',
          createdTime: metadata.createdTime,
          lastModifiedTime: mdxNode.frontmatter.lastModifiedTime ?? metadata.createdTime,
          isMasterPost: metadata.isMasterPost,
          isPublished: mdxNode.frontmatter.isPublished === true,
          license: mdxNode.frontmatter.license ?? '',
        },
        masterNodeId: postMasterNodeId,
        tagNodeIds: tagNodeIds,
        categoryNodeId: categoryNodeId,
        localeNodeId: localeNodeId,
        nodeIdBase: absolutePath,
        nodeContent: mdxNode.rawBody,
        getNode,
        createNode,
        createNodeId,
        createContentDigest,
        createParentChildLink,
      }
    );

  }
};
