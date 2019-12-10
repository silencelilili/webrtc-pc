import electron from 'electron'
import { app, BrowserWindow, Tray, Menu, dialog, Notification, ipcMain, powerSaveBlocker, session } from 'electron'
import pkg from '../../package.json'
const path = require('path')
import Update from './update'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = path.join(__dirname, '/static').replace(/\\/g, '\\\\')
}
// 获取chrome/electron/node版本信息
const processVer = `Chrome:v${process.versions.chrome} Electron:v${process.versions.electron} Node:v${process.versions.node}` //navigator.userAgent

let mainWindow;
let tray;
let presentationWin;
let screenWin;
let watchLiveWin;
let playVideoWin;
let isJoined = false; // 是否成功加入会议
let menuTpl = null;
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

const presentationWinURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080/#presentation`
  : `file://${__dirname}/index.html#presentation`

const screenWinURL = process.env.NODE_ENV === 'development'
? `http://localhost:9080/#screen`
: `file://${__dirname}/index.html#screen`

const watchLiveWinURL = process.env.NODE_ENV === 'development'
? `http://localhost:9080/#watchlive`
: `file://${__dirname}/index.html#watchlive`

const playVideoWinURL = process.env.NODE_ENV === 'development'
? `http://localhost:9080/#play`
: `file://${__dirname}/index.html#play`
/**
 * 创建主窗口
 */
function createWindow () {
  /**
   * Initial window options
   */
  // 获取屏幕尺寸
  const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize
  mainWindow = new BrowserWindow({
    height: 630,
    useContentSize: true,
    width: 1080,
    minWidth: 1080,
    minHeight: 570,
    backgroundColor: '#303847',
    show: false, // 先隐藏窗口
    // titleBarStyle: 'hidden',
    // frame: false,
    title: pkg.productTitle, //'svoc云视频'
    webPreferences: {
      nodeIntegration: true,
      plugins: true
    }
  })

  mainWindow.loadURL(winURL)

  // 打开开发工具页面
  // mainWindow.webContents.openDevTools({mode: "right"})
  //   mainWindow.on('ready', ()=>{
        // mainWindow.reload()
    // })
  // 初始化完成后显示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    // checkToken();
    console.log('ready-to-show')
    // 检查token是否有效
    mainWindow.webContents.send('check-token')
  })
  // 在窗口要关闭的时候触发
  mainWindow.on('close', () => {
    // 加入会议成功后 在关闭主窗口时给予提示
    if(isJoined){
      const options = {
        type: 'info',
        title: '离开',
        message: "您当前处于会中，离开会议后将会被挂断，是否确认离开？",
        noLink: true,
        buttons: ['确定', '取消']
      }
      dialog.showMessageBox(options).then(result => {
        const _index = result.response;
          mainWindow.webContents.send('disconnect-dialog-selection', _index);
          if (_index === 0) { // 确定
            mainWindow.destroy();
            mainWindow = null;
            if(presentationWin){
              presentationWin.close();
              presentationWin = null;
            }
          }
      }).catch(err => {
        console.log(err)
      })
    }
  })
  // 窗口已经关闭时触发
  mainWindow.on('closed', () => {
    mainWindow = null;
    isJoined = false;
  })
  // 进入全屏
  mainWindow.on('enter-full-screen', function () {
    console.log("enter");
    mainWindow.webContents.send('ipcFullScreen', true)
    if(process.platform === 'win32'){
      Menu.setApplicationMenu(null)
    }
  })
  // 退出全屏
  mainWindow.on('leave-full-screen', function () {
    console.log("leave");
    mainWindow.webContents.send('ipcFullScreen', false)
    if(process.platform === 'win32'){
      Menu.setApplicationMenu(menuTpl)
    }
  });

    mainWindow.webContents.on('did-finish-load', () => {
        Update.init(mainWindow)
    })
}

/**
 * 渲染进程通知
 * 设置窗口是否应处于全屏模式
 */
ipcMain.on('handle-fullScreen', (event, arg) => {
  mainWindow.setFullScreen(arg)
})
/**
 * 渲染进程通知
 * 退出登录
 */
