## Webpack之Chunk

Chunk MainTemplate, ChunkTemplate，... 解析的主要内容

Chunk 对象内部属性

``` js
{
  /** @type {number | null} */
  id: null
  /** @type {number[] | null} */
  ids: null
  /** @type {number} */
  debugId: debugId++ // 从1000开始加
  /** @type {string} */
  name: name // addEntry name
  /** @type {boolean} */
  preventIntegration: false // 
  /** @type {Module=} */
  entryModule: undefined
  /** @private @type {SortableSet<Module>} */
  _modules: SortableSet // 按照identifier() 排序的Set对象
  /** @type {string?} */
  filenameTemplate: undefined
  /** @private @type {SortableSet<ChunkGroup>} */
  _groups: SortableSet // id 排序的Set对象
  /** @type {string[]} */
  files: []
  /** @type {boolean} */
  rendered: false
  /** @type {string=} */
  hash: undefined
  /** @type {Object} */
  contentHash: null
  /** @type {string=} */
  renderedHash: undefined
  /** @type {string=} */
  chunkReason: undefined
  /** @type {boolean} */
  extraAsync: false
  removedModules: undefined
}
```

Chunk 对象内部方法

```js
/**
 * @returns {boolean} whether or not the Chunk will have a runtime
 */
hasRuntime: Boolean // 依赖_groups判断
/**
 * @returns {boolean} whether or not this chunk can be an initial chunk
 */
canBeInitial: boolean // 依赖_groups判断
/**
 * @returns {boolean} whether this chunk can only be an initial chunk
 */
isOnlyInitial: boolean // 依赖_groups判断
/**
 * @returns {boolean} if this chunk contains the entry module
 */
hasEntryModule: boolean // 依赖entryModule判断
/**
 * @param {Module} module the module that will be added to this chunk.
 * @returns {boolean} returns true if the chunk doesn't have the module and it was added
 */
addModule: boolean // 依赖_modules判断
/**
 * @param {Module} module the module that will be removed from this chunk
 * @returns {boolean} returns true if chunk exists and is successfully deleted
 */
removeModule: boolean // 依赖_modules判断
/**
 * @param {Module[]} modules the new modules to be set
 * @returns {void} set new modules to this chunk and return nothing
 */
setModules: boolean // 依赖_modules 重新设置_modules
/**
 * @returns {number} the amount of modules in chunk
 */
getNumberOfModules: number // 获取_modules的长度
/**
 * @returns {SortableSet} return the modules SortableSet for this chunk
 */
modulesIterable: get // 获取_modules这个迭代器
containsModule: boolean > module // _modules是否包含module
getModules: [] // 将_modules转换成数组返回，并在SortableSet中对转换数据缓存
getModulesIdent: String // 将_modules的identifier值用#链接成字符串 并缓存
/**
 * @param {ChunkGroup} chunkGroup the chunkGroup the chunk is being added
 * @returns {boolean} returns true if chunk is not apart of chunkGroup and is added successfully
 */
addGroup: Boolean // 添加chunkGroup到_groups 有添加则返回true, 存在不需要添加则返回false
removeGroup: Boolean > chunkGroup // 从_groups删除chunkGroup, 存在删除返回true，否则false
isInGroup: Boolean > chunkGroup // _groups是否存在chunkGroup
getNumberOfGroups: Number // 获取_groups的长度
groupsIterable: get // 返回_groups
compareTo: Number > otherChunk // 用当前otherChunk和this比较，返回一个顺序，-1 表示 otherChunk在后面，0 相同 1 在前面。主要比较name和数组的identifier
```


