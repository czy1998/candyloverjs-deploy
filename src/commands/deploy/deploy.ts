import { basename } from 'path'
import type { UserConfig, ServerConfig } from "../../types";
import { dayjs, getVersion, parseVersion } from "../../utils/getVersion";
import { log, spinnerlog } from "../../utils/log";
import { SshServer } from "../../utils/sshServer";
import { emoticons } from '../../index';

interface Config extends Omit<UserConfig, 'serverConfig'> {
    serverConfig: ServerConfig,
    version?: string
}

type FailType = {
    /** 文件本地路径 */
    localPath: string,
    /** 要上传的远程路径 */
    remotePath: string
}

type FailListType = {
    /** 上传失败队列 */
    list: FailType[],
    /** 重试次数 */
    retryCount: number
}

export class Deploy extends SshServer {
    // 在属性、方法名前加【#】，即表示该属性/方法为私有
    #deployConfig: Config
    /** 失败信息 */
    #failObj: FailListType = {
        list: [],
        retryCount: 3
    }
    /** 部署到服务器上的地址 */
    #targetPath: string

    constructor(config: Config) {
        super()
        const { serverConfig: { webDir, webVersion }, version } = config
        const { sourceDir } = webVersion || {}
        this.#deployConfig = config
        this.#targetPath = version ? `${sourceDir}/${version}` : webDir
    }

    #getText = (text: string) => {
        const { serverConfig: { host } } = this.#deployConfig
        return `${host}: ${text}`

    }

    async run() {
        const { serverConfig: { webVersion, webDir, ...config }, version } = this.#deployConfig
        await this.connectSSH(config, this.#getText)
        if (!version) {
            await this.#deleteOldFile()
        }
        await this.#uploadFile()
        if (version) {
            await this.setSoftLink(this.#targetPath, webDir)
            await this.#removeOverVersion()
        }
        await this.#uploadComplete()
    }

    /** 删除旧文件 */
    async #deleteOldFile() {
        try {
            await this.runCommand({ command: `find ${this.#targetPath}`, cwd: '/' })
            await this.runCommand({ command: `rm -rf ${this.#targetPath}`, cwd: '/' })
        } catch (error) {
            // 目录不存在时，捕获错误避免终止，使得继续执行
        }
    }

    /** 上传文件 */
    async #uploadFile() {
        const { distPath, plugins } = this.#deployConfig
        const spinner = spinnerlog().start('文件上传中...')
        try {
            await this.ssh.putDirectory(distPath, this.#targetPath, {
                // 递归的
                recursive: true,
                // 并发
                concurrency: 10,
                validate: (path) => {
                    const name = basename(path)
                    const disabledList = ['node_modules']
                    // 强制禁止 node_modules这些文件上传
                    if (disabledList.includes(name)) {
                        return false
                    }
                    if (typeof plugins?.uploadValidate === 'function') {
                        return plugins.uploadValidate(name)
                    }
                    return true
                },
                tick: (localPath, remotePath, error) => {
                    if (error) {
                        const { list } = this.#failObj
                        this.#failObj = {
                            ...this.#failObj,
                            list: [...list, { localPath, remotePath }]
                        }
                    }
                }
            })
            await this.#uploadFileAgain(spinner)
            spinner.succeed(this.#getText('文件上传成功!'))
        } catch (error) {
            spinner.fail(`文件上传服务器异常 ${emoticons.fail_3}`)
            throw new Error(error)
        }
    }

    /** 重新上传失败文件 */
    async #uploadFileAgain(spinner: any) {
        const { list, retryCount } = this.#failObj
        if (list.length <= 0) {
            return
        }
        if (retryCount <= 0) {
            // 多次重新上传还有失败，则清除已上传的文件
            await this.runCommand({ command: `rm -rm ${this.#targetPath}`, cwd: '/' })
            spinner.fail(this.#getText(`文件上传服务器失败 ${emoticons.fail_4}`))
            throw new Error('超出最大重试次数')
        }
        const retryPromise = list.map(item => {
            return new Promise(async (resolve, reject) => {
                try {
                    await this.ssh.putFile(item.localPath, item.remotePath)
                    resolve('success')
                } catch (error) {
                    const { list } = this.#failObj
                    this.#failObj = {
                        ...this.#failObj,
                        list: [...list, { localPath: item.localPath, remotePath: item.remotePath }]
                    }
                    resolve('fail')
                }
            })
        })
        // 重试前清空失败列表
        this.#failObj = {
            ...this.#failObj,
            list: [],
            retryCount: this.#failObj.retryCount - 1
        }
        await Promise.all(retryPromise)
        if (this.#failObj.list.length > 0) {
            this.#uploadFileAgain(spinner)
        }
    }

    /** 删除多余的版本 */
    async #removeOverVersion() {
        const { serverConfig: { webVersion }, } = this.#deployConfig
        const { sourceDir, maxLimit } = webVersion
        const result = await this.runCommand({ command: 'ls', cwd: sourceDir })
        // 剔除末尾的换行符
        const list = (result + '').split('\n').filter(v => v)
        if (list.length > maxLimit) {
            const versionList = list.map(v => dayjs(parseVersion(v)))
            const minVersion = getVersion(dayjs.min(versionList))
            await this.runCommand({ command: `rm -rf ${sourceDir}/${minVersion}`, cwd: '/' })
        }
    }

    async #uploadComplete() {
        const { plugins } = this.#deployConfig
        if (typeof plugins?.useUploadDone === 'function') {
            await plugins.useUploadDone(this.runCommand.bind(this))
        }
        // 断开连接
        this.breakLink()
        spinnerlog().succeed(this.#getText(`部署完成!  ${emoticons.success}`))
    }
}

/** 部署多台服务器 */
export const deployMultiple = async (config: UserConfig) => {
    const { serverConfig } = config
    const version = getVersion()
    const promiseList = serverConfig.map(item => {
        return new Promise((resolve, reject) => {
            const { webVersion } = item
            const deploy = new Deploy({
                ...config,
                serverConfig: item,
                version: webVersion ? version : void 0
            })
            deploy.run()
                .then((res) => resolve(res))
                .catch((err) => reject(err))
        })
    })
    await Promise.all(promiseList)
    spinnerlog().succeed(`当前版本号: ${version}`)
}