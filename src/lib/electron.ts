// Check if running in Electron
export const isElectron = (): boolean => {
  return window.electronAPI?.isElectron === true
}

// Open URL in external browser
export const openExternal = async (url: string): Promise<void> => {
  if (isElectron()) {
    await window.electronAPI?.openExternal(url)
  } else {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}

// Show system notification
export const showNotification = async (title: string, body: string): Promise<void> => {
  if (isElectron()) {
    await window.electronAPI?.showNotification(title, body)
  } else {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body })
    }
  }
}

// Copy to clipboard
export const copyToClipboard = async (text: string): Promise<boolean> => {
  if (isElectron()) {
    return await window.electronAPI?.copyToClipboard(text) || false
  } else {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      return false
    }
  }
}

// Show delete confirmation dialog
export const showDeleteDialog = async (serviceName: string): Promise<boolean> => {
  if (isElectron()) {
    return await window.electronAPI?.showDeleteDialog(serviceName) || false
  } else {
    return window.confirm(`Are you sure you want to delete "${serviceName}"?\n\nThis action cannot be undone.`)
  }
}

// Get platform
export const getPlatform = (): string => {
  if (isElectron()) {
    return window.electronAPI?.platform || 'unknown'
  }
  return navigator.platform
}
