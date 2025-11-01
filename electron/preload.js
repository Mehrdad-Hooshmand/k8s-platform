const { contextBridge, ipcRenderer } = require('electron')

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Open URL in default browser
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  
  // Show system notification
  showNotification: (title, body) => ipcRenderer.invoke('show-notification', { title, body }),
  
  // Copy text to clipboard
  copyToClipboard: (text) => ipcRenderer.invoke('copy-to-clipboard', text),
  
  // Show delete confirmation dialog
  showDeleteDialog: (serviceName) => ipcRenderer.invoke('show-delete-dialog', serviceName),
  
  // Listen for navigation events
  onNavigate: (callback) => {
    ipcRenderer.on('navigate', (event, route) => callback(route))
  },
  
  // Platform info
  platform: process.platform,
  
  // Check if running in Electron
  isElectron: true
})
