/** 休眠方法 */
const sleep = (length: number = 3000) => {
    return new Promise((res, rej) => {
        const timer = setTimeout(() => {
            res('end')
            clearTimeout(timer)
        }, length)
    })
}

export default sleep