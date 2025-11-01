const { app, BrowserWindow, Menu, Tray, ipcMain, shell, dialog, nativeImage } = require('electron')
const path = require('path')
const isDev = process.env.NODE_ENV === 'development'

let mainWindow
let tray

// Create main window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    title: 'K8s Platform Manager',
    icon: path.join(__dirname, 'icon.png'),
    backgroundColor: '#f9fafb',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false
  })

  // Load app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // Show when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // Handle window close
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault()
      mainWindow.hide()
    }
    return false
  })
}

// Create system tray
function createTray() {
  const iconPath = path.join(__dirname, 'tray-icon.png')
  const trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 })
  
  tray = new Tray(trayIcon)
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'K8s Platform Manager',
      enabled: false
    },
    { type: 'separator' },
    {
      label: 'Show',
      click: () => {
        mainWindow.show()
      }
    },
    {
      label: 'Dashboard',
      click: () => {
        mainWindow.show()
        mainWindow.webContents.send('navigate', '/')
      }
    },
    {
      label: 'Apps',
      click: () => {
        mainWindow.show()
        mainWindow.webContents.send('navigate', '/apps')
      }
    },
    {
      label: 'Deployments',
      click: () => {
        mainWindow.show()
        mainWindow.webContents.send('navigate', '/deployments')
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.isQuitting = true
        app.quit()
      }
    }
  ])
  
  tray.setToolTip('K8s Platform Manager')
  tray.setContextMenu(contextMenu)
  
  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
  })
}

// Create application menu
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Dashboard',
          accelerator: 'CmdOrCtrl+D',
          click: () => {
            mainWindow.webContents.send('navigate', '/')
          }
        },
        {
          label: 'Apps Marketplace',
          accelerator: 'CmdOrCtrl+M',
          click: () => {
            mainWindow.webContents.send('navigate', '/apps')
          }
        },
        { type: 'separator' },
        {
          label: 'Settings',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            mainWindow.webContents.send('navigate', '/settings')
          }
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.isQuitting = true
            app.quit()
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Documentation',
          click: async () => {
            await shell.openExternal('https://github.com/Mehrdad-Hooshmand/k8s-platform-panel')
          }
        },
        {
          label: 'Report Issue',
          click: async () => {
            await shell.openExternal('https://github.com/Mehrdad-Hooshmand/k8s-platform-panel/issues')
          }
        },
        { type: 'separator' },
        {
          label: 'About',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About K8s Platform Manager',
              message: 'K8s Platform Manager',
              detail: `Version: ${app.getVersion()}\nManage your Kubernetes clusters with ease.`
            })
          }
        }
      ]
    }
  ]

  if (isDev) {
    template[2].submenu.push(
      { type: 'separator' },
      { role: 'toggleDevTools' }
    )
  }

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

// IPC Handlers
ipcMain.handle('open-external', async (event, url) => {
  await shell.openExternal(url)
})

ipcMain.handle('show-notification', async (event, { title, body }) => {
  new Notification({ title, body }).show()
})

ipcMain.handle('copy-to-clipboard', async (event, text) => {
  const { clipboard } = require('electron')
  clipboard.writeText(text)
  return true
})

ipcMain.handle('show-delete-dialog', async (event, serviceName) => {
  const result = await dialog.showMessageBox(mainWindow, {
    type: 'warning',
    buttons: ['Cancel', 'Delete'],
    defaultId: 0,
    cancelId: 0,
    title: 'Delete Service',
    message: `Are you sure you want to delete "${serviceName}"?`,
    detail: 'This action cannot be undone. All data will be permanently deleted from the cluster.'
  })
  
  return result.response === 1 // 1 = Delete button
})

// App ready
app.whenReady().then(() => {
  createWindow()
  createTray()
  createMenu()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Before quit
app.on('before-quit', () => {
  app.isQuitting = true
})
