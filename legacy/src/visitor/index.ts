import {PluginOptions} from '..';
import {NodePluginArgs} from 'gatsby';
import {Node} from 'gatsby';

/**
 * Abstract class NodeVisitor.
 */
export abstract class NodeVisitor {
  public readonly args: NodePluginArgs;
  public readonly options: PluginOptions;

  /**
   * Constructs NodeVisitor.
   * @param {NodePluginArgs} args
   * @param {PluginOptions} options
   */
  public constructor(args: NodePluginArgs, options: PluginOptions) {
    this.args = args;
    this.options = options;
  }

  /**
   * Visit node.
   * @param {Node} node
   */
   public abstract visit(node: Node): void;
};
