var co = require('co');
var prompt = require('co-prompt');  // 命令交互co 文件

var fse = require('fs-extra'); // 读写文件

// 初次写入图片地址配置
function initaddress (callback, parameter) {
  co(function*() {
    var address = yield prompt('请输入项目根路径地址: ');
    var addressT = yield prompt('请输入第二个项目根路径地址: ');
    var desc = yield prompt('请输入上币图片地址:');
    var ok = yield prompt.confirm('are you sure?(yes|no)');
    if(!ok){ // if false 程序退出
      process.exit()
    }
    console.log('您的项目根路径地址是', address, addressT);
    console.log('您的图片地址是', desc);
    console.log('配置成功', ok);
    let obj = {}
    obj.address = address
    obj.addressT = addressT
    obj.desc = desc
    try {
      fse.writeJson('./imageconfig.json', obj)
      console.log('success!')
      if (typeof callback == 'function') { // 配置成功进一步执行下一层回调函数
        console.log('地址配置成功')
        callback(parameter) // 运行 runimages 里面读取配置函数
      }
    } catch (err) {
      console.error(err)
      process.exit() // 报错程序直接退出
    }
  })
}
module.exports = initaddress
