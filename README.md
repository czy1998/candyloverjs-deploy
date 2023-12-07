# @candyloverjs/deploy

一个前端部署工具

- 支持前端项目部署
- 支持多台服务器部署
- 支持版本管理
- 采用软链接的形式，可以实现无感发布和秒级回滚

### 安装

```ts
// 推荐全局安装
pnpm i @candyloverjs/deploy -g
// 安装到项目里也可以
pnpm i @candyloverjs/deploy
```

### 用法

```json
// package.json
{
  "script": {
    // 指定配置文件
    "deploy": "cl-deploy deploy --config ./config/deploy",
    "deploy:revert": "cl-deploy revert --config ./config/deploy",
    // 未指定配置文件会去项目根目录读取 .deployrc.js
    "deploy": "cl-deploy deploy",
    "deploy:revert": "cl-deploy revert"
  }
}
```

**配置文件**
你也可以在项目根目录下创建 `.deployrc.js` 文件 或者在 `package.json` 中 `--config` 指定配置文件

**注意要点**
ora 之所以安装 5.x ，是因为 6.x 7.x 的在编译之后运行报错了，它俩使用的是 ES module ，引入的时候不支持 require 这种模式(大致是这样)

**配置文件 demo**

```ts
// .deployrc.js
const config = {
  serverConfig: [
    {
      host: "111.11.111.111",
      port: 22,
      username: "root",
      password: "123456",
      webDir: "/opt/demoDir",
      webVersion: {
        sourceDir: "/opt/demoVersion",
        maxLimit: 3,
      },
    },
  ],
  script: 'echo "完成打包"',
  distPath: "./dist",
  plugins: {
    uploadValidate: (str) => str,
    useUploadDone: async (fn) => {
      try {
        const res = await fn({ command: 'echo "hello"', cwd: "/" });
        console.log(res);
      } catch (error) {
        console.log(error);
      }
    },
  },
};

module.exports = config;
```

```ts
// 服务器配置
interface ServerConfig {
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
  passphrase?: string;
  /** 服务器上部署的地址 */
  webDir: string;
  /** 项目版本管理 */
  webVersion?: {
    /** 版本文件存放地址 */
    sourceDir: string;
    /** 最多存放几个版本，默认 5个 */
    maxLimit?: number;
  };
}

// 部署配置
interface DeployConfig {
  /** 服务器配置 */
  serverConfig: ServerConfig[];
  /** 打包命令 */
  script: string;
  /** 本地打包文件目录 */
  distPath: string;
  /** 插件 */
  plugins: {
    /**
     * 上传过程中，过滤某些文件，返回 false 过滤
     * @param itemPath 上传的文件名
     */
    uploadValidate?: (itemPath: string) => boolean;
    /** 上传完成后运行用户自定义一些操作 */
    useUploadDone?: (
      runCommand: (config: {
        command: string;
        cwd: string;
        showLog?: boolean;
      }) => any
    ) => Promise<void> | void;
  };
  /** 运行目录 */
  cwd?: string;
  /** 用户自定义配置文件地址 */
  configFilePath?: string;
  /** 部署完成之后，是否删除打包文件 */
  delDistFile?: boolean;
}
```
