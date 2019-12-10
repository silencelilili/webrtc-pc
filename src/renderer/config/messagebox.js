import { Message, Notification } from 'element-ui';

import { remote } from 'electron';
/**
 * 全局自定义 element-ui的message消息提示框样式
 * 重写$message消息提示方法
 */
let $Notification = remote.Notification;
let ipc = remote.ipcRenderer;
// Message消息提示
export let HintMsg = (message, type) => {
  Message({
    message: message,
    type: type || 'info',
    duration: 1500,
    customClass: 'msgbox'
  })
}
//  Notification通知
export let Hint = (title, message) => {
  Notification({
    title: title,
    duration: 2000,
    customClass: 'notificabox',
    message: message
  })
}

// 主进程窗体消息提示
export let boxNotification = (title, body) =>{
  const notification = new $Notification({
      title: title,
      body: body
  })
  notification.show()
}


// 窗体消息展示 错误消息
export let ErrorBox = (data) => {
  ipc.send('open-error-dialog', data);
}
