var webpack = require('webpack');
var path = require('path');
// var BabiliPlugin = require("babili-webpack-plugin");

var TARGET = process.env.npm_lifecycle_event
process.env.BABEL_ENV = TARGET

var APP_PATH = path.resolve(__dirname, 'src/_app.ts')
var LIB_PATH = path.resolve(__dirname, 'src/_lib.ts')
var BUILD_PATH = path.resolve(__dirname, 'dist')
var prod = process.argv.indexOf('-p') !== -1

/*
module.exports = {
    entry: {
        front: "./static/src/js/Front.js",
        account: "./static/src/js/Account.js"
    },
    output: {
        path: "./static/dist",
        filename: "[name]-bundle.js"
    }
};

    filename: '[name].js',
    libraryTarget: 'var',
    // `library` determines the name of the global variable
    library: '[name]'
*/

module.exports = {
  
  entry: {
    pts: LIB_PATH,
    testapp: APP_PATH
  },

  output: {
    library: 'Pts',
    libraryTarget: 'var',
    path: BUILD_PATH,
    filename: prod ? '[name].min.js' : '[name].js'
  },

  devtool: 'source-map',

  watch: !prod,
  watchOptions: { poll: true }, // seems to need this for Windows Linux subsystem to watch

  resolve: {
    extensions: ['.webpack.js', '.web.js', '.ts', '.tsx', '.js']
  },

  module: {
    rules:[
      /*{
        test: /\.tsx?$/, loader: "tslint-loader", enforce: "pre",
        options: {emitErrors: true, failOnHint: true}
      },*/
      { 
        test: /\.tsx?$/, 
        loader: 'ts-loader'
      }
    ],
  },

}