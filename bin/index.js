// 把命令行参数转换为 json 对象，方便访问
const yParser = require("yargs-parser");

const args = yParser(process.argv.slice(2));

if (args.v || args.version) {
  console.log(require("../package.json").version);
  process.exit(0);
} else if (args.h || args.help) {
  console.log("Usage: cl-deploy <command> [options]");
  console.log();
  console.log("Options:");
  console.log("   -v, --version          output the version number");
  console.log("   -h, --help             output usage information");
  console.log();
  console.log("Commands:");
  console.log("   deploy   deploy Project");
  console.log("   revert   version rollback");
  process.exit(0);
} else {
  // config-配置文件路径
  const { _: param = [], config, ...otherArgs } = args;
  let command;
  if (param.includes("deploy")) {
    command = "deploy";
  } else if (param.includes("revert")) {
    command = "revert";
  }
  const commands = require("../lib/index").default;
  commands({
    readConfigFile: true,
    ...otherArgs,
    command,
    configFilePath: config,
    cwd: process.cwd(),
  });
}
