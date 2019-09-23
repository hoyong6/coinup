/* global */
const Koa = require('koa')
const app = new Koa()
const open = require('open') // 开启浏览器使用
const fs = require('fs')
const fsp = require('fs.promised')
const fse = require('fs-extra') // 读写文件
const Router = require('koa-router')
const servestatic = require('koa-static')
const path = require('path')

const Workerflow = require('./Workerflow.js') // 引入脚本方法
const processurl = process.cwd() // 获取当前包运行的环境地址
const main = async function (ctx, next) { // 渲染主页面
  ctx.response.type = 'html'
  ctx.response.body = await fsp.readFile(path.resolve(__dirname).split('/dist')[0] + '/public/static/coinup.html', 'utf8')
}
console.log('processurl---->', processurl)
const home = servestatic(path.resolve(__dirname).split('/dist')[0] + '/public/') // 静态服务器
app.use(home)
let imageconfigData = ''
const run = new Workerflow()

class Server {
  constructor () {
    this.listenGulp = ''
    this.routers()
    this.readJson() // 读
  }

  // 同步先读取json数据
  readJson () {
    fse.readJson(path.resolve(__dirname).split('/dist')[0] + '/imageconfig.json')
      .then(packageObj => {
        imageconfigData = packageObj
      })
      .catch(err => {
        console.error(err)
      })
  }

  // 路由及其监听挂载
  routers () {
    const INDEX = new Router()
    INDEX.get('/', main)
    // 解析post
    INDEX.post('/', async (ctx) => { // 解析数据完成后后台开始执行脚本
      await this.readJson() // 读
      const postData = await this.parsePostData(ctx) // 等promise回调
      const success = { status: 0, msg: '操作成功准备开始执行脚本,确定按钮将被锁定' }

      if (imageconfigData.address && imageconfigData.addressT && imageconfigData.desc) { // 在有数据的前提下
        // 只是记录coinName 的值就可以了
        ctx.body = success
        run.coinName = postData.coinName // 对coinname 赋值
        run.init(imageconfigData)
      } else {
        if (!postData.address || !postData.addressT || !postData.desc || !postData.coinName) {
          ctx.body = {
            status: 1,
            msg: '提交的选项不能为空'
          }
        } else { // 对文件执行写入
          try {
            // 在写入之前首先对文件夹进行查存, 同步
            fs.accessSync(postData.address, fs.constants.W_OK | fs.constants.R_OK)
            fs.accessSync(postData.addressT, fs.constants.W_OK | fs.constants.R_OK)
            console.log('可以读写')
          } catch (err) {
            console.error(err)
            ctx.body = {
              status: 1,
              msg: err.path + '路径错误'
            }
            return
          }
          try {
            fse.writeJson(path.resolve(__dirname).split('/dist')[0] + '/imageconfig.json', postData)
            console.log('success!')
            ctx.body = {
              status: 0,
              msg: '写入地址成功',
              cover: 1
            }
            // 写入数据之后需要重新读取数据,在执行脚本
            fse.readJson(path.resolve(__dirname).split('/dist')[0] + '/imageconfig.json')
              .then(packageObj => {
                imageconfigData = packageObj
                // 执行脚本
                run.coinName = postData.coinName // 对coinname 赋值
                run.init(imageconfigData)
              })
              .catch(err => {
                console.error(err)
              })
          } catch (err) {
            console.error(err)
            process.exit() // 报错程序直接退出
          }
        }
      }
    })
    const config = new Router()
    config.get('/imageconfig', async (ctx) => {
      ctx.body = {
        status: 0,
        msg: '',
        data: imageconfigData
      }
    })
    // 重置配置选项接口
    config.post('/reset', async (ctx) => {
      const postData = await this.parsePostData(ctx)
      const configData = {}
      if (postData.reset === '0') {
        // 对配置文件执行重置操作
        try {
          fse.writeJson(path.resolve(__dirname).split('/dist')[0] + '/imageconfig.json', configData) // 重置一个空对象
          imageconfigData = '' // 本身的内存也将置空
          console.log('重置配置成功success!')
        } catch (err) {
          console.error(err)
          process.exit() // 报错程序直接退出
        }
        ctx.body = {
          status: 0,
          msg: '重置当前接口成功'
        }
      }
    })
    // 轮询查询接口查事件状态
    const querygulp = new Router()
    querygulp.get('/gulpstatus', async (ctx) => {
      const cb = run.callbackServer() // 事件监听
      // console.log('查看cb输出数据--->', cb)
      ctx.body = {
        status: 0,
        data: cb
      }
    })
    // 装载所有子路由
    const router = new Router()
    router.use('/', INDEX.routes(), INDEX.allowedMethods())
    router.use('/config', config.routes(), config.allowedMethods())
    router.use('/querygulp', querygulp.routes(), querygulp.allowedMethods())
    // 加载路由中间件
    app.use(router.routes()).use(router.allowedMethods())
    // app.use(async ctx => {
    //   ctx.body = '这是输入上币图片的ui模式';
    // });
    app.listen(3000)
    open('http://127.0.0.1:3000')
  }

  // 将POST请求参数字符串解析成JSON
  parseQueryStr (queryStr) {
    const queryData = {}
    const queryStrList = queryStr.split('&')
    // console.log(queryStrList)
    for (const [index, queryStr] of queryStrList.entries()) {
      const itemList = queryStr.split('=')
      queryData[itemList[0]] = decodeURIComponent(itemList[1])
    }
    return queryData
  }

  // 解析上下文里node原生请求的POST参数
  parsePostData (ctx) {
    return new Promise((resolve, reject) => {
      try {
        let postdata = ''
        ctx.req.addListener('data', (data) => {
          postdata += data
        })
        ctx.req.addListener('end', () => {
          const parseData = this.parseQueryStr(postdata)
          resolve(parseData)
        })
      } catch (err) {
        reject(err)
      }
    })
  }
}

module.exports = Server
