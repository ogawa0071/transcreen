'use strict'

import { app, protocol, BrowserWindow, globalShortcut, screen, ipcMain } from 'electron'
import {
  createProtocol
  /* installVueDevtools */
} from 'vue-cli-plugin-electron-builder/lib'

const isDevelopment = process.env.NODE_ENV !== 'production'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win: BrowserWindow | null

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }])

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    transparent: true,
    frame: false,
    toolbar: false,
    titleBarStyle: 'hidden-inset',
    backgroundColor: '#00000000',
    webPreferences: {
      nodeIntegration: true
    }
  })
  const myWindow = win
  const updateCaptureRectAndTranslate = () => {
    const bounds = myWindow.getBounds()
    const myScreen = screen.getAllDisplays().filter((screen) => {
      return screen.bounds.x <= bounds.x &&
        screen.bounds.y <= bounds.y &&
        screen.bounds.x + screen.bounds.width >= bounds.x + bounds.width &&
        screen.bounds.y + screen.bounds.height >= bounds.y + bounds.height
    })
    if (myScreen.length) {
      const currentScreen = myScreen[0]
      console.log({
        id: currentScreen.id,
        targetBounds: {
          x: bounds.x - currentScreen.bounds.x,
          y: bounds.y - currentScreen.bounds.y,
          width: bounds.width,
          height: bounds.height
        }
      })
      myWindow.webContents.send('translate', {
        id: currentScreen.id,
        targetBounds: {
          x: bounds.x - currentScreen.bounds.x,
          y: bounds.y - currentScreen.bounds.y,
          width: bounds.width,
          height: bounds.height
        }
      })
    }
  }

  globalShortcut.register('CommandOrControl+Shift+T', () => {
    if (win) {
      updateCaptureRectAndTranslate()
    }
  })
  globalShortcut.register('CommandOrControl+Shift+R', () => {
    if (win) {
      win.setIgnoreMouseEvents(false)
      win.setAlwaysOnTop(false)
      win.webContents.send('wakeup')
    }
  })
  ipcMain.on('click-thru', () => {
    if (win) {
      win.setIgnoreMouseEvents(true)
      win.setAlwaysOnTop(true)
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string)
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }

  win.on('closed', () => {
    win = null
  })
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    // Devtools extensions are broken in Electron 6.0.0 and greater
    // See https://github.com/nklayman/vue-cli-plugin-electron-builder/issues/378 for more info
    // Electron will not launch with Devtools extensions installed on Windows 10 with dark mode
    // If you are not using Windows 10 dark mode, you may uncomment these lines
    // In addition, if the linked issue is closed, you can upgrade electron and uncomment these lines
    // try {
    //   await installVueDevtools()
    // } catch (e) {
    //   console.error('Vue Devtools failed to install:', e.toString())
    // }

  }
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', data => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
