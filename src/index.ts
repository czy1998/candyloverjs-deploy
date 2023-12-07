import { getConfig } from "./utils/getConfig";
import { spendingTime } from "./utils/log";
import deploy from './commands/deploy'
import revert from './commands/revert'

import type { DeployConfig } from "./types";

// as 类型断言，定义只读元组
const commandList = ['deploy', 'revert'] as const

/** 颜文字 */
export const emoticons = {
  'success': '(o゜▽゜)o☆[BINGO!]',
  'fail': '(⊙ˍ⊙)',
  'fail_2': 'Σ( ° △ °|||)︴',
  'fail_3': '(°ー°〃)',
  'fail_4': 'X_X',
}

export interface Commands extends DeployConfig {
  // typeof 运算优先级高于方括号,等同于 (typeof commandList)[number]
  /** 命令 */
  command: typeof commandList[number],
  /** 是否需要读取配置文件 */
  readConfigFile?: boolean
}

const entry = async (options: Commands) => {
  const { command, ...otherOptions } = options

  if (!commandList.includes(command)) {
    console.log(`该命令不存在 ${emoticons.fail}`);
    process.exit(0)
  } else {
    const config = await getConfig(otherOptions)

    if (command === 'deploy') {
      spendingTime(() => deploy(config))
    }
    if (command === 'revert') {
      spendingTime(() => revert(config))
    }
  }
}

export default entry
