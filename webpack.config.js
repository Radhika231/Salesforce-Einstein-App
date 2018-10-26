const path = require('path')
const nodeExternals = require('webpack-node-externals')
const HtmlWebPackPlugin = require('html-webpack-plugin')
const webpack = require('webpack');

const moduleObj = {
  loaders: [
    {
      test: /\.js$/,
      exclude: /node_modules/,
      loaders: ['babel-loader']
    },
    {
       test: /\.scss$/,
       use: [
         {
           loader: 'style-loader'
         },
         {
           loader: 'css-loader'
         },
         {
           loader: 'sass-loader', options: {
             includePaths: ['./node_modules', './node_modules/grommet/node_modules']
           }
         }
       ]
     }
  ]
}

const client = {
  entry: {
    'client': './src/client/index.js'
  },
  target: 'web',
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist/public')
  },
  module: moduleObj,
  plugins: [
    new HtmlWebPackPlugin({
      template: 'src/client/index.html'
    }),
    new webpack.EnvironmentPlugin([
      'EINSTEIN_VISION_URL',
      'EINSTEIN_VISION_ACCOUNT_ID',
      'EINSTEIN_VISION_PRIVATE_KEY'
    ]),
  ]
}

const server = {
  entry: {
    'server': './src/server/index.js'
  },
  target: 'node',
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  node: {
    __dirname: false,
    __filename: false,
  },
  module: moduleObj,
  externals: [nodeExternals()]
}

module.exports = [client, server]
