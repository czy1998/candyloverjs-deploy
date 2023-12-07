import { resolve } from 'path'
import { spinnerlog } from "../../utils/log";
import { ServerConfig } from "../../types";
import { SshServer } from "../../utils/sshServer";
import inquirerPrompt from './inquirerPrompt'
import type { inquirerResult } from './inquirerPrompt'

/** 当前部署版本 */
export type currentVersion = {
    preLink: string,
    preVersionName: string
}

class Revert extends SshServer {
    private revertConfig: ServerConfig
    /** 版本存放地址 */
    private sourceDir: string
    /** 前端部署地址 */
    private webDir: string

    constructor(config: ServerConfig) {
        super()
        const { webVersion, webDir } = config
        const { sourceDir } = webVersion || {}
        this.revertConfig = config
        this.sourceDir = sourceDir
        this.webDir = webDir
    }


    run = async () => {
        const { webVersion, webDir, ...otherConfig } = this.revertConfig
        await this.connectSSH(otherConfig)
        const versionList = await this.fetchExistVersion()
        const currentVersion = await this.getCurrentVersion()
        const answer = await inquirerPrompt(versionList, currentVersion)
        await this.handleRevert(answer, currentVersion)
    }

    /** 获取当前版本 */
    getCurrentVersion = async () => {
        // 查看符号链接的目标路径，若为软链接则输出软链接的目标目录，若不是，则输出其所在的绝对路径
        const preLink = await this.runCommand({ command: `readlink -f ${this.webDir}`, cwd: '/' })
        const preVersionName = preLink.match(/[^/]+$/g)[0]
        // webDir 为短链接
        if (preLink !== this.webDir) {
            return {
                preLink,
                preVersionName
            } as currentVersion
        }
    }

    /** 获取已有的版本 */
    fetchExistVersion = async () => {
        const spinner = spinnerlog('开始读取历史版本...').start()
        try {
            const versionStr = await this.runCommand({ command: 'ls', cwd: this.sourceDir })
            const versionList = versionStr.split('\n').filter(v => v)
            spinner.succeed('历史版本读取成功!')
            if (versionList.length === 1) {
                spinnerlog().fail('当前只有一个历史版本，无法进行回滚操作')
                process.exit(0)
            }
            return versionList
        } catch (error) {
            console.log(error);
            process.exit(0)
        }
    }

    /** 进行回滚操作 */
    handleRevert = async (answer: inquirerResult, currentVersion: currentVersion) => {
        const { version, confirmDelete } = answer
        await this.setSoftLink(resolve(this.sourceDir, version), this.webDir)
        spinnerlog().succeed(`版本回滚成功! 当前版本为（${version}）`)
        if (confirmDelete && currentVersion) {
            // 如果部署地址被软链接过
            if (currentVersion.preLink !== this.webDir) {
                await this.runCommand({ command: `rm -rf ${currentVersion.preLink}`, cwd: '/' })
                const preVersionName = currentVersion.preLink.match(/[^/]+$/g)
                spinnerlog().succeed(`版本删除成功! 删除版本为（${preVersionName}）`)
            }
        }
        this.breakLink()
    }
}

export const revertVersion = async (serverConfig: ServerConfig) => {
    const revert = new Revert(serverConfig)
    await revert.run()
}