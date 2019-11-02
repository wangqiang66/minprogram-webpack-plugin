// import StylelintPlugin from 'stylelint-webpack-plugin';
// import CopyPlugin from 'copy-webpack-plugin';
const { resolve, extname } = require('path')
const { DefinePlugin, EnvironmentPlugin, IgnorePlugin, optimize } = require('webpack')
const pkg = require('./package.json')
const CopyPlugin = require('copy-webpack-plugin')
const { default: WXAppWebpackPlugin, Targets } = require('@ddjf/minprogram-webpack-plugin')
const srcDir = resolve('src');
const processEnv = require(`./config/${process.env.NODE_MODE || 'dev'}.env`)
const shouldLint = !!processEnv.LINT && processEnv.LINT !== 'false';
const isDev = processEnv.NODE_ENV !== 'production';

const copyPatterns = []
  .concat(pkg.copyWebpack || [])
  .map((pattern) => {
    return typeof pattern === 'string' ? { from: pattern, to: pattern } : pattern
  });

const createLintingRule = () => ({
  test: /\.(js|wxs)$/,
  loader: 'eslint-loader',
  enforce: 'pre',
  include: [resolve('src'), resolve('test')],
  options: {
    formatter: require('eslint-friendly-formatter'),
  }
})

module.exports = (env = {}) => {
  const min = env.min;
  const Target = Targets[env.target]

  const relativeFileLoader = (ext = '[ext]') => {
    const namePrefix = '[path]'
    return {
      loader: 'file-loader',
      options: {
        useRelativePath: false,
        name: `${namePrefix}[name].${ext}`,
        context: srcDir,
        outputPath(path, resourcePath, context) {
          if (/node_modules/.test(path)) {
            return `node_modules${path.split('node_modules')[1]}`
          }
          console.log(path, resourcePath, context)
          return path
        }
      }
    }
  }

  return {
    mode: 'development',
    entry: {
      app: './src/app.js'
    },
    output: {
      filename: '[name].js',
      publicPath: '/',
      libraryTarget: 'var',
      globalObject: 'dd',
      path: resolve('dist'),
    },
    optimization: {
      minimize: false,
      splitChunks: {
        cacheGroups: {
          common: {
            name: "common",
            chunks: (chunk) => {
              const ext = extname(chunk.entryModule.resource || '')
              return ext === '.js'
            },
            minSize: 1,
            priority: 0
          }
        }
      }
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
            relativeFileLoader(Target.cssName),
            'postcss-loader',
            {
              loader: 'sass-loader'
            }
          ]
        },
        {
          test: /\.json$/,
          type: 'javascript/auto',
          use: relativeFileLoader()
        },
        {
          test: /\.(axml|wxml)/,
          use: relativeFileLoader()
        },
        {
          test: /\.(png|jpg|gif)$/,
          use: relativeFileLoader()
        }
      ]
    },
    plugins: [
      new EnvironmentPlugin(processEnv),
      new DefinePlugin({
        __DEV__: isDev,
        __WECHAT__: Target.name === Targets.Wechat.name,
        __ALIPAY__: Target.name === Targets.Alipay.name,
        wx: Target.global,
        my: Target.global,
        dd: Target.global,
        getCurrentPages: 'getCurrentPages'
      }),

      new WXAppWebpackPlugin({
        clear: !isDev,
        node_modules: '../node_modules'
      }),
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
