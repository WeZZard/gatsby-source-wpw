import {sourceNodes} from './src/source-nodes';
import {createSchemaCustomization} from './src/data';

exports.onPreInit = () => console.log('Loaded gatsby-source-wpw.');
exports.sourceNodes = sourceNodes;
exports.createSchemaCustomization = createSchemaCustomization;
