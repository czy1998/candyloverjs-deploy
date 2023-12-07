import { validate } from "schema-utils";
import { UserConfig } from "../../types";

const serverConfig = {
    type: 'object',
    properties: {
        host: {
            type: 'string',
            description: '服务器地址'
        },
        port: {
            type: 'number',
            description: '端口号'
        },
        username: {
            type: 'string',
            description: '服务器用户名'
        },
        password: {
            type: 'string',
            description: '服务器连接密码'
        },
        privateKey: {
            type: 'string',
            description: '服务器连接密钥文件地址'
        },
        passphrase: {
            type: 'string',
            description: '服务器连接密钥后的密码'
        },
        webDir: {
            type: 'string',
            description: '服务器上部署的地址'
        },
        webVersion: {
            type: 'object',
            description: '项目版本管理',
            properties: {
                sourceDir: {
                    type: 'string',
                    description: '版本文件存放地址'
                },
                maxLimit: {
                    type: 'number',
                    description: '最多存放几个版本'
                }
            },
        },
    },
    required: ['host', 'port', 'username', 'webDir'],
    // 是否允许 options 中还有其他额外的属性。
    additionalProperties: false
}

const deployConfig = {
    type: 'object',
    properties: {
        serverConfig: {
            type: 'array',
            items: serverConfig,
            description: '服务器配置'
        },
        script: {
            type: 'string',
            description: '打包命令'
        },
        distPath: {
            type: 'string',
            description: '本地打包文件目录'
        },
        plugins: {
            type: 'object',
            description: '插件',
        },
        // cwd: {
        //     type: 'string',
        //     description: '运行目录'
        // },
        // configFilePath: {
        //     type: 'string',
        //     description: '用户自定义配置文件地址'
        // },
        delDistFile: {
            type: 'boolean',
            description: '部署完成之后，是否删除打包文件'
        },
    },
    required: ['serverConfig', 'script', 'distPath'],
    // 是否允许 options 中还有其他额外的属性。
    additionalProperties: false
}

/** 校验配置参数 */
export const validateConfig = (config: UserConfig) => {
    // @ts-ignore 这里 deployConfig 不是标准的 JSON格式，没有双引号包裹，故此忽略
    validate(deployConfig, config, { name: '@candyloverjs/deploy', baseDataPath: '配置项' })
}