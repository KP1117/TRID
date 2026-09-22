// Electron Preload Script for TRID Media Player
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  platform: process.platform,
  onMenuAction: (callback) => {
    const handler = (_event, action) => callback(action);
    ipcRenderer.on('trid-menu-action', handler);
    return () => ipcRenderer.removeListener('trid-menu-action', handler);
  },
});
