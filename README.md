# minprogram-webpack-plugin

小程序基于Webpack打包的解决方案

## 解决问题
1. 小程序的路径引入问题 
2. 代码混淆，按需打包代码
3. 一些不兼容的语法 
4. 小程序之间的转换
5. 增加环境变量的支持
6. 不同环境服务器的配置不用手动修改

## 设计思路

- Webpack是入口出口的一个处理流程，针对的是入口文件的依赖，递归引入文件，这种依赖的关键是require，import。

- 小程序运行基于文件和JSON的配置，显然和Webpack的处理方式有点格格不入。所幸，Webpack有多入口的打包形式，因
  而通过多入口的形式还是可以实现Webpack的打包
 
1. 找到小程序所有的入口 <br /> 
    
   - 页面入口：App.json中的page，subpackages
   - 组件入口：Page.json, Component.json 中的usingComponents
   - 其他入口：App.json中的tabBar的图片 wxml中的wxs文件
     wxss中引入的wxss文件
   
2. 文件处理
    
   - wxml 转换对应的语法，可以打包成其他的小程序
   - wxss 可以不用转换，也可以在loader中处理对应引入的文件
   
## 使用说明
具体的可以看demo

1. 引入包"@ddjf/minprogram-webpack-plugin"

2. 配置webpack.config.js

```js
const { resolve } = require('path')
const { DefinePlugin } = require('webpack')
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
      new DefinePlugin({
        wx: Target.global,
        my: Target.global,
        dd: Target.global,
        getCurrentPages: 'getCurrentPages'
      }),
      new WXAppWebpackPlugin(),
      new CopyPlugin(copyPatterns, { context: srcDir }),
    ].filter(Boolean)
  }
}
```
3. 构建script命令

## 建议

   如果非必要，建议使用scss或者sass等处理样式。对应对应的loader就可以了
   
## 小程序开发可能存在的问题和解决方案
1. webpack4 file-loader 处理Json问题
- 问题描述：<br/>
  webpack4增加了JSON的处理，所以使用file-loader处理json的时候在经过webpack的JsonParser会报错。
- 解决方案：<br/>
  对于file-loader处理过的Json不经过JsonParser处理就行了。file-loader
  issue 推荐的方案是加type: "javascript:auto"

   
   
   
