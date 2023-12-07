export interface ServerConfig {
    /** 服务器地址，常为IP地址 */
    host: string;
    /** 端口号 */
    port: number;
    /** 服务器用户名 */
    username: string;
    /** 服务器连接密码 */
    password?: string;
    /** 服务器连接密钥文件地址 */
    privateKey?: string;
    /** 服务器连接密钥后的密码 */
    passphrase?: string,
    /** 服务器上部署的地址 */
    webDir: string,
    /** 项目版本管理 */
    webVersion?: {
        /** 版本文件存放地址 */
        sourceDir: string,
        /** 最多存放几个版本，默认 5个 */
        maxLimit?: number
    }
}

export interface DeployConfig {
    /** 服务器配置 */
    serverConfig: ServerConfig[],
    /** 打包命令 */
    script: string,
    /** 本地打包文件目录 */
    distPath: string,
    /** 插件 */
    plugins: {
        /**
         * 上传过程中，过滤某些文件，返回 false 过滤
         * @param itemPath 上传的文件名
         */
        uploadValidate?: (itemPath: string) => boolean,
        /** 上传完成后运行用户自定义一些操作 */
        useUploadDone?: (runCommand: (config: {
            command: string,
            cwd: string,
            showLog?: boolean
        }) => any) => Promise<void> | void
    },
    /** 运行目录 */
    cwd?: string,
    /** 用户自定义配置文件地址 */
    configFilePath?: string,
    /** 部署完成之后，是否删除打包文件 */
    delDistFile?: boolean
}

export type UserConfig = Omit<DeployConfig, 'cwd' | 'configFilePath'>

