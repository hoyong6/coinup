/* global $ confirm alert */
let setTime = ''
$(function () {
  // 页面开始默认拉取get方法，查看页面是否参数配置
  $.get('/config/imageconfig', function (res) {
    if (res.status === 0) {
      if (!res.data.address || !res.data.addressT || !res.data.desc) { // 如果配置有一项为空
        $('.J-showOptions').show() // 展示所有的输入框
        $('#J-resetBtn').hide() // 对重置按钮执行隐藏
      }
    }
  }, 'json')
  // 提交
  $('#J-coinUpBtn').click(function () {
    const data = $('#J-coinUp').serialize()
    // console.log(data)
    $.post('/', data, function (res) {
      if (res.status === 0 && res.cover === 1) { // 此时是复写地址，需要将地址提交全部提交
        $('.J-showOptions').hide()
        alert('代码开始执行, 执行过程中无法再次操作按钮')
        // 成功就要对按钮进行锁死 其实应该是置灰色暂时hide
        $('#J-coinUpBtn').hide()
        $('#J-resetBtn').hide()
        $('#J-dangerBtn').show()
        // 隐藏按钮的同时，激活查询链接
        gulpend()
      } else if (res.status === 0) {
        alert('代码开始执行, 执行过程中无法再次操作按钮')
        // 成功就要对按钮进行锁死 其实应该是置灰色
        $('#J-coinUpBtn').hide()
        $('#J-resetBtn').hide()
        $('#J-dangerBtn').show()
        // 隐藏按钮的同时，激活查询链接
        gulpend()
      } else {
        alert(res.msg)
      }
    })
  })
  // 需要重置项目
  $('#J-resetBtn').click(function () {
    var r = confirm('是否要对项目进行重置')
    if (r === true) {
      $.post('/config/reset', { reset: '0' }, function (res) {
        if (res.status === 0) {
          alert('重置当前项目成功')
          $('#J-resetBtn').hide() // 成功之后reset 按钮都要隐藏
          formClear() // 清空表单任务
        } else {
          alert('当前网络不稳定')
        }
      })
      $('.J-showOptions').show() // 展示所有的输入框
    }
  })
})
// 轮询gulpend接口
function gulpend () {
  $.ajax({
    type: 'GET',
    url: '/querygulp/gulpstatus',
    dataType: 'json',
    success: function (response) {
      if (response.status === 0) {
        if (response.data === 'end') { // 对请求进行挂断
          window.clearTimeout(setTime)
          alert('脚本操作已经完成请进入代码内查看')
          // window.location.href = '/'
          $('#J-coinUpBtn').show()
          $('#J-resetBtn').show()
          $('#J-dangerBtn').hide()
        } else {
          setTime2s()
        }
      }
    }
  })
}
// 2s 轮询函数
function setTime2s () {
  window.clearTimeout(setTime)
  setTime = setTimeout(() => {
    gulpend()
  }, 2000)
}
// 表单清空函数
function formClear () {
  $(':input', '#J-coinUp')
    .not(':button, :submit, :reset, :hidden')
    .val('')
    .removeAttr('checked')
    .removeAttr('selected')
}
