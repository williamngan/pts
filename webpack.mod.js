var webpack = require('webpack');
var path = require('path');

var LIB_PATH = path.resolve(__dirname, 'src/_module.ts')
var BUILD_PATH = path.resolve(__dirname, 'dist')

module.exports = {

  mode: 'development',
  devtool: 'source-map',

  entry: {
    pts: LIB_PATH
  },

  output: {
    libraryTarget: 'umd',
    umdNamedDefine: true,
    path: BUILD_PATH,
    filename: 'index.js'
  },

  // devtool: 'source-map',

  // watchOptions: { poll: true }, // seems to need this for Windows Linux subsystem to watch

  resolve: {
    extensions: ['.webpack.js', '.web.js', '.ts', '.tsx', '.js']
  },

  module: {
    rules:[
      {
        test: /\.tsx?$/, loader: "tslint-loader", enforce: "pre",
        options: {emitErrors: true, failOnHint: true}
      },
      { 
        test: /\.tsx?$/, 
        loader: 'ts-loader'
      }
    ],
  },

  plugins: [
    new webpack.BannerPlugin( `pts.js ${require("./package.json").version} - Copyright © 2017-${new Date().getFullYear()} William Ngan and contributors.\nLicensed under Apache 2.0 License.\nSee https://github.com/williamngan/pts for details.` )
  ]

};
