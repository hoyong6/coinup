// 引入依赖
var program = require('commander');

// 命令行模式直接执行脚本
const Workerflow = require('./Workerflow.js');

const Server = require('./server.js');

// 定义版本和参数选项
program.version('0.1.0', '-v, --version').option('-i, --initui', 'init uiserver').option('-r, --run', '直接执行脚本');

program.parse(process.argv);

if (program.initui) {
  console.log('初始化一个容易操作的ui交互');
  const a = new Server();
}

if (program.run || program) {
  if (!program.initui) {
    const b = new Workerflow();
    b.init(); // 初始化
  }
}