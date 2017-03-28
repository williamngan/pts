var webpack = require('webpack')
var path = require('path')

var TARGET = process.env.npm_lifecycle_event
process.env.BABEL_ENV = TARGET

var APP_PATH = path.resolve(__dirname, 'src/app.ts')
var BUILD_PATH = path.resolve(__dirname, 'dist')
var prod = process.argv.indexOf('-p') !== -1


module.exports = {
  
  entry: APP_PATH,

  output: {
    library: 'pts',
    path: BUILD_PATH,
    filename: prod ? 'pts.min.js' : 'pts.js'
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
      { test: /\.tsx?$/, loader: 'babel-loader!ts-loader' }
    ],
  },

}