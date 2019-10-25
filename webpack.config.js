/**
 * function: webpack.config
 * author  : wq
 * update  : 2019/10/22 11:48
 */
const { resolve } = require('path')
const shouldLint = process.env.shouldLint || false

const createLintingRule = () => ({
  test: /\.(js|wxs)$/,
  loader: 'eslint-loader',
  enforce: 'pre',
  include: [resolve('src'), resolve('test')],
  options: {
    formatter: require('eslint-friendly-formatter'),
  }
})

module.exports = {
  mode: 'production',
  entry: {
    index: './src/index.js'
  },
  output: {
    filename: '[name].js',
    publicPath: '/',
    path: resolve(__dirname, 'lib')
  },
  module: {
    rules: [
      ...(shouldLint ? [createLintingRule()] : []),
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          'babel-loader'
        ]
      }
    ]
  },
  optimization: {
    minimize: false,
    splitChunks: false
  }
}
