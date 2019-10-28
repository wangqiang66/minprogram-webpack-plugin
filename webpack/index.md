## Webpack 源码解析

### Webpack

1. validateSchema对options参数进行检查
2. 判断options的类型，如果是数组，则递归Webpack
3. WebpackOptionsDefaulter处理options
4. 创建Compiler实例，参数options.context
5. 将options放到compiler实例中。compiler.options = options
6. 处理环境NodeEnvironmentPlugin
7. 初始化options的
8. 触发plugin.hooks.environment
9. 触发plugin.hooks.afterEnvironment
10. 使用WebpackOptionsApply更新compiler.options
11. 如果存在watch 则监听
12. 导出一些Plugin

- 参数是options
    
- 返回 compiler对象

### MultiCompiler

- 依赖MultiWatching、MultiStats、ConcurrentCompilationError 继承tapable

  主要就是处理webpack打包options数组的结束的处理工作

- 参数是Webpack返回的compiler对象数组
    
- 返回 compiler对象

### 处理环境NodeEnvironmentPlugin

- 依赖Node相关的内容

  用于输入日志

### Options检查处理

#### validateSchema 

- 依赖 schema相关的文件和ajv，ajv-keywords

  主要是对配置文件的属性检测。其中schema中的WebpackOptions.json
  就是属性类型的一个数据检测指标

- 参数是WebpackOptions.json, options
    
- 返回一个错误数组

#### WebpackOptionsValidationError

- 继承WebpackError

  显示错误信息
  
- 参数是validateSchema的错误数组
    
- 返回 WebpackOptionsValidationError对象

### options属性处理

#### WebpackOptionsDefaulter

- 依赖Template继承OptionsDefaulter

1. 构造函数 设置options的默认值
2. process
   OptionsDefaulter的process方法，对options没有的只，用默认值填充

  主要是处理options，对没有的值用默认值填充
  
- 参数是options
    
- 返回填充后的options

#### OptionsDefaulter

  将一些默认值设置到对应的options中，包含4中处理方式
  
1. 基本的继承方式
2. call 方法（value, options）做一些特殊处理
3. make 方法 options 做一些特殊处理
4. append 将默认值加到当前数据的后面，值是一个数组
     

#### WebpackOptionsApply

- 依赖比较多继承OptionsApply

  Webpack比较核心的部分

1. 设置compiler的outputPath 和 record以及依赖
2. 处理target：方法或者字符串
   - 方法则表示自己处理target
   - 字符串则系统处理
   - web:
     则调用JsonpTemplatePlugin、FetchCompileWasmTemplatePlugin、FunctionModulePlugin、NodeSourcePlugin、LoaderTargetPlugin
   - webworker
     则调用WebWorkerTemplatePlugin、FetchCompileWasmTemplatePlugin、FunctionModulePlugin、NodeSourcePlugin、LoaderTargetPlugin
   - node
     则调用NodeTemplatePlugin、ReadFileCompileWasmTemplatePlugin、FunctionModulePlugin、NodeTargetPlugin、LoaderTargetPlugin
   - async-node
     则调用NodeTemplatePlugin、ReadFileCompileWasmTemplatePlugin、FunctionModulePlugin、NodeTargetPlugin、LoaderTargetPlugin
   - node-webkit
     则调用JsonpTemplatePlugin、FunctionModulePlugin、NodeTargetPlugin、ExternalsPlugin、LoaderTargetPlugin
   - electron-main
     则调用NodeTemplatePlugin、FunctionModulePlugin、NodeTargetPlugin、ExternalsPlugin、LoaderTargetPlugin
   - electron-renderer
     则调用JsonpTemplatePlugin、FetchCompileWasmTemplatePlugin、FunctionModulePlugin、NodeTargetPlugin、ExternalsPlugin、LoaderTargetPlugin
   - electron-preload
     则调用NodeTemplatePlugin、FetchCompileWasmTemplatePlugin、FunctionModulePlugin、NodeTargetPlugin、ExternalsPlugin、LoaderTargetPlugin
3. 处理output options.output.library || options.output.libraryTarget !==
   "var" 则调用LibraryTemplatePlugin
4. externals存在怎调用ExternalsPlugin
5. 处理devtool
6. JavascriptModulesPlugin
7. JsonModulesPlugin
8. WebAssemblyModulesPlugin
9. EntryOptionPlugin
10. CompatibilityPlugin
11. HarmonyModulesPlugin
12. CommonJsPlugin
13. LoaderPlugin
14. options.node !== false 则调用NodeStuffPlugin
15. CommonJsStuffPlugin
16. APIPlugin
17. ConstPlugin
18. UseStrictPlugin
19. RequireIncludePlugin
20. RequireEnsurePlugin
21. RequireContextPlugin
22. ImportPlugin
23. SystemPlugin
24. options.mode !== "string" 则调用WarnNoModeSetPlugin
25. EnsureChunkConditionsPlugin
26. 如果optimization.removeAvailableModules存在则调用RemoveParentModulesPlugin
27. 如果optimization.removeEmptyChunks存在则调用RemoveEmptyChunksPlugin
28. 如果optimization.mergeDuplicateChunks存在则调用MergeDuplicateChunksPlugin
29. 如果optimization.flagIncludedChunks存在则调用FlagIncludedChunksPlugin
30. 如果optimization.sideEffects存在则调用SideEffectsFlagPlugin
31. 如果optimization.providedExports存在则调用FlagDependencyExportsPlugin
32. 如果optimization.usedExports存在则调用FlagDependencyUsagePlugin
33. 如果optimization.concatenateModules存在则调用ModuleConcatenationPlugin
34. 如果optimization.splitChunks存在则调用SplitChunksPlugin
35. 如果optimization.runtimeChunk存在则调用RuntimeChunkPlugin
36. 如果optimization.noEmitOnErrors存在则调用NoEmitOnErrorsPlugin
37. 如果optimization.checkWasmTypes存在则调用WasmFinalizeExportsPlugin
38. 处理options.optimization.moduleIds。通过moduleIds加载不同的Plugin
    - natural 不加载Plugin
    - named 加载NamedModulesPlugin
    - hashed 加载HashedModuleIdsPlugin
    - size 加载OccurrenceModuleOrderPlugin
    - total-size 加载OccurrenceModuleOrderPlugin
39. 处理options。optimization.chunkIds。通过moduleIds加载不同的Plugin
    - natural 加载NaturalChunkOrderPlugin
    - named 加载OccurrenceChunkOrderPlugin、NamedModulesPlugin
    - size 加载OccurrenceChunkOrderPlugin
    - total-size 加载OccurrenceChunkOrderPlugin
40. 如果optimization.nodeEnv存在则调用DefinePlugin
41. 如果optimization.minimize存在则处理options.optimization.minimizer。对应的方法
42. 如果performance存在则调用SizeLimitsPlugin
43. TemplatedPathPlugin
44. RecordIdsPlugin
45. WarnCaseSensitiveModulesPlugin
46. 如果cache存在则调用CachePlugin
47. 触发hooks afterPlugins
48. 处理对normal、context、loader监听
49. 触发hooks afterResolvers


#### OptionsApply

  没有做什么处理，只写了一个process的空函数
