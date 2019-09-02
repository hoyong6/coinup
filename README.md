# Name

[coin-cli]

## Introduction - 介绍

只是为了解决，前端重复手动上币的问题，而开发的一个脚本,限于本公司内部使用

## Requirements - 必要条件（环境，对所有项目，和所有子模块和库的描述。）

模块见 package.json
## 目录说明
```

├── README.md         # 说明文件
├── bin               # bin启动文件（npm用，本次没有使用）
├── dist              # 转码后的线上代码
├── gulpfile.js       # 前端工作流入口
├── package-lock.json # 包差异依赖
├── package.json      # 包依赖
├── public            # web root 目录
├── server            # node 脚本 和 UI serve 服务所在文件
├── babelrc           # babelrc 的配置文件
├── gitignore         # git忽略文件
├── eslintrc          # eslintrc.js 配置文件（代码检查）
├── imageconfig.json  # 对输入的地址进行持久化

```

## Configuration - 配置（配置信息。）

目录地址例如： /Users/XXXX/Workspace_hy/Projects/CoinEgg/btc_coinbee_www

/Users/XXXXX/Workspace_hy/Projects/CoinEgg/trade

目标图片地址： /Users/XXXX/Desktop/testimages/coin_all_b.png

上述记录于 imageconfig.json


## Installation - 安装（如何安装。）

npm i runcoinup -g

cli  提示有open错误的话，请安装open

如果报open相关的错误请安装，open相关插件，基本可以解决报错。

npm install -g open   (可能需要先提交open)

## Usage - 用法（用法。）

coin-cli 即可进入交互

coin-cli -i 进入服务器ui 模式，支持接口提交

## Development - 开发（关于怎样开发的文档信息。（API 等。））

npm run build  可以执行babel 对js进行编译，发布之前可以先进行一次打包

npm run watch  可以支持热更新编译

参考开发 
http://blog.gejiawen.com/2016/09/21/make-a-node-cli-program-by-commander-js/

Node.js 命令行程序开发完整教程
https://www.kancloud.cn/outsider/clitool/313191

子进程监听
http://nodejs.cn/api/child_process.html#child_process_spawning_bat_and_cmd_files_on_windows

子进程清理
http://nodejs.cn/api/process.html#process_signal_events

## Changelog - 更新日志（一个简短的历史记录（更改，替换或者其他）。）
追加一个大的版本， ui 服务基本成型了


