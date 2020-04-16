/*!
 * define-config-plugin v0.1.0
 * (c) 2020-2020 Russell
 * https://github.com/any86/any-touch
 * Released under the MIT License.
 */
import webpack from 'webpack';
import { join } from 'path';
import fs from 'fs';

const createJudgeTypesFactory = (type) => (o) => o && Object.prototype.toString.call(o) === `[object ${type}]`;
const isRegExp = createJudgeTypesFactory('RegExp');

const readFileNames = (reg, path) => {
    try {
        const _regExp = isRegExp(reg) ? reg : new RegExp(reg);
        return fs
            .readdirSync(path)
            .filter((file) => _regExp.test(file))
            .map((file) => join(path, file));
    }
    catch (error) {
        console.log('读取文件失败:', path);
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
        this.__PATH__ = opts.path || join(process.cwd(), './config/');
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
                const temp = (await import(fileName)) || { default: {} };
                files[key]['value'] = temp.default;
            }
        }
        return Object.assign({}, files.default.value, files[__ENV__]['value']);
    }
}
module.exports = DefineConfigPlugin;
