const { contextBridge, ipcRenderer } = require('electron');

/**
 * Preload script - Security bridge between Electron and web content
 * Exposes safe APIs to the renderer process
 */

contextBridge.exposeInMainWorld('electron', {
  // Data path access
  getDataPath: () => ipcRenderer.invoke('get-data-path'),

  // File dialogs
  openFileDialog: (options) => ipcRenderer.invoke('open-file-dialog', options),
  saveFileDialog: (options) => ipcRenderer.invoke('save-file-dialog', options),

  // Navigation (listen for menu events)
  onNavigate: (callback) => {
    ipcRenderer.on('navigate', (event, path) => callback(path));
  },

  // Export data (listen for export events)
  onExportData: (callback) => {
    ipcRenderer.on('export-data', (event, filePath) => callback(filePath));
  },

  // Platform info
  platform: process.platform,
  isElectron: true,
});

/**
 * Security: Remove Node.js globals from window
 */
delete window.require;
delete window.exports;
delete window.module;
