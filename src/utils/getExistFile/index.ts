import { existsSync } from 'fs'
import { resolve } from 'path'
import { emoticons } from '../../index'

type Options = {
    cwd: string,
    files: string[]
}

/**
 * @title  获取配置文件
 * @description  当未设置 configFilePath 时，默认读取 .deployrc.js 文件
 */
export const getExistFile = ({ cwd, files }: Options) => {
    for (let file of files) {
        const filePath = resolve(cwd, file)
        if (!existsSync(filePath)) {
            throw new Error(`找不到配置文件 ${filePath} ${emoticons.fail_3}`)
        }
        return filePath
    }
}