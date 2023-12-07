import inquirer from 'inquirer'
import { spinnerlog } from '../../utils/log'
import { currentVersion } from './revert'

/** 询问式交互的结果 */
export interface inquirerResult {
    /** 选择的版本 */
    version: string,
    /** 删除回滚前的版本的二次确认 */
    confirmDelete?: boolean
}

/** 询问式交互 */
const inquirerPrompt = async (dirList: string[], currentVersion: currentVersion) => {
    const choicesOptions = [...dirList, '取消回滚']
    const config = [
        {
            type: "list",
            name: "version",
            message: "请选择要回滚的版本",
            choices: () => {
                return choicesOptions.map(item => ({
                    name: item,
                    value: item,
                    disabled: item === currentVersion?.preVersionName ? '当前版本' : null
                }))
            },
            filter: (val) => {
                return val
            },
        },

    ]
    const result = await inquirer.prompt(config)
    if (result.version === '取消回滚') {
        spinnerlog().fail('已取消回滚操作')
        process.exit(0)
    }
    const config1 = {
        type: "confirm",
        message: "是否确认",
        name: "confirmVersion",
    }
    const result1 = await inquirer.prompt(config1)
    if (result1.confirmVersion === false) {
        await inquirerPrompt(dirList, currentVersion)
        return
    }
    if (currentVersion) {
        const config2 = {
            type: "confirm",
            message: "是否删除回滚前的版本",
            name: "confirmDelete",
        }
        const result2 = await inquirer.prompt(config2)
        return { ...result, ...result2 } as inquirerResult
    }
    return result as inquirerResult
}

export default inquirerPrompt