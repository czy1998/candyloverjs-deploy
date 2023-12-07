import { basename } from 'path'
import { NodeSSH } from 'node-ssh'
import { log, spinnerlog } from '../log'

import type { Config, NodeSSH as NodeSSHType } from 'node-ssh/lib/typings'
import { emoticons } from '../../index'

export class SshServer {
    /** class 属性默认是 public（共有的） */
    ssh: NodeSSHType = new NodeSSH()

    /** 连接服务器 */
    async connectSSH(config: Config, getText?: (text: string) => string) {
        const logText = getText || ((str) => str)
        const spinner = spinnerlog(logText('正在连接服务器... ')).start()

        try {
            await this.ssh.connect(config)
            spinner.succeed(logText('服务器连接成功!'))
        } catch (error) {
            spinner.fail(logText(`服务器连接失败 ${emoticons.fail_2}`))
            throw new Error(error)
        }
    }

    /** 运行终端命令 */
    async runCommand({ command, cwd, showLog }: { command: string, cwd: string, showLog?: boolean }) {
        const result = await this.ssh.execCommand(command, {
            cwd,
            // onStdout: (chunk) => {
            //     if (showLog) {
            //         log(chunk.toString('utf8'))
            //     }
            // },
            // onStderr(chunk) {
            //     const errText = chunk.toString('utf8')
            //     if (showLog) {
            //         log(errText)
            //     }
            //     throw new Error(errText)
            // },
        })
        if (result.stderr) {
            throw new Error(result.stderr)
        }
        return result.stdout
    }

    /**
     * 将源文件(目录)软链接到目标文件(目录)
     * @param sourcePath 源文件(目录)
     * @param targetPath 目标文件(目录)
     */
    async setSoftLink(sourcePath: string, targetPath: string) {
        // 进行软链接
        await this.runCommand({ command: `ln -snf ${sourcePath} ${targetPath}`, cwd: '/' })
        const data = await this.runCommand({ command: 'ls', cwd: targetPath });
        const name = basename(sourcePath);
        // 如果出现异常，使得软链接连到 targetPath 里面了，则需要删除目标目录，重新软链接
        if (data.indexOf(name) !== -1) {
            await this.runCommand({ command: `rm -rf ${targetPath}`, cwd: '/' });
            await this.runCommand({ command: `ln -snf ${sourcePath} ${targetPath}`, cwd: '/' });
        }
        // 如果【目标目录】已存在，然后进行 ln -s 软链接，
        // 只会在【目标目录】下增加一个指向【源目录】的软链接，不符合我们我们的需求(访问【目标目录】即访问【源目录】)
        // 使用 ln -snf 则不会如此，它会用新的软链接覆盖之前存在的软链接
    }

    /** 断开链接 */
    breakLink() {
        this.ssh.dispose()
        this.ssh = null
    }
}