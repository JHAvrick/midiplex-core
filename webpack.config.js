const path = require('path');

module.exports = {
  entry: './src/index.ts',
  output: {
    library: 'MidiPlex',
    libraryTarget: 'umd',
    filename: 'midiplex.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      { test: /\.(js|ts)$/, exclude: /node_modules/, loader: "babel-loader" }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js', '.json']
  }
};