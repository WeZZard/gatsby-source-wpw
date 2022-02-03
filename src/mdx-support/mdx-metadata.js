const { getTitle, getCreatedTime } = require('./mdx-shims');
const MDXRelativePathMetadata = require('./mdx-relative-path-metadata');

module.exports = function(args) {
  /*
    {
        documentType: string('Post', 'Page')
        relativePath: string
        title: string
        isIndex: bool
        isPublished: bool
        createdTime: Date(string(ISO 8601))
        masterName: string
        masterDisambiguator: string
        masterCreatedTime: Date(string(ISO 8601))
    }
    */

  const { node, getNode } = args;

  if (node.internal.type === 'Mdx') {
    let metadata = {};

    const parentNode = getNode(node.parent);
    const relativePath = parentNode.relativePath;

    const specifiedCreatedTime = node.frontmatter.date
      ? new Date(node.frontmatter.date)
      : null;

    const birthTime = parentNode.birthTime
      ? new Date(parentNode.birthTime)
      : null;

    const relativePathMetadata = new MDXRelativePathMetadata(relativePath);

    const isMaster = !relativePathMetadata.isLocalized;

    metadata.masterName = relativePathMetadata.masterName;

    metadata.masterDisambiguator = relativePathMetadata.masterDisambiguator;

    metadata.masterCreatedTime = relativePathMetadata.masterCreatedTime;

    metadata.isMasterPost = isMaster

    metadata.title = getTitle(
      node.frontmatter.title ?? relativePathMetadata.masterName,
      relativePathMetadata.name,
    );

    metadata.lang = relativePathMetadata.lang || node.frontmatter.lang || '';

    metadata.isLocalized = relativePathMetadata.isLocalized;

    metadata.isIndex = relativePathMetadata.isIndex;

    metadata.isPublished =
      node.frontmatter.isPublished === undefined ||
      node.frontmatter.isPublished === 'true';

    metadata.createdTime = getCreatedTime(
      specifiedCreatedTime,
      relativePathMetadata.masterCreatedTime,
      birthTime,
    );

    metadata.relativePath = relativePathMetadata.relativePath;

    return metadata;
  }

  return null;
};
