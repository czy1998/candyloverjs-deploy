import ora from 'ora'

/** 带有样式的打印 */
export const spinnerlog = (text?: string) => {
    return ora(text)
}

export const log = (text: string) => {
    console.log(text);
}

/** 运行所耗时间 */
export const spendingTime = async (event: () => Promise<any>) => {
    const startTime = new Date()
    await event()
    const endTime = new Date()
    spinnerlog().succeed(`开始时间：${startTime.toLocaleString()}`)
    spinnerlog().succeed(`结束时间：${endTime.toLocaleString()}`)
    const time = Math.round((endTime.getTime() - startTime.getTime()) / 1e3)
    spinnerlog().succeed(`总耗时：${time}s`)
}

