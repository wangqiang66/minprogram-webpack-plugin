// import StylelintPlugin from 'stylelint-webpack-plugin';
// import CopyPlugin from 'copy-webpack-plugin';
const { resolve } = require('path')
const { DefinePlugin, EnvironmentPlugin, IgnorePlugin, optimize } = require('webpack')
const pkg = require('./package.json')
const CopyPlugin = require('copy-webpack-plugin')
const { MiniWebpackPlugin: WXAppWebpackPlugin, Targets, PreFileLoader } = require('@ddjf/minprogram-webpack-plugin')
const srcDir = resolve('src');
const processEnv = require(`./config/${process.env.NODE_MODE || 'dev'}.env`)
const isDev = processEnv.NODE_ENV !== 'production';

const copyPatterns = []
  .concat(pkg.copyWebpack || [])
  .map((pattern) => {
    return typeof pattern === 'string' ? { from: pattern, to: pattern } : pattern
  });

module.exports = (env = {}) => {
  const Target = Targets[env.target]

  return {
    mode: isDev ? 'development' : 'production',
    entry: {
      app: './src/app.js'
    },
    output: {
      filename: '[name].js',
      publicPath: '/',
      path: resolve('dist'),
    },
    optimization: {
      minimize: !isDev
    },
    target: Target.target,
    module: {
      rules: [
        {
          test: /\.js$/,
          use: [
            'babel-loader'
          ]
        },
        {
          test: /\.(scss|sass)$/,
          use: [
            PreFileLoader(Target, srcDir, Target.cssName),
            'postcss-loader',
            {
              loader: 'sass-loader'
            }
          ]
        },
        {
          test: /\.(wxss|acss)$/,
          use: [
            PreFileLoader(Target, srcDir, Target.cssName),
            '@ddjf/minprogram-webpack-plugin'
          ]
        },
        {
          test: /\.(wxs|sjs)$/,
          use: [
            PreFileLoader(Target, srcDir, Target.xjsName),
            '@ddjf/minprogram-webpack-plugin',
            'babel-loader'
          ]
        },
        {
          test: /\.json$/,
          type: 'javascript/auto',
          use: PreFileLoader(Target, srcDir)
        },
        {
          test: /\.(axml|wxml)/,
          use: [
            PreFileLoader(Target, srcDir, Target.xmlName),
            '@ddjf/minprogram-webpack-plugin'
          ]
        },
        {
          test: /\.(png|jpg|gif)$/,
          use: PreFileLoader(Target, srcDir)
        }
      ]
    },
    plugins: [
      new EnvironmentPlugin(processEnv),
      new DefinePlugin({
        wx: Target.global,
        my: Target.global,
        dd: Target.global,
        getCurrentPages: 'getCurrentPages'
      }),

      new WXAppWebpackPlugin(),
      new optimize.ModuleConcatenationPlugin(),
      new IgnorePlugin(/vertx/),
      new CopyPlugin(copyPatterns, { context: srcDir }),
    ].filter(Boolean),
    devtool: isDev ? 'source-map' : false,
    resolve: {
      extensions: ['.js', '.vue', '.json'],
      alias:
        {
          '@': resolve('src'),
          'wx': resolve('src/api/wx')
        },
      modules: [resolve(__dirname, 'src'), 'node_modules'],
    },
    watchOptions: {
      ignored: /dist|manifest/,
      aggregateTimeout: 300
    }
  }
}
