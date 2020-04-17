import webpack from 'webpack'
import { join } from 'path'
import { readFileNames, writeFileSync } from './utils/fs'

const pluginName = 'DefineConfigPlugin'
const DefinePlugin = webpack.DefinePlugin

interface IDefineConfigOpts {
  path: string
  env: string
  key: string
}

class DefineConfigPlugin {
  private __PATH__: string
  private __ENV__: string
  private __KEY__: string

  constructor(opts: IDefineConfigOpts) {
    this.__PATH__ = opts.path || join(process.cwd(), './config/')
    this.__ENV__ = opts.env
    this.__KEY__ = opts.key || 'G_CONFIG'
  }

  apply(compiler: webpack.Compiler) {
    compiler.hooks.run.tapPromise(pluginName, async (compiler) => {
      await this.init(compiler)
    })
  }
  /**
   * @description 初始化方法
   * @private
   * @param {webpack.Compiler} compiler
   * @memberof DefineConfigPlugin
   */
  private async init(compiler: webpack.Compiler) {
    const { __KEY__ }: any = this
    const data: Object = await this.readConfigFile()

    this.handleGenerateFiles(data)

    new DefinePlugin({ [__KEY__]: JSON.stringify(data) }).apply(compiler)
  }
  /**
   * @description 生成 global.d.ts 和 config.ts
   * @private
   * @param {*} data
   * @memberof DefineConfigPlugin
   */
  private handleGenerateFiles(data: any) {
    const generateFiles = [
      {
        name: __dirname + '/config.ts',
        template: 'export default {{json}}'.replace(
          /\{\{json\}\}/g,
          JSON.stringify(data, null, 2)
        ),
      },
      {
        name: __dirname + '/global.d.ts',
        template:
          "import config from './config'\ndeclare global {\n  const G_CONFIG: typeof config\n}\nexport {}",
      },
    ]
    //
    for (const { name, template } of generateFiles) {
      writeFileSync(name, template)
    }
  }

  /**
   * @description 读取项目配置文件
   * @private
   * @returns Promise<Object>
   * @memberof DefineConfigPlugin
   */
  private async readConfigFile(): Promise<Object> {
    const { __PATH__, __ENV__ } = this
    const files = {
      default: {
        regExp: `config\.?(default).?(ts|js)`,
        value: {},
      },
      [__ENV__]: {
        regExp: `config\.?(${__ENV__}).?(ts|js)`,
        value: {},
      },
    }
    for (const key in files) {
      const [fileName] = readFileNames(files[key].regExp, __PATH__)
      if (fileName) {
        const temp = (await import(fileName)) || { default: {} }
        files[key]['value'] = temp.default
      }
    }

    return Object.assign({}, files.default.value, files[__ENV__]['value'])
  }
}

module.exports = DefineConfigPlugin
