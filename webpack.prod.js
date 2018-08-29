var webpack = require('webpack');
var path = require('path');
const MinifyPlugin = require("babel-minify-webpack-plugin");


var TARGET = process.env.npm_lifecycle_event
process.env.BABEL_ENV = TARGET

var APP_PATH = path.resolve(__dirname, 'src/_app.ts')
var LIB_PATH = path.resolve(__dirname, 'src/_lib.ts')
var BUILD_PATH = path.resolve(__dirname, 'dist')
var prod = process.argv.indexOf('-p') !== -1


module.exports = {

  mode: 'production',
  devtool: 'source-map',
  
  entry: {
    pts: path.resolve( BUILD_PATH, "pts.js" )
  },

  output: {
    library: 'Pts',
    libraryTarget: 'umd',    
    path: BUILD_PATH,
    filename: 'pts.min.js'
  },

  devtool: 'source-map',

  resolve: {
    extensions: ['.js']
  },

  plugins: [
    new MinifyPlugin({}, {
      comments: false
    }),
    new webpack.BannerPlugin( `pts.js ${require("./package.json").version} (minified es6) - Copyright © 2017-${new Date().getFullYear()} William Ngan and contributors.\nLicensed under Apache 2.0 License.\nSee https://github.com/williamngan/pts for details.`)
  ]

};