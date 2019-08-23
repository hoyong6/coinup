#!/usr/bin/env node
require("babel-register");
require("babel-polyfill"); // 把babel 扔进来 暂时不是知道是否生效

var shell = require('shelljs');
var co = require('co');
var prompt = require('co-prompt');  // 命令交互co 文件
var fse = require('fs-extra'); // 读写文件
var fs = require('fs');
const child_process = require('child_process'); // node 子进程文件
const initaddress = require('./initaddress.js')


// 读取文件函数
class RunImage {
  constructor () {
    this.urlConfig = ''
    this.coinName = ''

    this.commonUrl = '/src/images/common/coin_all_b.png' // 通用的url地址
    this.commonSass = '/src/scss/common/_coin.scss' // 通用的sass地址

    this.interactiveCO() // CO 交互启动程序
  }
  // 输入币种交互， 读取之后才进行写文件操作
  interactiveCO () {
    let promise = new Promise((resolve, reject) => {
      co(function*() {
        var coinName = yield prompt('请输入此次要上币的币种名称: ');
        var ok = yield prompt.confirm('are you sure?(yes|no)');
        if(!ok){ // if false 程序退出
          process.exit()
        }
        resolve(coinName)
      })
    })
    promise.then(data => {
      this.readFunction(data) // 读取配置文件 
    })
  }
  // 读取历史文件
  readFunction (name) {
    let self = this
    this.coinName = name
    fse.readJson('imageconfig.json')
    .then(packageObj => {
        if(!packageObj.address || !packageObj.addressT || !packageObj.desc){ // 如果图片的配置文件有一项默认为空，需要进行初始化配置
          console.log('首次需要初始化配置')
          initaddress(function(name){
            self.readFunction(name) // 在输入初始化地址之后在读文件
          }, self.coinName)
        } else {
          self.copyImages(packageObj, 'address')
        }
    })
    .catch(err => {
        console.error(err)
    })
  }
  // 操作文件先暂时对一个文件进行操作
  copyImages (data, project) {
    this.urlConfig = data
    fse.copySync(data.desc, data[project] + this.commonUrl, { overwrite: true }) // 对第一个项目的图片进行覆盖
    console.log('项目copy图片成功')
    this.readSass(data, project)
  }
  // 操作 sass 准备读取文件内容 暂时先写死url测试，后期改为传入地址
  readSass (data, project){
    let promise = new Promise((resolve, reject) => {
      let url = data[project] + this.commonSass
      fs.readFile(url,function(err, data){
        if(err) {
          console.log('文件读取发生错误')
        }
        else {
          let s = data.toString()
          // 拿取最后一位数的赋值 目前是一个负数,所以需要在使用的时候在减100
          console.log('系统自动截取的字符串为:', data.toString().substring(s.length - 9, s.length))
          let num = parseFloat(data.toString().substring(s.length - 9, s.length))
          console.log('本次现有数据' + num)
          if (num > -8500) {
            return console.log('请查看代码文件抛出报错了')
          }
          // 接出来一个空对象
          let obj = {}
          obj.num = num
          obj.s = s
          obj.project = project
          resolve(obj)
        }
      })
    })
    promise.then(data => {
      this.writeSass(data)
    })
  }
  // 往 sass 里写入文件内容,需要一个币种的,名称
  // 正则匹配对应的字符串，修改版本号
  writeSass (data){
    let promise = new Promise((resolve, reject) => {
      let num = data.s.indexOf('?v=')
      let str = data.s.substring(num, num + 7)
      let versions = parseFloat(str.substring(3)) + 0.01
      versions = versions.toFixed(2)
      console.log('当前的版本号-->', versions)
      data.s = data.s.replace(str, '?v='+versions)
      let px = data.num - 100
      data.s += `
.coin-${this.coinName} {background-position: 0 -5000px, 0 ${px}px}`
      // console.log(data.s) // 可以打印出来要修改的文件
      let url = this.urlConfig[data.project] + this.commonSass
      fs.writeFile(url, data.s, function(err){
        if(err){
          return console.log(err)
        }
        console.log("数据写入成功！");
        resolve(data)
      })
    })
    promise.then((data) => {
      this.shellGulp(data)
    })
  }
  // 读写工作完成开始进入 启动shell 脚本进程
  shellGulp (data) {
    let self = this
    let url = this.urlConfig[data.project]
    this.project = data.project
    shell.cd(url)
    shell.echo('开始执行gulp脚本')
    const ls = shell.exec('npm run serve',{silent:false},function (code, stdout, stderr){
    })
    ls.stdout.on('data', (data) => { // 子进程监听命令行输出的数据
      // console.log(`stdout----: ${data}`)
      // 需要关闭进程当前进程进入下一个进程
      if(data.indexOf('imgEnd') != -1){
        console.log('--->当前子进程进程号',ls.pid)
        process.kill(ls.pid, 'SIGINT') // 获取子进程序列号，杀死子进程
        ls.on('exit', function(code){
          console.log('监听到进程已关闭')
          self.shellGulpBuild(self.project)
        })
      }
    })
  }
  // 关闭当前进程 执行 build程序   silent:false 确认开启日志打印 true 是关闭
  shellGulpBuild (project) {
    let self = this
    const bd = shell.exec('npm run build',{silent:false},function (code, stdout, stderr){
    })
    bd.stdout.on('data', (data) => {
      if(data.indexOf('BuildEndJS') != -1){
        process.kill(bd.pid, 'SIGINT') // 获取子进程序列号，杀死子进程
        if (self.project != 'addressT') {
          console.log('首个项目执行完毕，开始执行第二个项目')
          self.copyImages(self.urlConfig, 'addressT') // 串联执行第二个项目
        }
        bd.on('exit', function (code) {
          console.log('监听到进程已关闭')
          // co(function*() {
          //   var ok = yield prompt.confirm('打包已经完成，接下来需要项目git自动提交嘛: (yes|no)');
          //   if(!ok){
          //     process.exit()
          //   } else {
          //     self.gitCommit(self.project) // 否则就执行git脚本命令
          //   }
          // })
        })
      }
    })
  }
  // 现有的build已经完成，下一步进行，git 提交, 提交前询问是否要进行自动提交
  gitCommit (project) {
    console.log(project)
  }
}
new RunImage()