ipcMain.on('logout-dialog', (event) => {
    const options = {
        type: 'info',
        title: '退出',
        message: "您确定要退出吗？",
        noLink: true,
        buttons: ['确定', '取消']
    }
    dialog.showMessageBox(options).then(result => {
        console.log(result.response)
        event.sender.send('logout-dialog-selection', result.response)
    }).catch(err => {
      console.log(err)
    })
})
/**
 * 渲染进程通知
 * 错误消息
 * */
ipcMain.on('open-error-dialog', (event) => {
    dialog.showErrorBox('错误', '这是一条错误消息');
})

/**
 * 渲染进程通知
 * 加入会议是否成功
 * */
ipcMain.on('joined-message', (event, arg) => {
  isJoined = arg;
})
// 退出会议
// ipcMain.on('leaved-message', function (event, arg) {
//   isJoined = arg;
// })


/**
 *创建主菜单
 */
function createMenu() {
  let template = [
    {
      label: '查看',
      submenu: [
        {
          // role: 'reload',
          label: '重新加载',
          click: async () => {
            if (isJoined) {
                dialog.showErrorBox('无法重新加载', '您当前正处于会中无法重新加载窗口');
            } else {
              mainWindow.reload()
            }

          }
        },
        // { role: 'toggledevtools', label: '开发者工具'},
        {
          label: '关于',
          click: async () => {
            dialog.showMessageBox({
              title: `${pkg.productTitle}`,
              message: `${pkg.productTitle}`,
              detail: `版本号: ${pkg.version}.${pkg.buildversion}\n${processVer}`,
              icon: `${__static}/trayico/menubar-nodarwin.png`
            })
          }
        },
        { role: 'togglefullscreen', label: '全屏' },
        {
          label: '清除缓存',
          click () {
            clearRenderCache();
            mainWindow.reload()
          }
        },
        { label: '检查更新',
            click() {
                checkForUpdates();
            }
        },
        // {
        //   label: '了解更多',
        //   click () {
        //     require('electron').shell.openExternal('http://www.svocloud.com')
        //   }
        // },


      ]
    }
  ]
//mac 环境需要添加下面的复制粘贴等代码
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
          { role: 'undo', label: '撤销' },
          { role: 'cut', label: '剪切' },
          { role: 'copy', label: '拷贝' },
          { role: 'paste', label: '粘贴' }
      ]
    })
  }

  menuTpl = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menuTpl);
}

/**
 * 创建系统托盘
 */
function createTray() {
  const menubarPic = process.platform === 'darwin' ? `${__static}/trayico/menubarTemplate.png` : `${__static}/trayico/menubar-nodarwin.png`
  tray = new Tray(menubarPic)
  const contextMenu = Menu.buildFromTemplate([
      {
        label: '开发者工具',
        click() {
            mainWindow.webContents.toggleDevTools()
        }
      },
    {
      role: 'open', label: '打开',
      click(){
        if(mainWindow){
          mainWindow.show()
        }
      }
    },
    {
      label: '退出',
      click () {
          app.quit()
      }
    }
  ])
  // Make a change to the context menu
  contextMenu.items[1].checked = false;
  tray.setToolTip(`${pkg.productTitle}`)
  // Call this again for Linux because we modified the context menu
  tray.setContextMenu(contextMenu)
  // tray.on('click', (event, bounds) => {
  //   if (process.platform === 'darwin') {
  //     if (mainWindow) {
  //       mainWindow.hide()
  //     }
  //   }
  // })
  // tray.on('right-click', () => {
  //   tray.setContextMenu(contextMenu)
  // })
}

/**
 * 创建一个presentation新窗口
 * createPresentationWin
 */
