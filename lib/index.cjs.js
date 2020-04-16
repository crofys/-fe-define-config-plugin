/*!
 * define-config-plugin v0.1.0
 * (c) 2020-2020 Russell
 * https://github.com/any86/any-touch
 * Released under the MIT License.
 */
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

function _interopNamespace(e) {
  if (e && e.__esModule) { return e; } else {
    var n = {};
    if (e) {
      Object.keys(e).forEach(function (k) {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () {
            return e[k];
          }
        });
      });
    }
    n['default'] = e;
    return n;
  }
}

var webpack = _interopDefault(require('webpack'));
var path = require('path');
var fs = _interopDefault(require('fs'));

const createJudgeTypesFactory = (type) => (o) => o && Object.prototype.toString.call(o) === `[object ${type}]`;
const isRegExp = createJudgeTypesFactory('RegExp');

const readFileNames = (reg, path$1) => {
    try {
        const _regExp = isRegExp(reg) ? reg : new RegExp(reg);
        return fs
            .readdirSync(path$1)
            .filter((file) => _regExp.test(file))
            .map((file) => path.join(path$1, file));
    }
    catch (error) {
        console.log('读取文件失败:', path$1);
    }
    return [];
};
const writeFileSync = (path, data, options) => {
    try {
        fs.writeFileSync(path, data, options);
    }
    catch (error) {
        console.log('读取文件失败:', path);
    }
};

const pluginName = 'DefineConfigPlugin';
const DefinePlugin = webpack.DefinePlugin;
class DefineConfigPlugin {
    constructor(opts) {
        this.__PATH__ = opts.path || path.join(process.cwd(), './config/');
        this.__ENV__ = opts.env;
        this.__KEY__ = opts.key || 'G_CONFIG';
    }
    apply(compiler) {
        compiler.hooks.run.tapPromise(pluginName, async (compiler) => {
            await this.init(compiler);
        });
    }
    async init(compiler) {
        const { __KEY__ } = this;
        const data = await this.readConfigFile();
        console.log(data, '===data');
        this.handleGenerateFiles(data);
        new DefinePlugin({ [__KEY__]: JSON.stringify(data) }).apply(compiler);
    }
    handleGenerateFiles(data) {
        const generateFiles = [
            {
                name: __dirname + '/config.ts',
                template: 'export default {{json}}'.replace(/\{\{json\}\}/g, JSON.stringify(data, null, 2)),
            },
            {
                name: __dirname + '/global.d.ts',
                template: "import config from './config'\ndeclare global {\n  const G_CONFIG: typeof config\n}\nexport {}",
            },
        ];
        for (const { name, template } of generateFiles) {
            writeFileSync(name, template);
        }
    }
    async readConfigFile() {
        const { __PATH__, __ENV__ } = this;
        const files = {
            default: {
                regExp: `config\.?(default).?(ts|js)`,
                value: {},
            },
            [__ENV__]: {
                regExp: `config\.?(${__ENV__}).?(ts|js)`,
                value: {},
            },
        };
        for (const key in files) {
            const [fileName] = readFileNames(files[key].regExp, __PATH__);
            if (fileName) {
                const temp = (await new Promise(function (resolve) { resolve(_interopNamespace(require(fileName))); })) || { default: {} };
                files[key]['value'] = temp.default;
            }
        }
        return Object.assign({}, files.default.value, files[__ENV__]['value']);
    }
}
module.exports = DefineConfigPlugin;
