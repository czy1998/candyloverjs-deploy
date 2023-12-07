import { spinnerlog } from "../log";
import { getUserConfig } from "./getUserConfig";
import { emoticons } from "../../index";
import { validateConfig } from "../validate";
import { homedir } from 'os'

import type { DeployConfig, UserConfig } from "../../types";

type Options = DeployConfig & {
    /** 是否需要读取配置文件 */
    readConfigFile?: boolean
}

const handleConfig = (config: UserConfig) => {
    const { serverConfig, ...otherConfig } = config
    const newServerConfig = serverConfig.map(((item) => {
        const clonedItem = { ...item }
        const { webVersion, privateKey } = item
        if (webVersion && !webVersion?.maxLimit) {
            clonedItem.webVersion.maxLimit = 5
        }
        if (privateKey && privateKey.indexOf('~') === 0) {
            const HOME = homedir()
            clonedItem.privateKey = privateKey.replace('~', HOME)
        }
        return clonedItem
    }))
    return {
        ...otherConfig,
        serverConfig: newServerConfig,
    }
}

/** 获取配置信息 */
export const getConfig = (options: Options): UserConfig => {
    const { readConfigFile, configFilePath, cwd, ...otherOptions } = options
    let userConfig: UserConfig
    if (readConfigFile) {
        const spinner = spinnerlog('正在读取配置文件...').start()
        try {
            userConfig = getUserConfig({ cwd, configFilePath })
        } catch (err) {
            spinner.fail(`配置文件读取失败 ${emoticons.fail_2}`)
            throw new Error(err)
        }
        spinner.succeed('配置文件读取成功!')
    }
    const config = {
        ...userConfig,
        ...otherOptions
    }
    // 校验参数
    validateConfig(config)
    const newConfig = handleConfig(config)
    return newConfig
};

