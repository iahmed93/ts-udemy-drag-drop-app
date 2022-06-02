const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

module.exports = {
  plugins: [new HtmlWebpackPlugin({ template: "./index.html" })],
  watchOptions: {
    ignored: /node_modules/,
  },
  devServer: { static: "./dist", port: 5000 },
  entry: "./app.ts",
  context: path.resolve(__dirname, "src"),
  output: {
    filename: "[name].[contenthash].bundle.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.ts$/i,
        use: ["ts-loader"],
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/,
        type: "asset/resource",
      },
    ],
  },
  devtool: "source-map",
  mode: "development",
  resolve: {
    extensions: [".ts", ".js"],
  },
};
