
## 打包安装

1、npm install 安装依赖，如果装了淘宝镜像的cnpm，建议用cnpm install，安装会特别快

```
//安装淘宝镜像
$ npm install -g cnpm --registry=https://registry.npm.taobao.org
<img src='./clip/737E1D1A-4F4F-4323-9710-3C3529120E53.png'>
//安装依赖，相当于npm install,但是cnpm install快很多
cnpm install

```


2、npm run start 开发调试

3、npm run build:sit 打包发布SIT版本，发布的文件夹是dist，打包好的文件都在这文件夹里面。

npm run build:prod 打包发布生产版本，发布的文件夹是dist，打包好的文件都在这文件夹里面。


小程序开发可能存在的问题和解决方案

1. app.js 和 page.js 之间没有依赖
- 问题描述：<br/>
   app.js onLaunch 存在异步方法：比如请求用户信息。只是page的onLoad会先于这个异步方法而执行。不能等待这个返回后在执行
- 解决方案：<br/>
   1. 通过redux方式进行处理。两层之间不要有依赖，所有的依赖通过redux执行传递
   2. 通过注册的方式进行处理。在onLoad的时候发现数据没有返回进行将返回后需要处理的事件挂载到回掉函数里面。遇到依赖比较多的可能处理比较麻烦
2. redux更新触发多个页面更新
- 问题描述：<br/>
   跳转的时候小程序的页面其实没有关闭，也就是没有走到onUnload 走到方法，页面注册的redux没有销毁，这是redux修改的时候，页面还是会进行修改 
- 解决方案：<br/> 
   可以在onHide的时候卸载redux，在onShow的时候在进行注册 （但是这种方式好不好需要自己在验证）
3. webpack4 file-loader Json问题
- 问题描述：<br/>
  增加了JSON的处理，所以使用file-loader处理json的时候在经过webpack的JsonParser会报错。
- 解决方案：<br/>
  对于file-loader处理过的Json不经过JsonParser处理就行了。file-loader
  issue 推荐的方案是加type: "javascript:auto"
