const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: {
    main: path.join(__dirname, 'src/_webpack', 'main'),
  },
  output: {
    path: path.resolve(__dirname, 'src/dist'),
    filename: '[name]-bundle.js',
  },
  resolve: {
    extensions: ['.json', '.js', '.jsx'],
    modules: ['node_modules'],
  },
  plugins: [
    new MiniCssExtractPlugin({filename:"main-bundle.css"}),
  ],
  optimization: { },
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          "postcss-loader"
        ],
      },
    ],
  },
};

