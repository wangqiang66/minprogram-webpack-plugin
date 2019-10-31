## Webpack内部插件

### 处理Target的插件target

主要处理mainTemplate,chunkTemplate、hotUpdateChunkTemplate相关的依赖拼接

#### JsonpTemplatePlugin

- 依赖JsonpMainTemplatePlugin、JsonpChunkTemplatePlugin、JsonpHotUpdateChunkTemplatePlugin

  在 compiler.hooks.thisCompilation中触发

##### JsonpMainTemplatePlugin

1. 定义mainTemplate的jsonpScript、linkPreload、linkPrefetch为瀑布式hooks
2. 处理chunk模块，将js/css加载到html中，根据是否当前加载定义preload
   prefetch
   
##### JsonpChunkTemplatePlugin

通过ConcatSource拼接source资源，处理chunkTemplate加载

##### JsonpHotUpdateChunkTemplatePlugin

通过ConcatSource拼接source资源，处理hotUpdateChunkTemplate加载
   

#### FetchCompileWasmTemplatePlugin

- 依赖WasmMainTemplatePlugin

  在 compiler.hooks.thisCompilation中触发。通过fetch加载chunk
  
##### WasmMainTemplatePlugin

处理mainTemplate的chunk拼接


#### FunctionModulePlugin

- 依赖FunctionModuleTemplatePlugin

  在 compiler.hooks.thisCompilation中触发
  
##### FunctionModuleTemplatePlugin

处理moduleTemplate的chunk拼接

#### NodeSourcePlugin

处理alias 对应的变量或者一些global变量

#### LoaderTargetPlugin

将target复制到loaderContext中

#### WebWorkerTemplatePlugin

通过webworker的方式处理mainTemplate、chunkTemplate、hotUpdateChunkTemplate


#### NodeTemplatePlugin

- 依赖NodeMainTemplatePlugin、NodeChunkTemplatePlugin、NodeHotUpdateChunkTemplatePlugin

  以Node的方式通过ConcatSource拼接mainTemplate、chunkTemplate、hotUpdateChunkTemplate的依赖

#### ReadFileCompileWasmTemplatePlugin

  通过fs的方式获取依赖的文件
  
#### ExternalsPlugin

  排除对应的依赖


### output

#### LibraryTemplatePlugin

  输出文件的的输出方式，以及对应的输出值对应的变量


#### JavascriptModulesPlugin

  处理javascript文件
  
#### JsonModulesPlugin

  处理json文件

#### EntryOptionPlugin

- 依赖EntryOptionPlugin、SingleEntryPlugin、MultiEntryPlugin
 
   处理入口文件
   
   
#### CompatibilityPlugin


#### HarmonyModulesPlugin


#### AMDPlugin


#### RequireJsStuffPlugin
