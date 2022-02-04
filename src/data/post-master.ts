import {Node} from 'gatsby';

export interface PostMasterNode extends Node {
  name: string;
  disambiguator: string;
  createdTime: Date;
}
