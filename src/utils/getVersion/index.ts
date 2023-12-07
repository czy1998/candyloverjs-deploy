import dayjs from 'dayjs'
import minMax from 'dayjs/plugin/minMax'

dayjs.extend(minMax)

/** 获取版本号 */
const getVersion = (time?: any) => {
    if (time) {
        return dayjs(time).format('YYYY-MM-DD_HH:mm:ss')
    }
    return dayjs().format('YYYY-MM-DD_HH:mm:ss')
}

/** 转换版本号为时间格式 */
const parseVersion = (version: string) => {
    return version.replace(/_/g, ' ')
}

export { dayjs, getVersion, parseVersion }