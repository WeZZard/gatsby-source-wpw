import {Node} from 'gatsby';

export interface PostMasterNode extends Node {
  name: string;
  /**
   * Global identifier for post master.
   */
  masterID: string;
  createdTime: Date;
}
