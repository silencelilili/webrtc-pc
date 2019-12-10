// import { autoUpdater } from 'electron-updater'
// import { ipcMain } from 'electron'

const {app, electron, autoUpdater, dialog} = require('electron')
const os = require('os')
// const autoUpdater = electron.autoUpdater
const appVersion = require('../../package.json').version

let updateFeed = ''
let initialized = false
const platform = `${os.platform()}_${os.arch()}`
const nutsURL = 'http://172.18.4.45:8080'

if (os.platform() === 'darwin') {
    updateFeed = `${nutsURL}/beta/${platform}/${appVersion}`
} else if (os.platform() === 'win32') {
    updateFeed = `${nutsURL}/beta/win32/${appVersion}`
}

function init(mainWindow) {
    mainWindow.webContents.send('console', `App version: ${appVersion}`)
    mainWindow.webContents.send('message', { msg: `🖥 App version: ${appVersion}` })

    // if (initialized || !updateFeed || process.env.NODE_ENV === 'development') { return }

    initialized = true

    autoUpdater.setFeedURL(updateFeed)

    autoUpdater.on('error', (ev, err) => {
        mainWindow.webContents.send('message', { msg: `😱 Error: ${err}` })
    })

    autoUpdater.once('checking-for-update', (ev, err) => {
        mainWindow.webContents.send('message', { msg: '🔎 Checking for updates' })
    })

    autoUpdater.once('update-available', (ev, err) => {
        mainWindow.webContents.send('message', { msg: '🎉 Update available. Downloading ⌛️', hide: false })
    })

    autoUpdater.once('update-not-available', (ev, err) => {
        mainWindow.webContents.send('message', { msg: '👎 Update not available' })
    })

    autoUpdater.once('update-downloaded', (ev, err) => {
        const msg = '<p style="margin: 0;">🤘 Update downloaded - <a onclick="quitAndInstall()">Restart</a></p>'
        mainWindow.webContents.send('message', { msg, hide: false, replaceAll: true })

        const dialogOpts = {
            type: 'info',
            buttons: ['Restart', 'Later'],
            title: 'Application Update',
            message: process.platform === 'win32' ? releaseNotes : releaseName,
            detail: 'A new version has been downloaded. Restart the application to apply the updates.'
        }

        dialog.showMessageBox(dialogOpts).then((returnValue) => {
            if (returnValue.response === 0) autoUpdater.quitAndInstall()
        })
    })

    autoUpdater.checkForUpdates()
  }

  module.exports = {
      init
  }
