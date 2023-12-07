import { emoticons } from "../../index";
import { UserConfig } from "../../types";
import { revertVersion } from "./revert";

const handleRevert = async (config: UserConfig) => {
    const { serverConfig } = config
    if (serverConfig.length > 1) {
        console.log(`暂不支持多台服务器回滚，请将serverConfig改为单元素数组，再进行重试 ${emoticons.fail_3}`);
        process.exit(0)
    }
    const [{ webVersion, ...otherConfig }] = serverConfig
    if (!webVersion?.sourceDir) {
        console.log(`由于配置文件中未进行【项目版本管理】的设置，无法进行回滚操作 ${emoticons.fail}`);
        process.exit(0)
    }
    await revertVersion({ webVersion, ...otherConfig })
}

export default handleRevert