const createPresentationWin = () =>{
  let displays = electron.screen.getAllDisplays()
  let externalDisplay = displays.find((display) => {
    return display.bounds.x !== 0 || display.bounds.y !== 0
  })
  if (presentationWin) {
    return false
  }
  let obj;
  if(externalDisplay){
    obj = {
      width: 800,
      height: 600,
      title: '共享',
      x: externalDisplay.bounds.x + 50,
      y: externalDisplay.bounds.y + 50,
      webPreferences: {
        nodeIntegration: true,
        plugins: true
      }
      // parent: mainWindow, //mainWindow是主窗口
    }
  }else{
    obj = {
      width: 800,
      height: 600,
      title: '共享',
      webPreferences: {
        nodeIntegration: true,
        plugins: true
      }
      // parent: mainWindow, //mainWindow是主窗口
    }
  }
  presentationWin = new BrowserWindow(obj)
  presentationWin.loadURL(presentationWinURL)

  presentationWin.on('closed', () => {
    // 关闭窗口前通知渲染进程，改变状态
    mainWindow.webContents.send('ipcPresentationWin', false)
    presentationWin = null
  })
  return presentationWin
}

/**
 * 创建一个screen新窗口
 * createScreenWin
 */
const createScreenWin = () => {
  if (screenWin) {
    return false
  }
  let obj = {
    width: 800,
    height: 500,
    // frame:false,
    title: '共享屏幕',
    parent: mainWindow,  //mainWindow是主窗口
    webPreferences: {
      nodeIntegration: true
    }
  }

  screenWin = new BrowserWindow(obj)
  screenWin.loadURL(screenWinURL)

  screenWin.on('closed', () => {
    screenWin = null
  })
  return screenWin
}

/**
 * 创建一个watch-live新窗口
 * createWatchLiveWin
 */
const createWatchLiveWin = () =>{
  if (watchLiveWin) {
    return false
  }
  let obj = {
    width: 800,
    height: 500,
    // frame:false,
    title: '会议直播',
    // parent: mainWindow,  //mainWindow是主窗口
    webPreferences: {
      nodeIntegration: true,
      plugins: true
    }
  }
  watchLiveWin = new BrowserWindow(obj)
  watchLiveWin.loadURL(watchLiveWinURL)

  watchLiveWin.on('closed', () => {
    watchLiveWin = null
  })
  return watchLiveWin
}
/**
 * 创建一个play-video新窗口
 * createPlayVideoWin
 */
const createPlayVideoWin = () =>{
  let obj = {
    width: 1100,
    height: 740,
    // frame:false,
    title: '播放视频',
    // parent: mainWindow,  //mainWindow是主窗口
    webPreferences: {
      nodeIntegration: true,
      plugins: true
    }
  }
  playVideoWin = new BrowserWindow(obj)
  playVideoWin.loadURL(playVideoWinURL)

  playVideoWin.on('closed', () => {
    playVideoWin = null
  })
  return playVideoWin
}


/**
 * 全局参数
 * */
global.presentationObj = {
  name: '',
  src: '',
  videosrc: null
};
global.screenStreamObj = null;
global.presentationWinStaus = false;
global.appointmentId = '';
global.videoPlayPath = '';
/*****************************************************************************************/

ipcMain.on('accept-share', (event, arg) => {
  global.presentationObj = {
    name: arg.name,
    src: arg.src,
    videosrc: arg.videosrc
  }
  // global.presentationObj.name = arg.name
  // global.presentationObj.src = arg.src;
  // global.presentationObj.videosrc = arg.videosrc;
  // global.presentationObj = arg;

  if(presentationWin){
    presentationWin.webContents.send('presentationObj', arg)
    // event.sender.send('presentationObj', arg)
  }

})

ipcMain.on('accept-share-screen', (event, arg) => {
  global.screenStreamObj = arg;
  // if(presentationWin){
  //   presentationWin.webContents.send('screenStreamObj', arg)
  // }
})

/**
 * 渲染进程通知
 * 打开一个presentation新窗口
 * */
