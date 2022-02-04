import {sourceNodes} from './src/source-nodes';

exports.onPreInit = () => console.log('Loaded gatsby-source-wpw.');
exports.sourceNodes = sourceNodes;
