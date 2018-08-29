var webpack = require('webpack');
var path = require('path');

var TARGET = process.env.npm_lifecycle_event
process.env.BABEL_ENV = TARGET

var APP_PATH = path.resolve(__dirname, 'src/_app.ts')
var LIB_PATH = path.resolve(__dirname, 'src/_lib.ts')
var BUILD_PATH = path.resolve(__dirname, 'dist')

module.exports = {

  mode: 'development',
  devtool: 'source-map',
  
  entry: {
    pts: LIB_PATH
    // testapp: APP_PATH
  },

  output: {
    library: 'Pts',
    libraryTarget: 'umd',
    path: BUILD_PATH,
    filename: 'pts.js'
  },

  devtool: 'source-map',

  watchOptions: { poll: true }, // seems to need this for Windows Linux subsystem to watch

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