ipcMain.on('presentation-window', (event, arg) => {
  if(arg === 'open') {
    if (!presentationWin) {
      createPresentationWin()
    }else{
      presentationWin.show()
    }
    /*** 测试代码 */
    // const notification = new Notification({
    //   title: arg,
    //   body: '打开共享独立窗口'
    // })
    // notification.show()
    /*** /测试代码 */

    event.sender.send('ipcPresentationWin', true)
    if(presentationWin){
      presentationWin.webContents.send('screenStreamObj', global.screenStreamObj)
    }

  }else if(arg === 'close') {
    presentationWin.close()
    /*** 测试代码 */
    // const notification = new Notification({
    //   title: arg,
    //   body: '关闭共享独立窗口'
    // })
    // notification.show()
    /*** /测试代码 */

  }

})
/**
 * 渲染进程通知
 * 关闭presentation窗口
 * */
ipcMain.on('close-presentationwin', (event) =>{

})

/**
 * 渲染进程通知
 * 打开一个screen新窗口
 * */
ipcMain.on('screen-window', (event) => {
  if (!screenWin) {
    createScreenWin()
  }else{
    screenWin.show();
  }
  // presentationWin.hide();
})
/**
 * 渲染进程通知
 * 打开一个watchlive新窗口
 * */
ipcMain.on('watchlive-window', (event, arg) => {
  console.log(`主进程收到了会议号: ${arg}`)
  global.appointmentId = arg;
  if (!watchLiveWin) {
    createWatchLiveWin()
  }else{
    watchLiveWin.show();
  }
  event.sender.send('ipcWatchliveWin', arg+'')
  if(watchLiveWin){
    console.log(`主进程向渲染进程发送了会议号: ${arg}`)
    watchLiveWin.webContents.send('send-watchliveWin', arg)
    console.log(`===============`)
  }
})
/**
 * 渲染进程通知主进程
 * 关闭一个watchlive新窗口
 * */
ipcMain.on('close-watchlivewin', (event) => {
  watchLiveWin.close();
})
/**
 * 渲染进程通知
 * 打开一个playVideo新窗口
 * */
ipcMain.on('playvideo-window', (event, arg) => {
  console.log(`主进程收到了视频播放地址: ${arg}`)
  global.videoPlayPath = arg;
  if (!playVideoWin) {
    createPlayVideoWin()
  }else{
    playVideoWin.show();
  }
  event.sender.send('ipcPlayVideoWin', arg+'')
  if(playVideoWin){
    console.log(`主进程向渲染进程发送了视频播放地址: ${arg}`)
    playVideoWin.webContents.send('send-playVideoWin', arg)
    console.log(`================================================`)
  }

})

/***********************************************************************************************/


function startFlash() {
    // 指定 flash 路径
    let pluginName;
    let pluginUrl;
    switch (process.platform) {
        case 'win32':
            pluginName = 'pepflashplayer.dll'
            break
        case 'darwin':
            pluginName = 'PepperFlashPlayer.plugin'
            break
        case 'linux':
            pluginName = 'libpepflashplayer.so'
            break
    }

    const flashPath = app.getPath('pepperFlashSystemPlugin');
    if (flashPath && ['dll', 'so', 'plugin'].forEach(item => flashPath.endsWith(item))) {
        app.commandLine.appendSwitch('ppapi-flash-path', flashPath);
    }else{
        // Flash 插件
        if(__dirname.includes(".asar")){
            pluginUrl = path.join(`${process.resourcesPath}/static/lib/${pluginName}`);
        }else{
            pluginUrl = path.join(`${__static}/lib/`, pluginName)
        }
        app.commandLine.appendSwitch('ppapi-flash-path', pluginUrl)
        app.commandLine.appendSwitch('ppapi-flash-version', '29.0.0.017')
    }
    // 可选：指定 flash 的版本，例如 v17.0.0.169
  // app.commandLine.appendSwitch('ppapi-flash-version', '17.0.0.169')
  // 您也可以尝试加载系统安装的 Pepper Flash 插件，而不是装运 插件，其路径可以通过调用 app.getPath('pepperFlashSystemPlugin') 获取。
    console.log('flash=>>>>>>>', flashPath, pluginUrl)
}




// 忽略证书相关错误  在ready之前调用
app.commandLine.appendSwitch('ignore-certificate-errors')

