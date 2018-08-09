const webpack = require("webpack")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const CaseSensitivePathsPlugin = require("case-sensitive-paths-webpack-plugin")

const config = {
  entry: "./examples/index.js",
  mode: "development",
  module: {
    rules: [{ test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }]
  },
  plugins: [
    new HtmlWebpackPlugin({ template: "./examples/index.html" }),
    new CaseSensitivePathsPlugin()
  ]
}

module.exports = config
