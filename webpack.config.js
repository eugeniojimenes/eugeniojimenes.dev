const path = require('path');

module.exports = {
  entry: './src/assets/js/index.js',
  output: {
    path: path.join(__dirname, './src/dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [['@babel/preset-env', {"shippedProposals": true}]]
          }
        }
      },
    ]
  }
};

