import { exec } from 'child_process'
import { log, spinnerlog } from '../../utils/log'
import { emoticons } from '../../index'

// stdout(标准输出)或 stderr(标准错误)允许的最大数据量(以字节为单位)如果超出，则终止子进程并截断任何输出 
const MAXBUFFER = 1024 * 1024 * 2

export const projectBuild = async (script: string) => {
    const spinner = spinnerlog("项目打包中...").start()
    try {
        await new Promise((resolve, reject) => {
            exec(script, { maxBuffer: MAXBUFFER }, (err) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(1)
                }
            })
        })
        spinner.succeed('项目打包成功!')
    } catch (error) {
        log(error)
        spinner.fail(`项目打包失败 ${emoticons.fail_2}`)
    }
}
