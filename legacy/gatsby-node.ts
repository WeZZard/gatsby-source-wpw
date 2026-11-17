import debug from 'debug';

const log = debug('gatsby-source-wpw:gatsby-node')

export const onPreInit = () => log('Loaded gatsby-source-wpw.');
export {sourceNodes} from './src/source-nodes';
export {createSchemaCustomization} from './src/data';
