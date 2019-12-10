/**
 * 自定义过滤器
 */
import Vue from 'vue'

/** 
 * 字符串截取
 * 定义：limitTo(start,length)表示从start位置开始，截取length长度的字符串。
 * start 为空时 默认从第0位开始
 * length 为空时 默认截取长度为1位
 */
Vue.filter('limitTo', (value, start, length) => {
  let _string = value,
  _start = (typeof start === 'undefined') ? 0 : start,
  _length = (typeof length === 'undefined') ? 1 : length;
  return _string.substr(_start, _length);
});

/**
 * 保留2位小数
 * 例如：2，会在2后面补上00.即2.00
 */
Vue.filter('toDecimal2', x => {
  var f = parseFloat(x);
  if (isNaN(f)) {
    return false;
  }
  var f = Math.round(x * 100) / 100;
  var s = f.toString();
  var rs = s.indexOf('.');
  if (rs < 0) {
    rs = s.length;
    s += '.';
  }
  while (s.length <= rs + 2) {
    s += '0';
  }
  return s;
});
/**
 * 将视频流信息中的英文转换为中文 
 * */
const CALL_INFO = {
  "incoming": "呼入",
  "outgoing": "呼出",
  "audio": "音频",
  "video": "视频",
  "bitrate": "比特率",
  "codec": "编解码",
  "packets-lost": "丢失包",
  "packets_lost": "丢失包",
  "packets-received": "接收包",
  "packets-sent": "发送包",
  "percentage-lost": "丢包率",
  "percentage-lost-recent": "最近丢失百分比",
  "decode-delay": "解码延迟",
  "resolution": "分辨率",
  "configured-bitrate": "已设置的比特率",
  "buffer_length": "缓冲区长度",
  "latency": "延迟率",
  "packet_loss": "丢包",
  "dropped_frames": "抛弃帧",
  "frameRate-send": "帧率",
  "level": "等级",
  "encrypted": "已加密",
  "frameRate-received": "帧率",
  "AvgEncodeMs": "AvgEncodeMs",
  "bandwidth_limited": "BandwidthLimitedResolution",
  "cpu_limited": "CpuLimitedResolution"

}
Vue.filter('translateStatic', name => {
  return CALL_INFO[name];
});
// 判断值是否大于10，补零
function addZero(val) {
  return val < 10 ? '0' + val : val;
}
// 时间戳转换为时:分:秒
Vue.filter('toSwitchTime', (value, args) =>{
  const inputVal = value;
  let outputVal;
  const totalseconds = Math.floor(inputVal / 1000);//换算成秒
    // var totalseconds = inputVal;
    if (args) {
      if (args === 'minutes') {
        const minutes = Math.floor(totalseconds / 60);//计算分钟数
        const second = totalseconds - minutes * 60; //总秒数-已计算的分钟数

        outputVal = addZero(minutes) + '分' + addZero(second) + '秒';
      } else if (args === 'hours') {
        const hours = Math.floor(totalseconds / 3600);//计算小时数
        const leave2 = Math.floor(totalseconds - (hours * 3600));//总秒数-已计算的小时数
        const minutes = Math.floor(leave2 / 60);//计算分钟数
        outputVal = addZero(hours) + '小时' + addZero(minutes) + '分';
      } else {
        outputVal = '00'+'分';
      }
    } else {

      const hours = Math.floor(totalseconds / 3600);//计算小时数
      const leave2 = Math.floor(totalseconds - (hours * 3600));//总秒数-已计算的小时数
      const minutes = Math.floor(leave2 / 60);//计算分钟数
      const second = totalseconds - (minutes * 60 + hours * 3600); //总秒数-已计算的分钟数+小时数

      if (+hours === 0) {
        outputVal = addZero(minutes) + '分' + addZero(second) + '秒';
      } else {
        outputVal = addZero(hours) + '小时' + addZero(minutes) + '分';
      }
    }
    return outputVal;
})

Vue.filter('toFixed', (value, len) => {
  const _value = Number(value)
  const _len = (typeof len === 'undefined') ? 2 : len
  return _value.toFixed(_len)
})
// 计算时间差
Vue.filter('getLongTimes', (value, arg) => {
  let date = new Date().getTime();
  let longTimes;
  let showLongTime;
  if (date >= value) {
    longTimes = date - value;
  } else {
    longTimes = value - date;
  }
  if (Math.abs(longTimes) > 0) {
    //计算出相差天数
    let leavedays = longTimes % (30 * 24 * 3600 * 1000);
    let days = Math.floor(leavedays / (24 * 3600 * 1000));

    //计算出小时数
    let leavehours = leavedays % (24 * 3600 * 1000);     //计算天数后剩余的毫秒数
    let hours = Math.floor(leavehours / (3600 * 1000));

    //计算相差分钟数
    let leaveminutes = leavehours % (3600 * 1000);         //计算小时数后剩余的毫秒数
    let minutes = Math.floor(leaveminutes / (60 * 1000));

    //计算相差秒数
    let leaveseconds = leaveminutes % (60 * 1000);       //计算分钟数后剩余的毫秒数
    let seconds = Math.round(leaveseconds / 1000);

    if (days == 0) {
      if (hours == 0) {
        showLongTime = minutes + '分';
      } else {
        showLongTime = hours + '小时' + minutes + '分';
      }
    } else {
      showLongTime = days + '天' + hours + '小时' + minutes + '分';
      //showLongTime = days+"天"+hours+"小时"+minutes+"分钟"+seconds+"秒";
    }

  } else {
    showLongTime = '0'+'分';
  }
  return showLongTime;
})

Vue.filter('date', (date, fmt) => {
  date = new Date(date)
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  let o = {
      'M+': date.getMonth() + 1,
      'd+': date.getDate(),
      'H+': date.getHours(),
      'm+': date.getMinutes(),
      's+': date.getSeconds()
  }
  for (let k in o) {
      if (new RegExp(`(${k})`).test(fmt)) {
          let str = o[k] + ''
          fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? str : addZero(str))
      }
  }
  return fmt
})
