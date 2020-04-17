# define-config-plugin

> 使用插件后,会将项目下的 config 文件,动态注入到项目中.并生成相应到 type 文件 语法提示

## 安装

```bash
npm i --save-dev @fe/define-config-plugin
```

```bash
yarn add -dev @fe/define-config-plugin
```

## 使用

> 注意: config 配置文件 需要用 es 模块化导出

所需阐述:

| 参数名称 | 类型   | 收否必传 | 默认值                              |
| -------- | ------ | -------- | ----------------------------------- |
| path     | string | 否       | path.join(\_\_dirname, './config/') |
| env      | string | 是       | 无                                  |
| key      | string | 否       | "G_CONFIG"                          |

webpack.config.js

```ts
module.exports = {
  mode: 'production',
  entry: ******,
  output: ******,,
  module: {
    ...
  },
  plugins: [
    new DefineConfigPlugin({
      env: 'production',
    }),
    ...
  ],
}

```

对应项目目录

![图片](http://img.crofys.cn/Jietu20200417-104446.jpg)
