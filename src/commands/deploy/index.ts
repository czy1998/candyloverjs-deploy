import { rimrafSync } from 'rimraf';
import { projectBuild } from './build';
import { deployMultiple } from './deploy'

import type { UserConfig } from "../../types"

const handleDeploy = async (config: UserConfig) => {
    const { script, distPath, delDistFile } = config
    await projectBuild(script)
    await deployMultiple(config)
    if (delDistFile) {
        rimrafSync(distPath)
    }
}

export default handleDeploy