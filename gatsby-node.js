exports.onPreInit = () => console.log("Loaded gatsby-source-wpw.")

exports.sourceNodes = require('./src/source-nodes')
