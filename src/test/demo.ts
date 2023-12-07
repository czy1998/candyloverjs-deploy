// import { exec } from 'child_process'

// // stdout(标准输出)或 stderr(标准错误)允许的最大数据量(以字节为单位)如果超出，则终止子进程并截断任何输出 
// const MAXBUFFER = 1024 * 1024 * 2

// export const projectBuild = async (script: string, cwd?: string) => {

//     return await new Promise((resolve, reject) => {
//         exec(script, { maxBuffer: MAXBUFFER, cwd }, (err, onStdout, e) => {
//             if (err) {
//                 reject(err)
//             } else {
//                 resolve(onStdout)
//             }
//         })
//     })

// }
// const qq = async () => {
//     // await projectBuild('ln -snf /Users/hooshine/desktop/study/qq/a /Users/hooshine/desktop/study/qq/c')
//     try {
//         const a = await projectBuild('ls', '/Users/hooshine/desktop/study/qq')
//         console.log(typeof a);
//         console.log('成功', a);
//         console.log(a.split('\n').filter(v=>v));
//     } catch (error) {
//         console.log(Object.keys(error));
//         console.log('失败', error);
//     }
// }

// qq()

import ora from "ora";

let a = ora('开始')
a.start()
let b = setTimeout(() => {
    a.succeed('学校')
    clearTimeout(b)
    b = null
}, 1000)

// import dayjs from "dayjs";

// import minMax from 'dayjs/plugin/minMax'

// dayjs.extend(minMax)

// const list = [
//     dayjs('2023-01-01 12:23:33'),
//     dayjs('2023-02-01 12:23:33'),
//     dayjs('2023-03-01 12:23:33'),
//     dayjs('2023-04-01 12:23:33'),
//     dayjs('2023-05-01 12:23:33')
// ]

// console.log(dayjs.min(list).format('YYYY-MM-DD_HH:mm:ss'));
