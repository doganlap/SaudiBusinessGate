// Preload script for Electron - provides safe IPC bridge to renderer process
const { contextBridge, ipcMain, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getAppPath: () => ipcRenderer.invoke('get-app-path'),
  
  // File operations
  openDocumentsFolder: () => ipcRenderer.invoke('open-documents-folder'),
  
  // External links
  openExternalUrl: (url) => ipcRenderer.invoke('open-external-url', url),
  
  // Platform info
  getPlatform: () => process.platform,
  isElectron: () => true,
  
  // Node version
  getNodeVersion: () => process.version
});