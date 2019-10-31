## Webpack之Compilation

在 Compiler compile的时候进行创建 出发的事件也都是在make的时候进行触发


Compilation 对象内部属性

```js
  // hooks Tapable Hooks相关的对象
  hooks: {
    addEntry: SyncHook(["entry", "name"]) // Compilation.addEntry时触发
    buildModule: SyncHook(["module"]) // buildModule中触发，构建module
    succeedModule: SyncHook(["module"]) // buildModule完成后触发，成功或者失败
    failedModule: SyncHook(["module", "error"])  // buildModule完成后触发，成功或者失败
    rebuildModule: SyncHook(["module"])  // rebuildModule中触发 不过没有看到有调用
    normalModuleLoader: SyncHook(["loaderContext", "module"]) // NormalModule中createLoaderContext触发
    failedEntry: SyncHook(["entry", "name", "error"]) // _addModuleChain的回掉触发
    succeedEntry: SyncHook(["entry", "name", "module"]) // _addModuleChain的回掉触发
    finishModules: AsyncSeriesHook(["modules"]) // 在Compiler make完成后回掉触发
    seal: SyncHook([]) // finishModules完成后调用seal方法触发
    optimizeDependenciesBasic: SyncBailHook(["modules"]) // seal中作为判断条件处理
    optimizeDependencies: SyncBailHook(["modules"]) // seal中作为判断条件处理
    optimizeDependenciesAdvanced: SyncBailHook(["modules"]) // seal中作为判断条件处理
    afterOptimizeDependencies: SyncHook(["modules"]) // seal中作为判断条件处理
    beforeChunks: SyncHook([]) // seal中
    dependencyReference: SyncWaterfallHook(["dependencyReference", "dependency", "module"])  // getDependencyReference中触发
    // seal 紧随着触发
    afterChunks: SyncHook(["chunks"])
    optimize: SyncHook([])
    optimizeModulesBasic: SyncBailHook(["modules"])
    optimizeModules: SyncBailHook(["modules"])
    optimizeModulesAdvanced: SyncBailHook(["modules"])
    afterOptimizeModules: SyncHook(["modules"])
    optimizeChunksBasic: SyncBailHook(["chunks", "chunkGroups"])
    optimizeChunks: SyncBailHook(["chunks", "chunkGroups"])
    optimizeChunksAdvanced: SyncBailHook(["chunks", "chunkGroups"])
    afterOptimizeChunks: SyncHook(["chunks", "chunkGroups"])
    optimizeTree: AsyncSeriesHook(["chunks", "modules"])
    afterOptimizeTree: SyncHook(["chunks", "modules"])
    optimizeChunkModulesBasic: SyncBailHook(["chunks", "chunkGroups"])
    optimizeChunkModules: SyncBailHook(["chunks", "chunkGroups"])
    optimizeChunkModulesAdvanced: SyncBailHook(["chunks", "chunkGroups"])
    afterOptimizeChunkModules: SyncHook(["chunks", "chunkGroups"])
    shouldRecord: SyncBailHook([])
    reviveModules: SyncHook(["modules", "records"])
    optimizeModuleOrder: SyncHook(["modules"])
    advancedOptimizeModuleOrder: SyncHook(["modules"])
    beforeModuleIds: SyncHook(["modules"])
    moduleIds: SyncHook(["modules"])
    optimizeModuleIds: SyncHook(["modules"])
    afterOptimizeModuleIds: SyncHook(["modules"])
    reviveChunks: SyncHook(["chunks", "records"])
    optimizeChunkOrder: SyncHook(["chunks"])
    beforeChunkIds: SyncHook(["chunks"])
    optimizeChunkIds: SyncHook(["chunks"])
    afterOptimizeChunkIds: SyncHook(["chunks"])
    recordModules: SyncHook(["modules", "records"])
    recordChunks: SyncHook(["modules", "records"])
    beforeHash: SyncHook([])
    contentHash: SyncHook(["chunk"])
    chunkHash: SyncHook(["chunk", "chunkHash"])
    afterHash: SyncHook([])
    recordHash: SyncHook([])
    beforeModuleAssets: SyncHook([])
    moduleAsset: SyncHook(["module", "filename"])
    assetPath: SyncWaterfallHook(["filename", "data"])
    shouldGenerateChunkAssets: SyncBailHook([])
    beforeChunkAssets: SyncHook([])
    chunkAsset: SyncHook(["chunk", "filename"])
    additionalChunkAssets: SyncHook(["chunks"])
    record: SyncHook(["compilation", "records"])
    additionalAssets: AsyncSeriesHook([])
    optimizeChunkAssets: AsyncSeriesHook(["chunks"])
    afterOptimizeChunkAssets: SyncHook(["chunks"])
    optimizeAssets: AsyncSeriesHook(["assets"])
    afterOptimizeAssets: SyncHook(["assets"])
    needAdditionalSeal: SyncBailHook([])
    unseal: SyncHook([])
    afterSeal: AsyncSeriesHook([])
    needAdditionalPass: SyncHook(["assets"])
    log: SyncBailHook(["origin", "logEntry"])// buildChunkGraph中调用getLogger触发
  },
  name: undefined // 名称
  compiler: Compiler // Compiler对象
  resolverFactory: compiler.resolverFactory // ResolverFactory对象
  inputFileSystem: compiler.inputFileSystem // Node环境中为CachedInputFileSystem
  requestShortener: compiler.requestShortener // RequestShortener对象
  
  options: compiler.options
  outputOptions: options.output
 
  profile: options.profile// Webpack options 对应的profile 捕获一个应用程序"配置文件"，包括统计和提示，然后可以使用 Analyze 分析工具进行详细分析。
  bail: options.profile // 在第一个错误出现时抛出失败结果，而不是容忍它 默认情况下，当使用 HMR 时，webpack 会将在终端以及浏览器控制台中，以红色文字记录这些错误，但仍然继续进行打包。要启用它 bail: true 这将迫使 webpack 退出其打包过程
  performance: options.performance
  
  mainTemplate: MainTemplate // MainTemplate 对象 参数outputOptions
  chunkTemplate: ChunkTemplate // ChunkTemplate 对象 参数outputOptions
  hotUpdateChunkTemplate: HotUpdateChunkTemplate // HotUpdateChunkTemplate 对象 参数outputOptions
  runtimeTemplate: RuntimeTemplate // RuntimeTemplate 对象 参数outputOptions, requestShortener

  moduleTemplates: {
    javascript: ModuleTemplate // ModuleTemplate对象 参数 runtimeTemplate, 'javascript'
    webassembly: ModuleTemplate // ModuleTemplate对象 参数 runtimeTemplate, 'webassembly'
  }
  
  semaphore: Semaphore // Semaphore对象 参数options.parallelism || 100 Modules的并行线程数

  dependencyFactories: Map // 在EntryPlugin hooks.compilation的时候将对应的入口放进去的
  entries: [] // 存放入口Module 
   /** @private @type {{name: string, request: string, module: Module}[]} */
  _preparedEntrypoints: []
```

semaphore.acquire 保证函数的顺序的，队列存放回掉
