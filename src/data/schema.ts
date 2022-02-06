import {NodePluginArgs} from 'gatsby';

/**
 * Creates schema customizations.
 * @param {NodePluginArgs} args
 */
export function createSchemaCustomization(args: NodePluginArgs): void {
  const {actions} = args;
  const {createTypes} = actions;
  const typeDefs = `
    """
    PostMaster
    """
    type PostMaster implements Node @infer {
      name: String!
      masterID: String!
      createTime: Date!
    }

    """
    Post
    """
    type Post implements Node @infer {
      sourceInstanceName: String!
      title: String!
      subtitle: String
      createdTime: Date!
      lastModifiedTime: Date!
      isPublished: Boolean!
      license: String
      tags: [Tag!]! @link
      category: Category @link
      locale: Locale @link
      mdx: Mdx @link
    }

    """
    Category
    """
    type Category implements Node @infer {
      name: String!
      kebabName: String!
    }

    """
    Tag
    """
    type Tag implements Node @infer {
      name: String!
      kebabName: String!
    }

    """
    Locale
    """
    type Locale implements Node @infer {
      identifier: String!
    }
  `;
  createTypes(typeDefs);
};
