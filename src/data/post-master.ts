import {Node} from 'gatsby';

export interface PostMasterNode extends Node {

  name: string;

  /**
   * Global identifier for post master.
   *
   * The algorithm to generate `masterID` to differnet from 2019's
   * version. If you are refactoring/updating an old content renderer with
   * this plugin, you may write a downwards compatible infrastructure to
   * handle this issue.
   */
  masterID: string;

  createdTime: Date;
}
