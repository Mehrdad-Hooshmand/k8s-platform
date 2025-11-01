// Electron API type definitions
export interface ElectronAPI {
  openExternal: (url: string) => Promise<void>
  showNotification: (title: string, body: string) => Promise<void>
  copyToClipboard: (text: string) => Promise<boolean>
  showDeleteDialog: (serviceName: string) => Promise<boolean>
  onNavigate: (callback: (route: string) => void) => void
  platform: string
  isElectron: boolean
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

export {}