// 阻止应用系统进入睡眠模式, 阻止应用进入休眠. 保持系统和屏幕活跃，屏幕一直亮
const sleepId = powerSaveBlocker.start('prevent-display-sleep');
// sleepId 为 返回的保持活跃的 blocker id
powerSaveBlocker.stop(sleepId)


/**
 * 确保单实例
 */
const gotTheLock = app.requestSingleInstanceLock();
if(!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // 当运行第二个实例时,将会聚焦到myWindow这个窗口
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
  // 获取flash插件
  // startFlash();
  app.on('ready', (launchInfo)=>{
    console.log(app.isReady())
    createWindow();
    createMenu();
    if (process.platform === 'darwin' || process.platform === 'win32') {
      createTray()
    };
      // autoUpdater.checkForUpdates()
    // if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()

  })
}

// GPU进程崩溃
app.on('gpu-process-crashed', function(){
  // app.exit(0);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */


import { autoUpdater } from 'electron-updater'

const feedUrl = 'http://cdn.lixuedan.cn/svoc/';
// 主进程监听渲染进程传来的信息
ipcMain.on('update-app', (e, arg) => {
    console.log("update app");
    checkForUpdates();
});
let checkForUpdates = () => {
  let returnData = {
    error: {status: -2, msg: '检测更新查询异常'},
    checking: {status: 0, msg: '正在检查应用程序更新'},
    updateAva: {status: 1, msg: '检测到新版本，是否现在更新？'},
    updateNotAva: {status: -1, msg: '您现在使用的版本为最新版本，无需更新!'},
    downloading: {status: 3, msg: '正在下载....'},
    downloaded: {status: 4, msg: '下载完成'}
  }
    // 配置安装包远端服务器
    autoUpdater.setFeedURL(feedUrl);
    // 下面是自动更新的整个生命周期所发生的事件
    autoUpdater.on('error', function(message) {
        // sendUpdateMessage('error', message);
        sendUpdateMessage('error', message)
    });
    // 检查中
    autoUpdater.once('checking-for-update', function(message) {
        // sendUpdateMessage('checking-for-update', message);
        sendUpdateMessage(returnData.checking)
    });
    // 发现新版本
    autoUpdater.once('update-available', function(message) {
        // sendUpdateMessage('update-available', message);
        let newreturn = returnData.updateAva;
        newreturn.version = message.version;
        sendUpdateMessage(newreturn)
    });
    // 当前版本为最新版本
    autoUpdater.once('update-not-available', function(message) {
        // sendUpdateMessage('update-not-available', message);
        sendUpdateMessage(returnData.updateNotAva)
    });

    // 更新下载进度事件
    autoUpdater.on('download-progress', function(progressObj) {
        // mainWindow.webContents.send('downloadProgress', progressObj)
        let newreturn = returnData.downloading;
        newreturn.progress = progressObj;
        sendUpdateMessage(newreturn);
    });
    // 更新下载完成事件
    autoUpdater.on('update-downloaded', function(event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) {
      sendUpdateMessage(returnData.downloaded);
      ipcMain.on('updateNow', (e, arg) => {
          console.log('updateNow---立即安装')
          autoUpdater.quitAndInstall();
      });
    });

    // 执行自动更新检查
    autoUpdater.checkForUpdates();
}
// 主进程主动发送消息给渲染进程函数
function sendUpdateMessage(message) {
    console.log(message);
    mainWindow.webContents.send('update-message', message);
}
ipcMain.on("checkForUpdate", (event, data) => {
    console.log('执行自动更新检查!!!');
    autoUpdater.checkForUpdates();
});
// 更新下载完成事件
// autoUpdater.on('update-downloaded', () => {
//   autoUpdater.quitAndInstall()
// })

// app.on('ready', () => {
//   if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
// })

/** 检测token是否有效  **/
function checkToken() {
  mainWindow.webContents.send('check-token')
}
ipcMain.on("getCheckToken", (event,data) => {
  console.log("token状态",data)
})
function clearRenderCache() {
    mainWindow.webContents.send('clear-cache')
}
