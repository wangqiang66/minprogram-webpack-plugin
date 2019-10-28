## Webpack内部插件

### 处理Target的插件target

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
