## Webpack之Compiler

Compiler 对象内部属性

```js
  // hooks Tapable Hooks相关的对象
  hooks: {
    environment: [SyncHook] // 处理完Compiler初始化立即执行 Webpack5 抛弃
    afterEnvironment: [SyncHook] // 跟随environment后执行 Webpack5 抛弃
    entryOption: [SyncBailHook]["context", "entry"] // 初始化完EntryOptionPlugin后触发 Webpack5 抛弃
    afterPlugins: SyncHook['compiler']  // 初始化完Webpack内部插件后触发 Webpack5 抛弃
    afterResolvers: SyncHook['compiler']  // 初始化完Compiler.resolverFactory后触发 Webpack5 抛弃
    beforeRun: AsyncSeriesHook['compiler'] // Compiler中执行run的时候触发
    run: AsyncSeriesHook['compiler'] // 作为beforeRun的回掉函数触发
    normalModuleFactory: SyncHook["normalModuleFactory"] // 在Compiler compile函数中newCompilationParams中触发
    contextModuleFactory: SyncHook["contextModulefactory"] // 在Compiler compile函数中newCompilationParams中触发
    beforeCompile: AsyncSeriesHook[newCompilationParams] // 获取完参数后触发
    compile: SyncHook["newCompilationParams"] // 作为beforeCompile的回掉函数触发
    thisCompilation: SyncHook["compilation", "newCompilationParams"] // 在compile函数创建compilation对象初始化完触发
    compilation: SyncHook["compilation", "newCompilationParams"] // 在compile函数创建compilation对象初始化完触发
    make: AsyncParallelHook["compilation"] // 完整一些compilation初始化后触发
    afterCompile: AsyncSeriesHook["compilation"] // compilation.seal 回掉触发
    shouldEmit: SyncBailHook(["compilation"]) // compile函数回掉中触发
    emit: AsyncSeriesHook(["compilation"]) // emitAssets 中触发
    assetEmitted: AsyncSeriesHook(["file", "content"]) // 文件输出时触发
    infrastructurelog|infrastructureLog: SyncBailHook(["origin", "type", "args"]) // 日志 Webpack5 删除
    afterEmit: AsyncSeriesHook(["compilation"]) // 文件输出完触发 作为asyncLib.forEachLimit的第四个参数
    done: AsyncSeriesHook(["stats"])
  }

```
