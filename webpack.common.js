const path = require('path');

const jsFile = 'index.js';

module.exports = {
  entry: {
    app: path.resolve(__dirname, 'src', jsFile),
  },
  output: {
    filename: jsFile,
    path: path.resolve(__dirname, 'build', 'assets', 'js'),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {targets: 'defaults'}]
            ]
          }
        }
      }
    ]
  }
};
