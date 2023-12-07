import { existsSync } from 'fs'
import { isAbsolute, resolve } from 'path'
import { getExistFile } from '../getExistFile';

import type { UserConfig } from '../../types';
import { emoticons } from '../../index';

/** 具体的配置文件 */
const CONFIG_FILES = ['.deployrc.js'];

type Options = {
    cwd: string,
    configFilePath?: string
}

/** 获取用户配置信息 */
export const getUserConfig = (options: Options): UserConfig => {
    const { cwd, configFilePath } = options

    let filePath = ''

    if (configFilePath) {
        filePath = isAbsolute(configFilePath) ? configFilePath : resolve(cwd, configFilePath)
        if (!existsSync(filePath)) {
            throw new Error(`找不到配置文件：${configFilePath} ${emoticons.fail_3}`)
        }
    }

    const configFile = filePath || getExistFile({ cwd, files: CONFIG_FILES })
    if (!existsSync(configFile)) {
        throw new Error(`找不到配置文件 ${emoticons.fail_3}`)
    }
    const userConfig = require(configFile)

    return userConfig
}