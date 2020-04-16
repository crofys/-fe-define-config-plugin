import fs, { WriteFileOptions } from 'fs'
import { isRegExp } from './tool'
import { join } from 'path'

export const readFileNames = (reg: RegExp | string, path: string): string[] => {
  try {
    const _regExp = isRegExp(reg) ? reg : new RegExp(reg)

    return fs
      .readdirSync(path)
      .filter((file: string) => _regExp.test(file))
      .map((file) => join(path, file))
  } catch (error) {
    console.log('读取文件失败:', path)
  }
  return []
}

export const writeFileSync = (
  path: string,
  data: any,
  options?: WriteFileOptions
) => {
  try {
    fs.writeFileSync(path, data, options)
  } catch (error) {
    console.log('读取文件失败:', path)
  }
}
